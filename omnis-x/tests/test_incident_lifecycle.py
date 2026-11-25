"""
Tests for Incident State Machine Lifecycle, Work Orders, and Approvals.
"""
import pytest
from fastapi import HTTPException
from backend.services.incident_service import incident_service
from backend.schemas.incident import IncidentCreate, WorkOrderCreate, WorkOrderUpdate
from backend.schemas.common import IncidentStatus, WorkOrderStatus, RoleEnum, ApprovalStatus


def test_incident_state_machine_happy_path(db_session):
    """Test valid lifecycle flow through all operational phases."""
    inc_in = IncidentCreate(
        title="Feeder F1 Overcurrent Trip",
        description="Feeder tripped due to transient overload in circuit.",
        root_entity_id="FEEDER-LABS-F1",
    )
    incident = incident_service.create_incident(db_session, inc_in, user_id="USR-FACILITY-MGR")
    assert incident.status == IncidentStatus.REPORTED.value

    # Valid transitions: REPORTED -> VALIDATING -> CONFIRMED -> ANALYZING -> AWAITING_APPROVAL -> ASSIGNED -> IN_PROGRESS -> VERIFICATION -> RESOLVED -> CLOSED
    inc = incident_service.transition_status(db_session, incident.incident_id, IncidentStatus.VALIDATING, "USR-FACILITY-MGR")
    assert inc.status == IncidentStatus.VALIDATING.value

    inc = incident_service.transition_status(db_session, incident.incident_id, IncidentStatus.CONFIRMED, "USR-FACILITY-MGR")
    assert inc.status == IncidentStatus.CONFIRMED.value

    # Analyze incident
    plan = incident_service.analyze_incident(db_session, incident.incident_id, "USR-FACILITY-MGR")
    assert plan.plan_id is not None
    # Incident status should now be AWAITING_APPROVAL
    assert incident.status == IncidentStatus.AWAITING_APPROVAL.value

    # Approve recommendation
    incident_service.approve_recommendation(
        db_session,
        incident.incident_id,
        plan.plan_id,
        user_id="USR-FACULTY-SHARMA",
        user_role=RoleEnum.HOD,
        comments="Approved temporary room shift to CR-202",
    )
    # Also approve as Facility Manager if required
    for app in incident.approvals:
        if app.status == ApprovalStatus.PENDING.value:
            incident_service.approve_recommendation(
                db_session,
                incident.incident_id,
                plan.plan_id,
                user_id="USR-FACILITY-MGR",
                user_role=RoleEnum(app.required_role),
                comments="Approved switchgear inspection",
            )

    # After approval, auto-dispatched Work Order exists and status is ASSIGNED
    assert incident.status == IncidentStatus.ASSIGNED.value
    assert len(incident.work_orders) >= 1
    wo = incident.work_orders[0]

    # Technician starts work: IN_PROGRESS
    incident_service.update_work_order(
        db_session,
        wo.work_order_id,
        WorkOrderUpdate(status=WorkOrderStatus.IN_PROGRESS),
        user_id="USR-ELEC-TECH",
    )
    assert incident.status == IncidentStatus.IN_PROGRESS.value

    # Technician finishes work: COMPLETED -> advances incident to VERIFICATION
    incident_service.update_work_order(
        db_session,
        wo.work_order_id,
        WorkOrderUpdate(status=WorkOrderStatus.COMPLETED, resolution_notes="Breaker reset and insulation resistance tested normal."),
        user_id="USR-ELEC-TECH",
    )
    assert incident.status == IncidentStatus.VERIFICATION.value

    # Closed-loop verification
    incident_service.verify_and_resolve(db_session, incident.incident_id, user_id="USR-FACILITY-MGR")
    assert incident.status == IncidentStatus.CLOSED.value


def test_invalid_state_transition_rejected(db_session):
    """Test that illegal status jumps (e.g. REPORTED directly to RESOLVED) raise 400 Bad Request."""
    inc_in = IncidentCreate(
        title="Spurious Fault",
        description="Transient alarm.",
        root_entity_id="FEEDER-LABS-F1",
    )
    incident = incident_service.create_incident(db_session, inc_in)

    with pytest.raises(HTTPException) as exc_info:
        incident_service.transition_status(db_session, incident.incident_id, IncidentStatus.RESOLVED)
    assert exc_info.value.status_code == 400
    assert "Illegal incident transition" in exc_info.value.detail
