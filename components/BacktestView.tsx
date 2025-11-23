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

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);

  const handleRun = async () => {
    setIsLoading(true);
    setResult(null);
    try {
        const riskRewardString = `${riskUnit}:${rewardUnit}`;
        const data = await runBacktest(ticker, strategy, startDate, endDate, timeframe, riskRewardString);
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
            <h2 className="text-xl font-bold text-white mb-6">Strategy Configuration</h2>
            
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
                    <label className="block text-sm font-medium text-slate-400 mb-1">Strategy Logic</label>
                    <textarea 
                        value={strategy}
                        onChange={(e) => setStrategy(e.target.value)}
                        className="w-full bg-[#1e293b] border border-purple-500/30 rounded p-2 text-white focus:border-purple-500 outline-none h-32 text-sm transition-colors"
                        placeholder="Describe your entry/exit rules..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Risk : Reward Ratio</label>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                            <span className="absolute left-3 top-2 text-slate-500 text-xs">Risk</span>
                            <input 
                                type="number" 
                                value={riskUnit}
                                onChange={(e) => setRiskUnit(e.target.value)}
                                className="w-full bg-[#1e293b] border border-purple-500/30 rounded p-2 pl-10 text-white focus:border-purple-500 outline-none text-sm transition-colors text-center"
                            />
                        </div>
                        <span className="text-purple-400 font-bold">:</span>
                        <div className="flex-1 relative">
                             <span className="absolute left-3 top-2 text-slate-500 text-xs">Reward</span>
                             <input 
                                type="number" 
                                value={rewardUnit}
                                onChange={(e) => setRewardUnit(e.target.value)}
                                className="w-full bg-[#1e293b] border border-purple-500/30 rounded p-2 pl-10 text-white focus:border-purple-500 outline-none text-sm transition-colors text-center"
                            />
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
                    className={`w-full py-3 rounded font-bold text-white transition-all mt-4 ${isLoading ? 'bg-slate-700 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/30'}`}
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
                     <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
            )}

            {result && (
                <div className="space-y-8">
                    {/* KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-800/50 p-4 rounded border border-purple-500/20">
                            <div className="text-slate-400 text-xs uppercase">Total Return</div>
                            <div className={`text-2xl font-mono font-bold ${result.metrics.totalReturn.includes('-') ? 'text-red-400' : 'text-green-400'}`}>{result.metrics.totalReturn}</div>
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

                    {/* Equity Curve */}
                    <div className="h-64 w-full">
                         <h3 className="text-sm font-semibold text-slate-400 mb-4">Equity Curve</h3>
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={result.equityCurve}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 10}} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={['auto', 'auto']} />
                              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                              <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={2} dot={false} />
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
                            <div className="space-y-2">
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