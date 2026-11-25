"""
Telemetry & Event Pydantic Schemas.
"""
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from backend.schemas.common import ProvenanceSourceType


class TelemetryEventCreate(BaseModel):
    event_id: Optional[str] = None
    entity_id: str
    metric_name: str
    value: float
    unit: str = ""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    source_type: ProvenanceSourceType = ProvenanceSourceType.REAL
    source_id: str = "GATEWAY_DEFAULT"
    quality: float = Field(default=1.0, ge=0.0, le=1.0)
    raw_payload: Dict[str, Any] = Field(default_factory=dict)


class TelemetryEventRead(TelemetryEventCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
