# OMNIS-X Student Grievance PWA

A lightweight, phone-first Progressive Web App matching the **OMNIS-X (`JADE_PALACE`)** design (`Charcoal #0E0F12`, `Gold #D4AF37`, `Dusty Purple #9D8EB5`) for students to report campus facility issues (**Water Problems**, **Air Conditioning / HVAC**, **Power & Lights**, **Wi-Fi / AV / Labs**, **Cleanliness**, **Furniture & Safety**) using a fast 2D interactive floor plan.

## Phone-First Architecture

- **Zero 3D Overhead on Phones**: Mobile devices render a fast, touch-friendly **2D SVG Floor Plan** (`public/src/campusMap2d.js`) built from the exact campus room dimensions and coordinates (`LEVEL 00`–`LEVEL 03`). Three.js is never loaded on phones and is lazy-loaded on desktop only if you toggle `3D Twin`.
- **Tap-Anywhere Location Pinning**: Tap any level (`LEVEL 00`–`LEVEL 03`), tap the exact spot inside a room, tap affected equipment chips, and submit in seconds.
- **Direct OMNIS-X Integration**: Dispatches grievances directly to `POST http://127.0.0.1:8000/api/v1/incidents` with mapped `root_entity_id` (`CR-201`, `LAB-01-EE`, `ROOM-MDF`, `SUBSTATION-01`, etc.), while saving locally in SQLite and queuing offline submissions in IndexedDB.

## Running & Opening on Your Phone

```bash
cd /Users/abhilashn/.gemini/antigravity/scratch/campus-grievance-pwa
python3 server.py
```

- Desktop: `http://localhost:8090`
- Phone (same Wi-Fi): `http://<your-mac-ip>:8090`
