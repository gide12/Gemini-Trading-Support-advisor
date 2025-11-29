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
                <div className="bg-red-900/10 border border-red-500/30 rounded-xl p-4 mb-6 animate-fade-in relative shadow-lg shadow-red-900/5">
                    <button 
                        onClick={() => setError(null)}
                        className="absolute top-4 right-4 text-red-400 hover:text-red-200 transition-colors p-1 hover:bg-red-900/20 rounded-full"
                        aria-label="Dismiss error"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-red-500/10 rounded-full shrink-0 border border-red-500/20">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-red-400 font-bold mb-1 flex items-center gap-2">
                                Analysis Failed
                                <span className="text-[10px] bg-red-900/40 text-red-300 px-2 py-0.5 rounded border border-red-500/20 font-mono">CODE: {activeTab.toUpperCase().replace(/\s/g, '_')}</span>
                            </h3>
                            <p className="text-red-200/90 text-sm mb-4 leading-relaxed font-medium">
                                {error}
                            </p>
                            
                            <div className="bg-red-950/20 rounded-lg p-3 border border-red-500/10">
                                <h4 className="text-red-400/80 text-[10px] font-bold uppercase mb-2 tracking-wide">Troubleshooting Steps</h4>
                                <ul className="list-disc pl-4 text-xs text-red-200/60 space-y-1.5">
                                    <li>Verify the ticker symbol <strong>{currentTicker || "you entered"}</strong> is correct and listed on major exchanges.</li>
                                    <li>The AI model may be temporarily overloaded or the API quota exceeded. Please wait 10-15 seconds and try again.</li>
                                    <li>Check your internet connection. Data fetching requires an active network.</li>
                                    {activeTab === AnalysisType.Fundamental && <li>Fundamental data might be missing for smaller cap stocks or crypto assets.</li>}
                                    {activeTab === AnalysisType.Clustering && <li>Market clustering requires broad market data access which might fail intermittently.</li>}
                                </ul>
                            </div>
                        </div>
                    </div>
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