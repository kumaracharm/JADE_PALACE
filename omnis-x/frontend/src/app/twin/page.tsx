"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CampusCanvas3D } from "@/components/canvas3d/CampusCanvas3D";
import { FloorPlanCanvas } from "@/components/canvas/FloorPlanCanvas";
import { CAMPUS_FLOORS } from "@/data/spatial-campus";
import { TopNav } from "@/components/navigation/TopNav";
import { ToolRail } from "@/components/navigation/ToolRail";
import { LiveTelemetryPill } from "@/components/twin/LiveTelemetryPill";
import { ReportIncidentModal } from "@/components/reporting/ReportIncidentModal";
import { SimulationPanel } from "@/components/simulation/SimulationPanel";
import { CinematicIntro } from "@/components/cinematic/CinematicIntro";
import { GlassLoginModal } from "@/components/auth/GlassLoginModal";
import { KungFuPandaProfile, KUNG_FU_PANDA_PERSONAS, PersonaProfile } from "@/components/profile/KungFuPandaProfile";
import { CampusEntity, ActiveLayerId } from "@/types/digital-twin";
import { DigitalTwinApi } from "@/services/api";
import { Zap } from "lucide-react";

function TwinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const entityParam = searchParams.get("entity");

  const [currentPersona, setCurrentPersona] = useState<PersonaProfile>(KUNG_FU_PANDA_PERSONAS[2]); // Master Tigress (Facility Manager)
  const [currentFloor, setCurrentFloor] = useState<string>("FLOOR-1");
  const [twinViewMode, setTwinViewMode] = useState<"CAMPUS_3D" | "FLOORPLAN">("CAMPUS_3D");
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(entityParam || null);
  const [activeLayers, setActiveLayers] = useState<Set<ActiveLayerId>>(
    new Set<ActiveLayerId>(["OPERATIONAL_STATUS", "ELECTRICAL_GRID", "NETWORK_TOPOLOGY"])
  );

  const [entities, setEntities] = useState<CampusEntity[]>([]);
  const [entityMap, setEntityMap] = useState<Map<string, CampusEntity>>(new Map());
  const [incidentAffectedIds, setIncidentAffectedIds] = useState<Set<string>>(new Set());
  const [simulationActive, setSimulationActive] = useState(false);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showCinematicReveal, setShowCinematicReveal] = useState(true);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSimOpen, setIsSimOpen] = useState(false);

  useEffect(() => {
    DigitalTwinApi.getEntities().then((ents) => {
      setEntities(ents);
      const map = new Map<string, CampusEntity>();
      ents.forEach((e) => map.set(e.entity_id, e));
      setEntityMap(map);
    });
  }, []);

  useEffect(() => {
    if (entityParam) {
      setSelectedEntityId(entityParam);
    }
  }, [entityParam]);

  const handleToggleLayer = (layerId: ActiveLayerId) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layerId)) next.delete(layerId);
      else next.add(layerId);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0E0F12] text-[#E2E1E6] font-sans select-none">
      <TopNav
        currentFloor={currentFloor}
        onSelectFloor={setCurrentFloor}
        simulationActive={simulationActive}
        onToggleSimulation={() => setIsSimOpen(true)}
        allEntities={entities}
        onSelectEntity={setSelectedEntityId}
        activeWorkspace="TWIN"
        onSelectWorkspace={(ws) => {
          if (ws === "COMMAND") {
            if (typeof window !== "undefined" && window.location.port !== "3000") {
              window.location.href = "http://localhost:3000";
            } else {
              router.push("/command");
            }
          } else if (ws === "RESPONSE") {
            if (typeof window !== "undefined" && window.location.port !== "3002") {
              window.location.href = "http://localhost:3002";
            } else {
              router.push("/response");
            }
          } else {
            router.push("/twin");
          }
        }}
        onOpenReportModal={() => setIsReportOpen(true)}
        onOpenProfile={() => setIsLoginOpen(true)}
        currentPersona={currentPersona}
        onSelectPersona={setCurrentPersona}
        onReplayIntro={() => setShowCinematicReveal(true)}
        twinViewMode={twinViewMode}
        onToggleTwinView={setTwinViewMode}
      />

      <div className="flex flex-1 w-full h-full overflow-hidden relative min-h-0 min-w-0">
        {/* Center: Authoritative Spatial Viewport (100% Full Screen Wireframe Model) */}
        <main className="w-full h-full overflow-hidden relative min-h-0 min-w-0">
          {/* Floating 3-Anomaly Quick Injection Bar */}
          <div className="absolute top-3 left-3 sm:left-4 z-20 flex items-center space-x-1.5 p-1 rounded-xl bg-[#0E0F14]/90 border border-[#252833] backdrop-blur-md shadow-2xl font-mono text-xs pointer-events-auto">
            <span className="text-[9px] text-[#F5D061] font-bold px-2 uppercase tracking-wider flex items-center space-x-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">INJECT FAULT:</span>
            </span>
            <button
              onClick={() => {
                setIncidentAffectedIds(new Set(["FEEDER-LABS-F1"]));
                setSelectedEntityId("FEEDER-LABS-F1");
                setCurrentFloor("FLOOR-2");
                setSimulationActive(true);
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-all active:scale-95 ${
                incidentAffectedIds.has("FEEDER-LABS-F1")
                  ? "bg-red-600 text-white border border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.7)]"
                  : "bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/50"
              }`}
              title="Inject Feeder F1 Trip (Research Labs / EE-101)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
              <span>1. Feeder Trip</span>
            </button>
            <button
              onClick={() => {
                setIncidentAffectedIds(new Set(["FEEDER-CR-F2"]));
                setSelectedEntityId("FEEDER-CR-F2");
                setCurrentFloor("FLOOR-1");
                setSimulationActive(true);
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-all active:scale-95 ${
                incidentAffectedIds.has("FEEDER-CR-F2")
                  ? "bg-orange-600 text-white border border-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.7)]"
                  : "bg-orange-950/80 hover:bg-orange-900 text-orange-300 border border-orange-500/50"
              }`}
              title="Inject HVAC Thermal Fault (Academic Wing CR-104)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
              <span>2. HVAC Fault</span>
            </button>
            <button
              onClick={() => {
                setIncidentAffectedIds(new Set(["SUBSTATION-01"]));
                setSelectedEntityId("SUBSTATION-01");
                setCurrentFloor("FLOOR-G");
                setSimulationActive(true);
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-all active:scale-95 ${
                incidentAffectedIds.has("SUBSTATION-01")
                  ? "bg-sky-600 text-white border border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.7)]"
                  : "bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-500/50"
              }`}
              title="Inject 11kV Substation Breaker Disruption"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
              <span>3. Substation Trip</span>
            </button>
            <button
              onClick={() => {
                setIncidentAffectedIds(new Set());
                setSelectedEntityId(null);
                setSimulationActive(false);
              }}
              className="px-2 py-1 rounded-lg bg-[#14151C] hover:bg-[#1E202A] text-[#8E8B99] hover:text-white border border-[#252836] text-[10px] font-bold cursor-pointer transition-all"
              title="Reset to normal grid baseline"
            >
              Reset
            </button>
          </div>

          <div className="w-full h-full relative overflow-hidden min-h-0 min-w-0">
            {twinViewMode === "CAMPUS_3D" ? (
              <CampusCanvas3D
                selectedEntityId={selectedEntityId}
                onSelectEntity={setSelectedEntityId}
                incidentAffectedIds={incidentAffectedIds}
                simulationActive={simulationActive}
                currentFloor={currentFloor}
                onSelectFloor={setCurrentFloor}
              />
            ) : (
              <div className="flex w-full h-full">
                <ToolRail
                  currentFloor={currentFloor}
                  onSelectFloor={setCurrentFloor}
                  activeLayers={activeLayers}
                  onToggleLayer={handleToggleLayer}
                />
                <div className="flex-1 w-full h-full">
                  <FloorPlanCanvas
                    floorData={CAMPUS_FLOORS[currentFloor] || CAMPUS_FLOORS["FLOOR-1"]}
                    activeLayers={activeLayers}
                    selectedEntityId={selectedEntityId}
                    onSelectEntity={setSelectedEntityId}
                    entityMap={entityMap}
                    incidentAffectedIds={incidentAffectedIds}
                    simulationActive={simulationActive}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Compact Bottom-Right Live SSE Telemetry Waveform Pill */}
          <LiveTelemetryPill />
        </main>
      </div>

      {/* Cinematic Digital Twin Campus Reveal Overlay */}
      {showCinematicReveal && (
        <CinematicIntro
          onEnter={() => setShowCinematicReveal(false)}
          onSkip={() => setShowCinematicReveal(false)}
        />
      )}

      {/* Dynamic Glassmorphism Zero-Trust Login Modal */}
      <GlassLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        defaultRole="FACILITY_MANAGER"
        appTitle="OMNIS-X TWIN — SPATIAL ENGINEERING ACCESS"
        onLoginSuccess={(persona) => {
          setCurrentPersona(persona);
          setIsLoginOpen(false);
        }}
      />

      <ReportIncidentModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onIncidentReported={(inc) => {
          router.push(`/response?incident=${encodeURIComponent(inc.incident_id)}`);
        }}
      />

      <SimulationPanel
        isOpen={isSimOpen}
        onClose={() => setIsSimOpen(false)}
        onApplySimulationImpact={(ids) => {
          setSimulationActive(true);
          setIncidentAffectedIds(new Set(ids));
        }}
        onClearSimulation={() => {
          setSimulationActive(false);
          setIncidentAffectedIds(new Set());
        }}
      />

      <KungFuPandaProfile
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentPersona={currentPersona}
        onSelectPersona={setCurrentPersona}
      />
    </div>
  );
}

export default function TwinPage() {
  return (
    <Suspense fallback={<div className="w-screen h-screen bg-[#0E0F12]" />}>
      <TwinContent />
    </Suspense>
  );
}