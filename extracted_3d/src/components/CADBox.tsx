import React, { useMemo } from 'react';
import * as THREE from 'three';

interface CADBoxProps {
  position?: [number, number, number];
  size: [number, number, number];
  color?: string;
  fillOpacity?: number;
  lineColor?: string;
  lineWidth?: number;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  onClick?: (e: any) => void;
  onPointerOver?: (e: any) => void;
  onPointerOut?: (e: any) => void;
  renderOrder?: number;
  children?: React.ReactNode;
}

export const CADBox: React.FC<CADBoxProps> = ({
  position = [0, 0, 0],
  size,
  color = '#0B3B75',
  fillOpacity = 0.12,
  lineColor = '#FFFFFF',
  isHighlighted = false,
  isDimmed = false,
  onClick,
  onPointerOver,
  onPointerOut,
  renderOrder = 0,
  children
}) => {
  const [w, h, d] = size;

  // Box geometry for the fill and edges
  const boxGeometry = useMemo(() => new THREE.BoxGeometry(w, h, d), [w, h, d]);
  const edgesGeometry = useMemo(() => new THREE.EdgesGeometry(boxGeometry), [boxGeometry]);

  const effectiveOpacity = isDimmed ? 0.03 : isHighlighted ? 0.28 : fillOpacity;
  const effectiveLineColor = isDimmed ? '#ffffff' : isHighlighted ? '#ffffff' : lineColor;
  const lineOpacity = isDimmed ? 0.15 : isHighlighted ? 1.0 : 0.85;

  return (
    <group position={position}>
      {/* Translucent blueprint fill */}
      <mesh
        geometry={boxGeometry}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        renderOrder={renderOrder}
      >
        <meshBasicMaterial
          color={isHighlighted ? '#135aa6' : color}
          transparent
          opacity={effectiveOpacity}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Crisp White Wireframe Edges */}
      <lineSegments geometry={edgesGeometry} renderOrder={renderOrder + 1}>
        <lineBasicMaterial
          color={effectiveLineColor}
          transparent
          opacity={lineOpacity}
          linewidth={isHighlighted ? 2 : 1}
        />
      </lineSegments>

      {children}
    </group>
  );
};
