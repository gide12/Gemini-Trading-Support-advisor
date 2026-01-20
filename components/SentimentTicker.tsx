
import React, { useState, useEffect } from "react";

interface SentimentItem {
  category: string;
  asset: string;
  sentiment: "Bullish" | "Bearish" | "Neutral";
  score: number;
}

const INITIAL_SENTIMENTS: SentimentItem[] = [
  { category: "ETF", asset: "QQQ", sentiment: "Bullish", score: 88 },
  { category: "ETF", asset: "SPY", sentiment: "Bullish", score: 74 },
  { category: "STOCK", asset: "NVDA", sentiment: "Bullish", score: 95 },
  { category: "STOCK", asset: "TSLA", sentiment: "Bearish", score: 42 },
  { category: "BOND", asset: "US 10Y", sentiment: "Neutral", score: 50 },
  { category: "FOREX", asset: "EUR/USD", sentiment: "Bearish", score: 38 },
  { category: "FOREX", asset: "USD/JPY", sentiment: "Bullish", score: 71 },
  { category: "ETF", asset: "ARKK", sentiment: "Bearish", score: 29 },
  { category: "STOCK", asset: "AAPL", sentiment: "Bullish", score: 65 },
  { category: "COMMODITY", asset: "GOLD", sentiment: "Bullish", score: 82 },
  { category: "COMMODITY", asset: "CRUDE OIL", sentiment: "Bearish", score: 45 },
];

const SentimentTicker: React.FC = () => {
  const [data, setData] = useState<SentimentItem[]>(INITIAL_SENTIMENTS);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => prev.map(item => {
        // Small random fluctuations in sentiment score
        const fluctuation = (Math.random() - 0.5) * 2;
        let newScore = Math.max(0, Math.min(100, item.score + fluctuation));
        
        let newSentiment = item.sentiment;
        if (newScore > 60) newSentiment = "Bullish";
        else if (newScore < 40) newSentiment = "Bearish";
        else newSentiment = "Neutral";

        return { ...item, score: Number(newScore.toFixed(0)), sentiment: newSentiment };
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Repeat items for seamless scrolling
  const displayItems = [...data, ...data, ...data];

  return (
    <div className="bg-slate-950 border-b border-white/5 h-8 flex items-center overflow-hidden relative z-30 select-none shadow-inner">
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none"></div>
      
      <div className="flex items-center gap-0 animate-marquee whitespace-nowrap will-change-transform">
        {displayItems.map((s, i) => (
          <div key={`${s.asset}-${i}`} className="flex items-center gap-4 px-8 border-r border-white/5 h-full group">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{s.category}</span>
            <span className="text-xs font-mono font-bold text-slate-300 group-hover:text-white transition-colors">{s.asset}</span>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${
                s.sentiment === 'Bullish' ? 'bg-cyan-500 animate-pulse shadow-[0_0_6px_#0ea5e9]' : 
                s.sentiment === 'Bearish' ? 'bg-rose-500 animate-pulse shadow-[0_0_6px_#f43f5e]' : 
                'bg-slate-500'
              }`}></div>
              <span className={`text-[10px] font-black uppercase ${
                s.sentiment === 'Bullish' ? 'text-cyan-400/80' : 
                s.sentiment === 'Bearish' ? 'text-rose-400/80' : 
                'text-slate-500'
              }`}>
                {s.sentiment} <span className="opacity-60 text-[8px]">({s.score}%)</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SentimentTicker;
