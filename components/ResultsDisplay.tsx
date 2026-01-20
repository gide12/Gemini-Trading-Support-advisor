
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
  const [timestamp, setTimestamp] = useState(new Date());
  const [decisionMode, setDecisionMode] = useState<'Trader' | 'Investor'>('Trader');

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
            <div className={`px-4 py-1 rounded-full text-sm font-bold border ${
                result.sentiment === 'Bullish' ? 'bg-green-900/30 border-green-500 text-green-400' :
                result.sentiment === 'Bearish' ? 'bg-red-900/30 border-red-500 text-red-400' :
                'bg-yellow-900/30 border-yellow-500 text-yellow-400'
            }`}>
                {result.sentiment.toUpperCase()}
            </div>
        )}
      </div>

      {/* BROKER INTELLIGENCE VIEW */}
      {isBrokerIntel && result.brokerIntel && (
          <div className="animate-fade-in space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Summary Overview */}
                  <div className="bg-slate-800/40 p-6 rounded-xl border border-purple-500/20 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Market Execution Context</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-sm text-slate-400">Broker Activity</span>
                                <span className="text-sm font-bold text-white">{result.brokerIntel.activity}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-sm text-slate-400">Consistency</span>
                                <span className="text-sm font-bold text-white">{result.brokerIntel.consistencyDays} Days</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-sm text-slate-400">Dominant Side</span>
                                <span className={`text-sm font-bold ${result.brokerIntel.dominantSide === 'Net Buy' ? 'text-green-400' : 'text-red-400'}`}>
                                    {result.brokerIntel.dominantSide}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-400">Market Reaction</span>
                                <span className="text-sm font-bold text-purple-400">{result.brokerIntel.marketReaction}</span>
                            </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-6 border-t border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Decision Panel</h5>
                            <div className="flex bg-slate-900 rounded-md p-1 border border-slate-700">
                                <button 
                                    onClick={() => setDecisionMode('Trader')}
                                    className={`px-3 py-1 text-[9px] font-bold uppercase rounded transition-all ${decisionMode === 'Trader' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Trader
                                </button>
                                <button 
                                    onClick={() => setDecisionMode('Investor')}
                                    className={`px-3 py-1 text-[9px] font-bold uppercase rounded transition-all ${decisionMode === 'Investor' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Investor
                                </button>
                            </div>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-purple-500/10 shadow-inner">
                            <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Action Bias: {decisionMode} Mode</div>
                            <div className="text-sm font-bold text-white italic leading-relaxed">
                                {decisionMode === 'Trader' ? result.brokerIntel.traderBias : result.brokerIntel.investorBias}
                            </div>
                        </div>
                      </div>
                  </div>

                  {/* Recommendation Panel */}
                  <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-6 rounded-xl border border-emerald-500/30 shadow-lg relative overflow-hidden flex flex-col justify-between">
                      <div className="relative z-10">
                          <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Quant Recommendation</h4>
                          <div className="flex items-center gap-3 mb-4">
                              <div className={`text-2xl`}>
                                  {result.brokerIntel.recommendation.color.includes('green') ? '🟢' : result.brokerIntel.recommendation.color.includes('red') ? '🔴' : '🟡'}
                              </div>
                              <span className="text-3xl font-black text-white tracking-tight">{result.brokerIntel.recommendation.action}</span>
                          </div>
                          <div className="text-sm text-slate-400 mb-6">
                              Risk Profile: <span className="text-white font-bold">{result.brokerIntel.recommendation.risk}</span>
                          </div>
                      </div>

                      <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-slate-500 uppercase font-black">Confidence Rating</span>
                              <div className="flex text-yellow-500 text-xl tracking-tighter">
                                  {Array.from({length: 5}).map((_, i) => (
                                      <span key={i}>{i < (result.brokerIntel?.confidence || 0) ? '★' : '☆'}</span>
                                  ))}
                              </div>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-tight">Calculated based on volatility persistence and order flow transparency.</p>
                      </div>

                      <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
                          <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM16.464 16.464a1 1 0 010-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414 0zM10 8a2 2 0 100 4 2 2 0 000-4z" /></svg>
                      </div>
                  </div>
              </div>

              {/* Advanced Table */}
              <div className="bg-[#0f172a] rounded-xl border border-slate-700/50 overflow-hidden shadow-2xl">
                  <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/30 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Advanced Flow X-Ray</h4>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono tracking-tighter">ALGO_MODE_ACTIVE</span>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <thead>
                              <tr className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-800 bg-slate-900/40">
                                  <th className="px-6 py-4">Broker Class</th>
                                  <th className="px-6 py-4">Net Position</th>
                                  <th className="px-6 py-4">Consistency (Streak)</th>
                                  <th className="px-6 py-4">Price Impact</th>
                              </tr>
                          </thead>
                          <tbody className="text-sm font-mono">
                              {(result.brokerIntel.advancedTable || []).map((row, idx) => (
                                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                      <td className="px-6 py-4 text-slate-200 font-bold">{row.type}</td>
                                      <td className={`px-6 py-4 font-black ${row.netBuy.startsWith('+') ? 'text-green-400' : row.netBuy.startsWith('-') ? 'text-red-400' : 'text-slate-400'}`}>
                                          {row.netBuy}
                                      </td>
                                      <td className="px-6 py-4 text-slate-300">{row.days}D</td>
                                      <td className={`px-6 py-4 font-bold ${row.impact === 'Positive' ? 'text-cyan-400' : row.impact === 'Negative' ? 'text-rose-400' : row.impact === 'Noise' ? 'text-slate-600' : 'text-slate-400'}`}>
                                          {row.impact.toUpperCase()}
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>

              <div className="bg-gradient-to-r from-purple-900/10 to-transparent p-4 rounded-lg border-l-4 border-purple-500">
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                      <span className="text-purple-400 font-black uppercase mr-2 tracking-tighter">Expert Summary:</span>
                      {result.brokerIntel.summary}
                  </p>
              </div>
          </div>
      )}

      {/* CLUSTERING VIEW */}
      {isClustering && result.clusteringData && (
          <div className="animate-fade-in space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(result.clusteringData.clusters || []).map((cluster, idx) => (
                      <div key={idx} className="bg-slate-800/40 border border-purple-500/20 rounded-xl p-5 hover:border-purple-500/50 transition-colors group">
                          <div className="flex items-center justify-between mb-3">
                              <h4 className="text-lg font-bold text-purple-400 group-hover:text-purple-300 transition-colors">{cluster.name}</h4>
                              <span className="text-[10px] font-black bg-purple-900/30 text-purple-300 px-2 py-1 rounded uppercase tracking-widest border border-purple-500/20 shadow-lg">
                                  {cluster.stocks?.length || 0} Assets
                              </span>
                          </div>
                          <p className="text-sm text-slate-300 mb-4 leading-relaxed italic">"{cluster.description}"</p>
                          <div className="flex flex-wrap gap-2">
                              {(cluster.stocks || []).map(stock => (
                                  <span key={stock} className="px-2 py-1 bg-slate-900 text-cyan-400 rounded text-[11px] font-mono font-bold border border-cyan-500/20 shadow-sm">
                                      {stock}
                                  </span>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 text-center shadow-inner">
                  <p className="text-xs text-slate-500 uppercase font-black tracking-widest">Algorithm Core Architecture: {result.clusteringData.algorithm || "Standard K-Means"}</p>
              </div>
          </div>
      )}
      
      {/* ... (Keep other views Technical, Fundamental, etc. as they are) */}
      
      {/* TEXT CONTENT (FALLBACK) */}
      {(!isClustering && !isTotalView && !isOptionsExpert && !isBrokerIntel && !isTechnical && !isFundamental && !isYahoo) && (
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
            <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">References & Grounding Sources</h4>
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
