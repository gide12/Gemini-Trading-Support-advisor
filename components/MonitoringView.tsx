import React, { useState, useEffect } from "react";

const MonitoringView: React.FC = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                        </svg>
                        Hedge Fund Monitor
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">Office of Financial Research (OFR) Real-Time Data</p>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">System Time</div>
                    <div className="text-lg font-mono text-blue-400">{currentTime.toLocaleTimeString()}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#0f172a] rounded-xl border border-blue-500/30 p-6 shadow-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white">Systemic Risk Indicators</h3>
                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded uppercase">Live</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-xl">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Gross Leverage (Avg)</div>
                                <div className="text-3xl font-mono text-white">4.2x</div>
                                <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                                    -0.1x from prev month
                                </div>
                            </div>
                            <div className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-xl">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Net Leverage (Avg)</div>
                                <div className="text-3xl font-mono text-white">1.8x</div>
                                <div className="text-xs text-rose-400 mt-2 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                    +0.2x from prev month
                                </div>
                            </div>
                            <div className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-xl">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Qualifying Hedge Funds</div>
                                <div className="text-3xl font-mono text-white">2,145</div>
                                <div className="text-xs text-slate-400 mt-2">Total AUM: $4.8T</div>
                            </div>
                            <div className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-xl">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Liquidity Mismatch</div>
                                <div className="text-3xl font-mono text-amber-400">Moderate</div>
                                <div className="text-xs text-slate-400 mt-2">Based on Form PF data</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0f172a] rounded-xl border border-blue-500/30 p-6 shadow-lg">
                        <h3 className="text-lg font-bold text-white mb-6">Strategy Performance Matrix</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                                        <th className="pb-3 font-bold">Strategy</th>
                                        <th className="pb-3 font-bold text-right">AUM ($B)</th>
                                        <th className="pb-3 font-bold text-right">YTD Return</th>
                                        <th className="pb-3 font-bold text-right">Volatility</th>
                                        <th className="pb-3 font-bold text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50 text-sm">
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="py-3 font-medium text-white">Equity Long/Short</td>
                                        <td className="py-3 text-right text-slate-300 font-mono">1,240</td>
                                        <td className="py-3 text-right text-emerald-400 font-mono">+8.4%</td>
                                        <td className="py-3 text-right text-slate-400 font-mono">12.1%</td>
                                        <td className="py-3 text-center"><span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded uppercase">Stable</span></td>
                                    </tr>
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="py-3 font-medium text-white">Global Macro</td>
                                        <td className="py-3 text-right text-slate-300 font-mono">850</td>
                                        <td className="py-3 text-right text-emerald-400 font-mono">+4.2%</td>
                                        <td className="py-3 text-right text-slate-400 font-mono">8.5%</td>
                                        <td className="py-3 text-center"><span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded uppercase">Stable</span></td>
                                    </tr>
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="py-3 font-medium text-white">Event Driven</td>
                                        <td className="py-3 text-right text-slate-300 font-mono">620</td>
                                        <td className="py-3 text-right text-rose-400 font-mono">-1.5%</td>
                                        <td className="py-3 text-right text-slate-400 font-mono">10.2%</td>
                                        <td className="py-3 text-center"><span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] rounded uppercase">Watch</span></td>
                                    </tr>
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="py-3 font-medium text-white">Relative Value</td>
                                        <td className="py-3 text-right text-slate-300 font-mono">980</td>
                                        <td className="py-3 text-right text-emerald-400 font-mono">+5.1%</td>
                                        <td className="py-3 text-right text-slate-400 font-mono">4.3%</td>
                                        <td className="py-3 text-center"><span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded uppercase">Stable</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#0f172a] rounded-xl border border-blue-500/30 p-6 shadow-lg">
                        <h3 className="text-lg font-bold text-white mb-4">OFR Alerts</h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-bold text-rose-400 uppercase">High Priority</span>
                                </div>
                                <p className="text-sm text-slate-300">Elevated basis trade leverage detected in Treasury markets. Monitoring repo market capacity.</p>
                                <div className="text-[10px] text-slate-500 mt-2">Updated 15 mins ago</div>
                            </div>
                            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                    <span className="text-xs font-bold text-amber-400 uppercase">Notice</span>
                                </div>
                                <p className="text-sm text-slate-300">Commercial Real Estate (CRE) exposure in regional banks showing increased correlation with specific credit funds.</p>
                                <div className="text-[10px] text-slate-500 mt-2">Updated 2 hours ago</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0f172a] rounded-xl border border-blue-500/30 p-6 shadow-lg">
                        <h3 className="text-lg font-bold text-white mb-4">Data Sources</h3>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Form PF Filings (SEC)
                            </li>
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                TRACE Corporate Bond Data
                            </li>
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                DTCC Swap Data Repository
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonitoringView;
