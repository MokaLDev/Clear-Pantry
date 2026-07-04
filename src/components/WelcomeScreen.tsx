import React, { useState } from 'react';
import { ArrowRight, X, Cpu, Radio } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [showIntro, setShowIntro] = useState(false);

  return (
    <div className="relative w-full min-h-screen bg-[#fcf9f8] text-[#1c1b1b] flex flex-col justify-between p-6 overflow-y-auto font-sans">
      {/* Subtle Ambient Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.06] bg-cover bg-center" 
           style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=1000')" }} />

      {/* Top Margin Buffer */}
      <div className="w-full z-10 flex justify-between items-center pt-2">
        <span className="text-[10px] tracking-widest text-[#6a7a7b] font-mono">CLEAR-PANTRY SYSTEM v0.92</span>
        <div className="flex items-center gap-1.5 bg-[#ebe7e7] px-2 py-0.5 rounded text-[10px] text-[#006970] font-mono">
          <span className="w-1.5 h-1.5 bg-[#006970] rounded-full animate-ping" />
          ACTIVE
        </div>
      </div>

      {/* Main Branding and Breathing Core */}
      <div className="flex-1 flex flex-col items-center justify-center py-10 z-10">
        <div className="relative w-36 h-36 flex items-center justify-center mb-10">
          {/* Pulsing Breathing Core */}
          <div className="w-5 h-5 bg-[#006970] rounded-full animate-pulse shadow-[0_0_15px_rgba(0,105,112,0.6)]" />
          
          {/* Orbital rings */}
          <div className="absolute inset-0 border border-[#b9cacb]/40 rounded-full animate-[spin_12s_linear_infinite]" />
          <div className="absolute inset-4 border border-[#b9cacb]/20 border-dashed rounded-full animate-[spin_8s_linear_infinite_reverse]" />
          <div className="absolute inset-8 border border-[#b9cacb]/30 rounded-full animate-[spin_16s_linear_infinite]" />

          {/* Micro Tag */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <span className="text-[9px] font-semibold font-mono tracking-[0.25em] text-[#6a7a7b] bg-[#fcf9f8] px-2 py-0.5 rounded border border-[#e5e2e1]">
              [SYSTEM_READY]
            </span>
            <div className="w-px h-6 bg-[#b9cacb]/60 mt-1" />
          </div>
        </div>

        {/* Hero Welcome Message */}
        <div className="text-center max-w-sm px-2">
          <h1 className="text-2xl font-semibold text-[#1c1b1b] leading-tight mb-4 tracking-tight">
            Welcome to your kitchen’s new nervous system.
          </h1>
          <p className="text-sm text-[#3b494b] leading-relaxed max-w-[320px] mx-auto font-light">
            Precision inventory tracking and culinary intelligence, quietly managing your essentials so you can focus on the craft.
          </p>
        </div>

        {/* Buttons / CTA */}
        <div className="w-full max-w-xs mt-10 space-y-3">
          <button
            id="btn-get-started"
            onClick={onStart}
            className="w-full py-4 bg-[#1c1b1b] text-white hover:bg-black/90 active:scale-98 transition-all font-mono text-xs font-semibold tracking-[0.15em] flex items-center justify-center gap-2"
          >
            GET STARTED
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </button>
          
          <button
            id="btn-learn-more"
            onClick={() => setShowIntro(true)}
            className="w-full py-3 text-xs font-mono font-semibold text-[#3b494b] tracking-[0.15em] border-b border-[#b9cacb]/30 hover:text-[#006970] hover:border-[#006970] transition-all"
          >
            LEARN MORE
          </button>
        </div>
      </div>

      {/* Status Footer */}
      <div className="w-full border-t border-[#b9cacb]/20 pt-3 flex justify-between items-center z-10">
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-[#6a7a7b] tracking-wider uppercase">Current Build</span>
          <span className="text-xs font-mono text-[#3b494b] font-medium">V 0.92.14-STABLE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#006970] rounded-full animate-ping" />
          <span className="text-xs font-mono text-[#006970] font-medium tracking-wider uppercase">SYNCED</span>
        </div>
      </div>

      {/* Interactive Modal Capabilities Overlay */}
      {showIntro && (
        <div className="fixed inset-0 z-50 bg-[#1c1b1b]/30 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-[#fcf9f8] border border-[#e5e2e1] w-full max-w-sm p-6 rounded shadow-xl relative animate-scale-up">
            <button 
              onClick={() => setShowIntro(false)}
              className="absolute top-4 right-4 text-[#3b494b] hover:text-black transition-colors"
            >
              <X size={18} />
            </button>

            <div className="mb-6 border-b border-[#e5e2e1] pb-3">
              <span className="text-[10px] font-mono text-[#006970] tracking-[0.15em] uppercase font-bold block mb-1">
                01 / CAPABILITIES
              </span>
              <h3 className="text-lg font-bold text-[#1c1b1b]">Kitchen AI Capabilities</h3>
            </div>

            <div className="space-y-6">
              <div className="border-l-2 border-[#006970] pl-3">
                <h4 className="text-sm font-semibold text-[#1c1b1b] mb-1">Visual Recognition</h4>
                <p className="text-xs text-[#3b494b] leading-relaxed">
                  Real-time ingredient tracking via high-precision AI vision. Simply scan containers with your camera to detect capacity levels.
                </p>
              </div>

              <div className="border-l-2 border-[#b9cacb] pl-3">
                <h4 className="text-sm font-semibold text-[#1c1b1b] mb-1">Predictive Depletion</h4>
                <p className="text-xs text-[#3b494b] leading-relaxed">
                  Sophisticated usage analytics forecast exactly when you'll need a restock based on your actual ingestion habits.
                </p>
              </div>

              <div className="border-l-2 border-[#b9cacb] pl-3">
                <h4 className="text-sm font-semibold text-[#1c1b1b] mb-1">Zero-Waste Logic</h4>
                <p className="text-xs text-[#3b494b] leading-relaxed">
                  Automated custom dietary advice and smart recipes formulated on ingredient freshness windows and inventory volume.
                </p>
              </div>
            </div>

            <button 
              onClick={() => {
                setShowIntro(false);
                onStart();
              }}
              className="w-full mt-6 py-3 bg-[#006970] text-white hover:bg-[#005a61] transition-colors font-mono text-xs font-semibold tracking-wider"
            >
              INITIALIZE ENVIRONMENT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
