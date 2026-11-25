import React, { useMemo } from 'react';
import * as THREE from 'three';

export const GroundPlane: React.FC = () => {
  // Architectural grid lines
  const gridHelper = useMemo(() => {
    // 60m x 60m grid with 60 divisions (1m per grid)
    const gh = new THREE.GridHelper(60, 60, 0xffffff, 0xffffff);
    (gh.material as THREE.LineBasicMaterial).transparent = true;
    (gh.material as THREE.LineBasicMaterial).opacity = 0.08;
    return gh;
  }, []);

  // Major 5m grid
  const majorGrid = useMemo(() => {
    const gh = new THREE.GridHelper(60, 12, 0xffffff, 0xffffff);
    (gh.material as THREE.LineBasicMaterial).transparent = true;
    (gh.material as THREE.LineBasicMaterial).opacity = 0.18;
    return gh;
  }, []);

  // Concentric measurement circles & CAD target marks
  const circles = useMemo(() => {
    const group = new THREE.Group();
    const radii = [10, 20, 28];
    radii.forEach(r => {
      const circleGeom = new THREE.BufferGeometry();
      const points: THREE.Vector3[] = [];
      const segments = 64;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * r, 0, Math.sin(theta) * r));
      }
      circleGeom.setFromPoints(points);
      const line = new THREE.Line(
        circleGeom,
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 })
      );
      group.add(line);
    });

    // Campus boundary box (44m x 32m)
    const boundaryPoints = [
      new THREE.Vector3(-22, 0.01, -16),
      new THREE.Vector3(22, 0.01, -16),
      new THREE.Vector3(22, 0.01, 16),
      new THREE.Vector3(-22, 0.01, 16),
      new THREE.Vector3(-22, 0.01, -16),
    ];
    const boundaryGeom = new THREE.BufferGeometry().setFromPoints(boundaryPoints);
    const boundaryLine = new THREE.Line(
      boundaryGeom,
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 })
    );
    group.add(boundaryLine);

    // Coordinate crosshairs at origin
    const axisX = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-30, 0.02, 0),
      new THREE.Vector3(30, 0.02, 0)
    ]);
    const axisZ = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.02, -30),
      new THREE.Vector3(0, 0.02, 30)
    ]);
    group.add(new THREE.Line(axisX, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 })));
    group.add(new THREE.Line(axisZ, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 })));

    return group;
  }, []);

  return (
    <group position={[0, -0.01, 0]}>
      {/* Dark blueprint ground plane fill */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="#07264d" depthWrite={false} />
      </mesh>

      {/* Grid helpers */}
      <primitive object={gridHelper} position={[0, 0, 0]} />
      <primitive object={majorGrid} position={[0, 0.01, 0]} />
      <primitive object={circles} />
    </group>
  );
};
