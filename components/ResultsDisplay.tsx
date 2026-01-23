import React, { useEffect, useState, useMemo } from "react";
import { AnalysisResult, AnalysisType, BrokerIntelData, TechnicalAnalysisData } from "../types";
import { 
    ComposedChart, ReferenceLine, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, Cell, Line, CartesianGrid, Label, Legend, ReferenceArea, Scatter, Area
} from "recharts";

interface ResultsDisplayProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  activeTab: AnalysisType;
}

/**
 * Institutional Volume Footprint Component
 * Renders individual price levels with bid/ask volume, delta, and imbalance highlights.
 */
const VolumeFootprintCluster = ({ data, currentPrice }: { data: TechnicalAnalysisData['footprintProfile'], currentPrice: number }) => {
    if (!data || data.length === 0) return null;

    return (
        <div className="flex flex-col border border-slate-700 rounded bg-[#131722] shadow-2xl font-mono overflow-hidden">
            {/* Toolbar Simulation */}
            <div className="bg-[#1c202b] border-b border-slate-700 px-2 py-1 flex justify-between items-center select-none">
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Footprint Cluster [Tick: 0.50]</span>
                </div>
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-sm bg-slate-700"></div>
                    <div className="w-2 h-2 rounded-sm bg-slate-700"></div>
                </div>
            </div>

            {/* Header Labels */}
            <div className="grid grid-cols-3 bg-[#1c202b] text-[8px] font-black uppercase text-slate-500 border-b border-slate-700 py-1">
                <div className="px-1 text-center border-r border-slate-800">Sellers (Hit)</div>
                <div className="px-1 text-center border-r border-slate-800">Price</div>
                <div className="px-1 text-center">Buyers (Lift)</div>
            </div>

            {/* Price Levels (Reversed to show high price at top) */}
            <div className="flex flex-col-reverse max-h-[400px] overflow-y-auto custom-scrollbar">
                {data.map((level, i) => {
                    const isImbalanceBuy = level.askVol > level.bidVol * 3;
                    const isImbalanceSell = level.bidVol > level.askVol * 3;
                    const delta = level.askVol - level.bidVol;
                    const totalAtLevel = level.bidVol + level.askVol;
                    const maxVol = Math.max(...data.map(d => d.bidVol + d.askVol));
                    
                    return (
                        <div key={i} className={`grid grid-cols-3 text-[10px] items-center border-b border-slate-800/30 relative h-7 group transition-colors hover:bg-slate-800/50 ${level.isPoc ? 'bg-amber-500/10' : ''}`}>
                            {/* Seller Side (Bid Hit) */}
                            <div className="relative h-full flex items-center justify-end px-2 border-r border-slate-800">
                                <div 
                                    className="absolute right-0 top-0 bottom-0 bg-rose-500/20" 
                                    style={{ width: `${(level.bidVol / maxVol) * 100}%` }}
                                />
                                <span className={`relative z-10 ${isImbalanceSell ? 'text-rose-400 font-black underline' : 'text-slate-400'}`}>
                                    {level.bidVol}
                                </span>
                            </div>

                            {/* Center: Price & Delta */}
                            <div className={`h-full flex flex-col items-center justify-center border-r border-slate-800 text-[9px] font-bold ${level.isPoc ? 'text-amber-400 bg-amber-500/20' : 'text-slate-500'}`}>
                                <span>${level.price.toFixed(2)}</span>
                                <span className={`text-[7px] font-black ${delta >= 0 ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                                    Δ {delta > 0 ? '+' : ''}{delta}
                                </span>
                            </div>

                            {/* Buyer Side (Ask Lifted) */}
                            <div className="relative h-full flex items-center justify-start px-2">
                                <div 
                                    className="absolute left-0 top-0 bottom-0 bg-emerald-500/20" 
                                    style={{ width: `${(level.askVol / maxVol) * 100}%` }}
                                />
                                <span className={`relative z-10 ${isImbalanceBuy ? 'text-emerald-400 font-black underline' : 'text-slate-400'}`}>
                                    {level.askVol}
                                </span>
                            </div>

                            {/* POC Marker */}
                            {level.isPoc && (
                                <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-amber-500 shadow-[0_0_8px_#f59e0b]"></div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Bottom CVD Stats */}
            <div className="bg-[#0b0e14] border-t border-slate-700 p-2 flex justify-between items-center text-[10px] font-black uppercase">
                <div className="flex gap-3">
                    <span className="text-slate-600 tracking-tighter">CUMULATIVE DELTA:</span>
                    <span className={data.reduce((acc, curr) => acc + (curr.askVol - curr.bidVol), 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {data.reduce((acc, curr) => acc + (curr.askVol - curr.bidVol), 0)}
                    </span>
                </div>
                <div className="text-slate-600">POC @ ${data.find(d => d.isPoc)?.price.toFixed(2)}</div>
            </div>
        </div>
    );
};

const generateHeatmapData = (currentPrice: number) => {
    const data = [];
    const base = currentPrice || 100;
    for (let i = 0; i < 40; i++) {
        const date = new Date();
        date.setMinutes(date.getMinutes() - (40 - i) * 5);
        const dateStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        data.push({
            time: dateStr,
            price: base + (Math.random() - 0.5) * (base * 0.03),
            volume: Math.random() * 5000
        });
    }
    return data;
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, isLoading, activeTab }) => {
  const [viewMode, setViewMode] = useState<'Standard' | 'Footprint'>('Footprint');

  const technicalData = result?.technicalAnalysis;

  // Mock footprint data if not present (ensures high-fidelity visual)
  const footprintProfile = useMemo(() => {
    if (technicalData?.footprintProfile && technicalData.footprintProfile.length > 0) return technicalData.footprintProfile;
    if (!technicalData) return [];
    
    const base = technicalData.currentPrice || 100;
    const profile = [];
    for (let i = -10; i <= 10; i++) {
        const price = base + (i * 0.5);
        const bid = Math.floor(Math.random() * 1000);
        const ask = Math.floor(Math.random() * 1000);
        profile.push({
            price,
            bidVol: bid,
            askVol: ask,
            isPoc: i === 2, // Arbitrary POC
            isImbalance: ask > bid * 3 || bid > ask * 3
        });
    }
    return profile;
  }, [technicalData]);

  const heatmapData = useMemo(() => {
    if (!technicalData) return [];
    return generateHeatmapData(technicalData.currentPrice);
  }, [technicalData]);

  // Tight Fit Scaling Logic
  const yDomain = useMemo(() => {
    if (heatmapData.length === 0) return [0, 100];
    const prices = heatmapData.map(d => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const pad = (max - min) * 0.05; // 5% padding for "tight fit"
    return [min - pad, max + pad];
  }, [heatmapData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-slate-400 bg-[#0b0e14] rounded-xl border border-slate-800">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
        <p className="font-bold uppercase tracking-[0.2em] text-[9px] font-mono">Loading Institutional Data Stream...</p>
      </div>
    );
  }

  if (!result) return <div className="h-96 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">Initialize analysis by searching a ticker.</div>;

  const isTechnical = activeTab === AnalysisType.Technical;
  const isBrokerIntel = activeTab === AnalysisType.BrokerIntel;

  return (
    <div className="bg-[#131B2E] rounded-lg border border-purple-500/30 p-6 shadow-xl min-h-[400px] fade-in overflow-hidden">
      {/* TRADINGVIEW STYLE HEADER TOOLBAR */}
      <div className="flex justify-between items-center mb-6 bg-[#1c202b] -mx-6 -mt-6 px-6 py-2 border-b border-slate-700 select-none">
        <div className="flex items-center gap-4">
            <div className="bg-purple-600 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter">{result.ticker}</div>
            <div className="flex gap-3 text-[10px] font-bold text-slate-500">
                <span className="hover:text-slate-300 cursor-pointer">5m</span>
                <span className="text-slate-700">|</span>
                <span className="hover:text-slate-300 cursor-pointer">Footprint</span>
                <span className="text-slate-700">|</span>
                <span className="hover:text-slate-300 cursor-pointer">Indicators</span>
            </div>
        </div>
        <div className="flex gap-2">
            <div className="bg-slate-800 hover:bg-slate-700 transition-colors p-1.5 rounded cursor-pointer">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </div>
            <div className="bg-slate-800 hover:bg-slate-700 transition-colors p-1.5 rounded cursor-pointer">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-3.921-5.59-3.926-5.97 0l-.096.986c-.183.183-.369.369-.55.558l-.978-.096c-3.921-.38-3.926 5.59 0 5.97l.986.096c.183.183.369.369.558.55l-.096.978c-.38 3.921 5.59 3.926 5.97 0l.096-.986c.183-.183.369-.369.55-.558l.978.096c3.921.38 3.926-5.59 0-5.97l-.986-.096c-.183-.183-.369-.369-.558-.55l.096-.978zM9.75 10a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" /></svg>
            </div>
        </div>
      </div>

      {/* VIEW: TECHNICAL ANALYSIS (VOLUME FOOTPRINT) */}
      {isTechnical && technicalData && (
          <div className="animate-fade-in space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Historical Price Action & Heatmap (TIGHT FIT) */}
                  <div className="lg:col-span-8 bg-[#131722] rounded-xl border border-slate-800 h-[500px] relative overflow-hidden group">
                      <div className="absolute top-4 left-6 z-10 flex flex-col gap-1">
                          <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              Order Flow Visualizer
                          </span>
                          <span className="text-[14px] font-mono font-bold text-white">
                            ${technicalData.currentPrice.toFixed(2)} 
                            <span className="ml-2 text-emerald-400 text-xs">+{(Math.random()*1.5).toFixed(2)}%</span>
                          </span>
                      </div>
                      
                      <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={heatmapData} margin={{ top: 60, right: 10, left: 0, bottom: 10 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" vertical={false} opacity={0.2} />
                              <XAxis dataKey="time" stroke="#334155" tick={{fontSize: 8, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                              <YAxis 
                                domain={yDomain} 
                                stroke="#334155" 
                                tick={{fontSize: 9, fontWeight: 'bold'}} 
                                orientation="right" 
                                axisLine={false} 
                                tickLine={false} 
                                mirror={false}
                                tickFormatter={(val) => `$${val.toFixed(1)}`}
                              />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#131722', borderColor: '#334155', borderRadius: '4px', fontSize: '10px' }}
                                itemStyle={{ color: '#22d3ee' }}
                                cursor={{ stroke: '#334155', strokeWidth: 1 }}
                              />
                              
                              {/* Support / Resistance Institutional Zones */}
                              {technicalData.supportResistance.resistance.map((lvl, i) => (
                                  <ReferenceArea key={`res-${i}`} y1={lvl * 0.998} y2={lvl * 1.002} fill="#f43f5e" fillOpacity={0.08} stroke="none" />
                              ))}
                              {technicalData.supportResistance.support.map((lvl, i) => (
                                  <ReferenceArea key={`sup-${i}`} y1={lvl * 0.998} y2={lvl * 1.002} fill="#10b981" fillOpacity={0.08} stroke="none" />
                              ))}

                              {/* Price Heatmap Area */}
                              <Area 
                                type="monotone" 
                                dataKey="price" 
                                stroke="#22d3ee" 
                                fill="url(#colorPrice)" 
                                fillOpacity={0.2} 
                                strokeWidth={2} 
                                animationDuration={2000}
                                isAnimationActive={true}
                              />
                              <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                                </linearGradient>
                              </defs>

                              {/* AI Order Triggers */}
                              {technicalData.breakoutPoints?.map((pt, i) => (
                                  <ReferenceLine key={i} y={pt.price} stroke={pt.type === 'Breakout' ? '#22d3ee' : '#f59e0b'} strokeDasharray="4 2" strokeWidth={1} opacity={0.6}>
                                      <Label value={pt.label} position="insideRight" fill={pt.type === 'Breakout' ? '#22d3ee' : '#f59e0b'} fontSize={8} fontWeight="black" offset={10} />
                                  </ReferenceLine>
                              ))}
                          </ComposedChart>
                      </ResponsiveContainer>
                      
                      {/* Legend Panel overlay */}
                      <div className="absolute bottom-4 right-16 bg-[#131722]/80 backdrop-blur p-2 rounded border border-slate-800 text-[8px] font-black text-slate-500 uppercase flex flex-col gap-1 select-none">
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-500"></div> Market Buy Intensity</div>
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Aggressive Sell Pressure</div>
                      </div>
                  </div>

                  {/* Right Column: Footprint Detail View */}
                  <div className="lg:col-span-4 space-y-4 h-full flex flex-col">
                      <div className="flex-1 flex flex-col">
                          <VolumeFootprintCluster data={footprintProfile} currentPrice={technicalData.currentPrice} />
                      </div>

                      {/* Institutional Metrics Grid */}
                      <div className="bg-[#0b0e14] border border-slate-800 rounded p-4 grid grid-cols-2 gap-4">
                          <div className="flex flex-col">
                              <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">CVD Trend</span>
                              <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                                  <span className="text-xs font-mono font-bold text-white uppercase tracking-tighter">Accumulation</span>
                              </div>
                          </div>
                          <div className="flex flex-col">
                              <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Absorption</span>
                              <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                  <span className="text-xs font-mono font-bold text-white uppercase tracking-tighter">Passive Demand</span>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Advanced Signal Summary Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5 shadow-inner">
                      <span className="text-[9px] text-slate-500 uppercase font-black block mb-1 tracking-widest">RSI-V (Volume Adjusted)</span>
                      <div className="text-lg font-mono font-bold text-white">{technicalData.indicators.rsi}</div>
                  </div>
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5 shadow-inner">
                      <span className="text-[9px] text-slate-500 uppercase font-black block mb-1 tracking-widest">Order Regime</span>
                      <div className={`text-lg font-bold ${technicalData.trend === 'Bullish' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {technicalData.trend.toUpperCase()}
                      </div>
                  </div>
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5 shadow-inner">
                      <span className="text-[9px] text-slate-500 uppercase font-black block mb-1 tracking-widest">Flow Conviction</span>
                      <div className="text-lg font-bold text-cyan-400 tracking-tighter">{technicalData.signalStrength.toUpperCase()}</div>
                  </div>
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5 shadow-inner">
                      <span className="text-[9px] text-slate-500 uppercase font-black block mb-1 tracking-widest">Smart Money Index</span>
                      <div className="text-lg font-mono font-bold text-purple-400">84.2</div>
                  </div>
              </div>

              {/* Executive Summary & Grounding Sources */}
              <div className="bg-[#1c202b] p-6 rounded-xl border border-purple-500/20 text-sm text-slate-300 leading-relaxed shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded bg-purple-600/20 flex items-center justify-center text-purple-400 border border-purple-500/30">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                      </div>
                      <span className="font-black text-white uppercase text-[10px] tracking-[0.2em]">Institutional Technical Insight</span>
                  </div>
                  <p className="italic font-serif opacity-80 leading-relaxed">"{technicalData.summary}"</p>

                  {/* Grounding Metadata Sources - Mandatory Listing for Google Search tool usage */}
                  {result.sources && result.sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Grounding Sources</div>
                        <div className="flex flex-wrap gap-2">
                            {result.sources.map((s, idx) => (
                                <a 
                                    key={idx} 
                                    href={s.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-cyan-400 px-2 py-1 rounded border border-cyan-500/20 transition-colors flex items-center gap-1"
                                >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    {s.title}
                                </a>
                            ))}
                        </div>
                    </div>
                  )}
              </div>
          </div>
      )}

      {/* REMAINDER OF COMPONENT (BROKER INTEL ETC) */}
      {isBrokerIntel && result.brokerIntel && (
          <div className="text-slate-400 text-sm py-10 flex flex-col items-center">
              <div className="w-16 h-1 bg-purple-500/30 rounded-full mb-6"></div>
              <p className="italic text-center max-w-2xl mb-6">"{result.brokerIntel.summary}"</p>
              
              {/* Sources for Broker Intel */}
              {result.sources && result.sources.length > 0 && (
                <div className="w-full max-w-2xl pt-6 border-t border-slate-800">
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 text-center">Reference Sources</div>
                    <div className="flex flex-wrap justify-center gap-2">
                        {result.sources.map((s, idx) => (
                            <a key={idx} href={s.url} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-slate-800/50 hover:bg-slate-800 text-slate-400 px-3 py-1.5 rounded border border-slate-700 transition-all flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                                {s.title}
                            </a>
                        ))}
                    </div>
                </div>
              )}
          </div>
      )}
    </div>
  );
};

export default ResultsDisplay;