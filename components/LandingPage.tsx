
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

interface SentimentData {
  category: string;
  asset: string;
  sentiment: "Bullish" | "Bearish" | "Neutral";
  score: number;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  // Region-based indices
  const [markets, setMarkets] = useState<RegionData[]>([
    { name: "USA", index: "S&P 500", price: 5234.18, change: 0.25, flag: "🇺🇸" },
    { name: "JAPAN", index: "Nikkei 225", price: 38912.50, change: -1.12, flag: "🇯🇵" },
    { name: "HONG KONG", index: "Hang Seng", price: 16723.10, change: 0.85, flag: "🇭🇰" },
    { name: "GERMANY", index: "DAX", price: 17930.40, change: -0.42, flag: "🇩🇪" }
  ]);

  // Sentiment data for the bottom marquee
  const sentiments: SentimentData[] = [
    { category: "ETF", asset: "QQQ", sentiment: "Bullish", score: 88 },
    { category: "ETF", asset: "SPY", sentiment: "Bullish", score: 74 },
    { category: "STOCK", asset: "NVDA", sentiment: "Bullish", score: 95 },
    { category: "STOCK", asset: "TSLA", sentiment: "Bearish", score: 42 },
    { category: "BOND", asset: "US 10Y", sentiment: "Neutral", score: 50 },
    { category: "BOND", asset: "GER 10Y", sentiment: "Neutral", score: 48 },
    { category: "FOREX", asset: "EUR/USD", sentiment: "Bearish", score: 38 },
    { category: "FOREX", asset: "USD/JPY", sentiment: "Bullish", score: 71 },
    { category: "ETF", asset: "ARKK", sentiment: "Bearish", score: 29 },
    { category: "STOCK", asset: "AAPL", sentiment: "Bullish", score: 65 },
  ];

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
    <div className="min-h-screen bg-[#02040a] flex flex-col items-center justify-center relative overflow-hidden font-sans select-none text-slate-200">
      
      {/* 1. BACKGROUND TEXTURE LAYER */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
      </div>

      {/* 2. RESTORED: BENJAMIN FRANKLIN BACKGROUND PORTRAIT */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-15 mix-blend-screen grayscale transition-opacity duration-1000">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Benjamin_Franklin_by_Joseph_Duplessis_1778.jpg/800px-Benjamin_Franklin_by_Joseph_Duplessis_1778.jpg" 
            alt="Benjamin Franklin" 
            className="w-full h-full object-cover scale-110 brightness-75 contrast-125 blur-[1px] animate-slow-zoom"
          />
          {/* Vignette to blend edges and protect center text readability */}
          <div className="absolute inset-0 bg-[#02040a]/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-[#02040a]"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#02040a] via-transparent to-[#02040a]"></div>
      </div>

      {/* 3. BACKGROUND ARCHITECTURE: Blurred Vertical Bars (Market Silhouettes) */}
      <div className="absolute inset-0 z-0 flex items-end justify-around gap-2 px-8 pointer-events-none opacity-20">
          {Array.from({length: 45}).map((_, i) => (
              <div 
                key={i} 
                className="w-full max-w-[12px] rounded-t-sm transition-all duration-1000" 
                style={{ 
                    height: `${15 + Math.random() * 70}%`, 
                    backgroundColor: i % 8 === 0 ? '#0ea5e9' : '#1e293b',
                    filter: 'blur(1px)',
                    opacity: 0.4 + Math.random() * 0.6
                }} 
              />
          ))}
      </div>

      {/* 4. INDEKS DATA (Top Professional Ribbon) */}
      <div className="absolute top-0 left-0 right-0 z-30 h-16 bg-black/70 backdrop-blur-2xl border-b border-white/5 flex items-center justify-center gap-4 md:gap-12 px-6">
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
                      <span className={`text-[10px] font-bold font-mono ${m.change >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                          {m.change >= 0 ? '▲' : '▼'} {Math.abs(m.change).toFixed(2)}%
                      </span>
                  </div>
              </div>
          ))}
      </div>

      {/* 5. MAIN CONTENT AREA (Reserved Center Space) */}
      <div className="relative z-20 text-center px-6 max-w-5xl animate-fade-in py-20">
        
        {/* Branding Header */}
        <div className="mb-14 inline-flex items-center gap-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-cyan-500/50"></div>
            <span className="text-[11px] font-black text-cyan-500 uppercase tracking-[0.8em]">Institutional Quant Terminal</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-cyan-500/50"></div>
        </div>

        {/* The Hero Quote */}
        <div className="mb-24 space-y-12">
            <h1 className="text-5xl md:text-8xl font-black text-white leading-tight tracking-tighter drop-shadow-2xl">
                “You don’t choose <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-white to-slate-500">cheap or expensive.”</span>
            </h1>
            <h2 className="text-2xl md:text-4xl font-light text-slate-400 max-w-4xl mx-auto leading-relaxed">
                “You choose whether you’re paid by <br className="md:hidden"/>
                <span className="text-white font-bold border-b-4 border-cyan-500/40 hover:text-cyan-400 transition-colors cursor-default px-4">direction</span> 
                <span className="mx-6 text-slate-700 italic">or by</span> 
                <span className="text-white font-bold border-b-4 border-cyan-500/40 hover:text-cyan-400 transition-colors cursor-default px-4">movement</span>.”
            </h2>
        </div>

        {/* Start Button */}
        <div className="relative group inline-block">
            <button 
                onClick={onStart}
                className="relative z-10 px-20 py-8 bg-white/5 backdrop-blur-md border border-white/20 text-white text-sm font-black uppercase tracking-[0.6em] transition-all duration-700 hover:bg-white hover:text-black hover:border-white shadow-[0_0_60px_rgba(0,0,0,0.5)] overflow-hidden rounded-full"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                Initialize Alpha Node
            </button>
            <div className="absolute inset-0 bg-cyan-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        </div>
      </div>

      {/* 6. RUNNING SENTIMENT TEXT (Bottom Marquee) */}
      <div className="absolute bottom-0 left-0 right-0 z-30 h-14 bg-black/40 backdrop-blur-xl border-t border-white/5 flex items-center overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee-fast gap-12 items-center">
            {/* Displaying twice for seamless loop */}
            {[...sentiments, ...sentiments].map((s, i) => (
                <div key={i} className="flex items-center gap-4 px-6 border-l border-white/5 h-full">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.category}</span>
                    <span className="text-sm font-mono font-bold text-white">{s.asset}</span>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${s.sentiment === 'Bullish' ? 'bg-cyan-500 animate-pulse shadow-[0_0_8px_#0ea5e9]' : s.sentiment === 'Bearish' ? 'bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]' : 'bg-slate-500'}`}></div>
                        <span className={`text-[11px] font-black uppercase ${s.sentiment === 'Bullish' ? 'text-cyan-400' : s.sentiment === 'Bearish' ? 'text-rose-400' : 'text-slate-400'}`}>
                            {s.sentiment} ({s.score}%)
                        </span>
                    </div>
                </div>
            ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes marquee-fast {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-fast {
          animation: marquee-fast 30s linear infinite;
        }
        @keyframes slowZoom {
          0%, 100% { transform: scale(1.1); }
          50% { transform: scale(1.15); }
        }
        .animate-slow-zoom {
          animation: slowZoom 20s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
