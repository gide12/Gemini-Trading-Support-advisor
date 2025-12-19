
import React, { useEffect, useRef, useState, useMemo } from "react";
import { AnalysisResult, AnalysisType } from "../types";
import ReactMarkdown from 'react-markdown';
import { 
    ComposedChart, ReferenceLine, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Line, Cell, Area, AreaChart, CartesianGrid, Label
} from "recharts";

interface ResultsDisplayProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  activeTab: AnalysisType;
}

// Helper to generate mock OHLC data for visualization
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
        } else {
            price = currentPrice || 100;
        }

        const open = price * (1 + (Math.random() - 0.5) * 0.015);
        const close = price;
        const high = Math.max(open, close) * (1 + Math.random() * 0.01);
        const low = Math.min(open, close) * (1 - Math.random() * 0.01);
        const ma200 = maBase + (i * (((currentPrice || 100) * 0.95 - maBase) / days));

        const isUp = close >= open;
        const color = isUp ? '#089981' : '#F23645';

        data.push({
            date: dateStr,
            open,
            high,
            low,
            close,
            ma200,
            body: [Math.min(open, close), Math.max(open, close)],
            wick: [low, high],
            color: color,
            isHistorical: true
        });
    }
    return data;
};

// Generate a projected path for Options Expert
const generatePredictionPath = (startPrice: number, targetPrice: number, stopPrice: number, type: string) => {
    const path = [];
    const steps = 10;
    
    const safeStart = startPrice || 100;
    const safeTarget = targetPrice || (safeStart * 1.1);

    for (let i = 1; i <= steps; i++) {
        const progress = i / steps;
        let price;
        if (type === 'Bounce') {
            const curve = Math.sin(progress * Math.PI / 2);
            price = safeStart + (safeTarget - safeStart) * curve;
        } else {
            price = safeStart + (safeTarget - safeStart) * progress;
        }

        path.push({
            date: `P+${i}d`,
            close: price,
            predictionPrice: price,
            isHistorical: false
        });
    }
    return path;
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, isLoading, activeTab }) => {
  const [showTechChart, setShowTechChart] = useState(true);
  const [timestamp, setTimestamp] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTimestamp(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const chartData = useMemo(() => {
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
        const prediction = generatePredictionPath(
            lastClose, 
            target, 
            stop,
            type
        );
        return [...historical, ...prediction];
    }
    return [];
  }, [result]);

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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none" viewBox="0 0 24 24"
          strokeWidth={1}
          stroke="currentColor"
          className="w-20 h-20 mb-4 opacity-50 text-purple-500/50"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"
          />
        </svg>
        <h3 className="text-xl font-semibold text-slate-300 mb-2">
          Market {activeTab}
        </h3>
        <p className="max-w-md text-center text-sm">
          Enter a stock ticker above to generate real-time insights using Gemini 2.5 Flash.
        </p>
      </div>
    );
  }

  const isYahoo = activeTab === AnalysisType.YahooFinance;
  const isTechnical = activeTab === AnalysisType.Technical;
  const isOptionsExpert = activeTab === AnalysisType.OptionsExpert;
  const isTotalView = activeTab === AnalysisType.TotalView;
  const isFundamental = activeTab === AnalysisType.Fundamental;
  const isClustering = activeTab === AnalysisType.Clustering;

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
            <div className={`px-4 py-1 rounded-full text-sm font-bold border ${
                result.sentiment === 'Bullish' ? 'bg-green-900/30 border-green-500 text-green-400' :
                result.sentiment === 'Bearish' ? 'bg-red-900/30 border-red-500 text-red-400' :
                'bg-yellow-900/30 border-yellow-500 text-yellow-400'
            }`}>
                {result.sentiment.toUpperCase()}
            </div>
        )}
      </div>

      {/* OPTIONS EXPERT VIEW */}
      {isOptionsExpert && result.optionsAnalysis && (
          <div className="animate-fade-in space-y-6">
              {/* TOP CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Probability Meter */}
                  <div className="bg-slate-800/50 p-5 rounded-xl border border-purple-500/20 flex flex-col justify-center items-center">
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Structural Prediction</h4>
                      <div className="relative w-32 h-32 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                              <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-700" />
                              <circle 
                                cx="64" cy="64" r="54" 
                                stroke="currentColor" strokeWidth="10" fill="transparent" 
                                strokeDasharray={339.3} 
                                strokeDashoffset={339.3 - (339.3 * (result.optionsAnalysis.prediction?.probability || 0)) / 100} 
                                strokeLinecap="round" 
                                className="text-purple-500 transition-all duration-1000" 
                              />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                              <span className="text-2xl font-bold text-white">{result.optionsAnalysis.prediction?.probability || 0}%</span>
                              <span className="text-[10px] text-slate-500 uppercase font-black">Confidence</span>
                          </div>
                      </div>
                      <div className="mt-4 text-center">
                          <div className={`text-lg font-bold ${result.optionsAnalysis.prediction?.side === 'Upside' ? 'text-green-400' : result.optionsAnalysis.prediction?.side === 'Downside' ? 'text-red-400' : 'text-yellow-400'}`}>
                              {result.optionsAnalysis.prediction?.type || "Consolidation"} ({result.optionsAnalysis.prediction?.side || "Neutral"})
                          </div>
                      </div>
                  </div>

                  {/* Targets Card */}
                  <div className="bg-slate-800/50 p-5 rounded-xl border border-purple-500/20">
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Tactical Levels</h4>
                      <div className="space-y-4">
                          <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-400">Projected Target</span>
                              <span className="text-xl font-mono font-bold text-blue-400">${(result.optionsAnalysis.prediction?.target || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-400">Stop/Invalidation</span>
                              <span className="text-xl font-mono font-bold text-rose-400">${(result.optionsAnalysis.prediction?.stop || 0).toFixed(2)}</span>
                          </div>
                          <div className="pt-4 border-t border-slate-700">
                               <div className="flex justify-between text-xs mb-1">
                                   <span className="text-slate-500 uppercase">Risk/Reward</span>
                                   <span className="text-white font-bold">1 : 2.5</span>
                               </div>
                          </div>
                      </div>
                  </div>

                  {/* Volume Signal */}
                  <div className="bg-slate-800/50 p-5 rounded-xl border border-purple-500/20">
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Volume Confirmation</h4>
                      <div className="flex items-center gap-3 mb-4">
                          <div className={`w-3 h-3 rounded-full ${result.optionsAnalysis.volumeSignal?.confirmation ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`}></div>
                          <span className={`text-lg font-bold ${result.optionsAnalysis.volumeSignal?.confirmation ? 'text-green-400' : 'text-red-400'}`}>
                              {result.optionsAnalysis.volumeSignal?.confirmation ? 'CONFIRMED' : 'WEAK SIGNAL'}
                          </span>
                      </div>
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                              <span className="text-slate-500">Intensity</span>
                              <span className="text-white font-bold">{result.optionsAnalysis.volumeSignal?.intensity || "Unknown"}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                              <span className="text-slate-500">Regime</span>
                              <span className="text-white font-bold">{result.optionsAnalysis.volumeSignal?.trend || "Neutral"}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-2 italic leading-tight">
                              {result.optionsAnalysis.volumeSignal?.description}
                          </p>
                      </div>
                  </div>
              </div>

              {/* PREDICTION CHART */}
              <div className="bg-[#131722] p-6 rounded-xl border border-purple-500/30 h-[400px] relative overflow-hidden">
                  <div className="absolute top-4 left-6 z-10">
                      <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                          {result.optionsAnalysis.prediction?.type || "Structural"} Forecast Chart
                      </h4>
                      <p className="text-[10px] text-slate-500">Includes historical price action and AI projected {result.optionsAnalysis.prediction?.side || "Neutral"} trajectory.</p>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ top: 40, right: 30, left: 10, bottom: 10 }}>
                          <defs>
                              <linearGradient id="predictionArea" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" vertical={false} />
                          <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 10}} minTickGap={30} />
                          <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{fontSize: 10}} tickFormatter={(val) => `$${val}`} />
                          <Tooltip contentStyle={{ backgroundColor: '#131722', borderColor: '#334155', color: '#fff' }} />
                          
                          <Bar dataKey="wick" barSize={1} isAnimationActive={false}>
                              {chartData.map((entry, index) => (
                                  <Cell key={`wick-${index}`} fill={entry.isHistorical ? entry.color : 'transparent'} />
                              ))}
                          </Bar>
                          <Bar dataKey="body" barSize={8} isAnimationActive={false}>
                              {chartData.map((entry, index) => (
                                  <Cell key={`body-${index}`} fill={entry.isHistorical ? entry.color : 'transparent'} />
                              ))}
                          </Bar>

                          <Line 
                            type="monotone" 
                            dataKey="predictionPrice" 
                            stroke="#a855f7" 
                            strokeWidth={3} 
                            strokeDasharray="5 5"
                            dot={{ r: 4, fill: '#a855f7', strokeWidth: 0 }}
                            animationDuration={2000}
                          />

                          {result.optionsAnalysis.prediction?.target && (
                            <ReferenceLine y={result.optionsAnalysis.prediction.target} stroke="#0ea5e9" strokeDasharray="3 3">
                                <Label value="TARGET" position="right" fill="#0ea5e9" fontSize={10} fontWeight="bold" />
                            </ReferenceLine>
                          )}
                          {result.optionsAnalysis.prediction?.stop && (
                            <ReferenceLine y={result.optionsAnalysis.prediction.stop} stroke="#f43f5e" strokeDasharray="3 3">
                                <Label value="STOP" position="right" fill="#f43f5e" fontSize={10} fontWeight="bold" />
                            </ReferenceLine>
                          )}
                      </ComposedChart>
                  </ResponsiveContainer>
              </div>

              {/* Patterns Grid */}
              <div className="bg-[#1e222d] p-5 rounded-xl border border-purple-500/20">
                   <h4 className="text-sm font-bold text-slate-300 uppercase mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        Candlestick Pattern Recognition
                   </h4>
                   <div className="flex flex-wrap gap-4">
                       {(result.optionsAnalysis.patterns || []).map((p, i) => (
                           <div key={i} className="flex items-center gap-3 bg-slate-900 border border-slate-700 px-4 py-3 rounded-lg group hover:border-purple-500/50 transition-colors">
                               <div className={`w-2 h-2 rounded-full ${p.type === 'Bullish' ? 'bg-green-500' : p.type === 'Bearish' ? 'bg-red-500' : 'bg-slate-500'}`}></div>
                               <div>
                                   <div className="text-sm font-bold text-white">{p.pattern}</div>
                                   <div className="text-[10px] text-slate-500 uppercase tracking-widest">{p.strength} {p.type}</div>
                               </div>
                           </div>
                       ))}
                   </div>
              </div>

              {/* Tactical Summary */}
              <div className="bg-gradient-to-r from-purple-900/20 to-transparent p-6 rounded-xl border border-purple-500/10">
                  <h4 className="text-sm font-bold text-purple-400 uppercase mb-2">Expert Tactical Summary</h4>
                  <p className="text-slate-300 leading-relaxed italic">
                      "{result.optionsAnalysis.summary}"
                  </p>
              </div>
          </div>
      )}

      {/* Yahoo Finance / Financials View */}
      {isYahoo && result.financials && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {Object.entries(result.financials).map(([key, value]) => (
                  <div key={key} className="bg-slate-800/50 p-4 rounded border border-purple-500/20 hover:border-purple-500/50 transition-colors">
                      <div className="text-slate-400 text-xs uppercase mb-1">{key}</div>
                      <div className="text-white font-mono font-medium">{value}</div>
                  </div>
              ))}
          </div>
      )}
      
      {/* NASDAQ TOTALVIEW (Level 2) */}
      {isTotalView && result.totalViewData && (
          <div className="animate-fade-in space-y-6">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/20">
                  <div className="flex justify-between items-center mb-2">
                       <div className="flex flex-col">
                           <span className="text-sm font-bold text-slate-400 uppercase">Net Order Imbalance</span>
                           <span className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                Updated: {timestamp.toLocaleTimeString()}
                           </span>
                       </div>
                       <span className="text-sm font-bold" style={{ color: result.totalViewData.imbalance?.side === 'Buy' ? '#089981' : '#F23645' }}>
                           {result.totalViewData.imbalance?.side || "Neutral"} Side ({result.totalViewData.imbalance?.shares?.toLocaleString() || 0} sh)
                       </span>
                  </div>
                  <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden flex">
                       <div className="h-full transition-all" style={{ width: result.totalViewData.imbalance?.side === 'Buy' ? '70%' : '30%', backgroundColor: '#089981' }} />
                       <div className="h-full transition-all" style={{ width: result.totalViewData.imbalance?.side === 'Sell' ? '70%' : '30%', backgroundColor: '#F23645' }} />
                  </div>
              </div>
              <p className="text-xs text-center text-slate-400 italic">{result.totalViewData.summary}</p>
          </div>
      )}

      {/* TECHNICAL ANALYSIS */}
      {isTechnical && result.technicalAnalysis && (
          <div className="animate-fade-in">
              <div className="h-[450px] w-full bg-[#131722] rounded-lg border border-purple-500/20 p-4 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" vertical={false} />
                          <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 10}} />
                          <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{fontSize: 10}} tickFormatter={(val) => `$${val}`} />
                          <Tooltip contentStyle={{ backgroundColor: '#131722', borderColor: '#334155', color: '#fff' }} />
                          <Bar dataKey="wick" barSize={1} isAnimationActive={false}>
                              {chartData.map((entry, index) => (
                                  <Cell key={`wick-${index}`} fill={entry.color} />
                              ))}
                          </Bar>
                          <Bar dataKey="body" barSize={8} isAnimationActive={false}>
                              {chartData.map((entry, index) => (
                                  <Cell key={`body-${index}`} fill={entry.color} />
                              ))}
                          </Bar>
                          <Line type="monotone" dataKey="ma200" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      </ComposedChart>
                  </ResponsiveContainer>
              </div>
          </div>
      )}

      {/* FUNDAMENTAL ANALYSIS */}
      {isFundamental && result.fundamentalMetrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-in">
              {Object.entries(result.fundamentalMetrics).map(([key, val]) => (
                   <div key={key} className="bg-[#1e293b] p-3 rounded border border-purple-500/10">
                       <span className="block text-[10px] text-slate-500 uppercase font-bold">{key}</span>
                       <span className="text-white font-mono">{val}</span>
                   </div>
              ))}
          </div>
      )}

      {/* TEXT CONTENT */}
      {(!isClustering && !isTotalView && !isOptionsExpert) && (
          <div className="prose prose-invert max-w-none text-slate-300">
             <ReactMarkdown
                components={{
                    h3: ({node, ...props}) => <h3 className="text-xl font-bold text-purple-400 mt-8 mb-4 border-b border-purple-500/30 pb-2" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-3 mb-6 text-slate-300" {...props} />,
                    li: ({node, ...props}) => <li className="leading-relaxed pl-2" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-slate-300" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold text-white" {...props} />
                }}
             >
                {result.content}
             </ReactMarkdown>
          </div>
      )}

      {/* Grounding Sources */}
      {result.sources && result.sources.length > 0 && (
        <div className="mt-8 pt-4 border-t border-purple-500/20">
            <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">References & Sources</h4>
            <ul className="space-y-2">
                {result.sources.map((source, idx) => (
                    <li key={idx}>
                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 transition-colors hover:underline">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3" >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                            </svg>
                            <span className="truncate max-w-md">{source.title}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
