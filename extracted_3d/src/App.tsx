import React, { useState, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GroundPlane } from './components/GroundPlane';
import { CampusBuilding } from './components/CampusBuilding';
import { ConduitSystem } from './components/ConduitSystem';
import { CameraController } from './components/CameraController';
import { HeaderBar } from './components/HeaderBar';
import { HUDPanel } from './components/HUDPanel';
import { RoomSpecModal } from './components/RoomSpecModal';
import { FooterBar } from './components/FooterBar';
import { LayerId, RoomSpec } from './types/blueprint';
import { ROOMS } from './data/campusData';

export const App: React.FC = () => {
  // State
  const [selectedLayerId, setSelectedLayerId] = useState<LayerId>('all');
  const [selectedRoom, setSelectedRoom] = useState<RoomSpec | null>(null);
  const [explodedDistance, setExplodedDistance] = useState<number>(0);
  const [showPower, setShowPower] = useState<boolean>(true);
  const [showData, setShowData] = useState<boolean>(true);
  const [showPulses, setShowPulses] = useState<boolean>(true);
  const [powerCutRoomIds, setPowerCutRoomIds] = useState<Set<string>>(new Set());
  const [viewPreset, setViewPreset] = useState<'iso' | 'top' | 'front' | 'side'>('iso');
  const [resetTrigger, setResetTrigger] = useState<number>(0);

  // Handle Layer Selection
  const handleSelectLayer = useCallback((layerId: LayerId) => {
    setSelectedLayerId(layerId);
    if (selectedRoom && layerId !== 'all' && selectedRoom.layerId !== layerId) {
      setSelectedRoom(null);
    }
  }, [selectedRoom]);

  // Handle Room Selection
  const handleSelectRoom = useCallback((room: RoomSpec) => {
    setSelectedRoom(room);
    setSelectedLayerId(room.layerId);
  }, []);

  // Handle Power Cut Simulation Toggle
  const handleTogglePowerCut = useCallback((roomId: string) => {
    setPowerCutRoomIds(prev => {
      const next = new Set(prev);
      if (next.has(roomId)) {
        next.delete(roomId);
      } else {
        next.add(roomId);
      }
      return next;
    });
  }, []);

  // Handle Reset View
  const handleResetView = useCallback(() => {
    setSelectedLayerId('all');
    setSelectedRoom(null);
    setExplodedDistance(0);
    setViewPreset('iso');
    setResetTrigger(prev => prev + 1);
  }, []);

  // Calculate live campus power metrics
  const totalCampusLoadKW = useMemo(() => {
    // If Substation SUB-01 is cut, entire building power drops to UPS essentials only
    const isSubstationCut = powerCutRoomIds.has('SUB-01');
    if (isSubstationCut) {
      return 140; // essential UPS battery load only
    }

    return ROOMS.reduce((sum, room) => {
      if (room.id === 'RF-303') return sum; // Solar generates, doesn't consume
      if (powerCutRoomIds.has(room.id)) return sum;
      return sum + Math.max(0, room.standardLoadKW);
    }, 0);
  }, [powerCutRoomIds]);

  const solarGenerationKW = useMemo(() => {
    return powerCutRoomIds.has('RF-303') ? 0 : 38.4;
  }, [powerCutRoomIds]);

  return (
    <div className="relative w-screen h-screen bg-[#0B3B75] overflow-hidden select-none blueprint-grid-bg">
      {/* 4 Corner CAD Crosshair Overlay Marks */}
      <div className="absolute top-16 left-2 text-[10px] text-white/30 font-mono pointer-events-none z-10">
        + [X: 000.00 / Y: 000.00]
      </div>
      <div className="absolute top-16 right-2 text-[10px] text-white/30 font-mono pointer-events-none z-10 text-right">
        [PROJECTION: ISOMETRIC AXONOMETRIC] +
      </div>
      <div className="absolute bottom-12 left-2 text-[10px] text-white/30 font-mono pointer-events-none z-10">
        + [DATUM: WGS-84 / ELEV 0.00m]
      </div>
      <div className="absolute bottom-12 right-2 text-[10px] text-white/30 font-mono pointer-events-none z-10 text-right">
        [AUTODESK / REVIT BIM TWIN IMPORT] +
      </div>

      {/* Blueprint Header */}
      <HeaderBar
        onResetView={handleResetView}
        viewPreset={viewPreset}
        onChangeViewPreset={setViewPreset}
      />

      {/* Left HUD Panel (Layers, Exploded Slider, Utilities) */}
      <HUDPanel
        selectedLayerId={selectedLayerId}
        onSelectLayer={handleSelectLayer}
        explodedDistance={explodedDistance}
        onExplodedChange={setExplodedDistance}
        showPower={showPower}
        onTogglePower={() => setShowPower(p => !p)}
        showData={showData}
        onToggleData={() => setShowData(d => !d)}
        showPulses={showPulses}
        onTogglePulses={() => setShowPulses(p => !p)}
        powerCutCount={powerCutRoomIds.size}
      />

      {/* Right CAD Technical Spec Modal (when a room is selected) */}
      <RoomSpecModal
        room={selectedRoom}
        onClose={() => setSelectedRoom(null)}
        isPowerCut={selectedRoom ? powerCutRoomIds.has(selectedRoom.id) : false}
        onTogglePowerCut={handleTogglePowerCut}
      />

      {/* Bottom Blueprint Telemetry Status Bar */}
      <FooterBar
        totalCampusLoadKW={totalCampusLoadKW}
        solarGenerationKW={solarGenerationKW}
        powerCutCount={powerCutRoomIds.size}
      />

      {/* 3D Three.js Viewport */}
      <Canvas
        camera={{ position: [28, 24, 32], fov: 45, near: 0.1, far: 500 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onPointerMissed={() => {
          // Clicked outside any room: close modal
          setSelectedRoom(null);
        }}
      >
        {/* Crisp Blueprint Lighting */}
        <ambientLight intensity={1.2} />
        <directionalLight position={[20, 40, 20]} intensity={0.4} />

        {/* Orbit Controls */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.06}
          minDistance={6}
          maxDistance={120}
          maxPolarAngle={Math.PI / 2.05} // Do not dip below ground
        />

        {/* Smooth Camera Lerp Controller */}
        <CameraController
          selectedRoom={selectedRoom}
          selectedLayerId={selectedLayerId}
          explodedDistance={explodedDistance}
          resetTrigger={resetTrigger}
          viewPreset={viewPreset}
        />

        {/* Ground Plane with CAD Architectural Grid & Dimensions */}
        <GroundPlane />

        {/* Campus 4-Storey Multi-Layer Building */}
        <CampusBuilding
          explodedDistance={explodedDistance}
          selectedLayerId={selectedLayerId}
          selectedRoom={selectedRoom}
          onSelectRoom={handleSelectRoom}
          powerCutRoomIds={powerCutRoomIds}
        />

        {/* Animated Current / Data Conduit Bus Lines & Pulses */}
        <ConduitSystem
          explodedDistance={explodedDistance}
          selectedLayerId={selectedLayerId}
          showPower={showPower}
          showData={showData}
          showPulses={showPulses}
          powerCutRoomIds={powerCutRoomIds}
        />
      </Canvas>
    </div>
  );
};
export default App;
