"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CommandWorkspace } from "@/components/command/CommandWorkspace";
import { TopNav } from "@/components/navigation/TopNav";
import { ReportIncidentModal } from "@/components/reporting/ReportIncidentModal";
import { SimulationPanel } from "@/components/simulation/SimulationPanel";
import { KungFuPandaProfile, KUNG_FU_PANDA_PERSONAS, PersonaProfile } from "@/components/profile/KungFuPandaProfile";

export default function CommandPage() {
  const router = useRouter();
  const [currentPersona, setCurrentPersona] = useState<PersonaProfile>(KUNG_FU_PANDA_PERSONAS[0]); // Master Oogway (Principal)
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSimOpen, setIsSimOpen] = useState(false);
  const [simulationActive, setSimulationActive] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0E0F12] text-[#E2E1E6] font-sans select-none">
      <TopNav
        currentFloor="FLOOR-1"
        onSelectFloor={() => {}}
        simulationActive={simulationActive}
        onToggleSimulation={() => setIsSimOpen(true)}
        allEntities={[]}
        onSelectEntity={(id) => router.push(`/twin?entity=${encodeURIComponent(id)}`)}
        activeWorkspace="COMMAND"
        onSelectWorkspace={(ws) => {
          if (ws === "TWIN") router.push("/twin");
          else if (ws === "RESPONSE") router.push("/response");
          else router.push("/command");
        }}
        onOpenReportModal={() => setIsReportOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        currentPersona={currentPersona}
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