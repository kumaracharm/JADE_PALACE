import os
import sys
import math
import subprocess
from pathlib import Path

# ==============================================================================
# OMNIS-X MASTER ARCHITECTURE DIAGRAM GENERATOR (REFINED BLUEPRINT EDITION)
# Layered Isometric Blueprint Visualization
# Strictly follows the reference visual language:
# - Deep navy/charcoal background (#0B111A)
# - Fine white vector outlines and blueprint drafting elements
# - Perspective-based architectural planes with corner drop-lines
# - 6 distinct architectural planes fully modeled and interconnected
# - Cross-cutting Security & Governance Pillar
# - 7 Specialist Intelligence Engines
# - Distinct telemetry flows (Real, Reported, Synthetic, Estimated)
# ==============================================================================

def generate_svg():
    # Canvas Dimensions
    W = 2600
    H = 3700

    # Perspective parameters for the 6 planes
    x_tl = 590
    x_tr = 2390
    x_bl = 470
    x_br = 2510

    # Plane Y positions (Top to Bottom):
    # PLANE 6: Application & Control:      y = 360 .. 760  (h = 400)
    # PLANE 5: Incident & Simulation:      y = 900 .. 1300 (h = 400)
    # PLANE 4: Intelligence Engines:       y = 1440 .. 1840 (h = 400)
    # PLANE 3: Digital Twin Core:          y = 1980 .. 2380 (h = 400)
    # PLANE 2: Data Acquisition:           y = 2520 .. 2920 (h = 400)
    # PLANE 1: Physical College:           y = 3060 .. 3460 (h = 400)

    svg_parts = []
    
    # 1. Background Grid and Canvas Definitions
    svg_parts.append(f'''
    <defs>
      <!-- Engineering blueprint fine grid -->
      <pattern id="bg-grid-fine" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" stroke-width="0.8" />
      </pattern>
      <pattern id="bg-grid-major" width="200" height="200" patternUnits="userSpaceOnUse">
        <rect width="200" height="200" fill="url(#bg-grid-fine)" />
        <path d="M 200 0 L 0 0 0 200" fill="none" stroke="rgba(255, 255, 255, 0.065)" stroke-width="1.2" />
        <circle cx="0" cy="0" r="2" fill="rgba(255,255,255,0.18)" />
      </pattern>
      <!-- Isometric plane surface grid pattern -->
      <pattern id="iso-floor-grid" width="60" height="30" patternUnits="userSpaceOnUse" patternTransform="skewX(-26.5)">
        <path d="M 60 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.035)" stroke-width="0.7" />
      </pattern>
      <!-- Glowing gradients for badges and focal accents -->
      <linearGradient id="grad-security" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0f172a" stop-opacity="0.95" />
        <stop offset="50%" stop-color="#1e293b" stop-opacity="0.85" />
        <stop offset="100%" stop-color="#0f172a" stop-opacity="0.95" />
      </linearGradient>
      <linearGradient id="plane-fill-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0c1420" stop-opacity="0.75" />
        <stop offset="50%" stop-color="#101a28" stop-opacity="0.65" />
        <stop offset="100%" stop-color="#090f18" stop-opacity="0.85" />
      </linearGradient>
      <!-- Markers for technical arrows -->
      <marker id="arrow-white" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ffffff" />
      </marker>
      <marker id="arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
      </marker>
      <marker id="arrow-teal" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2dd4bf" />
      </marker>
      <marker id="arrow-amber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#fb923c" />
      </marker>
      <marker id="arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f87171" />
      </marker>
      <marker id="arrow-purple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#c084fc" />
      </marker>
    </defs>

    <!-- Canvas Background -->
    <rect width="{W}" height="{H}" fill="#0B111A" />
    <rect width="{W}" height="{H}" fill="url(#bg-grid-major)" />
    ''')

    # 2. Header and Meta Block
    svg_parts.append(f'''
    <!-- MASTER ARCHITECTURE HEADER -->
    <g id="header-block">
      <!-- Outer technical border for header -->
      <rect x="90" y="50" width="2420" height="230" rx="10" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(255, 255, 255, 0.22)" stroke-width="1.2" />
      
      <!-- Crosshair corner markers -->
      <path d="M 80 50 L 100 50 M 90 40 L 90 60" stroke="#38bdf8" stroke-width="1.5" />
      <path d="M 2500 50 L 2520 50 M 2510 40 L 2510 60" stroke="#38bdf8" stroke-width="1.5" />
      <path d="M 80 280 L 100 280 M 90 270 L 90 290" stroke="#38bdf8" stroke-width="1.5" />
      <path d="M 2500 280 L 2520 280 M 2510 270 L 2510 290" stroke="#38bdf8" stroke-width="1.5" />

      <!-- Institutional Code and Badges -->
      <text x="130" y="95" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="13" font-weight="600" letter-spacing="0.22em">OMNIS-X // INSTITUTIONAL DIGITAL TWIN &amp; RESILIENCE DECISION SYSTEM</text>
      <text x="130" y="145" fill="#ffffff" font-family="'Geist', sans-serif" font-size="34" font-weight="600" letter-spacing="-0.02em">Enterprise Architectural Blueprint</text>
      <text x="130" y="180" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="15" font-weight="400">Six-Tier Layered Isometric Perspective Architecture — Real-Time Physical-Digital Synchronization, Causal Graph Engines &amp; Simulation Sandbox</text>

      <!-- Technical Telemetry Legend embedded in header -->
      <g transform="translate(1420, 85)">
        <rect x="0" y="0" width="1040" height="160" rx="8" fill="rgba(11, 17, 26, 0.85)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1" />
        <text x="24" y="28" fill="#e2e8f0" font-family="'Geist Mono', monospace" font-size="11" font-weight="600" letter-spacing="0.16em">TELEMETRY &amp; CAUSAL DATA FLOW ENCODING</text>
        
        <!-- Legend Item 1: Real Telemetry -->
        <line x1="24" y1="58" x2="80" y2="58" stroke="#38bdf8" stroke-width="2.5" />
        <circle cx="52" cy="58" r="3.5" fill="#38bdf8" />
        <text x="95" y="62" fill="#ffffff" font-family="'Geist', sans-serif" font-size="13" font-weight="600">Real Telemetry</text>
        <text x="95" y="77" fill="#64748b" font-family="'Geist Mono', monospace" font-size="10">Solid Electric Blue (IoT, Power, Gateway)</text>

        <!-- Legend Item 2: Reported Data -->
        <line x1="270" y1="58" x2="330" y2="58" stroke="#fb923c" stroke-width="2.2" stroke-dasharray="3,3" />
        <polygon points="300,53 305,63 295,63" fill="#fb923c" />
        <text x="345" y="62" fill="#ffffff" font-family="'Geist', sans-serif" font-size="13" font-weight="600">Reported Data</text>
        <text x="345" y="77" fill="#64748b" font-family="'Geist Mono', monospace" font-size="10">Amber Dotted (PWA, Kiosk, Human Work Orders)</text>

        <!-- Legend Item 3: Synthetic Telemetry -->
        <line x1="560" y1="58" x2="620" y2="58" stroke="#c084fc" stroke-width="2.2" stroke-dasharray="6,4" />
        <rect x="587" y="55" width="6" height="6" fill="#c084fc" />
        <text x="635" y="62" fill="#ffffff" font-family="'Geist', sans-serif" font-size="13" font-weight="600">Synthetic Telemetry</text>
        <text x="635" y="77" fill="#64748b" font-family="'Geist Mono', monospace" font-size="10">Purple Dashed (Chaos Injector, Twin Sandbox)</text>

        <!-- Legend Item 4: Estimated Data -->
        <line x1="820" y1="58" x2="880" y2="58" stroke="#2dd4bf" stroke-width="1.8" stroke-dasharray="3,3" />
        <circle cx="850" cy="58" r="3" fill="none" stroke="#2dd4bf" stroke-width="1.5" />
        <text x="895" y="62" fill="#ffffff" font-family="'Geist', sans-serif" font-size="13" font-weight="600">Estimated Data</text>
        <text x="895" y="77" fill="#64748b" font-family="'Geist Mono', monospace" font-size="10">Cyan Fine Dashed (Inferred State &amp; Drift)</text>

        <!-- System Status metrics -->
        <line x1="24" y1="102" x2="1016" y2="102" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
        <text x="24" y="132" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="11">PERSPECTIVE: 2.5D AXONOMETRIC &bull; ISO ELEVATION: 18&deg; &bull; NODES: 68 &bull; ENGINES: 7 &bull; PLANES: 6 &bull; GOVERNANCE: ZERO-TRUST RBAC</text>
      </g>
    </g>
    ''')

    # 3. Corner Projection Drop-Lines Connecting All 6 Planes
    svg_parts.append(f'''
    <!-- 3D PERSPECTIVE ALIGNMENT CORNER TRACE LINES -->
    <g id="perspective-trace-lines">
      <!-- Back-Left corner trace -->
      <line x1="{x_tl}" y1="360" x2="{x_tl}" y2="3460" stroke="rgba(255, 255, 255, 0.22)" stroke-width="1.2" stroke-dasharray="5,5" />
      <!-- Back-Right corner trace -->
      <line x1="{x_tr}" y1="360" x2="{x_tr}" y2="3460" stroke="rgba(255, 255, 255, 0.22)" stroke-width="1.2" stroke-dasharray="5,5" />
      <!-- Front-Left corner trace -->
      <line x1="{x_bl}" y1="760" x2="{x_bl}" y2="3460" stroke="rgba(255, 255, 255, 0.28)" stroke-width="1.4" stroke-dasharray="5,5" />
      <!-- Front-Right corner trace -->
      <line x1="{x_br}" y1="760" x2="{x_br}" y2="3460" stroke="rgba(255, 255, 255, 0.28)" stroke-width="1.4" stroke-dasharray="5,5" />
    </g>
    ''')

    # Helper function to generate a perspective plane boundary
    def render_plane_base(y0, y1, code, name, subtitle, color, badge):
        thick = 16
        path_top = f"M {x_tl+16} {y0} L {x_tr-16} {y0} Q {x_tr} {y0} {x_tr+2} {y0+6} L {x_br} {y1-6} Q {x_br} {y1} {x_br-16} {y1} L {x_bl+16} {y1} Q {x_bl} {y1} {x_bl-2} {y1-6} L {x_tl} {y0+6} Q {x_tl} {y0} {x_tl+16} {y0} Z"
        path_front = f"M {x_bl} {y1} L {x_br} {y1} L {x_br} {y1+thick} L {x_bl} {y1+thick} Z"
        path_right = f"M {x_tr} {y0} L {x_br} {y1} L {x_br} {y1+thick} L {x_tr} {y0+thick} Z"

        return f'''
        <!-- PLANE SLAB BASE -->
        <!-- Front & side extrusion -->
        <path d="{path_right}" fill="#080d14" stroke="rgba(255, 255, 255, 0.15)" stroke-width="0.8" />
        <path d="{path_front}" fill="#0c141f" stroke="rgba(255, 255, 255, 0.25)" stroke-width="0.8" />
        
        <!-- Top perspective face with subtle floor grid -->
        <path d="{path_top}" fill="url(#plane-fill-grad)" stroke="rgba(255, 255, 255, 0.42)" stroke-width="1.2" />
        <path d="{path_top}" fill="url(#iso-floor-grid)" opacity="0.35" />

        <!-- Inner hairline accent -->
        <path d="M {x_tl+24} {y0+8} L {x_tr-24} {y0+8} L {x_br-20} {y1-8} L {x_bl+20} {y1-8} Z" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="0.8" />

        <!-- Corner L-brackets on plane slab -->
        <path d="M {x_tl+20} {y0+25} L {x_tl+20} {y0+10} L {x_tl+35} {y0+10}" fill="none" stroke="{color}" stroke-width="1.5" />
        <path d="M {x_tr-20} {y0+25} L {x_tr-20} {y0+10} L {x_tr-35} {y0+10}" fill="none" stroke="{color}" stroke-width="1.5" />
        <path d="M {x_bl+20} {y1-25} L {x_bl+20} {y1-10} L {x_bl+35} {y1-10}" fill="none" stroke="{color}" stroke-width="1.5" />
        <path d="M {x_br-20} {y1-25} L {x_br-20} {y1-10} L {x_br-35} {y1-10}" fill="none" stroke="{color}" stroke-width="1.5" />

        <!-- Plane Header & Tag in perspective corner -->
        <g transform="translate({x_tl + 30}, {y0 + 26})">
          <rect x="-8" y="-16" width="460" height="42" rx="4" fill="rgba(15, 23, 42, 0.95)" stroke="{color}" stroke-width="1" />
          <circle cx="8" cy="5" r="4" fill="{color}" />
          <text x="22" y="3" fill="{color}" font-family="'Geist Mono', monospace" font-size="11" font-weight="600" letter-spacing="0.18em">{code} &bull; {badge}</text>
          <text x="22" y="18" fill="#ffffff" font-family="'Geist', sans-serif" font-size="14" font-weight="600" letter-spacing="0.04em">{name}</text>
          <text x="475" y="10" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="11" letter-spacing="0.06em">{subtitle}</text>
        </g>
        '''

    # ==========================================================================
    # PLANE 6 — APPLICATION AND CONTROL (Top Plane)
    # y = 360 .. 760
    # ==========================================================================
    svg_parts.append(render_plane_base(360, 760, "PLANE 06", "APPLICATION AND CONTROL", "OPERATIONAL SURFACES & INSTITUTIONAL CONTROL INTERFACES", "#38bdf8", "LEVEL 06"))
    
    svg_parts.append(f'''
    <!-- PLANE 6 CONTENT -->
    <g id="plane-6-modules" transform="translate(0, 0)">
      <!-- Module 1: Command Center -->
      <g transform="translate(630, 430)">
        <rect x="0" y="0" width="410" height="280" rx="8" fill="rgba(15, 23, 42, 0.9)" stroke="#38bdf8" stroke-width="1.4" />
        <path d="M 0 8 Q 0 0 8 0 L 402 0 Q 410 0 410 8 L 410 32 L 0 32 Z" fill="rgba(30, 41, 59, 0.9)" />
        <circle cx="16" cy="16" r="4" fill="#f87171" />
        <circle cx="30" cy="16" r="4" fill="#fb923c" />
        <circle cx="44" cy="16" r="4" fill="#34d399" />
        <text x="60" y="20" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="11" font-weight="600">[APP-01] COMMAND CENTER</text>
        
        <!-- Internal Console Graphics -->
        <rect x="15" y="44" width="380" height="50" rx="4" fill="rgba(11, 17, 26, 0.9)" stroke="rgba(255,255,255,0.12)" stroke-width="0.8" />
        <text x="25" y="62" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="10" font-weight="600">CAMPUS HEALTH INDEX: 99.42% &bull; NOMINAL</text>
        <text x="25" y="82" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="11">Active Nodes: 1,420 | Power Margin: 340 kW | HVAC: STABLE</text>
        
        <!-- Metrics Tiles -->
        <rect x="15" y="104" width="182" height="60" rx="4" fill="rgba(30, 41, 59, 0.5)" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />
        <text x="25" y="122" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="9">INCIDENT ESCALATIONS</text>
        <text x="25" y="146" fill="#34d399" font-family="'Geist', sans-serif" font-size="18" font-weight="600">0 CRITICAL</text>
        <text x="120" y="146" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="12">1 WARN</text>

        <rect x="212" y="104" width="182" height="60" rx="4" fill="rgba(30, 41, 59, 0.5)" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />
        <text x="222" y="122" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="9">AUTOMATION STATUS</text>
        <text x="222" y="146" fill="#38bdf8" font-family="'Geist', sans-serif" font-size="18" font-weight="600">SYNCED</text>
        <text x="310" y="146" fill="#64748b" font-family="'Geist Mono', monospace" font-size="11">0.12s rtt</text>

        <!-- Command Buttons / Features -->
        <rect x="15" y="174" width="380" height="92" rx="4" fill="rgba(11, 17, 26, 0.8)" stroke="rgba(56, 189, 248, 0.3)" stroke-width="0.8" />
        <text x="25" y="196" fill="#ffffff" font-family="'Geist', sans-serif" font-size="12" font-weight="600">&bull; Executive Operational Oversight</text>
        <text x="25" y="218" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="11">&bull; Institutional Alarm Management &amp; Dispatch</text>
        <text x="25" y="240" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="11">&bull; Real-Time Critical Telemetry Wall &amp; Audit Timeline</text>
        <text x="25" y="258" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="10">&gt; REST / WebSocket Dual-Engine Bus</text>
      </g>

      <!-- Module 2: Digital Twin Explorer -->
      <g transform="translate(1070, 430)">
        <rect x="0" y="0" width="410" height="280" rx="8" fill="rgba(15, 23, 42, 0.9)" stroke="#2dd4bf" stroke-width="1.4" />
        <path d="M 0 8 Q 0 0 8 0 L 402 0 Q 410 0 410 8 L 410 32 L 0 32 Z" fill="rgba(30, 41, 59, 0.9)" />
        <circle cx="16" cy="16" r="4" fill="#f87171" /><circle cx="30" cy="16" r="4" fill="#fb923c" /><circle cx="44" cy="16" r="4" fill="#34d399" />
        <text x="60" y="20" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="11" font-weight="600">[APP-02] DIGITAL TWIN EXPLORER</text>

        <!-- 3D Spatial Wireframe Mini-Viewport -->
        <rect x="15" y="44" width="380" height="120" rx="4" fill="rgba(11, 17, 26, 0.95)" stroke="rgba(45, 212, 191, 0.3)" stroke-width="0.8" />
        <path d="M 60 130 L 140 90 L 220 130 L 140 155 Z" fill="rgba(45, 212, 191, 0.12)" stroke="#2dd4bf" stroke-width="1" />
        <path d="M 60 130 L 60 110 L 140 70 L 140 90 Z" fill="rgba(45, 212, 191, 0.2)" stroke="#2dd4bf" stroke-width="1" />
        <path d="M 220 130 L 220 110 L 140 70 L 140 90 Z" fill="rgba(45, 212, 191, 0.08)" stroke="#2dd4bf" stroke-width="1" />
        
        <path d="M 240 120 L 300 90 L 360 120 L 300 145 Z" fill="rgba(56, 189, 248, 0.12)" stroke="#38bdf8" stroke-width="1" />
        <path d="M 240 120 L 240 95 L 300 65 L 300 90 Z" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" stroke-width="1" />
        <path d="M 360 120 L 360 95 L 300 65 L 300 90 Z" fill="rgba(56, 189, 248, 0.08)" stroke="#38bdf8" stroke-width="1" />
        
        <text x="25" y="60" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="10">INTERACTIVE 3D BIM / GIS CANVAS</text>
        <text x="270" y="60" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="9">LOD-300 MODEL</text>

        <!-- Feature List -->
        <rect x="15" y="174" width="380" height="92" rx="4" fill="rgba(11, 17, 26, 0.8)" stroke="rgba(45, 212, 191, 0.3)" stroke-width="0.8" />
        <text x="25" y="196" fill="#ffffff" font-family="'Geist', sans-serif" font-size="12" font-weight="600">&bull; Spatial Campus Model Navigation (Room / Floor / Building)</text>
        <text x="25" y="218" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="11">&bull; Asset Inspector &amp; Upstream/Downstream Dependency Viewer</text>
        <text x="25" y="240" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="11">&bull; Live Sensor Overlays &amp; Micro-Climate Telemetry Pinning</text>
        <text x="25" y="258" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="10">&gt; WebGL / Three.js / IFC Geometry Engine</text>
      </g>

      <!-- Module 3: Intelligence & Incident Center -->
      <g transform="translate(1510, 430)">
        <rect x="0" y="0" width="410" height="280" rx="8" fill="rgba(15, 23, 42, 0.9)" stroke="#fb923c" stroke-width="1.4" />
        <path d="M 0 8 Q 0 0 8 0 L 402 0 Q 410 0 410 8 L 410 32 L 0 32 Z" fill="rgba(30, 41, 59, 0.9)" />
        <circle cx="16" cy="16" r="4" fill="#f87171" /><circle cx="30" cy="16" r="4" fill="#fb923c" /><circle cx="44" cy="16" r="4" fill="#34d399" />
        <text x="60" y="20" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="11" font-weight="600">[APP-03] INTELLIGENCE &amp; INCIDENT CENTER</text>

        <!-- Incident Triage Board -->
        <rect x="15" y="44" width="380" height="120" rx="4" fill="rgba(11, 17, 26, 0.9)" stroke="rgba(251, 146, 60, 0.3)" stroke-width="0.8" />
        <text x="25" y="64" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="10" font-weight="600">ACTIVE INCIDENT TRIAGE &amp; PLAYBOOK RUNNER</text>
        
        <rect x="25" y="74" width="360" height="34" rx="4" fill="rgba(251, 146, 60, 0.12)" stroke="#fb923c" stroke-width="1" />
        <text x="35" y="94" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="10" font-weight="600">INC-2026-081 &bull; SUBSTATION-B BUS FAILURE</text>
        <rect x="300" y="80" width="75" height="20" rx="3" fill="#fb923c" />
        <text x="312" y="94" fill="#0B111A" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">ACTIVE</text>

        <text x="25" y="128" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="10">Impact Scope: 2 Labs, 4 Classrooms | Automated Reroute Ready</text>
        <text x="25" y="148" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="9">&gt;&gt; Playbook: PB-PWR-CASCADE-RECOVERY (Simulated / Verified)</text>

        <!-- Feature List -->
        <rect x="15" y="174" width="380" height="92" rx="4" fill="rgba(11, 17, 26, 0.8)" stroke="rgba(251, 146, 60, 0.3)" stroke-width="0.8" />
        <text x="25" y="196" fill="#ffffff" font-family="'Geist', sans-serif" font-size="12" font-weight="600">&bull; Multi-Engine Decision Support &amp; Blast Radius Visualizer</text>
        <text x="25" y="218" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="11">&bull; Human-in-the-Loop Approval Sign-off Console</text>
        <text x="25" y="240" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="11">&bull; Task Assignment, Responder Dispatch &amp; SLA Tracking</text>
        <text x="25" y="258" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="10">&gt; Automated Incident Lifecycle Engine</text>
      </g>

      <!-- Module 4: Student/Staff Reporting Portal -->
      <g transform="translate(1950, 430)">
        <rect x="0" y="0" width="410" height="280" rx="8" fill="rgba(15, 23, 42, 0.9)" stroke="#a78bfa" stroke-width="1.4" />
        <path d="M 0 8 Q 0 0 8 0 L 402 0 Q 410 0 410 8 L 410 32 L 0 32 Z" fill="rgba(30, 41, 59, 0.9)" />
        <circle cx="16" cy="16" r="4" fill="#f87171" /><circle cx="30" cy="16" r="4" fill="#fb923c" /><circle cx="44" cy="16" r="4" fill="#34d399" />
        <text x="60" y="20" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="11" font-weight="600">[APP-04] STUDENT / STAFF REPORTING PORTAL</text>

        <!-- Mobile App Mockup Box -->
        <rect x="15" y="44" width="380" height="120" rx="4" fill="rgba(11, 17, 26, 0.9)" stroke="rgba(167, 139, 250, 0.3)" stroke-width="0.8" />
        <text x="25" y="64" fill="#a78bfa" font-family="'Geist Mono', monospace" font-size="10" font-weight="600">CITIZEN SENSING &amp; FIELD INCIDENT INGRESS</text>
        
        <rect x="25" y="76" width="170" height="40" rx="4" fill="rgba(167, 139, 250, 0.15)" stroke="#a78bfa" stroke-width="0.8" />
        <text x="35" y="93" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Report Issue</text>
        <text x="35" y="107" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="9">Photo + GPS Pin</text>

        <rect x="205" y="76" width="180" height="40" rx="4" fill="rgba(167, 139, 250, 0.15)" stroke="#a78bfa" stroke-width="0.8" />
        <text x="215" y="93" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Campus Alerts</text>
        <text x="215" y="107" fill="#34d399" font-family="'Geist Mono', monospace" font-size="9">0 Active Hazards</text>

        <text x="25" y="136" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="10">Kiosk Ingress &bull; QR Code Work Orders &bull; Direct SOS</text>
        <text x="25" y="152" fill="#a78bfa" font-family="'Geist Mono', monospace" font-size="9">&gt; Ingests crowd-sourced telemetry with trust rating</text>

        <!-- Feature List -->
        <rect x="15" y="174" width="380" height="92" rx="4" fill="rgba(11, 17, 26, 0.8)" stroke="rgba(167, 139, 250, 0.3)" stroke-width="0.8" />
        <text x="25" y="196" fill="#ffffff" font-family="'Geist', sans-serif" font-size="12" font-weight="600">&bull; Progressive Web App (PWA) &amp; Touch Kiosk Terminals</text>
        <text x="25" y="218" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="11">&bull; Real-Time Ticket Status &amp; Push Resolution Notifications</text>
        <text x="25" y="240" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="11">&bull; Campus Safety Announcements &amp; Shelter Guidance</text>
        <text x="25" y="258" fill="#a78bfa" font-family="'Geist Mono', monospace" font-size="10">&gt; Authenticated Student/Faculty OAuth2 Ingress</text>
      </g>

      <!-- Inter-module communication bus on Plane 6 -->
      <path d="M 1040 570 L 1070 570 M 1480 570 L 1510 570 M 1920 570 L 1950 570" stroke="rgba(255, 255, 255, 0.4)" stroke-width="1.5" stroke-dasharray="3,3" />
    </g>
    ''')

    # ==========================================================================
    # PLANE 5 — INCIDENT AND SIMULATION
    # y = 900 .. 1300
    # ==========================================================================
    svg_parts.append(render_plane_base(900, 1300, "PLANE 05", "INCIDENT AND SIMULATION", "COUNTERFACTUAL SANDBOX, CASCADE SIMULATOR & HUMAN APPROVAL GATEWAY", "#fb923c", "LEVEL 05"))

    svg_parts.append(f'''
    <!-- PLANE 5 CONTENT -->
    <g id="plane-5-modules">
      <!-- Clear Visual Partition: Real State vs Simulated Counterfactual Sandbox -->
      <g transform="translate(630, 960)">
        <!-- ZONE A: SHADOW-STATE SIMULATION SANDBOX (Dashed Boundary) -->
        <rect x="0" y="0" width="850" height="300" rx="8" fill="rgba(15, 23, 42, 0.9)" stroke="#fb923c" stroke-width="1.5" stroke-dasharray="6,4" />
        <rect x="0" y="0" width="850" height="30" rx="8" fill="rgba(251, 146, 60, 0.15)" />
        <text x="16" y="20" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="11" font-weight="700">[SANDBOX: ISOLATED SHADOW STATE &bull; ZERO PRODUCTION IMPACT]</text>
        <text x="540" y="20" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="10">EPHEMERAL TWIN INSTANCE // ID: SIM-BRANCH-88</text>

        <!-- Submodule 5.1: Failure Injection -->
        <g transform="translate(20, 45)">
          <rect x="0" y="0" width="250" height="235" rx="6" fill="rgba(11, 17, 26, 0.95)" stroke="#f87171" stroke-width="1.2" />
          <path d="M 0 6 Q 0 0 6 0 L 244 0 Q 250 0 250 6 L 250 26 L 0 26 Z" fill="rgba(248, 113, 113, 0.2)" />
          <text x="12" y="17" fill="#f87171" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">FAILURE INJECTION ENGINE</text>
          
          <text x="12" y="45" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Chaos Experiment Vectors:</text>
          
          <rect x="12" y="55" width="226" height="36" rx="4" fill="rgba(248, 113, 113, 0.12)" stroke="#f87171" stroke-width="0.8" />
          <text x="20" y="70" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="10">FAULT: Substation-A Outage</text>
          <text x="20" y="84" fill="#f87171" font-family="'Geist Mono', monospace" font-size="9">Trigger: Synthetic Breaker Trip</text>

          <rect x="12" y="98" width="226" height="36" rx="4" fill="rgba(248, 113, 113, 0.08)" stroke="rgba(248, 113, 113, 0.5)" stroke-width="0.8" />
          <text x="20" y="113" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="10">FAULT: Core Switch MDF-01</text>
          <text x="20" y="127" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="9">Trigger: 100% Packet Drop</text>

          <rect x="12" y="141" width="226" height="36" rx="4" fill="rgba(248, 113, 113, 0.08)" stroke="rgba(248, 113, 113, 0.5)" stroke-width="0.8" />
          <text x="20" y="156" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="10">FAULT: Chiller Unit 02 Trip</text>
          <text x="20" y="170" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="9">Trigger: Thermal Escalation</text>

          <text x="12" y="200" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Sandboxed Stress Testing</text>
          <text x="12" y="216" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Deterministic Seed Generator</text>
          <text x="12" y="230" fill="#c084fc" font-family="'Geist Mono', monospace" font-size="9">&gt; Synthetic Telemetry Branch</text>
        </g>

        <!-- Arrow from Injection to Cascade Simulation -->
        <path d="M 270 160 L 295 160" stroke="#f87171" stroke-width="1.8" marker-end="url(#arrow-red)" />

        <!-- Submodule 5.2: Shadow-State Simulation & Cascade Propagation -->
        <g transform="translate(295, 45)">
          <rect x="0" y="0" width="260" height="235" rx="6" fill="rgba(11, 17, 26, 0.95)" stroke="#fb923c" stroke-width="1.2" />
          <path d="M 0 6 Q 0 0 6 0 L 254 0 Q 260 0 260 6 L 260 26 L 0 26 Z" fill="rgba(251, 146, 60, 0.2)" />
          <text x="12" y="17" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">SHADOW CASCADE ENGINE</text>

          <!-- Cascade Tree Graphics -->
          <g transform="translate(15, 36)">
            <!-- Root Failure Node -->
            <rect x="0" y="0" width="90" height="28" rx="4" fill="rgba(248, 113, 113, 0.2)" stroke="#f87171" stroke-width="1" />
            <text x="8" y="18" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9" font-weight="600">Substation-A</text>

            <!-- Branch line to Secondary -->
            <path d="M 90 14 L 120 14 M 120 14 L 120 44 L 135 44 M 120 14 L 120 -8 L 135 -8" stroke="#fb923c" stroke-width="1.2" />

            <!-- Secondary Failure Nodes -->
            <rect x="135" y="-18" width="90" height="24" rx="4" fill="rgba(251, 146, 60, 0.2)" stroke="#fb923c" stroke-width="1" />
            <text x="142" y="-2" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9">MDF Switch</text>

            <rect x="135" y="32" width="90" height="24" rx="4" fill="rgba(251, 146, 60, 0.2)" stroke="#fb923c" stroke-width="1" />
            <text x="142" y="48" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9">HVAC Zone-3</text>
          </g>

          <text x="12" y="125" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Simulation Dynamics:</text>
          <text x="12" y="145" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Step-by-step Topological Spread</text>
          <text x="12" y="162" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Secondary Circuit Overload Calc</text>
          <text x="12" y="179" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Battery UPS Depletion Curve</text>
          <text x="12" y="196" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Blast Radius: 14 Rooms, 3 Labs</text>
          <text x="12" y="215" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="9">&gt; In-Memory Graph Walk: 4.2ms</text>
        </g>

        <!-- Arrow from Cascade to Impact Assessment -->
        <path d="M 555 160 L 580 160" stroke="#fb923c" stroke-width="1.8" marker-end="url(#arrow-amber)" />

        <!-- Submodule 5.3: Impact Assessment -->
        <g transform="translate(580, 45)">
          <rect x="0" y="0" width="245" height="235" rx="6" fill="rgba(11, 17, 26, 0.95)" stroke="#fb923c" stroke-width="1.2" />
          <path d="M 0 6 Q 0 0 6 0 L 239 0 Q 245 0 245 6 L 245 26 L 0 26 Z" fill="rgba(251, 146, 60, 0.2)" />
          <text x="12" y="17" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">PROJECTED IMPACT ASSESSMENT</text>

          <text x="12" y="45" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Quantified Disruption:</text>
          
          <rect x="12" y="55" width="220" height="28" rx="4" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />
          <text x="20" y="73" fill="#f87171" font-family="'Geist Mono', monospace" font-size="10">DOWNTIME: ~3.5 hrs (unmitigated)</text>

          <rect x="12" y="90" width="220" height="28" rx="4" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />
          <text x="20" y="108" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="10">ACADEMIC: 8 Lectures displaced</text>

          <rect x="12" y="125" width="220" height="28" rx="4" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />
          <text x="20" y="143" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="10">STUDENTS: 340 displaced</text>

          <text x="12" y="175" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Criticality Score: 78 / 100</text>
          <text x="12" y="192" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Life Safety Impact: ZERO</text>
          <text x="12" y="215" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="9">&gt; Passes to Optimizer</text>
        </g>
      </g>

      <!-- Arrow from Sandbox to Alternative Plans -->
      <path d="M 1480 1110 L 1520 1110" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow-blue)" />

      <!-- ZONE B: ALTERNATIVE RECOVERY PLANS, TRADEOFF COMPARISON & HUMAN APPROVAL -->
      <g transform="translate(1520, 960)">
        <rect x="0" y="0" width="810" height="300" rx="8" fill="rgba(15, 23, 42, 0.9)" stroke="#38bdf8" stroke-width="1.5" />
        <rect x="0" y="0" width="810" height="30" rx="8" fill="rgba(56, 189, 248, 0.15)" />
        <text x="16" y="20" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="11" font-weight="700">[OPTIMIZATION, MULTI-PLAN EVALUATION &amp; HUMAN APPROVAL]</text>
        <text x="540" y="20" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="10">MULTI-CRITERIA PARETO SOLVER</text>

        <!-- Submodule 5.4: Alternative Recovery Plans Generator -->
        <g transform="translate(20, 45)">
          <rect x="0" y="0" width="240" height="235" rx="6" fill="rgba(11, 17, 26, 0.95)" stroke="#38bdf8" stroke-width="1.2" />
          <path d="M 0 6 Q 0 0 6 0 L 234 0 Q 240 0 240 6 L 240 26 L 0 26 Z" fill="rgba(56, 189, 248, 0.2)" />
          <text x="12" y="17" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">ALTERNATIVE RECOVERY PLANS</text>

          <!-- Plan Alpha (Recommended) -->
          <rect x="10" y="38" width="220" height="56" rx="4" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" stroke-width="1.2" />
          <text x="18" y="54" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="700">PLAN ALPHA (Recommended)</text>
          <text x="18" y="70" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="9">Reroute via Bus-B + Diesel Gen</text>
          <text x="18" y="84" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="9">Downtime: 12 min | Cost: Medium</text>

          <!-- Plan Beta -->
          <rect x="10" y="100" width="220" height="50" rx="4" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="0.8" />
          <text x="18" y="116" fill="#e2e8f0" font-family="'Geist', sans-serif" font-size="11" font-weight="600">PLAN BETA (Academic Priority)</text>
          <text x="18" y="131" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="9">Relocate Labs to Virtual Desktops</text>
          <text x="18" y="143" fill="#64748b" font-family="'Geist Mono', monospace" font-size="9">Downtime: 45 min | Cost: Low</text>

          <!-- Plan Gamma -->
          <rect x="10" y="156" width="220" height="50" rx="4" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="0.8" />
          <text x="18" y="172" fill="#e2e8f0" font-family="'Geist', sans-serif" font-size="11" font-weight="600">PLAN GAMMA (Conservative)</text>
          <text x="18" y="187" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="9">Shed Non-Essential Campus Loads</text>
          <text x="18" y="199" fill="#64748b" font-family="'Geist Mono', monospace" font-size="9">Downtime: 90 min | Cost: Zero</text>

          <text x="10" y="224" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="9">&gt; Pareto Front Computed</text>
        </g>

        <!-- Submodule 5.5: Cost / Time / Risk Comparison Radar -->
        <g transform="translate(275, 45)">
          <rect x="0" y="0" width="235" height="235" rx="6" fill="rgba(11, 17, 26, 0.95)" stroke="#818cf8" stroke-width="1.2" />
          <path d="M 0 6 Q 0 0 6 0 L 229 0 Q 235 0 235 6 L 235 26 L 0 26 Z" fill="rgba(129, 140, 248, 0.2)" />
          <text x="12" y="17" fill="#818cf8" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">COST / TIME / RISK COMPARISON</text>

          <!-- Tradeoff comparison radar illustration -->
          <g transform="translate(117, 100)">
            <polygon points="0,-48 42,-24 42,24 0,48 -42,24 -42,-24" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
            <polygon points="0,-32 28,-16 28,16 0,32 -28,16 -28,-16" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.8" />
            <line x1="0" y1="-48" x2="0" y2="48" stroke="rgba(255,255,255,0.15)" stroke-width="0.8" />
            <line x1="-42" y1="-24" x2="42" y2="24" stroke="rgba(255,255,255,0.15)" stroke-width="0.8" />
            <line x1="-42" y1="24" x2="42" y2="-24" stroke="rgba(255,255,255,0.15)" stroke-width="0.8" />
            <polygon points="0,-42 34,-10 20,20 0,15 -35,18 -38,-15" fill="rgba(56, 189, 248, 0.25)" stroke="#38bdf8" stroke-width="1.5" />
            <text x="-4" y="-52" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="8">DOWNTIME</text>
            <text x="46" y="-20" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="8">COST</text>
            <text x="46" y="28" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="8">SAFETY</text>
            <text x="-6" y="58" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="8">ACADEMIC</text>
            <text x="-70" y="28" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="8">RISK</text>
            <text x="-75" y="-20" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="8">EFFORT</text>
          </g>

          <!-- Evaluation Summary -->
          <text x="12" y="175" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Decision Tradeoff Scores:</text>
          <text x="12" y="194" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="10">&bull; Plan Alpha: Score 92/100 (Optimal)</text>
          <text x="12" y="210" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="10">&bull; Plan Beta: Score 74/100</text>
          <text x="12" y="226" fill="#64748b" font-family="'Geist Mono', monospace" font-size="10">&bull; Plan Gamma: Score 61/100</text>
        </g>

        <!-- Submodule 5.6: Human Approval Gate & Task Execution -->
        <g transform="translate(525, 45)">
          <rect x="0" y="0" width="265" height="235" rx="6" fill="rgba(11, 17, 26, 0.95)" stroke="#fb923c" stroke-width="1.8" />
          <path d="M 0 6 Q 0 0 6 0 L 259 0 Q 265 0 265 6 L 265 26 L 0 26 Z" fill="rgba(251, 146, 60, 0.3)" />
          <text x="12" y="17" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">[CHECKPOINT: HUMAN APPROVAL]</text>

          <!-- Illuminated Amber Authorization Gate -->
          <rect x="12" y="38" width="240" height="74" rx="4" fill="rgba(251, 146, 60, 0.12)" stroke="#fb923c" stroke-width="1.5" />
          <circle cx="28" cy="56" r="6" fill="#fb923c" />
          <text x="42" y="59" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="11" font-weight="700">AUTHORIZATION REQUIRED</text>
          <text x="18" y="78" fill="#ffffff" font-family="'Geist', sans-serif" font-size="10">Action: Execute Plan Alpha Reroute</text>
          <text x="18" y="94" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="9">Signer: Director of Facilities &amp; Dean Ops</text>
          <rect x="165" y="82" width="80" height="22" rx="3" fill="#fb923c" />
          <text x="175" y="97" fill="#0B111A" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">SIGN-OFF</text>

          <!-- Task Execution & Closed-Loop Verification -->
          <rect x="12" y="122" width="240" height="96" rx="4" fill="rgba(34, 197, 94, 0.08)" stroke="#22c55e" stroke-width="1" />
          <text x="20" y="139" fill="#22c55e" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">TASK EXECUTION &amp; VERIFICATION</text>
          <text x="20" y="157" fill="#ffffff" font-family="'Geist', sans-serif" font-size="10">&bull; Dispatch to Electrician Team (Work Order #4109)</text>
          <text x="20" y="173" fill="#ffffff" font-family="'Geist', sans-serif" font-size="10">&bull; Automated Breaker Reroute Protocol</text>
          <text x="20" y="189" fill="#ffffff" font-family="'Geist', sans-serif" font-size="10">&bull; Closed-Loop Telemetry Verification</text>
          <text x="20" y="206" fill="#22c55e" font-family="'Geist Mono', monospace" font-size="9">&gt; Status: Telemetry Confirmed Normal</text>
        </g>
      </g>
    </g>
    ''')

    # ==========================================================================
    # PLANE 4 — INTELLIGENCE ENGINES
    # y = 1440 .. 1840
    # ==========================================================================
    svg_parts.append(render_plane_base(1440, 1840, "PLANE 04", "INTELLIGENCE ENGINES", "SEVEN SPECIALIST CAUSAL, ANALYTIC, GRAPH TRAVERSAL & DECISION ENGINES", "#818cf8", "LEVEL 04"))

    engines_data = [
        {
            "num": "01",
            "name": "EVENT & ANOMALY DETECTION",
            "tag": "STATISTICAL & THRESHOLD BREACH",
            "tech": "Isolation Forest & Dynamic Z-Scores",
            "inputs": "Raw Stream Telemetry",
            "outputs": "Anomaly Alerts & Outlier Vectors",
            "color": "#38bdf8",
            "dx": 0
        },
        {
            "num": "02",
            "name": "GRAPH IMPACT PROPAGATION",
            "tag": "TOPOLOGICAL CASCADE TRAVERSAL",
            "tech": "BFS/DFS Directed Blast Radius",
            "inputs": "Anomaly Nodes & Graph Adjacency",
            "outputs": "Disrupted Subgraph & Root Causes",
            "color": "#818cf8",
            "dx": 245
        },
        {
            "num": "03",
            "name": "RISK & CRITICALITY ANALYSIS",
            "tag": "MULTI-FACTOR VULNERABILITY",
            "tech": "FMEA & Severity-Probability Index",
            "inputs": "Disrupted Subgraph & Asset Tiers",
            "outputs": "Risk Weight & Priority Ranking",
            "color": "#c084fc",
            "dx": 490
        },
        {
            "num": "04",
            "name": "ACADEMIC & RESOURCE IMPACT",
            "tag": "CURRICULUM LOSS QUANTIFICATION",
            "tech": "Class/Exam Timetable Conflict Matrix",
            "inputs": "Displaced Rooms & SIS Schedule",
            "outputs": "Course Delays & Reschedule Needs",
            "color": "#fb923c",
            "dx": 735
        },
        {
            "num": "05",
            "name": "RECOVERY OPTIMIZATION",
            "tag": "CONSTRAINT SATISFACTION SOLVER",
            "tech": "MILP / Heuristic Branch-and-Bound",
            "inputs": "Capacity Limits & Disruption State",
            "outputs": "Optimal Action Reroute Candidate",
            "color": "#2dd4bf",
            "dx": 980
        },
        {
            "num": "06",
            "name": "RESPONSIBILITY & TASK ASSIGNMENT",
            "tag": "ROLE-BASED DISPATCH & SLA TRACK",
            "tech": "RACI Matrix & Duty Responder Dispatch",
            "inputs": "Optimal Action & Staff On-Call",
            "outputs": "Targeted Work Orders & SLA Timers",
            "color": "#38bdf8",
            "dx": 1225
        },
        {
            "num": "07",
            "name": "DECISION & COORDINATION",
            "tag": "STRATEGY RANKER & ORCHESTRATION",
            "tech": "Multi-Criteria Decision Analysis",
            "inputs": "Evaluated Plans & Human Approval",
            "outputs": "Authorized Execution Playbook",
            "color": "#f87171",
            "dx": 1470
        }
    ]

    svg_parts.append(f'''
    <!-- PLANE 4 CONTENT: SEVEN SPECIALIST INTELLIGENCE ENGINES -->
    <g id="plane-4-engines" transform="translate(640, 1500)">
      <line x1="100" y1="280" x2="1600" y2="280" stroke="rgba(255, 255, 255, 0.2)" stroke-width="2" stroke-dasharray="4,4" />
      <text x="850" y="300" text-anchor="middle" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="10" letter-spacing="0.14em">SPECIALIST ENGINE INTERCONNECT BUS // HIGH-THROUGHPUT IPC / EVENT MESH</text>
    ''')

    for eng in engines_data:
        x_pos = eng["dx"]
        svg_parts.append(f'''
        <!-- Engine {eng["num"]}: {eng["name"]} -->
        <g transform="translate({x_pos}, 0)">
          <rect x="0" y="0" width="225" height="255" rx="6" fill="rgba(15, 23, 42, 0.95)" stroke="{eng["color"]}" stroke-width="1.3" />
          
          <path d="M 0 6 Q 0 0 6 0 L 219 0 Q 225 0 225 6 L 225 32 L 0 32 Z" fill="rgba(30, 41, 59, 0.85)" />
          <rect x="10" y="7" width="26" height="18" rx="3" fill="{eng["color"]}" />
          <text x="15" y="20" fill="#0B111A" font-family="'Geist Mono', monospace" font-size="11" font-weight="700">{eng["num"]}</text>
          <text x="44" y="16" fill="{eng["color"]}" font-family="'Geist Mono', monospace" font-size="8.5" font-weight="600">{eng["tag"]}</text>
          <text x="44" y="26" fill="#ffffff" font-family="'Geist', sans-serif" font-size="10" font-weight="600">{eng["name"]}</text>

          <rect x="10" y="42" width="205" height="52" rx="4" fill="rgba(11, 17, 26, 0.9)" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />
          <text x="18" y="58" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="8.5">ALGORITHM &amp; MODEL:</text>
          <text x="18" y="74" fill="#ffffff" font-family="'Geist', sans-serif" font-size="10.5" font-weight="600">{eng["tech"]}</text>
          <text x="18" y="86" fill="{eng["color"]}" font-family="'Geist Mono', monospace" font-size="8">&gt; Deterministic / Explainable</text>

          <rect x="10" y="102" width="205" height="42" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" stroke-width="0.8" />
          <text x="18" y="118" fill="#64748b" font-family="'Geist Mono', monospace" font-size="8">INGRESS / INPUTS:</text>
          <text x="18" y="134" fill="#cbd5e1" font-family="'Geist', sans-serif" font-size="10">{eng["inputs"]}</text>

          <rect x="10" y="152" width="205" height="42" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" stroke-width="0.8" />
          <text x="18" y="168" fill="#64748b" font-family="'Geist Mono', monospace" font-size="8">EGRESS / OUTPUTS:</text>
          <text x="18" y="184" fill="{eng["color"]}" font-family="'Geist', sans-serif" font-size="10" font-weight="500">{eng["outputs"]}</text>

          <circle cx="20" cy="216" r="3.5" fill="{eng["color"]}" />
          <text x="30" y="220" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="9">ACTIVE &bull; 0.04s latency</text>

          <line x1="112" y1="255" x2="112" y2="280" stroke="{eng["color"]}" stroke-width="1.2" stroke-dasharray="2,2" />
          <circle cx="112" cy="280" r="3" fill="{eng["color"]}" />
        </g>
        ''')

        if eng["num"] != "07":
            svg_parts.append(f'''
            <path d="M {x_pos + 225} 125 L {x_pos + 245} 125" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" marker-end="url(#arrow-white)" />
            ''')

    svg_parts.append('</g>')

    # ==========================================================================
    # PLANE 3 — DIGITAL TWIN CORE
    # y = 1980 .. 2380
    # ==========================================================================
    svg_parts.append(render_plane_base(1980, 2380, "PLANE 03", "DIGITAL TWIN CORE", "SPATIAL TOPOLOGY, ASSET ENTITY REGISTRY, DIRECTED DEPENDENCY GRAPH & STATE ENGINE", "#2dd4bf", "LEVEL 03"))

    svg_parts.append(f'''
    <!-- PLANE 3 CONTENT -->
    <g id="plane-3-twin-core" transform="translate(630, 2040)">
      <!-- Left Subsystem: Entity Registry -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="370" height="290" rx="8" fill="rgba(15, 23, 42, 0.9)" stroke="#2dd4bf" stroke-width="1.4" />
        <path d="M 0 8 Q 0 0 8 0 L 362 0 Q 370 0 370 8 L 370 32 L 0 32 Z" fill="rgba(45, 212, 191, 0.18)" />
        <text x="16" y="21" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="11" font-weight="700">[CORE-01] ENTITY REGISTRY</text>
        <text x="210" y="21" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="9">UUID MASTER CATALOG</text>

        <g transform="translate(15, 45)">
          <rect x="0" y="0" width="340" height="42" rx="4" fill="rgba(11, 17, 26, 0.9)" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />
          <text x="12" y="18" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Physical Assets (BIM/GIS)</text>
          <text x="12" y="32" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="9">UUID &bull; Coordinates (X,Y,Z) &bull; RoomID &bull; Floor</text>

          <rect x="0" y="52" width="340" height="42" rx="4" fill="rgba(11, 17, 26, 0.9)" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />
          <text x="12" y="70" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Logical &amp; Operational Nodes</text>
          <text x="12" y="84" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="9">IP &bull; Subnet &bull; Circuit Breaker ID &bull; HVAC Loop</text>

          <rect x="0" y="104" width="340" height="42" rx="4" fill="rgba(11, 17, 26, 0.9)" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />
          <text x="12" y="122" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Institutional &amp; Academic Actors</text>
          <text x="12" y="136" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="9">CourseID &bull; Faculty &bull; Student Cohort &bull; ExamSlot</text>

          <text x="5" y="172" fill="#e2e8f0" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Registry Services:</text>
          <text x="5" y="190" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10.5">&bull; Strict Schema Enforcer (JSON-LD / RDF Ontology)</text>
          <text x="5" y="206" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10.5">&bull; Global Consistent Versioning &amp; Event Sourcing</text>
          <text x="5" y="222" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10.5">&bull; Bi-directional Spatial-Logical Reference Resolvers</text>
          <text x="5" y="238" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="9.5">&gt; 8,420 Active Entities Registered</text>
        </g>
      </g>

      <!-- Center Subsystem: DIRECTED DEPENDENCY GRAPH (VISUALLY PROMINENT) -->
      <g transform="translate(390, 0)">
        <rect x="0" y="0" width="940" height="290" rx="8" fill="rgba(11, 17, 26, 0.95)" stroke="#2dd4bf" stroke-width="2" />
        <path d="M 0 8 Q 0 0 8 0 L 932 0 Q 940 0 940 8 L 940 32 L 0 32 Z" fill="rgba(45, 212, 191, 0.22)" />
        <text x="20" y="21" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="12" font-weight="700">[CORE-02] DIRECTED DEPENDENCY &amp; CAUSAL TOPOLOGY GRAPH</text>
        <text x="640" y="21" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="10">REAL-TIME TRAVERSAL ENGINE</text>

        <!-- Directed Graph Visualization with Node Network -->
        <g id="dependency-graph-visual" transform="translate(40, 45)">
          <rect x="0" y="0" width="860" height="225" rx="6" fill="rgba(15, 23, 42, 0.6)" stroke="rgba(255,255,255,0.06)" stroke-width="1" />

          <!-- Substation Node -->
          <g transform="translate(60, 40)">
            <circle cx="0" cy="0" r="24" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" stroke-width="2" />
            <circle cx="0" cy="0" r="6" fill="#38bdf8" />
            <text x="0" y="38" text-anchor="middle" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="10" font-weight="600">Substation-A</text>
            <text x="0" y="50" text-anchor="middle" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="8">11kV Feeder</text>
          </g>

          <!-- Generator Backup Node -->
          <g transform="translate(60, 160)">
            <circle cx="0" cy="0" r="22" fill="rgba(251, 146, 60, 0.2)" stroke="#fb923c" stroke-width="1.8" />
            <circle cx="0" cy="0" r="5" fill="#fb923c" />
            <text x="0" y="36" text-anchor="middle" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="10" font-weight="600">Diesel-Gen-1</text>
            <text x="0" y="48" text-anchor="middle" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="8">Standby 500kVA</text>
          </g>

          <!-- UPS Main Switchboard -->
          <g transform="translate(230, 100)">
            <rect x="-30" y="-20" width="60" height="40" rx="4" fill="rgba(45, 212, 191, 0.25)" stroke="#2dd4bf" stroke-width="1.8" />
            <text x="0" y="-4" text-anchor="middle" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9" font-weight="600">UPS-MAIN</text>
            <text x="0" y="10" text-anchor="middle" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="8">Bus-A (Active)</text>
            <text x="0" y="34" text-anchor="middle" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="8">Main Dist</text>
          </g>

          <!-- Data Centre Rack 01 -->
          <g transform="translate(420, 50)">
            <circle cx="0" cy="0" r="22" fill="rgba(45, 212, 191, 0.2)" stroke="#2dd4bf" stroke-width="1.8" />
            <text x="0" y="4" text-anchor="middle" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9" font-weight="600">DataCentre</text>
            <text x="0" y="34" text-anchor="middle" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="8">Racks R01-R06</text>
          </g>

          <!-- MDF Core Switch -->
          <g transform="translate(420, 150)">
            <rect x="-30" y="-18" width="60" height="36" rx="4" fill="rgba(129, 140, 248, 0.2)" stroke="#818cf8" stroke-width="1.8" />
            <text x="0" y="-2" text-anchor="middle" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9" font-weight="600">MDF-CORE</text>
            <text x="0" y="10" text-anchor="middle" fill="#818cf8" font-family="'Geist Mono', monospace" font-size="8">10GbE Switch</text>
            <text x="0" y="32" text-anchor="middle" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="8">Campus Fiber</text>
          </g>

          <!-- AI & Robotics Lab L-2 -->
          <g transform="translate(620, 40)">
            <circle cx="0" cy="0" r="24" fill="rgba(56, 189, 248, 0.25)" stroke="#38bdf8" stroke-width="2" />
            <text x="0" y="3" text-anchor="middle" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="10" font-weight="600">Lab L-2</text>
            <text x="0" y="36" text-anchor="middle" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="8">AI &amp; Robotics</text>
          </g>

          <!-- Classroom CR-104 -->
          <g transform="translate(620, 110)">
            <circle cx="0" cy="0" r="20" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
            <text x="0" y="4" text-anchor="middle" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9" font-weight="600">CR-104</text>
            <text x="0" y="32" text-anchor="middle" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="8">Lecture Hall</text>
          </g>

          <!-- Computing Lab L-1 -->
          <g transform="translate(620, 180)">
            <circle cx="0" cy="0" r="20" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
            <text x="0" y="4" text-anchor="middle" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9" font-weight="600">Lab L-1</text>
            <text x="0" y="32" text-anchor="middle" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="8">Computing Lab</text>
          </g>

          <!-- Course Session CS-401 -->
          <g transform="translate(790, 70)">
            <rect x="-35" y="-18" width="70" height="36" rx="4" fill="rgba(251, 146, 60, 0.2)" stroke="#fb923c" stroke-width="1.5" />
            <text x="0" y="-2" text-anchor="middle" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9" font-weight="600">CS-401 EXAM</text>
            <text x="0" y="10" text-anchor="middle" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="8">120 Students</text>
            <text x="0" y="32" text-anchor="middle" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="8">Priority Tier 1</text>
          </g>

          <!-- Course Session EE-202 -->
          <g transform="translate(790, 150)">
            <rect x="-35" y="-18" width="70" height="36" rx="4" fill="rgba(45, 212, 191, 0.2)" stroke="#2dd4bf" stroke-width="1.5" />
            <text x="0" y="-2" text-anchor="middle" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9" font-weight="600">EE-202 LAB</text>
            <text x="0" y="10" text-anchor="middle" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="8">45 Students</text>
            <text x="0" y="32" text-anchor="middle" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="8">Priority Tier 2</text>
          </g>

          <!-- Directed Causal Edges -->
          <path d="M 84 40 L 150 40 L 200 85" fill="none" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow-blue)" />
          <text x="140" y="30" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="7.5">POWERS</text>

          <path d="M 82 160 L 150 160 L 200 115" fill="none" stroke="#fb923c" stroke-width="1.5" stroke-dasharray="3,3" marker-end="url(#arrow-amber)" />
          <text x="140" y="150" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="7.5">STANDBY_FEED</text>

          <path d="M 260 90 L 330 60 L 398 50" fill="none" stroke="#2dd4bf" stroke-width="2" marker-end="url(#arrow-teal)" />
          <text x="310" y="65" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="7.5">POWERS</text>

          <path d="M 260 110 L 330 140 L 390 150" fill="none" stroke="#2dd4bf" stroke-width="2" marker-end="url(#arrow-teal)" />
          <text x="310" y="140" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="7.5">POWERS</text>

          <path d="M 442 50 L 596 40" fill="none" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow-blue)" />
          <text x="510" y="35" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="7.5">SERVES_COMPUTE</text>

          <path d="M 450 145 L 530 145 L 600 55" fill="none" stroke="#818cf8" stroke-width="1.5" marker-end="url(#arrow-white)" />
          <text x="520" y="105" fill="#818cf8" font-family="'Geist Mono', monospace" font-size="7.5">NETWORK_TRUNK</text>

          <path d="M 450 150 L 598 115" fill="none" stroke="#818cf8" stroke-width="1.5" marker-end="url(#arrow-white)" />
          <path d="M 450 155 L 598 180" fill="none" stroke="#818cf8" stroke-width="1.5" marker-end="url(#arrow-white)" />

          <path d="M 644 40 L 755 60" fill="none" stroke="#fb923c" stroke-width="2" marker-end="url(#arrow-amber)" />
          <text x="680" y="44" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="7.5">HOSTS_EXAM</text>

          <path d="M 640 180 L 755 160" fill="none" stroke="#2dd4bf" stroke-width="2" marker-end="url(#arrow-teal)" />
          <text x="680" y="180" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="7.5">HOSTS_COURSE</text>
        </g>
      </g>

      <!-- Right Subsystem: Spatial Model & Operational State Engine -->
      <g transform="translate(1350, 0)">
        <rect x="0" y="0" width="530" height="290" rx="8" fill="rgba(15, 23, 42, 0.9)" stroke="#2dd4bf" stroke-width="1.4" />
        <path d="M 0 8 Q 0 0 8 0 L 522 0 Q 530 0 530 8 L 530 32 L 0 32 Z" fill="rgba(45, 212, 191, 0.18)" />
        <text x="16" y="21" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="11" font-weight="700">[CORE-03] SPATIAL BIM &amp; REAL-TIME STATE ENGINE</text>

        <g transform="translate(15, 45)">
          <rect x="0" y="0" width="500" height="100" rx="4" fill="rgba(11, 17, 26, 0.9)" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />
          <text x="16" y="22" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="10" font-weight="600">3D SPATIAL CAMPUS BIM ENGINE</text>
          <text x="16" y="42" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11">&bull; Coordinate Mapping: WGS-84 GIS to Local IFC Coordinates</text>
          <text x="16" y="60" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11">&bull; Geometric Boundaries: 48 Zones, 310 Rooms, 6 Utility Corridors</text>
          <text x="16" y="78" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="11">&bull; Volumetric Thermal &amp; Occupancy Heatmap Tessellation</text>
          <text x="16" y="92" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="9">&gt; Indexed with R-Tree Spatial Query Service</text>

          <rect x="0" y="112" width="500" height="118" rx="4" fill="rgba(11, 17, 26, 0.9)" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />
          <text x="16" y="132" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="10" font-weight="600">OPERATIONAL STATE ENGINE &amp; EVENT JOURNAL</text>
          <text x="16" y="152" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11">&bull; In-Memory Distributed Cache (Key-Value &amp; Time-Series Sync)</text>
          <text x="16" y="170" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11">&bull; Real-Time Telemetry Fusion &amp; Multi-Sensor State Alignment</text>
          <text x="16" y="188" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11">&bull; Immutable Event Ledger: 14,000 ops/sec Commit Rate</text>
          <text x="16" y="206" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11">&bull; Snapshotting &amp; Point-in-Time Branching for Simulation</text>
          <text x="16" y="222" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="9">&gt; State Consistency Guarantee: Strong Eventual Consensus</text>
        </g>
      </g>
    </g>
    ''')

    # ==========================================================================
    # PLANE 2 — DATA ACQUISITION
    # y = 2520 .. 2920
    # ==========================================================================
    svg_parts.append(render_plane_base(2520, 2920, "PLANE 02", "DATA ACQUISITION", "MULTI-PROTOCOL INGRESS, SENSOR GATEWAYS, NORMALIZATION & SYNTHESIS PIPELINE", "#38bdf8", "LEVEL 02"))

    svg_parts.append(f'''
    <!-- PLANE 2 CONTENT -->
    <g id="plane-2-acquisition" transform="translate(630, 2580)">
      <!-- Ingress Stream 1: Real Sensor Gateways (Electric Blue) -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="340" height="290" rx="8" fill="rgba(15, 23, 42, 0.9)" stroke="#38bdf8" stroke-width="1.5" />
        <path d="M 0 8 Q 0 0 8 0 L 332 0 Q 340 0 340 8 L 340 32 L 0 32 Z" fill="rgba(56, 189, 248, 0.2)" />
        <circle cx="16" cy="16" r="4" fill="#38bdf8" />
        <text x="28" y="20" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="11" font-weight="700">[ING-01] SENSOR GATEWAYS</text>
        <text x="210" y="20" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="9">REAL TELEMETRY</text>

        <g transform="translate(15, 45)">
          <rect x="0" y="0" width="310" height="46" rx="4" fill="rgba(11, 17, 26, 0.9)" stroke="#38bdf8" stroke-width="1" />
          <text x="12" y="20" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">IoT Edge Gateways (GW-01 .. GW-08)</text>
          <text x="12" y="36" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="9">Protocol: MQTT &bull; Wi-Fi 6 &bull; LoRaWAN &bull; 100ms cycle</text>

          <rect x="0" y="56" width="310" height="46" rx="4" fill="rgba(11, 17, 26, 0.9)" stroke="#38bdf8" stroke-width="1" />
          <text x="12" y="76" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Power &amp; Electrical Modbus Meters</text>
          <text x="12" y="92" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="9">RS-485 / Modbus-TCP &bull; Substation &bull; Phase Loads</text>

          <rect x="0" y="112" width="310" height="46" rx="4" fill="rgba(11, 17, 26, 0.9)" stroke="#38bdf8" stroke-width="1" />
          <text x="12" y="132" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">HVAC &amp; Environmental BACnet Nodes</text>
          <text x="12" y="148" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="9">BACnet/IP &bull; Chiller Sensors &bull; Air Quality Index</text>

          <text x="5" y="180" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Acquisition Capabilities:</text>
          <text x="5" y="198" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10.5">&bull; Hardware Edge Polling &amp; Local Ring Buffer</text>
          <text x="5" y="214" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10.5">&bull; Lossless Store-and-Forward on Network Drop</text>
          <text x="5" y="230" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="9.5">&gt; Solid Electric Blue Stream: 12.4k msgs/sec</text>
        </g>
      </g>

      <!-- Ingress Stream 2: Institutional Adapters & Reported Data (Amber) -->
      <g transform="translate(360, 0)">
        <rect x="0" y="0" width="360" height="290" rx="8" fill="rgba(15, 23, 42, 0.9)" stroke="#fb923c" stroke-width="1.5" />
        <path d="M 0 8 Q 0 0 8 0 L 352 0 Q 360 0 360 8 L 360 32 L 0 32 Z" fill="rgba(251, 146, 60, 0.2)" />
        <circle cx="16" cy="16" r="4" fill="#fb923c" />
        <text x="28" y="20" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="11" font-weight="700">[ING-02] INSTITUTIONAL ADAPTERS</text>
        <text x="235" y="20" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="9">REPORTED DATA</text>

        <g transform="translate(15, 45)">
          <rect x="0" y="0" width="330" height="46" rx="4" fill="rgba(11, 17, 26, 0.9)" stroke="#fb923c" stroke-width="1" stroke-dasharray="3,3" />
          <text x="12" y="20" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">ERP &amp; Facility Work Order Adapter</text>
          <text x="12" y="36" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="9">SAP / Oracle Connector &bull; Maintenance Tickets</text>

          <rect x="0" y="56" width="330" height="46" rx="4" fill="rgba(11, 17, 26, 0.9)" stroke="#fb923c" stroke-width="1" stroke-dasharray="3,3" />
          <text x="12" y="76" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Timetable &amp; SIS Calendar Sync</text>
          <text x="12" y="92" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="9">Classroom Bookings &bull; Exam Timetable API</text>

          <rect x="0" y="112" width="330" height="46" rx="4" fill="rgba(11, 17, 26, 0.9)" stroke="#fb923c" stroke-width="1" stroke-dasharray="3,3" />
          <text x="12" y="132" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Student &amp; Staff Mobile Ingress</text>
          <text x="12" y="148" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="9">PWA Trouble Reports &bull; Kiosk Submissions</text>

          <text x="5" y="180" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Adapter Mechanics:</text>
          <text x="5" y="198" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10.5">&bull; Webhook &amp; REST Polling Connectors</text>
          <text x="5" y="214" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10.5">&bull; Identity-bound Reporter Validation &amp; Trust Score</text>
          <text x="5" y="230" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="9.5">&gt; Amber Dotted Stream: Asynchronous Events</text>
        </g>
      </g>

      <!-- Ingress Stream 3: Synthetic Telemetry Generator (Purple) -->
      <g transform="translate(740, 0)">
        <rect x="0" y="0" width="340" height="290" rx="8" fill="rgba(15, 23, 42, 0.9)" stroke="#c084fc" stroke-width="1.5" stroke-dasharray="6,4" />
        <path d="M 0 8 Q 0 0 8 0 L 332 0 Q 340 0 340 8 L 340 32 L 0 32 Z" fill="rgba(192, 132, 252, 0.2)" />
        <circle cx="16" cy="16" r="4" fill="#c084fc" />
        <text x="28" y="20" fill="#c084fc" font-family="'Geist Mono', monospace" font-size="11" font-weight="700">[ING-03] SYNTHETIC GENERATOR</text>
        <text x="210" y="20" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="9">SYNTHETIC DATA</text>

        <g transform="translate(15, 45)">
          <rect x="0" y="0" width="310" height="46" rx="4" fill="rgba(11, 17, 26, 0.9)" stroke="#c084fc" stroke-width="1" stroke-dasharray="6,3" />
          <text x="12" y="20" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Synthetic Telemetry Generator</text>
          <text x="12" y="36" fill="#c084fc" font-family="'Geist Mono', monospace" font-size="9">Generates artificial stress telemetry for drills</text>

          <rect x="0" y="56" width="310" height="46" rx="4" fill="rgba(11, 17, 26, 0.9)" stroke="#c084fc" stroke-width="1" stroke-dasharray="6,3" />
          <text x="12" y="76" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Virtual Node Load Simulator</text>
          <text x="12" y="92" fill="#c084fc" font-family="'Geist Mono', monospace" font-size="9">Simulates 10,000 synthetic IoT nodes</text>

          <rect x="0" y="112" width="310" height="46" rx="4" fill="rgba(11, 17, 26, 0.9)" stroke="#c084fc" stroke-width="1" stroke-dasharray="6,3" />
          <text x="12" y="132" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Counterfactual Noise Injection</text>
          <text x="12" y="148" fill="#c084fc" font-family="'Geist Mono', monospace" font-size="9">Sensor drift, Gaussian noise, packet loss models</text>

          <text x="5" y="180" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Synthesis Engine:</text>
          <text x="5" y="198" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10.5">&bull; Explicit Cryptographic Header Taint (IS_SYNTHETIC=TRUE)</text>
          <text x="5" y="214" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10.5">&bull; Isolation Protection from Production Twin State</text>
          <text x="5" y="230" fill="#c084fc" font-family="'Geist Mono', monospace" font-size="9.5">&gt; Purple Dashed Stream: Controlled Sandbox</text>
        </g>
      </g>

      <!-- Center Processing Core: Data Validation, Normalization & Imputation -->
      <g transform="translate(1100, 0)">
        <rect x="0" y="0" width="780" height="290" rx="8" fill="rgba(15, 23, 42, 0.92)" stroke="#2dd4bf" stroke-width="1.5" />
        <path d="M 0 8 Q 0 0 8 0 L 772 0 Q 780 0 780 8 L 780 32 L 0 32 Z" fill="rgba(45, 212, 191, 0.2)" />
        <circle cx="16" cy="16" r="4" fill="#2dd4bf" />
        <text x="28" y="20" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="11" font-weight="700">[PIPE-01] DATA VALIDATION, NORMALIZATION &amp; ESTIMATION PIPELINE</text>
        <text x="580" y="20" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="9">STREAM CONVERGENCE</text>

        <!-- Pipeline Stages -->
        <g transform="translate(20, 42)">
          <!-- Stage 1: Validation -->
          <rect x="0" y="0" width="225" height="126" rx="6" fill="rgba(11, 17, 26, 0.95)" stroke="rgba(255,255,255,0.14)" stroke-width="1" />
          <text x="12" y="20" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11.5" font-weight="700">1. Schema Validation</text>
          <text x="12" y="40" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; JSON-Schema Type Checking</text>
          <text x="12" y="56" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Value Range Bounds Checking</text>
          <text x="12" y="72" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Corrupt Payload Quarantine</text>
          <text x="12" y="88" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Deduplication Window: 50ms</text>
          <text x="12" y="112" fill="#34d399" font-family="'Geist Mono', monospace" font-size="9">&gt; 99.98% Clean Pass Rate</text>

          <!-- Stage 2: Normalization -->
          <rect x="255" y="0" width="225" height="126" rx="6" fill="rgba(11, 17, 26, 0.95)" stroke="rgba(255,255,255,0.14)" stroke-width="1" />
          <text x="12" y="20" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11.5" font-weight="700">2. Normalization Engine</text>
          <text x="12" y="40" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Canonical SI Unit Conversion</text>
          <text x="12" y="56" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Epoch UTC Millisecond Sync</text>
          <text x="12" y="72" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Network Clock Drift Alignment</text>
          <text x="12" y="88" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Entity UUID Cross-Referencing</text>
          <text x="12" y="112" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="9">&gt; Normalized Canonical Bus</text>

          <!-- Stage 3: Estimated / Imputed Data -->
          <rect x="510" y="0" width="230" height="126" rx="6" fill="rgba(11, 17, 26, 0.95)" stroke="#2dd4bf" stroke-width="1.2" stroke-dasharray="4,3" />
          <text x="12" y="20" fill="#2dd4bf" font-family="'Geist', sans-serif" font-size="11.5" font-weight="700">3. Estimated Data Engine</text>
          <text x="12" y="40" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Missing Sensor Imputation</text>
          <text x="12" y="56" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Kalman Filter State Estimator</text>
          <text x="12" y="72" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Virtual Flow &amp; Thermal Physics</text>
          <text x="12" y="88" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Confidence Score: 0.91 &plusmn; 0.04</text>
          <text x="12" y="112" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="9">&gt; Cyan Fine Dashed Stream</text>

          <!-- Pipeline summary banner -->
          <rect x="0" y="136" width="740" height="96" rx="4" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(255,255,255,0.08)" stroke-width="0.8" />
          <text x="16" y="156" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Pipeline Ingress Guarantees &amp; Provenance Binding:</text>
          <text x="16" y="174" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10.5">&bull; Cryptographic Provenance Header stamped on every event: [SOURCE, TIMESTAMP, SIGNATURE, FIDELITY_TIER]</text>
          <text x="16" y="190" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10.5">&bull; Strict Partitioning: Real Telemetry (Blue), Reported Data (Amber), Synthetic Telemetry (Purple), Estimated State (Cyan)</text>
          <text x="16" y="206" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10.5">&bull; High-throughput Kafka Partitioning: 16 Topics, Multi-tenant Ingestion with Zero Data Leakage</text>
          <text x="16" y="222" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="9.5">&gt; Total Ingress Throughput: 42.8 MB/sec &bull; Latency: &lt; 8.2ms</text>
        </g>
      </g>
    </g>
    ''')

    # ==========================================================================
    # PLANE 1 — PHYSICAL COLLEGE (Campus Blueprint)
    # y = 3060 .. 3460
    # ==========================================================================
    svg_parts.append(render_plane_base(3060, 3460, "PLANE 01", "PHYSICAL COLLEGE", "MINIATURE ISOMETRIC CAMPUS BLUEPRINT & FACILITY INFRASTRUCTURE", "#94a3b8", "LEVEL 01"))

    svg_parts.append(f'''
    <!-- PLANE 1 CONTENT: MINIATURE ISOMETRIC CAMPUS BLUEPRINT -->
    <g id="plane-1-campus" transform="translate(630, 3120)">
      <!-- ZONE 1: ACADEMIC WING — CLASSROOMS & LECTURE HALLS -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="480" height="290" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke="#94a3b8" stroke-width="1.2" />
        <path d="M 0 6 Q 0 0 6 0 L 474 0 Q 480 0 480 6 L 480 26 L 0 26 Z" fill="rgba(148, 163, 184, 0.2)" />
        <text x="14" y="17" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">ACADEMIC WING &bull; 8 CLASSROOMS &amp; 2 LECTURE HALLS</text>

        <!-- Classroom Row 1 -->
        <g transform="translate(15, 36)">
          <!-- CR-101 -->
          <rect x="0" y="0" width="102" height="52" rx="3" fill="rgba(11, 17, 26, 0.95)" stroke="rgba(255,255,255,0.2)" stroke-width="0.8" />
          <text x="8" y="18" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9" font-weight="600">CR-101</text>
          <text x="8" y="32" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="8">Cap: 40 &bull; Desks</text>
          <circle cx="88" cy="14" r="3" fill="#38bdf8" />

          <!-- CR-102 -->
          <rect x="112" y="0" width="102" height="52" rx="3" fill="rgba(11, 17, 26, 0.95)" stroke="rgba(255,255,255,0.2)" stroke-width="0.8" />
          <text x="8" y="18" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9" font-weight="600">CR-102</text>
          <text x="8" y="32" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="8">Cap: 40 &bull; Desks</text>
          <circle cx="88" cy="14" r="3" fill="#38bdf8" />

          <!-- CR-103 -->
          <rect x="224" y="0" width="102" height="52" rx="3" fill="rgba(11, 17, 26, 0.95)" stroke="rgba(255,255,255,0.2)" stroke-width="0.8" />
          <text x="8" y="18" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9" font-weight="600">CR-103</text>
          <text x="8" y="32" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="8">Cap: 40 &bull; Desks</text>
          <circle cx="88" cy="14" r="3" fill="#38bdf8" />

          <!-- CR-104 (Focal Highlight Room) -->
          <rect x="336" y="0" width="102" height="52" rx="3" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" stroke-width="1.2" />
          <text x="8" y="18" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9" font-weight="700">CR-104 [FOCAL]</text>
          <text x="8" y="32" fill="#38bdf8" font-family="'Geist', sans-serif" font-size="8">Smart Projector &bull; IoT</text>
          <circle cx="88" cy="14" r="4" fill="#38bdf8" />
        </g>

        <!-- Classroom Row 2 -->
        <g transform="translate(15, 96)">
          <!-- CR-105 -->
          <rect x="0" y="0" width="102" height="52" rx="3" fill="rgba(11, 17, 26, 0.95)" stroke="rgba(255,255,255,0.2)" stroke-width="0.8" />
          <text x="8" y="18" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9" font-weight="600">CR-105</text>
          <text x="8" y="32" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="8">Cap: 40</text>
          <circle cx="88" cy="14" r="3" fill="#38bdf8" />

          <!-- CR-106 -->
          <rect x="112" y="0" width="102" height="52" rx="3" fill="rgba(11, 17, 26, 0.95)" stroke="rgba(255,255,255,0.2)" stroke-width="0.8" />
          <text x="8" y="18" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9" font-weight="600">CR-106</text>
          <text x="8" y="32" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="8">Cap: 40</text>
          <circle cx="88" cy="14" r="3" fill="#38bdf8" />

          <!-- CR-107 -->
          <rect x="224" y="0" width="102" height="52" rx="3" fill="rgba(11, 17, 26, 0.95)" stroke="rgba(255,255,255,0.2)" stroke-width="0.8" />
          <text x="8" y="18" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9" font-weight="600">CR-107</text>
          <text x="8" y="32" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="8">Cap: 40</text>
          <circle cx="88" cy="14" r="3" fill="#38bdf8" />

          <!-- CR-108 -->
          <rect x="336" y="0" width="102" height="52" rx="3" fill="rgba(11, 17, 26, 0.95)" stroke="rgba(255,255,255,0.2)" stroke-width="0.8" />
          <text x="8" y="18" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9" font-weight="600">CR-108</text>
          <text x="8" y="32" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="8">Cap: 40</text>
          <circle cx="88" cy="14" r="3" fill="#38bdf8" />
        </g>

        <!-- Lecture Halls Row 3 -->
        <g transform="translate(15, 156)">
          <!-- LH-01 -->
          <rect x="0" y="0" width="214" height="64" rx="3" fill="rgba(11, 17, 26, 0.95)" stroke="rgba(255,255,255,0.25)" stroke-width="1" />
          <text x="12" y="22" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">LECTURE HALL ALPHA (LH-01)</text>
          <text x="12" y="38" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="9">Tiered Seating &bull; Capacity: 180 &bull; Dual Projection</text>
          <text x="12" y="52" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="8">&bull; Environmental Sensor Gateway Node GW-02</text>
          <circle cx="198" cy="18" r="4" fill="#38bdf8" />

          <!-- LH-02 -->
          <rect x="224" y="0" width="214" height="64" rx="3" fill="rgba(11, 17, 26, 0.95)" stroke="rgba(255,255,255,0.25)" stroke-width="1" />
          <text x="12" y="22" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">LECTURE HALL BETA (LH-02)</text>
          <text x="12" y="38" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="9">Tiered Seating &bull; Capacity: 180 &bull; Audio Mesh</text>
          <text x="12" y="52" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="8">&bull; Environmental Sensor Gateway Node GW-03</text>
          <circle cx="198" cy="18" r="4" fill="#38bdf8" />
        </g>

        <!-- Wing Corridor and Access Info -->
        <text x="18" y="244" fill="#cbd5e1" font-family="'Geist', sans-serif" font-size="10">&bull; Access Corridor with PoE Wi-Fi 6 APs every 18m &bull; Emergency Exit Routes</text>
        <text x="18" y="262" fill="#64748b" font-family="'Geist Mono', monospace" font-size="9">BIM Elements: Wall (300mm), Glazing, HVAC Diffusers &bull; Level: Floor 1</text>
      </g>

      <!-- ZONE 2: ADVANCED LABORATORIES (Center-Left Section) -->
      <g transform="translate(500, 0)">
        <rect x="0" y="0" width="480" height="290" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke="#2dd4bf" stroke-width="1.2" />
        <path d="M 0 6 Q 0 0 6 0 L 474 0 Q 480 0 480 6 L 480 26 L 0 26 Z" fill="rgba(45, 212, 191, 0.2)" />
        <text x="14" y="17" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">ADVANCED RESEARCH LABORATORIES (3 LABS)</text>

        <!-- LAB 1: Computing Lab -->
        <g transform="translate(15, 36)">
          <rect x="0" y="0" width="450" height="66" rx="4" fill="rgba(11, 17, 26, 0.95)" stroke="rgba(255,255,255,0.2)" stroke-width="0.8" />
          <text x="14" y="22" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="11" font-weight="700">LAB 01: HIGH-PERFORMANCE COMPUTING LAB</text>
          <text x="14" y="38" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="9.5">60 Workstations &bull; Gigabit Switch Trunk &bull; Isolated Testing VLAN</text>
          <text x="14" y="54" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="8.5">Power Load: 24.5 kW &bull; Sub-metered &bull; Smart Access Locks</text>
          <circle cx="430" cy="18" r="4" fill="#2dd4bf" />
        </g>

        <!-- LAB 2: AI & Robotics Lab (Focal Research Lab) -->
        <g transform="translate(15, 110)">
          <rect x="0" y="0" width="450" height="74" rx="4" fill="rgba(45, 212, 191, 0.15)" stroke="#2dd4bf" stroke-width="1.4" />
          <text x="14" y="22" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="11" font-weight="700">LAB 02: AI, AUTONOMOUS SYSTEMS &amp; ROBOTICS LAB [CRITICAL]</text>
          <text x="14" y="38" fill="#ffffff" font-family="'Geist', sans-serif" font-size="9.5">GPU Compute Cluster &bull; Robotic Workcells &bull; High-Density Power Feeds</text>
          <text x="14" y="52" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="9">Dedicated Chilled Water Loop &bull; Safety Interlocks &bull; Vision Calibration Grid</text>
          <text x="14" y="66" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="8.5">Telemetry: Modbus Power (Phase A/B/C) + Vibration + Ambient Temp/Humidity</text>
          <circle cx="430" cy="18" r="5" fill="#2dd4bf" />
        </g>

        <!-- LAB 3: Power & Electrical Networks Lab -->
        <g transform="translate(15, 192)">
          <rect x="0" y="0" width="450" height="66" rx="4" fill="rgba(11, 17, 26, 0.95)" stroke="rgba(255,255,255,0.2)" stroke-width="0.8" />
          <text x="14" y="22" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="11" font-weight="700">LAB 03: POWER SYSTEMS &amp; HIGH-VOLTAGE NETWORKS LAB</text>
          <text x="14" y="38" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="9.5">Smart Grid Testbed &bull; Motor-Generator Sets &bull; SCADA Test Interface</text>
          <text x="14" y="54" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="8.5">Grid Ingress Test Harness &bull; Direct Connection to Substation Sub-bus</text>
          <circle cx="430" cy="18" r="4" fill="#fb923c" />
        </g>

        <text x="18" y="278" fill="#64748b" font-family="'Geist Mono', monospace" font-size="9">All Labs equipped with dedicated breaker panels, EPO safety switches &amp; UPS drops</text>
      </g>

      <!-- ZONE 3: ADMINISTRATIVE & FACULTY OFFICES (Center-Right Section) -->
      <g transform="translate(1000, 0)">
        <rect x="0" y="0" width="390" height="290" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke="#94a3b8" stroke-width="1.2" />
        <path d="M 0 6 Q 0 0 6 0 L 384 0 Q 390 0 390 6 L 390 26 L 0 26 Z" fill="rgba(148, 163, 184, 0.2)" />
        <text x="14" y="17" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">ADMINISTRATION &amp; FACULTY HUBS</text>

        <!-- Administrative Offices -->
        <g transform="translate(15, 36)">
          <rect x="0" y="0" width="360" height="46" rx="4" fill="rgba(11, 17, 26, 0.95)" stroke="rgba(255,255,255,0.15)" stroke-width="0.8" />
          <text x="12" y="20" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9.5" font-weight="600">Administrative Suite &bull; Dean &amp; Registrar</text>
          <text x="12" y="34" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="9">Executive Operations, SIS terminals, Records Vault</text>

          <rect x="0" y="54" width="360" height="46" rx="4" fill="rgba(11, 17, 26, 0.95)" stroke="rgba(255,255,255,0.15)" stroke-width="0.8" />
          <text x="12" y="74" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9.5" font-weight="600">Facilities Management &amp; Security NOC</text>
          <text x="12" y="88" fill="#38bdf8" font-family="'Geist', sans-serif" font-size="9">Campus BMS dispatch, Fire alarm panel, CCTV matrix</text>

          <rect x="0" y="108" width="360" height="46" rx="4" fill="rgba(11, 17, 26, 0.95)" stroke="rgba(255,255,255,0.15)" stroke-width="0.8" />
          <text x="12" y="128" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9.5" font-weight="600">Faculty Department Offices (North Wing)</text>
          <text x="12" y="142" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="9">Computer Science &amp; Electrical Engineering Hubs</text>

          <rect x="0" y="162" width="360" height="46" rx="4" fill="rgba(11, 17, 26, 0.95)" stroke="rgba(255,255,255,0.15)" stroke-width="0.8" />
          <text x="12" y="182" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9.5" font-weight="600">Faculty Department Offices (South Wing)</text>
          <text x="12" y="196" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="9">Mechanical Engineering &amp; Applied Sciences</text>
        </g>

        <text x="18" y="244" fill="#cbd5e1" font-family="'Geist', sans-serif" font-size="10">&bull; Conference Annex &amp; Academic Senate Boardroom</text>
        <text x="18" y="262" fill="#64748b" font-family="'Geist Mono', monospace" font-size="9">IDF-03 Switch Cabinet &bull; Dedicated Environmental Sensor</text>
      </g>

      <!-- ZONE 4: CAMPUS INFRASTRUCTURE CORE — POWER, DATA CENTRE & NETWORK (Right Section) -->
      <g transform="translate(1410, 0)">
        <rect x="0" y="0" width="470" height="290" rx="6" fill="rgba(15, 23, 42, 0.92)" stroke="#f87171" stroke-width="1.4" />
        <path d="M 0 6 Q 0 0 6 0 L 464 0 Q 470 0 470 6 L 470 26 L 0 26 Z" fill="rgba(248, 113, 113, 0.2)" />
        <text x="14" y="17" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">UTILITY CORE &bull; POWER, DATA CENTRE &amp; NETWORK BACKBONE</text>

        <!-- Power Room -->
        <g transform="translate(15, 36)">
          <rect x="0" y="0" width="440" height="70" rx="4" fill="rgba(11, 17, 26, 0.95)" stroke="#fb923c" stroke-width="1.2" />
          <text x="14" y="20" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">MAIN POWER SUPPLY ROOM &amp; SUBSTATION</text>
          <text x="14" y="36" fill="#ffffff" font-family="'Geist', sans-serif" font-size="9.5">&bull; 11kV Grid Ingress &bull; Dual Step-Down Transformers (T1/T2)</text>
          <text x="14" y="50" fill="#ffffff" font-family="'Geist', sans-serif" font-size="9.5">&bull; Automatic Transfer Switch (ATS) &bull; Diesel Generator Set (500 kVA)</text>
          <text x="14" y="64" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="8.5">&bull; Modular High-Capacity UPS Battery Room (N+1 Redundancy)</text>
          <circle cx="420" cy="18" r="4" fill="#fb923c" />
        </g>

        <!-- Data Centre -->
        <g transform="translate(15, 112)">
          <rect x="0" y="0" width="440" height="74" rx="4" fill="rgba(11, 17, 26, 0.95)" stroke="#38bdf8" stroke-width="1.2" />
          <text x="14" y="20" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">CAMPUS DATA CENTRE (TIER-III SPEC)</text>
          <text x="14" y="36" fill="#ffffff" font-family="'Geist', sans-serif" font-size="9.5">&bull; Server Racks R01 through R06 &bull; In-Row Precision Cooling</text>
          <text x="14" y="50" fill="#ffffff" font-family="'Geist', sans-serif" font-size="9.5">&bull; On-Premise Virtualization Cluster &bull; Storage SAN &bull; Core Database</text>
          <text x="14" y="66" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="8.5">&bull; Dual Redundant A/B Power Feeds &bull; Very Early Smoke Detection (VESDA)</text>
          <circle cx="420" cy="18" r="4" fill="#38bdf8" />
        </g>

        <!-- Network Infrastructure & Campus Connectivity -->
        <g transform="translate(15, 192)">
          <rect x="0" y="0" width="440" height="82" rx="4" fill="rgba(11, 17, 26, 0.95)" stroke="#2dd4bf" stroke-width="1.2" />
          <text x="14" y="20" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">NETWORK INFRASTRUCTURE &amp; CAMPUS CONNECTIVITY</text>
          <text x="14" y="36" fill="#ffffff" font-family="'Geist', sans-serif" font-size="9.5">&bull; Main Distribution Frame (MDF) &bull; 10GbE Single-Mode Fiber Ring</text>
          <text x="14" y="50" fill="#ffffff" font-family="'Geist', sans-serif" font-size="9.5">&bull; Intermediate Distribution Frames (IDF-01 .. IDF-06) across all wings</text>
          <text x="14" y="64" fill="#ffffff" font-family="'Geist', sans-serif" font-size="9.5">&bull; Campus Wi-Fi 6 AP Matrix &bull; Outdoor LoRaWAN Gateway &bull; 5G Ingress</text>
          <text x="14" y="76" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="8.5">&bull; Dedicated Out-of-Band Management Network (Isolated VLAN)</text>
          <circle cx="420" cy="18" r="4" fill="#2dd4bf" />
        </g>
      </g>
    </g>
    ''')

    # ==========================================================================
    # CROSS-CUTTING SECURITY & GOVERNANCE PILLAR (Vertical Column on Left)
    # Spans all 6 planes: x = 90 .. 390 (width = 300)
    # y = 360 .. 3460 (height = 3100)
    # ==========================================================================
    svg_parts.append(f'''
    <!-- CROSS-CUTTING SECURITY & GOVERNANCE ARCHITECTURAL PILLAR -->
    <g id="security-pillar" transform="translate(90, 360)">
      <rect x="0" y="0" width="310" height="3100" rx="8" fill="url(#grad-security)" stroke="#f87171" stroke-width="1.5" />
      
      <path d="M 0 8 Q 0 0 8 0 L 302 0 Q 310 0 310 8 L 310 50 L 0 50 Z" fill="rgba(248, 113, 113, 0.25)" />
      <circle cx="20" cy="25" r="5" fill="#f87171" />
      <text x="35" y="22" fill="#f87171" font-family="'Geist Mono', monospace" font-size="11" font-weight="700">CROSS-CUTTING SECURITY</text>
      <text x="35" y="38" fill="#ffffff" font-family="'Geist', sans-serif" font-size="13" font-weight="600">&amp; GOVERNANCE SPINE</text>

      <!-- Block for Plane 6 Alignment -->
      <g transform="translate(15, 65)">
        <rect x="0" y="0" width="280" height="320" rx="6" fill="rgba(11, 17, 26, 0.85)" stroke="rgba(255,255,255,0.15)" stroke-width="0.8" />
        <rect x="0" y="0" width="280" height="24" rx="6" fill="rgba(56, 189, 248, 0.15)" />
        <text x="10" y="16" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="9.5" font-weight="600">PLANE 06 INTERFACE RBAC</text>
        <text x="10" y="42" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Identity &amp; Role Management</text>
        <text x="10" y="60" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; OAuth 2.0 / OpenID Connect / SAML</text>
        <text x="10" y="76" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Multi-Factor Auth (MFA) Enforcement</text>
        <text x="10" y="92" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Role-Based Access Scopes:</text>
        <text x="20" y="108" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="9">- ROLE_OPERATIONS_DIRECTOR</text>
        <text x="20" y="122" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="9">- ROLE_FACILITY_ENGINEER</text>
        <text x="20" y="136" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="9">- ROLE_ACADEMIC_DEAN</text>
        <text x="20" y="150" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="9">- ROLE_STUDENT_CITIZEN</text>
        
        <line x1="10" y1="164" x2="270" y2="164" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />
        <text x="10" y="184" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Session &amp; Token Guard</text>
        <text x="10" y="202" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Ephemeral JWT with Cryptographic Claims</text>
        <text x="10" y="218" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Real-time Token Revocation Bus</text>
        <text x="10" y="234" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Zero-Trust Session Auditing</text>
        <text x="10" y="250" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Client IP &amp; Geofence Verification</text>
        <text x="10" y="270" fill="#34d399" font-family="'Geist Mono', monospace" font-size="9">&gt; ABAC Policies Evaluated in &lt; 1ms</text>
      </g>

      <path d="M 295 225 L 470 225 L 630 460" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-dasharray="4,4" marker-end="url(#arrow-blue)" />

      <!-- Block for Plane 5 Alignment -->
      <g transform="translate(15, 605)">
        <rect x="0" y="0" width="280" height="320" rx="6" fill="rgba(11, 17, 26, 0.85)" stroke="rgba(255,255,255,0.15)" stroke-width="0.8" />
        <rect x="0" y="0" width="280" height="24" rx="6" fill="rgba(251, 146, 60, 0.15)" />
        <text x="10" y="16" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="9.5" font-weight="600">PLANE 05 APPROVAL GOVERNANCE</text>
        <text x="10" y="42" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Human-in-the-Loop Mandates</text>
        <text x="10" y="60" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Physical Actuation Approval Gate</text>
        <text x="10" y="76" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Multi-signature Verification for:</text>
        <text x="20" y="92" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="9">- Grid Breaker Remote Tripping</text>
        <text x="20" y="106" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="9">- Fire Suppression Overrides</text>
        <text x="20" y="120" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="9">- Class Rescheduling &gt; 50 students</text>
        
        <line x1="10" y1="135" x2="270" y2="135" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />
        <text x="10" y="155" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Simulation Containment Sandbox</text>
        <text x="10" y="173" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Strict Logical Isolation Boundary</text>
        <text x="10" y="189" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Prevention of Simulated Fault Leakage</text>
        <text x="10" y="205" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Ephemeral Memory Wiped on Exit</text>
        <text x="10" y="221" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Audit Trail of Chaos Experiments</text>
        <text x="10" y="240" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="9">&gt; Strict Human Sign-Off Enforced</text>
      </g>

      <path d="M 295 765 L 470 765 L 630 1000" fill="none" stroke="#fb923c" stroke-width="1.8" stroke-dasharray="4,4" marker-end="url(#arrow-amber)" />

      <!-- Block for Plane 4 Alignment -->
      <g transform="translate(15, 1145)">
        <rect x="0" y="0" width="280" height="320" rx="6" fill="rgba(11, 17, 26, 0.85)" stroke="rgba(255,255,255,0.15)" stroke-width="0.8" />
        <rect x="0" y="0" width="280" height="24" rx="6" fill="rgba(129, 140, 248, 0.15)" />
        <text x="10" y="16" fill="#818cf8" font-family="'Geist Mono', monospace" font-size="9.5" font-weight="600">PLANE 04 ENGINE GOVERNANCE</text>
        <text x="10" y="42" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Algorithmic Safety Constraints</text>
        <text x="10" y="60" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Model Guardrails &amp; Bounds Check</text>
        <text x="10" y="76" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Explainability &amp; Feature Attribution</text>
        <text x="10" y="92" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Optimization Constraint Invariants:</text>
        <text x="20" y="108" fill="#818cf8" font-family="'Geist Mono', monospace" font-size="9">- Life-Safety First Principle</text>
        <text x="20" y="122" fill="#818cf8" font-family="'Geist Mono', monospace" font-size="9">- Max Power Margin: 120%</text>
        <text x="20" y="136" fill="#818cf8" font-family="'Geist Mono', monospace" font-size="9">- Lab Evacuation Time &lt; 3 min</text>
        
        <line x1="10" y1="150" x2="270" y2="150" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />
        <text x="10" y="170" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Decision Provenance Tracking</text>
        <text x="10" y="188" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Full Audit Trail of Recommendations</text>
        <text x="10" y="204" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Mathematical Proof of Optimality</text>
        <text x="10" y="220" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Automated Bias &amp; Fairness Monitor</text>
        <text x="10" y="240" fill="#818cf8" font-family="'Geist Mono', monospace" font-size="9">&gt; Verifiable Heuristics Guarantee</text>
      </g>

      <path d="M 295 1305 L 470 1305 L 640 1540" fill="none" stroke="#818cf8" stroke-width="1.8" stroke-dasharray="4,4" marker-end="url(#arrow-white)" />

      <!-- Block for Plane 3 Alignment -->
      <g transform="translate(15, 1685)">
        <rect x="0" y="0" width="280" height="320" rx="6" fill="rgba(11, 17, 26, 0.85)" stroke="rgba(255,255,255,0.15)" stroke-width="0.8" />
        <rect x="0" y="0" width="280" height="24" rx="6" fill="rgba(45, 212, 191, 0.15)" />
        <text x="10" y="16" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="9.5" font-weight="600">PLANE 03 TWIN GRAPH INTEGRITY</text>
        <text x="10" y="42" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Graph Security &amp; Provenance</text>
        <text x="10" y="60" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Canonical Schema Signature Verifier</text>
        <text x="10" y="76" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Node &amp; Edge Tamper Detection</text>
        <text x="10" y="92" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Entity Permissions Matrix (CRUD):</text>
        <text x="20" y="108" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="9">- Read: Public / Academic</text>
        <text x="20" y="122" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="9">- Mutate Topology: Facility Admin</text>
        <text x="20" y="136" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="9">- Real-time Telemetry: Auth Gateways</text>
        
        <line x1="10" y1="150" x2="270" y2="150" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />
        <text x="10" y="170" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Immutable Audit Journal</text>
        <text x="10" y="188" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Append-Only State Ledger</text>
        <text x="10" y="204" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Cryptographic Merkle Tree Hashes</text>
        <text x="10" y="220" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Point-in-time Forensic Replay</text>
        <text x="10" y="240" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="9">&gt; Zero Unauthorized Graph Writes</text>
      </g>

      <path d="M 295 1845 L 470 1845 L 630 2080" fill="none" stroke="#2dd4bf" stroke-width="1.8" stroke-dasharray="4,4" marker-end="url(#arrow-teal)" />

      <!-- Block for Plane 2 Alignment -->
      <g transform="translate(15, 2225)">
        <rect x="0" y="0" width="280" height="320" rx="6" fill="rgba(11, 17, 26, 0.85)" stroke="rgba(255,255,255,0.15)" stroke-width="0.8" />
        <rect x="0" y="0" width="280" height="24" rx="6" fill="rgba(56, 189, 248, 0.15)" />
        <text x="10" y="16" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="9.5" font-weight="600">PLANE 02 INGRESS PROVENANCE</text>
        <text x="10" y="42" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Cryptographic Data Taint</text>
        <text x="10" y="60" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Provenance Origin Attestation</text>
        <text x="10" y="76" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Hardware TPM / Secure Enclave Auth</text>
        <text x="10" y="92" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Data Fidelity Verification:</text>
        <text x="20" y="108" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="9">- Real Sensor: Signed mTLS Key</text>
        <text x="20" y="122" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="9">- Reported: Citizen User Auth</text>
        <text x="20" y="136" fill="#c084fc" font-family="'Geist Mono', monospace" font-size="9">- Synthetic: Taint Header Applied</text>
        
        <line x1="10" y1="150" x2="270" y2="150" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />
        <text x="10" y="170" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Stream Boundary Firewalls</text>
        <text x="10" y="188" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Anti-Spoofing Protocol Filters</text>
        <text x="10" y="204" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Rate-Limiting &amp; DDoS Mitigation</text>
        <text x="10" y="220" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; TLS 1.3 End-to-End Encryption</text>
        <text x="10" y="240" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="9">&gt; Verified Hardware Roots of Trust</text>
      </g>

      <path d="M 295 2385 L 470 2385 L 630 2620" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-dasharray="4,4" marker-end="url(#arrow-blue)" />

      <!-- Block for Plane 1 Alignment -->
      <g transform="translate(15, 2765)">
        <rect x="0" y="0" width="280" height="300" rx="6" fill="rgba(11, 17, 26, 0.85)" stroke="rgba(255,255,255,0.15)" stroke-width="0.8" />
        <rect x="0" y="0" width="280" height="24" rx="6" fill="rgba(148, 163, 184, 0.15)" />
        <text x="10" y="16" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="9.5" font-weight="600">PLANE 01 PHYSICAL SECURITY</text>
        <text x="10" y="42" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Hardware &amp; Facility Access</text>
        <text x="10" y="60" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Badge &amp; Biometric Access Readers</text>
        <text x="10" y="76" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Substation Physical Perimeter Fence</text>
        <text x="10" y="92" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Data Centre Two-Person Rule</text>
        <text x="10" y="108" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Server Rack Tamper Switches</text>
        
        <line x1="10" y1="125" x2="270" y2="125" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />
        <text x="10" y="145" fill="#ffffff" font-family="'Geist', sans-serif" font-size="11" font-weight="600">Emergency &amp; Life Safety</text>
        <text x="10" y="163" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Hardwired Emergency Power Off (EPO)</text>
        <text x="10" y="179" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Fire Alarm Override Isolation</text>
        <text x="10" y="195" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Chemical Spill Sensors in Lab L-3</text>
        <text x="10" y="211" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Battery Room Hydrogen Gas Monitor</text>
        <text x="10" y="235" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="9">&gt; 100% Fail-Safe Architecture</text>
      </g>

      <path d="M 295 2925 L 470 2925 L 630 3160" fill="none" stroke="#94a3b8" stroke-width="1.8" stroke-dasharray="4,4" marker-end="url(#arrow-white)" />
    </g>
    ''')

    # ==========================================================================
    # INTER-PLANE VERTICAL HIGH-CAPACITY DATA CONDUITS
    # ==========================================================================
    svg_parts.append(f'''
    <!-- VERTICAL INTER-PLANE CAUSAL & DATA CONDUITS -->
    <g id="inter-plane-conduits">
      <!-- 1. Plane 1 -> Plane 2: Raw Sensor & Gateway Uplink -->
      <g id="conduit-p1-to-p2">
        <path d="M 800 3120 L 800 2930" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrow-blue)" />
        <rect x="750" y="3005" width="100" height="24" rx="3" fill="#0B111A" stroke="#38bdf8" stroke-width="1" />
        <text x="800" y="3021" text-anchor="middle" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="9" font-weight="600">IOT / MODBUS</text>

        <path d="M 1200 3120 L 1200 2930" stroke="#fb923c" stroke-width="2" stroke-dasharray="3,3" marker-end="url(#arrow-amber)" />
        <rect x="1145" y="3005" width="110" height="24" rx="3" fill="#0B111A" stroke="#fb923c" stroke-width="1" />
        <text x="1200" y="3021" text-anchor="middle" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="9" font-weight="600">WORK ORDERS</text>

        <path d="M 1600 3120 L 1600 2930" stroke="#2dd4bf" stroke-width="2.5" marker-end="url(#arrow-teal)" />
        <rect x="1540" y="3005" width="120" height="24" rx="3" fill="#0B111A" stroke="#2dd4bf" stroke-width="1" />
        <text x="1600" y="3021" text-anchor="middle" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="9" font-weight="600">FIBER BACKBONE</text>
      </g>

      <!-- 2. Plane 2 -> Plane 3: Validated Event Pipeline & Stream Ingest -->
      <g id="conduit-p2-to-p3">
        <path d="M 1000 2580 L 1000 2390" stroke="#2dd4bf" stroke-width="3" marker-end="url(#arrow-teal)" />
        <rect x="910" y="2465" width="180" height="26" rx="4" fill="#0B111A" stroke="#2dd4bf" stroke-width="1.2" />
        <text x="1000" y="2482" text-anchor="middle" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="9.5" font-weight="700">CANONICAL TELEMETRY STREAM</text>

        <path d="M 1700 2580 L 1700 2390" stroke="#38bdf8" stroke-width="2.2" marker-end="url(#arrow-blue)" />
        <rect x="1620" y="2465" width="160" height="26" rx="4" fill="#0B111A" stroke="#38bdf8" stroke-width="1" />
        <text x="1700" y="2482" text-anchor="middle" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="9" font-weight="600">SPATIAL BIM ENRICHMENT</text>
      </g>

      <!-- 3. Plane 3 -> Plane 4: Live State Graph to 7 Intelligence Engines -->
      <g id="conduit-p3-to-p4">
        <path d="M 1100 2040 L 1100 1850" stroke="#818cf8" stroke-width="3" marker-end="url(#arrow-white)" />
        <rect x="1010" y="1925" width="180" height="26" rx="4" fill="#0B111A" stroke="#818cf8" stroke-width="1.2" />
        <text x="1100" y="1942" text-anchor="middle" fill="#818cf8" font-family="'Geist Mono', monospace" font-size="9.5" font-weight="700">LIVE GRAPH STATE &amp; ANOMALY FEED</text>
      </g>

      <!-- 4. Plane 4 -> Plane 5: Causal Findings & Mitigation Candidates to Simulation -->
      <g id="conduit-p4-to-p5">
        <path d="M 1300 1500 L 1300 1310" stroke="#fb923c" stroke-width="2.8" marker-end="url(#arrow-amber)" />
        <rect x="1190" y="1385" width="220" height="26" rx="4" fill="#0B111A" stroke="#fb923c" stroke-width="1.2" />
        <text x="1300" y="1402" text-anchor="middle" fill="#fb923c" font-family="'Geist Mono', monospace" font-size="9.5" font-weight="700">CANDIDATE RECOVERY PLAYBOOKS</text>
      </g>

      <!-- 5. Plane 5 -> Plane 6: Approved Plans & Verified Dashboards to Applications -->
      <g id="conduit-p5-to-p6">
        <path d="M 1200 960 L 1200 770" stroke="#38bdf8" stroke-width="3" marker-end="url(#arrow-blue)" />
        <rect x="1100" y="845" width="200" height="26" rx="4" fill="#0B111A" stroke="#38bdf8" stroke-width="1.2" />
        <text x="1200" y="862" text-anchor="middle" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="9.5" font-weight="700">APPROVED COMMAND &amp; KPI WALL</text>

        <path d="M 1800 960 L 1800 770" stroke="#22c55e" stroke-width="2.5" marker-end="url(#arrow-teal)" />
        <rect x="1710" y="845" width="180" height="26" rx="4" fill="#0B111A" stroke="#22c55e" stroke-width="1" />
        <text x="1800" y="862" text-anchor="middle" fill="#22c55e" font-family="'Geist Mono', monospace" font-size="9" font-weight="600">VERIFIED INCIDENT RESOLUTIONS</text>
      </g>

      <!-- 6. Closed-Loop Feedback Conduit: Plane 6 / Plane 5 -> Plane 1 (Physical Dispatch) -->
      <g id="conduit-closed-loop">
        <path d="M 2350 760 L 2350 3120" stroke="#22c55e" stroke-width="2" stroke-dasharray="6,4" marker-end="url(#arrow-teal)" />
        <rect x="2250" y="1950" width="200" height="42" rx="4" fill="#0B111A" stroke="#22c55e" stroke-width="1.2" />
        <text x="2350" y="1968" text-anchor="middle" fill="#22c55e" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">CLOSED-LOOP ACTUATION</text>
        <text x="2350" y="1983" text-anchor="middle" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="8.5">Work Orders &bull; Breaker Reroute &bull; BMS</text>
      </g>
    </g>
    ''')

    # 4. Technical Blueprint Footer Block
    svg_parts.append(f'''
    <!-- FOOTER TECHNICAL METRICS & SPECIFICATIONS BLOCK -->
    <g id="footer-block" transform="translate(90, 3500)">
      <rect x="0" y="0" width="2420" height="150" rx="8" fill="rgba(15, 23, 42, 0.7)" stroke="rgba(255, 255, 255, 0.2)" stroke-width="1.2" />
      
      <!-- Crosshair corner markers -->
      <path d="M -10 0 L 10 0 M 0 -10 L 0 10" stroke="#38bdf8" stroke-width="1.5" />
      <path d="M 2410 0 L 2430 0 M 2420 -10 L 2420 10" stroke="#38bdf8" stroke-width="1.5" />
      <path d="M -10 150 L 10 150 M 0 140 L 0 160" stroke="#38bdf8" stroke-width="1.5" />
      <path d="M 2410 150 L 2430 150 M 2420 140 L 2420 160" stroke="#38bdf8" stroke-width="1.5" />

      <!-- Col 1: System Info -->
      <g transform="translate(30, 25)">
        <text x="0" y="16" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="11" font-weight="700">OMNIS-X MASTER ARCHITECTURE SPECIFICATION</text>
        <text x="0" y="38" fill="#ffffff" font-family="'Geist', sans-serif" font-size="12" font-weight="600">Institutional Digital Twin &amp; Decision Support System</text>
        <text x="0" y="56" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="11">Production Reference Specification &bull; Document Rev: 3.4.0</text>
        <text x="0" y="74" fill="#64748b" font-family="'Geist Mono', monospace" font-size="10">AUTH: GOOGLE DEEPMIND / OMNIS-X ENGINEERING GROUP</text>
      </g>

      <!-- Col 2: Architecture Layer Summary -->
      <g transform="translate(680, 25)">
        <text x="0" y="16" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="10" font-weight="600">ARCHITECTURAL TIERS (BOTTOM TO TOP)</text>
        <text x="0" y="36" fill="#e2e8f0" font-family="'Geist', sans-serif" font-size="11">Level 01: Physical Campus (Classrooms, Labs, Data Centre, Substation)</text>
        <text x="0" y="52" fill="#e2e8f0" font-family="'Geist', sans-serif" font-size="11">Level 02: Multi-Protocol Data Acquisition &amp; Real-time Normalization</text>
        <text x="0" y="68" fill="#e2e8f0" font-family="'Geist', sans-serif" font-size="11">Level 03: Digital Twin Core (Directed Causal Graph &amp; Operational State)</text>
        <text x="0" y="84" fill="#e2e8f0" font-family="'Geist', sans-serif" font-size="11">Level 04: Seven Specialist Analytic &amp; Optimization Intelligence Engines</text>
        <text x="0" y="100" fill="#e2e8f0" font-family="'Geist', sans-serif" font-size="11">Level 05: Counterfactual Simulation Sandbox &amp; Human Approval Gateway</text>
        <text x="0" y="116" fill="#e2e8f0" font-family="'Geist', sans-serif" font-size="11">Level 06: Operational Command Interfaces &amp; Public Citizen Portals</text>
      </g>

      <!-- Col 3: Key Principles -->
      <g transform="translate(1450, 25)">
        <text x="0" y="16" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="10" font-weight="600">GOVERNANCE &amp; VERIFICATION ASSURANCES</text>
        <text x="0" y="36" fill="#e2e8f0" font-family="'Geist', sans-serif" font-size="11">&bull; Human-in-the-Loop Approval required prior to any physical actuation</text>
        <text x="0" y="52" fill="#e2e8f0" font-family="'Geist', sans-serif" font-size="11">&bull; Zero-Trust RBAC across all ingress, graph and control surfaces</text>
        <text x="0" y="68" fill="#e2e8f0" font-family="'Geist', sans-serif" font-size="11">&bull; Strict Cryptographic Taint isolation between real and synthetic streams</text>
        <text x="0" y="84" fill="#e2e8f0" font-family="'Geist', sans-serif" font-size="11">&bull; Explainable, deterministic mathematical engines (Not black-box agents)</text>
        <text x="0" y="100" fill="#2dd4bf" font-family="'Geist Mono', monospace" font-size="10">&bull; 100% Closed-Loop Verification of physical and virtual states</text>
      </g>

      <!-- Col 4: Stamp -->
      <g transform="translate(2180, 25)">
        <rect x="0" y="0" width="200" height="100" rx="4" fill="rgba(11, 17, 26, 0.9)" stroke="#38bdf8" stroke-width="1.2" />
        <text x="100" y="24" text-anchor="middle" fill="#38bdf8" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">OMNIS-X MASTER</text>
        <text x="100" y="44" text-anchor="middle" fill="#ffffff" font-family="'Geist', sans-serif" font-size="12" font-weight="700">OFFICIALLY SIGNED</text>
        <text x="100" y="62" text-anchor="middle" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="9">SECURITY CERTIFIED</text>
        <line x1="20" y1="72" x2="180" y2="72" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
        <text x="100" y="88" text-anchor="middle" fill="#34d399" font-family="'Geist Mono', monospace" font-size="9">STATUS: VERIFIED READY</text>
      </g>
    </g>
    ''')

    full_svg = f'''<svg viewBox="0 0 {W} {H}" width="{W}" height="{H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="omnis-x-arch-title omnis-x-arch-desc">
  <title id="omnis-x-arch-title">OMNIS-X — Institutional Digital Twin Master Architecture</title>
  <desc id="omnis-x-arch-desc">Layered isometric perspective visualization of the OMNIS-X digital twin resilience system, featuring 6 architectural planes, cross-cutting security pillar, and 7 intelligence engines.</desc>
  {''.join(svg_parts)}
</svg>'''

    return full_svg


def generate_html(svg_content):
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OMNIS-X — Institutional Digital Twin Architecture</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    :root {{
      --bg: #0B111A;
      --card-bg: #111a26;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --border: rgba(255, 255, 255, 0.14);
      --font-sans: 'Geist', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --font-mono: 'Geist Mono', ui-monospace, monospace;
    }}
    body {{
      background-color: var(--bg);
      color: var(--text-main);
      font-family: var(--font-sans);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1rem;
      overflow-x: auto;
    }}
    .container {{
      max-width: 2680px;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }}
    .diagram-frame {{
      width: 100%;
      background: #0B111A;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.85);
      margin-bottom: 2rem;
      overflow-x: auto;
    }}
    svg {{
      width: 100%;
      min-width: 2600px;
      height: auto;
      display: block;
    }}
    @media print {{
      body {{ padding: 0; background: #0B111A; }}
      .diagram-frame {{ border: none; box-shadow: none; padding: 0; }}
      svg {{ min-width: 0; }}
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="diagram-frame">
      {svg_content}
    </div>
  </div>
</body>
</html>'''
    return html


def main():
    target_dir = Path(r"d:\parallax\OMNIS-X\OMNIS-X-Architecture")
    target_dir.mkdir(parents=True, exist_ok=True)

    print("Generating refined OMNIS-X Master Architecture SVG...")
    svg_code = generate_svg()

    svg_file = target_dir / "OMNIS-X_Architecture_Source.svg"
    svg_file.write_text(svg_code, encoding="utf-8")
    print(f"Saved SVG source: {svg_file} ({svg_file.stat().st_size:,} bytes)")

    print("Generating Master Architecture HTML presentation...")
    html_code = generate_html(svg_code)
    html_file = target_dir / "OMNIS-X_Master_Architecture.html"
    html_file.write_text(html_code, encoding="utf-8")
    print(f"Saved HTML presentation: {html_file} ({html_file.stat().st_size:,} bytes)")

    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    png_file = target_dir / "OMNIS-X_Architecture_Preview.png"

    if Path(chrome_path).exists():
        print(f"Rasterizing preview using Chrome headless: {chrome_path}...")
        cmd = [
            chrome_path,
            "--headless",
            "--disable-gpu",
            "--no-sandbox",
            "--hide-scrollbars",
            f"--screenshot={png_file}",
            "--window-size=2600,3800",
            html_file.as_uri()
        ]
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            if png_file.exists():
                print(f"Successfully generated high-resolution PNG preview: {png_file} ({png_file.stat().st_size:,} bytes)")
            else:
                print(f"Chrome exited with code {res.returncode}, but PNG not found. Stderr: {res.stderr}")
        except Exception as e:
            print(f"Chrome screenshot execution failed: {e}")
    else:
        print("Chrome not found at standard path.")

    print("\nGeneration process complete.")


if __name__ == "__main__":
    main()
