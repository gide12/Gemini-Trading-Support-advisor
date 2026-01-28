
import React, { useMemo, useState } from "react";
import { AnalysisResult, AnalysisType, PriceActionData, PriceActionCandle, TechnicalAnalysisData, NewsItem } from "../types";
import { 
    ComposedChart, ReferenceLine, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, Cell, CartesianGrid, ReferenceArea, Area, BarChart, Line, Scatter, ScatterChart, ZAxis
} from "recharts";

interface ResultsDisplayProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  activeTab: AnalysisType;
}

const NewsThumbnail = ({ source }: { source: string }) => {
    const [imgError, setImgError] = useState(false);
    const s = source.toLowerCase();
    let domain = "";
    let accentColor = "border-slate-700";
    let brandColor = "bg-slate-800";
    let shortName = source.substring(0, 1);

    if (s.includes("bloomberg")) {
        domain = "bloomberg.com";
        accentColor = "border-blue-600";
        brandColor = "bg-blue-600";
        shortName = "B";
    } else if (s.includes("financial times") || s.includes("ft")) {
        domain = "ft.com";
        accentColor = "border-[#ff7500]";
        brandColor = "bg-[#fff1e5]"; // FT Salmon
        shortName = "FT";
    } else if (s.includes("wall street journal") || s.includes("wsj")) {
        domain = "wsj.com";
        accentColor = "border-slate-400";
        brandColor = "bg-white";
        shortName = "WSJ";
    } else if (s.includes("yahoo finance")) {
        domain = "yahoo.com";
        accentColor = "border-[#7e00ff]";
        brandColor = "bg-[#400090]";
        shortName = "Y!";
    }

    const logoUrl = domain ? `https://logo.clearbit.com/${domain}?size=128` : "";

    return (
        <div className={`w-full h-full bg-[#0B1221] ${accentColor} border-r-2 flex items-center justify-center p-3 overflow-hidden relative group-hover:bg-slate-800/20 transition-all duration-500`}>
            {!imgError && logoUrl ? (
                <img 
                    src={logoUrl} 
                    alt={source} 
                    className="w-full max-h-12 object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-xl"
                    onError={() => setImgError(true)}
                    loading="lazy"
                />
            ) : (
                <div className={`w-10 h-10 rounded flex items-center justify-center ${brandColor} shadow-lg shadow-black/50`}>
                    <span className={`text-xs font-black tracking-tighter ${s.includes("ft") || s.includes("wsj") ? 'text-black' : 'text-white'}`}>
                        {shortName}
                    </span>
                </div>
            )}
            
            {/* Tech-inspired decorative overlay */}
            <div className="absolute top-1 left-1 opacity-20">
                <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
            <div className="absolute bottom-1 right-1 opacity-10">
                <div className="w-4 h-px bg-white"></div>
            </div>
            
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]"></div>
        </div>
    );
};

const NewsDashboard = ({ items, summary }: { items: NewsItem[], summary: string }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Context Summary */}
            <div className="bg-[#1e293b]/40 p-5 rounded-xl border border-white/5 flex items-start gap-4">
                <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shrink-0 mt-1 shadow-lg shadow-emerald-900/10">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                </div>
                <div>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1 block">Global Intelligence Brief</span>
                    <p className="text-sm text-slate-300 italic leading-relaxed">"{summary}"</p>
                </div>
            </div>

            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item, i) => (
                    <a 
                        key={i} 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all flex h-32 hover:shadow-2xl hover:shadow-purple-900/20"
                    >
                        <div className="w-28 shrink-0">
                            <NewsThumbnail source={item.source} />
                        </div>
                        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                            <div>
                                <div className="flex justify-between items-start gap-2 mb-1">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter truncate max-w-[120px]">{item.source}</span>
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${item.sentiment === 'Positive' ? 'bg-emerald-900/30 text-emerald-400' : item.sentiment === 'Negative' ? 'bg-rose-900/30 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
                                        {item.sentiment}
                                    </span>
                                </div>
                                <h4 className="text-xs font-bold text-white leading-tight line-clamp-2 group-hover:text-purple-300 transition-colors">{item.title}</h4>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-[9px] text-slate-600 font-mono tracking-tighter uppercase">{item.time}</span>
                                <div className="flex items-center gap-1 text-[9px] font-black text-purple-500 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                    INSIGHTS <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                </div>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

const Candlestick = (props: any) => {
    const { x, y, width, open, close, high, low, candleWidth } = props;
    if (x === undefined || y === undefined || isNaN(x) || isNaN(y)) return null;
    const isBullish = close >= open;
    const color = isBullish ? "#26a69a" : "#ef5350";
    const bodyHeight = Math.abs(close - open);
    const bodyY = Math.min(open, close);
    const wickX = x + width / 2;
    return (
        <g>
            <line x1={wickX} y1={low} x2={wickX} y2={high} stroke={color} strokeWidth={1} />
            <rect x={x + (width - candleWidth) / 2} y={bodyY} width={candleWidth} height={Math.max(bodyHeight, 1)} fill={color} />
        </g>
    );
};

const PriceActionChart = ({ data }: { data: PriceActionData }) => {
  const chartData = useMemo(() => {
    if (!data || !data.candles || data.candles.length < 5) return [];
    return data.candles.map((c, i) => ({
      ...c,
      index: i,
    }));
  }, [data]);

  const yDomain = useMemo(() => {
    if (!chartData.length) return [0, 100];
    const allPrices = chartData.flatMap(c => [c.high, c.low]);
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const pad = (max - min) * 0.2 || 1;
    return [min - pad, max + pad];
  }, [chartData]);

  if (!chartData.length) {
    return (
      <div className="p-10 text-center bg-[#0b0e14] border border-slate-800 rounded-xl">
        <div className="text-amber-500 mb-2">⚠️ Structural Data Mismatch</div>
        <p className="text-slate-500 text-xs font-mono leading-relaxed">
          The AI analysis for this asset returned an incomplete price action model. <br/>
          This happens when liquidity history is fragmented. Please try a major index or high-cap stock.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#131722] border border-slate-800 rounded-xl p-6 relative overflow-hidden group shadow-2xl flex flex-col gap-0">
      {/* TradingView-Style Legend Overlay */}
      <div className="absolute top-6 left-6 z-20 space-y-2 select-none pointer-events-none">
        <h2 className="text-xl font-black text-slate-100 border-b border-white/10 pb-2 mb-4 tracking-tight flex items-center gap-2">
            <div className="w-1 h-5 bg-cyan-500"></div>
            Advanced Price Action Analysis
        </h2>
        <div className="flex flex-col gap-2 bg-black/20 p-3 rounded-lg backdrop-blur-sm border border-white/5">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#ef5350] rounded-sm"></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">BOS / CHoCH</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#ffca28] opacity-40 rounded-sm"></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Liquidity Sweep</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#66bb6a] opacity-40 rounded-sm"></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Order Block (OB)</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-slate-500 rounded-sm"></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Structural Pivot</span>
            </div>
        </div>
      </div>

      <div className="h-[500px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 80, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" vertical={false} opacity={0.2} />
            <XAxis dataKey="time" hide />
            <YAxis orientation="right" domain={yDomain} stroke="#475569" tick={{fontSize: 10, fontFamily: 'monospace'}} axisLine={false} tickLine={false} tickFormatter={(v) => v.toFixed(2)} />
            
            {/* Liquidity Sweep Zones */}
            {data.liquiditySweeps?.map((ls, i) => (
                <ReferenceArea key={`ls-${i}`} x1={chartData[ls.startIdx]?.time} x2={chartData[ls.endIdx]?.time} y1={ls.bottom} y2={ls.top} fill="#ffca28" fillOpacity={0.15} label={{ value: ls.label, position: 'center', fill: '#ffca28', fontSize: 10, fontWeight: 'black', fontFamily: 'monospace' }} />
            ))}

            {/* Order Block Zones */}
            {data.orderBlocks?.map((ob, i) => (
                <ReferenceArea key={`ob-${i}`} x1={chartData[ob.startIdx]?.time} x2={chartData[ob.endIdx]?.time} y1={ob.bottom} y2={ob.top} fill="#66bb6a" fillOpacity={0.2} label={{ value: ob.label, position: 'insideBottomRight', fill: '#fff', fontSize: 9, fontWeight: 'bold', offset: 5, fontFamily: 'monospace' }} />
            ))}

            {/* Price Targets */}
            {data.targets?.map((target, i) => (
                <ReferenceLine key={`t-${i}`} y={target.price} stroke="#475569" strokeDasharray="5 5" label={{ value: `${target.label}`, position: 'right', fill: '#94a3b8', fontSize: 10, fontWeight: 'black', fontFamily: 'monospace' }} />
            ))}

            {/* HH/HL/LH/LL Structural Labels */}
            {chartData.map((c, i) => {
                if (!c.label) return null;
                const isHigh = c.label.startsWith('H');
                const isBOS = c.label === 'BOS' || c.label === 'CHoCH';
                const color = isBOS ? '#ef5350' : (isHigh ? '#ffffff' : '#94a3b8');
                return (
                    <ReferenceArea key={`lbl-${i}`} x1={c.time} x2={c.time} y1={isHigh ? c.high : c.low} y2={isHigh ? c.high : c.low} label={{ position: isHigh ? 'top' : 'bottom', value: c.label, fill: color, fontSize: 11, fontWeight: 'black', fontFamily: 'monospace' }} />
                );
            })}

            {/* Horizontal BOS Lines */}
            {chartData.map((c, i) => {
                if ((c.label === 'BOS' || c.label === 'CHoCH') && c.breakLinePrice) {
                    return (
                        <ReferenceLine key={`bos-${i}`} y={c.breakLinePrice} stroke="#334155" strokeDasharray="3 3" label={{ value: c.label, position: 'center', fill: '#ef5350', fontSize: 9, fontWeight: 'black' }} />
                    );
                }
                return null;
            })}

            {/* Candlesticks & Momentum Arrows */}
            <Bar dataKey="close" shape={(props: any) => {
                const candle = chartData[props.index];
                if (!candle) return null;
                const momentum = data.momentum?.find(m => props.index >= m.startIdx && props.index <= m.endIdx);
                const candleVisual = <Candlestick {...props} open={props.y + props.height * (1 - (candle.open - yDomain[0]) / (yDomain[1] - yDomain[0]))} close={props.y} high={props.y - (candle.high - candle.close) * (props.height / (candle.close - candle.open || 0.001))} low={props.y + (candle.close - candle.low) * (props.height / (candle.close - candle.open || 0.001))} candleWidth={8} />;
                
                if (momentum && props.index === momentum.endIdx) {
                    return ( 
                        <g> 
                            {candleVisual} 
                            <path d={`M ${props.x} ${props.y + 40} Q ${props.x + 20} ${props.y} ${props.x + 40} ${props.y - 40} L ${props.x + 30} ${props.y - 40} M ${props.x + 40} ${props.y - 40} L ${props.x + 40} ${props.y - 30}`} stroke="#94a3b8" strokeWidth={2} fill="none" markerEnd="url(#arrowhead)" /> 
                            <text x={props.x + 10} y={props.y + 60} fill="#94a3b8" fontSize={9} fontWeight="bold" className="italic font-mono">{momentum.label}</text> 
                        </g> 
                    );
                }
                return candleVisual;
            }} />
            <defs> <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto"> <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" /> </marker> </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Volume Overlay Pane */}
      <div className="h-[120px] w-full border-t border-slate-800 bg-[#0b0e14]/50 relative">
        <div className="absolute top-2 left-6 z-10 flex items-center gap-2"> <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Transaction Intensity</span> </div>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 30, right: 80, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" vertical={false} opacity={0.1} />
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <Bar dataKey="volume"> {chartData.map((entry, index) => ( <Cell key={`vol-${index}`} fill={entry.close >= entry.open ? "#26a69a40" : "#ef535040"} /> ))} </Bar>
            </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const TechnicalAnalysisDashboard = ({ data }: { data: TechnicalAnalysisData }) => {
    const yDomain = useMemo(() => {
        if (!data.priceHistory?.length) return [0, 100];
        const prices = data.priceHistory.map(p => p.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const pad = (max - min) * 0.25 || 1;
        return [min - pad, max + pad];
    }, [data]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Summary Banner */}
            <div className="bg-slate-900/40 p-5 rounded-xl border border-white/5 flex items-start gap-4">
                <div className="w-10 h-10 rounded bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 shrink-0 mt-1 shadow-lg shadow-cyan-900/10">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <p className="text-sm text-slate-300 italic leading-relaxed">"{data.summary}"</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#1c202b] p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-500 uppercase font-black block mb-1 tracking-widest">Market Trend</span>
                    <div className={`text-lg font-bold uppercase tracking-tighter ${data.trend === 'Bullish' ? 'text-emerald-400' : 'text-rose-400'}`}>{data.trend}</div>
                </div>
                <div className="bg-[#1c202b] p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-500 uppercase font-black block mb-1 tracking-widest">S/R Integrity</span>
                    <div className="text-lg font-bold text-white uppercase tracking-tighter">{data.signalStrength}</div>
                </div>
                <div className="bg-[#1c202b] p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-500 uppercase font-black block mb-1 tracking-widest">RSI ({data.indicators?.rsiVal || '?'})</span>
                    <div className={`text-lg font-bold uppercase tracking-tighter ${Number(data.indicators?.rsiVal) > 70 ? 'text-rose-400' : Number(data.indicators?.rsiVal) < 30 ? 'text-emerald-400' : 'text-cyan-400'}`}>
                        {Number(data.indicators?.rsiVal) > 70 ? 'Hot' : Number(data.indicators?.rsiVal) < 30 ? 'Cold' : 'Stable'}
                    </div>
                </div>
                <div className="bg-[#1c202b] p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-500 uppercase font-black block mb-1 tracking-widest">Active Status</span>
                    <div className="text-lg font-bold text-amber-400 font-mono tracking-tighter uppercase">Calculated</div>
                </div>
            </div>

            <div className="bg-[#131722] border border-slate-800 rounded-xl p-6 relative overflow-hidden group shadow-2xl">
                <div className="h-[400px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data.priceHistory} margin={{ top: 20, right: 60, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" vertical={false} opacity={0.3} />
                            <XAxis dataKey="time" hide />
                            <YAxis orientation="right" domain={yDomain} stroke="#334155" tick={{fontSize: 9, fontFamily: 'monospace'}} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1c202b', border: '1px solid #334155', borderRadius: '8px' }} />
                            
                            {data.supportResistance?.support?.map((lvl, i) => (
                                <ReferenceLine key={`sup-${i}`} y={lvl} stroke="#10b981" strokeDasharray="3 3" strokeWidth={1} label={{ value: `SUPPORT`, position: 'insideTopLeft', fill: '#10b981', fontSize: 8, fontWeight: 'black', fontFamily: 'monospace' }} />
                            ))}
                            {data.supportResistance?.resistance?.map((lvl, i) => (
                                <ReferenceLine key={`res-${i}`} y={lvl} stroke="#f43f5e" strokeDasharray="3 3" strokeWidth={1} label={{ value: `RESISTANCE`, position: 'insideBottomLeft', fill: '#f43f5e', fontSize: 8, fontWeight: 'black', fontFamily: 'monospace' }} />
                            ))}

                            <Area type="monotone" dataKey="price" stroke="#a855f7" strokeWidth={2} fill="url(#colorPrice)" fillOpacity={1} />
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                <div className="h-[100px] w-full border-t border-slate-800 bg-[#0b0e14]/50 relative mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.priceHistory} margin={{ top: 10, right: 60, left: 0, bottom: 5 }}>
                            <Bar dataKey="volume">
                                {data.priceHistory?.map((entry, index) => (
                                    <Cell key={`v-${index}`} fill={entry.volume > 5000 ? "#6366f160" : "#33415560"} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1c202b] p-5 rounded-xl border border-white/5">
                    <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">Oscillator Engine</h4>
                    <div className="space-y-4">
                        <div>
                            <div className="text-xs font-bold text-white mb-1">RSI Insight</div>
                            <p className="text-[11px] text-slate-400 italic leading-relaxed">{data.indicators?.rsi}</p>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white mb-1">MACD Momentum</div>
                            <p className="text-[11px] text-slate-400 italic leading-relaxed">{data.indicators?.macd}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#1c202b] p-5 rounded-xl border border-white/5">
                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">Volatility & Range</h4>
                    <div className="space-y-4">
                        <div>
                            <div className="text-xs font-bold text-white mb-1">Bollinger Compression</div>
                            <p className="text-[11px] text-slate-400 italic leading-relaxed">{data.indicators?.bollingerBands}</p>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white mb-1">Trend Envelopes</div>
                            <p className="text-[11px] text-slate-400 italic leading-relaxed">{data.indicators?.movingAverages}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, isLoading, activeTab }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-slate-400 bg-[#0b0e14] rounded-xl border border-slate-800 shadow-inner">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
        <p className="font-bold uppercase tracking-[0.3em] text-[9px] font-mono animate-pulse">Synchronizing Market Geometry...</p>
      </div>
    );
  }

  if (!result) return <div className="h-96 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl uppercase text-[10px] font-black tracking-widest opacity-40 italic">Initialize deep-cycle analysis.</div>;

  return (
    <div className="bg-[#131B2E] rounded-lg border border-white/5 p-6 shadow-xl min-h-[400px] fade-in overflow-hidden">
      <div className="flex justify-between items-center mb-6 bg-[#1c202b] -mx-6 -mt-6 px-6 py-3 border-b border-slate-700 select-none">
        <div className="flex items-center gap-4">
            <div className="bg-purple-600 text-white px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-purple-900/40">{result.ticker}</div>
            <div className="flex gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span className="text-cyan-400 font-black">{activeTab}</span>
                <span className="text-slate-700">|</span>
                <span className="hover:text-slate-300 cursor-pointer transition-colors">v2.5.4</span>
            </div>
        </div>
      </div>

      {activeTab === AnalysisType.News && result.newsItems && (
          <NewsDashboard items={result.newsItems} summary={result.content} />
      )}

      {activeTab === AnalysisType.PriceAction && result.priceAction && (
        <div className="animate-fade-in">
          <PriceActionChart data={result.priceAction} />
        </div>
      )}

      {activeTab === AnalysisType.Technical && result.technicalAnalysis && (
          <TechnicalAnalysisDashboard data={result.technicalAnalysis} />
      )}

      {activeTab !== AnalysisType.PriceAction && activeTab !== AnalysisType.Technical && activeTab !== AnalysisType.News && (
          <div className="p-4 text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap bg-black/20 rounded-lg border border-white/5">
              {result.content}
          </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
