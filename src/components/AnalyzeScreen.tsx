import React, { useState } from 'react';
import { Ingredient, RefillRecord } from '../types';
import { Cpu, Camera, Plus, Check, RefreshCw, Layers } from 'lucide-react';

interface AnalyzeScreenProps {
  ingredients: Ingredient[];
  onShootRecord: (detectedUpdates: { id: string; percentage: number; addedQty: string }[]) => void;
  isDemo?: boolean;
}

export default function AnalyzeScreen({ ingredients, onShootRecord, isDemo = false }: AnalyzeScreenProps) {
  const [shutterFlash, setShutterFlash] = useState(false);
  const [scenario, setScenario] = useState<'standard' | 'depleted' | 'refilled'>('standard');
  const [hasRecorded, setHasRecorded] = useState(false);

  // Scenarios determine what the simulated AI camera is currently "seeing"
  const getSimulatedDetections = () => {
    switch (scenario) {
      case 'depleted':
        return [
          { id: 'olive-oil', name: 'Olive Oil', percentage: 10, label: 'OLIVE OIL - 10% REMAINING (CRITICAL)', addedQty: '+50ml (Manual Adjustment)' },
          { id: 'fresh-basil', name: 'Fresh Basil', percentage: 5, label: 'FRESH BASIL - 5% (CRITICAL)', addedQty: '+10g (Depleted Stock)' },
          { id: 'walnuts', name: 'Walnuts', percentage: 12, label: 'WALNUTS - 12% (CRITICAL)', addedQty: '+20g' }
        ];
      case 'refilled':
        return [
          { id: 'olive-oil', name: 'Olive Oil', percentage: 95, label: 'OLIVE OIL - 95% CAPACITY (FULL)', addedQty: '+650ml' },
          { id: 'fresh-basil', name: 'Fresh Basil', percentage: 100, label: 'FRESH BASIL - 100% (REFILLED)', addedQty: '+60g' },
          { id: 'walnuts', name: 'Walnuts', percentage: 90, label: 'WALNUTS - 90% (REFILLED)', addedQty: '+200g' }
        ];
      case 'standard':
      default:
        return [
          { id: 'olive-oil', name: 'Olive Oil', percentage: 30, label: 'OLIVE OIL - 30% REMAINING', addedQty: '+150ml' },
          { id: 'fresh-basil', name: 'Fresh Basil', percentage: 40, label: 'FRESH BASIL - 40% STABLE', addedQty: '+40g' },
          { id: 'walnuts', name: 'Walnuts', percentage: 50, label: 'WALNUTS - 50% STABLE', addedQty: '+120g' }
        ];
    }
  };

  const detections = getSimulatedDetections();

  const handleShoot = () => {
    // 1. Shutter flash effect
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 250);

    // 2. Prepare payload to record
    const updates = detections.map(d => ({
      id: d.id,
      percentage: d.percentage,
      addedQty: d.addedQty
    }));

    // 3. Callback to trigger global state change
    onShootRecord(updates);

    // 4. Temporary success status
    setHasRecorded(true);
    setTimeout(() => setHasRecorded(false), 3000);
  };

  const handleNonDemoShoot = () => {
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 250);
    setHasRecorded(true);
    setTimeout(() => setHasRecorded(false), 3000);
  };

  if (!isDemo) {
    return (
      <div className="w-full flex-1 bg-black text-[#fcf9f8] flex flex-col font-sans overflow-hidden select-none pb-20">
        {/* Top Header */}
        <div className="p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f0ff] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#00f0ff]"></span>
            </span>
            <span className="text-xs font-mono font-bold tracking-widest text-[#00f0ff]">AI ACTIVE</span>
          </div>
        </div>

        {/* Camera preview area */}
        <div className="flex-1 relative flex flex-col p-4 justify-between min-h-[400px]">
          <div className="absolute inset-0 z-0 bg-[#0d0d0d] flex items-center justify-center overflow-hidden">
            <div className="text-center select-none pointer-events-none opacity-20 flex flex-col items-center">
              <Camera size={40} className="text-neutral-600 mb-2" />
              <span className="text-xs font-mono tracking-widest">CAMERA PREVIEW FEED [LIVE]</span>
              <span className="text-[9px] font-mono mt-1 text-neutral-500">1080P • COLD ACCURACY</span>
            </div>

            {shutterFlash && (
              <div className="absolute inset-0 bg-white z-40 transition-opacity duration-150 animate-flash-shutter" />
            )}
          </div>

          {/* Bottom controls */}
          <div className="z-10 w-full flex flex-col items-center gap-3 mt-auto pb-4">
            {hasRecorded && (
              <div className="bg-[#00f0ff]/15 border border-[#00f0ff]/40 px-4 py-2 text-[#00f0ff] font-mono text-[10px] tracking-wider rounded uppercase animate-bounce-short flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                <Check size={12} />
                SCAN CAPTURED • AI LABELING COMING SOON
              </div>
            )}

            <div className="flex items-center justify-center w-full px-2">
              <button
                onClick={handleNonDemoShoot}
                className="w-14 h-14 bg-[#fcf9f8] text-black hover:bg-white active:scale-90 transition-all rounded-full flex items-center justify-center shadow-2xl border-4 border-neutral-800"
                title="Capture scan"
              >
                <Camera size={22} className="text-black" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 bg-black text-[#fcf9f8] flex flex-col font-sans overflow-hidden select-none pb-20">
      {/* Top Header - No title bar as requested, but minimal AI indicators and info cards */}
      <div className="p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
        {/* Breathing AI is Active Indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f0ff] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#00f0ff]"></span>
          </span>
          <span className="text-xs font-mono font-bold tracking-widest text-[#00f0ff]">AI ACTIVE</span>
        </div>

        {/* Floating Scenario Switcher (to show AI capability off) */}
        <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded px-2 py-1">
          <Layers size={11} className="text-[#6a7a7b]" />
          <select 
            value={scenario} 
            onChange={(e) => setScenario(e.target.value as any)}
            className="bg-transparent text-[10px] font-mono font-semibold text-[#fcf9f8] focus:outline-none cursor-pointer"
          >
            <option value="standard" className="bg-neutral-900">Feed: Standard</option>
            <option value="depleted" className="bg-neutral-900">Feed: Low Stock</option>
            <option value="refilled" className="bg-neutral-900">Feed: Full restocked</option>
          </select>
        </div>
      </div>

      {/* Main Cam Space Wrapper */}
      <div className="flex-1 relative flex flex-col p-4 justify-between min-h-[400px]">
        {/* Top Info Widgets */}
        <div className="space-y-2 max-w-xs ml-auto z-10">
          {/* KITCHEN STATS */}
          <div className="bg-neutral-900/80 border border-neutral-800 p-3 rounded shadow-lg backdrop-blur-sm">
            <span className="text-[9px] font-mono text-[#6a7a7b] tracking-wider block uppercase">Kitchen Stats</span>
            <div className="flex justify-between items-baseline mt-1">
              <span className="text-2xl font-bold font-sans">24</span>
              <span className="text-[9px] font-mono text-[#00f0ff] tracking-widest font-semibold">ITEMS TRACKED</span>
            </div>
            <div className="flex justify-between text-[9px] font-mono text-neutral-400 mt-2 border-t border-neutral-800 pt-1.5">
              <span>LATENCY: 12ms</span>
              <span>CONFIDENCE: 99.2%</span>
            </div>
          </div>

          {/* ACTIVE RECIPE */}
          <div className="bg-neutral-900/80 border border-neutral-800 p-3 rounded shadow-lg backdrop-blur-sm">
            <span className="text-[9px] font-mono text-[#6a7a7b] tracking-wider block uppercase">Active Recipe</span>
            <h4 className="text-sm font-bold text-white mt-1 font-sans">Mushroom Risotto</h4>
            <div className="flex gap-1.5 mt-2.5">
              <span className="text-[8px] font-mono bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 px-1.5 py-0.5 rounded font-bold uppercase">
                RICE FOUND
              </span>
              <span className="text-[8px] font-mono bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 px-1.5 py-0.5 rounded font-bold uppercase">
                OIL FOUND
              </span>
            </div>
          </div>
        </div>

        {/* Central Camera preview blacked-out area with floating labels & outlines */}
        <div className="absolute inset-0 z-0 bg-[#0d0d0d] flex items-center justify-center overflow-hidden">
          {/* Camera locked label in background */}
          <div className="text-center select-none pointer-events-none opacity-20 flex flex-col items-center">
            <Camera size={40} className="text-neutral-600 mb-2" />
            <span className="text-xs font-mono tracking-widest">CAMERA PREVIEW FEED [LIVE]</span>
            <span className="text-[9px] font-mono mt-1 text-neutral-500">1080P • COLD ACCURACY</span>
          </div>

          {/* Shutter flash overlay */}
          {shutterFlash && (
            <div className="absolute inset-0 bg-white z-40 transition-opacity duration-150 animate-flash-shutter" />
          )}

          {/* SIMULATED INGREDIENTS OUTLINES - White Dashed Lines as requested */}
          <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-around">
            {/* Box 1: Olive Oil (Top Left quadrant-ish) */}
            <div className="absolute top-[22%] left-[8%] w-[42%] h-[24%] border-2 border-dashed border-white/95 rounded flex flex-col justify-between p-2">
              <span className="text-[10px] font-mono text-white bg-black/80 border border-white/20 px-1.5 py-0.5 rounded self-start font-semibold uppercase tracking-wider backdrop-blur-xs">
                {detections[0].label}
              </span>
              <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden self-end">
                <div className="bg-white h-full" style={{ width: `${detections[0].percentage}%` }} />
              </div>
            </div>

            {/* Box 2: Fresh Basil (Middle Right quadrant) */}
            <div className="absolute top-[50%] right-[6%] w-[44%] h-[20%] border-2 border-dashed border-white/95 rounded flex flex-col justify-between p-2">
              <span className="text-[10px] font-mono text-white bg-black/80 border border-white/20 px-1.5 py-0.5 rounded self-start font-semibold uppercase tracking-wider backdrop-blur-xs">
                {detections[1].label}
              </span>
              <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden self-end">
                <div className="bg-white h-full" style={{ width: `${detections[1].percentage}%` }} />
              </div>
            </div>

            {/* Box 3: Walnuts Container (Bottom Left quadrant) */}
            <div className="absolute bottom-[20%] left-[6%] w-[40%] h-[22%] border-2 border-dashed border-white/95 rounded flex flex-col justify-between p-2">
              <span className="text-[10px] font-mono text-white bg-black/80 border border-white/20 px-1.5 py-0.5 rounded self-start font-semibold uppercase tracking-wider backdrop-blur-xs">
                {detections[2].label}
              </span>
              <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden self-end">
                <div className="bg-white h-full" style={{ width: `${detections[2].percentage}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Shoot controls - Elevated so not blocked by bottom navigation bar */}
        <div className="z-10 w-full flex flex-col items-center gap-3 mt-auto pb-4">
          {/* Notification Overlay of successfully recorded log */}
          {hasRecorded && (
            <div className="bg-[#00f0ff]/15 border border-[#00f0ff]/40 px-4 py-2 text-[#00f0ff] font-mono text-[10px] tracking-wider rounded uppercase animate-bounce-short flex items-center gap-1.5 shadow-lg backdrop-blur-md">
              <Check size={12} />
              KITCHEN STATE COMMITTED TO CLOUD & PERSISTENCE
            </div>
          )}

          <div className="flex items-center justify-between w-full max-w-xs px-2">
            <div className="text-[10px] font-mono text-[#6a7a7b] leading-tight max-w-[120px]">
              Tap "SHOOT" to snapshot and log current level changes.
            </div>

            {/* Big Shoot Button (Moved slightly upwards as requested) */}
            <button
              onClick={handleShoot}
              className="w-14 h-14 bg-[#fcf9f8] text-black hover:bg-white active:scale-90 transition-all rounded-full flex items-center justify-center shadow-2xl border-4 border-neutral-800"
              title="Record current levels"
            >
              <Camera size={22} className="text-black" />
            </button>

            {/* Calibration indicator */}
            <button
              onClick={() => {
                setScenario(prev => prev === 'standard' ? 'depleted' : prev === 'depleted' ? 'refilled' : 'standard');
              }}
              className="p-2.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 active:scale-95 text-[#fcf9f8] transition-all rounded"
              title="Cycle Simulated Target Ingredients"
            >
              <RefreshCw size={14} className="animate-spin-slow" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
