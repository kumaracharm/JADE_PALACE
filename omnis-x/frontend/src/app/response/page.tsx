"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ResponseWorkspace } from "@/components/response/ResponseWorkspace";
import { TopNav } from "@/components/navigation/TopNav";
import { ReportIncidentModal } from "@/components/reporting/ReportIncidentModal";
import { SimulationPanel } from "@/components/simulation/SimulationPanel";
import { KungFuPandaProfile, KUNG_FU_PANDA_PERSONAS, PersonaProfile } from "@/components/profile/KungFuPandaProfile";
import { ThunderEvent } from "@/components/landing/ThunderEvent";
import { GlassLoginModal } from "@/components/auth/GlassLoginModal";

function ResponseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const incidentParam = searchParams.get("incident");

  const [currentPersona, setCurrentPersona] = useState<PersonaProfile>(KUNG_FU_PANDA_PERSONAS[1]); // Master Shifu (HOD)
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showThunder, setShowThunder] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSimOpen, setIsSimOpen] = useState(false);
  const [simulationActive, setSimulationActive] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0A0B0E] text-[#E2E1E6] font-sans select-none">
      <TopNav
        currentFloor="FLOOR-1"
        onSelectFloor={() => {}}
        simulationActive={simulationActive}
        onToggleSimulation={() => setIsSimOpen(true)}
        allEntities={[]}
        onSelectEntity={(id) => router.push(`/twin?entity=${encodeURIComponent(id)}`)}
        activeWorkspace="RESPONSE"
        onSelectWorkspace={(ws) => {
          if (ws === "COMMAND") {
            if (typeof window !== "undefined" && window.location.port !== "3000") {
              window.location.href = "http://localhost:3000";
            } else {
              router.push("/command");
            }
          } else if (ws === "TWIN") {
            if (typeof window !== "undefined" && window.location.port !== "3001") {
              window.location.href = "http://localhost:3001";
            } else {
              router.push("/twin");
            }
          } else {
            router.push("/response");
          }
        }}
        onOpenReportModal={() => setIsReportOpen(true)}
        onOpenProfile={() => setIsLoginOpen(true)}
        currentPersona={currentPersona}
        onReplayIntro={() => setShowThunder(true)}
      />

      <main className="flex-1 w-full overflow-hidden relative">
        <ResponseWorkspace
          initialIncidentId={incidentParam}
          onNavigateToTwin={(entityId) => {
            if (entityId) router.push(`/twin?entity=${encodeURIComponent(entityId)}`);
            else router.push("/twin");
          }}
        />
      </main>

      {/* Controlled Thunder & Electrical Pulse Cinematic Landing */}
      {showThunder && (
        <ThunderEvent onComplete={() => setShowThunder(false)} />
      )}

      {/* Dynamic Glassmorphism Zero-Trust Login Modal */}
      <GlassLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        defaultRole="HOD"
        appTitle="OMNIS-X RESPONSE — TACTICAL ACCESS"
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

export default function ResponsePage() {
  return (
    <Suspense fallback={<div className="w-screen h-screen bg-[#0A0B0E]" />}>
      <ResponseContent />
    </Suspense>
  );
}