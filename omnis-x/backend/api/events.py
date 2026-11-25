"""
Telemetry and IoT Sensor Ingestion API Endpoints.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas.event import TelemetryEventCreate, TelemetryEventRead
from backend.schemas.engines import DetectionResult
from backend.services.event_service import event_service
from backend.services.audit_service import audit_service
from backend.security.auth import get_current_user
from backend.models.user import UserModel

router = APIRouter(prefix="/events", tags=["Events & Telemetry"])


@router.get("", response_model=List[TelemetryEventRead])
def get_telemetry_events(
    entity_id: Optional[str] = None,
    metric_name: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """
    Retrieve historical telemetry events with optional entity and metric filtering.
    """
    return event_service.get_events(db=db, entity_id=entity_id, metric_name=metric_name, limit=limit)


@router.post("", response_model=DetectionResult)
def ingest_telemetry_event(
    event_in: TelemetryEventCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """
    Ingest, validate, and analyze a raw telemetry observation via Engine 1 (Event & Anomaly Detection).
    """
    detection = event_service.ingest_event(db, event_in)

    # Audit log anomalous observations
    if detection.is_anomaly:
        client_ip = request.client.host if (request and request.client) else None
        audit_service.log_action(
            db=db,
            action="ANOMALY_DETECTED",
            user_id=current_user.user_id,
            entity_type="TELEMETRY_EVENT",
            entity_id=event_in.entity_id,
            details=f"Type: {detection.anomaly_type}, Evidence: {len(detection.evidence)} item(s)",
            ip_address=client_ip,
        )

    return detection
