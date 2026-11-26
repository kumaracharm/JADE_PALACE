"""
OMNIS-X Independent Website & PWA Inbox Bridge API.
Receives incoming alerts, grievances, and niche telemetry from an independent PWA / website
sharing the same IP address, secured via cryptographic API Key Header (X-OMNIS-API-KEY).
"""
import os
import sqlite3
import json
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, Header, HTTPException, status, Query

router = APIRouter(prefix="/inbox", tags=["PWA & External Website Inbox"])

# Default API Key for connecting independent PWA sharing the same IP
DEFAULT_API_KEY = os.getenv("OMNIS_INBOX_API_KEY", "omnis_pwa_secret_key_2026")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)
INBOX_DB_PATH = os.path.join(DATA_DIR, "inbox_alerts.db")


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(INBOX_DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_inbox_db():
    conn = get_db_connection()
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS inbox_alerts (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                source TEXT NOT NULL,
                category TEXT NOT NULL,
                severity TEXT NOT NULL,
                message TEXT NOT NULL,
                entity_id TEXT,
                status TEXT NOT NULL DEFAULT 'UNREAD',
                metadata_json TEXT,
                created_at TEXT NOT NULL
            );
        """)
        # Seed initial sample alerts if empty
        cursor = conn.execute("SELECT COUNT(*) as count FROM inbox_alerts")
        if cursor.fetchone()["count"] == 0:
            now = datetime.now(timezone.utc).isoformat(timespec="seconds")
            initial_alerts = [
                (
                    "ALERT-" + str(uuid.uuid4())[:8],
                    "Electrical Arc Hazard at Microcontroller Bench",
                    "Oogway Student PWA (:8090)",
                    "ELECTRICAL",
                    "CRITICAL",
                    "Student reported electrical sparks and burning smell at Workbench 04 in Room 101.",
                    "LAB-01-EE",
                    "UNREAD",
                    json.dumps({"reported_by": "USR-STUDENT-01", "bench_id": "BENCH-04", "voltage_obs": "428V Surge"}),
                    now,
                ),
                (
                    "ALERT-" + str(uuid.uuid4())[:8],
                    "HVAC Chilled Water Diffuser Leakage",
                    "Academic Hall PWA (:8090)",
                    "HVAC",
                    "WARNING",
                    "Water condensation dripping over overhead laser projector mounting bracket in CR-104.",
                    "CR-104",
                    "UNREAD",
                    json.dumps({"reported_by": "USR-FACULTY-EE", "room": "CR-104", "risk": "Water on electronics"}),
                    now,
                ),
                (
                    "ALERT-" + str(uuid.uuid4())[:8],
                    "Substation Feeder F1 Under-Voltage Transient",
                    "Substation IoT Sensor Gateway",
                    "VOLTAGE_ANOMALY",
                    "HIGH",
                    "Phase B voltage dipped below nominal threshold to 378.4V for 820ms.",
                    "FEEDER-LABS-F1",
                    "UNREAD",
                    json.dumps({"feeder": "FEEDER-LABS-F1", "rms_v": 378.4, "threshold_min": 390.0}),
                    now,
                ),
            ]
            conn.executemany("""
                INSERT INTO inbox_alerts (id, title, source, category, severity, message, entity_id, status, metadata_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, initial_alerts)


init_inbox_db()


# --------------------------------------------------------------------------
# API Key Verification Dependency
# --------------------------------------------------------------------------
def verify_inbox_api_key(
    x_omnis_api_key: Optional[str] = Header(None, alias="X-OMNIS-API-KEY"),
    x_api_key: Optional[str] = Header(None, alias="X-API-KEY"),
    x_pwa_api_key: Optional[str] = Header(None, alias="X-PWA-API-KEY"),
    authorization: Optional[str] = Header(None),
) -> str:
    """
    Validates that incoming webhook/alert dispatches from the independent PWA or external site
    present the authoritative API key header.
    """
    provided_key = x_omnis_api_key or x_api_key or x_pwa_api_key
    if not provided_key and authorization:
        if authorization.lower().startswith("bearer "):
            provided_key = authorization.split(" ", 1)[1].strip()
        else:
            provided_key = authorization.strip()

    if not provided_key or provided_key.strip() != DEFAULT_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Missing or invalid API key. Please pass 'X-OMNIS-API-KEY: "
                f"{DEFAULT_API_KEY}' header in your HTTP request."
            ),
        )
    return provided_key


# --------------------------------------------------------------------------
# Schemas
# --------------------------------------------------------------------------
class IncomingAlertCreate(BaseModel):
    title: str = Field(..., description="Short summary title of the alert or grievance")
    source: Optional[str] = Field("Independent PWA", description="Name/Port of the independent site or PWA")
    category: Optional[str] = Field("HAZARD_REPORT", description="Category: ELECTRICAL, HVAC, WATER, ACADEMIC, GRIEVANCE, VOLTAGE_ANOMALY, OTHER")
    severity: Optional[str] = Field("WARNING", description="Severity: LOW, MEDIUM, HIGH, CRITICAL, EMERGENCY")
    message: str = Field(..., description="Detailed narrative or telemetry payload")
    entity_id: Optional[str] = Field(None, description="Impacted 3D spatial entity ID (e.g. FEEDER-LABS-F1, LAB-01-EE, CR-101, SUBSTATION-01)")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Arbitrary JSON metadata dictionary")


class InboxAlertRead(BaseModel):
    id: str
    title: str
    source: str
    category: str
    severity: str
    message: str
    entity_id: Optional[str] = None
    status: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: str


# --------------------------------------------------------------------------
# Endpoints
# --------------------------------------------------------------------------
@router.post("/dispatch", status_code=status.HTTP_201_CREATED)
@router.post("/alerts", status_code=status.HTTP_201_CREATED)
def dispatch_external_alert(
    payload: IncomingAlertCreate,
    api_key: str = Header(..., alias="X-OMNIS-API-KEY", description="Cryptographic API Key header"),
):
    """
    Dispatch an alert or grievance record from the independent website / PWA into OMNIS-X main website.
    Requires header: X-OMNIS-API-KEY: omnis_pwa_secret_key_2026.
    """
    if api_key != DEFAULT_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Unauthorized API key. Expected 'X-OMNIS-API-KEY: {DEFAULT_API_KEY}'",
        )

    alert_id = "ALERT-" + str(uuid.uuid4())[:8]
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")

    conn = get_db_connection()
    with conn:
        conn.execute("""
            INSERT INTO inbox_alerts (id, title, source, category, severity, message, entity_id, status, metadata_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            alert_id,
            payload.title,
            payload.source or "Independent PWA",
            payload.category or "HAZARD_REPORT",
            payload.severity or "WARNING",
            payload.message,
            payload.entity_id,
            "UNREAD",
            json.dumps(payload.metadata or {}),
            now,
        ))

    return {
        "status": "ACCEPTED",
        "alert_id": alert_id,
        "message": "Alert successfully stored in OMNIS-X Inbox Window",
        "created_at": now,
        "entity_id": payload.entity_id,
    }


@router.get("/messages")
def get_inbox_messages(
    limit: int = Query(50, ge=1, le=200),
    status_filter: Optional[str] = Query(None, description="Filter by status: UNREAD or ACKNOWLEDGED"),
):
    """
    Retrieves incoming alerts for the Main Website Inbox Window.
    """
    conn = get_db_connection()
    if status_filter:
        cursor = conn.execute("""
            SELECT * FROM inbox_alerts WHERE status = ? ORDER BY created_at DESC LIMIT ?
        """, (status_filter.upper(), limit))
    else:
        cursor = conn.execute("""
            SELECT * FROM inbox_alerts ORDER BY created_at DESC LIMIT ?
        """, (limit,))

    rows = cursor.fetchall()
    results = []
    unread_count = 0

    for r in rows:
        if r["status"] == "UNREAD":
            unread_count += 1
        meta = {}
        if r["metadata_json"]:
            try:
                meta = json.loads(r["metadata_json"])
            except Exception:
                meta = {}

        results.append({
            "id": r["id"],
            "title": r["title"],
            "source": r["source"],
            "category": r["category"],
            "severity": r["severity"],
            "message": r["message"],
            "entity_id": r["entity_id"],
            "status": r["status"],
            "metadata": meta,
            "created_at": r["created_at"],
        })

    return {
        "total": len(results),
        "unread_count": unread_count,
        "messages": results,
    }


@router.patch("/messages/{alert_id}/acknowledge")
def acknowledge_message(alert_id: str):
    """
    Marks an alert in the inbox as acknowledged/read.
    """
    conn = get_db_connection()
    with conn:
        res = conn.execute("UPDATE inbox_alerts SET status = 'ACKNOWLEDGED' WHERE id = ?", (alert_id,))
        if res.rowcount == 0:
            raise HTTPException(status_code=404, detail="Alert ID not found")

    return {"status": "SUCCESS", "alert_id": alert_id, "new_status": "ACKNOWLEDGED"}


@router.delete("/messages/{alert_id}")
def delete_message(alert_id: str):
    """
    Dismisses/deletes an alert from the inbox.
    """
    conn = get_db_connection()
    with conn:
        res = conn.execute("DELETE FROM inbox_alerts WHERE id = ?", (alert_id,))
        if res.rowcount == 0:
            raise HTTPException(status_code=404, detail="Alert ID not found")

    return {"status": "DELETED", "alert_id": alert_id}


@router.get("/key-info")
def get_inbox_integration_info():
    """
    Returns connection documentation, API key header specification, and curl example.
    """
    return {
        "api_key_header_name": "X-OMNIS-API-KEY",
        "api_key_value": DEFAULT_API_KEY,
        "endpoint_url": "/api/v1/inbox/dispatch",
        "supported_methods": ["POST"],
        "sample_curl": (
            f"curl -X POST http://<SAME_IP>:8000/api/v1/inbox/dispatch \\\n"
            f"  -H 'Content-Type: application/json' \\\n"
            f"  -H 'X-OMNIS-API-KEY: {DEFAULT_API_KEY}' \\\n"
            f"  -d '{{\"title\": \"Voltage Drop Observed\", \"source\": \"Independent PWA\", \"severity\": \"CRITICAL\", \"entity_id\": \"FEEDER-LABS-F1\", \"message\": \"Voltage dropped below 380V in research wing.\"}}'"
        ),
    }
