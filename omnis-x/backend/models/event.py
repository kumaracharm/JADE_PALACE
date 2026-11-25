"""
SQLAlchemy Model for Telemetry Events and Observations.
"""
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    DateTime,
    ForeignKey,
    JSON,
)
from backend.database import Base


class TelemetryEventModel(Base):
    __tablename__ = "telemetry_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(String(64), unique=True, index=True, nullable=False)
    entity_id = Column(String(64), ForeignKey("entities.entity_id"), nullable=False, index=True)
    metric_name = Column(String(64), nullable=False, index=True)
    value = Column(Float, nullable=False)
    unit = Column(String(16), default="", nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    source_type = Column(String(32), default="REAL", nullable=False)
    source_id = Column(String(64), default="GATEWAY_DEFAULT", nullable=False)
    quality = Column(Float, default=1.0, nullable=False)
    raw_payload = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
