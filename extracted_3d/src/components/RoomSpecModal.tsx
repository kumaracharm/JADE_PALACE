import React from 'react';
import { RoomSpec } from '../types/blueprint';
import { X, Power, Zap, Cpu, Maximize2, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface RoomSpecModalProps {
  room: RoomSpec | null;
  onClose: () => void;
  isPowerCut: boolean;
  onTogglePowerCut: (roomId: string) => void;
}

export const RoomSpecModal: React.FC<RoomSpecModalProps> = ({
  room,
  onClose,
  isPowerCut,
  onTogglePowerCut
}) => {
  if (!room) return null;

  return (
    <div className="absolute top-16 right-6 z-20 w-96 pointer-events-auto">
      <div className="cad-panel cad-panel-active cad-corner-marks p-5 text-xs space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/30 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono px-1.5 py-0.5 border border-white/50 text-white font-bold bg-white/10">
                {room.code}
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 border flex items-center space-x-1 ${
                isPowerCut
                  ? 'border-red-400 bg-red-900/40 text-red-200'
                  : 'border-white/50 bg-emerald-950/40 text-white'
              }`}>
                {isPowerCut ? (
                  <>
                    <ShieldAlert className="w-2.5 h-2.5 mr-1" />
                    <span>OFFLINE / CUT</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                    <span>ONLINE / ACTIVE</span>
                  </>
                )}
              </span>
            </div>
            <h2 className="text-sm font-bold text-white mt-1.5 leading-snug">
              {room.name}
            </h2>
            <div className="text-[10px] text-white/60 font-mono mt-0.5">
              {room.department}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 border border-white/30 hover:border-white text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Technical Telemetry Grid */}
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="p-2 border border-white/20 bg-white/5">
            <span className="text-white/50 block text-[9px]">CAPACITY / OCCUPANCY</span>
            <span className="text-white font-semibold text-[11px]">{room.capacity}</span>
          </div>

          <div className="p-2 border border-white/20 bg-white/5">
            <span className="text-white/50 block text-[9px]">ACTIVE LOAD (EST)</span>
            <span className={`font-semibold text-[11px] ${isPowerCut ? 'text-red-300' : 'text-white'}`}>
              {isPowerCut ? '0.0 kW (ISOLATED)' : `${room.standardLoadKW} kW`}
            </span>
          </div>

          <div className="p-2 border border-white/20 bg-white/5 col-span-2">
            <div className="flex items-center space-x-1 text-white/50 text-[9px] mb-0.5">
              <Zap className="w-3 h-3 text-white" />
              <span>POWER BUS CONNECTION</span>
            </div>
            <span className="text-white block font-mono text-[10px] leading-tight">
              {room.powerBusConnection}
            </span>
          </div>

          <div className="p-2 border border-white/20 bg-white/5 col-span-2">
            <div className="flex items-center space-x-1 text-white/50 text-[9px] mb-0.5">
              <Cpu className="w-3 h-3 text-white" />
              <span>NETWORK BACKBONE NODE</span>
            </div>
            <span className="text-white block font-mono text-[10px] leading-tight">
              {room.networkNode}
            </span>
          </div>

          <div className="p-2 border border-white/20 bg-white/5">
            <span className="text-white/50 block text-[9px]">DIMENSIONS (W x D x H)</span>
            <span className="text-white">
              {room.dimensions.width}m × {room.dimensions.depth}m × {room.dimensions.height}m
            </span>
          </div>

          <div className="p-2 border border-white/20 bg-white/5">
            <span className="text-white/50 block text-[9px]">CRITICALITY CLASS</span>
            <span className="text-white font-semibold">{room.criticality}</span>
          </div>
        </div>

        {/* Equipment Inventory */}
        <div className="space-y-1.5 border-t border-white/20 pt-2.5">
          <span className="text-[10px] text-white/60 font-mono tracking-wider uppercase block">
            Cadastral Equipment & Assets ({room.equipment.length})
          </span>
          <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
            {room.equipment.map((item, idx) => (
              <div
                key={idx}
                className="px-2 py-1 border border-white/10 bg-white/5 text-white/80 truncate"
              >
                • {item}
              </div>
            ))}
          </div>
        </div>

        {/* Room Architectural Description */}
        <div className="text-[10px] text-white/70 leading-relaxed font-mono border-t border-white/10 pt-2">
          {room.description}
        </div>

        {/* SIMULATE POWER CUT TOGGLE SWITCH */}
        <div className="pt-3 border-t border-white/25">
          <div className={`p-3 border transition-colors ${
            isPowerCut
              ? 'border-red-400 bg-red-950/30'
              : 'border-white/30 bg-white/5'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  <Power className={`w-3.5 h-3.5 ${isPowerCut ? 'text-red-400' : 'text-white'}`} />
                  <span className="font-bold text-[11px] text-white uppercase tracking-wider">
                    Simulate Power Cut
                  </span>
                </div>
                <div className="text-[9px] text-white/50 font-mono mt-0.5">
                  {isPowerCut
                    ? 'Current isolated. Pulse particles halted.'
                    : 'Feeder breaker closed. Live current flowing.'}
                </div>
              </div>

              {/* Minimalist CAD Toggle Switch */}
              <button
                onClick={() => onTogglePowerCut(room.id)}
                className={`relative inline-flex h-6 w-12 items-center border transition-colors focus:outline-none ${
                  isPowerCut
                    ? 'border-red-400 bg-red-800'
                    : 'border-white bg-white/20 hover:bg-white/30'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform border border-white bg-white transition-transform ${
                    isPowerCut ? 'translate-x-7 bg-red-200' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
