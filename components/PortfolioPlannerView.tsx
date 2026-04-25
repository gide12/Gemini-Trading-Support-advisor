import React, { useState } from "react";
import { UserProfile, PortfolioPlanResult } from "../types";
import { generatePortfolioPlan } from "../services/geminiService";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Target, TrendingUp, ShieldAlert, BarChart3, Activity, Briefcase } from "lucide-react";

const COLORS = ['#8b5cf6', '#3b82f6', '#22d3ee', '#10b981', '#f59e0b', '#f43f5e'];

const PortfolioPlannerView: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    riskTolerance: "Moderate",
    investmentHorizon: "Medium-term (3-7 Yrs)",
    initialCapital: 100000,
    goal: "Balanced",
  });

  const [status, setStatus] = useState<'idle' | 'planning' | 'complete' | 'error'>('idle');
  const [result, setResult] = useState<PortfolioPlanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSuggest = async () => {
    setStatus('planning');
    setErrorMsg("");
    try {
      const data = await generatePortfolioPlan(profile);
      setResult(data);
      setStatus('complete');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to generate plan.");
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full pb-10 fade-in">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Target className="w-6 h-6 text-fuchsia-400" />
          AI Portfolio Planner
        </h2>
        <p className="text-sm text-slate-400 mt-1">Personalized wealth management driven by multi-agent reasoning models.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative">
        
        {/* Profile Form (Left Column) */}
        <div className="xl:col-span-4 space-y-6">
            <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
                    <Briefcase className="w-4 h-4 text-fuchsia-400" />
                    <h3 className="uppercase text-xs font-bold text-slate-300 tracking-widest">Client Profile</h3>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Initial Capital ($)</label>
                        <input
                            type="number"
                            value={profile.initialCapital}
                            onChange={(e) => setProfile({ ...profile, initialCapital: Number(e.target.value) })}
                            className="w-full bg-[#1e293b] border border-slate-700 rounded px-3 py-2.5 text-white font-mono focus:border-fuchsia-500 outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Risk Tolerance</label>
                        <select
                            value={profile.riskTolerance}
                            onChange={(e) => setProfile({ ...profile, riskTolerance: e.target.value as any })}
                            className="w-full bg-[#1e293b] border border-slate-700 rounded px-3 py-2.5 text-white text-sm focus:border-fuchsia-500 outline-none transition-colors appearance-none"
                        >
                            <option value="Conservative">Conservative (Capital Preservation)</option>
                            <option value="Moderate">Moderate (Balanced)</option>
                            <option value="Aggressive">Aggressive (Maximum Growth)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Investment Horizon</label>
                        <select
                            value={profile.investmentHorizon}
                            onChange={(e) => setProfile({ ...profile, investmentHorizon: e.target.value as any })}
                            className="w-full bg-[#1e293b] border border-slate-700 rounded px-3 py-2.5 text-white text-sm focus:border-fuchsia-500 outline-none transition-colors appearance-none"
                        >
                            <option value="Short-term (< 3 Yrs)">Short-term (&lt; 3 Yrs)</option>
                            <option value="Medium-term (3-7 Yrs)">Medium-term (3-7 Yrs)</option>
                            <option value="Long-term (7+ Yrs)">Long-term (7+ Yrs)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Primary Goal</label>
                        <select
                            value={profile.goal}
                            onChange={(e) => setProfile({ ...profile, goal: e.target.value as any })}
                            className="w-full bg-[#1e293b] border border-slate-700 rounded px-3 py-2.5 text-white text-sm focus:border-fuchsia-500 outline-none transition-colors appearance-none"
                        >
                            <option value="Capital Preservation">Capital Preservation</option>
                            <option value="Income">Income / Dividends</option>
                            <option value="Balanced">Balanced Mix</option>
                            <option value="Maximum Growth">Maximum Growth</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleSuggest}
                    disabled={status === 'planning'}
                    className={`w-full py-3 mt-8 rounded uppercase font-bold text-white tracking-widest text-[11px] transition-all flex justify-center items-center gap-2 ${
                        status === 'planning'
                            ? "bg-slate-800 text-slate-500 cursor-wait border border-slate-700"
                            : "bg-fuchsia-600 hover:bg-fuchsia-500 shadow-[0_0_15px_rgba(192,38,211,0.3)] border border-fuchsia-500"
                    }`}
                >
                    {status === 'planning' ? (
                        <>
                            <div className="w-3 h-3 border-2 border-slate-500 border-t-slate-300 rounded-full animate-spin"></div>
                            Synthesizing...
                        </>
                    ) : "Generate Strategy"}
                </button>

                {status === 'error' && (
                    <div className="mt-4 p-3 bg-rose-900/40 border border-rose-500/50 rounded text-rose-300 text-xs text-center border-dashed">
                        {errorMsg}
                    </div>
                )}
            </div>
        </div>

        {/* Results Area (Right Column) */}
        <div className="xl:col-span-8 flex flex-col gap-6">
            
            {status === 'idle' && (
               <div className="flex-1 border border-slate-800 border-dashed rounded-xl flex flex-col items-center justify-center p-10 text-slate-500 opacity-50 bg-[#0f172a]/30">
                  <Target className="w-16 h-16 mb-4 text-slate-700" />
                  <p className="text-sm">Configure client profile and generate strategy.</p>
               </div>
            )}

            {status === 'planning' && (
               <div className="flex-1 border border-fuchsia-500/20 rounded-xl flex flex-col items-center justify-center p-10 bg-[#0f172a] shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(192,38,211,0.05)_0%,transparent_70%)]"></div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full animate-spin mb-6"></div>
                    <div className="text-fuchsia-400 font-mono text-sm uppercase tracking-[0.2em] animate-pulse">Running Monte Carlo Simulations</div>
                    <div className="text-slate-500 text-xs mt-2 font-mono">Calibrating Asset Allocations...</div>
                  </div>
               </div>
            )}

            {status === 'complete' && result && (
                <div className="space-y-6 animate-fade-in">
                    
                    {/* Top Stats & Summary */}
                    <div className="bg-[#0f172a] rounded-xl border border-fuchsia-500/30 p-6 shadow-lg overflow-hidden relative">
                        <div className="absolute -right-10 -top-10 opacity-5 pointer-events-none">
                            <Target className="w-64 h-64 text-fuchsia-500" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold text-white mb-2">Strategy Overview</h3>
                            <p className="text-sm text-slate-300 leading-relaxed mb-6 border-l-2 border-fuchsia-500 pl-3 py-1 bg-fuchsia-500/5 rounded-r">
                                {result.summary}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-[#1e293b] p-4 rounded border border-slate-700">
                                    <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Est. Annual Return</div>
                                    <div className="text-2xl font-mono text-emerald-400 font-bold">+{result.estimatedAnnualReturn}%</div>
                                </div>
                                <div className="bg-[#1e293b] p-4 rounded border border-slate-700">
                                    <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Max Drawdown</div>
                                    <div className="text-2xl font-mono text-rose-400 font-bold">-{result.riskMetrics.maxDrawdown}%</div>
                                </div>
                                <div className="bg-[#1e293b] p-4 rounded border border-slate-700">
                                    <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Volatility</div>
                                    <div className="text-2xl font-mono text-fuchsia-400 font-bold">{result.riskMetrics.volatility}%</div>
                                </div>
                                <div className="bg-[#1e293b] p-4 rounded border border-slate-700">
                                    <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Holdings</div>
                                    <div className="text-2xl font-mono text-white font-bold">{result.recommendedHoldings.length}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    
                    {/* Allocation & Diversification */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-6 shadow-lg">
                            <h3 className="uppercase text-xs font-bold text-slate-300 tracking-widest mb-4 border-b border-slate-800 pb-2">Asset Allocation</h3>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={result.assetAllocation}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="percentage"
                                            nameKey="assetClass"
                                            stroke="none"
                                        >
                                            {result.assetAllocation.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff', fontSize: '12px' }}
                                            formatter={(value: number) => [`${value}%`, 'Allocation']}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-6 shadow-lg flex flex-col">
                            <h3 className="uppercase text-xs font-bold text-slate-300 tracking-widest mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                                Diversification Logic
                            </h3>
                            <div className="flex-1 bg-slate-900/50 rounded-lg p-5 border border-slate-800/50 text-slate-300 text-sm leading-relaxed overflow-y-auto custom-scrollbar">
                                {result.diversificationStrategy}
                            </div>
                        </div>
                    </div>

                    {/* Stock Recommendations Array */}
                    <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-6 shadow-lg">
                        <h3 className="uppercase text-xs font-bold text-slate-300 tracking-widest mb-6 border-b border-slate-800 pb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            Target Holdings & Forecasts
                        </h3>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                        <th className="pb-3 pl-2">Asset</th>
                                        <th className="pb-3">Class</th>
                                        <th className="pb-3 text-right">Weight</th>
                                        <th className="pb-3 text-right text-slate-400">Current Est.</th>
                                        <th className="pb-3 text-right text-fuchsia-400">1Y Target</th>
                                        <th className="pb-3 text-right text-emerald-400">Potential <br/>Growth</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.recommendedHoldings.map((h, i) => (
                                        <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors group">
                                            <td className="py-4 pl-2">
                                                <div className="font-bold text-white font-mono">{h.ticker}</div>
                                                <div className="text-[10px] text-slate-400 truncate max-w-[120px]" title={h.name}>{h.name}</div>
                                            </td>
                                            <td className="py-4">
                                                <span className="px-2 py-0.5 bg-slate-800 text-[9px] rounded text-slate-300 border border-slate-700">
                                                    {h.assetClass}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right font-mono text-sm text-slate-300">
                                                {h.weight}%
                                            </td>
                                            <td className="py-4 text-right font-mono text-sm text-slate-400 group-hover:text-white transition-colors">
                                                ${h.currentPriceEstimate.toFixed(2)}
                                            </td>
                                            <td className="py-4 text-right font-mono text-sm text-fuchsia-400 font-bold">
                                                ${h.targetPrice.toFixed(2)}
                                            </td>
                                            <td className="py-4 text-right">
                                                <span className={`inline-flex items-center gap-1 font-mono text-sm font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`}>
                                                    <TrendingUp className="w-3 h-3" />
                                                    {h.predictedGrowth > 0 ? '+' : ''}{h.predictedGrowth.toFixed(1)}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Rationale Cards */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {result.recommendedHoldings.slice(0, 6).map((h, i) => (
                                <div key={`rationale-${i}`} className="bg-slate-900/50 p-4 rounded border border-slate-800">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold font-mono text-fuchsia-400">{h.ticker}</span>
                                        <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">Thesis</span>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                                        {h.rationale}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioPlannerView;
