import React, { useState } from "react";
import { runFuzzyAnalysis } from "../services/geminiService";
import { FuzzyAnalysisResult } from "../types";
import SearchBar from "./SearchBar";

const FuzzyLogicView: React.FC = () => {
  const [ticker, setTicker] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<FuzzyAnalysisResult | null>(null);

  const handleSearch = async (searchTerm: string) => {
    setTicker(searchTerm);
    setIsLoading(true);
    setData(null);
    try {
      const result = await runFuzzyAnalysis(searchTerm);
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFuzzyColor = (score: number) => {
      if (score < 30) return 'bg-slate-500';
      if (score < 60) return 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]';
      if (score < 85) return 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.6)]';
      return 'bg-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.7)]';
  };

  return (
    <div className="fade-in space-y-8">
      <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-6 shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-cyan-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            Fuzzy-Logic Correlation Engine
          </h2>
          <p className="text-slate-400 text-sm">Analyze nonlinear market phenomena: Whales, Hidden Liquidity & Accumulation Events.</p>
        </div>

        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Market Maker Behavior */}
            <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">Market Maker Behavior</h3>
                    <span className={`px-3 py-1 rounded text-xs font-bold bg-slate-800 border border-slate-600`}>
                        {data.marketMakerBehavior.score.toUpperCase()}
                    </span>
                </div>
                
                <div className="mb-6">
                     <div className="text-xs text-slate-500 uppercase font-bold mb-2">Fuzzy Membership Level</div>
                     <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${getFuzzyColor(data.marketMakerBehavior.value)}`} style={{width: `${data.marketMakerBehavior.value}%`}}></div>
                     </div>
                </div>

                <div className="space-y-4 flex-1">
                    <div className="bg-[#1e293b]/50 p-3 rounded border border-purple-500/10">
                        <div className="text-xs text-slate-400 mb-1">Spread Compression</div>
                        <div className="text-sm font-mono text-cyan-300">{data.marketMakerBehavior.metrics.spreadCompression}</div>
                    </div>
                    <div className="bg-[#1e293b]/50 p-3 rounded border border-purple-500/10">
                        <div className="text-xs text-slate-400 mb-1">Order Book Imbalance</div>
                        <div className="text-sm font-mono text-cyan-300">{data.marketMakerBehavior.metrics.orderBookImbalance}</div>
                    </div>
                    <div className="bg-[#1e293b]/50 p-3 rounded border border-purple-500/10">
                        <div className="text-xs text-slate-400 mb-1">Iceberg Probability</div>
                        <div className="text-sm font-mono text-cyan-300">{data.marketMakerBehavior.metrics.icebergProbability}</div>
                    </div>
                    <div className="bg-[#1e293b]/50 p-3 rounded border border-purple-500/10">
                        <div className="text-xs text-slate-400 mb-1">Depth Volatility</div>
                        <div className="text-sm font-mono text-cyan-300">{data.marketMakerBehavior.metrics.depthVolatility}</div>
                    </div>
                </div>
            </div>

            {/* Whale Activity */}
            <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">Whale Activity</h3>
                    <span className={`px-3 py-1 rounded text-xs font-bold bg-slate-800 border border-slate-600`}>
                        {data.whaleActivity.score.toUpperCase()}
                    </span>
                </div>
                
                <div className="mb-6">
                     <div className="text-xs text-slate-500 uppercase font-bold mb-2">Fuzzy Membership Level</div>
                     <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${getFuzzyColor(data.whaleActivity.value)}`} style={{width: `${data.whaleActivity.value}%`}}></div>
                     </div>
                </div>

                <div className="space-y-4 flex-1">
                    <div className="bg-[#1e293b]/50 p-3 rounded border border-purple-500/10">
                        <div className="text-xs text-slate-400 mb-1">Block Trade Freq</div>
                        <div className="text-sm font-mono text-pink-300">{data.whaleActivity.metrics.blockTradeFreq}</div>
                    </div>
                    <div className="bg-[#1e293b]/50 p-3 rounded border border-purple-500/10">
                        <div className="text-xs text-slate-400 mb-1">Sweep Orders</div>
                        <div className="text-sm font-mono text-pink-300">{data.whaleActivity.metrics.sweepOrders}</div>
                    </div>
                    <div className="bg-[#1e293b]/50 p-3 rounded border border-purple-500/10">
                        <div className="text-xs text-slate-400 mb-1">Flow Toxicity (VPIN)</div>
                        <div className="text-sm font-mono text-pink-300">{data.whaleActivity.metrics.flowToxicity}</div>
                    </div>
                    <div className="bg-[#1e293b]/50 p-3 rounded border border-purple-500/10">
                        <div className="text-xs text-slate-400 mb-1">Hidden Orders</div>
                        <div className="text-sm font-mono text-pink-300">{data.whaleActivity.metrics.hiddenOrders}</div>
                    </div>
                </div>
            </div>

            {/* Accumulation */}
            <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">Accumulation</h3>
                    <span className={`px-3 py-1 rounded text-xs font-bold bg-slate-800 border border-slate-600`}>
                        {data.accumulation.score.toUpperCase()}
                    </span>
                </div>
                
                <div className="mb-6">
                     <div className="text-xs text-slate-500 uppercase font-bold mb-2">Fuzzy Membership Level</div>
                     <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${getFuzzyColor(data.accumulation.value)}`} style={{width: `${data.accumulation.value}%`}}></div>
                     </div>
                </div>

                <div className="space-y-4 flex-1">
                    <div className="bg-[#1e293b]/50 p-3 rounded border border-purple-500/10">
                        <div className="text-xs text-slate-400 mb-1">Net Buying Pressure</div>
                        <div className="text-sm font-mono text-green-300">{data.accumulation.metrics.netBuyingPressure}</div>
                    </div>
                    <div className="bg-[#1e293b]/50 p-3 rounded border border-purple-500/10">
                        <div className="text-xs text-slate-400 mb-1">Dark Pool Ratio</div>
                        <div className="text-sm font-mono text-green-300">{data.accumulation.metrics.darkPoolRatio}</div>
                    </div>
                    <div className="bg-[#1e293b]/50 p-3 rounded border border-purple-500/10">
                        <div className="text-xs text-slate-400 mb-1">Vol/Volatility Div</div>
                        <div className="text-sm font-mono text-green-300">{data.accumulation.metrics.volVolatilityDiv}</div>
                    </div>
                    <div className="bg-[#1e293b]/50 p-3 rounded border border-purple-500/10">
                        <div className="text-xs text-slate-400 mb-1">SAR Clusters</div>
                        <div className="text-sm font-mono text-green-300">{data.accumulation.metrics.sarClusters}</div>
                    </div>
                </div>
            </div>

            {/* Inference Summary */}
            <div className="lg:col-span-3 bg-[#0f172a] rounded-xl border border-purple-500/30 p-6">
                 <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">System Inference</h3>
                 <p className="text-slate-200 text-sm leading-relaxed">{data.summary}</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default FuzzyLogicView;