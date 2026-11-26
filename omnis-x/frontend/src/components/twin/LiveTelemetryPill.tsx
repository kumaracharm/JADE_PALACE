"use client";

import React, { useEffect, useState, useRef } from "react";
import { Sliders, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";

interface LiveTelemetryPillProps {
  streamUrl?: string;
  onVoltageChange?: (voltage: number) => void;
  externalVoltage?: number;
}

export function LiveTelemetryPill({
  streamUrl = "http://127.0.0.1:8000/api/v1/demo/stream",
  onVoltageChange,
  externalVoltage,
}: LiveTelemetryPillProps) {
  const [isLive, setIsLive] = useState<boolean>(false);
  const [manualVoltage, setManualVoltage] = useState<number | null>(null);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>("");

  const [telemetry, setTelemetry] = useState({
    voltage_v: 415.2,
    active_power_kw: 142.8,
    current_a: 198.0,
    temperature_c: 23.4,
    frequency_hz: 50.02,
    sequence: 1042,
    status: "OPERATIONAL",
    scenario: "NORMAL",
  });

  const phaseRef = useRef<number>(0);
  const [sineOffset, setSineOffset] = useState<number>(0);

  // Live timestamp clock ticker
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-GB", { hour12: false }) + "." + String(now.getMilliseconds()).padStart(3, "0").slice(0, 2));
    };
    updateClock();
    const interval = setInterval(updateClock, 200);
    return () => clearInterval(interval);
  }, []);

  // Dynamic continuous oscilloscope flow
  useEffect(() => {
    let animId: number;
    const animate = () => {
      phaseRef.current += 0.048;
      setSineOffset(phaseRef.current);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Effective voltage considering manual override or external override
  const effectiveVoltage = manualVoltage !== null 
    ? manualVoltage 
    : (externalVoltage !== undefined ? externalVoltage : telemetry.voltage_v);

  const isTripped = effectiveVoltage < 250;
  const isSag = effectiveVoltage >= 250 && effectiveVoltage < 390;
  const isSurge = effectiveVoltage > 435;

  const handleSetVoltage = (v: number) => {
    setManualVoltage(v);
    if (onVoltageChange) onVoltageChange(v);
  };

  // Live SSE connection to backend synthetic telemetry
  useEffect(() => {
    let es: EventSource | null = null;
    let reconnectTimer: any = null;
    let mounted = true;

    const connect = () => {
      try {
        es = new EventSource(streamUrl);
        es.onopen = () => {
          if (mounted) setIsLive(true);
        };
        es.onmessage = (event) => {
          if (!mounted) return;
          try {
            const data = JSON.parse(event.data);
            const volt = typeof data.voltage_v === "number" ? data.voltage_v : 415.2;
            const power = typeof data.active_power_kw === "number" ? data.active_power_kw : 142.8;
            const curr = typeof data.current_a === "number" ? data.current_a : 198.0;
            const temp = typeof data.temperature_c === "number" ? data.temperature_c : 23.4;
            const seq = typeof data.sequence === "number" ? data.sequence : 1000;
            const freq = typeof data.frequency_hz === "number" ? data.frequency_hz : 50.02;

            setTelemetry((prev) => ({
              ...prev,
              voltage_v: volt,
              active_power_kw: power,
              current_a: curr,
              temperature_c: temp,
              frequency_hz: freq,
              sequence: seq,
              status: data.status || "OPERATIONAL",
              scenario: data.scenario || "NORMAL",
            }));
          } catch {}
        };
        es.onerror = () => {
          if (mounted) setIsLive(false);
          if (es) {
            es.close();
            es = null;
          }
          if (mounted) reconnectTimer = setTimeout(connect, 2000);
        };
      } catch {
        if (mounted) reconnectTimer = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      mounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (es) es.close();
    };
  }, [streamUrl]);

  // Waveform dimensions & points (matching reference card exactly)
  const width = 274;
  const height = 44;
  const midY = height / 2;
  const totalPoints = 50;
  const points: [number, number][] = [];

  for (let i = 0; i <= totalPoints; i++) {
    const x = (i / totalPoints) * width;
    let y = midY;

    if (isTripped) {
      // Breaker trip chaotic noise & flatline damping
      const noise =
        (Math.sin(i * 0.9 + sineOffset * 4) +
          Math.cos(i * 1.8 - sineOffset * 3)) *
        2.5;
      const spike = i % 7 === 0 ? Math.sin(sineOffset * 6) * 4 : 0;
      y = midY + (noise + spike) * 0.35;
    } else if (isSag) {
      // Undervoltage sag: attenuated amplitude with jitter
      const amp = 6.5;
      const wave = Math.sin((i / totalPoints) * Math.PI * 5.6 - sineOffset) * amp;
      const jitter = Math.sin(i * 1.2 + sineOffset * 3) * 1.8;
      y = midY + wave + jitter;
    } else if (isSurge) {
      // Overvoltage surge: high amplitude and harmonic spikes
      const amp = 19.0;
      const wave = Math.sin((i / totalPoints) * Math.PI * 5.6 - sineOffset) * amp;
      const spike = (i % 6 === 0 ? 3.0 : 0);
      y = midY + wave + spike;
    } else {
      // Golden flowing sinusoidal waveform with 2.8 harmonic cycles
      const amp = 13.5;
      const wave = Math.sin((i / totalPoints) * Math.PI * 5.6 - sineOffset) * amp;
      const harmonic = Math.sin((i / totalPoints) * Math.PI * 11.2 - sineOffset * 1.5) * 1.2;
      y = midY + wave + harmonic;
    }

    points.push([x, Math.max(2, Math.min(height - 2, y))]);
  }

  const pathD = points.reduce(
    (acc, [x, y], idx) => (idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`),
    ""
  );
  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  const waveStroke = isTripped ? "#EF4444" : isSag ? "#F59E0B" : isSurge ? "#EC4899" : "#F5D061";

  // Saga 7-Engine Diagnostic Callout
  const sagaEngineStatus = isTripped
    ? "SAGA E2: FMEA RPN 288 (CRITICAL FAULT)"
    : isSag
    ? "SAGA E3: UNDERVOLTAGE SAG ALERT"
    : isSurge
    ? "SAGA E4: OVERVOLTAGE TRANSIENT"
    : "SAGA E7: CLOSED-LOOP CONTINUITY NOMINAL";

  return (
    <div className="absolute bottom-4 right-4 z-30 w-[300px] max-w-[90vw] bg-[#0E0F14]/95 backdrop-blur-md border border-[#252833] rounded-xl p-3 shadow-2xl font-mono select-none pointer-events-auto">
      {/* 1. Header: Gold Dot + LIVE TELEMETRY STREAM + 1.0S SSE badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isTripped
                ? "bg-red-500 animate-ping"
                : isSag
                ? "bg-amber-400 animate-pulse"
                : isLive
                ? "bg-[#D4AF37] animate-pulse"
                : "bg-[#D4AF37]"
            }`}
          />
          <span className="font-bold text-[#E6C45E] text-[11px] tracking-wider uppercase">
            LIVE TELEMETRY STREAM
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowControls(!showControls)}
            className="p-1 rounded bg-[#1C1F28] hover:bg-[#252836] text-[#A69FB1] hover:text-white transition-colors cursor-pointer"
            title="Manual Voltage Injector Controls"
          >
            <Sliders className="w-3 h-3 text-[#F5D061]" />
          </button>
          <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-[#2D2A1C] text-[#F5D061] border border-[#D4AF37]/50 font-bold tracking-tight">
            1.0S SSE
          </span>
        </div>
      </div>

      {/* 2. Readout above Waveform + Live Real-Time Timestamp */}
      <div className="flex items-center justify-between text-[10px] text-[#8E8B99] mt-1 mb-1 font-mono">
        <div>
          <span className={`font-bold ${isTripped ? "text-red-400" : isSag ? "text-amber-400" : "text-[#F5D061]"}`}>
            {effectiveVoltage.toFixed(1)}V RMS
          </span>
          <span className="text-[#64748B] ml-1">
            {isTripped ? "COLLAPSED" : isSag ? "SAG MIN" : isSurge ? "SURGE" : "NOM"}
          </span>
        </div>
        <div className="text-[9px] text-[#71717A] tracking-tight">
          UTC {currentTime || "10:35:00.00"}
        </div>
      </div>

      {/* 3. Dynamic Flowing Oscilloscope Waveform with Golden Area Glow */}
      <div className="relative w-full h-[44px] overflow-hidden rounded bg-[#07080B]/80 border border-[#1A1C24]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="liveWaveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={waveStroke} stopOpacity="0.4" />
              <stop offset="100%" stopColor={waveStroke} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {/* Glowing Area Fill Under Wave */}
          <path d={areaD} fill="url(#liveWaveGrad)" />
          {/* Main Sine Curve Line */}
          <path
            d={pathD}
            fill="none"
            stroke={waveStroke}
            strokeWidth="2.0"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* 4. SAGA 7-ENGINE REAL-TIME DIAGNOSTIC BADGE */}
      <div className="mt-1.5 py-0.5 px-1.5 rounded bg-[#07080B] border border-[#1A1C24] flex items-center justify-between text-[8px] text-[#94A3B8]">
        <span className={`font-bold truncate ${isTripped ? "text-red-400" : isSag ? "text-amber-400" : "text-emerald-400"}`}>
          {sagaEngineStatus}
        </span>
        <span className="text-[#64748B] shrink-0 ml-1">SEQ #{telemetry.sequence}</span>
      </div>

      {/* 5. MANUAL VOLTAGE FLUCTUATION CONTROLLER (EXPANDABLE SLIDER & PRESETS) */}
      {showControls && (
        <div className="mt-2 pt-2 border-t border-[#1E212B] space-y-2 animate-fadeIn text-[9.5px]">
          <div className="flex items-center justify-between text-[#8E8B99]">
            <span>MANUAL VOLTAGE INJECTOR:</span>
            <span className="text-[#F5D061] font-bold">{effectiveVoltage.toFixed(0)}V</span>
          </div>

          <input
            type="range"
            min="0"
            max="480"
            step="5"
            value={effectiveVoltage}
            onChange={(e) => handleSetVoltage(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-[#1F2230] rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
          />

          <div className="grid grid-cols-4 gap-1 pt-0.5">
            <button
              onClick={() => handleSetVoltage(415.2)}
              className={`py-1 px-1 rounded text-[8.5px] font-bold border transition-colors cursor-pointer text-center ${
                effectiveVoltage >= 410 && effectiveVoltage <= 420
                  ? "bg-[#D4AF37]/30 text-[#F5D061] border-[#D4AF37]"
                  : "bg-[#14151C] text-[#8E8B99] border-[#252836] hover:text-white"
              }`}
            >
              415V Nom
            </button>
            <button
              onClick={() => handleSetVoltage(380.0)}
              className={`py-1 px-1 rounded text-[8.5px] font-bold border transition-colors cursor-pointer text-center ${
                effectiveVoltage === 380
                  ? "bg-amber-500/30 text-amber-300 border-amber-500"
                  : "bg-[#14151C] text-[#8E8B99] border-[#252836] hover:text-white"
              }`}
            >
              380V Sag
            </button>
            <button
              onClick={() => handleSetVoltage(445.0)}
              className={`py-1 px-1 rounded text-[8.5px] font-bold border transition-colors cursor-pointer text-center ${
                effectiveVoltage === 445
                  ? "bg-pink-500/30 text-pink-300 border-pink-500"
                  : "bg-[#14151C] text-[#8E8B99] border-[#252836] hover:text-white"
              }`}
            >
              445V Surge
            </button>
            <button
              onClick={() => handleSetVoltage(0.0)}
              className={`py-1 px-1 rounded text-[8.5px] font-bold border transition-colors cursor-pointer text-center ${
                effectiveVoltage === 0
                  ? "bg-red-500/30 text-red-300 border-red-500"
                  : "bg-[#14151C] text-red-400 border-[#252836] hover:bg-red-950"
              }`}
            >
              0V Trip
            </button>
          </div>
        </div>
      )}

      {/* 6. Footer: Active Load & Freq */}
      <div className="flex items-center justify-between text-[10px] pt-1.5 mt-1 border-t border-[#1C1F28] font-mono">
        <div>
          <span className="text-[#8E8B99]">Load: </span>
          <span className={`font-bold ${isTripped ? "text-red-400" : "text-[#F5D061]"}`}>
            {isTripped ? "0.0 kW" : `${(telemetry.active_power_kw * (effectiveVoltage / 415.2)).toFixed(1)} kW`}
          </span>
        </div>
        <div>
          <span className="text-[#8E8B99]">Freq: </span>
          <span className={`font-bold ${isTripped ? "text-red-400" : "text-[#10B981]"}`}>
            {isTripped ? "0.00 Hz" : `${telemetry.frequency_hz.toFixed(2)} Hz`}
          </span>
        </div>
      </div>
    </div>
  );
}
