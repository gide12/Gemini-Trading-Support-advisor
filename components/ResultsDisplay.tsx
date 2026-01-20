
import React, { useEffect, useState, useMemo } from "react";
import { AnalysisResult, AnalysisType } from "../types";
import ReactMarkdown from 'react-markdown';
import { 
    ComposedChart, ReferenceLine, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, Cell, Line, CartesianGrid, Label, Legend, ReferenceArea, Scatter
} from "recharts";

interface ResultsDisplayProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  activeTab: AnalysisType;
}

// Custom Tooltip component for the Technical Chart
const TechnicalTooltip = ({ active, payload, label, result }: any) => {
  if (active && payload && payload.length) {
    const priceData = payload.find((p: any) => p.name === result?.ticker);
    const price = priceData ? priceData.value[1] : (payload[0]?.value?.[1] || payload[0]?.value);
    const technical = result?.technicalAnalysis;
    let zoneLabel = "";
    
    if (technical && typeof price === 'number') {
        const isResistance = technical.supportResistance.resistance.some((r: number) => Math.abs(price - r) / r < 0.015);
        const isSupport = technical.supportResistance.support.some((s: number) => Math.abs(price - s) / s < 0.015);
        if (isResistance) zoneLabel = "SUPPLY / RESISTANCE CLUSTER";
        if (isSupport) zoneLabel = "DEMAND / SUPPORT CLUSTER";
    }

    return (
      <div className="bg-[#0f172a] border border-slate-700 p-3 rounded-lg shadow-2xl backdrop-blur-md z-50">
        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
            <p className="text-sm font-mono font-bold text-white">${typeof price === 'number' ? price.toFixed(2) : price}</p>
        </div>
        {zoneLabel && (
            <p className={`text-[9px] font-black mt-2 p-1 rounded text-center border ${zoneLabel.includes('SUPPLY') ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                {zoneLabel}
            </p>
        )}
        {payload.filter((p: any) => p.name !== result?.ticker && p.name !== 'wick' && !p.name?.includes('AI Trigger')).map((p: any, i: number) => (
             <p key={i} className="text-[9px] text-slate-400 mt-1 uppercase italic">{p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

const generateMockComparisonData = (baseData: any[], comparisonTicker: string) => {
    if (!comparisonTicker || comparisonTicker === 'None') return baseData;
    const startPrice = baseData[0]?.open || 100;
    let currentCompPrice = startPrice;
    const vol = comparisonTicker === 'SPY' ? 0.008 : comparisonTicker === 'QQQ' ? 0.012 : 0.02;
    const bias = comparisonTicker === 'SPY' ? 0.0002 : comparisonTicker === 'QQQ' ? 0.0004 : 0;
    return baseData.map((d, i) => {
        if (i > 0) {
            const move = (Math.random() - 0.48 + bias) * (currentCompPrice * vol);
            currentCompPrice += move;
        }
        return { ...d, comparisonPrice: currentCompPrice, comparisonTicker: comparisonTicker };
    });
};

const generateMockHistoricalData = (currentPrice: number, trend: string) => {
    const data = [];
    let price = currentPrice || 100;
    const days = 40;
    const volatility = price * 0.02;
    const trendFactor = trend === 'Bullish' ? -0.003 : trend === 'Bearish' ? 0.003 : 0;
    const maBase = trend === 'Bullish' ? price * 0.85 : trend === 'Bearish' ? price * 1.15 : price;
    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - i));
        const dateStr = date.toISOString().split('T')[0].slice(5);
        if (i < days - 1) {
             const randomMove = (Math.random() - 0.5) * volatility;
             price = price + (price * trendFactor) + randomMove;
        } else { price = currentPrice || 100; }
        const open = price * (1 + (Math.random() - 0.5) * 0.015);
        const close = price;
        const high = Math.max(open, close) * (1 + Math.random() * 0.01);
        const low = Math.min(open, close) * (1 - Math.random() * 0.01);
        const ma200 = maBase + (i * (((currentPrice || 100) * 0.95 - maBase) / days));
        const isUp = close >= open;
        const color = isUp ? '#089981' : '#F23645';
        data.push({ date: dateStr, open, high, low, close, ma200, body: [Math.min(open, close), Math.max(open, close)], wick: [low, high], color, isHistorical: true, index: i });
    }
    return data;
};

const generatePredictionPath = (startPrice: number, targetPrice: number, stopPrice: number, type: string) => {
    const path = [];
    const steps = 10;
    const safeStart = startPrice || 100;
    const safeTarget = targetPrice || (safeStart * 1.1);
    for (let i = 1; i <= steps; i++) {
        const progress = i / steps;
        let price = type === 'Bounce' ? safeStart + (safeTarget - safeStart) * Math.sin(progress * Math.PI / 2) : safeStart + (safeTarget - safeStart) * progress;
        path.push({ date: `P+${i}d`, close: price, predictionPrice: price, isHistorical: false, index: 40 + i });
    }
    return path;
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, isLoading, activeTab }) => {
  const [timestamp, setTimestamp] = useState(new Date());
  const [decisionMode, setDecisionMode] = useState<'Trader' | 'Investor'>('Trader');
  const [comparisonTicker, setComparisonTicker] = useState<string>('None');

  useEffect(() => {
    const timer = setInterval(() => setTimestamp(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const rawChartData = useMemo(() => {
    if (!result) return [];
    if (result.type === AnalysisType.Technical && result.technicalAnalysis) {
        return generateMockHistoricalData(result.technicalAnalysis.currentPrice, result.sentiment || "Neutral");
    }
    if (result.type === AnalysisType.OptionsExpert && result.optionsAnalysis) {
        const target = result.optionsAnalysis.prediction?.target || 100;
        const stop = result.optionsAnalysis.prediction?.stop || 90;
        const type = result.optionsAnalysis.prediction?.type || "Breakout";
        const historical = generateMockHistoricalData(target * 0.9, result.sentiment || "Neutral");
        const lastClose = historical[historical.length - 1]?.close || target * 0.9;
        const prediction = generatePredictionPath(lastClose, target, stop, type);
        return [...historical, ...prediction];
    }
    return [];
  }, [result]);

  const chartData = useMemo(() => {
      if (activeTab === AnalysisType.Technical && comparisonTicker !== 'None') {
          return generateMockComparisonData(rawChartData, comparisonTicker);
      }
      return rawChartData;
  }, [rawChartData, comparisonTicker, activeTab]);

  const breakoutMarkers = useMemo(() => {
    if (!result?.technicalAnalysis?.breakoutPoints || chartData.length === 0) return [];
    return result.technicalAnalysis.breakoutPoints.map(pt => {
        // AI provides 0-39 index, we map to date strings
        const targetIndex = Math.max(0, Math.min(pt.dateIndex, chartData.length - 1));
        return {
            ...pt,
            date: chartData[targetIndex]?.date || "Unknown",
            price: pt.price
        };
    }).filter(m => m.date !== "Unknown");
  }, [result, chartData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400 animate-pulse">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
        <p>Gathering market data and processing analysis...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-20 h-20 mb-4 opacity-50 text-purple-500/50"><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"/></svg>
        <h3 className="text-xl font-semibold text-slate-300 mb-2">Market {activeTab}</h3>
        <p className="max-w-md text-center text-sm">Enter a stock ticker above to generate real-time insights using Gemini 2.5 Flash.</p>
      </div>
    );
  }

  const isYahoo = activeTab === AnalysisType.YahooFinance;
  const isTechnical = activeTab === AnalysisType.Technical;
  const isOptionsExpert = activeTab === AnalysisType.OptionsExpert;
  const isTotalView = activeTab === AnalysisType.TotalView;
  const isFundamental = activeTab === AnalysisType.Fundamental;
  const isClustering = activeTab === AnalysisType.Clustering;
  const isBrokerIntel = activeTab === AnalysisType.BrokerIntel;

  return (
    <div className="bg-[#131B2E] rounded-lg border border-purple-500/30 p-6 shadow-xl min-h-[400px]">
      <div className="flex justify-between items-start mb-6 border-b border-purple-500/20 pb-4">
        <div>
            <h2 className="text-2xl font-bold text-white mb-1">
            {result.ticker} <span className="text-slate-500 text-lg font-normal">| {activeTab}</span>
            </h2>
            <p className="text-xs text-slate-400">AI Generated Content • Not Financial Advice</p>
        </div>
        {result.sentiment && (
            <div className={`px-4 py-1 rounded-full text-sm font-bold border ${result.sentiment === 'Bullish' ? 'bg-green-900/30 border-green-500 text-green-400' : result.sentiment === 'Bearish' ? 'bg-red-900/30 border-red-500 text-red-400' : 'bg-yellow-900/30 border-yellow-500 text-yellow-400'}`}>
                {result.sentiment.toUpperCase()}
            </div>
        )}
      </div>

      {/* BROKER INTELLIGENCE VIEW */}
      {isBrokerIntel && result.brokerIntel && (
          <div className="animate-fade-in space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-800/40 p-6 rounded-xl border border-purple-500/20 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Market Execution Context</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-white/5 pb-2"><span className="text-sm text-slate-400">Broker Activity</span><span className="text-sm font-bold text-white">{result.brokerIntel.activity}</span></div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-2"><span className="text-sm text-slate-400">Consistency</span><span className="text-sm font-bold text-white">{result.brokerIntel.consistencyDays} Days</span></div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-2"><span className="text-sm text-slate-400">Dominant Side</span><span className={`text-sm font-bold ${result.brokerIntel.dominantSide === 'Net Buy' ? 'text-green-400' : 'text-red-400'}`}>{result.brokerIntel.dominantSide}</span></div>
                            <div className="flex justify-between items-center"><span className="text-sm text-slate-400">Market Reaction</span><span className="text-sm font-bold text-purple-400">{result.brokerIntel.marketReaction}</span></div>
                        </div>
                      </div>
                      <div className="mt-6 pt-6 border-t border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Decision Panel</h5>
                            <div className="flex bg-slate-900 rounded-md p-1 border border-slate-700">
                                <button onClick={() => setDecisionMode('Trader')} className={`px-3 py-1 text-[9px] font-bold uppercase rounded transition-all ${decisionMode === 'Trader' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Trader</button>
                                <button onClick={() => setDecisionMode('Investor')} className={`px-3 py-1 text-[9px] font-bold uppercase rounded transition-all ${decisionMode === 'Investor' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Investor</button>
                            </div>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-purple-500/10 shadow-inner">
                            <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Action Bias: {decisionMode} Mode</div>
                            <div className="text-sm font-bold text-white italic leading-relaxed">{decisionMode === 'Trader' ? result.brokerIntel.traderBias : result.brokerIntel.investorBias}</div>
                        </div>
                      </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-6 rounded-xl border border-emerald-500/30 shadow-lg relative overflow-hidden flex flex-col justify-between">
                      <div className="relative z-10">
                          <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Quant Recommendation</h4>
                          <div className="flex items-center gap-3 mb-4">
                              <div className={`text-2xl`}>{result.brokerIntel.recommendation.color.includes('green') ? '🟢' : result.brokerIntel.recommendation.color.includes('red') ? '🔴' : '🟡'}</div>
                              <span className="text-3xl font-black text-white tracking-tight">{result.brokerIntel.recommendation.action}</span>
                          </div>
                          <div className="text-sm text-slate-400 mb-6">Risk Profile: <span className="text-white font-bold">{result.brokerIntel.recommendation.risk}</span></div>
                      </div>
                      <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-2"><span className="text-xs text-slate-500 uppercase font-black">Confidence Rating</span><div className="flex text-yellow-500 text-xl tracking-tighter">{Array.from({length: 5}).map((_, i) => (<span key={i}>{i < (result.brokerIntel?.confidence || 0) ? '★' : '☆'}</span>))}</div></div>
                          <p className="text-[10px] text-slate-500 leading-tight">Calculated based on volatility persistence and order flow transparency.</p>
                      </div>
                  </div>
              </div>
              <div className="bg-[#0f172a] rounded-xl border border-slate-700/50 overflow-hidden shadow-2xl">
                  <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/30 flex justify-between items-center"><div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div><h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Advanced Flow X-Ray</h4></div><span className="text-[10px] text-slate-500 font-mono tracking-tighter">ALGO_MODE_ACTIVE</span></div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <thead><tr className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-800 bg-slate-900/40"><th className="px-6 py-4">Broker Class</th><th className="px-6 py-4">Net Position</th><th className="px-6 py-4">Consistency (Streak)</th><th className="px-6 py-4">Price Impact</th></tr></thead>
                          <tbody className="text-sm font-mono">{(result.brokerIntel.advancedTable || []).map((row, idx) => (<tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors"><td className="px-6 py-4 text-slate-200 font-bold">{row.type}</td><td className={`px-6 py-4 font-black ${row.netBuy.startsWith('+') ? 'text-green-400' : row.netBuy.startsWith('-') ? 'text-red-400' : 'text-slate-400'}`}>{row.netBuy}</td><td className="px-6 py-4 text-slate-300">{row.days}D</td><td className={`px-6 py-4 font-bold ${row.impact === 'Positive' ? 'text-cyan-400' : row.impact === 'Negative' ? 'text-rose-400' : row.impact === 'Noise' ? 'text-slate-600' : 'text-slate-400'}`}>{row.impact.toUpperCase()}</td></tr>))}</tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}

      {/* TECHNICAL ANALYSIS VIEW - HIGHLY VISUALIZED */}
      {isTechnical && result.technicalAnalysis && (
          <div className="animate-fade-in space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-purple-500/10"><div className="text-[10px] text-slate-500 uppercase font-black mb-1">RSI Status</div><div className="text-sm font-bold text-white">{result.technicalAnalysis.indicators.rsi}</div></div>
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-purple-500/10"><div className="text-[10px] text-slate-500 uppercase font-black mb-1">MACD Sentiment</div><div className="text-sm font-bold text-white">{result.technicalAnalysis.indicators.macd}</div></div>
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-purple-500/10"><div className="text-[10px] text-slate-500 uppercase font-black mb-1">MAs Layout</div><div className="text-sm font-bold text-white">{result.technicalAnalysis.indicators.movingAverages}</div></div>
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-purple-500/10"><div className="text-[10px] text-slate-500 uppercase font-black mb-1">Bands Profile</div><div className="text-sm font-bold text-white">{result.technicalAnalysis.indicators.bollingerBands}</div></div>
              </div>

              <div className="bg-[#131722] rounded-xl border border-purple-500/30 p-6 h-[580px] relative overflow-hidden group">
                  <div className="absolute top-4 left-6 z-10 flex justify-between items-start w-full pr-12">
                      <div><h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>Quant Price Action Visualizer</h4><p className="text-[10px] text-slate-600 font-mono mt-1 uppercase">Advanced S/R Zones & AI Event Triggers</p></div>
                      <div className="bg-[#0f172a] rounded-lg p-1 border border-slate-700 flex items-center gap-2 shadow-2xl"><span className="text-[9px] font-black text-slate-500 uppercase px-2">Compare To:</span><div className="flex gap-1">{['None', 'SPY', 'QQQ', 'BTC'].map(sym => (<button key={sym} onClick={() => setComparisonTicker(sym)} className={`px-3 py-1 text-[10px] font-bold rounded uppercase transition-all ${comparisonTicker === sym ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{sym}</button>))}</div></div>
                  </div>

                  <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ top: 80, right: 10, left: 10, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" vertical={false} opacity={0.3} />
                          <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 9}} minTickGap={30} />
                          <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{fontSize: 9}} tickFormatter={(val) => `$${val}`} orientation="right" />
                          <Tooltip content={<TechnicalTooltip result={result} />} />
                          
                          {/* Liquidity Zones - Demand (Support) */}
                          {result.technicalAnalysis.supportResistance?.support?.map((level, i) => (
                              <ReferenceArea 
                                key={`sup-zone-${i}`} 
                                y1={level * 0.985} 
                                y2={level * 1.015} 
                                fill="#10b981" 
                                fillOpacity={0.08} 
                                stroke="none" 
                              />
                          ))}

                          {/* Liquidity Zones - Supply (Resistance) */}
                          {result.technicalAnalysis.supportResistance?.resistance?.map((level, i) => (
                              <ReferenceArea 
                                key={`res-zone-${i}`} 
                                y1={level * 0.985} 
                                y2={level * 1.015} 
                                fill="#f43f5e" 
                                fillOpacity={0.08} 
                                stroke="none" 
                              />
                          ))}

                          {/* Price Action - Candlesticks */}
                          <Bar name={result.ticker} dataKey="body" barSize={8} isAnimationActive={false}>
                            {chartData.map((entry, index) => (<Cell key={`body-${index}`} fill={entry.color} />))}
                          </Bar>
                          <Bar name="wick" dataKey="wick" barSize={1} isAnimationActive={false} legendType="none">
                            {chartData.map((entry, index) => (<Cell key={`wick-${index}`} fill={entry.color} />))}
                          </Bar>

                          {/* Technical Overlays */}
                          <Line name="MA 200" type="monotone" dataKey="ma200" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="5 5" dot={false} opacity={0.6} />
                          {comparisonTicker !== 'None' && (<Line name={`${comparisonTicker} (Rel)`} type="monotone" dataKey="comparisonPrice" stroke="#f59e0b" strokeWidth={2.5} dot={false} animationDuration={1000} strokeDasharray="2 2" />)}

                          {/* Primary S/R Reference Lines */}
                          {result.technicalAnalysis.supportResistance?.resistance?.map((level, i) => (<ReferenceLine key={`res-line-${i}`} y={level} stroke="#f43f5e" strokeDasharray="3 3" strokeWidth={1}><Label value={`SUPPLY $${level}`} position="insideRight" fill="#f43f5e" fontSize={8} fontWeight="black" offset={10}/></ReferenceLine>))}
                          {result.technicalAnalysis.supportResistance?.support?.map((level, i) => (<ReferenceLine key={`sup-line-${i}`} y={level} stroke="#10b981" strokeDasharray="3 3" strokeWidth={1}><Label value={`DEMAND $${level}`} position="insideRight" fill="#10b981" fontSize={8} fontWeight="black" offset={10}/></ReferenceLine>))}

                          {/* AI Event Markers - Breakout vs Breakdown Differentiation */}
                          <Scatter name="AI Trade Event" data={breakoutMarkers} isAnimationActive={true} shape={(props: any) => {
                               const { cx, cy, payload } = props;
                               if (!cx || !cy) return null;
                               const isBreakout = payload.type === 'Breakout';
                               const color = isBreakout ? '#22d3ee' : '#f59e0b';
                               const glowId = `glow-${payload.type}-${Math.random()}`;
                               return (
                                   <g>
                                       <defs>
                                           <radialGradient id={glowId} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                               <stop offset="0%" stopColor={color} stopOpacity="0.8" />
                                               <stop offset="100%" stopColor={color} stopOpacity="0" />
                                           </radialGradient>
                                       </defs>
                                       <circle cx={cx} cy={cy} r={14} fill={`url(#${glowId})`} className="animate-pulse" />
                                       {isBreakout ? (
                                           <path d={`M ${cx} ${cy-10} L ${cx+8} ${cy} L ${cx-8} ${cy} Z`} fill={color} stroke="#fff" strokeWidth={1} />
                                       ) : (
                                           <path d={`M ${cx} ${cy+10} L ${cx+8} ${cy} L ${cx-8} ${cy} Z`} fill={color} stroke="#fff" strokeWidth={1} />
                                       )}
                                       <text x={cx + 12} y={cy + 4} fill={color} fontSize="9" fontWeight="black" className="uppercase tracking-tighter shadow-sm">{payload.label}</text>
                                   </g>
                               );
                          }} />

                          {breakoutMarkers.map((pt, i) => (
                              <ReferenceLine key={`break-h-line-${i}`} y={pt.price} stroke={pt.type === 'Breakout' ? '#22d3ee' : '#f59e0b'} strokeWidth={1} opacity={0.2} strokeDasharray="4 4" />
                          ))}

                          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                      </ComposedChart>
                  </ResponsiveContainer>

                  <div className="absolute bottom-4 left-6 flex gap-4">
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500/20 border border-emerald-500"></div><span className="text-[8px] text-slate-500 uppercase font-black">Demand Zone</span></div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500/20 border border-rose-500"></div><span className="text-[8px] text-slate-500 uppercase font-black">Supply Zone</span></div>
                  </div>
              </div>

              <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-6 shadow-2xl">
                  <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                     Quant Tactical Narrative
                  </h3>
                  <p className="text-slate-300 leading-relaxed text-sm italic">"{result.technicalAnalysis.summary}"</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                      <div className="bg-slate-800/40 px-4 py-2 rounded-lg border border-white/5"><span className="text-[9px] text-slate-500 uppercase block font-bold mb-0.5">Primary Trend</span><span className={`text-xs font-bold ${result.technicalAnalysis.trend === 'Bullish' ? 'text-green-400' : result.technicalAnalysis.trend === 'Bearish' ? 'text-red-400' : 'text-slate-400'}`}>{result.technicalAnalysis.trend}</span></div>
                      <div className="bg-slate-800/40 px-4 py-2 rounded-lg border border-white/5"><span className="text-[9px] text-slate-500 uppercase block font-bold mb-0.5">Signal Clarity</span><span className="text-xs font-bold text-white">{result.technicalAnalysis.signalStrength}</span></div>
                      <div className="bg-slate-800/40 px-4 py-2 rounded-lg border border-white/5"><span className="text-[9px] text-slate-500 uppercase block font-bold mb-0.5">Log Return</span><span className="text-xs font-mono font-bold text-cyan-400">{result.technicalAnalysis.dailyLogReturn?.toFixed(4)}</span></div>
                  </div>
              </div>
          </div>
      )}

      {/* Yahoo Finance View */}
      {isYahoo && result.financials && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {Object.entries(result.financials).map(([key, value]) => (<div key={key} className="bg-slate-800/50 p-4 rounded border border-purple-500/20 hover:border-purple-500/50 transition-colors"><div className="text-slate-400 text-xs uppercase mb-1">{key}</div><div className="text-white font-mono font-medium">{value}</div></div>))}
          </div>
      )}
      
      {/* NASDAQ TOTALVIEW */}
      {isTotalView && result.totalViewData && (
          <div className="animate-fade-in space-y-6">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/20">
                  <div className="flex justify-between items-center mb-2"><div className="flex flex-col"><span className="text-sm font-bold text-slate-400 uppercase">Net Order Imbalance</span><span className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>Updated: {timestamp.toLocaleTimeString()}</span></div><span className="text-sm font-bold" style={{ color: result.totalViewData.imbalance?.side === 'Buy' ? '#089981' : '#F23645' }}>{result.totalViewData.imbalance?.side || "Neutral"} Side ({result.totalViewData.imbalance?.shares?.toLocaleString() || 0} sh)</span></div>
                  <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden flex"><div className="h-full transition-all" style={{ width: result.totalViewData.imbalance?.side === 'Buy' ? '70%' : '30%', backgroundColor: '#089981' }} /><div className="h-full transition-all" style={{ width: result.totalViewData.imbalance?.side === 'Sell' ? '70%' : '30%', backgroundColor: '#F23645' }} /></div>
              </div>
          </div>
      )}

      {/* Grounding Sources */}
      {result.sources && result.sources.length > 0 && (
        <div className="mt-8 pt-4 border-t border-purple-500/20">
            <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">References & Grounding Sources</h4>
            <ul className="space-y-2">{result.sources.map((source, idx) => (<li key={idx}><a href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 transition-colors hover:underline"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3" ><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg><span className="truncate max-w-md">{source.title}</span></a></li>))}</ul>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
