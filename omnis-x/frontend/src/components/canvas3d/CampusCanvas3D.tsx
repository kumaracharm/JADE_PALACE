"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Layers,
  Zap,
  Network,
  Activity,
  Maximize2,
  Minimize2,
  Compass,
  AlertTriangle,
  RotateCcw,
  Eye,
  Sliders,
  X,
  Wrench,
} from "lucide-react";
import {
  CAMPUS_3D_LAYERS,
  CAMPUS_3D_ROOMS,
  CAMPUS_3D_CONDUITS,
} from "@/data/campus3dData";
import {
  CampusLayerId,
  Room3DSpec,
  ViewPreset3D,
} from "@/types/campus3d";

interface CampusCanvas3DProps {
  selectedEntityId: string | null;
  onSelectEntity: (entityId: string) => void;
  incidentAffectedIds: Set<string>;
  simulationActive: boolean;
  currentFloor?: string;
  onSelectFloor?: (floorId: string) => void;
}

function floorIdToLayerId(floorId?: string): CampusLayerId {
  if (!floorId || floorId === "all") return "all";
  if (floorId === "FLOOR-G") return "ground";
  if (floorId === "FLOOR-1") return "floor1";
  if (floorId === "FLOOR-2") return "floor2";
  if (floorId === "FLOOR-3") return "roof";
  return "all";
}

function layerIdToFloorId(layerId: CampusLayerId): string {
  if (layerId === "ground") return "FLOOR-G";
  if (layerId === "floor1") return "FLOOR-1";
  if (layerId === "floor2") return "FLOOR-2";
  if (layerId === "roof") return "FLOOR-3";
  return "all";
}

export function CampusCanvas3D({
  selectedEntityId,
  onSelectEntity,
  incidentAffectedIds,
  simulationActive,
  currentFloor,
  onSelectFloor,
}: CampusCanvas3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Architectural View State - synchronized with parent currentFloor
  const [selectedLayerId, setSelectedLayerId] = useState<CampusLayerId>(
    floorIdToLayerId(currentFloor)
  );
  const [explodedDistance, setExplodedDistance] = useState<number>(3.0);
  const [showPower, setShowPower] = useState<boolean>(true);
  const [showData, setShowData] = useState<boolean>(true);
  const [showPulses, setShowPulses] = useState<boolean>(true);

  // Camera View Presets
  const [viewPreset, setViewPreset] = useState<ViewPreset3D>("iso");
  const [overlayTags, setOverlayTags] = useState<{
    id: string;
    title: string;
    status: string;
    x: number;
    y: number;
    isIncident: boolean;
  }[]>([]);

  // Selected Entity Vector & Topology Edge Metadata
  const [selectedVectorInfo, setSelectedVectorInfo] = useState<{
    name: string;
    id: string;
    code: string;
    layerTitle: string;
    department: string;
    criticality: string;
    standardLoadKW: number;
    dx: number;
    dy: number;
    dz: number;
    dist: number;
    edge: string;
    status: string;
  } | null>(null);

  useEffect(() => {
    if (!selectedEntityId) {
      setSelectedVectorInfo(null);
      return;
    }
    const r = CAMPUS_3D_ROOMS.find(
      (rm) => rm.backendEntityId === selectedEntityId || rm.id === selectedEntityId
    );
    if (r) {
      const fIdx = CAMPUS_3D_LAYERS.findIndex((l) => l.id === r.layerId);
      const targetY = CAMPUS_3D_LAYERS[fIdx]?.elevationY || 0;
      const subX = -11;
      const subY = 1.2;
      const subZ = -4.5;
      const dx = r.position[0] - subX;
      const dy = targetY + r.position[1] - subY;
      const dz = r.position[2] - subZ;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      let edgePath = "11kV SUB-01 ──▶ FEEDER-F1 ──▶ LV-BUS ──▶ " + r.id;
      if (r.id.startsWith("CR-")) {
        edgePath = "11kV SUB-01 ──▶ FEEDER-F1 (ACAD) ──▶ DIST-PANEL-L2 ──▶ " + r.name;
      } else if (r.id.startsWith("LAB-") || r.id.startsWith("EE-")) {
        edgePath = "11kV SUB-01 ──▶ FEEDER-F2 (LABS) ──▶ RCD-PANEL-L1 ──▶ " + r.name;
      } else if (r.id.startsWith("SRV-") || r.id.startsWith("CTR-")) {
        edgePath = "11kV SUB-01 ──▶ UPS-01 (DUAL TIE) ──▶ PDU-RACK-L3 ──▶ " + r.name;
      }

      setSelectedVectorInfo({
        name: r.name,
        id: r.id,
        code: r.code || r.id,
        layerTitle: CAMPUS_3D_LAYERS[fIdx]?.title || "Campus Asset",
        department: r.department || "Core Infrastructure",
        criticality: r.criticality || "STANDARD",
        standardLoadKW: r.standardLoadKW || 8.0,
        dx: Math.round(dx * 10) / 10,
        dy: Math.round(dy * 10) / 10,
        dz: Math.round(dz * 10) / 10,
        dist: Math.round(dist * 10) / 10,
        edge: edgePath,
        status: incidentAffectedIds.has(r.id) ? "SEVERED CASCADE" : "OPERATIONAL",
      });
    } else {
      setSelectedVectorInfo(null);
    }
  }, [selectedEntityId, incidentAffectedIds]);

  // Live SSE Telemetry Connection from Shared FastAPI Backend
  const [liveTelemetry, setLiveTelemetry] = useState<{
    voltage_v?: number;
    active_power_kw?: number;
    current_a?: number;
    temperature_c?: number;
    water_pressure?: number;
    network_latency_ms?: number;
    packet_loss_pct?: number;
    sequence?: number;
    timestamp?: string;
    scenario?: string;
    status?: string;
    entity_id?: string;
    affected_entities?: string[];
  }>({
    voltage_v: 415.0,
    active_power_kw: 142.5,
    current_a: 198.0,
    temperature_c: 23.4,
    water_pressure: 3.42,
    network_latency_ms: 4.8,
    packet_loss_pct: 0.0,
    sequence: 1000,
    timestamp: "",
    scenario: "NORMAL",
    status: "OPERATIONAL",
    entity_id: "FEEDER-LABS-F1",
    affected_entities: [],
  });
  const [isSseConnected, setIsSseConnected] = useState<boolean>(false);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimer: any = null;
    let isMounted = true;

    const connectSse = () => {
      try {
        eventSource = new EventSource("http://127.0.0.1:8000/api/v1/demo/stream");
        eventSource.onopen = () => {
          if (isMounted) setIsSseConnected(true);
        };
        eventSource.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            setIsSseConnected(true);
            setLiveTelemetry((prev) => ({
              ...prev,
              voltage_v: data.voltage_v ?? data.telemetry?.voltage_v ?? prev.voltage_v,
              active_power_kw: data.active_power_kw ?? data.telemetry?.active_power_kw ?? prev.active_power_kw,
              current_a: data.current_a ?? data.telemetry?.current_a ?? prev.current_a,
              temperature_c: data.temperature_c ?? data.telemetry?.temperature_c ?? prev.temperature_c,
              water_pressure: data.water_pressure ?? data.telemetry?.water_pressure ?? prev.water_pressure,
              network_latency_ms: data.network_latency_ms ?? data.telemetry?.network_latency_ms ?? prev.network_latency_ms,
              packet_loss_pct: data.packet_loss_pct ?? data.telemetry?.packet_loss_pct ?? prev.packet_loss_pct,
              sequence: data.sequence ?? prev.sequence,
              timestamp: data.timestamp ?? prev.timestamp,
              scenario: data.scenario ?? data.demo_state ?? prev.scenario,
              status: data.status ?? prev.status,
              entity_id: data.entity_id ?? prev.entity_id,
              affected_entities: data.affected_entities ?? prev.affected_entities,
            }));
          } catch (err) {}
        };
        eventSource.onerror = () => {
          if (isMounted) setIsSseConnected(false);
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          if (isMounted) reconnectTimer = setTimeout(connectSse, 2000);
        };
      } catch (e) {
        console.warn("SSE connection error in CampusCanvas3D:", e);
        if (isMounted) reconnectTimer = setTimeout(connectSse, 3000);
      }
    };

    connectSse();

    return () => {
      isMounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (eventSource) eventSource.close();
    };
  }, []);

  // Synchronize when currentFloor prop changes
  useEffect(() => {
    if (currentFloor) {
      setSelectedLayerId(floorIdToLayerId(currentFloor));
    }
  }, [currentFloor]);

  const handleSelectLayer = (layerId: CampusLayerId) => {
    setSelectedLayerId(layerId);
    if (onSelectFloor) {
      onSelectFloor(layerIdToFloorId(layerId));
    }
  };

  // Keep ref of latest props/state for animation loop & raycaster
  const stateRef = useRef({
    selectedLayerId,
    explodedDistance,
    showPower,
    showData,
    showPulses,
    incidentAffectedIds,
    selectedEntityId,
    liveTelemetry,
  });

  useEffect(() => {
    stateRef.current = {
      selectedLayerId,
      explodedDistance,
      showPower,
      showData,
      showPulses,
      incidentAffectedIds,
      selectedEntityId,
      liveTelemetry,
    };
  }, [
    selectedLayerId,
    explodedDistance,
    showPower,
    showData,
    showPulses,
    incidentAffectedIds,
    selectedEntityId,
    liveTelemetry,
  ]);

  // Active selected room derived from selectedEntityId
  const selectedRoom = useMemo(() => {
    if (!selectedEntityId) return null;
    return (
      CAMPUS_3D_ROOMS.find(
        (r) => r.backendEntityId === selectedEntityId || r.id === selectedEntityId
      ) || null
    );
  }, [selectedEntityId]);

  // Camera transition target ref for smooth lerping
  const cameraTargetRef = useRef<{
    camPos: THREE.Vector3;
    lookAt: THREE.Vector3;
    isTransitioning: boolean;
  }>({
    camPos: new THREE.Vector3(30, 24, 34),
    lookAt: new THREE.Vector3(0, 5, 0),
    isTransitioning: true,
  });

  // Camera controls ref
  const controlsRef = useRef<OrbitControls | null>(null);

  // Helper to calculate floor elevation with explode offset
  const getFloorY = useCallback(
    (layerId: CampusLayerId, explodeOffset: number) => {
      const idx = CAMPUS_3D_LAYERS.findIndex((l) => l.id === layerId);
      if (idx === -1) return 0;
      return CAMPUS_3D_LAYERS[idx].elevationY + idx * explodeOffset;
    },
    []
  );

  // Update camera target when preset changes
  useEffect(() => {
    const ct = cameraTargetRef.current;
    ct.isTransitioning = true;
    switch (viewPreset) {
      case "top":
        ct.camPos.set(0, 46, 0.01);
        ct.lookAt.set(0, 5, 0);
        break;
      case "front":
        ct.camPos.set(0, 10, 42);
        ct.lookAt.set(0, 7, 0);
        break;
      case "side":
        ct.camPos.set(-42, 10, 0);
        ct.lookAt.set(0, 7, 0);
        break;
      case "iso":
      default:
        ct.camPos.set(30, 24, 34);
        ct.lookAt.set(0, 5, 0);
        break;
    }
  }, [viewPreset]);

  // Update camera target when a room is selected
  useEffect(() => {
    if (selectedRoom) {
      const floorY = getFloorY(selectedRoom.layerId, explodedDistance);
      const roomCenter = new THREE.Vector3(
        selectedRoom.position[0],
        floorY + selectedRoom.position[1],
        selectedRoom.position[2]
      );
      cameraTargetRef.current.lookAt.copy(roomCenter);
      cameraTargetRef.current.camPos.set(
        roomCenter.x + 10,
        roomCenter.y + 8,
        roomCenter.z + 11
      );
      cameraTargetRef.current.isTransitioning = true;
    }
  }, [selectedRoom, explodedDistance, getFloorY]);

  // Main Three.js Scene Setup & Render Loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene & Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e0f12);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 200);
    camera.position.set(30, 24, 34);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 2. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Do not go below ground plane
    controls.minDistance = 6;
    controls.maxDistance = 110;
    controls.target.set(0, 5, 0);
    controlsRef.current = controls;

    // 3. Lighting Rig
    scene.add(new THREE.HemisphereLight(0x9d8eb5, 0x0e0f12, 0.9));

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.6);
    dirLight1.position.set(25, 35, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xd4af37, 1.2);
    dirLight2.position.set(-25, 20, -20);
    scene.add(dirLight2);

    const ambientLight = new THREE.AmbientLight(0x2d2a38, 0.7);
    scene.add(ambientLight);

    // 4. Structural Floor Slabs & Rooms Graph Hierarchy
    const campusRoot = new THREE.Group();
    scene.add(campusRoot);

    // Structural columns coordinates
    const colXs = [-15, -7.5, 0, 7.5, 15];
    const colZs = [-8, 0, 8];

    // Floor groups map: layerId -> THREE.Group
    const floorGroups = new Map<CampusLayerId, THREE.Group>();
    const roomMeshes: {
      room: Room3DSpec;
      fillMesh: THREE.Mesh;
      edgeLines: THREE.LineSegments;
      group: THREE.Group;
    }[] = [];
    const furnitureMeshes: {
      id: string;
      label: string;
      type: string;
      roomId: string;
      fillMesh: THREE.Mesh;
      edgeLines: THREE.LineSegments;
      group: THREE.Group;
    }[] = [];

    CAMPUS_3D_LAYERS.forEach((layer, idx) => {
      const fGroup = new THREE.Group();
      fGroup.name = layer.id;
      campusRoot.add(fGroup);
      floorGroups.set(layer.id, fGroup);

      // Floor Slab (34m x 0.25m x 19m)
      const slabGeom = new THREE.BoxGeometry(34, 0.25, 19);
      const slabMat = new THREE.MeshBasicMaterial({
        color: 0x14151a,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      });
      const slabMesh = new THREE.Mesh(slabGeom, slabMat);
      slabMesh.position.set(0, 0.125, 0);
      fGroup.add(slabMesh);

      // Slab Wireframe Outline
      const slabEdgesGeom = new THREE.EdgesGeometry(slabGeom);
      const slabEdgesMat = new THREE.LineBasicMaterial({
        color: 0x9d8eb5,
        transparent: true,
        opacity: 0.65,
      });
      const slabEdges = new THREE.LineSegments(slabEdgesGeom, slabEdgesMat);
      slabEdges.position.copy(slabMesh.position);
      fGroup.add(slabEdges);

      // Perimeter Columns for this floor
      colXs.forEach((cx) => {
        colZs.forEach((cz) => {
          const colGeom = new THREE.BoxGeometry(0.35, 3.6, 0.35);
          const colEdgesGeom = new THREE.EdgesGeometry(colGeom);
          const colEdges = new THREE.LineSegments(
            colEdgesGeom,
            new THREE.LineBasicMaterial({
              color: 0x5a5565,
              transparent: true,
              opacity: 0.35,
            })
          );
          colEdges.position.set(cx, 1.8, cz);
          fGroup.add(colEdges);
        });
      });

      // Central Corridor on Floor 1 & Floor 2
      if (layer.id === "floor1" || layer.id === "floor2") {
        const wallNorth = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(22, 3.2, 0.15)),
          new THREE.LineBasicMaterial({ color: 0x5a5565, transparent: true, opacity: 0.25 })
        );
        wallNorth.position.set(-4, 1.6, 1.2);
        fGroup.add(wallNorth);

        const wallSouth = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(22, 3.2, 0.15)),
          new THREE.LineBasicMaterial({ color: 0x5a5565, transparent: true, opacity: 0.25 })
        );
        wallSouth.position.set(-4, 1.6, -1.2);
        fGroup.add(wallSouth);
      }

      // Rooms on this Floor
      const layerRooms = CAMPUS_3D_ROOMS.filter((r) => r.layerId === layer.id);
      layerRooms.forEach((room) => {
        const roomGroup = new THREE.Group();
        roomGroup.position.set(...room.position);
        fGroup.add(roomGroup);

        const boxGeom = new THREE.BoxGeometry(
          room.dimensions.width,
          room.dimensions.height,
          room.dimensions.depth
        );

        // Fill Mesh (with userData for Raycasting)
        const fillMat = new THREE.MeshBasicMaterial({
          color: 0x14151a,
          transparent: true,
          opacity: 0.2,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        const fillMesh = new THREE.Mesh(boxGeom, fillMat);
        fillMesh.userData = { roomId: room.id, backendEntityId: room.backendEntityId, type: "ROOM" };
        roomGroup.add(fillMesh);

        // Edge Lines
        const edgesGeom = new THREE.EdgesGeometry(boxGeom);
        const edgeMat = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.85,
        });
        const edgeLines = new THREE.LineSegments(edgesGeom, edgeMat);
        roomGroup.add(edgeLines);

        // Room Furniture / Interior Equipment wireframes & selectable sub-items
        addRoomFurniture(roomGroup, room.id);

        roomMeshes.push({ room, fillMesh, edgeLines, group: roomGroup });
      });
    });

    // Helper: Build Interior CAD Furniture / Equipment for each room with selectable sub-meshes
    function addSelectableItem(
      parent: THREE.Group,
      id: string,
      label: string,
      type: string,
      roomId: string,
      geom: THREE.BufferGeometry,
      pos: [number, number, number],
      color: number = 0x9d8eb5
    ) {
      const group = new THREE.Group();
      group.position.set(...pos);
      parent.add(group);

      const fillMat = new THREE.MeshBasicMaterial({
        color: 0x191b22,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      });
      const fillMesh = new THREE.Mesh(geom, fillMat);
      fillMesh.userData = { assetId: id, label, type, roomId, backendEntityId: id };
      group.add(fillMesh);

      const edgeLines = new THREE.LineSegments(
        new THREE.EdgesGeometry(geom),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.75 })
      );
      group.add(edgeLines);

      furnitureMeshes.push({ id, label, type, roomId, fillMesh, edgeLines, group });
    }

    function addRoomFurniture(parent: THREE.Group, roomId: string) {
      if (roomId.startsWith("CR-")) {
        // --- CLASSROOMS CR-101 to CR-104 ---
        // Instructor Smart Podium at front
        addSelectableItem(
          parent,
          `${roomId}-PODIUM`,
          "Instructor Multimedia Podium",
          "PODIUM",
          roomId,
          new THREE.BoxGeometry(1.8, 1.0, 0.8),
          [0, -0.9, -2.4],
          0xd4af37
        );
        // Smartboard / Blackboard on wall
        addSelectableItem(
          parent,
          `${roomId}-SMARTBOARD`,
          "85-inch UHD Interactive Smartboard",
          "SMARTBOARD",
          roomId,
          new THREE.BoxGeometry(4.5, 1.6, 0.08),
          [0, 0.2, -3.45],
          0xf5d061
        );
        // Ceiling Projector Unit
        addSelectableItem(
          parent,
          `${roomId}-PROJECTOR`,
          "Ceiling 4K Laser Projector Unit",
          "PROJECTOR",
          roomId,
          new THREE.BoxGeometry(0.6, 0.25, 0.6),
          [0, 1.3, -0.5],
          0x9d8eb5
        );

        // 3 rows x 3 columns of Student Desks with Table Legs & Dual Chairs
        const rows = [-1.8, 0.2, 2.2];
        const cols = [-2.8, 0, 2.8];
        const isComputerLab = roomId === "CR-103" || roomId === "CR-104";

        let deskCount = 1;
        rows.forEach((z) => {
          cols.forEach((x) => {
            const deskGroup = new THREE.Group();
            deskGroup.position.set(x, -0.9, z);
            parent.add(deskGroup);

            // Tabletop
            addSelectableItem(
              deskGroup,
              `${roomId}-DESK-0${deskCount}`,
              `Student Study Bench 0${deskCount}`,
              "FURNITURE",
              roomId,
              new THREE.BoxGeometry(1.8, 0.08, 0.7),
              [0, 0.35, 0],
              0x9d8eb5
            );

            // Table legs
            const legLeft = new THREE.LineSegments(
              new THREE.EdgesGeometry(new THREE.BoxGeometry(0.08, 0.7, 0.6)),
              new THREE.LineBasicMaterial({ color: 0x5a5565, transparent: true, opacity: 0.4 })
            );
            legLeft.position.set(-0.8, -0.05, 0);
            deskGroup.add(legLeft);

            const legRight = new THREE.LineSegments(
              new THREE.EdgesGeometry(new THREE.BoxGeometry(0.08, 0.7, 0.6)),
              new THREE.LineBasicMaterial({ color: 0x5a5565, transparent: true, opacity: 0.4 })
            );
            legRight.position.set(0.8, -0.05, 0);
            deskGroup.add(legRight);

            // Dual Chairs per desk
            const chairLeft = new THREE.LineSegments(
              new THREE.EdgesGeometry(new THREE.BoxGeometry(0.45, 0.6, 0.45)),
              new THREE.LineBasicMaterial({ color: 0x9d8eb5, transparent: true, opacity: 0.35 })
            );
            chairLeft.position.set(-0.45, -0.05, 0.55);
            deskGroup.add(chairLeft);

            const chairRight = new THREE.LineSegments(
              new THREE.EdgesGeometry(new THREE.BoxGeometry(0.45, 0.6, 0.45)),
              new THREE.LineBasicMaterial({ color: 0x9d8eb5, transparent: true, opacity: 0.35 })
            );
            chairRight.position.set(0.45, -0.05, 0.55);
            deskGroup.add(chairRight);

            // Computer monitors for computer labs
            if (isComputerLab) {
              const mon1 = new THREE.LineSegments(
                new THREE.EdgesGeometry(new THREE.BoxGeometry(0.55, 0.35, 0.06)),
                new THREE.LineBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.5 })
              );
              mon1.position.set(-0.45, 0.65, 0.05);
              deskGroup.add(mon1);

              const mon2 = new THREE.LineSegments(
                new THREE.EdgesGeometry(new THREE.BoxGeometry(0.55, 0.35, 0.06)),
                new THREE.LineBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.5 })
              );
              mon2.position.set(0.45, 0.65, 0.05);
              deskGroup.add(mon2);
            }

            deskCount++;
          });
        });
      } else if (roomId === "SUB-01") {
        // --- SUBSTATION (Transformers with Bushings & Cooling Radiator Fins) ---
        // Transformer T1 (750kVA)
        const t1Group = new THREE.Group();
        t1Group.position.set(-2.8, -0.5, 0);
        parent.add(t1Group);
        addSelectableItem(
          t1Group,
          "SUB-01-TX-01",
          "750kVA Primary Substation Transformer 1",
          "TRANSFORMER",
          roomId,
          new THREE.BoxGeometry(2.8, 2.2, 2.2),
          [0, 0, 0],
          0xd4af37
        );
        // Bushings
        [-0.7, 0, 0.7].forEach((bx) => {
          const b = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(0.2, 0.7, 0.2)),
            new THREE.LineBasicMaterial({ color: 0xf5d061, transparent: true, opacity: 0.6 })
          );
          b.position.set(bx, 1.4, 0);
          t1Group.add(b);
        });
        // Radiator Fins
        const fin1 = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(0.4, 1.8, 1.8)),
          new THREE.LineBasicMaterial({ color: 0x9d8eb5, transparent: true, opacity: 0.5 })
        );
        fin1.position.set(1.6, 0, 0);
        t1Group.add(fin1);

        // Transformer T2 (750kVA)
        const t2Group = new THREE.Group();
        t2Group.position.set(2.8, -0.5, 0);
        parent.add(t2Group);
        addSelectableItem(
          t2Group,
          "SUB-01-TX-02",
          "750kVA Standby Substation Transformer 2",
          "TRANSFORMER",
          roomId,
          new THREE.BoxGeometry(2.8, 2.2, 2.2),
          [0, 0, 0],
          0xd4af37
        );
        [-0.7, 0, 0.7].forEach((bx) => {
          const b = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(0.2, 0.7, 0.2)),
            new THREE.LineBasicMaterial({ color: 0xf5d061, transparent: true, opacity: 0.6 })
          );
          b.position.set(bx, 1.4, 0);
          t2Group.add(b);
        });
        const fin2 = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(0.4, 1.8, 1.8)),
          new THREE.LineBasicMaterial({ color: 0x9d8eb5, transparent: true, opacity: 0.5 })
        );
        fin2.position.set(-1.6, 0, 0);
        t2Group.add(fin2);

        // 11kV Switchgear & Breaker Cabinets
        addSelectableItem(
          parent,
          "SUB-01-SWG-01",
          "11kV Vacuum Circuit Breaker Switchgear",
          "DISTRIBUTION_PANEL",
          roomId,
          new THREE.BoxGeometry(8.0, 2.4, 1.0),
          [0, -0.3, -2.6],
          0xd4af37
        );
        // Bus duct trunking overhead
        const busDuct = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(8.5, 0.3, 0.5)),
          new THREE.LineBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.5 })
        );
        busDuct.position.set(0, 1.3, 0);
        parent.add(busDuct);
      } else if (roomId === "UPS-01") {
        // --- UPS & BATTERY ROOM ---
        // Inverter Racks
        addSelectableItem(
          parent,
          "UPS-01-INV-01",
          "200kVA Primary UPS Inverter Rack",
          "UPS",
          roomId,
          new THREE.BoxGeometry(1.2, 2.2, 1.8),
          [-1.5, -0.4, 0],
          0xd4af37
        );
        addSelectableItem(
          parent,
          "UPS-01-INV-02",
          "200kVA Standby UPS Inverter Rack",
          "UPS",
          roomId,
          new THREE.BoxGeometry(1.2, 2.2, 1.8),
          [0, -0.4, 0],
          0xd4af37
        );
        // Battery Racks along rear wall
        addSelectableItem(
          parent,
          "UPS-01-BAT-01",
          "Lithium Battery Bank Bank 1",
          "UPS",
          roomId,
          new THREE.BoxGeometry(1.0, 2.0, 2.4),
          [1.8, -0.5, -1.8],
          0xd4af37
        );
        addSelectableItem(
          parent,
          "UPS-01-BAT-02",
          "Lithium Battery Bank Bank 2",
          "UPS",
          roomId,
          new THREE.BoxGeometry(1.0, 2.0, 2.4),
          [1.8, -0.5, 1.8],
          0xd4af37
        );
        // FM-200 Fire Suppression Cylinder
        const fireCyl = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(0.5, 1.6, 0.5)),
          new THREE.LineBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.6 })
        );
        fireCyl.position.set(-2.2, -0.7, -2.5);
        parent.add(fireCyl);
      } else if (roomId === "SRV-01") {
        // --- SERVER ROOM (8 Cabinets, In-Row Chiller, Cable Ladders) ---
        const racksCol1 = [-2.2, -0.8, 0.6, 2.0];
        let rackNum = 1;
        racksCol1.forEach((x) => {
          [-1.5, 1.5].forEach((z) => {
            addSelectableItem(
              parent,
              `SRV-01-RACK-0${rackNum}`,
              `HPC Server Rack 0${rackNum}`,
              "SERVER_RACK",
              roomId,
              new THREE.BoxGeometry(1.1, 2.4, 1.1),
              [x, -0.3, z],
              0x9d8eb5
            );
            rackNum++;
          });
        });
        // In-row precision chiller
        addSelectableItem(
          parent,
          "SRV-01-CHILLER",
          "In-Row Precision Chiller CRAC",
          "CHILLER",
          roomId,
          new THREE.BoxGeometry(0.8, 2.4, 1.4),
          [-3.2, -0.3, 0],
          0x38bdf8
        );
        // Core optical fiber switch
        addSelectableItem(
          parent,
          "SW-MDF-CORE",
          "Campus Core Optical Switch MDF",
          "NETWORK_SWITCH",
          roomId,
          new THREE.BoxGeometry(2.0, 0.6, 0.7),
          [0, 1.2, -2.6],
          0xd4af37
        );
        // Cable Ladders
        const ladder1 = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(6.5, 0.15, 0.6)),
          new THREE.LineBasicMaterial({ color: 0x9d8eb5, transparent: true, opacity: 0.4 })
        );
        ladder1.position.set(0, 1.2, -1.5);
        parent.add(ladder1);
      } else if (roomId === "BUS-01") {
        // --- BUS BAY (EV Charging Pedestals & Bus Silhouettes) ---
        [-9, -3, 3, 9].forEach((x, idx) => {
          addSelectableItem(
            parent,
            `BUS-01-CHG-0${idx + 1}`,
            `150kW Fast EV Charging Pedestal ${idx + 1}`,
            "DISTRIBUTION_PANEL",
            roomId,
            new THREE.BoxGeometry(0.6, 1.8, 0.5),
            [x, -0.6, -2.5],
            0xd4af37
          );
        });
        [-6, 6].forEach((x, idx) => {
          const busGroup = new THREE.Group();
          busGroup.position.set(x, -0.6, 1.0);
          parent.add(busGroup);
          addSelectableItem(
            busGroup,
            `BUS-EV-0${idx + 1}`,
            `Campus Electric Shuttle Bus ${idx + 1}`,
            "WORKSTATION",
            roomId,
            new THREE.BoxGeometry(8.5, 2.1, 2.6),
            [0, 0, 0],
            0x9d8eb5
          );
        });
      } else if (roomId === "VLSI-201") {
        // --- VLSI CLEAN-PREP LAB ---
        // Air Shower Cubicle
        addSelectableItem(
          parent,
          "VLSI-201-AIR-SHOWER",
          "Cleanroom Air Shower Interlock Cubicle",
          "WORKSTATION",
          roomId,
          new THREE.BoxGeometry(2.0, 2.5, 1.8),
          [-3.2, -0.3, -2.4],
          0x38bdf8
        );
        // 4 ESD Workstation Islands with Dual CAD Monitors & Logic Analyzers
        [-1, 2.2].forEach((x, i) => {
          [-1.2, 1.5].forEach((z, j) => {
            addSelectableItem(
              parent,
              `VLSI-201-BENCH-${i * 2 + j + 1}`,
              `ESD Microelectronics Workstation ${i * 2 + j + 1}`,
              "WORKSTATION",
              roomId,
              new THREE.BoxGeometry(2.4, 0.8, 1.2),
              [x, -0.6, z],
              0xd4af37
            );
          });
        });
      } else if (roomId === "ROB-202") {
        // --- ROBOTICS & AUTONOMOUS SYSTEMS LAB ---
        // Industrial 6-Axis Robot Arms
        [-1.8, 1.8].forEach((rx, idx) => {
          const armGroup = new THREE.Group();
          armGroup.position.set(rx, -0.5, 0);
          parent.add(armGroup);
          addSelectableItem(
            armGroup,
            `ROB-202-ARM-0${idx + 1}`,
            `Industrial 6-Axis Robotic Arm ${idx + 1}`,
            "WORKSTATION",
            roomId,
            new THREE.BoxGeometry(1.2, 0.8, 1.2),
            [0, 0, 0],
            0xd4af37
          );
          // Arm links
          const armLink = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(0.4, 1.0, 0.4)),
            new THREE.LineBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.6 })
          );
          armLink.position.set(0, 0.8, 0);
          armGroup.add(armLink);
        });
        // Protective Interlock Safety Cage
        addSelectableItem(
          parent,
          "ROB-202-CAGE",
          "Robotic Arm Safety Interlock Enclosure",
          "WORKSTATION",
          roomId,
          new THREE.BoxGeometry(6.5, 2.2, 3.5),
          [0, 0, 0],
          0xd4af37
        );
        // Optical MoCap Gantry Frame
        const mocap = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(7.2, 0.2, 4.2)),
          new THREE.LineBasicMaterial({ color: 0x9d8eb5, transparent: true, opacity: 0.4 })
        );
        mocap.position.set(0, 1.2, 0);
        parent.add(mocap);
      } else if (roomId === "HV-203") {
        // --- HIGH-VOLTAGE POWER SYSTEMS LAB ---
        // Marx Impulse Generator Multi-Stage Tower
        addSelectableItem(
          parent,
          "HV-203-MARX-TOWER",
          "Marx Impulse Voltage Generator Tower",
          "TRANSFORMER",
          roomId,
          new THREE.BoxGeometry(1.6, 2.6, 1.6),
          [-2.5, -0.2, 0],
          0xd4af37
        );
        // Faraday Safety Cage Enclosure
        addSelectableItem(
          parent,
          "HV-203-FARADAY-CAGE",
          "Faraday High-Voltage Test Cage",
          "WORKSTATION",
          roomId,
          new THREE.BoxGeometry(3.8, 2.6, 3.8),
          [1.8, -0.2, 0],
          0x9d8eb5
        );
      } else if (roomId === "SEM-204") {
        // --- SEMINAR & AUDITORIUM HALL ---
        // Front Stage Platform
        addSelectableItem(
          parent,
          "SEM-204-STAGE",
          "Main Seminar Auditorium Stage Platform",
          "PODIUM",
          roomId,
          new THREE.BoxGeometry(9.5, 0.5, 1.5),
          [0, -1.1, -2.8],
          0xd4af37
        );
        // Motorized Presentation Screen
        addSelectableItem(
          parent,
          "SEM-204-SCREEN",
          "Motorized 200-inch Presentation Screen",
          "SMARTBOARD",
          roomId,
          new THREE.BoxGeometry(7.0, 2.0, 0.08),
          [0, 0.4, -3.45],
          0xf5d061
        );
        // 4 Tiered Auditorium Seating Benches
        const tierY = [-1.0, -0.6, -0.2, 0.2];
        const tierZ = [-1.8, -0.4, 1.0, 2.4];
        tierY.forEach((y, idx) => {
          addSelectableItem(
            parent,
            `SEM-204-TIER-0${idx + 1}`,
            `Auditorium Tiered Seating Bench Row ${idx + 1}`,
            "FURNITURE",
            roomId,
            new THREE.BoxGeometry(9.8, 0.45, 0.45),
            [0, y + 0.35, tierZ[idx]],
            0x9d8eb5
          );
        });
      } else if (roomId === "ADM-301") {
        // --- DEAN'S OFFICE & COUNCIL ---
        // Executive Conference Table
        addSelectableItem(
          parent,
          "ADM-301-CONF-TABLE",
          "Executive Boardroom Conference Table",
          "FURNITURE",
          roomId,
          new THREE.BoxGeometry(4.8, 0.15, 2.2),
          [0, -0.7, -0.5],
          0xd4af37
        );
        // Dean's Desk in alcove
        addSelectableItem(
          parent,
          "ADM-301-DEAN-DESK",
          "Dean's Executive Mahogany Desk",
          "FURNITURE",
          roomId,
          new THREE.BoxGeometry(2.2, 0.75, 1.1),
          [-3.8, -0.7, 2.0],
          0x9d8eb5
        );
      } else if (roomId === "CTR-302") {
        // --- SCADA NOC CONTROL ROOM ---
        // Curved SCADA Video Wall
        addSelectableItem(
          parent,
          "CTR-302-SCADA",
          "Central Operations Command SCADA Video Wall",
          "WORKSTATION",
          roomId,
          new THREE.BoxGeometry(9.2, 2.2, 0.15),
          [0, 0.2, -3.2],
          0xd4af37
        );
        // Operator Curved Console Desks
        addSelectableItem(
          parent,
          "CTR-302-CONSOLE-WEST",
          "Grid Operations Control Console West",
          "WORKSTATION",
          roomId,
          new THREE.BoxGeometry(3.2, 0.75, 1.2),
          [-2.5, -0.7, 0],
          0x9d8eb5
        );
        addSelectableItem(
          parent,
          "CTR-302-CONSOLE-EAST",
          "Cyber NOC Control Console East",
          "WORKSTATION",
          roomId,
          new THREE.BoxGeometry(3.2, 0.75, 1.2),
          [2.5, -0.7, 0],
          0x9d8eb5
        );
      } else if (roomId === "RF-303") {
        // --- ROOFTOP SOLAR PV ARRAYS & TELECOM LATTICE MAST ---
        // 6 Banks of Tilted Solar PV Panels
        const panelXs = [-10, -6, -2, 2, 6, 10];
        panelXs.forEach((px, pIdx) => {
          const pvGroup = new THREE.Group();
          pvGroup.position.set(px, 0.2, 0);
          pvGroup.rotation.set(-0.35, 0, 0);
          parent.add(pvGroup);

          addSelectableItem(
            pvGroup,
            `RF-303-SOLAR-BANK-0${pIdx + 1}`,
            `50kW Rooftop Bifacial Solar PV Array ${pIdx + 1}`,
            "GENERATOR",
            roomId,
            new THREE.BoxGeometry(3.2, 0.08, 3.8),
            [0, 0, 0],
            0xd4af37
          );
          // Subdivided cell grid
          const cellGrid = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(3.0, 0.02, 3.6)),
            new THREE.LineBasicMaterial({ color: 0xf5d061, transparent: true, opacity: 0.8 })
          );
          cellGrid.position.set(0, 0.05, 0);
          pvGroup.add(cellGrid);
        });

        // Telecom / Microwave Lattice Mast with 5G MIMO & Lightning Arrestor
        const mastGroup = new THREE.Group();
        mastGroup.position.set(0, 2.2, -2.0);
        parent.add(mastGroup);

        addSelectableItem(
          mastGroup,
          "RF-303-TELECOM-MAST",
          "Campus 5G Core & Microwave Telecom Lattice Mast",
          "NETWORK_SWITCH",
          roomId,
          new THREE.BoxGeometry(1.2, 4.4, 1.2),
          [0, 0, 0],
          0x9d8eb5
        );
        // Top crossarm
        const crossArm = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(2.2, 0.2, 0.4)),
          new THREE.LineBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.6 })
        );
        crossArm.position.set(0, 2.2, 0);
        mastGroup.add(crossArm);
        // Microwave Drum Antenna
        const drum = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(0.7, 0.7, 0.4)),
          new THREE.LineBasicMaterial({ color: 0xf5d061, transparent: true, opacity: 0.7 })
        );
        drum.position.set(-0.9, 1.5, 0.4);
        mastGroup.add(drum);
        // Lightning arrestor rod
        const rod = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(0.08, 0.8, 0.08)),
          new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
        );
        rod.position.set(0, 2.6, 0);
        mastGroup.add(rod);
      }
    }

    // 5. Utility Conduits & Pulse Particles
    const conduitsGroup = new THREE.Group();
    campusRoot.add(conduitsGroup);

    // Vertical Riser Shafts Enclosures
    const riserWest = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(0.9, 12, 0.9)),
      new THREE.LineBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.4 })
    );
    riserWest.position.set(-4.5, 6, 0);
    conduitsGroup.add(riserWest);

    const riserEast = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(0.9, 12, 0.9)),
      new THREE.LineBasicMaterial({ color: 0x9d8eb5, transparent: true, opacity: 0.4 })
    );
    riserEast.position.set(4.5, 6, 0);
    conduitsGroup.add(riserEast);

    // Pulse spheres for animated signal flow along conduits
    const pulseSpheresGroup = new THREE.Group();
    campusRoot.add(pulseSpheresGroup);

    interface BuiltConduit {
      conduit: (typeof CAMPUS_3D_CONDUITS)[0];
      lineMesh: THREE.Line;
      curve: THREE.CatmullRomCurve3;
      pulseMeshes: THREE.Mesh[];
    }
    const builtConduits: BuiltConduit[] = [];

    CAMPUS_3D_CONDUITS.forEach((conduit) => {
      const isPower = conduit.type === "POWER";
      const geom = new THREE.BufferGeometry();
      const lineMat = new THREE.LineBasicMaterial({
        color: isPower ? 0xd4af37 : 0x9d8eb5,
        transparent: true,
        opacity: isPower ? 0.9 : 0.75,
        linewidth: 2,
      });
      const lineMesh = new THREE.Line(geom, lineMat);
      conduitsGroup.add(lineMesh);

      // Two pulse spheres per conduit
      const p1 = new THREE.Mesh(
        new THREE.SphereGeometry(isPower ? 0.16 : 0.12, 8, 8),
        new THREE.MeshBasicMaterial({
          color: isPower ? 0xf5d061 : 0xbdb0d3,
          transparent: true,
          opacity: 0.95,
        })
      );
      const p2 = new THREE.Mesh(
        new THREE.SphereGeometry(isPower ? 0.16 : 0.12, 8, 8),
        new THREE.MeshBasicMaterial({
          color: isPower ? 0xf5d061 : 0xbdb0d3,
          transparent: true,
          opacity: 0.95,
        })
      );
      pulseSpheresGroup.add(p1);
      pulseSpheresGroup.add(p2);

      // Initial dummy curve; will be updated with exploded positions
      const dummyCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 1, 0),
      ]);

      builtConduits.push({
        conduit,
        lineMesh,
        curve: dummyCurve,
        pulseMeshes: [p1, p2],
      });
    });

    // 5b. Selected Entity Flow Graph Connection Dot Matrix & Vector
    const selectedVectorGroup = new THREE.Group();
    campusRoot.add(selectedVectorGroup);

    // Glowing Vector Line between Substation and Selected Room
    const vectorLineGeom = new THREE.BufferGeometry();
    const vectorLineMat = new THREE.LineBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.9,
      linewidth: 3,
    });
    const vectorLineMesh = new THREE.Line(vectorLineGeom, vectorLineMat);
    selectedVectorGroup.add(vectorLineMesh);

    // Dot Matrix Particle Flow along the Vector (24 dots)
    const dotCount = 24;
    const dotPositions = new Float32Array(dotCount * 3);
    const dotGeom = new THREE.BufferGeometry();
    dotGeom.setAttribute("position", new THREE.BufferAttribute(dotPositions, 3));
    const dotMat = new THREE.PointsMaterial({
      color: 0xf5d061,
      size: 0.35,
      transparent: true,
      opacity: 0.95,
    });
    const dotParticles = new THREE.Points(dotGeom, dotMat);
    selectedVectorGroup.add(dotParticles);

    // Bounding Box Highlight with Corner Matrix Nodes for Selected Entity
    const boxGeom = new THREE.BoxGeometry(1, 1, 1);
    const boxEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(boxGeom),
      new THREE.LineBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.95, linewidth: 2 })
    );
    selectedVectorGroup.add(boxEdges);

    // 8 Corner Vertex Nodes
    const cornerDotsGeom = new THREE.BufferGeometry();
    const cornerDotsPositions = new Float32Array(8 * 3);
    cornerDotsGeom.setAttribute("position", new THREE.BufferAttribute(cornerDotsPositions, 3));
    const cornerDotsMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.45,
      transparent: true,
      opacity: 1.0,
    });
    const cornerDots = new THREE.Points(cornerDotsGeom, cornerDotsMat);
    selectedVectorGroup.add(cornerDots);

    // 6. Raycasting Setup for Room & Furniture Hover & Click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredMesh: THREE.Mesh | null = null;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const interactiveTargets = [
        ...furnitureMeshes.map((fm) => fm.fillMesh),
        ...roomMeshes.map((rm) => rm.fillMesh),
      ];
      const intersects = raycaster.intersectObjects(interactiveTargets, false);

      if (intersects.length > 0) {
        container.style.cursor = "pointer";
        hoveredMesh = intersects[0].object as THREE.Mesh;
      } else {
        container.style.cursor = "default";
        hoveredMesh = null;
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const interactiveTargets = [
        ...furnitureMeshes.map((fm) => fm.fillMesh),
        ...roomMeshes.map((rm) => rm.fillMesh),
      ];
      const intersects = raycaster.intersectObjects(interactiveTargets, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const assetId = hit.userData.assetId;
        const roomId = hit.userData.roomId;
        const backendEntityId = hit.userData.backendEntityId;
        if (assetId) {
          onSelectEntity(assetId);
        } else if (backendEntityId) {
          onSelectEntity(backendEntityId);
        } else if (roomId) {
          onSelectEntity(roomId);
        }
      }
    };

    container.addEventListener("mousemove", handlePointerMove);
    container.addEventListener("click", handleClick);

    // 7. Animation Loop
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const current = stateRef.current;

      // 1. Smooth Camera Transition lerping
      const ct = cameraTargetRef.current;
      if (ct.isTransitioning) {
        camera.position.lerp(ct.camPos, 0.06);
        controls.target.lerp(ct.lookAt, 0.06);
        controls.update();

        if (
          camera.position.distanceTo(ct.camPos) < 0.1 &&
          controls.target.distanceTo(ct.lookAt) < 0.1
        ) {
          ct.isTransitioning = false;
        }
      } else {
        controls.update();
      }

      // 2. Update Floor Elevations according to explodedDistance
      CAMPUS_3D_LAYERS.forEach((layer, idx) => {
        const fGroup = floorGroups.get(layer.id);
        if (fGroup) {
          const targetY = layer.elevationY + idx * current.explodedDistance;
          fGroup.position.y = targetY;

          // Dim floors if a single floor is isolated
          const isFloorActive =
            current.selectedLayerId === "all" || current.selectedLayerId === layer.id;
          fGroup.visible = true;

          // Adjust children opacity
          fGroup.children.forEach((c) => {
            if (c instanceof THREE.Mesh) {
              const mat = c.material as THREE.MeshBasicMaterial;
              mat.opacity = isFloorActive ? 0.35 : 0.08;
            }
          });
        }
      });

      // 3. Update Room Visuals (Selection, Hover, Incident Failure)
      roomMeshes.forEach(({ room, fillMesh, edgeLines }) => {
        const isHovered = hoveredMesh === fillMesh;
        const isSelected =
          current.selectedEntityId === room.backendEntityId ||
          current.selectedEntityId === room.id;

        // Check if room or its backend entity is impacted by incident/chaos or live scenario
        const liveScenario = current.liveTelemetry?.scenario || "NORMAL";
        const liveAffected = current.liveTelemetry?.affected_entities || [];
        const isImpacted =
          current.incidentAffectedIds.has(room.id) ||
          (room.backendEntityId ? current.incidentAffectedIds.has(room.backendEntityId) : false) ||
          liveAffected.includes(room.id) ||
          (room.backendEntityId ? liveAffected.includes(room.backendEntityId) : false);

        const fillMat = fillMesh.material as THREE.MeshBasicMaterial;
        const edgeMat = edgeLines.material as THREE.LineBasicMaterial;

        if (isImpacted && (liveScenario !== "NORMAL" || current.incidentAffectedIds.size > 0)) {
          // Dynamic Scenario Pulsing Highlights
          const pulse = 0.5 + 0.5 * Math.sin(elapsed * 6);
          if (liveScenario === "WATER") {
            // Water Supply Disruption: Cyan
            fillMat.color.setHex(0x0c4a6e);
            fillMat.opacity = 0.5;
            edgeMat.color.setHex(0x38bdf8);
            edgeMat.opacity = 0.6 + pulse * 0.4;
          } else if (liveScenario === "HVAC") {
            // HVAC Thermal: Orange / Fire
            fillMat.color.setHex(0x7c2d12);
            fillMat.opacity = 0.5;
            edgeMat.color.setHex(0xf97316);
            edgeMat.opacity = 0.6 + pulse * 0.4;
          } else if (liveScenario === "NETWORK") {
            // Network Outage: Violet / Magenta
            fillMat.color.setHex(0x581c87);
            fillMat.opacity = 0.5;
            edgeMat.color.setHex(0xa855f7);
            edgeMat.opacity = 0.6 + pulse * 0.4;
          } else if (liveScenario === "ACADEMIC") {
            // Academic Disruption: Amber
            fillMat.color.setHex(0x78350f);
            fillMat.opacity = 0.5;
            edgeMat.color.setHex(0xf59e0b);
            edgeMat.opacity = 0.6 + pulse * 0.4;
          } else {
            // Electrical Feeder Failure / Default: Warning Red
            fillMat.color.setHex(0x7f1d1d);
            fillMat.opacity = 0.5;
            edgeMat.color.setHex(0xef4444);
            edgeMat.opacity = 0.6 + pulse * 0.4;
          }
        } else if (isSelected) {
          // High-Res Selected Room: Luminous Gold
          fillMat.color.setHex(0x272433);
          fillMat.opacity = 0.45;
          edgeMat.color.setHex(0xd4af37);
          edgeMat.opacity = 1.0;
        } else if (isHovered) {
          // Hover State
          fillMat.color.setHex(0x1e2029);
          fillMat.opacity = 0.35;
          edgeMat.color.setHex(0xf5d061);
          edgeMat.opacity = 0.95;
        } else {
          // Normal Dormant State
          const isFloorActive =
            current.selectedLayerId === "all" || current.selectedLayerId === room.layerId;
          fillMat.color.setHex(0x14151a);
          fillMat.opacity = isFloorActive ? 0.16 : 0.05;
          edgeMat.color.setHex(room.criticality === "CRITICAL" ? 0xd4af37 : 0xffffff);
          edgeMat.opacity = isFloorActive ? 0.75 : 0.15;
        }
      });

      // 3b. Update Furniture Visuals (Selection & Hover Highlights)
      furnitureMeshes.forEach(({ id, fillMesh, edgeLines }) => {
        const isHovered = hoveredMesh === fillMesh;
        const isSelected = current.selectedEntityId === id;
        const fillMat = fillMesh.material as THREE.MeshBasicMaterial;
        const edgeMat = edgeLines.material as THREE.LineBasicMaterial;
        if (isSelected) {
          fillMat.color.setHex(0xd4af37);
          fillMat.opacity = 0.75;
          edgeMat.color.setHex(0xf5d061);
          edgeMat.opacity = 1.0;
        } else if (isHovered) {
          fillMat.color.setHex(0x3d354a);
          fillMat.opacity = 0.6;
          edgeMat.color.setHex(0xd4af37);
          edgeMat.opacity = 0.9;
        } else {
          fillMat.color.setHex(0x191b22);
          fillMat.opacity = 0.25;
          edgeMat.color.setHex(0x9d8eb5);
          edgeMat.opacity = 0.45;
        }
      });

      // 4. Update Conduits Geometry and Animated Pulses with Exploded Offset
      conduitsGroup.visible = current.showPower || current.showData;
      pulseSpheresGroup.visible = current.showPulses && conduitsGroup.visible;

      // Adjust West and East Riser heights to match exploded total height
      const totalExplodedHeight = 11.4 + current.explodedDistance * 3;
      riserWest.position.y = totalExplodedHeight / 2;
      riserWest.scale.set(1, totalExplodedHeight / 12, 1);
      riserEast.position.y = totalExplodedHeight / 2;
      riserEast.scale.set(1, totalExplodedHeight / 12, 1);

      builtConduits.forEach(({ conduit, lineMesh, pulseMeshes }) => {
        const isPower = conduit.type === "POWER";
        const isData = conduit.type === "DATA";

        // Check toggles
        if ((isPower && !current.showPower) || (isData && !current.showData)) {
          lineMesh.visible = false;
          pulseMeshes.forEach((p) => (p.visible = false));
          return;
        }

        lineMesh.visible = true;

        // Check if this conduit is severed by failure simulation
        const isCut =
          current.incidentAffectedIds.has(conduit.targetRoomId) ||
          (conduit.sourceRoomId === "SUB-01" && current.incidentAffectedIds.has("SUBSTATION-01"));

        const lineMat = lineMesh.material as THREE.LineBasicMaterial;
        lineMat.color.setHex(isCut ? 0x4a4e5c : isPower ? 0xd4af37 : 0x9d8eb5);
        lineMat.opacity = isCut ? 0.2 : isPower ? 0.9 : 0.75;

        // Map conduit raw points to current exploded world coordinates
        const adjustedPoints = conduit.points.map(([x, y, z]) => {
          let adjY = y;
          if (y > 9.0) adjY = y + current.explodedDistance * 3;
          else if (y > 5.0) adjY = y + current.explodedDistance * 2;
          else if (y > 2.0) adjY = y + current.explodedDistance * 1;
          return new THREE.Vector3(x, adjY, z);
        });

        lineMesh.geometry.setFromPoints(adjustedPoints);

        // Update Catmull-Rom curve for pulses
        const curve = new THREE.CatmullRomCurve3(adjustedPoints, false, "catmullrom", 0.05);

        // Pulse particles animation
        if (isCut || !current.showPulses) {
          pulseMeshes.forEach((p) => (p.visible = false));
        } else {
          pulseMeshes.forEach((pMesh, pIdx) => {
            pMesh.visible = true;
            const speed = isData ? 0.32 : 0.22;
            const progress = (elapsed * speed + pIdx * 0.5) % 1.0;
            const pos = curve.getPointAt(progress);
            pMesh.position.copy(pos);
          });
        }
      });

      // 4b. Update Selected Entity Dot Matrix Vector & Edge Wireframe Highlight
      if (current.selectedEntityId) {
        const targetRoom = CAMPUS_3D_ROOMS.find(
          (r) => r.backendEntityId === current.selectedEntityId || r.id === current.selectedEntityId
        );
        if (targetRoom) {
          selectedVectorGroup.visible = true;
          const fIdx = CAMPUS_3D_LAYERS.findIndex((l) => l.id === targetRoom.layerId);
          const roomFloorY =
            targetRoom.layerId === "ground"
              ? 0
              : (CAMPUS_3D_LAYERS[fIdx]?.elevationY || 0) + fIdx * current.explodedDistance;
          const groundFloorY = 0;

          const subPos = new THREE.Vector3(-11, groundFloorY + 1.2, -4.5);
          const roomPos = new THREE.Vector3(
            targetRoom.position[0],
            roomFloorY + targetRoom.position[1],
            targetRoom.position[2]
          );

          // Update Vector Line
          vectorLineGeom.setFromPoints([subPos, roomPos]);

          // Animate Dot Matrix Particle Flow along Vector
          const posAttr = dotGeom.getAttribute("position") as THREE.BufferAttribute;
          for (let i = 0; i < dotCount; i++) {
            const progress = (elapsed * 0.45 + i / dotCount) % 1.0;
            const px = THREE.MathUtils.lerp(subPos.x, roomPos.x, progress);
            const py = THREE.MathUtils.lerp(subPos.y, roomPos.y, progress) + Math.sin(progress * Math.PI) * 1.6;
            const pz = THREE.MathUtils.lerp(subPos.z, roomPos.z, progress);
            posAttr.setXYZ(i, px, py, pz);
          }
          posAttr.needsUpdate = true;

          // Position & Scale Bounding Wireframe Box
          const rWidth = (targetRoom.dimensions?.width || 8.0) * 1.05;
          const rHeight = (targetRoom.dimensions?.height || 2.8) * 1.05;
          const rDepth = (targetRoom.dimensions?.depth || 7.0) * 1.05;

          boxEdges.position.copy(roomPos);
          boxEdges.scale.set(rWidth, rHeight, rDepth);

          // Update 8 Corner Vertex Nodes
          const hw = rWidth / 2;
          const hh = rHeight / 2;
          const hd = rDepth / 2;
          const cAttr = cornerDotsGeom.getAttribute("position") as THREE.BufferAttribute;
          const corners = [
            [-hw, -hh, -hd], [hw, -hh, -hd], [hw, hh, -hd], [-hw, hh, -hd],
            [-hw, -hh, hd], [hw, -hh, hd], [hw, hh, hd], [-hw, hh, hd],
          ];
          corners.forEach(([cx, cy, cz], cIdx) => {
            cAttr.setXYZ(cIdx, roomPos.x + cx, roomPos.y + cy, roomPos.z + cz);
          });
          cAttr.needsUpdate = true;
        } else {
          selectedVectorGroup.visible = false;
        }
      } else {
        selectedVectorGroup.visible = false;
      }

      // 5. Update Screen Space Tracking Overlay Tags
      if (Math.floor(elapsed * 60) % 5 === 0 && container) {
        const rect = container.getBoundingClientRect();
        const tags: {
          id: string;
          title: string;
          status: string;
          x: number;
          y: number;
          isIncident: boolean;
        }[] = [];
        const tempV = new THREE.Vector3();

        if (current.selectedEntityId) {
          const selRoom = CAMPUS_3D_ROOMS.find(
            (r) => r.backendEntityId === current.selectedEntityId || r.id === current.selectedEntityId
          );
          if (selRoom) {
            const fIdx = CAMPUS_3D_LAYERS.findIndex((l) => l.id === selRoom.layerId);
            const fy =
              selRoom.layerId === "ground"
                ? 0
                : (CAMPUS_3D_LAYERS[fIdx]?.elevationY || 0) + fIdx * current.explodedDistance;
            tempV.set(selRoom.position[0], fy + selRoom.position[1] + 2.0, selRoom.position[2]);
            tempV.project(camera);
            if (tempV.z < 1.0) {
              const sx = ((tempV.x + 1) * rect.width) / 2;
              const sy = ((-tempV.y + 1) * rect.height) / 2;
              tags.push({
                id: selRoom.id,
                title: selRoom.name,
                status: current.incidentAffectedIds.has(selRoom.id)
                  ? "CASCADE SEVERED"
                  : "ACTIVE FOCUS",
                x: sx,
                y: sy,
                isIncident: current.incidentAffectedIds.has(selRoom.id),
              });
            }
          }
        }

        current.incidentAffectedIds.forEach((affId) => {
          if (tags.some((t) => t.id === affId)) return;
          const affRoom = CAMPUS_3D_ROOMS.find(
            (r) => r.id === affId || r.backendEntityId === affId
          );
          if (affRoom) {
            const fIdx = CAMPUS_3D_LAYERS.findIndex((l) => l.id === affRoom.layerId);
            const fy =
              (CAMPUS_3D_LAYERS[fIdx]?.elevationY || 0) + fIdx * current.explodedDistance;
            tempV.set(affRoom.position[0], fy + affRoom.position[1] + 2.0, affRoom.position[2]);
            tempV.project(camera);
            if (tempV.z < 1.0) {
              const sx = ((tempV.x + 1) * rect.width) / 2;
              const sy = ((-tempV.y + 1) * rect.height) / 2;
              tags.push({
                id: affRoom.id,
                title: affRoom.name,
                status: "POWER SEVERED",
                x: sx,
                y: sy,
                isIncident: true,
              });
            }
          }
        });

        setOverlayTags(tags);
      }

      renderer.render(scene, camera);
    };

    animationId = requestAnimationFrame(animate);

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handlePointerMove);
      container.removeEventListener("click", handleClick);
      controls.dispose();
      renderer.dispose();
    };
  }, [onSelectEntity]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0E0F12] select-none flex flex-col">
      {/* 1. THREE.JS VIEWPORT CONTAINER */}
      <div ref={containerRef} className="w-full h-full relative" />

      {/* 2. CAMERA VIEW PRESETS (COMPACT TOP-RIGHT EDGE CONTROLS) */}
      <div className="absolute top-3 right-3 flex items-center space-x-1.5 p-1 rounded-lg bg-[#14151A]/90 border border-[#252833] backdrop-blur-md pointer-events-auto shadow-xl z-10">
        <button
          onClick={() => setViewPreset("iso")}
          className={`px-2 py-1 text-xs font-mono rounded transition-all ${
            viewPreset === "iso"
              ? "bg-[#D4AF37] text-[#121316] font-bold"
              : "text-[#8A8594] hover:text-[#FFFFFF]"
          }`}
          title="Isometric 3D Vantage"
        >
          ISO
        </button>
        <button
          onClick={() => setViewPreset("top")}
          className={`px-2 py-1 text-xs font-mono rounded transition-all ${
            viewPreset === "top"
              ? "bg-[#D4AF37] text-[#121316] font-bold"
              : "text-[#8A8594] hover:text-[#FFFFFF]"
          }`}
          title="Orthographic Top-Down View"
        >
          TOP
        </button>
        <button
          onClick={() => setViewPreset("front")}
          className={`px-2 py-1 text-xs font-mono rounded transition-all ${
            viewPreset === "front"
              ? "bg-[#D4AF37] text-[#121316] font-bold"
              : "text-[#8A8594] hover:text-[#FFFFFF]"
          }`}
          title="Front Elevation"
        >
          FRONT
        </button>
      </div>

      {/* 3. COMPACT CLASSROOM / ENTITY INFO WINDOW (REDUCED MINIMAL FLOATING CARD) */}
      {selectedVectorInfo && (
        <div className="absolute top-14 right-4 z-20 w-[310px] max-w-[90vw] p-3 rounded-xl bg-[#0E0F14]/95 border border-[#252833] backdrop-blur-md shadow-2xl font-mono text-xs pointer-events-auto select-none animate-fadeIn">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-1.5 border-b border-[#1E212B]">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-[#312816] text-[#F5D061] border border-[#D4AF37]/40">
                {selectedVectorInfo.id}
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                  selectedVectorInfo.status === "OPERATIONAL"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40"
                    : "bg-red-500/15 text-red-400 border border-red-500/40 animate-pulse"
                }`}
              >
                ● {selectedVectorInfo.status}
              </span>
            </div>
            <button
              onClick={() => onSelectEntity("")}
              className="text-[#8A8594] hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
              title="Close window"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Room Name & Spatial Location */}
          <div className="mt-1.5">
            <h3 className="text-xs font-bold text-white leading-tight truncate">
              {selectedVectorInfo.name}
            </h3>
            <p className="text-[10px] text-[#8E8B99] mt-0.5 truncate">
              {selectedVectorInfo.layerTitle} • {selectedVectorInfo.department}
            </p>
          </div>

          {/* Dynamic Flow Graph with Synthetic Data Flow */}
          <div className="my-2 p-2 rounded-lg bg-[#07080B] border border-[#1E212B]">
            <div className="flex items-center justify-between text-[9px] text-[#8E8B99] mb-1.5">
              <span className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <strong className="text-white uppercase tracking-wider text-[8.5px]">Energy & Data Flow</strong>
              </span>
              <span className="text-[8.5px] px-1 py-0.2 rounded bg-[#D4AF37]/20 text-[#F5D061] font-bold border border-[#D4AF37]/30">
                SYNTHETIC LIVE
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-center px-1.5 py-1 rounded bg-[#14151C] border border-[#252836]">
                <div className="text-[8.5px] text-[#F5D061] font-bold">11kV SUB</div>
                <div className="text-[7.5px] text-[#8E8B99]">415V Grid</div>
              </div>

              <div className="flex-1 mx-1 relative flex items-center justify-center">
                <div className="w-full h-0.5 bg-[#252836] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F5D061] to-transparent animate-pulse" />
                </div>
                <Zap className="w-2.5 h-2.5 text-[#F5D061] mx-0.5 shrink-0" />
              </div>

              <div className="text-center px-1.5 py-1 rounded bg-[#14151C] border border-[#252836]">
                <div className="text-[8.5px] text-amber-300 font-bold">FEEDER-F1</div>
                <div className="text-[7.5px] text-[#8E8B99]">Dist Bus</div>
              </div>

              <div className="flex-1 mx-1 relative flex items-center justify-center">
                <div className="w-full h-0.5 bg-[#252836] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
                </div>
                <Activity className="w-2.5 h-2.5 text-emerald-400 mx-0.5 shrink-0" />
              </div>

              <div className="text-center px-1.5 py-1 rounded bg-[#14151C] border border-[#D4AF37]/40">
                <div className="text-[8.5px] text-[#F5D061] font-bold truncate max-w-[60px]">{selectedVectorInfo.id}</div>
                <div className="text-[7.5px] text-emerald-400">
                  {selectedVectorInfo.status === "OPERATIONAL" ? "ONLINE" : "SEVERED"}
                </div>
              </div>
            </div>
          </div>

          {/* Spatial Vector Coordinates & Specs */}
          <div className="text-[9.5px] text-[#8E8B99] space-y-1 pt-1 border-t border-[#1C1F28]">
            <div className="flex justify-between">
              <span>SPATIAL VECTOR:</span>
              <span className="text-[#F5D061] font-bold">
                ΔX: {selectedVectorInfo.dx > 0 ? `+${selectedVectorInfo.dx}` : selectedVectorInfo.dx}m | ΔY: +{selectedVectorInfo.dy}m | ΔZ: {selectedVectorInfo.dz > 0 ? `+${selectedVectorInfo.dz}` : selectedVectorInfo.dz}m
              </span>
            </div>
            <div className="flex justify-between">
              <span>EUCLIDEAN DIST:</span>
              <span className="text-white font-bold">{selectedVectorInfo.dist}m</span>
            </div>
            <div className="flex justify-between">
              <span>CRITICALITY / LOAD:</span>
              <span className="text-white font-bold">
                <span className="text-amber-400">{selectedVectorInfo.criticality}</span> • {selectedVectorInfo.standardLoadKW} kW Nom
              </span>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="mt-2 pt-1.5 border-t border-[#1C1F28]">
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = `/response?incident=${encodeURIComponent(selectedVectorInfo.id)}`;
                }
              }}
              className="w-full py-1.5 px-2 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#F5D061] border border-[#D4AF37]/40 text-[10px] font-bold flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
            >
              <Wrench className="w-3 h-3" />
              <span>Dispatch Diagnostic Work Order</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. SLEEK FLOATING BOTTOM-LEFT CONTROLS (MATCHING REFERENCE SCREENSHOT) */}
      <div className="absolute bottom-4 left-4 flex items-center space-x-2 pointer-events-auto z-20">
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-[#0E0F14]/90 border border-[#252833] backdrop-blur-md shadow-2xl font-mono">
          <button
            onClick={() => setShowPower(!showPower)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer ${
              showPower
                ? "bg-[#2D2A1C] text-[#F5D061] border border-[#D4AF37]/50 font-bold"
                : "text-[#8E8B99] hover:text-white border border-transparent"
            }`}
            title="Toggle 415V Power Grid Conduits"
          >
            <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Power</span>
          </button>

          <button
            onClick={() => setShowData(!showData)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer ${
              showData
                ? "bg-[#252136] text-[#BDB0D3] border border-[#9D8EB5]/50 font-bold"
                : "text-[#8E8B99] hover:text-white border border-transparent"
            }`}
            title="Toggle Fiber Data Conduits"
          >
            <Network className="w-3.5 h-3.5 text-[#9D8EB5]" />
            <span>Data</span>
          </button>
        </div>
      </div>

      {/* Center Subtle Pill Handle (Matching Reference Image) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-white/10 border border-white/5 pointer-events-none select-none z-10" />
    </div>
  );
}
