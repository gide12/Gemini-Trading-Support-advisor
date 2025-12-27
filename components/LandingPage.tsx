
import React, { useState, useEffect } from "react";

interface LandingPageProps {
  onStart: () => void;
}

interface RegionData {
  name: string;
  index: string;
  price: number;
  change: number;
  flag: string;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  // Region-based indices as requested ("keep indices before")
  const [markets, setMarkets] = useState<RegionData[]>([
    { name: "USA", index: "S&P 500", price: 5234.18, change: 0.25, flag: "🇺🇸" },
    { name: "JAPAN", index: "Nikkei 225", price: 38912.50, change: -1.12, flag: "🇯🇵" },
    { name: "HONG KONG", index: "Hang Seng", price: 16723.10, change: 0.85, flag: "🇭🇰" },
    { name: "GERMANY", index: "DAX", price: 17930.40, change: -0.42, flag: "🇩🇪" }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMarkets(prev => prev.map(m => {
        const volatility = m.name === "USA" ? 1.5 : m.name === "JAPAN" ? 12.0 : 6.0;
        const tick = (Math.random() - 0.49) * volatility;
        return { ...m, price: m.price + tick, change: m.change + (tick / m.price * 100) };
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center relative overflow-hidden font-sans select-none text-slate-200">
      
      {/* 1. BANKNOTE TEXTURE LAYER */}
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* 2. BENJAMIN FRANKLIN PHOTO (Banknote Etched Style) */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
              {/* The Photo */}
              <div className="absolute opacity-[0.25] mix-blend-luminosity animate-slow-pulse">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Benjamin_Franklin_by_Joseph_Duplessis_1778.jpg/800px-Benjamin_Franklin_by_Joseph_Duplessis_1778.jpg" 
                    alt="Benjamin Franklin"
                    className="w-[600px] md:w-[800px] h-auto filter sepia-[0.2] contrast-[1.1] brightness-[1.1]"
                    style={{ 
                        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)', 
                        WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)' 
                    }}
                  />
              </div>
              
              {/* Guilloché Patterns Overlay */}
              <svg className="absolute w-full h-full opacity-[0.1] text-emerald-500" viewBox="0 0 100 100">
                  <defs>
                      <pattern id="bankGrid" width="8" height="8" patternUnits="userSpaceOnUse">
                          <circle cx="1" cy="1" r="0.5" fill="currentColor" />
                      </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#bankGrid)" />
                  <ellipse cx="50" cy="50" rx="45" ry="35" fill="none" stroke="currentColor" strokeWidth="0.05" strokeDasharray="0.5,0.5" />
                  <ellipse cx="50" cy="50" rx="48" ry="38" fill="none" stroke="currentColor" strokeWidth="0.02" />
              </svg>
          </div>
      </div>

      {/* 3. INDEKS DATA (Top Professional Ribbon) */}
      <div className="absolute top-0 left-0 right-0 z-30 h-16 bg-black/60 backdrop-blur-xl border-b border-emerald-900/30 flex items-center justify-center gap-4 md:gap-12 px-6">
          {markets.map(m => (
              <div key={m.name} className="flex flex-col items-center md:items-start group transition-opacity hover:opacity-100 opacity-80">
                  <div className="flex items-center gap-2">
                      <span className="text-xs">{m.flag}</span>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{m.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-bold text-white tracking-tighter">
                          {m.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className={`text-[10px] font-bold font-mono ${m.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {m.change >= 0 ? '▲' : '▼'} {Math.abs(m.change).toFixed(2)}%
                      </span>
                  </div>
              </div>
          ))}
      </div>

      {/* 4. MAIN CONTENT AREA */}
      <div className="relative z-20 text-center px-6 max-w-5xl animate-fade-in mt-12">
        
        {/* Branding Header */}
        <div className="mb-16 inline-flex items-center gap-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-emerald-500/50"></div>
            <span className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.8em]">Institutional Quant Terminal</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-emerald-500/50"></div>
        </div>

        {/* The Hero Quote */}
        <div className="mb-24 space-y-12">
            <h1 className="text-5xl md:text-7xl font-light text-white leading-[1.1] tracking-tight">
                “You don’t choose <br/> 
                <span className="font-serif italic text-slate-400">cheap</span> or <span className="font-serif italic text-slate-400">expensive</span>.”
            </h1>
            <h2 className="text-2xl md:text-3xl font-light text-slate-400 max-w-3xl mx-auto leading-relaxed">
                “You choose whether you’re paid by <br/>
                <span className="text-white font-bold border-b-2 border-emerald-500/40 hover:border-emerald-500 transition-colors cursor-default">direction</span> 
                <span className="mx-4 text-slate-700 font-serif italic">or by</span> 
                <span className="text-white font-bold border-b-2 border-emerald-500/40 hover:border-emerald-500 transition-colors cursor-default">movement</span>.”
            </h2>
        </div>

        {/* PROFESSIONAL ACCESS BUTTON (High-end Ghost Style) */}
        <div className="relative group inline-block">
            <button 
                onClick={onStart}
                className="relative z-10 px-16 py-6 bg-white/5 backdrop-blur-md border border-white/20 text-white text-xs font-black uppercase tracking-[0.4em] transition-all duration-700 hover:bg-white hover:text-black hover:border-white shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                Initialize System Access
            </button>
            {/* Subtle glow behind button */}
            <div className="absolute inset-0 bg-emerald-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        </div>

        {/* Security / Compliance Footer */}
        <div className="mt-24 flex flex-wrap justify-center gap-12 opacity-30 text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500">
            <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                <span>Encrypted Neural Link</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                <span>Secured USD Assets</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                <span>Verified Federal Node</span>
            </div>
        </div>
      </div>

      {/* Decorative Vignette */}
      <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]"></div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slowPulse {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.28; transform: scale(1.02); }
        }
        .animate-slow-pulse {
            animation: slowPulse 10s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
