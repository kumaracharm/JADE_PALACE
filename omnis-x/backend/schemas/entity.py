"""
Entity & Relationship Pydantic Schemas.
"""
from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, ConfigDict
from backend.schemas.common import (
    EntityType,
    RelationshipType,
    OperationalStatus,
    CriticalityLevel,
)


class EntityBase(BaseModel):
    entity_id: str = Field(..., description="Stable unique identifier")
    entity_type: EntityType
    name: str
    description: Optional[str] = None
    parent_entity_id: Optional[str] = None
    location: Optional[str] = None
    criticality: CriticalityLevel = CriticalityLevel.MEDIUM
    operational_status: OperationalStatus = OperationalStatus.OPERATIONAL
    metadata_json: Dict[str, Any] = Field(default_factory=dict)


class EntityCreate(EntityBase):
    pass


class EntityUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    parent_entity_id: Optional[str] = None
    location: Optional[str] = None
    criticality: Optional[CriticalityLevel] = None
    operational_status: Optional[OperationalStatus] = None
    metadata_json: Optional[Dict[str, Any]] = None


class EntityRead(EntityBase):
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RelationshipBase(BaseModel):
    relationship_id: str = Field(..., description="Stable unique relationship ID")
    source_id: str
    target_id: str
    relationship_type: RelationshipType
    is_essential: bool = True
    redundancy_available: bool = False
    dependency_strength: float = 1.0
    propagation_policy: str = "DEFAULT"
    metadata_json: Dict[str, Any] = Field(default_factory=dict)


class RelationshipCreate(RelationshipBase):
    pass


class RelationshipRead(RelationshipBase):
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GraphNodeInfo(BaseModel):
    id: str
    label: str
    type: EntityType
    criticality: CriticalityLevel
    status: OperationalStatus
    parent_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class GraphEdgeInfo(BaseModel):
    id: str
    source: str
    target: str
    type: RelationshipType
    is_essential: bool
    redundancy_available: bool
    dependency_strength: float
    propagation_policy: str


class CampusGraphExport(BaseModel):
    nodes: List[GraphNodeInfo]
    edges: List[GraphEdgeInfo]
    total_nodes: int
    total_edges: int
