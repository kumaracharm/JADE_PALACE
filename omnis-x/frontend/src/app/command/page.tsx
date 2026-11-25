"use client";

import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { CommandWorkspace } from "@/components/command/CommandWorkspace";
import { TopNav } from "@/components/navigation/TopNav";
import { ReportIncidentModal } from "@/components/reporting/ReportIncidentModal";
import { SimulationPanel } from "@/components/simulation/SimulationPanel";
import { KungFuPandaProfile, KUNG_FU_PANDA_PERSONAS, PersonaProfile } from "@/components/profile/KungFuPandaProfile";
import { PaperPlaneLaunch } from "@/components/landing/PaperPlaneLaunch";
import { GlassLoginModal } from "@/components/auth/GlassLoginModal";

export default function CommandPage() {
  const router = useRouter();
  const [currentPersona, setCurrentPersona] = useState<PersonaProfile>(KUNG_FU_PANDA_PERSONAS[0]); // Master Oogway (Principal)
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showLaunch, setShowLaunch] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSimOpen, setIsSimOpen] = useState(false);
  const [simulationActive, setSimulationActive] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0A0F1D] text-[#E2E1E6] font-sans select-none">
      <TopNav
        currentFloor="FLOOR-1"
        onSelectFloor={() => {}}
        simulationActive={simulationActive}
        onToggleSimulation={() => setIsSimOpen(true)}
        allEntities={[]}
        onSelectEntity={(id) => router.push(`/twin?entity=${encodeURIComponent(id)}`)}
        activeWorkspace="COMMAND"
        onSelectWorkspace={(ws) => {
          if (ws === "TWIN") {
            if (typeof window !== "undefined" && window.location.port !== "3001") {
              window.location.href = "http://localhost:3001";
            } else {
              router.push("/twin");
            }
          } else if (ws === "RESPONSE") {
            if (typeof window !== "undefined" && window.location.port !== "3002") {
              window.location.href = "http://localhost:3002";
            } else {
              router.push("/response");
            }
          } else {
            router.push("/command");
          }
        }}
        onOpenReportModal={() => setIsReportOpen(true)}
        onOpenProfile={() => setIsLoginOpen(true)}
        currentPersona={currentPersona}
        onReplayIntro={() => setShowLaunch(true)}
      />

      <main className="flex-1 w-full overflow-hidden relative">
        <CommandWorkspace
          onNavigateToTwin={(entityId) => {
            if (entityId) router.push(`/twin?entity=${encodeURIComponent(entityId)}`);
            else router.push("/twin");
          }}
          onNavigateToResponse={(incidentId) => {
            if (incidentId) router.push(`/response?incident=${encodeURIComponent(incidentId)}`);
            else router.push("/response");
          }}
          onOpenReportModal={() => setIsReportOpen(true)}
          onOpenSimulation={() => setIsSimOpen(true)}
        />
      </main>

      {/* Cinematic Paper Plane / Rocket Launch Transition */}
      {showLaunch && (
        <PaperPlaneLaunch onComplete={() => setShowLaunch(false)} />
      )}

      {/* Dynamic Glassmorphism Zero-Trust Login Modal */}
      <GlassLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        defaultRole="PRINCIPAL"
        appTitle="OMNIS-X COMMAND — EXECUTIVE ACCESS"
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
        onApplySimulationImpact={() => setSimulationActive(true)}
        onClearSimulation={() => setSimulationActive(false)}
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