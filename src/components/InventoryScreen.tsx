import React, { useState, useEffect } from 'react';
import { Ingredient, RefillRecord } from '../types';
import { ArrowUpRight, ShieldAlert, Cpu, Check, HelpCircle, ChevronRight, X, ChevronDown, Trash2 } from 'lucide-react';

interface InventoryScreenProps {
  ingredients: Ingredient[];
  refills: RefillRecord[];
  onManualRefill: (name: string, qty: string) => void;
  onDeleteRefill: (id: string) => void;
  darkMode: boolean;
  isDemo?: boolean;
}

export default function InventoryScreen({ ingredients, refills, onManualRefill, onDeleteRefill, darkMode, isDemo = false }: InventoryScreenProps) {
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [manualIngredient, setManualIngredient] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualUnit, setManualUnit] = useState('g');
  const [showManualForm, setShowManualForm] = useState(false);
  const [swipeOffsets, setSwipeOffsets] = useState<Record<string, number>>({});
  const swipeRef = React.useRef<{ id: string; startX: number; startOffset: number } | null>(null);
  const DELETE_WIDTH = 64;
  const DELETE_EXTRA = 56;
  const DELETE_TRIGGER = -(DELETE_WIDTH + DELETE_EXTRA); // -120
  const MAX_DRAG = DELETE_WIDTH + DELETE_EXTRA * 2; // 176

  const UNITS = ['g', 'kg', 'ml', 'l', 'oz', 'lb', 'pcs', '%'];

  useEffect(() => {
    if (!showManualForm) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeManualForm();
        return;
      }
      if (e.key === 'Enter') {
        if (manualIngredient && manualAmount && Number(manualAmount) > 0) {
          handleAddManualRefill();
        }
        return;
      }
      // Let the ingredient input receive normal keystrokes
      if (document.activeElement instanceof HTMLInputElement) return;

      if (/^[0-9]$/.test(e.key)) {
        handleNumpad(e.key);
      } else if (e.key === '.' || e.key === ',') {
        handleNumpad('.');
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleNumpad('DEL');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showManualForm, manualIngredient, manualAmount, manualUnit]);

  // Spoilage risk items (High risk or critical status)
  const spoilageItems = ingredients.filter(i => i.spoilageRisk === 'High');

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  // Derive depletion trend from actual ingredient data.
  const avgPercentage = ingredients.length
    ? Math.round(ingredients.reduce((acc, i) => acc + i.percentage, 0) / ingredients.length)
    : 0;
  const avgFreshness = ingredients.length
    ? Math.round(ingredients.reduce((acc, i) => acc + i.freshness, 0) / ingredients.length)
    : 0;

  const computeTrend = (endValue: number) => {
    const points: number[] = [];
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const base = 100 - (100 - endValue) * t;
      const noise = Math.sin(i * 1.5) * 3;
      points.push(Math.max(0, Math.min(100, Math.round(base + noise))));
    }
    return points;
  };

  const primaryPoints = ingredients.length ? computeTrend(avgPercentage) : [];
  const secondaryPoints = ingredients.length ? computeTrend(avgFreshness) : [];

  const getX = (idx: number) => 10 + (idx * 480) / 6;
  const getY = (value: number) => 130 - (value / 100) * 110;
  const buildPath = (points: number[]) =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p)}`).join(' ');

  const closeManualForm = () => {
    setManualIngredient('');
    setManualAmount('');
    setManualUnit('g');
    setShowManualForm(false);
  };

  const handleAddManualRefill = () => {
    if (!manualIngredient || !manualAmount) return;
    const qty = `+${manualAmount}${manualUnit}`;
    onManualRefill(manualIngredient, qty);
    closeManualForm();
  };

  const handleNumpad = (key: string) => {
    if (key === 'DEL') {
      setManualAmount(prev => prev.slice(0, -1));
    } else if (key === '.') {
      setManualAmount(prev => {
        if (prev.includes('.')) return prev;
        return prev === '' ? '0.' : prev + '.';
      });
    } else {
      setManualAmount(prev => (prev.length < 6 ? prev + key : prev));
    }
  };

  // Swipe-to-delete helpers
  const handlePointerStart = (id: string, clientX: number) => {
    swipeRef.current = { id, startX: clientX, startOffset: swipeOffsets[id] || 0 };
    setSwipeOffsets(prev => {
      const next: Record<string, number> = {};
      Object.keys(prev).forEach(k => { if (k !== id) next[k] = 0; });
      next[id] = prev[id] || 0;
      return next;
    });
  };

  const handlePointerMove = (id: string, clientX: number) => {
    if (!swipeRef.current || swipeRef.current.id !== id) return;
    const delta = clientX - swipeRef.current.startX;
    const raw = swipeRef.current.startOffset + delta;
    const clamped = Math.max(-MAX_DRAG, Math.min(0, raw));
    setSwipeOffsets(prev => ({ ...prev, [id]: clamped }));
  };

  const handlePointerEnd = (id: string, clientX: number) => {
    if (!swipeRef.current || swipeRef.current.id !== id) return;
    const delta = clientX - swipeRef.current.startX;
    const startOffset = swipeRef.current.startOffset;
    const current = swipeOffsets[id] || 0;
    let snapped = current;

    if (current <= DELETE_TRIGGER) {
      // Second-stage pull: delete the entry
      onDeleteRefill(id);
      setSwipeOffsets(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else if (Math.abs(delta) < 5 && startOffset !== 0) {
      // Tap-to-close when already open
      snapped = 0;
      setSwipeOffsets(prev => ({ ...prev, [id]: snapped }));
    } else {
      // Snap open or closed
      snapped = current < -DELETE_WIDTH / 2 ? -DELETE_WIDTH : 0;
      setSwipeOffsets(prev => ({ ...prev, [id]: snapped }));
    }
    swipeRef.current = null;
  };

  return (
    <div className={`w-full flex-1 flex flex-col font-sans overflow-y-auto pb-24 transition-colors duration-300 ${
      darkMode ? 'bg-[#121212] text-white' : 'bg-[#fcf9f8] text-[#1c1b1b]'
    }`}>
      {/* Content Title - No heading bar as requested by the modification prompt */}
      <div className={`px-6 pt-6 pb-4 border-b transition-colors duration-300 ${
        darkMode ? 'border-neutral-800' : 'border-[#e5e2e1]'
      } mb-4`}>
        <h2 className="text-xl font-bold tracking-tight">Dashboard</h2>
        <p className={`text-xs font-light ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>Ingredient depletion & intake analysis</p>
      </div>

      <div className="px-6 space-y-4">
        {/* Depletion Trend Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Line Chart Grid - 2/3 width on desktop */}
          <div className={`border p-5 rounded shadow-sm transition-colors duration-300 ${
            darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#e5e2e1]'
          }`}>
            <div className="flex justify-between items-baseline mb-4">
              <div>
                <span className={`text-[9px] font-mono tracking-widest uppercase font-bold block ${
                  darkMode ? 'text-[#00f0ff]' : 'text-[#006970]'
                }`}>
                  [ DEPLETION TREND ]
                </span>
                <h3 className="text-sm font-bold mt-0.5">Remaining Stocks</h3>
              </div>
              <div className={`flex items-center gap-3 text-[10px] font-mono ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-0.5 inline-block ${darkMode ? 'bg-[#00f0ff]' : 'bg-[#006970]'}`} />
                  <span>{isDemo ? 'PROTEIN' : 'AVG STOCK'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-0.5 border-t border-dashed inline-block ${darkMode ? 'border-[#a78bfa]' : 'border-[#5400c3]'}`} />
                  <span>{isDemo ? 'FIBER' : 'AVG FRESHNESS'}</span>
                </div>
              </div>
            </div>

            {/* Depletion trend graph: demo keeps the original hardcoded chart; other accounts use live data or an empty state. */}
            <div className="relative h-44 w-full pt-4">
              {isDemo ? (
                <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="500" y2="20" stroke={darkMode ? '#262626' : '#f0edec'} strokeWidth="1" />
                  <line x1="0" y1="55" x2="500" y2="55" stroke={darkMode ? '#262626' : '#f0edec'} strokeWidth="1" />
                  <line x1="0" y1="90" x2="500" y2="90" stroke={darkMode ? '#262626' : '#f0edec'} strokeWidth="1" />
                  <line x1="0" y1="125" x2="500" y2="125" stroke={darkMode ? '#262626' : '#f0edec'} strokeWidth="1" />

                  {/* Secondary line (Dashed Purple) */}
                  <path
                    d="M 10 100 Q 90 115, 170 85 T 330 65 T 490 55"
                    fill="none"
                    stroke={darkMode ? '#a78bfa' : '#5400c3'}
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                    className="opacity-70"
                  />

                  {/* Primary line (Solid Teal) */}
                  <path
                    d="M 10 70 Q 90 75, 170 95 T 330 110 T 490 120"
                    fill="none"
                    stroke={darkMode ? '#00f0ff' : '#006970'}
                    strokeWidth="2"
                  />

                  {/* Interactivity Overlay Points */}
                  {days.map((day, idx) => {
                    const x = 10 + (idx * 480) / 6;
                    const y = 70 + (idx * 10) - (idx === 2 ? 15 : 0);
                    return (
                      <g key={day} className="cursor-pointer group" onMouseEnter={() => setSelectedPoint(idx)}>
                        <circle
                          cx={x}
                          cy={y}
                          r="3"
                          fill={darkMode ? '#00f0ff' : '#006970'}
                          className="group-hover:r-5 transition-all"
                        />
                        {selectedPoint === idx && (
                          <g>
                            <rect x={x - 45} y={y - 30} width="90" height="20" fill="black" rx="2" className="opacity-90" />
                            <text x={x} y={y - 17} fill="white" fontSize="9" textAnchor="middle" fontFamily="monospace">
                              {[85, 78, 62, 55, 48, 52, 40][idx]}% REMAINING
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              ) : ingredients.length === 0 ? (
                <div className={`flex items-center justify-center h-full rounded ${darkMode ? 'bg-neutral-950/50' : 'bg-[#fcf9f8]'}`}>
                  <span className={`text-[11px] ${darkMode ? 'text-neutral-500' : 'text-[#9ca3af]'}`}>
                    Add ingredients to see depletion trends
                  </span>
                </div>
              ) : (
                <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="500" y2="20" stroke={darkMode ? '#262626' : '#f0edec'} strokeWidth="1" />
                  <line x1="0" y1="55" x2="500" y2="55" stroke={darkMode ? '#262626' : '#f0edec'} strokeWidth="1" />
                  <line x1="0" y1="90" x2="500" y2="90" stroke={darkMode ? '#262626' : '#f0edec'} strokeWidth="1" />
                  <line x1="0" y1="125" x2="500" y2="125" stroke={darkMode ? '#262626' : '#f0edec'} strokeWidth="1" />

                  {/* Secondary line (Dashed Purple) */}
                  {secondaryPoints.length > 0 && (
                    <path
                      d={buildPath(secondaryPoints)}
                      fill="none"
                      stroke={darkMode ? '#a78bfa' : '#5400c3'}
                      strokeWidth="1.5"
                      strokeDasharray="4,4"
                      className="opacity-70"
                    />
                  )}

                  {/* Primary line (Solid Teal) */}
                  {primaryPoints.length > 0 && (
                    <path
                      d={buildPath(primaryPoints)}
                      fill="none"
                      stroke={darkMode ? '#00f0ff' : '#006970'}
                      strokeWidth="2"
                    />
                  )}

                  {/* Interactivity Overlay Points */}
                  {primaryPoints.map((value, idx) => {
                    const x = getX(idx);
                    const y = getY(value);
                    return (
                      <g key={days[idx]} className="cursor-pointer group" onMouseEnter={() => setSelectedPoint(idx)}>
                        <circle
                          cx={x}
                          cy={y}
                          r="3"
                          fill={darkMode ? '#00f0ff' : '#006970'}
                          className="group-hover:r-5 transition-all"
                        />
                        {selectedPoint === idx && (
                          <g>
                            <rect x={x - 45} y={y - 30} width="90" height="20" fill="black" rx="2" className="opacity-90" />
                            <text x={x} y={y - 17} fill="white" fontSize="9" textAnchor="middle" fontFamily="monospace">
                              {value}% REMAINING
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              )}

              {isDemo ? (
                <div className={`absolute top-[35%] left-[32%] border text-[9px] font-mono font-semibold px-2 py-1 rounded shadow-sm tracking-wider transition-colors duration-300 ${
                  darkMode
                    ? 'bg-neutral-950/95 border-neutral-800 text-[#00f0ff]'
                    : 'bg-white/95 border-[#b9cacb]/40 text-[#006970]'
                }`}>
                  PROTEIN - 12% REMAINING
                </div>
              ) : ingredients.length > 0 && (
                <div className={`absolute top-[35%] left-[32%] border text-[9px] font-mono font-semibold px-2 py-1 rounded shadow-sm tracking-wider transition-colors duration-300 ${
                  darkMode
                    ? 'bg-neutral-950/95 border-neutral-800 text-[#00f0ff]'
                    : 'bg-white/95 border-[#b9cacb]/40 text-[#006970]'
                }`}>
                  AVG STOCK - {avgPercentage}% REMAINING
                </div>
              )}
            </div>

            {/* X Axis Labels */}
            <div className={`flex justify-between text-[10px] font-mono px-2 pt-2 border-t transition-colors duration-300 ${
              darkMode ? 'border-neutral-800 text-neutral-400' : 'border-[#f0edec] text-[#6a7a7b]'
            }`}>
              {days.map(d => <span key={d}>{d}</span>)}
            </div>
          </div>

          {/* CRITICAL STATS / Spoilage Risk - 1/3 width on desktop */}
          <div className={`border p-5 rounded shadow-sm transition-colors duration-300 ${
            darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#e5e2e1]'
          }`}>
            <span className="text-[9px] font-mono tracking-widest text-[#ba1a1a] uppercase font-bold block mb-3">
              [ CRITICAL STATS ]
            </span>
            <h3 className="text-sm font-bold mb-4">Spoilage Risk</h3>

            <div className="space-y-4">
              {spoilageItems.map(item => (
                <div key={item.id} className={`flex justify-between items-center pb-2 border-b transition-colors ${
                  darkMode ? 'border-neutral-800' : 'border-[#f0edec]'
                }`}>
                  <div>
                    <h4 className="text-xs font-bold">{item.name}</h4>
                    <span className={`text-[10px] ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>Freshness: {item.freshness}%</span>
                  </div>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                    darkMode ? 'bg-red-950 text-red-400 border border-red-900/30' : 'bg-[#ffdad6] text-[#ba1a1a]'
                  }`}>
                    {item.spoilageRisk} Risk
                  </span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => onManualRefill('Spinach (Organic)', '+250g')}
              className={`w-full mt-5 py-2.5 border text-[10px] font-mono font-bold tracking-wider rounded uppercase transition-colors ${
                darkMode 
                  ? 'bg-neutral-800 hover:bg-neutral-750 border-neutral-700 text-neutral-200' 
                  : 'bg-[#fcf9f8] hover:bg-[#f0edec] border-[#e5e2e1] text-[#3b494b]'
              }`}
            >
              QUICK LOG SPINACH CONSUMPTION
            </button>
          </div>
        </div>

        {/* Refills Detected Section */}
        <div className={`border p-5 rounded shadow-sm transition-colors duration-300 ${
          darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#e5e2e1]'
        }`}>
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <Cpu className={darkMode ? 'text-[#00f0ff]' : 'text-[#006970]'} size={16} />
              <h3 className="text-sm font-bold">Refills Detected</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-mono tracking-wider uppercase ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>SYNCED 2M AGO</span>
              <button 
                onClick={() => showManualForm ? closeManualForm() : setShowManualForm(true)}
                className={`text-[10px] font-mono px-2 py-1 rounded transition-colors ${
                  darkMode ? 'bg-[#00f0ff] text-black hover:bg-[#00dbe9]' : 'bg-[#006970] text-white hover:bg-[#005a61]'
                }`}
              >
                + MANUAL LOG
              </button>
            </div>
          </div>

          {/* Manual Log Panel - grows out of the chart area */}
          <div className={`grid transition-[grid-template-rows] duration-300 ease-out mb-5 ${
            showManualForm ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}>
            <div className="overflow-hidden">
              <div className={`border rounded-lg overflow-hidden transition-colors ${
                darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#e5e2e1]'
              }`}>
                <div className={`flex items-center justify-between px-4 py-2.5 border-b ${
                  darkMode ? 'border-neutral-800' : 'border-[#e5e2e1]'
                }`}>
                  <span className="text-[10px] font-mono tracking-widest uppercase font-bold">
                    Manual Stock Restock Log
                  </span>
                  <button
                    onClick={closeManualForm}
                    className={`p-1 rounded transition-colors ${
                      darkMode ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-[#f0edec] text-[#6a7a7b]'
                    }`}
                    aria-label="Close"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  {/* Ingredient input */}
                  <input
                    type="text"
                    placeholder="Ingredient (e.g. Flour)"
                    value={manualIngredient}
                    onChange={(e) => setManualIngredient(e.target.value)}
                    className={`w-full border text-xs p-2.5 rounded focus:outline-none transition-colors ${
                      darkMode
                        ? 'bg-neutral-950 border-neutral-800 focus:border-[#00f0ff] text-white'
                        : 'bg-[#fcf9f8] border-[#e5e2e1] focus:border-[#006970] text-[#1c1b1b]'
                    }`}
                  />

                  {/* Quantity readout + unit dropdown */}
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 border rounded p-2 text-center font-mono text-base tracking-wider transition-colors ${
                      darkMode
                        ? 'bg-neutral-950 border-neutral-800 text-[#00f0ff]'
                        : 'bg-[#fcf9f8] border-[#e5e2e1] text-[#006970]'
                    }`}>
                      +{manualAmount || '0'}{manualUnit}
                    </div>
                    <div className="relative">
                      <select
                        value={manualUnit}
                        onChange={(e) => setManualUnit(e.target.value)}
                        className={`appearance-none border text-[10px] font-mono font-bold uppercase tracking-wider pl-2.5 pr-7 py-2.5 rounded focus:outline-none transition-colors ${
                          darkMode
                            ? 'bg-neutral-950 border-neutral-800 text-white focus:border-[#00f0ff]'
                            : 'bg-[#fcf9f8] border-[#e5e2e1] text-[#1c1b1b] focus:border-[#006970]'
                        }`}
                      >
                        {UNITS.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                      <ChevronDown
                        size={12}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${
                          darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Sleek number pad - thin separators like macOS Calculator */}
                  <div className={`grid grid-cols-3 border rounded-lg overflow-hidden ${
                    darkMode ? 'border-neutral-800 divide-neutral-800' : 'border-[#e5e2e1] divide-[#e5e2e1]'
                  } divide-x divide-y`}>
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'DEL'].map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleNumpad(key)}
                        className={`h-9 flex items-center justify-center font-mono text-sm transition-colors active:scale-95 ${
                          darkMode
                            ? 'bg-neutral-900 text-neutral-200 hover:bg-neutral-800'
                            : 'bg-white text-[#1c1b1b] hover:bg-[#f5f5f5]'
                        }`}
                      >
                        {key === 'DEL' ? '⌫' : key}
                      </button>
                    ))}
                  </div>

                  {/* Commit */}
                  <button
                    onClick={handleAddManualRefill}
                    disabled={!manualIngredient || !manualAmount || Number(manualAmount) <= 0}
                    className={`w-full py-2 text-[10px] font-mono tracking-wider uppercase rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      darkMode ? 'bg-[#00f0ff] text-black hover:bg-[#00dbe9]' : 'bg-[#1c1b1b] text-white hover:bg-black'
                    }`}
                  >
                    Commit Log Entry
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table matching the visual specs perfectly */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b font-mono text-[10px] tracking-widest uppercase transition-colors ${
                  darkMode ? 'border-neutral-800 text-neutral-400' : 'border-[#e5e2e1] text-[#6a7a7b]'
                }`}>
                  <th className="py-2.5 font-normal">Ingredient</th>
                  <th className="py-2.5 font-normal">Qty Added</th>
                  <th className="py-2.5 font-normal">Method</th>
                  <th className="py-2.5 font-normal text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className={`divide-y transition-colors ${darkMode ? 'divide-neutral-800' : 'divide-[#f0edec]'}`}>
                {refills.map((refill) => (
                  <tr key={refill.id}>
                    <td colSpan={4} className="p-0 relative overflow-hidden">
                      {/* Delete background */}
                      <button
                        onClick={() => onDeleteRefill(refill.id)}
                        className={`absolute inset-y-0 right-0 flex items-center justify-center text-white ${
                          darkMode ? 'bg-red-900/80' : 'bg-[#ba1a1a]'
                        }`}
                        style={{
                          width: `${Math.max(DELETE_WIDTH, -(swipeOffsets[refill.id] || 0))}px`,
                          transition: swipeRef.current?.id === refill.id ? 'none' : 'width 200ms ease-out'
                        }}
                        aria-label="Delete refill"
                      >
                        <Trash2 size={18} />
                      </button>

                      {/* Swipeable row content */}
                      <div
                        className={`relative w-full grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-4 py-3 select-none touch-pan-y transition-colors ${
                          darkMode ? 'bg-neutral-900 hover:bg-neutral-850/40' : 'bg-white hover:bg-[#fcf9f8]/40'
                        }`}
                        style={{
                          transform: `translateX(${swipeOffsets[refill.id] || 0}px)`,
                          transition: swipeRef.current?.id === refill.id ? 'none' : 'transform 200ms ease-out'
                        }}
                        onPointerDown={e => {
                          e.currentTarget.setPointerCapture(e.pointerId);
                          handlePointerStart(refill.id, e.clientX);
                        }}
                        onPointerMove={e => handlePointerMove(refill.id, e.clientX)}
                        onPointerUp={e => handlePointerEnd(refill.id, e.clientX)}
                      >
                        <span className="font-semibold truncate">{refill.ingredientName}</span>
                        <span className={`font-mono font-bold ${darkMode ? 'text-[#00f0ff]' : 'text-[#006970]'}`}>{refill.qtyAdded}</span>
                        <span className="whitespace-nowrap">
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold tracking-wider whitespace-nowrap ${
                            refill.method === 'OPTICAL AI'
                              ? (darkMode
                                  ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30'
                                  : 'bg-[#00f0ff]/10 text-[#006970] border border-[#00dbe9]/30'
                                )
                              : (darkMode
                                  ? 'bg-neutral-800 text-neutral-300'
                                  : 'bg-neutral-100 text-neutral-600'
                                )
                          }`}>
                            {refill.method}
                          </span>
                        </span>
                        <span className={`text-right font-mono ${darkMode ? 'text-neutral-400' : 'text-[#3b494b]'}`}>{refill.confidence}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Purple Accent Consumption Insight Alert Card (Screen 4 Bottom) */}
        <div className="bg-[#5400c3] text-[#fcf9f8] p-5 rounded relative overflow-hidden flex items-center justify-between group cursor-pointer hover:opacity-95 transition-all">
          <div className="flex items-center gap-4">
            {/* Pulsing visual element */}
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Cpu className="text-white animate-pulse" size={20} />
            </div>
            <div>
              <span className="text-[9px] font-mono tracking-widest text-[#ddcdff] uppercase font-bold block">
                Consumption Insight
              </span>
              <p className="text-xs md:text-sm font-semibold mt-1 leading-relaxed max-w-md text-white">
                You're consuming 15% more protein this week than your 30-day average.
              </p>
            </div>
          </div>
          <div className="text-white shrink-0 pl-4 group-hover:translate-x-1 transition-transform">
            <ChevronRight size={20} />
          </div>
        </div>

      </div>
    </div>
  );
}
