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