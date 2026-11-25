import React from 'react';
import { LayerInfo, RoomSpec } from '../types/blueprint';
import { CADBox } from './CADBox';
import { RoomFurniture } from './RoomFurniture';

interface FloorPlaneProps {
  layer: LayerInfo;
  rooms: RoomSpec[];
  selectedRoomId: string | null;
  selectedLayerId: string;
  onSelectRoom: (room: RoomSpec) => void;
  yElevation: number;
  powerCutRoomIds: Set<string>;
}

export const FloorPlane: React.FC<FloorPlaneProps> = ({
  layer,
  rooms,
  selectedRoomId,
  selectedLayerId,
  onSelectRoom,
  yElevation,
  powerCutRoomIds
}) => {
  const isFloorSelected = selectedLayerId === 'all' || selectedLayerId === layer.id;
  const isFloorDimmed = selectedLayerId !== 'all' && selectedLayerId !== layer.id;

  // Structural column grid coordinates
  const columnXs = [-15, -7.5, 0, 7.5, 15];
  const columnZs = [-8, 0, 8];

  return (
    <group position={[0, yElevation, 0]}>
      {/* Structural Floor Slab (34m x 19m x 0.25m) */}
      <CADBox
        position={[0, 0.125, 0]}
        size={[34, 0.25, 19]}
        color="#07264d"
        fillOpacity={0.16}
        lineColor="#FFFFFF"
        isDimmed={isFloorDimmed}
      />

      {/* Structural Perimeter Columns */}
      {columnXs.map((cx, i) =>
        columnZs.map((cz, j) => (
          <CADBox
            key={`col-${i}-${j}`}
            position={[cx, 1.8, cz]}
            size={[0.4, 3.6, 0.4]}
            color="#0B3B75"
            fillOpacity={0.08}
            isDimmed={isFloorDimmed}
          />
        ))
      )}

      {/* Central Corridor (Floors 1 & 2) */}
      {(layer.id === 'floor1' || layer.id === 'floor2') && (
        <group position={[0, 1.8, 0]}>
          {/* Corridor North Wall with Door Openings */}
          <CADBox
            position={[-4, 0, 1.2]}
            size={[22, 3.2, 0.15]}
            color="#0B3B75"
            fillOpacity={0.06}
            isDimmed={isFloorDimmed}
          />
          {/* Corridor South Wall */}
          <CADBox
            position={[-4, 0, -1.2]}
            size={[22, 3.2, 0.15]}
            color="#0B3B75"
            fillOpacity={0.06}
            isDimmed={isFloorDimmed}
          />
        </group>
      )}

      {/* Rooms on this Floor */}
      {rooms.map(room => {
        const isSelected = selectedRoomId === room.id;
        const isRoomDimmed = (selectedRoomId && !isSelected) || isFloorDimmed;
        const isPowerCut = powerCutRoomIds.has(room.id);

        return (
          <group key={room.id} position={room.position}>
            {/* Room Boundary Enclosure (Translucent Dark Blue Glass + Crisp White Edges) */}
            <CADBox
              size={[room.dimensions.width, room.dimensions.height, room.dimensions.depth]}
              color={isPowerCut ? '#051833' : '#0B3B75'}
              fillOpacity={isSelected ? 0.26 : 0.12}
              lineColor={isSelected ? '#FFFFFF' : isPowerCut ? 'rgba(255,255,255,0.4)' : '#FFFFFF'}
              isHighlighted={isSelected}
              isDimmed={isRoomDimmed}
              onClick={(e) => {
                e.stopPropagation();
                onSelectRoom(room);
              }}
            >
              {/* Internal Room Furniture / Laboratory Equipment / Desks */}
              <RoomFurniture roomId={room.id} isDimmed={isRoomDimmed} />

              {/* Room Code Indicator Box above entrance */}
              <group position={[0, room.dimensions.height / 2 + 0.3, 0]}>
                <CADBox
                  size={[2.2, 0.4, 0.4]}
                  color="#07264d"
                  fillOpacity={0.3}
                  lineColor={isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.7)'}
                  isHighlighted={isSelected}
                  isDimmed={isRoomDimmed}
                />
              </group>
            </CADBox>
          </group>
        );
      })}
    </group>
  );
};
