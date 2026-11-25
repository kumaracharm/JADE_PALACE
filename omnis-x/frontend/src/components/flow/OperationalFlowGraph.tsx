"use client";

import React, { useState } from "react";
import { Zap, Server, Activity, Shield, AlertTriangle, ArrowRight } from "lucide-react";
import { CampusEntity } from "@/types/digital-twin";

interface FlowNode {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  status: "NORMAL" | "WARNING" | "CRITICAL";
  metric: string;
  value: string;
}

interface FlowEdge {
  from: string;
  to: string;
  type: "ELECTRICAL" | "NETWORK";
  status: "ACTIVE" | "DEGRADED" | "SEVERED";
}

interface OperationalFlowGraphProps {
  onSelectEntity?: (entityId: string) => void;
  selectedEntityId?: string | null;
  incidentEntityId?: string | null;
}

export function OperationalFlowGraph({
  onSelectEntity,
  selectedEntityId,
  incidentEntityId,
}: OperationalFlowGraphProps) {
  // Real registered institutional topology
  const nodes: FlowNode[] = [
    {
      id: "GEN-500KVA",
      name: "Diesel Standby Gen",
      type: "GENERATOR",
      x: 70,
      y: 70,
      status: "NORMAL",
      metric: "Output Voltage",
      value: "415 V",
    },
    {
      id: "SUBSTATION-01",
      name: "11kV Substation",
      type: "SUBSTATION",
      x: 70,
      y: 200,
      status: incidentEntityId === "SUBSTATION-01" ? "CRITICAL" : "NORMAL",
      metric: "Load Capacity",
      value: "145 kW",
    },
    {
      id: "ATS-01",
      name: "Auto Transfer Switch",
      type: "PANEL",
      x: 240,
      y: 135,
      status: "NORMAL",
      metric: "Switch Position",
      value: "MAINS PRI",
    },
    {
      id: "PANEL-ENG-MAIN",
      name: "Main Dist. Panel",
      type: "PANEL",
      x: 420,
      y: 135,
      status: "NORMAL",
      metric: "Current Draw",
      value: "320 A",
    },
    {
      id: "FEEDER-LABS-F1",
      name: "Feeder Riser 1",
      type: "FEEDER",
      x: 600,
      y: 90,
      status: incidentEntityId ? "CRITICAL" : "NORMAL",
      metric: "Line Status",
      value: incidentEntityId ? "TRIPPED" : "ENERGIZED",
    },
    {
      id: "SRV-01",
      name: "Data Center MDF",
      type: "NETWORK",
      x: 600,
      y: 210,
      status: "NORMAL",
      metric: "Uplink Latency",
      value: "1.2 ms",
    },
    {
      id: "CR-101",
      name: "Classroom 101",
      type: "ROOM",
      x: 790,
      y: 60,
      status: incidentEntityId ? "CRITICAL" : "NORMAL",
      metric: "Occupancy / Class",
      value: "42 students",
    },
    {
      id: "LAB-01-EE",
      name: "Electronics Lab 101",
      type: "ROOM",
      x: 790,
      y: 140,
      status: incidentEntityId ? "WARNING" : "NORMAL",
      metric: "Testbed Power",
      value: incidentEntityId ? "AUXILIARY" : "38 kW",
    },
    {
      id: "CR-201",
      name: "Classroom 201 (Alt)",
      type: "ROOM",
      x: 790,
      y: 220,
      status: "NORMAL",
      metric: "Available Roster",
      value: "VACANT / FREE",
    },
  ];

  const edges: FlowEdge[] = [
    { from: "GEN-500KVA", to: "ATS-01", type: "ELECTRICAL", status: "ACTIVE" },
    { from: "SUBSTATION-01", to: "ATS-01", type: "ELECTRICAL", status: incidentEntityId === "SUBSTATION-01" ? "SEVERED" : "ACTIVE" },
    { from: "ATS-01", to: "PANEL-ENG-MAIN", type: "ELECTRICAL", status: "ACTIVE" },
    { from: "PANEL-ENG-MAIN", to: "FEEDER-LABS-F1", type: "ELECTRICAL", status: incidentEntityId ? "SEVERED" : "ACTIVE" },
    { from: "PANEL-ENG-MAIN", to: "SRV-01", type: "ELECTRICAL", status: "ACTIVE" },
    { from: "FEEDER-LABS-F1", to: "CR-101", type: "ELECTRICAL", status: incidentEntityId ? "SEVERED" : "ACTIVE" },
    { from: "FEEDER-LABS-F1", to: "LAB-01-EE", type: "ELECTRICAL", status: incidentEntityId ? "DEGRADED" : "ACTIVE" },
    { from: "SRV-01", to: "CR-101", type: "NETWORK", status: "ACTIVE" },
    { from: "SRV-01", to: "LAB-01-EE", type: "NETWORK", status: "ACTIVE" },
  ];

  const getNode = (id: string) => nodes.find((n) => n.id === id);

  return (
    <div className="w-full bg-[#0D121F] border border-[#1E293B] rounded-xl p-4 font-mono select-none">
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-[#38BDF8]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Operational Dependency & Energy Flow Topology
          </h3>
        </div>
        <div className="flex items-center space-x-4 text-[10px]">
          <span className="flex items-center space-x-1.5 text-[#94A3B8]">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Normal</span>
          </span>
          <span className="flex items-center space-x-1.5 text-[#94A3B8]">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Warning</span>
          </span>
          <span className="flex items-center space-x-1.5 text-[#94A3B8]">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>Severed / Fault</span>
          </span>
        </div>
      </div>

      {/* SVG Canvas for Flow Graph */}
      <div className="relative w-full h-72 overflow-x-auto">
        <svg className="w-[900px] h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Edge Connection Lines */}
          {edges.map((e, idx) => {
            const fromNode = getNode(e.from);
            const toNode = getNode(e.to);
            if (!fromNode || !toNode) return null;

            const isSevered = e.status === "SEVERED";
            const isDegraded = e.status === "DEGRADED";

            const strokeColor = isSevered
              ? "#EF4444"
              : isDegraded
              ? "#F59E0B"
              : e.type === "ELECTRICAL"
              ? "#10B981"
              : "#38BDF8";

            return (
              <g key={idx}>
                <line
                  x1={fromNode.x + 50}
                  y1={fromNode.y + 20}
                  x2={toNode.x}
                  y2={toNode.y + 20}
                  stroke={strokeColor}
                  strokeWidth={isSevered ? 1.5 : 2}
                  strokeDasharray={isSevered ? "4 4" : undefined}
                  opacity={isSevered ? 0.6 : 0.8}
                />
                {!isSevered && (
                  <circle
                    r="2.5"
                    fill={strokeColor}
                    className="animate-pulse"
                  >
                    <animateMotion
                      path={`M ${fromNode.x + 50} ${fromNode.y + 20} L ${toNode.x} ${toNode.y + 20}`}
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Node Elements */}
          {nodes.map((n) => {
            const isSelected = selectedEntityId === n.id;
            const isCritical = n.status === "CRITICAL";
            const isWarning = n.status === "WARNING";

            const borderColor = isCritical
              ? "#EF4444"
              : isWarning
              ? "#F59E0B"
              : isSelected
              ? "#D4AF37"
              : "#334155";

            const statusBg = isCritical
              ? "rgba(239, 68, 68, 0.15)"
              : isWarning
              ? "rgba(245, 158, 11, 0.15)"
              : "rgba(15, 23, 42, 0.85)";

            return (
              <g
                key={n.id}
                transform={`translate(${n.x}, ${n.y})`}
                onClick={() => onSelectEntity && onSelectEntity(n.id)}
                className="cursor-pointer transition-transform hover:scale-105"
              >
                {/* Node Box */}
                <rect
                  width="130"
                  height="44"
                  rx="6"
                  fill={statusBg}
                  stroke={borderColor}
                  strokeWidth={isSelected || isCritical ? 2 : 1}
                />
                {/* Node Header */}
                <text
                  x="8"
                  y="16"
                  fill="#F8FAFC"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {n.name}
                </text>
                {/* Node Metric */}
                <text
                  x="8"
                  y="32"
                  fill="#94A3B8"
                  fontSize="9"
                >
                  {n.metric}:{" "}
                  <tspan fill={isCritical ? "#EF4444" : isWarning ? "#F59E0B" : "#10B981"}>
                    {n.value}
                  </tspan>
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
