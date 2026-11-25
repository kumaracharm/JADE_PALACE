"use client";

import React, { useEffect, useRef, useState } from "react";
import cytoscape, { Core } from "cytoscape";
import { CampusEntity, EntityRelationship } from "@/types/digital-twin";
import { Maximize2, ZoomIn, ZoomOut } from "lucide-react";

interface DependencyGraphViewProps {
  entities: CampusEntity[];
  relationships: EntityRelationship[];
  selectedEntityId: string | null;
  onSelectEntity: (entityId: string) => void;
  incidentAffectedIds: Set<string>;
}

export function DependencyGraphView({
  entities,
  relationships,
  selectedEntityId,
  onSelectEntity,
  incidentAffectedIds,
}: DependencyGraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [layoutName, setLayoutName] = useState<"breadthfirst" | "cose" | "concentric">("breadthfirst");

  useEffect(() => {
    if (!containerRef.current) return;

    const elements: any[] = [];

    // Add nodes in Dusty Purple + Charcoal + Gold
    (entities || []).forEach((ent) => {
      const isAffected = incidentAffectedIds.has(ent.entity_id);
      let statusColor = "#9D8EB5"; // Dusty Purple nominal
      if (isAffected || ent.operational_status === "FAILED") {
        statusColor = "#E05D5D";
      } else if (ent.operational_status === "DEGRADED") {
        statusColor = "#E5A83B";
      } else if (ent.entity_id.startsWith("FEEDER") || ent.entity_id.startsWith("METER")) {
        statusColor = "#D4AF37"; // Gold for power core
      }

      elements.push({
        data: {
          id: ent.entity_id,
          label: ent.name.length > 20 ? ent.entity_id : ent.name,
          type: ent.entity_type,
          status: ent.operational_status,
          statusColor: statusColor,
          isAffected: isAffected,
        },
      });
    });

    // Add edges
    (relationships || []).forEach((rel) => {
      let edgeColor = "#5A5468"; // Muted dusty purple
      if (rel.relationship_type === "SUPPLIES_POWER_TO") edgeColor = "#D4AF37"; // Gold power
      if (rel.relationship_type === "CONNECTED_TO_NETWORK") edgeColor = "#BDB0D3"; // Light dusty purple
      if (rel.relationship_type === "USES_EQUIPMENT") edgeColor = "#E6C45E"; // Soft gold
      if (rel.relationship_type === "ASSIGNED_TO_ROOM") edgeColor = "#9D8EB5";

      elements.push({
        data: {
          id: rel.relationship_id,
          source: rel.source_id,
          target: rel.target_id,
          type: rel.relationship_type,
          edgeColor: edgeColor,
          isEssential: rel.is_essential,
        },
      });
    });

    // Initialize Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#161722",
            "border-color": "data(statusColor)",
            "border-width": 2,
            label: "data(label)",
            color: "#E2E1E6",
            "font-size": "10px",
            "font-family": "monospace",
            "text-valign": "bottom",
            "text-margin-y": 6,
            width: 32,
            height: 32,
            "text-background-opacity": 0.85,
            "text-background-color": "#0E0F14",
            "text-background-padding": "2px",
            "text-background-shape": "roundrectangle",
          },
        },
        {
          selector: "node:selected",
          style: {
            "border-color": "#D4AF37",
            "border-width": 4,
            "background-color": "#282536",
            color: "#F5D061",
          },
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "data(edgeColor)",
            "target-arrow-color": "data(edgeColor)",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            opacity: 0.88,
            "arrow-scale": 0.9,
          },
        },
      ],
      layout: {
        name: layoutName,
        directed: true,
        padding: 50,
        animate: false,
      } as any,
    });

    cy.on("tap", "node", (evt) => {
      const node = evt.target;
      onSelectEntity(node.id());
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [entities, relationships, layoutName, incidentAffectedIds, onSelectEntity]);

  // Sync selected node with inspector
  useEffect(() => {
    if (!cyRef.current) return;
    cyRef.current.nodes().unselect();
    if (selectedEntityId) {
      const targetNode = cyRef.current.$id(selectedEntityId);
      if (targetNode.length > 0) {
        targetNode.select();
        cyRef.current.animate({ center: { eles: targetNode }, zoom: 1.2 }, { duration: 300 });
      }
    }
  }, [selectedEntityId]);

  return (
    <div className="relative flex-1 h-full w-full bg-[#0E0F14] overflow-hidden select-none">
      {/* Top Left Layout and Action Controls in Charcoal + Gold */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-[#15161E]/95 backdrop-blur border border-[#2D303E] p-1 rounded-lg shadow-2xl">
        <button
          onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.2)}
          className="p-1.5 rounded hover:bg-[#252836] text-[#BDB0D3] hover:text-[#F5D061]"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 0.8)}
          className="p-1.5 rounded hover:bg-[#252836] text-[#BDB0D3] hover:text-[#F5D061]"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => cyRef.current?.fit()}
          className="p-1.5 rounded hover:bg-[#252836] text-[#BDB0D3] hover:text-[#F5D061]"
          title="Fit Graph"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-[#2D303E] mx-1" />

        {/* Layout Algorithm Switcher */}
        {(["breadthfirst", "cose", "concentric"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLayoutName(l)}
            className={`px-2 py-1 text-xs font-mono font-medium rounded transition-colors ${
              layoutName === l
                ? "bg-[#D4AF37] text-[#121316] font-bold shadow-md shadow-[#D4AF37]/20"
                : "text-[#9D8EB5] hover:text-[#E2E1E6]"
            }`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Top Right Relationship Color Legend in Dusty Purple + Gold */}
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-3 bg-[#15161E]/95 backdrop-blur border border-[#2D303E] px-3.5 py-1.5 rounded-lg shadow-2xl text-xs font-mono">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-1 bg-[#D4AF37]" />
          <span className="text-[#F5D061] text-[10px]">POWER (Gold)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-1 bg-[#BDB0D3]" />
          <span className="text-[#BDB0D3] text-[10px]">NETWORK (Dusty Purple)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-1 bg-[#E6C45E]" />
          <span className="text-[#E6C45E] text-[10px]">EQUIPMENT</span>
        </div>
      </div>

      {/* Cytoscape Container */}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
