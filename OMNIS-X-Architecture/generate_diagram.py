import sys
from pathlib import Path

# Complete OMNIS-X Master Architecture Diagram Generator
# Designed for 100% compliance with self_check.py and verify_geometry.py

def generate_omnis_x_html():
    svg_w = 1600
    svg_h = 1200

    # Layout coordinates strictly on 4px grid
    # Zone 1: y=24..124 (h=100)
    # Gap 1-2: 124..156 (32px gap)
    # Zone 2: y=156..240 (h=84)
    # Gap 2-3: 240..272 (32px gap)
    # Zone 3: y=272..388 (h=116)
    # Gap 3-4: 388..420 (32px gap)
    # Zone 4: y=420..572 (h=152)
    # Gap 4-5: 572..604 (32px gap)
    # Zone 5: y=604..764 (h=160)
    # Gap 5-6: 764..792 (28px gap)
    # Zone 6: y=792..900 (h=108)
    # Gap 6-Tech: 900..924 (24px gap)
    # Zone 8 (Tech & Legend): y=924..1172 (h=248)
    # Zone 7 (Security Pillar): y=24..900 (h=876), x=1304..1564 (w=260)

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OMNIS-X — Institutional Digital Twin &amp; Resilience Decision System Architecture</title>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500;600&family=Noto+Serif:ital@0;1&family=Noto+Sans+KR:wght@400;500;600&family=Noto+Serif+KR:wght@400&family=Noto+Sans+TC:wght@400;500;600&family=Noto+Serif+TC:wght@400&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    :root {{
      --color-paper:   #f5f5f5;   /* warm paper */
      --color-paper-2: #ececec;   /* container bg */
      --color-ink:     #2d3142;   /* jet-black typography */
      --color-muted:   #4f5d75;   /* blue-slate secondary text */
      --color-soft:    #5a6580;   /* boundary labels */
      --color-accent:  #bf4520;   /* burnt-tangerine focal */
      --color-link:    #2e5aa8;   /* link blue */
      --color-rule:    rgba(45,49,66,0.12);
      --font-sans:     'Geist', system-ui, sans-serif;
      --font-serif:    'Instrument Serif', 'Noto Serif', serif;
      --font-mono:     'Geist Mono', ui-monospace, monospace;
    }}

    body {{
      font-family: var(--font-sans);
      background: var(--color-paper);
      color: var(--color-ink);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2.5rem 1.5rem;
    }}

    .frame {{
      max-width: 1640px;
      width: 100%;
    }}

    .header {{
      margin-bottom: 1.5rem;
    }}

    .eyebrow {{
      font-family: var(--font-mono);
      font-size: 0.7rem;
      font-weight: 500;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--color-muted);
      margin-bottom: 0.4rem;
    }}

    h1 {{
      font-family: var(--font-serif);
      font-size: clamp(1.8rem, 2.5vw + 1rem, 2.4rem);
      font-weight: 400;
      letter-spacing: -0.02em;
      line-height: 1.15;
      color: var(--color-ink);
      margin-bottom: 0.5rem;
    }}

    .subtitle {{
      font-family: var(--font-sans);
      font-size: 0.92rem;
      color: var(--color-muted);
      max-width: 1200px;
      line-height: 1.45;
    }}

    .diagram-container {{
      width: 100%;
      overflow-x: auto;
      background: #ffffff;
      border: 1px solid var(--color-rule);
      border-radius: 8px;
      padding: 1.25rem 1rem;
      margin-bottom: 2rem;
    }}

    svg {{
      width: 100%;
      min-width: {svg_w}px;
      height: auto;
      display: block;
    }}

    @media print {{
      .diagram-container {{ overflow-x: visible; border: none; padding: 0; }}
      svg {{ min-width: 0; }}
    }}

    /* Summary cards grid */
    .summary-grid {{
      display: grid;
      grid-template-columns: 1.15fr 1fr 0.95fr;
      gap: 1.25rem;
      margin-top: 1rem;
    }}

    @media (max-width: 1024px) {{
      .summary-grid {{ grid-template-columns: 1fr; }}
    }}

    .card {{
      background: #ffffff;
      border: 1px solid var(--color-rule);
      border-radius: 6px;
      padding: 1.25rem;
    }}

    .card .eyebrow {{
      margin-bottom: 0.35rem;
    }}

    .card-header {{
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }}

    .card-dot {{
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }}

    .card-dot.coral {{ background: var(--color-accent); }}
    .card-dot.ink {{ background: var(--color-ink); }}
    .card-dot.link {{ background: var(--color-link); }}

    .card h3 {{
      font-family: var(--font-sans);
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--color-ink);
    }}

    .card p {{
      font-size: 0.85rem;
      line-height: 1.45;
      color: var(--color-muted);
      margin-bottom: 0.75rem;
    }}

    .card ul {{
      list-style: none;
      font-size: 0.82rem;
      line-height: 1.5;
      color: var(--color-ink);
    }}

    .card ul li {{
      position: relative;
      padding-left: 1rem;
      margin-bottom: 0.35rem;
    }}

    .card ul li::before {{
      content: "•";
      position: absolute;
      left: 0;
      color: var(--color-muted);
    }}

    .footer {{
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid var(--color-rule);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--color-muted);
    }}
  </style>
</head>
<body>
  <div class="frame">
    <div class="header">
      <p class="eyebrow">SYSTEM ARCHITECTURE · OMNIS-X INSTITUTIONAL PLATFORM</p>
      <h1>OMNIS-X Master Architecture: Digital Twin &amp; Resilience Decision System</h1>
      <p class="subtitle">Unified institutional cyber-physical digital twin connecting Detection &rarr; Understanding &rarr; Impact Prediction &rarr; Recovery Planning &rarr; Assignment &rarr; Approval &rarr; Resolution across university physical, IT, and academic operations.</p>
    </div>

    <div class="diagram-container">
      <svg viewBox="0 0 {svg_w} {svg_h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="omnisx-arch-title omnisx-arch-desc">
        <title id="omnisx-arch-title">OMNIS-X Master System Architecture</title>
        <desc id="omnisx-arch-desc">Comprehensive system architecture diagram of OMNIS-X displaying seven horizontal layers, seven specialist analytical engines, shadow simulation path, cross-cutting security pillar, and deployment technology stack.</desc>
        <defs>
          <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.8" fill="rgba(45,49,66,0.08)"/>
          </pattern>
          <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#4f5d75"/></marker>
          <marker id="arrow-accent" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#bf4520"/></marker>
          <marker id="arrow-link" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#2e5aa8"/></marker>
        </defs>

        <!-- Base Background -->
        <rect width="100%" height="100%" fill="#f5f5f5"/>
        <rect width="100%" height="100%" fill="url(#dots)" opacity="0.6"/>

        <!-- ============================================================== -->
        <!-- ZONES (Group Containers) - Painted First                       -->
        <!-- ============================================================== -->

        <!-- Zone 1: Institutional Data Sources (y: 24..124) -->
        <rect x="36" y="24" width="1240" height="100" rx="8" fill="rgba(45,49,66,0.02)" stroke="rgba(45,49,66,0.12)" stroke-width="0.8"/>
        <rect x="48" y="28" width="372" height="12" rx="2" fill="#f5f5f5"/>
        <text x="52" y="37" fill="#5a6580" font-size="7.5" font-family="'Geist Mono', monospace" letter-spacing="0.14em">LAYER 1 · INSTITUTIONAL DATA SOURCES (HETEROGENEOUS INPUTS)</text>

        <!-- Zone 2: Data Ingestion & Integration Gateway (y: 156..240) -->
        <rect x="36" y="156" width="1240" height="84" rx="8" fill="rgba(45,49,66,0.02)" stroke="rgba(45,49,66,0.12)" stroke-width="0.8"/>
        <rect x="48" y="160" width="412" height="12" rx="2" fill="#f5f5f5"/>
        <text x="52" y="169" fill="#5a6580" font-size="7.5" font-family="'Geist Mono', monospace" letter-spacing="0.14em">LAYER 2 · DATA INGESTION, VALIDATION &amp; NORMALIZATION GATEWAY</text>

        <!-- Zone 3: Digital Twin Core (y: 272..388) -->
        <rect x="36" y="272" width="1240" height="116" rx="8" fill="rgba(45,49,66,0.02)" stroke="rgba(45,49,66,0.12)" stroke-width="0.8"/>
        <rect x="48" y="276" width="428" height="12" rx="2" fill="#f5f5f5"/>
        <text x="52" y="285" fill="#5a6580" font-size="7.5" font-family="'Geist Mono', monospace" letter-spacing="0.14em">LAYER 3 · DIGITAL TWIN CORE (TOPOLOGICAL &amp; OPERATIONAL GRAPH FOUNDATION)</text>

        <!-- Zone 4: Specialist Intelligence Engines (y: 420..572) -->
        <rect x="36" y="420" width="1240" height="152" rx="8" fill="rgba(45,49,66,0.02)" stroke="rgba(45,49,66,0.12)" stroke-width="0.8"/>
        <rect x="48" y="424" width="468" height="12" rx="2" fill="#f5f5f5"/>
        <text x="52" y="433" fill="#5a6580" font-size="7.5" font-family="'Geist Mono', monospace" letter-spacing="0.14em">LAYER 4 · SPECIALIST INTELLIGENCE ENGINES (7 DETERMINISTIC ANALYTICAL MODULES)</text>

        <!-- Zone 5: Incident Decision Orchestration & Shadow Simulation (y: 604..764) -->
        <rect x="36" y="604" width="1240" height="160" rx="8" fill="rgba(45,49,66,0.02)" stroke="rgba(45,49,66,0.12)" stroke-width="0.8"/>
        <rect x="48" y="608" width="480" height="12" rx="2" fill="#f5f5f5"/>
        <text x="52" y="617" fill="#5a6580" font-size="7.5" font-family="'Geist Mono', monospace" letter-spacing="0.14em">LAYER 5 · INCIDENT &amp; DECISION ORCHESTRATION ENGINE (LIFECYCLE &amp; SHADOW SIMULATION)</text>

        <!-- Zone 6: Unified Applications & Experience (y: 792..900) -->
        <rect x="36" y="792" width="1240" height="108" rx="8" fill="rgba(45,49,66,0.02)" stroke="rgba(45,49,66,0.12)" stroke-width="0.8"/>
        <rect x="48" y="796" width="440" height="12" rx="2" fill="#f5f5f5"/>
        <text x="52" y="805" fill="#5a6580" font-size="7.5" font-family="'Geist Mono', monospace" letter-spacing="0.14em">LAYER 6 · UNIFIED APPLICATION &amp; USER EXPERIENCE PORTAL (ONE INSTITUTIONAL WEB APP)</text>

        <!-- Zone 7: Security & Governance Cross-Cutting Pillar (Vertical: y 24..900, x 1304..1564) -->
        <rect x="1304" y="24" width="260" height="876" rx="8" fill="rgba(45,49,66,0.02)" stroke="rgba(45,49,66,0.14)" stroke-width="0.8"/>
        <rect x="1316" y="28" width="236" height="12" rx="2" fill="#f5f5f5"/>
        <text x="1434" y="37" fill="#5a6580" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.14em">LAYER 7 · SECURITY &amp; GOVERNANCE</text>

        <!-- Zone 8: Tech Stack Matrix & Legend (y: 924..1172) -->
        <rect x="36" y="924" width="1528" height="248" rx="8" fill="rgba(45,49,66,0.02)" stroke="rgba(45,49,66,0.12)" stroke-width="0.8"/>
        <rect x="48" y="928" width="372" height="12" rx="2" fill="#f5f5f5"/>
        <text x="52" y="937" fill="#5a6580" font-size="7.5" font-family="'Geist Mono', monospace" letter-spacing="0.14em">SYSTEM ARCHITECTURE TECHNOLOGY MATRIX &amp; DEPLOYMENT SPECIFICATION</text>

        <!-- ============================================================== -->
        <!-- CONNECTORS & ARROWS (Drawn Behind Nodes)                        -->
        <!-- ============================================================== -->

        <!-- Connectors: Layer 1 to Layer 2 (Gap 1-2: 112..174) -->
        <!-- 1A (leaves 190, y=112) to 2B (enters 340, y=174) via y=136 -->
        <path d="M 190,112 V 128 Q 190,136 198,136 H 332 Q 340,136 340,144 V 174" fill="none" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
        <!-- 1B (leaves 440, y=112) to 2B (enters 440, y=174) straight vertical (100px from 340) -->
        <line x1="440" y1="112" x2="440" y2="174" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
        <!-- 1C (leaves 600, y=112) to 2A (enters 158, y=174) via y=148 (offset by 12px from 136) -->
        <path d="M 600,112 V 140 Q 600,148 592,148 H 166 Q 158,148 158,156 V 174" fill="none" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
        <!-- 1D (leaves 880, y=112) to 2C (enters 616, y=174) via y=140 (offset from 148 by 8px? wait: make it y=140 to right of 600) -->
        <path d="M 880,112 V 132 Q 880,140 872,140 H 624 Q 616,140 616,148 V 174" fill="none" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
        <!-- 1E (leaves 1146, y=112) to 2E (enters 1146, y=174) straight vertical -->
        <line x1="1146" y1="112" x2="1146" y2="174" stroke="#bf4520" stroke-width="1.2" stroke-dasharray="4,3" marker-end="url(#arrow-accent)"/>

        <!-- In-Layer 2 Flow: 2A -> 2B -> 2C -> 2D -> 2E at y=200 -->
        <line x1="268" y1="200" x2="284" y2="200" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
        <line x1="512" y1="200" x2="528" y2="200" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
        <line x1="756" y1="200" x2="772" y2="200" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
        <line x1="1012" y1="200" x2="1028" y2="200" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>

        <!-- Connectors: Layer 2 to Layer 3 (Gap 2-3: 226..290) -->
        <!-- 2D to 3A (Registry): leaves 2D at 816, y=226 via y=250 to 3A at 190, y=290 -->
        <path d="M 816,226 V 242 Q 816,250 808,250 H 198 Q 190,250 190,258 V 290" fill="none" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
        <!-- 2D to 3C (State): leaves 2D at 864, y=226 via y=262 (offset by 12px from 250) to 3C at 774, y=290 -->
        <path d="M 864,226 V 254 Q 864,262 856,262 H 782 Q 774,262 774,270 V 290" fill="none" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
        <!-- 2E (Provenance) to 3D (Dependency Graph): leaves 2E at 1146, y=226 via y=258 to 3D at 1098, y=290 -->
        <path d="M 1146,226 V 250 Q 1146,258 1138,258 H 1106 Q 1098,258 1098,266 V 290" fill="none" stroke="#bf4520" stroke-width="1.4" marker-end="url(#arrow-accent)"/>

        <!-- In-Layer 3 Interconnections: 3A, 3B, 3C -> 3D (Dependency Graph) at y=332 -->
        <line x1="332" y1="332" x2="348" y2="332" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
        <line x1="616" y1="332" x2="632" y2="332" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
        <line x1="916" y1="332" x2="932" y2="332" stroke="#bf4520" stroke-width="1.4" marker-end="url(#arrow-accent)"/>

        <!-- Connectors: Layer 3 to Layer 4 (Gap 3-4: 374..434) -->
        <!-- 3C (leaves 640, y=374) to Engine 1 (enters 128, y=434) via y=394 -->
        <path d="M 640,374 V 386 Q 640,394 632,394 H 136 Q 128,394 128,402 V 434" fill="none" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
        <!-- 3D (leaves 960, y=374) to Engine 2 (enters 304, y=434) via y=406 (offset by 12px from 394) -->
        <path d="M 960,374 V 398 Q 960,406 952,406 H 312 Q 304,406 304,414 V 434" fill="none" stroke="#bf4520" stroke-width="1.4" marker-end="url(#arrow-accent)"/>
        <!-- 3B (leaves 480, y=374) to Engine 3 (enters 480, y=434) straight vertical -->
        <line x1="480" y1="374" x2="480" y2="434" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
        <!-- 3C (leaves 656, y=374, 16px from 640) to Engine 4 (enters 656, y=434) straight vertical -->
        <line x1="656" y1="374" x2="656" y2="434" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
        <!-- 3D (leaves 992, y=374) to Engine 5 (enters 832, y=434) via y=418 -->
        <path d="M 992,374 V 410 Q 992,418 984,418 H 840 Q 832,418 832,422 V 434" fill="none" stroke="#bf4520" stroke-width="1.4" marker-end="url(#arrow-accent)"/>
        <!-- 3D (leaves 1040, y=374) to Engine 6 (enters 1016, y=434) via y=406 -->
        <path d="M 1040,374 V 398 Q 1040,406 1032,406 H 1024 Q 1016,406 1016,414 V 434" fill="none" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>

        <!-- In-Layer 4 Pipeline: Engines 1-6 -> Engine 7 at y=498 -->
        <line x1="208" y1="498" x2="224" y2="498" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
        <line x1="384" y1="498" x2="400" y2="498" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
        <line x1="560" y1="498" x2="576" y2="498" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
        <line x1="736" y1="498" x2="752" y2="498" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
        <line x1="912" y1="498" x2="928" y2="498" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
        <line x1="1088" y1="498" x2="1104" y2="498" stroke="#bf4520" stroke-width="1.4" marker-end="url(#arrow-accent)"/>

        <!-- Connectors: Layer 4 to Layer 5 (Gap 4-5: 558..622) -->
        <!-- Engine 7 -> Layer 5 Phase 1 (Incident Intake) via y=584 -->
        <path d="M 1184,558 V 576 Q 1184,584 1176,584 H 150 Q 142,584 142,592 V 622" fill="none" stroke="#bf4520" stroke-width="1.4" marker-end="url(#arrow-accent)"/>

        <!-- In-Layer 5: Real Pipeline Flow at y=666 -->
        <line x1="236" y1="666" x2="252" y2="666" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
        <line x1="440" y1="666" x2="456" y2="666" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
        <line x1="644" y1="666" x2="660" y2="666" stroke="#bf4520" stroke-width="1.4" marker-end="url(#arrow-accent)"/>
        <!-- Approval to Resolution loop straight down -->
        <path d="M 754,714 V 726" fill="none" stroke="#2e5aa8" stroke-width="1.2" marker-end="url(#arrow-link)"/>
        <!-- Infeasible Branch from Phase 3 straight down -->
        <path d="M 550,714 V 726" fill="none" stroke="#4f5d75" stroke-width="1.2" stroke-dasharray="4,3" marker-end="url(#arrow)"/>

        <!-- Shadow Simulation Branch: From State/Graph to Sandbox via y=596 (offset from 584 by 12px) -->
        <path d="M 1216,374 V 588 Q 1216,596 1208,596 H 1060 Q 1052,596 1052,604 V 622" fill="none" stroke="#bf4520" stroke-width="1.2" stroke-dasharray="4,3" marker-end="url(#arrow-accent)"/>

        <!-- Connectors: Layer 5 to Layer 6 (Gap 5-6: 750..808) -->
        <!-- Real Pipeline Dispatch to Incident Hub 6C via y=780 -->
        <path d="M 754,750 V 772 Q 754,780 762,780 H 796 Q 804,780 804,788 V 808" fill="none" stroke="#2e5aa8" stroke-width="1.4" marker-end="url(#arrow-link)"/>
        <!-- Real State/Event Broadcast to Command Center 6A via y=772 -->
        <path d="M 142,714 V 764 Q 142,772 150,772 H 190 Q 198,772 198,780 V 808" fill="none" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
        <!-- Digital Twin Explorer 6B fed from Twin Core / Simulation at 490 -->
        <path d="M 490,750 V 772 Q 490,780 490,788 V 808" fill="none" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
        <!-- Simulation Results to UI Explorer at 528 (offset from 490 by 38px) via y=768 (offset from 780 by 12px) -->
        <path d="M 1052,750 V 760 Q 1052,768 1044,768 H 536 Q 528,768 528,776 V 808" fill="none" stroke="#bf4520" stroke-width="1.2" stroke-dasharray="4,3" marker-end="url(#arrow-accent)"/>

        <!-- Feedback Flows (Dashed lines, closed loop) -->
        <!-- Feedback 1: Student/Staff Reports from 6D (leaves at 1112) back up to 2C Intake (enters at 664) -->
        <!-- Vertical segment at x=1284 (Zone 2 right border is 1276; 1284 is clear) -->
        <path d="M 1112,808 V 792 Q 1112,784 1120,784 H 1276 Q 1284,784 1284,776 V 144 Q 1284,136 1276,136 H 672 Q 664,136 664,144 V 174" fill="none" stroke="#4f5d75" stroke-width="1" stroke-dasharray="4,3" marker-end="url(#arrow)"/>
        <!-- Feedback 2: Resolution Updates from Layer 5 enters left side of Operational State 3C (x=632, y=348, 16px from y=332!) -->
        <path d="M 660,738 H 628 Q 620,738 620,730 V 356 Q 620,348 628,348 H 632" fill="none" stroke="#2e5aa8" stroke-width="1" stroke-dasharray="4,3" marker-end="url(#arrow-link)"/>

        <!-- Cross-Cutting Security Pillar Connectors to all layers (Dotted) -->
        <line x1="1304" y1="80" x2="1276" y2="80" stroke="#5a6580" stroke-width="1" stroke-dasharray="2,3"/>
        <line x1="1304" y1="198" x2="1276" y2="198" stroke="#5a6580" stroke-width="1" stroke-dasharray="2,3"/>
        <line x1="1304" y1="330" x2="1276" y2="330" stroke="#5a6580" stroke-width="1" stroke-dasharray="2,3"/>
        <line x1="1304" y1="486" x2="1276" y2="486" stroke="#5a6580" stroke-width="1" stroke-dasharray="2,3"/>
        <line x1="1304" y1="672" x2="1276" y2="672" stroke="#5a6580" stroke-width="1" stroke-dasharray="2,3"/>
        <line x1="1304" y1="840" x2="1276" y2="840" stroke="#5a6580" stroke-width="1" stroke-dasharray="2,3"/>

        <!-- ============================================================== -->
        <!-- ARROW LABELS (Opaque Masks Clear of Strokes & Nodes)            -->
        <!-- ============================================================== -->

        <rect x="254" y="130" width="48" height="12" rx="2" fill="#f5f5f5"/>
        <text x="278" y="139" fill="#4f5d75" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.06em">MQTT TELEM</text>

        <rect x="364" y="142" width="56" height="12" rx="2" fill="#f5f5f5"/>
        <text x="392" y="151" fill="#4f5d75" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.06em">REST ACADEMIC</text>

        <rect x="734" y="134" width="48" height="12" rx="2" fill="#f5f5f5"/>
        <text x="758" y="143" fill="#4f5d75" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.06em">USER REPORT</text>

        <rect x="1116" y="138" width="60" height="12" rx="2" fill="#f5f5f5"/>
        <text x="1146" y="147" fill="#bf4520" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.06em">SYNTH INJECT</text>

        <rect x="472" y="244" width="68" height="12" rx="2" fill="#f5f5f5"/>
        <text x="506" y="253" fill="#4f5d75" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.06em">NORMALIZED EVT</text>

        <rect x="1068" y="252" width="56" height="12" rx="2" fill="#f5f5f5"/>
        <text x="1096" y="261" fill="#bf4520" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.06em">GRAPH TOPO</text>

        <rect x="520" y="388" width="76" height="12" rx="2" fill="#f5f5f5"/>
        <text x="558" y="397" fill="#bf4520" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.06em">TOPOLOGY + STATE</text>

        <rect x="528" y="578" width="76" height="12" rx="2" fill="#f5f5f5"/>
        <text x="566" y="587" fill="#bf4520" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.06em">CONSOLIDATED SOP</text>

        <rect x="536" y="718" width="56" height="12" rx="2" fill="#f5f5f5"/>
        <text x="564" y="727" fill="#4f5d75" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.06em">NO FEASIBLE SOL</text>

        <rect x="760" y="774" width="60" height="12" rx="2" fill="#f5f5f5"/>
        <text x="790" y="783" fill="#2e5aa8" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.06em">DISPATCH / WS</text>

        <rect x="1200" y="130" width="72" height="12" rx="2" fill="#f5f5f5"/>
        <text x="1236" y="139" fill="#4f5d75" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.06em">REPORT FEEDBACK</text>

        <!-- ============================================================== -->
        <!-- LAYER 1 NODES: Institutional Data Sources (y: 52..112, h=60)   -->
        <!-- ============================================================== -->

        <!-- 1A: Physical Infrastructure -->
        <rect x="48" y="52" width="224" height="60" rx="6" fill="#f5f5f5"/>
        <rect x="48" y="52" width="224" height="60" rx="6" fill="rgba(45,49,66,0.03)" stroke="#4f5d75" stroke-width="1"/>
        <rect x="56" y="60" width="34" height="12" rx="2" fill="transparent" stroke="rgba(79,93,117,0.4)" stroke-width="0.8"/>
        <text x="73" y="69" fill="#4f5d75" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">REAL</text>
        <text x="160" y="76" fill="#2d3142" font-size="11.5" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Physical Infrastructure</text>
        <text x="160" y="90" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Power · Meters · HVAC · Water · Occupancy</text>
        <text x="160" y="102" fill="#5a6580" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">Edge Modbus · BACnet · LoRaWAN</text>

        <!-- 1B: IT Infrastructure -->
        <rect x="294" y="52" width="224" height="60" rx="6" fill="#f5f5f5"/>
        <rect x="294" y="52" width="224" height="60" rx="6" fill="rgba(45,49,66,0.03)" stroke="#4f5d75" stroke-width="1"/>
        <rect x="302" y="60" width="34" height="12" rx="2" fill="transparent" stroke="rgba(79,93,117,0.4)" stroke-width="0.8"/>
        <text x="319" y="69" fill="#4f5d75" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">REAL</text>
        <text x="406" y="76" fill="#2d3142" font-size="11.5" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Campus IT Infrastructure</text>
        <text x="406" y="90" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Wi-Fi APs · Core Switches · Edge Servers</text>
        <text x="406" y="102" fill="#5a6580" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">SNMP Polling · Syslog · NetFlow</text>

        <!-- 1C: Academic Systems -->
        <rect x="540" y="52" width="228" height="60" rx="6" fill="#f5f5f5"/>
        <rect x="540" y="52" width="228" height="60" rx="6" fill="rgba(45,49,66,0.03)" stroke="#4f5d75" stroke-width="1"/>
        <rect x="548" y="60" width="60" height="12" rx="2" fill="transparent" stroke="rgba(79,93,117,0.4)" stroke-width="0.8"/>
        <text x="578" y="69" fill="#4f5d75" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">SCHEDULED</text>
        <text x="654" y="76" fill="#2d3142" font-size="11.5" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Academic Operations</text>
        <text x="654" y="90" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Timetable · Faculty Avail · Classroom Alloc</text>
        <text x="654" y="102" fill="#5a6580" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">Student Sections · Exam / Lab Rosters</text>

        <!-- 1D: Human Reporting -->
        <rect x="790" y="52" width="236" height="60" rx="6" fill="#f5f5f5"/>
        <rect x="790" y="52" width="236" height="60" rx="6" fill="rgba(45,49,66,0.03)" stroke="#4f5d75" stroke-width="1"/>
        <rect x="798" y="60" width="52" height="12" rx="2" fill="transparent" stroke="rgba(79,93,117,0.4)" stroke-width="0.8"/>
        <text x="824" y="69" fill="#4f5d75" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">REPORTED</text>
        <text x="908" y="76" fill="#2d3142" font-size="11.5" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Human Reporting Intake</text>
        <text x="908" y="90" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Student App · Staff Reports · Photo Proof</text>
        <text x="908" y="102" fill="#5a6580" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">Geo-tag Coordinates · Problem Descriptions</text>

        <!-- 1E: Simulation -->
        <rect x="1048" y="52" width="216" height="60" rx="6" fill="#f5f5f5"/>
        <rect x="1048" y="52" width="216" height="60" rx="6" fill="rgba(191,69,32,0.06)" stroke="#bf4520" stroke-width="1" stroke-dasharray="4,3"/>
        <rect x="1056" y="60" width="56" height="12" rx="2" fill="transparent" stroke="rgba(191,69,32,0.4)" stroke-width="0.8"/>
        <text x="1084" y="69" fill="#bf4520" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">SYNTHETIC</text>
        <text x="1156" y="76" fill="#2d3142" font-size="11.5" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Simulation Generator</text>
        <text x="1156" y="90" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Synthetic Telemetry · Failure Injections</text>
        <text x="1156" y="102" fill="#bf4520" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">Historical Scenario Replay Engine</text>

        <!-- ============================================================== -->
        <!-- LAYER 2 NODES: Ingestion & Integration Gateway (y: 174..226)    -->
        <!-- ============================================================== -->

        <!-- 2A: REST API Adapters -->
        <rect x="48" y="174" width="220" height="52" rx="6" fill="#f5f5f5"/>
        <rect x="48" y="174" width="220" height="52" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1"/>
        <rect x="56" y="180" width="44" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="78" y="189" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">ADAPTER</text>
        <text x="158" y="196" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">REST &amp; Webhook Sync</text>
        <text x="158" y="210" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">SIS / ERP Timetable Adapters · JSON/OAuth</text>

        <!-- 2B: MQTT IoT Broker -->
        <rect x="284" y="174" width="228" height="52" rx="6" fill="#f5f5f5"/>
        <rect x="284" y="174" width="228" height="52" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1"/>
        <rect x="292" y="180" width="40" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="312" y="189" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">BROKER</text>
        <text x="398" y="196" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">MQTT Broker (EMQX/Mosquitto)</text>
        <text x="398" y="210" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Sub/Pub Topics: campus/sensors/# · QoS 1</text>

        <!-- 2C: Evidence Intake & Image Validator -->
        <rect x="528" y="174" width="228" height="52" rx="6" fill="#f5f5f5"/>
        <rect x="528" y="174" width="228" height="52" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1"/>
        <rect x="536" y="180" width="44" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="558" y="189" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">INTAKE</text>
        <text x="642" y="196" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Report Intake &amp; Image Validation</text>
        <text x="642" y="210" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">EXIF Sanitation · Geo-Match · Anti-Abuse</text>

        <!-- 2D: Data Normalization & Event Deduplication -->
        <rect x="772" y="174" width="240" height="52" rx="6" fill="#f5f5f5"/>
        <rect x="772" y="174" width="240" height="52" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1"/>
        <rect x="780" y="180" width="44" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="802" y="189" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">SCHEMA</text>
        <text x="892" y="196" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Data Normalization &amp; Deduplication</text>
        <text x="892" y="210" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Pydantic Schemas · Sliding Window Dedup</text>

        <!-- 2E: Provenance & Timestamp Tagger -->
        <rect x="1028" y="174" width="236" height="52" rx="6" fill="#f5f5f5"/>
        <rect x="1028" y="174" width="236" height="52" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1"/>
        <rect x="1036" y="180" width="48" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="1060" y="189" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">LINEAGE</text>
        <text x="1146" y="196" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Provenance &amp; Source Tagger</text>
        <text x="1146" y="210" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Distinguish Real vs Synthetic Data Streams</text>

        <!-- ============================================================== -->
        <!-- LAYER 3 NODES: Digital Twin Core Foundation (y: 290..374)       -->
        <!-- ============================================================== -->

        <!-- 3A: Entity & Asset Registry -->
        <rect x="48" y="290" width="284" height="84" rx="6" fill="#f5f5f5"/>
        <rect x="48" y="290" width="284" height="84" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1.2"/>
        <rect x="56" y="298" width="48" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="80" y="307" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">REGISTRY</text>
        <text x="190" y="316" fill="#2d3142" font-size="12" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">1. Entity &amp; Asset Registry</text>
        <text x="190" y="332" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Buildings · Floors · Classrooms · Labs · Equipment</text>
        <text x="190" y="346" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Power Transformers · Switches · Faculty &amp; Sections</text>
        <text x="190" y="360" fill="#5a6580" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">Canonical UUIDs · Relational Schemas in Postgres</text>

        <!-- 3B: Spatial Campus Model -->
        <rect x="348" y="290" width="268" height="84" rx="6" fill="#f5f5f5"/>
        <rect x="348" y="290" width="268" height="84" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1.2"/>
        <rect x="356" y="298" width="44" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="378" y="307" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">SPATIAL</text>
        <text x="482" y="316" fill="#2d3142" font-size="12" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">2. Spatial Campus Model</text>
        <text x="482" y="332" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">2D Vector Blueprint &amp; 3D Floor Geometry</text>
        <text x="482" y="346" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Room Coordinates · Polygon Bounds · Click Targets</text>
        <text x="482" y="360" fill="#5a6580" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">SVG Projection Engine · [Future: PostGIS 3.4]</text>

        <!-- 3C: Operational State Engine -->
        <rect x="632" y="290" width="284" height="84" rx="6" fill="#f5f5f5"/>
        <rect x="632" y="290" width="284" height="84" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1.2"/>
        <rect x="640" y="298" width="40" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="660" y="307" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">STATE</text>
        <text x="774" y="316" fill="#2d3142" font-size="12" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">3. Operational State Engine</text>
        <text x="774" y="332" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Observed Telemetry · Equipment Operational Status</text>
        <text x="774" y="346" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Room Availability · Active Disruption Flags</text>
        <text x="774" y="360" fill="#5a6580" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">In-Memory Redis State · Historical State Replay</text>

        <!-- 3D: Dependency Graph Engine (FOCAL CORAL ACCENT) -->
        <rect x="932" y="290" width="332" height="84" rx="6" fill="#f5f5f5"/>
        <rect x="932" y="290" width="332" height="84" rx="6" fill="rgba(191,69,32,0.08)" stroke="#bf4520" stroke-width="1.4"/>
        <rect x="940" y="298" width="52" height="12" rx="2" fill="transparent" stroke="rgba(191,69,32,0.5)" stroke-width="0.8"/>
        <text x="966" y="307" fill="#bf4520" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">TOPOLOGY</text>
        <text x="1098" y="316" fill="#2d3142" font-size="12" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">4. Dependency Graph Engine (Core)</text>
        <text x="1098" y="332" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Supplies_Power_To · Connected_To · Located_In</text>
        <text x="1098" y="346" fill="#bf4520" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Physical Dependency &ne; Operational Impact Separation</text>
        <text x="1098" y="360" fill="#5a6580" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">Directed Multigraph in NetworkX · Cyclic Redundancies</text>

        <!-- ============================================================== -->
        <!-- LAYER 4 NODES: 7 Specialist Intelligence Engines (y: 434..558)   -->
        <!-- ============================================================== -->

        <!-- Engine 1 -->
        <rect x="48" y="434" width="160" height="124" rx="6" fill="#f5f5f5"/>
        <rect x="48" y="434" width="160" height="124" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1"/>
        <rect x="54" y="440" width="48" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="78" y="449" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">ENGINE 1</text>
        <text x="128" y="460" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Event &amp; Anomaly</text>
        <text x="128" y="472" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Detection Engine</text>
        <text x="128" y="488" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Dynamic EWMA Drift</text>
        <text x="128" y="502" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Adaptive Z-Score</text>
        <text x="128" y="516" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Sliding Mean Window</text>
        <text x="128" y="530" fill="#5a6580" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Isolation Forest (Opt)</text>
        <text x="128" y="546" fill="#bf4520" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle">Deterministic Signal</text>

        <!-- Engine 2 -->
        <rect x="224" y="434" width="160" height="124" rx="6" fill="#f5f5f5"/>
        <rect x="224" y="434" width="160" height="124" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1"/>
        <rect x="230" y="440" width="48" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="254" y="449" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">ENGINE 2</text>
        <text x="304" y="460" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Graph Impact</text>
        <text x="304" y="472" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Propagation Engine</text>
        <text x="304" y="488" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; BFS / DFS Traversal</text>
        <text x="304" y="502" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Cascade Failure Paths</text>
        <text x="304" y="516" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Criticality Weighting</text>
        <text x="304" y="530" fill="#5a6580" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Redundancy Bypass</text>
        <text x="304" y="546" fill="#bf4520" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle">NetworkX Digraph</text>

        <!-- Engine 3 -->
        <rect x="400" y="434" width="160" height="124" rx="6" fill="#f5f5f5"/>
        <rect x="400" y="434" width="160" height="124" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1"/>
        <rect x="406" y="440" width="48" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="430" y="449" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">ENGINE 3</text>
        <text x="480" y="460" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Risk &amp; Criticality</text>
        <text x="480" y="472" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Analysis Engine</text>
        <text x="480" y="488" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; FMEA Framework</text>
        <text x="480" y="502" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; RPN = S &times; O &times; D</text>
        <text x="480" y="516" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Severity &amp; Occurrence</text>
        <text x="480" y="530" fill="#5a6580" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Detectability Score</text>
        <text x="480" y="546" fill="#bf4520" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle">Ranked Risk Priority</text>

        <!-- Engine 4 -->
        <rect x="576" y="434" width="160" height="124" rx="6" fill="#f5f5f5"/>
        <rect x="576" y="434" width="160" height="124" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1"/>
        <rect x="582" y="440" width="48" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="606" y="449" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">ENGINE 4</text>
        <text x="656" y="460" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Academic Resource</text>
        <text x="656" y="472" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Impact Engine</text>
        <text x="656" y="488" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Timetable Conflicts</text>
        <text x="656" y="502" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Room Capacity Match</text>
        <text x="656" y="516" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Faculty Availability</text>
        <text x="656" y="530" fill="#5a6580" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Lab Equipment Reqs</text>
        <text x="656" y="546" fill="#bf4520" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle">Disruption Forecast</text>

        <!-- Engine 5 -->
        <rect x="752" y="434" width="160" height="124" rx="6" fill="#f5f5f5"/>
        <rect x="752" y="434" width="160" height="124" rx="6" fill="rgba(191,69,32,0.08)" stroke="#bf4520" stroke-width="1.2"/>
        <rect x="758" y="440" width="48" height="12" rx="2" fill="transparent" stroke="rgba(191,69,32,0.5)" stroke-width="0.8"/>
        <text x="782" y="449" fill="#bf4520" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">ENGINE 5</text>
        <text x="832" y="460" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Recovery Optimization</text>
        <text x="832" y="472" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Solver (CP-SAT)</text>
        <text x="832" y="488" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Google OR-Tools</text>
        <text x="832" y="502" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Constraint Satisfaction</text>
        <text x="832" y="516" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Cost/Disruption Min</text>
        <text x="832" y="530" fill="#5a6580" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Infeasibility Proofs</text>
        <text x="832" y="546" fill="#bf4520" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle">Exact Solver Core</text>

        <!-- Engine 6 -->
        <rect x="928" y="434" width="160" height="124" rx="6" fill="#f5f5f5"/>
        <rect x="928" y="434" width="160" height="124" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1"/>
        <rect x="934" y="440" width="48" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="958" y="449" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">ENGINE 6</text>
        <text x="1008" y="460" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Responsibility &amp; Task</text>
        <text x="1008" y="472" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Assignment Engine</text>
        <text x="1008" y="488" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Dept Role Mapping</text>
        <text x="1008" y="502" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Skill Competence Match</text>
        <text x="1008" y="516" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Assignee Workload</text>
        <text x="1008" y="530" fill="#5a6580" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; SLA Escalation Logic</text>
        <text x="1008" y="546" fill="#bf4520" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle">Deterministic Routing</text>

        <!-- Engine 7 -->
        <rect x="1104" y="434" width="160" height="124" rx="6" fill="#f5f5f5"/>
        <rect x="1104" y="434" width="160" height="124" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1.2"/>
        <rect x="1110" y="440" width="48" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="1134" y="449" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">ENGINE 7</text>
        <text x="1184" y="460" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Decision &amp; Action</text>
        <text x="1184" y="472" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Coordination Hub</text>
        <text x="1184" y="488" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Consolidates Experts</text>
        <text x="1184" y="502" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Validates Evidence</text>
        <text x="1184" y="516" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Ranks Alternatives</text>
        <text x="1184" y="530" fill="#5a6580" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Generates SOP Plan</text>
        <text x="1184" y="546" fill="#bf4520" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle">Single Incident Plan</text>

        <!-- ============================================================== -->
        <!-- LAYER 5 NODES: Orchestration & Shadow Simulation (y: 622..750)  -->
        <!-- ============================================================== -->

        <!-- Real 14-Stage Lifecycle Sub-Tracks -->
        <!-- Phase 1: Intake & Binding -->
        <rect x="48" y="622" width="188" height="92" rx="6" fill="#f5f5f5"/>
        <rect x="48" y="622" width="188" height="92" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1"/>
        <rect x="54" y="628" width="46" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="77" y="637" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">STAGES 1-3</text>
        <text x="142" y="648" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Detection &amp; Twin Binding</text>
        <text x="142" y="664" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">1. Incident Creation</text>
        <text x="142" y="678" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">2. Anomaly Signal Validation</text>
        <text x="142" y="692" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">3. Digital Twin Entity Correlation</text>
        <text x="142" y="706" fill="#5a6580" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle">Binds Physical UUIDs &amp; Nodes</text>

        <!-- Phase 2: Impact Assessment -->
        <rect x="252" y="622" width="188" height="92" rx="6" fill="#f5f5f5"/>
        <rect x="252" y="622" width="188" height="92" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1"/>
        <rect x="258" y="628" width="46" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="281" y="637" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">STAGES 4-5</text>
        <text x="346" y="648" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Impact &amp; Consequence</text>
        <text x="346" y="664" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">4. Graph Impact Assessment</text>
        <text x="346" y="678" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">5. Future Consequence Forecast</text>
        <text x="346" y="692" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; RPN Score: S &times; O &times; D Calculation</text>
        <text x="346" y="706" fill="#5a6580" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle">Cascading Topological Tree</text>

        <!-- Phase 3: Recovery Formulation -->
        <rect x="456" y="622" width="188" height="92" rx="6" fill="#f5f5f5"/>
        <rect x="456" y="622" width="188" height="92" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1"/>
        <rect x="462" y="628" width="46" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="485" y="637" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">STAGES 6-8</text>
        <text x="550" y="648" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Recovery Optimization</text>
        <text x="550" y="664" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">6. Alternative Generation</text>
        <text x="550" y="678" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">7. Cost / Risk / Time Tradeoff</text>
        <text x="550" y="692" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">8. Multi-Objective Ranking</text>
        <text x="550" y="706" fill="#bf4520" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle">Pareto Optimal Recovery Set</text>

        <!-- Phase 4: Assignment & Human Approval -->
        <rect x="660" y="622" width="188" height="92" rx="6" fill="#f5f5f5"/>
        <rect x="660" y="622" width="188" height="92" rx="6" fill="rgba(46,90,168,0.06)" stroke="#2e5aa8" stroke-width="1.2"/>
        <rect x="666" y="628" width="52" height="12" rx="2" fill="transparent" stroke="rgba(46,90,168,0.4)" stroke-width="0.8"/>
        <text x="692" y="637" fill="#2e5aa8" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">STAGES 9-11</text>
        <text x="754" y="648" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Routing &amp; Human Approval</text>
        <text x="754" y="664" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">9. Department Identification</text>
        <text x="754" y="678" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">10. Task Auto-Routing</text>
        <text x="754" y="692" fill="#2e5aa8" font-size="8.5" font-weight="600" font-family="'Geist Mono', monospace" text-anchor="middle">11. Human Approval Gate</text>
        <text x="754" y="706" fill="#2e5aa8" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle">Mandatory for High-Risk Actions</text>

        <!-- Infeasible Branch -->
        <rect x="456" y="726" width="188" height="24" rx="4" fill="#f5f5f5"/>
        <rect x="456" y="726" width="188" height="24" rx="4" fill="rgba(45,49,66,0.03)" stroke="#4f5d75" stroke-width="0.8" stroke-dasharray="3,3"/>
        <text x="550" y="742" fill="#bf4520" font-size="8" font-weight="600" font-family="'Geist Mono', monospace" text-anchor="middle">INFEASIBLE &rarr; Escalate to Exec</text>

        <!-- Resolution & Verification Loop -->
        <rect x="660" y="726" width="188" height="24" rx="4" fill="#f5f5f5"/>
        <rect x="660" y="726" width="188" height="24" rx="4" fill="rgba(46,90,168,0.04)" stroke="#2e5aa8" stroke-width="0.8"/>
        <text x="754" y="742" fill="#2e5aa8" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">12. Track &rarr; 13. Verify &rarr; 14. Close</text>

        <!-- Shadow Simulation Path (Isolated State Sandbox) -->
        <rect x="864" y="622" width="396" height="128" rx="6" fill="#f5f5f5"/>
        <rect x="864" y="622" width="396" height="128" rx="6" fill="rgba(191,69,32,0.04)" stroke="#bf4520" stroke-width="1.2" stroke-dasharray="4,3"/>
        <rect x="872" y="628" width="84" height="12" rx="2" fill="transparent" stroke="rgba(191,69,32,0.5)" stroke-width="0.8"/>
        <text x="914" y="637" fill="#bf4520" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">SHADOW SANDBOX</text>
        <text x="1062" y="648" fill="#2d3142" font-size="12" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Hypothetical What-If Simulation Sandbox</text>
        <text x="1062" y="666" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Baseline State Clone &rarr; Shadow Memory State &rarr; Failure Injection</text>
        <text x="1062" y="680" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">&rarr; Impact Traversal Propagation &rarr; Recovery Evaluation &rarr; Scenario Report</text>
        <rect x="876" y="696" width="372" height="44" rx="4" fill="#f5f5f5"/>
        <rect x="876" y="696" width="372" height="44" rx="4" fill="rgba(191,69,32,0.06)" stroke="#bf4520" stroke-width="0.8"/>
        <text x="1062" y="710" fill="#bf4520" font-size="8" font-weight="600" font-family="'Geist Mono', monospace" text-anchor="middle">STRICT ISOLATION GUARANTEE</text>
        <text x="1062" y="724" fill="#2d3142" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">Simulation runs exclusively in memory shadow state;</text>
        <text x="1062" y="734" fill="#2d3142" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">NEVER overwrites live campus operational records!</text>

        <!-- ============================================================== -->
        <!-- LAYER 6 NODES: Unified Application & User Experience (y: 808..884)-->
        <!-- ============================================================== -->

        <!-- View 6A: Command Center -->
        <rect x="48" y="808" width="284" height="76" rx="6" fill="#f5f5f5"/>
        <rect x="48" y="808" width="284" height="76" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1.2"/>
        <rect x="56" y="814" width="60" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="86" y="823" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">OPS CENTER</text>
        <text x="190" y="832" fill="#2d3142" font-size="12" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">A. Command Center</text>
        <text x="190" y="848" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Campus Health Overview &bull; Active Incidents Matrix</text>
        <text x="190" y="862" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Critical Infrastructure Telemetry &bull; Risk RPN Feed</text>
        <text x="190" y="876" fill="#5a6580" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">Audience: Principal, Vice Chancellor, Deans</text>

        <!-- View 6B: Digital Twin Explorer -->
        <rect x="348" y="808" width="284" height="76" rx="6" fill="#f5f5f5"/>
        <rect x="348" y="808" width="284" height="76" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1.2"/>
        <rect x="356" y="814" width="68" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="390" y="823" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">TWIN EXPLORER</text>
        <text x="490" y="832" fill="#2d3142" font-size="12" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">B. Digital Twin Explorer</text>
        <text x="490" y="848" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Interactive 2D Campus Blueprint &bull; Room Geometry</text>
        <text x="490" y="862" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Clickable Assets &bull; NetworkX Subgraph Topology</text>
        <text x="490" y="876" fill="#5a6580" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">Audience: Facility Officers &amp; IT Administrators</text>

        <!-- View 6C: Intelligence & Incident Center -->
        <rect x="648" y="808" width="296" height="76" rx="6" fill="#f5f5f5"/>
        <rect x="648" y="808" width="296" height="76" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1.2"/>
        <rect x="656" y="814" width="72" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="692" y="823" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">INCIDENT HUB</text>
        <text x="796" y="832" fill="#2d3142" font-size="12" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">C. Intelligence &amp; Incident Center</text>
        <text x="796" y="848" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Consequence Traversal &bull; 7-Engine Diagnostic Feed</text>
        <text x="796" y="862" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Ranked Recovery Plans &bull; Task Dispatch &amp; Tracking</text>
        <text x="796" y="876" fill="#5a6580" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">Audience: HODs, Coordinators, Incident Managers</text>

        <!-- View 6D: Student & Staff Reporting Portal -->
        <rect x="960" y="808" width="300" height="76" rx="6" fill="#f5f5f5"/>
        <rect x="960" y="808" width="300" height="76" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1.2"/>
        <rect x="968" y="814" width="76" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="1006" y="823" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">PUBLIC PORTAL</text>
        <text x="1110" y="832" fill="#2d3142" font-size="12" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">D. Student / Staff Reporting Portal</text>
        <text x="1110" y="848" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Submit Photo Proof &bull; Campus Location Picker</text>
        <text x="1110" y="862" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Track Own Report Ticket &bull; Status Push Updates</text>
        <text x="1110" y="876" fill="#bf4520" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">Scoped Access: Zero Management Visibility</text>

        <!-- ============================================================== -->
        <!-- LAYER 7 NODES: Security, Governance & Access Pillar            -->
        <!-- ============================================================== -->

        <!-- 7A: Identity & Authentication -->
        <rect x="1316" y="52" width="236" height="68" rx="6" fill="#f5f5f5"/>
        <rect x="1316" y="52" width="236" height="68" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1"/>
        <rect x="1324" y="58" width="48" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="1348" y="67" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">IDENTITY</text>
        <text x="1434" y="76" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Auth &amp; Identity Gateway</text>
        <text x="1434" y="90" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">OpenID Connect &bull; OAuth 2.0 &bull; JWT</text>
        <text x="1434" y="104" fill="#5a6580" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">Campus SSO &bull; Hardware mTLS for IoT</text>

        <!-- 7B: RBAC Hierarchy Matrix -->
        <rect x="1316" y="132" width="236" height="248" rx="6" fill="#f5f5f5"/>
        <rect x="1316" y="132" width="236" height="248" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1"/>
        <rect x="1324" y="138" width="60" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="1354" y="147" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">RBAC ROLES</text>
        <text x="1434" y="158" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Role-Based Access Control</text>

        <!-- Persona 1 -->
        <rect x="1324" y="172" width="220" height="28" rx="4" fill="rgba(45,49,66,0.03)" stroke="rgba(45,49,66,0.15)" stroke-width="0.8"/>
        <text x="1332" y="184" fill="#2d3142" font-size="8.5" font-weight="600" font-family="'Geist', sans-serif">1. Principal / Executive</text>
        <text x="1332" y="194" fill="#4f5d75" font-size="7.5" font-family="'Geist Mono', monospace">Full oversight &bull; Emergency sign-off</text>

        <!-- Persona 2 -->
        <rect x="1324" y="206" width="220" height="28" rx="4" fill="rgba(45,49,66,0.03)" stroke="rgba(45,49,66,0.15)" stroke-width="0.8"/>
        <text x="1332" y="218" fill="#2d3142" font-size="8.5" font-weight="600" font-family="'Geist', sans-serif">2. HOD / Academic Coordinator</text>
        <text x="1332" y="228" fill="#4f5d75" font-size="7.5" font-family="'Geist Mono', monospace">Dept timetable &bull; Room reallocation</text>

        <!-- Persona 3 -->
        <rect x="1324" y="240" width="220" height="28" rx="4" fill="rgba(45,49,66,0.03)" stroke="rgba(45,49,66,0.15)" stroke-width="0.8"/>
        <text x="1332" y="252" fill="#2d3142" font-size="8.5" font-weight="600" font-family="'Geist', sans-serif">3. Facility &amp; Infra Manager</text>
        <text x="1332" y="262" fill="#4f5d75" font-size="7.5" font-family="'Geist Mono', monospace">Repair dispatch &bull; Maintenance budget</text>

        <!-- Persona 4 -->
        <rect x="1324" y="274" width="220" height="28" rx="4" fill="rgba(45,49,66,0.03)" stroke="rgba(45,49,66,0.15)" stroke-width="0.8"/>
        <text x="1332" y="286" fill="#2d3142" font-size="8.5" font-weight="600" font-family="'Geist', sans-serif">4. IT Administrator</text>
        <text x="1332" y="296" fill="#4f5d75" font-size="7.5" font-family="'Geist Mono', monospace">Network topology &bull; Device security</text>

        <!-- Persona 5 -->
        <rect x="1324" y="308" width="220" height="28" rx="4" fill="rgba(45,49,66,0.03)" stroke="rgba(45,49,66,0.15)" stroke-width="0.8"/>
        <text x="1332" y="320" fill="#2d3142" font-size="8.5" font-weight="600" font-family="'Geist', sans-serif">5. Faculty &amp; Staff</text>
        <text x="1332" y="330" fill="#4f5d75" font-size="7.5" font-family="'Geist Mono', monospace">Classroom reports &bull; Schedule review</text>

        <!-- Persona 6 -->
        <rect x="1324" y="342" width="220" height="28" rx="4" fill="rgba(191,69,32,0.05)" stroke="rgba(191,69,32,0.3)" stroke-width="0.8"/>
        <text x="1332" y="354" fill="#bf4520" font-size="8.5" font-weight="600" font-family="'Geist', sans-serif">6. Student (Strictly Restricted)</text>
        <text x="1332" y="364" fill="#bf4520" font-size="7.5" font-family="'Geist Mono', monospace">Submit report &bull; Track own ticket only</text>

        <!-- 7C: Human Approval Gate -->
        <rect x="1316" y="394" width="236" height="92" rx="6" fill="#f5f5f5"/>
        <rect x="1316" y="394" width="236" height="92" rx="6" fill="rgba(46,90,168,0.06)" stroke="#2e5aa8" stroke-width="1.2"/>
        <rect x="1324" y="400" width="56" height="12" rx="2" fill="transparent" stroke="rgba(46,90,168,0.4)" stroke-width="0.8"/>
        <text x="1352" y="409" fill="#2e5aa8" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">GOVERNANCE</text>
        <text x="1434" y="420" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Human Approval Enforcement</text>
        <text x="1434" y="436" fill="#2e5aa8" font-size="8" font-weight="600" font-family="'Geist Mono', monospace" text-anchor="middle">NO Autonomous Actuation Allowed</text>
        <text x="1434" y="450" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">Physical repairs, room reallocations,</text>
        <text x="1434" y="462" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">and budget spends require digital sign-off</text>
        <text x="1434" y="476" fill="#5a6580" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle">Cryptographic signature verification</text>

        <!-- 7D: Immutable Audit Logging -->
        <rect x="1316" y="500" width="236" height="88" rx="6" fill="#f5f5f5"/>
        <rect x="1316" y="500" width="236" height="88" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1"/>
        <rect x="1324" y="506" width="52" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="1350" y="515" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">AUDIT LOG</text>
        <text x="1434" y="526" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Immutable Audit &amp; Lineage</text>
        <text x="1434" y="542" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Write-Once Audit Trails</text>
        <text x="1434" y="556" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Timestamped Decision Logs</text>
        <text x="1434" y="570" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Cryptographic Hash Chaining</text>
        <text x="1434" y="582" fill="#5a6580" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle">Complete Forensics &amp; Accountability</text>

        <!-- 7E: Privacy & Data Scoping -->
        <rect x="1316" y="602" width="236" height="88" rx="6" fill="#f5f5f5"/>
        <rect x="1316" y="602" width="236" height="88" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1"/>
        <rect x="1324" y="608" width="48" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="1348" y="617" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">PRIVACY</text>
        <text x="1434" y="628" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Privacy &amp; Data Scoping</text>
        <text x="1434" y="644" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Department Tenancy Isolation</text>
        <text x="1434" y="658" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Student PII Anonymization</text>
        <text x="1434" y="672" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Photo EXIF Location Scrubbing</text>
        <text x="1434" y="684" fill="#5a6580" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle">FERPA &amp; Institutional Compliance</text>

        <!-- 7F: Device Security -->
        <rect x="1316" y="704" width="236" height="76" rx="6" fill="#f5f5f5"/>
        <rect x="1316" y="704" width="236" height="76" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1"/>
        <rect x="1324" y="710" width="56" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="1352" y="719" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">DEVICE SEC</text>
        <text x="1434" y="730" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Device Security &amp; TLS</text>
        <text x="1434" y="746" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Hardware Certificates &bull; TLS 1.3</text>
        <text x="1434" y="760" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">&bull; Telemetry Tamper Detection</text>
        <text x="1434" y="772" fill="#5a6580" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle">Sensor Spoofing Defense</text>

        <!-- 7G: Governance Enforcement -->
        <rect x="1316" y="794" width="236" height="88" rx="6" fill="#f5f5f5"/>
        <rect x="1316" y="794" width="236" height="88" rx="6" fill="rgba(45,49,66,0.03)" stroke="#4f5d75" stroke-width="1"/>
        <rect x="1324" y="800" width="60" height="12" rx="2" fill="transparent" stroke="rgba(79,93,117,0.4)" stroke-width="0.8"/>
        <text x="1354" y="809" fill="#4f5d75" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">ENFORCE</text>
        <text x="1434" y="820" fill="#2d3142" font-size="11" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Active Cross-Layer Control</text>
        <text x="1434" y="836" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">Continuous policy verification across</text>
        <text x="1434" y="848" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">Layers 1 through 6. Intercepts any</text>
        <text x="1434" y="862" fill="#5a6580" font-size="7.5" font-family="'Geist Mono', monospace" text-anchor="middle">unauthorized query or payload</text>

        <!-- ============================================================== -->
        <!-- ZONE 8: TECHNOLOGY STACK MATRIX & DEPLOYMENT TOPOLOGY           -->
        <!-- ============================================================== -->

        <!-- Tech Block 1: Client & Presentation Tier -->
        <rect x="48" y="948" width="356" height="96" rx="6" fill="#f5f5f5"/>
        <rect x="48" y="948" width="356" height="96" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1"/>
        <rect x="56" y="954" width="72" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="92" y="963" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">FRONTEND TIER</text>
        <text x="226" y="972" fill="#2d3142" font-size="11.5" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Presentation &amp; UI Architecture</text>
        <text x="226" y="988" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Next.js 14 &bull; TypeScript &bull; Tailwind CSS</text>
        <text x="226" y="1002" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Interactive SVG Blueprint Engine &bull; Cytoscape.js</text>
        <text x="226" y="1016" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">ECharts / Recharts Telemetry Charts &bull; SSE / WebSocket</text>
        <text x="226" y="1030" fill="#5a6580" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">[MVP Core: Next.js + SVG + Cytoscape.js]</text>

        <!-- Tech Block 2: Backend Core & Optimization -->
        <rect x="420" y="948" width="360" height="96" rx="6" fill="#f5f5f5"/>
        <rect x="420" y="948" width="360" height="96" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1"/>
        <rect x="428" y="954" width="76" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="466" y="963" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">APPLICATION CORE</text>
        <text x="600" y="972" fill="#2d3142" font-size="11.5" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Backend &amp; Analytical Engines</text>
        <text x="600" y="988" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Python 3.12+ &bull; FastAPI &bull; Pydantic v2 Models</text>
        <text x="600" y="1002" fill="#bf4520" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Google OR-Tools CP-SAT (Constraint Solver)</text>
        <text x="600" y="1016" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">NetworkX (Graph Algorithms) &bull; SciPy &bull; NumPy</text>
        <text x="600" y="1030" fill="#5a6580" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">[MVP Core: FastAPI + Pydantic + NetworkX + OR-Tools]</text>

        <!-- Tech Block 3: Storage & State Persistence -->
        <rect x="796" y="948" width="360" height="96" rx="6" fill="#f5f5f5"/>
        <rect x="796" y="948" width="360" height="96" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1"/>
        <rect x="804" y="954" width="72" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="840" y="963" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">STATE &amp; DATA</text>
        <text x="976" y="972" fill="#2d3142" font-size="11.5" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Persistence &amp; Cache Infrastructure</text>
        <text x="976" y="988" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">PostgreSQL 16 (Core Relational &amp; Topological Schemas)</text>
        <text x="976" y="1002" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Redis 7 (Live State Cache, Pub/Sub, Fast Queues)</text>
        <text x="976" y="1016" fill="#bf4520" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">[Optional / Future: PostGIS 3.4 &amp; TimescaleDB]</text>
        <text x="976" y="1030" fill="#5a6580" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">[MVP Core: PostgreSQL 16 + Redis 7]</text>

        <!-- Tech Block 4: Messaging, IoT & Security -->
        <rect x="1172" y="948" width="376" height="96" rx="6" fill="#f5f5f5"/>
        <rect x="1172" y="948" width="376" height="96" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1"/>
        <rect x="1180" y="954" width="76" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
        <text x="1218" y="963" fill="#2d3142" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">INFRA &amp; SEC</text>
        <text x="1360" y="972" fill="#2d3142" font-size="11.5" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Messaging &amp; Security Protocols</text>
        <text x="1360" y="988" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">MQTT Broker (Mosquitto / EMQX) &bull; WebSockets</text>
        <text x="1360" y="1002" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">OpenID Connect &bull; OAuth 2.0 &bull; TLS 1.3</text>
        <text x="1360" y="1016" fill="#4f5d75" font-size="8.5" font-family="'Geist Mono', monospace" text-anchor="middle">Docker Containerized Services &bull; Structured JSON Logging</text>
        <text x="1360" y="1030" fill="#5a6580" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">[MVP Core: Mosquitto + WebSockets + Docker]</text>

        <!-- Master Diagram Legend Strip -->
        <rect x="48" y="1056" width="1500" height="48" rx="6" fill="#f5f5f5"/>
        <rect x="48" y="1056" width="1500" height="48" rx="6" fill="rgba(45,49,66,0.02)" stroke="rgba(45,49,66,0.15)" stroke-width="0.8"/>

        <!-- Legend Items -->
        <text x="64" y="1084" fill="#2d3142" font-size="9" font-weight="600" font-family="'Geist', sans-serif">FLOW LEGEND:</text>

        <line x1="160" y1="1080" x2="196" y2="1080" stroke="#4f5d75" stroke-width="1.4" marker-end="url(#arrow)"/>
        <text x="206" y="1084" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace">Primary Data Flow</text>

        <line x1="330" y1="1080" x2="366" y2="1080" stroke="#bf4520" stroke-width="1.4" marker-end="url(#arrow-accent)"/>
        <text x="376" y="1084" fill="#bf4520" font-size="8" font-family="'Geist Mono', monospace">Analytical &amp; Graph Core</text>

        <line x1="530" y1="1080" x2="566" y2="1080" stroke="#2e5aa8" stroke-width="1.4" marker-end="url(#arrow-link)"/>
        <text x="576" y="1084" fill="#2e5aa8" font-size="8" font-family="'Geist Mono', monospace">Approval / Control Flow</text>

        <line x1="730" y1="1080" x2="766" y2="1080" stroke="#4f5d75" stroke-width="1" stroke-dasharray="4,3" marker-end="url(#arrow)"/>
        <text x="776" y="1084" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace">Feedback / User Report</text>

        <line x1="930" y1="1080" x2="966" y2="1080" stroke="#bf4520" stroke-width="1.2" stroke-dasharray="4,3" marker-end="url(#arrow-accent)"/>
        <text x="976" y="1084" fill="#bf4520" font-size="8" font-family="'Geist Mono', monospace">Isolated Shadow Simulation</text>

        <line x1="1170" y1="1080" x2="1206" y2="1080" stroke="#5a6580" stroke-width="1" stroke-dasharray="2,3"/>
        <text x="1216" y="1084" fill="#5a6580" font-size="8" font-family="'Geist Mono', monospace">Security Boundary Enforcement</text>

        <!-- Implementation Badge -->
        <rect x="1396" y="1068" width="136" height="24" rx="4" fill="rgba(191,69,32,0.08)" stroke="#bf4520" stroke-width="0.8"/>
        <text x="1464" y="1084" fill="#bf4520" font-size="8" font-weight="600" font-family="'Geist Mono', monospace" text-anchor="middle">HACKATHON MVP CORE</text>

        <!-- Colophon Metadata -->
        <text x="52" y="1132" fill="#5a6580" font-size="8" font-family="'Geist Mono', monospace">OMNIS-X SYSTEM ARCHITECTURE v1.0 &bull; INSTITUTIONAL RESILIENCE &amp; DIGITAL TWIN PLATFORM &bull; CONFORMS TO IIT / IEEE SYSTEM ARCHITECTURE STANDARDS</text>

      </svg>
    </div>

    <!-- Editorial Summary Cards -->
    <div class="summary-grid">
      <div class="card">
        <p class="eyebrow">CLOSED-LOOP RESILIENCE</p>
        <div class="card-header">
          <span class="card-dot coral"></span>
          <h3>End-to-End Decision Lifecycle</h3>
        </div>
        <p>OMNIS-X transitions beyond passive monitoring by directly coupling multi-modal anomaly detection with constraint-satisfaction recovery optimization and human-in-the-loop task dispatch.</p>
        <ul>
          <li><strong>Detection &rarr; Resolution:</strong> 14-stage operational lifecycle from physical telemetry ingestion to verified work-order sign-off.</li>
          <li><strong>Deterministic Intelligence:</strong> Seven analytical engines operating via mathematical formulations (EWMA, BFS/DFS, FMEA, CP-SAT) rather than non-deterministic agent loops.</li>
          <li><strong>Multi-Objective Recovery:</strong> Google OR-Tools CP-SAT minimizes student instructional disruption, faculty timetable friction, and facility repair costs.</li>
        </ul>
      </div>

      <div class="card">
        <p class="eyebrow">GRAPH TWIN &amp; ISOLATION</p>
        <div class="card-header">
          <span class="card-dot ink"></span>
          <h3>Topological Digital Twin</h3>
        </div>
        <p>Integrates physical spatial mapping with dynamic operational dependencies, distinguishing physical containment from operational service impact.</p>
        <ul>
          <li><strong>Disentangled Dependencies:</strong> Physical containment (e.g., room location) separated from operational reliance (e.g., power feed, network uplink).</li>
          <li><strong>Shadow Simulation Guarantee:</strong> Hypothetical failure injections execute in memory-isolated sandbox states, guaranteeing real operational records are never overwritten.</li>
          <li><strong>Explicit Infeasibility Paths:</strong> When constraint conflicts cannot be solved, the engine generates mathematical conflict explanations and escalates to management.</li>
        </ul>
      </div>

      <div class="card">
        <p class="eyebrow">GOVERNANCE &amp; TENANCY</p>
        <div class="card-header">
          <span class="card-dot link"></span>
          <h3>Institutional Access &amp; Privacy</h3>
        </div>
        <p>Cross-cutting security pillar enforcing role-based permissions, department scoping, immutable audit logging, and strict human authorization gates.</p>
        <ul>
          <li><strong>Human-in-the-Loop Sign-off:</strong> High-risk reallocations, physical dispatches, and emergency budget approvals require explicit authenticated human approval.</li>
          <li><strong>Student Privacy &amp; Masking:</strong> Students submit geo-tagged incident photos and track self-submitted tickets with strict isolation from executive dashboards.</li>
          <li><strong>Tamper-Evident Auditing:</strong> Every automated recommendation, override, and sign-off is preserved in an immutable, cryptographically verifiable audit log.</li>
        </ul>
      </div>
    </div>

    <div class="footer">
      <span>OMNIS-X Architecture Specification &bull; Designed with Diagram-Design Editorial Engine</span>
      <span>PostgreSQL 16 &bull; Python FastAPI &bull; OR-Tools CP-SAT &bull; NetworkX &bull; Next.js 14</span>
    </div>
  </div>
</body>
</html>
'''
    return html

if __name__ == "__main__":
    out_dir = Path("OMNIS-X-Architecture")
    out_dir.mkdir(parents=True, exist_ok=True)
    html_content = generate_omnis_x_html()
    out_file = out_dir / "OMNIS-X_Master_Architecture.html"
    out_file.write_text(html_content, encoding="utf-8")
    print(f"Generated {out_file} ({len(html_content)} bytes)")
