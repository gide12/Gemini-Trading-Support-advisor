import React, { useState, useEffect } from "react";
import { getInitialScreenerData, simulateMarketUpdate } from "../services/marketDataService";
import { MarketTicker } from "../types";

interface StockScreenerProps {
    onSelectTicker: (ticker: string) => void;
}

const StockScreener: React.FC<StockScreenerProps> = ({ onSelectTicker }) => {
    const [activeTab, setActiveTab] = useState<'gainers' | 'losers'>('gainers');
    const [movers, setMovers] = useState<{ gainers: MarketTicker[], losers: MarketTicker[] }>({ gainers: [], losers: [] });

    useEffect(() => {
        // Initialize
        setMovers(getInitialScreenerData());

        // Live simulation loop
        const interval = setInterval(() => {
            setMovers(prev => ({
                gainers: simulateMarketUpdate(prev.gainers),
                losers: simulateMarketUpdate(prev.losers)
            }));
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const currentList = activeTab === 'gainers' ? movers.gainers : movers.losers;

    return (
        <div className="bg-[#0f172a] rounded-xl shadow-lg border border-purple-500/30 overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-purple-500/20 bg-purple-900/10 flex justify-between items-center">
                <h3 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-purple-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                    </svg>
                    Stock Screener
                </h3>
                <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-[10px] font-mono text-green-400 uppercase">Live</span>
                </div>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-purple-500/20 shrink-0">
                <button 
                    onClick={() => setActiveTab('gainers')}
                    className={`flex-1 py-3 text-xs font-bold uppercase transition-colors ${activeTab === 'gainers' ? 'bg-green-900/20 text-green-400 border-b-2 border-green-500' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
                >
                    Top Gainers
                </button>
                <button 
                    onClick={() => setActiveTab('losers')}
                    className={`flex-1 py-3 text-xs font-bold uppercase transition-colors ${activeTab === 'losers' ? 'bg-red-900/20 text-red-400 border-b-2 border-red-500' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
                >
                    Top Losers
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[300px]">
                {currentList.map((item, idx) => (
                    <div 
                        key={item.symbol}
                        onClick={() => onSelectTicker(item.symbol)}
                        className={`
                            p-3 border-b border-purple-500/10 cursor-pointer transition-colors flex justify-between items-center
                            ${idx % 2 === 0 ? 'bg-[#1e293b]/30' : 'bg-transparent'}
                            hover:bg-purple-900/20
                        `}
                    >
                        <div>
                            <div className="font-bold text-white text-sm flex items-center gap-2">
                                {item.symbol}
                                {/* Simple trend indicator based on random tick simulation (visual flair) */}
                                <span className={`text-[8px] ${Math.random() > 0.5 ? 'text-green-500' : 'text-red-500'}`}>
                                    {Math.random() > 0.5 ? '▲' : '▼'}
                                </span>
                            </div>
                            <div className="text-[10px] text-slate-500 truncate max-w-[80px]">{item.name}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-slate-200 font-mono text-sm">${item.price.toFixed(2)}</div>
                            <div className={`text-xs font-bold font-mono ${activeTab === 'gainers' ? 'text-green-400' : 'text-red-400'}`}>
                                {activeTab === 'gainers' ? '+' : ''}{item.changePercent.toFixed(2)}%
                            </div>
                        </div>
                    </div>
                ))}
                {currentList.length === 0 && (
                     <div className="p-8 text-center text-slate-500 text-xs">Loading market data...</div>
                )}
            </div>
            <div className="p-2 text-center bg-[#0f172a] border-t border-purple-500/10 shrink-0">
                <p className="text-[10px] text-slate-600">Streaming Data • 2s Delay</p>
            </div>
        </div>
    );
};

export default StockScreener;