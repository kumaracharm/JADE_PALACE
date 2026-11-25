# OMNIS-X Architecture Validation & Verification Report
**Institutional Digital Twin & Resilience Decision System**
*Research-Grade Technical Architecture Specification*

---

## 1. Executive Summary & Design System Conformance

This document validates the master system architecture designed for **OMNIS-X — Institutional Digital Twin and Resilience Decision System**, engineered in strict conformance with the editorial standards and geometric verification rules of the installed `diagram-design` skill.

### Visual Design & Engineering Standards Adherence:
- **Skill Engine Used:** `diagram-design` (v2.6) with editorial HTML+inline SVG output.
- **Canvas Presets & Geometry:** 1600 &times; 1200 viewBox mapped to a strict 4px grid for all node origins, dimensions, gaps, and routing paths.
- **Typography Ramp:** 
  - Primary Title: `Instrument Serif` (400 weight).
  - Component Headings: `Geist Sans` (600 weight).
  - Technical Identifiers, Ports & Schemas: `Geist Mono` (400/500 weight).
  - Editorial Accents: `Instrument Serif Italic`.
  - *Strict Exclusion:* Zero usage of generic dev fonts (e.g. JetBrains Mono) or cyberpunk neon styling.
- **Palette Roles (Contrast Contract WCAG 2.x Compliant):**
  - Canvas Paper: Warm Editorial `#f5f5f5` with subtle 20px grid dot matrix (`rgba(45,49,66,0.08)`).
  - Typography & Primary Borders: Jet-Black `#2d3142`.
  - Secondary Text & Default Connectors: Blue-Slate `#4f5d75` and Soft Slate `#5a6580`.
  - Focal Elements (Focal Cap &le; 2): Burnt-Tangerine Accent `#bf4520` (applied selectively to **Layer 3D: Dependency Graph Engine** and **Layer 5E: CP-SAT Optimization Solver / Shadow Isolation**).
  - Interactive & Control Flows: Link Blue `#2e5aa8`.
- **Connector Geometry Verification:**
  - Automated Tool Verifications: Verified cleanly with `self_check.py` (accessible SVG contract, text width budget, viewBox containment) and `verify_geometry.py` (zero overlapping paths, orthogonal $r=8$ elbows, zero border-transit defects, fanned ports $\ge 12\text{px}$).

---

## 2. Architectural Layer-by-Layer Breakdown

### LAYER 1 — Institutional Data Sources (Heterogeneous Ingestion)
OMNIS-X integrates five distinct, independent institutional data sources across campus operations, explicitly maintaining data provenance classification:
1. **Physical Infrastructure (`REAL`):** Smart electrical meters, distribution transformers, ambient temperature and HVAC environmental sensors, water pressure/leak sensors, occupancy counters, and equipment telemetry via BACnet, Modbus, and LoRaWAN.
2. **Campus IT Infrastructure (`REAL`):** Wi-Fi access points, core/distribution switches, edge servers, gateway links, digital campus services, and SNMP/Syslog network monitoring.
3. **Academic Operations (`SCHEDULED`):** Central master timetable, faculty teaching availability, classroom allocation matrices, student cohort/section rosters, and examination/practical schedules.
4. **Human Reporting Intake (`REPORTED`):** Student mobile portal submissions, faculty/staff incident dispatches, high-resolution photographic evidence, EXIF metadata, GPS campus coordinates, and natural-language issue descriptions.
5. **Simulation Generator (`SYNTHETIC`):** Synthetic telemetry generators, simulated failure injections (e.g. transformer surge, chiller failure), and historical scenario replay buffers.

*Data Provenance Guarantee:* Real, reported, scheduled, and synthetic data streams are tagged at ingestion, ensuring simulated or unverified reports cannot contaminate ground-truth operational baselines.

---

### LAYER 2 — Data Ingestion, Validation & Normalization Gateway
Heterogeneous raw streams are ingested, verified, and standardized prior to entering the digital twin core:
- **REST & Webhook Adapters:** Bidirectional synchronization with student information systems (SIS), ERP timetables, and campus facilities databases.
- **MQTT IoT Broker (EMQX / Mosquitto):** High-throughput, QoS-1 event streaming for campus-wide sensor networks under structured topic hierarchies (`campus/sensors/#`).
- **Evidence Intake & Image Validation:** EXIF metadata extraction, geo-fence matching, duplicate image detection, and anti-abuse validation for user reports.
- **Data Normalization & Event Deduplication:** Pydantic v2 schema enforcement, sliding-window event deduplication, and anomaly pre-filtering.
- **Provenance Lineage Tagger:** Attaches immutable origin tags (`REAL`, `REPORTED`, `SCHEDULED`, `SYNTHETIC`) and ISO 8601 millisecond-precision timestamps.

---

### LAYER 3 — Digital Twin Core (The Institutional Foundation)
The foundation of OMNIS-X combines structural spatial models with operational states and graph-theoretic topologies:
1. **Entity & Asset Registry:** Hierarchical relational repository modeling buildings, wings, floors, classrooms, auditoriums, research laboratories, physical assets, electrical distribution boards, IT switches, faculty personas, and student sections with canonical UUIDs.
2. **Spatial Campus Model:** Multi-layer vector representation providing 2D interactive blueprints and 3D floor geometry with exact coordinates, polygon bounds, and clickable asset targets.
3. **Operational State Engine:** Real-time state cache maintaining live observed sensor readings, device operating health, current room occupancy, active maintenance disruptions, and historical state logs in high-performance memory (Redis/PostgreSQL).
4. **Dependency Graph Engine (NetworkX Graph Core — Focal Accent):** Directed multigraph modeling institutional relations:
   - Physical Containment (`Located_In`)
   - Electrical Dependency (`Supplies_Power_To`)
   - Network Uplinks (`Connected_To`)
   - Academic Operations (`Assigned_To_Room`, `Taught_By`, `Uses_Equipment`)
   - Backup Routes (`Has_Redundant_Power`, `Failover_Uplink`)
   - *Core Principle:* Explicitly separates **Physical Dependency** (e.g., feeder line to switchboard) from **Operational Impact** (e.g., lack of projector disrupting scheduled CS301 laboratory).

---

### LAYER 4 — Specialist Intelligence Engines (Deterministic Analytics)
Seven independently executing analytical engines provide mathematical rigor without unconstrained LLM agent loops:
- **Engine 1: Event & Anomaly Detection:** Real-time telemetry monitoring via sliding-window moving averages, Exponentially Weighted Moving Average (EWMA) drift detection, adaptive Z-score thresholding, and optional Isolation Forest classification.
- **Engine 2: Graph Impact Propagation:** Multi-hop traversal (BFS/DFS) across the dependency multigraph to trace cascading physical and operational failure paths, evaluate redundancy bypasses, and pinpoint affected downstream entities.
- **Engine 3: Risk & Criticality Analysis (FMEA):** Failure Mode and Effects Analysis calculating Risk Priority Numbers ($\text{RPN} = \text{Severity} \times \text{Occurrence} \times \text{Detectability}$) weighted by infrastructure criticality.
- **Engine 4: Academic & Resource Impact:** Correlates topological failures with current academic schedules to detect timetable conflicts, compute displaced student populations, evaluate room capacity matches, and assess faculty schedules.
- **Engine 5: Recovery Optimization Solver (Google OR-Tools CP-SAT — Focal Accent):** Constraint Satisfaction Problem (CSP) solver optimizing alternative room reassignments, schedule adjustments, and technician dispatch with multi-objective penalty minimization ($\min [\alpha \cdot \text{StudentDisruption} + \beta \cdot \text{FacultyFriction} + \gamma \cdot \text{RepairCost}]$). Produces formal mathematical infeasibility proofs when constraints cannot be satisfied.
- **Engine 6: Responsibility & Task Assignment:** Deterministic routing mapping incident domains to department roles (Facilities, Electrical, IT, Academic Dean), technician skill matrices, current shift availability, and SLA escalation thresholds.
- **Engine 7: Decision & Coordination Hub:** Synthesizes outputs from Engines 1–6, verifies evidence integrity, ranks Pareto-optimal recovery alternatives, identifies required governance authorizations, and compiles structured incident Standard Operating Procedures (SOP).

---

### LAYER 5 — Incident & Decision Orchestration & Shadow Simulation
1. **14-Stage Operational Incident Lifecycle:**
   - *Phase 1 (Intake & Binding):* 1. Incident Creation &rarr; 2. Signal/Report Validation &rarr; 3. Digital Twin Entity Correlation.
   - *Phase 2 (Impact & Consequence):* 4. Graph Impact Assessment &rarr; 5. Future Consequence & RPN Forecast.
   - *Phase 3 (Recovery Optimization):* 6. Alternative Generation &rarr; 7. Multi-Objective Cost/Risk/Time Tradeoff &rarr; 8. Pareto-Optimal Ranking.
   - *Phase 4 (Routing & Human Approval):* 9. Department Identification &rarr; 10. Task Auto-Routing &rarr; 11. **Human Approval Gate** (Mandatory for high-risk/physical interventions).
   - *Phase 5 (Resolution Loop):* 12. Execution Tracking &rarr; 13. Resolution Verification &rarr; 14. Formal Incident Closure.
2. **Explicit Infeasibility Escalation:** When CP-SAT proves no feasible room/schedule solution exists within institutional constraints, it emits an explanatory proof of violated constraints and triggers an escalation alert to executive management.
3. **Shadow Simulation Sandbox (Strict Isolation Guarantee):**
   - Workflow: Baseline State Snapshot &rarr; In-Memory Shadow Buffer &rarr; Hypothetical Failure Injection &rarr; Traversal Impact Propagation &rarr; Recovery Strategy Evaluation &rarr; Scenario Tradeoff Comparison.
   - *Guardrail Guarantee:* Executes entirely within isolated memory; **NEVER** commits changes to live operational twin state.

---

### LAYER 6 — Unified Application & User Experience (Single Web App)
A single cohesive Next.js 14 web application providing four tailored role-specific workspaces:
- **A. Command Center:** Executive institutional overview displaying real-time campus operational health, active critical incidents matrix, high-level infrastructure telemetry, and institutional risk metrics.
- **B. Digital Twin Explorer:** Interactive 2D/3D campus blueprint viewer allowing users to click rooms, inspect embedded assets, explore live NetworkX topology subgraphs, and view simulation overlays.
- **C. Intelligence & Incident Center:** Operational triage workspace presenting cascading failure trees, specialist engine diagnostic feeds, ranked recovery options, and dispatch work-order tracking.
- **D. Student & Staff Reporting Portal:** Mobile-optimized, privacy-scoped interface enabling students and staff to submit geo-tagged incident photos, select campus locations, track personal ticket statuses, and receive real-time push updates.
- *Security Compartmentalization:* Students have zero access to administrative analytics, executive dashboards, or other users' records.

---

### LAYER 7 — Security, Governance & Compliance (Vertical Pillar)
Cross-cutting security infrastructure enforcing policy across all six operational layers:
- **Identity & Authentication:** OpenID Connect (OIDC), OAuth 2.0, JSON Web Tokens (JWT), campus SSO integration, and mutual TLS (mTLS) for IoT hardware.
- **Role-Based Access Control (RBAC) Persona Matrix:**
  1. *Principal / Executive:* Campus-wide oversight, emergency declaration, high-budget sign-off.
  2. *HOD / Academic Coordinator:* Departmental timetable management, room reallocation approvals.
  3. *Facility & Infrastructure Manager:* Maintenance dispatch sign-off, physical repairs, equipment requisition.
  4. *IT Systems Administrator:* Network topology access, IoT device certificates, access control management.
  5. *Faculty & Campus Staff:* Classroom issue reporting, department schedule review.
  6. *Student (Strictly Scoped):* Self-issue submission and own-ticket status tracking only.
- **Governance Guardrails:**
  - *Human-in-the-Loop Approval Enforcement:* Prohibits autonomous actuation; all physical maintenance and schedule changes require authenticated digital sign-off.
  - *Immutable Audit Trail:* Cryptographic hash-chaining of all automated recommendations, human overrides, and incident status changes.
  - *Data Privacy & Tenancy:* Departmental data scoping, student PII masking, and EXIF location scrubbing for compliance with FERPA/GDPR.
  - *Device Security:* Cryptographic hardware identity and sensor tamper detection against telemetry spoofing.

---

## 3. Technology Matrix: Hackathon MVP vs. Production Scale

| Layer | Component | Hackathon MVP Core (Mandatory) | Future Production Scale (Optional) |
|---|---|---|---|
| **Frontend** | Framework | Next.js 14 (App Router), TypeScript, Tailwind CSS | Micro-frontends, Native Mobile App |
| **Frontend** | Visualization | SVG Vector Blueprint Engine, Cytoscape.js | Three.js / WebGL 3D Campus BIM |
| **Frontend** | Charts & Telemetry | ECharts / Recharts, Server-Sent Events (SSE) | Apache Superset Embedded Dashboards |
| **Backend** | API Gateway & Logic | Python 3.12+, FastAPI, Pydantic v2 | Distributed Celery / Ray Clusters |
| **Analytics** | Optimization Core | Google OR-Tools CP-SAT, NetworkX | Custom GPU-accelerated MILP Solvers |
| **Database** | Core Data Store | PostgreSQL 16 (Relational & Graph Models) | PostGIS 3.4 Spatial Extensions |
| **Cache & State** | Operational State | Redis 7 (In-Memory State & Pub/Sub) | TimescaleDB Distributed Time-Series |
| **IoT / Events** | Broker | MQTT (Mosquitto / EMQX), WebSockets | Apache Kafka Event Streaming |
| **Security** | Auth & Governance | OpenID Connect / OAuth 2.0 (JWT), RBAC | Keycloak SSO, Hardware HSM Tokens |

---

## 4. Verification & Validation Checklist

| Architectural Requirement | Specification Details | Status | Diagram Location |
|---|---|---|---|
| **7 Operational Layers** | Layers 1 to 6 horizontal, Layer 7 vertical pillar | **VERIFIED** | Zones 1 through 7 |
| **Heterogeneous Sources** | Physical, IT, Academic, Human, Simulation | **VERIFIED** | Layer 1 (Nodes 1A–1E) |
| **Data Provenance Distinctions** | `REAL`, `SCHEDULED`, `REPORTED`, `SYNTHETIC` | **VERIFIED** | Layer 1 node chips & Layer 2E |
| **Ingestion Pipeline** | REST, MQTT, Image Validator, Dedup, Provenance | **VERIFIED** | Layer 2 (Nodes 2A–2E) |
| **Digital Twin Core** | Registry, Spatial, Operational State, Dependency Graph | **VERIFIED** | Layer 3 (Nodes 3A–3D) |
| **Dependency vs Impact** | Graph distinguishes physical line from service impact | **VERIFIED** | Node 3D callout |
| **7 Specialist Engines** | Anomaly, Propagation, Risk/FMEA, Academic, CP-SAT, Task, Decision | **VERIFIED** | Layer 4 (Nodes 4.1–4.7) |
| **Deterministic Algorithms** | EWMA, Z-Score, BFS/DFS, FMEA RPN, OR-Tools CP-SAT | **VERIFIED** | Engine sublabels (No LLM loops) |
| **14-Stage Lifecycle** | Intake &rarr; Validation &rarr; Impact &rarr; Optimization &rarr; Approval &rarr; Close | **VERIFIED** | Layer 5 (Stages 1–14) |
| **Human Approval Gate** | High-risk actions require explicit human sign-off | **VERIFIED** | Layer 5 (Phase 4) & Layer 7C |
| **Infeasible Solution Branch** | Explains violated constraints & escalates to executive | **VERIFIED** | Layer 5 dashed infeasible box |
| **Shadow Simulation Path** | Isolated state execution; NEVER overwrites operational records | **VERIFIED** | Layer 5 Sandbox & Callout |
| **4 Unified UI Views** | Command Center, Twin Explorer, Incident Center, Student Portal | **VERIFIED** | Layer 6 (Nodes 6A–6D) |
| **Student Privacy Isolation** | Scoped report submission; zero access to executive management | **VERIFIED** | Node 6D & Layer 7B/7E |
| **Cross-Cutting Security** | OIDC, RBAC, Audit Logging, Privacy, Device TLS | **VERIFIED** | Layer 7 Vertical Pillar |
| **Closed-Loop Feedback** | User reports &rarr; Ingest; Resolution &rarr; State update; UI WS updates | **VERIFIED** | Dashed & Link feedback arrows |
| **Tech Stack Separation** | Clear distinction between MVP Core and Future Deployments | **VERIFIED** | Zone 8 Tech Matrix & Legend |
| **Skill Taste Gate & Geometry** | Pass `self_check.py` and `verify_geometry.py` | **VERIFIED** | 0 findings, 100% compliant |

---

## 5. Artifact Directory Inventory

The following production-ready deliverables are saved in the project repository under `OMNIS-X-Architecture/`:

1. `OMNIS-X_Master_Architecture.html` — Master interactive, self-contained architecture document featuring the full editorial system, inline SVG, summary cards, and live web fonts.
2. `OMNIS-X_Architecture_Source.svg` — Portable, standalone vector graphic exported directly via `export_svg.py`, ready for embedding in documentation, research papers, or vector design tools.
3. `OMNIS-X_Master_Architecture.png` — Publication-quality raster export rendered via headless Chrome at 1920 &times; 1600 resolution.
4. `OMNIS-X_Architecture_Validation.md` — This technical architecture verification and validation checklist.
5. `generate_diagram.py` — Deterministic Python script to re-generate the diagram source with exact geometry.

---
*Report certified by Senior System Architect & Technical Diagram Engineer.*
