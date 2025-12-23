
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
  id: string;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  // Multi-region market state
  const [markets, setMarkets] = useState<RegionData[]>([
    { id: "usa", name: "USA", index: "S&P 500", price: 5234.18, change: 0.25, flag: "🇺🇸" },
    { id: "japan", name: "JAPAN", index: "Nikkei 225", price: 38912.50, change: -1.12, flag: "🇯🇵" },
    { id: "hk", name: "HONG KONG", index: "Hang Seng", price: 16723.10, change: 0.85, flag: "🇭🇰" },
    { id: "germany", name: "GERMANY", index: "DAX", price: 17930.40, change: -0.42, flag: "🇩🇪" }
  ]);

  const [bars, setBars] = useState<{ height: number; opacity: number }[]>([]);

  useEffect(() => {
    // Background bars simulation
    const initialBars = Array.from({ length: 50 }).map(() => ({
      height: Math.random() * 80 + 10,
      opacity: Math.random() * 0.2 + 0.05,
    }));
    setBars(initialBars);

    const interval = setInterval(() => {
      // Update Market Indices
      setMarkets(prev => prev.map(m => {
        const volatility = m.id === "usa" ? 1.5 : m.id === "japan" ? 12.0 : 6.0;
        const tick = (Math.random() - 0.49) * volatility;
        const newPrice = m.price + tick;
        const newChange = m.change + (tick / m.price * 100);
        return { ...m, price: newPrice, change: newChange };
      }));

      // Subtle pulse for background bars
      setBars(prev => prev.map(b => ({
        ...b,
        height: Math.max(5, Math.min(95, b.height + (Math.random() - 0.5) * 1.5))
      })));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#02040a] flex flex-col items-center justify-center relative overflow-hidden font-sans select-none">
      
      {/* BACKGROUND LAYER: Stock Silhouettes (Vertical Pillars) */}
      <div className="absolute inset-0 z-0 flex items-end justify-around gap-1 px-2 pointer-events-none opacity-30">
        {bars.map((b, i) => (
          <div 
            key={i} 
            className="w-full max-w-[15px] rounded-t-lg transition-all duration-700 ease-in-out" 
            style={{ 
              height: `${b.height}%`, 
              backgroundColor: i % 10 === 0 ? 'rgba(168, 85, 247, 0.4)' : 'rgba(30, 41, 59, 0.4)',
              opacity: b.opacity,
              boxShadow: i % 10 === 0 ? '0 0 20px rgba(168, 85, 247, 0.1)' : 'none'
            }} 
          />
        ))}
      </div>

      {/* REGION DATA PILLARS: Placed to the sides to avoid covering the text */}
      <div className="absolute inset-0 z-10 pointer-events-none flex justify-between px-6 md:px-12 py-20">
        {/* Left Side: USA & JAPAN */}
        <div className="flex flex-col justify-around h-full">
          {[markets[0], markets[1]].map(m => (
            <div key={m.id} className="group flex flex-col items-start transition-opacity duration-500 opacity-60 hover:opacity-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{m.flag}</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{m.name}</span>
              </div>
              <div className="text-3xl font-mono font-bold text-white tracking-tighter drop-shadow-lg">
                {m.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`text-xs font-mono font-bold ${m.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {m.change >= 0 ? '+' : ''}{m.change.toFixed(2)}%
              </div>
              <div className="text-[9px] text-slate-700 font-bold uppercase mt-1 tracking-widest">{m.index}</div>
            </div>
          ))}
        </div>

        {/* Right Side: HK & GERMANY */}
        <div className="flex flex-col justify-around h-full text-right">
          {[markets[2], markets[3]].map(m => (
            <div key={m.id} className="group flex flex-col items-end transition-opacity duration-500 opacity-60 hover:opacity-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{m.name}</span>
                <span className="text-2xl">{m.flag}</span>
              </div>
              <div className="text-3xl font-mono font-bold text-white tracking-tighter drop-shadow-lg">
                {m.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`text-xs font-mono font-bold ${m.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {m.change >= 0 ? '+' : ''}{m.change.toFixed(2)}%
              </div>
              <div className="text-[9px] text-slate-700 font-bold uppercase mt-1 tracking-widest">{m.index}</div>
            </div>
          ))}
        </div>
      </div>

      {/* GRID OVERLAY */}
      <div className="absolute inset-0 z-5 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
      </div>

      {/* MAIN CONTENT: The Quote (Reserved Space) */}
      <div className="relative z-30 text-center px-6 max-w-5xl animate-fade-in-up flex flex-col items-center">
        {/* Branding Logo */}
        <div className="mb-14">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-2xl opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                <div className="relative px-12 py-7 bg-[#0B1221]/90 backdrop-blur-3xl rounded-2xl flex items-center divide-x divide-slate-800 border border-white/10 shadow-3xl">
                  <div className="flex items-center space-x-6 pr-10">
                    <svg viewBox="0 0 24 24" className="w-14 h-14 text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M4 5l8 16 8-16" />
                      <circle cx="7" cy="10" r="3" />
                      <path d="M17 13a3 3 0 1 0 0-6" />
                    </svg>
                    <span className="text-slate-100 text-4xl font-black tracking-tighter italic">
                        GEMINI <span className="text-purple-500">QUANT</span>
                    </span>
                  </div>
                  <div className="pl-10 text-indigo-400 font-mono text-sm group-hover:text-white transition duration-200 uppercase tracking-[0.4em] font-black">
                    TERMNL v2.5
                  </div>
                </div>
            </div>
        </div>

        {/* The Hero Quote */}
        <div className="mb-24 space-y-10">
            <h1 className="text-6xl md:text-8xl font-black text-white leading-tight tracking-tighter drop-shadow-[0_15px_45px_rgba(0,0,0,0.8)]">
                “You don’t choose <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-white to-slate-400">cheap or expensive.”</span>
            </h1>
            <h2 className="text-2xl md:text-4xl font-medium text-slate-400 italic max-w-4xl mx-auto leading-relaxed">
                “You choose whether you’re paid by <br className="md:hidden"/>
                <span className="text-purple-400 font-bold border-b-4 border-purple-500/50 hover:text-purple-300 px-3 transition-colors">direction</span> 
                <span className="mx-4 text-slate-600 font-light">or by</span> 
                <span className="text-blue-400 font-bold border-b-4 border-blue-500/50 hover:text-blue-300 px-3 transition-colors">movement</span>.”
            </h2>
        </div>

        {/* Start Button */}
        <button 
            onClick={onStart}
            className="group relative inline-flex items-center justify-center px-20 py-10 font-black text-white transition-all duration-300 bg-purple-600 rounded-full hover:bg-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.5)] hover:shadow-[0_0_80px_rgba(168,85,247,0.8)] hover:scale-110 active:scale-95 border-2 border-purple-400/50 overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <span className="relative flex items-center gap-8 tracking-[0.3em] uppercase text-3xl">
                BOOT TERMINAL
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="w-10 h-10 animate-bounce-x">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
            </span>
        </button>

        <p className="mt-20 text-slate-600 text-[11px] font-black uppercase tracking-[0.8em] opacity-50 flex items-center gap-4">
            <span className="w-8 h-px bg-slate-800"></span>
            NEURAL ENGINE ACTIVE • QUANTUM ARBITRAGE READY
            <span className="w-8 h-px bg-slate-800"></span>
        </p>
      </div>

      {/* DECORATIVE AMBIENCE */}
      <div className="absolute top-[-30%] left-[-20%] w-[900px] h-[900px] bg-purple-600/10 rounded-full blur-[200px] pointer-events-none animate-slow-spin"></div>
      <div className="absolute bottom-[-30%] right-[-20%] w-[900px] h-[900px] bg-blue-600/10 rounded-full blur-[200px] pointer-events-none animate-slow-spin-reverse"></div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(80px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 1.6s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }
        @keyframes bounceX {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(15px); }
        }
        .animate-bounce-x {
          animation: bounceX 1.5s infinite;
        }
        @keyframes slowSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slowSpinReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-slow-spin {
          animation: slowSpin 25s linear infinite;
        }
        .animate-slow-spin-reverse {
          animation: slowSpinReverse 30s linear infinite;
        }
        .fade-in {
            animation: fadeIn 1s ease-in forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
