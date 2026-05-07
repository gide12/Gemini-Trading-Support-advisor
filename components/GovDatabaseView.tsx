import React, { useState } from "react";
import { fetchGovDatabase } from "../services/geminiService";
import { GovDatabaseResult } from "../types";
import { Landmark, FileText, Globe, DollarSign, Activity, FileCheck, Shield, ChevronRight, ExternalLink, Search } from "lucide-react";

const GovDatabaseView: React.FC = () => {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GovDatabaseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    if (!ticker) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await fetchGovDatabase(ticker);
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to fetch government databases.");
    } finally {
      setLoading(false);
    }
  };

  const getSecSearchUrl = (ticker: string) => `https://www.sec.gov/edgar/searchedgar/companysearch`;
  const getUsaSpendingUrl = (ticker: string) => `https://www.usaspending.gov/search/?keyword=${encodeURIComponent(ticker)}`;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in custom-scrollbar">
      {/* Header section */}
      <div className="bg-gradient-to-br from-[#0f172a] to-[#0B1221] rounded-2xl border border-blue-500/30 p-8 shadow-[0_0_50px_-12px_rgba(59,130,246,0.2)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
        
        <div className="flex items-center gap-5 mb-8 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl flex items-center justify-center border border-blue-500/40 shadow-inner shrink-0">
            <Landmark className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black font-mono text-white tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">U.S. Government Databases</h2>
            <p className="text-slate-400 text-sm mt-2 font-medium tracking-wide">Synthesize SEC, CFTC, Treasury, and Federal Spending Data via Intelligence Cross-Reference</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-8 relative z-10 max-w-3xl">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search className="w-5 h-5 text-blue-400/50 group-focus-within:text-blue-400 transition-colors" />
            </div>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="ENTER TICKER OR ENTITY (E.G. AAPL)"
              onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
              className="w-full bg-[#1e293b]/80 border border-blue-500/30 rounded-xl pl-12 pr-4 py-4 text-white font-mono text-lg focus:outline-none focus:border-blue-400 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all backdrop-blur-sm"
            />
          </div>
          <button
            onClick={handleFetch}
            disabled={loading || !ticker}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 text-white px-10 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 tracking-widest font-mono shadow-lg hover:shadow-blue-500/25 shrink-0"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                FETCHING...
              </>
            ) : (
              'QUERY DB'
            )}
          </button>
        </div>
        {error && (
            <div className="mt-6 text-red-300 text-sm bg-red-900/40 p-4 rounded-xl border border-red-500/30 flex items-center gap-3 backdrop-blur-sm relative z-10">
                <Shield className="w-5 h-5 text-red-400 shrink-0" />
                {error}
            </div>
        )}
      </div>

      {data && (
        <div className="space-y-8 animate-fade-in-up">
          {/* Summary Section */}
          <div className="bg-gradient-to-r from-blue-900/30 to-[#0f172a] rounded-2xl border border-blue-500/30 p-8 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <h3 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-3">
              <Activity className="w-5 h-5" />
              Intelligence Synthesis
            </h3>
            <p className="text-slate-200 text-base leading-relaxed">{data.summary}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* SEC Filings */}
            <div className="bg-[#0f172a]/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-8 space-y-6 shadow-xl flex flex-col">
              <div className="flex items-center justify-between mb-2 border-b border-slate-700/50 pb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <FileCheck className="w-6 h-6 text-indigo-400" />
                    SEC Disclosures
                  </h3>
                  <a href={getSecSearchUrl(ticker)} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 transition-colors">
                      RAW DATA <ExternalLink className="w-3 h-3" />
                  </a>
              </div>
              
              <div className="space-y-4 flex-1">
                <div className="bg-[#1e293b]/60 hover:bg-[#1e293b] p-5 rounded-xl border border-slate-700/50 transition-colors group">
                  <h4 className="text-xs font-black text-blue-400 mb-3 uppercase flex items-center justify-between tracking-wider">
                    <span>13F - Institutional Holdings</span>
                    <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{data.sec13F}</p>
                </div>
                
                <div className="bg-[#1e293b]/60 hover:bg-[#1e293b] p-5 rounded-xl border border-slate-700/50 transition-colors group">
                  <h4 className="text-xs font-black text-purple-400 mb-3 uppercase flex items-center justify-between tracking-wider">
                    <span>N-PORT - Mutual Fund Exposure</span>
                    <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{data.secNPort}</p>
                </div>

                <div className="bg-[#1e293b]/60 hover:bg-[#1e293b] p-5 rounded-xl border border-slate-700/50 transition-colors group">
                  <h4 className="text-xs font-black text-emerald-400 mb-3 uppercase flex items-center justify-between tracking-wider">
                    <span>13D/G - Beneficial Ownership</span>
                    <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{data.sec13DG}</p>
                </div>

                <div className="bg-[#1e293b]/60 hover:bg-[#1e293b] p-5 rounded-xl border border-slate-700/50 transition-colors group">
                  <h4 className="text-xs font-black text-rose-400 mb-3 uppercase flex items-center justify-between tracking-wider">
                    <span>Form 4 - Insider Trading</span>
                    <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{data.secForm4}</p>
                </div>
              </div>
            </div>

            {/* Other Gov DBs */}
            <div className="bg-[#0f172a]/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-8 space-y-6 shadow-xl flex flex-col">
              <div className="flex items-center justify-between mb-2 border-b border-slate-700/50 pb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <Globe className="w-6 h-6 text-amber-400" />
                    Federal & Macro Data
                  </h3>
              </div>
              
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="bg-[#1e293b]/60 hover:bg-[#1e293b] p-5 rounded-xl border border-slate-700/50 relative overflow-hidden transition-colors group flex-1">
                  <div className="absolute top-0 right-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
                    <DollarSign className="w-32 h-32" />
                  </div>
                  <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                            USAspending.gov
                        </h4>
                        <a href={getUsaSpendingUrl(ticker)} target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase font-bold text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors">
                            Search DB <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{data.usASpending}</p>
                  </div>
                </div>

                <div className="bg-[#1e293b]/60 hover:bg-[#1e293b] p-5 rounded-xl border border-slate-700/50 relative overflow-hidden transition-colors group flex-1">
                  <div className="absolute top-0 right-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
                    <Activity className="w-32 h-32" />
                  </div>
                  <div className="relative z-10">
                      <h4 className="text-xs font-black text-cyan-400 mb-3 uppercase flex items-center justify-between tracking-wider">
                        <span>CFTC COT Report</span>
                        <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </h4>
                      <p className="text-sm text-slate-300 leading-relaxed">{data.cftcCot}</p>
                  </div>
                </div>

                <div className="bg-[#1e293b]/60 hover:bg-[#1e293b] p-5 rounded-xl border border-slate-700/50 relative overflow-hidden transition-colors group flex-1">
                  <div className="absolute top-0 right-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
                    <Shield className="w-32 h-32" />
                  </div>
                  <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                            Treasury TIC Data
                          </h4>
                          <a href="https://ticdata.treasury.gov/" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase font-bold text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors">
                            Portal <ExternalLink className="w-3 h-3" />
                          </a>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{data.treasuryTic}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovDatabaseView;
