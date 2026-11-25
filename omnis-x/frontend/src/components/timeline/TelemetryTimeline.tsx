"use client";

import React, { useState, useEffect, useRef } from "react";
import * as echarts from "echarts";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { TelemetryEvent } from "@/types/digital-twin";
import { DigitalTwinApi } from "@/services/api";

interface TelemetryTimelineProps {
  selectedEntityId: string | null;
  onTimelineTick?: (timeIndex: number) => void;
}

export function TelemetryTimeline({
  selectedEntityId,
  onTimelineTick,
}: TelemetryTimelineProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<"12H" | "6H" | "1H" | "LIVE">("12H");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [events, setEvents] = useState<TelemetryEvent[]>([]);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  // Default to METER-FEEDER-F1 if no specific entity selected
  const activeEntityId = selectedEntityId || "METER-FEEDER-F1";

  useEffect(() => {
    let isMounted = true;
    DigitalTwinApi.getTelemetryEvents(activeEntityId, undefined, 50)
      .then((data) => {
        if (!isMounted) return;
        setEvents((data || []).reverse()); // Chronological order
      })
      .catch((err) => console.warn("Timeline data warning:", err));

    return () => {
      isMounted = false;
    };
  }, [activeEntityId]);

  // Synthetic playback loop
  useEffect(() => {
    let interval: any;
    if (isPlaying && events.length > 0) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          const next = prev + 1;
          if (next >= events.length) {
            setIsPlaying(false);
            return prev;
          }
          if (onTimelineTick) onTimelineTick(next);
          return next;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, events.length, playbackSpeed, onTimelineTick]);

  // Generate series for ECharts in Dusty Purple + Charcoal + Gold
  const timestamps = events.map((e) => new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const voltageValues = events.filter((e) => e.metric_name === "voltage_v").map((e) => e.value);
  const powerValues = events.filter((e) => e.metric_name.includes("power")).map((e) => e.value);
  const tempValues = events.filter((e) => e.metric_name.includes("temp")).map((e) => e.value);

  // Safe chart initialization and resize observer (Prevents "Can't get DOM width or height" warning)
  useEffect(() => {
    if (isCollapsed) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
      return;
    }

    const container = chartContainerRef.current;
    if (!container) return;

    const chartOption: echarts.EChartsOption = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "#171821",
        borderColor: "#D4AF37",
        borderWidth: 1,
        textStyle: { color: "#F0EDF5", fontSize: 11, fontFamily: "monospace" },
      },
      legend: {
        data: ["Voltage (V)", "Active Power (kW)", "Temperature (°C)"],
        textStyle: { color: "#9D8EB5", fontSize: 10, fontFamily: "monospace" },
        top: 4,
        right: 12,
      },
      grid: {
        left: "3%",
        right: "3%",
        bottom: "14%",
        top: "22%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: timestamps.length > 0 ? timestamps : ["00:00", "03:00", "06:00", "09:00", "12:00"],
        axisLine: { lineStyle: { color: "#2B2D3B" } },
        axisLabel: { color: "#8A8594", fontSize: 10, fontFamily: "monospace" },
      },
      yAxis: [
        {
          type: "value",
          name: "Voltage (V)",
          min: 380,
          max: 440,
          axisLine: { lineStyle: { color: "#D4AF37" } },
          splitLine: { lineStyle: { color: "rgba(45, 48, 59, 0.4)" } },
          axisLabel: { color: "#D4AF37", fontSize: 9, fontFamily: "monospace" },
        },
        {
          type: "value",
          name: "Power / Temp",
          axisLine: { lineStyle: { color: "#9D8EB5" } },
          splitLine: { show: false },
          axisLabel: { color: "#9D8EB5", fontSize: 9, fontFamily: "monospace" },
        },
      ],
      series: [
        {
          name: "Voltage (V)",
          type: "line",
          smooth: true,
          data: voltageValues.length > 0 ? voltageValues : [415, 414.8, 415.2, 413.9, 414.6],
          lineStyle: { color: "#D4AF37", width: 2.5 },
          markLine: {
            silent: true,
            data: [
              { yAxis: 415, lineStyle: { color: "#F5D061", type: "dashed" }, label: { formatter: "415V Nominal" } },
              { yAxis: 395, lineStyle: { color: "#E05D5D", type: "dotted" }, label: { formatter: "Trip Min" } },
            ],
          },
        },
        {
          name: "Active Power (kW)",
          type: "line",
          smooth: true,
          yAxisIndex: 1,
          data: powerValues.length > 0 ? powerValues : [22.4, 34.0, 42.1, 38.5, 36.2],
          lineStyle: { color: "#E5A83B", width: 2 },
        },
        {
          name: "Temperature (°C)",
          type: "line",
          smooth: true,
          yAxisIndex: 1,
          data: tempValues.length > 0 ? tempValues : [21.5, 22.8, 23.5, 24.1, 23.0],
          lineStyle: { color: "#9D8EB5", width: 1.5, type: "dashed" },
        },
      ],
    };

    const renderOrResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w <= 0 || h <= 0) return; // Do not initialize on collapsed/zero DOM elements

      if (!chartInstanceRef.current) {
        chartInstanceRef.current = echarts.init(container, null, { renderer: "canvas" });
      }
      chartInstanceRef.current.setOption(chartOption, true);
      chartInstanceRef.current.resize();
    };

    const resizeObserver = new ResizeObserver(() => {
      renderOrResize();
    });
    resizeObserver.observe(container);

    renderOrResize();

    return () => {
      resizeObserver.disconnect();
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, [isCollapsed, timestamps, voltageValues, powerValues, tempValues]);

  return (
    <div
      className={`border-t border-[#272935] bg-[#14151A] z-20 flex flex-col flex-shrink-0 w-full min-w-0 transition-all duration-200 ${
        isCollapsed ? "h-9" : "h-[250px]"
      }`}
    >
      {/* Timeline Controls Bar (Fixed 36px height) */}
      <div className="h-9 flex-shrink-0 px-4 border-b border-[#272935] flex items-center justify-between select-none bg-[#121318] min-w-0">
        {/* Left: Target Entity and Provenance */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center space-x-1.5 text-xs font-semibold text-[#E2E1E6] hover:text-[#D4AF37]"
          >
            {isCollapsed ? <ChevronUp className="w-3.5 h-3.5 text-[#9D8EB5]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#9D8EB5]" />}
            <span className="font-mono">TELEMETRY TIMELINE</span>
          </button>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1D1E28] text-[#F5D061] border border-[#383321]">
            {activeEntityId}
          </span>

          <span className="text-[9px] font-mono font-bold text-[#D4AF37] hidden sm:flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            <span>PROVENANCE: REAL + SYNTHETIC BASELINE</span>
          </span>
        </div>

        {/* Center: Playback Controls in Gold */}
        {!isCollapsed && (
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={() => {
                setCurrentStep(0);
                setIsPlaying(false);
              }}
              className="p-1 rounded text-[#9D8EB5] hover:text-[#F5D061] hover:bg-[#20222E]"
              title="Rewind"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-full bg-[#D4AF37] hover:bg-[#F5D061] text-[#121316] font-bold shadow-md shadow-[#D4AF37]/30"
              title={isPlaying ? "Pause Playback" : "Play Telemetry"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>

            <button
              onClick={() => {
                setCurrentStep((prev) => Math.min(prev + 1, Math.max(0, events.length - 1)));
              }}
              className="p-1 rounded text-[#9D8EB5] hover:text-[#F5D061] hover:bg-[#20222E]"
              title="Step Forward"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <div className="flex bg-[#191A23] rounded border border-[#2D303E] text-[10px] font-mono ml-2">
              {[1, 2, 5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-1.5 py-0.5 ${
                    playbackSpeed === speed ? "bg-[#D4AF37] text-[#121316] font-bold" : "text-[#9D8EB5] hover:text-[#E2E1E6]"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Right: Time Range Selector */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          {(["12H", "6H", "1H", "LIVE"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded transition-colors ${
                timeRange === range
                  ? "bg-[#2B2338] text-[#F5D061] font-bold border border-[#5E5073]"
                  : "text-[#8A8594] hover:text-[#BDB0D3]"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Main ECharts Chart Container with measurable height */}
      {!isCollapsed && (
        <div className="flex-1 w-full h-[214px] min-h-[190px] p-2 relative overflow-hidden">
          <div ref={chartContainerRef} className="w-full h-full min-h-[180px]" />
        </div>
      )}
    </div>
  );
}
