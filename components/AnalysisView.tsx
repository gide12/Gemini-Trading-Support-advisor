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
        <div 
            className="lg:col-span-3 bg-[#0f172a] rounded-xl shadow-2xl shadow-purple-900/10 border border-purple-500/30 p-6 lg:p-8 fade-in relative overflow-hidden"
            style={{
                // Reduced opacity from 0.92 to 0.65 to make image visible
                backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.65), rgba(15, 23, 42, 0.85)), url('https://images.cointelegraph.com/cdn-cgi/image/format=auto,onerror=redirect,quality=90,width=1434/https://s3.cointelegraph.com/uploads/2023-01/a570c0c7-2c93-4a18-8f55-1f95d52723c2.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className="relative z-10">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white drop-shadow-md flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-purple-500 blur-lg opacity-20 rounded-full"></div>
                            {/* AI Chip Icon */}
                            <div className="w-9 h-9 bg-slate-900/80 rounded-lg border border-purple-500/50 backdrop-blur-sm shadow-[0_0_15px_rgba(168,85,247,0.3)] relative z-10 p-1 flex items-center justify-center">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-purple-400">
                                    <path d="M9 3V5M15 3V5M9 19V21M15 19V21M5 9H3M5 15H3M21 9H19M21 15H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="rgba(168, 85, 247, 0.1)"/>
                                    <path d="M9 9H15V15H9V9Z" stroke="currentColor" strokeWidth="1.5"/>
                                    <circle cx="12" cy="12" r="1.5" fill="currentColor" className="animate-pulse"/>
                                    <path d="M12 9V5M12 19V15M9 12H5M19 12H15" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
                                </svg>
                            </div>
                        </div>
                        Advanced Market Analysis
                    </h2>
                    <p className="text-slate-300 text-sm drop-shadow-md">Deep dive into any asset with Gemini 2.5 Flash models.</p>
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
                                    className={`px-4 py-3 rounded-lg border text-xs font-bold transition-all uppercase tracking-wide backdrop-blur-sm ${
                                        currentTicker === algo 
                                        ? 'bg-purple-600/90 border-purple-500 text-white shadow-lg shadow-purple-900/40' 
                                        : 'bg-[#1e293b]/80 border-purple-500/30 text-slate-300 hover:bg-purple-900/40 hover:text-white hover:border-purple-500/60'
                                    } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                                >
                                    {algo}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-slate-400 mt-2 text-center drop-shadow">Select an algorithm to perform a market-wide regime analysis.</p>
                    </div>
                ) : (
                    <SearchBar onSearch={handleSearch} isLoading={isLoading} />
                )}

                {error && (
                    <div className="bg-red-900/80 backdrop-blur-md border border-red-500/30 rounded-xl p-4 mb-6 animate-fade-in relative shadow-lg shadow-red-900/20">
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
                            <div className="p-3 bg-red-500/20 rounded-full shrink-0 border border-red-500/20">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-300">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-red-300 font-bold mb-1 flex items-center gap-2">
                                    Analysis Failed
                                    <span className="text-[10px] bg-red-900/60 text-red-200 px-2 py-0.5 rounded border border-red-500/20 font-mono">CODE: {activeTab.toUpperCase().replace(/\s/g, '_')}</span>
                                </h3>
                                <p className="text-red-100/90 text-sm mb-4 leading-relaxed font-medium">
                                    {error}
                                </p>
                                
                                <div className="bg-red-950/40 rounded-lg p-3 border border-red-500/10">
                                    <h4 className="text-red-300/80 text-[10px] font-bold uppercase mb-2 tracking-wide">Troubleshooting Steps</h4>
                                    <ul className="list-disc pl-4 text-xs text-red-100/70 space-y-1.5">
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