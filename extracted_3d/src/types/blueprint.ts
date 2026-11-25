export type LayerId = 'all' | 'ground' | 'floor1' | 'floor2' | 'roof';

export interface RoomSpec {
  id: string;
  name: string;
  code: string;
  layerId: LayerId;
  department: string;
  capacity: number | string;
  powerBusConnection: string;
  networkNode: string;
  standardLoadKW: number;
  criticality: 'HIGH' | 'MEDIUM' | 'STANDARD' | 'CRITICAL';
  description: string;
  dimensions: { width: number; depth: number; height: number };
  position: [number, number, number]; // x, y, z relative to floor center
  equipment: string[];
}

export interface ConduitPoint {
  x: number;
  y: number;
  z: number;
}

export interface ConduitLine {
  id: string;
  type: 'POWER' | 'DATA';
  sourceRoomId: string;
  targetRoomId: string;
  points: [number, number, number][];
  voltage?: string;
  bandwidth?: string;
}

export interface LayerInfo {
  id: LayerId;
  planeNumber: string;
  title: string;
  subtitle: string;
  elevationY: number;
  roomCount: number;
  accentCode: string;
}
