import React from 'react';
import { LAYERS, ROOMS } from '../data/campusData';
import { RoomSpec } from '../types/blueprint';
import { FloorPlane } from './FloorPlane';

interface CampusBuildingProps {
  explodedDistance: number;
  selectedLayerId: string;
  selectedRoom: RoomSpec | null;
  onSelectRoom: (room: RoomSpec) => void;
  powerCutRoomIds: Set<string>;
}

export const CampusBuilding: React.FC<CampusBuildingProps> = ({
  explodedDistance,
  selectedLayerId,
  selectedRoom,
  onSelectRoom,
  powerCutRoomIds
}) => {
  return (
    <group position={[0, 0, 0]}>
      {LAYERS.map((layer, index) => {
        // Exploded elevation: base elevation + index * explodedDistance
        const yElevation = layer.elevationY + index * explodedDistance;
        const layerRooms = ROOMS.filter(r => r.layerId === layer.id);

        return (
          <FloorPlane
            key={layer.id}
            layer={layer}
            rooms={layerRooms}
            selectedRoomId={selectedRoom?.id || null}
            selectedLayerId={selectedLayerId}
            onSelectRoom={onSelectRoom}
            yElevation={yElevation}
            powerCutRoomIds={powerCutRoomIds}
          />
        );
      })}
    </group>
  );
};
