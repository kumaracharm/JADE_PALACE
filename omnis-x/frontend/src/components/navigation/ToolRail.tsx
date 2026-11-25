"use client";

import React from "react";
import {
  Zap,
  Network,
  Thermometer,
  Calendar,
  AlertTriangle,
  Compass,
  Eye,
} from "lucide-react";
import { ActiveLayerId } from "@/types/digital-twin";

interface ToolRailProps {
  currentFloor: string;
  onSelectFloor: (floorId: string) => void;
  activeLayers: Set<ActiveLayerId>;
  onToggleLayer: (layerId: ActiveLayerId) => void;
}

export function ToolRail({
  currentFloor,
  onSelectFloor,
  activeLayers,
  onToggleLayer,
}: ToolRailProps) {
  const floors = [
    { id: "all", label: "ALL", full: "All Campus Levels" },
    { id: "FLOOR-3", label: "L3", full: "Level 3: Server Room & Rooftop Solar" },
    { id: "FLOOR-2", label: "L2", full: "Level 2: Classrooms & Auditorium" },
    { id: "FLOOR-1", label: "L1", full: "Level 1: Research Laboratories" },
    { id: "FLOOR-G", label: "G", full: "Ground: Utilities & Core MDF" },
  ];

  const layerButtons: { id: ActiveLayerId; label: string; icon: any; color: string }[] = [
    { id: "OPERATIONAL_STATUS", label: "Operational State", icon: Eye, color: "text-[#E6C45E]" },
    { id: "ELECTRICAL_GRID", label: "Electrical Feeds (Gold Grid)", icon: Zap, color: "text-[#F5D061]" },
    { id: "NETWORK_TOPOLOGY", label: "Data Network (Dusty Purple)", icon: Network, color: "text-[#BDB0D3]" },
    { id: "ENVIRONMENTAL_HEATMAP", label: "Thermal Heatmap", icon: Thermometer, color: "text-[#E05D5D]" },
    { id: "ACADEMIC_TIMETABLE", label: "Academic Timetable", icon: Calendar, color: "text-[#9D8EB5]" },
    { id: "INCIDENT_BLAST_RADIUS", label: "Incident Impact", icon: AlertTriangle, color: "text-[#E05D5D]" },
  ];

  return (
    <aside className="w-14 flex-shrink-0 bg-[#14151A] border-r border-[#252833] flex flex-col items-center py-3 select-none z-20 h-full min-h-0 overflow-y-auto">
      {/* Floor Selector Stack */}
      <div className="flex flex-col items-center space-y-1.5 pb-4 border-b border-[#252833] w-full px-2">
        <span className="text-[9px] font-mono text-[#9D8EB5] uppercase font-bold mb-1 tracking-wider">
          FLOOR
        </span>
        {floors.map((fl) => {
          const isActive = currentFloor === fl.id;
          return (
            <button
              key={fl.id}
              onClick={() => onSelectFloor(fl.id)}
              title={fl.full}
              className={`w-9 h-9 rounded-md flex items-center justify-center font-mono font-bold text-xs transition-all ${
                isActive
                  ? "bg-[#D4AF37] text-[#121316] shadow-lg shadow-[#D4AF37]/30 ring-1 ring-[#F5D061]"
                  : "bg-[#1E2028] text-[#9D8EB5] hover:text-[#E2E1E6] hover:bg-[#282536]"
              }`}
            >
              {fl.label}
            </button>
          );
        })}
      </div>

      {/* Spatial Intelligence Layer Toggles */}
      <div className="flex flex-col items-center space-y-2 pt-4 w-full px-2">
        <span className="text-[9px] font-mono text-[#9D8EB5] uppercase font-bold mb-1 tracking-wider">
          LAYERS
        </span>
        {layerButtons.map((btn) => {
          const Icon = btn.icon;
          const isActive = activeLayers.has(btn.id);
          return (
            <button
              key={btn.id}
              onClick={() => onToggleLayer(btn.id)}
              title={btn.label}
              className={`group relative w-9 h-9 rounded-md flex items-center justify-center transition-all ${
                isActive
                  ? "bg-[#272133] text-[#F0EDF5] border border-[#5E5073] shadow-md shadow-[#9D8EB5]/10"
                  : "bg-transparent text-[#767180] hover:text-[#BDB0D3] hover:bg-[#1E1C24]"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? btn.color : "text-[#8A8594] group-hover:text-[#BDB0D3]"}`} />
              
              {/* Active Indicator dot in Gold */}
              {isActive && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              )}

              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-[#1A1C23] border border-[#3A3D4B] text-[#E2E1E6] text-xs rounded shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 font-mono">
                {btn.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom spacer and compass */}
      <div className="mt-auto flex flex-col items-center pt-3 border-t border-[#252833] w-full">
        <div className="w-8 h-8 rounded-full bg-[#1A1C23] border border-[#2D303B] flex items-center justify-center text-[#D4AF37]">
          <Compass className="w-4 h-4 text-[#D4AF37]" />
        </div>
        <span className="text-[9px] font-mono text-[#9D8EB5] mt-1 font-bold">N</span>
      </div>
    </aside>
  );
}
