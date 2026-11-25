"use client";

import React, { useState } from "react";
import {
  Search,
  Building,
  ChevronRight,
  User,
  FlaskConical,
  X,
  Compass,
  Film,
} from "lucide-react";
import { CampusEntity } from "@/types/digital-twin";

interface TopNavProps {
  currentFloor: string;
  onSelectFloor: (floorId: string) => void;
  simulationActive: boolean;
  onToggleSimulation: () => void;
  allEntities: CampusEntity[];
  onSelectEntity: (entityId: string) => void;
  activeView: "FLOORPLAN" | "CAMPUS_3D" | "GRAPH";
  onToggleView: (view: "FLOORPLAN" | "CAMPUS_3D" | "GRAPH") => void;
  onReplayIntro?: () => void;
}

export function TopNav({
  currentFloor,
  onSelectFloor,
  simulationActive,
  onToggleSimulation,
  allEntities,
  onSelectEntity,
  activeView,
  onToggleView,
  onReplayIntro,
}: TopNavProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Filter entities by search query
  const searchResults = searchQuery.trim()
    ? (allEntities || []).filter(
        (e) =>
          e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.entity_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.location?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  const floorLabels: Record<string, string> = {
    "FLOOR-G": "Ground Floor (Utility & Core)",
    "FLOOR-1": "Level 1 (Research Labs)",
    "FLOOR-2": "Level 2 (Classrooms & Auditorium)",
  };

  return (
    <header className="h-14 flex-shrink-0 bg-[#14151A] border-b border-[#252833] px-3 sm:px-4 flex items-center justify-between z-30 select-none w-full min-w-0">
      {/* Brand & Institution Context */}
      <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0 min-w-0">
        <div className="flex items-center space-x-2.5 flex-shrink-0">
          {/* Gold Insignia Badge */}
          <div className="w-8 h-8 rounded bg-gradient-to-br from-[#D4AF37] via-[#E6C45E] to-[#91751F] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 border border-[#F5D061]/50 flex-shrink-0">
            <span className="font-mono font-black text-[#121316] text-base tracking-tighter">Ω</span>
          </div>
          <div className="flex-shrink-0">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold tracking-wider text-sm text-[#F0EDF5] font-mono">OMNIS-X</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#352D42] text-[#BDB0D3] border border-[#5E5073]">
                TWIN v2.4
              </span>
            </div>
            <p className="text-[10px] text-[#A69FB1] font-medium hidden sm:block">Apex Institute of Technology</p>
          </div>
        </div>

        {/* Breadcrumb Hierarchy */}
        <div className="hidden md:flex items-center space-x-1.5 text-xs text-[#8A8594] border-l border-[#252833] pl-3 flex-shrink min-w-0">
          <Building className="w-3.5 h-3.5 text-[#9D8EB5] flex-shrink-0" />
          <span className="truncate max-w-[120px] lg:max-w-none">Engineering Block</span>
          <ChevronRight className="w-3 h-3 text-[#5A5565] flex-shrink-0" />
          <span className="text-[#E6C45E] font-medium font-mono truncate max-w-[140px] lg:max-w-none">
            {floorLabels[currentFloor] || currentFloor}
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="relative w-48 sm:w-64 md:w-72 lg:w-96 mx-2 flex-shrink min-w-[140px]">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#8A8594] absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search entities..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="w-full bg-[#1A1C23] border border-[#2D303B] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 focus:outline-none rounded-md pl-9 pr-8 py-1.5 text-xs text-[#E2E1E6] placeholder-[#767180] font-mono transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setIsSearchOpen(false);
              }}
              className="absolute right-2.5 text-[#8A8594] hover:text-[#E2E1E6]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Autocomplete Dropdown */}
        {isSearchOpen && searchResults.length > 0 && (
          <div className="absolute top-full mt-1.5 left-0 right-0 bg-[#17181F] border border-[#3A3D4B] rounded-md shadow-2xl overflow-hidden z-50">
            <div className="py-1">
              {searchResults.map((res) => (
                <button
                  key={res.entity_id}
                  onClick={() => {
                    onSelectEntity(res.entity_id);
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[#232530] flex items-center justify-between border-b border-[#252833] last:border-b-0 transition-colors"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-medium text-[#E2E1E6]">{res.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#2D2A38] text-[#BDB0D3]">
                        {res.entity_id}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8A8594] mt-0.5">{res.location}</p>
                  </div>
                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                      res.operational_status === "OPERATIONAL"
                        ? "bg-[#D4AF37]/15 text-[#E6C45E] border border-[#D4AF37]/30"
                        : "bg-[#E5A83B]/15 text-[#E5A83B] border border-[#E5A83B]/30"
                    }`}
                  >
                    {res.operational_status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Controls: View Switcher, Simulation Mode, Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
        {/* Cinematic Intro Button */}
        {onReplayIntro && (
          <button
            onClick={onReplayIntro}
            className="flex items-center space-x-1.5 px-2 sm:px-2.5 py-1 text-xs font-mono rounded bg-[#191B22] border border-[#2D303B] hover:border-[#D4AF37] text-[#9D8EB5] hover:text-[#FFFFFF] transition-all flex-shrink-0"
            title="Play Cinematic 3D Intro"
          >
            <Film className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden xl:inline">Cinematic Intro</span>
          </button>
        )}

        {/* View Mode Toggle: Spatial 2D vs Campus 3D vs Topology Graph */}
        <div className="flex bg-[#191B22] p-0.5 rounded-lg border border-[#2D303B] flex-shrink-0">
          <button
            onClick={() => onToggleView("FLOORPLAN")}
            className={`px-2 sm:px-2.5 py-1 text-xs font-medium rounded transition-all font-mono ${
              activeView === "FLOORPLAN"
                ? "bg-[#D4AF37] text-[#121316] font-bold shadow-md shadow-[#D4AF37]/20"
                : "text-[#9D8EB5] hover:text-[#E2E1E6]"
            }`}
          >
            Spatial 2D
          </button>
          <button
            onClick={() => onToggleView("CAMPUS_3D")}
            className={`px-2 sm:px-2.5 py-1 text-xs font-medium rounded transition-all font-mono ${
              activeView === "CAMPUS_3D"
                ? "bg-[#D4AF37] text-[#121316] font-bold shadow-md shadow-[#D4AF37]/20"
                : "text-[#9D8EB5] hover:text-[#E2E1E6]"
            }`}
          >
            Campus 3D
          </button>
          <button
            onClick={() => onToggleView("GRAPH")}
            className={`px-2 sm:px-2.5 py-1 text-xs font-medium rounded transition-all font-mono ${
              activeView === "GRAPH"
                ? "bg-[#D4AF37] text-[#121316] font-bold shadow-md shadow-[#D4AF37]/20"
                : "text-[#9D8EB5] hover:text-[#E2E1E6]"
            }`}
          >
            Topology
          </button>
        </div>

        {/* Counterfactual Simulation Mode Toggle */}
        <button
          onClick={onToggleSimulation}
          className={`flex items-center space-x-1.5 px-2 sm:px-2.5 py-1 rounded text-xs font-medium border transition-all flex-shrink-0 ${
            simulationActive
              ? "bg-[#453625] text-[#F5D061] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20 animate-pulse font-bold"
              : "bg-[#201D28] text-[#BDB0D3] border-[#433A52] hover:border-[#9D8EB5]"
          }`}
        >
          <FlaskConical className={`w-3.5 h-3.5 ${simulationActive ? "text-[#F5D061]" : "text-[#9D8EB5]"}`} />
          <span className="font-mono hidden sm:inline">{simulationActive ? "SHADOW TWIN ON" : "Simulate Chaos"}</span>
          <span className="font-mono sm:hidden">{simulationActive ? "SIM" : "Chaos"}</span>
        </button>

        {/* Telemetry Status Indicator */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2 py-1 rounded bg-[#191B22] border border-[#2D303B] flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
          <span className="text-[10px] font-mono font-bold text-[#E6C45E]">LIVE</span>
        </div>

        {/* Operator Profile */}
        <div className="flex items-center space-x-2 pl-2 border-l border-[#252833] flex-shrink-0">
          <div className="w-7 h-7 rounded-full bg-[#272433] border border-[#484257] flex items-center justify-center text-[#D4AF37] flex-shrink-0">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="hidden xl:block text-left flex-shrink-0">
            <div className="text-[11px] font-medium text-[#E2E1E6]">Campus Director</div>
            <div className="text-[9px] text-[#9D8EB5] font-mono">Resilience Level 4</div>
          </div>
        </div>
      </div>
    </header>
  );
}
