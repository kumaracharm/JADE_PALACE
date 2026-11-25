"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, Zap, ShieldAlert, Activity } from "lucide-react";

interface ThunderEventProps {
  onComplete: () => void;
}

export function ThunderEvent({ onComplete }: ThunderEventProps) {
  const [pulseStage, setPulseStage] = useState<"idle" | "arc" | "traverse" | "fade">("arc");
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

    const t1 = setTimeout(() => setPulseStage("traverse"), 700);
    const t2 = setTimeout(() => setPulseStage("fade"), 1800);
    const t3 = setTimeout(() => onComplete(), 2300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  if (reducedMotion) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-[#0A0B0E] transition-opacity duration-500 ${
        pulseStage === "fade" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background High-Contrast Tactical Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#18141F_0%,#08080B_100%)] opacity-95" />
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #6366F1 1px, transparent 1px), linear-gradient(to bottom, #6366F1 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Electrical Arc & Grid Bus Pathways */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="arcGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#FBBF24" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0.2" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Tactical Substation & Feeder Traces */}
        <path
          d="M 50 150 L 350 150 L 450 300 L 800 300 L 950 450 L 1400 450 L 1600 650 L 1900 650"
          stroke="rgba(251, 191, 36, 0.2)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M 200 800 L 500 800 L 700 550 L 1100 550 L 1300 350 L 1750 350"
          stroke="rgba(56, 189, 248, 0.2)"
          strokeWidth="2"
          fill="none"
        />

        {/* Active Traveling Pulse Wave */}
        {pulseStage !== "idle" && (
          <path
            d="M 50 150 L 350 150 L 450 300 L 800 300 L 950 450 L 1400 450 L 1600 650 L 1900 650"
            stroke="url(#arcGlow)"
            strokeWidth="4"
            strokeDasharray="180 800"
            strokeDashoffset={pulseStage === "arc" ? "1000" : "-300"}
            filter="url(#glow)"
            fill="none"
            className="transition-all duration-1200 ease-out"
          />
        )}
      </svg>

      {/* Center Tactical Briefing Flash */}
      <div className="relative z-20 text-center font-mono pointer-events-none px-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#181824] border border-[#F59E0B]/50 mb-3 text-[11px] text-[#FBBF24] tracking-widest uppercase shadow-lg shadow-amber-500/10">
          <Zap className="w-3.5 h-3.5 text-[#F59E0B] animate-pulse" />
          <span>Tactical Incident Response Grid</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2">
          OMNIS-X <span className="text-[#FBBF24]">RESPONSE</span>
        </h1>
        <p className="text-xs md:text-sm text-[#94A3B8] max-w-md mx-auto">
          7 Specialist Resilience Engines • Detection, Graph Cascade & OR-Tools Optimization
        </p>
      </div>

      {/* Direct Skip CTA */}
      <button
        onClick={onComplete}
        className="absolute bottom-8 right-8 z-40 px-4 py-2 rounded-lg bg-[#151720]/90 border border-[#2B2E3D] text-xs font-mono text-[#CBD5E1] hover:text-white hover:border-[#FBBF24] transition-all flex items-center space-x-2 cursor-pointer"
      >
        <span>Enter Response Directorate</span>
        <ArrowRight className="w-3.5 h-3.5 text-[#FBBF24]" />
      </button>
    </div>
  );
}
