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
}

export function CampusCanvas3D({
  selectedEntityId,
  onSelectEntity,
  incidentAffectedIds,
  simulationActive,
}: CampusCanvas3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Architectural View State
  const [selectedLayerId, setSelectedLayerId] = useState<CampusLayerId>("all");
  const [explodedDistance, setExplodedDistance] = useState<number>(3.0);
  const [showPower, setShowPower] = useState<boolean>(true);
  const [showData, setShowData] = useState<boolean>(true);
  const [showPulses, setShowPulses] = useState<boolean>(true);
  const [viewPreset, setViewPreset] = useState<ViewPreset3D>("iso");
  const [overlayTags, setOverlayTags] = useState<{
    id: string;
    title: string;
    status: string;
    x: number;
    y: number;
    isIncident: boolean;
  }[]>([]);

  // Keep ref of latest props/state for animation loop & raycaster
  const stateRef = useRef({
    selectedLayerId,
    explodedDistance,
    showPower,
    showData,
    showPulses,
    incidentAffectedIds,
    selectedEntityId,
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
    };
  }, [
    selectedLayerId,
    explodedDistance,
    showPower,
    showData,
    showPulses,
    incidentAffectedIds,
    selectedEntityId,
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
      if (roomId === "SUB-01") {
        // Two 750kVA Transformers with Bushings and Cooling Fins (Selectable)
        addSelectableItem(
          parent,
          "SUB-01-TX-01",
          "750kVA Primary Substation Transformer 1",
          "TRANSFORMER",
          roomId,
          new THREE.BoxGeometry(2.4, 2.0, 2.0),
          [-2.8, -0.5, 0],
          0xd4af37
        );
        addSelectableItem(
          parent,
          "SUB-01-TX-02",
          "750kVA Standby Substation Transformer 2",
          "TRANSFORMER",
          roomId,
          new THREE.BoxGeometry(2.4, 2.0, 2.0),
          [2.8, -0.5, 0],
          0xd4af37
        );
        // 11kV Switchgear Panels
        addSelectableItem(
          parent,
          "SUB-01-SWG-01",
          "11kV Vacuum Circuit Breaker Switchgear",
          "DISTRIBUTION_PANEL",
          roomId,
          new THREE.BoxGeometry(7.2, 2.2, 0.9),
          [0, -0.4, -2.5],
          0xd4af37
        );
      } else if (roomId === "UPS-01") {
        // Battery Racks
        [-1.8, 0, 1.8].forEach((rx, idx) => {
          addSelectableItem(
            parent,
            `UPS-01-BAT-0${idx + 1}`,
            `200kVA Lithium UPS Battery Bank ${idx + 1}`,
            "UPS",
            roomId,
            new THREE.BoxGeometry(1.2, 2.4, 1.8),
            [rx, -0.3, 0],
            0xd4af37
          );
        });
      } else if (roomId === "SRV-01") {
        // 6 Server Racks in 2 rows
        let rackIdx = 1;
        [-2.2, 0, 2.2].forEach((sx) => {
          [-1.5, 1.5].forEach((sz) => {
            addSelectableItem(
              parent,
              `SRV-01-RACK-0${rackIdx}`,
              `High-Density HPC Server Rack 0${rackIdx}`,
              "SERVER_RACK",
              roomId,
              new THREE.BoxGeometry(1.4, 2.6, 0.9),
              [sx, -0.2, sz],
              0x9d8eb5
            );
            rackIdx++;
          });
        });
        // Core Fiber Switch
        addSelectableItem(
          parent,
          "SW-MDF-CORE",
          "MDF Campus Core Optical Switch",
          "NETWORK_SWITCH",
          roomId,
          new THREE.BoxGeometry(2.0, 0.6, 0.7),
          [0, 1.2, -2.6],
          0xd4af37
        );
      } else if (roomId === "ROB-202") {
        // Robotic Workcells & Cage
        addSelectableItem(
          parent,
          "ROB-202-CAGE",
          "Autonomous Robotic Arm Safety Test Cell",
          "WORKSTATION",
          roomId,
          new THREE.BoxGeometry(4.5, 2.6, 4.5),
          [0, -0.2, 0],
          0xd4af37
        );
      } else if (roomId.startsWith("CR-")) {
        // Classrooms Desks Rows (Selectable Individual Desks)
        let deskIdx = 1;
        [-1.6, 0.2, 2.0].forEach((dz) => {
          [-2.5, 0, 2.5].forEach((dx) => {
            addSelectableItem(
              parent,
              `${roomId}-DESK-0${deskIdx}`,
              `Student Study Bench 0${deskIdx}`,
              "FURNITURE",
              roomId,
              new THREE.BoxGeometry(1.8, 0.72, 0.75),
              [dx, -0.9, dz],
              0x9d8eb5
            );
            deskIdx++;
          });
        });
        // Teacher Smart Podium
        addSelectableItem(
          parent,
          `${roomId}-PODIUM`,
          "Instructor Multimedia Podium & Audio Control",
          "PODIUM",
          roomId,
          new THREE.BoxGeometry(1.2, 1.0, 0.75),
          [0, -0.8, -2.5],
          0xd4af37
        );
        // Interactive Smartboard
        addSelectableItem(
          parent,
          `${roomId}-SMARTBOARD`,
          "85-inch Multi-touch Ultra HD Interactive Display",
          "SMARTBOARD",
          roomId,
          new THREE.BoxGeometry(3.4, 1.6, 0.08),
          [0, 0.3, -3.2],
          0xf5d061
        );
        // Ceiling Laser Projector
        addSelectableItem(
          parent,
          `${roomId}-PROJECTOR`,
          "Ceiling Mount 6000-Lumen Laser Projector",
          "PROJECTOR",
          roomId,
          new THREE.BoxGeometry(0.8, 0.35, 0.6),
          [0, 1.3, -0.5],
          0x9d8eb5
        );
      } else if (roomId === "CTR-302") {
        // Curved SCADA Video Wall
        addSelectableItem(
          parent,
          "CTR-302-SCADA",
          "Central Operations Command SCADA Video Wall",
          "WORKSTATION",
          roomId,
          new THREE.BoxGeometry(8.5, 2.2, 0.3),
          [0, 0, -2.4],
          0xd4af37
        );
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

        // Check if room or its backend entity is impacted by incident/chaos
        const isPowerCut =
          current.incidentAffectedIds.has(room.id) ||
          (room.backendEntityId ? current.incidentAffectedIds.has(room.backendEntityId) : false);

        const fillMat = fillMesh.material as THREE.MeshBasicMaterial;
        const edgeMat = edgeLines.material as THREE.LineBasicMaterial;

        if (isPowerCut) {
          // Severed / Impacted by Cascading Failure: Pulsing Warning Red
          const pulseRed = 0.5 + 0.5 * Math.sin(elapsed * 6);
          fillMat.color.setHex(0x7f1d1d);
          fillMat.opacity = 0.45;
          edgeMat.color.setHex(0xef4444);
          edgeMat.opacity = 0.6 + pulseRed * 0.4;
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

      {/* 2. FLOATING TOP HUD: FLOOR SELECTOR & VIEW ANGLE CONTROLS */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        {/* Floor Level Selector Pills */}
        <div className="flex items-center space-x-1.5 p-1 rounded-lg bg-[#14151A]/90 border border-[#252833] backdrop-blur-md pointer-events-auto shadow-xl">
          <button
            onClick={() => setSelectedLayerId("all")}
            className={`px-2.5 py-1 text-xs font-mono rounded transition-all ${
              selectedLayerId === "all"
                ? "bg-[#D4AF37] text-[#121316] font-bold shadow"
                : "text-[#9D8EB5] hover:text-[#FFFFFF]"
            }`}
          >
            All Levels
          </button>
          {CAMPUS_3D_LAYERS.map((layer) => (
            <button
              key={layer.id}
              onClick={() => setSelectedLayerId(layer.id)}
              className={`px-2 py-1 text-xs font-mono rounded transition-all ${
                selectedLayerId === layer.id
                  ? "bg-[#9D8EB5] text-[#121316] font-bold shadow"
                  : "text-[#8A8594] hover:text-[#E2E1E6]"
              }`}
            >
              {layer.planeNumber}
            </button>
          ))}
        </div>

        {/* Camera View Presets */}
        <div className="flex items-center space-x-1.5 p-1 rounded-lg bg-[#14151A]/90 border border-[#252833] backdrop-blur-md pointer-events-auto shadow-xl">
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
          <button
            onClick={() => setViewPreset("side")}
            className={`px-2 py-1 text-xs font-mono rounded transition-all ${
              viewPreset === "side"
                ? "bg-[#D4AF37] text-[#121316] font-bold"
                : "text-[#8A8594] hover:text-[#FFFFFF]"
            }`}
            title="Side Elevation"
          >
            SIDE
          </button>
        </div>
      </div>

      {/* 3. FLOATING BOTTOM HUD: EXPLODED VIEW SLIDER & UTILITY TOGGLES */}
      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between pointer-events-none z-10">
        {/* Exploded View Height Slider */}
        <div className="p-2.5 rounded-lg bg-[#14151A]/90 border border-[#252833] backdrop-blur-md pointer-events-auto shadow-xl flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-[#D4AF37]">
            <Sliders className="w-3.5 h-3.5" />
            <span className="text-[11px] font-mono font-bold">EXPLODE</span>
          </div>
          <input
            type="range"
            min="0"
            max="8"
            step="0.2"
            value={explodedDistance}
            onChange={(e) => setExplodedDistance(parseFloat(e.target.value))}
            className="w-24 sm:w-36 accent-[#D4AF37] cursor-pointer"
          />
          <span className="text-[11px] font-mono text-[#F5D061] w-10 text-right">
            {explodedDistance.toFixed(1)}m
          </span>
        </div>

        {/* Selected Room Live Spec Badge (Floating Center/Bottom) */}
        {selectedRoom && (
          <div className="hidden md:flex flex-col p-2.5 rounded-lg bg-[#14151A]/95 border border-[#D4AF37]/50 backdrop-blur-md pointer-events-auto shadow-2xl max-w-sm">
            <div className="flex items-center justify-between space-x-3 mb-1">
              <span className="text-xs font-mono font-bold text-[#FFFFFF]">{selectedRoom.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#F5D061] border border-[#D4AF37]/40">
                {selectedRoom.code}
              </span>
            </div>
            <p className="text-[11px] text-[#9D8EB5] truncate mb-1.5">{selectedRoom.department}</p>
            <div className="flex items-center space-x-3 text-[10px] font-mono text-[#A69FB1]">
              <span>Load: <strong className="text-[#F5D061]">{selectedRoom.standardLoadKW} kW</strong></span>
              <span>•</span>
              <span>Bus: <strong className="text-[#FFFFFF]">{selectedRoom.powerBusConnection.split("->")[0]}</strong></span>
            </div>
          </div>
        )}

        {/* Utility Conduit Layer Toggles */}
        <div className="flex items-center space-x-1.5 p-1 rounded-lg bg-[#14151A]/90 border border-[#252833] backdrop-blur-md pointer-events-auto shadow-xl">
          <button
            onClick={() => setShowPower(!showPower)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono rounded transition-all ${
              showPower
                ? "bg-[#D4AF37]/20 text-[#F5D061] border border-[#D4AF37]/50 font-bold"
                : "text-[#5A5565] border border-transparent"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline">Power Grid</span>
          </button>

          <button
            onClick={() => setShowData(!showData)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono rounded transition-all ${
              showData
                ? "bg-[#9D8EB5]/20 text-[#BDB0D3] border border-[#9D8EB5]/50 font-bold"
                : "text-[#5A5565] border border-transparent"
            }`}
          >
            <Network className="w-3.5 h-3.5 text-[#9D8EB5]" />
            <span className="hidden sm:inline">Data Fiber</span>
          </button>

          <button
            onClick={() => setShowPulses(!showPulses)}
            className={`flex items-center space-x-1 px-2 py-1 text-xs font-mono rounded transition-all ${
              showPulses
                ? "bg-[#252833] text-[#FFFFFF]"
                : "text-[#5A5565]"
            }`}
            title="Toggle Animated Signal Flow"
          >
            <Activity className="w-3.5 h-3.5 text-[#F5D061]" />
          </button>
        </div>
      </div>
      {/* 4. 3D TRACKING DOM OVERLAYS PROJECTED IN SCREEN SPACE */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {overlayTags.map((tag) => (
          <div
            key={tag.id}
            style={{ left: `${tag.x}px`, top: `${tag.y}px` }}
            className="absolute transform -translate-x-1/2 -translate-y-full mb-3 pointer-events-auto transition-transform duration-75"
          >
            <div
              className={`flex items-center space-x-2 px-2.5 py-1 rounded-md shadow-2xl backdrop-blur-md border text-xs font-mono font-bold animate-fadeIn ${
                tag.isIncident
                  ? "bg-[#7F1D1D]/90 border-[#EF4444] text-[#FCA5A5]"
                  : "bg-[#14151A]/90 border-[#D4AF37] text-[#F5D061]"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  tag.isIncident ? "bg-[#EF4444] animate-ping" : "bg-[#D4AF37]"
                }`}
              />
              <span>{tag.title}</span>
              <span className="text-[10px] opacity-75 font-normal">[{tag.status}]</span>
            </div>
          </div>
        ))}
      </div>

      {/* 5. CONTEXTUAL LIVE TELEMETRY BADGE (Top-Right HUD) */}
      {selectedRoom && (
        <div className="absolute top-16 right-3 p-3 rounded-lg bg-[#14151A]/95 border border-[#D4AF37]/50 backdrop-blur-md pointer-events-auto shadow-2xl max-w-xs z-10 font-mono text-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#252833] mb-2">
            <span className="text-[#FFFFFF] font-bold truncate max-w-[170px]">{selectedRoom.name}</span>
            <span className="text-[10px] text-[#D4AF37] bg-[#D4AF37]/15 px-1.5 py-0.5 rounded border border-[#D4AF37]/30">
              {selectedRoom.code}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#A69FB1]">
            <div>
              <div className="text-[9px] uppercase text-[#767180]">Standard Load</div>
              <div className="text-[#F5D061] font-bold">{selectedRoom.standardLoadKW} kW</div>
            </div>
            <div>
              <div className="text-[9px] uppercase text-[#767180]">Power Bus</div>
              <div className="text-[#FFFFFF] truncate">{selectedRoom.powerBusConnection.split("->")[0]}</div>
            </div>
            <div>
              <div className="text-[9px] uppercase text-[#767180]">Operational Status</div>
              <div
                className={
                  incidentAffectedIds.has(selectedRoom.id) ||
                  (selectedRoom.backendEntityId && incidentAffectedIds.has(selectedRoom.backendEntityId))
                    ? "text-[#EF4444] font-bold"
                    : "text-[#10B981] font-bold"
                }
              >
                {incidentAffectedIds.has(selectedRoom.id) ||
                (selectedRoom.backendEntityId && incidentAffectedIds.has(selectedRoom.backendEntityId))
                  ? "SEVERED"
                  : "NOMINAL"}
              </div>
            </div>
            <div>
              <div className="text-[9px] uppercase text-[#767180]">Provenance</div>
              <div className="text-[#9D8EB5]">SYNTHETIC</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
