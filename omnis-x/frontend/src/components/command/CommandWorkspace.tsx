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
  Wrench,
  Smartphone,
  CheckSquare,
  FileText,
  RotateCcw,
  User,
  Shield,
} from "lucide-react";
import { DigitalTwinApi } from "@/services/api";
import { AuthService, AuthSession, DemoRole } from "@/services/auth";
import { CampusEntity, Incident } from "@/types/digital-twin";
import { PersonaProfile, KUNG_FU_PANDA_PERSONAS } from "../profile/KungFuPandaProfile";
import { OperationalFlowGraph } from "../flow/OperationalFlowGraph";

interface CommandWorkspaceProps {
  onNavigateToTwin: (entityId?: string) => void;
  onNavigateToResponse: (incidentId?: string) => void;
  onOpenReportModal: () => void;
  onOpenSimulation: () => void;
  currentPersona?: PersonaProfile;
}

export function CommandWorkspace({
  onNavigateToTwin,
  onNavigateToResponse,
  onOpenReportModal,
  onOpenSimulation,
  currentPersona = KUNG_FU_PANDA_PERSONAS[0],
}: CommandWorkspaceProps) {
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [resilienceData, setResilienceData] = useState<any>(null);
  const [spofData, setSpofData] = useState<any>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
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
  const [isSseLive, setIsSseLive] = useState<boolean>(false);
  const [liveClock, setLiveClock] = useState<string>("10:35:00");

  useEffect(() => {
    setLiveClock(new Date().toLocaleTimeString());
    const clockTimer = setInterval(() => {
      setLiveClock(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

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

  // Technician Checklist State
  const [techChecklist, setTechChecklist] = useState({
    voltageRms: true,
    insulation: true,
    thermalIr: false,
    groundFault: false,
    solenoidReset: false,
  });
  const [techNotes, setTechNotes] = useState<string>("");
  const [techStatus, setTechStatus] = useState<string>("ASSIGNED");
  const [academicApproved, setAcademicApproved] = useState<boolean>(false);

  useEffect(() => {
    setAuthSession(AuthService.getSession());
    const unsub = AuthService.onAuthChange((s) => setAuthSession(s));
    return () => unsub();
  }, []);

  // Determine Active Role
  const activeRole: DemoRole = authSession?.user.role || (
    currentPersona?.role === "FACILITY_MANAGER"
      ? "FACILITY_MANAGER"
      : currentPersona?.role === "HOD"
      ? "HOD_ACADEMIC"
      : currentPersona?.role === "STUDENT"
      ? "STUDENT"
      : currentPersona?.role === "IT_ADMIN"
      ? "TECHNICIAN"
      : "SUPER_ADMIN"
  );

  // Load backend telemetry & incidents
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      DigitalTwinApi.getResilienceIndex(),
      DigitalTwinApi.getIncidents(),
      DigitalTwinApi.getSPOF(),
    ]).then(([resMetrics, incList, spof]) => {
      if (!isMounted) return;
      setResilienceData(resMetrics);
      setIncidents(incList || []);
      setSpofData(spof);
      setLoading(false);
    }).catch(() => setLoading(false));

    let es: EventSource | null = null;
    let reconnectTimer: any = null;

    const connectSse = () => {
      try {
        es = new EventSource("http://127.0.0.1:8000/api/v1/demo/stream");
        es.onopen = () => { if (isMounted) setIsSseLive(true); };
        es.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            setIsSseLive(true);
            if (data.telemetry) setDemoTelemetry(data.telemetry);
            if (data.demo_state) setDemoState(data.demo_state);
            if (data.scenario) setDemoState(data.scenario);
            if (data.sequence) setDemoSequence(data.sequence);
            if (data.timestamp) setDemoTimestamp(data.timestamp);
            if (data.explanation) setDemoExplanation(data.explanation);
          } catch {}
        };
        es.onerror = () => {
          if (isMounted) setIsSseLive(false);
          if (es) { es.close(); es = null; }
          if (isMounted) reconnectTimer = setTimeout(connectSse, 2500);
        };
      } catch {
        if (isMounted) reconnectTimer = setTimeout(connectSse, 3000);
      }
    };

    connectSse();

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
      if (es) es.close();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleKey1Interrupt = () => {
    setIsDemoActionRunning(true);
    // Instant optimistic state update (<1ms)
    setDemoState("INTERRUPT");
    setDemoTelemetry({
      voltage_v: 0.0,
      active_power_kw: 28.4,
      current_a: 0.0,
      temperature_c: 48.6,
      frequency_hz: 0.0,
      network_latency_ms: 18.4,
      packet_loss_pct: 12.0,
      water_pressure: 3.42,
    });
    setDemoExplanation({
      action: "INTERRUPT",
      title: "KEY 1: FEEDER BREAKER TRIP INJECTED",
      details: "415V breaker on Feeder F1 tripped. Voltage collapsed from 415.0V to 0.0V. Research Labs (LAB-01-EE, LAB-02-ROBOTICS) severed. FMEA RPN score: 288 (CRITICAL).",
      impact: "3 Tier-1 Assets Offline • 150 kW Load Shed",
    });

    DigitalTwinApi.triggerDemoInterrupt()
      .then((res) => {
        if (res) {
          setDemoState(res.demo_state || "INTERRUPT");
          if (res.telemetry) setDemoTelemetry(res.telemetry);
          if (res.explanation) setDemoExplanation(res.explanation);
        }
      })
      .catch(() => {})
      .finally(() => setIsDemoActionRunning(false));
  };

  const handleKey2Recovery = () => {
    setIsDemoActionRunning(true);
    // Instant optimistic recovery state
    setDemoState("RECOVERY");
    setDemoTelemetry({
      voltage_v: 408.5,
      active_power_kw: 128.0,
      current_a: 182.0,
      temperature_c: 32.4,
      frequency_hz: 49.95,
      network_latency_ms: 5.6,
      packet_loss_pct: 0.0,
      water_pressure: 3.42,
    });
    setDemoExplanation({
      action: "RECOVERY",
      title: "KEY 2: OR-TOOLS CP-SAT SOLVER EXECUTED",
      details: "Pareto Optimal Alternative A computed in 14ms. Bus-tie rerouted from Substation 11kV Reserve Feeder. 88.6% resilience restored.",
      impact: "Power Restored to LAB-01-EE & LAB-02 • Zero Blackouts",
    });

    DigitalTwinApi.triggerDemoRecovery()
      .then((res) => {
        if (res) {
          setDemoState(res.demo_state || "RECOVERY");
          if (res.telemetry) setDemoTelemetry(res.telemetry);
          if (res.explanation) setDemoExplanation(res.explanation);
        }
      })
      .catch(() => {})
      .finally(() => setIsDemoActionRunning(false));
  };

  const handleKey3Restore = () => {
    setIsDemoActionRunning(true);
    // Instant optimistic restoration
    setDemoState("RESTORE");
    setDemoTelemetry({
      voltage_v: 415.2,
      active_power_kw: 142.8,
      current_a: 198.0,
      temperature_c: 23.4,
      frequency_hz: 50.02,
      network_latency_ms: 4.2,
      packet_loss_pct: 0.0,
      water_pressure: 3.42,
    });
    setDemoExplanation({
      action: "RESTORE",
      title: "KEY 3: GRID VERIFICATION COMPLETE",
      details: "All circuits normalized. 415.2V RMS Nom balanced across 3 phases. 100% academic and research continuity restored.",
      impact: "Nominal Baseline Restored",
    });

    DigitalTwinApi.triggerDemoRestore()
      .then((res) => {
        if (res) {
          setDemoState(res.demo_state || "RESTORE");
          if (res.telemetry) setDemoTelemetry(res.telemetry);
          if (res.explanation) setDemoExplanation(res.explanation);
        }
      })
      .catch(() => {})
      .finally(() => setIsDemoActionRunning(false));
  };

  // Domain Gauges Helper for Executive Overview
  const domainWeights = [
    { name: "Electrical & HV Grid", score: demoState === "INTERRUPT" ? 38 : 98, weight: "25%", color: "#D4AF37" },
    { name: "Academic Wing Continuity", score: demoState === "INTERRUPT" ? 64 : 96, weight: "25%", color: "#60A5FA" },
    { name: "Cyber & Optical Network", score: 94, weight: "20%", color: "#A855F7" },
    { name: "Physical HVAC & Labs", score: demoState === "INTERRUPT" ? 52 : 92, weight: "15%", color: "#F97316" },
    { name: "Hydraulic Potable Grid", score: 91, weight: "10%", color: "#38BDF8" },
    { name: "Life Safety & Security", score: 97, weight: "5%", color: "#10B981" },
  ];

  /* -------------------------------------------------------------------------- */
  /* 1. SUPER ADMIN / MASTER OOGWAY VIEW                                       */
  /* -------------------------------------------------------------------------- */
  if (activeRole === "SUPER_ADMIN") {
    return (
      <div className="flex-1 w-full h-full overflow-y-auto bg-[#07080B] text-[#E2E1E6] p-4 sm:p-6 space-y-5 font-mono select-none">
        {/* Executive Banner: Master Oogway */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#14151C] via-[#0E0F14] to-[#12131A] border border-[#D4AF37]/40 shadow-xl">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-lg shrink-0 bg-black/60">
              <img src="/pfp/OOGWAY.jpeg" alt="Master Oogway" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#F5D061] border border-[#D4AF37]/40 font-bold uppercase tracking-wide">
                  Master Oogway • Campus Principal
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">SOVEREIGN CLEARANCE</span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white mt-1">OMNIS-X Institutional Command Centre</h1>
              <p className="text-[10px] text-[#8E8B99] italic mt-0.5">
                "Yesterday is history, tomorrow is a mystery, but today is a gift. That is why it is called the present."
              </p>
            </div>
          </div>

          <div className="mt-3 md:mt-0 flex items-center space-x-3 text-right">
            <div>
              <div className="text-[10px] text-[#8E8B99]">INSTITUTIONAL RESILIENCE</div>
              <div className="text-xl font-bold text-[#F5D061]">
                {demoState === "INTERRUPT" ? "54.2" : demoState === "RECOVERY" ? "88.6" : "94.5"}
                <span className="text-xs text-[#8E8B99] font-normal"> / 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Resilience Domain Balance (Full-width compact gauges) */}
        <div className="p-4 rounded-xl bg-[#0D0E13] border border-[#222530] shadow-lg">
          <div className="text-[11px] font-bold text-white uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>RESILIENCE DOMAIN BALANCE</span>
            <span className="text-[10px] text-[#8E8B99]">LIVE MULTI-SYSTEM TELEMETRY</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {domainWeights.map((dm) => (
              <div key={dm.name} className="p-2.5 rounded-lg bg-[#14151C] border border-[#232635] text-center">
                <div className="text-[10px] text-[#8E8B99] truncate mb-1">{dm.name}</div>
                <div className="text-base font-bold" style={{ color: dm.color }}>
                  {dm.score}%
                </div>
                <div className="w-full bg-[#1F2230] h-1 rounded-full mt-2 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${dm.score}%`, backgroundColor: dm.color }} />
                </div>
                <div className="text-[9px] text-[#636070] mt-1">Weight: {dm.weight}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Sleek Emergency Buttons */}
        <div className="p-3.5 rounded-xl bg-[#0D0E13] border border-[#222530] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="text-[11px] font-bold text-white uppercase tracking-wider shrink-0 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span>EMERGENCY CONTROLS:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
            <button
              onClick={(e) => triggerRipple("btn1", e, handleKey1Interrupt)}
              disabled={isDemoActionRunning}
              className={`relative overflow-hidden py-2 px-3 rounded-lg border font-bold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                demoState === "INTERRUPT"
                  ? "bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/20"
                  : "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/40"
              }`}
            >
              <span>1. Interrupt (Breaker Trip)</span>
            </button>

            <button
              onClick={(e) => triggerRipple("btn2", e, handleKey2Recovery)}
              disabled={isDemoActionRunning}
              className={`relative overflow-hidden py-2 px-3 rounded-lg border font-bold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                demoState === "RECOVERY"
                  ? "bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-500/20"
                  : "bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border-sky-500/40"
              }`}
            >
              <span>2. Recovery (OR-Tools Solver)</span>
            </button>

            <button
              onClick={(e) => triggerRipple("btn3", e, handleKey3Restore)}
              disabled={isDemoActionRunning}
              className={`relative overflow-hidden py-2 px-3 rounded-lg border font-bold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                demoState === "RESTORE" || demoState === "NORMAL"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                  : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
              }`}
            >
              <span>3. Restore (Verify Grid)</span>
            </button>
          </div>
        </div>

        {/* 3 Scenario Injection Buttons with Direct 3D Twin Pinpoint */}
        <div className="p-3.5 rounded-xl bg-[#0F1118] border border-[#252838] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="text-[11px] font-bold text-[#F5D061] uppercase tracking-wider shrink-0 flex items-center space-x-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>INJECT 3D ANOMALY (PINPOINT IN TWIN):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
            <button
              onClick={() => {
                DigitalTwinApi.triggerScenarioStart("FEEDER_FAILURE", "FEEDER-LABS-F1").catch(() => {});
                onNavigateToTwin("FEEDER-LABS-F1");
              }}
              className="py-1.5 px-3 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/50 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              <span>1. Feeder Trip (LABS F1)</span>
            </button>

            <button
              onClick={() => {
                DigitalTwinApi.triggerScenarioStart("HVAC", "FEEDER-CR-F2").catch(() => {});
                onNavigateToTwin("FEEDER-CR-F2");
              }}
              className="py-1.5 px-3 rounded-lg bg-orange-950/80 hover:bg-orange-900 text-orange-300 border border-orange-500/50 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
              <span>2. HVAC Surge (CR-104)</span>
            </button>

            <button
              onClick={() => {
                DigitalTwinApi.triggerScenarioStart("WATER", "SUBSTATION-01").catch(() => {});
                onNavigateToTwin("SUBSTATION-01");
              }}
              className="py-1.5 px-3 rounded-lg bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-500/50 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span>3. 11kV Substation Breaker</span>
            </button>
          </div>
        </div>

        {/* SAGA 7-ENGINE REAL-TIME TELEMETRY STREAM & MANUAL VOLTAGE TUNER */}
        <div className="p-3.5 rounded-xl bg-[#0B0C10] border border-[#232635] shadow-xl space-y-2.5 font-mono">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2 pb-2 border-b border-[#1E212B]">
            <div className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${demoState === "INTERRUPT" || demoTelemetry.voltage_v < 390 ? "bg-red-500 animate-ping" : "bg-[#F5D061] animate-pulse"}`} />
              <span className="font-bold text-white text-[11px] tracking-wide uppercase">
                SAGA 7-ENGINE CONTINUOUS TELEMETRY STREAM
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[10px] text-[#8E8B99]">
              <span>SEQ #{demoSequence}</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">{demoTimestamp || liveClock}</span>
            </div>
          </div>

          {/* Real-Time Live Readout + Manual Voltage Adjustment */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-4">
              <div>
                <span className="text-[10px] text-[#8E8B99] block">VOLTAGE</span>
                <span className={`text-base font-bold ${demoTelemetry.voltage_v < 390 ? "text-red-400" : "text-[#F5D061]"}`}>
                  {demoTelemetry.voltage_v.toFixed(1)} V
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#8E8B99] block">ACTIVE LOAD</span>
                <span className="text-base font-bold text-sky-400">
                  {demoTelemetry.active_power_kw.toFixed(1)} kW
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#8E8B99] block">FREQUENCY</span>
                <span className="text-base font-bold text-emerald-400">
                  {demoTelemetry.frequency_hz.toFixed(2)} Hz
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#8E8B99] block">GRID STATE</span>
                <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${demoState === "INTERRUPT" ? "bg-red-500/20 text-red-400 border border-red-500/40" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"}`}>
                  {demoState}
                </span>
              </div>
            </div>

            {/* Quick Voltage Fluctuation Buttons */}
            <div className="flex items-center space-x-1.5 text-[10px]">
              <span className="text-[#8E8B99] text-[9px] mr-1 hidden lg:inline">FLUCTUATION:</span>
              <button
                onClick={() => setDemoTelemetry((prev: any) => ({ ...prev, voltage_v: 415.2 }))}
                className={`px-2 py-1 rounded border font-bold cursor-pointer transition-colors ${demoTelemetry.voltage_v >= 410 && demoTelemetry.voltage_v <= 425 ? "bg-[#D4AF37]/30 text-[#F5D061] border-[#D4AF37]" : "bg-[#14151C] text-[#8E8B99] border-[#252836] hover:text-white"}`}
              >
                415V (Nom)
              </button>
              <button
                onClick={() => setDemoTelemetry((prev: any) => ({ ...prev, voltage_v: 380.0 }))}
                className={`px-2 py-1 rounded border font-bold cursor-pointer transition-colors ${demoTelemetry.voltage_v === 380 ? "bg-amber-500/30 text-amber-300 border-amber-500" : "bg-[#14151C] text-[#8E8B99] border-[#252836] hover:text-white"}`}
              >
                380V (Sag)
              </button>
              <button
                onClick={() => setDemoTelemetry((prev: any) => ({ ...prev, voltage_v: 445.0 }))}
                className={`px-2 py-1 rounded border font-bold cursor-pointer transition-colors ${demoTelemetry.voltage_v === 445 ? "bg-pink-500/30 text-pink-300 border-pink-500" : "bg-[#14151C] text-[#8E8B99] border-[#252836] hover:text-white"}`}
              >
                445V (Surge)
              </button>
              <button
                onClick={() => setDemoTelemetry((prev: any) => ({ ...prev, voltage_v: 0.0 }))}
                className={`px-2 py-1 rounded border font-bold cursor-pointer transition-colors ${demoTelemetry.voltage_v === 0 ? "bg-red-500/30 text-red-300 border-red-500" : "bg-[#14151C] text-red-400 border-[#252836] hover:bg-red-950"}`}
              >
                0V (Trip)
              </button>
            </div>
          </div>

          {/* Live Explanation Banner if Active */}
          {demoExplanation && (
            <div className="mt-2 p-2.5 rounded-lg bg-[#14151C] border border-[#252838] flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] gap-2 animate-fadeIn">
              <div>
                <span className="text-[#F5D061] font-bold block">{demoExplanation.title}</span>
                <span className="text-[#94A3B8] text-[10px]">{demoExplanation.details}</span>
              </div>
              {demoExplanation.impact && (
                <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold shrink-0 text-[10px]">
                  {demoExplanation.impact}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Operational Flow Graph (Full-width) */}
        <div className="rounded-xl bg-[#0D0E13] border border-[#222530] p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3 text-[11px] font-bold text-white uppercase tracking-wider">
            <span>OPERATIONAL DEPENDENCY & ENERGY FLOW TOPOLOGY</span>
            <span className="text-[10px] text-emerald-400">11kV SUBSTATION ──▶ LABORATORIES & BUSES</span>
          </div>
          <OperationalFlowGraph onSelectEntity={(id) => onNavigateToTwin(id)} demoState={demoState} telemetry={demoTelemetry} />
        </div>

        {/* SPOF & Active Incidents Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#0D0E13] border border-[#222530]">
            <div className="text-[11px] font-bold text-white uppercase tracking-wider mb-2 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>GRAPH SPOF DISCOVERY</span>
            </div>
            <p className="text-xs text-[#8E8B99] mb-3">
              Single Point of Failure analysis across campus power risers and transformer tie-lines.
            </p>
            <div className="p-3 rounded-lg bg-[#14151C] border border-[#252836] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">FEEDER-LABS-F1</div>
                <div className="text-[10px] text-[#8E8B99]">First Floor Engineering Lab Riser 1B</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 font-bold">
                HIGH CRITICALITY
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0D0E13] border border-[#222530]">
            <div className="text-[11px] font-bold text-white uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>ACTIVE INSTITUTIONAL INCIDENTS</span>
              </span>
              <button
                onClick={() => onNavigateToResponse()}
                className="text-[10px] text-[#D4AF37] hover:underline"
              >
                View Full Response Center →
              </button>
            </div>
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-[#14151C] border border-[#252836] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">INC-ELEC-01 • Feeder Bus F1 Breaker Trip</div>
                  <div className="text-[10px] text-[#8E8B99]">Affected: LAB-01-EE, LAB-02-ROBOTICS, EE-201</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  {demoState === "INTERRUPT" ? "UNRESOLVED" : "MITIGATING"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 2. FACILITY MANAGER / MASTER TIGRESS VIEW                                  */
  /* -------------------------------------------------------------------------- */
  if (activeRole === "FACILITY_MANAGER") {
    return (
      <div className="flex-1 w-full h-full overflow-y-auto bg-[#07080B] text-[#E2E1E6] p-4 sm:p-6 space-y-5 font-mono select-none">
        {/* Facility Header: Master Tigress */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#171110] via-[#0E0F14] to-[#1A1412] border border-orange-500/40 shadow-xl">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-500 shadow-lg shrink-0 bg-black/60">
              <img src="/pfp/TIGERESS.jpeg" alt="Master Tigress" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/40 font-bold uppercase tracking-wide">
                  Master Tigress • Facility Manager
                </span>
                <span className="text-[10px] text-orange-400 font-bold">PHYSICAL INFRASTRUCTURE & ENERGY</span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white mt-1">High-Voltage Substation & Facilities Console</h1>
              <p className="text-[10px] text-[#8E8B99] italic mt-0.5">
                "Real strength lies within discipline, vigilance, and swift recovery execution."
              </p>
            </div>
          </div>

          <div className="mt-3 md:mt-0 flex items-center space-x-2">
            <button
              onClick={() => onNavigateToTwin()}
              className="py-1.5 px-3 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/50 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Inspect 3D Twin Grid</span>
            </button>
          </div>
        </div>

        {/* 4 Live Physical Telemetry Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[#0D0E13] border border-[#222530]">
            <div className="text-[10px] text-[#8E8B99]">415V GRID VOLTAGE (RMS)</div>
            <div className="text-lg font-bold text-[#F5D061] mt-1">{demoTelemetry.voltage_v.toFixed(1)} V</div>
            <div className="text-[9px] text-emerald-400 mt-1">Nominal Target: 415.0V</div>
          </div>

          <div className="p-3 rounded-xl bg-[#0D0E13] border border-[#222530]">
            <div className="text-[10px] text-[#8E8B99]">ACTIVE SUBSTATION LOAD</div>
            <div className="text-lg font-bold text-sky-400 mt-1">{demoTelemetry.active_power_kw.toFixed(1)} kW</div>
            <div className="text-[9px] text-[#8E8B99] mt-1">Capacity: 750 kVA</div>
          </div>

          <div className="p-3 rounded-xl bg-[#0D0E13] border border-[#222530]">
            <div className="text-[10px] text-[#8E8B99]">HYDRAULIC WATER PRESSURE</div>
            <div className="text-lg font-bold text-cyan-300 mt-1">{demoTelemetry.water_pressure || 3.42} Bar</div>
            <div className="text-[9px] text-emerald-400 mt-1">Potable Ring Main Status: Normal</div>
          </div>

          <div className="p-3 rounded-xl bg-[#0D0E13] border border-[#222530]">
            <div className="text-[10px] text-[#8E8B99]">CHILLER LOOP TEMP</div>
            <div className="text-lg font-bold text-purple-300 mt-1">{demoTelemetry.temperature_c.toFixed(1)} °C</div>
            <div className="text-[9px] text-[#8E8B99] mt-1">Set Point: 22.0°C</div>
          </div>
        </div>

        {/* 3 Scenario Injection Buttons with Direct 3D Twin Pinpoint */}
        <div className="p-3.5 rounded-xl bg-[#0F1118] border border-[#252838] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="text-[11px] font-bold text-orange-400 uppercase tracking-wider shrink-0 flex items-center space-x-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>INJECT 3D ANOMALY (PINPOINT IN TWIN):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
            <button
              onClick={() => {
                DigitalTwinApi.triggerScenarioStart("FEEDER_FAILURE", "FEEDER-LABS-F1").catch(() => {});
                onNavigateToTwin("FEEDER-LABS-F1");
              }}
              className="py-1.5 px-3 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/50 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              <span>1. Feeder Trip (LABS F1)</span>
            </button>

            <button
              onClick={() => {
                DigitalTwinApi.triggerScenarioStart("HVAC", "FEEDER-CR-F2").catch(() => {});
                onNavigateToTwin("FEEDER-CR-F2");
              }}
              className="py-1.5 px-3 rounded-lg bg-orange-950/80 hover:bg-orange-900 text-orange-300 border border-orange-500/50 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
              <span>2. HVAC Surge (CR-104)</span>
            </button>

            <button
              onClick={() => {
                DigitalTwinApi.triggerScenarioStart("WATER", "SUBSTATION-01").catch(() => {});
                onNavigateToTwin("SUBSTATION-01");
              }}
              className="py-1.5 px-3 rounded-lg bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-500/50 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span>3. 11kV Substation Breaker</span>
            </button>
          </div>
        </div>

        {/* SAGA 7-ENGINE REAL-TIME TELEMETRY STREAM & MANUAL VOLTAGE TUNER */}
        <div className="p-3.5 rounded-xl bg-[#0B0C10] border border-[#232635] shadow-xl space-y-2.5 font-mono">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2 pb-2 border-b border-[#1E212B]">
            <div className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${demoState === "INTERRUPT" || demoTelemetry.voltage_v < 390 ? "bg-red-500 animate-ping" : "bg-[#F5D061] animate-pulse"}`} />
              <span className="font-bold text-white text-[11px] tracking-wide uppercase">
                SAGA 7-ENGINE CONTINUOUS TELEMETRY STREAM
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[10px] text-[#8E8B99]">
              <span>SEQ #{demoSequence}</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">{demoTimestamp || liveClock}</span>
            </div>
          </div>

          {/* Real-Time Live Readout + Manual Voltage Adjustment */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-4">
              <div>
                <span className="text-[10px] text-[#8E8B99] block">VOLTAGE</span>
                <span className={`text-base font-bold ${demoTelemetry.voltage_v < 390 ? "text-red-400" : "text-[#F5D061]"}`}>
                  {demoTelemetry.voltage_v.toFixed(1)} V
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#8E8B99] block">ACTIVE LOAD</span>
                <span className="text-base font-bold text-sky-400">
                  {demoTelemetry.active_power_kw.toFixed(1)} kW
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#8E8B99] block">FREQUENCY</span>
                <span className="text-base font-bold text-emerald-400">
                  {demoTelemetry.frequency_hz.toFixed(2)} Hz
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#8E8B99] block">GRID STATE</span>
                <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${demoState === "INTERRUPT" ? "bg-red-500/20 text-red-400 border border-red-500/40" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"}`}>
                  {demoState}
                </span>
              </div>
            </div>

            {/* Quick Voltage Fluctuation Buttons */}
            <div className="flex items-center space-x-1.5 text-[10px]">
              <span className="text-[#8E8B99] text-[9px] mr-1 hidden lg:inline">FLUCTUATION:</span>
              <button
                onClick={() => setDemoTelemetry((prev: any) => ({ ...prev, voltage_v: 415.2 }))}
                className={`px-2 py-1 rounded border font-bold cursor-pointer transition-colors ${demoTelemetry.voltage_v >= 410 && demoTelemetry.voltage_v <= 425 ? "bg-[#D4AF37]/30 text-[#F5D061] border-[#D4AF37]" : "bg-[#14151C] text-[#8E8B99] border-[#252836] hover:text-white"}`}
              >
                415V (Nom)
              </button>
              <button
                onClick={() => setDemoTelemetry((prev: any) => ({ ...prev, voltage_v: 380.0 }))}
                className={`px-2 py-1 rounded border font-bold cursor-pointer transition-colors ${demoTelemetry.voltage_v === 380 ? "bg-amber-500/30 text-amber-300 border-amber-500" : "bg-[#14151C] text-[#8E8B99] border-[#252836] hover:text-white"}`}
              >
                380V (Sag)
              </button>
              <button
                onClick={() => setDemoTelemetry((prev: any) => ({ ...prev, voltage_v: 445.0 }))}
                className={`px-2 py-1 rounded border font-bold cursor-pointer transition-colors ${demoTelemetry.voltage_v === 445 ? "bg-pink-500/30 text-pink-300 border-pink-500" : "bg-[#14151C] text-[#8E8B99] border-[#252836] hover:text-white"}`}
              >
                445V (Surge)
              </button>
              <button
                onClick={() => setDemoTelemetry((prev: any) => ({ ...prev, voltage_v: 0.0 }))}
                className={`px-2 py-1 rounded border font-bold cursor-pointer transition-colors ${demoTelemetry.voltage_v === 0 ? "bg-red-500/30 text-red-300 border-red-500" : "bg-[#14151C] text-red-400 border-[#252836] hover:bg-red-950"}`}
              >
                0V (Trip)
              </button>
            </div>
          </div>

          {/* Live Explanation Banner if Active */}
          {demoExplanation && (
            <div className="mt-2 p-2.5 rounded-lg bg-[#14151C] border border-[#252838] flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] gap-2 animate-fadeIn">
              <div>
                <span className="text-[#F5D061] font-bold block">{demoExplanation.title}</span>
                <span className="text-[#94A3B8] text-[10px]">{demoExplanation.details}</span>
              </div>
              {demoExplanation.impact && (
                <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold shrink-0 text-[10px]">
                  {demoExplanation.impact}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Substation Breakers & Actuators */}
        <div className="p-4 rounded-xl bg-[#0D0E13] border border-[#222530] shadow-lg space-y-3">
          <div className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center justify-between">
            <span>SUBSTATION BREAKER ACTUATION & GENERATOR TRANSFER</span>
            <span className="text-[10px] text-orange-400 font-bold">11kV SUB-01 / ATS-01</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleKey1Interrupt}
              className="p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 text-left transition-all cursor-pointer"
            >
              <div className="text-xs font-bold text-red-400">TRIP FEEDER F1 BREAKER</div>
              <p className="text-[10px] text-[#8E8B99] mt-1">Simulate 415V breaker overload disconnect on Riser 1B.</p>
            </button>

            <button
              onClick={handleKey2Recovery}
              className="p-3 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/40 text-left transition-all cursor-pointer"
            >
              <div className="text-xs font-bold text-sky-400">TRANSFER TO DIESEL STANDBY</div>
              <p className="text-[10px] text-[#8E8B99] mt-1">Engage ATS-01 automatic transfer to 500kVA Standby Gen.</p>
            </button>

            <button
              onClick={handleKey3Restore}
              className="p-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-left transition-all cursor-pointer"
            >
              <div className="text-xs font-bold text-emerald-400">RESTORE UTILITY MAINS</div>
              <p className="text-[10px] text-[#8E8B99] mt-1">Reclose 11kV bus coupler and sync frequency.</p>
            </button>
          </div>
        </div>

        {/* Energy Flow Topology (Filtered to Power) */}
        <div className="rounded-xl bg-[#0D0E13] border border-[#222530] p-4 shadow-lg">
          <div className="text-[11px] font-bold text-white uppercase tracking-wider mb-3">
            ELECTRICAL CONDUIT & DISTRIBUTION TOPOLOGY
          </div>
          <OperationalFlowGraph onSelectEntity={(id) => onNavigateToTwin(id)} demoState={demoState} telemetry={demoTelemetry} />
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 3. HOD ACADEMIC / MASTER SHIFU VIEW                                        */
  /* -------------------------------------------------------------------------- */
  if (activeRole === "HOD_ACADEMIC") {
    return (
      <div className="flex-1 w-full h-full overflow-y-auto bg-[#07080B] text-[#E2E1E6] p-4 sm:p-6 space-y-5 font-mono select-none">
        {/* Academic Header: Master Shifu */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#14101A] via-[#0E0F14] to-[#181220] border border-purple-500/40 shadow-xl">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500 shadow-lg shrink-0 bg-black/60">
              <img src="/pfp/SHIFU.jpeg" alt="Master Shifu" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold uppercase tracking-wide">
                  Master Shifu • Head of Department
                </span>
                <span className="text-[10px] text-purple-400 font-bold">ACADEMIC WING & TIMETABLE DISPATCH</span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white mt-1">ECE Department & Classroom Operations</h1>
              <p className="text-[10px] text-[#8E8B99] italic mt-0.5">
                "If you only do what you can do, you will never be more than who you are."
              </p>
            </div>
          </div>

          <div className="mt-3 md:mt-0">
            <span className="text-xs px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
              OR-Tools Academic Solver Active
            </span>
          </div>
        </div>

        {/* Academic Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[#0D0E13] border border-[#222530]">
            <div className="text-[10px] text-[#8E8B99]">ACADEMIC CONTINUITY</div>
            <div className="text-lg font-bold text-purple-300 mt-1">96.5%</div>
            <div className="text-[9px] text-emerald-400 mt-1">Target: &gt; 95%</div>
          </div>

          <div className="p-3 rounded-xl bg-[#0D0E13] border border-[#222530]">
            <div className="text-[10px] text-[#8E8B99]">AVAILABLE CLASSROOMS</div>
            <div className="text-lg font-bold text-white mt-1">14 / 16</div>
            <div className="text-[9px] text-[#8E8B99] mt-1">L1 & L2 Academic Wing</div>
          </div>

          <div className="p-3 rounded-xl bg-[#0D0E13] border border-[#222530]">
            <div className="text-[10px] text-[#8E8B99]">DISRUPTED SESSIONS</div>
            <div className="text-lg font-bold text-amber-400 mt-1">1 Section</div>
            <div className="text-[9px] text-amber-300 mt-1">EE-201 Microcontrollers</div>
          </div>

          <div className="p-3 rounded-xl bg-[#0D0E13] border border-[#222530]">
            <div className="text-[10px] text-[#8E8B99]">STUDENTS RELOCATED</div>
            <div className="text-lg font-bold text-emerald-400 mt-1">40 Students</div>
            <div className="text-[9px] text-[#8E8B99] mt-1">Zero Clashes Detected</div>
          </div>
        </div>

        {/* OR-Tools Academic Solver Recommendation Card */}
        <div className="p-4 rounded-xl bg-[#0D0E13] border border-purple-500/30 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-white uppercase tracking-wider">
            <span className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>OR-TOOLS OPTIMAL CLASSROOM RELOCATION SOLVER</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              100% CONSTRAINT SATISFACTION
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#14151C] border border-[#252836] space-y-2 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-[#232635]">
              <div>
                <span className="text-[#8E8B99] block text-[10px]">DISRUPTED LOCATION:</span>
                <span className="font-bold text-red-400">Classroom 101 (Room 101, First Floor)</span>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-400" />
              <div className="text-right">
                <span className="text-[#8E8B99] block text-[10px]">RECOMMENDED ALTERNATE ROOM:</span>
                <span className="font-bold text-emerald-400">Smart Hall B (Room 204, Second Floor)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[10px] text-[#8E8B99]">
              <div>Course: <strong className="text-white">EE-201 Embedded Systems</strong></div>
              <div>Registered: <strong className="text-white">40 Students</strong></div>
              <div>Hall Capacity: <strong className="text-emerald-400">55 Seats (Sufficient)</strong></div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => setAcademicApproved(true)}
              disabled={academicApproved}
              className={`py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                academicApproved
                  ? "bg-emerald-500 text-white"
                  : "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{academicApproved ? "Timetable Relocation Approved & Broadcasted" : "Approve Course Relocation & Notify Students"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 4. TECHNICIAN / MASTER MANTIS VIEW                                         */
  /* -------------------------------------------------------------------------- */
  if (activeRole === "TECHNICIAN") {
    return (
      <div className="flex-1 w-full h-full overflow-y-auto bg-[#07080B] text-[#E2E1E6] p-4 sm:p-6 space-y-5 font-mono select-none">
        {/* Technician Header: Master Mantis */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#101712] via-[#0E0F14] to-[#121A15] border border-emerald-500/40 shadow-xl">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500 shadow-lg shrink-0 bg-black/60">
              <img src="/pfp/MANTIS.jpeg" alt="Master Mantis" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase tracking-wide">
                  Master Mantis • Field Technician
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">RAPID RESPONSE DIAGNOSTICS</span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white mt-1">Field Diagnostics & Work Order Terminal</h1>
              <p className="text-[10px] text-[#8E8B99] italic mt-0.5">
                "Quick diagnostics and microscopic precision solve electrical surges."
              </p>
            </div>
          </div>

          <div className="mt-3 md:mt-0">
            <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
              Assigned Ticket: WO-ELEC-401
            </span>
          </div>
        </div>

        {/* Assigned Work Order Card */}
        <div className="p-4 rounded-xl bg-[#0D0E13] border border-[#222530] shadow-lg space-y-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-white uppercase tracking-wider">
            <span className="flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-emerald-400" />
              <span>ACTIVE WORK ORDER: WO-ELEC-401</span>
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 font-bold">
              PRIORITY: P1 CRITICAL
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#14151C] border border-[#252836] text-xs space-y-1">
            <div className="font-bold text-white">Feeder Bus F1 Breaker Trip & Harmonic Surge</div>
            <div className="text-[10px] text-[#8E8B99]">Target Entity: FEEDER-LABS-F1 • Location: Riser Shaft 1B (First Floor)</div>
            <div className="text-[10px] text-[#8E8B99] pt-1">
              Instructions: Verify insulation resistance, inspect contact lugs for thermal runaway, and manually clear auxiliary lockout solenoid.
            </div>
          </div>
        </div>

        {/* Interactive Field Checklist */}
        <div className="p-4 rounded-xl bg-[#0D0E13] border border-[#222530] shadow-lg space-y-3">
          <div className="text-[11px] font-bold text-white uppercase tracking-wider">
            PRE-RESTORE SAFETY CHECKLIST
          </div>

          <div className="space-y-2 text-xs">
            {[
              { id: "voltageRms", label: "Measure 3-Phase RMS Voltage (Nominal 415.0V)" },
              { id: "insulation", label: "Perform 500V Megger Insulation Resistance Test (> 50 MΩ)" },
              { id: "thermalIr", label: "Thermal IR Scan of contact lugs (< 45.0°C)" },
              { id: "groundFault", label: "Verify Residual Current Leakage (< 30mA)" },
              { id: "solenoidReset", label: "Reset Auxiliary Solenoid & Re-engage Master Handle" },
            ].map((item) => (
              <label
                key={item.id}
                className="flex items-center space-x-2.5 p-2 rounded-lg bg-[#14151C] border border-[#252836] cursor-pointer hover:bg-[#1A1C25] transition-colors"
              >
                <input
                  type="checkbox"
                  checked={(techChecklist as any)[item.id]}
                  onChange={(e) =>
                    setTechChecklist({ ...techChecklist, [item.id]: e.target.checked })
                  }
                  className="rounded border-[#3A3D4B] accent-emerald-500 cursor-pointer"
                />
                <span className="text-[11px] text-[#E2E1E6]">{item.label}</span>
              </label>
            ))}
          </div>

          {/* Resolution Notes & Completion Button */}
          <div className="pt-2 space-y-2">
            <textarea
              placeholder="Enter technician diagnostic notes (e.g. 'Insulation verified, breaker contact cleaned and re-torqued...')"
              value={techNotes}
              onChange={(e) => setTechNotes(e.target.value)}
              className="w-full h-16 p-2 rounded-lg bg-[#14151C] border border-[#2D303B] text-xs text-white placeholder-[#636070] font-mono focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => setTechStatus("RESOLVED")}
              className={`w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                techStatus === "RESOLVED"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-500 hover:bg-emerald-600 text-white"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{techStatus === "RESOLVED" ? "Work Order Completed & Incident Cleared" : "Submit Resolution Notes & Clear Incident"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 5. STUDENT / PO (THE DRAGON WARRIOR) VIEW                                  */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-[#07080B] text-[#E2E1E6] p-4 sm:p-6 space-y-5 font-mono select-none">
      {/* Student Header: Po */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#101518] via-[#0E0F14] to-[#121920] border border-sky-500/40 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-sky-500 shadow-lg shrink-0 bg-black/60">
            <img src="/pfp/POO.jpeg" alt="Po" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold uppercase tracking-wide">
                Po (Dragon Warrior) • Student Delegate
              </span>
              <span className="text-[10px] text-sky-400 font-bold">STUDENT RESILIENCE & GRIEVANCE ACCESS</span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-white mt-1">Student Experience & Hazard Portal</h1>
            <p className="text-[10px] text-[#8E8B99] italic mt-0.5">
              "There is no secret ingredient. It's just you... and resilient cyber-physical infrastructure!"
            </p>
          </div>
        </div>

        <div className="mt-3 md:mt-0">
          <a
            href="http://localhost:8090"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>Launch Student PWA (Port 8090)</span>
          </a>
        </div>
      </div>

      {/* Student Submitted Reports Tracker */}
      <div className="p-4 rounded-xl bg-[#0D0E13] border border-[#222530] shadow-lg space-y-3">
        <div className="flex items-center justify-between text-[11px] font-bold text-white uppercase tracking-wider">
          <span>MY SUBMITTED CAMPUS INCIDENT REPORTS</span>
          <span className="text-[10px] text-emerald-400 font-normal">LIVE SQLITE SYNC</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-lg bg-[#14151C] border border-[#252836] flex items-center justify-between">
            <div>
              <div className="font-bold text-white">INC-GRV-001 • Water Outage in L1 Restroom</div>
              <div className="text-[10px] text-[#8E8B99]">Category: Potable Water • Submitted: 10 mins ago</div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold">
              INVESTIGATING
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#14151C] border border-[#252836] flex items-center justify-between">
            <div>
              <div className="font-bold text-white">INC-GRV-002 • Projector Power Glitch in CR-101</div>
              <div className="text-[10px] text-[#8E8B99]">Category: Academic Hardware • Submitted: Yesterday</div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
              RESOLVED
            </span>
          </div>
        </div>
      </div>

      {/* Campus Public Notice Board */}
      <div className="p-4 rounded-xl bg-[#0D0E13] border border-[#222530] shadow-lg">
        <div className="text-[11px] font-bold text-white uppercase tracking-wider mb-2">
          CAMPUS CLASSROOM AVAILABILITY & SAFETY NOTICES
        </div>
        <p className="text-xs text-[#8E8B99]">
          Notice: Classroom 101 is undergoing scheduled circuit breaker maintenance. Sections scheduled in CR-101 are relocated to Smart Hall B (Room 204). All library reading rooms and Wi-Fi networks are operating normally.
        </p>
      </div>
    </div>
  );
}
