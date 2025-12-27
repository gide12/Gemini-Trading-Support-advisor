
import React, { useState, useCallback } from "react";
import Tabs from "./Tabs";
import SearchBar from "./SearchBar";
import ResultsDisplay from "./ResultsDisplay";
import StockScreener from "./StockScreener";
import { AnalysisType, AnalysisResult } from "../types";
import { analyzeStock } from "../services/geminiService";

const CLUSTERING_ALGORITHMS = [
  "AGGLOMERATIVE CLUSTERING",
  "BIRCH CLUSTERING",
  "K-MEANS CLUSTERING",
  "MINIBATCH CLUSTERING",
  "SPECTRAL CLUSTERING",
  "GAUSSIAN MIXTURE MODEL",
  "GBML-EMO CLUSTERING"
];

const AnalysisView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AnalysisType>(AnalysisType.News);
  const [currentTicker, setCurrentTicker] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (ticker: string) => {
    setCurrentTicker(ticker);
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeStock(ticker, activeTab);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  const handleTabChange = useCallback(async (newTab: AnalysisType) => {
    setActiveTab(newTab);
    
    if (newTab === AnalysisType.Clustering) {
         setResult(null); 
         setCurrentTicker(""); 
    } else {
        if (CLUSTERING_ALGORITHMS.includes(currentTicker)) {
             setCurrentTicker("");
             setResult(null);
        } else if (currentTicker) {
            setIsLoading(true);
            setError(null);
            try {
                const data = await analyzeStock(currentTicker, newTab);
                setResult(data);
            } catch (err: any) {
                setError(err.message || "An unexpected error occurred switching views");
            } finally {
                setIsLoading(false);
            }
        } else {
            setResult(null);
        }
    }
  }, [currentTicker]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
        {/* Left Column: Main Analysis */}
        <div 
            className="lg:col-span-3 bg-[#0f172a] rounded-xl shadow-2xl border border-emerald-500/20 p-6 lg:p-8 fade-in relative overflow-hidden"
            style={{
                backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url('https://images.cointelegraph.com/cdn-cgi/image/format=auto,onerror=redirect,quality=90,width=1434/https://s3.cointelegraph.com/uploads/2023-01/a570c0c7-2c93-4a18-8f55-1f95d52723c2.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <div className="w-2 h-6 bg-emerald-500"></div>
                            ADVANCED QUANT TERMINAL
                        </h2>
                        <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest">Active Node: Gemini 2.5 Flash / Search Grounding</p>
                    </div>
                    {currentTicker && !isLoading && (
                        <div className="text-right">
                             <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Selected Asset</div>
                             <div className="text-xl font-mono font-bold text-emerald-400">{currentTicker}</div>
                        </div>
                    )}
                </div>

                <Tabs activeTab={activeTab} onTabChange={handleTabChange} />
                
                {activeTab === AnalysisType.Clustering ? (
                    <div className="mb-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {CLUSTERING_ALGORITHMS.map(algo => (
                                <button 
                                    key={algo}
                                    onClick={() => handleSearch(algo)}
                                    disabled={isLoading}
                                    className={`px-3 py-2 rounded border text-[10px] font-bold transition-all uppercase tracking-wide backdrop-blur-sm ${
                                        currentTicker === algo 
                                        ? 'bg-emerald-600 border-emerald-500 text-white' 
                                        : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:border-emerald-500/50'
                                    } ${isLoading ? 'opacity-50' : ''}`}
                                >
                                    {algo.split(' ')[0]}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <SearchBar onSearch={handleSearch} isLoading={isLoading} />
                )}

                {error && (
                    <div className="bg-red-950/40 border border-red-500/30 rounded p-4 mb-6 animate-fade-in flex gap-4">
                        <div className="shrink-0 text-red-500 font-bold">ERR_SYS:</div>
                        <div className="text-red-200 text-xs leading-relaxed">{error}</div>
                    </div>
                )}

                <ResultsDisplay 
                    result={result} 
                    isLoading={isLoading} 
                    activeTab={activeTab} 
                />
            </div>
        </div>

        {/* Right Column: Stock Screener */}
        <div className="lg:col-span-1 fade-in">
            <StockScreener onSelectTicker={(ticker) => {
                if (activeTab === AnalysisType.Clustering) {
                    handleTabChange(AnalysisType.News).then(() => handleSearch(ticker));
                } else {
                    handleSearch(ticker);
                }
            }} />
        </div>
    </div>
  );
};

export default AnalysisView;
