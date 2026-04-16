import React, { useState, useEffect } from "react";
import { AnalysisType, MarineTrafficData } from "../types";
import { analyzeStock } from "../services/geminiService";
import { Anchor, Ship, Clock, AlertTriangle, Activity, TrendingUp, TrendingDown, Minus, Map as MapIcon } from "lucide-react";

const MarineTrafficView: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<MarineTrafficData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [isMapLoading, setIsMapLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchGlobalData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await analyzeStock("GLOBAL_SHIPPING", AnalysisType.MarineTraffic);
        if (result.marineTraffic) {
          setData(result.marineTraffic);
        } else {
          setError("No marine traffic data returned.");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGlobalData();
  }, []);

  useEffect(() => {
    if (showMap) {
      setIsMapLoading(true);
      const timer = setTimeout(() => {
        setIsMapLoading(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showMap]);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-end border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Anchor className="w-6 h-6 text-blue-400" />
            Marine Traffic & Port Intel
          </h2>
          <p className="text-sm text-slate-400 mt-1">Global supply chain, chokepoint throughput, and vessel activity</p>
        </div>
        <button 
          onClick={() => setShowMap(!showMap)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            showMap 
              ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <MapIcon className="w-4 h-4" />
          {showMap ? 'Hide Live Map' : 'View Live Map'}
        </button>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-500/30 rounded p-4 mb-6 animate-fade-in flex gap-4">
            <div className="shrink-0 text-red-500 font-bold">ERR_SYS:</div>
            <div className="text-red-200 text-xs leading-relaxed">{error}</div>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center h-[400px] text-slate-400 bg-[#0f172a] rounded-xl border border-slate-800 shadow-inner">
          <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="font-bold uppercase tracking-[0.4em] text-[9px] font-mono animate-pulse text-blue-400">Tracking Global Fleet...</p>
        </div>
      )}

      {showMap && !isLoading && (
        <div className="w-full h-[500px] bg-slate-900 rounded-xl border border-slate-800 overflow-hidden relative animate-fade-in">
          {isMapLoading ? (
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 z-10 pointer-events-none">
               <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-400 rounded-full animate-spin"></div>
               <div className="text-blue-400 font-mono text-xs uppercase tracking-widest animate-pulse">Connecting to AIS Satellites...</div>
            </div>
          ) : (
            <iframe 
              name="marinetraffic" 
              id="marinetraffic" 
              width="100%" 
              height="100%" 
              scrolling="no" 
              frameBorder="0" 
              src="https://www.marinetraffic.com/en/ais/embed/zoom:3/centery:20/centerx:0/maptype:1/shownames:false/mmsi:0/shipid:0/fleet:/fleet_id:/vtypes:/showmenu:"
              title="MarineTraffic Live Map"
              className="absolute inset-0 z-10"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            ></iframe>
          )}
          
          {/* Simulated Map Background (shows while iframe loads) */}
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #020617 100%)',
            backgroundSize: 'cover'
          }}>
            {/* Grid lines */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }}></div>
          </div>
        </div>
      )}

      {!isLoading && data && (
        <div className="space-y-6 animate-fade-in font-sans">
            <div className="bg-[#0b0e14] p-6 rounded-2xl border border-blue-500/30 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Anchor className="w-48 h-48 text-blue-500" />
                </div>
                <div className="relative z-10">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">MarineTraffic API Integration</span>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase mt-1">Global Supply Chain Intel</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Chokepoint Throughput */}
                <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chokepoint Throughput</h3>
                    </div>
                    <div className="flex items-end justify-between mb-4">
                        <div className="text-4xl font-black text-white font-mono">{data.chokepointThroughput.index}</div>
                        <div className="flex items-center gap-1 text-xs font-bold">
                            {data.chokepointThroughput.trend === 'Up' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                            {data.chokepointThroughput.trend === 'Down' && <TrendingDown className="w-4 h-4 text-rose-400" />}
                            {data.chokepointThroughput.trend === 'Stable' && <Minus className="w-4 h-4 text-slate-400" />}
                            <span className={data.chokepointThroughput.trend === 'Up' ? 'text-emerald-400' : data.chokepointThroughput.trend === 'Down' ? 'text-rose-400' : 'text-slate-400'}>
                                {data.chokepointThroughput.trend}
                           </span>
                        </div>
                    </div>
                    <div className="mt-auto">
                        <div className="text-[9px] text-slate-500 uppercase font-bold mb-2">Major Bottlenecks</div>
                        <div className="flex flex-wrap gap-1">
                            {data.chokepointThroughput.majorBottlenecks.map((b, i) => (
                                <span key={i} className="px-2 py-1 bg-slate-800 text-slate-300 text-[9px] rounded border border-slate-700">{b}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Port Congestion */}
                <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Port Congestion Index</h3>
                    </div>
                    <div className="flex items-end justify-between mb-4">
                        <div className="text-4xl font-black text-white font-mono">{data.portCongestion.index}</div>
                        <div className="flex items-center gap-1 text-xs font-bold">
                            {data.portCongestion.trend === 'Up' && <TrendingUp className="w-4 h-4 text-rose-400" />}
                            {data.portCongestion.trend === 'Down' && <TrendingDown className="w-4 h-4 text-emerald-400" />}
                            {data.portCongestion.trend === 'Stable' && <Minus className="w-4 h-4 text-slate-400" />}
                            <span className={data.portCongestion.trend === 'Up' ? 'text-rose-400' : data.portCongestion.trend === 'Down' ? 'text-emerald-400' : 'text-slate-400'}>
                                {data.portCongestion.trend}
                            </span>
                        </div>
                    </div>
                    <div className="mt-auto bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                        <div className="text-[9px] text-amber-500/70 uppercase font-bold mb-1">Avg Wait Time</div>
                        <div className="text-lg font-mono font-bold text-amber-400">{data.portCongestion.averageWaitTimeDays} Days</div>
                    </div>
                </div>

                {/* Vessel Activity */}
                <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <Ship className="w-4 h-4 text-blue-400" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vessel Activity</h3>
                    </div>
                    <div className="space-y-3 mt-auto">
                        <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded">
                            <span className="text-xs text-slate-400">Total In Port</span>
                            <span className="font-mono font-bold text-white">{data.vesselActivity.totalInPort}</span>
                        </div>
                        <div className="flex justify-between items-center bg-emerald-900/20 p-2 rounded border border-emerald-500/10">
                            <span className="text-xs text-emerald-400/70">Arrivals (24h)</span>
                            <span className="font-mono font-bold text-emerald-400">+{data.vesselActivity.arrivals}</span>
                        </div>
                        <div className="flex justify-between items-center bg-rose-900/20 p-2 rounded border border-rose-500/10">
                            <span className="text-xs text-rose-400/70">Departures (24h)</span>
                            <span className="font-mono font-bold text-rose-400">-{data.vesselActivity.departures}</span>
                        </div>
                    </div>
                </div>

                {/* Time-in-Port */}
                <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time-in-Port Indicator</h3>
                    </div>
                    <div className="flex items-end justify-between mb-4">
                        <div className="text-4xl font-black text-white font-mono">{data.timeInPort.indicator}</div>
                        <div className="text-xs text-slate-500 font-mono">vs {data.timeInPort.historicalAverage} avg</div>
                    </div>
                    <div className="mt-auto">
                        <div className={`w-full py-2 text-center rounded text-xs font-bold uppercase tracking-wider border ${
                            data.timeInPort.status === 'Efficient' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            data.timeInPort.status === 'Delayed' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                            Status: {data.timeInPort.status}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[#1e293b]/50 p-6 rounded-xl border border-slate-700/50 shadow-lg">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Macro Supply Chain Synthesis</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{data.summary}</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default MarineTrafficView;
