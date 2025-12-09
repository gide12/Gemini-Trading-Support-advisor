
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
  
  // Risk Management State
  const [riskUnit, setRiskUnit] = useState("1");
  const [rewardUnit, setRewardUnit] = useState("2");
  
  // New Exit Parameters
  const [stopLoss, setStopLoss] = useState("2%");
  const [takeProfit, setTakeProfit] = useState("5%");
  const [trailingStop, setTrailingStop] = useState("1.5%");
  
  // Simulation Model
  const [simulationModel, setSimulationModel] = useState("Standard (Historical)");

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);

  const handleRun = async () => {
    setIsLoading(true);
    setResult(null);
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
        setResult(data);
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-6 shadow-lg h-fit">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
                </svg>
                Strategy Configuration
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
                </svg>
            </h2>
            
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
                    </select>
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
                        {/* Risk : Reward Ratio */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Risk Unit (R)</label>
                                <input 
                                    type="number" 
                                    value={riskUnit}
                                    onChange={(e) => setRiskUnit(e.target.value)}
                                    className="w-full bg-[#1e293b] border border-purple-500/30 rounded p-2 text-white focus:border-purple-500 outline-none text-sm transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Reward Unit (R)</label>
                                 <input 
                                    type="number" 
                                    value={rewardUnit}
                                    onChange={(e) => setRewardUnit(e.target.value)}
                                    className="w-full bg-[#1e293b] border border-purple-500/30 rounded p-2 text-white focus:border-purple-500 outline-none text-sm transition-colors"
                                />
                            </div>
                        </div>

                        {/* SL / TP / Trailing */}
                        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-purple-500/10">
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Stop Loss</label>
                                <input 
                                    type="text" 
                                    value={stopLoss}
                                    onChange={(e) => setStopLoss(e.target.value)}
                                    placeholder="2%"
                                    className="w-full bg-[#1e293b] border border-purple-500/30 rounded p-2 text-white focus:border-purple-500 outline-none text-sm transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Take Profit</label>
                                <input 
                                    type="text" 
                                    value={takeProfit}
                                    onChange={(e) => setTakeProfit(e.target.value)}
                                    placeholder="5%"
                                    className="w-full bg-[#1e293b] border border-purple-500/30 rounded p-2 text-white focus:border-purple-500 outline-none text-sm transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Trailing Stop</label>
                                <input 
                                    type="text" 
                                    value={trailingStop}
                                    onChange={(e) => setTrailingStop(e.target.value)}
                                    placeholder="1.5%"
                                    className="w-full bg-[#1e293b] border border-purple-500/30 rounded p-2 text-white focus:border-purple-500 outline-none text-sm transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Start Date</label>
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-[#1e293b] border border-purple-500/30 rounded p-2 text-white focus:border-purple-500 outline-none text-sm transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">End Date</label>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full bg-[#1e293b] border border-purple-500/30 rounded p-2 text-white focus:border-purple-500 outline-none text-sm transition-colors"
                        />
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
            {!result && !isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mb-4 opacity-50 text-purple-500/30">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                    </svg>
                    <p>Configure settings and run backtest to see results.</p>
                </div>
            )}
            
            {isLoading && (
                <div className="h-full flex items-center justify-center">
                     <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                </div>
            )}

            {result && (
                <div className="space-y-8">
                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-purple-500/20 pb-4">
                        <h3 className="text-lg font-bold text-white">Simulation Results</h3>
                        <span className="px-3 py-1 rounded-full bg-cyan-900/30 text-cyan-400 text-xs font-bold border border-cyan-500/30">
                            {simulationModel}
                        </span>
                    </div>
                    
                    {/* KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-800/50 p-4 rounded border border-purple-500/20">
                            <div className="text-slate-400 text-xs uppercase">Total Return</div>
                            <div className={`text-2xl font-mono font-bold ${(result.metrics.totalReturn || "").includes('-') ? 'text-red-400' : 'text-green-400'}`}>{(result.metrics.totalReturn || "0%")}</div>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded border border-purple-500/20">
                            <div className="text-slate-400 text-xs uppercase">Win Rate</div>
                            <div className="text-2xl font-mono font-bold text-blue-400">{result.metrics.winRate}</div>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded border border-purple-500/20">
                            <div className="text-slate-400 text-xs uppercase">Max Drawdown</div>
                            <div className="text-2xl font-mono font-bold text-red-400">{result.metrics.maxDrawdown}</div>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded border border-purple-500/20">
                            <div className="text-slate-400 text-xs uppercase">Trades</div>
                            <div className="text-2xl font-mono font-bold text-white">{result.metrics.tradesCount}</div>
                        </div>
                    </div>

                    {/* Black Scholes Greeks Dashboard (Only if available) */}
                    {result.blackScholesMetrics && (
                        <div className="bg-slate-800/30 border border-purple-500/30 rounded-xl p-5 animate-fade-in">
                             <div className="flex justify-between items-center mb-4">
                                 <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-purple-400">
                                         <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                     </svg>
                                     Black-Scholes Pricing & Greeks
                                 </h3>
                                 <div className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-400 border border-slate-700">
                                     IV: {(result.blackScholesMetrics.impliedVolatility * 100).toFixed(1)}%
                                 </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                 {/* Pricing */}
                                 <div className="md:col-span-1 space-y-3">
                                     <div className="bg-[#1e293b] p-3 rounded border border-purple-500/20">
                                         <div className="text-[10px] text-green-400 uppercase font-bold mb-1">Call Price</div>
                                         <div className="text-xl font-mono text-white">${result.blackScholesMetrics.callOptionPrice.toFixed(2)}</div>
                                     </div>
                                     <div className="bg-[#1e293b] p-3 rounded border border-purple-500/20">
                                         <div className="text-[10px] text-red-400 uppercase font-bold mb-1">Put Price</div>
                                         <div className="text-xl font-mono text-white">${result.blackScholesMetrics.putOptionPrice.toFixed(2)}</div>
                                     </div>
                                 </div>

                                 {/* Greeks Grid */}
                                 <div className="md:col-span-2 grid grid-cols-2 gap-3">
                                     <div className="bg-[#1e293b] p-2 rounded flex justify-between items-center">
                                         <span className="text-xs text-slate-400 uppercase">Delta (Δ)</span>
                                         <span className="font-mono text-cyan-300">{result.blackScholesMetrics.greeks.delta.toFixed(3)}</span>
                                     </div>
                                     <div className="bg-[#1e293b] p-2 rounded flex justify-between items-center">
                                         <span className="text-xs text-slate-400 uppercase">Gamma (Γ)</span>
                                         <span className="font-mono text-purple-300">{result.blackScholesMetrics.greeks.gamma.toFixed(3)}</span>
                                     </div>
                                     <div className="bg-[#1e293b] p-2 rounded flex justify-between items-center">
                                         <span className="text-xs text-slate-400 uppercase">Theta (Θ)</span>
                                         <span className="font-mono text-red-300">{result.blackScholesMetrics.greeks.theta.toFixed(3)}</span>
                                     </div>
                                     <div className="bg-[#1e293b] p-2 rounded flex justify-between items-center">
                                         <span className="text-xs text-slate-400 uppercase">Vega (ν)</span>
                                         <span className="font-mono text-green-300">{result.blackScholesMetrics.greeks.vega.toFixed(3)}</span>
                                     </div>
                                     <div className="col-span-2 bg-[#1e293b] p-2 rounded flex justify-between items-center">
                                         <span className="text-xs text-slate-400 uppercase">Rho (ρ)</span>
                                         <span className="font-mono text-blue-300">{result.blackScholesMetrics.greeks.rho.toFixed(3)}</span>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    )}

                    {/* Equity Curve */}
                    <div className="h-64 w-full">
                         <h3 className="text-sm font-semibold text-slate-400 mb-4">Equity Curve</h3>
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={result.equityCurve}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 10}} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={['auto', 'auto']} />
                              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                              <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} dot={false} />
                            </LineChart>
                         </ResponsiveContainer>
                    </div>

                    {/* Summary & Trade Log */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-400 mb-2">AI Analysis</h3>
                            <div className="text-sm text-slate-300 prose prose-invert">
                                {result.summary}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-400 mb-2">Key Trades</h3>
                            <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                                {result.trades.map((t, i) => (
                                    <div key={i} className="flex justify-between text-sm bg-slate-800/30 p-2 rounded border border-purple-500/10">
                                        <span className="text-slate-400">{t.date}</span>
                                        <span className={`font-bold ${t.type === 'Buy' ? 'text-green-400' : 'text-red-400'}`}>{t.type}</span>
                                        <span className="text-slate-200">@ {t.price}</span>
                                        <span className="font-mono text-slate-300">{t.result}</span>
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
