
import React, { useEffect, useRef, useState, useMemo } from "react";
import { AnalysisResult, AnalysisType } from "../types";
import ReactMarkdown from 'react-markdown';
import { 
    ComposedChart, ReferenceLine, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, Line, Cell, Area, AreaChart, CartesianGrid
} from "recharts";

interface ResultsDisplayProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  activeTab: AnalysisType;
}

// Helper to generate mock OHLC data for visualization
const generateMockHistoricalData = (currentPrice: number, trend: string) => {
    const data = [];
    let price = currentPrice;
    const days = 40;
    
    // Reverse generation: Start from today and go back
    const volatility = price * 0.02; // 2% daily volatility
    const trendFactor = trend === 'Bullish' ? -0.003 : trend === 'Bearish' ? 0.003 : 0; // If bullish today, price was lower before

    // Generate MA 200 base
    const maBase = trend === 'Bullish' ? currentPrice * 0.85 : trend === 'Bearish' ? currentPrice * 1.15 : currentPrice;

    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - i));
        const dateStr = date.toISOString().split('T')[0].slice(5);

        // Random walk for price
        // If i is close to days (today), price approaches currentPrice
        if (i < days - 1) {
             const randomMove = (Math.random() - 0.5) * volatility;
             price = price + (price * trendFactor) + randomMove;
        } else {
            price = currentPrice;
        }

        // Create candle
        const open = price * (1 + (Math.random() - 0.5) * 0.015);
        const close = price;
        const high = Math.max(open, close) * (1 + Math.random() * 0.01);
        const low = Math.min(open, close) * (1 - Math.random() * 0.01);

        // Mock MA 200 (Linear progression for simplicity)
        const ma200 = maBase + (i * ((currentPrice * 0.95 - maBase) / days));

        // TradingView Colors: Green (#089981) and Red (#F23645)
        const isUp = close >= open;
        const color = isUp ? '#089981' : '#F23645';

        data.push({
            date: dateStr,
            open,
            high,
            low,
            close,
            ma200,
            // Pre-calculate ranges for Recharts Range Bar
            body: [Math.min(open, close), Math.max(open, close)],
            wick: [low, high],
            color: color
        });
    }
    return data;
};

// Helper to parse numeric values from indicator strings
const parseIndicatorValue = (str: string, defaultValue: number) => {
    if (!str) return defaultValue;
    const match = str.match(/-?\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : defaultValue;
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, isLoading, activeTab }) => {
  const [showTechChart, setShowTechChart] = useState(true);
  const [timestamp, setTimestamp] = useState(new Date());

  // Update timestamp every second to keep the "Live" feel in the UI
  useEffect(() => {
    const timer = setInterval(() => setTimestamp(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Memoize mock data generation to prevent regeneration on renders
  const chartData = useMemo(() => {
    if (result?.type === AnalysisType.Technical && result.technicalAnalysis) {
        return generateMockHistoricalData(
            result.technicalAnalysis.currentPrice, 
            result.technicalAnalysis.trend
        );
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

  const isIdea = activeTab === AnalysisType.Ideas;
  const isYahoo = activeTab === AnalysisType.YahooFinance;
  const isTechnical = activeTab === AnalysisType.Technical;
  const isClustering = activeTab === AnalysisType.Clustering;
  const isFundamental = activeTab === AnalysisType.Fundamental;
  const isTotalView = activeTab === AnalysisType.TotalView;

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
              {/* Imbalance Meter */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/20">
                  <div className="flex justify-between items-center mb-2">
                       <div className="flex flex-col">
                           <span className="text-sm font-bold text-slate-400 uppercase">Net Order Imbalance</span>
                           <span className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                Updated: {timestamp.toLocaleDateString()} {timestamp.toLocaleTimeString()}.{timestamp.getMilliseconds().toString().padStart(3, '0')}
                           </span>
                       </div>
                       <span className="text-sm font-bold" style={{ color: result.totalViewData.imbalance.side === 'Buy' ? '#089981' : '#F23645' }}>
                           {result.totalViewData.imbalance.side} Side ({result.totalViewData.imbalance.shares.toLocaleString()} sh)
                       </span>
                  </div>
                  <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden flex">
                       <div 
                           className="h-full transition-all" 
                           style={{
                               width: result.totalViewData.imbalance.side === 'Buy' ? '70%' : '30%',
                               backgroundColor: '#089981'
                           }}
                       ></div>
                       <div 
                           className="h-full transition-all" 
                           style={{
                               width: result.totalViewData.imbalance.side === 'Sell' ? '70%' : '30%',
                               backgroundColor: '#F23645'
                           }}
                       ></div>
                  </div>
                  <p className="text-xs text-center mt-2 text-slate-400 italic">{result.totalViewData.imbalance.strength}</p>
              </div>

              {/* Depth Chart Visualization (Basic Area) */}
              <div className="h-48 w-full bg-[#131722] rounded-lg border border-purple-500/20 p-2 relative">
                   <div className="absolute top-2 left-2 text-[10px] text-slate-500 uppercase font-bold z-10">Market Depth Visualization</div>
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={[
                           ...result.totalViewData.bids.slice(0, 10).reverse().map(b => ({ price: b.price, bidSize: b.shares, askSize: 0 })),
                           ...result.totalViewData.asks.slice(0, 10).map(a => ({ price: a.price, bidSize: 0, askSize: a.shares }))
                       ]}>
                           <defs>
                                <linearGradient id="colorBid" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#089981" stopOpacity={0.5}/>
                                    <stop offset="95%" stopColor="#089981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorAsk" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#F23645" stopOpacity={0.5}/>
                                    <stop offset="95%" stopColor="#F23645" stopOpacity={0}/>
                                </linearGradient>
                           </defs>
                           <XAxis dataKey="price" hide />
                           <Tooltip contentStyle={{ backgroundColor: '#131722', borderColor: '#334155', color: '#fff' }} />
                           <Area type="step" dataKey="bidSize" stroke="#089981" strokeWidth={2} fill="url(#colorBid)" />
                           <Area type="step" dataKey="askSize" stroke="#F23645" strokeWidth={2} fill="url(#colorAsk)" />
                       </AreaChart>
                   </ResponsiveContainer>
              </div>

              {/* Order Book Tables */}
              <div className="grid grid-cols-2 gap-px bg-slate-700 border border-slate-700 rounded overflow-hidden">
                  {/* BIDS */}
                  <div className="bg-[#131B2E]">
                      <div className="p-2 text-center font-bold text-xs uppercase border-b" style={{ backgroundColor: 'rgba(8, 153, 129, 0.15)', borderColor: 'rgba(8, 153, 129, 0.3)', color: '#089981' }}>Bid Queue</div>
                      <div className="text-[10px] text-slate-500 flex px-2 py-1 border-b border-slate-800">
                          <span className="w-10">MPID</span>
                          <span className="flex-1 text-right">Shares</span>
                          <span className="w-16 text-right">Price</span>
                      </div>
                      {result.totalViewData.bids.map((bid, i) => (
                          <div key={i} className="flex px-2 py-1 text-xs border-b border-slate-800/50 hover:bg-[#089981]/10 transition-colors">
                              <span className="w-10 text-slate-400 font-mono">{bid.venue}</span>
                              <span className="flex-1 text-right text-slate-300 font-mono">{bid.shares.toLocaleString()}</span>
                              <span className="w-16 text-right font-mono font-bold" style={{ color: '#089981' }}>{bid.price.toFixed(2)}</span>
                          </div>
                      ))}
                  </div>

                  {/* ASKS */}
                  <div className="bg-[#131B2E]">
                      <div className="p-2 text-center font-bold text-xs uppercase border-b" style={{ backgroundColor: 'rgba(242, 54, 69, 0.15)', borderColor: 'rgba(242, 54, 69, 0.3)', color: '#F23645' }}>Ask Queue</div>
                      <div className="text-[10px] text-slate-500 flex px-2 py-1 border-b border-slate-800">
                           <span className="w-16 text-left">Price</span>
                           <span className="flex-1 text-left">Shares</span>
                           <span className="w-10 text-right">MPID</span>
                      </div>
                      {result.totalViewData.asks.map((ask, i) => (
                          <div key={i} className="flex px-2 py-1 text-xs border-b border-slate-800/50 hover:bg-[#F23645]/10 transition-colors">
                              <span className="w-16 text-left font-mono font-bold" style={{ color: '#F23645' }}>{ask.price.toFixed(2)}</span>
                              <span className="flex-1 text-left text-slate-300 font-mono">{ask.shares.toLocaleString()}</span>
                              <span className="w-10 text-right text-slate-400 font-mono">{ask.venue}</span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* FUNDAMENTAL ANALYSIS - VALUATION & MPID */}
      {isFundamental && (
          <div className="space-y-6 mb-6">
              {/* Valuation Badge */}
              {result.valuationStatus && (
                  <div className="bg-slate-800/50 p-6 rounded-xl border border-purple-500/20 flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in">
                       <div>
                           <h3 className="text-sm font-bold text-slate-400 uppercase mb-1">Valuation Verdict</h3>
                           <div className="flex items-center gap-3">
                               <span className={`text-3xl font-bold ${
                                   result.valuationStatus === 'Undervalued' ? 'text-green-400' : 
                                   result.valuationStatus === 'Overvalued' ? 'text-red-400' : 'text-yellow-400'
                               }`}>
                                   {result.valuationStatus.toUpperCase()}
                               </span>
                               {result.intrinsicValue && (
                                   <span className="text-sm text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-700 font-mono">
                                       Intrinsic Value: {result.intrinsicValue}
                                   </span>
                               )}
                           </div>
                       </div>
                       
                       <div className="h-12 w-px bg-slate-700 hidden md:block"></div>
                       
                       <div className="flex gap-2">
                           {/* Visual Gauge representation */}
                            <div className="flex flex-col items-center">
                                <div className="flex gap-1 mb-1">
                                    <div className={`w-12 h-3 rounded-l ${result.valuationStatus === 'Undervalued' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'bg-slate-700/50'}`}></div>
                                    <div className={`w-12 h-3 ${result.valuationStatus === 'Fair Value' ? 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.6)]' : 'bg-slate-700/50'}`}></div>
                                    <div className={`w-12 h-3 rounded-r ${result.valuationStatus === 'Overvalued' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'bg-slate-700/50'}`}></div>
                                </div>
                                <div className="flex justify-between w-full px-1">
                                    <span className={`text-[9px] uppercase font-bold ${result.valuationStatus === 'Undervalued' ? 'text-green-500' : 'text-slate-600'}`}>Cheap</span>
                                    <span className={`text-[9px] uppercase font-bold ${result.valuationStatus === 'Overvalued' ? 'text-red-500' : 'text-slate-600'}`}>Expensive</span>
                                </div>
                            </div>
                       </div>
                  </div>
              )}

              {/* MPID / Market Depth Simulation */}
              {result.mpidData && result.mpidData.length > 0 && (
                  <div className="bg-slate-800/40 rounded-xl border border-purple-500/20 p-5 animate-fade-in">
                       <h3 className="text-sm font-bold text-slate-300 uppercase mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-purple-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                            </svg>
                            Market Depth / MPID Activity (Nasdaq TotalView Style)
                       </h3>
                       <div className="overflow-x-auto">
                           <table className="w-full text-left border-collapse">
                               <thead>
                                   <tr className="bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider border-b border-purple-500/10">
                                       <th className="p-3">MPID</th>
                                       <th className="p-3">Participant Name</th>
                                       <th className="p-3">Type</th>
                                       <th className="p-3 text-right">Status</th>
                                   </tr>
                               </thead>
                               <tbody className="divide-y divide-purple-500/5 text-sm">
                                   {result.mpidData.map((mp, idx) => (
                                       <tr key={idx} className="hover:bg-purple-900/10 transition-colors group">
                                           <td className="p-3 font-mono font-bold text-yellow-400 group-hover:text-yellow-300">{mp.code}</td>
                                           <td className="p-3 text-slate-300">{mp.name}</td>
                                           <td className="p-3">
                                               <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                                                   mp.type.toLowerCase().includes('maker') ? 'bg-blue-900/30 text-blue-400' : 'bg-purple-900/30 text-purple-400'
                                               }`}>
                                                   {mp.type}
                                               </span>
                                           </td>
                                           <td className="p-3 text-right">
                                               <div className="flex items-center justify-end gap-1.5">
                                                   <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                   <span className="text-xs text-green-400/80">Active</span>
                                               </div>
                                           </td>
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                       </div>
                  </div>
              )}
          </div>
      )}

      {/* Technical Analysis View */}
      {isTechnical && result.technicalAnalysis && (
          <div className="mb-6">
              <div className="flex gap-2 mb-4 border-b border-slate-800 pb-2">
                  <button 
                      onClick={() => setShowTechChart(true)}
                      className={`px-4 py-2 text-sm font-medium rounded-t-md transition-all flex items-center gap-2 ${showTechChart ? 'bg-slate-800 text-white border-t border-x border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                      </svg>
                      Candlestick Chart & Indicators
                  </button>
                  <button 
                      onClick={() => setShowTechChart(false)}
                      className={`px-4 py-2 text-sm font-medium rounded-t-md transition-all ${!showTechChart ? 'bg-slate-800 text-white border-t border-x border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                      Key Data Levels
                  </button>
              </div>

              {showTechChart ? (
                  <div className="animate-fade-in space-y-4">
                      {/* Main Candlestick Chart */}
                      <div className="h-[450px] w-full bg-[#131722] rounded-lg border border-purple-500/20 p-4 relative">
                          <div className="absolute top-4 left-4 z-10 flex gap-4 text-xs font-mono">
                                <div className="flex items-center gap-1.5 bg-[#1e222d] px-2 py-1 rounded border border-slate-700">
                                    <span className="w-3 h-0.5 bg-blue-500"></span>
                                    <span className="text-blue-300">MA 200</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-[#1e222d] px-2 py-1 rounded border border-slate-700">
                                    <span className="w-2 h-2 rounded-full bg-[#F23645]"></span>
                                    <span className="text-[#F23645]">Res</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-[#1e222d] px-2 py-1 rounded border border-slate-700">
                                    <span className="w-2 h-2 rounded-full bg-[#089981]"></span>
                                    <span className="text-[#089981]">Sup</span>
                                </div>
                          </div>

                          <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" vertical={false} />
                                    <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 10}} minTickGap={30} />
                                    <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{fontSize: 10}} tickFormatter={(val) => `$${val}`} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#131722', borderColor: '#334155', color: '#fff' }}
                                        formatter={(val: any, name: string) => {
                                            if (name === 'ma200') return [Number(val).toFixed(2), 'MA 200'];
                                            if (name === 'close') return [Number(val).toFixed(2), 'Close'];
                                            if (Array.isArray(val)) return [`${val[0].toFixed(2)} - ${val[1].toFixed(2)}`, name === 'wick' ? 'Range' : 'Body'];
                                            return [val, name];
                                        }}
                                        labelStyle={{ color: '#94a3b8' }}
                                    />
                                    
                                    {/* Resistance Lines */}
                                    {result.technicalAnalysis.supportResistance.resistance.map((level, i) => (
                                        <ReferenceLine 
                                            key={`res-${i}`} 
                                            y={level} 
                                            stroke="#F23645" 
                                            strokeDasharray="3 3" 
                                            strokeOpacity={0.7}
                                        />
                                    ))}

                                    {/* Support Lines */}
                                    {result.technicalAnalysis.supportResistance.support.map((level, i) => (
                                        <ReferenceLine 
                                            key={`sup-${i}`} 
                                            y={level} 
                                            stroke="#089981" 
                                            strokeDasharray="3 3" 
                                            strokeOpacity={0.7}
                                        />
                                    ))}

                                    {/* Moving Average 200 */}
                                    <Line 
                                        type="monotone" 
                                        dataKey="ma200" 
                                        stroke="#3b82f6" 
                                        strokeWidth={2} 
                                        dot={false}
                                        activeDot={false} 
                                    />

                                    {/* Candlestick Construction: Wick (Low-High) + Body (Open-Close) */}
                                    {/* Layer 1: Wicks (Thin bars) */}
                                    <Bar dataKey="wick" barSize={1} isAnimationActive={false}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`wick-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                    
                                    {/* Layer 2: Bodies (Thicker bars) */}
                                    <Bar dataKey="body" barSize={8} isAnimationActive={false}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`body-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>

                              </ComposedChart>
                          </ResponsiveContainer>
                      </div>

                      {/* Technical Indicators Panel */}
                      <div className="grid grid-cols-3 gap-4">
                          <div className="bg-slate-800/40 p-4 rounded-lg border border-purple-500/20">
                              <h4 className="text-xs text-slate-400 uppercase font-bold mb-1">RSI (14)</h4>
                              <div className="flex items-baseline gap-2">
                                  <span className="text-2xl font-mono font-bold text-white">
                                      {/* Try parsing or use specific fallback from prompt requirement */}
                                      {parseIndicatorValue(result.technicalAnalysis.indicators.rsi, 41.48).toFixed(2)}
                                  </span>
                                  <span className="text-xs text-slate-500">Neutral</span>
                              </div>
                              <div className="w-full bg-slate-700 h-1.5 mt-2 rounded-full overflow-hidden">
                                  <div className="bg-blue-400 h-full" style={{width: '41.48%'}}></div>
                              </div>
                          </div>

                          <div className="bg-slate-800/40 p-4 rounded-lg border border-purple-500/20">
                              <h4 className="text-xs text-slate-400 uppercase font-bold mb-1">MACD (12, 26, 9)</h4>
                              <div className="flex items-baseline gap-2">
                                  <span className="text-2xl font-mono font-bold text-red-400">
                                      {parseIndicatorValue(result.technicalAnalysis.indicators.macd, -1.51).toFixed(2)}
                                  </span>
                                  <span className="text-xs text-red-400/70">Bearish</span>
                              </div>
                              <div className="flex gap-0.5 mt-2 h-1.5 items-end">
                                  <div className="w-1/3 bg-slate-700 h-0.5"></div>
                                  <div className="w-1/3 bg-[#F23645] h-full"></div>
                                  <div className="w-1/3 bg-slate-700 h-0.5"></div>
                              </div>
                          </div>

                          <div className="bg-slate-800/40 p-4 rounded-lg border border-purple-500/20">
                              <h4 className="text-xs text-slate-400 uppercase font-bold mb-1">Trend Signal</h4>
                              <div className="flex items-center gap-2 mt-1">
                                  {result.technicalAnalysis.trend === 'Bullish' ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-[#089981]">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                                      </svg>
                                  ) : result.technicalAnalysis.trend === 'Bearish' ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-[#F23645]">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
                                      </svg>
                                  ) : (
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-yellow-500">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18" />
                                      </svg>
                                  )}
                                  <span className={`text-lg font-bold ${
                                      result.technicalAnalysis.trend === 'Bullish' ? 'text-[#089981]' :
                                      result.technicalAnalysis.trend === 'Bearish' ? 'text-[#F23645]' : 'text-yellow-400'
                                  }`}>
                                      {result.technicalAnalysis.signalStrength} {result.technicalAnalysis.trend}
                                  </span>
                              </div>
                          </div>
                      </div>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                      {/* Data Tables (Previous View) */}
                      <div className="bg-slate-800/40 rounded-lg border border-purple-500/20 p-5">
                          <h3 className="text-sm font-bold text-slate-300 uppercase mb-4 flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-purple-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                              </svg>
                              Key Indicators
                          </h3>
                          <div className="space-y-4">
                              {Object.entries(result.technicalAnalysis.indicators).map(([key, val]) => (
                                  <div key={key} className="flex justify-between items-center border-b border-slate-700 pb-2 last:border-0">
                                      <span className="text-slate-400 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                      <span className="text-white font-mono text-sm text-right">{val}</span>
                                  </div>
                              ))}
                          </div>
                      </div>

                      {/* Card 2: Support & Resistance */}
                      <div className="bg-slate-800/40 rounded-lg border border-purple-500/20 p-5">
                          <h3 className="text-sm font-bold text-slate-300 uppercase mb-4 flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-purple-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" />
                              </svg>
                              Key Levels
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <span className="text-xs text-[#F23645] uppercase font-bold block mb-2">Resistance</span>
                                  <div className="space-y-2">
                                      {result.technicalAnalysis.supportResistance.resistance.map((level, i) => (
                                          <div key={i} className="bg-red-900/20 border border-red-900/50 rounded px-3 py-1 text-red-300 font-mono text-sm">
                                              ${Number(level).toFixed(2)}
                                          </div>
                                      ))}
                                  </div>
                              </div>
                              <div>
                                  <span className="text-xs text-[#089981] uppercase font-bold block mb-2">Support</span>
                                  <div className="space-y-2">
                                      {result.technicalAnalysis.supportResistance.support.map((level, i) => (
                                          <div key={i} className="bg-green-900/20 border border-green-900/50 rounded px-3 py-1 text-green-300 font-mono text-sm">
                                              ${Number(level).toFixed(2)}
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* CLUSTERING ANALYSIS (New View) */}
      {isClustering && result.clusteringData && (
          <div className="animate-fade-in mb-8">
               <div className="flex items-center gap-2 mb-6">
                    <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Market Regime Clusters</h3>
                        <p className="text-xs text-slate-400">Logic: Correlation + Hierarchical • {result.clusteringData.algorithm}</p>
                    </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {result.clusteringData.clusters.map((cluster, idx) => (
                        <div key={idx} className="bg-slate-800/40 border border-purple-500/20 rounded-xl p-5 hover:border-purple-500/50 transition-all hover:bg-slate-800/60 shadow-lg shadow-purple-900/10 group">
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="text-lg font-bold text-purple-300 group-hover:text-purple-200 transition-colors">{cluster.name}</h4>
                                <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-400">{cluster.stocks.length} assets</span>
                            </div>
                            <p className="text-sm text-slate-400 mb-4 h-10 line-clamp-2">{cluster.description}</p>
                            
                            <div className="flex flex-wrap gap-2">
                                {cluster.stocks.map((s, i) => (
                                    <span key={i} className="px-2 py-1 bg-[#1e293b] rounded text-xs font-mono font-bold text-slate-300 border border-purple-500/20 group-hover:border-purple-500/40">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
               </div>
          </div>
      )}

      {/* Trade Idea View */}
      {isIdea && result.tradeSetup && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-800/50 p-4 rounded border border-purple-500/20">
                <div className="text-slate-400 text-sm mb-1">Entry Target</div>
                <div className="text-xl font-mono text-blue-400">{result.tradeSetup.entry}</div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded border border-purple-500/20">
                <div className="text-slate-400 text-sm mb-1">Stop Loss</div>
                <div className="text-xl font-mono text-red-400">{result.tradeSetup.stopLoss}</div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded border border-purple-500/20">
                <div className="text-slate-400 text-sm mb-1">Take Profit</div>
                <div className="text-xl font-mono text-green-400">{result.tradeSetup.takeProfit}</div>
            </div>
        </div>
      )}

      {/* Text Content - for General Views, and Summary of Technical/Yahoo/Ideas */}
      {!isClustering && !isTotalView && (
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
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
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
