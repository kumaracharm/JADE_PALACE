import React, { useMemo } from 'react';
import * as THREE from 'three';
import { CADBox } from './CADBox';

interface FurnitureProps {
  roomId: string;
  isDimmed?: boolean;
}

export const RoomFurniture: React.FC<FurnitureProps> = ({ roomId, isDimmed }) => {
  switch (roomId) {
    // --- CLASSROOMS CR-101 to CR-104 ---
    case 'CR-101':
    case 'CR-102':
    case 'CR-103':
    case 'CR-104':
      return <ClassroomInterior isDimmed={isDimmed} isComputerLab={roomId === 'CR-103' || roomId === 'CR-104'} />;

    // --- GROUND UTILITIES ---
    case 'SUB-01':
      return <SubstationInterior isDimmed={isDimmed} />;
    case 'UPS-01':
      return <UPSInterior isDimmed={isDimmed} />;
    case 'SRV-01':
      return <ServerRoomInterior isDimmed={isDimmed} />;
    case 'BUS-01':
      return <BusBayInterior isDimmed={isDimmed} />;

    // --- FLOOR 2 LABS & SEMINAR ---
    case 'VLSI-201':
      return <VLSILabInterior isDimmed={isDimmed} />;
    case 'ROB-202':
      return <RoboticsLabInterior isDimmed={isDimmed} />;
    case 'HV-203':
      return <HighVoltageLabInterior isDimmed={isDimmed} />;
    case 'SEM-204':
      return <SeminarHallInterior isDimmed={isDimmed} />;

    // --- ROOF ADMIN & SCADA & SOLAR ---
    case 'ADM-301':
      return <DeanOfficeInterior isDimmed={isDimmed} />;
    case 'CTR-302':
      return <ControlRoomInterior isDimmed={isDimmed} />;
    case 'RF-303':
      return <RooftopArrayInterior isDimmed={isDimmed} />;

    default:
      return null;
  }
};

// --- CLASSROOM INTERIOR ---
const ClassroomInterior: React.FC<{ isDimmed?: boolean; isComputerLab?: boolean }> = ({ isDimmed, isComputerLab }) => {
  // 3 rows of desks with 3 desks each
  const rows = [-1.8, 0.2, 2.2];
  const cols = [-2.8, 0, 2.8];

  return (
    <group>
      {/* Instructor Podium at front */}
      <CADBox
        position={[0, -0.9, -2.4]}
        size={[1.8, 1.0, 0.8]}
        isDimmed={isDimmed}
      />
      {/* Smartboard / Blackboard on wall */}
      <CADBox
        position={[0, 0.2, -3.45]}
        size={[4.5, 1.6, 0.08]}
        isDimmed={isDimmed}
      />
      {/* Ceiling Projector unit */}
      <CADBox
        position={[0, 1.3, -0.5]}
        size={[0.6, 0.25, 0.6]}
        isDimmed={isDimmed}
      />

      {/* Student Desks */}
      {rows.map((z, rIdx) =>
        cols.map((x, cIdx) => (
          <group key={`${rIdx}-${cIdx}`} position={[x, -0.9, z]}>
            {/* Table */}
            <CADBox
              position={[0, 0.35, 0]}
              size={[1.8, 0.08, 0.7]}
              isDimmed={isDimmed}
            />
            {/* Table legs */}
            <CADBox
              position={[-0.8, -0.05, 0]}
              size={[0.08, 0.7, 0.6]}
              isDimmed={isDimmed}
            />
            <CADBox
              position={[0.8, -0.05, 0]}
              size={[0.08, 0.7, 0.6]}
              isDimmed={isDimmed}
            />

            {/* Chairs (2 per desk) */}
            <CADBox
              position={[-0.45, -0.05, 0.55]}
              size={[0.45, 0.6, 0.45]}
              isDimmed={isDimmed}
            />
            <CADBox
              position={[0.45, -0.05, 0.55]}
              size={[0.45, 0.6, 0.45]}
              isDimmed={isDimmed}
            />

            {/* Computer Monitors for CS/EC labs */}
            {isComputerLab && (
              <>
                <CADBox
                  position={[-0.45, 0.65, 0.05]}
                  size={[0.55, 0.35, 0.06]}
                  isDimmed={isDimmed}
                />
                <CADBox
                  position={[0.45, 0.65, 0.05]}
                  size={[0.55, 0.35, 0.06]}
                  isDimmed={isDimmed}
                />
              </>
            )}
          </group>
        ))
      )}
    </group>
  );
};

// --- SUBSTATION INTERIOR ---
const SubstationInterior: React.FC<{ isDimmed?: boolean }> = ({ isDimmed }) => {
  return (
    <group>
      {/* Transformer T1 (750kVA) */}
      <group position={[-2.8, -0.5, 0]}>
        <CADBox size={[2.8, 2.2, 2.2]} isDimmed={isDimmed} />
        {/* Bushings on top */}
        <CADBox position={[-0.7, 1.4, 0]} size={[0.2, 0.7, 0.2]} isDimmed={isDimmed} />
        <CADBox position={[0, 1.4, 0]} size={[0.2, 0.7, 0.2]} isDimmed={isDimmed} />
        <CADBox position={[0.7, 1.4, 0]} size={[0.2, 0.7, 0.2]} isDimmed={isDimmed} />
        {/* Cooling radiator fins */}
        <CADBox position={[1.6, 0, 0]} size={[0.4, 1.8, 1.8]} isDimmed={isDimmed} />
      </group>

      {/* Transformer T2 (750kVA) */}
      <group position={[2.8, -0.5, 0]}>
        <CADBox size={[2.8, 2.2, 2.2]} isDimmed={isDimmed} />
        <CADBox position={[-0.7, 1.4, 0]} size={[0.2, 0.7, 0.2]} isDimmed={isDimmed} />
        <CADBox position={[0, 1.4, 0]} size={[0.2, 0.7, 0.2]} isDimmed={isDimmed} />
        <CADBox position={[0.7, 1.4, 0]} size={[0.2, 0.7, 0.2]} isDimmed={isDimmed} />
        <CADBox position={[-1.6, 0, 0]} size={[0.4, 1.8, 1.8]} isDimmed={isDimmed} />
      </group>

      {/* HV 11kV Switchgear & Breaker Cabinets */}
      <CADBox position={[0, -0.3, -2.6]} size={[8.0, 2.4, 1.0]} isDimmed={isDimmed} />
      {/* Bus Duct trunking above */}
      <CADBox position={[0, 1.3, 0]} size={[8.5, 0.3, 0.5]} isDimmed={isDimmed} />
    </group>
  );
};

// --- UPS & BATTERY ROOM ---
const UPSInterior: React.FC<{ isDimmed?: boolean }> = ({ isDimmed }) => {
  return (
    <group>
      {/* Central UPS Inverter Racks */}
      <CADBox position={[-1.5, -0.4, 0]} size={[1.2, 2.2, 1.8]} isDimmed={isDimmed} />
      <CADBox position={[0, -0.4, 0]} size={[1.2, 2.2, 1.8]} isDimmed={isDimmed} />
      {/* Battery Rack Banks along rear wall */}
      <CADBox position={[1.8, -0.5, -1.8]} size={[1.0, 2.0, 2.4]} isDimmed={isDimmed} />
      <CADBox position={[1.8, -0.5, 1.8]} size={[1.0, 2.0, 2.4]} isDimmed={isDimmed} />
      {/* Emergency Isolator / FM-200 Fire Cylinder */}
      <CADBox position={[-2.2, -0.7, -2.5]} size={[0.5, 1.6, 0.5]} isDimmed={isDimmed} />
    </group>
  );
};

// --- SERVER ROOM INTERIOR ---
const ServerRoomInterior: React.FC<{ isDimmed?: boolean }> = ({ isDimmed }) => {
  // 2 rows of 4 server cabinets
  const racksCol1 = [-2.2, -0.8, 0.6, 2.0];
  return (
    <group>
      {/* Cold Aisle 1 Racks */}
      {racksCol1.map((x, i) => (
        <group key={`r1-${i}`}>
          <CADBox position={[x, -0.3, -1.5]} size={[1.1, 2.4, 1.1]} isDimmed={isDimmed} />
          <CADBox position={[x, -0.3, 1.5]} size={[1.1, 2.4, 1.1]} isDimmed={isDimmed} />
        </group>
      ))}
      {/* In-row Precision Chiller unit */}
      <CADBox position={[-3.2, -0.3, 0]} size={[0.8, 2.4, 1.4]} isDimmed={isDimmed} />
      {/* Overhead Cable Ladder */}
      <CADBox position={[0, 1.2, -1.5]} size={[6.5, 0.15, 0.6]} isDimmed={isDimmed} />
      <CADBox position={[0, 1.2, 1.5]} size={[6.5, 0.15, 0.6]} isDimmed={isDimmed} />
    </group>
  );
};

// --- BUS BAY INTERIOR ---
const BusBayInterior: React.FC<{ isDimmed?: boolean }> = ({ isDimmed }) => {
  return (
    <group>
      {/* 4 EV Charging Pedestals */}
      {[-9, -3, 3, 9].map((x, i) => (
        <group key={`charger-${i}`} position={[x, -0.6, -2.5]}>
          <CADBox size={[0.6, 1.8, 0.5]} isDimmed={isDimmed} />
          {/* Connector nozzle detail */}
          <CADBox position={[0, 0.2, 0.35]} size={[0.2, 0.4, 0.15]} isDimmed={isDimmed} />
        </group>
      ))}

      {/* Bus bays outlines on ground */}
      {[-6, 6].map((x, i) => (
        <group key={`bus-${i}`} position={[x, -0.6, 1.0]}>
          {/* Bus wireframe silhouette */}
          <CADBox size={[8.5, 2.1, 2.6]} isDimmed={isDimmed} />
          {/* Wheel bay cutouts */}
          <CADBox position={[-2.8, -0.9, 0]} size={[1.2, 0.6, 2.7]} isDimmed={isDimmed} />
          <CADBox position={[2.8, -0.9, 0]} size={[1.2, 0.6, 2.7]} isDimmed={isDimmed} />
        </group>
      ))}
    </group>
  );
};

// --- VLSI LAB INTERIOR ---
const VLSILabInterior: React.FC<{ isDimmed?: boolean }> = ({ isDimmed }) => {
  return (
    <group>
      {/* Cleanroom Air Shower Cubicle at entry */}
      <CADBox position={[-3.2, -0.3, -2.4]} size={[2.0, 2.5, 1.8]} isDimmed={isDimmed} />

      {/* Precision Workstation Islands (4 benches) */}
      {[-1, 2.2].map((x, i) =>
        [-1.2, 1.5].map((z, j) => (
          <group key={`vlsi-${i}-${j}`} position={[x, -0.8, z]}>
            {/* ESD Heavy Duty Workbench */}
            <CADBox position={[0, 0.35, 0]} size={[2.4, 0.1, 1.2]} isDimmed={isDimmed} />
            <CADBox position={[-1.0, -0.1, 0]} size={[0.1, 0.8, 1.1]} isDimmed={isDimmed} />
            <CADBox position={[1.0, -0.1, 0]} size={[0.1, 0.8, 1.1]} isDimmed={isDimmed} />
            {/* Dual Precision CAD Monitors */}
            <CADBox position={[-0.5, 0.75, 0.1]} size={[0.7, 0.45, 0.08]} isDimmed={isDimmed} />
            <CADBox position={[0.5, 0.75, 0.1]} size={[0.7, 0.45, 0.08]} isDimmed={isDimmed} />
            {/* Logic Analyzer / Probe Unit */}
            <CADBox position={[0, 0.55, -0.35]} size={[0.8, 0.3, 0.4]} isDimmed={isDimmed} />
          </group>
        ))
      )}
    </group>
  );
};

// --- ROBOTICS LAB INTERIOR ---
const RoboticsLabInterior: React.FC<{ isDimmed?: boolean }> = ({ isDimmed }) => {
  return (
    <group>
      {/* Industrial 6-Axis Robot Arm 1 on Pedestal */}
      <group position={[-1.8, -0.5, 0]}>
        <CADBox size={[1.2, 0.8, 1.2]} isDimmed={isDimmed} />
        <CADBox position={[0, 0.8, 0]} size={[0.4, 1.0, 0.4]} isDimmed={isDimmed} />
        <CADBox position={[0.3, 1.4, 0]} size={[0.8, 0.3, 0.3]} isDimmed={isDimmed} />
        <CADBox position={[0.6, 1.1, 0]} size={[0.2, 0.5, 0.2]} isDimmed={isDimmed} />
      </group>

      {/* Industrial 6-Axis Robot Arm 2 */}
      <group position={[1.8, -0.5, 0]}>
        <CADBox size={[1.2, 0.8, 1.2]} isDimmed={isDimmed} />
        <CADBox position={[0, 0.8, 0]} size={[0.4, 1.0, 0.4]} isDimmed={isDimmed} />
        <CADBox position={[-0.3, 1.4, 0]} size={[0.8, 0.3, 0.3]} isDimmed={isDimmed} />
        <CADBox position={[-0.6, 1.1, 0]} size={[0.2, 0.5, 0.2]} isDimmed={isDimmed} />
      </group>

      {/* Protective Safety Interlock Perimeter Cage */}
      <CADBox position={[0, 0, 0]} size={[6.5, 2.2, 3.5]} isDimmed={isDimmed} />

      {/* Optical MoCap Gantry Frame */}
      <CADBox position={[0, 1.2, 0]} size={[7.2, 0.2, 4.2]} isDimmed={isDimmed} />
    </group>
  );
};

// --- HIGH-VOLTAGE POWER LAB ---
const HighVoltageLabInterior: React.FC<{ isDimmed?: boolean }> = ({ isDimmed }) => {
  return (
    <group>
      {/* Marx Impulse Generator Multi-Stage Tower */}
      <group position={[-2.5, -0.2, 0]}>
        <CADBox size={[1.6, 2.6, 1.6]} isDimmed={isDimmed} />
        {/* Spark gap spheres */}
        <CADBox position={[0, 1.5, 0]} size={[0.6, 0.6, 0.6]} isDimmed={isDimmed} />
        <CADBox position={[0, 0.5, 0.9]} size={[0.3, 1.2, 0.3]} isDimmed={isDimmed} />
      </group>

      {/* Faraday Safety Cage Enclosure */}
      <CADBox position={[1.8, -0.2, 0]} size={[3.8, 2.6, 3.8]} isDimmed={isDimmed} />

      {/* High-Voltage Testing Transformer */}
      <group position={[1.8, -0.5, 0]}>
        <CADBox size={[1.8, 1.8, 1.8]} isDimmed={isDimmed} />
        <CADBox position={[0, 1.2, 0]} size={[0.4, 0.8, 0.4]} isDimmed={isDimmed} />
      </group>
    </group>
  );
};

// --- SEMINAR HALL INTERIOR ---
const SeminarHallInterior: React.FC<{ isDimmed?: boolean }> = ({ isDimmed }) => {
  // Curved tiered seating rows
  const tierY = [-1.0, -0.6, -0.2, 0.2];
  const tierZ = [-1.8, -0.4, 1.0, 2.4];

  return (
    <group>
      {/* Front Stage Platform */}
      <CADBox position={[0, -1.1, -2.8]} size={[9.5, 0.5, 1.5]} isDimmed={isDimmed} />
      {/* Speaker Lectern */}
      <CADBox position={[-2.5, -0.6, -2.6]} size={[0.8, 0.9, 0.6]} isDimmed={isDimmed} />
      {/* Motorized Presentation Screen */}
      <CADBox position={[0, 0.4, -3.45]} size={[7.0, 2.0, 0.08]} isDimmed={isDimmed} />

      {/* Tiered Auditorium Seating Benches */}
      {tierY.map((y, idx) => (
        <group key={`tier-${idx}`} position={[0, y, tierZ[idx]]}>
          {/* Floor riser slab */}
          <CADBox position={[0, 0, 0]} size={[10.5, 0.35, 1.2]} isDimmed={isDimmed} />
          {/* Curved seating strip */}
          <CADBox position={[0, 0.35, 0.1]} size={[9.8, 0.45, 0.45]} isDimmed={isDimmed} />
        </group>
      ))}
    </group>
  );
};

// --- DEAN'S OFFICE & COUNCIL ---
const DeanOfficeInterior: React.FC<{ isDimmed?: boolean }> = ({ isDimmed }) => {
  return (
    <group>
      {/* Executive Conference Table */}
      <CADBox position={[0, -0.7, -0.5]} size={[4.8, 0.15, 2.2]} isDimmed={isDimmed} />
      {/* Table pedestal base */}
      <CADBox position={[-1.4, -1.0, -0.5]} size={[0.8, 0.6, 1.2]} isDimmed={isDimmed} />
      <CADBox position={[1.4, -1.0, -0.5]} size={[0.8, 0.6, 1.2]} isDimmed={isDimmed} />

      {/* Executive Chairs around table */}
      {[-1.8, -0.6, 0.6, 1.8].map((x, i) => (
        <group key={`conf-chair-${i}`}>
          <CADBox position={[x, -0.8, -1.8]} size={[0.5, 0.7, 0.5]} isDimmed={isDimmed} />
          <CADBox position={[x, -0.8, 0.8]} size={[0.5, 0.7, 0.5]} isDimmed={isDimmed} />
        </group>
      ))}

      {/* Dean's Desk in alcove */}
      <CADBox position={[-3.8, -0.7, 2.0]} size={[2.2, 0.75, 1.1]} isDimmed={isDimmed} />
      <CADBox position={[-3.8, -0.6, 2.8]} size={[0.6, 0.9, 0.6]} isDimmed={isDimmed} />

      {/* Executive Credenza & Display Wall */}
      <CADBox position={[0, 0.3, -3.5]} size={[5.5, 1.8, 0.1]} isDimmed={isDimmed} />
    </group>
  );
};

// --- SCADA NOC CONTROL ROOM ---
const ControlRoomInterior: React.FC<{ isDimmed?: boolean }> = ({ isDimmed }) => {
  return (
    <group>
      {/* Curved SCADA Video Wall */}
      <CADBox position={[0, 0.2, -3.2]} size={[9.2, 2.2, 0.15]} isDimmed={isDimmed} />

      {/* Operator Curved Console Desks */}
      <CADBox position={[-2.5, -0.7, 0]} size={[3.2, 0.75, 1.2]} isDimmed={isDimmed} />
      <CADBox position={[2.5, -0.7, 0]} size={[3.2, 0.75, 1.2]} isDimmed={isDimmed} />

      {/* Multi-monitor mounts on consoles */}
      {[-3.2, -1.8, 1.8, 3.2].map((x, i) => (
        <CADBox key={`mon-${i}`} position={[x, -0.15, 0.1]} size={[0.7, 0.45, 0.08]} isDimmed={isDimmed} />
      ))}

      {/* Operator Aeron Chairs */}
      {[-2.5, 2.5].map((x, i) => (
        <CADBox key={`op-chair-${i}`} position={[x, -0.75, 1.0]} size={[0.6, 0.8, 0.6]} isDimmed={isDimmed} />
      ))}
    </group>
  );
};

// --- ROOFTOP SOLAR ARRAY & TELECOM MAST ---
const RooftopArrayInterior: React.FC<{ isDimmed?: boolean }> = ({ isDimmed }) => {
  // 6 banks of tilted solar panels
  const panelXs = [-10, -6, -2, 2, 6, 10];

  return (
    <group>
      {/* Solar PV Panels mounted on frames */}
      {panelXs.map((x, i) => (
        <group key={`pv-${i}`} position={[x, 0.2, 0]} rotation={[-0.35, 0, 0]}>
          {/* Angled PV module table */}
          <CADBox size={[3.2, 0.08, 3.8]} isDimmed={isDimmed} />
          {/* Subdivided solar cell grids */}
          <CADBox position={[0, 0.05, 0]} size={[3.0, 0.02, 3.6]} isDimmed={isDimmed} />
        </group>
      ))}

      {/* Telecom / Microwave Lattice Mast */}
      <group position={[0, 2.2, -2.0]}>
        {/* 4-leg lattice tower frame */}
        <CADBox size={[1.2, 4.4, 1.2]} isDimmed={isDimmed} />
        {/* Top crossarm */}
        <CADBox position={[0, 2.2, 0]} size={[2.2, 0.2, 0.4]} isDimmed={isDimmed} />
        {/* Microwave Drum Antenna */}
        <CADBox position={[-0.9, 1.5, 0.4]} size={[0.7, 0.7, 0.4]} isDimmed={isDimmed} />
        {/* 5G MIMO Sector Antennas */}
        <CADBox position={[0.9, 2.0, 0]} size={[0.2, 1.2, 0.3]} isDimmed={isDimmed} />
        {/* Lightning arrestor rod */}
        <CADBox position={[0, 2.6, 0]} size={[0.08, 0.8, 0.08]} isDimmed={isDimmed} />
      </group>
    </group>
  );
};
