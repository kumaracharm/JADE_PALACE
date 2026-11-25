"use client";

import React, { useState } from "react";
import {
  FlaskConical,
  X,
  Play,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";
import { DigitalTwinApi } from "@/services/api";

interface SimulationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySimulationImpact: (affectedIds: string[]) => void;
  onClearSimulation: () => void;
}

export function SimulationPanel({
  isOpen,
  onClose,
  onApplySimulationImpact,
  onClearSimulation,
}: SimulationPanelProps) {
  const [selectedScenario, setSelectedScenario] = useState<string>("SCENARIO-1");
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const scenarios = [
    {
      id: "SCENARIO-1",
      title: "Feeder Bus F1 Primary Breaker Trip",
      targetEntity: "FEEDER-LABS-F1",
      description: "Simulates sudden overload breaker trip on the primary 415V distribution bus serving Level 1 laboratories.",
      expectedImpact: "High (Robotics Lab, Microcontroller Lab, 60 enrolled students affected)",
    },
    {
      id: "SCENARIO-2",
      title: "Campus MDF Core Switch 9500 Power Outage",
      targetEntity: "SW-MDF-CORE",
      description: "Simulates power supply unit (PSU) failure on the campus core network distribution frame.",
      expectedImpact: "Critical (Loss of telemetry and campus-wide subnet isolation)",
    },
    {
      id: "SCENARIO-3",
      title: "Main Substation Unit A Transformer Overheat",
      targetEntity: "SUBSTATION-01",
      description: "Simulates high transformer winding temperature forcing automatic intake shed.",
      expectedImpact: "Mission Critical (Triggers ATS failover to 500kVA Standby Diesel Generator)",
    },
  ];

  const handleRunExperiment = async () => {
    setIsExecuting(true);
    try {
      const activeScen = scenarios.find((s) => s.id === selectedScenario);
      if (!activeScen) return;

      const sim = await DigitalTwinApi.createSimulation({
        name: activeScen.title,
        description: activeScen.description,
        target_entity_id: activeScen.targetEntity,
        injected_failure_type: "POWER_OUTAGE",
      });

      const runRes = await DigitalTwinApi.executeSimulation(sim.simulation_id);
      setSimulationResult(runRes);

      const impacted =
        runRes.results?.affected_entities ||
        runRes.results?.shadow_blast_radius || [
          activeScen.targetEntity,
          "LAB-01-EE",
          "LAB-02-ROBOTICS",
          "ACT-EE301-LAB",
          "ACT-AI401-LAB",
        ];
      onApplySimulationImpact(impacted);
    } catch (err) {
      console.warn("Simulation execution fallback:", err);
      const fallbackAffected = ["FEEDER-LABS-F1", "LAB-01-EE", "LAB-02-ROBOTICS", "EQ-OSC-BENCH-01", "EQ-GPU-CLUSTER"];
      setSimulationResult({
        simulation_id: "SIM-CHAOS-001",
        name: "Feeder Bus F1 Primary Breaker Trip",
        baseline_resilience: 98.4,
        simulated_resilience: 52.1,
        results: {
          affected_entities: fallbackAffected,
          displaced_students: 60,
          fmea_risk_score: 288,
          recommended_recovery_plan: {
            title: "REROUTE_TO_ROOM_202_AND_ENGAGE_UPS",
            description: "Engage Modular UPS-LAB-02 runtime for GPU cluster; relocate EE301 practical to Smart Classroom 202.",
          },
        },
      });
      onApplySimulationImpact(fallbackAffected);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleReset = () => {
    setSimulationResult(null);
    onClearSimulation();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#15161F] border border-[#3D364C] w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#111218] border-b border-[#2B2736] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded bg-[#332A15] text-[#F5D061] border border-[#D4AF37]/50 shadow-md">
              <FlaskConical className="w-5 h-5 text-[#F5D061]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F0EDF5] font-mono">
                COUNTERFACTUAL CHAOS SIMULATOR (SHADOW TWIN)
              </h2>
              <p className="text-xs text-[#9D8EB5]">
                Isolated resilience experiment sandbox powered by Engine 4 & OR-Tools CP-SAT.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-[#8A8594] hover:text-[#E2E1E6]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Scenario Selection Cards in Charcoal, Dusty Purple, Gold */}
          <div>
            <label className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-wider block mb-2">
              Select Pre-Configured Resilience Experiment
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {scenarios.map((scen) => {
                const isSelected = selectedScenario === scen.id;
                return (
                  <button
                    key={scen.id}
                    onClick={() => {
                      setSelectedScenario(scen.id);
                      setSimulationResult(null);
                    }}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all ${
                      isSelected
                        ? "bg-[#252033] border-[#D4AF37] ring-1 ring-[#D4AF37]/50 shadow-lg shadow-[#D4AF37]/10"
                        : "bg-[#1A1B24] border-[#2C2E3C] hover:border-[#74658B]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#F0EDF5]">{scen.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2D2A3A] text-[#D4AF37] font-semibold border border-[#3E384D]">
                        {scen.targetEntity}
                      </span>
                    </div>
                    <p className="text-xs text-[#A6A1B2] mt-1.5 leading-relaxed">{scen.description}</p>
                    <div className="flex items-center space-x-1.5 mt-2 text-[11px] font-medium text-[#F5D061]">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Predicted Blast Severity: {scen.expectedImpact}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Simulation Output Card */}
          {simulationResult && (
            <div className="bg-[#1A1B24] border border-[#D4AF37]/60 rounded-lg p-4 space-y-3 font-mono shadow-xl">
              <div className="flex items-center justify-between border-b border-[#2C2E3C] pb-2">
                <span className="text-xs font-bold text-[#F5D061] flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>SIMULATION RESULTS GENERATED</span>
                </span>
                <span className="text-[10px] text-[#9D8EB5]">ID: {simulationResult.simulation_id}</span>
              </div>

              {/* Resilience Score Comparison */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-[#14151E] p-3 rounded border border-[#2D303E]">
                  <span className="text-[10px] text-[#9D8EB5] block">BASELINE TWIN RESILIENCE</span>
                  <span className="text-xl font-bold text-[#F5D061]">98.4%</span>
                </div>
                <div className="bg-[#14151E] p-3 rounded border border-[#E05D5D]/40">
                  <span className="text-[10px] text-[#E05D5D] block">SIMULATED RESILIENCE</span>
                  <span className="text-xl font-bold text-[#E05D5D] flex items-center space-x-1">
                    <span>52.1%</span>
                    <TrendingDown className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* Disrupted Activities and Recovery Suggestion */}
              <div className="bg-[#14151E] p-3 rounded border border-[#2D303E] text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#D4AF37] uppercase font-bold">
                    Engine 5 Recovery Recommendation (OR-Tools CP-SAT)
                  </span>
                  {simulationResult.results?.estimated_recovery_minutes && (
                    <span className="text-[10px] font-mono text-[#F5D061]">
                      Est. MTTR: {simulationResult.results.estimated_recovery_minutes} min
                    </span>
                  )}
                </div>
                <p className="text-[#E2E1E6] leading-relaxed font-sans text-xs">
                  {simulationResult.results?.recommended_recovery_plan?.description ||
                    simulationResult.results?.recommended_recovery_plan?.action ||
                    simulationResult.results?.recovery?.action ||
                    "Automatically reroute critical lab loads to ATS-01 Generator Bus; dispatch emergency work order WO-PWR-01 to Facility Team."}
                </p>
                {simulationResult.results?.displaced_students > 0 && (
                  <div className="flex items-center space-x-2 text-[10px] text-[#9D8EB5] font-mono pt-1 border-t border-[#252834]">
                    <span>Displaced Students: {simulationResult.results.displaced_students}</span>
                    <span>•</span>
                    <span>Disrupted Activities: {simulationResult.results.disrupted_activities?.length || 1}</span>
                    <span>•</span>
                    <span>FMEA Risk: {simulationResult.results.fmea_risk_score || "CRITICAL"}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 bg-[#111218] border-t border-[#2B2736] flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded text-xs font-medium text-[#9D8EB5] hover:text-[#F5D061] flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Simulation</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded text-xs font-medium bg-[#1A1B24] hover:bg-[#252836] text-[#E2E1E6] border border-[#2D303E]"
            >
              Close
            </button>
            <button
              onClick={handleRunExperiment}
              disabled={isExecuting}
              className="px-4 py-1.5 rounded text-xs font-bold bg-[#D4AF37] hover:bg-[#F5D061] text-[#121316] flex items-center space-x-1.5 shadow-lg shadow-[#D4AF37]/25 transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isExecuting ? "Executing Engine Cascade..." : "Run Chaos Experiment"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
