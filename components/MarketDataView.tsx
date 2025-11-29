import React, { useEffect, useState } from "react";
import { MarketTicker } from "../types";
import { getInitialMarketData, simulateMarketUpdate } from "../services/marketDataService";

const MarketDataView: React.FC = () => {
  const [tickers, setTickers] = useState<MarketTicker[]>([]);
  const [newSymbol, setNewSymbol] = useState("");

  useEffect(() => {
    setTickers(getInitialMarketData());
    
    const interval = setInterval(() => {
      setTickers(prev => simulateMarketUpdate(prev));
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const handleAddTicker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol.trim()) return;
    
    const symbol = newSymbol.toUpperCase().trim();
    
    // Prevent duplicates
    if (tickers.some(t => t.symbol === symbol)) {
        setNewSymbol("");
        return;
    }

    // Create mock initial data for the new ticker
    const basePrice = Math.random() * 500 + 50;
    const newTicker: MarketTicker = {
        symbol,
        name: "Custom Asset",
        price: basePrice,
        change: 0,
        changePercent: 0,
        bid: basePrice * 0.99,
        ask: basePrice * 1.01,
        volume: Math.floor(Math.random() * 1000000)
    };

    setTickers(prev => [newTicker, ...prev]);
    setNewSymbol("");
  };

  const handleDeleteTicker = (symbol: string) => {
    setTickers(prev => prev.filter(t => t.symbol !== symbol));
  };

  const formatVolume = (vol: number) => {
    if (!vol) return "0";
    if (vol >= 1_000_000_000) return `${(vol / 1_000_000_000).toFixed(2)}B`;
    if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M`;
    return (vol / 1000).toFixed(1) + 'K';
  };

  return (
    <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-6 shadow-lg min-h-[600px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h2 className="text-2xl font-bold text-white">Live Market Data</h2>
                <p className="text-slate-400 text-sm">Real-time streaming quotes for major assets & indices.</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-end md:items-center w-full md:w-auto">
                {/* Live Indicator */}
                <div className="flex items-center gap-2 mb-2 md:mb-0">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-mono text-green-400 whitespace-nowrap">LIVE FEED</span>
                </div>

                {/* Add Ticker Input */}
                <form onSubmit={handleAddTicker} className="flex gap-2 w-full md:w-auto">
                    <input 
                        type="text"
                        value={newSymbol}
                        onChange={(e) => setNewSymbol(e.target.value)}
                        placeholder="ADD SYMBOL"
                        className="bg-[#1e293b] border border-purple-500/30 text-white px-3 py-2 rounded text-xs focus:outline-none focus:border-purple-500 w-full md:w-32 uppercase"
                    />
                    <button 
                        type="submit"
                        disabled={!newSymbol}
                        className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 text-white px-3 py-2 rounded text-xs font-bold transition-colors"
                    >
                        ADD
                    </button>
                </form>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tickers.map((ticker) => (
                <div key={ticker.symbol} className="bg-[#1e293b] rounded-lg p-4 border border-purple-500/20 hover:border-purple-500/50 transition-all hover:shadow-purple-900/20 hover:shadow-lg group relative">
                    
                    <button 
                        onClick={() => handleDeleteTicker(ticker.symbol)}
                        className="absolute top-2 right-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-[#1e293b]/80 rounded"
                        title="Remove"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>

                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">{ticker.symbol}</h3>
                            <p className="text-xs text-slate-400 truncate max-w-[120px]">{ticker.name}</p>
                        </div>
                        <div className={`text-right ${ticker.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                             <div className="text-lg font-mono font-semibold">
                                {ticker.change >= 0 ? '+' : ''}{(ticker.changePercent || 0).toFixed(2)}%
                             </div>
                             <div className="text-xs">
                                {ticker.change >= 0 ? '+' : ''}{(ticker.change || 0).toFixed(2)}
                             </div>
                        </div>
                    </div>
                    
                    <div className="text-2xl font-bold text-white mb-4">
                        ${(ticker.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 border-t border-purple-500/20 pt-3">
                        <div>
                            <div className="uppercase text-[10px] mb-1 text-slate-500">Bid</div>
                            <div className="font-mono text-slate-200">{(ticker.bid || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                        <div className="text-right">
                            <div className="uppercase text-[10px] mb-1 text-slate-500">Ask</div>
                            <div className="font-mono text-slate-200">{(ticker.ask || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                         <div className="col-span-2 mt-2 pt-2 border-t border-purple-500/10 flex justify-between items-center">
                            <div className="uppercase text-[10px] text-slate-500">Volume</div>
                            <div className="font-mono text-slate-200">{formatVolume(ticker.volume || 0)}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        
        <div className="mt-8 p-4 bg-purple-900/10 border border-purple-500/20 rounded-lg">
            <p className="text-center text-purple-200/60 text-sm">
                Market data is simulated for demonstration purposes. Added stocks use random initial values.
            </p>
        </div>
    </div>
  );
};

export default MarketDataView;