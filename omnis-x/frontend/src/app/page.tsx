"use client";

import React, { useState, useEffect } from "react";
import { TopNav } from "@/components/navigation/TopNav";
import { ToolRail } from "@/components/navigation/ToolRail";
import { CampusCanvas3D } from "@/components/canvas3d/CampusCanvas3D";
import { LiveTelemetryPill } from "@/components/twin/LiveTelemetryPill";
import { SimulationPanel } from "@/components/simulation/SimulationPanel";
import { CinematicIntro } from "@/components/cinematic/CinematicIntro";
import { PaperPlaneLaunch } from "@/components/landing/PaperPlaneLaunch";
import { ThunderEvent } from "@/components/landing/ThunderEvent";
import { GlassLoginModal } from "@/components/auth/GlassLoginModal";
import { CommandWorkspace } from "@/components/command/CommandWorkspace";
import { ResponseWorkspace } from "@/components/response/ResponseWorkspace";
import { ReportIncidentModal } from "@/components/reporting/ReportIncidentModal";
import { KungFuPandaProfile, KUNG_FU_PANDA_PERSONAS, PersonaProfile } from "@/components/profile/KungFuPandaProfile";
import {
  CampusEntity,
  EntityRelationship,
  ActiveLayerId,
} from "@/types/digital-twin";
import { CAMPUS_FLOORS } from "@/data/spatial-campus";
import { DigitalTwinApi } from "@/services/api";
import { InstitutionalCommandHero } from "@/components/landing/InstitutionalCommandHero";
import { AuthService, AuthSession } from "@/services/auth";
import { ShieldAlert, Smartphone, ArrowRight, UserCheck, KeyRound } from "lucide-react";

export default function DigitalTwinExplorerPage() {
  // Cinematic Intro Screen State (plays on page load/refresh, then transitions smoothly)
  const [showIntro, setShowIntro] = useState<boolean>(true);

  // Kung Fu Panda Themed RBAC & Persona Profile
  const [currentPersona, setCurrentPersona] = useState<PersonaProfile>(KUNG_FU_PANDA_PERSONAS[0]);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Three-Dashboard Shared-State Workspace Ecosystem
  const [activeWorkspace, setActiveWorkspace] = useState<"COMMAND" | "TWIN" | "RESPONSE">("COMMAND");

  // Auto-detect entry port for multi-port deployment (3000 -> Command, 3001 -> Twin, 3002 -> Response)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const port = window.location.port;
      if (port === "3001") setActiveWorkspace("TWIN");
      else if (port === "3002") setActiveWorkspace("RESPONSE");
      else if (port === "3000") setActiveWorkspace("COMMAND");
    }
  }, []);

  // Institutional Authentication & RBAC Session State
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState<boolean>(false);

  useEffect(() => {
    const current = AuthService.getSession();
    setAuthSession(current);
    setIsAuthLoaded(true);

    const unsub = AuthService.onAuthChange((newSession) => {
      setAuthSession(newSession);
    });
    return () => unsub();
  }, []);

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
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

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

  // Dynamic Glassmorphism Login State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // If opening animation is triggered, render application's distinct cinematic entry
  if (showIntro) {
    if (activeWorkspace === "COMMAND") {
      return <PaperPlaneLaunch onComplete={() => setShowIntro(false)} />;
    } else if (activeWorkspace === "RESPONSE") {
      return <ThunderEvent onComplete={() => setShowIntro(false)} />;
    }
    return (
      <CinematicIntro
        onEnter={() => setShowIntro(false)}
        onSkip={() => setShowIntro(false)}
      />
    );
  }

  // 1. Institutional Hero & Authentication Entry Screen for Command Centre
  if (isAuthLoaded && activeWorkspace === "COMMAND" && !authSession) {
    return (
      <InstitutionalCommandHero
        onEnterCommandCentre={(s) => setAuthSession(s)}
        onExploreWorkspace={(ws) => {
          if (ws === "COMMAND") {
            if (typeof window !== "undefined" && window.location.port !== "3000") {
              window.location.href = "http://localhost:3000";
            } else {
              setActiveWorkspace("COMMAND");
            }
          } else if (ws === "TWIN") {
            if (typeof window !== "undefined" && window.location.port !== "3001") {
              window.location.href = "http://localhost:3001";
            } else {
              setActiveWorkspace("TWIN");
            }
          } else if (ws === "RESPONSE") {
            if (typeof window !== "undefined" && window.location.port !== "3002") {
              window.location.href = "http://localhost:3002";
            } else {
              setActiveWorkspace("RESPONSE");
            }
          }
        }}
      />
    );
  }

  // 2. Student Role Access Gate (Restricted from Administrative Dashboards)
  if (isAuthLoaded && authSession?.user.role === "STUDENT") {
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#070B14] text-[#E2E1E6] font-mono select-none">
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
          onOpenProfile={() => setIsLoginModalOpen(true)}
          currentPersona={currentPersona}
          onReplayIntro={() => setShowIntro(true)}
        />
        <main className="flex-1 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_#0D192E_0%,_#070B14_60%,_#05080F_100%)]">
          <div className="w-full max-w-lg p-8 rounded-2xl bg-[#0F172A]/90 border border-amber-500/30 shadow-2xl backdrop-blur-xl text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <ShieldAlert className="w-8 h-8 text-amber-400" />
            </div>

            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] text-amber-300 font-bold uppercase mb-2">
                <span>RBAC Clearance Restriction</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                STUDENT PROFILE RESTRICTION
              </h2>
              <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
                Logged in as <strong>{authSession.user.full_name}</strong> (<code>{authSession.user.username}</code>). Student accounts are restricted from accessing institutional supervisory dashboards, digital twin grid actuators, and incident mitigation dispatchers.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#070B14] border border-[#1E293B] text-left text-xs space-y-2">
              <div className="text-[10px] text-[#F5D061] font-bold uppercase">Authorized Student Capabilities:</div>
              <ul className="list-disc list-inside space-y-1 text-[#CBD5E1] text-[11px]">
                <li>Access the Student Grievance Mobile PWA</li>
                <li>Submit campus classroom & facility hazard reports</li>
                <li>Track live resolution status of personal grievances</li>
              </ul>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href="http://localhost:8090"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Launch Student Grievance PWA (Port 8090)</span>
              </a>

              <button
                onClick={() => AuthService.demoLogin("SUPER_ADMIN")}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Switch to Super Admin (1-Click Evaluation)</span>
              </button>

              <button
                onClick={() => AuthService.logout()}
                className="w-full py-2 text-xs text-[#94A3B8] hover:text-white underline cursor-pointer"
              >
                Sign Out / Return to Landing
              </button>
            </div>
          </div>
        </main>
      </div>
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
        onSelectWorkspace={(ws) => {
          if (ws === "COMMAND") {
            if (typeof window !== "undefined" && window.location.port !== "3000") {
              window.location.href = "http://localhost:3000";
            } else {
              setActiveWorkspace("COMMAND");
            }
          } else if (ws === "TWIN") {
            if (typeof window !== "undefined" && window.location.port !== "3001") {
              window.location.href = "http://localhost:3001";
            } else {
              setActiveWorkspace("TWIN");
            }
          } else if (ws === "RESPONSE") {
            if (typeof window !== "undefined" && window.location.port !== "3002") {
              window.location.href = "http://localhost:3002";
            } else {
              setActiveWorkspace("RESPONSE");
            }
          }
        }}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenProfile={() => setIsLoginModalOpen(true)}
        currentPersona={currentPersona}
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
          /* DIGITAL TWIN 3D UNIFIED WORKSPACE (100% FULL SCREEN VIEWPORT) */
          <div className="flex flex-1 w-full h-full overflow-hidden relative min-h-0 min-w-0">
            {/* Left Vertical Tool Rail */}
            <ToolRail
              currentFloor={currentFloor}
              onSelectFloor={setCurrentFloor}
              activeLayers={activeLayers}
              onToggleLayer={handleToggleLayer}
            />

            {/* Center High-Performance Full-Screen 3D WebGL Canvas */}
            <main className="flex-1 w-full h-full overflow-hidden relative min-h-0 min-w-0">
              <div className="w-full h-full relative overflow-hidden min-h-0 min-w-0">
                <CampusCanvas3D
                  selectedEntityId={selectedEntityId}
                  onSelectEntity={setSelectedEntityId}
                  incidentAffectedIds={incidentAffectedIds}
                  simulationActive={simulationActive}
                  currentFloor={currentFloor}
                  onSelectFloor={setCurrentFloor}
                />
              </div>

              {/* Compact Bottom-Right Live SSE Telemetry Waveform Widget (1/16 proportion) */}
              <LiveTelemetryPill />
            </main>
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

      {/* 4.5 DYNAMIC GLASSMORPHISM LOGIN MODAL */}
      <GlassLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        defaultRole={
          activeWorkspace === "TWIN"
            ? "FACILITY_MANAGER"
            : activeWorkspace === "RESPONSE"
            ? "HOD"
            : "PRINCIPAL"
        }
        appTitle={
          activeWorkspace === "TWIN"
            ? "OMNIS-X TWIN — SPATIAL ENGINEERING ACCESS"
            : activeWorkspace === "RESPONSE"
            ? "OMNIS-X RESPONSE — TACTICAL RECOVERY ACCESS"
            : "OMNIS-X COMMAND — EXECUTIVE DIRECTORATE ACCESS"
        }
        onLoginSuccess={(persona) => {
          setCurrentPersona(persona);
          setIsLoginModalOpen(false);
        }}
      />

      {/* 5. KUNG FU PANDA PERSONA & RBAC PROFILE MODAL */}
      <KungFuPandaProfile
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentPersona={currentPersona}
        onSelectPersona={setCurrentPersona}
      />
    </div>
  );
}
