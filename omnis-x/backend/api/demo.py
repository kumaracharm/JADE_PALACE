"""
OMNIS-X — Centralized Global Synthetic Telemetry Streamer & Scenario Controller.
Publishes a single, synchronized 1-second Server-Sent Events (SSE) telemetry stream
to all connected client workspaces (Command: 3000, Twin: 3001, Response: 3002).
"""
import asyncio
import json
import math
import random
from datetime import datetime, timezone
from typing import Dict, Any, List, Set, Optional
from fastapi import APIRouter, Request, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.incident import IncidentModel

router = APIRouter(prefix="/demo", tags=["Global Telemetry Stream & Demo Controls"])


class GlobalTelemetryBroadcaster:
    """
    Single-instance, single-producer synthetic telemetry engine.
    Produces exactly one tick per second with a shared monotonic sequence number.
    Broadcasting is safe across multiple browser tabs and ports.
    """
    def __init__(self):
        self.subscribers: Set[asyncio.Queue] = set()
        self._lock = asyncio.Lock()
        self.producer_task: Optional[asyncio.Task] = None
        self.sequence: int = 1000

        # Operational Scenario State: "NORMAL" | "FEEDER_FAILURE" | "RECOVERY_PLANNED" | "RESTORED"
        self.scenario: str = "NORMAL"
        self.feeder_status: str = "OPERATIONAL"
        self.incident_id: str = "INC-DEMO-01"
        self.affected_entities: List[str] = []

        # Physics Simulation State
        self.target_kw: float = 142.5
        self.current_kw: float = 142.5
        self.base_voltage: float = 415.0
        self.power_factor: float = 0.95

        # Latest global state snapshot
        self.latest_event: Dict[str, Any] = self._generate_tick_event()

    def _generate_tick_event(self) -> Dict[str, Any]:
        self.sequence += 1
        now_iso = datetime.now(timezone.utc).isoformat()
        t = self.sequence * 1.0

        if self.scenario in ["FEEDER_FAILURE", "INTERRUPTED", "RECOVERY_PLANNED"]:
            # Rapid collapse to 0
            self.current_kw = max(0.0, self.current_kw * 0.2 + random.gauss(0.0, 0.1))
            voltage = 0.0
            current_a = 0.0
            temp = round(28.4 + 1.2 * math.sin(t * 0.05) + random.gauss(0, 0.2), 1)
            status = "OFFLINE_TRIPPED"
            latency = round(45.0 + random.uniform(5.0, 15.0), 1)
            loss = round(4.5 + random.uniform(1.0, 2.5), 1)
            pressure = 3.12
            active_anomalies = 3
        else:
            # Nominal operation: smooth diurnal cycle + minor white noise
            self.target_kw = 142.5 + 4.0 * math.sin(t * 0.08)
            self.current_kw = round(self.target_kw + random.gauss(0, 1.2), 1)
            voltage = round(self.base_voltage + 1.5 * math.sin(t * 0.05) + random.gauss(0, 0.6), 1)
            # Physical Law: I = P / (V * sqrt(3) * PF)
            current_a = round((self.current_kw * 1000.0) / (voltage * math.sqrt(3) * self.power_factor), 1)
            temp = round(23.2 + 0.5 * math.sin(t * 0.02) + random.gauss(0, 0.15), 1)
            status = "OPERATIONAL"
            latency = round(4.8 + random.gauss(0, 0.2), 1)
            loss = 0.0
            pressure = round(3.42 + random.gauss(0, 0.02), 2)
            active_anomalies = 0

        explanation = self._build_explanation(active_anomalies)
        pulses = self._build_pulses()

        return {
            "sequence": self.sequence,
            "timestamp": now_iso,
            "source": "SYNTHETIC LIVE DATA",
            "scenario": self.scenario,
            "entity_id": "FEEDER-LABS-F1",
            "voltage_v": voltage,
            "current_a": current_a,
            "active_power_kw": self.current_kw,
            "temperature_c": temp,
            "network_latency_ms": latency,
            "packet_loss_pct": loss,
            "water_pressure": pressure,
            "status": status,
            "incident_id": self.incident_id,
            # Backward-compatibility fields for existing Command & Twin UI
            "event_id": f"EVT-SYNTH-{self.sequence}",
            "provenance": "SYNTHETIC LIVE DATA",
            "telemetry": {
                "voltage_v": voltage,
                "active_power_kw": self.current_kw,
                "current_a": current_a,
                "temperature_c": temp,
                "frequency_hz": round(50.0 + random.gauss(0, 0.03), 2),
                "network_latency_ms": latency,
                "packet_loss_pct": loss,
                "water_pressure": pressure,
            },
            "feeder_status": status,
            "affected_entities": self.affected_entities,
            "demo_state": self.scenario,
            "explanation": explanation,
            "active_pulses": pulses,
        }

    def _build_explanation(self, active_anomalies: int) -> Dict[str, Any]:
        if self.scenario in ["FEEDER_FAILURE", "INTERRUPTED"]:
            return {
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
                "incident_status": f"ACTIVE / UNRESOLVED (Blast Radius: 5 Entities, RPN: 96, Seq #{self.sequence})",
                "actions_ready": "Press KEY 2 to run automated recovery optimization."
            }
        elif self.scenario == "RECOVERY_PLANNED":
            return {
                "title": "KEY 2 — SEVEN-ENGINE RECOVERY OPTIMIZATION SOLVED",
                "risk_assessment": "FMEA Severity 8/10, Occurrence 4/10, Detection 3/10 -> RPN 96 (Mission Critical)",
                "academic_continuity": "Relocated EE-302 Microcontrollers (42 students) from LAB-01-EE -> CR-201 (Conflict-Free)",
                "or_tools_recommendation": "Alternative C: Balanced Pareto Optimum (60 min downtime, ₹9,800 cost, Reroute to Auxiliary Bus)",
                "approval_status": "PENDING DIRECTOR AUTHORIZATION (Master Tigress -> Master Oogway)",
                "actions_ready": "Press KEY 3 to execute authorized restoration & verify graph."
            }
        elif self.scenario == "RESTORED":
            return {
                "title": "KEY 3 — AUTHORIZED RESTORATION COMPLETE",
                "restoration_event": "Feeder F1 breaker closed & energized via Auxiliary Bus Coupler (Verification ID: VER-8821)",
                "updated_entity_status": "FEEDER-LABS-F1: OPERATIONAL (415V Balanced 3-Phase)",
                "remaining_affected": "0 assets impacted. All 31 graph nodes healthy.",
                "verification_result": "PASS — Power telemetry nominal, academic continuity restored.",
                "actions_ready": "System operating normally. Press KEY 1 anytime to re-demonstrate."
            }
        return {
            "title": "NORMAL OPERATIONAL BASELINE",
            "message": "Continuous synthetic telemetry fluctuating within nominal engineering tolerance.",
            "metrics": {
                "power_load": f"{self.current_kw:.1f} kW",
                "voltage": f"{self.base_voltage:.1f} V",
                "active_anomalies": active_anomalies,
                "sequence": self.sequence,
            }
        }

    def _build_pulses(self) -> List[Dict[str, Any]]:
        is_cut = self.scenario in ["FEEDER_FAILURE", "INTERRUPTED", "RECOVERY_PLANNED"]
        pulses = [
            {"source": "GEN-500KVA", "target": "ATS-01", "status": "STANDBY", "color": "#9D8EB5"},
            {"source": "SUBSTATION-01", "target": "ATS-01", "status": "ACTIVE", "color": "#D4AF37"},
            {"source": "ATS-01", "target": "PANEL-ENG-MAIN", "status": "ACTIVE", "color": "#D4AF37"},
            {"source": "PANEL-ENG-MAIN", "target": "FEEDER-CR-F1", "status": "ACTIVE", "color": "#D4AF37"},
            {"source": "FEEDER-CR-F1", "target": "CR-101", "status": "ACTIVE", "color": "#D4AF37"},
            {"source": "PANEL-ENG-MAIN", "target": "SRV-01", "status": "ACTIVE", "color": "#D4AF37"},
        ]
        if is_cut:
            pulses.append({"source": "PANEL-ENG-MAIN", "target": "FEEDER-LABS-F1", "status": "SEVERED", "color": "#EF4444"})
            pulses.append({"source": "FEEDER-LABS-F1", "target": "LAB-01-EE", "status": "SEVERED", "color": "#EF4444"})
            pulses.append({"source": "FEEDER-LABS-F1", "target": "LAB-02-ROBOTICS", "status": "SEVERED", "color": "#EF4444"})
            if self.scenario == "RECOVERY_PLANNED":
                pulses.append({"source": "FEEDER-CR-F1", "target": "CR-201", "status": "REALLOCATED", "color": "#10B981"})
        else:
            pulses.append({"source": "PANEL-ENG-MAIN", "target": "FEEDER-LABS-F1", "status": "ACTIVE", "color": "#D4AF37"})
            pulses.append({"source": "FEEDER-LABS-F1", "target": "LAB-01-EE", "status": "ACTIVE", "color": "#D4AF37"})
            pulses.append({"source": "FEEDER-LABS-F1", "target": "LAB-02-ROBOTICS", "status": "ACTIVE", "color": "#D4AF37"})
            pulses.append({"source": "FEEDER-CR-F1", "target": "CR-201", "status": "STANDBY", "color": "#9D8EB5"})
        return pulses

    async def broadcast_loop(self):
        """Infinite 1-second global producer loop."""
        while True:
            try:
                await asyncio.sleep(1.0)
                event = self._generate_tick_event()
                self.latest_event = event

                # Broadcast to all active client queues
                dead_queues = []
                for q in list(self.subscribers):
                    try:
                        if q.full():
                            try:
                                q.get_nowait()
                            except asyncio.QueueEmpty:
                                pass
                        q.put_nowait(event)
                    except Exception:
                        dead_queues.append(q)

                for dq in dead_queues:
                    self.subscribers.discard(dq)
            except asyncio.CancelledError:
                break
            except Exception as exc:
                print(f"[TelemetryBroadcaster] Error in loop: {exc}")
                await asyncio.sleep(1.0)

    def ensure_producer(self):
        """Ensures the background loop is actively ticking."""
        if self.producer_task is None or self.producer_task.done():
            try:
                loop = asyncio.get_running_loop()
                self.producer_task = loop.create_task(self.broadcast_loop())
            except RuntimeError:
                pass


broadcaster = GlobalTelemetryBroadcaster()


# ---------------------------------------------------------------------------
# API ROUTE HANDLERS
# ---------------------------------------------------------------------------

@router.get("/state")
@router.get("/status")
async def get_global_telemetry_state():
    """Returns the latest in-memory global telemetry event."""
    broadcaster.ensure_producer()
    return broadcaster.latest_event


@router.get("/stream")
async def stream_global_telemetry(request: Request):
    """
    Centralized SSE broadcast endpoint.
    All connected clients receive the exact same sequence-stamped events every second.
    """
    broadcaster.ensure_producer()
    queue = asyncio.Queue(maxsize=30)
    broadcaster.subscribers.add(queue)

    # Immediately push latest state to the newly connected client
    try:
        queue.put_nowait(broadcaster.latest_event)
    except Exception:
        pass

    async def event_generator():
        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    # Wait up to 15s for next event or send heartbeat
                    event = await asyncio.wait_for(queue.get(), timeout=15.0)
                    # Support both standard data format and named telemetry event
                    yield f"id: {event.get('sequence')}\nevent: telemetry\ndata: {json.dumps(event)}\n\n"
                    # Also emit raw data format for EventSource.onmessage default listeners
                    yield f"data: {json.dumps(event)}\n\n"
                except asyncio.TimeoutError:
                    # SSE keep-alive heartbeat comment
                    yield ": heartbeat\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            broadcaster.subscribers.discard(queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
        }
    )


@router.post("/scenario/start")
@router.post("/interrupt")
def scenario_start(db: Session = Depends(get_db)):
    """
    Injects the electrical sub-feeder failure scenario.
    All clients receive the failure state on the very next 1-second tick.
    """
    broadcaster.scenario = "FEEDER_FAILURE"
    broadcaster.feeder_status = "OFFLINE_TRIPPED"
    broadcaster.affected_entities = ["FEEDER-LABS-F1", "LAB-01-EE", "LAB-02-ROBOTICS", "METER-FEEDER-F1"]

    # Persist incident state change to SQLite
    inc = db.query(IncidentModel).filter_by(incident_id=broadcaster.incident_id).first()
    if inc:
        inc.status = "CONFIRMED"
        db.commit()

    # Immediate tick generation
    return broadcaster._generate_tick_event()


@router.post("/scenario/stop")
@router.post("/scenario/restore")
@router.post("/restore")
def scenario_restore(db: Session = Depends(get_db)):
    """
    Restores the electrical feeder to nominal operation.
    """
    broadcaster.scenario = "RESTORED"
    broadcaster.feeder_status = "OPERATIONAL"
    broadcaster.current_kw = 142.5
    broadcaster.affected_entities = []

    inc = db.query(IncidentModel).filter_by(incident_id=broadcaster.incident_id).first()
    if inc:
        inc.status = "RESOLVED"
        db.commit()

    return broadcaster._generate_tick_event()


@router.post("/recovery")
def scenario_recovery():
    """
    Triggers recovery plan state (OR-Tools alternative C + room reallocation).
    """
    broadcaster.scenario = "RECOVERY_PLANNED"
    return broadcaster._generate_tick_event()
