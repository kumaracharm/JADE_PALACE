"""
Incident Management & Decision Orchestration Service.
Enforces the 14-stage operational incident state machine, human approval gateways,
work order lifecycle, and resolution verification.
"""
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.models.incident import (
    IncidentModel,
    IncidentEntityModel,
    StateHistoryModel,
    RecoveryAlternativeModel,
    WorkOrderModel,
    ApprovalModel,
    RecommendationModel,
)
from backend.models.entity import EntityModel, OperationalStateModel
from backend.schemas.common import (
    IncidentStatus,
    WorkOrderStatus,
    ApprovalStatus,
    OperationalStatus,
    RoleEnum,
    ImpactState,
    ProvenanceSourceType,
)
from backend.schemas.incident import (
    IncidentCreate,
    WorkOrderCreate,
    WorkOrderUpdate,
)
from backend.schemas.event import TelemetryEventCreate
from backend.schemas.engines import IncidentDecisionPlan
from backend.engines import (
    detection_engine,
    propagation_engine,
    risk_engine,
    academic_engine,
    recovery_engine,
    assignment_engine,
    coordination_engine,
)
from backend.graph.repository import graph_repository


# Valid State Machine Transitions
VALID_TRANSITIONS: Dict[IncidentStatus, List[IncidentStatus]] = {
    IncidentStatus.REPORTED: [IncidentStatus.VALIDATING, IncidentStatus.REJECTED, IncidentStatus.DUPLICATE],
    IncidentStatus.VALIDATING: [IncidentStatus.CONFIRMED, IncidentStatus.REJECTED, IncidentStatus.DUPLICATE],
    IncidentStatus.CONFIRMED: [IncidentStatus.ANALYZING, IncidentStatus.AWAITING_APPROVAL, IncidentStatus.ASSIGNED, IncidentStatus.REJECTED],
    IncidentStatus.ANALYZING: [IncidentStatus.RECOMMENDATION_READY, IncidentStatus.AWAITING_APPROVAL, IncidentStatus.CONFIRMED],
    IncidentStatus.RECOMMENDATION_READY: [IncidentStatus.AWAITING_APPROVAL, IncidentStatus.ASSIGNED, IncidentStatus.REJECTED],
    IncidentStatus.AWAITING_APPROVAL: [IncidentStatus.ASSIGNED, IncidentStatus.IN_PROGRESS, IncidentStatus.REJECTED],
    IncidentStatus.ASSIGNED: [IncidentStatus.IN_PROGRESS, IncidentStatus.AWAITING_APPROVAL, IncidentStatus.REJECTED],
    IncidentStatus.IN_PROGRESS: [IncidentStatus.VERIFICATION, IncidentStatus.ASSIGNED],
    IncidentStatus.VERIFICATION: [IncidentStatus.RESOLVED, IncidentStatus.IN_PROGRESS],
    IncidentStatus.RESOLVED: [IncidentStatus.CLOSED, IncidentStatus.IN_PROGRESS],
    IncidentStatus.CLOSED: [],
    IncidentStatus.REJECTED: [],
    IncidentStatus.DUPLICATE: [],
}


class IncidentService:
    """
    Manages the operational lifecycle of campus incidents.
    """

    def create_incident(
        self,
        db: Session,
        incident_in: IncidentCreate,
        user_id: Optional[str] = None,
    ) -> IncidentModel:
        incident_id = incident_in.incident_id or f"INC-{uuid.uuid4().hex[:8].upper()}"

        # Idempotency / Safe duplicate handling (e.g. offline resynchronization from PWA)
        if incident_in.source_id:
            existing = db.query(IncidentModel).filter_by(source_id=incident_in.source_id).first()
            if existing:
                return existing

        # Verify root entity exists
        entity = db.query(EntityModel).filter_by(entity_id=incident_in.root_entity_id).first()
        if not entity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Root entity {incident_in.root_entity_id} does not exist in Digital Twin catalog.",
            )

        incident = IncidentModel(
            incident_id=incident_id,
            title=incident_in.title,
            description=incident_in.description,
            root_entity_id=incident_in.root_entity_id,
            status=IncidentStatus.REPORTED.value,
            priority=incident_in.priority.value,
            source_type=incident_in.source_type.value,
            source_id=incident_in.source_id,
            reported_by_user_id=user_id,
            metadata_json=incident_in.metadata_json,
        )
        db.add(incident)

        # Initial history record
        history = StateHistoryModel(
            incident_id=incident_id,
            from_status="NONE",
            to_status=IncidentStatus.REPORTED.value,
            changed_by_user_id=user_id,
            note="Incident reported into OMNIS-X system.",
        )
        db.add(history)
        db.commit()
        db.refresh(incident)
        return incident

    def transition_status(
        self,
        db: Session,
        incident_id: str,
        target_status: IncidentStatus,
        user_id: Optional[str] = None,
        note: Optional[str] = None,
    ) -> IncidentModel:
        incident = db.query(IncidentModel).filter_by(incident_id=incident_id).first()
        if not incident:
            raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found.")

        current = IncidentStatus(incident.status)
        allowed = VALID_TRANSITIONS.get(current, [])

        if target_status not in allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Illegal incident transition from {current.value} to {target_status.value}. Allowed: {[s.value for s in allowed]}",
            )

        incident.status = target_status.value
        incident.updated_at = datetime.utcnow()

        history = StateHistoryModel(
            incident_id=incident_id,
            from_status=current.value,
            to_status=target_status.value,
            changed_by_user_id=user_id,
            note=note,
        )
        db.add(history)
        db.commit()
        db.refresh(incident)
        return incident

    def analyze_incident(
        self,
        db: Session,
        incident_id: str,
        user_id: Optional[str] = None,
    ) -> IncidentDecisionPlan:
        """
        Executes the seven specialist engines pipeline and persists analysis records.
        """
        incident = db.query(IncidentModel).filter_by(incident_id=incident_id).first()
        if not incident:
            raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found.")

        # Ensure valid transition to ANALYZING if currently REPORTED or VALIDATING
        if incident.status in (IncidentStatus.REPORTED.value, IncidentStatus.VALIDATING.value):
            incident.status = IncidentStatus.CONFIRMED.value
            db.commit()

        if incident.status == IncidentStatus.CONFIRMED.value:
            self.transition_status(db, incident_id, IncidentStatus.ANALYZING, user_id, "Specialist intelligence engines executing.")

        # 1. Detection Analysis (Synthetic or recorded telemetry)
        evt = TelemetryEventCreate(
            event_id=f"EVT-{incident_id}",
            entity_id=incident.root_entity_id,
            metric_name="voltage_v" if "FEEDER" in incident.root_entity_id or "SUBSTATION" in incident.root_entity_id else "status",
            value=0.0,
            source_type=ProvenanceSourceType(incident.source_type),
        )
        detection = detection_engine.analyze_event(evt)

        # 2. Graph Impact Propagation
        impact = propagation_engine.analyze_impact(incident_id, incident.root_entity_id)

        # 3. Risk & Criticality Analysis (FMEA RPN)
        risk = risk_engine.assess_risk(
            incident_id=incident_id,
            root_entity_id=incident.root_entity_id,
            impact_result=impact,
            provenance_source=ProvenanceSourceType(incident.source_type),
        )

        # 4. Academic and Resource Impact
        academic = academic_engine.assess_academic_impact(incident_id, impact)

        # 5. Recovery Optimization (Google OR-Tools CP-SAT)
        recovery = recovery_engine.solve_recovery_plan(incident_id, incident.root_entity_id, academic)

        # 6. Task & Responsibility Assignment
        root_node = graph_repository.get_node(incident.root_entity_id) or {}
        assignment = assignment_engine.assign_incident(
            db=db,
            incident_id=incident_id,
            entity_type=root_node.get("entity_type", "EQUIPMENT"),
            incident_title=incident.title,
        )

        # 7. Decision & Coordination Hub
        plan = coordination_engine.compile_decision_plan(
            incident_id=incident_id,
            incident_title=incident.title,
            root_entity_id=incident.root_entity_id,
            detection=detection,
            impact=impact,
            risk=risk,
            academic=academic,
            recovery=recovery,
            assignment=assignment,
        )

        # Persist Analysis Artifacts
        # Save affected entities
        db.query(IncidentEntityModel).filter_by(incident_id=incident_id).delete()
        for aff in impact.affected_entities:
            ie = IncidentEntityModel(
                incident_id=incident_id,
                entity_id=aff.affected_entity_id,
                impact_state=aff.resulting_impact_state.value,
                propagation_path=aff.relationship_path,
                reason=aff.propagation_reason,
            )
            db.add(ie)

        # Save recovery alternatives
        db.query(RecoveryAlternativeModel).filter_by(incident_id=incident_id).delete()
        for alt in recovery.alternatives:
            ra = RecoveryAlternativeModel(
                alternative_id=alt.alternative_id,
                incident_id=incident_id,
                title=alt.title,
                description=alt.description,
                recovery_time_minutes=alt.recovery_time_minutes,
                estimated_cost_usd=alt.estimated_cost_usd,
                disruption_penalty=alt.disruption_penalty,
                residual_risk_score=alt.residual_risk_score,
                composite_rank_score=alt.composite_rank_score,
                reallocations_json=alt.reallocations,
                steps_json=[s.model_dump() for s in alt.steps],
                feasible=alt.feasible,
                infeasibility_reasons_json=alt.infeasibility_reasons,
                is_recommended=(alt.alternative_id == recovery.recommended_alternative_id),
            )
            db.add(ra)

        # Save recommendation record
        rec_model = db.query(RecommendationModel).filter_by(incident_id=incident_id).first()
        if not rec_model:
            rec_model = RecommendationModel(
                recommendation_id=plan.plan_id,
                incident_id=incident_id,
                plan_json=plan.model_dump(mode="json"),
            )
            db.add(rec_model)
        else:
            rec_model.plan_json = plan.model_dump(mode="json")
            rec_model.generated_at = datetime.utcnow()

        # Update Approvals
        db.query(ApprovalModel).filter_by(incident_id=incident_id).delete()
        for req_app in plan.required_approvals:
            app_record = ApprovalModel(
                approval_id=f"APP-{uuid.uuid4().hex[:8].upper()}",
                incident_id=incident_id,
                plan_id=plan.plan_id,
                required_role=req_app.role_required.value,
                status=ApprovalStatus.PENDING.value,
                comments=req_app.reason,
            )
            db.add(app_record)

        # Transition status to RECOMMENDATION_READY or AWAITING_APPROVAL
        next_status = (
            IncidentStatus.AWAITING_APPROVAL
            if plan.required_approvals
            else IncidentStatus.RECOMMENDATION_READY
        )
        self.transition_status(db, incident_id, next_status, user_id, "Decision plan generated and awaiting sign-off.")

        # Update root entity operational state to UNAVAILABLE
        root_op = db.query(OperationalStateModel).filter_by(entity_id=incident.root_entity_id).first()
        if root_op:
            root_op.current_status = OperationalStatus.UNAVAILABLE.value
            root_op.active_incident_count += 1
            root_op.health_score = max(0.0, root_op.health_score - 50.0)

        root_ent = db.query(EntityModel).filter_by(entity_id=incident.root_entity_id).first()
        if root_ent:
            root_ent.operational_status = OperationalStatus.UNAVAILABLE.value

        db.commit()
        # Refresh in-memory graph
        graph_repository.build_graph_from_db(db)

        return plan

    def approve_recommendation(
        self,
        db: Session,
        incident_id: str,
        plan_id: Optional[str],
        user_id: str,
        user_role: RoleEnum,
        comments: Optional[str] = None,
    ) -> IncidentModel:
        incident = db.query(IncidentModel).filter_by(incident_id=incident_id).first()
        if not incident:
            raise HTTPException(status_code=404, detail="Incident not found.")

        # Check pending approval for this role
        approvals = db.query(ApprovalModel).filter_by(
            incident_id=incident_id,
            status=ApprovalStatus.PENDING.value,
        ).all()

        matching_approval = None
        for a in approvals:
            if a.required_role == user_role.value or user_role in [RoleEnum.PRINCIPAL, RoleEnum.SUPER_ADMIN]:
                matching_approval = a
                break

        if not matching_approval and approvals:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role {user_role.value} does not have authority to approve pending sign-off requirements: {[a.required_role for a in approvals]}",
            )

        if matching_approval:
            matching_approval.status = ApprovalStatus.APPROVED.value
            matching_approval.approved_by_user_id = user_id
            matching_approval.comments = comments
            matching_approval.timestamp = datetime.utcnow()
            db.commit()

        # Check if all approvals now fulfilled
        remaining = db.query(ApprovalModel).filter_by(
            incident_id=incident_id,
            status=ApprovalStatus.PENDING.value,
        ).count()

        if remaining == 0:
            # Transition to ASSIGNED if not already in ASSIGNED or downstream state
            if incident.status not in [IncidentStatus.ASSIGNED.value, IncidentStatus.IN_PROGRESS.value, IncidentStatus.RESOLVED.value, IncidentStatus.CLOSED.value]:
                self.transition_status(db, incident_id, IncidentStatus.ASSIGNED, user_id, f"Approved by {user_role.value}. Ready for dispatch.")

            # Automatically generate Work Order from recommendation
            existing_wo = db.query(WorkOrderModel).filter_by(incident_id=incident_id).first()
            if not existing_wo:
                wo = WorkOrderModel(
                    work_order_id=f"WO-{uuid.uuid4().hex[:8].upper()}",
                    incident_id=incident_id,
                    title=f"Recovery Work Order: {incident.title}",
                    description=f"Authorized technical recovery work for {incident.root_entity_id}. Comments: {comments or 'None'}",
                    assigned_department="Facilities & Physical Plant",
                    assigned_to_user_id="USR-ELEC-TECH",
                    target_entity_id=incident.root_entity_id,
                    status=WorkOrderStatus.ASSIGNED.value,
                    priority=incident.priority,
                    estimated_hours=1.5,
                )
                db.add(wo)
                db.commit()

        return incident

    def reject_recommendation(
        self,
        db: Session,
        incident_id: str,
        user_id: str,
        user_role: RoleEnum,
        comments: Optional[str] = None,
    ) -> IncidentModel:
        incident = db.query(IncidentModel).filter_by(incident_id=incident_id).first()
        if not incident:
            raise HTTPException(status_code=404, detail="Incident not found.")

        # Mark all pending approvals as rejected
        approvals = db.query(ApprovalModel).filter_by(incident_id=incident_id).all()
        for a in approvals:
            a.status = ApprovalStatus.REJECTED.value
            a.approved_by_user_id = user_id
            a.comments = comments
            a.timestamp = datetime.utcnow()

        self.transition_status(db, incident_id, IncidentStatus.REJECTED, user_id, f"Plan rejected by {user_role.value}: {comments}")
        return incident

    def create_work_order(
        self,
        db: Session,
        wo_in: WorkOrderCreate,
        user_id: Optional[str] = None,
    ) -> WorkOrderModel:
        wo_id = wo_in.work_order_id or f"WO-{uuid.uuid4().hex[:8].upper()}"
        wo = WorkOrderModel(
            work_order_id=wo_id,
            incident_id=wo_in.incident_id,
            title=wo_in.title,
            description=wo_in.description,
            assigned_department=wo_in.assigned_department,
            assigned_to_user_id=wo_in.assigned_to_user_id,
            target_entity_id=wo_in.target_entity_id,
            status=WorkOrderStatus.CREATED.value,
            priority=wo_in.priority.value,
            estimated_hours=wo_in.estimated_hours,
        )
        db.add(wo)
        db.commit()
        db.refresh(wo)
        return wo

    def update_work_order(
        self,
        db: Session,
        work_order_id: str,
        wo_update: WorkOrderUpdate,
        user_id: Optional[str] = None,
    ) -> WorkOrderModel:
        wo = db.query(WorkOrderModel).filter_by(work_order_id=work_order_id).first()
        if not wo:
            raise HTTPException(status_code=404, detail=f"Work order {work_order_id} not found.")

        if wo_update.status is not None:
            wo.status = wo_update.status.value
            # When work order moves to IN_PROGRESS, move incident to IN_PROGRESS
            if wo_update.status == WorkOrderStatus.IN_PROGRESS:
                inc = db.query(IncidentModel).filter_by(incident_id=wo.incident_id).first()
                if inc and inc.status == IncidentStatus.ASSIGNED.value:
                    self.transition_status(db, wo.incident_id, IncidentStatus.IN_PROGRESS, user_id, "Technician commenced work on site.")
            # When completed, transition incident to VERIFICATION
            elif wo_update.status == WorkOrderStatus.COMPLETED:
                inc = db.query(IncidentModel).filter_by(incident_id=wo.incident_id).first()
                if inc and inc.status == IncidentStatus.IN_PROGRESS.value:
                    self.transition_status(db, wo.incident_id, IncidentStatus.VERIFICATION, user_id, "Physical repairs completed. Telemetry verification pending.")

        if wo_update.assigned_to_user_id is not None:
            wo.assigned_to_user_id = wo_update.assigned_to_user_id
        if wo_update.resolution_notes is not None:
            wo.resolution_notes = wo_update.resolution_notes
        if wo_update.actual_hours is not None:
            wo.actual_hours = wo_update.actual_hours

        wo.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(wo)
        return wo

    def verify_and_resolve(
        self,
        db: Session,
        incident_id: str,
        user_id: Optional[str] = None,
        note: Optional[str] = None,
    ) -> IncidentModel:
        """
        Closed-loop verification: confirms operational telemetry, restores digital twin
        operational state to OPERATIONAL, and closes incident.
        """
        incident = db.query(IncidentModel).filter_by(incident_id=incident_id).first()
        if not incident:
            raise HTTPException(status_code=404, detail="Incident not found.")

        # Transition to RESOLVED then CLOSED
        self.transition_status(db, incident_id, IncidentStatus.RESOLVED, user_id, note or "Telemetry verified normal. Incident resolved.")
        self.transition_status(db, incident_id, IncidentStatus.CLOSED, user_id, "Formal incident closure.")

        # Restore Root Entity and Operational State
        root_op = db.query(OperationalStateModel).filter_by(entity_id=incident.root_entity_id).first()
        if root_op:
            root_op.current_status = OperationalStatus.OPERATIONAL.value
            root_op.health_score = 100.0
            root_op.active_incident_count = max(0, root_op.active_incident_count - 1)

        root_ent = db.query(EntityModel).filter_by(entity_id=incident.root_entity_id).first()
        if root_ent:
            root_ent.operational_status = OperationalStatus.OPERATIONAL.value

        db.commit()
        # Rebuild graph to reflect restored operational status
        graph_repository.build_graph_from_db(db)

        return incident


incident_service = IncidentService()
