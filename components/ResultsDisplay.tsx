
import React, { useMemo, useState } from "react";
import { AnalysisResult, AnalysisType, PriceActionData, PriceActionCandle, TechnicalAnalysisData, NewsItem, BrokerIntelData, TradeIdeaData, ClusteringAnalysisData, OptionsExpertAnalysisData, FundamentalAnalysisData, SmartMoneyData, MarineTrafficData } from "../types";
import { 
    ComposedChart, ReferenceLine, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, Cell, CartesianGrid, ReferenceArea, Area, BarChart, Line, Scatter, ScatterChart, ZAxis, Legend, Label
} from "recharts";
import { Anchor, Ship, Clock, AlertTriangle, Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ResultsDisplayProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  activeTab: AnalysisType;
}

const FundamentalDashboard = ({ data }: { data: FundamentalAnalysisData }) => {
    return (
        <div className="space-y-8 animate-fade-in font-sans">
            {/* Header: Company Identity */}
            <div className="bg-[#0b0e14] p-6 rounded-2xl border border-emerald-500/30 shadow-2xl flex flex-wrap gap-8 items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <svg className="w-48 h-48 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                </div>
                <div className="relative z-10">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Institutional Research Memo • {data.date}</span>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">{data.companyName} ({data.ticker})</h2>
                </div>
                <div className="flex gap-8 relative z-10">
                    <div className="text-center">
                        <div className="text-[9px] text-slate-500 font-black uppercase">Conviction</div>
                        <div className={`text-2xl font-black ${data.conclusion.conviction === 'High' ? 'text-emerald-400' : 'text-amber-400'}`}>{data.conclusion.conviction}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[9px] text-slate-500 font-black uppercase">ROIC vs WACC</div>
                        <div className="text-2xl font-mono font-bold text-cyan-400">+{data.efficiency.spread.toFixed(1)}%</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. ECONOMIC MOAT & QUALITY */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-[#0b0e14] rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 bg-emerald-900/10 border-b border-white/5 flex justify-between items-center">
                            <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Business & Economic Moat Analysis</h4>
                            <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase ${data.moat.pricingPower === 'High' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                Pricing Power: {data.moat.pricingPower}
                            </span>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <p className="text-sm text-slate-300 leading-relaxed italic border-l border-emerald-500/30 pl-4 mb-4">"{data.moat.narrative}"</p>
                                <div className="space-y-2">
                                    <h5 className="text-[9px] font-black text-slate-500 uppercase">Competitive Advantages</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {data.moat.advantages.map((adv, i) => (
                                            <span key={i} className="px-2 py-1 bg-emerald-900/20 text-emerald-400 border border-emerald-500/10 rounded text-[9px] font-bold uppercase">{adv}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                <h5 className="text-[9px] font-black text-slate-500 uppercase mb-4 tracking-widest">Financial Efficiency Profile</h5>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] text-slate-400 uppercase font-bold">ROIC</span>
                                        <span className="text-lg font-mono font-black text-white">{data.efficiency.roic.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{width: `${data.efficiency.roic}%`}}></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                                        <div>
                                            <div className="text-[8px] text-slate-500 uppercase">FCF Margin</div>
                                            <div className="text-sm font-mono font-bold text-cyan-400">{data.efficiency.fcfMargin.toFixed(1)}%</div>
                                        </div>
                                        <div>
                                            <div className="text-[8px] text-slate-500 uppercase">Gross Margin</div>
                                            <div className="text-sm font-mono font-bold text-slate-200">{data.efficiency.grossMargin.toFixed(1)}%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. VALUATION SENSITIVITY */}
                    <div className="bg-[#0b0e14] rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
                         <div className="px-6 py-4 bg-blue-900/10 border-b border-white/5">
                            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Valuation & Intrinsic Range (Multi-Method)</h4>
                         </div>
                         <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                             <div className="text-center">
                                 <div className="text-[9px] text-slate-500 font-black uppercase mb-2">Intrinsic Value (DCF)</div>
                                 <div className="text-3xl font-black text-white font-mono">${data.valuation.dcfIntrinsicValue.toFixed(2)}</div>
                                 <div className="text-[10px] font-bold text-emerald-400 uppercase mt-2">Margin of Safety: {data.valuation.marginOfSafety}%</div>
                             </div>
                             <div className="md:col-span-2 space-y-4">
                                 <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-tighter">
                                     <span className="text-slate-500">Bear Scenario</span>
                                     <span className="text-white">Intrinsic Mid-Range</span>
                                     <span className="text-slate-500">Bull Scenario</span>
                                 </div>
                                 <div className="relative h-8 bg-slate-900 rounded-full border border-white/5 overflow-hidden flex items-center px-4">
                                     <div className="absolute left-[20%] right-[20%] h-full bg-blue-500/10 border-x border-blue-500/30"></div>
                                     <div className="flex justify-between w-full relative z-10 text-[11px] font-mono font-bold">
                                         <span className="text-rose-400">${data.valuation.intrinsicRange.low}</span>
                                         <span className="text-emerald-400">${data.valuation.intrinsicRange.high}</span>
                                     </div>
                                 </div>
                                 <p className="text-[11px] text-slate-400 italic leading-snug">"{data.valuation.valuationSensitivity}"</p>
                             </div>
                         </div>
                    </div>
                </div>

                {/* 3. RISK & SOLVENCY PANEL */}
                <div className="space-y-8">
                    <div className="bg-[#0b0e14] rounded-2xl border border-white/5 shadow-2xl overflow-hidden p-6 space-y-6">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Balance Sheet & Capital Allocation</h4>
                        <div className="space-y-4">
                            <div className="p-3 bg-slate-900/50 rounded-xl border border-white/5">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[9px] text-slate-500 uppercase font-bold">Net Debt / EBITDA</span>
                                    <span className="text-sm font-mono font-black text-white">{data.solvency.netDebtEbitda.toFixed(2)}x</span>
                                </div>
                                <div className="text-[8px] text-slate-600 italic">Target threshold: &lt; 2.5x</div>
                            </div>
                            <div className="p-3 bg-slate-900/50 rounded-xl border border-white/5">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[9px] text-slate-500 uppercase font-bold">Shareholder Yield</span>
                                    <span className="text-sm font-mono font-black text-emerald-400">{data.allocation.shareholderYield.toFixed(1)}%</span>
                                </div>
                                <div className="text-[8px] text-slate-600 italic">Buybacks + Dividends</div>
                            </div>
                            <div>
                                <h5 className="text-[9px] font-black text-slate-500 uppercase mb-2">Quant Risk Attributes</h5>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-black/40 p-2 rounded border border-white/5 text-center">
                                        <div className="text-[8px] text-slate-600 uppercase">Fund. Beta</div>
                                        <div className="text-xs font-mono font-bold text-white">{data.risk.fundamentalBeta.toFixed(2)}</div>
                                    </div>
                                    <div className="bg-black/40 p-2 rounded border border-white/5 text-center">
                                        <div className="text-[8px] text-slate-600 uppercase">Misalloc. Score</div>
                                        <div className="text-xs font-mono font-bold text-rose-400">{data.allocation.capitalMisallocationRisk}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-900/20 to-[#0f172a] p-6 rounded-2xl border border-indigo-500/20 shadow-2xl">
                         <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Investment Thesis Scenarios</h4>
                         <div className="space-y-4">
                             <div className="group border-b border-white/5 pb-3">
                                 <div className="flex justify-between text-[10px] font-black uppercase text-emerald-400 mb-1">
                                     <span>Bull Case</span>
                                     <span>Target: ${data.thesis.bull.valuationImplication}</span>
                                 </div>
                                 <p className="text-[10px] text-slate-400 leading-snug group-hover:text-slate-200 transition-colors">"{data.thesis.bull.narrative}"</p>
                             </div>
                             <div className="group">
                                 <div className="flex justify-between text-[10px] font-black uppercase text-rose-400 mb-1">
                                     <span>Bear Case</span>
                                     <span>Target: ${data.thesis.bear.valuationImplication}</span>
                                 </div>
                                 <p className="text-[10px] text-slate-400 leading-snug group-hover:text-slate-200 transition-colors">"{data.thesis.bear.narrative}"</p>
                             </div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Conclusion & Monitoring */}
            <div className="bg-[#131722] rounded-2xl border border-slate-800 p-8 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                        <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                             Thesis Monitor & Critical Variables
                        </h4>
                        <div className="space-y-4">
                            {data.conclusion.variablesToMonitor.map((variable, i) => (
                                <div key={i} className="flex gap-4 items-start group">
                                    <span className="text-purple-500 font-mono text-[10px] mt-0.5">[{i+1}]</span>
                                    <p className="text-[11px] text-slate-300 font-bold uppercase leading-tight group-hover:text-white transition-colors">{variable}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-black/30 p-6 rounded-2xl border border-white/5 italic">
                        <h5 className="text-[9px] font-black text-slate-500 uppercase mb-3 tracking-widest">Thesis Invalidation Thresholds</h5>
                        <p className="text-sm text-slate-400 leading-relaxed">"{data.conclusion.thesisInvalidation}"</p>
                    </div>
                </div>
            </div>

            <div className="p-8 bg-[#020617] rounded-2xl border border-white/10 relative">
                <div className="absolute top-4 right-8 text-[10px] font-black text-slate-800 uppercase tracking-[0.5em]">Senior Analyst Summary</div>
                <h4 className="text-xs font-black text-emerald-400 uppercase mb-4 flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                     Institutional Research Memo
                </h4>
                <div className="text-slate-200 text-lg leading-relaxed italic opacity-90 border-l-2 border-emerald-500/30 pl-8">
                    {data.summary}
                </div>
            </div>
        </div>
    );
};

const OptionsExpertDashboard = ({ data }: { data: OptionsExpertAnalysisData }) => {
    return (
        <div className="space-y-8 animate-fade-in font-sans">
            {/* Header: Institutional Context */}
            <div className="bg-[#0b0e14] p-6 rounded-2xl border border-purple-500/30 shadow-2xl flex flex-wrap gap-8 items-center justify-between">
                <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Options Desk Analysis • {data.date}</span>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{data.ticker} Volatility Suite</h2>
                </div>
                <div className="flex gap-6">
                    <div className="text-center">
                        <div className="text-[9px] text-slate-500 font-black uppercase">30D IV</div>
                        <div className="text-xl font-mono font-bold text-purple-400">{(data.volatility.ivLevel * 100).toFixed(1)}%</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[9px] text-slate-500 font-black uppercase">IV Rank</div>
                        <div className="text-xl font-mono font-bold text-cyan-400">{data.volatility.ivRank}%</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[9px] text-slate-500 font-black uppercase">Implied Move</div>
                        <div className="text-xl font-mono font-bold text-white">±{data.volatility.impliedMove.percent.toFixed(1)}%</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Institutional Flow & Positioning */}
                <div className="bg-[#0b0e14] rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
                    <div className="px-6 py-4 bg-purple-900/10 border-b border-white/5 flex justify-between items-center">
                        <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Institutional Positioning & Flow</h4>
                        <span className="text-[8px] font-bold text-slate-600 uppercase">Analysis: Order-Book Signature</span>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                            <span className="text-[9px] text-slate-500 font-black uppercase block mb-1">Call/Put Dollar Skew</span>
                            <p className="text-sm text-slate-200 font-semibold">{data.positioning.callPutSkew}</p>
                        </div>
                        <div>
                            <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Dominant Strike Targets</h5>
                            <div className="grid grid-cols-2 gap-3">
                                {data.positioning.dominantStrikes.map((s, i) => (
                                    <div key={i} className="flex justify-between items-center p-2 bg-black/40 rounded border border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-3 rounded-full ${s.type === 'Call' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                            <span className="text-xs font-mono text-white">${s.strike} {s.type}</span>
                                        </div>
                                        <span className="text-[8px] text-slate-500 font-bold uppercase">{s.significance}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 text-cyan-400">Unusual Activity (V/OI Skew)</h5>
                            {data.positioning.unusualActivity.map((ua, i) => (
                                <div key={i} className="mb-2 last:mb-0 bg-cyan-900/5 border border-cyan-500/10 p-3 rounded-lg flex justify-between items-center group hover:border-cyan-500/30 transition-all">
                                    <div className="text-[10px] font-bold text-white group-hover:text-cyan-300">{ua.contract}</div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-[8px] text-slate-500 uppercase">V/OI Ratio</div>
                                            <div className="text-xs font-mono font-black text-cyan-400">{ua.v_oi_ratio.toFixed(2)}x</div>
                                        </div>
                                        <div className="w-px h-6 bg-slate-800"></div>
                                        <div className="text-[9px] text-slate-400 italic max-w-[140px] truncate">{ua.interpretation}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Volatility & Tech Alignment */}
                <div className="space-y-8">
                    <div className="bg-[#0b0e14] rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 bg-blue-900/10 border-b border-white/5 flex justify-between items-center">
                            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Volatility & Tech Dynamics</h4>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-6">
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                <span className="text-[9px] text-slate-500 font-black uppercase block mb-2">Gamma Zone Dynamics</span>
                                <p className="text-xs text-slate-300 leading-relaxed italic">"{data.technicals.gammaZones}"</p>
                            </div>
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                <span className="text-[9px] text-slate-500 font-black uppercase block mb-2">IV Crush Assessment</span>
                                <p className="text-xs text-slate-300 leading-relaxed italic">"{data.volatility.ivCrushRisk}"</p>
                            </div>
                            <div className="col-span-2 border-t border-white/5 pt-4">
                                <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Institutional Preferred Structures</h5>
                                <div className="flex flex-wrap gap-2">
                                    {data.volatility.preferredStructures.map((s, i) => (
                                        <span key={i} className="px-2 py-1 bg-purple-900/20 text-purple-400 border border-purple-500/20 rounded text-[9px] font-black uppercase">{s}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-6 rounded-2xl border border-emerald-500/20 shadow-2xl">
                         <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                             Fundamental & Macro Convergence
                         </h4>
                         <div className="space-y-4">
                             <div>
                                 <span className="text-[8px] text-slate-500 font-black uppercase">Strategic AI Alignment</span>
                                 <p className="text-xs text-slate-300 leading-snug">{data.fundamentals.aiLicensing}</p>
                             </div>
                             <div>
                                 <span className="text-[8px] text-slate-500 font-black uppercase">Cloud Growth & CapEx</span>
                                 <p className="text-xs text-slate-300 leading-snug">{data.fundamentals.cloudGrowth}</p>
                             </div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Strategy Playbook */}
            <div className="bg-[#131722] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
                <div className="px-6 py-4 bg-black/20 border-b border-white/5">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Multi-Horizon Options Strategy Playbook</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
                    <div className="p-6 space-y-4">
                        <div className="text-xs font-bold text-white uppercase border-b border-white/5 pb-2">Short-Term (Earnings)</div>
                        <p className="text-[11px] text-slate-400 leading-relaxed italic">"{data.strategy.shortTerm}"</p>
                        <div className="bg-blue-900/10 p-3 rounded border border-blue-500/10">
                            <span className="text-[8px] text-blue-400 font-black uppercase">Volatility Trader Path</span>
                            <div className="text-[10px] text-slate-300 mt-1">{data.strategy.playbook.volatilityTrader}</div>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="text-xs font-bold text-white uppercase border-b border-white/5 pb-2">Medium-Term (1–3 Months)</div>
                        <p className="text-[11px] text-slate-400 leading-relaxed italic">"{data.strategy.mediumTerm}"</p>
                        <div className="bg-emerald-900/10 p-3 rounded border border-emerald-500/10">
                            <span className="text-[8px] text-emerald-400 font-black uppercase">Directional Strategist</span>
                            <div className="text-[10px] text-slate-300 mt-1">{data.strategy.playbook.directionalTrader}</div>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="text-xs font-bold text-white uppercase border-b border-white/5 pb-2">Yield Enhancement (Long-Term)</div>
                        <p className="text-[11px] text-slate-400 leading-relaxed italic">"{data.strategy.longTerm}"</p>
                        <div className="bg-amber-900/10 p-3 rounded border border-amber-500/10">
                            <span className="text-[8px] text-amber-400 font-black uppercase">Asset Enhancer Path</span>
                            <div className="text-[10px] text-slate-300 mt-1">{data.strategy.playbook.longTermHolder}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8 bg-[#020617] rounded-2xl border border-white/10 relative">
                <div className="absolute top-4 right-8 text-[10px] font-black text-slate-800 uppercase tracking-[0.5em]">Consensus Verdict</div>
                <h4 className="text-xs font-black text-purple-400 uppercase mb-4 flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                     Senior Strategist Synthesis
                </h4>
                <div className="text-slate-200 text-base leading-relaxed italic opacity-90 border-l-2 border-purple-500/30 pl-8">
                    {data.conclusion}
                </div>
            </div>
        </div>
    );
};

const ClusteringDashboard = ({ data }: { data: ClusteringAnalysisData }) => {
    const [search, setSearch] = useState("");
    const filteredAssignments = data.assignments.filter(a => a.ticker.toLowerCase().includes(search.toLowerCase()) || a.sector.toLowerCase().includes(search.toLowerCase()));

    const isProbabilistic = data.algorithm.includes("Gaussian") || data.algorithm.includes("Probabilistic") || data.algorithm.includes("GBML");
    const isBirch = data.algorithm.includes("BIRCH");
    const isAgglomerative = data.algorithm.includes("Agglomerative") || data.algorithm.includes("Hierarchical");
    const isSpectral = data.algorithm.includes("Spectral");
    const isGbmlemo = data.algorithm.includes("GBML-EMO");

    const eigenvalueData = useMemo(() => {
        if (!data.metrics.eigenvalues) return [];
        return data.metrics.eigenvalues.map((v, i) => ({ index: i + 1, val: v }));
    }, [data.metrics.eigenvalues]);

    const { xDomain, yDomain } = useMemo(() => {
        if (!data.plotData || data.plotData.length === 0) return { xDomain: [0, 100], yDomain: [0, 100] };
        const xValues = data.plotData.map(d => d.x);
        const yValues = data.plotData.map(d => d.y);
        const minX = Math.min(...xValues);
        const maxX = Math.max(...xValues);
        const minY = Math.min(...yValues);
        const maxY = Math.max(...yValues);
        const xPad = (maxX - minX) * 0.1 || 1;
        const yPad = (maxY - minY) * 0.1 || 1;
        return { xDomain: [minX - xPad, maxX + xPad], yDomain: [minY - yPad, maxY + yPad] };
    }, [data.plotData]);

    return (
        <div className="space-y-8 animate-fade-in font-sans">
            <div className="bg-[#1e293b]/40 p-6 rounded-2xl border border-emerald-500/20 shadow-xl flex flex-wrap gap-8 items-center justify-between">
                <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Clustering Engine Outcome</span>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{data.algorithm}</h2>
                </div>
                <div className="flex gap-6">
                    {isGbmlemo ? (
                        <>
                            <div className="text-center">
                                <div className="text-[9px] text-slate-500 font-black uppercase">ELBO Score</div>
                                <div className="text-xl font-mono font-bold text-emerald-400">{data.metrics.elbo?.toLocaleString() || 'N/A'}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-[9px] text-slate-500 font-black uppercase">Iterations</div>
                                <div className="text-xl font-mono font-bold text-cyan-400">{data.metrics.iterations}</div>
                            </div>
                        </>
                    ) : isSpectral ? (
                        <>
                            <div className="text-center">
                                <div className="text-[9px] text-slate-500 font-black uppercase">Eigengap Heuristic</div>
                                <div className="text-xl font-mono font-bold text-emerald-400">{data.metrics.eigengap?.toFixed(4) || '0.0000'}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-[9px] text-slate-500 font-black uppercase">Kernel Bandwidth (σ)</div>
                                <div className="text-xl font-mono font-bold text-cyan-400">{data.metrics.bandwidthSigma?.toFixed(3) || '1.450'}</div>
                            </div>
                        </>
                    ) : isAgglomerative ? (
                         <>
                            <div className="text-center">
                                <div className="text-[9px] text-slate-500 font-black uppercase">Merge Distance</div>
                                <div className="text-xl font-mono font-bold text-emerald-400">{data.metrics.maxMergeDistance?.toFixed(2) || '12.42'}</div>
                            </div>
                         </>
                    ) : isBirch ? (
                        <>
                            <div className="text-center">
                                <div className="text-[9px] text-slate-500 font-black uppercase">Threshold (T)</div>
                                <div className="text-xl font-mono font-bold text-cyan-400">{data.metrics.threshold?.toFixed(3) || '0.500'}</div>
                            </div>
                        </>
                    ) : (
                        <>
                            {data.metrics.silhouetteScore !== undefined && (
                                <div className="text-center">
                                    <div className="text-[9px] text-slate-500 font-black uppercase">Silhouette</div>
                                    <div className="text-xl font-mono font-bold text-emerald-400">{data.metrics.silhouetteScore.toFixed(3)}</div>
                                </div>
                            )}
                        </>
                    )}
                    <div className="text-center">
                        <div className="text-[9px] text-slate-500 font-black uppercase">Clusters (k)</div>
                        <div className="text-xl font-mono font-bold text-white">{data.metrics.optimalK}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#0b0e14] rounded-2xl border border-white/5 p-6 shadow-2xl relative overflow-hidden">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                        {isGbmlemo ? 'Probabilistic Latent Space' : '2D Latent Space Projection'}
                    </h3>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" opacity={0.3} vertical horizontal />
                                <XAxis type="number" dataKey="x" name="PC1" stroke="#475569" tick={{fontSize: 9, fontFamily: 'monospace'}} axisLine={{stroke: '#334155'}} domain={xDomain}>
                                    <Label value="Component 1" offset={-15} position="insideBottom" fill="#64748b" style={{ fontSize: '9px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.2em' }} />
                                </XAxis>
                                <YAxis type="number" dataKey="y" name="PC2" stroke="#475569" tick={{fontSize: 9, fontFamily: 'monospace'}} axisLine={{stroke: '#334155'}} domain={yDomain}>
                                    <Label value="Component 2" angle={-90} position="insideLeft" offset={0} fill="#64748b" style={{ fontSize: '9px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.2em' }} />
                                </YAxis>
                                <ZAxis type="number" range={[100, 400]} dataKey={isProbabilistic ? "probability" : "centrality"} />
                                <Tooltip cursor={{ strokeDasharray: '3 3', stroke: '#10b981' }} content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const item = payload[0].payload;
                                        return (
                                            <div className="bg-[#1e293b] border border-white/10 p-2 rounded shadow-2xl">
                                                <div className="text-xs font-black text-white">{item.ticker}</div>
                                                <div className="text-[10px] text-emerald-400 uppercase font-black">Community {item.clusterId}</div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }} />
                                <Scatter name="Assets" data={data.plotData}>
                                    {data.plotData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={["#a855f7", "#10b981", "#3b82f6", "#f59e0b", "#f43f5e"][entry.clusterId % 5]} fillOpacity={entry.probability ?? 0.8} />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#0b0e14] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                    <div className="px-6 py-4 bg-slate-900/50 border-b border-white/5 flex justify-between items-center">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Group Analytics</h4>
                    </div>
                    <div className="h-[400px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <thead className="text-[9px] font-black text-slate-500 uppercase tracking-tighter border-b border-white/5 bg-black/20 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3">Archetype</th>
                                    <th className="px-6 py-3 text-right">Avg Beta</th>
                                    <th className="px-6 py-3 text-right">Risk Disp.</th>
                                    <th className="px-6 py-3 text-center">Density</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-[11px]">
                                {data.clusters.map((c, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-3 font-bold text-white uppercase flex items-center gap-2">
                                            <div className="w-1.5 h-3 rounded-full" style={{backgroundColor: ["#a855f7", "#10b981", "#3b82f6", "#f59e0b", "#f43f5e"][c.id % 5]}}></div>
                                            {c.label}
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono text-slate-400">{c.avgBeta.toFixed(2)}</td>
                                        <td className="px-6 py-3 text-right font-mono text-emerald-400">{(c.riskDispersion || c.avgVolatility).toFixed(3)}</td>
                                        <td className="px-6 py-3 text-center text-slate-500 font-black">{Math.round((c.count / data.assignments.length) * 100)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NewsDashboard = ({ items, summary }: { items: NewsItem[], summary: string }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-[#1e293b]/40 p-5 rounded-xl border border-white/5 flex items-start gap-4">
                <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shrink-0 mt-1">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                </div>
                <div>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1 block">Global Intelligence Brief</span>
                    <p className="text-sm text-slate-300 italic leading-relaxed">"{summary}"</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item, i) => (
                    <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="group bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all flex h-32">
                        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                            <div>
                                <div className="flex justify-between items-start gap-2 mb-1">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{item.source}</span>
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${item.sentiment === 'Positive' ? 'bg-emerald-900/30 text-emerald-400' : item.sentiment === 'Negative' ? 'bg-rose-900/30 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>{item.sentiment}</span>
                                </div>
                                <h4 className="text-xs font-bold text-white leading-tight line-clamp-2 group-hover:text-purple-300 transition-colors">{item.title}</h4>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

const SmartMoneyDashboard = ({ data }: { data: SmartMoneyData }) => {
    return (
        <div className="space-y-6 fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-[#1e293b]/50 p-6 rounded-xl border border-blue-500/20 shadow-lg">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Smart Money Activity</h3>
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${data.smartMoneyActivity === 'Accumulation' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : data.smartMoneyActivity === 'Distribution' ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' : 'border-slate-500/30 bg-slate-500/10 text-slate-400'}`}>
                            {data.smartMoneyActivity === 'Accumulation' && <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                            {data.smartMoneyActivity === 'Distribution' && <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>}
                            {data.smartMoneyActivity === 'Neutral' && <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
                        </div>
                        <div>
                            <div className={`text-2xl font-black uppercase ${data.smartMoneyActivity === 'Accumulation' ? 'text-emerald-400' : data.smartMoneyActivity === 'Distribution' ? 'text-rose-400' : 'text-slate-400'}`}>{data.smartMoneyActivity}</div>
                            <div className="text-xs text-slate-400 mt-1">Ratio Volume: <span className="font-mono text-white">{data.ratioVolume.toFixed(2)}x</span></div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e293b]/50 p-6 rounded-xl border border-blue-500/20 shadow-lg">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Trend Probabilities</h3>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-emerald-400 font-bold">Bullish</span>
                                <span className="text-slate-300 font-mono">{data.probabilities.bullish}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5">
                                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${data.probabilities.bullish}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-rose-400 font-bold">Bearish</span>
                                <span className="text-slate-300 font-mono">{data.probabilities.bearish}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5">
                                <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${data.probabilities.bearish}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400 font-bold">Sideways</span>
                                <span className="text-slate-300 font-mono">{data.probabilities.sideways}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5">
                                <div className="bg-slate-500 h-1.5 rounded-full" style={{ width: `${data.probabilities.sideways}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e293b]/50 p-6 rounded-xl border border-blue-500/20 shadow-lg">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Action & Confidence</h3>
                    <div className="flex flex-col h-full justify-center">
                        <div className="text-center mb-4">
                            <div className="text-xs text-slate-400 uppercase mb-1">Recommendation</div>
                            <div className="text-xl font-bold text-blue-400">{data.recommendation}</div>
                        </div>
                        <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                            <span className="text-xs text-slate-400 uppercase font-bold">Confidence Score</span>
                            <span className="text-lg font-mono text-white">{data.confidenceScore}/100</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1e293b]/50 p-6 rounded-xl border border-blue-500/20 shadow-lg">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Key Zones & MA Status</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="text-xs text-slate-400 uppercase mb-2">MA Status</div>
                            <div className="text-sm text-slate-200 bg-slate-900/50 p-3 rounded border border-slate-700/50">{data.maStatus}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs text-slate-400 uppercase mb-2">Support Zones</div>
                                <div className="flex flex-wrap gap-2">
                                    {data.keyZones.support.map((val, i) => (
                                        <span key={i} className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded">${val.toFixed(2)}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 uppercase mb-2">Resistance Zones</div>
                                <div className="flex flex-wrap gap-2">
                                    {data.keyZones.resistance.map((val, i) => (
                                        <span key={i} className="px-2 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono rounded">${val.toFixed(2)}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-400 uppercase mb-2">Volume Clusters</div>
                            <div className="flex flex-wrap gap-2">
                                {data.keyZones.volumeClusters.map((val, i) => (
                                    <span key={i} className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono rounded">${val.toFixed(2)}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e293b]/50 p-6 rounded-xl border border-blue-500/20 shadow-lg flex flex-col">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">AI Reasoning & Warnings</h3>
                    <div className="space-y-4 flex-1">
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 flex-1">
                            <p className="text-sm text-slate-300 leading-relaxed">{data.reasoning}</p>
                        </div>
                        {data.warnings && (
                            <div className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/20 flex items-start gap-3">
                                <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                <p className="text-sm text-amber-400/90 leading-relaxed">{data.warnings}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, isLoading, activeTab }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-slate-400 bg-[#020617] rounded-xl border border-slate-800 shadow-inner">
        <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="font-bold uppercase tracking-[0.4em] text-[9px] font-mono animate-pulse text-blue-400">Syncing Institutional Nodes...</p>
      </div>
    );
  }

  if (!result) return <div className="h-96 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl uppercase text-[10px] font-black tracking-[0.5em] opacity-40 italic">Initialize Data Stream</div>;

  return (
    <div className="bg-[#0f172a] rounded-xl border border-white/5 p-6 shadow-2xl min-h-[400px] fade-in overflow-hidden">
      <div className="flex justify-between items-center mb-8 bg-[#1e293b]/40 -mx-6 -mt-6 px-6 py-4 border-b border-white/5 select-none shadow-sm">
        <div className="flex items-center gap-4">
            <div className="bg-blue-600 text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/40">{result.ticker}</div>
            <div className="flex gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest items-center">
                <span className="text-blue-400">{activeTab}</span>
                <span className="h-3 w-px bg-slate-700"></span>
                <span className="hover:text-slate-300 cursor-pointer transition-colors font-mono">Q-SYS v3.0</span>
            </div>
        </div>
      </div>

      {activeTab === AnalysisType.Fundamental && result.fundamentalAnalysis && (
          <FundamentalDashboard data={result.fundamentalAnalysis} />
      )}

      {activeTab === AnalysisType.OptionsExpert && result.optionsExpert && (
          <OptionsExpertDashboard data={result.optionsExpert} />
      )}

      {activeTab === AnalysisType.Clustering && result.clusteringAnalysis && (
          <ClusteringDashboard data={result.clusteringAnalysis} />
      )}

      {activeTab === AnalysisType.News && result.newsItems && (
          <NewsDashboard items={result.newsItems} summary={result.content} />
      )}

      {activeTab === AnalysisType.SmartMoney && result.smartMoney && (
          <SmartMoneyDashboard data={result.smartMoney} />
      )}

      {activeTab !== AnalysisType.Fundamental && activeTab !== AnalysisType.OptionsExpert && activeTab !== AnalysisType.Clustering && activeTab !== AnalysisType.News && activeTab !== AnalysisType.SmartMoney && activeTab !== AnalysisType.MarineTraffic && (
          <div className="p-6 text-slate-200 font-sans text-sm leading-relaxed whitespace-pre-wrap bg-black/40 rounded-xl border border-white/5 shadow-inner">
              {result.content}
          </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
