"""
Incident Lifecycle, Analysis, and Coordination API Endpoints.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.incident import IncidentModel, RecommendationModel
from backend.schemas.incident import (
    IncidentCreate,
    IncidentRead,
    IncidentStatusUpdate,
    WorkOrderCreate,
    WorkOrderRead,
    ApprovalRequest,
)
from backend.schemas.engines import IncidentDecisionPlan
from backend.schemas.common import RoleEnum, IncidentStatus
from backend.services.incident_service import incident_service
from backend.services.audit_service import audit_service
from backend.security.auth import (
    get_current_user,
    require_roles,
    enforce_student_incident_scope,
)
from backend.models.user import UserModel
from fastapi import HTTPException

router = APIRouter(prefix="/incidents", tags=["Incidents & Recovery"])


@router.post("", response_model=IncidentRead)
def report_incident(
    incident_in: IncidentCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """
    Report a new cyber-physical incident or infrastructure fault.
    Students may submit reports scoped to their credentials.
    """
    incident = incident_service.create_incident(
        db=db,
        incident_in=incident_in,
        user_id=current_user.user_id,
    )

    client_ip = request.client.host if (request and request.client) else None
    audit_service.log_action(
        db=db,
        action="INCIDENT_REPORTED",
        user_id=current_user.user_id,
        entity_type="INCIDENT",
        entity_id=incident.incident_id,
        details=f"Title: {incident.title}, Root: {incident.root_entity_id}",
        ip_address=client_ip,
    )
    return incident


@router.get("", response_model=List[IncidentRead])
def list_incidents(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """
    List active or historical incidents.
    Students only receive their own submitted incidents.
    """
    query = db.query(IncidentModel)
    if current_user.role == RoleEnum.STUDENT.value:
        query = query.filter(IncidentModel.reported_by_user_id == current_user.user_id)

    if status:
        query = query.filter(IncidentModel.status == status)
    if priority:
        query = query.filter(IncidentModel.priority == priority)

    return query.order_by(IncidentModel.created_at.desc()).limit(limit).all()


@router.get("/{incident_id}", response_model=IncidentRead)
def get_incident(
    incident_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Get incident details and complete state transition history."""
    incident = db.query(IncidentModel).filter_by(incident_id=incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")

    enforce_student_incident_scope(current_user, incident)
    return incident


@router.post("/{incident_id}/analyze", response_model=IncidentDecisionPlan)
def analyze_incident(
    incident_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(
        require_roles([RoleEnum.PRINCIPAL, RoleEnum.HOD, RoleEnum.FACILITY_MANAGER, RoleEnum.IT_ADMIN, RoleEnum.STAFF])
    ),
):
    """
    Trigger the seven specialist intelligence engines pipeline to calculate:
    blast radius, FMEA risk, academic conflict, CP-SAT recovery plan, and task assignment.
    """
    plan = incident_service.analyze_incident(db, incident_id, user_id=current_user.user_id)

    client_ip = request.client.host if (request and request.client) else None
    audit_service.log_action(
        db=db,
        action="INCIDENT_ANALYZED",
        user_id=current_user.user_id,
        entity_type="INCIDENT",
        entity_id=incident_id,
        details=f"Plan {plan.plan_id} generated. RPN: {plan.risk_assessment.rpn}",
        ip_address=client_ip,
    )
    return plan


@router.get("/{incident_id}/analysis")
def get_incident_analysis(
    incident_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Retrieve previously computed decision plan."""
    rec = db.query(RecommendationModel).filter_by(incident_id=incident_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Analysis not yet generated for this incident.")
    return rec.plan_json


@router.get("/{incident_id}/recommendations")
def get_incident_recommendations(
    incident_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Get Pareto recovery alternatives and solver outcomes."""
    incident = db.query(IncidentModel).filter_by(incident_id=incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")
    return [
        {
            "alternative_id": alt.alternative_id,
            "title": alt.title,
            "description": alt.description,
            "recovery_time_minutes": alt.recovery_time_minutes,
            "estimated_cost_usd": alt.estimated_cost_usd,
            "disruption_penalty": alt.disruption_penalty,
            "residual_risk_score": alt.residual_risk_score,
            "composite_rank_score": alt.composite_rank_score,
            "feasible": alt.feasible,
            "is_recommended": alt.is_recommended,
            "reallocations": alt.reallocations_json,
            "steps": alt.steps_json,
            "infeasibility_reasons": alt.infeasibility_reasons_json,
        }
        for alt in incident.recovery_alternatives
    ]


@router.post("/{incident_id}/approve", response_model=IncidentRead)
def approve_recommendation(
    incident_id: str,
    approval_in: ApprovalRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(
        require_roles([RoleEnum.PRINCIPAL, RoleEnum.HOD, RoleEnum.FACILITY_MANAGER, RoleEnum.IT_ADMIN])
    ),
):
    """
    Human-in-the-Loop Approval Gateway.
    Authorizes recovery action plan and dispatches technical work order.
    """
    incident = incident_service.approve_recommendation(
        db=db,
        incident_id=incident_id,
        plan_id=approval_in.plan_id,
        user_id=current_user.user_id,
        user_role=RoleEnum(current_user.role),
        comments=approval_in.comments,
    )

    client_ip = request.client.host if (request and request.client) else None
    audit_service.log_action(
        db=db,
        action="RECOVERY_PLAN_APPROVED",
        user_id=current_user.user_id,
        entity_type="INCIDENT",
        entity_id=incident_id,
        details=f"Approved by {current_user.role}. Comments: {approval_in.comments}",
        ip_address=client_ip,
    )
    return incident


@router.post("/{incident_id}/reject", response_model=IncidentRead)
def reject_recommendation(
    incident_id: str,
    approval_in: ApprovalRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(
        require_roles([RoleEnum.PRINCIPAL, RoleEnum.HOD, RoleEnum.FACILITY_MANAGER, RoleEnum.IT_ADMIN])
    ),
):
    """Reject proposed recovery plan."""
    incident = incident_service.reject_recommendation(
        db=db,
        incident_id=incident_id,
        user_id=current_user.user_id,
        user_role=RoleEnum(current_user.role),
        comments=approval_in.comments,
    )

    client_ip = request.client.host if (request and request.client) else None
    audit_service.log_action(
        db=db,
        action="RECOVERY_PLAN_REJECTED",
        user_id=current_user.user_id,
        entity_type="INCIDENT",
        entity_id=incident_id,
        details=f"Rejected by {current_user.role}. Reason: {approval_in.comments}",
        ip_address=client_ip,
    )
    return incident


@router.post("/{incident_id}/work-orders", response_model=WorkOrderRead)
def create_work_order_for_incident(
    incident_id: str,
    wo_in: WorkOrderCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(
        require_roles([RoleEnum.PRINCIPAL, RoleEnum.FACILITY_MANAGER, RoleEnum.IT_ADMIN])
    ),
):
    """Manually dispatch a work order associated with this incident."""
    wo_in.incident_id = incident_id
    wo = incident_service.create_work_order(db, wo_in, user_id=current_user.user_id)

    client_ip = request.client.host if (request and request.client) else None
    audit_service.log_action(
        db=db,
        action="WORK_ORDER_DISPATCHED",
        user_id=current_user.user_id,
        entity_type="WORK_ORDER",
        entity_id=wo.work_order_id,
        details=f"Assigned to {wo.assigned_department} ({wo.assigned_to_user_id})",
        ip_address=client_ip,
    )
    return wo


@router.post("/{incident_id}/verify", response_model=IncidentRead)
def verify_incident_resolution(
    incident_id: str,
    request: Request,
    note: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(
        require_roles([RoleEnum.PRINCIPAL, RoleEnum.FACILITY_MANAGER, RoleEnum.IT_ADMIN])
    ),
):
    """Closed-loop verification: confirms repairs, restores digital twin health, and closes ticket."""
    incident = incident_service.verify_and_resolve(db, incident_id, user_id=current_user.user_id, note=note)

    client_ip = request.client.host if (request and request.client) else None
    audit_service.log_action(
        db=db,
        action="INCIDENT_VERIFIED_AND_CLOSED",
        user_id=current_user.user_id,
        entity_type="INCIDENT",
        entity_id=incident_id,
        details=note or "Closed-loop verification successful.",
        ip_address=client_ip,
    )
    return incident
