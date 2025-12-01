
import React, { useState } from "react";
import { runFuzzyAnalysis, runFFFCMGNNAnalysis, runOptimalFuzzyDesignAnalysis, runFFTSPLPRAnalysis } from "../services/geminiService";
import { FuzzyAnalysisResult, FFFCMGNNResult, OptimalFuzzyDesignResult, FFTSPLPRResult } from "../types";
import SearchBar from "./SearchBar";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

type FuzzyModelType = 'standard' | 'ff-fcm-gnn' | 'optimal-fis' | 'ffts-plpr';

const FuzzyLogicView: React.FC = () => {
  const [ticker, setTicker] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeModel, setActiveModel] = useState<FuzzyModelType>('standard');
  
  // Results
  const [standardData, setStandardData] = useState<FuzzyAnalysisResult | null>(null);
  const [advancedData, setAdvancedData] = useState<FFFCMGNNResult | null>(null);
  const [optimalFisData, setOptimalFisData] = useState<OptimalFuzzyDesignResult | null>(null);
  const [fftsData, setFftsData] = useState<FFTSPLPRResult | null>(null);

  const handleSearch = async (searchTerm: string) => {
    setTicker(searchTerm);
    setIsLoading(true);
    setStandardData(null);
    setAdvancedData(null);
    setOptimalFisData(null);
    setFftsData(null);

    try {
      if (activeModel === 'standard') {
          const result = await runFuzzyAnalysis(searchTerm);
          setStandardData(result);
      } else if (activeModel === 'ff-fcm-gnn') {
          const result = await runFFFCMGNNAnalysis(searchTerm);
          setAdvancedData(result);
      } else if (activeModel === 'optimal-fis') {
          const result = await runOptimalFuzzyDesignAnalysis(searchTerm);
          setOptimalFisData(result);
      } else if (activeModel === 'ffts-plpr') {
          const result = await runFFTSPLPRAnalysis(searchTerm);
          setFftsData(result);
      }
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
            Fuzzy-Logic & Hybrid Engines
          </h2>
          <p className="text-slate-400 text-sm">Select an architecture to analyze nonlinear market phenomena.</p>
        </div>
        
        {/* Model Architecture Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 border-b border-purple-500/20 pb-6">
            <button
                onClick={() => { setActiveModel('standard'); setStandardData(null); setAdvancedData(null); setOptimalFisData(null); setFftsData(null); }}
                className={`flex-1 p-4 rounded-xl border transition-all text-left group ${activeModel === 'standard' ? 'bg-purple-900/20 border-purple-500 ring-1 ring-purple-500/50' : 'bg-[#1e293b]/50 border-purple-500/10 hover:border-purple-500/40'}`}
            >
                <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors mb-1">Microstructure Fuzzy Engine</div>
                <div className="text-xs text-slate-400">Whale Activity, MM Behavior, Accumulation Logic.</div>
            </button>

            <button
                onClick={() => { setActiveModel('ff-fcm-gnn'); setStandardData(null); setAdvancedData(null); setOptimalFisData(null); setFftsData(null); }}
                className={`flex-1 p-4 rounded-xl border transition-all text-left group ${activeModel === 'ff-fcm-gnn' ? 'bg-purple-900/20 border-purple-500 ring-1 ring-purple-500/50' : 'bg-[#1e293b]/50 border-purple-500/10 hover:border-purple-500/40'}`}
            >
                <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors mb-1">FF-FCM-GNN Model</div>
                <div className="text-xs text-slate-400">Fama-French Factors + Fuzzy Cognitive Map + Graph Neural Net.</div>
            </button>

            <button
                onClick={() => { setActiveModel('optimal-fis'); setStandardData(null); setAdvancedData(null); setOptimalFisData(null); setFftsData(null); }}
                className={`flex-1 p-4 rounded-xl border transition-all text-left group ${activeModel === 'optimal-fis' ? 'bg-purple-900/20 border-purple-500 ring-1 ring-purple-500/50' : 'bg-[#1e293b]/50 border-purple-500/10 hover:border-purple-500/40'}`}
            >
                <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors mb-1">Optimal FIS Design</div>
                <div className="text-xs text-slate-400">Type-1/Type-2 System Optimization (GFS, NFS, HFS, EFS, MFS).</div>
            </button>
            
            <button
                onClick={() => { setActiveModel('ffts-plpr'); setStandardData(null); setAdvancedData(null); setOptimalFisData(null); setFftsData(null); }}
                className={`flex-1 p-4 rounded-xl border transition-all text-left group ${activeModel === 'ffts-plpr' ? 'bg-purple-900/20 border-purple-500 ring-1 ring-purple-500/50' : 'bg-[#1e293b]/50 border-purple-500/10 hover:border-purple-500/40'}`}
            >
                <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors mb-1">FFTS-PLPR Model</div>
                <div className="text-xs text-slate-400">Two-Factor Fuzzy-Fluctuation w/ Probabilistic Linguistic Preferences.</div>
            </button>
        </div>

        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {/* STANDARD VIEW */}
      {activeModel === 'standard' && standardData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Market Maker Behavior */}
            <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">Market Maker Behavior</h3>
                    <span className={`px-3 py-1 rounded text-xs font-bold bg-slate-800 border border-slate-600`}>
                        {standardData.marketMakerBehavior.score.toUpperCase()}
                    </span>
                </div>
                
                <div className="mb-6">
                     <div className="text-xs text-slate-500 uppercase font-bold mb-2">Fuzzy Membership Level</div>
                     <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${getFuzzyColor(standardData.marketMakerBehavior.value)}`} style={{width: `${standardData.marketMakerBehavior.value}%`}}></div>
                     </div>
                </div>

                <div className="space-y-4 flex-1">
                    <div className="bg-[#1e293b]/50 p-3 rounded border border-purple-500/10">
                        <div className="text-xs text-slate-400 mb-1">Spread Compression</div>
                        <div className="text-sm font-mono text-cyan-300">{standardData.marketMakerBehavior.metrics.spreadCompression}</div>
                    </div>
                    <div className="bg-[#1e293b]/50 p-3 rounded border border-purple-500/10">
                        <div className="text-xs text-slate-400 mb-1">Order Book Imbalance</div>
                        <div className="text-sm font-mono text-cyan-300">{standardData.marketMakerBehavior.metrics.orderBookImbalance}</div>
                    </div>
                    <div className="bg-[#1e293b]/50 p-3 rounded border border-purple-500/10">
                        <div className="text-xs text-slate-400 mb-1">Iceberg Probability</div>
                        <div className="text-sm font-mono text-cyan-300">{standardData.marketMakerBehavior.metrics.icebergProbability}</div>
                    </div>
                    <div className="bg-[#1e293b]/50 p-3 rounded border border-purple-500/10">
                        <div className="text-xs text-slate-400 mb-1">Depth Volatility</div>
                        <div className="text-sm font-mono text-cyan-300">{standardData.marketMakerBehavior.metrics.depthVolatility}</div>
                    </div>
                </div>
            </div>

            {/* Whale Activity */}
            <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">Whale Activity</h3>
                    <span className={`px-3 py-1 rounded text-xs font-bold bg-slate-800 border border-slate-600`}>
                        {standardData.whaleActivity.score.toUpperCase()}
                    </span>
                </div>
                
                <div className="mb-6">
                     <div className="text-xs text-slate-500 uppercase font-bold mb-2">Fuzzy Membership Level</div>
                     <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${getFuzzyColor(standardData.whaleActivity.value)}`} style={{width: `${standardData.whaleActivity.value}%`}}></div>
                     </div>
                </div>

                <div className="space-y-4 flex-1">
                    <div className="bg-[#1e293b]/50 p-3 rounded border border-purple-500/10">
                        <div className="text-xs text-slate-400 mb-1">Block Trade Freq</div>
                        <div className="text-sm font-mono text-pink-300">{standardData.whaleActivity.metrics.blockTradeFreq}</div>
                    </div>
                    <div className="bg-[#1e293b]/50 p-3 rounded border border-purple-500/10">
                        <div className="text-xs text-slate-400 mb-1">Sweep Orders</div>
                        <div className="text-sm font-mono text-pink-300">{standardData.whaleActivity.metrics.sweepOrders}</div>
                    </div>
                    <div className="bg-[#1e293b]/50 p-3 rounded border border-purple-500/10">
                        <div className="text-xs text-slate-400 mb-1">Flow Toxicity (VPIN)</div>
                        <div className="text-sm font-mono text-pink-300">{standardData.whaleActivity.metrics.flowToxicity}</div>
                    </div>
                    <div className="bg-[#1e293b]/50 p-3 rounded border border-purple-500/10">
                        <div className="text-xs text-slate-400 mb-1">Hidden Orders</div>
                        <div className="text-sm font-mono text-pink-300">{standardData.whaleActivity.metrics.hiddenOrders}</div>
                    </div>
                </div>
            </div>

            {/* Accumulation */}
            <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">Accumulation</h3>
                    <span className={`px-3 py-1 rounded text-xs font-bold bg-slate-800 border border-slate-600`}>
                        {standardData.accumulation.score.toUpperCase()}
                    </span>
                </div>
                
                <div className="mb-6">
                     <div className="text-xs text-slate-500 uppercase font-bold mb-2">Fuzzy Membership Level</div>
                     <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${getFuzzyColor(standardData.accumulation.value)}`} style={{width: `${standardData.accumulation.value}%`}}></div>
                     </div>
                </div>

                <div className="space-y-4 flex-1">
                    <div className="bg-[#1e293b]/50 p-3 rounded border border-purple-500/10">
                        <div className="text-xs text-slate-400 mb-1">Net Buying Pressure</div>
                        <div className="text-sm font-mono text-green-300">{standardData.accumulation.metrics.netBuyingPressure}</div>
                    </div>
                    <div className="bg-[#1e293b]/50 p-3 rounded border border-purple-500/10">
                        <div className="text-xs text-slate-400 mb-1">Dark Pool Ratio</div>
                        <div className="text-sm font-mono text-green-300">{standardData.accumulation.metrics.darkPoolRatio}</div>
                    </div>
                    <div className="bg-[#1e293b]/50 p-3 rounded border border-purple-500/10">
                        <div className="text-xs text-slate-400 mb-1">Vol/Volatility Div</div>
                        <div className="text-sm font-mono text-green-300">{standardData.accumulation.metrics.volVolatilityDiv}</div>
                    </div>
                    <div className="bg-[#1e293b]/50 p-3 rounded border border-purple-500/10">
                        <div className="text-xs text-slate-400 mb-1">SAR Clusters</div>
                        <div className="text-sm font-mono text-green-300">{standardData.accumulation.metrics.sarClusters}</div>
                    </div>
                </div>
            </div>

            {/* Inference Summary */}
            <div className="lg:col-span-3 bg-[#0f172a] rounded-xl border border-purple-500/30 p-6">
                 <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">System Inference</h3>
                 <p className="text-slate-200 text-sm leading-relaxed">{standardData.summary}</p>
            </div>
        </div>
      )}

      {/* FF-FCM-GNN VIEW */}
      {activeModel === 'ff-fcm-gnn' && advancedData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              {/* Card 1: Fama-French Factors */}
              <div className="lg:col-span-1 bg-[#0f172a] rounded-xl border border-purple-500/30 p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-white mb-4 border-b border-purple-500/20 pb-2">3-Factor Inputs</h3>
                  <div className="space-y-6">
                      <div className="relative">
                          <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-400 uppercase font-bold">Market Risk (MKT)</span>
                              <span className="text-purple-300 font-mono">{advancedData.famaFrenchFactors.marketRisk.value.toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full mb-1">
                              <div className="bg-purple-500 h-2 rounded-full" style={{width: `${advancedData.famaFrenchFactors.marketRisk.value * 100}%`}}></div>
                          </div>
                          <p className="text-[10px] text-slate-500">{advancedData.famaFrenchFactors.marketRisk.description}</p>
                      </div>

                      <div className="relative">
                          <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-400 uppercase font-bold">Size Factor (SMB)</span>
                              <span className="text-blue-300 font-mono">{advancedData.famaFrenchFactors.sizeFactorSMB.value.toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full mb-1">
                              <div className="bg-blue-500 h-2 rounded-full" style={{width: `${advancedData.famaFrenchFactors.sizeFactorSMB.value * 100}%`}}></div>
                          </div>
                          <p className="text-[10px] text-slate-500">{advancedData.famaFrenchFactors.sizeFactorSMB.description}</p>
                      </div>

                      <div className="relative">
                          <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-400 uppercase font-bold">Value Factor (HML)</span>
                              <span className="text-pink-300 font-mono">{advancedData.famaFrenchFactors.valueFactorHML.value.toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full mb-1">
                              <div className="bg-pink-500 h-2 rounded-full" style={{width: `${advancedData.famaFrenchFactors.valueFactorHML.value * 100}%`}}></div>
                          </div>
                          <p className="text-[10px] text-slate-500">{advancedData.famaFrenchFactors.valueFactorHML.description}</p>
                      </div>
                  </div>
              </div>

              {/* Card 2: Cognitive Map Visualization (Grid of Concepts) */}
              <div className="lg:col-span-1 bg-[#0f172a] rounded-xl border border-purple-500/30 p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-white mb-4 border-b border-purple-500/20 pb-2">Fuzzy Cognitive Map</h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                      {advancedData.fuzzyCognitiveMap.nodes.map((node, i) => (
                          <div key={i} className={`p-2 rounded border border-purple-500/10 flex flex-col justify-center items-center text-center ${node.influenceType === 'Positive' ? 'bg-green-900/10' : node.influenceType === 'Negative' ? 'bg-red-900/10' : 'bg-slate-800/30'}`}>
                              <span className="text-xs font-bold text-slate-300">{node.name}</span>
                              <div className="w-full h-1 bg-slate-700 mt-2 rounded-full overflow-hidden">
                                   <div className={`h-full ${node.influenceType === 'Positive' ? 'bg-green-500' : 'bg-red-500'}`} style={{width: `${node.activationLevel * 100}%`}}></div>
                              </div>
                          </div>
                      ))}
                  </div>
                  <p className="text-xs text-slate-400 italic text-center">"{advancedData.fuzzyCognitiveMap.primaryCausalLink}"</p>
              </div>

              {/* Card 3: GNN Output */}
              <div className="lg:col-span-1 bg-[#0f172a] rounded-xl border border-purple-500/30 p-6 shadow-lg flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-32 h-32 text-purple-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                      </svg>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 border-b border-purple-500/20 pb-2">GNN Prediction</h3>
                    <div className="text-center py-4">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Signal Strength</div>
                        <div className={`text-4xl font-bold ${advancedData.gnnPrediction.signal.includes('Buy') ? 'text-green-400' : advancedData.gnnPrediction.signal.includes('Sell') ? 'text-red-400' : 'text-yellow-400'}`}>
                            {advancedData.gnnPrediction.signal}
                        </div>
                        <div className="text-sm font-mono text-slate-400 mt-1">{advancedData.gnnPrediction.confidence}% Confidence</div>
                    </div>
                  </div>
                  
                  {/* Vector Viz */}
                  <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 text-center">Graph Embedding Vector</div>
                      <div className="flex gap-1 justify-center h-16 items-end">
                          {advancedData.gnnPrediction.graphEmbedding.map((val, idx) => (
                              <div key={idx} className="w-3 bg-purple-500/60 rounded-t" style={{height: `${val * 100}%`}}></div>
                          ))}
                      </div>
                  </div>
              </div>

              {/* Summary */}
              <div className="lg:col-span-3 bg-[#0f172a] rounded-xl border border-purple-500/30 p-6">
                 <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Algorithm Summary</h3>
                 <p className="text-slate-200 text-sm leading-relaxed">{advancedData.summary}</p>
              </div>
          </div>
      )}

      {/* OPTIMAL FIS DESIGN VIEW */}
      {activeModel === 'optimal-fis' && optimalFisData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {/* GFS Card */}
              <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-5 shadow-lg flex flex-col hover:border-purple-500/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                          Genetic-Fuzzy (GFS)
                      </h3>
                      <span className="text-xs bg-cyan-900/30 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">{optimalFisData.gfsAnalysis.optimizationStatus}</span>
                  </div>
                  <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1 text-slate-400">
                          <span>Optimization Score</span>
                          <span>{optimalFisData.gfsAnalysis.score}/100</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500" style={{width: `${optimalFisData.gfsAnalysis.score}%`}}></div>
                      </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed flex-1">{optimalFisData.gfsAnalysis.description}</p>
              </div>

              {/* NFS Card */}
              <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-5 shadow-lg flex flex-col hover:border-purple-500/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                          Neuro-Fuzzy (NFS)
                      </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-[#1e293b] p-2 rounded text-center">
                          <div className="text-[10px] text-slate-500 uppercase font-bold">Network Depth</div>
                          <div className="text-lg font-mono text-pink-400">{optimalFisData.nfsAnalysis.networkDepth}</div>
                      </div>
                      <div className="bg-[#1e293b] p-2 rounded text-center">
                          <div className="text-[10px] text-slate-500 uppercase font-bold">Learning Rate</div>
                          <div className="text-lg font-mono text-pink-400">{optimalFisData.nfsAnalysis.learningRate}</div>
                      </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed flex-1">{optimalFisData.nfsAnalysis.description}</p>
              </div>

              {/* HFS Card */}
              <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-5 shadow-lg flex flex-col hover:border-purple-500/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                          Hierarchical (HFS)
                      </h3>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                      <div className="flex-1 text-center">
                          <div className="text-2xl font-bold text-purple-400">{optimalFisData.hfsAnalysis.reducedRules}</div>
                          <div className="text-[10px] text-slate-500 uppercase">Rules Reduced</div>
                      </div>
                      <div className="w-px h-8 bg-slate-700"></div>
                      <div className="flex-1 text-center">
                          <div className="text-2xl font-bold text-purple-400">{optimalFisData.hfsAnalysis.layers}</div>
                          <div className="text-[10px] text-slate-500 uppercase">Layers</div>
                      </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed flex-1">{optimalFisData.hfsAnalysis.description}</p>
              </div>

              {/* EFS Card */}
              <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-5 shadow-lg flex flex-col hover:border-purple-500/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-400"></span>
                          Evolving (EFS)
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded border ${optimalFisData.efsAnalysis.evolvingStatus === 'Expanding' ? 'bg-green-900/30 text-green-400 border-green-500/30' : 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'}`}>
                          {optimalFisData.efsAnalysis.evolvingStatus}
                      </span>
                  </div>
                  <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1 text-slate-400">
                          <span>Adaptation Speed</span>
                          <span>{optimalFisData.efsAnalysis.adaptationSpeed}ms</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{width: `${Math.min(optimalFisData.efsAnalysis.adaptationSpeed, 100)}%`}}></div>
                      </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed flex-1">{optimalFisData.efsAnalysis.description}</p>
              </div>

              {/* MFS Card */}
              <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-5 shadow-lg flex flex-col hover:border-purple-500/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                          Multiobjective (MFS)
                      </h3>
                      {optimalFisData.mfsAnalysis.paretoOptimal && (
                          <span className="text-[10px] bg-orange-900/30 text-orange-400 px-2 py-0.5 rounded border border-orange-500/30">Pareto Optimal</span>
                      )}
                  </div>
                  <div className="flex items-end justify-between h-16 gap-2 mb-4 px-4">
                       <div className="w-8 bg-slate-700 relative group h-full rounded-t">
                           <div className="absolute bottom-0 w-full bg-blue-500 rounded-t transition-all" style={{height: `${optimalFisData.mfsAnalysis.accuracy}%`}}></div>
                           <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] uppercase text-slate-500">Acc</span>
                       </div>
                       <div className="w-8 bg-slate-700 relative group h-full rounded-t">
                           <div className="absolute bottom-0 w-full bg-orange-500 rounded-t transition-all" style={{height: `${optimalFisData.mfsAnalysis.interpretability}%`}}></div>
                           <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] uppercase text-slate-500">Int</span>
                       </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed flex-1 mt-4">{optimalFisData.mfsAnalysis.description}</p>
              </div>

              {/* Overall Summary */}
              <div className="lg:col-span-1 bg-[#1e293b]/50 rounded-xl border border-purple-500/30 p-5 shadow-lg flex flex-col justify-center">
                  <h3 className="text-sm font-bold text-slate-300 uppercase mb-3 text-center">Optimization Synthesis</h3>
                  <p className="text-xs text-slate-300 leading-relaxed text-center italic">
                      "{optimalFisData.summary}"
                  </p>
              </div>
          </div>
      )}

      {/* FFTS-PLPR VIEW */}
      {activeModel === 'ffts-plpr' && fftsData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
             {/* Factor Split */}
             <div className="lg:col-span-1 bg-[#0f172a] rounded-xl border border-purple-500/30 p-6 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4 border-b border-purple-500/20 pb-2">Two-Factor Analysis</h3>
                
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-cyan-400 uppercase">Internal Trend (Potential)</span>
                        <span className="text-sm font-mono text-white">{(fftsData.twoFactors.internalTrend.strength * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full mb-2">
                        <div className="bg-cyan-500 h-2 rounded-full" style={{width: `${fftsData.twoFactors.internalTrend.strength * 100}%`}}></div>
                    </div>
                    <p className="text-[10px] text-slate-400">{fftsData.twoFactors.internalTrend.description}</p>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-pink-400 uppercase">External Shock (Disturbance)</span>
                        <span className="text-sm font-mono text-white">{(fftsData.twoFactors.externalDisturbance.impact * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full mb-2">
                        <div className="bg-pink-500 h-2 rounded-full" style={{width: `${fftsData.twoFactors.externalDisturbance.impact * 100}%`}}></div>
                    </div>
                    <p className="text-[10px] text-slate-400">{fftsData.twoFactors.externalDisturbance.description}</p>
                </div>
             </div>

             {/* PLPLR Rules */}
             <div className="lg:col-span-1 bg-[#0f172a] rounded-xl border border-purple-500/30 p-6 shadow-lg flex flex-col">
                 <h3 className="text-lg font-bold text-white mb-4 border-b border-purple-500/20 pb-2">Probabilistic Linguistic Preferences</h3>
                 <div className="space-y-3 flex-1 overflow-y-auto max-h-[250px] custom-scrollbar pr-2">
                     {fftsData.plprRules.map(rule => (
                         <div key={rule.ruleId} className="bg-[#1e293b]/50 border border-purple-500/10 p-3 rounded">
                             <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 mb-1">
                                 <span>{rule.ruleId}</span>
                                 <span>Prob: {rule.probability}</span>
                             </div>
                             <div className="text-sm text-slate-200 mb-1 font-medium">"{rule.condition}"</div>
                             <div className="flex items-center gap-2">
                                 <span className="text-xs text-purple-400">Preference:</span>
                                 <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded">{rule.preferenceBehavior}</span>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>

             {/* Similarity & Forecast */}
             <div className="lg:col-span-1 bg-[#0f172a] rounded-xl border border-purple-500/30 p-6 shadow-lg relative overflow-hidden flex flex-col justify-between">
                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-32 h-32 text-cyan-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                 </div>

                 <div>
                     <h3 className="text-lg font-bold text-white mb-4 border-b border-purple-500/20 pb-2">Similarity Forecast</h3>
                     <div className="bg-[#1e293b] p-3 rounded mb-4">
                         <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Method: {fftsData.similarityAnalysis.methodUsed}</div>
                         <div className="flex justify-between items-center">
                             <span className="text-xs text-slate-300">Distance from History</span>
                             <span className="font-mono text-cyan-400 font-bold">{fftsData.similarityAnalysis.distanceValue.toFixed(4)}</span>
                         </div>
                         <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2">
                             {/* Inverse representation: shorter distance = fuller bar (better match) */}
                             <div className="bg-cyan-500 h-1.5 rounded-full" style={{width: `${Math.max(0, 1 - fftsData.similarityAnalysis.distanceValue) * 100}%`}}></div>
                         </div>
                         <div className="text-[10px] text-slate-500 mt-1 text-right">Matches Rule: {fftsData.similarityAnalysis.closestHistoricalRuleId}</div>
                     </div>
                 </div>

                 <div className="text-center">
                     <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Predicted Direction</div>
                     <div className={`text-3xl font-bold ${fftsData.forecast.direction === 'Bullish' ? 'text-green-400' : fftsData.forecast.direction === 'Bearish' ? 'text-red-400' : 'text-yellow-400'}`}>
                         {fftsData.forecast.direction}
                     </div>
                     <div className="text-sm font-mono text-white mt-1">Target: ${fftsData.forecast.priceTarget.toFixed(2)}</div>
                     <div className="text-xs text-slate-500 mt-1">Confidence: {fftsData.forecast.confidence}%</div>
                 </div>
             </div>
             
             {/* Summary */}
             <div className="lg:col-span-3 bg-[#0f172a] rounded-xl border border-purple-500/30 p-6">
                 <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">FFTS-PLPR Synthesis</h3>
                 <p className="text-slate-200 text-sm leading-relaxed">{fftsData.summary}</p>
             </div>
          </div>
      )}
    </div>
  );
};

export default FuzzyLogicView;
