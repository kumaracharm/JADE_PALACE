"""
Work Order Lifecycle API Endpoints.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.incident import WorkOrderModel
from backend.schemas.incident import WorkOrderRead, WorkOrderUpdate
from backend.services.incident_service import incident_service
from backend.services.audit_service import audit_service
from backend.security.auth import get_current_user, require_roles
from backend.models.user import UserModel
from backend.schemas.common import RoleEnum
from fastapi import HTTPException

router = APIRouter(prefix="/work-orders", tags=["Work Orders"])


@router.get("", response_model=List[WorkOrderRead])
def list_work_orders(
    status: Optional[str] = None,
    department: Optional[str] = None,
    assigned_to: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """List technical work orders with status and department filters."""
    query = db.query(WorkOrderModel)
    if status:
        query = query.filter(WorkOrderModel.status == status)
    if department:
        query = query.filter(WorkOrderModel.assigned_department == department)
    if assigned_to:
        query = query.filter(WorkOrderModel.assigned_to_user_id == assigned_to)
    return query.order_by(WorkOrderModel.created_at.desc()).limit(limit).all()


@router.get("/{work_order_id}", response_model=WorkOrderRead)
def get_work_order(
    work_order_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Retrieve specific work order by ID."""
    wo = db.query(WorkOrderModel).filter_by(work_order_id=work_order_id).first()
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found.")
    return wo


@router.patch("/{work_order_id}", response_model=WorkOrderRead)
def update_work_order_status(
    work_order_id: str,
    update_in: WorkOrderUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(
        require_roles([RoleEnum.SUPER_ADMIN, RoleEnum.PRINCIPAL, RoleEnum.FACILITY_MANAGER, RoleEnum.TECHNICIAN, RoleEnum.STAFF])
    ),
):
    """
    Update work order status, progress notes, and actual completion hours.
    Completing a work order automatically advances the associated incident to VERIFICATION.
    """
    wo = incident_service.update_work_order(
        db=db,
        work_order_id=work_order_id,
        wo_update=update_in,
        user_id=current_user.user_id,
    )

    client_ip = request.client.host if (request and request.client) else None
    audit_service.log_action(
        db=db,
        action="WORK_ORDER_UPDATED",
        user_id=current_user.user_id,
        entity_type="WORK_ORDER",
        entity_id=work_order_id,
        details=f"Status: {wo.status}, Notes: {update_in.resolution_notes}",
        ip_address=client_ip,
    )
    return wo
