"""
OMNIS-X — Centralized Global Synthetic Telemetry Streamer & Multi-Scenario Controller.
Publishes a single, synchronized 1-second Server-Sent Events (SSE) telemetry stream
to all connected client workspaces (Command: 3000, Twin: 3001, Response: 3002).

Supports 5 Controlled Incident Scenarios:
1. ELECTRICAL: Feeder Bus F1 Electrical Failure & Voltage Collapse
2. WATER: Building Plumbing Intake Pressure Loss
3. HVAC: MDF Datacenter & GPU Cluster Thermal Runaway
4. NETWORK: Core Switch OM4 Fiber Trunk Latency & Packet Drop
5. ACADEMIC: Student-Reported Classroom Availability & Lecture Conflict

Includes Historical Incident Event Replay Engine (Innovation).
"""
import asyncio
import json
import math
import random
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Set, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.incident import IncidentModel, IncidentEntityModel
from backend.security.auth import get_current_user, require_roles
from backend.models.user import UserModel
from backend.schemas.common import RoleEnum

router = APIRouter(prefix="/demo", tags=["Global Telemetry Stream & Demo Controls"])


# ---------------------------------------------------------------------------
# SCENARIOS CATALOG & REPLAY DEFINITIONS
# ---------------------------------------------------------------------------

SCENARIOS_CONFIG: Dict[str, Dict[str, Any]] = {
    "ELECTRICAL": {
        "key": "ELECTRICAL",
        "name": "Electrical Feeder Failure",
        "incident_id": "INC-ELEC-01",
        "root_entity_id": "FEEDER-LABS-F1",
        "title": "Feeder Bus F1 Electrical Breaker Trip & Voltage Collapse",
        "description": "Progressive 3-phase voltage decrease and complete power failure on Riser Shaft 1B feeding Level 1 engineering laboratories.",
        "category": "ELECTRICAL",
        "priority": "HIGH",
        "affected_entities": ["FEEDER-LABS-F1", "LAB-01-EE", "LAB-02-ROBOTICS", "METER-FEEDER-F1"],
        "academic_impact": "Disrupts EE301 Microcontrollers (32 students, Dr. Kavita Sharma) and AI401 Robotics Lab.",
        "recovery_recommendation": "OR-Tools Pareto Plan: Reroute to Auxiliary Transformer Coupler via ATS-01. Relocate EE301 practical lab to CR-201. Dispatch Senior Electrical Tech (R. Patel).",
        "estimated_downtime": "45-60 min",
    },
    "WATER": {
        "key": "WATER",
        "name": "Water Supply Disruption",
        "incident_id": "INC-WATER-02",
        "root_entity_id": "BLDG-ENG",
        "title": "Engineering Block Central Plumbing Pressure Collapse",
        "description": "Main municipal intake pressure loss and booster pump cavitation causing progressive pressure drop across Building Engineering plumbing risers.",
        "category": "FACILITIES",
        "priority": "HIGH",
        "affected_entities": ["BLDG-ENG", "LAB-01-EE", "CAMPUS-MAIN"],
        "academic_impact": "Wet chemistry & fabrication safety eyewash stations in LAB-01-EE non-compliant; research autoclaves halted.",
        "recovery_recommendation": "Activate Auxiliary Overhead Reservoir Tank TK-02 (25,000L gravity feed); isolate booster suction valve and dispatch Facility Team (M. Bennett).",
        "estimated_downtime": "30-45 min",
    },
    "HVAC": {
        "key": "HVAC",
        "name": "HVAC Thermal Runaway",
        "incident_id": "INC-HVAC-03",
        "root_entity_id": "ROOM-MDF",
        "title": "MDF Datacenter & GPU Cluster In-Row Precision Chiller Failure",
        "description": "Coolant valve actuator failure in CRAC-01 unit causing thermal runaway, rack inlet temperature breach (>40°C), and GPU compute thermal throttling.",
        "category": "ENVIRONMENTAL",
        "priority": "MISSION_CRITICAL",
        "affected_entities": ["ROOM-MDF", "EQ-GPU-CLUSTER", "LAB-02-ROBOTICS"],
        "academic_impact": "AI401 Autonomous Systems & Computer Vision Lab GPU compute nodes suspended; deep learning jobs frozen.",
        "recovery_recommendation": "Emergency thermal load shedding on secondary compute nodes, engage CRAC-02 backup refrigerant loop, open emergency exhaust baffles.",
        "estimated_downtime": "20-30 min",
    },
    "NETWORK": {
        "key": "NETWORK",
        "name": "IT Network Outage",
        "incident_id": "INC-NET-04",
        "root_entity_id": "SW-MDF-CORE",
        "title": "Core Aggregation Switch OM4 Fiber Trunk Degradation",
        "description": "Optical fiber transceiver degraded causing excessive jitter, 48% packet loss, and high latency (>750ms) across L1/L2 access switches.",
        "category": "IT",
        "priority": "HIGH",
        "affected_entities": ["SW-MDF-CORE", "SW-IDF-F1", "LAB-03-COMP", "ROOM-MDF"],
        "academic_impact": "CS201 Online compiler & LAB-03 student network sessions disconnected; intranet LMS unreachable.",
        "recovery_recommendation": "Automated failover to secondary redundant 10Gbps OM4 ring trunk (SW-IDF-F2), flush ARP caches, notify IT Lead (S. Lin).",
        "estimated_downtime": "15-25 min",
    },
    "ACADEMIC": {
        "key": "ACADEMIC",
        "name": "Academic Disruption",
        "incident_id": "INC-ACAD-05",
        "root_entity_id": "CR-201",
        "title": "Classroom CR-201 Audio-Visual & Teacher Availability Conflict",
        "description": "Student-reported smart classroom fault: Main 4K interactive projector interface offline and room capacity conflict for CS201 Data Structures lecture.",
        "category": "ACADEMIC",
        "priority": "MEDIUM",
        "affected_entities": ["CR-201", "ACT-CS201-LEC", "EQ-PROJ-CR201"],
        "academic_impact": "55 enrolled students in CS201 Data Structures (Prof. Rajesh Kumar) unable to view core theory slides.",
        "recovery_recommendation": "Automated Room Re-allocation Protocol: Relocate 55 students to Smart Classroom CR-202 (capacity 60, projector operational) with 0 timetable conflict.",
        "estimated_downtime": "10-15 min (Zero Academic Loss)",
    },
}

# 8 Chronological Stored Replay Steps for Innovation Replay Panel
REPLAY_STEPS_CATALOG: Dict[str, List[Dict[str, Any]]] = {
    "INC-ELEC-01": [
        {
            "step": 1,
            "stage": "BASELINE_MONITORING",
            "time_offset": "00:00:00",
            "from_status": "OPERATIONAL",
            "to_status": "OPERATIONAL",
            "metrics": {"voltage_v": 415.2, "current_a": 198.4, "active_power_kw": 142.5, "temp_c": 22.8, "latency_ms": 4.8, "loss_pct": 0.0, "pressure_bar": 3.42},
            "action": "Continuous baseline monitoring: Feeder F1 balanced 3-phase supply within nominal engineering tolerance.",
            "actor": "Autonomous Telemetry Ingestor",
            "affected_entities": [],
        },
        {
            "step": 2,
            "stage": "ANOMALY_DETECTION",
            "time_offset": "00:00:14",
            "from_status": "OPERATIONAL",
            "to_status": "WARNING",
            "metrics": {"voltage_v": 320.0, "current_a": 135.0, "active_power_kw": 88.0, "temp_c": 24.5, "latency_ms": 6.2, "loss_pct": 0.0, "pressure_bar": 3.40},
            "action": "EWMA anomaly detector triggered: Voltage sag detected on phase B (>3.5 sigma threshold breach).",
            "actor": "Engine 1: EWMA Detection Engine",
            "affected_entities": ["FEEDER-LABS-F1"],
        },
        {
            "step": 3,
            "stage": "BREAKER_TRIP_FAILURE",
            "time_offset": "00:00:26",
            "from_status": "WARNING",
            "to_status": "CRITICAL_TRIPPED",
            "metrics": {"voltage_v": 0.0, "current_a": 0.0, "active_power_kw": 0.0, "temp_c": 27.2, "latency_ms": 38.0, "loss_pct": 3.2, "pressure_bar": 3.38},
            "action": "Circuit breaker MCCB-400A tripped on Riser Shaft 1B: Complete power collapse to First Floor labs.",
            "actor": "Physical Plant Switchgear Telemetry",
            "affected_entities": ["FEEDER-LABS-F1", "LAB-01-EE", "LAB-02-ROBOTICS", "METER-FEEDER-F1"],
        },
        {
            "step": 4,
            "stage": "BLAST_RADIUS_TRAVERSAL",
            "time_offset": "00:00:38",
            "from_status": "CRITICAL_TRIPPED",
            "to_status": "ANALYZING",
            "metrics": {"voltage_v": 0.0, "current_a": 0.0, "active_power_kw": 0.0, "temp_c": 27.5, "latency_ms": 42.0, "loss_pct": 4.1, "pressure_bar": 3.39},
            "action": "NetworkX BFS traversal completed in 3.8ms: 4 dependent assets identified. Lab 01 has zero redundancy (SPOF).",
            "actor": "Engine 2: Graph Cascade Propagation",
            "affected_entities": ["FEEDER-LABS-F1", "LAB-01-EE", "LAB-02-ROBOTICS", "METER-FEEDER-F1"],
        },
        {
            "step": 5,
            "stage": "FMEA_RISK_ASSESSMENT",
            "time_offset": "00:00:52",
            "from_status": "ANALYZING",
            "to_status": "AWAITING_APPROVAL",
            "metrics": {"voltage_v": 0.0, "current_a": 0.0, "active_power_kw": 0.0, "temp_c": 28.0, "latency_ms": 44.5, "loss_pct": 4.5, "pressure_bar": 3.40},
            "action": "FMEA risk calculated: Severity 8, Occurrence 4, Detection 3 -> RPN 96. Tier: MISSION_CRITICAL.",
            "actor": "Engine 3: FMEA Risk Engine",
            "affected_entities": ["FEEDER-LABS-F1", "LAB-01-EE", "LAB-02-ROBOTICS"],
        },
        {
            "step": 6,
            "stage": "ACADEMIC_OR_TOOLS_SOLVER",
            "time_offset": "00:01:10",
            "from_status": "AWAITING_APPROVAL",
            "to_status": "RECOMMENDATION_READY",
            "metrics": {"voltage_v": 0.0, "current_a": 0.0, "active_power_kw": 0.0, "temp_c": 28.2, "latency_ms": 45.0, "loss_pct": 4.5, "pressure_bar": 3.41},
            "action": "OR-Tools CP-SAT generated Pareto Alternative C: Reroute via Auxiliary Bus Coupler. Relocate EE301 to CR-201.",
            "actor": "Engine 4 & 5: Academic & OR-Tools Solver",
            "affected_entities": ["FEEDER-LABS-F1", "LAB-01-EE"],
        },
        {
            "step": 7,
            "stage": "WORK_ORDER_DISPATCH",
            "time_offset": "00:01:32",
            "from_status": "RECOMMENDATION_READY",
            "to_status": "IN_PROGRESS",
            "metrics": {"voltage_v": 110.0, "current_a": 35.0, "active_power_kw": 22.0, "temp_c": 26.5, "latency_ms": 25.0, "loss_pct": 1.2, "pressure_bar": 3.41},
            "action": "Work order WO-882194 dispatched to Senior Electrical Tech Rajesh Patel. Auxiliary tie-in initiated.",
            "actor": "Engine 6 & 7: RACI Dispatch & Principal Authorization",
            "affected_entities": ["FEEDER-LABS-F1"],
        },
        {
            "step": 8,
            "stage": "ZERO_FAULT_RESTORED",
            "time_offset": "00:02:15",
            "from_status": "IN_PROGRESS",
            "to_status": "RESOLVED",
            "metrics": {"voltage_v": 415.5, "current_a": 199.2, "active_power_kw": 143.0, "temp_c": 23.0, "latency_ms": 4.7, "loss_pct": 0.0, "pressure_bar": 3.42},
            "action": "Verification closed-loop passed: Feeder energized, 31 nodes nominal, EE301 class confirmed in session.",
            "actor": "Verification Gatekeeper",
            "affected_entities": [],
        },
    ],
    "INC-WATER-02": [
        {
            "step": 1,
            "stage": "BASELINE_MONITORING",
            "time_offset": "00:00:00",
            "from_status": "OPERATIONAL",
            "to_status": "OPERATIONAL",
            "metrics": {"voltage_v": 415.0, "current_a": 198.0, "active_power_kw": 142.5, "temp_c": 22.8, "latency_ms": 4.8, "loss_pct": 0.0, "pressure_bar": 3.42},
            "action": "Plumbing flow normal: Municipal booster line operating at 3.42 bar.",
            "actor": "Plumbing SCADA Transducer",
            "affected_entities": [],
        },
        {
            "step": 2,
            "stage": "PRESSURE_SAG_DETECTED",
            "time_offset": "00:00:12",
            "from_status": "OPERATIONAL",
            "to_status": "WARNING",
            "metrics": {"voltage_v": 415.0, "current_a": 198.0, "active_power_kw": 142.5, "temp_c": 22.9, "latency_ms": 4.9, "loss_pct": 0.0, "pressure_bar": 1.95},
            "action": "Booster pump cavitation detected: Main riser line pressure dropped below 2.0 bar threshold.",
            "actor": "Facilities Telemetry Engine",
            "affected_entities": ["BLDG-ENG"],
        },
        {
            "step": 3,
            "stage": "PRESSURE_COLLAPSE",
            "time_offset": "00:00:25",
            "from_status": "WARNING",
            "to_status": "DEGRADED",
            "metrics": {"voltage_v": 415.0, "current_a": 198.0, "active_power_kw": 142.5, "temp_c": 23.0, "latency_ms": 4.8, "loss_pct": 0.0, "pressure_bar": 0.35},
            "action": "Severe pressure collapse (0.35 bar): Safety eyewash stations in EE Lab and central restrooms dry.",
            "actor": "Facility Alarm Monitor",
            "affected_entities": ["BLDG-ENG", "LAB-01-EE", "CAMPUS-MAIN"],
        },
        {
            "step": 4,
            "stage": "IMPACT_ANALYSIS",
            "time_offset": "00:00:40",
            "from_status": "DEGRADED",
            "to_status": "ANALYZING",
            "metrics": {"voltage_v": 415.0, "current_a": 198.0, "active_power_kw": 142.5, "temp_c": 23.1, "latency_ms": 4.8, "loss_pct": 0.0, "pressure_bar": 0.35},
            "action": "Campus facility audit: Autoclaves in Lab 01 locked out; building restrooms non-compliant with OSHA.",
            "actor": "Engine 2: Infrastructure Propagation",
            "affected_entities": ["BLDG-ENG", "LAB-01-EE"],
        },
        {
            "step": 5,
            "stage": "FMEA_AND_RESERVOIR_SOLVER",
            "time_offset": "00:00:58",
            "from_status": "ANALYZING",
            "to_status": "RECOMMENDATION_READY",
            "metrics": {"voltage_v": 415.0, "current_a": 198.0, "active_power_kw": 142.5, "temp_c": 23.1, "latency_ms": 4.8, "loss_pct": 0.0, "pressure_bar": 0.40},
            "action": "Recovery plan ready: Engage Auxiliary Overhead Reservoir Tank TK-02 (25,000L capacity, 2.8 bar gravity head).",
            "actor": "Engine 5: Facilities Recovery Engine",
            "affected_entities": ["BLDG-ENG"],
        },
        {
            "step": 6,
            "stage": "VALVE_DISPATCH_AUTHORIZATION",
            "time_offset": "00:01:20",
            "from_status": "RECOMMENDATION_READY",
            "to_status": "IN_PROGRESS",
            "metrics": {"voltage_v": 415.0, "current_a": 198.0, "active_power_kw": 142.5, "temp_c": 23.0, "latency_ms": 4.8, "loss_pct": 0.0, "pressure_bar": 1.45},
            "action": "Director approved bypass: Automated valve AV-04 opened; gravity reservoir feed pressurized.",
            "actor": "Facility Manager (M. Bennett)",
            "affected_entities": ["BLDG-ENG"],
        },
        {
            "step": 7,
            "stage": "RESTORED",
            "time_offset": "00:01:50",
            "from_status": "IN_PROGRESS",
            "to_status": "RESOLVED",
            "metrics": {"voltage_v": 415.0, "current_a": 198.0, "active_power_kw": 142.5, "temp_c": 22.8, "latency_ms": 4.8, "loss_pct": 0.0, "pressure_bar": 3.38},
            "action": "Full nominal pressure restored (3.38 bar): Eyewash units certified compliant.",
            "actor": "Facility Directorate Verification",
            "affected_entities": [],
        },
    ],
    "INC-HVAC-03": [
        {
            "step": 1,
            "stage": "BASELINE_MONITORING",
            "time_offset": "00:00:00",
            "from_status": "OPERATIONAL",
            "to_status": "OPERATIONAL",
            "metrics": {"voltage_v": 415.0, "current_a": 198.0, "active_power_kw": 142.5, "temp_c": 20.2, "latency_ms": 4.8, "loss_pct": 0.0, "pressure_bar": 3.42},
            "action": "Datacenter cold aisle temperature at 20.2°C; precision in-row chillers running at 62% duty cycle.",
            "actor": "BMS Sensor Network",
            "affected_entities": [],
        },
        {
            "step": 2,
            "stage": "THERMAL_WARNING",
            "time_offset": "00:00:15",
            "from_status": "OPERATIONAL",
            "to_status": "WARNING",
            "metrics": {"voltage_v": 414.8, "current_a": 205.0, "active_power_kw": 148.0, "temp_c": 29.8, "latency_ms": 5.4, "loss_pct": 0.0, "pressure_bar": 3.42},
            "action": "Thermal threshold warning: CRAC-01 unit compressor valve stuck; inlet temperature crossed 28°C.",
            "actor": "Engine 1: Environmental Anomaly Detector",
            "affected_entities": ["ROOM-MDF"],
        },
        {
            "step": 3,
            "stage": "CRITICAL_RUNAWAY",
            "time_offset": "00:00:30",
            "from_status": "WARNING",
            "to_status": "CRITICAL",
            "metrics": {"voltage_v": 414.2, "current_a": 218.0, "active_power_kw": 158.0, "temp_c": 42.8, "latency_ms": 12.0, "loss_pct": 0.5, "pressure_bar": 3.41},
            "action": "Critical thermal breach: MDF rack inlet exceeded 42°C. NVIDIA GPU nodes throttling clock speeds by 50%.",
            "actor": "Hardware Health Watchdog",
            "affected_entities": ["ROOM-MDF", "EQ-GPU-CLUSTER", "LAB-02-ROBOTICS"],
        },
        {
            "step": 4,
            "stage": "EMERGENCY_SHEDDING",
            "time_offset": "00:00:48",
            "from_status": "CRITICAL",
            "to_status": "IN_PROGRESS",
            "metrics": {"voltage_v": 414.5, "current_a": 192.0, "active_power_kw": 136.0, "temp_c": 36.5, "latency_ms": 8.0, "loss_pct": 0.1, "pressure_bar": 3.42},
            "action": "Emergency mitigation executed: Non-essential training jobs suspended; backup CRAC-02 chiller engaged.",
            "actor": "Automated IT BMS Controller",
            "affected_entities": ["ROOM-MDF"],
        },
        {
            "step": 5,
            "stage": "THERMAL_STABILIZED",
            "time_offset": "00:01:30",
            "from_status": "IN_PROGRESS",
            "to_status": "RESOLVED",
            "metrics": {"voltage_v": 415.0, "current_a": 197.5, "active_power_kw": 142.0, "temp_c": 21.4, "latency_ms": 4.8, "loss_pct": 0.0, "pressure_bar": 3.42},
            "action": "Rack temperature normalized to 21.4°C; GPU cluster returned to 100% compute capacity.",
            "actor": "Facility & IT Verification",
            "affected_entities": [],
        },
    ],
    "INC-NET-04": [
        {
            "step": 1,
            "stage": "BASELINE_MONITORING",
            "time_offset": "00:00:00",
            "from_status": "OPERATIONAL",
            "to_status": "OPERATIONAL",
            "metrics": {"voltage_v": 415.0, "current_a": 198.0, "active_power_kw": 142.5, "temp_c": 22.8, "latency_ms": 4.8, "loss_pct": 0.0, "pressure_bar": 3.42},
            "action": "Core switch 40GbE trunk latency stable at 4.8ms, packet loss 0.00%.",
            "actor": "SNMP Network Telemetry Engine",
            "affected_entities": [],
        },
        {
            "step": 2,
            "stage": "JITTER_AND_LOSS",
            "time_offset": "00:00:15",
            "from_status": "OPERATIONAL",
            "to_status": "WARNING",
            "metrics": {"voltage_v": 415.0, "current_a": 198.0, "active_power_kw": 142.5, "temp_c": 22.8, "latency_ms": 115.0, "loss_pct": 14.5, "pressure_bar": 3.42},
            "action": "Optical trunk degradation: OM4 fiber transceiver reporting excessive bit error rate and frame drops.",
            "actor": "Core Switch Syslog Engine",
            "affected_entities": ["SW-MDF-CORE"],
        },
        {
            "step": 3,
            "stage": "SEVERE_OUTAGE",
            "time_offset": "00:00:32",
            "from_status": "WARNING",
            "to_status": "DEGRADED",
            "metrics": {"voltage_v": 415.0, "current_a": 198.0, "active_power_kw": 142.5, "temp_c": 22.8, "latency_ms": 820.0, "loss_pct": 48.2, "pressure_bar": 3.42},
            "action": "Severe network degradation (820ms, 48% loss): Lab 03 computing labs and classroom smartboards disconnected.",
            "actor": "Campus Network NOC",
            "affected_entities": ["SW-MDF-CORE", "SW-IDF-F1", "LAB-03-COMP", "ROOM-MDF"],
        },
        {
            "step": 4,
            "stage": "TRUNK_FAILOVER_DISPATCH",
            "time_offset": "00:00:55",
            "from_status": "DEGRADED",
            "to_status": "IN_PROGRESS",
            "metrics": {"voltage_v": 415.0, "current_a": 198.0, "active_power_kw": 142.5, "temp_c": 22.8, "latency_ms": 32.0, "loss_pct": 2.1, "pressure_bar": 3.42},
            "action": "Spanning-tree failover triggered: Traffic routed through secondary redundant 10Gbps ring (SW-IDF-F2).",
            "actor": "IT Network Admin (Sarah Lin)",
            "affected_entities": ["SW-MDF-CORE"],
        },
        {
            "step": 5,
            "stage": "RESTORED",
            "time_offset": "00:01:25",
            "from_status": "IN_PROGRESS",
            "to_status": "RESOLVED",
            "metrics": {"voltage_v": 415.0, "current_a": 198.0, "active_power_kw": 142.5, "temp_c": 22.8, "latency_ms": 5.1, "loss_pct": 0.0, "pressure_bar": 3.42},
            "action": "Transceiver reset complete; fiber optic power levels calibrated at -3.2 dBm. Zero packet loss.",
            "actor": "NOC Verification",
            "affected_entities": [],
        },
    ],
    "INC-ACAD-05": [
        {
            "step": 1,
            "stage": "BASELINE_TIMETABLE",
            "time_offset": "00:00:00",
            "from_status": "OPERATIONAL",
            "to_status": "OPERATIONAL",
            "metrics": {"voltage_v": 415.0, "current_a": 198.0, "active_power_kw": 142.5, "temp_c": 22.8, "latency_ms": 4.8, "loss_pct": 0.0, "pressure_bar": 3.42},
            "action": "Academic timetable normal: CS201 Data Structures lecture scheduled in Smart Classroom 201 (55 students).",
            "actor": "Registrar Timetable System",
            "affected_entities": [],
        },
        {
            "step": 2,
            "stage": "STUDENT_GRIEVANCE_FILED",
            "time_offset": "00:00:10",
            "from_status": "OPERATIONAL",
            "to_status": "REPORTED",
            "metrics": {"voltage_v": 415.0, "current_a": 198.0, "active_power_kw": 142.5, "temp_c": 22.8, "latency_ms": 4.8, "loss_pct": 0.0, "pressure_bar": 3.42},
            "action": "Student report submitted via Oogway PWA: Projector HDMI display broken and HVAC rattle in Room 201.",
            "actor": "Student Priya Verma (USR-STUDENT-01)",
            "affected_entities": ["CR-201"],
        },
        {
            "step": 3,
            "stage": "ROOM_CONFLICT_CONFIRMED",
            "time_offset": "00:00:22",
            "from_status": "REPORTED",
            "to_status": "ANALYZING",
            "metrics": {"voltage_v": 415.0, "current_a": 198.0, "active_power_kw": 142.5, "temp_c": 22.8, "latency_ms": 4.8, "loss_pct": 0.0, "pressure_bar": 3.42},
            "action": "Engine 4 confirmed conflict: 55 students in session ACT-CS201-LEC displaced without functional display.",
            "actor": "Engine 4: Academic Continuity Engine",
            "affected_entities": ["CR-201", "ACT-CS201-LEC", "EQ-PROJ-CR201"],
        },
        {
            "step": 4,
            "stage": "ALTERNATIVE_ROOM_SOLVER",
            "time_offset": "00:00:35",
            "from_status": "ANALYZING",
            "to_status": "RECOMMENDATION_READY",
            "metrics": {"voltage_v": 415.0, "current_a": 198.0, "active_power_kw": 142.5, "temp_c": 22.8, "latency_ms": 4.8, "loss_pct": 0.0, "pressure_bar": 3.42},
            "action": "Capacity audit: Smart Classroom CR-202 (capacity 60) is vacant on Wednesday 09:00-10:30 with full 4K AV.",
            "actor": "Engine 5: Academic Reallocation Solver",
            "affected_entities": ["CR-201"],
        },
        {
            "step": 5,
            "stage": "RELOCATION_NOTIFICATION_DISPATCHED",
            "time_offset": "00:00:50",
            "from_status": "RECOMMENDATION_READY",
            "to_status": "IN_PROGRESS",
            "metrics": {"voltage_v": 415.0, "current_a": 198.0, "active_power_kw": 142.5, "temp_c": 22.8, "latency_ms": 4.8, "loss_pct": 0.0, "pressure_bar": 3.42},
            "action": "Automated broadcast sent to Prof. Rajesh Kumar and 55 students: Class relocated to Room CR-202.",
            "actor": "Academic Deanery / HOD Approval",
            "affected_entities": ["CR-201"],
        },
        {
            "step": 6,
            "stage": "RESOLVED_IN_NEW_ROOM",
            "time_offset": "00:01:15",
            "from_status": "IN_PROGRESS",
            "to_status": "RESOLVED",
            "metrics": {"voltage_v": 415.0, "current_a": 198.0, "active_power_kw": 142.5, "temp_c": 22.8, "latency_ms": 4.8, "loss_pct": 0.0, "pressure_bar": 3.42},
            "action": "Zero academic loss verified: All 55 students seated in Room CR-202. AV repair ticket created for CR-201.",
            "actor": "Academic Continuity Verification",
            "affected_entities": [],
        },
    ],
}


# ---------------------------------------------------------------------------
# BROADCASTER SINGLETON ENGINE
# ---------------------------------------------------------------------------

class GlobalTelemetryBroadcaster:
    """
    Centralized producer for continuous synthetic telemetry with multi-scenario support.
    Ticks once every second with monotonically increasing sequence numbers and realistic physical coupling.
    """
    def __init__(self):
        self.subscribers: Set[asyncio.Queue] = set()
        self._lock = asyncio.Lock()
        self.producer_task: Optional[asyncio.Task] = None
        self.sequence: int = 2000

        # Scenario Lifecycle State
        self.active_scenario: str = "NORMAL"  # "NORMAL" | "ELECTRICAL" | "WATER" | "HVAC" | "NETWORK" | "ACADEMIC"
        self.scenario_phase: str = "IDLE"     # "IDLE" | "START" | "RUNNING" | "RESTORED"
        self.scenario_tick: int = 0
        self.incident_id: str = "INC-DEMO-01"
        self.affected_entities: List[str] = []

        # Physics Simulation State
        self.base_voltage: float = 415.0
        self.current_voltage: float = 415.0
        self.base_kw: float = 142.5
        self.current_kw: float = 142.5
        self.power_factor: float = 0.95
        self.water_pressure: float = 3.42
        self.temperature_c: float = 23.0
        self.network_latency: float = 4.8
        self.packet_loss: float = 0.0

        # Initial tick
        self.latest_event: Dict[str, Any] = self._generate_tick_event()

    def set_scenario(self, scenario_key: str, phase: str = "START"):
        self.active_scenario = scenario_key.upper()
        self.scenario_phase = phase.upper()
        self.scenario_tick = 0

        cfg = SCENARIOS_CONFIG.get(self.active_scenario)
        if cfg:
            self.incident_id = cfg["incident_id"]
            if self.scenario_phase in ["START", "RUNNING"]:
                self.affected_entities = list(cfg["affected_entities"])
            else:
                self.affected_entities = []
        elif self.active_scenario in ["NORMAL", "RESTORED"]:
            self.incident_id = "INC-DEMO-01"
            self.affected_entities = []

    def _generate_tick_event(self) -> Dict[str, Any]:
        self.sequence += 1
        self.scenario_tick += 1
        now_iso = datetime.now(timezone.utc).isoformat()
        t = self.sequence * 1.0

        status = "OPERATIONAL"
        active_entity = "FEEDER-LABS-F1"
        scen = self.active_scenario

        if scen == "ELECTRICAL":
            active_entity = "FEEDER-LABS-F1"
            # Progressive voltage collapse over ticks
            if self.scenario_phase == "START":
                progress = min(1.0, self.scenario_tick / 4.0)
                self.current_voltage = max(0.0, round(self.base_voltage * (1.0 - progress) + random.gauss(0, 2.0), 1))
                self.current_kw = max(0.0, round(self.base_kw * (1.0 - progress) + random.gauss(0, 1.0), 1))
                status = "VOLTAGE_DEGRADING" if progress < 0.9 else "OFFLINE_TRIPPED"
            else:  # RUNNING
                self.current_voltage = 0.0
                self.current_kw = 0.0
                status = "OFFLINE_TRIPPED"

            current_a = 0.0 if self.current_voltage < 10 else round(
                (self.current_kw * 1000.0) / (self.current_voltage * math.sqrt(3) * self.power_factor), 1
            )
            temp = round(28.4 + 0.8 * math.sin(t * 0.05) + random.gauss(0, 0.2), 1)
            latency = round(42.0 + random.uniform(2.0, 8.0), 1)
            loss = 4.2
            pressure = 3.38

        elif scen == "WATER":
            active_entity = "BLDG-ENG"
            self.current_voltage = round(self.base_voltage + random.gauss(0, 0.8), 1)
            self.current_kw = round(self.base_kw + random.gauss(0, 1.2), 1)
            current_a = round((self.current_kw * 1000.0) / (self.current_voltage * math.sqrt(3) * self.power_factor), 1)
            temp = 23.0
            latency = 4.8
            loss = 0.0

            # Progressive water pressure decline
            if self.scenario_phase == "START":
                progress = min(1.0, self.scenario_tick / 4.0)
                pressure = max(0.2, round(3.42 - progress * 3.0 + random.gauss(0, 0.05), 2))
                status = "PRESSURE_WARNING" if pressure > 1.2 else "PRESSURE_DEGRADED"
            else:
                pressure = round(0.35 + random.uniform(0.0, 0.08), 2)
                status = "PRESSURE_DEGRADED"
            self.water_pressure = pressure

        elif scen == "HVAC":
            active_entity = "ROOM-MDF"
            self.current_voltage = round(self.base_voltage + random.gauss(0, 0.5), 1)
            # Fans drawing more active power
            self.current_kw = round(156.0 + 3.0 * math.sin(t * 0.05) + random.gauss(0, 1.5), 1)
            current_a = round((self.current_kw * 1000.0) / (self.current_voltage * math.sqrt(3) * self.power_factor), 1)
            pressure = 3.42
            latency = 6.5
            loss = 0.1

            # Progressive temperature rise
            if self.scenario_phase == "START":
                progress = min(1.0, self.scenario_tick / 5.0)
                temp = round(22.0 + progress * 21.0 + random.gauss(0, 0.2), 1)
                status = "THERMAL_WARNING" if temp < 35.0 else "THERMAL_OVERHEAT_CRITICAL"
            else:
                temp = round(43.8 + random.uniform(-0.4, 0.6), 1)
                status = "THERMAL_OVERHEAT_CRITICAL"
            self.temperature_c = temp

        elif scen == "NETWORK":
            active_entity = "SW-MDF-CORE"
            self.current_voltage = round(self.base_voltage + random.gauss(0, 0.6), 1)
            self.current_kw = round(self.base_kw + random.gauss(0, 1.0), 1)
            current_a = round((self.current_kw * 1000.0) / (self.current_voltage * math.sqrt(3) * self.power_factor), 1)
            temp = 23.2
            pressure = 3.42

            # Progressive latency and packet loss surge
            if self.scenario_phase == "START":
                progress = min(1.0, self.scenario_tick / 4.0)
                latency = round(5.0 + progress * 820.0 + random.gauss(0, 10.0), 1)
                loss = round(min(50.0, progress * 48.0 + random.gauss(0, 1.5)), 1)
                status = "NETWORK_JITTER_WARNING" if loss < 15.0 else "NETWORK_PACKET_DROP_DEGRADED"
            else:
                latency = round(840.0 + random.uniform(-20.0, 35.0), 1)
                loss = round(48.5 + random.uniform(-1.0, 1.8), 1)
                status = "NETWORK_PACKET_DROP_DEGRADED"
            self.network_latency = latency
            self.packet_loss = loss

        elif scen == "ACADEMIC":
            active_entity = "CR-201"
            self.current_voltage = round(self.base_voltage + random.gauss(0, 0.6), 1)
            self.current_kw = round(self.base_kw + random.gauss(0, 1.0), 1)
            current_a = round((self.current_kw * 1000.0) / (self.current_voltage * math.sqrt(3) * self.power_factor), 1)
            temp = 22.8
            pressure = 3.42
            latency = 4.8
            loss = 0.0
            status = "ACADEMIC_ROOM_CONFLICT"

        else:
            # NORMAL / RESTORED Nominal state
            active_entity = "FEEDER-LABS-F1"
            self.current_kw = round(self.base_kw + 3.0 * math.sin(t * 0.08) + random.gauss(0, 0.8), 1)
            self.current_voltage = round(self.base_voltage + 1.2 * math.sin(t * 0.05) + random.gauss(0, 0.5), 1)
            current_a = round((self.current_kw * 1000.0) / (self.current_voltage * math.sqrt(3) * self.power_factor), 1)
            temp = round(23.0 + 0.4 * math.sin(t * 0.02) + random.gauss(0, 0.1), 1)
            pressure = round(3.42 + random.gauss(0, 0.02), 2)
            latency = round(4.8 + random.gauss(0, 0.2), 1)
            loss = 0.0
            status = "OPERATIONAL"

        explanation = self._build_explanation(status)
        pulses = self._build_pulses()

        return {
            "sequence": self.sequence,
            "timestamp": now_iso,
            "source": "SYNTHETIC LIVE DATA",
            "scenario": self.active_scenario,
            "scenario_phase": self.scenario_phase,
            "entity_id": active_entity,
            "voltage_v": self.current_voltage,
            "current_a": current_a,
            "active_power_kw": self.current_kw,
            "temperature_c": temp,
            "network_latency_ms": latency,
            "packet_loss_pct": loss,
            "water_pressure": pressure,
            "status": status,
            "incident_id": self.incident_id,
            "event_id": f"EVT-SYNTH-{self.sequence}",
            "provenance": "SYNTHETIC LIVE DATA",
            "telemetry": {
                "voltage_v": self.current_voltage,
                "active_power_kw": self.current_kw,
                "current_a": current_a,
                "temperature_c": temp,
                "frequency_hz": round(50.0 + random.gauss(0, 0.02), 2),
                "network_latency_ms": latency,
                "packet_loss_pct": loss,
                "water_pressure": pressure,
            },
            "feeder_status": status,
            "affected_entities": self.affected_entities,
            "demo_state": self.active_scenario,
            "explanation": explanation,
            "active_pulses": pulses,
        }

    def _build_explanation(self, current_status: str) -> Dict[str, Any]:
        cfg = SCENARIOS_CONFIG.get(self.active_scenario)
        if cfg and self.active_scenario != "NORMAL":
            return {
                "title": f"SCENARIO: {cfg['name'].upper()} ({self.scenario_phase})",
                "what_failed": cfg["title"],
                "where": f"Root Entity: {cfg['root_entity_id']}",
                "when": datetime.now(timezone.utc).strftime("%H:%M:%S UTC"),
                "propagation": f"Cascade Path: {cfg['root_entity_id']} -> " + ", ".join(cfg["affected_entities"][:3]),
                "affected_assets": cfg["affected_entities"],
                "disrupted_classes": [cfg["academic_impact"]],
                "incident_status": f"{current_status} (Incident ID: {cfg['incident_id']}, Phase: {self.scenario_phase})",
                "actions_ready": cfg["recovery_recommendation"],
                "recovery_plan": cfg["recovery_recommendation"],
                "estimated_downtime": cfg["estimated_downtime"],
            }
        return {
            "title": "NORMAL OPERATIONAL BASELINE",
            "message": "Continuous synthetic telemetry fluctuating within nominal engineering tolerance.",
            "metrics": {
                "power_load": f"{self.current_kw:.1f} kW",
                "voltage": f"{self.current_voltage:.1f} V",
                "pressure": f"{self.water_pressure:.2f} bar",
                "temp": f"{self.temperature_c:.1f} °C",
                "sequence": self.sequence,
            },
        }

    def _build_pulses(self) -> List[Dict[str, Any]]:
        is_cut = len(self.affected_entities) > 0 and self.active_scenario != "NORMAL"
        pulses = [
            {"source": "GEN-500KVA", "target": "ATS-01", "status": "STANDBY", "color": "#9D8EB5"},
            {"source": "SUBSTATION-01", "target": "ATS-01", "status": "ACTIVE", "color": "#D4AF37"},
            {"source": "ATS-01", "target": "PANEL-ENG-MAIN", "status": "ACTIVE", "color": "#D4AF37"},
            {"source": "PANEL-ENG-MAIN", "target": "FEEDER-CR-F1", "status": "ACTIVE", "color": "#D4AF37"},
            {"source": "FEEDER-CR-F1", "target": "CR-101", "status": "ACTIVE", "color": "#D4AF37"},
            {"source": "PANEL-ENG-MAIN", "target": "SRV-01", "status": "ACTIVE", "color": "#D4AF37"},
        ]
        if is_cut:
            color = "#EF4444"
            if self.active_scenario == "WATER":
                color = "#38BDF8"  # Cyan/Blue
            elif self.active_scenario == "HVAC":
                color = "#F97316"  # Orange
            elif self.active_scenario == "NETWORK":
                color = "#A855F7"  # Purple
            elif self.active_scenario == "ACADEMIC":
                color = "#F59E0B"  # Amber

            pulses.append({"source": "PANEL-ENG-MAIN", "target": "FEEDER-LABS-F1", "status": "SEVERED", "color": color})
            pulses.append({"source": "FEEDER-LABS-F1", "target": "LAB-01-EE", "status": "SEVERED", "color": color})
            pulses.append({"source": "FEEDER-LABS-F1", "target": "LAB-02-ROBOTICS", "status": "SEVERED", "color": color})
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
# DATABASE INCIDENT PERSISTENCE HELPER
# ---------------------------------------------------------------------------

def ensure_scenario_incident_in_db(db: Session, scenario_key: str, status_str: str = "CONFIRMED") -> Optional[IncidentModel]:
    cfg = SCENARIOS_CONFIG.get(scenario_key)
    if not cfg:
        return None

    inc_id = cfg["incident_id"]
    inc = db.query(IncidentModel).filter_by(incident_id=inc_id).first()
    if not inc:
        inc = IncidentModel(
            incident_id=inc_id,
            title=cfg["title"],
            description=cfg["description"],
            root_entity_id=cfg["root_entity_id"],
            status=status_str,
            priority=cfg["priority"],
            source_type=cfg.get("source_type", "SYNTHETIC_SIMULATED"),
            metadata_json={
                "category": cfg["category"],
                "affected_entities": cfg["affected_entities"],
                "recovery_recommendation": cfg["recovery_recommendation"],
                "academic_impact": cfg["academic_impact"],
            },
        )
        db.add(inc)
        db.flush()

        for aff_id in cfg["affected_entities"]:
            ie = IncidentEntityModel(
                incident_id=inc_id,
                entity_id=aff_id,
                impact_state="CRITICAL" if aff_id == cfg["root_entity_id"] else "DEGRADED",
                propagation_path=[cfg["root_entity_id"], aff_id],
                reason=f"Cascading dependency link from {cfg['root_entity_id']}",
            )
            db.add(ie)
    else:
        inc.status = status_str
        inc.title = cfg["title"]
        inc.description = cfg["description"]

    db.commit()
    return inc


# ---------------------------------------------------------------------------
# API ROUTE HANDLERS
# ---------------------------------------------------------------------------

class ScenarioSelectionRequest(BaseModel):
    scenario: str  # "ELECTRICAL" | "WATER" | "HVAC" | "NETWORK" | "ACADEMIC"
    action: Optional[str] = "start"  # "start" | "running" | "restore"


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
                    event = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield f"id: {event.get('sequence')}\nevent: telemetry\ndata: {json.dumps(event)}\n\n"
                    yield f"data: {json.dumps(event)}\n\n"
                except asyncio.TimeoutError:
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


@router.get("/scenarios")
def list_available_scenarios():
    """
    Returns the metadata and operational state of all 5 controlled scenarios.
    """
    scenarios_list = []
    for key, cfg in SCENARIOS_CONFIG.items():
        is_active = (broadcaster.active_scenario == key)
        phase = broadcaster.scenario_phase if is_active else "IDLE"
        scenarios_list.append({
            **cfg,
            "is_active": is_active,
            "phase": phase,
        })
    return {
        "active_scenario": broadcaster.active_scenario,
        "scenario_phase": broadcaster.scenario_phase,
        "scenarios": scenarios_list,
    }


@router.post("/scenario/select")
def select_scenario(
    req: ScenarioSelectionRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_roles([RoleEnum.SUPER_ADMIN])),
):
    """
    Activates or transitions one of the 5 controlled incident scenarios.
    Restricted to Super Admin role.
    """
    key = req.scenario.upper()
    action = req.action.lower() if req.action else "start"

    if action == "restore":
        broadcaster.set_scenario(key, phase="RESTORED")
        ensure_scenario_incident_in_db(db, key, status_str="RESOLVED")
        broadcaster.active_scenario = "NORMAL"
        broadcaster.scenario_phase = "IDLE"
        broadcaster.affected_entities = []
    elif action == "running":
        broadcaster.set_scenario(key, phase="RUNNING")
        ensure_scenario_incident_in_db(db, key, status_str="IN_PROGRESS")
    else:  # "start"
        broadcaster.set_scenario(key, phase="START")
        ensure_scenario_incident_in_db(db, key, status_str="CONFIRMED")

    return broadcaster._generate_tick_event()


@router.post("/scenario/start")
@router.post("/interrupt")
def scenario_start(
    payload: Optional[Dict[str, Any]] = None,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_roles([RoleEnum.SUPER_ADMIN])),
):
    """
    Convenience endpoint triggering scenario start. Restricted to Super Admin role.
    """
    target_scen = "ELECTRICAL"
    if payload and "scenario" in payload:
        raw = str(payload["scenario"]).upper()
        if "WATER" in raw:
            target_scen = "WATER"
        elif "HVAC" in raw:
            target_scen = "HVAC"
        elif "NET" in raw:
            target_scen = "NETWORK"
        elif "ACAD" in raw:
            target_scen = "ACADEMIC"
        else:
            target_scen = "ELECTRICAL"

    broadcaster.set_scenario(target_scen, phase="START")
    ensure_scenario_incident_in_db(db, target_scen, status_str="CONFIRMED")
    return broadcaster._generate_tick_event()


@router.post("/scenario/stop")
@router.post("/scenario/restore")
@router.post("/restore")
def scenario_restore(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_roles([RoleEnum.SUPER_ADMIN])),
):
    """
    Restores the system to nominal baseline. Restricted to Super Admin role.
    """
    current_key = broadcaster.active_scenario
    if current_key in SCENARIOS_CONFIG:
        ensure_scenario_incident_in_db(db, current_key, status_str="RESOLVED")

    broadcaster.active_scenario = "NORMAL"
    broadcaster.scenario_phase = "IDLE"
    broadcaster.affected_entities = []
    broadcaster.current_voltage = 415.0
    broadcaster.current_kw = 142.5
    broadcaster.water_pressure = 3.42
    broadcaster.temperature_c = 23.0
    broadcaster.network_latency = 4.8
    broadcaster.packet_loss = 0.0

    return broadcaster._generate_tick_event()


@router.post("/recovery")
def scenario_recovery(
    current_user: UserModel = Depends(require_roles([RoleEnum.SUPER_ADMIN])),
):
    """
    Transitions current active scenario to RECOVERY_PLANNED phase. Restricted to Super Admin.
    """
    broadcaster.scenario_phase = "RECOVERY_PLANNED"
    return broadcaster._generate_tick_event()


# ---------------------------------------------------------------------------
# INCIDENT EVENT REPLAY PANEL API (INNOVATION)
# ---------------------------------------------------------------------------

@router.get("/replays")
def list_replayable_incidents():
    """
    Lists all stored historical incidents available for replay.
    """
    replays = []
    for inc_id, steps in REPLAY_STEPS_CATALOG.items():
        # Find matching scenario
        matched_scen = next((s for s in SCENARIOS_CONFIG.values() if s["incident_id"] == inc_id), None)
        replays.append({
            "incident_id": inc_id,
            "title": matched_scen["title"] if matched_scen else f"Incident {inc_id}",
            "category": matched_scen["category"] if matched_scen else "GENERAL",
            "root_entity_id": matched_scen["root_entity_id"] if matched_scen else "UNKNOWN",
            "total_steps": len(steps),
            "duration": steps[-1]["time_offset"] if steps else "00:00:00",
            "provenance": "STORED HISTORICAL EVENT REPLAY",
        })
    return {"replays": replays}


@router.get("/replay/{incident_id}")
def get_incident_replay_timeline(incident_id: str):
    """
    Returns the step-by-step historical event replay sequence for an incident.
    Clearly marked as STORED EVENT PLAYBACK, not new live sensor telemetry.
    """
    steps = REPLAY_STEPS_CATALOG.get(incident_id)
    if not steps:
        raise HTTPException(
            status_code=404,
            detail=f"Replay timeline not found for incident {incident_id}. Available: {list(REPLAY_STEPS_CATALOG.keys())}"
        )

    matched_scen = next((s for s in SCENARIOS_CONFIG.values() if s["incident_id"] == incident_id), None)

    enriched_steps = []
    for s in steps:
        es = dict(s)
        es["step_num"] = s.get("step", 1)
        es["phase"] = s.get("stage", "EVENT")
        es["status"] = s.get("to_status", "ACTIVE")
        es["timestamp"] = f"+{s.get('time_offset', '00:00:00')}"
        es["description"] = s.get("action", "")
        es["telemetry_snapshot"] = s.get("metrics", {})
        es["entity_id"] = s.get("affected_entities", ["UNKNOWN"])[0] if s.get("affected_entities") else "UNKNOWN"
        enriched_steps.append(es)

    return {
        "incident_id": incident_id,
        "title": matched_scen["title"] if matched_scen else incident_id,
        "category": matched_scen["category"] if matched_scen else "INCIDENT",
        "root_entity_id": matched_scen["root_entity_id"] if matched_scen else "UNKNOWN",
        "provenance_banner": "HISTORICAL INCIDENT EVENT REPLAY • STORED PLAYBACK (NOT LIVE SENSORS)",
        "total_steps": len(enriched_steps),
        "steps": enriched_steps,
    }
