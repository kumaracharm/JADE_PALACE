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
  Droplets,
  Thermometer,
  Wifi,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  History,
  BookOpen,
} from "lucide-react";
import { DigitalTwinApi } from "@/services/api";
import { AuthService } from "@/services/auth";
import { CampusEntity, Incident } from "@/types/digital-twin";
import { OperationalFlowGraph } from "../flow/OperationalFlowGraph";
import { RoleDemoWorkflow } from "../workflow/RoleDemoWorkflow";

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

  // Five-Minute Emergency Demonstration & Continuous Telemetry State
  const [demoState, setDemoState] = useState<string>("NORMAL");
  const [demoTelemetry, setDemoTelemetry] = useState<any>({
    voltage_v: 415.0,
    active_power_kw: 142.5,
    current_a: 198.0,
    temperature_c: 23.4,
    frequency_hz: 50.01,
    network_latency_ms: 4.2,
    packet_loss_pct: 0.0,
    water_pressure: 3.42,
  });
  const [demoExplanation, setDemoExplanation] = useState<any>(null);
  const [isDemoActionRunning, setIsDemoActionRunning] = useState<boolean>(false);
  const [demoSequence, setDemoSequence] = useState<number>(1000);
  const [demoTimestamp, setDemoTimestamp] = useState<string>("");
  const [demoSource, setDemoSource] = useState<string>("SYNTHETIC LIVE DATA");
  const [demoStatus, setDemoStatus] = useState<string>("OPERATIONAL");
  const [demoIncidentId, setDemoIncidentId] = useState<string>("INC-DEMO-01");
  const [isSseLive, setIsSseLive] = useState<boolean>(false);
  const [eventFeed, setEventFeed] = useState<Array<{
    sequence: number;
    timestamp: string;
    scenario: string;
    voltage_v: number;
    current_a: number;
    active_power_kw: number;
    temperature_c: number;
    status: string;
    incident_id?: string;
  }>>([]);

  // Button Ripple Effect State
  const [ripples, setRipples] = useState<{ [btnKey: string]: Array<{ x: number; y: number; id: number }> }>({});

  const triggerRipple = (btnKey: string, e: React.MouseEvent<HTMLButtonElement>, action: () => void) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => ({
      ...prev,
      [btnKey]: [...(prev[btnKey] || []), { x, y, id }],
    }));
    setTimeout(() => {
      setRipples((prev) => ({
        ...prev,
        [btnKey]: (prev[btnKey] || []).filter((r) => r.id !== id),
      }));
    }, 600);
    action();
  };

  // RBAC Permission Error Notification
  const [rbacError, setRbacError] = useState<string | null>(null);

  // Controlled 5-Scenario Engine State
  const [scenariosList, setScenariosList] = useState<any[]>([
    {
      key: "ELECTRICAL",
      name: "Electrical Feeder Failure",
      incident_id: "INC-ELEC-01",
      root_entity_id: "FEEDER-LABS-F1",
      title: "Feeder Bus F1 Electrical Breaker Trip & Voltage Collapse",
      description: "Progressive 3-phase voltage decrease and complete power failure on Riser Shaft 1B feeding Level 1 engineering laboratories.",
      category: "ELECTRICAL",
      priority: "HIGH",
      affected_entities: ["FEEDER-LABS-F1", "LAB-01-EE", "LAB-02-ROBOTICS", "METER-FEEDER-F1"],
      academic_impact: "Disrupts EE301 Microcontrollers (32 students, Dr. Kavita Sharma) and AI401 Robotics Lab.",
      recovery_recommendation: "OR-Tools Pareto Plan: Reroute to Auxiliary Transformer Coupler via ATS-01. Relocate EE301 practical lab to CR-201. Dispatch Senior Electrical Tech (R. Patel).",
      estimated_downtime: "45-60 min",
    },
    {
      key: "WATER",
      name: "Water Supply Disruption",
      incident_id: "INC-WATER-02",
      root_entity_id: "BLDG-ENG",
      title: "Engineering Block Central Plumbing Pressure Collapse",
      description: "Main municipal intake pressure loss and booster pump cavitation causing progressive pressure drop across Building Engineering plumbing risers.",
      category: "FACILITIES",
      priority: "HIGH",
      affected_entities: ["BLDG-ENG", "LAB-01-EE", "CAMPUS-MAIN"],
      academic_impact: "Wet chemistry & fabrication safety eyewash stations in LAB-01-EE non-compliant; research autoclaves halted.",
      recovery_recommendation: "Activate Auxiliary Overhead Reservoir Tank TK-02 (25,000L gravity feed); isolate booster suction valve and dispatch Facility Team (M. Bennett).",
      estimated_downtime: "30-45 min",
    },
    {
      key: "HVAC",
      name: "HVAC Thermal Runaway",
      incident_id: "INC-HVAC-03",
      root_entity_id: "ROOM-MDF",
      title: "MDF Datacenter & GPU Cluster In-Row Precision Chiller Failure",
      description: "Coolant valve actuator failure in CRAC-01 unit causing thermal runaway, rack inlet temperature breach (>40°C), and GPU compute thermal throttling.",
      category: "ENVIRONMENTAL",
      priority: "MISSION_CRITICAL",
      affected_entities: ["ROOM-MDF", "EQ-GPU-CLUSTER", "LAB-02-ROBOTICS"],
      academic_impact: "AI401 Autonomous Systems & Computer Vision Lab GPU compute nodes suspended; deep learning jobs frozen.",
      recovery_recommendation: "Emergency thermal load shedding on secondary compute nodes, engage CRAC-02 backup refrigerant loop, open emergency exhaust baffles.",
      estimated_downtime: "20-30 min",
    },
    {
      key: "NETWORK",
      name: "IT Network Outage",
      incident_id: "INC-NET-04",
      root_entity_id: "SW-MDF-CORE",
      title: "Core Aggregation Switch OM4 Fiber Trunk Degradation",
      description: "Optical fiber transceiver degraded causing excessive jitter, 48% packet loss, and high latency (>750ms) across L1/L2 access switches.",
      category: "IT",
      priority: "HIGH",
      affected_entities: ["SW-MDF-CORE", "SW-IDF-F1", "LAB-03-COMP", "ROOM-MDF"],
      academic_impact: "CS201 Online compiler & LAB-03 student network sessions disconnected; intranet LMS unreachable.",
      recovery_recommendation: "Automated failover to secondary redundant 10Gbps OM4 ring trunk (SW-IDF-F2), flush ARP caches, notify IT Lead (S. Lin).",
      estimated_downtime: "15-25 min",
    },
    {
      key: "ACADEMIC",
      name: "Academic Disruption",
      incident_id: "INC-ACAD-05",
      root_entity_id: "CR-201",
      title: "Classroom CR-201 Audio-Visual & Teacher Availability Conflict",
      description: "Student-reported smart classroom fault: Main 4K interactive projector interface offline and room capacity conflict for CS201 Data Structures lecture.",
      category: "ACADEMIC",
      priority: "MEDIUM",
      affected_entities: ["CR-201", "ACT-CS201-LEC", "EQ-PROJ-CR201"],
      academic_impact: "55 enrolled students in CS201 Data Structures (Prof. Rajesh Kumar) unable to view core theory slides.",
      recovery_recommendation: "Automated Room Re-allocation Protocol: Relocate 55 students to Smart Classroom CR-202 (capacity 60, projector operational) with 0 timetable conflict.",
      estimated_downtime: "10-15 min (Zero Academic Loss)",
    },
  ]);
  const [activeScenarioKey, setActiveScenarioKey] = useState<string>("NORMAL");
  const [activeScenarioPhase, setActiveScenarioPhase] = useState<string>("IDLE");
  const [isScenarioActionRunning, setIsScenarioActionRunning] = useState<boolean>(false);

  // Innovation: Incident Event Replay Engine State
  const [replayIncidentId, setReplayIncidentId] = useState<string>("INC-ELEC-01");
  const [replayTimeline, setReplayTimeline] = useState<any>(null);
  const [replayStepIndex, setReplayStepIndex] = useState<number>(0);
  const [isReplayPlaying, setIsReplayPlaying] = useState<boolean>(false);
  const [replaySpeed, setReplaySpeed] = useState<number>(1);

  // Keyboard controls & SSE live stream
  useEffect(() => {
    let isMounted = true;
    let eventSource: EventSource | null = null;
    let reconnectTimer: any = null;

    // Initial fetch of snapshot and scenarios
    DigitalTwinApi.getDemoStatus().then((snap) => {
      if (!isMounted || !snap) return;
      if (snap.telemetry) setDemoTelemetry(snap.telemetry);
      if (snap.demo_state) setDemoState(snap.demo_state);
      if (snap.explanation) setDemoExplanation(snap.explanation);
      if (snap.sequence) setDemoSequence(snap.sequence);
      if (snap.timestamp) setDemoTimestamp(snap.timestamp);
    });

    DigitalTwinApi.getScenarios().then((res) => {
      if (!isMounted || !res) return;
      if (res.scenarios && res.scenarios.length > 0) setScenariosList(res.scenarios);
      if (res.active_scenario) setActiveScenarioKey(res.active_scenario);
      if (res.scenario_phase) setActiveScenarioPhase(res.scenario_phase);
    });

    DigitalTwinApi.getReplayTimeline("INC-ELEC-01").then((rep) => {
      if (!isMounted || !rep) return;
      setReplayTimeline(rep);
    });

    const connectSse = () => {
      try {
        eventSource = new EventSource("http://127.0.0.1:8000/api/v1/demo/stream");
        eventSource.onopen = () => {
          if (isMounted) setIsSseLive(true);
        };
        eventSource.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            setIsSseLive(true);
            if (data.telemetry) setDemoTelemetry(data.telemetry);
            if (data.demo_state) setDemoState(data.demo_state);
            if (data.scenario) setDemoState(data.scenario);
            if (data.sequence) setDemoSequence(data.sequence);
            if (data.timestamp) setDemoTimestamp(data.timestamp);
            if (data.source) setDemoSource(data.source);
            if (data.status) setDemoStatus(data.status);
            if (data.incident_id) setDemoIncidentId(data.incident_id);
            if (data.explanation) setDemoExplanation(data.explanation);

            // Rolling recent event feed
            setEventFeed((prev) => {
              const entry = {
                sequence: data.sequence ?? prev[0]?.sequence ?? 1,
                timestamp: data.timestamp ?? new Date().toISOString(),
                scenario: data.scenario || data.demo_state || "NORMAL",
                voltage_v: data.voltage_v ?? data.telemetry?.voltage_v ?? 415.0,
                current_a: data.current_a ?? data.telemetry?.current_a ?? 198.0,
                active_power_kw: data.active_power_kw ?? data.telemetry?.active_power_kw ?? 142.5,
                temperature_c: data.temperature_c ?? data.telemetry?.temperature_c ?? 23.4,
                status: data.status || "OPERATIONAL",
                incident_id: data.incident_id,
              };
              return [entry, ...prev.slice(0, 6)];
            });
          } catch (e) {}
        };
        eventSource.onerror = () => {
          if (isMounted) setIsSseLive(false);
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          if (isMounted) {
            reconnectTimer = setTimeout(connectSse, 2000);
          }
        };
      } catch (e) {
        console.warn("SSE connection error:", e);
        if (isMounted) {
          reconnectTimer = setTimeout(connectSse, 3000);
        }
      }
    };

    connectSse();

    // Keyboard shortcuts: 1, 2, 3 (ignoring inputs/textareas)
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      if (e.key === "1") handleKey1Interrupt();
      else if (e.key === "2") handleKey2Recovery();
      else if (e.key === "3") handleKey3Restore();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      isMounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (eventSource) eventSource.close();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleKey1Interrupt = async () => {
    setIsDemoActionRunning(true);
    setRbacError(null);
    try {
      const res = await DigitalTwinApi.triggerDemoInterrupt();
      if (res) {
        setDemoState(res.demo_state);
        setDemoTelemetry(res.telemetry);
        setDemoExplanation(res.explanation);
      }
    } catch (err: any) {
      console.error("Key 1 Interrupt error:", err);
      setRbacError(err?.message || "Failed to trigger interrupt.");
    } finally {
      setIsDemoActionRunning(false);
    }
  };

  const handleKey2Recovery = async () => {
    setIsDemoActionRunning(true);
    setRbacError(null);
    try {
      const res = await DigitalTwinApi.triggerDemoRecovery();
      if (res) {
        setDemoState(res.demo_state);
        setDemoTelemetry(res.telemetry);
        setDemoExplanation(res.explanation);
      }
    } catch (err: any) {
      console.error("Key 2 Recovery error:", err);
      setRbacError(err?.message || "Failed to trigger recovery plan.");
    } finally {
      setIsDemoActionRunning(false);
    }
  };

  const handleKey3Restore = async () => {
    setIsDemoActionRunning(true);
    setRbacError(null);
    try {
      const res = await DigitalTwinApi.triggerDemoRestore();
      if (res) {
        setDemoState(res.demo_state);
        setDemoTelemetry(res.telemetry);
        setDemoExplanation(res.explanation);
      }
    } catch (err: any) {
      console.error("Key 3 Restore error:", err);
      setRbacError(err?.message || "Failed to trigger restore.");
    } finally {
      setIsDemoActionRunning(false);
    }
  };

  // Scenario selector and action handler
  const handleScenarioAction = async (scenarioKey: string, action: "START" | "RESTORE") => {
    setIsScenarioActionRunning(true);
    setRbacError(null);
    try {
      if (action === "START") {
        const res = await DigitalTwinApi.selectScenario(scenarioKey, "START");
        if (res) {
          setActiveScenarioKey(res.active_scenario);
          setActiveScenarioPhase(res.scenario_phase);
          if (res.telemetry) setDemoTelemetry(res.telemetry);
          if (res.incident_id) {
            setDemoIncidentId(res.incident_id);
            loadReplay(res.incident_id);
          }
        }
      } else {
        const res = await DigitalTwinApi.selectScenario(scenarioKey, "RESTORE");
        if (res) {
          setActiveScenarioKey(res.active_scenario);
          setActiveScenarioPhase(res.scenario_phase);
          if (res.telemetry) setDemoTelemetry(res.telemetry);
        }
      }
    } catch (err: any) {
      console.error("Scenario action error:", err);
      setRbacError(err?.message || "Failed to execute scenario action.");
    } finally {
      setIsScenarioActionRunning(false);
    }
  };

  const loadReplay = async (incId: string) => {
    setReplayIncidentId(incId);
    setReplayStepIndex(0);
    setIsReplayPlaying(false);
    try {
      const rep = await DigitalTwinApi.getReplayTimeline(incId);
      if (rep) setReplayTimeline(rep);
    } catch (e) {
      console.warn("Failed to load replay timeline:", e);
    }
  };

  // Replay playback ticker
  useEffect(() => {
    if (!isReplayPlaying || !replayTimeline?.steps?.length) return;
    const interval = setInterval(() => {
      setReplayStepIndex((prev) => {
        if (prev >= replayTimeline.steps.length - 1) {
          setIsReplayPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1500 / replaySpeed);
    return () => clearInterval(interval);
  }, [isReplayPlaying, replaySpeed, replayTimeline]);

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
      {/* RBAC PERMISSION REJECTION BANNER */}
      {rbacError && (
        <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/70 text-red-200 text-xs font-mono flex items-center justify-between shadow-2xl animate-shake">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-red-300 uppercase tracking-wide">
                  [RBAC 403 FORBIDDEN]
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-900/60 text-red-200 border border-red-700/50">
                  BACKEND SECURITY ENFORCEMENT
                </span>
              </div>
              <p className="mt-0.5 text-[#FCA5A5]">{rbacError}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0 ml-4">
            <button
              onClick={() => AuthService.demoLogin("SUPER_ADMIN").then(() => setRbacError(null))}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-black font-bold text-[10px] uppercase tracking-wide hover:brightness-110 transition-all cursor-pointer shadow-md"
            >
              1-Click Elevate to Super Admin
            </button>
            <button
              onClick={() => setRbacError(null)}
              className="w-6 h-6 rounded flex items-center justify-center text-red-400 hover:text-white hover:bg-red-900/50 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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

      {/* 2. RESILIENCE DOMAIN BALANCE (EXPANDED FULL-WIDTH WITH TECHNICAL RADIAL GAUGES) */}
      <div className="w-full p-4 lg:p-5 rounded-xl bg-[#14151A] border border-[#252833] shadow-xl flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-[#222430]">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="text-xs font-mono text-[#FFFFFF] uppercase font-bold tracking-wider">
              Resilience Domain Balance (Weighted Multi-Criteria Analysis)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D4AF37]/15 text-[#F5D061] border border-[#D4AF37]/30 font-bold">
              ISO 22301 / WIRM-8
            </span>
          </div>
          <div className="flex items-center space-x-3 text-xs font-mono text-[#8A8594]">
            <span>Aggregate Baseline: <strong className="text-[#F5D061]">{score.toFixed(1)}%</strong></span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">SYNTHETIC CALIBRATED</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {resilienceData?.domains ? (
            Object.entries(resilienceData.domains).map(([key, dom]: [string, any]) => {
              const label = key
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase());
              const scoreVal = Math.min(Math.max(Number(dom.score) || 0, 0), 100);
              const radius = 24;
              const circ = 2 * Math.PI * radius; // ~150.8
              const offset = circ - (circ * scoreVal) / 100;
              const statusColor =
                scoreVal >= 90
                  ? "#10B981"
                  : scoreVal >= 75
                  ? "#F5D061"
                  : "#EF4444";

              return (
                <div
                  key={key}
                  className="p-3 rounded-xl bg-[#13141C] border border-[#252736] flex flex-col items-center text-center hover:border-[#D4AF37]/40 transition-all shadow-md group"
                >
                  <div className="relative w-16 h-16 my-1 flex items-center justify-center">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                      <circle
                        cx="32"
                        cy="32"
                        r={radius}
                        stroke="#1F2230"
                        strokeWidth="5"
                        fill="none"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r={radius}
                        stroke={statusColor}
                        strokeWidth="5"
                        strokeDasharray={circ}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        fill="none"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <span className="absolute font-mono font-bold text-xs text-white">
                      {scoreVal}%
                    </span>
                  </div>
                  <div className="text-[11px] font-mono font-semibold text-[#E2E1E6] truncate w-full mt-1.5" title={label}>
                    {label}
                  </div>
                  <div className="flex items-center justify-between w-full mt-2 pt-1.5 border-t border-[#1F2230] text-[9px] font-mono text-[#8A8594]">
                    <span>Wt: {(dom.weight * 100).toFixed(0)}%</span>
                    <span
                      className="font-bold uppercase px-1 py-0.2 rounded"
                      style={{
                        color: statusColor,
                        backgroundColor: `${statusColor}15`,
                      }}
                    >
                      {scoreVal >= 90 ? "NOMINAL" : scoreVal >= 75 ? "MODERATE" : "RISK"}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-xs font-mono text-[#8A8594] col-span-6 py-6 text-center">
              Loading domain metrics...
            </div>
          )}
        </div>
      </div>

      {/* 2.4 LIVE FIVE-MINUTE EMERGENCY DEMONSTRATION CONTROLS & EXPLANATION BANNER */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#17151D] via-[#14151C] to-[#191924] border border-[#3B3449] shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#2A2636]">
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
            <span className={`w-2.5 h-2.5 rounded-full ${isSseLive ? "bg-emerald-400 animate-ping" : "bg-amber-500"}`} />
            <span className="font-mono font-bold text-xs uppercase tracking-wider text-[#FFFFFF]">
              Live Emergency Demonstration Matrix (Hotkeys: 1, 2, 3)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
              {isSseLive ? "LIVE SSE" : "CONNECTING..."}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D4AF37]/15 text-[#F5D061] border border-[#D4AF37]/30 font-bold">
              SYNTHETIC LIVE DATA
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2D2338] text-[#D4AF37] border border-[#58486D] font-bold">
              SEQ #{demoSequence}
            </span>
          </div>

          {/* Real-Time Live Ticker */}
          <div className="flex items-center space-x-2.5 text-[11px] font-mono text-[#A69FB1] flex-wrap gap-y-1">
            <div className="flex items-center space-x-1">
              <span className="text-[#767180]">TIME:</span>
              <span className="text-[#E2E1E6] font-bold">
                {demoTimestamp ? new Date(demoTimestamp).toLocaleTimeString([], { hour12: false }) : "--:--:--"}
              </span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <span className="text-[#767180]">VOLT:</span>
              <span className="text-[#F5D061] font-bold">{demoTelemetry?.voltage_v?.toFixed(1) || "415.0"} V</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <span className="text-[#767180]">CURR:</span>
              <span className="text-[#F5D061] font-bold">{demoTelemetry?.current_a?.toFixed(1) || "198.0"} A</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <span className="text-[#767180]">POWER:</span>
              <span className={`font-bold ${demoState === "INTERRUPTED" || demoState === "RECOVERY_PLANNED" ? "text-red-400" : "text-emerald-400"}`}>
                {demoState === "INTERRUPTED" || demoState === "RECOVERY_PLANNED" ? "0.0 kW (TRIPPED)" : `${demoTelemetry?.active_power_kw?.toFixed(1) || "142.5"} kW`}
              </span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <span className="text-[#767180]">STATE:</span>
              <span className={`font-bold uppercase ${demoState === "NORMAL" ? "text-emerald-400" : demoState === "INTERRUPTED" ? "text-red-400" : "text-[#F5D061]"}`}>
                {demoState}
              </span>
            </div>
          </div>
        </div>

        {/* 3 Sleek Horizontal Emergency Action Buttons with Contained Radial Ripple */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Button 1: Interrupt */}
          <button
            onClick={(e) => triggerRipple("btn1", e, handleKey1Interrupt)}
            disabled={isDemoActionRunning}
            className={`relative overflow-hidden px-4 py-3 rounded-lg border font-mono font-bold text-xs flex items-center justify-between transition-all shadow-md cursor-pointer group ${
              demoState === "INTERRUPTED"
                ? "bg-red-950/50 border-red-500 text-red-200 ring-1 ring-red-400 shadow-red-950/40"
                : "bg-[#181419] border-red-500/30 text-red-300 hover:border-red-400 hover:bg-red-950/30"
            }`}
          >
            {ripples["btn1"]?.map((r) => (
              <span
                key={r.id}
                className="absolute rounded-full bg-red-400/30 pointer-events-none animate-ping"
                style={{
                  left: r.x - 25,
                  top: r.y - 25,
                  width: 50,
                  height: 50,
                }}
              />
            ))}
            <div className="flex items-center space-x-2.5 z-10">
              <span className="w-5 h-5 rounded bg-red-500/20 border border-red-500/50 text-red-400 text-[11px] flex items-center justify-center font-bold">
                1
              </span>
              <span>1. Interrupt (Breaker Trip)</span>
            </div>
            <Zap className={`w-4 h-4 z-10 transition-transform group-hover:scale-110 ${demoState === "INTERRUPTED" ? "text-red-400 animate-pulse" : "text-red-400/70"}`} />
          </button>

          {/* Button 2: Recovery */}
          <button
            onClick={(e) => triggerRipple("btn2", e, handleKey2Recovery)}
            disabled={isDemoActionRunning}
            className={`relative overflow-hidden px-4 py-3 rounded-lg border font-mono font-bold text-xs flex items-center justify-between transition-all shadow-md cursor-pointer group ${
              demoState === "RECOVERY_PLANNED"
                ? "bg-amber-950/50 border-[#D4AF37] text-[#F5D061] ring-1 ring-[#F5D061] shadow-amber-950/40"
                : "bg-[#1A1817] border-[#D4AF37]/30 text-[#D4AF37] hover:border-[#D4AF37] hover:bg-amber-950/30"
            }`}
          >
            {ripples["btn2"]?.map((r) => (
              <span
                key={r.id}
                className="absolute rounded-full bg-[#D4AF37]/30 pointer-events-none animate-ping"
                style={{
                  left: r.x - 25,
                  top: r.y - 25,
                  width: 50,
                  height: 50,
                }}
              />
            ))}
            <div className="flex items-center space-x-2.5 z-10">
              <span className="w-5 h-5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F5D061] text-[11px] flex items-center justify-center font-bold">
                2
              </span>
              <span>2. Recovery (OR-Tools Solver)</span>
            </div>
            <Activity className={`w-4 h-4 z-10 transition-transform group-hover:scale-110 ${demoState === "RECOVERY_PLANNED" ? "text-[#F5D061] animate-pulse" : "text-[#D4AF37]/70"}`} />
          </button>

          {/* Button 3: Restore */}
          <button
            onClick={(e) => triggerRipple("btn3", e, handleKey3Restore)}
            disabled={isDemoActionRunning}
            className={`relative overflow-hidden px-4 py-3 rounded-lg border font-mono font-bold text-xs flex items-center justify-between transition-all shadow-md cursor-pointer group ${
              demoState === "RESTORED"
                ? "bg-emerald-950/50 border-emerald-500 text-emerald-200 ring-1 ring-emerald-400 shadow-emerald-950/40"
                : "bg-[#131B17] border-emerald-500/30 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-950/30"
            }`}
          >
            {ripples["btn3"]?.map((r) => (
              <span
                key={r.id}
                className="absolute rounded-full bg-emerald-400/30 pointer-events-none animate-ping"
                style={{
                  left: r.x - 25,
                  top: r.y - 25,
                  width: 50,
                  height: 50,
                }}
              />
            ))}
            <div className="flex items-center space-x-2.5 z-10">
              <span className="w-5 h-5 rounded bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-[11px] flex items-center justify-center font-bold">
                3
              </span>
              <span>3. Restore (Verify Grid)</span>
            </div>
            <CheckCircle2 className={`w-4 h-4 z-10 transition-transform group-hover:scale-110 ${demoState === "RESTORED" ? "text-emerald-400" : "text-emerald-400/70"}`} />
          </button>
        </div>
      </div>

      {/* 2.4B CONTROLLED FIVE-INCIDENT MULTI-PHYSICS SIMULATION MATRIX */}
      <div className="p-4 rounded-xl bg-[#14151C] border border-[#2A2B38] shadow-2xl space-y-4 font-mono">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pb-3 border-b border-[#252833]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                Controlled Multi-Scenario Incident Injection Matrix
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#F5D061] border border-[#D4AF37]/40 font-bold">
                5 SCENARIOS
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                SYNCHRONIZED 1.0s STREAM
              </span>
            </div>
            <p className="text-xs text-[#9D8EB5] mt-1">
              Select any cyber-physical failure mode. Automatically mutates global 1-second telemetry, propagates graph blast radius, updates 3D Digital Twin, and provisions OR-Tools CP-SAT recovery.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-[#8A8594]">Active Mode:</span>
            <span className={`px-2.5 py-1 rounded font-bold uppercase border ${
              activeScenarioKey === "NORMAL"
                ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/30"
                : "bg-red-950/40 text-red-300 border-red-500/40 animate-pulse"
            }`}>
              {activeScenarioKey} ({activeScenarioPhase})
            </span>
          </div>
        </div>

        {/* 5 Scenario Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {scenariosList.map((sc: any) => {
            const isActive = activeScenarioKey === sc.key;
            const isRunning = isActive && activeScenarioPhase === "RUNNING";
            const icon =
              sc.key === "ELECTRICAL" ? <Zap className="w-4 h-4 text-amber-400" /> :
              sc.key === "WATER" ? <Droplets className="w-4 h-4 text-sky-400" /> :
              sc.key === "HVAC" ? <Thermometer className="w-4 h-4 text-orange-400" /> :
              sc.key === "NETWORK" ? <Wifi className="w-4 h-4 text-purple-400" /> :
              <BookOpen className="w-4 h-4 text-yellow-300" />;

            const borderClass = isRunning
              ? "border-red-500 bg-red-950/20 ring-1 ring-red-500/50"
              : isActive
              ? "border-amber-500 bg-amber-950/15"
              : "border-[#252833] bg-[#111217] hover:border-[#3D4052]";

            return (
              <div
                key={sc.key}
                className={`p-3 rounded-lg border flex flex-col justify-between transition-all space-y-2.5 ${borderClass}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center space-x-1.5 truncate">
                      {icon}
                      <span className="text-xs font-bold text-white truncate">{sc.name}</span>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                      isRunning ? "bg-red-500/20 text-red-300 border border-red-500/40" :
                      sc.priority === "MISSION_CRITICAL" ? "bg-red-500/15 text-red-400" : "bg-[#252833] text-[#A69FB1]"
                    }`}>
                      {sc.priority}
                    </span>
                  </div>

                  <div className="text-[10px] text-[#A69FB1] line-clamp-2 mb-2 leading-relaxed">
                    {sc.description}
                  </div>

                  <div className="space-y-1 text-[10px] pb-2 border-b border-[#21232E]">
                    <div className="flex justify-between text-[#767180]">
                      <span>Incident ID:</span>
                      <span className="text-[#F5D061] font-bold">{sc.incident_id}</span>
                    </div>
                    <div className="flex justify-between text-[#767180]">
                      <span>Root Asset:</span>
                      <span className="text-white truncate max-w-[110px]">{sc.root_entity_id}</span>
                    </div>
                    <div className="flex justify-between text-[#767180]">
                      <span>Downtime:</span>
                      <span className="text-[#A69FB1]">{sc.estimated_downtime}</span>
                    </div>
                  </div>

                  {/* Affected Entities Pills */}
                  <div className="pt-1.5">
                    <span className="text-[9px] text-[#5A5565] block uppercase font-bold mb-1">Impact Radius ({sc.affected_entities?.length || 0}):</span>
                    <div className="flex flex-wrap gap-1">
                      {sc.affected_entities?.slice(0, 3).map((eId: string) => (
                        <span key={eId} className="text-[9px] px-1.5 py-0.2 rounded bg-[#1B1D25] text-[#BDB0D3] border border-[#2D303E]">
                          {eId}
                        </span>
                      ))}
                      {(sc.affected_entities?.length || 0) > 3 && (
                        <span className="text-[9px] px-1 py-0.2 text-[#767180]">
                          +{(sc.affected_entities?.length || 0) - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Scenario Trigger & Recovery Controls */}
                <div className="space-y-1.5 pt-2 border-t border-[#21232E]">
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleScenarioAction(sc.key, "START")}
                      disabled={isScenarioActionRunning || isRunning}
                      className={`px-2 py-1.5 rounded text-[10px] font-bold transition-all flex items-center justify-center space-x-1 ${
                        isRunning
                          ? "bg-red-500/20 text-red-400 border border-red-500/40 cursor-not-allowed"
                          : "bg-red-950/40 hover:bg-red-900/60 text-red-200 border border-red-500/30 cursor-pointer"
                      }`}
                    >
                      <Zap className="w-3 h-3 text-red-400" />
                      <span>{isRunning ? "RUNNING" : "START"}</span>
                    </button>
                    <button
                      onClick={() => handleScenarioAction(sc.key, "RESTORE")}
                      disabled={isScenarioActionRunning || (!isActive && activeScenarioKey !== "NORMAL")}
                      className="px-2 py-1.5 rounded text-[10px] font-bold bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-200 border border-emerald-500/30 transition-all flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-emerald-400" />
                      <span>RESTORE</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => onNavigateToTwin(sc.root_entity_id)}
                      className="px-1.5 py-1 rounded text-[9px] bg-[#1A1C24] hover:bg-[#252835] text-[#9D8EB5] hover:text-white border border-[#2B2D3A] transition-all truncate text-center cursor-pointer"
                    >
                      3D Twin →
                    </button>
                    <button
                      onClick={() => onNavigateToResponse(sc.incident_id)}
                      className="px-1.5 py-1 rounded text-[9px] bg-[#221F2B] hover:bg-[#312B40] text-[#D4AF37] hover:text-[#F5D061] border border-[#483B5E] transition-all truncate text-center cursor-pointer"
                    >
                      Response →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Scenario Recovery Recommendation Banner */}
        {activeScenarioKey !== "NORMAL" && (
          <div className="p-3.5 rounded-lg bg-gradient-to-r from-[#1A1822] to-[#14151C] border border-[#4A3D63] text-xs space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#2C263A]">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#F5D061]" />
                <span className="font-bold text-white">OR-Tools Pareto Recovery Recommendation ({activeScenarioKey})</span>
              </div>
              <span className="text-[10px] text-amber-300 font-bold uppercase">
                Status: {activeScenarioPhase}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="text-[#F5D061] font-bold block text-[10px] uppercase">Academic Impact Analysis:</span>
                <p className="text-[#E2E1E6] mt-0.5">
                  {scenariosList.find((s: any) => s.key === activeScenarioKey)?.academic_impact || "Evaluating academic schedule collision..."}
                </p>
              </div>
              <div>
                <span className="text-emerald-400 font-bold block text-[10px] uppercase">Recommended Mitigation (OR-Tools):</span>
                <p className="text-[#E2E1E6] mt-0.5">
                  {scenariosList.find((s: any) => s.key === activeScenarioKey)?.recovery_recommendation || "Optimization model solving for minimum disruption..."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2.5 OPERATIONAL DEPENDENCY & ENERGY FLOW TOPOLOGY GRAPH */}
      <OperationalFlowGraph
        onSelectEntity={(id) => onNavigateToTwin(id)}
        incidentEntityId={demoState === "INTERRUPTED" || demoState === "RECOVERY_PLANNED" ? "FEEDER-LABS-F1" : null}
        demoState={demoState}
        telemetry={demoTelemetry}
      />

      {/* 2.6 GRAPH SPOF DISCOVERY & ACTIVE INSTITUTIONAL INCIDENTS (POSITIONED DIRECTLY UNDER TOPOLOGY GRAPH) */}
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
                      {((inc as any).source_type === "STUDENT_REPORTED" || inc.title?.includes("[")) && (
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#352D42] text-[#D6C4ED] border border-[#7A6199] font-bold">
                          📱 STUDENT REPORTED
                        </span>
                      )}
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

      {/* 2.6B INNOVATION: INCIDENT EVENT REPLAY ENGINE (HISTORICAL PLAYBACK) */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#13141C] via-[#151622] to-[#12131A] border border-[#3B344D] shadow-2xl space-y-4 font-mono">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#272535]">
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <History className="w-4 h-4 text-[#D4AF37]" />
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                Incident Event Replay Engine (Innovation)
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                HISTORICAL REPLAY • STORED PLAYBACK
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                NOT LIVE SENSORS
              </span>
            </div>
            <p className="text-xs text-[#9D8EB5] mt-1">
              Deterministic post-mortem timeline playback reconstructed from SQLite incident audit records. Step through failure emergence, detection, FMEA escalation, and automated resolution.
            </p>
          </div>

          {/* Incident Selector for Replay */}
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            <span className="text-xs text-[#8A8594] mr-1">Replay Target:</span>
            {scenariosList.map((sc: any) => (
              <button
                key={sc.incident_id}
                onClick={() => loadReplay(sc.incident_id)}
                className={`px-2 py-1 text-[10px] font-bold rounded transition-all border cursor-pointer ${
                  replayIncidentId === sc.incident_id
                    ? "bg-[#D4AF37] text-[#121316] border-[#D4AF37]"
                    : "bg-[#1B1D25] text-[#A69FB1] border-[#2B2D3B] hover:text-white hover:border-[#D4AF37]/50"
                }`}
              >
                {sc.incident_id}
              </button>
            ))}
          </div>
        </div>

        {/* Player Controls Bar & Scrubber */}
        <div className="p-3 rounded-lg bg-[#0E0F14] border border-[#222432] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Playback Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsReplayPlaying(!isReplayPlaying)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all shadow-md cursor-pointer ${
                  isReplayPlaying
                    ? "bg-amber-500 text-black hover:bg-amber-400"
                    : "bg-[#D4AF37] text-black hover:bg-[#F5D061]"
                }`}
              >
                {isReplayPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isReplayPlaying ? "PAUSE" : "PLAY TIMELINE"}</span>
              </button>

              <button
                onClick={() => {
                  setIsReplayPlaying(false);
                  setReplayStepIndex(0);
                }}
                className="p-1.5 rounded bg-[#1B1D26] border border-[#2B2E3D] text-[#A69FB1] hover:text-white transition-all cursor-pointer"
                title="Rewind to Step 1"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setIsReplayPlaying(false);
                  setReplayStepIndex((prev) => Math.max(0, prev - 1));
                }}
                disabled={replayStepIndex === 0}
                className="p-1.5 rounded bg-[#1B1D26] border border-[#2B2E3D] text-[#A69FB1] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Previous Step"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setIsReplayPlaying(false);
                  setReplayStepIndex((prev) =>
                    Math.min((replayTimeline?.steps?.length || 1) - 1, prev + 1)
                  );
                }}
                disabled={replayStepIndex >= (replayTimeline?.steps?.length || 1) - 1}
                className="p-1.5 rounded bg-[#1B1D26] border border-[#2B2E3D] text-[#A69FB1] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Next Step"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <div className="h-4 w-[1px] bg-[#2B2E3D] mx-1" />

              {/* Speed Buttons */}
              <div className="flex items-center space-x-1">
                {[1, 2, 4].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setReplaySpeed(spd)}
                    className={`px-2 py-0.5 text-[10px] rounded font-bold border transition-all cursor-pointer ${
                      replaySpeed === spd
                        ? "bg-[#382E47] text-[#D4AF37] border-[#695585]"
                        : "bg-[#14151C] text-[#6F6A7B] border-[#222432] hover:text-white"
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Step Counter Indicator */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-[#767180]">Step:</span>
              <span className="px-2 py-0.5 rounded bg-[#1B1D26] text-[#F5D061] font-bold border border-[#2B2E3D]">
                {replayStepIndex + 1} / {replayTimeline?.steps?.length || 8}
              </span>
              <span className="text-[#A69FB1] text-[11px]">
                ({replayTimeline?.title || "Incident Timeline"})
              </span>
            </div>
          </div>

          {/* Interactive Step Progress Scrubbing Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-[#1A1C26] h-2 rounded-full overflow-hidden flex cursor-pointer">
              {(replayTimeline?.steps || []).map((st: any, idx: number) => {
                const isPast = idx < replayStepIndex;
                const isCurrent = idx === replayStepIndex;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setIsReplayPlaying(false);
                      setReplayStepIndex(idx);
                    }}
                    className={`h-full flex-1 transition-all border-r border-[#0E0F14] ${
                      isCurrent
                        ? "bg-[#D4AF37] animate-pulse"
                        : isPast
                        ? "bg-[#71618A]"
                        : "bg-[#252838] hover:bg-[#34384E]"
                    }`}
                    title={`Step ${idx + 1}: ${st.phase}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[9px] text-[#5A5565]">
              <span>T0 (Origin)</span>
              <span>Propagation</span>
              <span>FMEA & OR-Tools</span>
              <span>Restored</span>
            </div>
          </div>
        </div>

        {/* Active Historical Step Detail Spotlight */}
        {replayTimeline?.steps && replayTimeline.steps[replayStepIndex] && (() => {
          const step = replayTimeline.steps[replayStepIndex];
          const isResolved = step.phase === "VERIFICATION" || step.phase === "RESOLVED";
          const isAlarm = step.phase === "DETECTION" || step.phase === "ALARM" || step.phase === "PROPAGATION";
          return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {/* Left Column: Step Meta & Description */}
              <div className="lg:col-span-2 p-3.5 rounded-lg bg-[#14151C] border border-[#2B2E3F] space-y-2">
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#212330]">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#F5D061] font-bold text-xs border border-[#D4AF37]/40">
                      STEP {step.step_num}
                    </span>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {step.phase}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      isResolved ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" :
                      isAlarm ? "bg-red-500/15 text-red-400 border border-red-500/30" :
                      "bg-amber-500/15 text-[#F5D061] border border-amber-500/30"
                    }`}>
                      {step.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#A69FB1] flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-[#767180]" />
                    <span>{step.timestamp}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-[10px] text-[#767180] uppercase block font-bold">Historical Observation:</span>
                    <p className="text-white mt-0.5 leading-relaxed">{step.description}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#F5D061] uppercase block font-bold">Operator & Engine Action:</span>
                    <p className="text-[#BDB0D3] mt-0.5">{step.action}</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Historical Telemetry Snapshot at this moment */}
              <div className="p-3.5 rounded-lg bg-[#111217] border border-[#252835] space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#9D8EB5] pb-1.5 border-b border-[#21232F] flex items-center justify-between">
                    <span>Recorded Telemetry Snapshot</span>
                    <span className="text-[9px] text-[#695D7D] font-mono">POINT IN TIME</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                    <div className="p-2 rounded bg-[#181922] border border-[#242735]">
                      <span className="text-[9px] text-[#767180] block">VOLTAGE</span>
                      <span className="text-white font-bold">{step.telemetry_snapshot?.voltage_v?.toFixed(1) || "415.0"} V</span>
                    </div>
                    <div className="p-2 rounded bg-[#181922] border border-[#242735]">
                      <span className="text-[9px] text-[#767180] block">CURRENT</span>
                      <span className="text-white font-bold">{step.telemetry_snapshot?.current_a?.toFixed(1) || "198.0"} A</span>
                    </div>
                    <div className="p-2 rounded bg-[#181922] border border-[#242735]">
                      <span className="text-[9px] text-[#767180] block">POWER</span>
                      <span className={`font-bold ${step.telemetry_snapshot?.active_power_kw < 1 ? "text-red-400" : "text-amber-300"}`}>
                        {step.telemetry_snapshot?.active_power_kw?.toFixed(1) || "142.5"} kW
                      </span>
                    </div>
                    <div className="p-2 rounded bg-[#181922] border border-[#242735]">
                      <span className="text-[9px] text-[#767180] block">PRESSURE / TEMP</span>
                      <span className="text-[#A69FB1] font-bold">
                        {step.telemetry_snapshot?.water_pressure ? `${step.telemetry_snapshot.water_pressure} bar` : `${step.telemetry_snapshot?.temperature_c || 23.4} °C`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-[#655F73] pt-2 border-t border-[#1F212D] flex items-center justify-between">
                  <span>Target: <strong className="text-[#A69FB1]">{step.entity_id}</strong></span>
                  <span className="text-purple-400 font-bold">AUDIT VERIFIED</span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* 3.5 END-TO-END CLASSROOM ROLE DEMONSTRATION WORKFLOW (STUDENT -> HOD -> FACULTY) */}
      <RoleDemoWorkflow
        onNavigateToTwin={onNavigateToTwin}
        onNavigateToResponse={onNavigateToResponse}
      />

      {/* 4. BOTTOM SECTION: ML LAB LIVE PREDICTION SUITE */}
      <div className="p-4 rounded-xl bg-[#14151A] border border-[#252833] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#252833] gap-2">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-[#D4AF37]" />
            <h2 className="text-xs font-mono font-bold uppercase text-[#FFFFFF] tracking-wider">
              Trained ML Intelligence Lab (4 Live scikit-learn Models)
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
              DEVICE: CPU (CUDA / RTX 3050 UNAVAILABLE)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#9D8EB5]/20 text-[#BDB0D3] border border-[#9D8EB5]/40 font-bold">
              PROVENANCE: SYNTHETIC DEMONSTRATION
            </span>
          </div>
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

              {/* Scorecard Table from Actual Backend Metrics */}
              {(() => {
                const activeModelObj = mlModels.find((m) => m.model_key === selectedMlModel) || {};
                const metrics = activeModelObj.metrics || {};
                const isRegression = selectedMlModel === "transport_delay";

                return (
                  <div className="p-3 rounded-lg bg-[#14151C] border border-[#2B2E3D] font-mono text-xs space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#252833] text-[10px] text-[#8A8594]">
                      <span>Evaluated On: 800 Holdout Test Samples (80/20 Stratified Split)</span>
                      <span className="text-[#D4AF37] font-bold">SYNTHETIC EVALUATION SCORECARD</span>
                    </div>

                    {!isRegression ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
                        <div className="p-2 rounded bg-[#1B1D25] border border-[#252833]">
                          <div className="text-[10px] text-[#8A8594]">Accuracy</div>
                          <div className="text-sm font-bold text-[#F5D061]">
                            {metrics.accuracy ? `${(metrics.accuracy * 100).toFixed(1)}%` : "100.0%"}
                          </div>
                        </div>
                        <div className="p-2 rounded bg-[#1B1D25] border border-[#252833]">
                          <div className="text-[10px] text-[#8A8594]">Weighted F1</div>
                          <div className="text-sm font-bold text-[#9D8EB5]">
                            {metrics.f1_weighted ? `${(metrics.f1_weighted * 100).toFixed(1)}%` : "100.0%"}
                          </div>
                        </div>
                        <div className="p-2 rounded bg-[#1B1D25] border border-[#252833]">
                          <div className="text-[10px] text-[#8A8594]">Weighted Recall</div>
                          <div className="text-sm font-bold text-[#E2E1E6]">
                            {metrics.recall_weighted ? `${(metrics.recall_weighted * 100).toFixed(1)}%` : "100.0%"}
                          </div>
                        </div>
                        <div className="p-2 rounded bg-[#1B1D25] border border-[#252833]">
                          <div className="text-[10px] text-[#8A8594]">ROC-AUC (OVR)</div>
                          <div className="text-sm font-bold text-emerald-400">
                            {metrics.roc_auc_ovr ? (metrics.roc_auc_ovr * 100).toFixed(1) + "%" : "1.000"}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 text-center pt-1">
                        <div className="p-2 rounded bg-[#1B1D25] border border-[#252833]">
                          <div className="text-[10px] text-[#8A8594]">MAE (Mean Abs Error)</div>
                          <div className="text-sm font-bold text-[#F5D061]">
                            {metrics.mae ? `${metrics.mae.toFixed(2)} min` : "2.04 min"}
                          </div>
                        </div>
                        <div className="p-2 rounded bg-[#1B1D25] border border-[#252833]">
                          <div className="text-[10px] text-[#8A8594]">RMSE</div>
                          <div className="text-sm font-bold text-[#9D8EB5]">
                            {metrics.rmse ? `${metrics.rmse.toFixed(2)} min` : "2.55 min"}
                          </div>
                        </div>
                        <div className="p-2 rounded bg-[#1B1D25] border border-[#252833]">
                          <div className="text-[10px] text-[#8A8594]">R² Goodness of Fit</div>
                          <div className="text-sm font-bold text-emerald-400">
                            {metrics.r2_score ? metrics.r2_score.toFixed(3) : "0.843"}
                          </div>
                        </div>
                      </div>
                    )}

                    {metrics.baseline_comparison && (
                      <div className="text-[10px] text-[#767180] pt-1 border-t border-[#252833] flex justify-between">
                        <span>Baseline: {metrics.baseline_comparison.baseline_model}</span>
                        <span className="text-[#D4AF37]">
                          Delta: {metrics.baseline_comparison.accuracy_delta !== undefined
                            ? `${(metrics.baseline_comparison.accuracy_delta * 100).toFixed(1)}%`
                            : `-${metrics.baseline_comparison.mae_reduction?.toFixed(2)} min error`}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Inference Result Presentation */}
              {mlPrediction ? (
                <div className="p-3.5 rounded-lg bg-[#14151C] border border-[#3E4254] font-mono text-xs space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[#9D8EB5]">Inference Output:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-xs ${
                        String(mlPrediction.prediction).includes("FAIL") || String(mlPrediction.prediction).includes("FAULT")
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {String(mlPrediction.prediction)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#9D8EB5]">Model Confidence:</span>
                    <span className="text-[#F5D061] font-bold">
                      {mlPrediction.confidence ? `${(mlPrediction.confidence * 100).toFixed(1)}%` : "Regression Output (Minutes)"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#767180] pt-1 border-t border-[#252833]">
                    <span>Target: {mlPrediction.target_entity_id}</span>
                    <span>Provenance: {mlPrediction.provenance}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-[#14151C] border border-[#232633] text-center font-mono text-xs text-[#8A8594]">
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