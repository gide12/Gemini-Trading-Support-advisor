
import React, { useState } from "react";
import { runBacktest } from "../services/geminiService";
import { BacktestResult } from "../types";
import ReactMarkdown from 'react-markdown';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const BacktestView: React.FC = () => {
  const [ticker, setTicker] = useState("SPY");
  const [timeframe, setTimeframe] = useState("Daily");
  const [strategy, setStrategy] = useState("Buy when RSI < 30, Sell when RSI > 70");
  const [startDate, setStartDate] = useState("2023-01-01");
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [riskUnit, setRiskUnit] = useState("1");
  const [rewardUnit, setRewardUnit] = useState("2");
  const [stopLoss, setStopLoss] = useState("2%");
  const [takeProfit, setTakeProfit] = useState("5%");
  const [trailingStop, setTrailingStop] = useState("1.5%");
  const [simulationModel, setSimulationModel] = useState("Standard (Historical)");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BacktestResult | null>(null);

  const handleRun = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
        const riskRewardString = `${riskUnit}:${rewardUnit}`;
        const data = await runBacktest(
            ticker, 
            strategy, 
            startDate, 
            endDate, 
            timeframe, 
            riskRewardString, 
            stopLoss, 
            takeProfit, 
            trailingStop,
            simulationModel
        );
        
        if (!data.trades || data.trades.length === 0) {
            setError("No Trade Executions Found: Your strategy logic yielded 0 outcomes for this period.");
        } else {
            setResult(data);
        }
    } catch (e: any) {
        setError(e.message || "Simulation Failed");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-6 shadow-lg h-fit">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8 border-b border-white/5 pb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
                    </svg>
                    Strategy Configuration
                </h2>
                
                <div className="bg-[#131b2e] border border-cyan-500/20 rounded-lg p-3 max-w-xs shadow-inner">
                    <div className="flex items-center gap-1.5 mb-2 text-cyan-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest">US Market Protocol</span>
                    </div>
                    <ul className="space-y-1.5 text-[9px] font-bold text-slate-400">
                        <li className="flex justify-between border-b border-white/5 pb-1">
                            <span>Open (9:30–10:30)</span>
                            <span className="text-amber-500 uppercase">High Vol</span>
                        </li>
                        <li className="flex justify-between border-b border-white/5 pb-1">
                            <span>Lunch (11:30–1:30)</span>
                            <span className="text-blue-400 uppercase">Sideways</span>
                        </li>
                        <li className="flex justify-between border-b border-white/5 pb-1">
                            <span>Power Hour (3:00–4:00)</span>
                            <span className="text-emerald-400 uppercase">Trend Path</span>
                        </li>
                    </ul>
                    <div className="mt-2 pt-2 border-t border-white/5 text-[8px] text-slate-500 italic leading-tight">
                        📌 Don't use formulas without checking market hours.
                    </div>
                </div>
            </div>
            
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Asset</label>
                        <input 
                            type="text" 
                            value={ticker}
                            onChange={(e) => setTicker(e.target.value.toUpperCase())}
                            className="w-full bg-[#1e293b] border border-purple-500/30 rounded p-2 text-white focus:border-purple-500 outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Timeframe</label>
                        <select 
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value)}
                            className="w-full bg-[#1e293b] border border-purple-500/30 rounded p-2 text-white focus:border-purple-500 outline-none text-sm transition-colors"
                        >
                            <option value="1m">1 Minute</option>
                            <option value="5m">5 Minutes</option>
                            <option value="15m">15 Minutes</option>
                            <option value="1H">1 Hour</option>
                            <option value="4H">4 Hours</option>
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Simulation Model</label>
                    <select 
                        value={simulationModel}
                        onChange={(e) => setSimulationModel(e.target.value)}
                        className="w-full bg-[#1e293b] border border-purple-500/30 rounded p-2 text-white focus:border-purple-500 outline-none text-sm transition-colors font-bold"
                    >
                        <option value="Standard (Historical)">Standard (Historical)</option>
                        <option value="Monte Carlo Simulation">Monte Carlo Simulation</option>
                        <option value="Black-Scholes Model">Black-Scholes Model</option>
                        <option value="Gordon Constant Growth Model">Gordon Constant Growth Model</option>
                        <option value="Λ-Vol (Volatility Frameworks)">Λ-Vol (Volatility Frameworks)</option>
                    </select>
                    {simulationModel === "Λ-Vol (Volatility Frameworks)" && (
                        <p className="mt-2 text-[10px] text-purple-400 italic">
                            The Λ-Vol engine is part of a broader series of advanced Volatility Frameworks focusing on non-linear variance pathways.
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Strategy Logic</label>
                    <textarea 
                        value={strategy}
                        onChange={(e) => setStrategy(e.target.value)}
                        className="w-full bg-[#1e293b] border border-purple-500/30 rounded p-2 text-white focus:border-purple-500 outline-none h-32 text-sm transition-colors"
                        placeholder="Describe your entry/exit rules..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Risk & Exit Parameters</label>
                    <div className="space-y-3 bg-[#1e293b]/50 p-3 rounded border border-purple-500/10">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Risk Unit (R)</label>
                                <input type="number" value={riskUnit} onChange={(e) => setRiskUnit(e.target.value)} className="w-full bg-[#1e293b] border border-purple-500/30 rounded p-2 text-white outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Reward Unit (R)</label>
                                 <input type="number" value={rewardUnit} onChange={(e) => setRewardUnit(e.target.value)} className="w-full bg-[#1e293b] border border-purple-500/30 rounded p-2 text-white outline-none text-sm" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-purple-500/10">
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Stop Loss</label>
                                <input type="text" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} placeholder="2%" className="w-full bg-[#1e293b] border border-purple-500/30 rounded p-2 text-white outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Take Profit</label>
                                <input type="text" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} placeholder="5%" className="w-full bg-[#1e293b] border border-purple-500/30 rounded p-2 text-white outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Trailing Stop</label>
                                <input type="text" value={trailingStop} onChange={(e) => setTrailingStop(e.target.value)} placeholder="1.5%" className="w-full bg-[#1e293b] border border-purple-500/30 rounded p-2 text-white outline-none text-sm" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Start Date</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-[#1e293b] border border-purple-500/30 rounded p-2 text-white outline-none text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">End Date</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-[#1e293b] border border-purple-500/30 rounded p-2 text-white outline-none text-sm" />
                    </div>
                </div>

                <button 
                    onClick={handleRun}
                    disabled={isLoading}
                    className={`w-full py-3 rounded font-bold text-white transition-all mt-4 ${isLoading ? 'bg-slate-700 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-900/30'}`}
                >
                    {isLoading ? "Running Simulation..." : "Run Backtest"}
                </button>
            </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 bg-[#0f172a] rounded-xl border border-purple-500/30 p-6 shadow-lg min-h-[500px]">
            {!result && !isLoading && !error && (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 p-10 text-center">
                    <div className="w-24 h-24 mb-6 border-2 border-dashed border-slate-700 rounded-full flex items-center justify-center opacity-30 animate-pulse">
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">Simulation Engine Idle</h3>
                    <p className="max-w-md text-sm leading-relaxed">Select an asset and define your strategy logic to initialize the pathway calculation engine. Ensure your entry rules align with US Market session volatility.</p>
                </div>
            )}
            
            {isLoading && (
                <div className="h-full flex flex-col items-center justify-center">
                     <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
                     <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em]">Crunching Historical Nodes...</span>
                </div>
            )}

            {error && (
                <div className="h-full flex flex-col items-center justify-center animate-fade-in">
                    <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-8 max-w-lg">
                        <div className="flex items-center gap-3 text-rose-500 mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <h3 className="text-xl font-bold uppercase tracking-tight">Strategy Execution Void</h3>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed mb-6">
                            The simulation engine processed the dataset but found <strong>zero outcomes</strong> matching your current criteria. This often happens when logic is too restrictive or if the asset remained in a "Sideways" regime during your target timeframe.
                        </p>
                        <div className="bg-black/30 p-4 rounded-xl space-y-3">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Diagnostic Pathway Check:</h4>
                            <div className="flex items-center gap-3 text-xs">
                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                <span className="text-slate-400 italic">Check if strategy logic requires volatility only available at <strong>Market Open</strong>.</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                <span className="text-slate-400 italic">Are indicators flatlined during the <strong>Lunch Session</strong>?</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                                <span className="text-slate-400 italic">Try relaxing your <strong>Timeframe</strong> or <strong>Stop Loss</strong> parameters.</span>
                            </div>
                        </div>
                        <button onClick={handleRun} className="mt-8 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold transition-all border border-slate-700">Re-Initialize Path</button>
                    </div>
                </div>
            )}

            {result && (
                <div className="space-y-8 animate-fade-in">
                    <div className="flex justify-between items-center border-b border-purple-500/20 pb-4">
                        <h3 className="text-lg font-bold text-white">Simulation Results</h3>
                        <span className="px-3 py-1 rounded-full bg-cyan-900/30 text-cyan-400 text-xs font-bold border border-cyan-500/30 uppercase">
                            {simulationModel}
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-800/50 p-4 rounded border border-purple-500/20">
                            <div className="text-slate-400 text-xs uppercase">Total Return</div>
                            <div className={`text-2xl font-mono font-bold ${(result.metrics?.totalReturn || "").includes('-') ? 'text-red-400' : 'text-green-400'}`}>{(result.metrics?.totalReturn || "0%")}</div>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded border border-purple-500/20">
                            <div className="text-slate-400 text-xs uppercase">Win Rate</div>
                            <div className="text-2xl font-mono font-bold text-blue-400">{result.metrics?.winRate || "0%"}</div>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded border border-purple-500/20">
                            <div className="text-slate-400 text-xs uppercase">Max Drawdown</div>
                            <div className={`text-2xl font-mono font-bold ${(result.metrics?.maxDrawdown || "").includes('-') ? 'text-red-400' : 'text-slate-200'}`}>{result.metrics?.maxDrawdown || "0%"}</div>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded border border-purple-500/20">
                            <div className="text-slate-400 text-xs uppercase">Trades</div>
                            <div className="text-2xl font-mono font-bold text-white">{result.metrics?.tradesCount || 0}</div>
                        </div>
                    </div>

                    {/* Equity Curve */}
                    <div className="h-64 w-full">
                         <h3 className="text-sm font-semibold text-slate-400 mb-4">Equity Curve</h3>
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={result.equityCurve || []}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 10}} hide />
                              <YAxis stroke="#64748b" tick={{fontSize: 10, fontFamily: 'monospace'}} domain={['auto', 'auto']} axisLine={false} />
                              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                              <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={3} dot={{r: 4, fill: '#06b6d4'}} activeDot={{r: 6, stroke: '#fff', strokeWidth: 2}} />
                            </LineChart>
                         </ResponsiveContainer>
                    </div>

                    {/* Summary & Trade Log */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                                Pathway Insight
                            </h3>
                            <div className="text-sm text-slate-300 italic leading-relaxed">
                                {result.summary}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Recent Executions</h3>
                            <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                                {(result.trades || []).map((t, i) => (
                                    <div key={i} className="flex justify-between items-center text-xs bg-slate-800/30 p-2.5 rounded border border-purple-500/10 hover:border-purple-500/30 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-slate-500 font-bold">{t.date}</span>
                                            <span className={`font-black uppercase ${t.type === 'Buy' ? 'text-green-400' : 'text-rose-400'}`}>{t.type}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-white font-mono font-bold">${t.price.toFixed(2)}</div>
                                            <div className="text-[10px] font-bold text-slate-500">{t.result}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default BacktestView;
