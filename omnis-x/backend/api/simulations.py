"""
Simulation Sandbox API Endpoints (Layer 5 Ephemeral Twin).
"""
from typing import List
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.incident import SimulationModel
from backend.schemas.incident import SimulationCreate, SimulationRead
from backend.services.simulation_service import simulation_service
from backend.services.audit_service import audit_service
from backend.security.auth import get_current_user, require_roles
from backend.models.user import UserModel
from backend.schemas.common import RoleEnum
from fastapi import HTTPException

router = APIRouter(prefix="/simulations", tags=["Simulation Sandbox"])


@router.post("", response_model=SimulationRead)
def create_simulation(
    sim_in: SimulationCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(
        require_roles([RoleEnum.PRINCIPAL, RoleEnum.HOD, RoleEnum.FACILITY_MANAGER, RoleEnum.IT_ADMIN])
    ),
):
    """
    Define a counterfactual failure experiment (e.g. Substation breaker trip, core switch failure).
    """
    sim = simulation_service.create_simulation(db, sim_in)
    client_ip = request.client.host if (request and request.client) else None
    audit_service.log_action(
        db=db,
        action="SIMULATION_CREATED",
        user_id=current_user.user_id,
        entity_type="SIMULATION",
        entity_id=sim.simulation_id,
        details=f"Target: {sim.target_entity_id}, Failure: {sim.injected_failure_type}",
        ip_address=client_ip,
    )
    return sim


@router.get("/{simulation_id}", response_model=SimulationRead)
def get_simulation(
    simulation_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Retrieve simulation setup and calculated shadow impact results."""
    sim = db.query(SimulationModel).filter_by(simulation_id=simulation_id).first()
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found.")
    return sim


@router.post("/{simulation_id}/run", response_model=SimulationRead)
def execute_simulation(
    simulation_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(
        require_roles([RoleEnum.PRINCIPAL, RoleEnum.HOD, RoleEnum.FACILITY_MANAGER, RoleEnum.IT_ADMIN])
    ),
):
    """
    Execute shadow blast-radius and recovery optimization in an isolated shadow twin buffer.
    Guaranteed zero mutation to production operational twin records.
    """
    sim = simulation_service.run_simulation(db, simulation_id)
    client_ip = request.client.host if (request and request.client) else None
    audit_service.log_action(
        db=db,
        action="SIMULATION_EXECUTED",
        user_id=current_user.user_id,
        entity_type="SIMULATION",
        entity_id=simulation_id,
        details=f"Status: {sim.status}",
        ip_address=client_ip,
    )
    return sim
