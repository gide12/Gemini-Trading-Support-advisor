
import React, { useState } from "react";
import { runFuzzyAnalysis, runFFFCMGNNAnalysis, runOptimalFuzzyDesignAnalysis, runFFTSPLPRAnalysis, runQuantumMCDMAnalysis } from "../services/geminiService";
import { FuzzyAnalysisResult, FFFCMGNNResult, OptimalFuzzyDesignResult, FFTSPLPRResult, QuantumMCDMResult } from "../types";
import SearchBar from "./SearchBar";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ScatterChart, Scatter, ZAxis, Legend, CartesianGrid } from "recharts";

type FuzzyModelType = 'standard' | 'ff-fcm-gnn' | 'optimal-fis' | 'ffts-plpr' | 'quantum-mcdm';

const PipelineNode = ({ title, sub, icon, active = false }: { title: string, sub: string, icon: React.ReactNode, active?: boolean }) => (
    <div className={`flex flex-col items-center group transition-all duration-500 ${active ? 'scale-110' : 'opacity-60'}`}>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${active ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-slate-900 border-slate-800 group-hover:border-slate-600'}`}>
            <div className={`${active ? 'text-emerald-400' : 'text-slate-600'}`}>
                {icon}
            </div>
        </div>
        <div className="mt-3 text-center">
            <h4 className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-white' : 'text-slate-500'}`}>{title}</h4>
            <p className="text-[8px] text-slate-600 font-bold mt-0.5">{sub}</p>
        </div>
    </div>
);

const PipelineConnector = ({ active = false }: { active?: boolean }) => (
    <div className="flex-1 flex justify-center py-2">
        <div className={`w-px h-8 transition-all duration-1000 ${active ? 'bg-gradient-to-b from-emerald-500 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-800'}`}></div>
    </div>
);

const FuzzyLogicView: React.FC = () => {
  const [ticker, setTicker] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeModel, setActiveModel] = useState<FuzzyModelType>('quantum-mcdm');
  
  const [standardData, setStandardData] = useState<FuzzyAnalysisResult | null>(null);
  const [advancedData, setAdvancedData] = useState<FFFCMGNNResult | null>(null);
  const [optimalFisData, setOptimalFisData] = useState<OptimalFuzzyDesignResult | null>(null);
  const [fftsData, setFftsData] = useState<FFTSPLPRResult | null>(null);
  const [mcdmData, setMcdmData] = useState<QuantumMCDMResult | null>(null);

  const handleSearch = async (searchTerm: string) => {
    setTicker(searchTerm);
    setIsLoading(true);
    // Reset results
    setStandardData(null); setAdvancedData(null); setOptimalFisData(null); setFftsData(null); setMcdmData(null);

    try {
      if (activeModel === 'standard') setStandardData(await runFuzzyAnalysis(searchTerm));
      else if (activeModel === 'ff-fcm-gnn') setAdvancedData(await runFFFCMGNNAnalysis(searchTerm));
      else if (activeModel === 'optimal-fis') setOptimalFisData(await runOptimalFuzzyDesignAnalysis(searchTerm));
      else if (activeModel === 'ffts-plpr') setFftsData(await runFFTSPLPRAnalysis(searchTerm));
      else if (activeModel === 'quantum-mcdm') setMcdmData(await runQuantumMCDMAnalysis(searchTerm));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const isIdle = !mcdmData && !isLoading;

  return (
    <div className="fade-in space-y-8 pb-10">
      <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-6 shadow-lg">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-emerald-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v17.792m0-17.792l-4.5 4.5m4.5-4.5l4.5 4.5M3 12h18M3 12l4.5-4.5M3 12l4.5 4.5M21 12l-4.5-4.5M21 12l-4.5 4.5" />
              </svg>
              Quant Decision Lab
            </h2>
            <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest">Active Architecture: MCDM Pipeline Hybrid</p>
          </div>
          <div className="flex bg-slate-900/50 p-1 rounded-lg border border-slate-800">
             {['quantum-mcdm', 'ffts-plpr', 'optimal-fis', 'ff-fcm-gnn'].map((m: any) => (
                 <button 
                    key={m} 
                    onClick={() => setActiveModel(m)}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase rounded transition-all ${activeModel === m ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                     {m.split('-').join(' ')}
                 </button>
             ))}
          </div>
        </div>

        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {/* PIPELINE SCHEMATIC (The "Engine" before analysis) */}
      {isIdle && activeModel === 'quantum-mcdm' && (
          <div className="animate-fade-in flex flex-col items-center py-10">
              <div className="max-w-md w-full space-y-1">
                  <PipelineNode 
                    title="Problem Identification" 
                    sub="Market Anomalies & Delta Lag" 
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    active={true}
                  />
                  <PipelineConnector active={isLoading} />
                  <PipelineNode 
                    title="Delphi Method" 
                    sub="Expert Consensus & Criteria Validation" 
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                    active={isLoading}
                  />
                  <PipelineConnector active={isLoading} />
                  <PipelineNode 
                    title="DEMATEL Engine" 
                    sub="Causality Analysis (Cause-Effect)" 
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
                    active={isLoading}
                  />
                  <PipelineConnector active={isLoading} />
                  <PipelineNode 
                    title="Quantum Spherical Fuzzy" 
                    sub="3D Uncertainty Modeling (α, β, γ)" 
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>}
                    active={isLoading}
                  />
                  <PipelineConnector active={isLoading} />
                  <PipelineNode 
                    title="Evaluation Triad" 
                    sub="COCOSO | TOPSIS | MULTIMOORA" 
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                    active={isLoading}
                  />
                  <PipelineConnector active={isLoading} />
                  <PipelineNode 
                    title="Optimal Decision" 
                    sub="Aggregated Strategic Rankings" 
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    active={isLoading}
                  />
              </div>
              <div className="mt-12 text-center max-w-lg">
                  <p className="text-slate-500 text-xs italic leading-relaxed">
                      Enter a ticker above to initiate the Quantum MCDM Pipeline. The system will run through the Delphi validation, DEMATEL causal mapping, and Spherical Fuzzy uncertainty modeling to generate an optimal consensus decision.
                  </p>
              </div>
          </div>
      )}

      {/* RESULTS VIEW */}
      {activeModel === 'quantum-mcdm' && mcdmData && (
          <div className="animate-fade-in space-y-8">
              {/* PHASES 1 & 2: Delphi & DEMATEL */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Delphi Card */}
                  <div className="bg-[#0f172a] rounded-xl border border-emerald-500/20 p-6 shadow-2xl">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Phase 1-2: Delphi & Criteria Validation</h3>
                      <div className="space-y-4">
                          {mcdmData.delphiValidation.map((c, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-slate-900/40 rounded border border-white/5">
                                  <div>
                                      <div className="text-xs font-bold text-slate-200">{c.criteria}</div>
                                      <div className="text-[9px] text-emerald-500 uppercase font-black">{c.status}</div>
                                  </div>
                                  <div className="text-right">
                                      <div className="text-sm font-mono text-white font-bold">{Math.round(c.validationScore * 100)}%</div>
                                      <div className="w-16 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                                          <div className="h-full bg-emerald-500" style={{ width: `${c.validationScore * 100}%` }}></div>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* DEMATEL Causal Map */}
                  <div className="bg-[#0f172a] rounded-xl border border-purple-500/20 p-6 shadow-2xl">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Phase 3: DEMATEL Causal Analysis</h3>
                      <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" opacity={0.3} />
                                  <XAxis type="number" dataKey="centrality" name="Centrality (R+C)" stroke="#64748b" label={{ value: 'Centrality (R+C)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }} />
                                  <YAxis type="number" dataKey="causality" name="Causality (R-C)" stroke="#64748b" label={{ value: 'Causality (R-C)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                                  <ZAxis type="number" range={[100, 400]} />
                                  <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                                      if (active && payload && payload.length) {
                                          return (
                                              <div className="bg-slate-900 border border-slate-700 p-2 rounded text-[10px] shadow-2xl">
                                                  <p className="font-bold text-white mb-1 uppercase tracking-tighter">{payload[0].payload.criteria}</p>
                                                  <p className="text-slate-400">Type: <span className={payload[0].payload.type === 'Cause' ? 'text-emerald-400' : 'text-rose-400'}>{payload[0].payload.type}</span></p>
                                                  <p className="text-slate-400 font-mono">Index: {payload[0].payload.causality.toFixed(2)}</p>
                                              </div>
                                          );
                                      }
                                      return null;
                                  }} />
                                  <Scatter name="Criteria" data={mcdmData.dematelAnalysis}>
                                      {mcdmData.dematelAnalysis.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.type === 'Cause' ? '#10b981' : '#f43f5e'} />
                                      ))}
                                  </Scatter>
                              </ScatterChart>
                          </ResponsiveContainer>
                      </div>
                      <div className="flex justify-center gap-6 mt-4">
                          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span><span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Cause Driver</span></div>
                          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]"></span><span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Effect Receiver</span></div>
                      </div>
                  </div>
              </div>

              {/* PHASE 3: Quantum Spherical Fuzzy */}
              <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-2xl border border-cyan-500/20 p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                      <svg className="w-48 h-48 text-cyan-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                  </div>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Phase 4: Quantum Spherical Fuzzy Modeling</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
                      <div className="md:col-span-1 flex flex-col items-center">
                          <div className="relative w-40 h-40">
                              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/10 flex items-center justify-center animate-pulse">
                                  <div className="w-28 h-28 rounded-full border-4 border-cyan-400 opacity-20"></div>
                              </div>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <span className="text-4xl font-black text-white">{Math.round((mcdmData.sphericalFuzzyModeling.membership - mcdmData.sphericalFuzzyModeling.nonMembership) * 100)}%</span>
                                  <span className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.2em]">Quantum State</span>
                              </div>
                          </div>
                      </div>
                      <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
                          <div className="bg-slate-900/50 p-5 rounded-xl border border-emerald-500/10 shadow-inner">
                              <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1 block">Membership (α)</span>
                              <div className="text-2xl font-mono text-emerald-400 font-bold">{(mcdmData.sphericalFuzzyModeling.membership).toFixed(3)}</div>
                              <div className="w-full h-1.5 bg-slate-800 mt-2 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 shadow-[0_0_8px_#10b981]" style={{ width: `${mcdmData.sphericalFuzzyModeling.membership * 100}%` }}></div>
                              </div>
                          </div>
                          <div className="bg-slate-900/50 p-5 rounded-xl border border-rose-500/10 shadow-inner">
                              <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1 block">Non-Membership (β)</span>
                              <div className="text-2xl font-mono text-rose-400 font-bold">{(mcdmData.sphericalFuzzyModeling.nonMembership).toFixed(3)}</div>
                              <div className="w-full h-1.5 bg-slate-800 mt-2 rounded-full overflow-hidden">
                                  <div className="h-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" style={{ width: `${mcdmData.sphericalFuzzyModeling.nonMembership * 100}%` }}></div>
                              </div>
                          </div>
                          <div className="bg-slate-900/50 p-5 rounded-xl border border-amber-500/10 shadow-inner">
                              <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1 block">Hesitancy (γ)</span>
                              <div className="text-2xl font-mono text-amber-400 font-bold">{(mcdmData.sphericalFuzzyModeling.hesitancy).toFixed(3)}</div>
                              <div className="w-full h-1.5 bg-slate-800 mt-2 rounded-full overflow-hidden">
                                  <div className="h-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" style={{ width: `${mcdmData.sphericalFuzzyModeling.hesitancy * 100}%` }}></div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* PHASE 5-6: Alternative Evaluation Triad */}
              <div className="bg-slate-900/40 rounded-xl border border-purple-500/20 overflow-hidden shadow-2xl">
                  <div className="px-6 py-4 border-b border-purple-500/10 flex justify-between items-center bg-slate-800/30">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phase 5-6: Alternative Evaluation & Multi-Method Ranking</h3>
                      <span className="text-[9px] text-purple-400 font-mono font-bold">TRIAD: COCOSO | TOPSIS | MULTIMOORA</span>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <thead>
                              <tr className="text-[9px] text-slate-500 uppercase tracking-widest border-b border-white/5 bg-slate-900/60">
                                  <th className="px-6 py-4">Strategic Alternative</th>
                                  <th className="px-6 py-4 text-center">COCOSO</th>
                                  <th className="px-6 py-4 text-center">TOPSIS</th>
                                  <th className="px-6 py-4 text-center">MULTIMOORA</th>
                                  <th className="px-6 py-4 text-right">Aggregated Score</th>
                              </tr>
                          </thead>
                          <tbody className="text-xs font-mono">
                              {mcdmData.alternativeEvaluation.map((alt, i) => (
                                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                      <td className="px-6 py-4 text-slate-200 font-bold">{alt.alternative}</td>
                                      <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">R-{alt.cocosoRank}</span></td>
                                      <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">R-{alt.topsisRank}</span></td>
                                      <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">R-{alt.multimooraRank}</span></td>
                                      <td className="px-6 py-4 text-right text-purple-400 font-black">{(alt.aggregatedScore).toFixed(4)}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>

              {/* PHASE 7: Final Decision */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8 bg-emerald-900/10 border border-emerald-500/20 p-6 rounded-2xl shadow-2xl">
                      <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4">Final Peringkat & Keputusan Optimal</h3>
                      <div className="space-y-4">
                          {mcdmData.finalDecision.map((d, i) => (
                              <div key={i} className={`flex items-start gap-6 p-4 rounded-xl border transition-all duration-300 ${i === 0 ? 'bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-900/20 scale-[1.02]' : 'bg-slate-900/40 border-white/5'}`}>
                                  <div className={`text-2xl font-black ${i === 0 ? 'text-emerald-400' : 'text-slate-600'}`}>#{d.rank}</div>
                                  <div className="flex-1">
                                      <div className={`text-lg font-bold mb-1 ${i === 0 ? 'text-white' : 'text-slate-300'}`}>{d.alternative}</div>
                                      <p className="text-xs text-slate-400 leading-relaxed italic">"{d.actionableIntel}"</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
                  <div className="lg:col-span-4 bg-slate-900 border border-purple-500/20 p-6 rounded-2xl flex flex-col justify-center text-center shadow-2xl">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Pipeline Executive Summary</h3>
                      <p className="text-sm text-slate-300 leading-relaxed italic leading-relaxed font-serif">
                          "{mcdmData.summary}"
                      </p>
                      <div className="mt-8 pt-6 border-t border-white/5 text-[9px] text-slate-600 font-mono">
                          ENGINE_REL: 4.1.0-QS-FUZZY
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default FuzzyLogicView;
