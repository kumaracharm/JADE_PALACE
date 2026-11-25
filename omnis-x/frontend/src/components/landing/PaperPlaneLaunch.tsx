"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Plane, Rocket, Shield } from "lucide-react";

interface PaperPlaneLaunchProps {
  onComplete: () => void;
}

export function PaperPlaneLaunch({ onComplete }: PaperPlaneLaunchProps) {
  const [phase, setPhase] = useState<"launch" | "zip" | "reveal">("launch");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mediaQuery.matches) {
        setReducedMotion(true);
        onComplete();
        return;
      }
    }

    // Launch phase (1.6s) -> ZIP transition (0.4s) -> Reveal (0.4s) -> Complete
    const t1 = setTimeout(() => setPhase("zip"), 1400);
    const t2 = setTimeout(() => setPhase("reveal"), 1800);
    const t3 = setTimeout(() => onComplete(), 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  if (reducedMotion) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-[#070B14] transition-opacity duration-500 ${
        phase === "reveal" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background Deep Navy Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#0D1B2A_0%,#050811_100%)] opacity-90" />
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #1E3A8A 1px, transparent 1px), linear-gradient(to bottom, #1E3A8A 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Trajectory Rocket / Plane */}
      <div
        className={`absolute z-10 transition-all ease-in-out pointer-events-none ${
          phase === "launch"
            ? "translate-x-0 translate-y-0 opacity-100 duration-1400"
            : "translate-x-[120vw] -translate-y-[60vh] scale-150 opacity-0 duration-400"
        }`}
        style={{
          left: "5%",
          bottom: "15%",
          transform:
            phase === "launch"
              ? "rotate(-25deg)"
              : "rotate(-15deg) translate(80vw, -40vh) scale(2)",
          transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)",
        }}
      >
        <div className="relative flex items-center">
          {/* Supersonic Particle Stream Tail */}
          <div className="w-72 h-1.5 bg-gradient-to-r from-transparent via-[#38BDF8] to-[#F59E0B] rounded-full blur-[1px] opacity-80 animate-pulse" />
          <div className="w-48 h-3 -ml-48 bg-gradient-to-r from-transparent to-[#60A5FA]/40 blur-md rounded-full" />

          {/* Aerodynamic Jet / Rocket Icon */}
          <div className="relative w-12 h-12 flex items-center justify-center text-[#F5D061] drop-shadow-[0_0_16px_rgba(245,208,97,0.8)]">
            <Rocket className="w-9 h-9 transform rotate-45" />
          </div>
        </div>
      </div>

      {/* ZIP Screen Split Transition */}
      {phase === "zip" && (
        <div className="absolute inset-0 z-20 flex pointer-events-none">
          <div className="w-1/2 h-full bg-[#0A1128] transform -translate-x-full transition-transform duration-300 ease-in border-r border-[#D4AF37]/50" />
          <div className="w-1/2 h-full bg-[#0A1128] transform translate-x-full transition-transform duration-300 ease-in border-l border-[#D4AF37]/50" />
        </div>
      )}

      {/* Institutional Center Brand Flash */}
      <div className="relative z-30 text-center font-mono pointer-events-none px-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#1E293B]/80 border border-[#38BDF8]/40 mb-3 text-[11px] text-[#38BDF8] tracking-widest uppercase">
          <Shield className="w-3.5 h-3.5 text-[#F5D061]" />
          <span>Sovereign Directorate Initialization</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2">
          OMNIS-X <span className="text-[#F5D061]">COMMAND</span>
        </h1>
        <p className="text-xs md:text-sm text-[#94A3B8] max-w-md mx-auto">
          Institutional Resilience Intelligence • Executive Directorate PWA
        </p>
      </div>

      {/* Manual Skip CTA */}
      <button
        onClick={onComplete}
        className="absolute bottom-8 right-8 z-40 px-4 py-2 rounded-lg bg-[#0F172A]/80 border border-[#334155] text-xs font-mono text-[#CBD5E1] hover:text-white hover:border-[#F5D061] transition-all flex items-center space-x-2"
      >
        <span>Enter Command Centre</span>
        <ArrowRight className="w-3.5 h-3.5 text-[#F5D061]" />
      </button>
    </div>
  );
}
