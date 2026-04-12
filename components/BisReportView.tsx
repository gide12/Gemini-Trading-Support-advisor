import React, { useState, useEffect } from "react";
import { AnalysisType, BISReportData } from "../types";
import { analyzeStock } from "../services/geminiService";
import { Landmark, TrendingUp, TrendingDown, Minus, AlertTriangle, Globe, DollarSign, Activity } from "lucide-react";

const BisReportView: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<BISReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGlobalData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await analyzeStock("GLOBAL_MACRO", AnalysisType.BISReport);
        if (result.bisReport) {
          setData(result.bisReport);
        } else {
          setError("No BIS report data returned.");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGlobalData();
  }, []);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-end border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Landmark className="w-6 h-6 text-amber-400" />
            BIS Macro Report
          </h2>
          <p className="text-sm text-slate-400 mt-1">Bank for International Settlements - Global Liquidity & Risk</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-500/30 rounded p-4 mb-6 animate-fade-in flex gap-4">
            <div className="shrink-0 text-red-500 font-bold">ERR_SYS:</div>
            <div className="text-red-200 text-xs leading-relaxed">{error}</div>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center h-[400px] text-slate-400 bg-[#0f172a] rounded-xl border border-slate-800 shadow-inner">
          <div className="w-12 h-12 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4"></div>
          <p className="font-bold uppercase tracking-[0.4em] text-[9px] font-mono animate-pulse text-amber-400">Compiling Central Bank Data...</p>
        </div>
      )}

      {!isLoading && data && (
        <div className="space-y-6 animate-fade-in font-sans">
            <div className="bg-[#0b0e14] p-6 rounded-2xl border border-amber-500/30 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Landmark className="w-48 h-48 text-amber-500" />
                </div>
                <div className="relative z-10">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Institutional Macro Synthesis • {data.date}</span>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase mt-1">Global Liquidity & Policy Stance</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Global Liquidity */}
                <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Liquidity</h3>
                    </div>
                    <div className="flex items-end justify-between mb-4">
                        <div className="text-2xl font-black text-white font-mono">{data.globalLiquidity.usdCredit}</div>
                        <div className="flex items-center gap-1 text-xs font-bold">
                            {data.globalLiquidity.trend === 'Expanding' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                            {data.globalLiquidity.trend === 'Contracting' && <TrendingDown className="w-4 h-4 text-rose-400" />}
                            {data.globalLiquidity.trend === 'Stable' && <Minus className="w-4 h-4 text-slate-400" />}
                            <span className={data.globalLiquidity.trend === 'Expanding' ? 'text-emerald-400' : data.globalLiquidity.trend === 'Contracting' ? 'text-rose-400' : 'text-slate-400'}>
                                {data.globalLiquidity.trend}
                           </span>
                        </div>
                    </div>
                    <div className="mt-auto bg-slate-800/50 p-2 rounded">
                        <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">YoY Change</div>
                        <div className={`text-sm font-mono font-bold ${data.globalLiquidity.yoyChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {data.globalLiquidity.yoyChange > 0 ? '+' : ''}{data.globalLiquidity.yoyChange}%
                        </div>
                    </div>
                </div>

                {/* Cross-Border Claims */}
                <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe className="w-4 h-4 text-blue-400" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cross-Border Claims</h3>
                    </div>
                    <div className="text-2xl font-black text-white font-mono mb-4">{data.crossBorderClaims.total}</div>
                    <div className="space-y-2 mt-auto">
                        <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Advanced Econ</span>
                            <span className="font-mono font-bold text-white text-sm">{data.crossBorderClaims.advancedEconomies}</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Emerging Mkts</span>
                            <span className="font-mono font-bold text-white text-sm">{data.crossBorderClaims.emergingMarkets}</span>
                        </div>
                    </div>
                </div>

                {/* Policy Rates */}
                <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-4 h-4 text-purple-400" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Policy Rates</h3>
                    </div>
                    <div className="mt-auto space-y-4">
                        <div className={`w-full py-3 text-center rounded text-sm font-black uppercase tracking-wider border ${
                            data.policyRates.stance === 'Hawkish' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            data.policyRates.stance === 'Dovish' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                            Stance: {data.policyRates.stance}
                        </div>
                        <div className="bg-slate-800/50 p-2 rounded flex justify-between items-center">
                            <span className="text-[9px] text-slate-500 uppercase font-bold">Divergence Index</span>
                            <span className="font-mono font-bold text-purple-400">{data.policyRates.divergenceIndex}</span>
                        </div>
                    </div>
                </div>

                {/* Systemic Risk */}
                <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Systemic Risk</h3>
                    </div>
                    <div className="flex items-end justify-between mb-4">
                        <div className="text-4xl font-black text-white font-mono">{data.systemicRisk.indicator}</div>
                        <div className="text-xs text-slate-500 font-mono">/ 100</div>
                    </div>
                    <div className="mt-auto bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                        <div className="text-[9px] text-amber-500/70 uppercase font-bold mb-1">Primary Vulnerability</div>
                        <div className="text-sm font-bold text-amber-400 leading-tight">{data.systemicRisk.primaryVulnerability}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#1e293b]/50 p-6 rounded-xl border border-slate-700/50 shadow-lg">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Executive Summary</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{data.executiveSummary}</p>
                </div>
                <div className="bg-[#1e293b]/50 p-6 rounded-xl border border-slate-700/50 shadow-lg">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Key Takeaways</h3>
                    <ul className="space-y-3">
                        {data.keyTakeaways.map((takeaway, idx) => (
                            <li key={idx} className="flex gap-3 text-sm text-slate-300">
                                <span className="text-amber-500 mt-1 shrink-0">•</span>
                                <span>{takeaway}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default BisReportView;
