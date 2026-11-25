"""
Event Ingestion and Telemetry Service.
Validates incoming sensor, synthetic, and reported observations with cryptographic provenance.
"""
import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import HTTPException
from backend.models.event import TelemetryEventModel
from backend.models.entity import EntityModel
from backend.schemas.event import TelemetryEventCreate
from backend.schemas.engines import DetectionResult
from backend.engines import detection_engine


class EventService:
    """
    Ingests, queries, and validates raw telemetry streams.
    """

    def ingest_event(
        self,
        db: Session,
        event_in: TelemetryEventCreate,
    ) -> DetectionResult:
        event_id = event_in.event_id or f"EVT-{uuid.uuid4().hex[:8].upper()}"

        # 1. Run Engine 1 Detection
        result = detection_engine.analyze_event(event_in)

        # 2. Persist event to telemetry_events table
        model = TelemetryEventModel(
            event_id=event_id,
            entity_id=event_in.entity_id,
            metric_name=event_in.metric_name,
            value=event_in.value,
            unit=event_in.unit,
            timestamp=event_in.timestamp,
            source_type=event_in.source_type.value if hasattr(event_in.source_type, "value") else str(event_in.source_type),
            source_id=event_in.source_id,
            quality=event_in.quality,
            raw_payload=event_in.raw_payload,
        )
        db.add(model)
        db.commit()

        return result

    def get_events(
        self,
        db: Session,
        entity_id: Optional[str] = None,
        metric_name: Optional[str] = None,
        limit: int = 100,
    ) -> List[TelemetryEventModel]:
        """
        Query historical telemetry events filtered by entity or metric.
        """
        query = db.query(TelemetryEventModel)
        if entity_id:
            query = query.filter(TelemetryEventModel.entity_id == entity_id)
        if metric_name:
            query = query.filter(TelemetryEventModel.metric_name == metric_name)
        return query.order_by(desc(TelemetryEventModel.timestamp)).limit(limit).all()


event_service = EventService()
