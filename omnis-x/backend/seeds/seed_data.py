"""
Idempotent Campus Digital Twin Reference Dataset.
Seeds physical infrastructure, rooms, electrical feeds, network assets,
academic timetable, users, roles, and realistic dependency links.
"""
import hashlib
import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.models.entity import EntityModel, RelationshipModel, OperationalStateModel
from backend.models.event import TelemetryEventModel
from backend.models.user import UserModel, RoleModel
from backend.schemas.common import (
    EntityType,
    RelationshipType,
    OperationalStatus,
    CriticalityLevel,
    RoleEnum,
)

logger = logging.getLogger(__name__)


def hash_password(password: str) -> str:
    """Deterministic hash for demonstration credentials."""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


# 1. Campus Entities Specification
SEED_ENTITIES = [
    # Spatial Hierarchy
    {
        "entity_id": "CAMPUS-MAIN",
        "entity_type": EntityType.CAMPUS.value,
        "name": "Apex Institute of Technology Main Campus",
        "description": "Primary academic and research campus grounds",
        "parent_entity_id": None,
        "location": "Sector 42, Knowledge Corridor",
        "criticality": CriticalityLevel.MISSION_CRITICAL.value,
        "metadata_json": {"total_area_sqm": 120000, "built_year": 2018},
    },
    {
        "entity_id": "BLDG-ENG",
        "entity_type": EntityType.BUILDING.value,
        "name": "Engineering & Technology Block",
        "description": "Four-story academic wing housing engineering labs and lecture halls",
        "parent_entity_id": "CAMPUS-MAIN",
        "location": "North Quad",
        "criticality": CriticalityLevel.HIGH.value,
        "metadata_json": {"floors": 4, "evacuation_zone": "Z-NORTH"},
    },
    {
        "entity_id": "FLOOR-G",
        "entity_type": EntityType.FLOOR.value,
        "name": "Ground Floor - Heavy Facilities & Utility",
        "description": "Substation, core server room, and workshop bays",
        "parent_entity_id": "BLDG-ENG",
        "location": "Engineering Block Ground",
        "criticality": CriticalityLevel.HIGH.value,
        "metadata_json": {"level": 0},
    },
    {
        "entity_id": "FLOOR-1",
        "entity_type": EntityType.FLOOR.value,
        "name": "First Floor - Electrical & Electronics Labs",
        "description": "Electronics, Microcontroller, and Robotics research labs",
        "parent_entity_id": "BLDG-ENG",
        "location": "Engineering Block L1",
        "criticality": CriticalityLevel.HIGH.value,
        "metadata_json": {"level": 1},
    },
    {
        "entity_id": "FLOOR-2",
        "entity_type": EntityType.FLOOR.value,
        "name": "Second Floor - Computing & Lecture Halls",
        "description": "Smart classrooms and tiered amphitheater lecture halls",
        "parent_entity_id": "BLDG-ENG",
        "location": "Engineering Block L2",
        "criticality": CriticalityLevel.MEDIUM.value,
        "metadata_json": {"level": 2},
    },

    # Utility & Electrical Grid Core
    {
        "entity_id": "SUBSTATION-01",
        "entity_type": EntityType.SUBSTATION.value,
        "name": "Main 11kV Substation Unit A",
        "description": "Campus primary electrical intake from regional grid",
        "parent_entity_id": "FLOOR-G",
        "location": "Ground Utility Yard",
        "criticality": CriticalityLevel.MISSION_CRITICAL.value,
        "metadata_json": {"voltage_kv": 11.0, "transformer_capacity_mva": 2.5},
    },
    {
        "entity_id": "GEN-500KVA",
        "entity_type": EntityType.GENERATOR.value,
        "name": "500kVA Diesel Standby Generator",
        "description": "Emergency automatic start diesel generator",
        "parent_entity_id": "FLOOR-G",
        "location": "Ground Utility Yard",
        "criticality": CriticalityLevel.HIGH.value,
        "metadata_json": {"capacity_kva": 500, "fuel_tank_liters": 1200, "auto_start_seconds": 15},
    },
    {
        "entity_id": "ATS-01",
        "entity_type": EntityType.DISTRIBUTION_PANEL.value,
        "name": "Automatic Transfer Switch ATS-1",
        "description": "Automated failover switch between Substation and Diesel Generator",
        "parent_entity_id": "FLOOR-G",
        "location": "Main Switchgear Room",
        "criticality": CriticalityLevel.MISSION_CRITICAL.value,
        "metadata_json": {"switching_time_ms": 80},
    },
    {
        "entity_id": "PANEL-ENG-MAIN",
        "entity_type": EntityType.DISTRIBUTION_PANEL.value,
        "name": "Engineering Block Main Distribution Board",
        "description": "Main electrical bus distribution for Engineering Block",
        "parent_entity_id": "FLOOR-G",
        "location": "Electrical Room G-02",
        "criticality": CriticalityLevel.MISSION_CRITICAL.value,
        "metadata_json": {"rating_amps": 1200},
    },
    {
        "entity_id": "FEEDER-LABS-F1",
        "entity_type": EntityType.FEEDER.value,
        "name": "Feeder Bus F1 - First Floor Research Labs",
        "description": "Dedicated 415V three-phase sub-feeder supplying L1 laboratories",
        "parent_entity_id": "FLOOR-1",
        "location": "Riser Shaft 1B",
        "criticality": CriticalityLevel.HIGH.value,
        "metadata_json": {"capacity_kw": 180, "breaker_type": "MCCB-400A"},
    },
    {
        "entity_id": "FEEDER-CR-F2",
        "entity_type": EntityType.FEEDER.value,
        "name": "Feeder Bus F2 - Second Floor Classrooms",
        "description": "Dedicated feeder supplying lighting, HVAC and power to L2 lecture rooms",
        "parent_entity_id": "FLOOR-2",
        "location": "Riser Shaft 2B",
        "criticality": CriticalityLevel.MEDIUM.value,
        "metadata_json": {"capacity_kw": 120, "breaker_type": "MCCB-250A"},
    },
    {
        "entity_id": "UPS-LAB-02",
        "entity_type": EntityType.UPS.value,
        "name": "Robotics Lab N+1 Modular Online UPS",
        "description": "60kVA online double-conversion UPS protecting AI/Robotics equipment",
        "parent_entity_id": "FLOOR-1",
        "location": "Room 102 Antechamber",
        "criticality": CriticalityLevel.HIGH.value,
        "metadata_json": {"capacity_kva": 60, "battery_runtime_minutes": 45},
    },

    # Rooms & Facilities
    {
        "entity_id": "LAB-01-EE",
        "entity_type": EntityType.LABORATORY.value,
        "name": "Electronics & Microcontroller Laboratory",
        "description": "Undergraduate electronics test benches and embedded hardware lab",
        "parent_entity_id": "FLOOR-1",
        "location": "Room 101, First Floor",
        "criticality": CriticalityLevel.HIGH.value,
        "metadata_json": {"capacity": 40, "workstation_count": 20, "has_exhaust": True},
    },
    {
        "entity_id": "LAB-02-ROBOTICS",
        "entity_type": EntityType.LABORATORY.value,
        "name": "AI, Autonomous Systems & Robotics Laboratory",
        "description": "Advanced research laboratory with edge GPU workstations and drone test cage",
        "parent_entity_id": "FLOOR-1",
        "location": "Room 102, First Floor",
        "criticality": CriticalityLevel.HIGH.value,
        "metadata_json": {"capacity": 35, "workstation_count": 18, "has_ups_backup": True},
    },
    {
        "entity_id": "LAB-03-COMP",
        "entity_type": EntityType.LABORATORY.value,
        "name": "Computer Systems & Networks Laboratory",
        "description": "General computing and cyber-security workstation lab",
        "parent_entity_id": "FLOOR-1",
        "location": "Room 103, First Floor",
        "criticality": CriticalityLevel.MEDIUM.value,
        "metadata_json": {"capacity": 50, "workstation_count": 45},
    },
    {
        "entity_id": "CR-201",
        "entity_type": EntityType.CLASSROOM.value,
        "name": "Smart Classroom 201",
        "description": "Standard multimedia-equipped interactive lecture room",
        "parent_entity_id": "FLOOR-2",
        "location": "Room 201, Second Floor",
        "criticality": CriticalityLevel.MEDIUM.value,
        "metadata_json": {"capacity": 60, "has_projector": True, "has_ac": True},
    },
    {
        "entity_id": "CR-202",
        "entity_type": EntityType.CLASSROOM.value,
        "name": "Smart Classroom 202 (Multipurpose)",
        "description": "Multimedia lecture room configured with breakout tables",
        "parent_entity_id": "FLOOR-2",
        "location": "Room 202, Second Floor",
        "criticality": CriticalityLevel.MEDIUM.value,
        "metadata_json": {"capacity": 60, "has_projector": True, "has_ac": True},
    },
    {
        "entity_id": "LH-01",
        "entity_type": EntityType.LECTURE_HALL.value,
        "name": "Amphitheater Lecture Hall Alpha",
        "description": "Large tiered auditorium for common lectures and departmental seminars",
        "parent_entity_id": "FLOOR-2",
        "location": "Wing C, Second Floor",
        "criticality": CriticalityLevel.HIGH.value,
        "metadata_json": {"capacity": 150, "has_audio_pa": True, "has_dual_projectors": True},
    },
    {
        "entity_id": "ROOM-MDF",
        "entity_type": EntityType.DATA_CENTRE.value,
        "name": "Core Server Room & Campus MDF",
        "description": "Main Distribution Frame and campus core network switches",
        "parent_entity_id": "FLOOR-G",
        "location": "Room G-05, Ground Floor",
        "criticality": CriticalityLevel.MISSION_CRITICAL.value,
        "metadata_json": {"rack_count": 6, "cooling_type": "IN_ROW_PRECISION"},
    },

    # Lab Equipment & Network Devices
    {
        "entity_id": "EQ-OSC-BENCH-01",
        "entity_type": EntityType.WORKSTATION.value,
        "name": "Digital Storage Oscilloscope Workstation Bank A",
        "description": "Tektronix 4-channel 200MHz DSO units for circuit lab",
        "parent_entity_id": "LAB-01-EE",
        "location": "LAB-01-EE Bench Row A",
        "criticality": CriticalityLevel.HIGH.value,
        "metadata_json": {"quantity": 10, "equipment_tag": "OSCILLOSCOPE"},
    },
    {
        "entity_id": "EQ-PWR-BENCH-01",
        "entity_type": EntityType.WORKSTATION.value,
        "name": "Regulated DC Power Supply Array",
        "description": "Dual 0-30V 5A precision linear power supplies",
        "parent_entity_id": "LAB-01-EE",
        "location": "LAB-01-EE Bench Row A-B",
        "criticality": CriticalityLevel.HIGH.value,
        "metadata_json": {"quantity": 10, "equipment_tag": "DC_POWER_SUPPLY"},
    },
    {
        "entity_id": "EQ-GPU-CLUSTER",
        "entity_type": EntityType.GPU_CLUSTER.value,
        "name": "NVIDIA Autonomous Systems Edge Compute Node",
        "description": "Dual RTX workstation nodes for real-time vision algorithms",
        "parent_entity_id": "LAB-02-ROBOTICS",
        "location": "LAB-02 Rack A",
        "criticality": CriticalityLevel.HIGH.value,
        "metadata_json": {"gpus": 4, "equipment_tag": "GPU_CLUSTER"},
    },
    {
        "entity_id": "EQ-PROJ-CR201",
        "entity_type": EntityType.PROJECTOR.value,
        "name": "Ceiling Laser Projector CR-201",
        "description": "Epson 5000-lumen 4K interactive projector",
        "parent_entity_id": "CR-201",
        "location": "CR-201 Ceiling Mount",
        "criticality": CriticalityLevel.LOW.value,
        "metadata_json": {"equipment_tag": "PROJECTOR"},
    },
    {
        "entity_id": "EQ-PROJ-CR202",
        "entity_type": EntityType.PROJECTOR.value,
        "name": "Ceiling Laser Projector CR-202",
        "description": "Epson 5000-lumen 4K interactive projector",
        "parent_entity_id": "CR-202",
        "location": "CR-202 Ceiling Mount",
        "criticality": CriticalityLevel.LOW.value,
        "metadata_json": {"equipment_tag": "PROJECTOR"},
    },
    {
        "entity_id": "SW-MDF-CORE",
        "entity_type": EntityType.SWITCH_MDF.value,
        "name": "Campus Core Switch Cisco 9500",
        "description": "Redundant core 40GbE aggregation and routing switch",
        "parent_entity_id": "ROOM-MDF",
        "location": "Rack 01, MDF Room",
        "criticality": CriticalityLevel.MISSION_CRITICAL.value,
        "metadata_json": {"ip": "10.0.0.1", "ports": 48},
    },
    {
        "entity_id": "SW-IDF-F1",
        "entity_type": EntityType.SWITCH_IDF.value,
        "name": "Floor 1 IDF Access Switch",
        "description": "Gigabit PoE+ distribution switch serving L1 laboratories",
        "parent_entity_id": "FLOOR-1",
        "location": "Telecom Closet 1",
        "criticality": CriticalityLevel.HIGH.value,
        "metadata_json": {"ip": "10.1.0.2", "uplink_gbps": 10},
    },
    {
        "entity_id": "SW-IDF-F2",
        "entity_type": EntityType.SWITCH_IDF.value,
        "name": "Floor 2 IDF Access Switch",
        "description": "Gigabit PoE+ distribution switch serving L2 classrooms",
        "parent_entity_id": "FLOOR-2",
        "location": "Telecom Closet 2",
        "criticality": CriticalityLevel.MEDIUM.value,
        "metadata_json": {"ip": "10.2.0.2", "uplink_gbps": 10},
    },
    {
        "entity_id": "METER-FEEDER-F1",
        "entity_type": EntityType.POWER_METER.value,
        "name": "Modbus Digital Power Meter - Feeder F1",
        "description": "Schneider IEM3255 multi-function meter measuring Feeder F1 electrical telemetry",
        "parent_entity_id": "FEEDER-LABS-F1",
        "location": "Riser Shaft 1B Panel",
        "criticality": CriticalityLevel.HIGH.value,
        "metadata_json": {"protocol": "MODBUS_TCP", "ip": "10.1.10.15", "nominal_voltage": 415.0},
    },

    # Academic Activities
    {
        "entity_id": "ACT-EE301-LAB",
        "entity_type": EntityType.ACADEMIC_ACTIVITY.value,
        "name": "EE301 Microcontroller Hardware Practical Session",
        "description": "Laboratory hands-on module for 3rd year Electrical Engineering students",
        "parent_entity_id": "LAB-01-EE",
        "location": "LAB-01-EE",
        "criticality": CriticalityLevel.HIGH.value,
        "metadata_json": {
            "course_code": "EE301",
            "section": "SEC-EE-A",
            "enrolled_students": 32,
            "faculty_id": "USR-FACULTY-SHARMA",
            "faculty_name": "Dr. Kavita Sharma",
            "time_slot": "09:00 - 12:00",
            "day": "WEDNESDAY",
            "required_equipment": ["OSCILLOSCOPE", "DC_POWER_SUPPLY"],
        },
    },
    {
        "entity_id": "ACT-AI401-LAB",
        "entity_type": EntityType.ACADEMIC_ACTIVITY.value,
        "name": "AI401 Autonomous Systems & Computer Vision Lab",
        "description": "Practical research implementation for senior CS/Robotics cohort",
        "parent_entity_id": "LAB-02-ROBOTICS",
        "location": "LAB-02-ROBOTICS",
        "criticality": CriticalityLevel.HIGH.value,
        "metadata_json": {
            "course_code": "AI401",
            "section": "SEC-CS-A",
            "enrolled_students": 28,
            "faculty_id": "USR-FACULTY-CHEN",
            "faculty_name": "Dr. Alan Chen",
            "time_slot": "09:00 - 12:00",
            "day": "WEDNESDAY",
            "required_equipment": ["GPU_CLUSTER"],
        },
    },
    {
        "entity_id": "ACT-CS201-LEC",
        "entity_type": EntityType.ACADEMIC_ACTIVITY.value,
        "name": "CS201 Data Structures & Algorithms Core Lecture",
        "description": "Theory lecture for 2nd year Computer Science students",
        "parent_entity_id": "CR-201",
        "location": "CR-201",
        "criticality": CriticalityLevel.MEDIUM.value,
        "metadata_json": {
            "course_code": "CS201",
            "section": "SEC-CS-B",
            "enrolled_students": 55,
            "faculty_id": "USR-FACULTY-KUMAR",
            "faculty_name": "Prof. Rajesh Kumar",
            "time_slot": "09:00 - 10:30",
            "day": "WEDNESDAY",
            "required_equipment": ["PROJECTOR"],
        },
    },
]

# 2. Directed Relationships
SEED_RELATIONSHIPS = [
    # Power Grid Tree
    {
        "relationship_id": "REL-PWR-01",
        "source_id": "SUBSTATION-01",
        "target_id": "ATS-01",
        "relationship_type": RelationshipType.SUPPLIES_POWER_TO.value,
        "is_essential": True,
        "redundancy_available": True,
        "dependency_strength": 1.0,
        "propagation_policy": "DEFAULT",
        "metadata_json": {"feeder_tag": "PRIMARY_GRID"},
    },
    {
        "relationship_id": "REL-PWR-02",
        "source_id": "GEN-500KVA",
        "target_id": "ATS-01",
        "relationship_type": RelationshipType.SUPPLIES_POWER_TO.value,
        "is_essential": False,
        "redundancy_available": False,
        "dependency_strength": 0.8,
        "propagation_policy": "DEFAULT",
        "metadata_json": {"feeder_tag": "STANDBY_FEED"},
    },
    {
        "relationship_id": "REL-RED-01",
        "source_id": "GEN-500KVA",
        "target_id": "SUBSTATION-01",
        "relationship_type": RelationshipType.BACKED_UP_BY.value,
        "is_essential": False,
        "redundancy_available": True,
        "dependency_strength": 1.0,
        "propagation_policy": "NONE",
        "metadata_json": {"description": "Generator provides emergency power if Substation trips"},
    },
    {
        "relationship_id": "REL-PWR-03",
        "source_id": "ATS-01",
        "target_id": "PANEL-ENG-MAIN",
        "relationship_type": RelationshipType.SUPPLIES_POWER_TO.value,
        "is_essential": True,
        "redundancy_available": False,
        "dependency_strength": 1.0,
        "propagation_policy": "DEFAULT",
        "metadata_json": {"main_bus": "415V_BUSBAR"},
    },
    {
        "relationship_id": "REL-PWR-04",
        "source_id": "PANEL-ENG-MAIN",
        "target_id": "FEEDER-LABS-F1",
        "relationship_type": RelationshipType.SUPPLIES_POWER_TO.value,
        "is_essential": True,
        "redundancy_available": False,
        "dependency_strength": 1.0,
        "propagation_policy": "DEFAULT",
        "metadata_json": {"breaker": "MCCB-01"},
    },
    {
        "relationship_id": "REL-PWR-05",
        "source_id": "PANEL-ENG-MAIN",
        "target_id": "FEEDER-CR-F2",
        "relationship_type": RelationshipType.SUPPLIES_POWER_TO.value,
        "is_essential": True,
        "redundancy_available": False,
        "dependency_strength": 1.0,
        "propagation_policy": "DEFAULT",
        "metadata_json": {"breaker": "MCCB-02"},
    },
    {
        "relationship_id": "REL-PWR-06",
        "source_id": "FEEDER-LABS-F1",
        "target_id": "LAB-01-EE",
        "relationship_type": RelationshipType.SUPPLIES_POWER_TO.value,
        "is_essential": True,
        "redundancy_available": False,  # NO BACKUP FOR LAB 01
        "dependency_strength": 1.0,
        "propagation_policy": "DEFAULT",
        "metadata_json": {"circuit": "CKT-LAB101-MAINS"},
    },
    {
        "relationship_id": "REL-PWR-07",
        "source_id": "FEEDER-LABS-F1",
        "target_id": "LAB-02-ROBOTICS",
        "relationship_type": RelationshipType.SUPPLIES_POWER_TO.value,
        "is_essential": True,
        "redundancy_available": True,  # Protected by UPS
        "dependency_strength": 1.0,
        "propagation_policy": "DEFAULT",
        "metadata_json": {"circuit": "CKT-LAB102-MAINS"},
    },
    {
        "relationship_id": "REL-PWR-08",
        "source_id": "UPS-LAB-02",
        "target_id": "LAB-02-ROBOTICS",
        "relationship_type": RelationshipType.SUPPLIES_POWER_TO.value,
        "is_essential": False,
        "redundancy_available": True,
        "dependency_strength": 1.0,
        "propagation_policy": "DEFAULT",
        "metadata_json": {"circuit": "UPS-CLEAN-POWER"},
    },
    {
        "relationship_id": "REL-RED-02",
        "source_id": "UPS-LAB-02",
        "target_id": "FEEDER-LABS-F1",
        "relationship_type": RelationshipType.BACKED_UP_BY.value,
        "is_essential": False,
        "redundancy_available": True,
        "dependency_strength": 1.0,
        "propagation_policy": "NONE",
        "metadata_json": {"description": "UPS provides failover for Lab 02 if Feeder F1 trips"},
    },
    {
        "relationship_id": "REL-PWR-09",
        "source_id": "FEEDER-CR-F2",
        "target_id": "CR-201",
        "relationship_type": RelationshipType.SUPPLIES_POWER_TO.value,
        "is_essential": True,
        "redundancy_available": False,
        "dependency_strength": 1.0,
        "propagation_policy": "DEFAULT",
        "metadata_json": {"circuit": "CKT-CR201-LIGHTING-HVAC"},
    },
    {
        "relationship_id": "REL-PWR-10",
        "source_id": "FEEDER-CR-F2",
        "target_id": "CR-202",
        "relationship_type": RelationshipType.SUPPLIES_POWER_TO.value,
        "is_essential": True,
        "redundancy_available": False,
        "dependency_strength": 1.0,
        "propagation_policy": "DEFAULT",
        "metadata_json": {"circuit": "CKT-CR202-LIGHTING-HVAC"},
    },
    {
        "relationship_id": "REL-PWR-11",
        "source_id": "FEEDER-LABS-F1",
        "target_id": "EQ-OSC-BENCH-01",
        "relationship_type": RelationshipType.SUPPLIES_POWER_TO.value,
        "is_essential": True,
        "redundancy_available": False,
        "dependency_strength": 1.0,
        "propagation_policy": "DEFAULT",
        "metadata_json": {"bench": "ROW-A"},
    },
    {
        "relationship_id": "REL-PWR-12",
        "source_id": "FEEDER-LABS-F1",
        "target_id": "EQ-PWR-BENCH-01",
        "relationship_type": RelationshipType.SUPPLIES_POWER_TO.value,
        "is_essential": True,
        "redundancy_available": False,
        "dependency_strength": 1.0,
        "propagation_policy": "DEFAULT",
        "metadata_json": {"bench": "ROW-A-B"},
    },

    # Network Uplinks
    {
        "relationship_id": "REL-NET-01",
        "source_id": "SW-MDF-CORE",
        "target_id": "SW-IDF-F1",
        "relationship_type": RelationshipType.CONNECTED_TO_NETWORK.value,
        "is_essential": True,
        "redundancy_available": False,
        "dependency_strength": 1.0,
        "propagation_policy": "DEFAULT",
        "metadata_json": {"fiber_trunk": "OM4-TRUNK-01"},
    },
    {
        "relationship_id": "REL-NET-02",
        "source_id": "SW-MDF-CORE",
        "target_id": "SW-IDF-F2",
        "relationship_type": RelationshipType.CONNECTED_TO_NETWORK.value,
        "is_essential": True,
        "redundancy_available": False,
        "dependency_strength": 1.0,
        "propagation_policy": "DEFAULT",
        "metadata_json": {"fiber_trunk": "OM4-TRUNK-02"},
    },
    {
        "relationship_id": "REL-NET-03",
        "source_id": "SW-IDF-F1",
        "target_id": "LAB-01-EE",
        "relationship_type": RelationshipType.CONNECTED_TO_NETWORK.value,
        "is_essential": True,
        "redundancy_available": False,
        "dependency_strength": 0.9,
        "propagation_policy": "DEFAULT",
        "metadata_json": {"drop": "CAT6A-DROP-101"},
    },

    # Spatial Containment (DOES NOT PROPAGATE FAILURE)
    {
        "relationship_id": "REL-LOC-01",
        "source_id": "LAB-01-EE",
        "target_id": "EQ-OSC-BENCH-01",
        "relationship_type": RelationshipType.CONTAINS.value,
        "is_essential": False,
        "redundancy_available": False,
        "dependency_strength": 0.0,
        "propagation_policy": "NONE",
        "metadata_json": {"spatial_zone": "INTERNAL"},
    },
    {
        "relationship_id": "REL-LOC-02",
        "source_id": "LAB-01-EE",
        "target_id": "EQ-PWR-BENCH-01",
        "relationship_type": RelationshipType.CONTAINS.value,
        "is_essential": False,
        "redundancy_available": False,
        "dependency_strength": 0.0,
        "propagation_policy": "NONE",
        "metadata_json": {"spatial_zone": "INTERNAL"},
    },
    {
        "relationship_id": "REL-LOC-03",
        "source_id": "CR-201",
        "target_id": "EQ-PROJ-CR201",
        "relationship_type": RelationshipType.CONTAINS.value,
        "is_essential": False,
        "redundancy_available": False,
        "dependency_strength": 0.0,
        "propagation_policy": "NONE",
        "metadata_json": {"spatial_zone": "CEILING"},
    },
    {
        "relationship_id": "REL-LOC-04",
        "source_id": "CR-202",
        "target_id": "EQ-PROJ-CR202",
        "relationship_type": RelationshipType.CONTAINS.value,
        "is_essential": False,
        "redundancy_available": False,
        "dependency_strength": 0.0,
        "propagation_policy": "NONE",
        "metadata_json": {"spatial_zone": "CEILING"},
    },

    # Academic Activity Bindings
    {
        "relationship_id": "REL-ACT-01",
        "source_id": "LAB-01-EE",
        "target_id": "ACT-EE301-LAB",
        "relationship_type": RelationshipType.ASSIGNED_TO_ROOM.value,
        "is_essential": True,
        "redundancy_available": False,
        "dependency_strength": 1.0,
        "propagation_policy": "DEFAULT",
        "metadata_json": {"scheduled_slot": "WED-09:00-12:00"},
    },
    {
        "relationship_id": "REL-ACT-02",
        "source_id": "EQ-OSC-BENCH-01",
        "target_id": "ACT-EE301-LAB",
        "relationship_type": RelationshipType.USES_EQUIPMENT.value,
        "is_essential": True,
        "redundancy_available": False,
        "dependency_strength": 1.0,
        "propagation_policy": "DEFAULT",
        "metadata_json": {"requirement": "MANDATORY"},
    },
    {
        "relationship_id": "REL-ACT-03",
        "source_id": "EQ-PWR-BENCH-01",
        "target_id": "ACT-EE301-LAB",
        "relationship_type": RelationshipType.USES_EQUIPMENT.value,
        "is_essential": True,
        "redundancy_available": False,
        "dependency_strength": 1.0,
        "propagation_policy": "DEFAULT",
        "metadata_json": {"requirement": "MANDATORY"},
    },
    {
        "relationship_id": "REL-ACT-04",
        "source_id": "LAB-02-ROBOTICS",
        "target_id": "ACT-AI401-LAB",
        "relationship_type": RelationshipType.ASSIGNED_TO_ROOM.value,
        "is_essential": True,
        "redundancy_available": False,
        "dependency_strength": 1.0,
        "propagation_policy": "DEFAULT",
        "metadata_json": {"scheduled_slot": "WED-09:00-12:00"},
    },
    {
        "relationship_id": "REL-ACT-05",
        "source_id": "CR-201",
        "target_id": "ACT-CS201-LEC",
        "relationship_type": RelationshipType.ASSIGNED_TO_ROOM.value,
        "is_essential": True,
        "redundancy_available": False,
        "dependency_strength": 1.0,
        "propagation_policy": "DEFAULT",
        "metadata_json": {"scheduled_slot": "WED-09:00-10:30"},
    },
]

# 3. Users and Roles
SEED_ROLES = [
    {"role_id": "ROL-PRINCIPAL", "name": "PRINCIPAL", "description": "Principal & Chief Executive Officer", "permissions_json": ["ALL"]},
    {"role_id": "ROL-HOD", "name": "HOD", "description": "Head of Department / Academic Dean", "permissions_json": ["ACADEMIC_READ", "ACADEMIC_APPROVE", "INCIDENT_READ"]},
    {"role_id": "ROL-FACILITY-MGR", "name": "FACILITY_MANAGER", "description": "Director of Physical Plant & Facilities", "permissions_json": ["FACILITY_READ", "FACILITY_APPROVE", "WORK_ORDER_DISPATCH"]},
    {"role_id": "ROL-IT-ADMIN", "name": "IT_ADMIN", "description": "IT & Network Infrastructure Administrator", "permissions_json": ["IT_READ", "IT_APPROVE", "NETWORK_CONFIG"]},
    {"role_id": "ROL-FACULTY", "name": "FACULTY", "description": "Teaching Faculty", "permissions_json": ["COURSE_READ", "REPORT_CREATE"]},
    {"role_id": "ROL-STAFF", "name": "STAFF", "description": "Engineering & Operational Field Staff", "permissions_json": ["WORK_ORDER_EXECUTE", "REPORT_CREATE"]},
    {"role_id": "ROL-STUDENT", "name": "STUDENT", "description": "Enrolled Campus Student", "permissions_json": ["OWN_REPORT_CREATE", "OWN_REPORT_READ"]},
]

SEED_USERS = [
    {
        "user_id": "USR-SUPER-ADMIN",
        "username": "superadmin",
        "email": "superadmin@apex.edu",
        "password": "AdminPassword!123",
        "full_name": "Dr. Arthur Vance (Director)",
        "role": RoleEnum.SUPER_ADMIN.value,
        "department": "Executive Leadership",
    },
    {
        "user_id": "USR-FACILITY-MGR",
        "username": "facility_mgr",
        "email": "m.bennett@apex.edu",
        "password": "FacilityPass!123",
        "full_name": "Marcus Bennett (Chief Engineer)",
        "role": RoleEnum.FACILITY_MANAGER.value,
        "department": "Facilities & Physical Plant",
    },
    {
        "user_id": "USR-HOD-ACADEMIC",
        "username": "hod_academic",
        "email": "k.sharma@apex.edu",
        "password": "AcademicPass!123",
        "full_name": "Dr. Kavita Sharma (HOD EEE)",
        "role": RoleEnum.HOD_ACADEMIC.value,
        "department": "Electrical & Computer Engineering",
    },
    {
        "user_id": "USR-TECHNICIAN",
        "username": "technician",
        "email": "r.patel@apex.edu",
        "password": "TechPass!123",
        "full_name": "Rajesh Patel (Lead Electrical Tech)",
        "role": RoleEnum.TECHNICIAN.value,
        "department": "Facilities & Physical Plant",
        "metadata": {
            "skills": ["High Voltage", "Circuit Breakers", "Switchgear", "Power Distribution", "Safety Interlocks"],
            "active_tasks": 1,
            "shift": "DAY",
        },
    },
    {
        "user_id": "USR-STUDENT",
        "username": "student",
        "email": "priya.v@student.apex.edu",
        "password": "StudentPass!123",
        "full_name": "Priya Verma (B.Tech Student)",
        "role": RoleEnum.STUDENT.value,
        "department": "Student Body",
    },
]


def seed_database(db: Session, reset_operational: bool = False) -> None:
    """
    Idempotent database seeding.
    Creates or updates reference topology, relationships, roles, and users without
    overwriting operational states, live incidents, or active work orders.
    """
    logger.info("Running idempotent database seed...")

    # 1. Seed Roles
    for r_data in SEED_ROLES:
        existing_role = db.query(RoleModel).filter_by(role_id=r_data["role_id"]).first()
        if not existing_role:
            role_obj = RoleModel(
                role_id=r_data["role_id"],
                name=r_data["name"],
                description=r_data["description"],
                permissions_json=r_data["permissions_json"],
            )
            db.add(role_obj)
    db.commit()

    # 2. Seed Users (idempotent insert or update to synchronize demo credentials)
    for u_data in SEED_USERS:
        existing_user = db.query(UserModel).filter(
            (UserModel.user_id == u_data["user_id"]) | 
            (UserModel.username == u_data["username"]) | 
            (UserModel.email == u_data["email"])
        ).first()
        if not existing_user:
            user_obj = UserModel(
                user_id=u_data["user_id"],
                username=u_data["username"],
                email=u_data["email"],
                hashed_password=hash_password(u_data["password"]),
                full_name=u_data["full_name"],
                role=u_data["role"],
                department=u_data.get("department"),
                is_active=True,
            )
            db.add(user_obj)
        else:
            existing_user.user_id = u_data["user_id"]
            existing_user.username = u_data["username"]
            existing_user.email = u_data["email"]
            existing_user.hashed_password = hash_password(u_data["password"])
            existing_user.role = u_data["role"]
            existing_user.full_name = u_data["full_name"]
            existing_user.department = u_data.get("department")
            existing_user.is_active = True
    db.commit()

    # 3. Seed Entities (Idempotent insert or metadata update; preserves operational status if already set)
    for e_data in SEED_ENTITIES:
        existing_entity = db.query(EntityModel).filter_by(entity_id=e_data["entity_id"]).first()
        if not existing_entity:
            entity_obj = EntityModel(
                entity_id=e_data["entity_id"],
                entity_type=e_data["entity_type"],
                name=e_data["name"],
                description=e_data["description"],
                parent_entity_id=e_data["parent_entity_id"],
                location=e_data["location"],
                criticality=e_data["criticality"],
                operational_status=OperationalStatus.OPERATIONAL.value,
                metadata_json=e_data["metadata_json"],
            )
            db.add(entity_obj)
            db.flush()

            # Initialize corresponding OperationalState record
            op_state = OperationalStateModel(
                entity_id=e_data["entity_id"],
                current_status=OperationalStatus.OPERATIONAL.value,
                health_score=100.0,
                active_incident_count=0,
            )
            db.add(op_state)
        else:
            # Update descriptive metadata only; NEVER reset live operational status on restart
            existing_entity.name = e_data["name"]
            existing_entity.description = e_data["description"]
            existing_entity.location = e_data["location"]
            existing_entity.criticality = e_data["criticality"]
            # Merge metadata
            current_meta = dict(existing_entity.metadata_json or {})
            current_meta.update(e_data["metadata_json"])
            existing_entity.metadata_json = current_meta
            if reset_operational:
                existing_entity.operational_status = OperationalStatus.OPERATIONAL.value
                if existing_entity.operational_state:
                    existing_entity.operational_state.current_status = OperationalStatus.OPERATIONAL.value
                    existing_entity.operational_state.health_score = 100.0
                    existing_entity.operational_state.active_incident_count = 0
    db.commit()

    # 4. Seed Directed Relationships
    for r_data in SEED_RELATIONSHIPS:
        existing_rel = db.query(RelationshipModel).filter_by(relationship_id=r_data["relationship_id"]).first()
        if not existing_rel:
            rel_obj = RelationshipModel(
                relationship_id=r_data["relationship_id"],
                source_id=r_data["source_id"],
                target_id=r_data["target_id"],
                relationship_type=r_data["relationship_type"],
                is_essential=r_data["is_essential"],
                redundancy_available=r_data["redundancy_available"],
                dependency_strength=r_data["dependency_strength"],
                propagation_policy=r_data["propagation_policy"],
                metadata_json=r_data["metadata_json"],
            )
            db.add(rel_obj)
        else:
            existing_rel.is_essential = r_data["is_essential"]
            existing_rel.redundancy_available = r_data["redundancy_available"]
            existing_rel.dependency_strength = r_data["dependency_strength"]
            existing_rel.propagation_policy = r_data["propagation_policy"]
            rel_meta = dict(existing_rel.metadata_json or {})
            rel_meta.update(r_data["metadata_json"])
            existing_rel.metadata_json = rel_meta
    db.commit()

    # 5. Seed Initial Telemetry Time-Series (Idempotent: only if table has < 20 records)
    event_count = db.query(TelemetryEventModel).count()
    if event_count < 20:
        logger.info("Seeding realistic baseline telemetry time-series...")
        now = datetime.utcnow()
        # Series profiles: (entity_id, metric_name, unit, [(offset_hours, value)])
        profiles = [
            # Feeder F1 voltage & power
            ("METER-FEEDER-F1", "voltage_v", "V", [
                (-12, 414.8), (-10, 415.2), (-8, 413.5), (-6, 412.1),
                (-4, 415.0), (-3, 414.2), (-2, 415.8), (-1, 414.0), (0, 414.6)
            ]),
            ("METER-FEEDER-F1", "active_power_kw", "kW", [
                (-12, 18.5), (-10, 22.1), (-8, 38.4), (-6, 42.0),
                (-4, 39.5), (-3, 44.1), (-2, 41.8), (-1, 38.2), (0, 36.5)
            ]),
            ("METER-FEEDER-F1", "current_a", "A", [
                (-12, 28.2), (-10, 34.0), (-8, 56.2), (-6, 61.5),
                (-4, 58.0), (-3, 64.2), (-2, 60.8), (-1, 55.4), (0, 53.0)
            ]),
            # Lab 01 EE Temperature & Occupancy
            ("LAB-01-EE", "temperature_c", "°C", [
                (-12, 21.5), (-10, 22.0), (-8, 22.8), (-6, 23.5),
                (-4, 23.8), (-3, 24.1), (-2, 23.9), (-1, 23.4), (0, 23.1)
            ]),
            ("LAB-01-EE", "occupancy_count", "persons", [
                (-12, 0), (-10, 2), (-8, 18), (-6, 32),
                (-4, 28), (-3, 30), (-2, 24), (-1, 8), (0, 4)
            ]),
            # Lab 02 Robotics Temperature & GPU Power
            ("LAB-02-ROBOTICS", "temperature_c", "°C", [
                (-12, 20.8), (-10, 21.2), (-8, 22.0), (-6, 22.6),
                (-4, 22.9), (-3, 22.5), (-2, 22.2), (-1, 21.8), (0, 21.5)
            ]),
            ("LAB-02-ROBOTICS", "power_draw_kw", "kW", [
                (-12, 5.2), (-10, 6.0), (-8, 14.5), (-6, 17.2),
                (-4, 16.8), (-3, 15.4), (-2, 14.0), (-1, 9.5), (0, 7.8)
            ]),
            # Server Room MDF Rack Inlet Temp & Airflow
            ("ROOM-MDF", "rack_inlet_temp_c", "°C", [
                (-12, 19.8), (-10, 20.0), (-8, 20.2), (-6, 20.5),
                (-4, 20.4), (-3, 20.3), (-2, 20.1), (-1, 19.9), (0, 20.0)
            ]),
            ("ROOM-MDF", "ups_load_pct", "%", [
                (-12, 61.2), (-10, 62.0), (-8, 64.5), (-6, 66.0),
                (-4, 65.8), (-3, 65.2), (-2, 64.0), (-1, 63.2), (0, 62.8)
            ]),
            # Classroom CR-201 Temperature & CO2
            ("CR-201", "temperature_c", "°C", [
                (-12, 21.0), (-10, 21.5), (-8, 23.2), (-6, 24.6),
                (-4, 24.2), (-3, 23.8), (-2, 23.5), (-1, 22.5), (0, 22.0)
            ]),
            ("CR-201", "co2_ppm", "ppm", [
                (-12, 420), (-10, 440), (-8, 680), (-6, 820),
                (-4, 760), (-3, 710), (-2, 650), (-1, 520), (0, 460)
            ]),
        ]

        evt_seq = 1
        for ent_id, metric, unit, points in profiles:
            for offset_h, val in points:
                ts = now + timedelta(hours=offset_h)
                # Mark recent observations as REAL, older baseline as SYNTHETIC
                src = "REAL" if offset_h >= -1 else "SYNTHETIC"
                model = TelemetryEventModel(
                    event_id=f"EVT-SEED-{ent_id[:8]}-{metric[:4].upper()}-{evt_seq:04d}",
                    entity_id=ent_id,
                    metric_name=metric,
                    value=float(val),
                    unit=unit,
                    timestamp=ts,
                    source_type=src,
                    source_id=f"GW-{ent_id}",
                    quality=1.0,
                    raw_payload={"seeded": True, "nominal_reference": True},
                    created_at=ts,
                )
                db.add(model)
                evt_seq += 1
        db.commit()

    logger.info("Database reference seed completed successfully.")
