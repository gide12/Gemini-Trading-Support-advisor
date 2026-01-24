
import React, { useState, useMemo } from "react";
import { runFFFCMGNNAnalysis, runOptimalFuzzyDesignAnalysis, runFFTSPLPRAnalysis, runQuantumMCDMAnalysis } from "../services/geminiService";
import { FFFCMGNNResult, OptimalFuzzyDesignResult, FFTSPLPRResult, QuantumMCDMResult } from "../types";
import SearchBar from "./SearchBar";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ScatterChart, Scatter, ZAxis, Legend, CartesianGrid, LineChart, Line, AreaChart, Area, PieChart, Pie } from "recharts";

type FuzzyModelType = 'ff-fcm-gnn' | 'optimal-fis' | 'ffts-plpr' | 'quantum-mcdm';

// Fix: Correctly typing components to avoid 'key' prop issues in JSX
const PipelineNode: React.FC<{ title: string, sub: string, icon: React.ReactNode, active?: boolean, color?: string }> = ({ title, sub, icon, active = false, color = "emerald" }) => {
    const activeClass = color === "emerald" 
        ? "bg-emerald-500/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] text-emerald-400"
        : color === "purple"
        ? "bg-purple-500/20 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] text-purple-400"
        : color === "blue"
        ? "bg-blue-500/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] text-blue-400"
        : "bg-amber-500/20 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] text-amber-400";
    
    return (
        <div className={`flex flex-col items-center group transition-all duration-500 ${active ? 'scale-110' : 'opacity-60'}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${active ? activeClass : 'bg-slate-900 border-slate-800 group-hover:border-slate-600 text-slate-600'}`}>
                {icon}
            </div>
            <div className="mt-3 text-center">
                <h4 className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-white' : 'text-slate-500'}`}>{title}</h4>
                <p className="text-[8px] text-slate-600 font-bold mt-0.5">{sub}</p>
            </div>
        </div>
    );
};

// Fix: Correctly typing components to avoid 'key' prop issues in JSX
const PipelineConnector: React.FC<{ active?: boolean, color?: string }> = ({ active = false, color = "emerald" }) => {
    const activeClass = color === "emerald" ? "from-emerald-500 to-emerald-400" : color === "purple" ? "from-purple-500 to-purple-400" : color === "blue" ? "from-blue-500 to-blue-400" : "from-amber-500 to-amber-400";
    return (
        <div className="flex-1 flex justify-center py-2">
            <div className={`w-px h-8 transition-all duration-1000 ${active ? `bg-gradient-to-b ${activeClass} shadow-[0_0_8px_rgba(16,185,129,0.5)]` : 'bg-slate-800'}`}></div>
        </div>
    );
};

// Fix: Correctly typing components to avoid 'key' prop issues in JSX
const MembershipFunctionChart: React.FC<{ variable: string, sets: any[] }> = ({ variable, sets }) => {
    const data = useMemo(() => {
        const points = [];
        for (let i = 0; i <= 100; i += 2) {
            const entry: any = { x: i };
            sets.forEach(s => {
                const [a, b, c] = s.points || [0, 50, 100];
                let val = 0;
                if (i <= a || i >= c) val = 0;
                else if (i === b) val = 1;
                else if (i > a && i < b) val = (i - a) / (b - a);
                else if (i > b && i < c) val = (c - i) / (c - b);
                entry[s.name] = val;
            });
            points.push(entry);
        }
        return points;
    }, [sets]);
    const colors = ["#ef4444", "#eab308", "#10b981"];
    return (
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{variable} Sets</h5>
            <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <XAxis dataKey="x" hide />
                        <YAxis domain={[0, 1.1]} hide />
                        <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                        {sets.map((s, i) => (
                            <Area key={s.name} type="monotone" dataKey={s.name} stroke={colors[i % 3]} fill={colors[i % 3]} fillOpacity={0.1} />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const FuzzyLogicView: React.FC = () => {
  const [ticker, setTicker] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeModel, setActiveModel] = useState<FuzzyModelType>('quantum-mcdm');
  
  const [advancedData, setAdvancedData] = useState<FFFCMGNNResult | null>(null);
  const [optimalFisData, setOptimalFisData] = useState<OptimalFuzzyDesignResult | null>(null);
  const [fftsData, setFftsData] = useState<FFTSPLPRResult | null>(null);
  const [mcdmData, setMcdmData] = useState<QuantumMCDMResult | null>(null);

  const handleSearch = async (searchTerm: string) => {
    setTicker(searchTerm);
    setIsLoading(true);
    setAdvancedData(null); setOptimalFisData(null); setFftsData(null); setMcdmData(null);
    try {
      if (activeModel === 'ff-fcm-gnn') setAdvancedData(await runFFFCMGNNAnalysis(searchTerm));
      else if (activeModel === 'optimal-fis') setOptimalFisData(await runOptimalFuzzyDesignAnalysis(searchTerm));
      else if (activeModel === 'ffts-plpr') setFftsData(await runFFTSPLPRAnalysis(searchTerm));
      else if (activeModel === 'quantum-mcdm') setMcdmData(await runQuantumMCDMAnalysis(searchTerm));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const isIdle = !mcdmData && !advancedData && !optimalFisData && !fftsData && !isLoading;

  return (
    <div className="fade-in space-y-8 pb-10">
      <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-6 shadow-lg">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-emerald-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v17.792m0-17.792l-4.5 4.5m4.5-4.5l4.5 4.5M3 12h18M3 12l4.5-4.5M3 12l4.5 4.5M21 12l-4.5-4.5M21 12l-4.5 4.5" />
              </svg>
              Non-Linear Decision Lab
            </h2>
            <p className="text-slate-400 text-xs mt-1 uppercase tracking-[0.2em]">Architecture: {activeModel.replace('-', ' ').toUpperCase()}</p>
          </div>
          <div className="flex bg-slate-900/50 p-1 rounded-lg border border-slate-800 overflow-x-auto gap-1">
             {['quantum-mcdm', 'ffts-plpr', 'optimal-fis', 'ff-fcm-gnn'].map((m: any) => (
                 <button 
                    key={m} 
                    onClick={() => setActiveModel(m)}
                    className={`px-3 py-1.5 text-[9px] font-black uppercase rounded transition-all whitespace-nowrap ${activeModel === m ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                     {m.split('-').join(' ')}
                 </button>
             ))}
          </div>
        </div>
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Running Logic Simulation Suite...</p>
          </div>
      )}

      {/* PIPELINE SCHEMATICS */}
      {isIdle && activeModel === 'quantum-mcdm' && (
          <div className="animate-fade-in flex flex-col items-center py-10">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-10">MCDM Pipeline Architecture</span>
              <div className="max-w-md w-full">
                  <PipelineNode title="Delphi Phase" sub="Criteria Selection" icon="∑" active={true} />
                  <PipelineConnector active={true} />
                  <PipelineNode title="DEMATEL" sub="Causal Matrix" icon="⇿" />
                  <PipelineConnector />
                  <PipelineNode title="Quantum Fuzzy" sub="3D Membership" icon="⚛" />
                  <PipelineConnector />
                  <PipelineNode title="MULTIMOORA" sub="Rank Aggregation" icon="📈" />
              </div>
          </div>
      )}

      {isIdle && activeModel === 'ffts-plpr' && (
          <div className="animate-fade-in flex flex-col items-center py-10">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-10">FFTS-PLPR Pipeline Architecture</span>
              <div className="max-w-md w-full">
                  <PipelineNode title="Factor State" sub="2D State Universe" icon="◰" active={true} color="amber" />
                  <PipelineConnector active={true} color="amber" />
                  <PipelineNode title="Fuzzy Groups" sub="Relationship Matrix" icon="≣" color="amber" />
                  <PipelineConnector color="amber" />
                  <PipelineNode title="PLPR Engine" sub="Preference Vector" icon="⊲" color="amber" />
                  <PipelineConnector color="amber" />
                  <PipelineNode title="Synthesis" sub="Linguistic Forecast" icon="≋" color="amber" />
              </div>
          </div>
      )}

      {/* RESULTS: FFTS-PLPR */}
      {activeModel === 'ffts-plpr' && fftsData && (
          <div className="animate-fade-in space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 bg-[#0b0e14] border border-amber-500/20 p-6 rounded-2xl shadow-2xl">
                      <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-6">Phase 1-2: 2-Factor Fuzzy Relationship Groups</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {fftsData.twoFactorGroups.map((g, i) => (
                              <div key={i} className="bg-slate-900/80 p-4 rounded-xl border border-white/5 group hover:border-amber-500/30 transition-all">
                                  <div className="flex justify-between items-start mb-4">
                                      <span className="text-[9px] font-black text-slate-600 uppercase">State {g.group}</span>
                                      <span className="text-[10px] font-mono font-bold text-amber-400">{(g.probability * 100).toFixed(1)}%</span>
                                  </div>
                                  <div className="space-y-3">
                                      <div className="flex items-center gap-2">
                                          <div className="w-1 h-1 rounded-full bg-slate-500"></div>
                                          <span className="text-xs text-slate-300">Factor 1: <span className="text-white font-bold">{g.f1_state}</span></span>
                                      </div>
                                      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                          <div className="w-1 h-1 rounded-full bg-slate-500"></div>
                                          <span className="text-xs text-slate-300">Factor 2: <span className="text-white font-bold">{g.f2_state}</span></span>
                                      </div>
                                      <p className="text-[10px] text-amber-500 italic uppercase font-black tracking-tighter">Implication: {g.implication}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
                  <div className="lg:col-span-4 space-y-6">
                      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl h-full flex flex-col">
                          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 text-center">Phase 3: PLPR Preference Distribution</h3>
                          <div className="flex-1 h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={fftsData.plprDistributions} layout="vertical" margin={{ left: 0, right: 30 }}>
                                      <XAxis type="number" hide domain={[0, 1]} />
                                      <YAxis dataKey="term" type="category" width={30} tick={{fontSize: 9, fill: '#94a3b8'}} />
                                      <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                                      <Bar dataKey="probability" radius={[0, 4, 4, 0]}>
                                          {fftsData.plprDistributions.map((entry, index) => (
                                              <Cell key={`cell-${index}`} fill={entry.probability > 0.4 ? '#fbbf24' : '#4b5563'} />
                                          ))}
                                      </Bar>
                                  </BarChart>
                              </ResponsiveContainer>
                          </div>
                      </div>
                  </div>
              </div>
              <div className="bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] border border-amber-500/20 p-8 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-10">
                  <div className="flex-1 space-y-6">
                      <div>
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Numerical Inference Result</h4>
                          <div className={`text-6xl font-black tracking-tighter ${fftsData.forecast.numericalEstimate >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {fftsData.forecast.numericalEstimate >= 0 ? '+' : ''}{fftsData.forecast.numericalEstimate.toFixed(2)}%
                          </div>
                      </div>
                      <p className="text-sm text-slate-300 italic leading-relaxed">"{fftsData.summary}"</p>
                  </div>
              </div>
          </div>
      )}

      {/* RESULTS: FF-FCM-GNN */}
      {activeModel === 'ff-fcm-gnn' && advancedData && (
          <div className="animate-fade-in space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-4 bg-[#0b0e14] border border-purple-500/20 p-6 rounded-2xl shadow-2xl">
                      <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-6">Phase 1: Fama-French Factor Loadings</h3>
                      <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={advancedData.famaFrenchFactors} layout="vertical">
                                  <XAxis type="number" hide domain={[-2, 2]} />
                                  <YAxis dataKey="factor" type="category" width={100} tick={{fontSize: 9, fill: '#94a3b8'}} />
                                  <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                                  <Bar dataKey="loading" radius={[0, 4, 4, 0]}>
                                      {advancedData.famaFrenchFactors.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.loading >= 0 ? '#10b981' : '#f43f5e'} />
                                      ))}
                                  </Bar>
                              </BarChart>
                          </ResponsiveContainer>
                      </div>
                  </div>
                  <div className="lg:col-span-4 space-y-6 text-center">
                       <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Phase 3: GNN Layer Activation</h3>
                       {advancedData.gnnPrediction.layers.map((layer, i) => (
                            <div key={i} className="mb-4">
                                <span className="text-[9px] text-white uppercase font-bold">{layer.name}</span>
                                <div className="h-1 w-full bg-slate-800 rounded-full mt-1">
                                    <div className="h-full bg-purple-500" style={{width: `${layer.activation*100}%`}}></div>
                                </div>
                            </div>
                       ))}
                  </div>
                  <div className="lg:col-span-4 bg-slate-900 border border-purple-500/20 p-6 rounded-2xl text-center">
                       <div className="text-3xl font-black text-emerald-400">{advancedData.gnnPrediction.latentForecast.toFixed(2)}%</div>
                       <p className="text-xs text-slate-500 italic mt-4">{advancedData.summary}</p>
                  </div>
              </div>
          </div>
      )}

      {/* RESULTS: OPTIMAL FIS */}
      {activeModel === 'optimal-fis' && optimalFisData && (
          <div className="animate-fade-in space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {optimalFisData.membershipFunctions.map((mf, i) => (
                          <MembershipFunctionChart key={i} variable={mf.variable} sets={mf.sets} />
                      ))}
                  </div>
                  <div className="bg-[#0b0e14] border border-blue-500/20 p-6 rounded-2xl flex flex-col shadow-2xl">
                      <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6">Inference Configuration</h3>
                      <div className="space-y-6 flex-1">
                          <div className="flex justify-between border-b border-white/5 pb-2">
                              <span className="text-xs text-slate-500">Architecture</span>
                              <span className="text-xs font-bold text-white">{optimalFisData.systemType}</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-2">
                              <span className="text-xs text-slate-500">Defuzzification</span>
                              <span className="text-xs font-bold text-blue-400">{optimalFisData.defuzzification.method}</span>
                          </div>
                          <div className="pt-4 bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                              <span className="text-[9px] text-blue-400 uppercase font-black block mb-1">Crisp Controller Output</span>
                              <div className="text-3xl font-black text-white">{optimalFisData.defuzzification.result.toFixed(2)}</div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* RESULTS: QUANTUM MCDM */}
      {activeModel === 'quantum-mcdm' && mcdmData && (
          <div className="animate-fade-in space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <div className="bg-[#0f172a] rounded-xl border border-purple-500/20 p-6 shadow-2xl">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Phase 3: DEMATEL Causal Analysis</h3>
                      <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" opacity={0.3} />
                                  <XAxis type="number" dataKey="centrality" name="Centrality (R+C)" stroke="#64748b" label={{ value: 'Centrality', position: 'insideBottom', offset: -5, fontSize: 8, fill: '#64748b' }} />
                                  <YAxis type="number" dataKey="causality" name="Causality (R-C)" stroke="#64748b" label={{ value: 'Causality', angle: -90, position: 'insideLeft', fontSize: 8, fill: '#64748b' }} />
                                  <ZAxis type="number" range={[100, 400]} />
                                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                  <Scatter name="Criteria" data={mcdmData.dematelAnalysis}>
                                      {mcdmData.dematelAnalysis.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.type === 'Cause' ? '#10b981' : '#f43f5e'} />
                                      ))}
                                  </Scatter>
                              </ScatterChart>
                          </ResponsiveContainer>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default FuzzyLogicView;
