"use client";

import React, { useState, useEffect } from "react";
import { TopNav } from "@/components/navigation/TopNav";
import { ToolRail } from "@/components/navigation/ToolRail";
import { CampusCanvas3D } from "@/components/canvas3d/CampusCanvas3D";
import { EntityInspector } from "@/components/inspector/EntityInspector";
import { TelemetryTimeline } from "@/components/timeline/TelemetryTimeline";
import { SimulationPanel } from "@/components/simulation/SimulationPanel";
import { CinematicIntro } from "@/components/cinematic/CinematicIntro";
import { CommandWorkspace } from "@/components/command/CommandWorkspace";
import { ResponseWorkspace } from "@/components/response/ResponseWorkspace";
import { ReportIncidentModal } from "@/components/reporting/ReportIncidentModal";
import {
  CampusEntity,
  EntityRelationship,
  ActiveLayerId,
} from "@/types/digital-twin";
import { CAMPUS_FLOORS } from "@/data/spatial-campus";
import { DigitalTwinApi } from "@/services/api";

export default function DigitalTwinExplorerPage() {
  // Cinematic Intro Screen State
  const [showIntro, setShowIntro] = useState<boolean>(true);

  // Three-Dashboard Shared-State Workspace Ecosystem
  const [activeWorkspace, setActiveWorkspace] = useState<"COMMAND" | "TWIN" | "RESPONSE">("TWIN");

  // Navigation & Floor State
  const [currentFloor, setCurrentFloor] = useState<string>("FLOOR-1");

  // Visual Layers State
  const [activeLayers, setActiveLayers] = useState<Set<ActiveLayerId>>(
    new Set<ActiveLayerId>([
      "OPERATIONAL_STATUS",
      "ELECTRICAL_GRID",
      "NETWORK_TOPOLOGY",
      "ACADEMIC_TIMETABLE",
    ])
  );

  // Entity Data & Selection
  const [entities, setEntities] = useState<CampusEntity[]>([]);
  const [entityMap, setEntityMap] = useState<Map<string, CampusEntity>>(new Map());
  const [relationships, setRelationships] = useState<EntityRelationship[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>("LAB-01-EE");

  // Active Incident Focus for Response Workspace
  const [targetIncidentId, setTargetIncidentId] = useState<string | null>(null);

  // Chaos Simulation State
  const [isSimModalOpen, setIsSimModalOpen] = useState<boolean>(false);
  const [simulationActive, setSimulationActive] = useState<boolean>(false);
  const [incidentAffectedIds, setIncidentAffectedIds] = useState<Set<string>>(new Set());

  // Incident Reporting Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Load campus entities and relationships on startup
  useEffect(() => {
    let isMounted = true;

    Promise.all([DigitalTwinApi.getEntities(), DigitalTwinApi.getRelationships()])
      .then(([ents, rels]) => {
        if (!isMounted) return;

        // If backend returned entities, populate state
        if (ents.length > 0) {
          setEntities(ents);
          const map = new Map<string, CampusEntity>();
          ents.forEach((e) => map.set(e.entity_id, e));
          setEntityMap(map);
        } else {
          // Fallback initial entities if backend is cold-starting
          const fallbackEnts: CampusEntity[] = [
            {
              entity_id: "LAB-01-EE",
              entity_type: "LABORATORY",
              name: "Electronics & Microcontroller Laboratory",
              description: "Undergraduate electronics test benches and embedded hardware lab",
              parent_entity_id: "FLOOR-1",
              location: "Room 101, First Floor",
              criticality: "HIGH",
              operational_status: "OPERATIONAL",
              metadata_json: { capacity: 40, workstation_count: 20 },
            },
            {
              entity_id: "LAB-02-ROBOTICS",
              entity_type: "LABORATORY",
              name: "AI, Autonomous Systems & Robotics Laboratory",
              description: "Advanced research laboratory with edge GPU workstations and drone test cage",
              parent_entity_id: "FLOOR-1",
              location: "Room 102, First Floor",
              criticality: "HIGH",
              operational_status: "OPERATIONAL",
              metadata_json: { capacity: 35, workstation_count: 18 },
            },
            {
              entity_id: "FEEDER-LABS-F1",
              entity_type: "FEEDER",
              name: "Feeder Bus F1 - First Floor Research Labs",
              description: "Dedicated 415V three-phase sub-feeder supplying L1 laboratories",
              parent_entity_id: "FLOOR-1",
              location: "Riser Shaft 1B",
              criticality: "HIGH",
              operational_status: "OPERATIONAL",
              metadata_json: { capacity_kw: 180 },
            },
            {
              entity_id: "METER-FEEDER-F1",
              entity_type: "POWER_METER",
              name: "Digital Power Meter - Feeder F1",
              description: "Modbus multi-function power meter measuring voltage, current, and active power",
              parent_entity_id: "FEEDER-LABS-F1",
              location: "Riser Shaft 1B",
              criticality: "HIGH",
              operational_status: "OPERATIONAL",
              metadata_json: { nominal_voltage: 415.0 },
            },
          ];
          setEntities(fallbackEnts);
          const map = new Map<string, CampusEntity>();
          fallbackEnts.forEach((e) => map.set(e.entity_id, e));
          setEntityMap(map);
        }

        setRelationships(rels);
      })
      .catch((err) => console.warn("Initial entities fetch error:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Layer toggle handler
  const handleToggleLayer = (layerId: ActiveLayerId) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layerId)) {
        next.delete(layerId);
      } else {
        next.add(layerId);
      }
      return next;
    });
  };

  // Simulation handlers
  const handleApplySimulation = (affectedIds: string[]) => {
    setSimulationActive(true);
    setIncidentAffectedIds(new Set(affectedIds));
  };

  const handleClearSimulation = () => {
    setSimulationActive(false);
    setIncidentAffectedIds(new Set());
  };

  // If Cinematic Intro is active, render full-screen immersive intro
  if (showIntro) {
    return (
      <CinematicIntro
        onEnter={() => setShowIntro(false)}
        onSkip={() => setShowIntro(false)}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0E0F12] text-[#E2E1E6] font-sans select-none">
      {/* 1. TOP NAVIGATION WITH THREE-DASHBOARD WORKSPACE TABS */}
      <TopNav
        currentFloor={currentFloor}
        onSelectFloor={setCurrentFloor}
        simulationActive={simulationActive}
        onToggleSimulation={() => setIsSimModalOpen(true)}
        allEntities={entities}
        onSelectEntity={(entId) => {
          setSelectedEntityId(entId);
          setActiveWorkspace("TWIN");
        }}
        activeWorkspace={activeWorkspace}
        onSelectWorkspace={setActiveWorkspace}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onReplayIntro={() => setShowIntro(true)}
      />

      {/* 2. MAIN APPLICATION WORKSPACE CONTENT */}
      <div className="flex flex-1 w-full overflow-hidden relative min-h-0 min-w-0">
        {activeWorkspace === "COMMAND" ? (
          <CommandWorkspace
            onNavigateToTwin={(entityId) => {
              if (entityId) setSelectedEntityId(entityId);
              setActiveWorkspace("TWIN");
            }}
            onNavigateToResponse={(incidentId) => {
              if (incidentId) setTargetIncidentId(incidentId);
              setActiveWorkspace("RESPONSE");
            }}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenSimulation={() => setIsSimModalOpen(true)}
          />
        ) : activeWorkspace === "RESPONSE" ? (
          <ResponseWorkspace
            initialIncidentId={targetIncidentId}
            onNavigateToTwin={(entityId) => {
              if (entityId) setSelectedEntityId(entityId);
              setActiveWorkspace("TWIN");
            }}
          />
        ) : (
          /* DIGITAL TWIN 3D UNIFIED WORKSPACE (NO 2D COMPETING CANVAS) */
          <div className="flex flex-1 w-full h-full overflow-hidden relative min-h-0 min-w-0">
            {/* Left Vertical Tool Rail */}
            <ToolRail
              currentFloor={currentFloor}
              onSelectFloor={setCurrentFloor}
              activeLayers={activeLayers}
              onToggleLayer={handleToggleLayer}
            />

            {/* Center High-Performance 3D WebGL Canvas */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative min-h-0 min-w-0">
              <div className="flex-1 w-full h-full relative overflow-hidden min-h-0 min-w-0">
                <CampusCanvas3D
                  selectedEntityId={selectedEntityId}
                  onSelectEntity={setSelectedEntityId}
                  incidentAffectedIds={incidentAffectedIds}
                  simulationActive={simulationActive}
                />
              </div>

              {/* Bottom Contextual Telemetry Timeline */}
              <TelemetryTimeline selectedEntityId={selectedEntityId} />
            </main>

            {/* Right Autodesk Tandem-Style Entity Inspector */}
            {selectedEntityId && (
              <EntityInspector
                entityId={selectedEntityId}
                onClose={() => setSelectedEntityId(null)}
                entityMap={entityMap}
                onSelectEntity={setSelectedEntityId}
                onInitiateWorkOrder={(entId) => {
                  setTargetIncidentId("INC-DEMO-01");
                  setActiveWorkspace("RESPONSE");
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* 3. SHADOW TWIN CHAOS SIMULATION MODAL */}
      <SimulationPanel
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        onApplySimulationImpact={handleApplySimulation}
        onClearSimulation={handleClearSimulation}
      />

      {/* 4. STUDENT & STAFF INCIDENT REPORTING PORTAL MODAL */}
      <ReportIncidentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onIncidentReported={(inc) => {
          setTargetIncidentId(inc.incident_id);
        }}
      />
    </div>
  );
}
