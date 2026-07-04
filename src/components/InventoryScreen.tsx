import React, { useState } from 'react';
import { Ingredient, RefillRecord } from '../types';
import { ArrowUpRight, ShieldAlert, Cpu, Check, HelpCircle, ChevronRight } from 'lucide-react';

interface InventoryScreenProps {
  ingredients: Ingredient[];
  refills: RefillRecord[];
  onManualRefill: (name: string, qty: string) => void;
  darkMode: boolean;
}

export default function InventoryScreen({ ingredients, refills, onManualRefill, darkMode }: InventoryScreenProps) {
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [manualIngredient, setManualIngredient] = useState('');
  const [manualQty, setManualQty] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);

  // Spoilage risk items (High risk or critical status)
  const spoilageItems = ingredients.filter(i => i.spoilageRisk === 'High');

  // Chart values (remaining stock levels on days Mon-Sun)
  const chartPoints = [85, 78, 62, 55, 48, 52, 40]; // primary line
  const secondaryPoints = [78, 70, 72, 68, 80, 85, 90]; // secondary dotted line
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const handleAddManualRefill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIngredient || !manualQty) return;
    onManualRefill(manualIngredient, manualQty);
    setManualIngredient('');
    setManualQty('');
    setShowManualForm(false);
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
                  <span>PROTEIN</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-0.5 border-t border-dashed inline-block ${darkMode ? 'border-[#a78bfa]' : 'border-[#5400c3]'}`} />
                  <span>FIBER</span>
                </div>
              </div>
            </div>

            {/* High fidelity SVG Line Graph */}
            <div className="relative h-44 w-full pt-4">
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
                  const y = 70 + (idx * 10) - (idx === 2 ? 15 : 0); // approx y coordinates
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
                            {chartPoints[idx]}% REMAINING
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Floating label exactly matching screenshot */}
              <div className={`absolute top-[35%] left-[32%] border text-[9px] font-mono font-semibold px-2 py-1 rounded shadow-sm tracking-wider transition-colors duration-300 ${
                darkMode 
                  ? 'bg-neutral-950/95 border-neutral-800 text-[#00f0ff]' 
                  : 'bg-white/95 border-[#b9cacb]/40 text-[#006970]'
              }`}>
                PROTEIN - 12% REMAINING
              </div>
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
                onClick={() => setShowManualForm(!showManualForm)}
                className={`text-[10px] font-mono px-2 py-1 rounded transition-colors ${
                  darkMode ? 'bg-[#00f0ff] text-black hover:bg-[#00dbe9]' : 'bg-[#006970] text-white hover:bg-[#005a61]'
                }`}
              >
                + MANUAL LOG
              </button>
            </div>
          </div>

          {/* Quick Manual Log Form */}
          {showManualForm && (
            <form onSubmit={handleAddManualRefill} className={`mb-5 p-3 border rounded space-y-3 ${
              darkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-[#fcf9f8] border-[#e5e2e1]'
            }`}>
              <h4 className="text-xs font-bold">Manual Stock Restock Log</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Ingredient (e.g. Flour)"
                  value={manualIngredient}
                  onChange={(e) => setManualIngredient(e.target.value)}
                  className={`border text-xs p-2 rounded focus:outline-none transition-colors ${
                    darkMode 
                      ? 'bg-neutral-900 border-neutral-750 focus:border-[#00f0ff] text-white' 
                      : 'bg-white border-[#e5e2e1] focus:border-[#006970] text-[#1c1b1b]'
                  }`}
                  required
                />
                <input
                  type="text"
                  placeholder="Quantity (e.g. +500g)"
                  value={manualQty}
                  onChange={(e) => setManualQty(e.target.value)}
                  className={`border text-xs p-2 rounded focus:outline-none transition-colors ${
                    darkMode 
                      ? 'bg-neutral-900 border-neutral-750 focus:border-[#00f0ff] text-white' 
                      : 'bg-white border-[#e5e2e1] focus:border-[#006970] text-[#1c1b1b]'
                  }`}
                  required
                />
              </div>
              <button
                type="submit"
                className={`w-full py-2 text-[10px] font-mono tracking-wider uppercase rounded ${
                  darkMode ? 'bg-[#00f0ff] text-black hover:bg-[#00dbe9]' : 'bg-[#1c1b1b] text-white hover:bg-black'
                }`}
              >
                COMMIT LOG ENTRY
              </button>
            </form>
          )}

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
                  <tr key={refill.id} className={`transition-colors ${
                    darkMode ? 'hover:bg-neutral-850/40' : 'hover:bg-[#fcf9f8]/40'
                  }`}>
                    <td className="py-3 font-semibold">{refill.ingredientName}</td>
                    <td className={`py-3 font-mono font-bold ${darkMode ? 'text-[#00f0ff]' : 'text-[#006970]'}`}>{refill.qtyAdded}</td>
                    <td className="py-3">
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${
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
                    </td>
                    <td className={`py-3 text-right font-mono ${darkMode ? 'text-neutral-400' : 'text-[#3b494b]'}`}>{refill.confidence}%</td>
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
