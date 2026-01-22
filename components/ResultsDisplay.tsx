
import React, { useEffect, useState, useMemo } from "react";
import { AnalysisResult, AnalysisType, BrokerIntelData } from "../types";
import { 
    ComposedChart, ReferenceLine, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, Cell, Line, CartesianGrid, Label, Legend, ReferenceArea, Scatter
} from "recharts";

interface ResultsDisplayProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  activeTab: AnalysisType;
}

/**
 * Robust Candlestick Shape for Recharts
 * Correctly maps price values to pixel coordinates within the bar's bounding box.
 */
const CandlestickShape = (props: any) => {
  const { x, y, width, height, payload } = props;
  if (!payload || !x || !y) return null;

  const { open, close, high, low, color } = payload;
  
  // Recharts passes 'y' as the top of the bar (high) and 'height' as the vertical pixel span
  // Calculate vertical scaling factor: pixels per price unit
  const priceRange = high - low;
  const ratio = priceRange === 0 ? 0 : height / priceRange;
  
  const centerX = x + width / 2;
  
  // Calculate body Y (from top of bar) and body Height in pixels
  const bodyMax = Math.max(open, close);
  const bodyMin = Math.min(open, close);
  
  // bodyTop is offset from the 'y' (which is the high coordinate)
  const bodyTop = y + (high - bodyMax) * ratio;
  const bodyHeight = Math.max(Math.abs(open - close) * ratio, 2); // Ensure min 2px height
  
  return (
    <g>
      {/* WICK: High to Low */}
      <line
        x1={centerX}
        y1={y}
        x2={centerX}
        y2={y + height}
        stroke={color}
        strokeWidth={1.5}
      />
      {/* BODY: Open to Close */}
      <rect
        x={x}
        y={bodyTop}
        width={width}
        height={bodyHeight}
        fill={color}
        stroke={color}
        strokeWidth={0.5}
      />
    </g>
  );
};

const TechnicalTooltip = ({ active, payload, label, result }: any) => {
  if (active && payload && payload.length) {
    const mainData = payload.find((p: any) => p.dataKey === 'body' || p.name === result?.ticker);
    if (!mainData || !mainData.payload) return null;
    
    const { open, close, high, low } = mainData.payload;
    const technical = result?.technicalAnalysis;
    
    let zoneLabel = "";
    if (technical && typeof close === 'number') {
        const isResistance = technical.supportResistance.resistance.some((r: number) => Math.abs(close - r) / r < 0.015);
        const isSupport = technical.supportResistance.support.some((s: number) => Math.abs(close - s) / s < 0.015);
        if (isResistance) zoneLabel = "RESISTANCE ZONE";
        if (isSupport) zoneLabel = "SUPPORT ZONE";
    }

    return (
      <div className="bg-[#0f172a] border border-slate-700 p-3 rounded-lg shadow-2xl backdrop-blur-md z-50 min-w-[160px]">
        <p className="text-[10px] text-slate-500 font-bold uppercase mb-2 border-b border-slate-700 pb-1">{label}</p>
        <div className="space-y-1.5 mb-2">
            <div className="flex justify-between gap-4 font-mono">
                <span className="text-[9px] text-slate-500 uppercase">Open</span>
                <span className="text-[11px] text-white">${open?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4 font-mono">
                <span className="text-[9px] text-slate-500 uppercase">High</span>
                <span className="text-[11px] text-emerald-400 font-bold">${high?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4 font-mono">
                <span className="text-[9px] text-slate-500 uppercase">Low</span>
                <span className="text-[11px] text-rose-400 font-bold">${low?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4 font-mono">
                <span className="text-[9px] text-slate-500 uppercase">Close</span>
                <span className="text-[11px] text-white font-bold">${close?.toFixed(2)}</span>
            </div>
        </div>
        {zoneLabel && (
            <div className={`text-[8px] font-black mt-2 p-1.5 rounded text-center border animate-pulse ${zoneLabel.includes('RESISTANCE') ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                {zoneLabel}
            </div>
        )}
      </div>
    );
  }
  return null;
};

// Generate high-fidelity mock data for the technical visualizer
const generateMockTechnicalData = (currentPrice: number, trend: string) => {
    const data = [];
    let price = (currentPrice || 100) * (trend === 'Bullish' ? 0.95 : trend === 'Bearish' ? 1.05 : 1.0);
    const days = 45;
    
    const volatility = price * 0.015;
    const trendFactor = trend === 'Bullish' ? 0.004 : trend === 'Bearish' ? -0.004 : 0;
    
    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - i));
        const dateStr = date.toISOString().split('T')[0].slice(5);
        
        const open = price;
        const move = (Math.random() - 0.5 + trendFactor) * volatility;
        const close = i === days - 1 ? (currentPrice || 100) : (open + move);
        const high = Math.max(open, close) + (Math.random() * (volatility * 0.5));
        const low = Math.min(open, close) - (Math.random() * (volatility * 0.5));
        
        const ma200 = price * 1.02; // Static MA for visual context
        const color = close >= open ? '#10b981' : '#f43f5e';
        
        data.push({ 
            date: dateStr, 
            open, high, low, close, 
            ma200, 
            body: [low, high], // Bar range for Recharts
            color,
            index: i 
        });
        price = close;
    }
    return data;
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, isLoading, activeTab }) => {
  const [decisionMode, setDecisionMode] = useState<'Trader' | 'Investor'>('Trader');

  // Logic Engine from Ringkasan Nomor 2
  const engine = useMemo(() => {
    if (activeTab !== AnalysisType.BrokerIntel || !result?.brokerIntel) return null;
    
    const b = result.brokerIntel;
    const m = b.metrics;

    const broker_score = (m.brokerFlow.netBuyRatio * 0.4) + (m.brokerFlow.flowConsistency * 0.35) + (m.brokerFlow.participantQuality * 0.25);
    const price_score = (m.priceAction.structureStrength * 0.4) + (m.priceAction.volatilityControl * 0.3) + (m.priceAction.reactionQuality * 0.3);
    const context_score = (m.context.trendAlignment * 0.6) + (m.context.liquidityPresence * 0.4);

    const weights = decisionMode === 'Trader' 
        ? { broker: 0.35, price: 0.45, context: 0.20 }
        : { broker: 0.50, price: 0.30, context: 0.20 };

    let final_score = (broker_score * weights.broker) + (price_score * weights.price) + (context_score * weights.context);

    if (!b.systemStatus.volumeThresholdMet || b.systemStatus.dataGapPercentage > 30) {
        final_score *= 0.85; 
    }

    const confidence_score = Math.round(final_score * 100);

    let rating = "VERY LOW";
    let stars = 1;
    if (confidence_score >= 90) { rating = "VERY HIGH"; stars = 5; }
    else if (confidence_score >= 75) { rating = "HIGH"; stars = 4; }
    else if (confidence_score >= 60) { rating = "MEDIUM"; stars = 3; }
    else if (confidence_score >= 45) { rating = "LOW"; stars = 2; }

    let bias = "NEUTRAL";
    if (broker_score > 0.7 && price_score > 0.6 && m.priceAction.volatilityControl > 0.6) bias = "POSITIVE";
    else if (broker_score < 0.4 && m.priceAction.reactionQuality < 0.4) bias = "NEGATIVE";

    let risk_level = "MEDIUM";
    if (m.priceAction.volatilityControl > 0.6 && m.brokerFlow.flowConsistency > 0.6) risk_level = "LOW";
    else if (m.priceAction.volatilityControl < 0.4 && broker_score < 0.4) risk_level = "HIGH";

    return { broker_score, price_score, context_score, confidence_score, rating, stars, bias, risk_level };
  }, [result, activeTab, decisionMode]);

  const chartData = useMemo(() => {
    if (activeTab !== AnalysisType.Technical || !result?.technicalAnalysis) return [];
    return generateMockTechnicalData(result.technicalAnalysis.currentPrice, result.technicalAnalysis.trend || "Neutral");
  }, [result, activeTab]);

  const yDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 100];
    const highs = chartData.map(d => d.high);
    const lows = chartData.map(d => d.low);
    const min = Math.min(...lows);
    const max = Math.max(...highs);
    const pad = (max - min) * 0.2;
    return [Math.max(0, min - pad), max + pad];
  }, [chartData]);

  const breakoutMarkers = useMemo(() => {
    if (!result?.technicalAnalysis?.breakoutPoints || chartData.length === 0) return [];
    return result.technicalAnalysis.breakoutPoints.map(pt => {
        // Find closest point by dateIndex or spread
        const idx = Math.min(pt.dateIndex, chartData.length - 1);
        return { 
            ...pt, 
            date: chartData[idx]?.date || "Unknown",
            // Position marker slightly above/below the candle for visibility
            displayPrice: pt.type === 'Breakout' ? pt.price * 1.02 : pt.price * 0.98
        };
    }).filter(m => m.date !== "Unknown");
  }, [result, chartData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400">
        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
        <p className="font-bold uppercase tracking-[0.2em] text-[10px]">Processing Alpha Feed...</p>
      </div>
    );
  }

  if (!result) return <div className="h-96 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">Initialize technical analysis by searching a ticker.</div>;

  const isBrokerIntel = activeTab === AnalysisType.BrokerIntel;
  const isTechnical = activeTab === AnalysisType.Technical;

  return (
    <div className="bg-[#131B2E] rounded-lg border border-purple-500/30 p-6 shadow-xl min-h-[400px] fade-in overflow-hidden">
      {/* HEADER: MODE SELECTOR */}
      <div className="flex justify-between items-start mb-6 border-b border-purple-500/20 pb-4">
        <div>
            <h2 className="text-2xl font-bold text-white mb-1">
            {result.ticker} <span className="text-slate-500 text-lg font-normal">| {activeTab}</span>
            </h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Decision Engine v2.5.2-PRO</p>
        </div>
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800 shadow-inner">
            <button onClick={() => setDecisionMode('Trader')} className={`px-4 py-1.5 text-[10px] font-black uppercase rounded transition-all ${decisionMode === 'Trader' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Trader</button>
            <button onClick={() => setDecisionMode('Investor')} className={`px-4 py-1.5 text-[10px] font-black uppercase rounded transition-all ${decisionMode === 'Investor' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Investor</button>
        </div>
      </div>

      {/* VIEW: BROKER INTELLIGENCE */}
      {isBrokerIntel && engine && result.brokerIntel && (
          <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <EngineSubScore label="Broker Flow" score={engine.broker_score} color="cyan" />
                  <EngineSubScore label="Price Action" score={engine.price_score} color="emerald" />
                  <EngineSubScore label="Market Context" score={engine.context_score} color="indigo" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-5 bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-8 rounded-2xl border border-purple-500/20 flex flex-col items-center justify-center text-center shadow-2xl relative">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">System Confidence</h4>
                      <div className="relative mb-6">
                          <svg className="w-48 h-48 transform -rotate-90">
                              <circle cx="96" cy="96" r="84" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                              <circle cx="96" cy="96" r="84" stroke="currentColor" strokeWidth="12" fill="transparent" 
                                strokeDasharray={527} strokeDashoffset={527 - (527 * engine.confidence_score) / 100}
                                className={`transition-all duration-1000 ${engine.stars >= 4 ? 'text-emerald-400' : engine.stars >= 3 ? 'text-amber-400' : 'text-rose-400'}`}
                              />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-5xl font-black text-white">{engine.confidence_score}%</span>
                              <span className="text-[11px] font-bold text-slate-400 mt-1 tracking-widest uppercase">{engine.rating}</span>
                          </div>
                      </div>
                      <div className="flex gap-1 text-2xl text-yellow-500">
                          {Array.from({length: 5}).map((_, i) => (<span key={i}>{i < engine.stars ? '★' : '☆'}</span>))}
                      </div>
                  </div>

                  <div className="lg:col-span-7 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-800/40 p-5 rounded-xl border border-white/5 shadow-inner">
                              <span className="text-[9px] text-slate-500 font-black uppercase mb-2 block tracking-widest">Decision Bias</span>
                              <div className={`text-2xl font-black ${engine.bias === 'POSITIVE' ? 'text-emerald-400' : engine.bias === 'NEGATIVE' ? 'text-rose-400' : 'text-slate-400'}`}>
                                  {engine.bias}_BIAS
                              </div>
                              <p className="text-[10px] text-slate-600 mt-2 font-mono">{result.brokerIntel.dominantFactor.toUpperCase()}_DOMINANCE</p>
                          </div>
                          <div className="bg-slate-800/40 p-5 rounded-xl border border-white/5 shadow-inner">
                              <span className="text-[9px] text-slate-500 font-black uppercase mb-2 block tracking-widest">Risk Profile</span>
                              <div className={`text-2xl font-black ${engine.risk_level === 'LOW' ? 'text-emerald-400' : engine.risk_level === 'HIGH' ? 'text-rose-400' : 'text-amber-400'}`}>
                                  {engine.risk_level}_RISK
                              </div>
                              <p className="text-[10px] text-slate-600 mt-2 font-mono">STRATEGY: {decisionMode.toUpperCase()}</p>
                          </div>
                      </div>

                      <div className="bg-purple-900/10 p-6 rounded-xl border border-purple-500/10 shadow-inner">
                          <h5 className="text-[10px] font-black text-purple-400 uppercase mb-3 tracking-widest">Alpha Narrative</h5>
                          <p className="text-sm text-slate-300 leading-relaxed italic">
                              "{decisionMode === 'Trader' ? result.brokerIntel.traderBiasNote : result.brokerIntel.investorBiasNote}"
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* VIEW: TECHNICAL ANALYSIS (CANDLESTICKS) */}
      {isTechnical && result.technicalAnalysis && (
          <div className="animate-fade-in space-y-6">
              <div className="bg-[#131722] rounded-xl border border-purple-500/30 p-6 h-[550px] relative overflow-hidden group">
                  {/* Dynamic Indicators Header */}
                  <div className="absolute top-4 left-6 z-10 flex items-center gap-6">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Price Action Engine
                      </h4>
                      <div className="flex gap-4">
                        <div className="flex flex-col">
                            <span className="text-[8px] text-slate-600 font-black uppercase">Trend</span>
                            <span className={`text-[10px] font-bold ${result.technicalAnalysis.trend === 'Bullish' ? 'text-emerald-400' : 'text-rose-400'}`}>{result.technicalAnalysis.trend}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] text-slate-600 font-black uppercase">Sentiment</span>
                            <span className="text-[10px] font-bold text-white">{result.technicalAnalysis.signalStrength}</span>
                        </div>
                      </div>
                  </div>

                  <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ top: 70, right: 10, left: 10, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" vertical={false} opacity={0.3} />
                          <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 9}} minTickGap={30} />
                          <YAxis domain={yDomain} stroke="#64748b" tick={{fontSize: 9}} tickFormatter={(val) => `$${val}`} orientation="right" hide={false} />
                          <Tooltip content={<TechnicalTooltip result={result} />} />
                          
                          {/* S/R Highlight Areas (Improved Viz) */}
                          {result.technicalAnalysis.supportResistance?.support?.map((level, i) => (
                              <ReferenceArea key={`sup-${i}`} y1={level * 0.985} y2={level * 1.015} fill="#10b981" fillOpacity={0.06} stroke="none" />
                          ))}
                          {result.technicalAnalysis.supportResistance?.resistance?.map((level, i) => (
                              <ReferenceArea key={`res-${i}`} y1={level * 0.985} y2={level * 1.015} fill="#f43f5e" fillOpacity={0.06} stroke="none" />
                          ))}

                          {/* CANDLESTICK CORE BAR */}
                          <Bar 
                            name={result.ticker} 
                            dataKey="body" 
                            barSize={12} 
                            isAnimationActive={true}
                            animationDuration={1500}
                            shape={CandlestickShape}
                          />

                          {/* Technical Overlays */}
                          <Line name="MA 200" type="monotone" dataKey="ma200" stroke="#3b82f6" strokeWidth={1} strokeDasharray="4 4" dot={false} opacity={0.4} />

                          {/* Horizontal S/R Lines */}
                          {result.technicalAnalysis.supportResistance?.resistance?.map((level, i) => (
                              <ReferenceLine key={`rl-res-${i}`} y={level} stroke="#f43f5e" strokeDasharray="3 3" strokeWidth={1} opacity={0.5}>
                                  <Label value={`SUPPLY $${level}`} position="insideRight" fill="#f43f5e" fontSize={8} fontWeight="black" offset={10}/>
                              </ReferenceLine>
                          ))}
                          {result.technicalAnalysis.supportResistance?.support?.map((level, i) => (
                              <ReferenceLine key={`rl-sup-${i}`} y={level} stroke="#10b981" strokeDasharray="3 3" strokeWidth={1} opacity={0.5}>
                                  <Label value={`DEMAND $${level}`} position="insideRight" fill="#10b981" fontSize={8} fontWeight="black" offset={10}/>
                              </ReferenceLine>
                          ))}

                          {/* BREAKOUT / BREAKDOWN MARKERS (High Visibility) */}
                          <Scatter name="AI Trigger" data={breakoutMarkers} shape={(props: any) => {
                               const { cx, cy, payload } = props;
                               if (!cx || !cy) return null;
                               const isBreakout = payload.type === 'Breakout';
                               const color = isBreakout ? '#22d3ee' : '#f59e0b';
                               
                               return (
                                   <g className="animate-pulse">
                                       <circle cx={cx} cy={cy} r={14} fill={color} fillOpacity={0.2} />
                                       <circle cx={cx} cy={cy} r={6} fill={color} stroke="#fff" strokeWidth={1.5} />
                                       <text 
                                            x={cx + 12} 
                                            y={cy + 4} 
                                            fill={color} 
                                            fontSize="9" 
                                            fontWeight="black" 
                                            className="uppercase tracking-tighter drop-shadow-md"
                                        >
                                            {payload.label}
                                        </text>
                                   </g>
                               );
                          }} />

                          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                      </ComposedChart>
                  </ResponsiveContainer>
              </div>

              {/* Technical Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/40 p-5 rounded-xl border border-white/5">
                      <span className="text-[9px] text-slate-500 uppercase font-black block mb-2 tracking-widest">RSI Strength</span>
                      <div className="text-xl font-mono font-bold text-white">{result.technicalAnalysis.indicators.rsi}</div>
                  </div>
                  <div className="bg-slate-800/40 p-5 rounded-xl border border-white/5">
                      <span className="text-[9px] text-slate-500 uppercase font-black block mb-2 tracking-widest">Trend Regime</span>
                      <div className={`text-xl font-bold ${result.technicalAnalysis.trend === 'Bullish' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {result.technicalAnalysis.trend.toUpperCase()}
                      </div>
                  </div>
                  <div className="bg-slate-800/40 p-5 rounded-xl border border-white/5">
                      <span className="text-[9px] text-slate-500 uppercase font-black block mb-2 tracking-widest">Daily Return</span>
                      <div className="text-xl font-mono font-bold text-cyan-400">
                          {((result.technicalAnalysis.dailyLogReturn || 0) * 100).toFixed(2)}%
                      </div>
                  </div>
                  <div className="bg-slate-800/40 p-5 rounded-xl border border-white/5">
                      <span className="text-[9px] text-slate-500 uppercase font-black block mb-2 tracking-widest">Signal Conf.</span>
                      <div className="text-xl font-bold text-purple-400">{result.technicalAnalysis.signalStrength.toUpperCase()}</div>
                  </div>
              </div>

              <div className="bg-slate-900/60 p-6 rounded-xl border border-purple-500/20">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">AI Technical Outlook</h3>
                  <p className="text-sm text-slate-300 leading-relaxed italic">"{result.technicalAnalysis.summary}"</p>
              </div>
          </div>
      )}
    </div>
  );
};

// Sub-Score progress bar for Broker Intelligence
const EngineSubScore = ({ label, score, color }: { label: string, score: number, color: string }) => {
    const colorMap: Record<string, string> = {
        cyan: 'bg-cyan-500 shadow-[0_0_8px_#22d3ee50]',
        emerald: 'bg-emerald-500 shadow-[0_0_8px_#10b98150]',
        indigo: 'bg-indigo-500 shadow-[0_0_8px_#6366f150]'
    };
    return (
        <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5 shadow-inner">
            <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
                <span className={`text-sm font-mono font-bold ${color === 'cyan' ? 'text-cyan-400' : color === 'emerald' ? 'text-emerald-400' : 'text-indigo-400'}`}>
                    {Math.round(score * 100)}%
                </span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${colorMap[color]}`} style={{ width: `${score * 100}%` }}></div>
            </div>
        </div>
    );
};

export default ResultsDisplay;
