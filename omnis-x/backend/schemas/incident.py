"""
Incident, Work Order, Approval, and Simulation Pydantic Schemas.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from backend.schemas.common import (
    IncidentStatus,
    WorkOrderStatus,
    ApprovalStatus,
    ProvenanceSourceType,
    CriticalityLevel,
    RoleEnum,
)


class IncidentCreate(BaseModel):
    incident_id: Optional[str] = None
    title: str
    description: str
    root_entity_id: str
    source_type: ProvenanceSourceType = ProvenanceSourceType.REPORTED
    source_id: Optional[str] = None
    priority: CriticalityLevel = CriticalityLevel.MEDIUM
    metadata_json: Dict[str, Any] = Field(default_factory=dict)


class IncidentStatusUpdate(BaseModel):
    target_status: IncidentStatus
    note: Optional[str] = None


class StateHistoryRead(BaseModel):
    id: int
    from_status: str
    to_status: str
    changed_by_user_id: Optional[str] = None
    changed_at: datetime
    note: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class WorkOrderCreate(BaseModel):
    work_order_id: Optional[str] = None
    incident_id: str
    title: str
    description: str
    assigned_department: str
    assigned_to_user_id: Optional[str] = None
    target_entity_id: str
    priority: CriticalityLevel = CriticalityLevel.HIGH
    estimated_hours: float = 2.0


class WorkOrderUpdate(BaseModel):
    status: Optional[WorkOrderStatus] = None
    assigned_to_user_id: Optional[str] = None
    resolution_notes: Optional[str] = None
    actual_hours: Optional[float] = None


class WorkOrderRead(BaseModel):
    work_order_id: str
    incident_id: str
    title: str
    description: str
    assigned_department: str
    assigned_to_user_id: Optional[str] = None
    target_entity_id: str
    status: WorkOrderStatus
    priority: CriticalityLevel
    estimated_hours: float
    actual_hours: Optional[float] = None
    resolution_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApprovalRequest(BaseModel):
    plan_id: Optional[str] = None
    decision: ApprovalStatus = ApprovalStatus.APPROVED
    comments: Optional[str] = None


class ApprovalRead(BaseModel):
    approval_id: str
    incident_id: str
    plan_id: Optional[str] = None
    required_role: RoleEnum
    approved_by_user_id: Optional[str] = None
    status: ApprovalStatus
    comments: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class SimulationCreate(BaseModel):
    name: str
    description: Optional[str] = None
    target_entity_id: str
    injected_failure_type: str = "POWER_OUTAGE"
    parameters: Dict[str, Any] = Field(default_factory=dict)


class SimulationRead(BaseModel):
    simulation_id: str
    name: str
    description: Optional[str] = None
    target_entity_id: str
    injected_failure_type: str
    parameters: Dict[str, Any]
    status: str
    results: Optional[Dict[str, Any]] = None
    created_at: datetime
    executed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class IncidentRead(BaseModel):
    incident_id: str
    title: str
    description: str
    root_entity_id: str
    status: IncidentStatus
    priority: CriticalityLevel
    source_type: ProvenanceSourceType
    source_id: Optional[str] = None
    reported_by_user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    history: List[StateHistoryRead] = Field(default_factory=list)
    work_orders: List[WorkOrderRead] = Field(default_factory=list)
    approvals: List[ApprovalRead] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
