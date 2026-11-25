"""
Campus Health Overview and Audit Log API Endpoints.
"""
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database import get_db
from backend.models.entity import EntityModel, OperationalStateModel
from backend.models.incident import IncidentModel, IncidentEntityModel, WorkOrderModel
from backend.models.user import AuditLogModel
from backend.schemas.user import AuditLogRead
from backend.schemas.common import OperationalStatus, IncidentStatus, WorkOrderStatus
from backend.security.auth import get_current_user, require_roles
from backend.models.user import UserModel
from backend.schemas.common import RoleEnum

router = APIRouter(tags=["Analytics & Governance"])


@router.get("/analytics/overview")
def get_campus_health_overview(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Aggregates executive institutional health indices, active incidents,
    critical infrastructure status, and active work orders.
    """
    total_entities = db.query(EntityModel).count()
    operational_entities = db.query(EntityModel).filter(
        EntityModel.operational_status == OperationalStatus.OPERATIONAL.value
    ).count()
    unavailable_entities = db.query(EntityModel).filter(
        EntityModel.operational_status == OperationalStatus.UNAVAILABLE.value
    ).count()
    degraded_entities = db.query(EntityModel).filter(
        EntityModel.operational_status == OperationalStatus.DEGRADED.value
    ).count()

    campus_health_index = round((operational_entities / total_entities * 100.0), 2) if total_entities > 0 else 100.0

    active_incidents = db.query(IncidentModel).filter(
        IncidentModel.status.notin_([
            IncidentStatus.CLOSED.value,
            IncidentStatus.RESOLVED.value,
            IncidentStatus.REJECTED.value,
            IncidentStatus.DUPLICATE.value,
        ])
    ).count()

    pending_approvals = db.query(IncidentModel).filter(
        IncidentModel.status == IncidentStatus.AWAITING_APPROVAL.value
    ).count()

    active_work_orders = db.query(WorkOrderModel).filter(
        WorkOrderModel.status.in_([
            WorkOrderStatus.CREATED.value,
            WorkOrderStatus.ASSIGNED.value,
            WorkOrderStatus.IN_PROGRESS.value,
        ])
    ).count()

    return {
        "campus_health_index": campus_health_index,
        "total_twin_entities": total_entities,
        "operational_entities": operational_entities,
        "unavailable_entities": unavailable_entities,
        "degraded_entities": degraded_entities,
        "active_incidents": active_incidents,
        "pending_human_approvals": pending_approvals,
        "active_work_orders": active_work_orders,
        "system_status": "NORMAL" if unavailable_entities == 0 else "RESILIENCE_ALERT",
    }


@router.get("/audit", response_model=List[AuditLogRead])
def get_audit_trail(
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(
        require_roles([RoleEnum.PRINCIPAL, RoleEnum.FACILITY_MANAGER, RoleEnum.IT_ADMIN])
    ),
):
    """Immutable audit trail for institutional governance and compliance inspection."""
    return db.query(AuditLogModel).order_by(AuditLogModel.timestamp.desc()).limit(limit).all()
