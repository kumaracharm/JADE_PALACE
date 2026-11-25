# OMNIS-X — Institutional Cyber-Physical Digital Twin & Resilience Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.162.0-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-black.svg?style=flat&logo=next.js)](https://nextjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL%200.187-000000.svg?style=flat&logo=three.js)](https://threejs.org/)
[![Google OR-Tools](https://img.shields.io/badge/Google%20OR--Tools-CP--SAT%209.15-4285F4.svg?style=flat&logo=google)](https://developers.google.com/optimization)
[![NetworkX](https://img.shields.io/badge/NetworkX-3.6.1-orange.svg?style=flat)](https://networkx.org/)
[![Pytest](https://img.shields.io/badge/Pytest-22%20Passed-brightgreen.svg?style=flat)](https://pytest.org/)
[![Python](https://img.shields.io/badge/Python-3.14.5-3776AB.svg?style=flat&logo=python)](https://www.python.org/)

> **A Unified Intelligence Layer for Institutional Resilience**  
> An institutional cyber-physical digital twin representing university infrastructure as a unified system — connecting 11kV electrical substations, distribution switchgear, core IT datacenters, academic spaces, student cohorts, telemetry streams, and automated cascading failure decision support.

---

## 🏛️ System Overview

OMNIS-X unites campus physical infrastructure and cyber systems into an interactive, real-time operational twin:

```
               ┌────────────────────────────────────────────────────────┐
               │            OMNIS-X UNIFIED INTELLIGENCE LAYER          │
               └───────────────────────────┬────────────────────────────┘
                                           │
         ┌─────────────────────────────────┼────────────────────────────────┐
         │                                 │                                │
┌────────▼────────┐               ┌────────▼────────┐              ┌────────▼────────┐
│ PHYSICAL TWIN   │               │ ELECTRICAL GRID │              │ CYBER & IT CORE │
├─────────────────┤               ├─────────────────┤              ├─────────────────┤
│ • 4 Floor Slabs │               │ • 11kV Substation│             │ • Core Datacenter
│ • 15 Room Specs │               │ • Dual Transformers            │ • Dark Fiber    │
│ • Column Grids  │               │ • 240kVA UPS    │              │ • 100G Backbone │
│ • Riser Shafts  │               │ • 415V Risers   │              │ • SCADA NOC     │
└─────────────────┘               └─────────────────┘              └─────────────────┘
```

---

## 🌟 Key Capabilities

### 1. Cinematic 3D Introduction
- **Monotone Cubic Hermite Spline Engine:** Evaluates camera trajectories using Fritsch-Carlson $C^1$ continuity for smooth acceleration and deceleration without hitches.
- **Lighting & Post-Processing:** ACESFilmic tone mapping, directional rim lighting, and atmospheric stardust particle system.
- **Central Energy Convergence:** Climax plasma charge at the utility core with radial flash and blur-to-sharp text reveal.

### 2. Interactive 4-Level Campus Digital Twin
- **4 Architectural Planes:** `LEVEL 00` Utility Core, `LEVEL 01` Academic Wing, `LEVEL 02` Research Laboratories, `LEVEL 03` Administration & NOC.
- **Structural CAD Modeling:** Translucent floor slabs, structural columns grid, corridor walls, and detailed interior CAD equipment (transformers, battery racks, server clusters, robotics cells, Marx impulse towers, auditorium seating, and SCADA video walls).
- **Interactive Camera Controls:** OrbitControls with smooth damping and presets (`ISO`, `TOP`, `FRONT`, `SIDE`).
- **Exploded View Slider:** Real-time vertical floor separation from $0.0\text{m}$ to $8.0\text{m}$.
- **Raycast Room Inspection:** Click any room in the 3D canvas to focus the camera and populate the real-time Entity Inspector with live sensor telemetry and upstream/downstream dependencies.

### 3. Utility Conduits & Animated Signal Flow
- **Dual Grid Infrastructure:** Electrical Power Grid in **Gold (`#D4AF37`)** and IT Data Backbone in **Dusty Purple (`#9D8EB5`)**.
- **Dynamic Pulses:** 3D Catmull-Rom spline curves with continuous animated signal pulses streaming between risers and rooms.

### 4. Counterfactual Chaos & Cascading Failure Simulation
- **Shadow Twin Engine:** Injects failure scenarios (e.g., Feeder Breaker Trip, Core Switch Outage, Transformer Overheat).
- **Automated Failure Propagation:** Cuts power lines, silences signal pulses on severed branches, highlights affected rooms in pulsing red/amber alert states, while preserving redundant backups (e.g., UPS and generator feeds).

### 5. Multi-View Spatial Intelligence
- **3D Twin:** Full Three.js WebGL canvas.
- **Spatial 2D:** Interactive SVG floor plan with room occupancy and circuit overlays.
- **Topology Graph:** Interactive Cytoscape dependency graph mapping cross-domain edges.

---

## 📁 Repository Structure

```
OMNIS-X/
├── omnis-x/
│   ├── backend/                     # FastAPI Backend Application
│   │   ├── api/                     # REST API Endpoints (Campus, Events, Incidents, Simulations)
│   │   ├── engines/                 # 7 Specialist Resilience & Optimization Engines
│   │   │   ├── e1_detection.py      # Telemetry anomaly & EWMA detection
│   │   │   ├── e2_propagation.py    # Graph blast radius & redundancy checking
│   │   │   ├── e3_risk.py           # Explainable FMEA RPN risk scoring
│   │   │   ├── e4_academic.py       # Timetable displacement & conflict analysis
│   │   │   ├── e5_optimization.py   # Google OR-Tools CP-SAT recovery optimizer
│   │   │   ├── e6_assignment.py     # RACI & technician dispatch routing
│   │   │   └── e7_coordination.py   # Consolidated multi-tier decision plan
│   │   ├── graph/                   # NetworkX computational graph core
│   │   ├── ml_lab/                  # ML pipelines, trained models & synthetic generators
│   │   ├── models/                  # SQLAlchemy ORM database models
│   │   ├── schemas/                 # Pydantic v2 validation schemas
│   │   ├── seeds/                   # Idempotent campus database reference dataset
│   │   ├── database.py              # Database connection session manager
│   │   └── main.py                  # FastAPI application entrypoint & lifespan
│   ├── frontend/                    # Next.js 16 (App Router) + React 19 Frontend
│   │   ├── src/
│   │   │   ├── app/                 # Root layout, globals.css & page entry
│   │   │   ├── components/
│   │   │   │   ├── canvas3d/        # Interactive 3D Three.js Campus Digital Twin
│   │   │   │   ├── cinematic/       # 3D Cinematic Introduction with Hermite splines
│   │   │   │   ├── canvas/          # 2D SVG Spatial Floor Plan Canvas
│   │   │   │   ├── graph/           # Cytoscape Dependency Graph View
│   │   │   │   ├── inspector/       # Autodesk Tandem-style Entity Inspector
│   │   │   │   ├── navigation/      # TopNav & ToolRail controls
│   │   │   │   ├── simulation/      # Counterfactual Chaos Simulation Modal
│   │   │   │   └── timeline/        # Telemetry Timeline & Multi-metric ECharts
│   │   │   ├── data/                # 3D Campus coordinates & spatial topologies
│   │   │   ├── services/            # API integration layer
│   │   │   └── types/               # TypeScript definitions
│   │   └── package.json
│   ├── tests/                       # Complete Pytest test suite (22/22 passing)
│   ├── omnis_x.db                   # Pre-seeded SQLite database (31 entities, 26 edges)
│   ├── requirements.txt             # Python backend dependencies
│   └── pytest.ini
├── OMNIS-X-Architecture/            # Architectural blueprints, SVG specs & diagrams
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Python 3.10+** (tested on Python 3.14.5)
- **Node.js 18+** / **pnpm 9+**

### 2. Backend Setup
```bash
cd omnis-x

# Install Python dependencies
pip install -r requirements.txt

# Run backend test suite (22 tests)
pytest -v tests/

# Launch FastAPI server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
- API Docs: `http://127.0.0.1:8000/docs`
- Health Probe: `http://127.0.0.1:8000/health`

### 3. Frontend Setup
```bash
cd omnis-x/frontend

# Install dependencies
pnpm install

# Build production bundle
pnpm build

# Launch frontend application
pnpm start
```
- Digital Twin Explorer: `http://localhost:3000`

---

## 🧪 Verification & Quality Assurance

- **Backend Pytest Suite:** `22 passed in 2.00s`
- **Frontend TypeScript Build:** `Compiled successfully in 13.7s, 0 errors`
- **CDP Headless Verification:** Tested across 4 viewports ($1920 \times 1080$, $1600 \times 900$, $1366 \times 768$, $1280 \times 720$) with zero layout overflow and zero console errors.

---

## 📄 License
Academic & Research License — Institutional Resilience Decision Support.
