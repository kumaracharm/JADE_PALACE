# OMNIS-X Student Grievance PWA — Complete Architecture & Engine Integration Guide

## 1. What Was Built (Full System Overview)

This project is a **phone-first Progressive Web App (PWA)** paired with a **SQLite relay backend** and a **separated OMNIS-X (`JADE_PALACE`) engine connector**. It matches the OMNIS-X Charcoal (`#0E0F12`), Gold (`#D4AF37`), and Dusty Purple (`#9D8EB5`) aesthetic while keeping the mobile student workflow calm and distraction-free.

### A. PWA Views & Dashboard Breakdown

1. **Top Navigation Bar (`public/index.html`, `public/styles.css`)**
   - **Brand Block**: Gold `Ω` insignia badge, `OMNIS-X` title, `STUDENT PWA` badge, and institution subtitle (`Apex Institute of Technology`).
   - **Breadcrumb (Desktop)**: Shows `Engineering Block › LEVEL XX (...)` synchronized with the currently selected floor.
   - **Desktop Map Mode Switch (`Spatial 2D` | `3D Twin`)**: Defaults to lightweight `Spatial 2D` on all devices; lazy-loads Three.js (`campusMap3d.js`) only if a desktop user clicks `3D Twin`.
   - **Online / Offline Pill + Sync & Install Buttons**: Shows live network state (`ONLINE` / `OFFLINE`), surfaces `Sync (N)` whenever IndexedDB holds queued offline reports, and exposes `Install` when `beforeinstallprompt` fires.

2. **Interactive Campus Map (`public/src/campusMap2d.js` + optional `public/src/campusMap3d.js`)**
   - **4 Architectural Levels (`LAYERS` in `public/src/campusData.js`)**:
     - `ground` (`LEVEL 00`): Infrastructure & Utility Core (`SUB-01`, `UPS-01`, `SRV-01`, `BUS-01`)
     - `floor1` (`LEVEL 01`): Academic Wing & Lecture Halls (`CR-101`, `CR-102`, `CR-103`, `CR-104`)
     - `floor2` (`LEVEL 02`): Research & Advanced Laboratories (`VLSI-201`, `ROB-202`, `HV-203`, `SEM-204`)
     - `roof` (`LEVEL 03`): Administration & Telemetry Backbone (`ADM-301`, `CTR-302`, `RF-303`)
   - **Tap-Anywhere Coordinate Pinning**: Tapping inside any room on the 2D SVG floor plan (`viewBox="-17.8 -10.3 35.6 20.6"`) converts screen coordinates into exact campus `[x, y, z]` coordinates, drops a Gold pin, highlights the room, populates that room's equipment chips, and locks the mapped OMNIS-X `backendEntityId`.
   - **Live Issue Badges**: Rooms with active (`SUBMITTED`, `ACKNOWLEDGED`, `IN_PROGRESS`) grievances display count badges (amber for standard/high, coral red `#E05D5D` for `CRITICAL`).

3. **Tab 1 — Report Issue (Student Grievance Form)**
   - **Step 1 (Location)**: Inline 2D floor plan on phones, synced room dropdown (`#room-select`), touch-friendly equipment chips (`#equipment-chips`), and optional spot note (`#location-note`).
   - **Step 2 (Problem Category)**: 8 categories (`water`, `ac`, `faculty`, `electrical`, `network`, `cleanliness`, `infrastructure`, `other`) including **Teacher Not Present** (`faculty`), each with one-tap sub-category chips that auto-fill headlines.
   - **Step 3 (Details & Submit)**: Headline, Urgency (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), description, client-side compressed photo evidence (`max 800px` JPEG), optional anonymous toggle, and locally remembered student profile (`localStorage`).
   - **Offline Queue (`public/src/offlineQueue.js`)**: If offline or unreachable, submissions are saved in IndexedDB (`campuspulse_offline_db`) and automatically flushed on the `online` event.

4. **Tab 2 — Campus Status (Live Facility Dashboard)**
   - **6 System Health Cards**: `Water & Coolers`, `Air Conditioning`, `Teacher / Classes`, `Power & Lights`, `Wi-Fi & Labs`, `Hygiene & Facility`.
     - Computed status levels: `OPERATIONAL` (0 open), `ADVISORY` (1 open non-high/critical), `DEGRADED` (2+ open or 1+ `HIGH`), `CRITICAL` (1+ `CRITICAL`).
     - Lists affected room codes directly inside each card.
   - **Filterable Grievance Feed**: Filter by category, status (`SUBMITTED`, `ACKNOWLEDGED`, `IN_PROGRESS`, `RESOLVED`), or keyword search (`ticketCode`, room code, equipment, description). Clicking a card highlights that room on the floor plan.

5. **Tab 3 — OMNIS-X Sync & Admin Triage**
   - **Connection Settings Form**: Configure institution name, mode (`OMNIS-X Incident API` vs `Custom Website Webhook`), Target Website URL, `X-User-Id` header, optional `Authorization` / API key, auto-forward toggle, and `Test Ping`.
   - **Ticket Triage List**: Update ticket status (`SUBMITTED` → `ACKNOWLEDGED` → `IN_PROGRESS` → `RESOLVED`), attach resolution notes, view sync status (`forwarded (200)`, `saved_locally (...)`, `local_only`), and export all tickets to JSON.

---

## 2. Separated Files for Connecting to the Actual Engine

All engine connection logic is isolated into **4 dedicated files** so you never need to modify UI or floor-plan files when a new IP is assigned:

| File | Role | Edit when IP changes? |
| :--- | :--- | :--- |
| `engine_config.json` | Single JSON config for PWA host/port + actual OMNIS-X Engine URL (`engine_base_url`), `engine_user_id`, and auth header. | **Yes (Relay Mode)** |
| `engine_connector.py` | Pure Python module (stdlib only) that maps `roomId` → `backendEntityId`, builds OMNIS-X `IncidentCreate` JSON, dispatches `POST`, and pings `/health`. | No (drop-in module) |
| `public/engine.config.js` | Single JS config selecting `'relay'` vs `'direct'` mode and setting `engineBaseUrl` (`http://<NEW_IP>:8000`) for direct browser-to-engine calls. | **Yes (Direct Mode)** |
| `public/src/engineClient.js` | Frontend API adapter handling both Relay (`/api/*`) and Direct (`http://<NEW_IP>:8000/api/v1/incidents`) calls cleanly. | No (drop-in module) |

### Room-to-Engine Entity Mapping (`ROOM_TO_OMNISX_ENTITY`)

| PWA Room ID | OMNIS-X `root_entity_id` | PWA Room ID | OMNIS-X `root_entity_id` |
| :--- | :--- | :--- | :--- |
| `SUB-01` | `SUBSTATION-01` | `VLSI-201` | `LAB-01-EE` |
| `UPS-01` | `UPS-LAB-02` | `ROB-202` | `LAB-02-ROBOTICS` |
| `SRV-01` | `ROOM-MDF` | `HV-203` | `FEEDER-LABS-F1` |
| `BUS-01` | `GEN-500KVA` | `SEM-204` | `LH-01` |
| `CR-101` | `CR-201` | `ADM-301` | `PANEL-ENG-MAIN` |
| `CR-102` | `CR-202` | `CTR-302` | `ATS-01` |
| `CR-103` | `LAB-03-COMP` | `RF-303` | `SUBSTATION-01` |
| `CR-104` | `FEEDER-CR-F2` | | |

---

## 3. How to Connect When a New IP Is Assigned

### Option A — Relay Mode (Recommended across different IPs / phones on LAN)
Keep `public/engine.config.js` as `mode: 'relay'`. This avoids browser CORS issues and keeps SQLite + offline fallback active.

1. Edit `engine_config.json` with your new Engine IP:
   ```json
   {
     "pwa_host": "0.0.0.0",
     "pwa_port": 8090,
     "engine_mode": "omnisx",
     "engine_base_url": "http://192.168.1.50:8000",
     "engine_incidents_path": "/api/v1/incidents",
     "engine_health_path": "/health",
     "engine_user_id": "USR-PRINCIPAL",
     "auto_forward": true
   }
   ```
   *(Or pass at launch without editing files: `ENGINE_BASE_URL=http://192.168.1.50:8000 python3 server.py`)*
2. You can also update the URL live in the **OMNIS-X Sync** tab and click **Test Ping**.

### Option B — Drop Separated Files Directly Into Existing `JADE_PALACE` (`omnis-x`)
1. Copy `public/` into `omnis-x/frontend/public/pwa/` (or mount `public/` from `omnis-x/backend/main.py` via FastAPI `StaticFiles`).
2. Update `public/engine.config.js`:
   ```js
   export const ENGINE_CONFIG = {
     mode: 'direct',
     engineBaseUrl: 'http://<NEW_ENGINE_IP>:8000',
     incidentsPath: '/api/v1/incidents',
     healthPath: '/health',
     defaultUserId: 'USR-PRINCIPAL',
     authHeader: '',
   };
   ```
3. Ensure FastAPI `CORSMiddleware` in `JADE_PALACE` allows the PWA origin if hosted on a different port (`3000` vs `8000`).
4. If using `omnis-x/backend` Python services directly, drop `engine_connector.py` + `engine_config.json` into `omnis-x/backend/` to reuse `ROOM_TO_OMNISX_ENTITY` and `build_omnisx_incident_payload()`.
