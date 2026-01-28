
import React, { useState } from "react";
import SearchBar from "./SearchBar";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, AreaChart, Area, CartesianGrid, PieChart, Pie } from "recharts";
import { QuantumResult } from "../types";

const QuantumView: React.FC = () => {
    const [ticker, setTicker] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState<"Standard Quantum Path" | "Quantum Attention Deep Q-Network (QADQN)">("Standard Quantum Path");
    const [result, setResult] = useState<QuantumResult | null>(null);

    const handleSearch = async (searchTerm: string) => {
        setTicker(searchTerm);
        setIsLoading(true);
        // Simulate complex quantum calculation
        await new Promise(r => setTimeout(r, 2000));
        
        const base = Math.random() * 500 + 50;
        const dist = [];
        for (let i = -10; i <= 10; i++) {
            const price = base * (1 + i/100);
            const prob = Math.exp(-Math.pow(i, 2) / 20) / Math.sqrt(2 * Math.PI * 10);
            dist.push({ price: price.toFixed(2), probability: prob });
        }

        const standardResult: QuantumResult = {
            ticker: searchTerm,
            model: "Standard Quantum Path",
            expectedPrice: base * 1.02,
            entanglementScore: 0.85,
            decoherenceRisk: "Low",
            distribution: dist,
            summary: "The quantum state vector suggests a strong constructive interference at the 2% gain level, indicating a high-probability breakout path."
        };

        if (selectedModel === "Quantum Attention Deep Q-Network (QADQN)") {
            setResult({
                ...standardResult,
                model: "Quantum Attention Deep Q-Network (QADQN)",
                summary: "QADQN agent has identified a high-reward policy path. Attention weights are concentrated on liquidity zones, confirming institutional absorption. Reinforcement learning agent suggests a LONG position with a 0.92 Q-value expectation.",
                agentPolicy: [
                    { action: "Strong Buy", qValue: 0.92, probability: 0.75 },
                    { action: "Hold", qValue: 0.45, probability: 0.20 },
                    { action: "Sell", qValue: -0.12, probability: 0.05 }
                ],
                attentionMap: [
                    { head: "Macro Factors", weight: 0.15 },
                    { head: "Price Action", weight: 0.45 },
                    { head: "Volume Profile", weight: 0.25 },
                    { head: "Sentiment Bias", weight: 0.15 }
                ],
                rewardExpectation: 2.85
            });
        } else {
            setResult(standardResult);
        }
        
        setIsLoading(false);
    };

    const isQADQN = result?.model === "Quantum Attention Deep Q-Network (QADQN)";

    return (
        <div className="space-y-8 fade-in">
            <div className="bg-[#0f172a] rounded-xl border border-cyan-500/30 p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                     <svg className="w-64 h-64 text-cyan-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20M7 7l10 10M7 17l10-10"/></svg>
                </div>
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-white flex items-center gap-3 mb-2">
                                <div className="w-3 h-8 bg-cyan-500"></div>
                                Quantum State Laboratory
                            </h2>
                            <p className="text-slate-400 text-sm uppercase tracking-[0.3em]">Monte Carlo / Schrödinger Equation Path Simulation</p>
                        </div>
                        
                        <div className="bg-slate-900/80 border border-cyan-500/20 p-1.5 rounded-xl flex gap-1">
                            {(["Standard Quantum Path", "Quantum Attention Deep Q-Network (QADQN)"] as const).map(model => (
                                <button
                                    key={model}
                                    onClick={() => setSelectedModel(model)}
                                    className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${selectedModel === model ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/30' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    {model.split(' ')[0]} {model.includes('QADQN') ? 'QADQN' : 'Path'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <SearchBar onSearch={handleSearch} isLoading={isLoading} />
                </div>
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center py-24">
                    <div className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mb-6 ${selectedModel.includes('QADQN') ? 'border-purple-500/20 border-t-purple-500' : 'border-cyan-500/20 border-t-cyan-500'}`}></div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.5em] animate-pulse ${selectedModel.includes('QADQN') ? 'text-purple-400' : 'text-cyan-400'}`}>
                        {selectedModel.includes('QADQN') ? 'Optimizing Neural Agent Policy...' : 'Collapsing Wave Function...'}
                    </span>
                </div>
            )}

            {!isLoading && result && (
                <div className="animate-fade-in space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Probability Distribution */}
                        <div className="lg:col-span-2 bg-[#0b0e14] border border-cyan-500/20 p-6 rounded-2xl shadow-xl">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">State Probability Density Function (PDF)</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={result.distribution}>
                                        <defs>
                                            <linearGradient id="quantumColor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={isQADQN ? "#a855f7" : "#06b6d4"} stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor={isQADQN ? "#a855f7" : "#06b6d4"} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                        <XAxis dataKey="price" stroke="#475569" tick={{fontSize: 9}} />
                                        <YAxis hide />
                                        <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b'}} />
                                        <Area type="monotone" dataKey="probability" stroke={isQADQN ? "#a855f7" : "#06b6d4"} strokeWidth={3} fillOpacity={1} fill="url(#quantumColor)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Quantum Metrics */}
                        <div className="space-y-6">
                            <div className={`bg-[#131b2e] border p-6 rounded-2xl shadow-xl ${isQADQN ? 'border-purple-500/20' : 'border-cyan-500/20'}`}>
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Quantum Observables</h4>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <span className="text-xs text-slate-400 uppercase">Expectation Value</span>
                                        <span className="text-xl font-mono text-white font-bold">${result.expectedPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <span className="text-xs text-slate-400 uppercase">Entanglement</span>
                                        <span className={`text-xl font-mono font-bold ${isQADQN ? 'text-purple-400' : 'text-cyan-400'}`}>{(result.entanglementScore * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-400 uppercase">Decoherence</span>
                                        <span className="text-xs font-black text-emerald-400 uppercase">{result.decoherenceRisk}</span>
                                    </div>
                                </div>
                            </div>

                            {isQADQN && (
                                <div className="bg-[#131b2e] border border-purple-500/20 p-6 rounded-2xl shadow-xl animate-fade-in">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">RL Reward Expectation</h4>
                                    <div className="text-4xl font-black text-purple-400 font-mono">+{result.rewardExpectation?.toFixed(2)}%</div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full mt-4">
                                        <div className="h-full bg-purple-500" style={{ width: `${(result.rewardExpectation || 0) * 20}%` }}></div>
                                    </div>
                                </div>
                            )}

                            <div className={`bg-gradient-to-br p-6 rounded-2xl border ${isQADQN ? 'from-purple-900/20 border-purple-500/20' : 'from-cyan-900/20 border-cyan-500/20'}`}>
                                <h4 className={`text-[10px] font-black uppercase tracking-widest mb-3 ${isQADQN ? 'text-purple-400' : 'text-cyan-500'}`}>Agent Interpretation</h4>
                                <p className="text-xs text-slate-300 italic leading-relaxed">"{result.summary}"</p>
                            </div>
                        </div>
                    </div>

                    {isQADQN && result.agentPolicy && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                            {/* Policy Probabilities */}
                            <div className="bg-[#0b0e14] border border-purple-500/20 p-6 rounded-2xl">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">DQN Agent Policy Distribution</h3>
                                <div className="space-y-4">
                                    {result.agentPolicy.map((p, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-slate-300 font-bold uppercase">{p.action}</span>
                                                <span className="text-purple-400 font-mono">Q: {p.qValue.toFixed(2)}</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-1000 ${p.qValue > 0.5 ? 'bg-emerald-500' : p.qValue > 0 ? 'bg-purple-500' : 'bg-rose-500'}`} 
                                                    style={{ width: `${p.probability * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Attention Map */}
                            <div className="bg-[#0b0e14] border border-purple-500/20 p-6 rounded-2xl">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Attention Mechanism Weights</h3>
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={result.attentionMap}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={60}
                                                paddingAngle={5}
                                                dataKey="weight"
                                            >
                                                {result.attentionMap?.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={["#a855f7", "#8b5cf6", "#6366f1", "#4f46e5"][index % 4]} stroke="none" />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '8px'}} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    {result.attentionMap?.map((head, i) => (
                                        <div key={i} className="flex items-center gap-2 text-[10px]">
                                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: ["#a855f7", "#8b5cf6", "#6366f1", "#4f46e5"][i % 4]}}></div>
                                            <span className="text-slate-500 font-bold uppercase tracking-tighter truncate">{head.head}</span>
                                            <span className="text-white ml-auto">{(head.weight * 100).toFixed(0)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!isLoading && !result && (
                <div className="h-96 flex flex-col items-center justify-center text-slate-700 border-2 border-dashed border-slate-900 rounded-3xl">
                    <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em]">Enter Ticker to Probe Hilbert Space</span>
                </div>
            )}
        </div>
    );
};

export default QuantumView;
