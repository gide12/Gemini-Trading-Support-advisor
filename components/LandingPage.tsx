
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
  color: string;
}

// Helper to generate a random candlestick
const generateCandle = (prevClose: number) => {
  const change = (Math.random() - 0.5) * 12;
  const open = prevClose;
  const close = open + change;
  const high = Math.max(open, close) + Math.random() * 6;
  const low = Math.min(open, close) - Math.random() * 6;
  // High contrast colors
  return { 
    open, 
    close, 
    high, 
    low, 
    color: close >= open ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)',
    glow: close >= open ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'
  };
};

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [candles, setCandles] = useState<{ open: number, close: number, high: number, low: number, color: string, glow: string }[]>([]);
  
  // Multi-region market state
  const [markets, setMarkets] = useState<RegionData[]>([
    { name: "USA", index: "S&P 500", price: 5234.18, change: 0.25, flag: "🇺🇸", color: "text-blue-400" },
    { name: "JAPAN", index: "Nikkei 225", price: 38912.50, change: -1.12, flag: "🇯🇵", color: "text-red-400" },
    { name: "HONG KONG", index: "Hang Seng", price: 16723.10, change: 0.85, flag: "🇭🇰", color: "text-yellow-400" },
    { name: "GERMANY", index: "DAX", price: 17930.40, change: -0.42, flag: "🇩🇪", color: "text-orange-400" }
  ]);

  // Initialize and update candles + markets
  useEffect(() => {
    let currentPrice = 150;
    const initialCandles = Array.from({ length: 60 }).map(() => {
      const c = generateCandle(currentPrice);
      currentPrice = c.close;
      return c;
    });
    setCandles(initialCandles);

    const interval = setInterval(() => {
      // Update Candles
      setCandles(prev => {
        const last = prev[prev.length - 1];
        const next = generateCandle(last.close);
        return [...prev.slice(1), next];
      });

      // Update Market Indices
      setMarkets(prev => prev.map(m => {
        const volatility = m.name === "USA" ? 2.5 : m.name === "JAPAN" ? 15.0 : 8.0;
        const tick = (Math.random() - 0.48) * volatility;
        const newPrice = m.price + tick;
        const newChange = m.change + (tick / m.price * 100);
        return { ...m, price: newPrice, change: newChange };
      }));
    }, 180);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#02040a] flex flex-col items-center justify-center relative overflow-hidden font-sans select-none">
      
      {/* High Contrast Moving Candlestick Background */}
      <div className="absolute inset-0 z-0 opacity-40 flex items-end justify-around gap-1 px-2 pointer-events-none">
        {candles.map((c, i) => (
          <div key={i} className="flex flex-col items-center flex-1 h-full justify-center transition-all duration-300">
             {/* Wick */}
             <div 
               className="w-[2px] opacity-60 absolute" 
               style={{ 
                 height: `${Math.abs(c.high - c.low) * 6}px`,
                 backgroundColor: c.color,
                 transform: `translateY(${(150 - (c.high + c.low) / 2) * 3}px)`
               }} 
             />
             {/* Body */}
             <div 
               className="w-full max-w-[10px] rounded-sm transition-all duration-500 border border-white/10" 
               style={{ 
                 height: `${Math.max(Math.abs(c.close - c.open) * 6, 4)}px`, 
                 backgroundColor: c.color,
                 boxShadow: `0 0 25px ${c.glow}, inset 0 0 5px rgba(255,255,255,0.2)`,
                 transform: `translateY(${(150 - (c.close + c.open) / 2) * 3}px)`
               }} 
             />
          </div>
        ))}
      </div>

      {/* Global Market Feed Overlay */}
      <div className="absolute top-10 left-0 right-0 z-20 flex flex-wrap justify-center gap-6 px-10">
          {markets.map((m) => (
              <div key={m.name} className="bg-[#0B1221]/60 backdrop-blur-xl border border-white/10 p-4 rounded-xl min-w-[200px] shadow-2xl animate-pulse-slow">
                  <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                          <span className="text-lg">{m.flag}</span>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{m.name}</span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold ${m.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {m.change >= 0 ? '▲' : '▼'} {Math.abs(m.change).toFixed(2)}%
                      </span>
                  </div>
                  <div className="text-xl font-mono font-bold text-white tracking-tighter">
                      {m.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[9px] text-slate-600 font-bold uppercase mt-1 tracking-wider">{m.index}</div>
              </div>
          ))}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 text-center px-6 max-w-5xl mt-20 animate-fade-in-up">
        {/* Branding Logo Flair */}
        <div className="mb-12 inline-block">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur-xl opacity-40 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative px-10 py-6 bg-[#0B1221]/90 backdrop-blur-2xl rounded-2xl leading-none flex items-center divide-x divide-gray-700 border border-white/10 shadow-3xl">
                  <span className="flex items-center space-x-6">
                    <svg viewBox="0 0 24 24" className="w-12 h-12 text-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M4 5l8 16 8-16" />
                      <circle cx="7" cy="10" r="3" />
                      <path d="M17 13a3 3 0 1 0 0-6" />
                    </svg>
                    <span className="pr-8 text-slate-500 text-3xl font-black tracking-tighter italic">
                        <span className="text-white">GEMINI</span> TRADING
                    </span>
                  </span>
                  <span className="pl-8 text-indigo-400 font-mono text-sm group-hover:text-white transition duration-200 uppercase tracking-[0.3em] font-bold">PRO QUANT v2.5</span>
                </div>
            </div>
        </div>

        {/* The Quote */}
        <div className="mb-24 space-y-8">
            <h1 className="text-6xl md:text-8xl font-black text-white leading-tight tracking-tighter drop-shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
                “You don’t choose <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-500">cheap or expensive.”</span>
            </h1>
            <h2 className="text-2xl md:text-4xl font-medium text-slate-400 italic">
                “You choose whether you’re paid by <span className="text-purple-400 border-b-4 border-purple-500/50 transition-all hover:text-purple-300 px-2">direction</span> or by <span className="text-blue-400 border-b-4 border-blue-500/50 transition-all hover:text-blue-300 px-2">movement</span>.”
            </h2>
        </div>

        {/* Start Button */}
        <button 
            onClick={onStart}
            className="group relative inline-flex items-center justify-center px-16 py-8 font-bold text-white transition-all duration-300 bg-purple-600 rounded-full hover:bg-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:shadow-[0_0_70px_rgba(168,85,247,0.9)] hover:scale-110 active:scale-95 border-2 border-purple-400/50 overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="relative flex items-center gap-6 tracking-[0.2em] uppercase text-2xl font-black">
                Initialize System
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-8 h-8 animate-bounce-x">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
            </span>
        </button>

        <p className="mt-20 text-slate-500 text-[10px] font-bold uppercase tracking-[0.6em] opacity-40">
            High-Frequency Neural Engine • Real-Time Arbitrage Support • Tier 1 Liquidity
        </p>
      </div>

      {/* Decorative High-Contrast Blur Orbs */}
      <div className="absolute top-[-25%] left-[-15%] w-[700px] h-[700px] bg-purple-600/30 rounded-full blur-[180px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-25%] right-[-15%] w-[700px] h-[700px] bg-blue-600/30 rounded-full blur-[180px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(60px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes bounceX {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(12px); }
        }
        .animate-bounce-x {
          animation: bounceX 1.5s infinite;
        }
        @keyframes pulseSlow {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.05); }
        }
        .animate-pulse-slow {
            animation: pulseSlow 8s infinite ease-in-out;
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
