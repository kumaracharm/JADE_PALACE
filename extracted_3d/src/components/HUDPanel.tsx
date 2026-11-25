import React from 'react';
import { LAYERS } from '../data/campusData';
import { LayerId } from '../types/blueprint';
import { Layers, Sliders, Zap, Network, Activity } from 'lucide-react';

interface HUDPanelProps {
  selectedLayerId: LayerId;
  onSelectLayer: (layerId: LayerId) => void;
  explodedDistance: number;
  onExplodedChange: (dist: number) => void;
  showPower: boolean;
  onTogglePower: () => void;
  showData: boolean;
  onToggleData: () => void;
  showPulses: boolean;
  onTogglePulses: () => void;
  powerCutCount: number;
}

export const HUDPanel: React.FC<HUDPanelProps> = ({
  selectedLayerId,
  onSelectLayer,
  explodedDistance,
  onExplodedChange,
  showPower,
  onTogglePower,
  showData,
  onToggleData,
  showPulses,
  onTogglePulses,
  powerCutCount
}) => {
  return (
    <div className="absolute top-16 left-6 z-20 w-80 pointer-events-auto">
      {/* CAD Panel Container */}
      <div className="cad-panel cad-corner-marks p-4 text-xs space-y-4">
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-white/20 pb-2.5">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-white" />
            <span className="font-bold tracking-wider text-white uppercase text-[11px]">
              Architectural Layers
            </span>
          </div>
          <span className="text-[10px] text-white/50 font-mono tracking-widest">
            CAD-LVL-04
          </span>
        </div>

        {/* Layer Buttons */}
        <div className="space-y-1.5">
          {/* ALL FLOORS */}
          <button
            onClick={() => onSelectLayer('all')}
            className={`w-full text-left px-3 py-2 border transition-colors flex items-center justify-between ${
              selectedLayerId === 'all'
                ? 'bg-white/20 border-white text-white shadow-sm font-semibold'
                : 'bg-transparent border-white/20 text-white/70 hover:border-white/50 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full border border-white inline-block bg-white/40" />
              <span>OVERALL CAMPUS (ALL)</span>
            </div>
            <span className="text-[10px] font-mono text-white/60">15 ROOMS</span>
          </button>

          {/* LAYER 4 (TOP) TO LAYER 1 (GROUND) */}
          {[...LAYERS].reverse().map(layer => {
            const isSelected = selectedLayerId === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => onSelectLayer(layer.id)}
                className={`w-full text-left px-3 py-2 border transition-colors ${
                  isSelected
                    ? 'bg-white/20 border-white text-white font-semibold shadow-sm'
                    : 'bg-transparent border-white/20 text-white/70 hover:border-white/50 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-white/60 font-semibold tracking-wider">
                    {layer.planeNumber}
                  </span>
                  <span className="text-[9px] font-mono border border-white/20 px-1 py-0.5 text-white/50">
                    +{layer.elevationY.toFixed(1)}m
                  </span>
                </div>
                <div className="text-[11px] text-white mt-0.5 font-medium truncate">
                  {layer.title}
                </div>
                <div className="text-[9px] text-white/50 truncate font-mono mt-0.5">
                  {layer.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* EXPLODED VIEW CONTROL */}
        <div className="pt-2 border-t border-white/20 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-white/80" />
              <span className="font-semibold text-white/90 text-[11px] tracking-wide uppercase">
                Exploded View
              </span>
            </div>
            <span className="font-mono text-[10px] text-white/70">
              {Math.round((explodedDistance / 8) * 100)}% ({explodedDistance.toFixed(1)}m)
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="range"
              min="0"
              max="8"
              step="0.1"
              value={explodedDistance}
              onChange={(e) => onExplodedChange(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/20 rounded-none appearance-none cursor-pointer accent-white"
            />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-white/40">
            <span>0.0m (COMPACT)</span>
            <span>4.0m</span>
            <span>8.0m (ISOLATED)</span>
          </div>
        </div>

        {/* UTILITY CONDUIT OVERLAYS */}
        <div className="pt-2 border-t border-white/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white/90 text-[11px] tracking-wide uppercase">
              Utility Feeder Network
            </span>
            {powerCutCount > 0 && (
              <span className="text-[9px] font-mono text-red-300 border border-red-400/50 px-1.5 py-0.5 bg-red-900/30">
                {powerCutCount} ISOLATED
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {/* Power Bus */}
            <button
              onClick={onTogglePower}
              className={`p-1.5 border text-center transition-colors ${
                showPower
                  ? 'border-white bg-white/15 text-white'
                  : 'border-white/20 text-white/40 hover:text-white/70'
              }`}
            >
              <Zap className="w-3.5 h-3.5 mx-auto mb-1 text-white" />
              <span className="block text-[9px] font-mono uppercase">Power</span>
            </button>

            {/* Data Fiber */}
            <button
              onClick={onToggleData}
              className={`p-1.5 border text-center transition-colors ${
                showData
                  ? 'border-white bg-white/15 text-white'
                  : 'border-white/20 text-white/40 hover:text-white/70'
              }`}
            >
              <Network className="w-3.5 h-3.5 mx-auto mb-1 text-white" />
              <span className="block text-[9px] font-mono uppercase">Data</span>
            </button>

            {/* Pulses */}
            <button
              onClick={onTogglePulses}
              className={`p-1.5 border text-center transition-colors ${
                showPulses
                  ? 'border-white bg-white/15 text-white'
                  : 'border-white/20 text-white/40 hover:text-white/70'
              }`}
            >
              <Activity className="w-3.5 h-3.5 mx-auto mb-1 text-white" />
              <span className="block text-[9px] font-mono uppercase">Pulses</span>
            </button>
          </div>
        </div>

        {/* CAD Blueprint Note */}
        <div className="pt-1 text-[9px] text-white/40 font-mono leading-tight border-t border-white/10">
          * Click any 3D room to inspect technical schematics or toggle power cut simulation.
        </div>
      </div>
    </div>
  );
};
