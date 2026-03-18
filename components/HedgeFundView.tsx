import React, { useState } from "react";
import { 
    TrendingUp, 
    TrendingDown, 
    Activity, 
    BarChart3, 
    Globe, 
    ShieldAlert, 
    Briefcase, 
    ArrowRightLeft, 
    Target, 
    FileText 
} from "lucide-react";

const HedgeFundView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"MAR" | "HFR" | "TASS">("MAR");

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-emerald-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                        </svg>
                        Hedge Fund Data
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">Institutional fund performance and metrics</p>
                </div>
            </div>

            <div className="flex gap-2 border-b border-slate-800 pb-2">
                <button 
                    onClick={() => setActiveTab("MAR")}
                    className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-t-lg transition-colors ${activeTab === "MAR" ? "bg-emerald-500/20 text-emerald-400 border-b-2 border-emerald-500" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"}`}
                >
                    Managed Account Reports (MAR)
                </button>
                <button 
                    onClick={() => setActiveTab("HFR")}
                    className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-t-lg transition-colors ${activeTab === "HFR" ? "bg-emerald-500/20 text-emerald-400 border-b-2 border-emerald-500" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"}`}
                >
                    Hedge Fund Research, Inc. (HFR)
                </button>
                <button 
                    onClick={() => setActiveTab("TASS")}
                    className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-t-lg transition-colors ${activeTab === "TASS" ? "bg-emerald-500/20 text-emerald-400 border-b-2 border-emerald-500" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"}`}
                >
                    TASS Management (TASS)
                </button>
            </div>

            {activeTab === "MAR" && (
                <div className="space-y-6">
                    {/* Header & Executive Summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-[#0f172a] rounded-xl border border-emerald-500/30 p-6 shadow-lg">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-emerald-400" />
                                Executive Summary
                            </h3>
                            <ul className="space-y-3 text-slate-300 text-sm leading-relaxed">
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-400 mt-1">•</span>
                                    <span><strong>Global Macro Positioning:</strong> The portfolio successfully capitalized on European monetary easing, driving a +4.2% quarterly return, outperforming the HFRX Global Hedge Fund Index by 180 bps.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-400 mt-1">•</span>
                                    <span><strong>Top Contributors & Detractors:</strong> Long positions in Japanese equities (Nikkei 225) and short EUR/USD were primary drivers. Detractors included early short positions in US tech mega-caps.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-400 mt-1">•</span>
                                    <span><strong>Risk Profile:</strong> Volatility remains contained with a Sharpe Ratio of 1.85. Gross leverage was tactically reduced from 2.4x to 1.9x to mitigate US election uncertainty.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-400 mt-1">•</span>
                                    <span><strong>Strategic Rebalancing:</strong> Shifted 15% of AUM from US high-yield credit into emerging market sovereign debt, anticipating a weaker USD environment in Q4.</span>
                                </li>
                            </ul>
                        </div>
                        
                        <div className="bg-[#0f172a] rounded-xl border border-emerald-500/30 p-6 shadow-lg">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-emerald-400" />
                                Strategic Outlook
                            </h3>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Inferred Style</p>
                                    <p className="text-white font-medium">Global Macro / Long-Short Equity</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Risk/Reward Assessment</p>
                                    <p className="text-emerald-400 font-medium">Favorable (Asymmetric Upside)</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Next Period Drivers</p>
                                    <p className="text-slate-300 leading-relaxed">Expected divergence between Fed and ECB rate paths. Long EM equities, short US duration.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Performance Table */}
                    <div className="bg-[#0f172a] rounded-xl border border-emerald-500/30 p-6 shadow-lg overflow-x-auto">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-emerald-400" />
                            Detailed Performance Metrics
                        </h3>
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-700">
                                <tr>
                                    <th className="px-4 py-3">Metric</th>
                                    <th className="px-4 py-3">Fund Performance</th>
                                    <th className="px-4 py-3">Benchmark (HFRX)</th>
                                    <th className="px-4 py-3">Variance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-slate-300">
                                <tr className="hover:bg-slate-800/30">
                                    <td className="px-4 py-3 font-medium text-white">1-Month Return</td>
                                    <td className="px-4 py-3 text-emerald-400">+1.8%</td>
                                    <td className="px-4 py-3">+0.9%</td>
                                    <td className="px-4 py-3 text-emerald-400">+0.9%</td>
                                </tr>
                                <tr className="hover:bg-slate-800/30">
                                    <td className="px-4 py-3 font-medium text-white">Quarterly Return</td>
                                    <td className="px-4 py-3 text-emerald-400">+4.2%</td>
                                    <td className="px-4 py-3">+2.4%</td>
                                    <td className="px-4 py-3 text-emerald-400">+1.8%</td>
                                </tr>
                                <tr className="hover:bg-slate-800/30">
                                    <td className="px-4 py-3 font-medium text-white">YTD Return</td>
                                    <td className="px-4 py-3 text-emerald-400">+12.5%</td>
                                    <td className="px-4 py-3">+8.1%</td>
                                    <td className="px-4 py-3 text-emerald-400">+4.4%</td>
                                </tr>
                                <tr className="hover:bg-slate-800/30">
                                    <td className="px-4 py-3 font-medium text-white">Annualized Return (3Y)</td>
                                    <td className="px-4 py-3 text-emerald-400">+15.2%</td>
                                    <td className="px-4 py-3">+9.5%</td>
                                    <td className="px-4 py-3 text-emerald-400">+5.7%</td>
                                </tr>
                                <tr className="hover:bg-slate-800/30">
                                    <td className="px-4 py-3 font-medium text-white">Sharpe Ratio</td>
                                    <td className="px-4 py-3">1.85</td>
                                    <td className="px-4 py-3">1.10</td>
                                    <td className="px-4 py-3 text-emerald-400">+0.75</td>
                                </tr>
                                <tr className="hover:bg-slate-800/30">
                                    <td className="px-4 py-3 font-medium text-white">Sortino Ratio</td>
                                    <td className="px-4 py-3">2.40</td>
                                    <td className="px-4 py-3">1.45</td>
                                    <td className="px-4 py-3 text-emerald-400">+0.95</td>
                                </tr>
                                <tr className="hover:bg-slate-800/30">
                                    <td className="px-4 py-3 font-medium text-white">Maximum Drawdown</td>
                                    <td className="px-4 py-3 text-emerald-400">-8.4%</td>
                                    <td className="px-4 py-3 text-red-400">-12.6%</td>
                                    <td className="px-4 py-3 text-emerald-400">+4.2%</td>
                                </tr>
                                <tr className="hover:bg-slate-800/30">
                                    <td className="px-4 py-3 font-medium text-white">Beta (vs S&P 500)</td>
                                    <td className="px-4 py-3">0.35</td>
                                    <td className="px-4 py-3">0.65</td>
                                    <td className="px-4 py-3 text-emerald-400">-0.30</td>
                                </tr>
                                <tr className="hover:bg-slate-800/30">
                                    <td className="px-4 py-3 font-medium text-white">Alpha (Annualized)</td>
                                    <td className="px-4 py-3 text-emerald-400">+6.8%</td>
                                    <td className="px-4 py-3">0.0%</td>
                                    <td className="px-4 py-3 text-emerald-400">+6.8%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Transaction Insights & Risk Exposure */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-[#0f172a] rounded-xl border border-emerald-500/30 p-6 shadow-lg">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
                                Transaction Insights
                            </h3>
                            <div className="space-y-4">
                                <div className="p-3 bg-emerald-900/20 border border-emerald-500/20 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                                        <span className="text-sm font-bold text-emerald-400">Key Buys & Reallocations</span>
                                    </div>
                                    <ul className="text-xs text-slate-300 space-y-1 ml-6 list-disc">
                                        <li>Increased Long exposure to Japanese Financials (Mitsubishi UFJ)</li>
                                        <li>Initiated Long position in EM Sovereign Debt (Brazil, Mexico)</li>
                                        <li>Tactical Long in Gold (XAU/USD) as a geopolitical hedge</li>
                                    </ul>
                                </div>
                                <div className="p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingDown className="w-4 h-4 text-red-400" />
                                        <span className="text-sm font-bold text-red-400">Key Sells & Reductions</span>
                                    </div>
                                    <ul className="text-xs text-slate-300 space-y-1 ml-6 list-disc">
                                        <li>Reduced Long exposure to US Mega-Cap Tech (Profit taking)</li>
                                        <li>Closed Long position in European Luxury Goods</li>
                                        <li>Initiated Short position in US Commercial Real Estate REITs</li>
                                    </ul>
                                </div>
                                <div className="p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Activity className="w-4 h-4 text-blue-400" />
                                        <span className="text-sm font-bold text-blue-400">Strategic Shifts Detected</span>
                                    </div>
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Clear rotation from growth to value/yield. The fund is actively reducing USD dependency and increasing duration in non-US markets, indicating a defensive posture against potential US stagflation.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#0f172a] rounded-xl border border-emerald-500/30 p-6 shadow-lg">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-emerald-400" />
                                Risk & Exposure Assessment
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400 uppercase tracking-wider">Gross Leverage</span>
                                        <span className="text-white font-bold">1.9x</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                                        <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1">Reduced from 2.4x last quarter.</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <Briefcase className="w-3 h-3" /> Sector Exposure
                                        </p>
                                        <ul className="text-xs text-slate-300 space-y-1">
                                            <li className="flex justify-between"><span>Financials</span> <span className="text-emerald-400">+18%</span></li>
                                            <li className="flex justify-between"><span>Energy</span> <span className="text-emerald-400">+12%</span></li>
                                            <li className="flex justify-between"><span>Technology</span> <span className="text-slate-400">Neutral</span></li>
                                            <li className="flex justify-between"><span>Real Estate</span> <span className="text-red-400">-8%</span></li>
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <Globe className="w-3 h-3" /> Geographic Exposure
                                        </p>
                                        <ul className="text-xs text-slate-300 space-y-1">
                                            <li className="flex justify-between"><span>North America</span> <span className="text-slate-400">40%</span></li>
                                            <li className="flex justify-between"><span>Europe</span> <span className="text-slate-400">25%</span></li>
                                            <li className="flex justify-between"><span>Asia (ex-Japan)</span> <span className="text-slate-400">15%</span></li>
                                            <li className="flex justify-between"><span>Japan</span> <span className="text-emerald-400">20%</span></li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-800">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Liquidity & Concentration Risk</p>
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        <strong>High Liquidity:</strong> 85% of the portfolio can be liquidated within 3 days. <br/>
                                        <strong>Concentration:</strong> Top 5 positions account for 22% of NAV (Moderate risk). No single position exceeds 6%.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab !== "MAR" && (
                <div className="bg-[#0f172a] rounded-xl border border-emerald-500/30 p-6 shadow-lg min-h-[400px] flex items-center justify-center">
                    <div className="text-center">
                        <svg className="w-16 h-16 text-slate-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 className="text-lg font-bold text-slate-300 mb-2">{activeTab} Database</h3>
                        <p className="text-sm text-slate-500 max-w-md mx-auto">
                            {activeTab === "HFR" && "Hedge Fund Research, Inc. indices and fund data integration pending. Connect to HFR database."}
                            {activeTab === "TASS" && "TASS Management database integration pending. Connect to TASS database to view comprehensive fund metrics."}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HedgeFundView;
