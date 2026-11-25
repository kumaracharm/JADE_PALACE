"""
SQLAlchemy Models Package Initialization.
Imports all models to register with Base.metadata.
"""
from backend.models.entity import EntityModel, RelationshipModel, OperationalStateModel
from backend.models.event import TelemetryEventModel
from backend.models.incident import (
    IncidentModel,
    IncidentEntityModel,
    StateHistoryModel,
    RecoveryAlternativeModel,
    WorkOrderModel,
    ApprovalModel,
    RecommendationModel,
    SimulationModel,
)
from backend.models.user import UserModel, RoleModel, AuditLogModel

__all__ = [
    "EntityModel",
    "RelationshipModel",
    "OperationalStateModel",
    "TelemetryEventModel",
    "IncidentModel",
    "IncidentEntityModel",
    "StateHistoryModel",
    "RecoveryAlternativeModel",
    "WorkOrderModel",
    "ApprovalModel",
    "RecommendationModel",
    "SimulationModel",
    "UserModel",
    "RoleModel",
    "AuditLogModel",
]
