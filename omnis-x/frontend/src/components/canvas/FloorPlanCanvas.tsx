"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FloorPlanData,
  ActiveLayerId,
  CampusEntity,
} from "@/types/digital-twin";
import {
  ELECTRICAL_CIRCUITS_FLOOR_1,
  NETWORK_CIRCUITS_FLOOR_1,
  ACADEMIC_SCHEDULE_OVERLAYS,
} from "@/data/spatial-campus";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Zap,
  Activity,
  Cpu,
  Server,
  Layers,
  ShieldAlert,
} from "lucide-react";

interface FloorPlanCanvasProps {
  floorData: FloorPlanData;
  activeLayers: Set<ActiveLayerId>;
  selectedEntityId: string | null;
  onSelectEntity: (entityId: string) => void;
  entityMap: Map<string, CampusEntity>;
  incidentAffectedIds: Set<string>;
  simulationActive: boolean;
}

export function FloorPlanCanvas({
  floorData,
  activeLayers,
  selectedEntityId,
  onSelectEntity,
  entityMap,
  incidentAffectedIds,
  simulationActive,
}: FloorPlanCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & Zoom Transform State
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredEntityId, setHoveredEntityId] = useState<string | null>(null);

  // Fit to screen on floor change
  useEffect(() => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  }, [floorData.floorId]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.4), 4.0));
  };

  // Pan handlers with 1:1 coordinate drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scaleX = floorData.viewBox.width / (rect.width || floorData.viewBox.width);
      const scaleY = floorData.viewBox.height / (rect.height || floorData.viewBox.height);
      const viewScale = Math.max(scaleX, scaleY);

      const dx = (e.clientX - dragStart.x) * viewScale;
      const dy = (e.clientY - dragStart.y) * viewScale;
      setPan((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Controls
  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.2, 4.0));
  const handleZoomOut = () => setZoom((z) => Math.max(z * 0.8, 0.4));
  const handleReset = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Helper to format polygon point string
  const pointsToString = (pts: { x: number; y: number }[]) =>
    (pts || []).map((p) => `${p.x},${p.y}`).join(" ");

  // Status color resolver
  const getEntityStatus = (id: string) => {
    if (incidentAffectedIds.has(id)) return "FAILED";
    const ent = entityMap.get(id);
    return ent?.operational_status || "OPERATIONAL";
  };

  const getStatusFillColor = (status: string, isHovered: boolean, isSelected: boolean) => {
    if (isSelected) return "rgba(212, 175, 55, 0.22)"; // Warm gold wash
    if (isHovered) return "rgba(157, 142, 181, 0.18)"; // Dusty purple hover
    if (!activeLayers.has("OPERATIONAL_STATUS")) return "rgba(20, 21, 26, 0.75)";

    switch (status) {
      case "FAILED":
        return "rgba(224, 93, 93, 0.24)";
      case "DEGRADED":
        return "rgba(229, 168, 59, 0.22)";
      case "OPERATIONAL":
      default:
        return "rgba(157, 142, 181, 0.09)"; // Dusty purple architectural tint
    }
  };

  const getStatusStrokeColor = (status: string, isHovered: boolean, isSelected: boolean) => {
    if (isSelected) return "#D4AF37"; // Rich Gold outline
    if (isHovered) return "#BDB0D3"; // Light Dusty Purple
    if (!activeLayers.has("OPERATIONAL_STATUS")) return "#3A3D4B"; // Charcoal border

    switch (status) {
      case "FAILED":
        return "#E05D5D";
      case "DEGRADED":
        return "#E5A83B";
      case "OPERATIONAL":
      default:
        return "#74658B"; // Refined Dusty Purple outline
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 h-full w-full overflow-hidden cad-grid-pattern cursor-grab active:cursor-grabbing select-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Floating Canvas Action Controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-1.5 bg-[#14151A]/95 backdrop-blur border border-[#2D303B] p-1 rounded-lg shadow-2xl">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1.5 rounded hover:bg-[#252833] text-[#BDB0D3] hover:text-[#F5D061] transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1.5 rounded hover:bg-[#252833] text-[#BDB0D3] hover:text-[#F5D061] transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-[#2D303B] mx-1" />
        <button
          onClick={handleReset}
          title="Fit to View"
          className="p-1.5 rounded hover:bg-[#252833] text-[#BDB0D3] hover:text-[#F5D061] transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <span className="text-[10px] font-mono text-[#D4AF37] font-bold px-2">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Floating Layer Legend */}
      <div className="absolute top-4 right-4 z-10 hidden md:flex items-center space-x-3 bg-[#14151A]/95 backdrop-blur border border-[#2D303B] px-3.5 py-1.5 rounded-lg shadow-2xl text-xs font-mono">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#9D8EB5]/30 border border-[#9D8EB5]" />
          <span className="text-[#E2E1E6] text-[11px]">Dusty Purple (Nominal)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#D4AF37]/30 border border-[#D4AF37]" />
          <span className="text-[#F5D061] text-[11px]">Gold (Focus / Active)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#E05D5D]/30 border border-[#E05D5D]" />
          <span className="text-[#E05D5D] text-[11px]">Impact</span>
        </div>
      </div>

      {/* Simulation Active Hazard Banner in Gold + Charcoal */}
      {simulationActive && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded bg-[#2D2310] border border-[#D4AF37] backdrop-blur shadow-2xl flex items-center space-x-2 text-[#F5D061]">
          <ShieldAlert className="w-4 h-4 animate-bounce text-[#D4AF37]" />
          <span className="text-xs font-mono font-bold tracking-wide">
            COUNTERFACTUAL CHAOS EXPERIMENT ACTIVE • SHADOW TWIN ISOLATED
          </span>
        </div>
      )}

      {/* SVG Spatial Render Canvas */}
      <svg
        className="w-full h-full block"
        viewBox={`0 0 ${floorData.viewBox.width} ${floorData.viewBox.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Radial Gradients for Thermal Heatmap Layer in Gold + Dusty Purple */}
          <radialGradient id="heat-gold-purple" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#9D8EB5" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#14151A" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heat-cold-purple" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#BDB0D3" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#5E5073" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#14151A" stopOpacity="0" />
          </radialGradient>

          {/* Charcoal Grid Pattern */}
          <pattern id="small-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(45, 48, 59, 0.4)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* CAD Grid Canvas Floor background */}
        <rect width="100%" height="100%" fill="url(#small-grid)" />

        {/* Dynamic Zoom & Pan Spatial Canvas Viewport */}
        <g
          transform={`translate(${pan.x}, ${pan.y}) translate(600, 400) scale(${zoom}) translate(-600, -400)`}
          style={{
            transition: isDragging ? "none" : "transform 0.08s ease-out",
          }}
        >
        {/* 1. ROOM POLYGONS */}
        <g id="layer-rooms">
          {floorData.rooms.map((room) => {
            const isSelected = selectedEntityId === room.entityId;
            const isHovered = hoveredEntityId === room.entityId;
            const status = getEntityStatus(room.entityId);
            const isImpacted = incidentAffectedIds.has(room.entityId);

            return (
              <g
                key={room.entityId}
                className="cursor-pointer transition-all duration-150"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectEntity(room.entityId);
                }}
                onMouseEnter={() => setHoveredEntityId(room.entityId)}
                onMouseLeave={() => setHoveredEntityId(null)}
              >
                {/* Room Geometry Polygon */}
                <polygon
                  points={pointsToString(room.polygon)}
                  fill={getStatusFillColor(status, isHovered, isSelected)}
                  stroke={getStatusStrokeColor(status, isHovered, isSelected)}
                  strokeWidth={isSelected ? 3 : isHovered ? 2 : 1.5}
                  strokeDasharray={isImpacted ? "4 2" : "none"}
                />

                {/* Pulsing Impact Ring in Gold/Coral if affected */}
                {isImpacted && (
                  <circle
                    cx={room.labelPosition.x}
                    cy={room.labelPosition.y}
                    r="40"
                    fill="none"
                    stroke="#E05D5D"
                    strokeWidth="2"
                    className="animate-ping opacity-60"
                  />
                )}

                {/* Architectural Room Tag & Label */}
                <g transform={`translate(${room.labelPosition.x}, ${room.labelPosition.y})`}>
                  {/* Category Pill in Charcoal & Dusty Purple */}
                  <rect
                    x="-45"
                    y="-30"
                    width="90"
                    height="18"
                    rx="4"
                    fill="#181920"
                    stroke="#383046"
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="-18"
                    textAnchor="middle"
                    fill="#D4AF37"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    ROOM {room.code}
                  </text>

                  {/* Room Name */}
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    fill={isSelected ? "#F5D061" : "#E2E1E6"}
                    fontSize="11"
                    fontWeight="600"
                    className="select-none pointer-events-none"
                  >
                    {room.name.length > 26 ? room.name.substring(0, 24) + "..." : room.name}
                  </text>

                  {/* Operational Status Pill */}
                  <text
                    x="0"
                    y="18"
                    textAnchor="middle"
                    fill={
                      status === "FAILED"
                        ? "#E05D5D"
                        : status === "DEGRADED"
                        ? "#E5A83B"
                        : "#9D8EB5"
                    }
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    ● {status}
                  </text>
                </g>

                {/* Door Opening Arcs in Dusty Purple */}
                {room.doors?.map((door, idx) => (
                  <g key={`door-${idx}`} transform={`translate(${door.x}, ${door.y}) rotate(${door.angle})`}>
                    <line x1="0" y1="0" x2={door.width} y2="0" stroke="#74658B" strokeWidth="2" />
                    <path
                      d={`M ${door.width} 0 A ${door.width} ${door.width} 0 0 1 0 ${door.width}`}
                      fill="none"
                      stroke="#5E5073"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  </g>
                ))}
              </g>
            );
          })}
        </g>

        {/* 2. ARCHITECTURAL WALLS in Charcoal & Slate */}
        <g id="layer-walls">
          {floorData.walls.map((w) => (
            <line
              key={w.id}
              x1={w.points[0].x}
              y1={w.points[0].y}
              x2={w.points[1].x}
              y2={w.points[1].y}
              stroke={w.type === "EXTERIOR" ? "#3D404E" : "#252733"}
              strokeWidth={w.thickness}
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* 3. THERMAL / ENVIRONMENTAL HEATMAP LAYER in Gold + Dusty Purple */}
        {activeLayers.has("ENVIRONMENTAL_HEATMAP") && (
          <g id="layer-environmental-heatmap" pointerEvents="none">
            {/* Lab 01 EE Thermal dissipation in Gold */}
            <circle cx="240" cy="220" r="140" fill="url(#heat-gold-purple)" />
            {/* Lab 02 Robotics in Dusty Purple */}
            <circle cx="960" cy="220" r="150" fill="url(#heat-cold-purple)" />
            {/* Legend / Reading tags */}
            <text x="240" y="270" textAnchor="middle" fill="#F5D061" fontSize="10" fontFamily="monospace" fontWeight="bold">
              24.1°C (Warm Load)
            </text>
            <text x="960" y="270" textAnchor="middle" fill="#BDB0D3" fontSize="10" fontFamily="monospace" fontWeight="bold">
              21.5°C (CRAC Optimal)
            </text>
          </g>
        )}

        {/* 4. ELECTRICAL DISTRIBUTION GRID LAYER in Radiant GOLD */}
        {activeLayers.has("ELECTRICAL_GRID") && floorData.floorId === "FLOOR-1" && (
          <g id="layer-electrical-grid" pointerEvents="none">
            {ELECTRICAL_CIRCUITS_FLOOR_1.map((c) => (
              <g key={c.id}>
                {/* Gold Glow underlay */}
                <line
                  x1={c.from.x}
                  y1={c.from.y}
                  x2={c.to.x}
                  y2={c.to.y}
                  stroke="#D4AF37"
                  strokeWidth="4"
                  strokeOpacity="0.25"
                />
                {/* Animated Gold dash flow line */}
                <line
                  x1={c.from.x}
                  y1={c.from.y}
                  x2={c.to.x}
                  y2={c.to.y}
                  stroke="#F5D061"
                  strokeWidth="2"
                  className="animate-energy-flow"
                />
              </g>
            ))}
          </g>
        )}

        {/* 5. DATA NETWORK TOPOLOGY LAYER in DUSTY PURPLE */}
        {activeLayers.has("NETWORK_TOPOLOGY") && floorData.floorId === "FLOOR-1" && (
          <g id="layer-network-topology" pointerEvents="none">
            {NETWORK_CIRCUITS_FLOOR_1.map((n) => (
              <g key={n.id}>
                <line
                  x1={n.from.x}
                  y1={n.from.y}
                  x2={n.to.x}
                  y2={n.to.y}
                  stroke="#9D8EB5"
                  strokeWidth="3"
                  strokeOpacity="0.3"
                />
                <line
                  x1={n.from.x}
                  y1={n.from.y}
                  x2={n.to.x}
                  y2={n.to.y}
                  stroke="#BDB0D3"
                  strokeWidth="1.5"
                  className="animate-data-flow"
                />
              </g>
            ))}
          </g>
        )}

        {/* 6. ACADEMIC TIMETABLE OVERLAY in Gold & Dusty Purple */}
        {activeLayers.has("ACADEMIC_TIMETABLE") && (
          <g id="layer-academic-timetable" pointerEvents="none">
            {ACADEMIC_SCHEDULE_OVERLAYS.map((act) => {
              const targetRoom = floorData.rooms.find((r) => r.entityId === act.roomId);
              if (!targetRoom) return null;

              return (
                <g
                  key={act.activityId}
                  transform={`translate(${targetRoom.labelPosition.x - 70}, ${targetRoom.labelPosition.y + 35})`}
                >
                  <rect
                    width="140"
                    height="42"
                    rx="5"
                    fill="#15161C"
                    stroke="#D4AF37"
                    strokeWidth="1.5"
                    fillOpacity="0.96"
                  />
                  <text x="8" y="14" fill="#F5D061" fontSize="9.5" fontWeight="bold">
                    {act.courseCode} • {act.section}
                  </text>
                  <text x="8" y="26" fill="#E2E1E6" fontSize="8.5">
                    {act.faculty}
                  </text>
                  <text x="8" y="37" fill="#9D8EB5" fontSize="8" fontFamily="monospace">
                    {act.timeSlot} ({act.enrolled} std)
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* 7. EQUIPMENT & ASSET MARKERS */}
        <g id="layer-equipment">
          {floorData.equipment.map((eq) => {
            const isSelected = selectedEntityId === eq.entityId;
            const isHovered = hoveredEntityId === eq.entityId;
            const status = getEntityStatus(eq.entityId);
            const isImpacted = incidentAffectedIds.has(eq.entityId);

            return (
              <g
                key={eq.entityId}
                transform={`translate(${eq.x}, ${eq.y})`}
                className="cursor-pointer transition-transform duration-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectEntity(eq.entityId);
                }}
                onMouseEnter={() => setHoveredEntityId(eq.entityId)}
                onMouseLeave={() => setHoveredEntityId(null)}
              >
                {/* Marker outer ring in Charcoal & Gold */}
                <circle
                  r={isSelected ? 16 : 13}
                  fill="#181922"
                  stroke={getStatusStrokeColor(status, isHovered, isSelected)}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  className="shadow-xl"
                />

                {/* Inner Icon in Gold / Dusty Purple */}
                {eq.type === "FEEDER" && <Zap x={-7} y={-7} width={14} height={14} className="text-[#F5D061]" />}
                {eq.type === "POWER_METER" && <Activity x={-7} y={-7} width={14} height={14} className="text-[#D4AF37]" />}
                {eq.type === "GPU_CLUSTER" && <Cpu x={-7} y={-7} width={14} height={14} className="text-[#BDB0D3]" />}
                {eq.type.includes("SWITCH") && <Server x={-7} y={-7} width={14} height={14} className="text-[#9D8EB5]" />}
                {eq.type === "UPS" && <Zap x={-7} y={-7} width={14} height={14} className="text-[#D4AF37]" />}
                {eq.type === "WORKSTATION" && <Cpu x={-7} y={-7} width={14} height={14} className="text-[#E2E1E6]" />}
                {eq.type === "PROJECTOR" && <Layers x={-7} y={-7} width={14} height={14} className="text-[#BDB0D3]" />}

                {/* Pulsing alert ring if failed/impacted */}
                {isImpacted && (
                  <circle r="18" fill="none" stroke="#E05D5D" strokeWidth="2" className="animate-ping" />
                )}

                {/* Asset Name Label */}
                <text
                  x="0"
                  y="24"
                  textAnchor="middle"
                  fill={isSelected ? "#F5D061" : "#BDB0D3"}
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {eq.entityId}
                </text>

                {/* Metric pill */}
                {eq.primaryMetric && (
                  <text
                    x="0"
                    y="34"
                    textAnchor="middle"
                    fill="#D4AF37"
                    fontSize="7.5"
                    fontFamily="monospace"
                  >
                    {eq.primaryMetric.value} {eq.primaryMetric.unit}
                  </text>
                )}
              </g>
            );
          })}
        </g>
        </g>
      </svg>
    </div>
  );
}
