"use client";

import React from "react";
import { Zap, Layers, AlertTriangle, GraduationCap, Sparkles, Users, ShieldAlert } from "lucide-react";

export interface ExplodedStackEngineInfo {
  number: number;
  name: string;
  shortLabel: string;
  outputPreview: string;
  status: "NORMAL" | "WARNING" | "CRITICAL" | "ACTIVE";
  icon: React.ReactNode;
}

interface ExplodedAxonometricStackProps {
  activeEngine: number;
  onSelectEngine: (engineNum: number) => void;
  analysisResult: any;
  approvalStatus: string | null;
  liveVoltage?: number;
}

export function ExplodedAxonometricStack({
  activeEngine,
  onSelectEngine,
  analysisResult,
  approvalStatus,
  liveVoltage = 415.0,
}: ExplodedAxonometricStackProps) {
  const engines: ExplodedStackEngineInfo[] = [
    {
      number: 7,
      name: "Human Approval Gate & Work Order Dispatch",
      shortLabel: "E7: Gate & Dispatch",
      outputPreview: approvalStatus === "APPROVED" ? "APPROVED & DISPATCHED" : "AWAITING SIGNOFF",
      status: approvalStatus === "APPROVED" ? "NORMAL" : "ACTIVE",
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
    },
    {
      number: 6,
      name: "RACI Responsibility Assignment",
      shortLabel: "E6: RACI Governance",
      outputPreview: analysisResult?.engine6_raci?.responsible ? "CREW TRIAGED" : "UNASSIGNED",
      status: "NORMAL",
      icon: <Users className="w-3.5 h-3.5" />,
    },
    {
      number: 5,
      name: "Google OR-Tools CP-SAT Optimizer",
      shortLabel: "E5: OR-Tools Solver",
      outputPreview: "3 PARETO ALTERNATIVES",
      status: "ACTIVE",
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
    {
      number: 4,
      name: "Academic Impact & Timetable Conflict",
      shortLabel: "E4: Academic Impact",
      outputPreview: `${analysisResult?.engine4_academic?.displaced_students || 95} DISPLACED`,
      status: "WARNING",
      icon: <GraduationCap className="w-3.5 h-3.5" />,
    },
    {
      number: 3,
      name: "FMEA Quantitative Risk Matrix",
      shortLabel: "E3: FMEA Risk",
      outputPreview: `RPN ${analysisResult?.engine3_fmea?.rpn_score || 96} CRITICAL`,
      status: "CRITICAL",
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
    {
      number: 2,
      name: "Blast-Radius Graph Traversal",
      shortLabel: "E2: Blast Radius",
      outputPreview: `${analysisResult?.engine2_propagation?.blast_radius_count || 5} ASSETS CUT`,
      status: "CRITICAL",
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    {
      number: 1,
      name: "Multi-Physics Anomaly Detection",
      shortLabel: "E1: EWMA Detection",
      outputPreview: `${liveVoltage.toFixed(1)}V INGEST (99%)`,
      status: liveVoltage < 250 ? "CRITICAL" : "NORMAL",
      icon: <Zap className="w-3.5 h-3.5" />,
    },
  ];

  // SVG Dimension Constants
  const svgWidth = 520;
  const svgHeight = 600;
  const cx = 135; // Slab X center
  const slabW = 80; // Half width (x radius)
  const slabD = 26; // Half depth (y radius)
  const slabT = 14; // Thickness

  // Y positions for each layer from top (E7) to bottom (E1)
  const layerY = [
    75,  // E7 (index 0)
    150, // E6 (index 1)
    225, // E5 (index 2)
    300, // E4 (index 3)
    375, // E3 (index 4)
    450, // E2 (index 5)
    525, // E1 (index 6)
  ];

  return (
    <div className="w-full h-full flex flex-col p-4 rounded-xl bg-[#12131A] border border-[#252838] shadow-2xl font-mono select-none">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#252838]">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
          <h3 className="text-xs font-bold uppercase text-white tracking-wider">
            7-Engine Axonometric Intelligence Stack
          </h3>
        </div>
        <span className="text-[10px] text-[#8A8594]">
          Active: <strong className="text-[#F5D061]">Engine {activeEngine}</strong>
        </span>
      </div>

      <div className="relative flex-1 w-full min-h-[560px] flex items-center justify-center overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full max-h-[590px]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Active Gold Glowing Gradient for Selected Slab Top */}
            <linearGradient id="activeSlabTop" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4A3B18" />
              <stop offset="50%" stopColor="#302611" />
              <stop offset="100%" stopColor="#211A0D" />
            </linearGradient>
            <linearGradient id="defaultSlabTop" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1E222D" />
              <stop offset="100%" stopColor="#151720" />
            </linearGradient>
            {/* Subtle glow filter */}
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#D4AF37" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* Dotted Vertical Alignment Trace Lines running through the 4 corners */}
          <line
            x1={cx}
            y1={layerY[0] - slabD}
            x2={cx}
            y2={layerY[6] + slabD + slabT}
            stroke="#383D4E"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          <line
            x1={cx - slabW}
            y1={layerY[0]}
            x2={cx - slabW}
            y2={layerY[6] + slabT}
            stroke="#383D4E"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          <line
            x1={cx + slabW}
            y1={layerY[0]}
            x2={cx + slabW}
            y2={layerY[6] + slabT}
            stroke="#383D4E"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          <line
            x1={cx}
            y1={layerY[0] + slabD}
            x2={cx}
            y2={layerY[6] + slabD + slabT}
            stroke="#383D4E"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.6"
          />

          {/* Render 7 Slabs from bottom to top so paint order is natural */}
          {engines.slice().reverse().map((eng, revIdx) => {
            const idx = 6 - revIdx; // Map to original index (0 = E7 at top, 6 = E1 at bottom)
            const cy = layerY[idx];
            const isSelected = activeEngine === eng.number;

            // 4 Projected Top Face Points
            const topP = [
              `${cx},${cy - slabD}`,       // Back
              `${cx + slabW},${cy}`,        // Right
              `${cx},${cy + slabD}`,        // Front
              `${cx - slabW},${cy}`,        // Left
            ].join(" ");

            // Left Face Polygon Points
            const leftP = [
              `${cx - slabW},${cy}`,
              `${cx},${cy + slabD}`,
              `${cx},${cy + slabD + slabT}`,
              `${cx - slabW},${cy + slabT}`,
            ].join(" ");

            // Right Face Polygon Points
            const rightP = [
              `${cx},${cy + slabD}`,
              `${cx + slabW},${cy}`,
              `${cx + slabW},${cy + slabT}`,
              `${cx},${cy + slabD + slabT}`,
            ].join(" ");

            const leaderStartX = cx + slabW;
            const leaderStartY = cy + slabT / 2;
            const leaderEndX = 255;
            const badgeX = 265;

            return (
              <g
                key={eng.number}
                className="cursor-pointer transition-all duration-300"
                onClick={() => onSelectEngine(eng.number)}
              >
                {/* Horizontal Leader Line */}
                <circle
                  cx={leaderStartX}
                  cy={leaderStartY}
                  r={isSelected ? "3.5" : "2.5"}
                  fill={isSelected ? "#F5D061" : "#5A6075"}
                />
                <line
                  x1={leaderStartX + 2}
                  y1={leaderStartY}
                  x2={leaderEndX}
                  y2={leaderStartY}
                  stroke={isSelected ? "#D4AF37" : "#383E52"}
                  strokeWidth={isSelected ? 1.8 : 1}
                  strokeDasharray={isSelected ? undefined : "3 2"}
                />

                {/* Right-Hand Horizontal Callout Badge */}
                <g transform={`translate(${badgeX}, ${cy - 16})`}>
                  <rect
                    width="235"
                    height="36"
                    rx="6"
                    fill={isSelected ? "#211D15" : "#14161F"}
                    stroke={isSelected ? "#D4AF37" : "#282C3C"}
                    strokeWidth={isSelected ? 1.6 : 1}
                    className="transition-all"
                  />
                  <text
                    x="10"
                    y="15"
                    fill={isSelected ? "#F5D061" : "#E2E1E6"}
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {eng.shortLabel}
                  </text>
                  <text
                    x="10"
                    y="28"
                    fill={isSelected ? "#D4AF37" : "#8A8594"}
                    fontSize="8.5"
                    fontWeight="500"
                  >
                    {eng.outputPreview}
                  </text>

                  {/* Status Indicator Pill */}
                  <rect
                    x="165"
                    y="10"
                    width="60"
                    height="16"
                    rx="3"
                    fill={
                      eng.status === "CRITICAL"
                        ? "rgba(239, 68, 68, 0.2)"
                        : eng.status === "WARNING"
                        ? "rgba(245, 158, 11, 0.2)"
                        : isSelected
                        ? "rgba(212, 175, 55, 0.25)"
                        : "rgba(16, 185, 129, 0.15)"
                    }
                    stroke={
                      eng.status === "CRITICAL"
                        ? "#EF4444"
                        : eng.status === "WARNING"
                        ? "#F59E0B"
                        : isSelected
                        ? "#D4AF37"
                        : "#10B981"
                    }
                    strokeWidth="0.8"
                  />
                  <text
                    x="195"
                    y="21"
                    textAnchor="middle"
                    fill={
                      eng.status === "CRITICAL"
                        ? "#EF4444"
                        : eng.status === "WARNING"
                        ? "#F59E0B"
                        : isSelected
                        ? "#F5D061"
                        : "#10B981"
                    }
                    fontSize="7.5"
                    fontWeight="bold"
                  >
                    {isSelected ? "ACTIVE" : eng.status}
                  </text>
                </g>

                {/* Left Face (Lit Side) */}
                <polygon
                  points={leftP}
                  fill={isSelected ? "#332612" : "#13161E"}
                  stroke={isSelected ? "#D4AF37" : "#282C3C"}
                  strokeWidth={isSelected ? 1.4 : 0.8}
                />

                {/* Right Face (Shade Side) */}
                <polygon
                  points={rightP}
                  fill={isSelected ? "#241B0D" : "#0D0F16"}
                  stroke={isSelected ? "#D4AF37" : "#282C3C"}
                  strokeWidth={isSelected ? 1.4 : 0.8}
                />

                {/* Top Face (Main Visible Surface) */}
                <polygon
                  points={topP}
                  fill={isSelected ? "url(#activeSlabTop)" : "url(#defaultSlabTop)"}
                  stroke={isSelected ? "#D4AF37" : "#323748"}
                  strokeWidth={isSelected ? 2 : 1}
                  filter={isSelected ? "url(#goldGlow)" : undefined}
                />

                {/* Slab Center Label (Engine Number & Glyph) */}
                <text
                  x={cx}
                  y={cy + 3}
                  textAnchor="middle"
                  fill={isSelected ? "#F5D061" : "#A69FB1"}
                  fontSize="10"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  ENGINE {eng.number}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="pt-2 border-t border-[#252838] flex items-center justify-between text-[10px] text-[#8A8594]">
        <span>Single Vertical Axis Projection (2:1 Dimetric)</span>
        <span className="text-[#D4AF37] font-bold">Interactive • Click Slab to Inspect</span>
      </div>
    </div>
  );
}
