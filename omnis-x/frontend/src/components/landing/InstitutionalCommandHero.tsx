"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Lock,
  ArrowRight,
  Zap,
  Activity,
  Layers,
  Server,
  Building,
  GraduationCap,
  Wrench,
  UserCheck,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Eye,
  KeyRound,
} from "lucide-react";
import {
  AuthService,
  AuthSession,
  DEMO_ACCOUNTS,
  DemoAccountMeta,
  DemoRole,
} from "@/services/auth";

interface InstitutionalCommandHeroProps {
  onEnterCommandCentre: (session: AuthSession) => void;
  onExploreWorkspace: (workspace: "COMMAND" | "TWIN" | "RESPONSE") => void;
}

export function InstitutionalCommandHero({
  onEnterCommandCentre,
  onExploreWorkspace,
}: InstitutionalCommandHeroProps) {
  // State: 'hero' -> 'login'
  const [viewState, setViewState] = useState<"hero" | "login">("hero");
  const [selectedDemoRole, setSelectedDemoRole] = useState<DemoRole>("SUPER_ADMIN");
  const [usernameInput, setUsernameInput] = useState<string>("superadmin");
  const [passwordInput, setPasswordInput] = useState<string>("AdminPassword!123");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync credentials when demo role selection changes
  useEffect(() => {
    const acc = DEMO_ACCOUNTS.find((a) => a.role === selectedDemoRole);
    if (acc) {
      setUsernameInput(acc.username);
      setPasswordInput(acc.passwordDocumentation);
    }
  }, [selectedDemoRole]);

  const activeAccount =
    DEMO_ACCOUNTS.find((a) => a.role === selectedDemoRole) || DEMO_ACCOUNTS[0];

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const session = await AuthService.login(usernameInput, passwordInput);
      onEnterCommandCentre(session);
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantDemoLogin = async (role: DemoRole) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const session = await AuthService.demoLogin(role);
      onEnterCommandCentre(session);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to authenticate demo role.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-[#070B14] text-[#E2E8F0] overflow-y-auto overflow-x-hidden font-sans select-none flex flex-col justify-between">
      {/* 1. ARCHITECTURAL DEEP NAVY / CHARCOAL BACKGROUND WITH SUBTLE GRID */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0D192E_0%,_#070B14_60%,_#05080F_100%)] pointer-events-none" />

      {/* Subtle Precision Grid Lines (48px) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(56, 189, 248, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.12) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Ambient Radial Glowing Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[300px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* 2. TOP INSTITUTIONAL BRAND HEADER */}
      <header className="relative z-10 w-full px-6 py-5 border-b border-[#1E293B]/70 bg-[#070B14]/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-[#38BDF8]/40 flex items-center justify-center shadow-lg shadow-sky-500/10">
            <Shield className="w-5 h-5 text-[#F5D061]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-black tracking-widest font-mono text-white">
                OMNIS<span className="text-[#F5D061]">-X</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30 font-bold">
                ENTERPRISE v2.4
              </span>
            </div>
            <p className="text-[10px] font-mono text-[#94A3B8]">
              Institutional Operations Intelligence & Resilience Platform
            </p>
          </div>
        </div>

        {/* Live System Provenance Badge */}
        <div className="hidden md:flex items-center space-x-4 text-xs font-mono text-[#94A3B8]">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-bold text-[11px]">TELEMETRY PIPELINE LIVE</span>
          </div>
          <span>•</span>
          <span className="text-[11px] text-[#CBD5E1]">31 Physical Nodes</span>
          <span>•</span>
          <span className="text-[11px] text-[#CBD5E1]">ISO 22301 Aligned</span>
        </div>
      </header>

      {/* 3. MAIN HERO CONTENT AREA */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        {viewState === "hero" ? (
          /* ========================================================
             HERO STATE: BRANDING, DATA FLOW ANIMATION, ENTER CTA
             ======================================================== */
          <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center space-y-8 animate-fadeIn">
            {/* Directorate Category Pill */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#0F172A]/90 border border-[#334155] text-xs font-mono text-[#94A3B8] shadow-xl backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#F5D061]" />
              <span className="tracking-wide">CYBER-PHYSICAL DIGITAL TWIN & ACADEMIC CONTINUITY</span>
            </div>

            {/* Main Institutional Headline */}
            <div className="space-y-3 max-w-3xl">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-mono">
                OMNIS<span className="text-[#F5D061]">-X</span> COMMAND
              </h1>
              <p className="text-lg sm:text-xl font-medium text-[#94A3B8]">
                Institutional Operations Intelligence & Resilience Platform
              </p>
              <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl mx-auto font-mono leading-relaxed pt-1">
                Real-time topological graph reasoning, live multi-physics failure injection,
                FMEA hazard scoring, and Google OR-Tools CP-SAT automated recovery for Apex Institute of Technology.
              </p>
            </div>

            {/* Short Cinematic Campus & Network Topological Visual (Data Flow Conduit) */}
            <div className="w-full max-w-3xl p-5 rounded-2xl bg-[#0F172A]/80 border border-[#1E293B] shadow-2xl backdrop-blur-xl relative overflow-hidden font-mono">
              {/* Subtle Scanline Bar */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-pulse" />

              <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] text-xs">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-sky-400 animate-pulse" />
                  <span className="text-white font-bold tracking-wider uppercase text-[11px]">
                    Autonomous Infrastructure Bus Flow
                  </span>
                </div>
                <span className="text-[10px] text-[#94A3B8] px-2 py-0.5 rounded bg-[#1E293B]">
                  1.0s Global Clock Sync
                </span>
              </div>

              {/* Data Flow Node Conduit Visualizer */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 py-4">
                <div className="p-3 rounded-xl bg-[#0B1120] border border-[#1E293B] flex flex-col items-center text-center space-y-1">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span className="text-[11px] font-bold text-white mt-1">11kV Substation</span>
                  <span className="text-[9px] text-[#64748B]">FEEDER F1 • 415V</span>
                  <span className="text-[9px] text-emerald-400 font-bold mt-1">NOMINAL</span>
                </div>

                <div className="p-3 rounded-xl bg-[#0B1120] border border-[#1E293B] flex flex-col items-center text-center space-y-1">
                  <Server className="w-5 h-5 text-purple-400" />
                  <span className="text-[11px] font-bold text-white mt-1">MDF Datacenter</span>
                  <span className="text-[9px] text-[#64748B]">CRAC-01 • 23.4°C</span>
                  <span className="text-[9px] text-emerald-400 font-bold mt-1">OPERATIONAL</span>
                </div>

                <div className="p-3 rounded-xl bg-[#0B1120] border border-[#1E293B] flex flex-col items-center text-center space-y-1">
                  <Layers className="w-5 h-5 text-sky-400" />
                  <span className="text-[11px] font-bold text-white mt-1">Robotics Lab</span>
                  <span className="text-[9px] text-[#64748B]">LAB-02 • GPU CLUSTER</span>
                  <span className="text-[9px] text-emerald-400 font-bold mt-1">ACTIVE</span>
                </div>

                <div className="p-3 rounded-xl bg-[#0B1120] border border-[#1E293B] flex flex-col items-center text-center space-y-1">
                  <GraduationCap className="w-5 h-5 text-yellow-300" />
                  <span className="text-[11px] font-bold text-white mt-1">Smart Lecture</span>
                  <span className="text-[9px] text-[#64748B]">CR-201 • 55 STUDENTS</span>
                  <span className="text-[9px] text-emerald-400 font-bold mt-1">SCHEDULED</span>
                </div>

                <div className="p-3 rounded-xl bg-[#0B1120] border border-[#1E293B] flex flex-col items-center text-center space-y-1 col-span-2 sm:col-span-1">
                  <Building className="w-5 h-5 text-teal-400" />
                  <span className="text-[11px] font-bold text-white mt-1">Water Pressure</span>
                  <span className="text-[9px] text-[#64748B]">RISER 1 • 3.42 BAR</span>
                  <span className="text-[9px] text-emerald-400 font-bold mt-1">PRESSURIZED</span>
                </div>
              </div>

              {/* Data Flow Metrics Bar */}
              <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px] text-[#64748B] flex-wrap gap-2">
                <span>Network Latency: <strong className="text-white">4.8ms</strong></span>
                <span>Active Power: <strong className="text-white">142.5 kW</strong></span>
                <span>RPN Safety Threshold: <strong className="text-emerald-400">&lt; 100 Safe</strong></span>
                <span>Restoration Engine: <strong className="text-[#F5D061]">OR-Tools CP-SAT</strong></span>
              </div>
            </div>

            {/* Clear "Enter Command Centre" Primary Action */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setViewState("login")}
                className="flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F5D061] to-[#D4AF37] hover:brightness-110 text-[#070B14] font-mono font-bold text-sm tracking-wide shadow-xl shadow-amber-500/20 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Lock className="w-4 h-4 fill-current" />
                <span>ENTER COMMAND CENTRE</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleInstantDemoLogin("SUPER_ADMIN")}
                className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-sky-300 border border-[#334155] font-mono text-xs font-bold transition-all cursor-pointer"
              >
                <span>Fast Launch as Super Admin (1-Click)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Workspace Switchers for Demo Evaluators */}
            <div className="pt-4 flex items-center space-x-3 text-xs font-mono text-[#64748B]">
              <span>Direct Workspaces:</span>
              <button
                onClick={() => onExploreWorkspace("COMMAND")}
                className="text-white hover:text-[#F5D061] underline underline-offset-4"
              >
                Command Centre (:3000)
              </button>
              <span>•</span>
              <button
                onClick={() => onExploreWorkspace("TWIN")}
                className="text-white hover:text-sky-400 underline underline-offset-4"
              >
                Digital Twin 3D (:3001)
              </button>
              <span>•</span>
              <button
                onClick={() => onExploreWorkspace("RESPONSE")}
                className="text-white hover:text-amber-400 underline underline-offset-4"
              >
                Incident Response (:3002)
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================
             LOGIN STATE: RBAC ROLE SELECTOR & AUTHENTICATION GATE
             ======================================================== */
          <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn font-mono">
            {/* Left 7 Columns: 5 Roles Selection Matrix */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-[#0F172A]/85 border border-[#1E293B] shadow-2xl backdrop-blur-xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-[#F5D061]" />
                    <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                      Select Demo Role
                    </h2>
                  </div>
                  <span className="text-[10px] text-[#94A3B8] px-2 py-0.5 rounded bg-[#1E293B] font-bold">
                    BACKEND ENFORCED RBAC
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8] mt-2 mb-3">
                  Each demo account possesses strictly scoped backend permissions. Authenticate to test permissions enforcement.
                </p>

                {/* 5 Demo Roles List */}
                <div className="space-y-2">
                  {DEMO_ACCOUNTS.map((acc) => {
                    const isSelected = selectedDemoRole === acc.role;
                    const roleIcon =
                      acc.role === "SUPER_ADMIN" ? <Shield className="w-4 h-4 text-amber-400" /> :
                      acc.role === "FACILITY_MANAGER" ? <Building className="w-4 h-4 text-sky-400" /> :
                      acc.role === "HOD_ACADEMIC" ? <GraduationCap className="w-4 h-4 text-yellow-300" /> :
                      acc.role === "TECHNICIAN" ? <Wrench className="w-4 h-4 text-orange-400" /> :
                      <UserCheck className="w-4 h-4 text-emerald-400" />;

                    return (
                      <div
                        key={acc.role}
                        onClick={() => setSelectedDemoRole(acc.role)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                          isSelected
                            ? "bg-[#1E293B] border-[#F5D061] ring-1 ring-[#F5D061]/50 shadow-lg"
                            : "bg-[#0B1120]/70 border-[#1E293B] hover:border-[#334155] hover:bg-[#0B1120]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            {roleIcon}
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-bold text-white">{acc.roleTitle}</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#0A0E1A] text-[#94A3B8] border border-[#1E293B]">
                                  {acc.username}
                                </span>
                              </div>
                              <div className="text-[10px] text-[#94A3B8]">{acc.fullName} • {acc.title}</div>
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#F5D061] shrink-0" />}
                        </div>

                        {isSelected && (
                          <div className="mt-2.5 pt-2 border-t border-[#334155] text-[10px] text-[#CBD5E1] space-y-1">
                            <p className="text-[#94A3B8] italic">{acc.description}</p>
                            <div className="pt-1">
                              <span className="text-[#F5D061] font-bold block text-[9px] uppercase">Permission Capabilities:</span>
                              <ul className="list-disc list-inside space-y-0.5 text-[#E2E8F0] mt-0.5">
                                {acc.capabilities.map((cap, i) => (
                                  <li key={i} className="truncate">{cap}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 1-Click Fast Authenticate Button */}
              <button
                onClick={() => handleInstantDemoLogin(selectedDemoRole)}
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D061] hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <KeyRound className="w-3.5 h-3.5 fill-current" />
                <span>
                  {isLoading ? "AUTHENTICATING..." : `1-CLICK LAUNCH AS ${activeAccount.roleTitle.toUpperCase()}`}
                </span>
              </button>
            </div>

            {/* Right 5 Columns: Credentials Form & Documentation */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0F172A]/85 border border-[#1E293B] shadow-2xl backdrop-blur-xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-sky-400" />
                    <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                      Credential Sign-In
                    </h2>
                  </div>
                  <button
                    onClick={() => setViewState("hero")}
                    className="text-[10px] text-[#94A3B8] hover:text-white underline"
                  >
                    ← Back to Hero
                  </button>
                </div>

                <form onSubmit={handleManualLogin} className="space-y-3 mt-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#94A3B8] block mb-1">
                      Username / User ID
                    </label>
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#070B14] border border-[#27354A] focus:border-[#F5D061] text-xs text-white focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#94A3B8] block mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#070B14] border border-[#27354A] focus:border-[#F5D061] text-xs text-white focus:outline-none"
                      required
                    />
                  </div>

                  {errorMessage && (
                    <div className="p-2 rounded bg-red-950/40 border border-red-500/40 text-red-300 text-[10px]">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-lg bg-[#1E293B] hover:bg-[#2A3950] text-white border border-[#334155] hover:border-[#F5D061] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer mt-1"
                  >
                    <span>{isLoading ? "VERIFYING..." : "AUTHENTICATE CREDENTIALS"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* Documented Credentials Reference Box */}
                <div className="mt-4 p-3 rounded-xl bg-[#070B14] border border-[#1E293B] space-y-1.5">
                  <div className="text-[10px] font-bold text-[#F5D061] uppercase flex items-center justify-between pb-1 border-b border-[#1E293B]">
                    <span>Documented Demo Credentials</span>
                    <span className="text-[9px] text-[#64748B]">SHA-256 HASHED</span>
                  </div>
                  <div className="space-y-1 text-[9px] text-[#94A3B8] font-mono">
                    <div className="flex justify-between">
                      <span className="text-white">superadmin</span>
                      <span className="text-amber-300">AdminPassword!123</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white">facility_mgr</span>
                      <span className="text-sky-300">FacilityPass!123</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white">hod_academic</span>
                      <span className="text-yellow-200">AcademicPass!123</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white">technician</span>
                      <span className="text-orange-300">TechPass!123</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white">student</span>
                      <span className="text-emerald-300">StudentPass!123</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[9px] text-[#64748B] text-center border-t border-[#1E293B] pt-2">
                All tokens cryptographically signed via backend HMAC-SHA256 • 60 min expiry
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. FOOTER WITH ACCREDITATION */}
      <footer className="relative z-10 w-full px-6 py-3 border-t border-[#1E293B]/70 bg-[#070B14]/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#64748B] gap-2">
        <div>
          Apex Institute of Technology • Sovereign Infrastructure & Institutional Resilience
        </div>
        <div className="flex items-center space-x-3">
          <span>Zero-Trust Architecture</span>
          <span>•</span>
          <span>Google OR-Tools CP-SAT</span>
          <span>•</span>
          <span>FastAPI + SQLite Engine</span>
        </div>
      </footer>
    </div>
  );
}
