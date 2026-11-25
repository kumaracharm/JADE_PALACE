"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Activity,
  AlertTriangle,
  Zap,
  Server,
  GraduationCap,
  TrendingUp,
  Cpu,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { DigitalTwinApi } from "@/services/api";
import { CampusEntity, Incident } from "@/types/digital-twin";

interface CommandWorkspaceProps {
  onNavigateToTwin: (entityId?: string) => void;
  onNavigateToResponse: (incidentId?: string) => void;
  onOpenReportModal: () => void;
  onOpenSimulation: () => void;
}

export function CommandWorkspace({
  onNavigateToTwin,
  onNavigateToResponse,
  onOpenReportModal,
  onOpenSimulation,
}: CommandWorkspaceProps) {
  const [resilienceData, setResilienceData] = useState<any>(null);
  const [spofData, setSpofData] = useState<any>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [mlModels, setMlModels] = useState<any[]>([]);
  const [selectedMlModel, setSelectedMlModel] = useState<string>("equipment_failure");
  const [mlPrediction, setMlPrediction] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      DigitalTwinApi.getResilienceIndex(),
      DigitalTwinApi.getSPOF(),
      DigitalTwinApi.getIncidents(),
      DigitalTwinApi.getMLModels(),
    ])
      .then(([resIndex, spof, incs, models]) => {
        if (!isMounted) return;
        setResilienceData(resIndex);
        setSpofData(spof);
        setIncidents(incs);
        setMlModels(models?.models || []);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Command Center data fetch error:", err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRunSampleInference = async (modelType: string) => {
    setIsPredicting(true);
    try {
      const samplePayloads: Record<string, any> = {
        equipment_failure: {
          model_type: "equipment_failure",
          entity_id: "EQ-GPU-CLUSTER",
          features: {
            temperature_c: 78.4,
            vibration_mm_s: 5.6,
            pressure_bar: 3.9,
            rotational_speed_rpm: 3400.0,
            operating_hours: 8900.0,
            maintenance_history: 1,
          },
        },
        it_infrastructure: {
          model_type: "it_infrastructure",
          entity_id: "SW-MDF-CORE",
          features: {
            cpu_usage: 94.0,
            memory_usage: 96.5,
            network_latency_ms: 120.0,
            packet_loss: 6.2,
            disk_usage: 82.0,
            request_rate: 2200.0,
          },
        },
        transport_delay: {
          model_type: "transport_delay",
          entity_id: "CAMPUS-TRANS-BUS-04",
          features: {
            distance_km: 18.5,
            traffic_density: 0.85,
            weather_condition: 2,
            peak_hour_flag: 1,
            historical_delay_min: 15.0,
          },
        },
        electrical_grid: {
          model_type: "electrical_grid",
          entity_id: "SUBSTATION-01",
          features: {
            voltage_v: 388.0,
            current_a: 540.0,
            power_factor: 0.79,
            frequency_hz: 48.9,
            transformer_temp_c: 84.0,
          },
        },
      };

      const payload = samplePayloads[modelType] || samplePayloads.equipment_failure;
      const res = await DigitalTwinApi.predictML(payload);
      setMlPrediction(res);
    } catch (err) {
      console.warn("Prediction error:", err);
    } finally {
      setIsPredicting(false);
    }
  };

  const score = resilienceData?.overall_resilience_score || 94.5;
  const rating = resilienceData?.rating || "EXCELLENT";

  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-[#0E0F12] text-[#E2E1E6] p-4 lg:p-6 space-y-6">
      {/* 1. HEADER & EXECUTIVE SUMMARY BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#252833] gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
            <h1 className="text-xl lg:text-2xl font-bold font-mono tracking-tight text-[#FFFFFF]">
              INSTITUTIONAL RESILIENCE COMMAND
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#9D8EB5]/20 text-[#BDB0D3] border border-[#9D8EB5]/40 font-bold">
              LEVEL 4 DIRECTORATE
            </span>
          </div>
          <p className="text-xs text-[#9D8EB5] mt-1 font-mono">
            Apex Institute of Technology • Cyber-Physical Campus Infrastructure & Academic Continuity
          </p>
        </div>

        {/* Global Quick Actions */}
        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          <button
            onClick={() => onNavigateToTwin()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#1B1D25] border border-[#2D303B] hover:border-[#D4AF37] text-xs font-mono text-[#D4AF37] hover:text-[#FFFFFF] transition-all"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Launch 3D Twin</span>
          </button>

          <button
            onClick={onOpenSimulation}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#352718] border border-[#D4AF37]/60 hover:bg-[#483520] text-xs font-mono text-[#F5D061] transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Simulate Shadow Twin</span>
          </button>

          <button
            onClick={onOpenReportModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#D4AF37] hover:bg-[#E6C45E] text-[#121316] font-bold text-xs font-mono transition-all shadow-md shadow-[#D4AF37]/20"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Report Incident</span>
          </button>
        </div>
      </div>

      {/* 2. COMPOSITE RESILIENCE SCORE & DOMAIN RADAR CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Composite Score Gauge */}
        <div className="p-4 rounded-xl bg-[#14151A] border border-[#252833] flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#9D8EB5] uppercase font-bold tracking-wider">
              Institutional Resilience Index
            </span>
            <ShieldAlert className="w-4 h-4 text-[#D4AF37]" />
          </div>

          <div className="my-4 flex items-baseline space-x-3">
            <span className="text-4xl lg:text-5xl font-mono font-black text-[#F5D061]">
              {score.toFixed(1)}
            </span>
            <span className="text-sm font-mono text-[#8A8594]">/ 100</span>
            <span
              className={`text-xs font-mono uppercase font-bold px-2 py-0.5 rounded border ml-auto ${
                rating === "EXCELLENT"
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : rating === "GOOD"
                  ? "bg-[#D4AF37]/15 text-[#F5D061] border-[#D4AF37]/30"
                  : "bg-red-500/15 text-red-400 border-red-500/30"
              }`}
            >
              {rating}
            </span>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#252833] text-[11px] font-mono text-[#8A8594]">
            <div className="flex justify-between">
              <span>Standard Baseline:</span>
              <span className="text-[#E2E1E6]">ISO 22301 / WIRM-8</span>
            </div>
            <div className="flex justify-between">
              <span>Provenance:</span>
              <span className="text-[#9D8EB5]">SYNTHETIC CALIBRATED</span>
            </div>
          </div>
        </div>

        {/* 6 Resilience Domains Breakdown */}
        <div className="md:col-span-2 lg:col-span-3 p-4 rounded-xl bg-[#14151A] border border-[#252833] shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-[#9D8EB5] uppercase font-bold tracking-wider">
              Resilience Domain Balance (Weighted Multi-Criteria)
            </span>
            <Activity className="w-4 h-4 text-[#9D8EB5]" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {resilienceData?.domains ? (
              Object.entries(resilienceData.domains).map(([key, dom]: [string, any]) => {
                const label = key
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase());
                return (
                  <div key={key} className="p-2.5 rounded bg-[#1B1D25] border border-[#2A2D3A]">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#9D8EB5]">
                      <span className="truncate pr-1">{label}</span>
                      <span className="text-[#F5D061] font-bold">{dom.score}%</span>
                    </div>
                    <div className="w-full bg-[#111216] h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#9D8EB5] to-[#D4AF37]"
                        style={{ width: `${Math.min(dom.score, 100)}%` }}
                      />
                    </div>
                    <div className="text-[9px] font-mono text-[#5A5565] mt-1 text-right">
                      Weight: {(dom.weight * 100).toFixed(0)}%
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs font-mono text-[#8A8594] col-span-3 py-4 text-center">
                Loading domain metrics...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. MIDDLE SECTION: SINGLE POINT OF FAILURE (SPOF) & ACTIVE INCIDENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SPOF Discovery Table */}
        <div className="p-4 rounded-xl bg-[#14151A] border border-[#252833] shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#252833]">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-[#D4AF37]" />
              <h2 className="text-xs font-mono font-bold uppercase text-[#FFFFFF] tracking-wider">
                Graph SPOF Discovery (NetworkX Articulation Points)
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#F5D061] border border-[#D4AF37]/40 font-bold">
              {spofData?.total_spofs_detected || 0} Candidates
            </span>
          </div>

          <p className="text-xs text-[#9D8EB5] my-2 font-mono">
            Critical infrastructure nodes with zero active redundant bypass lines that cause severe downstream blast radius if severed.
          </p>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#252833] text-[10px] text-[#767180] uppercase">
                  <th className="py-2">Entity</th>
                  <th className="py-2">Type</th>
                  <th className="py-2 text-center">Blast Radius</th>
                  <th className="py-2 text-center">Risk Level</th>
                  <th className="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F212B]">
                {spofData?.all_candidates?.slice(0, 5).map((spof: any) => (
                  <tr key={spof.entity_id} className="hover:bg-[#1B1D25] transition-colors">
                    <td className="py-2.5 font-medium text-[#FFFFFF]">
                      <div className="font-bold">{spof.entity_id}</div>
                      <div className="text-[10px] text-[#8A8594] truncate max-w-[140px]">{spof.name}</div>
                    </td>
                    <td className="py-2.5 text-[#9D8EB5]">{spof.entity_type}</td>
                    <td className="py-2.5 text-center text-[#F5D061] font-bold">
                      {spof.downstream_dependent_count} assets
                    </td>
                    <td className="py-2.5 text-center">
                      <span
                        className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                          spof.spof_risk_level === "CRITICAL"
                            ? "bg-red-500/20 text-red-400 border border-red-500/40"
                            : "bg-[#D4AF37]/20 text-[#F5D061] border border-[#D4AF37]/40"
                        }`}
                      >
                        {spof.spof_risk_level}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => onNavigateToTwin(spof.entity_id)}
                        className="text-[11px] text-[#D4AF37] hover:underline flex items-center space-x-1 ml-auto"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Incidents & Resilience Engine Queue */}
        <div className="p-4 rounded-xl bg-[#14151A] border border-[#252833] shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#252833]">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
              <h2 className="text-xs font-mono font-bold uppercase text-[#FFFFFF] tracking-wider">
                Active Institutional Incidents
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 font-bold">
              {incidents.length} Registered
            </span>
          </div>

          <div className="space-y-3 mt-3 flex-1 overflow-y-auto">
            {incidents.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-[#8A8594] bg-[#171821] rounded-lg border border-[#252833]">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="font-bold text-[#FFFFFF]">Zero Unresolved Incidents</p>
                <p className="text-[11px] text-[#9D8EB5] mt-1">
                  All institutional power buses and laboratories operating within nominal parameters.
                </p>
              </div>
            ) : (
              incidents.map((inc) => (
                <div
                  key={inc.incident_id}
                  className="p-3 rounded-lg bg-[#1B1D25] border border-[#2C303E] hover:border-[#D4AF37] transition-all flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-[#FFFFFF]">{inc.title}</span>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                        {inc.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9D8EB5] line-clamp-1">{inc.description}</p>
                    <div className="text-[10px] font-mono text-[#767180] flex items-center space-x-3">
                      <span>Source: <strong className="text-[#E2E1E6]">{(inc as any).source_entity_id || inc.root_cause_entity_id}</strong></span>
                      <span>•</span>
                      <span>Status: <strong className="text-[#F5D061]">{inc.status}</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateToResponse(inc.incident_id)}
                    className="px-3 py-1.5 rounded bg-[#D4AF37]/20 hover:bg-[#D4AF37] text-[#F5D061] hover:text-[#121316] text-xs font-mono font-bold transition-all border border-[#D4AF37]/40 flex items-center space-x-1"
                  >
                    <span>Analyze</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. BOTTOM SECTION: ML LAB LIVE PREDICTION SUITE */}
      <div className="p-4 rounded-xl bg-[#14151A] border border-[#252833] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#252833] gap-2">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-[#D4AF37]" />
            <h2 className="text-xs font-mono font-bold uppercase text-[#FFFFFF] tracking-wider">
              Trained ML Intelligence Lab (4 Live scikit-learn Models)
            </h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#9D8EB5]/20 text-[#BDB0D3] border border-[#9D8EB5]/40 font-bold">
            PROVENANCE: SYNTHETIC DEMONSTRATION
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          {/* Model Selector Tabs */}
          <div className="space-y-2">
            {[
              { id: "equipment_failure", name: "Equipment Failure", desc: "Vibration & Thermal Degradation" },
              { id: "it_infrastructure", name: "IT Network Anomaly", desc: "Packet Loss & CPU Overload" },
              { id: "transport_delay", name: "Campus Transport Delay", desc: "Peak Traffic & Weather Delay" },
              { id: "electrical_grid", name: "Electrical Grid Anomaly", desc: "Substation Voltage Fluctuation" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedMlModel(m.id);
                  setMlPrediction(null);
                }}
                className={`w-full text-left p-2.5 rounded-lg border font-mono text-xs transition-all ${
                  selectedMlModel === m.id
                    ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#FFFFFF]"
                    : "bg-[#181A22] border-[#252833] text-[#8A8594] hover:text-[#E2E1E6]"
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>{m.name}</span>
                  {selectedMlModel === m.id && <Sparkles className="w-3 h-3 text-[#D4AF37]" />}
                </div>
                <div className="text-[10px] text-[#9D8EB5] mt-0.5">{m.desc}</div>
              </button>
            ))}
          </div>

          {/* Model Details & Execution Card */}
          <div className="md:col-span-3 p-4 rounded-lg bg-[#191B24] border border-[#2B2E3D] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-[#F5D061]">
                    Active Pipeline: {selectedMlModel.toUpperCase()}
                  </span>
                  <p className="text-[11px] text-[#9D8EB5] font-mono mt-0.5">
                    Artifact: {selectedMlModel}_model.joblib • Trained on 5,000 synthetic campus records
                  </p>
                </div>

                <button
                  onClick={() => handleRunSampleInference(selectedMlModel)}
                  disabled={isPredicting}
                  className="px-4 py-2 rounded bg-[#D4AF37] hover:bg-[#E6C45E] text-[#121316] font-bold font-mono text-xs transition-all shadow-md flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isPredicting ? "Computing..." : "Run Live Inference"}</span>
                </button>
              </div>

              {/* Inference Result Presentation */}
              {mlPrediction ? (
                <div className="p-3.5 rounded-lg bg-[#14151C] border border-[#3E4254] font-mono text-xs space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[#9D8EB5]">Inference Output:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-xs ${
                        mlPrediction.prediction.includes("FAIL") || mlPrediction.prediction.includes("FAULT")
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {mlPrediction.prediction}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#9D8EB5]">Model Confidence:</span>
                    <span className="text-[#F5D061] font-bold">
                      {(mlPrediction.confidence * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#767180] pt-1 border-t border-[#252833]">
                    <span>Target: {mlPrediction.target_entity_id}</span>
                    <span>Provenance: {mlPrediction.provenance}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-[#14151C] border border-[#232633] text-center font-mono text-xs text-[#8A8594]">
                  Click &quot;Run Live Inference&quot; to evaluate this model against simulated real-time telemetry inputs.
                </div>
              )}
            </div>

            <div className="text-[10px] font-mono text-[#5A5565] pt-2 border-t border-[#252833] flex justify-between">
              <span>Framework: Scikit-Learn 1.6+</span>
              <span>Latency: &lt; 15ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}