export type CampusLayerId = 'all' | 'ground' | 'floor1' | 'floor2' | 'roof';

export interface Room3DSpec {
  id: string;
  name: string;
  code: string;
  layerId: CampusLayerId;
  department: string;
  capacity: number | string;
  powerBusConnection: string;
  networkNode: string;
  standardLoadKW: number;
  criticality: 'HIGH' | 'MEDIUM' | 'STANDARD' | 'CRITICAL';
  description: string;
  dimensions: { width: number; depth: number; height: number };
  position: [number, number, number]; // [x, y, z] relative to floor center
  equipment: string[];
  backendEntityId?: string; // Mapped backend entity id for OMNIS-X inspector
}

export interface Conduit3DLine {
  id: string;
  type: 'POWER' | 'DATA';
  sourceRoomId: string;
  targetRoomId: string;
  points: [number, number, number][];
  voltage?: string;
  bandwidth?: string;
}

export interface CampusLayerInfo {
  id: CampusLayerId;
  planeNumber: string;
  title: string;
  subtitle: string;
  elevationY: number;
  roomCount: number;
  accentCode: string;
}

export type ViewPreset3D = 'iso' | 'top' | 'front' | 'side';
