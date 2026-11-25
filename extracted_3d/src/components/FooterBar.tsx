import React from 'react';
import { Zap, Sun, Activity, Database, CheckCircle } from 'lucide-react';

interface FooterBarProps {
  totalCampusLoadKW: number;
  solarGenerationKW: number;
  powerCutCount: number;
}

export const FooterBar: React.FC<FooterBarProps> = ({
  totalCampusLoadKW,
  solarGenerationKW,
  powerCutCount
}) => {
  const netGridDraw = Math.max(0, totalCampusLoadKW - solarGenerationKW);

  return (
    <footer className="absolute bottom-0 left-0 right-0 z-30 h-10 border-t border-white/20 bg-[#07264d]/90 backdrop-blur-md px-6 flex items-center justify-between text-[10px] font-mono text-white/70 pointer-events-auto">
      {/* Left System Telemetry */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-1.5">
          <Zap className="w-3.5 h-3.5 text-white" />
          <span className="text-white/50">CAMPUS LOAD:</span>
          <span className="text-white font-bold">{totalCampusLoadKW.toFixed(0)} kW</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <Sun className="w-3.5 h-3.5 text-white" />
          <span className="text-white/50">ROOF SOLAR PV:</span>
          <span className="text-white font-bold">+{solarGenerationKW.toFixed(0)} kW</span>
        </div>

        <div className="hidden sm:flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-white" />
          <span className="text-white/50">NET GRID DRAW:</span>
          <span className="text-white font-bold">{netGridDraw.toFixed(0)} kW</span>
        </div>

        <div className="hidden md:flex items-center space-x-1.5">
          <Database className="w-3.5 h-3.5 text-white" />
          <span className="text-white/50">DATACENTER UPTIME:</span>
          <span className="text-white font-bold">99.998%</span>
        </div>
      </div>

      {/* Right System Status */}
      <div className="flex items-center space-x-4">
        {powerCutCount > 0 ? (
          <div className="border border-red-400 bg-red-950/50 px-2 py-0.5 text-red-200">
            SIMULATION: {powerCutCount} CIRCUIT(S) ISOLATED
          </div>
        ) : (
          <div className="flex items-center space-x-1 border border-white/20 px-2 py-0.5 text-white/80">
            <CheckCircle className="w-3 h-3 text-white" />
            <span>GRID NORMAL // ALL FEEDERS SYNCHRONIZED</span>
          </div>
        )}

        <div className="border-l border-white/20 pl-4 text-white/40 hidden lg:block">
          CAD ENGINE: THREE.JS R173 / BLUEPRINT EDGES RENDERER
        </div>
      </div>
    </footer>
  );
};
