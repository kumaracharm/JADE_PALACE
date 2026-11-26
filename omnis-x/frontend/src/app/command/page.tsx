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
import { ShieldAlert, Smartphone, KeyRound } from "lucide-react";

export default function CommandPage() {
  const router = useRouter();
  const [currentPersona, setCurrentPersona] = useState<PersonaProfile>(KUNG_FU_PANDA_PERSONAS[0]); // Master Oogway (Principal)
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
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
    });
    return () => unsub();
  }, []);

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

  if (isAuthLoaded && authSession?.user.role === "STUDENT") {
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#070B14] text-[#E2E1E6] font-mono select-none">
        <TopNav
          currentFloor="FLOOR-1"
          onSelectFloor={() => {}}
          simulationActive={simulationActive}
          onToggleSimulation={() => setIsSimOpen(true)}
          allEntities={[]}
          onSelectEntity={(id) => router.push(`/twin?entity=${encodeURIComponent(id)}`)}
          activeWorkspace="COMMAND"
          onSelectWorkspace={() => {}}
          onOpenReportModal={() => setIsReportOpen(true)}
          onOpenProfile={() => setIsLoginOpen(true)}
          currentPersona={currentPersona}
          onReplayIntro={() => setShowLaunch(true)}
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