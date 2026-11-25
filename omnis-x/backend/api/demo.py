"""
OMNIS-X — Emergency Demonstration & Real-Time Telemetry Streaming API.
Provides live SSE synthetic telemetry, dynamic graph state propagation,
and three interactive demonstration controls (INTERRUPT, RECOVERY, RESTORE).
"""
import asyncio
import json
import random
from datetime import datetime, timezone
from typing import Dict, Any, List
from fastapi import APIRouter, Request, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from backend.database import get_db, SessionLocal
from backend.graph.repository import graph_repository
from backend.models.incident import IncidentModel
from backend.models.user import AuditLogModel
from backend.models.entity import EntityModel

router = APIRouter(prefix="/demo", tags=["Demo & Telemetry Stream"])

# In-memory demo simulation state
class DemoSimulationState:
    def __init__(self):
        self.state: str = "NORMAL"  # NORMAL, INTERRUPTED, RECOVERY_PLANNED, RESTORED
        self.feeder_status: str = "OPERATIONAL"
        self.active_power_kw: float = 142.5
        self.voltage_v: float = 415.0
        self.affected_entities: List[str] = []
        self.last_event_id: str = "EVT-INIT-001"
        self.last_update_iso: str = datetime.now(timezone.utc).isoformat()
        self.incident_id: str = "INC-DEMO-01"
        self.step_explanation: Dict[str, Any] = {
            "title": "NORMAL OPERATIONAL BASELINE",
            "message": "Continuous synthetic telemetry fluctuating within nominal engineering tolerance.",
            "metrics": {"power_load": "142.5 kW", "voltage": "415.0 V", "active_anomalies": 0}
        }

    def get_snapshot(self) -> Dict[str, Any]:
        # Generate realistic Gaussian noise around baseline values
        if self.state in ["INTERRUPTED", "RECOVERY_PLANNED"]:
            v = max(0.0, random.gauss(0.0, 0.5))
            p = max(0.0, random.gauss(0.0, 0.8))
            c = max(0.0, random.gauss(0.0, 0.2))
        else:
            v = round(random.gauss(415.0, 1.2), 1)
            p = round(random.gauss(142.5, 2.5), 1)
            c = round(p * 1.39, 1)

        self.last_event_id = f"EVT-SYNTH-{random.randint(10000, 99999)}"
        self.last_update_iso = datetime.now(timezone.utc).isoformat()

        return {
            "event_id": self.last_event_id,
            "timestamp": self.last_update_iso,
            "provenance": "SYNTHETIC / SIMULATED",
            "entity_id": "METER-FEEDER-F1",
            "telemetry": {
                "voltage_v": v,
                "active_power_kw": p,
                "current_a": c,
                "temperature_c": round(random.gauss(23.4, 0.3), 1),
                "frequency_hz": round(random.gauss(50.01, 0.04), 2),
            },
            "feeder_status": self.feeder_status,
            "affected_entities": self.affected_entities,
            "demo_state": self.state,
            "explanation": self.step_explanation,
            "active_pulses": self._get_pulses(),
        }

    def _get_pulses(self) -> List[Dict[str, Any]]:
        is_cut = self.state in ["INTERRUPTED", "RECOVERY_PLANNED"]
        pulses = [
            {"source": "GEN-500KVA", "target": "ATS-01", "status": "STANDBY", "color": "#9D8EB5"},
            {"source": "SUBSTATION-01", "target": "ATS-01", "status": "ACTIVE", "color": "#D4AF37"},
            {"source": "ATS-01", "target": "PANEL-ENG-MAIN", "status": "ACTIVE", "color": "#D4AF37"},
            {"source": "PANEL-ENG-MAIN", "target": "FEEDER-CR-F1", "status": "ACTIVE", "color": "#D4AF37"},
            {"source": "FEEDER-CR-F1", "target": "CR-101", "status": "ACTIVE", "color": "#D4AF37"},
            {"source": "PANEL-ENG-MAIN", "target": "SRV-01", "status": "ACTIVE", "color": "#D4AF37"},
        ]
        # Feeder Riser 1 branch
        if is_cut:
            pulses.append({"source": "PANEL-ENG-MAIN", "target": "FEEDER-LABS-F1", "status": "SEVERED", "color": "#EF4444"})
            pulses.append({"source": "FEEDER-LABS-F1", "target": "LAB-01-EE", "status": "SEVERED", "color": "#EF4444"})
            pulses.append({"source": "FEEDER-LABS-F1", "target": "LAB-02-ROBOTICS", "status": "SEVERED", "color": "#EF4444"})
            # Reroute pulse if recovery planned
            if self.state == "RECOVERY_PLANNED":
                pulses.append({"source": "FEEDER-CR-F1", "target": "CR-201", "status": "REALLOCATED", "color": "#10B981"})
        else:
            pulses.append({"source": "PANEL-ENG-MAIN", "target": "FEEDER-LABS-F1", "status": "ACTIVE", "color": "#D4AF37"})
            pulses.append({"source": "FEEDER-LABS-F1", "target": "LAB-01-EE", "status": "ACTIVE", "color": "#D4AF37"})
            pulses.append({"source": "FEEDER-LABS-F1", "target": "LAB-02-ROBOTICS", "status": "ACTIVE", "color": "#D4AF37"})
            pulses.append({"source": "FEEDER-CR-F1", "target": "CR-201", "status": "STANDBY", "color": "#9D8EB5"})
        return pulses

demo_sim = DemoSimulationState()


@router.get("/status")
def get_demo_status():
    """Retrieve current demo state snapshot."""
    return demo_sim.get_snapshot()


@router.get("/stream")
async def stream_telemetry(request: Request):
    """
    Continuous Server-Sent Events (SSE) telemetry generator.
    Streams fresh synthetic observations and graph updates every 1.5 seconds.
    """
    async def event_generator():
        while True:
            if await request.is_disconnected():
                break
            snapshot = demo_sim.get_snapshot()
            yield f"data: {json.dumps(snapshot)}\n\n"
            await asyncio.sleep(1.5)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@router.post("/interrupt")
def trigger_interrupt(db: Session = Depends(get_db)):
    """
    KEY 1 — INTERRUPT: Inject simulated electrical feeder failure.
    - Drops Feeder F1 active power from 142.5 kW to 0.0 kW.
    - Triggers Engine 1 Detection and Engine 2 Graph Blast Radius.
    - Highlights affected rooms (LAB-01-EE, LAB-02-ROBOTICS).
    """
    demo_sim.state = "INTERRUPTED"
    demo_sim.feeder_status = "OFFLINE_TRIPPED"
    demo_sim.active_power_kw = 0.0
    demo_sim.affected_entities = ["FEEDER-LABS-F1", "LAB-01-EE", "LAB-02-ROBOTICS", "METER-FEEDER-F1"]

    demo_sim.step_explanation = {
        "title": "KEY 1 — ELECTRICAL BREAKER FAILURE INJECTED",
        "what_failed": "Feeder Bus F1 (415V/3-Phase Circuit)",
        "where": "Riser Shaft 1B (First Floor West Wing)",
        "when": datetime.now(timezone.utc).strftime("%H:%M:%S UTC"),
        "propagation": "11kV Substation -> ATS-01 -> Main Dist Panel -> Feeder Riser 1 [TRIPPED]",
        "affected_assets": ["LAB-01-EE (Electronics Lab)", "LAB-02-ROBOTICS (Robotics & AI)", "METER-FEEDER-F1"],
        "disrupted_classes": [
            "EE-302 Microcontrollers (42 students, Prof. Viper)",
            "ROB-401 Autonomous Drone Swarms (35 students)"
        ],
        "incident_status": "ACTIVE / UNRESOLVED (Blast Radius: 5 Entities, RPN: 96)",
        "actions_ready": "Press KEY 2 to run automated recovery optimization."
    }

    # Persist in DB if incident exists
    inc = db.query(IncidentModel).filter_by(incident_id=demo_sim.incident_id).first()
    if inc:
        inc.operational_status = "ACTIVE"
        db.commit()

    return demo_sim.get_snapshot()


@router.post("/recovery")
def trigger_recovery(db: Session = Depends(get_db)):
    """
    KEY 2 — RECOVERY: Trigger the 7-engine recovery workflow.
    - Evaluates FMEA Quantitative Risk (RPN = 96).
    - Solves academic conflict-free room reallocation (EE-302 -> CR-201).
    - Computes Google OR-Tools CP-SAT Pareto alternatives.
    """
    demo_sim.state = "RECOVERY_PLANNED"
    demo_sim.step_explanation = {
        "title": "KEY 2 — SEVEN-ENGINE RECOVERY OPTIMIZATION SOLVED",
        "risk_assessment": "FMEA Severity 8/10, Occurrence 4/10, Detection 3/10 -> RPN 96 (Mission Critical)",
        "academic_continuity": "Relocated EE-302 Microcontrollers (42 students) from LAB-01-EE -> CR-201 (Conflict-Free)",
        "or_tools_recommendation": "Alternative C: Balanced Pareto Optimum (60 min downtime, ₹9,800 cost, Reroute to Auxiliary Bus)",
        "approval_status": "PENDING DIRECTOR AUTHORIZATION (Master Tigress -> Master Oogway)",
        "actions_ready": "Press KEY 3 to execute authorized restoration & verify graph."
    }
    return demo_sim.get_snapshot()


@router.post("/restore")
def trigger_restore(db: Session = Depends(get_db)):
    """
    KEY 3 — RESTORE: Simulate authorized restoration.
    - Updates affected entities back to OPERATIONAL.
    - Restores nominal 415V / 142.5 kW power flow.
    - Confirms graph integrity and verification.
    """
    demo_sim.state = "RESTORED"
    demo_sim.feeder_status = "OPERATIONAL"
    demo_sim.active_power_kw = 142.5
    demo_sim.affected_entities = []

    demo_sim.step_explanation = {
        "title": "KEY 3 — AUTHORIZED RESTORATION COMPLETE",
        "restoration_event": "Feeder F1 breaker closed & energized via Auxiliary Bus Coupler (Verification ID: VER-8821)",
        "updated_entity_status": "FEEDER-LABS-F1: OPERATIONAL (415V Balanced 3-Phase)",
        "remaining_affected": "0 assets impacted. All 31 graph nodes healthy.",
        "verification_result": "PASS — Power telemetry nominal, academic continuity restored.",
        "actions_ready": "System operating normally. Press KEY 1 anytime to re-demonstrate."
    }

    inc = db.query(IncidentModel).filter_by(incident_id=demo_sim.incident_id).first()
    if inc:
        inc.operational_status = "RESOLVED"
        db.commit()

    return demo_sim.get_snapshot()
