"use client";

import React, { useState, useEffect } from "react";
import {
  CampusEntity,
  TelemetryEvent,
} from "@/types/digital-twin";
import { DigitalTwinApi } from "@/services/api";
import {
  X,
  Activity,
  AlertTriangle,
  Zap,
  Network,
  Cpu,
  Layers,
  AlertOctagon,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Wrench,
} from "lucide-react";

interface EntityInspectorProps {
  entityId: string | null;
  onClose: () => void;
  entityMap: Map<string, CampusEntity>;
  onSelectEntity: (entityId: string) => void;
  onInitiateWorkOrder?: (entityId: string) => void;
}

export function EntityInspector({
  entityId,
  onClose,
  entityMap,
  onSelectEntity,
  onInitiateWorkOrder,
}: EntityInspectorProps) {
  const [telemetry, setTelemetry] = useState<TelemetryEvent[]>([]);
  const [dependencies, setDependencies] = useState<{
    upstream: any[];
    downstream: any[];
  }>({ upstream: [], downstream: [] });
  const [loading, setLoading] = useState<boolean>(false);

  // Collapsible section states
  const [openSections, setOpenSections] = useState({
    identity: true,
    telemetry: true,
    dependencies: true,
    incidents: true,
    metadata: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const entity = entityId ? entityMap.get(entityId) : null;

  // Defensive arrays
  const upstreamList = dependencies?.upstream || [];
  const downstreamList = dependencies?.downstream || [];

  // Load live telemetry and graph dependencies on entity change
  useEffect(() => {
    if (!entityId) return;

    let isMounted = true;
    setLoading(true);

    Promise.all([
      DigitalTwinApi.getTelemetryEvents(entityId, undefined, 20),
      DigitalTwinApi.getEntityDependencies(entityId),
    ])
      .then(([events, deps]) => {
        if (!isMounted) return;
        setTelemetry(Array.isArray(events) ? events : []);
        setDependencies({
          upstream: Array.isArray(deps?.upstream) ? deps.upstream : [],
          downstream: Array.isArray(deps?.downstream) ? deps.downstream : [],
        });
      })
      .catch((err) => {
        console.warn("Inspector load warning:", err);
        if (isMounted) {
          setDependencies({ upstream: [], downstream: [] });
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [entityId]);

  if (!entityId || !entity) {
    return null;
  }

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    OPERATIONAL: { bg: "bg-[#D4AF37]/15", text: "text-[#F5D061]", border: "border-[#D4AF37]/40" },
    DEGRADED: { bg: "bg-[#E5A83B]/15", text: "text-[#E5A83B]", border: "border-[#E5A83B]/40" },
    FAILED: { bg: "bg-[#E05D5D]/15", text: "text-[#E05D5D]", border: "border-[#E05D5D]/40" },
    OFFLINE: { bg: "bg-[#74658B]/15", text: "text-[#9D8EB5]", border: "border-[#74658B]/40" },
  };

  const currentStatusStyle = statusColors[entity.operational_status] || statusColors.OPERATIONAL;
  const healthScore = entity.operational_status === "OPERATIONAL" ? 98.4 : entity.operational_status === "DEGRADED" ? 64.0 : 12.0;

  return (
    <aside className="w-80 lg:w-96 flex-shrink-0 bg-[#15161C] border-l border-[#272935] flex flex-col h-full shadow-2xl z-20 select-none min-h-0 overflow-hidden">
      {/* 1. Header Bar in Charcoal + Gold */}
      <div className="p-4 border-b border-[#272935] flex items-start justify-between bg-[#121318]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#312816] text-[#F5D061] border border-[#D4AF37]/40">
              {entity.entity_id}
            </span>
            <span
              className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${currentStatusStyle.bg} ${currentStatusStyle.text} ${currentStatusStyle.border}`}
            >
              ● {entity.operational_status}
            </span>
          </div>
          <h2 className="text-sm font-bold text-[#F0EDF5] mt-1.5 leading-snug">{entity.name}</h2>
          <p className="text-[11px] text-[#9D8EB5] font-medium font-mono">{entity.location}</p>
        </div>

        <button
          onClick={onClose}
          className="text-[#8A8594] hover:text-[#E2E1E6] p-1 rounded hover:bg-[#232530] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Key Metrics Card in Charcoal + Gold */}
      <div className="p-4 bg-[#191A22] border-b border-[#272935] grid grid-cols-2 gap-3">
        {/* Health Score Meter */}
        <div className="bg-[#14151C] p-2.5 rounded border border-[#2D303E]">
          <div className="flex items-center justify-between text-[10px] text-[#9D8EB5] font-mono">
            <span>RESILIENCE / HEALTH</span>
            <Activity className="w-3 h-3 text-[#D4AF37]" />
          </div>
          <div className="text-lg font-mono font-bold text-[#F5D061] mt-1">
            {healthScore.toFixed(1)}%
          </div>
          <div className="w-full h-1.5 bg-[#252836] rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                healthScore > 80 ? "bg-[#D4AF37]" : healthScore > 40 ? "bg-[#E5A83B]" : "bg-[#E05D5D]"
              }`}
              style={{ width: `${healthScore}%` }}
            />
          </div>
        </div>

        {/* Criticality Rating in Dusty Purple + Gold */}
        <div className="bg-[#14151C] p-2.5 rounded border border-[#2D303E]">
          <div className="flex items-center justify-between text-[10px] text-[#9D8EB5] font-mono">
            <span>CRITICALITY</span>
            <AlertOctagon className="w-3 h-3 text-[#E6C45E]" />
          </div>
          <div className="text-xs font-mono font-bold text-[#F0EDF5] mt-2 truncate">
            {entity.criticality}
          </div>
          <div className="text-[9px] text-[#D4AF37] mt-1 font-mono font-bold">TIER-1 CORE ASSET</div>
        </div>
      </div>

      {/* 3. Scrollable Accordion Content */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#272935] text-xs">
        {/* Section A: Physical Space & Identity */}
        <div>
          <button
            onClick={() => toggleSection("identity")}
            className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-[#1B1C24] text-[#E2E1E6] font-semibold"
          >
            <span className="flex items-center space-x-2">
              <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Identity & Spatial Context</span>
            </span>
            {openSections.identity ? <ChevronDown className="w-3.5 h-3.5 text-[#9D8EB5]" /> : <ChevronRight className="w-3.5 h-3.5 text-[#9D8EB5]" />}
          </button>

          {openSections.identity && (
            <div className="px-4 pb-3 space-y-2 text-[#E2E1E6]">
              <p className="text-[#A7A1B2] text-[11px] leading-relaxed">{entity.description}</p>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="bg-[#1A1C24] p-2 rounded border border-[#2D303E]">
                  <span className="text-[9px] text-[#9D8EB5] block">TYPE</span>
                  <span className="text-[#E2E1E6] font-semibold">{entity.entity_type}</span>
                </div>
                <div className="bg-[#1A1C24] p-2 rounded border border-[#2D303E]">
                  <span className="text-[9px] text-[#9D8EB5] block">PARENT</span>
                  <span className="text-[#F5D061] cursor-pointer hover:underline" onClick={() => entity.parent_entity_id && onSelectEntity(entity.parent_entity_id)}>
                    {entity.parent_entity_id || "CAMPUS-ROOT"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section B: Live Telemetry Stream */}
        <div>
          <button
            onClick={() => toggleSection("telemetry")}
            className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-[#1B1C24] text-[#E2E1E6] font-semibold"
          >
            <span className="flex items-center space-x-2">
              <Activity className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Telemetry & Sensor Stream ({telemetry.length})</span>
            </span>
            {openSections.telemetry ? <ChevronDown className="w-3.5 h-3.5 text-[#9D8EB5]" /> : <ChevronRight className="w-3.5 h-3.5 text-[#9D8EB5]" />}
          </button>

          {openSections.telemetry && (
            <div className="px-4 pb-3 space-y-2">
              {telemetry.length === 0 ? (
                <div className="text-[11px] text-[#9D8EB5] py-2 text-center font-mono">
                  No active telemetry streams detected for this entity.
                </div>
              ) : (
                telemetry.map((t, idx) => (
                  <div
                    key={t.event_id || idx}
                    className="bg-[#1A1C24] p-2 rounded border border-[#2E3140] flex items-center justify-between font-mono"
                  >
                    <div>
                      <div className="text-[#F0EDF5] font-semibold text-[11px]">{t.metric_name}</div>
                      <div className="flex items-center space-x-2 text-[9px] text-[#8A8594] mt-0.5">
                        <Clock className="w-2.5 h-2.5 text-[#9D8EB5]" />
                        <span>{new Date(t.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#F5D061] font-bold text-xs">
                        {t.value.toFixed(1)} {t.unit}
                      </div>
                      <span
                        className={`text-[8px] px-1 py-0.2 rounded font-bold uppercase ${
                          t.source_type === "REAL"
                            ? "bg-[#332A16] text-[#F5D061] border border-[#D4AF37]/30"
                            : "bg-[#292236] text-[#BDB0D3] border border-[#5E5073]"
                        }`}
                      >
                        {t.source_type}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Section C: Directed Graph Dependencies */}
        <div>
          <button
            onClick={() => toggleSection("dependencies")}
            className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-[#1B1C24] text-[#E2E1E6] font-semibold"
          >
            <span className="flex items-center space-x-2">
              <Network className="w-3.5 h-3.5 text-[#9D8EB5]" />
              <span>Dependencies & Grid Links</span>
            </span>
            {openSections.dependencies ? <ChevronDown className="w-3.5 h-3.5 text-[#9D8EB5]" /> : <ChevronRight className="w-3.5 h-3.5 text-[#9D8EB5]" />}
          </button>

          {openSections.dependencies && (
            <div className="px-4 pb-3 space-y-3">
              {/* Upstream Providers */}
              <div>
                <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold flex items-center space-x-1">
                  <ArrowUpRight className="w-3 h-3 text-[#D4AF37]" />
                  <span>Upstream Dependencies ({upstreamList.length})</span>
                </span>
                <div className="space-y-1.5 mt-1.5">
                  {upstreamList.length === 0 ? (
                    <span className="text-[10px] text-[#8A8594] italic">None (Root source)</span>
                  ) : (
                    upstreamList.map((rel: any, idx: number) => {
                      const relId = rel.relationship_id || `${rel.source_id}->${rel.target_id}` || `up-${idx}`;
                      const relType = rel.relationship_type || rel.edge_data?.relationship_type || "SUPPLIES_TO";
                      const isEssential = rel.is_essential ?? rel.edge_data?.is_essential ?? true;
                      return (
                        <button
                          key={relId}
                          onClick={() => onSelectEntity(rel.source_id)}
                          className="w-full text-left bg-[#1A1C24] hover:bg-[#252836] p-2 rounded border border-[#2D303E] flex items-center justify-between transition-colors"
                        >
                          <div>
                            <span className="font-mono text-xs font-semibold text-[#F5D061]">
                              {rel.source_id}
                            </span>
                            <span className="text-[9px] text-[#9D8EB5] block">{relType}</span>
                          </div>
                          <span className="text-[9px] px-1 py-0.5 rounded bg-[#332A16] text-[#F5D061] border border-[#D4AF37]/30">
                            {isEssential ? "CRITICAL" : "REDUNDANT"}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Downstream Consumers */}
              <div>
                <span className="text-[10px] font-mono text-[#9D8EB5] uppercase font-bold flex items-center space-x-1">
                  <ArrowDownRight className="w-3 h-3 text-[#9D8EB5]" />
                  <span>Downstream Consumers ({downstreamList.length})</span>
                </span>
                <div className="space-y-1.5 mt-1.5">
                  {downstreamList.length === 0 ? (
                    <span className="text-[10px] text-[#8A8594] italic">None (Terminal leaf node)</span>
                  ) : (
                    downstreamList.map((rel: any, idx: number) => {
                      const relId = rel.relationship_id || `${rel.source_id}->${rel.target_id}` || `down-${idx}`;
                      const relType = rel.relationship_type || rel.edge_data?.relationship_type || "DEPENDS_ON";
                      return (
                        <button
                          key={relId}
                          onClick={() => onSelectEntity(rel.target_id)}
                          className="w-full text-left bg-[#1A1C24] hover:bg-[#252836] p-2 rounded border border-[#2D303E] flex items-center justify-between transition-colors"
                        >
                          <div>
                            <span className="font-mono text-xs font-semibold text-[#BDB0D3]">
                              {rel.target_id}
                            </span>
                            <span className="text-[9px] text-[#8A8594] block">{relType}</span>
                          </div>
                          <ExternalLink className="w-3 h-3 text-[#D4AF37]" />
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section D: Technical Metadata Attributes */}
        <div>
          <button
            onClick={() => toggleSection("metadata")}
            className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-[#1B1C24] text-[#E2E1E6] font-semibold"
          >
            <span className="flex items-center space-x-2">
              <Cpu className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Technical Specifications</span>
            </span>
            {openSections.metadata ? <ChevronDown className="w-3.5 h-3.5 text-[#9D8EB5]" /> : <ChevronRight className="w-3.5 h-3.5 text-[#9D8EB5]" />}
          </button>

          {openSections.metadata && (
            <div className="px-4 pb-3">
              <pre className="p-2.5 rounded bg-[#101117] border border-[#272935] text-[10px] font-mono text-[#BDB0D3] overflow-x-auto">
                {JSON.stringify(entity.metadata_json, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* 4. Bottom Quick Action Button in GOLD */}
      <div className="p-3 border-t border-[#272935] bg-[#121318]">
        <button
          onClick={() => onInitiateWorkOrder && onInitiateWorkOrder(entity.entity_id)}
          className="w-full py-2 px-3 rounded bg-[#D4AF37] hover:bg-[#F5D061] text-[#121316] font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-[#D4AF37]/20 transition-all"
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Dispatch Diagnostic Work Order</span>
        </button>
      </div>
    </aside>
  );
}
