"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { ArrowRight, RotateCcw, ShieldCheck, Zap, Activity } from "lucide-react";
import { CAMPUS_3D_LAYERS, CAMPUS_3D_ROOMS, CAMPUS_3D_CONDUITS } from "@/data/campus3dData";

interface CinematicIntroProps {
  onEnter: () => void;
  onSkip?: () => void;
}

// =========================================================================
// MONOTONE CUBIC HERMITE SPLINE ENGINE (Fritsch-Carlson — True C1 Continuity)
// =========================================================================
function createSmoothTrack(keys: [number, number][]) {
  const n = keys.length;
  const t = keys.map((k) => k[0]);
  const v = keys.map((k) => k[1]);
  const d = new Float64Array(n - 1);
  const m = new Float64Array(n);

  for (let i = 0; i < n - 1; i++) {
    const dt = t[i + 1] - t[i];
    d[i] = dt > 1e-6 ? (v[i + 1] - v[i]) / dt : 0;
  }

  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) {
    m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) * 0.5;
  }

  for (let i = 0; i < n - 1; i++) {
    if (Math.abs(d[i]) < 1e-7) {
      m[i] = 0;
      m[i + 1] = 0;
    } else {
      const a = m[i] / d[i];
      const b = m[i + 1] / d[i];
      const sumSq = a * a + b * b;
      if (sumSq > 9) {
        const tau = 3 / Math.sqrt(sumSq);
        m[i] = tau * a * d[i];
        m[i + 1] = tau * b * d[i];
      }
    }
  }

  return function evalAt(x: number): number {
    if (x <= t[0]) return v[0];
    if (x >= t[n - 1]) return v[n - 1];
    let lo = 0,
      hi = n - 2;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (x < t[mid]) hi = mid - 1;
      else if (x > t[mid + 1]) lo = mid + 1;
      else {
        lo = mid;
        break;
      }
    }
    const i = lo;
    const h = t[i + 1] - t[i];
    const u = (x - t[i]) / h;
    const u2 = u * u;
    const u3 = u2 * u;
    return (
      (2 * u3 - 3 * u2 + 1) * v[i] +
      (u3 - 2 * u2 + u) * h * m[i] +
      (-2 * u3 + 3 * u2) * v[i + 1] +
      (u3 - u2) * h * m[i + 1]
    );
  };
}

export function CinematicIntro({ onEnter, onSkip }: CinematicIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const [contentVisible, setContentVisible] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const resetFnRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const flashEl = flashRef.current;
    if (!container) return;

    // Dimensions
    let width = window.innerWidth;
    let height = window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e0f12);
    scene.fog = new THREE.FogExp2(0x0e0f12, 0.012);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 160);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 2. Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x9d8eb5, 0x0e0f12, 0.85);
    scene.add(hemiLight);

    const rimTopLeft = new THREE.DirectionalLight(0xeef6ff, 2.8);
    rimTopLeft.position.set(-20, 25, -15);
    scene.add(rimTopLeft);

    const rimGold = new THREE.DirectionalLight(0xf5d061, 2.2);
    rimGold.position.set(20, -10, -15);
    scene.add(rimGold);

    const keyLight = new THREE.DirectionalLight(0xe2e8f0, 1.4);
    keyLight.position.set(10, 20, 25);
    scene.add(keyLight);

    const coreLight = new THREE.PointLight(0xd4af37, 0, 35, 1.8);
    coreLight.position.set(0, 5, 0);
    scene.add(coreLight);

    // 3. Stardust Particle System
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount * 3);

    const goldCol = new THREE.Color(0xd4af37);
    const purpleCol = new THREE.Color(0x9d8eb5);
    const whiteCol = new THREE.Color(0xffffff);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = Math.random() * 25 - 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

      speeds[i * 3 + 0] = (Math.random() - 0.5) * 0.4;
      speeds[i * 3 + 1] = (Math.random() - 0.5) * 0.3 + 0.1;
      speeds[i * 3 + 2] = (Math.random() - 0.5) * 0.4;

      const pick = Math.random();
      const col = pick < 0.45 ? goldCol : pick < 0.8 ? purpleCol : whiteCol;
      colors[i * 3 + 0] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.28,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 4. Campus 3D Wireframe Model Assembly
    const campusGroup = new THREE.Group();
    scene.add(campusGroup);

    // Four translucent architectural floor slabs
    CAMPUS_3D_LAYERS.forEach((layer, idx) => {
      const slabMesh = new THREE.Mesh(
        new THREE.BoxGeometry(34, 0.25, 19),
        new THREE.MeshBasicMaterial({
          color: 0x14151a,
          transparent: true,
          opacity: 0.45,
          side: THREE.DoubleSide,
        })
      );
      slabMesh.position.set(0, layer.elevationY + 0.125, 0);
      campusGroup.add(slabMesh);

      const slabEdges = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(34, 0.25, 19)),
        new THREE.LineBasicMaterial({
          color: idx === 0 ? 0xd4af37 : 0x9d8eb5,
          transparent: true,
          opacity: 0.75,
        })
      );
      slabEdges.position.copy(slabMesh.position);
      campusGroup.add(slabEdges);
    });

    // Structural Columns Grid
    const colXs = [-15, -7.5, 0, 7.5, 15];
    const colZs = [-8, 0, 8];
    colXs.forEach((cx) => {
      colZs.forEach((cz) => {
        const colMesh = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(0.35, 12.5, 0.35)),
          new THREE.LineBasicMaterial({ color: 0x5a5565, transparent: true, opacity: 0.4 })
        );
        colMesh.position.set(cx, 6.25, cz);
        campusGroup.add(colMesh);
      });
    });

    // Room Enclosures with glowing edge boxes
    CAMPUS_3D_ROOMS.forEach((room) => {
      const layer = CAMPUS_3D_LAYERS.find((l) => l.id === room.layerId);
      const floorY = layer ? layer.elevationY : 0;
      const roomBoxGeom = new THREE.BoxGeometry(room.dimensions.width, room.dimensions.height, room.dimensions.depth);

      // Translucent fill
      const roomMesh = new THREE.Mesh(
        roomBoxGeom,
        new THREE.MeshBasicMaterial({
          color: room.criticality === "CRITICAL" ? 0x241d2d : 0x161821,
          transparent: true,
          opacity: 0.25,
          depthWrite: false,
        })
      );
      roomMesh.position.set(room.position[0], floorY + room.position[1], room.position[2]);
      campusGroup.add(roomMesh);

      // Accent Wireframe Lines
      const roomEdges = new THREE.LineSegments(
        new THREE.EdgesGeometry(roomBoxGeom),
        new THREE.LineBasicMaterial({
          color: room.criticality === "CRITICAL" ? 0xd4af37 : 0x9d8eb5,
          transparent: true,
          opacity: 0.85,
        })
      );
      roomEdges.position.copy(roomMesh.position);
      campusGroup.add(roomEdges);
    });

    // Conduits Wireframe Paths (Power in Gold, Data in Dusty Purple)
    CAMPUS_3D_CONDUITS.forEach((conduit) => {
      const isPower = conduit.type === "POWER";
      const vecPoints = conduit.points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
      const lineGeom = new THREE.BufferGeometry().setFromPoints(vecPoints);
      const lineMat = new THREE.LineBasicMaterial({
        color: isPower ? 0xd4af37 : 0x9d8eb5,
        transparent: true,
        opacity: isPower ? 0.9 : 0.75,
        linewidth: 2,
      });
      const line = new THREE.Line(lineGeom, lineMat);
      campusGroup.add(line);
    });

    // Central Core Pulse Orb (Substation / Datacenter Convergence)
    const coreOrbGeom = new THREE.SphereGeometry(0.8, 24, 24);
    const coreOrbMat = new THREE.MeshBasicMaterial({
      color: 0xf5d061,
      transparent: true,
      opacity: 0.9,
    });
    const coreOrb = new THREE.Mesh(coreOrbGeom, coreOrbMat);
    coreOrb.position.set(0, 5, 0);
    campusGroup.add(coreOrb);

    // 5. Hermite Spline Camera Trajectory Keys
    // Sweeps from dynamic elevated isometric vantage around the institutional twin
    const DURATION = 7.5; // seconds
    const camXTrack = createSmoothTrack([
      [0.0, 38],
      [0.25, 26],
      [0.5, -12],
      [0.72, 4],
      [0.85, 0],
      [1.0, 0],
    ]);
    const camYTrack = createSmoothTrack([
      [0.0, 28],
      [0.25, 18],
      [0.5, 10],
      [0.72, 7.5],
      [0.85, 6],
      [1.0, 6],
    ]);
    const camZTrack = createSmoothTrack([
      [0.0, 42],
      [0.25, 34],
      [0.5, 24],
      [0.72, 22],
      [0.85, 19],
      [1.0, 19],
    ]);

    const targetXTrack = createSmoothTrack([
      [0.0, 0],
      [0.4, 2],
      [0.7, -1],
      [1.0, 0],
    ]);
    const targetYTrack = createSmoothTrack([
      [0.0, 4],
      [0.4, 5.5],
      [0.7, 4.5],
      [1.0, 5],
    ]);
    const targetZTrack = createSmoothTrack([
      [0.0, 0],
      [0.4, 0],
      [0.7, 0],
      [1.0, 0],
    ]);

    // 6. Animation State
    let startTime = 0;
    let detonated = false;
    let camShake = 0;

    const resetAnimation = () => {
      startTime = performance.now() / 1000;
      detonated = false;
      camShake = 0;
      setContentVisible(false);
      coreLight.intensity = 0;
      coreOrb.scale.setScalar(0.2);
      if (flashEl) flashEl.style.opacity = "0";
    };
    resetFnRef.current = resetAnimation;

    resetAnimation();

    // 7. Render Loop
    const animate = (nowMs: number) => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const now = nowMs / 1000;
      const elapsed = Math.max(0, now - startTime);
      const p = Math.min(elapsed / DURATION, 1.0);

      // Stardust float
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        posAttr.setY(i, posAttr.getY(i) + speeds[i * 3 + 1] * 0.05);
        if (posAttr.getY(i) > 25) {
          posAttr.setY(i, -2);
        }
      }
      posAttr.needsUpdate = true;

      // Core Orb pulse & charge
      const charge = Math.min(1.0, p / 0.78);
      const orbPulse = 1.0 + Math.sin(now * 14) * 0.12;
      coreOrb.scale.setScalar((0.4 + charge * 1.6) * orbPulse);
      coreLight.intensity = Math.pow(charge, 2.5) * 8.0;

      // Camera Hermite Evaluation
      const cx = camXTrack(p);
      const cy = camYTrack(p);
      const cz = camZTrack(p);

      const tx = targetXTrack(p);
      const ty = targetYTrack(p);
      const tz = targetZTrack(p);

      // Trigger flash and text reveal at climax
      if (p >= 0.78 && !detonated) {
        detonated = true;
        camShake = 0.35;
        if (flashEl) {
          flashEl.style.opacity = "0.85";
          setTimeout(() => {
            if (flashEl) flashEl.style.opacity = "0";
          }, 140);
        }
        setTimeout(() => {
          setContentVisible(true);
        }, 180);
      }

      // Camera Shake decay
      if (camShake > 0.002) {
        camera.position.set(
          cx + (Math.random() - 0.5) * camShake,
          cy + (Math.random() - 0.5) * camShake,
          cz - camShake * 0.4
        );
        camShake *= 0.88;
      } else {
        camera.position.set(cx, cy, cz);
      }

      camera.lookAt(tx, ty, tz);

      // Gentle building sway rotation when settled
      if (p >= 0.85) {
        campusGroup.rotation.y = Math.sin((now - startTime - 6.0) * 0.4) * 0.06;
      } else {
        campusGroup.rotation.y = 0;
      }

      renderer.render(scene, camera);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // Responsive Resize Handler
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  const handleReplay = useCallback(() => {
    if (resetFnRef.current) {
      resetFnRef.current();
    }
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0E0F12] select-none">
      {/* 1. THREE.JS WEBGL CANVAS CONTAINER */}
      <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* 2. BLAST RADIAL FLASH OVERLAY */}
      <div
        ref={flashRef}
        className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-150 ease-out"
        style={{
          opacity: 0,
          background:
            "radial-gradient(circle at 50% 50%, rgba(245, 208, 97, 0.82) 0%, rgba(157, 142, 181, 0.45) 25%, rgba(14, 15, 18, 0.85) 60%, rgba(14, 15, 18, 1) 100%)",
        }}
      />

      {/* 3. TOP-RIGHT CONTROLS: REPLAY / SKIP */}
      <div className="absolute top-5 right-5 z-40 flex items-center space-x-2.5">
        <button
          onClick={handleReplay}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#14151A]/80 hover:bg-[#1E2029] border border-[#2D303B] hover:border-[#D4AF37] text-xs font-mono text-[#BDB0D3] hover:text-[#FFFFFF] transition-all backdrop-blur-md shadow-lg"
          title="Replay Cinematic Flythrough"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Replay</span>
        </button>

        <button
          onClick={onEnter}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-md bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/40 hover:border-[#D4AF37] text-xs font-mono text-[#F5D061] transition-all backdrop-blur-md shadow-lg"
          title="Skip Introduction Directly to Explorer"
        >
          <span>Skip to Twin</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4. HERO CONTENT REVEAL (BLUR-TO-SHARP CSS TRANSITION) */}
      <div className="absolute inset-0 z-30 flex items-center justify-center p-6 pointer-events-none">
        <div
          className={`max-w-2xl text-center transform transition-all duration-700 ease-out ${
            contentVisible
              ? "opacity-100 translate-y-0 scale-100 blur-0 pointer-events-auto"
              : "opacity-0 translate-y-6 scale-95 blur-md pointer-events-none"
          }`}
        >
          {/* Insignia / Brand Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#1A1C23]/90 border border-[#D4AF37]/40 shadow-xl mb-4 backdrop-blur-md">
            <span className="w-5 h-5 rounded bg-gradient-to-br from-[#D4AF37] via-[#E6C45E] to-[#91751F] flex items-center justify-center font-mono font-black text-[#121316] text-xs">
              Ω
            </span>
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#E6C45E] uppercase">
              OMNIS-X DIGITAL TWIN PLATFORM
            </span>
          </div>

          {/* Majestic Hero Title */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#FFFFFF] via-[#E2E1E6] to-[#9D8EB5] mb-3 font-mono">
            OMNIS-X
          </h1>

          {/* Tagline */}
          <p className="text-base sm:text-xl font-medium text-[#D4AF37] tracking-wide mb-3">
            A Unified Intelligence Layer for Institutional Resilience
          </p>

          {/* Subtitle / Capabilities */}
          <p className="text-xs sm:text-sm text-[#9D8EB5] max-w-xl mx-auto leading-relaxed mb-8">
            Cyber-physical campus modeling linking 11kV electrical switchgear, core network topologies, academic spaces, and automated cascading failure propagation.
          </p>

          {/* Feature Badges */}
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto mb-8 text-left">
            <div className="p-2.5 rounded-lg bg-[#14151A]/80 border border-[#252833] backdrop-blur-sm">
              <div className="flex items-center space-x-1.5 text-[#D4AF37] mb-1">
                <Zap className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono font-bold">GRID</span>
              </div>
              <p className="text-[10px] text-[#A69FB1]">11kV Intake & 415V Dual Redundancy</p>
            </div>

            <div className="p-2.5 rounded-lg bg-[#14151A]/80 border border-[#252833] backdrop-blur-sm">
              <div className="flex items-center space-x-1.5 text-[#9D8EB5] mb-1">
                <Activity className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono font-bold">TELEMETRY</span>
              </div>
              <p className="text-[10px] text-[#A69FB1]">Live Bus Meters & Sensor Streams</p>
            </div>

            <div className="p-2.5 rounded-lg bg-[#14151A]/80 border border-[#252833] backdrop-blur-sm">
              <div className="flex items-center space-x-1.5 text-[#E6C45E] mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono font-bold">RESILIENCE</span>
              </div>
              <p className="text-[10px] text-[#A69FB1]">Cascading Failure Chaos Engine</p>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onEnter}
              className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-[#D4AF37] via-[#E6C45E] to-[#D4AF37] text-[#121316] font-bold text-sm tracking-wide shadow-xl shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/45 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 font-mono"
            >
              <span>ENTER DIGITAL TWIN</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleReplay}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#191B22]/80 hover:bg-[#232530] text-[#9D8EB5] hover:text-[#FFFFFF] border border-[#2D303B] hover:border-[#9D8EB5] text-xs font-mono transition-all flex items-center justify-center space-x-2 backdrop-blur-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Replay Intro</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
