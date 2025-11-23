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
  "SPECTRAL CLUSTERING"
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
    
    // If switching TO Clustering, clear everything so user picks an algo
    if (newTab === AnalysisType.Clustering) {
         setResult(null); 
         setCurrentTicker(""); 
    } else {
        // If switching FROM Clustering (where ticker is an Algo Name), clear it.
        // We don't want to search for "K-MEANS" in Yahoo Finance.
        if (CLUSTERING_ALGORITHMS.includes(currentTicker)) {
             setCurrentTicker("");
             setResult(null);
        } else if (currentTicker) {
            // Normal behavior: Keep the stock ticker and re-fetch for the new tab
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
        <div className="lg:col-span-3 bg-[#0f172a] rounded-xl shadow-2xl shadow-purple-900/10 border border-purple-500/30 p-6 lg:p-8 fade-in">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">AI Market Analysis</h2>
                <p className="text-slate-400 text-sm">Deep dive into any asset with Gemini 2.5 Flash models.</p>
            </div>

            <Tabs activeTab={activeTab} onTabChange={handleTabChange} />
            
            {activeTab === AnalysisType.Clustering ? (
                 <div className="mb-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {CLUSTERING_ALGORITHMS.map(algo => (
                            <button 
                                key={algo}
                                onClick={() => handleSearch(algo)}
                                disabled={isLoading}
                                className={`px-4 py-3 rounded-lg border text-xs font-bold transition-all uppercase tracking-wide ${
                                    currentTicker === algo 
                                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/40' 
                                    : 'bg-[#1e293b] border-purple-500/30 text-slate-300 hover:bg-purple-900/20 hover:text-white hover:border-purple-500/60'
                                } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                            >
                                {algo}
                            </button>
                        ))}
                     </div>
                     <p className="text-xs text-slate-500 mt-2 text-center">Select an algorithm to perform a market-wide regime analysis.</p>
                 </div>
            ) : (
                <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            )}

            {error && (
                <div className="bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    {error}
                </div>
            )}

            <ResultsDisplay 
                result={result} 
                isLoading={isLoading} 
                activeTab={activeTab} 
            />
        </div>

        {/* Right Column: Stock Screener */}
        <div className="lg:col-span-1 fade-in">
            <StockScreener onSelectTicker={(ticker) => {
                // If we are in clustering mode and user clicks a stock, force switch to News tab
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