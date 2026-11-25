import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { RoomSpec } from '../types/blueprint';
import { LAYERS } from '../data/campusData';

interface CameraControllerProps {
  selectedRoom: RoomSpec | null;
  selectedLayerId: string;
  explodedDistance: number;
  resetTrigger: number;
  viewPreset: 'iso' | 'top' | 'front' | 'side';
}

export const CameraController: React.FC<CameraControllerProps> = ({
  selectedRoom,
  selectedLayerId,
  explodedDistance,
  resetTrigger,
  viewPreset
}) => {
  const { camera, controls } = useThree() as any;

  // Desired target and camera position vectors
  const targetCameraPos = useRef(new THREE.Vector3(28, 24, 32));
  const targetLookAt = useRef(new THREE.Vector3(0, 5, 0));
  const isTransitioning = useRef(true);

  // Helper to get floor exploded elevation
  const getFloorElevation = (layerId: string) => {
    switch (layerId) {
      case 'ground':
        return 0;
      case 'floor1':
        return 3.8 + explodedDistance * 1;
      case 'floor2':
        return 7.6 + explodedDistance * 2;
      case 'roof':
        return 11.4 + explodedDistance * 3;
      default:
        return 0;
    }
  };

  // React to viewPreset changes
  useEffect(() => {
    isTransitioning.current = true;
    switch (viewPreset) {
      case 'top':
        targetCameraPos.current.set(0, 42, 0.01);
        targetLookAt.current.set(0, 5, 0);
        break;
      case 'front':
        targetCameraPos.current.set(0, 9, 38);
        targetLookAt.current.set(0, 6, 0);
        break;
      case 'side':
        targetCameraPos.current.set(-40, 9, 0);
        targetLookAt.current.set(0, 6, 0);
        break;
      case 'iso':
      default:
        targetCameraPos.current.set(28, 24, 32);
        targetLookAt.current.set(0, 5, 0);
        break;
    }
  }, [viewPreset]);

  // React to resetTrigger
  useEffect(() => {
    if (resetTrigger > 0) {
      isTransitioning.current = true;
      targetCameraPos.current.set(28, 24, 32);
      targetLookAt.current.set(0, 5, 0);
    }
  }, [resetTrigger]);

  // React to Room Selection (smooth drill-down zoom)
  useEffect(() => {
    if (selectedRoom) {
      isTransitioning.current = true;
      const floorY = getFloorElevation(selectedRoom.layerId);
      const roomWorldCenter = new THREE.Vector3(
        selectedRoom.position[0],
        floorY + selectedRoom.position[1],
        selectedRoom.position[2]
      );

      targetLookAt.current.copy(roomWorldCenter);

      // Position camera at a close architectural 45-degree angle
      targetCameraPos.current.set(
        roomWorldCenter.x + 9,
        roomWorldCenter.y + 7.5,
        roomWorldCenter.z + 10
      );
    }
  }, [selectedRoom, explodedDistance]);

  // React to Layer Selection (when no specific room is selected)
  useEffect(() => {
    if (!selectedRoom && selectedLayerId !== 'all') {
      isTransitioning.current = true;
      const layer = LAYERS.find(l => l.id === selectedLayerId);
      if (layer) {
        const floorY = getFloorElevation(layer.id);
        targetLookAt.current.set(0, floorY + 1.8, 0);
        targetCameraPos.current.set(22, floorY + 12, 24);
      }
    } else if (!selectedRoom && selectedLayerId === 'all') {
      isTransitioning.current = true;
      targetLookAt.current.set(0, 5 + explodedDistance * 1.5, 0);
      targetCameraPos.current.set(30, 24 + explodedDistance * 2, 34);
    }
  }, [selectedLayerId, selectedRoom, explodedDistance]);

  // Smooth lerping in useFrame loop
  useFrame(() => {
    if (!isTransitioning.current) return;

    // Smooth step
    camera.position.lerp(targetCameraPos.current, 0.06);

    if (controls && controls.target) {
      controls.target.lerp(targetLookAt.current, 0.06);
      controls.update();
    }

    // Stop transitioning when close enough
    if (
      camera.position.distanceTo(targetCameraPos.current) < 0.1 &&
      (controls && controls.target ? controls.target.distanceTo(targetLookAt.current) < 0.1 : true)
    ) {
      isTransitioning.current = false;
    }
  });

  return (
    // Note: OrbitControls will be imported from @react-three/drei in App.tsx
    // or passed via primitive
    null
  );
};
