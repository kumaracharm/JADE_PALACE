"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Building,
  ChevronRight,
  User,
  FlaskConical,
  X,
  Compass,
  Film,
  Smartphone,
  Shield,
  ChevronDown,
  LogOut,
  CheckCircle2,
  Key,
  GraduationCap,
  Wrench,
  UserCheck,
  Inbox,
  Bell,
} from "lucide-react";
import { CampusEntity } from "@/types/digital-twin";
import { PersonaProfile, KUNG_FU_PANDA_PERSONAS } from "@/components/profile/KungFuPandaProfile";
import { AuthService, AuthSession, DEMO_ACCOUNTS, DemoRole } from "@/services/auth";
import { InboxDrawer } from "@/components/inbox/InboxDrawer";

interface TopNavProps {
  currentFloor: string;
  onSelectFloor: (floorId: string) => void;
  simulationActive: boolean;
  onToggleSimulation: () => void;
  allEntities: CampusEntity[];
  onSelectEntity: (entityId: string) => void;
  activeWorkspace: "COMMAND" | "TWIN" | "RESPONSE";
  onSelectWorkspace: (ws: "COMMAND" | "TWIN" | "RESPONSE") => void;
  onOpenReportModal: () => void;
  onOpenProfile?: () => void;
  currentPersona?: PersonaProfile;
  onSelectPersona?: (persona: PersonaProfile) => void;
  onReplayIntro?: () => void;
  twinViewMode?: "CAMPUS_3D" | "FLOORPLAN";
  onToggleTwinView?: (mode: "CAMPUS_3D" | "FLOORPLAN") => void;
}

export function TopNav({
  currentFloor,
  onSelectFloor,
  simulationActive,
  onToggleSimulation,
  allEntities,
  onSelectEntity,
  activeWorkspace,
  onSelectWorkspace,
  onOpenReportModal,
  onOpenProfile,
  currentPersona = KUNG_FU_PANDA_PERSONAS[0],
  onSelectPersona,
  onReplayIntro,
  twinViewMode = "CAMPUS_3D",
  onToggleTwinView,
}: TopNavProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [inboxUnreadCount, setInboxUnreadCount] = useState<number>(3);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/inbox/messages");
        if (res.ok) {
          const d = await res.json();
          setInboxUnreadCount(d.unread_count ?? 0);
        }
      } catch (e) {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setAuthSession(AuthService.getSession());
    const unsub = AuthService.onAuthChange((s) => setAuthSession(s));
    return () => unsub();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleStyle = (role?: DemoRole) => {
    switch (role) {
      case "SUPER_ADMIN":
        return {
          bg: "bg-[#D4AF37]/15",
          text: "text-[#F5D061]",
          border: "border-[#D4AF37]/40",
          label: "SUPER ADMIN",
          dot: "bg-amber-400",
        };
      case "FACILITY_MANAGER":
        return {
          bg: "bg-sky-500/15",
          text: "text-sky-400",
          border: "border-sky-500/40",
          label: "FACILITY MGR",
          dot: "bg-sky-400",
        };
      case "HOD_ACADEMIC":
        return {
          bg: "bg-purple-500/15",
          text: "text-purple-300",
          border: "border-purple-500/40",
          label: "HOD ACADEMIC",
          dot: "bg-purple-400",
        };
      case "TECHNICIAN":
        return {
          bg: "bg-orange-500/15",
          text: "text-orange-400",
          border: "border-orange-500/40",
          label: "TECHNICIAN",
          dot: "bg-orange-400",
        };
      case "STUDENT":
        return {
          bg: "bg-emerald-500/15",
          text: "text-emerald-400",
          border: "border-emerald-500/40",
          label: "STUDENT",
          dot: "bg-emerald-400",
        };
      default:
        return {
          bg: "bg-[#252833]",
          text: "text-[#A69FB1]",
          border: "border-[#3A3D4B]",
          label: "DEMO GUEST",
          dot: "bg-gray-400",
        };
    }
  };

  const currentRoleStyle = getRoleStyle(authSession?.user.role);

  const handleQuickSwitchRole = (role: DemoRole) => {
    try {
      const s = AuthService.demoLogin(role);
      setAuthSession(s);
      setIsRoleDropdownOpen(false);
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (e) {
      console.warn("Role switch error:", e);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    setAuthSession(null);
    setIsRoleDropdownOpen(false);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  // Filter entities by search query
  const searchResults = searchQuery.trim()
    ? (allEntities || []).filter(
        (e) =>
          e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.entity_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.location?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  const floorLabels: Record<string, string> = {
    all: "All Campus Levels",
    "FLOOR-G": "Ground Floor (Utility & Core)",
    "FLOOR-1": "Level 1 (Research Labs)",
    "FLOOR-2": "Level 2 (Classrooms & Auditorium)",
    "FLOOR-3": "Level 3 (Server Room & Rooftop)",
  };

  return (
    <header className="h-14 flex-shrink-0 bg-[#14151A] border-b border-[#252833] px-3 sm:px-4 flex items-center justify-between z-30 select-none w-full min-w-0">
      {/* Brand & Institution Context */}
      <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0 min-w-0">
        <div className="flex items-center space-x-2.5 flex-shrink-0">
          {/* Gold Insignia Badge */}
          <div className="w-8 h-8 rounded bg-gradient-to-br from-[#D4AF37] via-[#E6C45E] to-[#91751F] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 border border-[#F5D061]/50 flex-shrink-0">
            <span className="font-mono font-black text-[#121316] text-base tracking-tighter">Ω</span>
          </div>
          <div className="flex-shrink-0">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold tracking-wider text-sm text-[#F0EDF5] font-mono">OMNIS-X</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#352D42] text-[#BDB0D3] border border-[#5E5073]">
                TWIN v2.4
              </span>
            </div>
            <p className="text-[10px] text-[#A69FB1] font-medium hidden sm:block">Apex Institute of Technology</p>
          </div>
        </div>

        {/* Breadcrumb Hierarchy */}
        <div className="hidden md:flex items-center space-x-1.5 text-xs text-[#8A8594] border-l border-[#252833] pl-3 flex-shrink min-w-0">
          <Building className="w-3.5 h-3.5 text-[#9D8EB5] flex-shrink-0" />
          <span className="truncate max-w-[120px] lg:max-w-none">Engineering Block</span>
          <ChevronRight className="w-3 h-3 text-[#5A5565] flex-shrink-0" />
          <span className="text-[#E6C45E] font-medium font-mono truncate max-w-[140px] lg:max-w-none">
            {floorLabels[currentFloor] || currentFloor}
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="relative w-48 sm:w-64 md:w-72 lg:w-96 mx-2 flex-shrink min-w-[140px]">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#8A8594] absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search entities..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="w-full bg-[#1A1C23] border border-[#2D303B] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 focus:outline-none rounded-md pl-9 pr-8 py-1.5 text-xs text-[#E2E1E6] placeholder-[#767180] font-mono transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setIsSearchOpen(false);
              }}
              className="absolute right-2.5 text-[#8A8594] hover:text-[#E2E1E6]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Autocomplete Dropdown */}
        {isSearchOpen && searchResults.length > 0 && (
          <div className="absolute top-full mt-1.5 left-0 right-0 bg-[#17181F] border border-[#3A3D4B] rounded-md shadow-2xl overflow-hidden z-50">
            <div className="py-1">
              {searchResults.map((res) => (
                <button
                  key={res.entity_id}
                  onClick={() => {
                    onSelectEntity(res.entity_id);
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[#232530] flex items-center justify-between border-b border-[#252833] last:border-b-0 transition-colors"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-medium text-[#E2E1E6]">{res.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#2D2A38] text-[#BDB0D3]">
                        {res.entity_id}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8A8594] mt-0.5">{res.location}</p>
                  </div>
                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                      res.operational_status === "OPERATIONAL"
                        ? "bg-[#D4AF37]/15 text-[#E6C45E] border border-[#D4AF37]/30"
                        : "bg-[#E5A83B]/15 text-[#E5A83B] border border-[#E5A83B]/30"
                    }`}
                  >
                    {res.operational_status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Controls: Three-Dashboard Workspace Switcher, View Mode, Report Button, Simulation, Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
        {/* Spatial 2D vs Campus 3D View Switcher for Twin */}
        {activeWorkspace === "TWIN" && onToggleTwinView && (
          <div className="flex bg-[#191B22] p-0.5 rounded-lg border border-[#2D303B] flex-shrink-0">
            <button
              onClick={() => onToggleTwinView("FLOORPLAN")}
              className={`px-2 sm:px-2.5 py-1 text-xs font-medium rounded transition-all font-mono ${
                twinViewMode === "FLOORPLAN"
                  ? "bg-[#D4AF37] text-[#121316] font-bold shadow-md shadow-[#D4AF37]/20"
                  : "text-[#9D8EB5] hover:text-[#E2E1E6]"
              }`}
              title="Architectural 2D CAD Floor Plan"
            >
              Spatial 2D
            </button>
            <button
              onClick={() => onToggleTwinView("CAMPUS_3D")}
              className={`px-2 sm:px-2.5 py-1 text-xs font-medium rounded transition-all font-mono ${
                twinViewMode === "CAMPUS_3D"
                  ? "bg-[#D4AF37] text-[#121316] font-bold shadow-md shadow-[#D4AF37]/20"
                  : "text-[#9D8EB5] hover:text-[#E2E1E6]"
              }`}
              title="Interactive 3D Digital Twin Model"
            >
              Campus 3D
            </button>
          </div>
        )}

        {/* Workspace Switcher: Command vs 3D Twin vs Response */}
        <div className="flex bg-[#191B22] p-0.5 rounded-lg border border-[#2D303B] flex-shrink-0">
          <button
            onClick={() => onSelectWorkspace("COMMAND")}
            className={`px-2 sm:px-3 py-1 text-xs font-medium rounded transition-all font-mono ${
              activeWorkspace === "COMMAND"
                ? "bg-[#D4AF37] text-[#121316] font-bold shadow-md shadow-[#D4AF37]/20"
                : "text-[#9D8EB5] hover:text-[#E2E1E6]"
            }`}
          >
            Command
          </button>
          <button
            onClick={() => onSelectWorkspace("TWIN")}
            className={`px-2 sm:px-3 py-1 text-xs font-medium rounded transition-all font-mono ${
              activeWorkspace === "TWIN"
                ? "bg-[#D4AF37] text-[#121316] font-bold shadow-md shadow-[#D4AF37]/20"
                : "text-[#9D8EB5] hover:text-[#E2E1E6]"
            }`}
          >
            3D Twin
          </button>
          <button
            onClick={() => onSelectWorkspace("RESPONSE")}
            className={`px-2 sm:px-3 py-1 text-xs font-medium rounded transition-all font-mono ${
              activeWorkspace === "RESPONSE"
                ? "bg-[#D4AF37] text-[#121316] font-bold shadow-md shadow-[#D4AF37]/20"
                : "text-[#9D8EB5] hover:text-[#E2E1E6]"
            }`}
          >
            Response
          </button>
        </div>

        {/* Quick Incident Report Modal Button */}
        <button
          onClick={onOpenReportModal}
          className="flex items-center space-x-1 px-2 sm:px-2.5 py-1 text-xs font-mono rounded bg-[#D4AF37]/15 border border-[#D4AF37]/40 hover:bg-[#D4AF37] text-[#F5D061] hover:text-[#121316] font-bold transition-all flex-shrink-0"
          title="Student & Staff Reporting Portal"
        >
          <span>+ Report</span>
        </button>

        {/* Niche Inbox Window Button (Independent PWA / Website Bridge on Same IP) */}
        <button
          onClick={() => setIsInboxOpen(true)}
          className="relative flex items-center space-x-1.5 px-2 sm:px-2.5 py-1 text-xs font-mono rounded bg-[#1B1A24] border border-[#3E384D] hover:border-[#D4AF37] text-[#D8D2E6] hover:text-white transition-all flex-shrink-0 cursor-pointer"
          title="Open Niche Inbox Window (Same-IP Independent PWA Bridge)"
        >
          <Inbox className="w-3.5 h-3.5 text-[#F5D061]" />
          <span className="hidden sm:inline">Inbox</span>
          {inboxUnreadCount > 0 && (
            <span className="flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold bg-[#D4AF37] text-black shadow-sm animate-pulse">
              {inboxUnreadCount}
            </span>
          )}
        </button>

        {/* Student Grievance PWA Quick Launch */}
        <a
          href="http://localhost:8090"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1.5 px-2 sm:px-2.5 py-1 text-xs font-mono rounded bg-[#352D42] border border-[#5E5073] hover:border-[#D4AF37] text-[#BDB0D3] hover:text-[#FFFFFF] transition-all flex-shrink-0"
          title="Open Student Grievance PWA on Phone or Browser (Port 8090)"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="hidden lg:inline">Student PWA</span>
        </a>

        {/* Counterfactual Simulation Mode Toggle */}
        <button
          onClick={onToggleSimulation}
          className={`flex items-center space-x-1.5 px-2 sm:px-2.5 py-1 rounded text-xs font-medium border transition-all flex-shrink-0 ${
            simulationActive
              ? "bg-[#453625] text-[#F5D061] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20 animate-pulse font-bold"
              : "bg-[#201D28] text-[#BDB0D3] border-[#433A52] hover:border-[#9D8EB5]"
          }`}
        >
          <FlaskConical className={`w-3.5 h-3.5 ${simulationActive ? "text-[#F5D061]" : "text-[#9D8EB5]"}`} />
          <span className="font-mono hidden sm:inline">{simulationActive ? "SHADOW TWIN ON" : "Simulate Chaos"}</span>
          <span className="font-mono sm:hidden">{simulationActive ? "SIM" : "Chaos"}</span>
        </button>

        {/* Telemetry Status Indicator */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2 py-1 rounded bg-[#191B22] border border-[#2D303B] flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
          <span className="text-[10px] font-mono font-bold text-[#E6C45E]">LIVE</span>
        </div>

        {/* Institutional RBAC Operator Profile & 1-Click Role Switcher */}
        <div className="relative pl-2 border-l border-[#252833] flex-shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center space-x-2 p-1 rounded-lg hover:bg-[#1E202A] transition-colors cursor-pointer text-left"
            title="Institutional RBAC Profile & Role Switcher"
          >
            <div
              className={`w-7 h-7 rounded-full bg-[#1A1C24] border ${currentRoleStyle.border} flex items-center justify-center text-xs font-bold text-white shadow flex-shrink-0 overflow-hidden`}
            >
              {currentPersona.photoUrl ? (
                <img
                  src={currentPersona.photoUrl}
                  alt={currentPersona.characterName}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <User className="w-4 h-4 text-[#8A8594]" />
              )}
            </div>
            <div className="hidden xl:block text-left flex-shrink-0">
              <div className="flex items-center space-x-1">
                <span className="text-[11px] font-bold text-[#E2E1E6] truncate max-w-[110px]">
                  {currentPersona.characterName}
                </span>
                <ChevronDown className="w-3 h-3 text-[#8A8594]" />
              </div>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className={`text-[8px] font-mono uppercase px-1 py-0.2 rounded font-bold ${currentRoleStyle.bg} ${currentRoleStyle.text} border ${currentRoleStyle.border}`}>
                  {currentRoleStyle.label}
                </span>
              </div>
            </div>
          </button>

          {/* Role Switcher & Identity Popover Dropdown */}
          {isRoleDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#0F172A] border border-[#334155] rounded-xl shadow-2xl p-4 z-50 animate-fadeIn font-mono text-xs">
              {/* Header: Current User Identity & Security Clearance */}
              <div className="pb-3 border-b border-[#1E293B]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-[#F5D061]" />
                    <span className="font-bold text-white text-xs">ACTIVE OPERATOR</span>
                  </div>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${currentRoleStyle.bg} ${currentRoleStyle.text} border ${currentRoleStyle.border}`}>
                    {currentRoleStyle.label}
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-[#E2E8F0] font-bold flex items-center space-x-2">
                  <span>{currentPersona.characterName}</span>
                  <span className="text-[9px] text-[#94A3B8]">({currentPersona.displayRole})</span>
                </div>
                <div className="text-[10px] text-[#94A3B8]">
                  ID: {authSession?.user.user_id || currentPersona.userId} • Dept: {currentPersona.department}
                </div>
                <div className="mt-1 flex items-center space-x-1.5 text-[9px] text-[#64748B]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>HMAC-SHA256 Token • Session Active</span>
                </div>
              </div>

              {/* 1-Click Kung Fu Panda Role Switcher Matrix */}
              <div className="py-3">
                <div className="text-[10px] font-bold text-[#F5D061] uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Kung Fu Panda Role Switcher</span>
                  <span className="text-[8px] text-[#94A3B8] font-normal">INSTANT EVALUATION</span>
                </div>

                <div className="space-y-1.5">
                  {[
                    {
                      persona: KUNG_FU_PANDA_PERSONAS[0],
                      role: "SUPER_ADMIN" as DemoRole,
                      name: "Master Oogway",
                      title: "Campus Principal & Executive Directorate",
                      badge: "SUPER ADMIN",
                      dot: "bg-amber-400",
                    },
                    {
                      persona: KUNG_FU_PANDA_PERSONAS[2],
                      role: "FACILITY_MANAGER" as DemoRole,
                      name: "Master Tigress",
                      title: "Physical Infrastructure & Energy Directorate",
                      badge: "FACILITY MGR",
                      dot: "bg-orange-400",
                    },
                    {
                      persona: KUNG_FU_PANDA_PERSONAS[1],
                      role: "HOD_ACADEMIC" as DemoRole,
                      name: "Master Shifu",
                      title: "HOD Academic Coordinator (ECE / Dean)",
                      badge: "HOD ACADEMIC",
                      dot: "bg-purple-400",
                    },
                    {
                      persona: KUNG_FU_PANDA_PERSONAS[6] || KUNG_FU_PANDA_PERSONAS[3],
                      role: "TECHNICIAN" as DemoRole,
                      name: "Master Mantis",
                      title: "Rapid Response Field Technician",
                      badge: "TECHNICIAN",
                      dot: "bg-emerald-400",
                    },
                    {
                      persona: KUNG_FU_PANDA_PERSONAS[5],
                      role: "STUDENT" as DemoRole,
                      name: "Po (Dragon Warrior)",
                      title: "Student Delegate & Grievance PWA",
                      badge: "STUDENT",
                      dot: "bg-sky-400",
                    },
                  ].map((char) => {
                    const isCurrent = authSession?.user.role === char.role || currentPersona.id === char.persona.id;
                    return (
                      <button
                        key={char.role}
                        onClick={() => {
                          const s = AuthService.demoLogin(char.role);
                          setAuthSession(s);
                          if (onSelectPersona) {
                            onSelectPersona(char.persona);
                          }
                          setIsRoleDropdownOpen(false);
                          if (typeof window !== "undefined") {
                            window.location.reload();
                          }
                        }}
                        className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                          isCurrent
                            ? "bg-[#1E293B] border-[#F5D061] text-white"
                            : "bg-[#070B14]/60 border-[#1E293B] hover:border-[#334155] hover:bg-[#1E293B]/50 text-[#CBD5E1]"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${char.dot}`} />
                          <div className="w-5 h-5 rounded-full overflow-hidden bg-black/40 shrink-0 border border-white/10">
                            {char.persona.photoUrl && (
                              <img src={char.persona.photoUrl} alt={char.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div>
                            <div className="text-[10px] font-bold leading-none">{char.name}</div>
                            <div className="text-[8px] text-[#64748B] mt-0.5 truncate max-w-[170px]">{char.badge} • {char.title}</div>
                          </div>
                        </div>

                        {isCurrent ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#F5D061]" />
                        ) : (
                          <span className="text-[9px] text-[#94A3B8] hover:text-[#F5D061]">Switch →</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px]">
                {onOpenProfile && (
                  <button
                    onClick={() => {
                      setIsRoleDropdownOpen(false);
                      onOpenProfile();
                    }}
                    className="text-[#9D8EB5] hover:text-white underline cursor-pointer"
                  >
                    View Persona Lore
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-red-400 hover:text-red-300 font-bold ml-auto cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Niche Inbox Window Drawer (Same-IP Independent PWA Bridge) */}
      <InboxDrawer
        isOpen={isInboxOpen}
        onClose={() => setIsInboxOpen(false)}
        onSelectEntity={onSelectEntity}
      />
    </header>
  );
}
