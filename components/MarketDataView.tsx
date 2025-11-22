import React, { useEffect, useState } from "react";
import { MarketTicker } from "../types";
import { getInitialMarketData, simulateMarketUpdate } from "../services/marketDataService";

const MarketDataView: React.FC = () => {
  const [tickers, setTickers] = useState<MarketTicker[]>([]);

  useEffect(() => {
    setTickers(getInitialMarketData());
    
    const interval = setInterval(() => {
      setTickers(prev => simulateMarketUpdate(prev));
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-6 shadow-lg min-h-[600px]">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-2xl font-bold text-white">Live Market Data</h2>
                <p className="text-slate-400 text-sm">Real-time streaming quotes for major assets.</p>
            </div>
            <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-xs font-mono text-green-400">LIVE FEED ACTIVE</span>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tickers.map((ticker) => (
                <div key={ticker.symbol} className="bg-[#1e293b] rounded-lg p-4 border border-slate-700 hover:border-slate-500 transition-all">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h3 className="text-lg font-bold text-white">{ticker.symbol}</h3>
                            <p className="text-xs text-slate-400 truncate max-w-[120px]">{ticker.name}</p>
                        </div>
                        <div className={`text-right ${ticker.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                             <div className="text-lg font-mono font-semibold">
                                {ticker.change >= 0 ? '+' : ''}{ticker.changePercent.toFixed(2)}%
                             </div>
                             <div className="text-xs">
                                {ticker.change >= 0 ? '+' : ''}{ticker.change.toFixed(2)}
                             </div>
                        </div>
                    </div>
                    
                    <div className="text-2xl font-bold text-white mb-4">
                        ${ticker.price.toFixed(2)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 border-t border-slate-700 pt-3">
                        <div>
                            <div className="uppercase text-[10px] mb-1">Bid</div>
                            <div className="font-mono text-slate-200">{ticker.bid.toFixed(2)}</div>
                        </div>
                        <div className="text-right">
                            <div className="uppercase text-[10px] mb-1">Ask</div>
                            <div className="font-mono text-slate-200">{ticker.ask.toFixed(2)}</div>
                        </div>
                         <div>
                            <div className="uppercase text-[10px] mb-1">Volume</div>
                            <div className="font-mono text-slate-200">{(ticker.volume / 1000000).toFixed(1)}M</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        
        <div className="mt-8 p-4 bg-blue-900/10 border border-blue-800/30 rounded-lg">
            <p className="text-center text-blue-200/60 text-sm">
                Market data is simulated for demonstration purposes. In a production environment, this would connect to a WebSocket feed.
            </p>
        </div>
    </div>
  );
};

export default MarketDataView;
