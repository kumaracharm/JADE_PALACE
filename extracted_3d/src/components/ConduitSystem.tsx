import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CONDUITS } from '../data/campusData';

interface ConduitSystemProps {
  explodedDistance: number;
  selectedLayerId: string;
  showPower: boolean;
  showData: boolean;
  showPulses: boolean;
  powerCutRoomIds: Set<string>;
}

export const ConduitSystem: React.FC<ConduitSystemProps> = ({
  explodedDistance,
  selectedLayerId,
  showPower,
  showData,
  showPulses,
  powerCutRoomIds
}) => {
  // Convert standard elevation coordinates to exploded coordinates
  const mapPointToExploded = (point: [number, number, number]): THREE.Vector3 => {
    const [x, y, z] = point;
    let adjustedY = y;

    // Floor elevation mapping:
    // Ground: ~0 to 2 -> +0
    // Floor 1: ~3.8 -> + explodedDistance * 1
    // Floor 2: ~7.6 -> + explodedDistance * 2
    // Roof: ~11.4 -> + explodedDistance * 3
    if (y > 9.0) {
      adjustedY = y + explodedDistance * 3;
    } else if (y > 5.0) {
      adjustedY = y + explodedDistance * 2;
    } else if (y > 2.0) {
      adjustedY = y + explodedDistance * 1;
    }

    return new THREE.Vector3(x, adjustedY, z);
  };

  // Filter conduits by power/data toggle and power cuts
  const activeConduits = useMemo(() => {
    return CONDUITS.filter(conduit => {
      if (conduit.type === 'POWER' && !showPower) return false;
      if (conduit.type === 'DATA' && !showData) return false;
      return true;
    });
  }, [showPower, showData]);

  // Compute line objects and 3D curve paths for lines and pulse travel
  const conduitPaths = useMemo(() => {
    return activeConduits.map(conduit => {
      const vecPoints = conduit.points.map(p => mapPointToExploded(p));
      const curve = new THREE.CatmullRomCurve3(vecPoints, false, 'catmullrom', 0.05);
      const isCut = powerCutRoomIds.has(conduit.targetRoomId) || 
                    (conduit.sourceRoomId === 'SUB-01' && powerCutRoomIds.has('SUB-01'));
      const isData = conduit.type === 'DATA';

      const lineGeom = new THREE.BufferGeometry().setFromPoints(vecPoints);
      const color = isCut ? '#4a627a' : isData ? '#cce4ff' : '#ffffff';
      const opacity = isCut ? 0.2 : isData ? 0.75 : 0.95;
      const lineMat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity,
        linewidth: isData ? 1 : 2
      });
      const lineMesh = new THREE.Line(lineGeom, lineMat);

      return {
        conduit,
        curve,
        points: vecPoints,
        isCut,
        isData,
        lineMesh
      };
    });
  }, [activeConduits, explodedDistance, powerCutRoomIds]);

  // Animated pulse particles reference
  const particlesGroupRef = useRef<THREE.Group>(null);

  // Animate pulse particles along paths in useFrame
  useFrame(({ clock }) => {
    if (!particlesGroupRef.current || !showPulses) return;

    const t = clock.getElapsedTime();
    const children = particlesGroupRef.current.children;

    let childIdx = 0;
    conduitPaths.forEach((pathObj, pathIdx) => {
      // If power is cut for this conduit's destination or source, do NOT render/animate pulses!
      if (pathObj.isCut) {
        // Hide pulse meshes for this line
        for (let p = 0; p < 2; p++) {
          if (children[childIdx]) {
            children[childIdx].visible = false;
          }
          childIdx++;
        }
        return;
      }

      // 2 pulses per conduit line with offset
      const speed = pathObj.isData ? 0.35 : 0.22;
      for (let p = 0; p < 2; p++) {
        const mesh = children[childIdx];
        if (mesh) {
          mesh.visible = true;
          const progress = ((t * speed + (p * 0.5) + (pathIdx * 0.15)) % 1);
          const pos = pathObj.curve.getPointAt(progress);
          mesh.position.copy(pos);
        }
        childIdx++;
      }
    });
  });

  return (
    <group>
      {/* Conduit Physical Lines */}
      {conduitPaths.map(({ conduit, lineMesh }, idx) => (
        <primitive key={`${conduit.id}-${idx}`} object={lineMesh} />
      ))}

      {/* Riser Shaft Wireframe Enclosures (A & B) */}
      <group>
        {/* Riser Shaft A (West) */}
        <mesh position={[-4.5, (11.4 + explodedDistance * 3) / 2, 0]}>
          <boxGeometry args={[0.9, 11.4 + explodedDistance * 3, 0.9]} />
          <meshBasicMaterial color="#0B3B75" transparent opacity={0.06} depthWrite={false} />
        </mesh>
        <lineSegments position={[-4.5, (11.4 + explodedDistance * 3) / 2, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(0.9, 11.4 + explodedDistance * 3, 0.9)]} />
          <lineBasicMaterial color="#FFFFFF" transparent opacity={0.5} />
        </lineSegments>

        {/* Riser Shaft B (East) */}
        <mesh position={[4.5, (11.4 + explodedDistance * 3) / 2, 0]}>
          <boxGeometry args={[0.9, 11.4 + explodedDistance * 3, 0.9]} />
          <meshBasicMaterial color="#0B3B75" transparent opacity={0.06} depthWrite={false} />
        </mesh>
        <lineSegments position={[4.5, (11.4 + explodedDistance * 3) / 2, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(0.9, 11.4 + explodedDistance * 3, 0.9)]} />
          <lineBasicMaterial color="#FFFFFF" transparent opacity={0.5} />
        </lineSegments>
      </group>

      {/* Pulse Particle Meshes */}
      {showPulses && (
        <group ref={particlesGroupRef}>
          {conduitPaths.flatMap((pathObj, pIdx) =>
            [0, 1].map(pulseIdx => (
              <mesh key={`pulse-${pIdx}-${pulseIdx}`}>
                <sphereGeometry args={[pathObj.isData ? 0.12 : 0.16, 8, 8]} />
                <meshBasicMaterial
                  color="#ffffff"
                  transparent
                  opacity={0.95}
                />
              </mesh>
            ))
          )}
        </group>
      )}
    </group>
  );
};
