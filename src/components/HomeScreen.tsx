import React, { useState } from 'react';
import { Ingredient } from '../types';
import { AlertTriangle, ShieldCheck, Thermometer, ChevronRight, CheckCircle, FlameKindling, UtensilsCrossed } from 'lucide-react';

interface HomeScreenProps {
  ingredients: Ingredient[];
  dietAdvice: string;
  onRefreshAdvice: () => void;
  onNavigateToTab: (tab: string) => void;
  darkMode: boolean;
}

export default function HomeScreen({ ingredients, dietAdvice, onRefreshAdvice, onNavigateToTab, darkMode }: HomeScreenProps) {
  const [dismissed, setDismissed] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);

  // Derive critical ingredients
  const criticalItems = ingredients.filter(i => i.status === 'critical');
  const eggsItem = ingredients.find(i => i.id === 'organic-eggs') || { currentQty: 6, maxQty: 12, percentage: 50 };
  const riceItem = ingredients.find(i => i.id === 'basmati-rice') || { currentQty: 4600, maxQty: 5000, percentage: 92 };

  // Calculate fresh score average
  const totalFreshness = ingredients.reduce((acc, curr) => acc + curr.freshness, 0);
  const averageFreshness = Math.round(totalFreshness / ingredients.length) || 80;

  return (
    <div className={`w-full flex-1 flex flex-col font-sans overflow-y-auto pb-24 transition-colors duration-300 ${
      darkMode ? 'bg-[#121212] text-white' : 'bg-[#fcf9f8] text-[#1c1b1b]'
    }`}>
      {/* Morning Analysis / Calibration Header */}
      <div className={`flex justify-between items-baseline px-6 pt-6 pb-4 border-b transition-colors duration-300 ${
        darkMode ? 'border-neutral-800' : 'border-[#e5e2e1]'
      }`}>
        <div>
          <span className={`text-[10px] uppercase font-mono tracking-wider ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>Morning Analysis</span>
          <h2 className="text-xl font-bold tracking-tight">Kitchen Status</h2>
        </div>
        <div className={`flex items-center gap-1.5 ${darkMode ? 'text-[#00f0ff]' : 'text-[#006970]'}`}>
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${darkMode ? 'bg-[#00f0ff]' : 'bg-[#006970]'}`} />
          <span className="text-[11px] font-mono tracking-tight">All systems calibrated</span>
        </div>
      </div>

      <div className="px-6 py-4 space-y-4">
        {/* Row of critical takeaways */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Flour Warning Card */}
          <div className={`p-4 flex gap-3 rounded shadow-sm border transition-colors duration-300 ${
            darkMode ? 'bg-[#ba1a1a]/10 border-red-900/30' : 'bg-[#fff6f5] border-[#ffdad6]'
          }`}>
            <div className={`${darkMode ? 'text-red-400' : 'text-[#ba1a1a]'} shrink-0 mt-0.5`}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-semibold tracking-wider px-1.5 py-0.5 rounded ${
                  darkMode ? 'bg-red-950/80 text-red-300 border border-red-900/30' : 'bg-[#ffdad6] text-[#ba1a1a]'
                }`}>CRITICAL</span>
                <span className="text-xs font-bold">Flour Stock Critical</span>
              </div>
              <p className={`text-[11px] mt-1.5 leading-relaxed ${darkMode ? 'text-neutral-300' : 'text-[#3b494b]'}`}>
                Estimated 120g remaining. 1.2kg needed for weekly prep schedules.
              </p>
            </div>
          </div>

          {/* Olive Oil Suggestion Card */}
          <div className={`p-4 flex justify-between items-start rounded shadow-sm border transition-colors duration-300 ${
            darkMode ? 'bg-[#00f0ff]/5 border-neutral-800' : 'bg-[#f0f9fa] border-[#b9cacb]/40'
          }`}>
            <div className="flex gap-3">
              <div className={`${darkMode ? 'text-[#00f0ff]' : 'text-[#006970]'} shrink-0 mt-1`}>
                <Thermometer size={18} />
              </div>
              <div>
                <span className={`text-[10px] font-mono block ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>PANTRY 1 • 18°C STABLE</span>
                <h4 className="text-xs font-bold mt-0.5">Olive Oil Suggested</h4>
                <p className={`text-[11px] leading-tight mt-0.5 ${darkMode ? 'text-neutral-300' : 'text-[#3b494b]'}`}>Refill recommended soon.</p>
              </div>
            </div>
            <span className={`text-[9px] font-mono border px-1.5 py-0.5 rounded font-semibold tracking-wider uppercase ${
              darkMode 
                ? 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/30' 
                : 'bg-[#00f0ff]/10 text-[#006970] border border-[#00dbe9]/30'
            }`}>
              RESTOCK
            </span>
          </div>
        </div>

        {/* Dietary Advice Block */}
        {!dismissed && (
          <div className={`border rounded p-5 relative overflow-hidden transition-colors duration-300 ${
            darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-[#f3f0ef] border-[#e5e2e1]'
          }`}>
            <span className={`text-[10px] font-mono tracking-[0.15em] font-bold block mb-2 uppercase ${
              darkMode ? 'text-[#00f0ff]' : 'text-[#006970]'
            }`}>
              Dietary Advice
            </span>
            <p className="text-sm font-semibold leading-relaxed mb-4 max-w-[90%]">
              "{dietAdvice}"
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPlanModal(true)}
                className={`px-4 py-2 text-[11px] font-mono tracking-wider font-semibold transition-all rounded ${
                  darkMode ? 'bg-[#00f0ff] text-black hover:bg-[#00dbe9]' : 'bg-[#1c1b1b] text-[#fcf9f8] hover:bg-black'
                }`}
              >
                VIEW PLAN
              </button>
              <button
                onClick={() => setDismissed(true)}
                className={`px-4 py-2 border text-[11px] font-mono tracking-wider font-semibold transition-all rounded ${
                  darkMode 
                    ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800' 
                    : 'border-[#b9cacb]/50 text-[#3b494b] hover:bg-[#ebe7e7]'
                }`}
              >
                DISMISS
              </button>
            </div>
          </div>
        )}

        {dismissed && (
          <div className={`flex justify-between items-center p-3 rounded border border-dashed transition-colors duration-300 ${
            darkMode 
              ? 'bg-neutral-900/40 border-neutral-800' 
              : 'bg-[#ebe7e7]/40 border-[#b9cacb]/40'
          }`}>
            <span className={`text-xs italic ${darkMode ? 'text-neutral-400' : 'text-[#3b494b]'}`}>Dietary advice card dismissed.</span>
            <button
              onClick={() => {
                onRefreshAdvice();
                setDismissed(false);
              }}
              className={`text-xs font-mono font-semibold hover:underline ${
                darkMode ? 'text-[#00f0ff]' : 'text-[#006970]'
              }`}
            >
              Refresh & Restore Advice
            </button>
          </div>
        )}

        {/* Split Grid: Consumption Trends Mini Visualizer & Freshness Score */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Consumption trends mini bar graph */}
          <div className={`border p-5 rounded shadow-sm transition-colors duration-300 ${
            darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#e5e2e1]'
          }`}>
            <span className={`text-[10px] font-mono tracking-wider block mb-3 uppercase ${
              darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'
            }`}>Consumption Trends</span>
            <div className="flex items-end justify-between h-20 pt-4 px-2">
              <div className="flex flex-col items-center gap-1.5 w-full">
                <div className={`w-7 h-8 rounded-sm transition-colors ${
                  darkMode ? 'bg-[#00f0ff]/15 hover:bg-[#00f0ff]/30' : 'bg-[#00f0ff]/20 hover:bg-[#00f0ff]/40'
                }`} />
                <span className={`text-[9px] font-mono ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>MON</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 w-full">
                <div className={`w-7 h-12 rounded-sm transition-colors ${
                  darkMode ? 'bg-[#00f0ff]/30 hover:bg-[#00f0ff]/50' : 'bg-[#00f0ff]/40 hover:bg-[#00f0ff]/60'
                }`} />
                <span className={`text-[9px] font-mono ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>TUE</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 w-full">
                <div className={`w-7 h-14 rounded-sm transition-colors ${
                  darkMode ? 'bg-[#00f0ff]/50 hover:bg-[#00f0ff]/70' : 'bg-[#00f0ff]/60 hover:bg-[#00f0ff]/80'
                }`} />
                <span className={`text-[9px] font-mono ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>WED</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 w-full">
                <div className={`w-7 h-16 rounded-sm transition-colors ${
                  darkMode ? 'bg-[#00f0ff] hover:bg-[#00dbe9]' : 'bg-[#006970] hover:bg-[#005a61]'
                }`} />
                <span className={`text-[9px] font-mono ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>THU</span>
              </div>
            </div>
          </div>

          {/* Circular Freshness Score Card */}
          <div className={`border p-5 rounded shadow-sm flex items-center gap-5 transition-colors duration-300 ${
            darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#e5e2e1]'
          }`}>
            <div className="relative shrink-0 w-16 h-16 flex items-center justify-center">
              {/* Circular track */}
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" fill="transparent" stroke={darkMode ? '#262626' : '#ebe7e7'} strokeWidth="4" />
                <circle cx="32" cy="32" r="28" fill="transparent" stroke={darkMode ? '#a78bfa' : '#5400c3'} strokeWidth="4" 
                        strokeDasharray={175} strokeDashoffset={175 - (175 * averageFreshness) / 100} 
                        strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <span className={`absolute text-sm font-mono font-bold ${darkMode ? 'text-[#a78bfa]' : 'text-[#5400c3]'}`}>{averageFreshness}%</span>
            </div>
            <div>
              <h4 className="text-xs font-bold">Freshness Score</h4>
              <p className={`text-[11px] leading-relaxed mt-1 ${darkMode ? 'text-neutral-300' : 'text-[#3b494b]'}`}>
                Average shelf life remaining across all perishables in your fridge & pantry.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Ingredient Usage */}
        <div className={`border rounded p-5 shadow-sm transition-colors duration-300 ${
          darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#e5e2e1]'
        }`}>
          <h3 className={`text-xs font-mono tracking-wider mb-4 uppercase ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>Recent Ingredient Usage</h3>
          <div className="space-y-4">
            {/* Eggs Slider */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded flex items-center justify-center text-lg ${
                  darkMode ? 'bg-neutral-800' : 'bg-[#f0edec]'
                }`}>
                  🥚
                </div>
                <div>
                  <h5 className="text-xs font-bold">Organic Eggs</h5>
                  <span className={`text-[10px] ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>6 used • 6 remaining</span>
                </div>
              </div>
              <div className="w-32 flex items-center gap-2">
                <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-neutral-850' : 'bg-[#f0edec]'}`}>
                  <div className={`h-full ${darkMode ? 'bg-[#00f0ff]' : 'bg-[#006970]'}`} style={{ width: `${eggsItem.percentage}%` }} />
                </div>
                <span className="text-[11px] font-mono min-w-[24px] text-right">
                  {eggsItem.percentage}%
                </span>
              </div>
            </div>

            {/* Rice Slider */}
            <div className={`flex items-center justify-between gap-4 border-t pt-3 ${darkMode ? 'border-neutral-800' : 'border-[#f0edec]'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded flex items-center justify-center text-lg ${
                  darkMode ? 'bg-neutral-800' : 'bg-[#f0edec]'
                }`}>
                  🌾
                </div>
                <div>
                  <h5 className="text-xs font-bold">Basmati Rice</h5>
                  <span className={`text-[10px] ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>0.4kg used • 4.6kg remaining</span>
                </div>
              </div>
              <div className="w-32 flex items-center gap-2">
                <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-neutral-850' : 'bg-[#f0edec]'}`}>
                  <div className={`h-full ${darkMode ? 'bg-[#00f0ff]' : 'bg-[#006970]'}`} style={{ width: `${riceItem.percentage}%` }} />
                </div>
                <span className="text-[11px] font-mono min-w-[24px] text-right">
                  {riceItem.percentage}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Micro advice CTA */}
        <div 
          onClick={() => onNavigateToTab('analyze')}
          className={`transition-all duration-300 cursor-pointer rounded p-3 text-center text-xs font-mono font-medium flex items-center justify-center gap-2 ${
            darkMode 
              ? 'bg-neutral-800 text-white hover:bg-neutral-700' 
              : 'bg-[#ebe7e7] hover:bg-[#dcd9d9] text-[#1c1b1b]'
          }`}
        >
          <span>LAUNCH VISUAL TRACING CAMERA TO CALIBRATE ITEMS</span>
          <ChevronRight size={12} />
        </div>
      </div>

      {/* Plan Details Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className={`border w-full max-w-sm rounded p-6 shadow-xl transition-colors duration-300 ${
            darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-[#fcf9f8] border-[#e5e2e1] text-[#1c1b1b]'
          }`}>
            <h3 className={`text-sm font-mono tracking-wider font-bold uppercase mb-1 ${
              darkMode ? 'text-[#00f0ff]' : 'text-[#006970]'
            }`}>Dietary Strategy Plan</h3>
            <h4 className="text-base font-bold mb-4">Precision Recipe Routing</h4>
            
            <p className={`text-xs leading-relaxed mb-4 ${darkMode ? 'text-neutral-300' : 'text-[#3b494b]'}`}>
              Your nutrition advisory engine generated a high-efficiency nutritional intake model:
            </p>

            <div className={`border rounded p-3 space-y-2 mb-4 text-xs ${
              darkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-[#e5e2e1]'
            }`}>
              <div className={`flex justify-between border-b pb-1.5 ${darkMode ? 'border-neutral-850' : 'border-[#f0edec]'}`}>
                <span className="font-semibold">Breakfast suggestion:</span>
                <span className={darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}>Scrambled eggs + Basil</span>
              </div>
              <div className={`flex justify-between border-b pb-1.5 ${darkMode ? 'border-neutral-850' : 'border-[#f0edec]'}`}>
                <span className="font-semibold">Lunch suggestion:</span>
                <span className={darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}>Spinach & Greek Yogurt salad</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Active nutrients targeted:</span>
                <span className={`font-semibold ${darkMode ? 'text-[#00f0ff]' : 'text-[#006970]'}`}>Protein, Iron, Vitamin K</span>
              </div>
            </div>

            <p className={`text-[11px] leading-relaxed italic mb-4 ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>
              *By prioritizing ingredients with high spoilage risks (Spinach & Basil), you save $4.20 this week and reduce carbon waste footprints.
            </p>

            <button
              onClick={() => setShowPlanModal(false)}
              className={`w-full py-2.5 text-xs font-mono font-semibold tracking-wider transition-all ${
                darkMode ? 'bg-[#00f0ff] text-black hover:bg-[#00dbe9]' : 'bg-[#1c1b1b] text-[#fcf9f8] hover:bg-black'
              }`}
            >
              CLOSE PLAN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
