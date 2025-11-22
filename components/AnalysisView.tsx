import React, { useState, useCallback } from "react";
import Tabs from "./Tabs";
import SearchBar from "./SearchBar";
import ResultsDisplay from "./ResultsDisplay";
import { AnalysisType, AnalysisResult } from "../types";
import { analyzeStock } from "../services/geminiService";

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
    
    if (currentTicker) {
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
  }, [currentTicker]);

  return (
    <div className="bg-[#0f172a] rounded-xl shadow-2xl border border-slate-800 p-6 lg:p-8 min-h-[600px] fade-in">
        <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">AI Market Analysis</h2>
            <p className="text-slate-400 text-sm">Deep dive into any asset with Gemini 2.5 Flash models.</p>
        </div>

        <Tabs activeTab={activeTab} onTabChange={handleTabChange} />
        
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

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
  );
};

export default AnalysisView;
