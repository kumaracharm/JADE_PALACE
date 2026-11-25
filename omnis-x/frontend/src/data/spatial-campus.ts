/**
 * Architectural Spatial Geometry and Coordinates for OMNIS-X Campus Digital Twin.
 * Defines floor boundaries, rooms, doors, utility risers, and coordinate anchors
 * corresponding to backend persistent entities.
 */

import { FloorPlanData, SpatialRoom, SpatialEquipment, SpatialWall } from "@/types/digital-twin";

// ==========================================
// FLOOR 1: First Floor - Electrical & Electronics Labs
// ==========================================
export const FLOOR_1_DATA: FloorPlanData = {
  floorId: "FLOOR-1",
  name: "First Floor - Electrical & Electronics Labs",
  level: 1,
  viewBox: { width: 1200, height: 800 },
  rooms: [
    {
      entityId: "LAB-01-EE",
      name: "Electronics & Microcontroller Laboratory",
      code: "101",
      category: "LAB",
      floorId: "FLOOR-1",
      polygon: [
        { x: 60, y: 100 },
        { x: 420, y: 100 },
        { x: 420, y: 380 },
        { x: 60, y: 380 },
      ],
      labelPosition: { x: 240, y: 220 },
      areaSqm: 180,
      doors: [
        { x: 420, y: 240, width: 36, angle: 90 },
      ],
      equipmentAnchors: [
        { entityId: "EQ-OSC-BENCH-01", x: 180, y: 160, type: "WORKSTATION" },
        { entityId: "EQ-PWR-BENCH-01", x: 180, y: 290, type: "WORKSTATION" },
      ],
    },
    {
      entityId: "LAB-02-ROBOTICS",
      name: "AI, Autonomous Systems & Robotics Laboratory",
      code: "102",
      category: "LAB",
      floorId: "FLOOR-1",
      polygon: [
        { x: 780, y: 100 },
        { x: 1140, y: 100 },
        { x: 1140, y: 380 },
        { x: 780, y: 380 },
      ],
      labelPosition: { x: 960, y: 220 },
      areaSqm: 210,
      doors: [
        { x: 780, y: 240, width: 36, angle: -90 },
      ],
      equipmentAnchors: [
        { entityId: "EQ-GPU-CLUSTER", x: 1050, y: 160, type: "GPU_CLUSTER" },
        { entityId: "UPS-LAB-02", x: 860, y: 160, type: "UPS" },
      ],
    },
    {
      entityId: "LAB-03-COMP",
      name: "Computer Systems & Networks Laboratory",
      code: "103",
      category: "LAB",
      floorId: "FLOOR-1",
      polygon: [
        { x: 60, y: 460 },
        { x: 420, y: 460 },
        { x: 420, y: 720 },
        { x: 60, y: 720 },
      ],
      labelPosition: { x: 240, y: 590 },
      areaSqm: 200,
      doors: [
        { x: 420, y: 570, width: 36, angle: 90 },
      ],
      equipmentAnchors: [],
    },
    {
      entityId: "RISER-SHAFT-1B",
      name: "Electrical Riser Shaft 1B",
      code: "RS-1B",
      category: "RISER",
      floorId: "FLOOR-1",
      polygon: [
        { x: 450, y: 100 },
        { x: 550, y: 100 },
        { x: 550, y: 220 },
        { x: 450, y: 220 },
      ],
      labelPosition: { x: 500, y: 160 },
      areaSqm: 24,
      doors: [
        { x: 500, y: 220, width: 28, angle: 0 },
      ],
      equipmentAnchors: [
        { entityId: "FEEDER-LABS-F1", x: 480, y: 140, type: "FEEDER" },
        { entityId: "METER-FEEDER-F1", x: 520, y: 140, type: "POWER_METER" },
      ],
    },
    {
      entityId: "CLOSET-IDF-F1",
      name: "Telecom & IDF Closet 1",
      code: "IDF-1",
      category: "FACILITY",
      floorId: "FLOOR-1",
      polygon: [
        { x: 650, y: 100 },
        { x: 750, y: 100 },
        { x: 750, y: 220 },
        { x: 650, y: 220 },
      ],
      labelPosition: { x: 700, y: 160 },
      areaSqm: 24,
      doors: [
        { x: 700, y: 220, width: 28, angle: 0 },
      ],
      equipmentAnchors: [
        { entityId: "SW-IDF-F1", x: 700, y: 150, type: "SWITCH_IDF" },
      ],
    },
    {
      entityId: "ROTUNDA-F1",
      name: "Central Atrium & Engineering Rotunda",
      code: "ATRIUM-1",
      category: "CORRIDOR",
      floorId: "FLOOR-1",
      polygon: [
        { x: 480, y: 340 },
        { x: 720, y: 340 },
        { x: 780, y: 460 },
        { x: 780, y: 580 },
        { x: 720, y: 680 },
        { x: 480, y: 680 },
        { x: 420, y: 580 },
        { x: 420, y: 460 },
      ],
      labelPosition: { x: 600, y: 510 },
      areaSqm: 260,
      doors: [],
      equipmentAnchors: [],
    },
  ],
  walls: [
    // Outer perimeter walls
    { id: "w-out-1", points: [{ x: 40, y: 80 }, { x: 1160, y: 80 }], thickness: 6, type: "EXTERIOR" },
    { id: "w-out-2", points: [{ x: 1160, y: 80 }, { x: 1160, y: 740 }], thickness: 6, type: "EXTERIOR" },
    { id: "w-out-3", points: [{ x: 1160, y: 740 }, { x: 40, y: 740 }], thickness: 6, type: "EXTERIOR" },
    { id: "w-out-4", points: [{ x: 40, y: 740 }, { x: 40, y: 80 }], thickness: 6, type: "EXTERIOR" },

    // Lab 101 Walls
    { id: "w-101-r", points: [{ x: 420, y: 100 }, { x: 420, y: 380 }], thickness: 4, type: "INTERIOR" },
    { id: "w-101-b", points: [{ x: 60, y: 380 }, { x: 420, y: 380 }], thickness: 4, type: "INTERIOR" },

    // Lab 102 Walls
    { id: "w-102-l", points: [{ x: 780, y: 100 }, { x: 780, y: 380 }], thickness: 4, type: "INTERIOR" },
    { id: "w-102-b", points: [{ x: 780, y: 380 }, { x: 1140, y: 380 }], thickness: 4, type: "INTERIOR" },

    // Lab 103 Walls
    { id: "w-103-t", points: [{ x: 60, y: 460 }, { x: 420, y: 460 }], thickness: 4, type: "INTERIOR" },
    { id: "w-103-r", points: [{ x: 420, y: 460 }, { x: 420, y: 720 }], thickness: 4, type: "INTERIOR" },
  ],
  equipment: [
    {
      entityId: "FEEDER-LABS-F1",
      name: "Feeder Bus F1 - Research Labs",
      type: "FEEDER",
      x: 480,
      y: 140,
      floorId: "FLOOR-1",
      roomId: "RISER-SHAFT-1B",
      status: "OPERATIONAL",
      primaryMetric: { name: "Load", value: 36.5, unit: "kW" },
    },
    {
      entityId: "METER-FEEDER-F1",
      name: "Digital Power Meter Feeder F1",
      type: "POWER_METER",
      x: 520,
      y: 140,
      floorId: "FLOOR-1",
      roomId: "RISER-SHAFT-1B",
      status: "OPERATIONAL",
      primaryMetric: { name: "Voltage", value: 414.6, unit: "V" },
    },
    {
      entityId: "SW-IDF-F1",
      name: "Floor 1 IDF Access Switch",
      type: "SWITCH_IDF",
      x: 700,
      y: 150,
      floorId: "FLOOR-1",
      roomId: "CLOSET-IDF-F1",
      status: "OPERATIONAL",
      primaryMetric: { name: "Uplink", value: 10, unit: "Gbps" },
    },
    {
      entityId: "EQ-OSC-BENCH-01",
      name: "Digital Oscilloscope Bench A",
      type: "WORKSTATION",
      x: 180,
      y: 160,
      floorId: "FLOOR-1",
      roomId: "LAB-01-EE",
      status: "OPERATIONAL",
      primaryMetric: { name: "Units Active", value: 10, unit: "units" },
    },
    {
      entityId: "EQ-PWR-BENCH-01",
      name: "Precision DC Power Supply Array",
      type: "WORKSTATION",
      x: 180,
      y: 290,
      floorId: "FLOOR-1",
      roomId: "LAB-01-EE",
      status: "OPERATIONAL",
      primaryMetric: { name: "Units Active", value: 10, unit: "units" },
    },
    {
      entityId: "EQ-GPU-CLUSTER",
      name: "Autonomous Systems Edge Node",
      type: "GPU_CLUSTER",
      x: 1050,
      y: 160,
      floorId: "FLOOR-1",
      roomId: "LAB-02-ROBOTICS",
      status: "OPERATIONAL",
      primaryMetric: { name: "Power", value: 7.8, unit: "kW" },
    },
    {
      entityId: "UPS-LAB-02",
      name: "Robotics Modular Online UPS",
      type: "UPS",
      x: 860,
      y: 160,
      floorId: "FLOOR-1",
      roomId: "LAB-02-ROBOTICS",
      status: "OPERATIONAL",
      primaryMetric: { name: "Runtime", value: 45, unit: "min" },
    },
  ],
};

// ==========================================
// FLOOR 2: Second Floor - Classrooms & Lecture Halls
// ==========================================
export const FLOOR_2_DATA: FloorPlanData = {
  floorId: "FLOOR-2",
  name: "Second Floor - Computing & Lecture Halls",
  level: 2,
  viewBox: { width: 1200, height: 800 },
  rooms: [
    {
      entityId: "CR-201",
      name: "Smart Classroom 201",
      code: "201",
      category: "CLASSROOM",
      floorId: "FLOOR-2",
      polygon: [
        { x: 60, y: 100 },
        { x: 420, y: 100 },
        { x: 420, y: 380 },
        { x: 60, y: 380 },
      ],
      labelPosition: { x: 240, y: 220 },
      areaSqm: 160,
      doors: [{ x: 420, y: 240, width: 36, angle: 90 }],
      equipmentAnchors: [
        { entityId: "EQ-PROJ-CR201", x: 240, y: 150, type: "PROJECTOR" },
      ],
    },
    {
      entityId: "CR-202",
      name: "Smart Classroom 202 (Multipurpose)",
      code: "202",
      category: "CLASSROOM",
      floorId: "FLOOR-2",
      polygon: [
        { x: 60, y: 460 },
        { x: 420, y: 460 },
        { x: 420, y: 720 },
        { x: 60, y: 720 },
      ],
      labelPosition: { x: 240, y: 590 },
      areaSqm: 160,
      doors: [{ x: 420, y: 570, width: 36, angle: 90 }],
      equipmentAnchors: [
        { entityId: "EQ-PROJ-CR202", x: 240, y: 510, type: "PROJECTOR" },
      ],
    },
    {
      entityId: "LH-01",
      name: "Amphitheater Lecture Hall Alpha",
      code: "LH-A",
      category: "AUDITORIUM",
      floorId: "FLOOR-2",
      polygon: [
        { x: 680, y: 120 },
        { x: 1140, y: 120 },
        { x: 1140, y: 700 },
        { x: 680, y: 700 },
      ],
      labelPosition: { x: 910, y: 410 },
      areaSqm: 450,
      doors: [
        { x: 680, y: 260, width: 44, angle: -90 },
        { x: 680, y: 560, width: 44, angle: -90 },
      ],
      equipmentAnchors: [],
    },
    {
      entityId: "RISER-SHAFT-2B",
      name: "Electrical Riser Shaft 2B",
      code: "RS-2B",
      category: "RISER",
      floorId: "FLOOR-2",
      polygon: [
        { x: 450, y: 100 },
        { x: 550, y: 100 },
        { x: 550, y: 220 },
        { x: 450, y: 220 },
      ],
      labelPosition: { x: 500, y: 160 },
      areaSqm: 24,
      doors: [{ x: 500, y: 220, width: 28, angle: 0 }],
      equipmentAnchors: [
        { entityId: "FEEDER-CR-F2", x: 500, y: 150, type: "FEEDER" },
      ],
    },
    {
      entityId: "CLOSET-IDF-F2",
      name: "Telecom & IDF Closet 2",
      code: "IDF-2",
      category: "FACILITY",
      floorId: "FLOOR-2",
      polygon: [
        { x: 570, y: 100 },
        { x: 660, y: 100 },
        { x: 660, y: 220 },
        { x: 570, y: 220 },
      ],
      labelPosition: { x: 615, y: 160 },
      areaSqm: 20,
      doors: [{ x: 615, y: 220, width: 28, angle: 0 }],
      equipmentAnchors: [
        { entityId: "SW-IDF-F2", x: 615, y: 150, type: "SWITCH_IDF" },
      ],
    },
  ],
  walls: [
    { id: "w-out-1", points: [{ x: 40, y: 80 }, { x: 1160, y: 80 }], thickness: 6, type: "EXTERIOR" },
    { id: "w-out-2", points: [{ x: 1160, y: 80 }, { x: 1160, y: 740 }], thickness: 6, type: "EXTERIOR" },
    { id: "w-out-3", points: [{ x: 1160, y: 740 }, { x: 40, y: 740 }], thickness: 6, type: "EXTERIOR" },
    { id: "w-out-4", points: [{ x: 40, y: 740 }, { x: 40, y: 80 }], thickness: 6, type: "EXTERIOR" },
  ],
  equipment: [
    {
      entityId: "FEEDER-CR-F2",
      name: "Feeder Bus F2 - Classrooms",
      type: "FEEDER",
      x: 500,
      y: 150,
      floorId: "FLOOR-2",
      roomId: "RISER-SHAFT-2B",
      status: "OPERATIONAL",
      primaryMetric: { name: "Load", value: 24.2, unit: "kW" },
    },
    {
      entityId: "SW-IDF-F2",
      name: "Floor 2 IDF Access Switch",
      type: "SWITCH_IDF",
      x: 615,
      y: 150,
      floorId: "FLOOR-2",
      roomId: "CLOSET-IDF-F2",
      status: "OPERATIONAL",
      primaryMetric: { name: "Uplink", value: 10, unit: "Gbps" },
    },
    {
      entityId: "EQ-PROJ-CR201",
      name: "Ceiling Projector CR-201",
      type: "PROJECTOR",
      x: 240,
      y: 150,
      floorId: "FLOOR-2",
      roomId: "CR-201",
      status: "OPERATIONAL",
      primaryMetric: { name: "Status", value: 1, unit: "active" },
    },
    {
      entityId: "EQ-PROJ-CR202",
      name: "Ceiling Projector CR-202",
      type: "PROJECTOR",
      x: 240,
      y: 510,
      floorId: "FLOOR-2",
      roomId: "CR-202",
      status: "OPERATIONAL",
      primaryMetric: { name: "Status", value: 1, unit: "active" },
    },
  ],
};

// ==========================================
// FLOOR G: Ground Floor - Heavy Facilities & Utility
// ==========================================
export const FLOOR_G_DATA: FloorPlanData = {
  floorId: "FLOOR-G",
  name: "Ground Floor - Heavy Facilities & Utility",
  level: 0,
  viewBox: { width: 1200, height: 800 },
  rooms: [
    {
      entityId: "ROOM-MDF",
      name: "Core Server Room & Campus MDF",
      code: "G-05",
      category: "DATA_CENTER",
      floorId: "FLOOR-G",
      polygon: [
        { x: 80, y: 120 },
        { x: 500, y: 120 },
        { x: 500, y: 440 },
        { x: 80, y: 440 },
      ],
      labelPosition: { x: 290, y: 260 },
      areaSqm: 220,
      doors: [{ x: 500, y: 260, width: 40, angle: 90 }],
      equipmentAnchors: [
        { entityId: "SW-MDF-CORE", x: 280, y: 200, type: "SWITCH_CORE" },
      ],
    },
    {
      entityId: "SWITCHGEAR-G02",
      name: "Main Electrical Switchgear Room",
      code: "G-02",
      category: "FACILITY",
      floorId: "FLOOR-G",
      polygon: [
        { x: 580, y: 120 },
        { x: 1120, y: 120 },
        { x: 1120, y: 440 },
        { x: 580, y: 440 },
      ],
      labelPosition: { x: 850, y: 260 },
      areaSqm: 280,
      doors: [{ x: 580, y: 260, width: 44, angle: -90 }],
      equipmentAnchors: [
        { entityId: "ATS-01", x: 740, y: 200, type: "DISTRIBUTION_PANEL" },
        { entityId: "PANEL-ENG-MAIN", x: 960, y: 200, type: "DISTRIBUTION_PANEL" },
      ],
    },
    {
      entityId: "UTILITY-YARD",
      name: "Ground Utility Intake Yard",
      code: "YARD-EXT",
      category: "FACILITY",
      floorId: "FLOOR-G",
      polygon: [
        { x: 580, y: 500 },
        { x: 1120, y: 500 },
        { x: 1120, y: 720 },
        { x: 580, y: 720 },
      ],
      labelPosition: { x: 850, y: 610 },
      areaSqm: 320,
      doors: [],
      equipmentAnchors: [
        { entityId: "SUBSTATION-01", x: 720, y: 600, type: "SUBSTATION" },
        { entityId: "GEN-500KVA", x: 980, y: 600, type: "GENERATOR" },
      ],
    },
  ],
  walls: [
    { id: "w-out-1", points: [{ x: 40, y: 80 }, { x: 1160, y: 80 }], thickness: 6, type: "EXTERIOR" },
    { id: "w-out-2", points: [{ x: 1160, y: 80 }, { x: 1160, y: 740 }], thickness: 6, type: "EXTERIOR" },
    { id: "w-out-3", points: [{ x: 1160, y: 740 }, { x: 40, y: 740 }], thickness: 6, type: "EXTERIOR" },
    { id: "w-out-4", points: [{ x: 40, y: 740 }, { x: 40, y: 80 }], thickness: 6, type: "EXTERIOR" },
  ],
  equipment: [
    {
      entityId: "SW-MDF-CORE",
      name: "Campus Core Switch Cisco 9500",
      type: "SWITCH_CORE",
      x: 280,
      y: 200,
      floorId: "FLOOR-G",
      roomId: "ROOM-MDF",
      status: "OPERATIONAL",
      primaryMetric: { name: "Throughput", value: 38.4, unit: "Gbps" },
    },
    {
      entityId: "ATS-01",
      name: "Automatic Transfer Switch ATS-1",
      type: "DISTRIBUTION_PANEL",
      x: 740,
      y: 200,
      floorId: "FLOOR-G",
      roomId: "SWITCHGEAR-G02",
      status: "OPERATIONAL",
      primaryMetric: { name: "Switching", value: 80, unit: "ms" },
    },
    {
      entityId: "PANEL-ENG-MAIN",
      name: "Main Distribution Board",
      type: "DISTRIBUTION_PANEL",
      x: 960,
      y: 200,
      floorId: "FLOOR-G",
      roomId: "SWITCHGEAR-G02",
      status: "OPERATIONAL",
      primaryMetric: { name: "Bus Rating", value: 1200, unit: "A" },
    },
    {
      entityId: "SUBSTATION-01",
      name: "Main 11kV Substation Unit A",
      type: "SUBSTATION",
      x: 720,
      y: 600,
      floorId: "FLOOR-G",
      roomId: "UTILITY-YARD",
      status: "OPERATIONAL",
      primaryMetric: { name: "Voltage", value: 11.0, unit: "kV" },
    },
    {
      entityId: "GEN-500KVA",
      name: "500kVA Diesel Standby Generator",
      type: "GENERATOR",
      x: 980,
      y: 600,
      floorId: "FLOOR-G",
      roomId: "UTILITY-YARD",
      status: "OPERATIONAL",
      primaryMetric: { name: "Fuel", value: 88, unit: "%" },
    },
  ],
};

export const CAMPUS_FLOORS: Record<string, FloorPlanData> = {
  "FLOOR-G": FLOOR_G_DATA,
  "FLOOR-1": FLOOR_1_DATA,
  "FLOOR-2": FLOOR_2_DATA,
};

// Electrical network flow line definitions between spatial markers
export const ELECTRICAL_CIRCUITS_FLOOR_1 = [
  // From Riser Feeder F1 to Meters, Labs, Equipment
  {
    from: { x: 480, y: 140 }, // FEEDER-LABS-F1
    to: { x: 520, y: 140 },   // METER-FEEDER-F1
    id: "circ-f1-meter",
  },
  {
    from: { x: 480, y: 140 }, // FEEDER-LABS-F1
    to: { x: 240, y: 140 },   // LAB-01-EE main distribution
    id: "circ-f1-lab1",
  },
  {
    from: { x: 240, y: 140 },
    to: { x: 180, y: 160 },   // EQ-OSC-BENCH-01
    id: "circ-f1-osc",
  },
  {
    from: { x: 240, y: 140 },
    to: { x: 180, y: 290 },   // EQ-PWR-BENCH-01
    id: "circ-f1-pwr",
  },
  {
    from: { x: 480, y: 140 }, // FEEDER-LABS-F1
    to: { x: 860, y: 160 },   // UPS-LAB-02
    id: "circ-f1-ups",
  },
  {
    from: { x: 860, y: 160 }, // UPS-LAB-02
    to: { x: 1050, y: 160 },  // EQ-GPU-CLUSTER
    id: "circ-ups-gpu",
  },
];

// Data network cable runs
export const NETWORK_CIRCUITS_FLOOR_1 = [
  {
    from: { x: 700, y: 150 }, // SW-IDF-F1
    to: { x: 180, y: 160 },   // EQ-OSC-BENCH-01
    id: "net-idf-osc",
  },
  {
    from: { x: 700, y: 150 }, // SW-IDF-F1
    to: { x: 1050, y: 160 },  // EQ-GPU-CLUSTER
    id: "net-idf-gpu",
  },
  {
    from: { x: 700, y: 150 }, // SW-IDF-F1
    to: { x: 240, y: 590 },   // LAB-03-COMP
    id: "net-idf-lab3",
  },
];

// Academic Schedule Overlays (Current Time Window)
export const ACADEMIC_SCHEDULE_OVERLAYS = [
  {
    activityId: "ACT-EE301-LAB",
    courseCode: "EE301",
    name: "Microcontroller Hardware Practical",
    roomId: "LAB-01-EE",
    roomCode: "101",
    section: "SEC-EE-A",
    enrolled: 32,
    faculty: "Dr. Kavita Sharma",
    timeSlot: "09:00 - 12:00",
    badgeColor: "#D4AF37",
  },
  {
    activityId: "ACT-AI401-LAB",
    courseCode: "AI401",
    name: "Autonomous Systems & Computer Vision",
    roomId: "LAB-02-ROBOTICS",
    roomCode: "102",
    section: "SEC-CS-A",
    enrolled: 28,
    faculty: "Dr. Alan Chen",
    timeSlot: "09:00 - 12:00",
    badgeColor: "#9D8EB5",
  },
  {
    activityId: "ACT-CS201-LEC",
    courseCode: "CS201",
    name: "Data Structures & Algorithms Core",
    roomId: "CR-201",
    roomCode: "201",
    section: "SEC-CS-B",
    enrolled: 55,
    faculty: "Prof. Rajesh Kumar",
    timeSlot: "09:00 - 10:30",
    badgeColor: "#E6C45E",
  },
];
