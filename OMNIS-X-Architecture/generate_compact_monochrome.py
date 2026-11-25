import os
import sys
import shutil
import subprocess
from pathlib import Path

# ==============================================================================
# OMNIS-X MASTER ARCHITECTURE — COMPACT MONOCHROME BLUEPRINT
# - Single glanceable structure (1920 x 1460 px)
# - Pure Black & White / Grayscale aesthetic (No colors, strictly blueprint)
# - Short, clean, punchy labels (zero text clutter, zero overlapping)
# - 6 Connected Architectural Planes + Vertical Security Spine
# ==============================================================================

def generate_compact_monochrome_svg():
    W = 1920
    H = 1460

    # Horizontal coordinate bounds
    # Security Spine: x = 60 .. 280 (w = 220)
    # Planes: x = 320 .. 1860 (w = 1540)
    # Trapezoid slant:
    # Top edge: x_tl = 400, x_tr = 1780 (w = 1380)
    # Bottom edge: x_bl = 320, x_br = 1860 (w = 1540)
    x_tl = 400
    x_tr = 1780
    x_bl = 320
    x_br = 1860

    svg_parts = []

    # 1. Background Grid & Styles
    svg_parts.append(f'''
    <defs>
      <!-- Blueprint drafting grid -->
      <pattern id="grid-fine" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.04)" stroke-width="0.7" />
      </pattern>
      <pattern id="grid-major" width="150" height="150" patternUnits="userSpaceOnUse">
        <rect width="150" height="150" fill="url(#grid-fine)" />
        <path d="M 150 0 L 0 0 0 150" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" />
        <circle cx="0" cy="0" r="1.5" fill="rgba(255,255,255,0.2)" />
      </pattern>
      <!-- Pure monochrome plane fill -->
      <linearGradient id="plane-mono-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0e131b" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#080c12" stop-opacity="0.95" />
      </linearGradient>
      <!-- Monochrome arrows -->
      <marker id="arr-white" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ffffff" />
      </marker>
      <marker id="arr-gray" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M 0 2 L 7 5 L 0 8 z" fill="#94a3b8" />
      </marker>
    </defs>

    <!-- Canvas Background: Pure Deep Charcoal / Black -->
    <rect width="{W}" height="{H}" fill="#0A0E14" />
    <rect width="{W}" height="{H}" fill="url(#grid-major)" />
    ''')

    # 2. Compact Monochrome Header
    svg_parts.append(f'''
    <!-- HEADER -->
    <g id="header" transform="translate(60, 25)">
      <rect x="0" y="0" width="1800" height="85" rx="6" fill="rgba(14, 19, 27, 0.85)" stroke="rgba(255, 255, 255, 0.25)" stroke-width="1.2" />
      
      <!-- Drafting Corner Marks -->
      <path d="M -6 0 L 6 0 M 0 -6 L 0 6" stroke="#ffffff" stroke-width="1.2" />
      <path d="M 1794 0 L 1806 0 M 1800 -6 L 1800 6" stroke="#ffffff" stroke-width="1.2" />
      <path d="M -6 85 L 6 85 M 0 79 L 0 91" stroke="#ffffff" stroke-width="1.2" />
      <path d="M 1794 85 L 1806 85 M 1800 79 L 1800 91" stroke="#ffffff" stroke-width="1.2" />

      <text x="25" y="32" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="11" font-weight="600" letter-spacing="0.18em">OMNIS-X // INSTITUTIONAL DIGITAL TWIN ARCHITECTURE</text>
      <text x="25" y="62" fill="#ffffff" font-family="'Geist', sans-serif" font-size="22" font-weight="600" letter-spacing="-0.02em">Resilience Decision &amp; Autonomous Operations System</text>

      <!-- Compact Legend on Right -->
      <g transform="translate(1080, 20)">
        <text x="0" y="14" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="9" letter-spacing="0.12em">FLOW ENCODING:</text>
        <line x1="110" y1="10" x2="155" y2="10" stroke="#ffffff" stroke-width="2" />
        <text x="165" y="14" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9">Real Telemetry</text>

        <line x1="285" y1="10" x2="330" y2="10" stroke="#ffffff" stroke-width="1.8" stroke-dasharray="2,2" />
        <text x="340" y="14" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9">Reported Data</text>

        <line x1="460" y1="10" x2="505" y2="10" stroke="#ffffff" stroke-width="1.8" stroke-dasharray="5,3" />
        <text x="515" y="14" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9">Synthetic / Est.</text>

        <text x="0" y="38" fill="#64748b" font-family="'Geist Mono', monospace" font-size="9">SYSTEM: 6 TIERS &bull; 7 SPECIALIST ENGINES &bull; ZERO-TRUST GOVERNANCE &bull; CLOSED-LOOP</text>
      </g>
    </g>
    ''')

    # 3. Vertical Corner Drop-Lines Linking All 6 Planes
    svg_parts.append(f'''
    <!-- VERTICAL CORNER TRACE LINES -->
    <g id="corner-traces">
      <line x1="{x_tl}" y1="130" x2="{x_tl}" y2="1300" stroke="rgba(255, 255, 255, 0.22)" stroke-width="1" stroke-dasharray="4,4" />
      <line x1="{x_tr}" y1="130" x2="{x_tr}" y2="1300" stroke="rgba(255, 255, 255, 0.22)" stroke-width="1" stroke-dasharray="4,4" />
      <line x1="{x_bl}" y1="270" x2="{x_bl}" y2="1300" stroke="rgba(255, 255, 255, 0.28)" stroke-width="1.2" stroke-dasharray="4,4" />
      <line x1="{x_br}" y1="270" x2="{x_br}" y2="1300" stroke="rgba(255, 255, 255, 0.28)" stroke-width="1.2" stroke-dasharray="4,4" />
    </g>
    ''')

    # Helper function to render a plane base slab
    def render_compact_plane(y0, y1, code, name, badge):
        thick = 10
        path_top = f"M {x_tl+12} {y0} L {x_tr-12} {y0} Q {x_tr} {y0} {x_tr+2} {y0+4} L {x_br} {y1-4} Q {x_br} {y1} {x_br-12} {y1} L {x_bl+12} {y1} Q {x_bl} {y1} {x_bl-2} {y1-4} L {x_tl} {y0+4} Q {x_tl} {y0} {x_tl+12} {y0} Z"
        path_front = f"M {x_bl} {y1} L {x_br} {y1} L {x_br} {y1+thick} L {x_bl} {y1+thick} Z"
        path_right = f"M {x_tr} {y0} L {x_br} {y1} L {x_br} {y1+thick} L {x_tr} {y0+thick} Z"

        return f'''
        <!-- PLANE BASE: {code} -->
        <path d="{path_right}" fill="#05070a" stroke="rgba(255, 255, 255, 0.12)" stroke-width="0.8" />
        <path d="{path_front}" fill="#080c10" stroke="rgba(255, 255, 255, 0.22)" stroke-width="0.8" />
        <path d="{path_top}" fill="url(#plane-mono-grad)" stroke="rgba(255, 255, 255, 0.35)" stroke-width="1" />
        
        <!-- Corner L-Brackets -->
        <path d="M {x_tl+14} {y0+16} L {x_tl+14} {y0+6} L {x_tl+24} {y0+6}" fill="none" stroke="#ffffff" stroke-width="1.2" />
        <path d="M {x_tr-14} {y0+16} L {x_tr-14} {y0+6} L {x_tr-24} {y0+6}" fill="none" stroke="#ffffff" stroke-width="1.2" />
        <path d="M {x_bl+14} {y1-16} L {x_bl+14} {y1-6} L {x_bl+24} {y1-6}" fill="none" stroke="#ffffff" stroke-width="1.2" />
        <path d="M {x_br-14} {y1-16} L {x_br-14} {y1-6} L {x_br-24} {y1-6}" fill="none" stroke="#ffffff" stroke-width="1.2" />

        <!-- Plane Tag -->
        <g transform="translate({x_tl + 20}, {y0 + 16})">
          <rect x="0" y="0" width="310" height="24" rx="3" fill="rgba(10, 14, 20, 0.95)" stroke="#ffffff" stroke-width="1" />
          <text x="10" y="16" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">{code} &bull; {name}</text>
          <text x="325" y="16" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="9" letter-spacing="0.1em">{badge}</text>
        </g>
        '''

    # ==========================================================================
    # PLANE 6 — APPLICATION AND CONTROL (y = 130 .. 275)
    # 4 distinct, clean console interfaces
    # ==========================================================================
    svg_parts.append(render_compact_plane(130, 275, "PLANE 06", "APPLICATION AND CONTROL", "[OPERATIONAL SURFACES]"))
    svg_parts.append(f'''
    <!-- PLANE 6 CONTENT -->
    <g id="p6-content" transform="translate(430, 180)">
      <!-- 1. Command Center -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="310" height="75" rx="5" fill="rgba(14, 19, 27, 0.9)" stroke="#ffffff" stroke-width="1" />
        <text x="14" y="22" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">COMMAND CENTER</text>
        <text x="14" y="42" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">Campus Health &bull; Incident Triage Wall</text>
        <text x="14" y="60" fill="#64748b" font-family="'Geist Mono', monospace" font-size="9">Active Nodes: 1,420 &bull; 0 Critical</text>
      </g>

      <!-- 2. Digital Twin Explorer -->
      <g transform="translate(330, 0)">
        <rect x="0" y="0" width="310" height="75" rx="5" fill="rgba(14, 19, 27, 0.9)" stroke="#ffffff" stroke-width="1" />
        <text x="14" y="22" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">DIGITAL TWIN EXPLORER</text>
        <text x="14" y="42" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">3D BIM Navigator &bull; Room Drill-Down</text>
        <text x="14" y="60" fill="#64748b" font-family="'Geist Mono', monospace" font-size="9">Topology Inspector &bull; Sensor Overlays</text>
      </g>

      <!-- 3. Incident & Intelligence Center -->
      <g transform="translate(660, 0)">
        <rect x="0" y="0" width="320" height="75" rx="5" fill="rgba(14, 19, 27, 0.9)" stroke="#ffffff" stroke-width="1" />
        <text x="14" y="22" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">INTELLIGENCE &amp; INCIDENT CENTER</text>
        <text x="14" y="42" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">Automated Playbook Runner &bull; SLA Dispatch</text>
        <text x="14" y="60" fill="#64748b" font-family="'Geist Mono', monospace" font-size="9">Root-Cause Analysis &bull; Work Orders</text>
      </g>

      <!-- 4. Student/Staff Portal -->
      <g transform="translate(1000, 0)">
        <rect x="0" y="0" width="310" height="75" rx="5" fill="rgba(14, 19, 27, 0.9)" stroke="#ffffff" stroke-width="1" />
        <text x="14" y="22" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">STUDENT / STAFF PORTAL</text>
        <text x="14" y="42" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">Mobile PWA &bull; Incident Reporting &bull; Kiosk</text>
        <text x="14" y="60" fill="#64748b" font-family="'Geist Mono', monospace" font-size="9">Campus Safety Alerts &bull; Status Tracking</text>
      </g>
    </g>
    ''')

    # ==========================================================================
    # PLANE 5 — INCIDENT AND SIMULATION (y = 315 .. 475)
    # Failure injection, Shadow simulation, Alternative plans, Human Approval
    # ==========================================================================
    svg_parts.append(render_compact_plane(315, 475, "PLANE 05", "INCIDENT AND SIMULATION", "[COUNTERFACTUAL SANDBOX & VERIFICATION]"))
    svg_parts.append(f'''
    <!-- PLANE 5 CONTENT -->
    <g id="p5-content" transform="translate(420, 365)">
      <!-- Zone A: Isolated Shadow Sandbox (Dashed) -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="670" height="90" rx="5" fill="rgba(14, 19, 27, 0.85)" stroke="#ffffff" stroke-width="1.2" stroke-dasharray="4,4" />
        <text x="14" y="20" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9.5" font-weight="700">[ISOLATED SHADOW SANDBOX &bull; ZERO PRODUCTION IMPACT]</text>

        <!-- Sub-block 1: Failure Injection -->
        <g transform="translate(15, 30)">
          <rect x="0" y="0" width="195" height="48" rx="3" fill="#0A0E14" stroke="rgba(255,255,255,0.3)" stroke-width="0.8" />
          <text x="10" y="18" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9" font-weight="600">FAILURE INJECTION</text>
          <text x="10" y="34" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="9">Power, Switch &amp; Chiller Faults</text>
        </g>

        <!-- Sub-block 2: Cascade Propagation -->
        <g transform="translate(225, 30)">
          <rect x="0" y="0" width="205" height="48" rx="3" fill="#0A0E14" stroke="rgba(255,255,255,0.3)" stroke-width="0.8" />
          <text x="10" y="18" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9" font-weight="600">CASCADE SIMULATION</text>
          <text x="10" y="34" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="9">Secondary Overload &amp; Blast Radius</text>
        </g>

        <!-- Sub-block 3: Impact Assessment -->
        <g transform="translate(445, 30)">
          <rect x="0" y="0" width="210" height="48" rx="3" fill="#0A0E14" stroke="rgba(255,255,255,0.3)" stroke-width="0.8" />
          <text x="10" y="18" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9" font-weight="600">IMPACT ASSESSMENT</text>
          <text x="10" y="34" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="9">Downtime &bull; 8 Lectures Displaced</text>
        </g>
      </g>

      <!-- Arrow from Sandbox to Optimization -->
      <path d="M 670 45 L 700 45" stroke="#ffffff" stroke-width="1.5" marker-end="url(#arr-white)" />

      <!-- Zone B: Optimization, Pareto Comparison & Human Approval -->
      <g transform="translate(705, 0)">
        <rect x="0" y="0" width="640" height="90" rx="5" fill="rgba(14, 19, 27, 0.95)" stroke="#ffffff" stroke-width="1.2" />
        
        <!-- Multi-Plan Generator -->
        <g transform="translate(15, 20)">
          <rect x="0" y="0" width="190" height="58" rx="3" fill="#0A0E14" stroke="rgba(255,255,255,0.3)" stroke-width="0.8" />
          <text x="10" y="18" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9" font-weight="600">ALTERNATIVE PLANS</text>
          <text x="10" y="34" fill="#ffffff" font-family="'Geist', sans-serif" font-size="9">&bull; Plan Alpha (Reroute, 12 min)</text>
          <text x="10" y="48" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="8.5">&bull; Plan Beta (Virtual) | Gamma</text>
        </g>

        <!-- Pareto Comparison -->
        <g transform="translate(220, 20)">
          <rect x="0" y="0" width="180" height="58" rx="3" fill="#0A0E14" stroke="rgba(255,255,255,0.3)" stroke-width="0.8" />
          <text x="10" y="18" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9" font-weight="600">COST / TIME / RISK</text>
          <text x="10" y="34" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="9">Pareto Optimization Front</text>
          <text x="10" y="48" fill="#64748b" font-family="'Geist Mono', monospace" font-size="8.5">Score: 92/100 (Plan Alpha)</text>
        </g>

        <!-- Human Approval Gate -->
        <g transform="translate(415, 12)">
          <rect x="0" y="0" width="210" height="66" rx="4" fill="#0A0E14" stroke="#ffffff" stroke-width="1.5" />
          <circle cx="15" cy="18" r="4" fill="#ffffff" />
          <text x="26" y="22" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9.5" font-weight="700">HUMAN APPROVAL GATE</text>
          <text x="10" y="40" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="9">Requires Operations Director Sign-off</text>
          <rect x="10" y="48" width="190" height="14" rx="2" fill="rgba(255,255,255,0.15)" />
          <text x="105" y="59" text-anchor="middle" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8" font-weight="600">[AUTHORIZED] &bull; DISPATCHED</text>
        </g>
      </g>
    </g>
    ''')

    # ==========================================================================
    # PLANE 4 — INTELLIGENCE ENGINES (y = 515 .. 675)
    # All 7 Specialist Engines side-by-side in a clean, legible pipeline
    # ==========================================================================
    svg_parts.append(render_compact_plane(515, 675, "PLANE 04", "INTELLIGENCE ENGINES", "[SEVEN SPECIALIST CAUSAL & ANALYTICAL ENGINES]"))

    engines = [
        ("01", "ANOMALY DETECTION", "Isolation Forest & Z-Score"),
        ("02", "GRAPH PROPAGATION", "BFS Directed Blast Radius"),
        ("03", "RISK ANALYSIS", "FMEA Severity Matrix"),
        ("04", "ACADEMIC IMPACT", "Class & Exam Disruption"),
        ("05", "RECOVERY SOLVER", "MILP Constraint Optimizer"),
        ("06", "TASK ASSIGNMENT", "Role-Based SLA Dispatch"),
        ("07", "DECISION ENGINE", "Consensus & Playbook Rank")
    ]

    svg_parts.append(f'''
    <!-- PLANE 4 CONTENT: 7 SPECIALIST ENGINES -->
    <g id="p4-content" transform="translate(410, 565)">
      <!-- Central Communication Conduit -->
      <line x1="30" y1="42" x2="1320" y2="42" stroke="rgba(255, 255, 255, 0.2)" stroke-width="1.5" stroke-dasharray="3,3" />
    ''')

    for i, (num, title, algo) in enumerate(engines):
        dx = i * 192
        svg_parts.append(f'''
        <g transform="translate({dx}, 0)">
          <rect x="0" y="0" width="180" height="84" rx="4" fill="rgba(14, 19, 27, 0.95)" stroke="#ffffff" stroke-width="1.2" />
          <rect x="0" y="0" width="180" height="20" rx="4" fill="rgba(255, 255, 255, 0.12)" />
          <text x="8" y="14" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9" font-weight="700">[{num}] {title}</text>
          
          <text x="8" y="38" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="8">ALGORITHM:</text>
          <text x="8" y="52" fill="#ffffff" font-family="'Geist', sans-serif" font-size="9" font-weight="600">{algo}</text>
          
          <circle cx="12" cy="70" r="3" fill="#ffffff" />
          <text x="20" y="73" fill="#64748b" font-family="'Geist Mono', monospace" font-size="8">Deterministic &bull; OK</text>
        </g>
        ''')
        if i < 6:
            svg_parts.append(f'''
            <path d="M {dx + 180} 42 L {dx + 192} 42" stroke="#ffffff" stroke-width="1.2" marker-end="url(#arr-white)" />
            ''')

    svg_parts.append('</g>')

    # ==========================================================================
    # PLANE 3 — DIGITAL TWIN CORE (y = 715 .. 885)
    # Entity Registry, Directed Dependency Graph (clean & prominent), Spatial BIM
    # ==========================================================================
    svg_parts.append(render_compact_plane(715, 885, "PLANE 03", "DIGITAL TWIN CORE", "[TOPOLOGICAL GRAPH, SPATIAL BIM & REAL-TIME STATE]"))
    svg_parts.append(f'''
    <!-- PLANE 3 CONTENT -->
    <g id="p3-content" transform="translate(410, 765)">
      <!-- Left: Entity Registry -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="280" height="100" rx="5" fill="rgba(14, 19, 27, 0.9)" stroke="#ffffff" stroke-width="1" />
        <text x="14" y="20" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">ENTITY REGISTRY</text>
        <text x="14" y="40" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="9.5">&bull; Canonical UUID Catalog (8,420 Assets)</text>
        <text x="14" y="58" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="9.5">&bull; Physical (BIM) &bull; Logical (IP/Breaker)</text>
        <text x="14" y="76" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="9.5">&bull; Institutional (Course / Student Cohort)</text>
      </g>

      <!-- Center: DIRECTED DEPENDENCY GRAPH (PROMINENT & CLEAN) -->
      <g transform="translate(300, 0)">
        <rect x="0" y="0" width="720" height="100" rx="5" fill="rgba(10, 14, 20, 0.95)" stroke="#ffffff" stroke-width="1.4" />
        <text x="14" y="18" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9.5" font-weight="700">DIRECTED DEPENDENCY &amp; CAUSAL TOPOLOGY GRAPH</text>

        <!-- Clean Interactive-Style Nodes and Paths -->
        <g transform="translate(25, 30)">
          <!-- Substation -->
          <circle cx="40" cy="30" r="16" fill="rgba(255,255,255,0.1)" stroke="#ffffff" stroke-width="1.2" />
          <text x="40" y="33" text-anchor="middle" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="7.5" font-weight="600">Substation</text>

          <!-- UPS -->
          <rect x="120" y="15" width="55" height="30" rx="3" fill="rgba(255,255,255,0.15)" stroke="#ffffff" stroke-width="1.2" />
          <text x="147" y="33" text-anchor="middle" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8" font-weight="600">UPS-MAIN</text>

          <!-- Data Centre -->
          <circle cx="250" cy="15" r="14" fill="rgba(255,255,255,0.1)" stroke="#ffffff" stroke-width="1.2" />
          <text x="250" y="18" text-anchor="middle" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="7">DataCentre</text>

          <!-- MDF Core Switch -->
          <rect x="225" y="42" width="50" height="22" rx="3" fill="rgba(255,255,255,0.1)" stroke="#ffffff" stroke-width="1" />
          <text x="250" y="56" text-anchor="middle" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="7">MDF-CORE</text>

          <!-- Lab L-2 -->
          <circle cx="370" cy="15" r="15" fill="rgba(255,255,255,0.2)" stroke="#ffffff" stroke-width="1.4" />
          <text x="370" y="18" text-anchor="middle" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8" font-weight="700">Lab L-2</text>

          <!-- Class CR-104 -->
          <circle cx="370" cy="50" r="13" fill="rgba(255,255,255,0.1)" stroke="#ffffff" stroke-width="1" />
          <text x="370" y="53" text-anchor="middle" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="7.5">CR-104</text>

          <!-- CS-401 Exam -->
          <rect x="470" y="5" width="80" height="24" rx="3" fill="rgba(255,255,255,0.25)" stroke="#ffffff" stroke-width="1.2" />
          <text x="510" y="20" text-anchor="middle" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="7.5" font-weight="700">CS-401 EXAM</text>

          <!-- EE-202 Lab -->
          <rect x="470" y="38" width="80" height="24" rx="3" fill="rgba(255,255,255,0.1)" stroke="#ffffff" stroke-width="1" />
          <text x="510" y="53" text-anchor="middle" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="7.5">EE-202 LAB</text>

          <!-- Directed Causal Edges -->
          <path d="M 56 30 L 120 30" stroke="#ffffff" stroke-width="1.5" marker-end="url(#arr-white)" />
          <path d="M 175 25 L 236 18" stroke="#ffffff" stroke-width="1.2" marker-end="url(#arr-white)" />
          <path d="M 175 35 L 225 50" stroke="#ffffff" stroke-width="1.2" marker-end="url(#arr-white)" />
          <path d="M 264 15 L 355 15" stroke="#ffffff" stroke-width="1.5" marker-end="url(#arr-white)" />
          <path d="M 275 52 L 357 52" stroke="#ffffff" stroke-width="1.2" marker-end="url(#arr-white)" />
          <path d="M 385 15 L 470 15" stroke="#ffffff" stroke-width="1.5" marker-end="url(#arr-white)" />
          <path d="M 383 50 L 470 50" stroke="#ffffff" stroke-width="1.2" marker-end="url(#arr-white)" />

          <!-- Topology stats -->
          <text x="580" y="24" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="8">DAG Traversal: 4.2ms</text>
          <text x="580" y="42" fill="#94a3b8" font-family="'Geist Mono', monospace" font-size="8">Cycle-Free Verification</text>
        </g>
      </g>

      <!-- Right: Spatial Model & State Engine -->
      <g transform="translate(1040, 0)">
        <rect x="0" y="0" width="310" height="100" rx="5" fill="rgba(14, 19, 27, 0.9)" stroke="#ffffff" stroke-width="1" />
        <text x="14" y="20" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">SPATIAL BIM &amp; STATE ENGINE</text>
        <text x="14" y="40" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="9.5">&bull; 3D BIM / GIS Spatial Query Index</text>
        <text x="14" y="58" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="9.5">&bull; Real-Time Memory Cache (14k ops/s)</text>
        <text x="14" y="76" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="9.5">&bull; Point-in-time Snapshotting &amp; Replay</text>
      </g>
    </g>
    ''')

    # ==========================================================================
    # PLANE 2 — DATA ACQUISITION (y = 915 .. 1065)
    # Sensor Gateways, Institutional Adapters, Synthetic Generator, Normalization
    # Zero text overlapping!
    # ==========================================================================
    svg_parts.append(render_compact_plane(915, 1065, "PLANE 02", "DATA ACQUISITION", "[MULTI-PROTOCOL INGRESS & NORMALIZATION]"))
    svg_parts.append(f'''
    <!-- PLANE 2 CONTENT -->
    <g id="p2-content" transform="translate(410, 960)">
      <!-- 1. Sensor Gateways (Real Telemetry - Solid Line) -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="310" height="85" rx="5" fill="rgba(14, 19, 27, 0.9)" stroke="#ffffff" stroke-width="1.2" />
        <text x="14" y="20" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9.5" font-weight="700">SENSOR GATEWAYS [REAL]</text>
        <text x="14" y="38" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="9.5">&bull; IoT Edge Nodes &bull; Wi-Fi 6 &bull; MQTT &bull; LoRa</text>
        <text x="14" y="54" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="9.5">&bull; Substation Modbus Meters &bull; BACnet HVAC</text>
        <text x="14" y="72" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8.5">Stream: Solid White Vector (12k msg/s)</text>
      </g>

      <!-- 2. Institutional Adapters (Reported Data - Dotted Line) -->
      <g transform="translate(330, 0)">
        <rect x="0" y="0" width="310" height="85" rx="5" fill="rgba(14, 19, 27, 0.9)" stroke="#ffffff" stroke-width="1" stroke-dasharray="3,3" />
        <text x="14" y="20" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9.5" font-weight="700">INSTITUTIONAL ADAPTERS [REPORTED]</text>
        <text x="14" y="38" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="9.5">&bull; ERP &bull; Timetable &bull; SIS Student Schedule</text>
        <text x="14" y="54" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="9.5">&bull; Mobile PWA Trouble Tickets &bull; Kiosk Input</text>
        <text x="14" y="72" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8.5">Stream: Dotted Line (Asynchronous)</text>
      </g>

      <!-- 3. Synthetic Generator (Synthetic Data - Dashed Line) -->
      <g transform="translate(660, 0)">
        <rect x="0" y="0" width="310" height="85" rx="5" fill="rgba(14, 19, 27, 0.9)" stroke="#ffffff" stroke-width="1" stroke-dasharray="6,3" />
        <text x="14" y="20" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9.5" font-weight="700">SYNTHETIC GENERATOR [SYNTHETIC]</text>
        <text x="14" y="38" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="9.5">&bull; Fault Injector &bull; Virtual Node Load Sim</text>
        <text x="14" y="54" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="9.5">&bull; Counterfactual Sensor Drift &amp; Noise</text>
        <text x="14" y="72" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8.5">Stream: Dashed Line (Tainted Sandbox)</text>
      </g>

      <!-- 4. Normalization & Validation Pipeline -->
      <g transform="translate(990, 0)">
        <rect x="0" y="0" width="360" height="85" rx="5" fill="rgba(14, 19, 27, 0.95)" stroke="#ffffff" stroke-width="1.2" />
        <text x="14" y="20" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9.5" font-weight="700">VALIDATION &amp; NORMALIZATION [PIPE-01]</text>
        <text x="14" y="38" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="9.5">&bull; Schema Validation (99.98% Clean Pass)</text>
        <text x="14" y="54" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="9.5">&bull; SI Units Conversion &bull; UTC Timestamp Sync</text>
        <text x="14" y="72" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="9.5">&bull; Estimated Data Engine (Kalman Filter)</text>
      </g>
    </g>
    ''')

    # ==========================================================================
    # PLANE 1 — PHYSICAL COLLEGE (y = 1095 .. 1285)
    # Miniature campus blueprint: 8 Classrooms, 3 Labs, Admin/Faculty, Utility Core
    # ==========================================================================
    svg_parts.append(render_compact_plane(1095, 1285, "PLANE 01", "PHYSICAL COLLEGE", "[MINIATURE CAMPUS BLUEPRINT & UTILITY INFRASTRUCTURE]"))
    svg_parts.append(f'''
    <!-- PLANE 1 CONTENT: CAMPUS BLUEPRINT -->
    <g id="p1-content" transform="translate(410, 1145)">
      <!-- Zone 1: Academic Classrooms (CR-101 .. CR-108 & Lecture Halls) -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="360" height="110" rx="4" fill="rgba(14, 19, 27, 0.9)" stroke="#ffffff" stroke-width="1" />
        <text x="12" y="18" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9" font-weight="700">ACADEMIC WING (8 CLASSROOMS &amp; 2 HALLS)</text>
        
        <!-- Classroom mini-grid -->
        <g transform="translate(10, 26)">
          <rect x="0" y="0" width="78" height="22" rx="2" fill="#0A0E14" stroke="rgba(255,255,255,0.3)" />
          <text x="6" y="15" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8">CR-101..103</text>

          <rect x="85" y="0" width="78" height="22" rx="2" fill="rgba(255,255,255,0.2)" stroke="#ffffff" stroke-width="1.2" />
          <text x="91" y="15" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8" font-weight="700">CR-104 [FOCAL]</text>

          <rect x="170" y="0" width="78" height="22" rx="2" fill="#0A0E14" stroke="rgba(255,255,255,0.3)" />
          <text x="176" y="15" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8">CR-105..106</text>

          <rect x="255" y="0" width="80" height="22" rx="2" fill="#0A0E14" stroke="rgba(255,255,255,0.3)" />
          <text x="261" y="15" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8">CR-107..108</text>

          <!-- Lecture Halls -->
          <rect x="0" y="28" width="165" height="22" rx="2" fill="#0A0E14" stroke="rgba(255,255,255,0.3)" />
          <text x="8" y="43" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8">Lecture Hall Alpha (180 cap)</text>

          <rect x="170" y="28" width="165" height="22" rx="2" fill="#0A0E14" stroke="rgba(255,255,255,0.3)" />
          <text x="178" y="43" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8">Lecture Hall Beta (180 cap)</text>
        </g>
        <text x="12" y="98" fill="#64748b" font-family="'Geist Mono', monospace" font-size="8">Smart Projectors &bull; Occupancy Nodes &bull; Wi-Fi 6</text>
      </g>

      <!-- Zone 2: 3 Advanced Laboratories -->
      <g transform="translate(380, 0)">
        <rect x="0" y="0" width="370" height="110" rx="4" fill="rgba(14, 19, 27, 0.9)" stroke="#ffffff" stroke-width="1.2" />
        <text x="12" y="18" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9" font-weight="700">RESEARCH LABORATORIES (3 LABS)</text>

        <g transform="translate(10, 26)">
          <rect x="0" y="0" width="350" height="22" rx="2" fill="#0A0E14" stroke="rgba(255,255,255,0.3)" />
          <text x="8" y="15" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8.5">Lab 01: High-Performance Computing (60 Nodes)</text>

          <rect x="0" y="26" width="350" height="24" rx="2" fill="rgba(255,255,255,0.18)" stroke="#ffffff" stroke-width="1.2" />
          <text x="8" y="42" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8.5" font-weight="700">Lab 02: AI, Autonomous Systems &amp; Robotics [CRITICAL]</text>

          <rect x="0" y="54" width="350" height="22" rx="2" fill="#0A0E14" stroke="rgba(255,255,255,0.3)" />
          <text x="8" y="69" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8.5">Lab 03: Power Systems &amp; High-Voltage Smart Grid</text>
        </g>
        <text x="12" y="98" fill="#64748b" font-family="'Geist Mono', monospace" font-size="8">Chilled Water Loops &bull; Modbus Power &bull; Safety EPO</text>
      </g>

      <!-- Zone 3: Administration & Faculty -->
      <g transform="translate(770, 0)">
        <rect x="0" y="0" width="280" height="110" rx="4" fill="rgba(14, 19, 27, 0.9)" stroke="#ffffff" stroke-width="1" />
        <text x="12" y="18" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9" font-weight="700">ADMINISTRATION &amp; FACULTY</text>
        <g transform="translate(10, 26)">
          <rect x="0" y="0" width="260" height="22" rx="2" fill="#0A0E14" stroke="rgba(255,255,255,0.2)" />
          <text x="8" y="15" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8">Dean &amp; Registrar Executive Suite</text>

          <rect x="0" y="26" width="260" height="22" rx="2" fill="#0A0E14" stroke="rgba(255,255,255,0.2)" />
          <text x="8" y="41" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8">Facilities Ops &amp; Security NOC</text>

          <rect x="0" y="52" width="260" height="22" rx="2" fill="#0A0E14" stroke="rgba(255,255,255,0.2)" />
          <text x="8" y="67" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8">Faculty Hubs (North &amp; South Wings)</text>
        </g>
        <text x="12" y="98" fill="#64748b" font-family="'Geist Mono', monospace" font-size="8">BMS Control &bull; IDF-03 Switch Cabinet</text>
      </g>

      <!-- Zone 4: Power Supply, Data Centre & Network Core -->
      <g transform="translate(1070, 0)">
        <rect x="0" y="0" width="280" height="110" rx="4" fill="rgba(14, 19, 27, 0.95)" stroke="#ffffff" stroke-width="1.2" />
        <text x="12" y="18" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9" font-weight="700">UTILITY CORE &amp; INFRASTRUCTURE</text>
        <g transform="translate(10, 26)">
          <rect x="0" y="0" width="260" height="22" rx="2" fill="#0A0E14" stroke="rgba(255,255,255,0.3)" />
          <text x="8" y="15" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8">11kV Substation &bull; 500kVA Diesel &bull; UPS</text>

          <rect x="0" y="26" width="260" height="22" rx="2" fill="#0A0E14" stroke="rgba(255,255,255,0.3)" />
          <text x="8" y="41" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8">Data Centre (Racks R01-R06 &bull; In-Row)</text>

          <rect x="0" y="52" width="260" height="22" rx="2" fill="#0A0E14" stroke="rgba(255,255,255,0.3)" />
          <text x="8" y="67" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8">Network Backbone (MDF &bull; Wi-Fi 6 &bull; 5G)</text>
        </g>
        <text x="12" y="98" fill="#64748b" font-family="'Geist Mono', monospace" font-size="8">Dual A/B Feed &bull; 10GbE Fiber Ring</text>
      </g>
    </g>
    ''')

    # ==========================================================================
    # CROSS-CUTTING SECURITY & GOVERNANCE PILLAR (Vertical Column on Left)
    # x = 60 .. 280 (w = 220), y = 130 .. 1285 (h = 1155)
    # Pure Monochrome
    # ==========================================================================
    svg_parts.append(f'''
    <!-- VERTICAL SECURITY & GOVERNANCE SPINE -->
    <g id="security-spine" transform="translate(60, 130)">
      <rect x="0" y="0" width="220" height="1155" rx="6" fill="rgba(14, 19, 27, 0.95)" stroke="#ffffff" stroke-width="1.4" />
      <rect x="0" y="0" width="220" height="34" rx="6" fill="rgba(255, 255, 255, 0.15)" />
      <circle cx="16" cy="17" r="4" fill="#ffffff" />
      <text x="28" y="21" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">SECURITY &amp; GOVERNANCE</text>

      <!-- Level 6 Controls -->
      <g transform="translate(12, 46)">
        <text x="0" y="12" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8.5" font-weight="600">[L06] INTERFACE RBAC</text>
        <text x="0" y="28" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="8.5">&bull; OAuth 2.0 / SAML SSO</text>
        <text x="0" y="42" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="8.5">&bull; Zero-Trust Session Guard</text>
        <text x="0" y="56" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="8.5">&bull; Role-Based Access Scopes</text>
      </g>
      <line x1="12" y1="120" x2="208" y2="120" stroke="rgba(255,255,255,0.15)" stroke-width="0.8" />

      <!-- Level 5 Controls -->
      <g transform="translate(12, 135)">
        <text x="0" y="12" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8.5" font-weight="600">[L05] HUMAN GOVERNANCE</text>
        <text x="0" y="28" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="8.5">&bull; Physical Actuation Gate</text>
        <text x="0" y="42" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="8.5">&bull; Multi-Signature Sign-off</text>
        <text x="0" y="56" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="8.5">&bull; Strict Sandbox Isolation</text>
      </g>
      <line x1="12" y1="210" x2="208" y2="210" stroke="rgba(255,255,255,0.15)" stroke-width="0.8" />

      <!-- Level 4 Controls -->
      <g transform="translate(12, 225)">
        <text x="0" y="12" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8.5" font-weight="600">[L04] ENGINE GUARDRAILS</text>
        <text x="0" y="28" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="8.5">&bull; Algorithmic Safety Invariants</text>
        <text x="0" y="42" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="8.5">&bull; Explainability Proofs</text>
        <text x="0" y="56" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="8.5">&bull; Decision Provenance Log</text>
      </g>
      <line x1="12" y1="300" x2="208" y2="300" stroke="rgba(255,255,255,0.15)" stroke-width="0.8" />

      <!-- Level 3 Controls -->
      <g transform="translate(12, 315)">
        <text x="0" y="12" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8.5" font-weight="600">[L03] GRAPH INTEGRITY</text>
        <text x="0" y="28" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="8.5">&bull; Schema Tamper Detection</text>
        <text x="0" y="42" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="8.5">&bull; Append-Only State Ledger</text>
        <text x="0" y="56" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="8.5">&bull; Merkle Tree State Hashes</text>
      </g>
      <line x1="12" y1="390" x2="208" y2="390" stroke="rgba(255,255,255,0.15)" stroke-width="0.8" />

      <!-- Level 2 Controls -->
      <g transform="translate(12, 405)">
        <text x="0" y="12" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8.5" font-weight="600">[L02] INGRESS PROVENANCE</text>
        <text x="0" y="28" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="8.5">&bull; Hardware TPM Attestation</text>
        <text x="0" y="42" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="8.5">&bull; Cryptographic Stream Taint</text>
        <text x="0" y="56" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="8.5">&bull; Anti-Spoof Protocol Filters</text>
      </g>
      <line x1="12" y1="480" x2="208" y2="480" stroke="rgba(255,255,255,0.15)" stroke-width="0.8" />

      <!-- Level 1 Controls -->
      <g transform="translate(12, 495)">
        <text x="0" y="12" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8.5" font-weight="600">[L01] PHYSICAL SECURITY</text>
        <text x="0" y="28" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="8.5">&bull; Biometric Access Readers</text>
        <text x="0" y="42" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="8.5">&bull; Substation Perimeter Locks</text>
        <text x="0" y="56" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="8.5">&bull; Hardwired Fail-Safe EPO</text>
      </g>
    </g>

    <!-- Lateral conduits connecting spine to planes -->
    <path d="M 280 200 L 400 200" stroke="#ffffff" stroke-width="1.2" stroke-dasharray="3,3" marker-end="url(#arr-white)" />
    <path d="M 280 390 L 400 390" stroke="#ffffff" stroke-width="1.2" stroke-dasharray="3,3" marker-end="url(#arr-white)" />
    <path d="M 280 590 L 400 590" stroke="#ffffff" stroke-width="1.2" stroke-dasharray="3,3" marker-end="url(#arr-white)" />
    <path d="M 280 790 L 400 790" stroke="#ffffff" stroke-width="1.2" stroke-dasharray="3,3" marker-end="url(#arr-white)" />
    <path d="M 280 990 L 400 990" stroke="#ffffff" stroke-width="1.2" stroke-dasharray="3,3" marker-end="url(#arr-white)" />
    <path d="M 280 1190 L 400 1190" stroke="#ffffff" stroke-width="1.2" stroke-dasharray="3,3" marker-end="url(#arr-white)" />
    ''')

    # ==========================================================================
    # INTER-PLANE CONDUITS (Vertical Data Flows Between Tiers)
    # ==========================================================================
    svg_parts.append(f'''
    <!-- VERTICAL INTER-PLANE CONDUITS -->
    <g id="inter-plane-flows">
      <!-- P1 -> P2 (Sensor Telemetry Uplink) -->
      <path d="M 600 1145 L 600 1065" stroke="#ffffff" stroke-width="2" marker-end="url(#arr-white)" />
      <rect x="555" y="1092" width="90" height="18" rx="2" fill="#0A0E14" stroke="#ffffff" stroke-width="0.8" />
      <text x="600" y="1104" text-anchor="middle" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8">TELEMETRY</text>

      <!-- P2 -> P3 (Normalized Event Bus) -->
      <path d="M 850 960 L 850 885" stroke="#ffffff" stroke-width="2" marker-end="url(#arr-white)" />
      <rect x="790" y="912" width="120" height="18" rx="2" fill="#0A0E14" stroke="#ffffff" stroke-width="0.8" />
      <text x="850" y="924" text-anchor="middle" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8">NORMALIZED STREAM</text>

      <!-- P3 -> P4 (State Graph to Engines) -->
      <path d="M 1000 765 L 1000 675" stroke="#ffffff" stroke-width="2" marker-end="url(#arr-white)" />
      <rect x="940" y="710" width="120" height="18" rx="2" fill="#0A0E14" stroke="#ffffff" stroke-width="0.8" />
      <text x="1000" y="722" text-anchor="middle" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8">GRAPH STATE FEED</text>

      <!-- P4 -> P5 (Causal Recommendations to Simulation) -->
      <path d="M 1150 565 L 1150 475" stroke="#ffffff" stroke-width="2" marker-end="url(#arr-white)" />
      <rect x="1080" y="510" width="140" height="18" rx="2" fill="#0A0E14" stroke="#ffffff" stroke-width="0.8" />
      <text x="1150" y="522" text-anchor="middle" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8">RECOVERY PLAYBOOKS</text>

      <!-- P5 -> P6 (Approved Actions to Command) -->
      <path d="M 1250 365 L 1250 275" stroke="#ffffff" stroke-width="2" marker-end="url(#arr-white)" />
      <rect x="1185" y="310" width="130" height="18" rx="2" fill="#0A0E14" stroke="#ffffff" stroke-width="0.8" />
      <text x="1250" y="322" text-anchor="middle" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8">APPROVED COMMANDS</text>

      <!-- Closed-Loop Feedback Flow (Right Edge: Control down to Physical Campus) -->
      <path d="M 1790 275 L 1790 1145" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="5,4" marker-end="url(#arr-white)" />
      <rect x="1710" y="710" width="160" height="24" rx="3" fill="#0A0E14" stroke="#ffffff" stroke-width="1" />
      <text x="1790" y="726" text-anchor="middle" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="8.5" font-weight="700">CLOSED-LOOP ACTUATION</text>
    </g>
    ''')

    # 4. Compact Footer Block
    svg_parts.append(f'''
    <!-- FOOTER -->
    <g id="footer" transform="translate(60, 1315)">
      <rect x="0" y="0" width="1800" height="105" rx="6" fill="rgba(14, 19, 27, 0.85)" stroke="rgba(255, 255, 255, 0.22)" stroke-width="1.2" />

      <g transform="translate(25, 20)">
        <text x="0" y="16" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">OMNIS-X SYSTEM SPECIFICATION SUMMARY</text>
        <text x="0" y="36" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">Level 01: Physical Campus (Classrooms, Labs, Substation, Data Centre)</text>
        <text x="0" y="52" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">Level 02: Multi-Protocol Data Acquisition &amp; Normalization Pipeline</text>
        <text x="0" y="68" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">Level 03: Digital Twin Core (Directed Dependency Graph &amp; Spatial BIM)</text>
      </g>

      <g transform="translate(680, 20)">
        <text x="0" y="16" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">OPERATIONAL &amp; RESILIENCE TIERS</text>
        <text x="0" y="36" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">Level 04: Seven Specialist Mathematical &amp; Heuristic Engines</text>
        <text x="0" y="52" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">Level 05: Counterfactual Simulation Sandbox &amp; Human Approval Gate</text>
        <text x="0" y="68" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">Level 06: Operational Command Centers &amp; Citizen Reporting Portal</text>
      </g>

      <g transform="translate(1320, 20)">
        <text x="0" y="16" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="10" font-weight="700">GOVERNANCE GUARANTEES</text>
        <text x="0" y="36" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Human-in-the-Loop Sign-off before physical actuation</text>
        <text x="0" y="52" fill="#94a3b8" font-family="'Geist', sans-serif" font-size="10">&bull; Zero-Trust RBAC across all ingress and control planes</text>
        <text x="0" y="68" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="10">&bull; 100% Closed-Loop Automated &amp; Verified Feedback</text>
      </g>
    </g>
    ''')

    full_svg = f'''<svg viewBox="0 0 {W} {H}" width="{W}" height="{H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="omnis-x-arch-title omnis-x-arch-desc">
  <title id="omnis-x-arch-title">OMNIS-X — Institutional Digital Twin Architecture (Monochrome Blueprint)</title>
  <desc id="omnis-x-arch-desc">Compact single-structure isometric architecture diagram for OMNIS-X digital twin resilience system in pure black and white.</desc>
  {''.join(svg_parts)}
</svg>'''

    return full_svg


def generate_html(svg_content):
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OMNIS-X — Institutional Digital Twin Architecture (Black &amp; White Blueprint)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    :root {{
      --bg: #0A0E14;
      --card-bg: #0e131b;
      --text-main: #ffffff;
      --text-muted: #94a3b8;
      --border: rgba(255, 255, 255, 0.2);
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
      padding: 1.5rem 1rem;
      overflow-x: auto;
    }}
    .container {{
      max-width: 1960px;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }}
    .diagram-frame {{
      width: 100%;
      background: #0A0E14;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1rem;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9);
      overflow-x: auto;
    }}
    svg {{
      width: 100%;
      min-width: 1920px;
      height: auto;
      display: block;
    }}
    @media print {{
      body {{ padding: 0; background: #0A0E14; }}
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

    print("Generating Compact Monochrome OMNIS-X Master Architecture SVG...")
    svg_code = generate_compact_monochrome_svg()

    svg_file = target_dir / "OMNIS-X_Architecture_Source.svg"
    svg_file.write_text(svg_code, encoding="utf-8")
    print(f"Saved SVG source: {svg_file} ({svg_file.stat().st_size:,} bytes)")

    print("Generating HTML presentation...")
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
            "--window-size=1940,1500",
            html_file.as_uri()
        ]
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            if png_file.exists():
                print(f"Successfully generated high-resolution PNG preview: {png_file} ({png_file.stat().st_size:,} bytes)")
                shutil.copy2(png_file, target_dir / "OMNIS-X_Master_Architecture.png")
            else:
                print(f"Chrome exited with code {res.returncode}, but PNG not found. Stderr: {res.stderr}")
        except Exception as e:
            print(f"Chrome screenshot execution failed: {e}")
    else:
        print("Chrome not found at standard path.")

    print("\nGeneration process complete.")


if __name__ == "__main__":
    main()
