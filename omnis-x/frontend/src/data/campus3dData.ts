import { CampusLayerInfo, Room3DSpec, Conduit3DLine } from '../types/campus3d';

export const CAMPUS_3D_LAYERS: CampusLayerInfo[] = [
  {
    id: 'ground',
    planeNumber: 'LEVEL 00',
    title: 'Infrastructure & Utility Core',
    subtitle: '11kV Substation / UPS / Server Datacenter / Transit Bay',
    elevationY: 0,
    roomCount: 4,
    accentCode: 'UTIL-00'
  },
  {
    id: 'floor1',
    planeNumber: 'LEVEL 01',
    title: 'Academic Wing & Lecture Halls',
    subtitle: 'Smart Classrooms CR-101 to CR-104 & Central Corridor',
    elevationY: 3.8,
    roomCount: 4,
    accentCode: 'ACAD-01'
  },
  {
    id: 'floor2',
    planeNumber: 'LEVEL 02',
    title: 'Research & Advanced Laboratories',
    subtitle: 'VLSI Nanotech, Robotics AI, HV Power Lab & Auditorium',
    elevationY: 7.6,
    roomCount: 4,
    accentCode: 'LABS-02'
  },
  {
    id: 'roof',
    planeNumber: 'LEVEL 03',
    title: 'Administration & Telemetry Backbone',
    subtitle: "Dean's Suite, Campus SCADA NOC & Rooftop Solar/RF Array",
    elevationY: 11.4,
    roomCount: 3,
    accentCode: 'ADMN-03'
  }
];

export const CAMPUS_3D_ROOMS: Room3DSpec[] = [
  // --- GROUND FLOOR ---
  {
    id: 'SUB-01',
    name: 'Main 11kV Substation & HV Switchgear',
    code: 'SUB-01',
    layerId: 'ground',
    department: 'Electrical Works & Grid Infrastructure',
    capacity: '1,500 kVA (2x 750 kVA Oil-Cooled Transformers)',
    powerBusConnection: 'Grid Feeder 11kV / Primary Bus A & B (415V 3Ø)',
    networkNode: 'RTU-SCADA-01 (Fiber Optic Ring)',
    standardLoadKW: 340,
    criticality: 'CRITICAL',
    description: 'Central campus power intake stepping down 11,000V utility grid to 415V 3-phase building distribution with automated SF6 circuit breakers.',
    dimensions: { width: 11, depth: 7.5, height: 3.4 },
    position: [-9.5, 1.7, -4.5],
    equipment: ['Transformer T-01 (750kVA)', 'Transformer T-02 (750kVA)', '11kV SF6 Breakers', 'Bus Duct Riser A-01'],
    backendEntityId: 'SUBSTATION-01'
  },
  {
    id: 'UPS-01',
    name: 'Central UPS & Battery Bank Room',
    code: 'UPS-01',
    layerId: 'ground',
    department: 'Emergency & Uninterruptible Power Systems',
    capacity: '240 kVA N+1 Modular Redundancy',
    powerBusConnection: 'Substation Bus B -> Static Bypass Switch',
    networkNode: 'SNMP-UPS-MON-01',
    standardLoadKW: 85,
    criticality: 'CRITICAL',
    description: 'Dual-conversion online UPS facility with lithium-ion modular rack batteries providing seamless ride-through for computing and research labs.',
    dimensions: { width: 6.5, depth: 7.5, height: 3.4 },
    position: [0.5, 1.7, -4.5],
    equipment: ['APC Symmetra 160kVA', 'Eaton 80kVA Mod', 'LiFePO4 Rack Banks (6x)', 'Fire Suppression FM-200'],
    backendEntityId: 'UPS-LAB-02'
  },
  {
    id: 'SRV-01',
    name: 'Campus Core Datacenter & Server Room',
    code: 'SRV-01',
    layerId: 'ground',
    department: 'Information Technology Infrastructure',
    capacity: '32 High-Density Equipment Racks',
    powerBusConnection: 'Dual Feed: Substation Bus A + UPS Essential Bus',
    networkNode: 'Core Spine Switch C9600 (100Gbps Backbone)',
    standardLoadKW: 110,
    criticality: 'CRITICAL',
    description: 'Tier-III design server vault housing campus ERP, HPC cluster, dark fiber termination, and virtualization storage clusters.',
    dimensions: { width: 8.5, depth: 7.5, height: 3.4 },
    position: [9.5, 1.7, -4.5],
    equipment: ['Spine/Leaf Fabric Racks (8x)', 'HPC Compute Cluster', 'NetApp SAN Storage', 'In-Row Precision Chiller'],
    backendEntityId: 'ROOM-MDF'
  },
  {
    id: 'BUS-01',
    name: 'Campus Electric Bus Bay & Transit Depot',
    code: 'BUS-01',
    layerId: 'ground',
    department: 'Campus Logistics & Clean Mobility',
    capacity: '6 Transit Busses / 4 Fast DC Chargers',
    powerBusConnection: 'Dedicated 415V Bus Feed D-3 (EV Charging Sub)',
    networkNode: 'Wi-Fi 6 IoT Fleet Gateway',
    standardLoadKW: 140,
    criticality: 'STANDARD',
    description: 'Dedicated covered transit bay equipped with automated RFID fleet dispatch and four 60kW DC fast charging stations.',
    dimensions: { width: 28, depth: 7.5, height: 3.4 },
    position: [0, 1.7, 4.5],
    equipment: ['DC Fast Charger 60kW (x4)', 'RFID Gate Sensor', 'Emergency Isolator Pedestal', 'Bus Shelter Canopy'],
    backendEntityId: 'GEN-500KVA'
  },

  // --- FLOOR 1: ACADEMIC WING ---
  {
    id: 'CR-101',
    name: 'Classroom CR-101 (Mathematics & Theory)',
    code: 'CR-101',
    layerId: 'floor1',
    department: 'Department of Applied Sciences',
    capacity: '72 Tiered Student Seats',
    powerBusConnection: 'Riser Shaft A -> Panel LP-1A (230V 1Ø)',
    networkNode: 'Switch Edge-1A (Port 01-12 PoE)',
    standardLoadKW: 18,
    criticality: 'STANDARD',
    description: 'Standard tiered smart classroom with laser projection, acoustic paneling, and integrated motorized lectern.',
    dimensions: { width: 9.5, depth: 7.2, height: 3.2 },
    position: [-9.5, 1.6, 4.6],
    equipment: ['Tiered Student Desks (18 units)', 'Instructor Smart Podium', 'Dual Laser Projector', 'HVAC Air Diffuser'],
    backendEntityId: 'CR-201'
  },
  {
    id: 'CR-102',
    name: 'Classroom CR-102 (Applied Mechanics & Physics)',
    code: 'CR-102',
    layerId: 'floor1',
    department: 'Department of Mechanical Engineering',
    capacity: '72 Tiered Student Seats',
    powerBusConnection: 'Riser Shaft A -> Panel LP-1B (230V 1Ø)',
    networkNode: 'Switch Edge-1A (Port 13-24 PoE)',
    standardLoadKW: 19,
    criticality: 'STANDARD',
    description: 'Acoustically isolated lecture room optimized for physics demonstrations and structural mechanics simulation instruction.',
    dimensions: { width: 9.5, depth: 7.2, height: 3.2 },
    position: [1.5, 1.6, 4.6],
    equipment: ['Tiered Student Desks (18 units)', 'Demonstration Bench', 'Ultra-Short Throw Display', 'Acoustic Ceiling Grid'],
    backendEntityId: 'CR-202'
  },
  {
    id: 'CR-103',
    name: 'Classroom CR-103 (Computer Science & Algorithms)',
    code: 'CR-103',
    layerId: 'floor1',
    department: 'Department of Computer Science & Eng.',
    capacity: '64 Workstations with Gigabit LAN',
    powerBusConnection: 'Riser Shaft B -> Clean Power Panel CP-1A',
    networkNode: 'Switch Edge-1B (48-Port Cat6A 10Gbps Uplink)',
    standardLoadKW: 28,
    criticality: 'MEDIUM',
    description: 'Interactive computational classroom featuring dual-monitor desks, under-floor cable raceways, and dedicated power strips.',
    dimensions: { width: 9.5, depth: 7.2, height: 3.2 },
    position: [-9.5, 1.6, -4.6],
    equipment: ['Dual-Desk Modules (16 units)', 'Instructor Console', 'Under-floor Cable Trays', 'Gigabit Wall Ports'],
    backendEntityId: 'LAB-03-COMP'
  },
  {
    id: 'CR-104',
    name: 'Classroom CR-104 (Electronics & Signal Processing)',
    code: 'CR-104',
    layerId: 'floor1',
    department: 'Electronics & Communication Eng.',
    capacity: '64 Students / Embedded Bench Modules',
    powerBusConnection: 'Riser Shaft B -> Clean Power Panel CP-1B',
    networkNode: 'Switch Edge-1B (Port 25-48 PoE)',
    standardLoadKW: 24,
    criticality: 'MEDIUM',
    description: 'Configurable digital classroom designed for digital signal processing, microcontrollers, and embedded system lectures.',
    dimensions: { width: 9.5, depth: 7.2, height: 3.2 },
    position: [1.5, 1.6, -4.6],
    equipment: ['Modular Bench Desks (16 units)', 'Digital Whiteboard 86"', 'Instructor Station', 'Surge Suppressor Isolators'],
    backendEntityId: 'FEEDER-CR-F2'
  },

  // --- FLOOR 2: RESEARCH & LABS ---
  {
    id: 'VLSI-201',
    name: 'VLSI Design & Nanotech Clean-Prep Lab',
    code: 'VLSI-201',
    layerId: 'floor2',
    department: 'Advanced Microelectronics Center',
    capacity: '32 CAD Workstations / Class 1000 Clean Area',
    powerBusConnection: 'Riser Shaft B -> Clean Isolated Panel ISO-2A (UPS)',
    networkNode: 'HPC Dedicated 25Gbps Fiber Drop F2-VLSI',
    standardLoadKW: 42,
    criticality: 'HIGH',
    description: 'High-end semiconductor CAD facility with clean air filtration, anti-static ESD vinyl flooring, and direct fiber connectivity to compute cluster.',
    dimensions: { width: 9.5, depth: 7.2, height: 3.2 },
    position: [-9.5, 1.6, 4.6],
    equipment: ['Precision CAD Workstations (8 banks)', 'Logic Analyzers & Oscilloscopes', 'ESD Workbench Units', 'Cleanroom Air Filter'],
    backendEntityId: 'LAB-01-EE'
  },
  {
    id: 'ROB-202',
    name: 'Robotics & Autonomous Systems Lab',
    code: 'ROB-202',
    layerId: 'floor2',
    department: 'Mechatronics & Robotics Institute',
    capacity: '28 Engineers / Drone Test Enclosure',
    powerBusConnection: 'Riser Shaft A -> Power Panel 415V/3Ø PP-2B',
    networkNode: 'Low-Latency Wi-Fi 6E AP + 10Gbps Switched Core',
    standardLoadKW: 55,
    criticality: 'HIGH',
    description: 'Experimental robotics lab equipped with industrial 6-DOF robotic arms, motion-capture optical tracking rigs, and protective perimeter mesh.',
    dimensions: { width: 9.5, depth: 7.2, height: 3.2 },
    position: [1.5, 1.6, 4.6],
    equipment: ['6-DOF Robotic Arm Cell (x2)', 'Optical MoCap Camera Gantry', 'Electronics Workbenches (x4)', 'Safety Interlock Cage'],
    backendEntityId: 'LAB-02-ROBOTICS'
  },
  {
    id: 'HV-203',
    name: 'High-Voltage Power Engineering Lab',
    code: 'HV-203',
    layerId: 'floor2',
    department: 'Power Systems & Energy Research',
    capacity: '20 Research Engineers / Isolation Zone',
    powerBusConnection: 'Direct High-Current Feeder HV-FEED-02 from Substation',
    networkNode: 'Optically Isolated DAQ Unit SCADA-HV',
    standardLoadKW: 80,
    criticality: 'HIGH',
    description: 'Specialized high-voltage testing facility featuring Marx impulse generator, dielectric breakdown oil tester, and grounded Faraday safety enclosure.',
    dimensions: { width: 9.5, depth: 7.2, height: 3.2 },
    position: [-9.5, 1.6, -4.6],
    equipment: ['Marx 300kV Impulse Generator', 'Faraday Shield Enclosure', 'Transformer Test Rig', 'Discharge Grounding Wand'],
    backendEntityId: 'FEEDER-LABS-F1'
  },
  {
    id: 'SEM-204',
    name: 'Centennial Seminar Hall & Auditorium',
    code: 'SEM-204',
    layerId: 'floor2',
    department: 'Dean of Academic Affairs',
    capacity: '150 Tiered Auditorium Seats',
    powerBusConnection: 'Riser Shaft B -> Auditorium Distribution Board',
    networkNode: 'Conference AV Network Switch Dante/NDI',
    standardLoadKW: 35,
    criticality: 'MEDIUM',
    description: 'Tiered executive presentation auditorium featuring multi-array theatrical lighting, line-array speakers, and motorized projection screen.',
    dimensions: { width: 12.5, depth: 7.2, height: 3.2 },
    position: [8, 1.6, -4.6],
    equipment: ['Curved Auditorium Seating (150)', 'Presenter Stage & Lectern', 'Audio Line-Array & Lighting Truss', 'Control Booth Console'],
    backendEntityId: 'LH-01'
  },

  // --- ROOF: ADMIN & NETWORK BACKBONE ---
  {
    id: 'ADM-301',
    name: "Dean's Executive Suite & Council Chamber",
    code: 'ADM-301',
    layerId: 'roof',
    department: 'University Executive Administration',
    capacity: '24 Executive Seats & Conference Table',
    powerBusConnection: 'Riser Shaft B -> Admin Panel AP-3A',
    networkNode: 'Secure Encrypted VLAN Node ADM-SEC',
    standardLoadKW: 22,
    criticality: 'HIGH',
    description: 'Executive administration suite, presidential boardroom with teleconference video wall, and secure archival cabinet.',
    dimensions: { width: 11, depth: 7.5, height: 3.2 },
    position: [-8, 1.6, -2.5],
    equipment: ['Executive Boardroom Table', 'Video Conference Wall Display', "Dean's Desk Suite", 'Secure File Archives'],
    backendEntityId: 'PANEL-ENG-MAIN'
  },
  {
    id: 'CTR-302',
    name: 'Campus Central SCADA & NOC Control Center',
    code: 'CTR-302',
    layerId: 'roof',
    department: 'Campus Operations & Energy Management',
    capacity: '12 Operators / 24x7 Continuous Watch',
    powerBusConnection: 'Redundant Dual UPS Feeder NOC-A & NOC-B',
    networkNode: 'Master Network Operations Center (NOC) Core',
    standardLoadKW: 38,
    criticality: 'CRITICAL',
    description: '24x7 campus mission control room monitoring electrical distribution, HVAC chillers, water telemetry, access security, and campus network health.',
    dimensions: { width: 11, depth: 7.5, height: 3.2 },
    position: [8, 1.6, -2.5],
    equipment: ['Curved SCADA Video Wall 6x2', 'Operator Consoles (x4)', 'Emergency Fire Interlock Panel', 'Microwave Link Transceiver'],
    backendEntityId: 'ATS-01'
  },
  {
    id: 'RF-303',
    name: 'Rooftop Solar Array & Telecom Antennas',
    code: 'RF-303',
    layerId: 'roof',
    department: 'Green Energy & Telecommunications',
    capacity: '50 kWp Solar PV / 4-Band RF Mast',
    powerBusConnection: 'Grid Tie Inverter 50kW -> Substation Bus A',
    networkNode: '5G Private Campus Tower & Microwave Link',
    standardLoadKW: -38, // Generating power
    criticality: 'CRITICAL',
    description: 'Array of 120 monocrystalline solar panels linked to grid-tied string inverters, flanked by a 12m steel telecom lattice tower.',
    dimensions: { width: 26, depth: 6, height: 2.2 },
    position: [0, 1.1, 4.5],
    equipment: ['Monocrystalline PV Modules (120x)', 'SMA String Inverters (2x 25kW)', 'Microwave Dish & 5G MIMO Mast', 'Lightning Rod Grid Grounding'],
    backendEntityId: 'SUBSTATION-01'
  }
];

export const CAMPUS_3D_CONDUITS: Conduit3DLine[] = [
  // POWER: Substation -> UPS
  {
    id: 'PWR-FEED-SUB-UPS',
    type: 'POWER',
    sourceRoomId: 'SUB-01',
    targetRoomId: 'UPS-01',
    voltage: '415V 3-Phase',
    points: [
      [-9.5, 0.4, -4.5],
      [-4.0, 0.4, -4.5],
      [0.5, 0.4, -4.5]
    ]
  },
  // POWER: Substation -> Server Room
  {
    id: 'PWR-FEED-SUB-SRV',
    type: 'POWER',
    sourceRoomId: 'SUB-01',
    targetRoomId: 'SRV-01',
    voltage: '415V Redundant',
    points: [
      [-9.5, 0.4, -4.5],
      [-9.5, 0.4, -7.5],
      [9.5, 0.4, -7.5],
      [9.5, 0.4, -4.5]
    ]
  },
  // POWER: Substation -> Bus Bay
  {
    id: 'PWR-FEED-SUB-BUS',
    type: 'POWER',
    sourceRoomId: 'SUB-01',
    targetRoomId: 'BUS-01',
    voltage: '415V High Current',
    points: [
      [-9.5, 0.4, -4.5],
      [-9.5, 0.4, 0.5],
      [0.0, 0.4, 0.5],
      [0.0, 0.4, 4.5]
    ]
  },
  // POWER: Substation -> Riser Shaft A (West Wing Riser)
  {
    id: 'PWR-RISER-A',
    type: 'POWER',
    sourceRoomId: 'SUB-01',
    targetRoomId: 'HV-203',
    voltage: '415V 3Ø Riser',
    points: [
      [-9.5, 0.4, -4.5],
      [-4.5, 0.4, -4.5],
      [-4.5, 0.4, 0.0],
      [-4.5, 3.8, 0.0],
      [-4.5, 7.6, 0.0],
      [-4.5, 11.4, 0.0]
    ]
  },
  // POWER: UPS -> Riser Shaft B (East Wing Clean Power Riser)
  {
    id: 'PWR-RISER-B',
    type: 'POWER',
    sourceRoomId: 'UPS-01',
    targetRoomId: 'CTR-302',
    voltage: '415V Clean UPS Riser',
    points: [
      [0.5, 0.4, -4.5],
      [4.5, 0.4, -4.5],
      [4.5, 0.4, 0.0],
      [4.5, 3.8, 0.0],
      [4.5, 7.6, 0.0],
      [4.5, 11.4, 0.0]
    ]
  },
  // Branch to Floor 1: CR-101
  {
    id: 'PWR-BRANCH-CR101',
    type: 'POWER',
    sourceRoomId: 'SUB-01',
    targetRoomId: 'CR-101',
    voltage: '230V 1-Phase',
    points: [
      [-4.5, 3.8, 0.0],
      [-9.5, 3.8, 0.0],
      [-9.5, 3.8, 4.6]
    ]
  },
  // Branch to Floor 1: CR-102
  {
    id: 'PWR-BRANCH-CR102',
    type: 'POWER',
    sourceRoomId: 'SUB-01',
    targetRoomId: 'CR-102',
    voltage: '230V 1-Phase',
    points: [
      [-4.5, 3.8, 0.0],
      [1.5, 3.8, 0.0],
      [1.5, 3.8, 4.6]
    ]
  },
  // Branch to Floor 1: CR-103
  {
    id: 'PWR-BRANCH-CR103',
    type: 'POWER',
    sourceRoomId: 'UPS-01',
    targetRoomId: 'CR-103',
    voltage: '230V Clean Power',
    points: [
      [4.5, 3.8, 0.0],
      [-4.5, 3.8, 0.0],
      [-9.5, 3.8, 0.0],
      [-9.5, 3.8, -4.6]
    ]
  },
  // Branch to Floor 1: CR-104
  {
    id: 'PWR-BRANCH-CR104',
    type: 'POWER',
    sourceRoomId: 'UPS-01',
    targetRoomId: 'CR-104',
    voltage: '230V Clean Power',
    points: [
      [4.5, 3.8, 0.0],
      [1.5, 3.8, 0.0],
      [1.5, 3.8, -4.6]
    ]
  },
  // Branch to Floor 2: VLSI-201
  {
    id: 'PWR-BRANCH-VLSI201',
    type: 'POWER',
    sourceRoomId: 'UPS-01',
    targetRoomId: 'VLSI-201',
    voltage: '230V Clean Regulated',
    points: [
      [4.5, 7.6, 0.0],
      [-4.5, 7.6, 0.0],
      [-9.5, 7.6, 0.0],
      [-9.5, 7.6, 4.6]
    ]
  },
  // Branch to Floor 2: ROB-202
  {
    id: 'PWR-BRANCH-ROB202',
    type: 'POWER',
    sourceRoomId: 'SUB-01',
    targetRoomId: 'ROB-202',
    voltage: '415V 3-Phase Industrial',
    points: [
      [-4.5, 7.6, 0.0],
      [1.5, 7.6, 0.0],
      [1.5, 7.6, 4.6]
    ]
  },
  // Branch to Floor 2: HV-203
  {
    id: 'PWR-BRANCH-HV203',
    type: 'POWER',
    sourceRoomId: 'SUB-01',
    targetRoomId: 'HV-203',
    voltage: '11kV / 415V Heavy Duty',
    points: [
      [-4.5, 7.6, 0.0],
      [-9.5, 7.6, 0.0],
      [-9.5, 7.6, -4.6]
    ]
  },
  // Branch to Floor 2: SEM-204
  {
    id: 'PWR-BRANCH-SEM204',
    type: 'POWER',
    sourceRoomId: 'UPS-01',
    targetRoomId: 'SEM-204',
    voltage: '230V Audio/AV Clean',
    points: [
      [4.5, 7.6, 0.0],
      [8.0, 7.6, 0.0],
      [8.0, 7.6, -4.6]
    ]
  },
  // Branch to Roof: ADM-301
  {
    id: 'PWR-BRANCH-ADM301',
    type: 'POWER',
    sourceRoomId: 'UPS-01',
    targetRoomId: 'ADM-301',
    voltage: '230V Regulated',
    points: [
      [4.5, 11.4, 0.0],
      [-8.0, 11.4, 0.0],
      [-8.0, 11.4, -2.5]
    ]
  },
  // Branch to Roof: CTR-302
  {
    id: 'PWR-BRANCH-CTR302',
    type: 'POWER',
    sourceRoomId: 'UPS-01',
    targetRoomId: 'CTR-302',
    voltage: 'Dual-Fed UPS 230V',
    points: [
      [4.5, 11.4, 0.0],
      [8.0, 11.4, 0.0],
      [8.0, 11.4, -2.5]
    ]
  },
  // Solar Feed back to Substation: RF-303 -> SUB-01
  {
    id: 'PWR-SOLAR-RETURN',
    type: 'POWER',
    sourceRoomId: 'RF-303',
    targetRoomId: 'SUB-01',
    voltage: '50kW Solar Inverter Bus',
    points: [
      [0.0, 11.4, 4.5],
      [0.0, 11.4, 0.0],
      [-4.5, 11.4, 0.0],
      [-4.5, 0.4, 0.0],
      [-4.5, 0.4, -4.5],
      [-9.5, 0.4, -4.5]
    ]
  },

  // DATA FIBER CONDUITS (from SRV-01 Core Datacenter)
  {
    id: 'DATA-RISER-B',
    type: 'DATA',
    sourceRoomId: 'SRV-01',
    targetRoomId: 'CTR-302',
    bandwidth: '100 Gbps Dark Fiber',
    points: [
      [9.5, 0.8, -4.5],
      [5.0, 0.8, -4.5],
      [5.0, 0.8, -0.5],
      [5.0, 3.8, -0.5],
      [5.0, 7.6, -0.5],
      [5.0, 11.4, -0.5]
    ]
  },
  // Data to CR-103
  {
    id: 'DATA-CR103',
    type: 'DATA',
    sourceRoomId: 'SRV-01',
    targetRoomId: 'CR-103',
    bandwidth: '10 Gbps Cat6A Riser',
    points: [
      [5.0, 3.8, -0.5],
      [-9.5, 3.8, -0.5],
      [-9.5, 3.8, -4.6]
    ]
  },
  // Data to VLSI-201
  {
    id: 'DATA-VLSI201',
    type: 'DATA',
    sourceRoomId: 'SRV-01',
    targetRoomId: 'VLSI-201',
    bandwidth: '25 Gbps High-Speed EDA',
    points: [
      [5.0, 7.6, -0.5],
      [-9.5, 7.6, -0.5],
      [-9.5, 7.6, 4.6]
    ]
  },
  // Data to SCADA NOC CTR-302
  {
    id: 'DATA-CTR302',
    type: 'DATA',
    sourceRoomId: 'SRV-01',
    targetRoomId: 'CTR-302',
    bandwidth: '40 Gbps Telemetry Core',
    points: [
      [5.0, 11.4, -0.5],
      [8.0, 11.4, -0.5],
      [8.0, 11.4, -2.5]
    ]
  },
  // Data to Rooftop RF Mast RF-303
  {
    id: 'DATA-RF303',
    type: 'DATA',
    sourceRoomId: 'SRV-01',
    targetRoomId: 'RF-303',
    bandwidth: '5G Baseband Interlink',
    points: [
      [5.0, 11.4, -0.5],
      [0.0, 11.4, -0.5],
      [0.0, 11.4, 4.5]
    ]
  }
];
