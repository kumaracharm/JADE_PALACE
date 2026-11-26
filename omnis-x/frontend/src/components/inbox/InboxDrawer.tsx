"use client";

import React, { useState, useEffect } from "react";
import {
  Inbox,
  X,
  CheckCircle,
  AlertTriangle,
  Zap,
  Droplets,
  Flame,
  Radio,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";

export interface InboxAlert {
  id: string;
  title: string;
  source: string;
  category: string;
  severity: string;
  message: string;
  entity_id?: string;
  status: "UNREAD" | "READ";
  metadata?: Record<string, any>;
  created_at: string;
}

interface InboxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEntity?: (entityId: string) => void;
}

export function InboxDrawer({ isOpen, onClose, onSelectEntity }: InboxDrawerProps) {
  const [activeTab, setActiveTab] = useState<"ALERTS" | "API_KEY">("ALERTS");
  const [alerts, setAlerts] = useState<InboxAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);

  const API_KEY_HEADER = "X-OMNIS-API-KEY";
  const API_KEY_VALUE = "omnis_pwa_secret_key_2026";
  const ENDPOINT_URL = "http://localhost:8000/api/v1/inbox/dispatch";

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:8000/api/v1/inbox/messages");
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (err) {
      console.warn("Could not connect to inbox backend:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAlerts();
    }
  }, [isOpen]);

  const handleAcknowledge = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`http://localhost:8000/api/v1/inbox/messages/${id}/acknowledge`, {
        method: "PATCH",
      });
      if (res.ok) {
        setAlerts((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: "READ" } : a))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      console.error("Acknowledge error:", err);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(API_KEY_VALUE);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const curlSnippet = `curl -X POST "http://localhost:8000/api/v1/inbox/dispatch" \\
  -H "Content-Type: application/json" \\
  -H "X-OMNIS-API-KEY: omnis_pwa_secret_key_2026" \\
  -d '{
    "title": "Substation Voltage Sag",
    "source": "Independent PWA (:8090)",
    "category": "ELECTRICAL",
    "severity": "CRITICAL",
    "message": "Phase A voltage sag detected at 382V",
    "entity_id": "FEEDER-LABS-F1",
    "metadata": {"voltage_rms": 382.4}
  }'`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(curlSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-md h-full bg-[#0E0F14] border-l border-[#252836] shadow-2xl flex flex-col text-[#E2E1E6] font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#1E212B] flex items-center justify-between bg-[#14151C]/90">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-[#F5D061]/10 border border-[#D4AF37]/40 text-[#F5D061]">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold tracking-wide text-white">
                  INBOX & EXTERNAL ALERTS
                </h2>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-[#F5D061] border border-amber-500/40 animate-pulse">
                    {unreadCount} NEW
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#8E8B99]">
                Same-IP Independent PWA & Website Bridge
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={fetchAlerts}
              className="p-1.5 rounded-lg text-[#8E8B99] hover:text-white hover:bg-white/5 transition-all"
              title="Refresh alerts"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8E8B99] hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#1E212B] bg-[#0A0C10] font-mono text-xs">
          <button
            onClick={() => setActiveTab("ALERTS")}
            className={`flex-1 py-2.5 px-3 text-center font-bold transition-all border-b-2 flex items-center justify-center space-x-1.5 ${
              activeTab === "ALERTS"
                ? "border-[#D4AF37] text-[#F5D061] bg-[#14151C]"
                : "border-transparent text-[#8E8B99] hover:text-white"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Niche Alerts ({alerts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("API_KEY")}
            className={`flex-1 py-2.5 px-3 text-center font-bold transition-all border-b-2 flex items-center justify-center space-x-1.5 ${
              activeTab === "API_KEY"
                ? "border-[#D4AF37] text-[#F5D061] bg-[#14151C]"
                : "border-transparent text-[#8E8B99] hover:text-white"
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>API Key Header</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === "ALERTS" ? (
            alerts.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center text-[#8E8B99]">
                <Inbox className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-xs font-mono">No alerts in inbox.</p>
                <p className="text-[11px] text-[#64748B] mt-1 max-w-xs">
                  Dispatch alerts from your independent PWA using the API Key Header.
                </p>
              </div>
            ) : (
              alerts.map((alert) => {
                const isUnread = alert.status === "UNREAD";
                let CatIcon = AlertTriangle;
                let catColor = "text-amber-400 bg-amber-500/10 border-amber-500/30";
                if (alert.category === "ELECTRICAL" || alert.category === "VOLTAGE_ANOMALY") {
                  CatIcon = Zap;
                  catColor = "text-red-400 bg-red-500/10 border-red-500/30";
                } else if (alert.category === "HVAC") {
                  CatIcon = Flame;
                  catColor = "text-orange-400 bg-orange-500/10 border-orange-500/30";
                } else if (alert.category === "WATER") {
                  CatIcon = Droplets;
                  catColor = "text-sky-400 bg-sky-500/10 border-sky-500/30";
                }

                return (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isUnread
                        ? "bg-[#14151E] border-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.12)]"
                        : "bg-[#0E0F14] border-[#1E212B] opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-1.5 font-mono text-[10px]">
                        <span className={`px-2 py-0.5 rounded border flex items-center space-x-1 ${catColor}`}>
                          <CatIcon className="w-3 h-3" />
                          <span className="font-bold">{alert.category}</span>
                        </span>
                        <span className="text-[#64748B]">•</span>
                        <span className="text-[#8E8B99]">{alert.source}</span>
                      </div>

                      <div className="flex items-center space-x-1 text-[10px] font-mono text-[#8E8B99]">
                        <Clock className="w-3 h-3 text-[#64748B]" />
                        <span>
                          {alert.created_at ? new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                        </span>
                      </div>
                    </div>

                    <h4 className="mt-2 text-xs font-bold text-white leading-snug">
                      {alert.title}
                    </h4>

                    <p className="mt-1 text-[11px] text-[#A1A1AA] leading-relaxed">
                      {alert.message}
                    </p>

                    {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                      <div className="mt-2 p-1.5 rounded bg-[#090A0D] border border-[#1A1D24] font-mono text-[10px] text-[#8E8B99] space-y-0.5">
                        {Object.entries(alert.metadata).map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="text-[#64748B]">{k}:</span>
                            <span className="text-white font-semibold">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 pt-2 border-t border-[#1C1F28] flex items-center justify-between text-[11px] font-mono">
                      {alert.entity_id ? (
                        <button
                          onClick={() => {
                            if (onSelectEntity) {
                              onSelectEntity(alert.entity_id!);
                              onClose();
                            } else if (typeof window !== "undefined") {
                              window.location.href = `/twin?entity=${encodeURIComponent(alert.entity_id!)}`;
                            }
                          }}
                          className="px-2.5 py-1 rounded bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#F5D061] border border-[#D4AF37]/40 font-bold transition-all flex items-center space-x-1 cursor-pointer"
                        >
                          <span>🎯 Pinpoint in 3D Twin</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#64748B]">No spatial anchor</span>
                      )}

                      {isUnread && (
                        <button
                          onClick={(e) => handleAcknowledge(alert.id, e)}
                          className="px-2 py-0.5 rounded text-[#8E8B99] hover:text-white hover:bg-white/10 transition-all flex items-center space-x-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Mark Read</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )
          ) : (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-[#14151F] border border-[#D4AF37]/40 shadow-lg">
                <div className="flex items-center space-x-2 text-[#F5D061] font-bold">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>SECURE API KEY HEADER</span>
                </div>
                <p className="mt-1 text-[11px] text-[#A1A1AA] font-sans">
                  Use this exact HTTP header in your independent website / PWA running on the same IP to safely send alerts into the OMNIS-X main console.
                </p>

                <div className="mt-3 space-y-2">
                  <div>
                    <span className="text-[10px] text-[#8E8B99]">Header Name:</span>
                    <div className="mt-0.5 p-2 rounded bg-[#090A0E] border border-[#232733] text-[#F5D061] font-bold">
                      {API_KEY_HEADER}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#8E8B99]">Header Value (Secret Key):</span>
                      <button
                        onClick={handleCopyKey}
                        className="text-[10px] text-[#D4AF37] hover:text-white flex items-center space-x-1"
                      >
                        {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey ? "Copied" : "Copy Key"}</span>
                      </button>
                    </div>
                    <div className="mt-0.5 p-2 rounded bg-[#090A0E] border border-[#232733] text-emerald-400 font-bold truncate">
                      {API_KEY_VALUE}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#8E8B99]">Main Console Endpoint:</span>
                    <div className="mt-0.5 p-2 rounded bg-[#090A0E] border border-[#232733] text-sky-400 text-[11px] truncate">
                      POST {ENDPOINT_URL}
                    </div>
                  </div>
                </div>
              </div>

              {/* cURL Snippet */}
              <div className="p-3.5 rounded-xl bg-[#090A0E] border border-[#232733]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#8E8B99] font-bold text-[10px]">Sample cURL Request:</span>
                  <button
                    onClick={handleCopySnippet}
                    className="text-[10px] text-[#D4AF37] hover:text-white flex items-center space-x-1"
                  >
                    {copiedSnippet ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSnippet ? "Copied" : "Copy cURL"}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-[#050608] border border-[#191C24] text-[10px] text-[#CBD5E1] overflow-x-auto whitespace-pre font-mono">
                  {curlSnippet}
                </pre>
              </div>

              {/* JavaScript Fetch Snippet */}
              <div className="p-3 rounded-xl bg-[#090A0E] border border-[#232733]">
                <span className="text-[#8E8B99] font-bold text-[10px]">Client JavaScript Fetch:</span>
                <pre className="mt-1.5 p-2 rounded bg-[#050608] border border-[#191C24] text-[9.5px] text-[#CBD5E1] overflow-x-auto whitespace-pre font-mono">
{`await fetch("${ENDPOINT_URL}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "${API_KEY_HEADER}": "${API_KEY_VALUE}"
  },
  body: JSON.stringify({
    title: "Arcing Incident",
    source: "My Independent PWA",
    category: "ELECTRICAL",
    severity: "CRITICAL",
    message: "Fault in lab circuit",
    entity_id: "LAB-01-EE"
  })
});`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#1E212B] bg-[#14151C] flex items-center justify-between font-mono text-[10px] text-[#8E8B99]">
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Inbox Listener Active</span>
          </span>
          <span>OMNIS-X v2.4</span>
        </div>
      </div>
    </div>
  );
}
