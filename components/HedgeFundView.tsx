import React, { useState } from "react";

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

            <div className="bg-[#0f172a] rounded-xl border border-emerald-500/30 p-6 shadow-lg min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <svg className="w-16 h-16 text-slate-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="text-lg font-bold text-slate-300 mb-2">{activeTab} Database</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                        {activeTab === "MAR" && "Managed Account Reports data integration pending. Connect to MAR database to view CTA and hedge fund performance."}
                        {activeTab === "HFR" && "Hedge Fund Research, Inc. indices and fund data integration pending. Connect to HFR database."}
                        {activeTab === "TASS" && "TASS Management database integration pending. Connect to TASS database to view comprehensive fund metrics."}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HedgeFundView;
