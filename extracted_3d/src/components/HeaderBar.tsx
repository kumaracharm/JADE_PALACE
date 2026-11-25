import React from 'react';
import { RotateCcw, Compass, Box, Eye } from 'lucide-react';

interface HeaderBarProps {
  onResetView: () => void;
  viewPreset: 'iso' | 'top' | 'front' | 'side';
  onChangeViewPreset: (preset: 'iso' | 'top' | 'front' | 'side') => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onResetView,
  viewPreset,
  onChangeViewPreset
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 h-14 border-b border-white/20 bg-[#07264d]/90 backdrop-blur-md px-6 flex items-center justify-between pointer-events-auto">
      {/* CAD Blueprint Title Block */}
      <div className="flex items-center space-x-4">
        <div className="border border-white/40 px-2 py-1 bg-white/10 flex items-center space-x-2">
          <Box className="w-4 h-4 text-white" />
          <span className="font-bold tracking-widest text-xs uppercase text-white font-mono">
            CAD-TWIN // CAMPUS-01
          </span>
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide uppercase">
            Engineering College Campus — 3D Blueprint Digital Twin
          </h1>
          <div className="text-[10px] text-white/50 font-mono tracking-wider">
            DWG NO: AGY-CAMPUS-2026-REV4 // ARCHITECTURAL & UTILITY CORE
          </div>
        </div>
      </div>

      {/* Right Controls: View Presets & Reset */}
      <div className="flex items-center space-x-3">
        {/* Scale indicator */}
        <div className="hidden md:flex items-center border border-white/20 px-2 py-1 text-[10px] font-mono text-white/70">
          <span>SCALE 1:100 CAD</span>
        </div>

        {/* View Presets */}
        <div className="flex items-center border border-white/25 text-[10px] font-mono">
          <button
            onClick={() => onChangeViewPreset('iso')}
            className={`px-2.5 py-1 transition-colors ${
              viewPreset === 'iso'
                ? 'bg-white text-[#0B3B75] font-bold'
                : 'text-white/70 hover:text-white'
            }`}
          >
            ISO 3D
          </button>
          <button
            onClick={() => onChangeViewPreset('top')}
            className={`px-2.5 py-1 border-l border-white/20 transition-colors ${
              viewPreset === 'top'
                ? 'bg-white text-[#0B3B75] font-bold'
                : 'text-white/70 hover:text-white'
            }`}
          >
            PLAN (TOP)
          </button>
          <button
            onClick={() => onChangeViewPreset('front')}
            className={`px-2.5 py-1 border-l border-white/20 transition-colors ${
              viewPreset === 'front'
                ? 'bg-white text-[#0B3B75] font-bold'
                : 'text-white/70 hover:text-white'
            }`}
          >
            ELEV (FRONT)
          </button>
          <button
            onClick={() => onChangeViewPreset('side')}
            className={`px-2.5 py-1 border-l border-white/20 transition-colors ${
              viewPreset === 'side'
                ? 'bg-white text-[#0B3B75] font-bold'
                : 'text-white/70 hover:text-white'
            }`}
          >
            ELEV (WEST)
          </button>
        </div>

        {/* RESET VIEW BUTTON */}
        <button
          onClick={onResetView}
          className="border border-white/40 hover:border-white px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono tracking-wider uppercase transition-colors flex items-center space-x-1.5 shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5 text-white" />
          <span>Reset View</span>
        </button>
      </div>
    </header>
  );
};
