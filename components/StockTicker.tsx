import React, { useEffect, useState } from 'react';
import { getInitialMarketData, simulateMarketUpdate } from '../services/marketDataService';
import { MarketTicker } from '../types';

const StockTicker: React.FC = () => {
  const [tickers, setTickers] = useState<MarketTicker[]>([]);

  useEffect(() => {
    // Initial data
    setTickers(getInitialMarketData());

    // Updates
    const interval = setInterval(() => {
      setTickers(prev => simulateMarketUpdate(prev));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Triple the data to ensure seamless scrolling with the -33.33% translation
  const displayTickers = [...tickers, ...tickers, ...tickers];

  return (
    <div className="bg-[#0f172a] border-b border-purple-500/20 h-9 flex items-center overflow-hidden relative z-40 shadow-sm select-none">
      {/* Fade Gradients for smooth edges */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0f172a] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0f172a] to-transparent z-10 pointer-events-none"></div>
      
      <div className="flex items-center gap-0 animate-marquee whitespace-nowrap will-change-transform">
        {displayTickers.map((t, i) => (
          <div key={`${t.symbol}-${i}`} className="flex items-center gap-3 px-6 text-xs font-mono border-r border-slate-800/50">
            <span className="font-bold text-slate-300">{t.symbol}</span>
            <span className="text-slate-400">${t.price.toFixed(2)}</span>
            <span className={`flex items-center font-bold ${t.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {t.change >= 0 ? '▲' : '▼'} {Math.abs(t.changePercent).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockTicker;