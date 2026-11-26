"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { CommandWorkspace } from "@/components/command/CommandWorkspace";
import { TopNav } from "@/components/navigation/TopNav";
import { ReportIncidentModal } from "@/components/reporting/ReportIncidentModal";
import { SimulationPanel } from "@/components/simulation/SimulationPanel";
import { KungFuPandaProfile, KUNG_FU_PANDA_PERSONAS, PersonaProfile } from "@/components/profile/KungFuPandaProfile";
import { PaperPlaneLaunch } from "@/components/landing/PaperPlaneLaunch";
import { GlassLoginModal } from "@/components/auth/GlassLoginModal";
import { InstitutionalCommandHero } from "@/components/landing/InstitutionalCommandHero";
import { AuthService, AuthSession } from "@/services/auth";

export default function CommandPage() {
  const router = useRouter();
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<PersonaProfile | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showLaunch, setShowLaunch] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSimOpen, setIsSimOpen] = useState(false);
  const [simulationActive, setSimulationActive] = useState(false);

  useEffect(() => {
    const s = AuthService.getSession();
    setAuthSession(s);
    setIsAuthLoaded(true);

    const unsub = AuthService.onAuthChange((newSession) => {
      setAuthSession(newSession);
      setSelectedPersona(null);
    });
    return () => unsub();
  }, []);

  const currentPersona = React.useMemo(() => {
    if (selectedPersona) return selectedPersona;
    switch (authSession?.user.role) {
      case "SUPER_ADMIN":
        return KUNG_FU_PANDA_PERSONAS[0]; // Master Oogway
      case "FACILITY_MANAGER":
        return KUNG_FU_PANDA_PERSONAS[2]; // Master Tigress
      case "HOD_ACADEMIC":
        return KUNG_FU_PANDA_PERSONAS[1]; // Master Shifu
      case "TECHNICIAN":
        return KUNG_FU_PANDA_PERSONAS[6] || KUNG_FU_PANDA_PERSONAS[3]; // Master Mantis
      case "STUDENT":
        return KUNG_FU_PANDA_PERSONAS[5]; // Po
      default:
        return KUNG_FU_PANDA_PERSONAS[0];
    }
  }, [authSession?.user.role, selectedPersona]);

  if (isAuthLoaded && !authSession) {
    return (
      <InstitutionalCommandHero
        onEnterCommandCentre={(s) => setAuthSession(s)}
        onExploreWorkspace={(ws) => {
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
          }
        }}
      />
    );
  }

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
        onSelectPersona={setSelectedPersona}
        onReplayIntro={() => setShowLaunch(true)}
      />

      <main className="flex-1 w-full overflow-hidden relative">
        <CommandWorkspace
          key={authSession?.user.role || "guest"}
          currentPersona={currentPersona}
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
        defaultRole="SUPER_ADMIN"
        appTitle="OMNIS-X COMMAND — SOVEREIGN CONTROL CLEARANCE"
        onLoginSuccess={(persona) => {
          setSelectedPersona(persona);
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
        onSelectPersona={setSelectedPersona}
      />
    </div>
  );
}
