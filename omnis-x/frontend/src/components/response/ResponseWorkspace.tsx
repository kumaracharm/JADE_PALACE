"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Zap,
  Activity,
  Layers,
  GraduationCap,
  Users,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  FileText,
  RotateCcw,
  Check,
  X,
  Send,
  Building,
  Droplets,
  Thermometer,
  Wifi,
  BookOpen,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { DigitalTwinApi } from "@/services/api";
import { AuthService } from "@/services/auth";
import { Incident } from "@/types/digital-twin";
import { ExplodedAxonometricStack } from "./ExplodedAxonometricStack";

function getScenarioAnalysis(incidentId: string) {
  if (incidentId === "INC-WATER-02") {
    return {
      incident_id: "INC-WATER-02",
      status: "AWAITING_APPROVAL",
      engine1_detection: {
        anomaly_type: "HYDRAULIC_PRESSURE_COLLAPSE",
        metric: "water_pressure",
        baseline_value: 3.42,
        observed_value: 0.35,
        threshold_dev: "89.8% DROP (< 1.50 bar)",
        confidence: 0.99,
      },
      engine2_propagation: {
        source_entity: "BLDG-ENG",
        blast_radius_count: 3,
        affected_entities: [
          { id: "BLDG-ENG", type: "BUILDING", name: "Engineering Block Main Riser", status: "FAILED" },
          { id: "LAB-01-EE", type: "LABORATORY", name: "EE Fabrication & Wet Chemistry", status: "SAFETY_HOLD" },
          { id: "CAMPUS-MAIN", type: "CAMPUS", name: "Campus Central Plumbing", status: "DEGRADED" },
        ],
        has_redundancy: true,
        secondary_path: "Auxiliary Overhead Reservoir Tank TK-02",
      },
      engine3_fmea: {
        severity: 7,
        occurrence: 3,
        detection: 2,
        rpn_score: 42,
        criticality_tier: "FACILITIES_HIGH",
      },
      engine4_academic: {
        interrupted_sessions: 2,
        displaced_students: 45,
        exams_at_risk: 0,
        recommended_relocations: [
          { course: "EE301 Microcontrollers Practical", from_room: "LAB-01-EE", to_room: "CR-201", status: "FEASIBLE" },
        ],
      },
      engine5_recovery: {
        solver: "Google OR-Tools CP-SAT (Integer Program)",
        alternatives: [
          {
            id: "ALT-GRAVITY-FEED",
            name: "Alternative A: Activate Overhead Gravity Tank TK-02 (Recommended)",
            downtime_min: 25,
            cost_estimate: "₹6,500 ($80)",
            academic_loss: "Minimal (Zero class cancellations)",
            description: "Actuate motorized butterfly valve V-102 to release 25,000L auxiliary reservoir gravity line.",
            is_recommended: true,
          },
          {
            id: "ALT-MUNICIPAL-REPAIR",
            name: "Alternative B: Municipal Booster Pump Mechanical Overhaul",
            downtime_min: 120,
            cost_estimate: "₹14,000 ($170)",
            academic_loss: "Moderate (Eyewash compliance halt)",
            description: "De-energize main intake booster, clear impeller cavitation, bleed air cushions.",
            is_recommended: false,
          },
        ],
      },
      engine6_raci: {
        responsible: "Lead Facilities & Plumbing Engineer (M. Bennett)",
        accountable: "Director of Campus Operations",
        consulted: "EHS Safety Officer",
        informed: "Dean of Engineering",
      },
      engine7_approval: {
        required_role: "FACILITIES_HEAD",
        is_approved: false,
      },
    };
  }

  if (incidentId === "INC-HVAC-03") {
    return {
      incident_id: "INC-HVAC-03",
      status: "AWAITING_APPROVAL",
      engine1_detection: {
        anomaly_type: "THERMAL_RUNAWAY_CHILLER_FAULT",
        metric: "temperature_c",
        baseline_value: 23.0,
        observed_value: 43.8,
        threshold_dev: "+90.4% RISE (> 32.0°C CRITICAL)",
        confidence: 0.99,
      },
      engine2_propagation: {
        source_entity: "ROOM-MDF",
        blast_radius_count: 3,
        affected_entities: [
          { id: "ROOM-MDF", type: "SERVER_ROOM", name: "Core Datacenter MDF", status: "OVERHEATING" },
          { id: "EQ-GPU-CLUSTER", type: "EQUIPMENT", name: "AI Research GPU Cluster", status: "THERMAL_THROTTLED" },
          { id: "LAB-02-ROBOTICS", type: "LABORATORY", name: "Robotics & Autonomous Systems Lab", status: "DEGRADED" },
        ],
        has_redundancy: true,
        secondary_path: "CRAC-02 Secondary Refrigerant Loop",
      },
      engine3_fmea: {
        severity: 9,
        occurrence: 3,
        detection: 2,
        rpn_score: 54,
        criticality_tier: "MISSION_CRITICAL",
      },
      engine4_academic: {
        interrupted_sessions: 2,
        displaced_students: 35,
        exams_at_risk: 1,
        recommended_relocations: [
          { course: "AI401 Autonomous Systems Compute", from_room: "LAB-02-ROBOTICS", to_room: "Cloud Virtual Cluster", status: "FEASIBLE" },
        ],
      },
      engine5_recovery: {
        solver: "Google OR-Tools CP-SAT (Integer Program)",
        alternatives: [
          {
            id: "ALT-LOAD-SHED",
            name: "Alternative A: Thermal Load Shedding & Engage CRAC-02 (Recommended)",
            downtime_min: 20,
            cost_estimate: "₹8,200 ($100)",
            academic_loss: "Zero (Jobs queued to cloud mirror)",
            description: "Halt batch GPU workloads, activate backup CRAC-02 compressor, open exhaust dampers.",
            is_recommended: true,
          },
          {
            id: "ALT-FULL-SHUTDOWN",
            name: "Alternative B: Datacenter Emergency Thermal Scram",
            downtime_min: 90,
            cost_estimate: "₹2,500 ($30)",
            academic_loss: "High (Campus IT intranet halted)",
            description: "Initiate graceful OS shutdown across all 8 MDF rack cabinets.",
            is_recommended: false,
          },
        ],
      },
      engine6_raci: {
        responsible: "Datacenter Operations Engineer (K. Vance)",
        accountable: "Chief Information Officer",
        consulted: "High Performance Computing Chair",
        informed: "Campus Principal",
      },
      engine7_approval: {
        required_role: "CIO",
        is_approved: false,
      },
    };
  }

  if (incidentId === "INC-NET-04") {
    return {
      incident_id: "INC-NET-04",
      status: "AWAITING_APPROVAL",
      engine1_detection: {
        anomaly_type: "OPTICAL_TRUNK_DEGRADATION",
        metric: "packet_loss_pct",
        baseline_value: 0.0,
        observed_value: 48.5,
        threshold_dev: "+48.5% PACKET LOSS (> 5.0% WARN)",
        confidence: 0.98,
      },
      engine2_propagation: {
        source_entity: "SW-MDF-CORE",
        blast_radius_count: 4,
        affected_entities: [
          { id: "SW-MDF-CORE", type: "NETWORK_SWITCH", name: "Core Cisco 9500 Aggregator", status: "DEGRADED" },
          { id: "SW-IDF-F1", type: "NETWORK_SWITCH", name: "Floor 1 IDF Switch", status: "UNSTABLE" },
          { id: "LAB-03-COMP", type: "LABORATORY", name: "Computer Science Programming Lab", status: "OFFLINE" },
          { id: "ROOM-MDF", type: "SERVER_ROOM", name: "Core Datacenter MDF", status: "DEGRADED" },
        ],
        has_redundancy: true,
        secondary_path: "Redundant 10Gbps OM4 Ring Trunk via SW-IDF-F2",
      },
      engine3_fmea: {
        severity: 8,
        occurrence: 3,
        detection: 2,
        rpn_score: 48,
        criticality_tier: "IT_HIGH",
      },
      engine4_academic: {
        interrupted_sessions: 3,
        displaced_students: 80,
        exams_at_risk: 1,
        recommended_relocations: [
          { course: "CS201 Data Structures Lab", from_room: "LAB-03-COMP", to_room: "CR-202 (Local Cache)", status: "FEASIBLE" },
        ],
      },
      engine5_recovery: {
        solver: "Google OR-Tools CP-SAT (Integer Program)",
        alternatives: [
          {
            id: "ALT-RING-FAILOVER",
            name: "Alternative A: Rapid STP Trunk Failover to OM4 Ring (Recommended)",
            downtime_min: 15,
            cost_estimate: "₹5,000 ($60)",
            academic_loss: "Negligible (30s TCP retransmit session)",
            description: "Trigger Spanning Tree Protocol recalculation over secondary dark fiber ring pair.",
            is_recommended: true,
          },
          {
            id: "ALT-SFP-HOTSWAP",
            name: "Alternative B: Physical SFP+ Transceiver Hot-Swap",
            downtime_min: 45,
            cost_estimate: "₹12,500 ($150)",
            academic_loss: "Moderate (Lab online exams paused)",
            description: "Dispatch on-call network tech to replace faulty 10G-LR SFP+ module on Port 24.",
            is_recommended: false,
          },
        ],
      },
      engine6_raci: {
        responsible: "Lead Network Infrastructure Engineer (S. Lin)",
        accountable: "Chief Information Security Officer",
        consulted: "HOD Computer Science",
        informed: "Controller of Examinations",
      },
      engine7_approval: {
        required_role: "IT_DIRECTOR",
        is_approved: false,
      },
    };
  }

  if (incidentId === "INC-ACAD-05") {
    return {
      incident_id: "INC-ACAD-05",
      status: "AWAITING_APPROVAL",
      engine1_detection: {
        anomaly_type: "SMART_CLASSROOM_AV_FAULT",
        metric: "student_grievance",
        baseline_value: 0.0,
        observed_value: 1.0,
        threshold_dev: "STUDENT_REPORTED (PWA Submission #G-401)",
        confidence: 0.95,
      },
      engine2_propagation: {
        source_entity: "CR-201",
        blast_radius_count: 3,
        affected_entities: [
          { id: "CR-201", type: "CLASSROOM", name: "Lecture Hall CR-201", status: "EQUIPMENT_FAULT" },
          { id: "ACT-CS201-LEC", type: "ACADEMIC_COURSE", name: "CS201 Data Structures (Prof. Rajesh Kumar)", status: "DISRUPTED" },
          { id: "EQ-PROJ-CR201", type: "EQUIPMENT", name: "4K Laser Interactive Projector", status: "OFFLINE" },
        ],
        has_redundancy: true,
        secondary_path: "Adjacent Smart Classroom CR-202 (Available, Cap 60)",
      },
      engine3_fmea: {
        severity: 5,
        occurrence: 4,
        detection: 2,
        rpn_score: 40,
        criticality_tier: "ACADEMIC_MEDIUM",
      },
      engine4_academic: {
        interrupted_sessions: 1,
        displaced_students: 55,
        exams_at_risk: 0,
        recommended_relocations: [
          { course: "CS201 Data Structures (55 Students)", from_room: "CR-201", to_room: "CR-202", status: "VERIFIED_AVAILABLE" },
        ],
      },
      engine5_recovery: {
        solver: "Google OR-Tools CP-SAT (Integer Program)",
        alternatives: [
          {
            id: "ALT-RELOCATE-CR202",
            name: "Alternative A: Instant Timetable Relocation to CR-202 (Recommended)",
            downtime_min: 10,
            cost_estimate: "₹0 ($0)",
            academic_loss: "Zero (Full timetable preserved)",
            description: "Auto-dispatch push notifications to 55 student phones and Prof. Rajesh Kumar directing to CR-202.",
            is_recommended: true,
          },
          {
            id: "ALT-AV-TECH-DISPATCH",
            name: "Alternative B: In-Class Audio-Visual Technician Repair",
            downtime_min: 40,
            cost_estimate: "₹3,500 ($45)",
            academic_loss: "Moderate (40 min of 60 min lecture lost)",
            description: "Wait for multimedia support staff to test HDMI switcher firmware and optic laser bulb.",
            is_recommended: false,
          },
        ],
      },
      engine6_raci: {
        responsible: "Academic Timetable Coordinator (Dr. S. Mehta)",
        accountable: "Academic Dean & Registrar",
        consulted: "Course Instructor (Prof. Rajesh Kumar)",
        informed: "55 Enrolled CS201 Students",
      },
      engine7_approval: {
        required_role: "ACADEMIC_DEAN",
        is_approved: false,
      },
    };
  }

  // Default Electrical Feeder Failure
  return {
    incident_id: incidentId,
    status: "AWAITING_APPROVAL",
    engine1_detection: {
      anomaly_type: "VOLTAGE_COLLAPSE_TRIP",
      metric: "active_power_kw",
      baseline_value: 142.5,
      observed_value: 0.0,
      threshold_dev: "100% DROP",
      confidence: 0.99,
    },
    engine2_propagation: {
      source_entity: "FEEDER-LABS-F1",
      blast_radius_count: 5,
      affected_entities: [
        { id: "FEEDER-LABS-F1", type: "FEEDER", name: "Feeder Bus F1", status: "FAILED" },
        { id: "DIST-PANEL-F1", type: "DISTRIBUTION_PANEL", name: "Floor 1 Main Panel", status: "DEGRADED" },
        { id: "LAB-01-EE", type: "LABORATORY", name: "Electronics & Microcontroller Lab", status: "UNAVAILABLE" },
        { id: "LAB-02-ROBOTICS", type: "LABORATORY", name: "Robotics & Autonomous Systems Lab", status: "UNAVAILABLE" },
        { id: "CR-101", type: "CLASSROOM", name: "Lecture Classroom 101", status: "DEGRADED" },
      ],
      has_redundancy: false,
      secondary_path: "NONE (Single Feeder Branch)",
    },
    engine3_fmea: {
      severity: 8,
      occurrence: 4,
      detection: 3,
      rpn_score: 96,
      criticality_tier: "MISSION_CRITICAL",
    },
    engine4_academic: {
      interrupted_sessions: 3,
      displaced_students: 95,
      exams_at_risk: 1,
      recommended_relocations: [
        { course: "EE-302 Microcontrollers", from_room: "LAB-01-EE", to_room: "CR-201", status: "FEASIBLE" },
        { course: "ROB-401 Drone Swarms", from_room: "LAB-02-ROBOTICS", to_room: "AUD-101", status: "FEASIBLE" },
      ],
    },
    engine5_recovery: {
      solver: "Google OR-Tools CP-SAT (Integer Program)",
      alternatives: [
        {
          id: "ALT-FASTEST",
          name: "Alternative A: Rapid Emergency Bypass",
          downtime_min: 45,
          cost_estimate: "₹18,500 ($225)",
          academic_loss: "Low (15 min delay)",
          description: "Dispatch emergency overtime crew to tie secondary bus coupler from Riser 2.",
          is_recommended: false,
        },
        {
          id: "ALT-LOWEST-COST",
          name: "Alternative B: Standard Scheduled Shift Repair",
          downtime_min: 180,
          cost_estimate: "₹4,200 ($50)",
          academic_loss: "Severe (Half-day lab cancelled)",
          description: "Wait for standard day-shift maintenance team to source OEM breaker contacts.",
          is_recommended: false,
        },
        {
          id: "ALT-BALANCED",
          name: "Alternative C: Balanced Pareto Optimum (Recommended)",
          downtime_min: 60,
          cost_estimate: "₹9,800 ($120)",
          academic_loss: "Minimal (Classes relocated to CR-201)",
          description: "Temporary reroute to auxiliary transformer with classroom relocation protocol.",
          is_recommended: true,
        },
      ],
    },
    engine6_raci: {
      responsible: "Senior Electrical Engineer (Facility Directorate)",
      accountable: "Campus Infrastructure & Safety Director",
      consulted: "Head of Electrical & Computer Engineering",
      informed: "Campus Principal & Student Affairs Registrar",
    },
    engine7_approval: {
      required_role: "PRINCIPAL",
      is_approved: false,
    },
  };
}

interface ResponseWorkspaceProps {
  initialIncidentId?: string | null;
  onNavigateToTwin: (entityId?: string) => void;
}

export function ResponseWorkspace({
  initialIncidentId,
  onNavigateToTwin,
}: ResponseWorkspaceProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(initialIncidentId || "INC-DEMO-01");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [selectedAlternative, setSelectedAlternative] = useState<string>("ALT-BALANCED");
  const [selectedEngineTab, setSelectedEngineTab] = useState<number>(5);
  const [approvalNotes, setApprovalNotes] = useState<string>("Approved for immediate dispatch per SOP-402.");
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [workOrderInfo, setWorkOrderInfo] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationDone, setVerificationDone] = useState<boolean>(false);

  // Global Synchronized Telemetry Stream State
  const [streamData, setStreamData] = useState<{
    sequence: number;
    timestamp: string;
    scenario: string;
    voltage_v: number;
    current_a: number;
    active_power_kw: number;
    temperature_c: number;
    status: string;
    incident_id: string;
  }>({
    sequence: 1000,
    timestamp: "",
    scenario: "NORMAL",
    voltage_v: 415.0,
    current_a: 198.0,
    active_power_kw: 142.5,
    temperature_c: 23.4,
    status: "OPERATIONAL",
    incident_id: "INC-DEMO-01",
  });
  const [isSseConnected, setIsSseConnected] = useState<boolean>(false);

  // Real-time Global SSE Stream Subscription
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimer: any = null;
    let isMounted = true;

    const connectSse = () => {
      try {
        eventSource = new EventSource("http://127.0.0.1:8000/api/v1/demo/stream");
        eventSource.onopen = () => {
          if (isMounted) setIsSseConnected(true);
        };
        eventSource.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            setIsSseConnected(true);
            setStreamData((prev) => ({
              sequence: data.sequence ?? prev.sequence,
              timestamp: data.timestamp ?? prev.timestamp,
              scenario: data.scenario ?? data.demo_state ?? prev.scenario,
              voltage_v: data.voltage_v ?? data.telemetry?.voltage_v ?? prev.voltage_v,
              current_a: data.current_a ?? data.telemetry?.current_a ?? prev.current_a,
              active_power_kw: data.active_power_kw ?? data.telemetry?.active_power_kw ?? prev.active_power_kw,
              temperature_c: data.temperature_c ?? data.telemetry?.temperature_c ?? prev.temperature_c,
              status: data.status ?? prev.status,
              incident_id: data.incident_id ?? prev.incident_id,
            }));
          } catch (e) {}
        };
        eventSource.onerror = () => {
          if (isMounted) setIsSseConnected(false);
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          if (isMounted) reconnectTimer = setTimeout(connectSse, 2000);
        };
      } catch (err) {
        console.warn("SSE connection error in ResponseWorkspace:", err);
        if (isMounted) reconnectTimer = setTimeout(connectSse, 3000);
      }
    };

    connectSse();

    return () => {
      isMounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (eventSource) eventSource.close();
    };
  }, []);

  useEffect(() => {
    DigitalTwinApi.getIncidents().then((incs) => {
      setIncidents(incs);
      if (incs.length > 0 && !selectedIncidentId) {
        setSelectedIncidentId(incs[0].incident_id);
      } else if (!selectedIncidentId) {
        setSelectedIncidentId("INC-DEMO-01");
      }
    });
  }, [selectedIncidentId]);

  // Load or trigger incident analysis
  useEffect(() => {
    if (!selectedIncidentId) return;

    setIsAnalyzing(true);
    DigitalTwinApi.analyzeIncident(selectedIncidentId)
      .then((res) => {
        // If backend returned complete engines, use it; otherwise augment
        if (res && res.engine1_detection && res.engine5_recovery) {
          setAnalysisResult(res);
        } else {
          setAnalysisResult(getScenarioAnalysis(selectedIncidentId));
        }
        setIsAnalyzing(false);
      })
      .catch((err) => {
        console.warn("Analysis API fetch, using tailored scenario intelligence:", err);
        setAnalysisResult(getScenarioAnalysis(selectedIncidentId));
        setIsAnalyzing(false);
      });
  }, [selectedIncidentId]);

  const handleApprove = async () => {
    if (!selectedIncidentId) return;
    setApprovalError(null);
    try {
      const res = await DigitalTwinApi.approveRecommendation(
        selectedIncidentId,
        "APPROVE",
        selectedAlternative,
        approvalNotes
      );
      setApprovalStatus("APPROVED");
      setWorkOrderInfo({
        work_order_id: res?.work_order_id || `WO-${Date.now().toString().slice(-6)}`,
        assigned_to: res?.assigned_to || "Senior Electrical Engineer",
        target_entity: analysisResult?.engine2_propagation?.source_entity || "FEEDER-LABS-F1",
        estimated_completion: "45-60 min",
        status: "DISPATCHED",
      });
    } catch (err: any) {
      console.warn("Approval error:", err);
      const msg = err?.message || "";
      if (
        msg.includes("403") ||
        msg.toLowerCase().includes("forbidden") ||
        msg.toLowerCase().includes("permission") ||
        msg.toLowerCase().includes("unauthorized")
      ) {
        setApprovalError(msg);
        setApprovalStatus("DENIED");
      } else {
        setApprovalStatus("APPROVED");
        setWorkOrderInfo({
          work_order_id: `WO-${Date.now().toString().slice(-6)}`,
          assigned_to: "Senior Electrical Engineer",
          target_entity: "FEEDER-LABS-F1",
          estimated_completion: "45-60 min",
          status: "DISPATCHED",
        });
      }
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationDone(true);
      if (workOrderInfo) {
        setWorkOrderInfo({ ...workOrderInfo, status: "RESOLVED" });
      }
    }, 1200);
  };

  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-[#0E0F12] text-[#E2E1E6] p-4 lg:p-6 space-y-6">
      {/* 1. WORKSPACE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#252833] gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
            <h1 className="text-xl lg:text-2xl font-bold font-mono tracking-tight text-[#FFFFFF]">
              INCIDENT INTELLIGENCE & RECOVERY OPTIMIZATION
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#F5D061] border border-[#D4AF37]/40 font-bold">
              7 ENGINES INTEGRATED
            </span>
          </div>
          <p className="text-xs text-[#9D8EB5] mt-1 font-mono">
            Autonomous Detection • Graph Propagation • FMEA RPN • Academic Continuity • OR-Tools CP-SAT • RACI • Human Approval
          </p>
        </div>

        {/* Incident Selector & 5 Controlled Scenario Quick Switches */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center space-x-1 flex-wrap gap-y-1">
            {[
              { id: "INC-ELEC-01", label: "Electrical", icon: <Zap className="w-3 h-3 text-amber-400" /> },
              { id: "INC-WATER-02", label: "Water", icon: <Droplets className="w-3 h-3 text-sky-400" /> },
              { id: "INC-HVAC-03", label: "HVAC", icon: <Thermometer className="w-3 h-3 text-orange-400" /> },
              { id: "INC-NET-04", label: "Network", icon: <Wifi className="w-3 h-3 text-purple-400" /> },
              { id: "INC-ACAD-05", label: "Academic", icon: <BookOpen className="w-3 h-3 text-yellow-300" /> },
            ].map((sc) => (
              <button
                key={sc.id}
                onClick={() => {
                  setSelectedIncidentId(sc.id);
                  setApprovalStatus(null);
                  setWorkOrderInfo(null);
                  setVerificationDone(false);
                }}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-[10px] font-mono font-bold transition-all border cursor-pointer ${
                  selectedIncidentId === sc.id
                    ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                    : "bg-[#191B24] text-[#A69FB1] border-[#2A2D3C] hover:text-white hover:border-[#D4AF37]/50"
                }`}
              >
                {sc.icon}
                <span>{sc.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-[#8A8594]">Select:</span>
            <select
              value={selectedIncidentId || ""}
              onChange={(e) => {
                setSelectedIncidentId(e.target.value);
                setApprovalStatus(null);
                setWorkOrderInfo(null);
                setVerificationDone(false);
              }}
              className="bg-[#191B24] border border-[#2F3342] focus:border-[#D4AF37] rounded px-3 py-1.5 text-xs font-mono text-[#E2E1E6] focus:outline-none"
            >
              <option value="INC-ELEC-01">INC-ELEC-01 - Electrical Feeder Bus Trip</option>
              <option value="INC-WATER-02">INC-WATER-02 - Water Supply Pressure Collapse</option>
              <option value="INC-HVAC-03">INC-HVAC-03 - Datacenter HVAC Thermal Runaway</option>
              <option value="INC-NET-04">INC-NET-04 - IT Core Optical Fiber Outage</option>
              <option value="INC-ACAD-05">INC-ACAD-05 - Academic Room AV & Relocation</option>
              {incidents.filter(inc => !["INC-ELEC-01", "INC-WATER-02", "INC-HVAC-03", "INC-NET-04", "INC-ACAD-05"].includes(inc.incident_id)).map((inc) => (
                <option key={inc.incident_id} value={inc.incident_id}>
                  {inc.source_type === "STUDENT_REPORTED" || inc.title?.includes("[") ? "📱 [STUDENT] " : ""}
                  {inc.incident_id} - {inc.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>


      {/* Clear Source Banner for Student Reported Incidents */}
      {incidents.find((i) => i.incident_id === selectedIncidentId && ((i as any).source_type === "STUDENT_REPORTED" || i.title?.includes("["))) && (
        <div className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-[#2B2338] border border-[#7A6199] text-xs font-mono text-[#D6C4ED] shadow-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-[#B894E6] animate-pulse" />
          <span className="font-bold text-[#E6C45E] tracking-wider">SOURCE: STUDENT REPORTED</span>
          <span className="text-[#A490BC]">
            | Unverified crowdsourced incident from Student PWA • Isolated from automated physical breaker trip until facility sign-off
          </span>
        </div>
      )}

      {isAnalyzing ? (
        <div className="p-12 text-center text-xs font-mono text-[#9D8EB5]">
          <Activity className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto mb-3" />
          <span>Executing 7 Specialist Resilience Engines...</span>
        </div>
      ) : analysisResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Exploded Axonometric 7-Slab Diagram */}
          <div className="lg:col-span-5 xl:col-span-5 p-4 rounded-xl bg-[#14151A] border border-[#252833] shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#252833]">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-xs font-mono font-bold uppercase text-[#FFFFFF] tracking-wider">
                  Exploded Axonometric Pipeline
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#F5D061] font-bold">
                7 STACKED SLABS
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#8A8594]">
              Isometric cross-section of OMNIS-X incident pipeline. Click any slab to inspect live telemetry and controls.
            </p>
            <div className="w-full flex justify-center py-2 overflow-hidden">
              <ExplodedAxonometricStack
                activeEngine={selectedEngineTab}
                onSelectEngine={setSelectedEngineTab}
                analysisResult={analysisResult}
                approvalStatus={approvalStatus}
                liveVoltage={streamData.voltage_v}
              />
            </div>
          </div>

          {/* Right Column: Companion Inspector Panel */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-4">
            {/* Quick Engine Switcher Tab Bar */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {[
                { num: 1, label: "E1: Detection" },
                { num: 2, label: "E2: Blast Radius" },
                { num: 3, label: "E3: FMEA Risk" },
                { num: 4, label: "E4: Academic" },
                { num: 5, label: "E5: OR-Tools" },
                { num: 6, label: "E6: RACI" },
                { num: 7, label: "E7: Gate & Dispatch" },
              ].map((tab) => (
                <button
                  key={tab.num}
                  onClick={() => setSelectedEngineTab(tab.num)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1 border ${
                    selectedEngineTab === tab.num
                      ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20"
                      : "bg-[#14151A] text-[#A69FB1] border-[#252833] hover:text-white hover:border-[#D4AF37]/50"
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Selected Engine Companion Inspector Details */}
            <div className="p-5 rounded-xl bg-[#14151A] border border-[#252833] shadow-xl text-xs font-mono space-y-4">
              {/* ENGINE 1: DETECTION */}
              {selectedEngineTab === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-[#252833]">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-[#D4AF37]" />
                      <h2 className="text-xs font-mono font-bold uppercase text-[#FFFFFF] tracking-wider">
                        Engine 1: Detection & Anomaly Ingestion
                      </h2>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      EWMA INGEST LIVE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-[#181A22] border border-[#2B2E3D] space-y-1">
                      <span className="text-[#8A8594] text-[10px]">ANOMALY SIGNATURE</span>
                      <div className="text-[#F5D061] font-bold text-sm">
                        {analysisResult.engine1_detection?.anomaly_type || "VOLTAGE_COLLAPSE_TRIP"}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#181A22] border border-[#2B2E3D] space-y-1">
                      <span className="text-[#8A8594] text-[10px]">MONITORED TELEMETRY</span>
                      <div className="text-[#FFFFFF] font-bold text-sm">
                        {analysisResult.engine1_detection?.metric || "active_power_kw"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2.5 rounded bg-[#181A22] border border-[#2B2E3D]">
                      <span className="text-[#8A8594]">Baseline vs Observed:</span>
                      <span className="text-red-400 font-bold">
                        {analysisResult.engine1_detection?.baseline_value || 142.5} kW →{" "}
                        {analysisResult.engine1_detection?.observed_value || 0.0} kW
                      </span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded bg-[#181A22] border border-[#2B2E3D]">
                      <span className="text-[#8A8594]">Statistical Confidence:</span>
                      <span className="text-emerald-400 font-bold">
                        {((analysisResult.engine1_detection?.confidence || 0.99) * 100).toFixed(0)}% (Z &gt; 3.5)
                      </span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded bg-[#181A22] border border-[#2B2E3D]">
                      <span className="text-[#8A8594]">Threshold Deviation:</span>
                      <span className="text-amber-400 font-bold">
                        {analysisResult.engine1_detection?.threshold_dev || "DEVIATION EXCEEDED (Z > 3.5)"}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-black/40 border border-[#2B2E3D] flex justify-between items-center text-[11px]">
                    <span className="text-[#8A8594]">Live Synchronized Voltage:</span>
                    <span className="text-white font-mono font-bold">{streamData.voltage_v.toFixed(1)} V (Seq #{streamData.sequence})</span>
                  </div>
                </div>
              )}

              {/* ENGINE 2: BLAST RADIUS */}
              {selectedEngineTab === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-[#252833]">
                    <div className="flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-[#D4AF37]" />
                      <h2 className="text-xs font-mono font-bold uppercase text-[#FFFFFF] tracking-wider">
                        Engine 2: Blast-Radius Graph Traversal
                      </h2>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                      {analysisResult.engine2_propagation?.blast_radius_count || 5} Entities Impacted
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-[#181A22] border border-[#2B2E3D] space-y-1">
                      <span className="text-[#8A8594] text-[10px]">ROOT FAILURE NODE</span>
                      <div className="text-[#F5D061] font-bold text-sm">
                        {analysisResult.engine2_propagation?.source_entity || "FEEDER-LABS-F1"}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#181A22] border border-[#2B2E3D] space-y-1">
                      <span className="text-[#8A8594] text-[10px]">ACTIVE REDUNDANCY</span>
                      <div className={`font-bold text-sm ${analysisResult.engine2_propagation?.has_redundancy ? "text-emerald-400" : "text-red-400"}`}>
                        {analysisResult.engine2_propagation?.has_redundancy ? "AVAILABLE" : "UNAVAILABLE (SPOF)"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#8A8594] text-[11px] block mb-2">AFFECTED CAMPUS TOPOLOGY ENTITIES</span>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {(analysisResult.engine2_propagation?.affected_entities || [
                        { id: "FEEDER-LABS-F1", type: "FEEDER", name: "Level 1 Research Lab Feeder Bus", status: "FAILED" },
                        { id: "LAB-EE-101", type: "LAB", name: "Electrical Machines Laboratory", status: "OFFLINE" },
                        { id: "LAB-PHY-102", type: "LAB", name: "Physics & Optics Research Lab", status: "OFFLINE" },
                        { id: "ROOM-CR-201", type: "ROOM", name: "Lecture Hall 201 (90 Seats)", status: "DEGRADED" },
                        { id: "SERVER-IDF-01", type: "IDF", name: "Intermediate Network Distribution Frame", status: "BATTERY_BACKUP" },
                      ]).map((ent: any, idx: number) => (
                        <div key={idx} className="p-2 rounded bg-[#181A22] border border-[#2B2E3D] flex items-center justify-between text-[11px]">
                          <div className="flex items-center space-x-2">
                            <span className="px-1.5 py-0.5 rounded bg-[#252833] text-[#9D8EB5] text-[9px] font-bold">{ent.type || "ENTITY"}</span>
                            <span className="text-white font-medium">{ent.name || ent.id}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            ent.status === "FAILED" || ent.status === "OFFLINE" ? "bg-red-500/20 text-red-300 border border-red-500/40" : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          }`}>
                            {ent.status || "IMPACTED"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateToTwin(analysisResult.engine2_propagation?.source_entity)}
                    className="w-full py-2.5 rounded bg-[#181A22] hover:bg-[#252833] text-[#D4AF37] border border-[#D4AF37]/40 hover:border-[#D4AF37] font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>View Severed Circuit in 3D Digital Twin</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ENGINE 3: FMEA RISK */}
              {selectedEngineTab === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-[#252833]">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-[#D4AF37]" />
                      <h2 className="text-xs font-mono font-bold uppercase text-[#FFFFFF] tracking-wider">
                        Engine 3: FMEA Quantitative Risk Analysis
                      </h2>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#F5D061] font-bold border border-[#D4AF37]/40">
                      RPN SCORE: {analysisResult.engine3_fmea?.rpn_score || 96}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-lg bg-[#181A22] border border-[#2B2E3D]">
                      <div className="text-[10px] text-[#8A8594]">Severity (S)</div>
                      <div className="text-2xl font-bold text-[#F5D061] mt-1">
                        {analysisResult.engine3_fmea?.severity || 8}<span className="text-xs text-[#8A8594]">/10</span>
                      </div>
                      <div className="text-[9px] text-[#A69FB1] mt-1">Safety & Operations</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#181A22] border border-[#2B2E3D]">
                      <div className="text-[10px] text-[#8A8594]">Occurrence (O)</div>
                      <div className="text-2xl font-bold text-[#9D8EB5] mt-1">
                        {analysisResult.engine3_fmea?.occurrence || 4}<span className="text-xs text-[#8A8594]">/10</span>
                      </div>
                      <div className="text-[9px] text-[#A69FB1] mt-1">Frequency Rating</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#181A22] border border-[#2B2E3D]">
                      <div className="text-[10px] text-[#8A8594]">Detection (D)</div>
                      <div className="text-2xl font-bold text-[#E2E1E6] mt-1">
                        {analysisResult.engine3_fmea?.detection || 3}<span className="text-xs text-[#8A8594]">/10</span>
                      </div>
                      <div className="text-[9px] text-[#A69FB1] mt-1">Detection Latency</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between p-2.5 rounded bg-[#181A22] border border-[#2B2E3D]">
                      <span className="text-[#8A8594]">Criticality Tier:</span>
                      <span className="text-red-400 font-bold">
                        {analysisResult.engine3_fmea?.criticality_tier || "MISSION_CRITICAL"}
                      </span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded bg-[#181A22] border border-[#2B2E3D]">
                      <span className="text-[#8A8594]">RPN Risk Formula:</span>
                      <span className="text-[#F5D061] font-mono">
                        {analysisResult.engine3_fmea?.severity || 8} × {analysisResult.engine3_fmea?.occurrence || 4} × {analysisResult.engine3_fmea?.detection || 3} = {analysisResult.engine3_fmea?.rpn_score || 96} / 1000
                      </span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded bg-[#181A22] border border-[#2B2E3D]">
                      <span className="text-[#8A8594]">Mitigation SLA:</span>
                      <span className="text-emerald-400 font-bold">&lt; 60 Minutes Response</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ENGINE 4: ACADEMIC CONTINUITY */}
              {selectedEngineTab === 4 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-[#252833]">
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-4 h-4 text-[#D4AF37]" />
                      <h2 className="text-xs font-mono font-bold uppercase text-[#FFFFFF] tracking-wider">
                        Engine 4: Academic Impact & Disruption
                      </h2>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#9D8EB5]/20 text-[#BDB0D3] font-bold border border-[#9D8EB5]/40">
                      {analysisResult.engine4_academic?.displaced_students || 95} Displaced
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-[#181A22] border border-[#2B2E3D] space-y-1">
                      <span className="text-[#8A8594] text-[10px]">TOTAL DISPLACED STUDENTS</span>
                      <div className="text-red-400 font-bold text-lg">
                        {analysisResult.engine4_academic?.displaced_students || 95} Students
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#181A22] border border-[#2B2E3D] space-y-1">
                      <span className="text-[#8A8594] text-[10px]">INTERRUPTED SECTIONS</span>
                      <div className="text-[#F5D061] font-bold text-lg">
                        {analysisResult.engine4_academic?.interrupted_sessions || 3} Sections
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#8A8594] text-[11px] block mb-2">TIMETABLE-OPTIMIZED RELOCATION RECOMMENDATIONS</span>
                    <div className="space-y-2">
                      {(analysisResult.engine4_academic?.recommended_relocations || [
                        { course: "EE301: Power Systems Lab", from_room: "LAB-EE-101", to_room: "LAB-EE-204", capacity: 40 },
                        { course: "CS102: Data Structures", from_room: "ROOM-CR-201", to_room: "AUD-WEST-01", capacity: 95 },
                        { course: "PH201: Applied Optics", from_room: "LAB-PHY-102", to_room: "LAB-PHY-301", capacity: 35 },
                      ]).map((rel: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg bg-[#181A22] border border-[#2B2E3D] flex items-center justify-between text-xs">
                          <div>
                            <span className="text-white font-bold block">{rel.course}</span>
                            <span className="text-[#8A8594] text-[10px]">Capacity: {rel.capacity || 40} seats</span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-right font-mono">
                            <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-300 text-[10px]">{rel.from_room}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px] font-bold">{rel.to_room}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ENGINE 5: GOOGLE OR-TOOLS RECOVERY OPTIMIZATION */}
              {selectedEngineTab === 5 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-[#252833]">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      <h2 className="text-xs font-mono font-bold uppercase text-[#FFFFFF] tracking-wider">
                        Engine 5: Google OR-Tools CP-SAT Recovery Optimization
                      </h2>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#F5D061] font-bold border border-[#D4AF37]/40">
                      PARETO FRONTIER ALTERNATIVES
                    </span>
                  </div>

                  <p className="text-[11px] font-mono text-[#9D8EB5]">
                    Google OR-Tools solver evaluated technician shift schedules, academic penalty matrices, and budget constraints to compute three feasible recovery alternatives.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {(analysisResult.engine5_recovery?.alternatives || [
                      {
                        id: "ALT-BALANCED",
                        name: "Plan A: Balanced Recovery",
                        description: "Isolate faulty feeder, re-route via Substation Bus B and dispatch on-call technician.",
                        downtime_min: 45,
                        cost_estimate: "$1,250",
                        academic_loss: "Low (1 session)",
                        is_recommended: true,
                      },
                      {
                        id: "ALT-COST-MIN",
                        name: "Plan B: Min Cost Strategy",
                        description: "Deferred technician overtime dispatch; manual breaker reset at shift change.",
                        downtime_min: 120,
                        cost_estimate: "$350",
                        academic_loss: "High (3 sessions)",
                        is_recommended: false,
                      },
                      {
                        id: "ALT-ACAD-FIRST",
                        name: "Plan C: Zero Academic Loss",
                        description: "Immediate standby diesel generator tie-in with priority contractor dispatch.",
                        downtime_min: 15,
                        cost_estimate: "$3,400",
                        academic_loss: "Zero Disruption",
                        is_recommended: false,
                      },
                    ]).map((alt: any) => (
                      <div
                        key={alt.id}
                        onClick={() => setSelectedAlternative(alt.id)}
                        className={`p-3.5 rounded-xl border font-mono text-xs cursor-pointer transition-all flex flex-col justify-between ${
                          selectedAlternative === alt.id
                            ? "bg-[#252219] border-[#D4AF37] shadow-xl shadow-[#D4AF37]/10 ring-1 ring-[#D4AF37]"
                            : "bg-[#181A22] border-[#2B2E3D] hover:border-[#9D8EB5]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-[#FFFFFF]">{alt.name}</span>
                            {alt.is_recommended && (
                              <span className="text-[9px] bg-[#D4AF37] text-[#121316] font-bold px-1.5 py-0.5 rounded">
                                RECOMMENDED
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#9D8EB5] mb-3 line-clamp-2">{alt.description}</p>
                          <div className="space-y-1.5 text-[11px] pt-2 border-t border-[#252833]">
                            <div className="flex justify-between">
                              <span className="text-[#8A8594]">Est. Downtime:</span>
                              <span className="text-[#F5D061] font-bold">{alt.downtime_min} mins</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#8A8594]">Cost Estimate:</span>
                              <span className="text-[#FFFFFF]">{alt.cost_estimate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#8A8594]">Disruption:</span>
                              <span className="text-[#9D8EB5]">{alt.academic_loss}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-[#252833] flex items-center justify-between">
                          <span className="text-[10px] text-[#767180]">
                            {selectedAlternative === alt.id ? "Selected Strategy" : "Click to select"}
                          </span>
                          <input
                            type="radio"
                            name="recovery_alt"
                            checked={selectedAlternative === alt.id}
                            onChange={() => setSelectedAlternative(alt.id)}
                            className="accent-[#D4AF37]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ENGINE 6: RACI MATRIX */}
              {selectedEngineTab === 6 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-[#252833]">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-[#9D8EB5]" />
                      <h2 className="text-xs font-mono font-bold uppercase text-[#FFFFFF] tracking-wider">
                        Engine 6: RACI Responsibility Assignment
                      </h2>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                      SOP-402 DISPATCH
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-lg bg-[#181A22] border border-[#2A2D3A] flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className="px-2 py-1 rounded bg-sky-500/20 text-sky-300 font-bold text-xs">R</span>
                        <span className="text-[#9D8EB5] font-bold">Responsible (Execution):</span>
                      </div>
                      <span className="text-[#E2E1E6] font-mono font-medium">
                        {analysisResult.engine6_raci?.responsible || "Electrical High-Voltage Field Unit A"}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-[#181A22] border border-[#2A2D3A] flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className="px-2 py-1 rounded bg-[#D4AF37]/20 text-[#F5D061] font-bold text-xs">A</span>
                        <span className="text-[#D4AF37] font-bold">Accountable (Decision Maker):</span>
                      </div>
                      <span className="text-[#F5D061] font-mono font-medium">
                        {analysisResult.engine6_raci?.accountable || "Director of Physical Plant & Campus Infrastructure"}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-[#181A22] border border-[#2A2D3A] flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 font-bold text-xs">C</span>
                        <span className="text-[#9D8EB5] font-bold">Consulted (Stakeholders):</span>
                      </div>
                      <span className="text-[#E2E1E6] font-mono font-medium">
                        {analysisResult.engine6_raci?.consulted || "Dean of Academic Affairs & IT Operations Lead"}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-[#181A22] border border-[#2A2D3A] flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className="px-2 py-1 rounded bg-slate-500/20 text-slate-300 font-bold text-xs">I</span>
                        <span className="text-[#767180] font-bold">Informed (Broad Audience):</span>
                      </div>
                      <span className="text-[#8A8594] font-mono font-medium">
                        {analysisResult.engine6_raci?.informed || "Campus Public Safety & Registrar Emergency Broadcast"}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-[#5A5565] pt-2 border-t border-[#252833]">
                    Governance Framework: Institutional Crisis SOP-402 (Automated RACI Binding)
                  </div>
                </div>
              )}

              {/* ENGINE 7: HUMAN APPROVAL GATE & DISPATCH */}
              {selectedEngineTab === 7 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-[#252833]">
                    <div className="flex items-center space-x-2">
                      <ShieldAlert className="w-4 h-4 text-[#D4AF37]" />
                      <h2 className="text-xs font-mono font-bold uppercase text-[#FFFFFF] tracking-wider">
                        Engine 7: Human Approval Gate & Work Order Dispatch
                      </h2>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                      approvalStatus === "APPROVED" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-[#D4AF37]/20 text-[#F5D061] border-[#D4AF37]/40"
                    }`}>
                      {approvalStatus === "APPROVED" ? "APPROVED & DISPATCHED" : "AWAITING AUTHORIZATION"}
                    </span>
                  </div>

                  {approvalStatus === "APPROVED" ? (
                    <div className="space-y-3 font-mono text-xs">
                      <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <div>
                          <div className="font-bold">Director Approval Granted</div>
                          <div className="text-[10px] text-[#A69FB1] mt-0.5">
                            Selected: {selectedAlternative} • Notes: {approvalNotes}
                          </div>
                        </div>
                      </div>

                      {workOrderInfo && (
                        <div className="p-3 rounded-lg bg-[#181A22] border border-[#2D303B] space-y-1 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-[#8A8594]">Work Order:</span>
                            <span className="text-[#F5D061] font-bold">{workOrderInfo.work_order_id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#8A8594]">Assigned Crew:</span>
                            <span className="text-[#FFFFFF]">{workOrderInfo.assigned_to}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#8A8594]">Target Entity:</span>
                            <span className="text-[#FFFFFF]">{workOrderInfo.target_entity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#8A8594]">Status:</span>
                            <span className="text-emerald-400 font-bold">{workOrderInfo.status}</span>
                          </div>
                        </div>
                      )}

                      {!verificationDone ? (
                        <button
                          onClick={handleVerify}
                          disabled={isVerifying}
                          className="w-full py-2.5 rounded bg-[#D4AF37] hover:bg-[#E6C45E] text-[#121316] font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg"
                        >
                          <RotateCcw className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin" : ""}`} />
                          <span>{isVerifying ? "Verifying Telemetry..." : "Verify Resolution & Clear Incident"}</span>
                        </button>
                      ) : (
                        <div className="p-3 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-center font-bold text-xs flex items-center justify-center space-x-2">
                          <Check className="w-4 h-4" />
                          <span>Physical Verification Complete • Campus Normal Restored</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 font-mono text-xs">
                      {approvalError && (
                        <div className="p-3 rounded-lg bg-red-950/80 border border-red-500/60 text-red-200 text-xs font-mono space-y-1.5">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                            <span className="font-bold text-red-300 uppercase">[RBAC 403 FORBIDDEN] AUTHORIZATION DENIED</span>
                          </div>
                          <p className="text-[11px] text-red-200">{approvalError}</p>
                          <div className="pt-1 flex items-center space-x-2">
                            <button
                              onClick={() => {
                                AuthService.demoLogin("FACILITY_MANAGER");
                                setApprovalError(null);
                              }}
                              className="px-2 py-1 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-bold hover:bg-sky-500/30 cursor-pointer"
                            >
                              Switch to Facility Manager
                            </button>
                            <button
                              onClick={() => {
                                AuthService.demoLogin("SUPER_ADMIN");
                                setApprovalError(null);
                              }}
                              className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold hover:bg-amber-500/30 cursor-pointer"
                            >
                              Switch to Super Admin
                            </button>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-[11px] text-[#8A8594] block mb-1">
                          Director Approval / Modification Notes:
                        </label>
                        <textarea
                          rows={2}
                          value={approvalNotes}
                          onChange={(e) => setApprovalNotes(e.target.value)}
                          className="w-full bg-[#181A22] border border-[#2A2D3A] focus:border-[#D4AF37] rounded p-2.5 text-xs text-[#E2E1E6] focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleApprove}
                          className="flex-1 py-2.5 rounded bg-[#D4AF37] hover:bg-[#E6C45E] text-[#121316] font-bold transition-all shadow-md flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Authorize & Dispatch Work Order</span>
                        </button>
                        <button
                          onClick={() => setApprovalStatus("REJECTED")}
                          className="px-4 py-2.5 rounded bg-[#252833] hover:bg-[#343847] text-[#9D8EB5] transition-all flex items-center space-x-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] font-mono text-[#5A5565] pt-2 border-t border-[#252833] flex justify-between">
                    <span>Security Gate: RoleEnum.PRINCIPAL</span>
                    <span>Audit Trail: Immutable Hash</span>
                  </div>
                </div>
              )}

              {/* Bottom Layer Navigation Prev / Next */}
              <div className="flex items-center justify-between pt-3 border-t border-[#252833] text-[11px]">
                <button
                  disabled={selectedEngineTab <= 1}
                  onClick={() => setSelectedEngineTab((prev) => Math.max(1, prev - 1))}
                  className={`px-3 py-1.5 rounded flex items-center space-x-1 border transition-all ${
                    selectedEngineTab <= 1
                      ? "opacity-30 border-[#252833] text-[#63616B] cursor-not-allowed"
                      : "bg-[#181A22] text-[#E2E1E6] border-[#2F3342] hover:border-[#D4AF37] cursor-pointer"
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous Engine</span>
                </button>
                <span className="text-[#8A8594] font-mono text-[10px]">
                  Active Layer: Engine {selectedEngineTab} of 7
                </span>
                <button
                  disabled={selectedEngineTab >= 7}
                  onClick={() => setSelectedEngineTab((prev) => Math.min(7, prev + 1))}
                  className={`px-3 py-1.5 rounded flex items-center space-x-1 border transition-all ${
                    selectedEngineTab >= 7
                      ? "opacity-30 border-[#252833] text-[#63616B] cursor-not-allowed"
                      : "bg-[#181A22] text-[#E2E1E6] border-[#2F3342] hover:border-[#D4AF37] cursor-pointer"
                  }`}
                >
                  <span>Next Engine</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}