"use client";

import React, { useState } from "react";
import {
  Shield,
  User,
  Key,
  Building,
  CheckCircle2,
  Lock,
  ChevronDown,
  Sparkles,
  Award,
  Zap,
  X,
  FileText,
} from "lucide-react";

export interface PersonaProfile {
  id: string;
  characterName: string;
  titleQuote: string;
  role: "PRINCIPAL" | "HOD" | "FACILITY_MANAGER" | "IT_ADMIN" | "FACULTY" | "STUDENT";
  displayRole: string;
  userId: string;
  department: string;
  accessScope: string;
  permissions: string[];
  avatarGradient: string;
  initials: string;
  status: "ACTIVE_VERIFIED" | "SUSPENDED" | "STANDBY";
}

export const KUNG_FU_PANDA_PERSONAS: PersonaProfile[] = [
  {
    id: "oogway",
    characterName: "Master Oogway",
    titleQuote: "Yesterday is history, tomorrow is a mystery, but today is a gift. That is why it is called the present.",
    role: "PRINCIPAL",
    displayRole: "Campus Principal & Executive Directorate",
    userId: "USR-PRINCIPAL",
    department: "Executive Directorate & Board of Trustees",
    accessScope: "Campus-Wide Sovereign Authority (All Levels & Breakers)",
    permissions: [
      "APPROVE_WORK_ORDERS",
      "EXECUTE_CHAOS_SIMULATION",
      "AUTHORIZE_RECOVERY_PLANS",
      "FINANCIAL_SIGN_OFF",
      "FULL_SYSTEM_AUDIT",
    ],
    avatarGradient: "from-emerald-600 via-teal-700 to-emerald-950",
    initials: "MO",
    status: "ACTIVE_VERIFIED",
  },
  {
    id: "shifu",
    characterName: "Master Shifu",
    titleQuote: "If you only do what you can do, you will never be more than who you are.",
    role: "HOD",
    displayRole: "Head of Department (Academic Coordinator)",
    userId: "USR-HOD-ECE",
    department: "Department of Electronics & Computer Engineering",
    accessScope: "Academic Wing Level 1 & Level 2 Timetables",
    permissions: [
      "RELOCATE_COURSE_SECTIONS",
      "VIEW_FACULTY_WORKLOAD",
      "REQUEST_EQUIPMENT_REPAIR",
      "READ_DEPARTMENT_TELEMETRY",
    ],
    avatarGradient: "from-amber-600 via-yellow-700 to-amber-950",
    initials: "MS",
    status: "ACTIVE_VERIFIED",
  },
  {
    id: "tigress",
    characterName: "Master Tigress",
    titleQuote: "Real strength lies within discipline, vigilance, and swift recovery execution.",
    role: "FACILITY_MANAGER",
    displayRole: "Director of Physical Infrastructure & Energy",
    userId: "USR-FACILITY-DIR",
    department: "Directorate of Physical Infrastructure & Energy Systems",
    accessScope: "Substations, Switchgear, UPS Banks, Risers, Solar Arrays",
    permissions: [
      "DISPATCH_WORK_ORDERS",
      "ACTUATE_CIRCUIT_BREAKERS",
      "MANAGE_EV_CHARGING",
      "ISOLATE_ELECTRICAL_FAULTS",
    ],
    avatarGradient: "from-orange-600 via-amber-800 to-stone-900",
    initials: "TG",
    status: "ACTIVE_VERIFIED",
  },
  {
    id: "monkey",
    characterName: "Master Monkey",
    titleQuote: "Speed, agility, and redundant fiber uplinks keep the institutional packets flowing!",
    role: "IT_ADMIN",
    displayRole: "Chief Campus Network & Cyber Administrator",
    userId: "USR-IT-NETADMIN",
    department: "Campus Cyber-Infrastructure & MDF Core Services",
    accessScope: "MDF Core, Optical Fibers, IDF Switches, GPU Cluster",
    permissions: [
      "MANAGE_FIREWALL",
      "CONFIGURE_VLAN_TRUNKS",
      "REBOOT_EDGE_SWITCHES",
      "MONITOR_CYBER_TELEMETRY",
    ],
    avatarGradient: "from-yellow-600 via-amber-700 to-stone-900",
    initials: "MK",
    status: "ACTIVE_VERIFIED",
  },
  {
    id: "viper",
    characterName: "Master Viper",
    titleQuote: "Precision, compassion, and adaptability in every laboratory curriculum.",
    role: "FACULTY",
    displayRole: "Senior Research Professor & Laboratory Head",
    userId: "USR-FACULTY-EE",
    department: "Department of Electrical Engineering",
    accessScope: "Assigned Research Laboratories (LAB-01-EE, LAB-02-ROBOTICS)",
    permissions: [
      "SUBMIT_INCIDENT_REPORT",
      "VIEW_LAB_TELEMETRY",
      "VIEW_STUDENT_ROSTERS",
    ],
    avatarGradient: "from-teal-600 via-emerald-800 to-slate-900",
    initials: "VP",
    status: "ACTIVE_VERIFIED",
  },
  {
    id: "po",
    characterName: "Po (The Dragon Warrior)",
    titleQuote: "There is no secret ingredient. It's just you... and resilient cyber-physical infrastructure!",
    role: "STUDENT",
    displayRole: "Student Delegate & Undergrad Researcher",
    userId: "USR-STUDENT-01",
    department: "School of Computer Science & Robotics (Undergraduate)",
    accessScope: "Public Student Spaces & Enrolled Classroom Timetable",
    permissions: [
      "SUBMIT_PWA_INCIDENT",
      "VIEW_OWN_TIMETABLE",
      "READ_PUBLIC_NOTICES",
    ],
    avatarGradient: "from-neutral-700 via-zinc-800 to-black",
    initials: "PO",
    status: "ACTIVE_VERIFIED",
  },
  {
    id: "mantis",
    characterName: "Master Mantis",
    titleQuote: "Quick diagnostics and microscopic precision solve electrical surges.",
    role: "FACILITY_MANAGER",
    displayRole: "Rapid Response Field Technician",
    userId: "USR-FIELD-TECH",
    department: "Emergency Facility Operations",
    accessScope: "Riser Shafts, Distribution Panels, Breaker Boxes",
    permissions: ["DISPATCH_WORK_ORDERS", "LOG_MAINTENANCE"],
    avatarGradient: "from-lime-600 via-emerald-800 to-neutral-900",
    initials: "MT",
    status: "ACTIVE_VERIFIED",
  },
  {
    id: "crane",
    characterName: "Master Crane",
    titleQuote: "Panoramic elevation over campus operations keeps every wing safe.",
    role: "FACULTY",
    displayRole: "Autonomous Drone & Aerial Systems Lead",
    userId: "USR-DRONE-LEAD",
    department: "Autonomous Systems & Robotics Lab",
    accessScope: "Robotics Testing Cage & Rooftop Weather Sensors",
    permissions: ["SUBMIT_INCIDENT_REPORT", "MONITOR_CYBER_TELEMETRY"],
    avatarGradient: "from-sky-600 via-indigo-800 to-neutral-900",
    initials: "CR",
    status: "ACTIVE_VERIFIED",
  },
];

interface KungFuPandaProfileProps {
  currentPersona: PersonaProfile;
  onSelectPersona: (persona: PersonaProfile) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function KungFuPandaProfile({
  currentPersona,
  onSelectPersona,
  isOpen,
  onClose,
}: KungFuPandaProfileProps) {
  const [selectedId, setSelectedId] = useState(currentPersona.id);

  if (!isOpen) return null;

  const active = KUNG_FU_PANDA_PERSONAS.find((p) => p.id === selectedId) || currentPersona;

  const handleApplyPersona = () => {
    onSelectPersona(active);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none font-mono text-xs">
      <div className="relative w-full max-w-2xl bg-[#14151C] border border-[#2F3342] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#252833] bg-[#191B24]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#91751F] flex items-center justify-center text-[#121316] font-bold shadow-md shadow-[#D4AF37]/20">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#FFFFFF] flex items-center space-x-2">
                <span>Institutional Persona & RBAC Profile</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#9D8EB5]/20 text-[#BDB0D3] border border-[#9D8EB5]/40">
                  Kung Fu Panda Edition
                </span>
              </h2>
              <p className="text-[10px] text-[#9D8EB5]">
                Theme Layer over Strict Cryptographic Role-Based Access Control
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8A8594] hover:text-[#FFFFFF] hover:bg-[#252833] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-5 flex-1 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-[#252833]">
          {/* Left: Persona Switcher List */}
          <div className="md:col-span-2 p-3 space-y-1.5 overflow-y-auto bg-[#111217]">
            <span className="text-[10px] text-[#767180] uppercase tracking-wider font-bold px-1 block mb-2">
              Select Character Persona
            </span>
            {KUNG_FU_PANDA_PERSONAS.map((p) => {
              const isSelected = p.id === active.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full text-left p-2 rounded-lg border transition-all flex items-center space-x-2.5 ${
                    isSelected
                      ? "bg-[#252219] border-[#D4AF37] text-[#FFFFFF] shadow-md shadow-[#D4AF37]/10"
                      : "bg-[#181A22] border-[#252833] text-[#8A8594] hover:text-[#E2E1E6] hover:bg-[#1E202B]"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full bg-gradient-to-br ${p.avatarGradient} flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0 shadow`}
                  >
                    {p.initials}
                  </div>
                  <div className="truncate flex-1 min-w-0">
                    <div className="font-bold text-xs truncate">{p.characterName}</div>
                    <div className="text-[9px] text-[#9D8EB5] truncate">{p.displayRole}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Detailed Selected Persona Inspection */}
          <div className="md:col-span-3 p-5 overflow-y-auto space-y-4 bg-[#14151C]">
            {/* Character Banner */}
            <div className="flex items-center space-x-3.5 pb-4 border-b border-[#252833]">
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${active.avatarGradient} flex items-center justify-center text-white font-black text-lg shadow-xl shadow-black/50 border border-white/20`}
              >
                {active.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-[#FFFFFF]">{active.characterName}</h3>
                  <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#F5D061] border border-[#D4AF37]/40">
                    {active.role}
                  </span>
                </div>
                <p className="text-xs text-[#9D8EB5] font-medium">{active.displayRole}</p>
                <p className="text-[10px] text-[#767180] italic mt-1">&quot;{active.titleQuote}&quot;</p>
              </div>
            </div>

            {/* Institutional Credentials */}
            <div className="space-y-2 text-[11px]">
              <div className="p-2.5 rounded bg-[#181A22] border border-[#252833] flex justify-between">
                <span className="text-[#8A8594]">User Identity:</span>
                <span className="text-[#FFFFFF] font-bold">{active.userId}</span>
              </div>
              <div className="p-2.5 rounded bg-[#181A22] border border-[#252833] flex justify-between">
                <span className="text-[#8A8594]">Assigned Department:</span>
                <span className="text-[#E2E1E6] truncate max-w-[200px]">{active.department}</span>
              </div>
              <div className="p-2.5 rounded bg-[#181A22] border border-[#252833] flex justify-between">
                <span className="text-[#8A8594]">Physical Access Scope:</span>
                <span className="text-[#D4AF37] truncate max-w-[200px]">{active.accessScope}</span>
              </div>
              <div className="p-2.5 rounded bg-[#181A22] border border-[#252833] flex justify-between">
                <span className="text-[#8A8594]">Status:</span>
                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{active.status}</span>
                </span>
              </div>
            </div>

            {/* Authorized RBAC Permissions */}
            <div>
              <span className="text-[10px] text-[#767180] uppercase tracking-wider font-bold block mb-1.5">
                Cryptographic RBAC Permissions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {active.permissions.map((perm) => (
                  <span
                    key={perm}
                    className="text-[9px] px-2 py-0.5 rounded bg-[#252833] text-[#E2E1E6] border border-[#3A3E4E] font-mono"
                  >
                    ✓ {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#252833] bg-[#191B24] flex items-center justify-between">
          <div className="text-[10px] text-[#767180] flex items-center space-x-1">
            <Lock className="w-3 h-3 text-[#D4AF37]" />
            <span>Backend JWT Token Authority Enforced</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-[#20222B] hover:bg-[#2C303E] text-[#8A8594] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyPersona}
              className="px-4 py-1.5 rounded bg-[#D4AF37] hover:bg-[#E6C45E] text-[#121316] font-bold transition-all shadow-md flex items-center space-x-1"
            >
              <span>Activate Persona</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}