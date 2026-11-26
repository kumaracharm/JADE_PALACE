"use client";

import React, { useEffect, useState, useRef } from "react";

interface LiveTelemetryPillProps {
  streamUrl?: string;
}

export function LiveTelemetryPill({
  streamUrl = "http://127.0.0.1:8000/api/v1/demo/stream",
}: LiveTelemetryPillProps) {
  const [isLive, setIsLive] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState({
    voltage_v: 415.2,
    active_power_kw: 142.8,
    current_a: 198.0,
    temperature_c: 23.4,
    frequency_hz: 50.02,
    sequence: 1000,
    status: "OPERATIONAL",
    scenario: "NORMAL",
  });

  const phaseRef = useRef<number>(0);
  const [sineOffset, setSineOffset] = useState<number>(0);

  // Dynamic continuous oscilloscope flow
  useEffect(() => {
    let animId: number;
    const animate = () => {
      phaseRef.current += 0.045;
      setSineOffset(phaseRef.current);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

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

            setTelemetry({
              voltage_v: volt,
              active_power_kw: power,
              current_a: curr,
              temperature_c: temp,
              frequency_hz: freq,
              sequence: seq,
              status: data.status || "OPERATIONAL",
              scenario: data.scenario || "NORMAL",
            });
          } catch {
            // ignore JSON parse errors
          }
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

  const isTripped =
    telemetry.status === "OFFLINE_TRIPPED" ||
    telemetry.scenario === "FEEDER_FAILURE" ||
    telemetry.voltage_v < 250;

  // Waveform dimensions & points (matching reference card exactly)
  const width = 254;
  const height = 44;
  const midY = height / 2;
  const totalPoints = 50;
  const points: [number, number][] = [];

  for (let i = 0; i <= totalPoints; i++) {
    const x = (i / totalPoints) * width;
    let y = midY;

    if (isTripped) {
      // Breaker trip chaotic noise & damping
      const noise =
        (Math.sin(i * 0.8 + sineOffset * 3) +
          Math.cos(i * 1.6 - sineOffset * 2)) *
        4;
      const spike = i % 8 === 0 ? Math.sin(sineOffset * 5) * 6 : 0;
      y = midY + (noise + spike) * 0.4;
    } else {
      // Golden flowing sinusoidal waveform with 2.8 harmonic cycles
      const amp = 13.5;
      const wave = Math.sin((i / totalPoints) * Math.PI * 5.6 - sineOffset) * amp;
      const harmonic = Math.sin((i / totalPoints) * Math.PI * 11.2 - sineOffset * 1.5) * 1.2;
      y = midY + wave + harmonic;
    }

    points.push([x, Math.max(3, Math.min(height - 3, y))]);
  }

  const pathD = points.reduce(
    (acc, [x, y], idx) => (idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`),
    ""
  );
  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  const waveStroke = isTripped ? "#EF4444" : "#F5D061";

  return (
    <div className="absolute bottom-4 right-4 z-30 w-[280px] bg-[#0E0F14]/95 backdrop-blur-md border border-[#252833] rounded-xl p-3 shadow-2xl font-mono select-none pointer-events-auto">
      {/* 1. Header: Gold Dot + LIVE TELEMETRY STREAM + 1.0S SSE badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isTripped
                ? "bg-red-500 animate-pulse"
                : isLive
                ? "bg-[#D4AF37] animate-pulse"
                : "bg-[#D4AF37]"
            }`}
          />
          <span className="font-bold text-[#E6C45E] text-[11px] tracking-wider uppercase">
            LIVE TELEMETRY STREAM
          </span>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded bg-[#2D2A1C] text-[#F5D061] border border-[#D4AF37]/50 font-bold tracking-tight">
          1.0S SSE
        </span>
      </div>

      {/* 2. Readout above Waveform: 415.2V RMS Nom */}
      <div className="text-[10px] text-[#8E8B99] mt-1.5 mb-1 font-mono">
        {telemetry.voltage_v.toFixed(1)}V RMS Nom
      </div>

      {/* 3. Dynamic Flowing Oscilloscope Waveform with Golden Area Glow */}
      <div className="relative w-full h-[44px] overflow-hidden rounded bg-transparent">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="liveWaveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={waveStroke} stopOpacity="0.35" />
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

      {/* 4. Footer: Active Load: 142.8 kW and Freq: 50.02 Hz */}
      <div className="flex items-center justify-between text-[10.5px] pt-1.5 mt-0.5 border-t border-[#1C1F28] font-mono">
        <div>
          <span className="text-[#8E8B99]">Active Load: </span>
          <span className={`font-bold ${isTripped ? "text-red-400" : "text-[#F5D061]"}`}>
            {isTripped ? "0.0 kW" : `${telemetry.active_power_kw.toFixed(1)} kW`}
          </span>
        </div>
        <div>
          <span className="text-[#8E8B99]">Freq: </span>
          <span className="text-[#10B981] font-bold">
            {telemetry.frequency_hz.toFixed(2)} Hz
          </span>
        </div>
      </div>
    </div>
  );
}
