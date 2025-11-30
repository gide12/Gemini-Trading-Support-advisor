import React, { useEffect, useState } from "react";
import { Holding, MPTAnalysisResult, ETFProfile } from "../types";
import { getInitialHoldings, getPortfolioHistory } from "../services/marketDataService";
import { runMPTAnalysis, getETFProfile } from "../services/geminiService";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ComposedChart, Line, Scatter, ScatterChart, ZAxis, Cell
} from 'recharts';

const AssetIcon = ({ ticker }: { ticker: string }) => {
    const [error, setError] = useState(false);
  
    if (error) {
        return (
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-purple-400 border border-purple-500/30 shadow-inner">
                {ticker.substring(0, 2)}
            </div>
        );
    }
  
    return (
        <div className="w-8 h-8 rounded-full bg-white overflow-hidden flex items-center justify-center border border-purple-500/30 shadow-inner">
            <img 
                src={`https://financialmodelingprep.com/image-stock/${ticker}.png`} 
                alt={ticker}
                className="w-full h-full object-contain p-1"
                onError={() => setError(true)}
            />
        </div>
    );
};

const PortfolioView: React.FC = () => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [history, setHistory] = useState<{date: string, value: number}[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalPL, setTotalPL] = useState(0);
  
  // Form State
  const [tickerInput, setTickerInput] = useState("");
  const [sharesInput, setSharesInput] = useState("");
  const [costInput, setCostInput] = useState("");

  // MPT State
  const [mptLoading, setMptLoading] = useState(false);
  const [mptResult, setMptResult] = useState<MPTAnalysisResult | null>(null);

  // ETF State
  const [etfTicker, setEtfTicker] = useState("");
  const [etfCapital, setEtfCapital] = useState("10000");
  const [etfLoading, setEtfLoading] = useState(false);
  const [etfResult, setEtfResult] = useState<ETFProfile | null>(null);
  const [etfWatchlist, setEtfWatchlist] = useState<string[]>(['SPY', 'QQQ', 'ARKK', 'VOO', 'SMH']);

  useEffect(() => {
    const initial = getInitialHoldings();
    setHoldings(initial);
    setHistory(getPortfolioHistory());
  }, []);

  // Recalculate totals whenever holdings change
  useEffect(() => {
    const val = holdings.reduce((acc, curr) => acc + (curr.marketValue || 0), 0);
    const cost = holdings.reduce((acc, curr) => acc + (curr.quantity * curr.avgBuyPrice), 0);
    setTotalValue(val);
    setTotalPL(val - cost);
  }, [holdings]);

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tickerInput || !sharesInput || !costInput) return;

    addOrUpdateAsset(tickerInput, parseFloat(sharesInput), parseFloat(costInput));
    
    // Reset form
    setTickerInput("");
    setSharesInput("");
    setCostInput("");
  };

  const addOrUpdateAsset = (tickerStr: string, quantity: number, avgBuyPrice: number) => {
    const ticker = tickerStr.toUpperCase();
    
    // Simulate current price
    const volatility = (Math.random() - 0.4) * 0.1; 
    const currentPrice = avgBuyPrice * (1 + volatility);
    const marketValue = quantity * currentPrice;
    const pl = marketValue - (quantity * avgBuyPrice);
    const plPercent = (pl / (quantity * avgBuyPrice)) * 100;

    const newHolding: Holding = {
        ticker,
        quantity,
        avgBuyPrice,
        currentPrice,
        marketValue,
        pl,
        plPercent
    };

    setHoldings(prev => {
        const existingIdx = prev.findIndex(h => h.ticker === ticker);
        const next = [...prev];
        if (existingIdx >= 0) {
            next[existingIdx] = newHolding;
        } else {
            next.push(newHolding);
        }
        return next;
    });
  };

  const handleRemove = (ticker: string) => {
    setHoldings(prev => prev.filter(h => h.ticker !== ticker));
  };

  const handleRunMPT = async () => {
    if (holdings.length === 0) return;
    setMptLoading(true);
    setMptResult(null);
    try {
        const result = await runMPTAnalysis(holdings);
        setMptResult(result);
    } catch (e) {
        console.error(e);
    } finally {
        setMptLoading(false);
    }
  };

  const fetchEtfProfile = async (ticker: string) => {
    if (!ticker) return;
    setEtfLoading(true);
    setEtfResult(null);
    setEtfTicker(ticker);
    try {
        const profile = await getETFProfile(ticker.toUpperCase());
        setEtfResult(profile);
    } catch (e) {
        console.error(e);
    } finally {
        setEtfLoading(false);
    }
  };

  const handleScanETF = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEtfProfile(etfTicker.toUpperCase());
  };

  const handleAdoptETF = () => {
    if (!etfResult || !etfCapital) return;
    const totalCap = parseFloat(etfCapital);
    if (isNaN(totalCap)) return;

    // We will replace current holdings with ETF allocation
    const newHoldings: Holding[] = [];

    etfResult.topHoldings.forEach(holding => {
        const allocationAmount = totalCap * (holding.weight / 100);
        // Simulate a "Buy Price" (roughly around $100-$300 for generic mock)
        const mockPrice = Math.random() * 200 + 50; 
        const qty = allocationAmount / mockPrice;

        const newHolding: Holding = {
            ticker: holding.ticker,
            quantity: qty,
            avgBuyPrice: mockPrice,
            currentPrice: mockPrice, // Assume bought just now
            marketValue: allocationAmount,
            pl: 0,
            plPercent: 0
        };
        newHoldings.push(newHolding);
    });

    setHoldings(newHoldings);
    setEtfResult(null); // Close the panel/reset
    setEtfTicker("");
  };
  
  const toggleWatchlist = (ticker: string) => {
      const t = ticker.toUpperCase();
      if (etfWatchlist.includes(t)) {
          setEtfWatchlist(prev => prev.filter(item => item !== t));
      } else {
          setEtfWatchlist(prev => [...prev, t]);
      }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
      {/* Portfolio Overview Card */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-6 shadow-lg">
          <div className="flex justify-between items-end mb-6">
             <div>
                <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                    {/* Euro Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 7.756a4.5 4.5 0 100 8.488M7.5 10.5h5.25m-5.25 3h5.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Total Portfolio Value
                </h2>
                <div className="text-4xl font-bold text-white">
                    ${(totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
             </div>
             <div className={`text-right ${totalPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                <div className="text-2xl font-semibold">
                    {totalPL >= 0 ? '+' : ''}{(totalPL || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm font-medium opacity-80">All Time P/L</div>
             </div>
          </div>
          
          <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 10}} tickFormatter={(val) => val.slice(5)} />
                  <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#7e22ce' }}
                    itemStyle={{ color: '#a855f7' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#a855f7" fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Add/Edit Asset Form */}
        <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4">Manage Portfolio</h3>
            <form onSubmit={handleAddOrUpdate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Ticker Symbol</label>
                    <input 
                        type="text" 
                        value={tickerInput}
                        onChange={(e) => setTickerInput(e.target.value)}
                        placeholder="e.g. TSLA"
                        className="w-full bg-[#1e293b] border border-slate-700 rounded px-3 py-2 text-white focus:border-purple-500 outline-none uppercase"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Quantity</label>
                    <input 
                        type="number" 
                        value={sharesInput}
                        onChange={(e) => setSharesInput(e.target.value)}
                        placeholder="0"
                        className="w-full bg-[#1e293b] border border-slate-700 rounded px-3 py-2 text-white focus:border-purple-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Avg Buy Price ($)</label>
                    <input 
                        type="number" 
                        value={costInput}
                        onChange={(e) => setCostInput(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-[#1e293b] border border-slate-700 rounded px-3 py-2 text-white focus:border-purple-500 outline-none"
                    />
                </div>
                <button 
                    type="submit"
                    disabled={!tickerInput || !sharesInput || !costInput}
                    className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium py-2 px-4 rounded transition-colors"
                >
                    Add / Update
                </button>
            </form>
        </div>

        {/* Holdings Table */}
        <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 overflow-hidden shadow-lg">
            <div className="p-6 border-b border-purple-500/20 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">Current Holdings</h3>
                <button 
                    onClick={handleRunMPT}
                    disabled={mptLoading || holdings.length < 2}
                    className={`
                        text-xs font-bold uppercase tracking-wide px-4 py-2 rounded transition-all border
                        ${(mptLoading || holdings.length < 2) ? 'bg-slate-800 text-slate-500 border-transparent cursor-not-allowed' : 'bg-purple-900/20 text-purple-400 border-purple-500/50 hover:bg-purple-900/40 hover:text-purple-200'}
                    `}
                >
                    {mptLoading ? (
                        <div className="flex items-center gap-2">
                             <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                             Optimizing...
                        </div>
                    ) : "Run MPT Optimization"}
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#1e293b]/50 text-slate-400 text-xs uppercase tracking-wider">
                            <th className="p-4">Asset</th>
                            <th className="p-4 text-right">Qty</th>
                            <th className="p-4 text-right">Avg Price</th>
                            <th className="p-4 text-right">Cur. Price</th>
                            <th className="p-4 text-right">Value</th>
                            <th className="p-4 text-right">P/L</th>
                            <th className="p-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/10 text-sm">
                        {holdings.length === 0 ? (
                             <tr>
                                <td colSpan={7} className="p-8 text-center text-slate-500">No assets in portfolio. Add some above.</td>
                             </tr>
                        ) : (
                            holdings.map((holding) => (
                                <tr key={holding.ticker} className="hover:bg-purple-900/10 transition-colors group">
                                    <td className="p-4 font-medium text-white">
                                        <div className="flex items-center gap-3">
                                            <AssetIcon ticker={holding.ticker} />
                                            <span>{holding.ticker}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right text-slate-300">{holding.quantity.toFixed(2)}</td>
                                    <td className="p-4 text-right text-slate-300">${holding.avgBuyPrice.toFixed(2)}</td>
                                    <td className="p-4 text-right text-slate-300">${holding.currentPrice.toFixed(2)}</td>
                                    <td className="p-4 text-right font-medium text-white">${(holding.marketValue || 0).toLocaleString()}</td>
                                    <td className={`p-4 text-right font-medium ${holding.pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {holding.pl >= 0 ? '+' : ''}{holding.pl.toFixed(2)} <br/>
                                        <span className="text-xs opacity-75">({holding.plPercent.toFixed(2)}%)</span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button 
                                            onClick={() => handleRemove(holding.ticker)}
                                            className="text-slate-500 hover:text-red-400 transition-colors p-1"
                                            title="Remove Asset"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        
        {/* MPT Analysis Result Section */}
        {mptResult && (
            <div className="bg-[#0f172a] rounded-xl border border-purple-500/50 shadow-lg shadow-purple-900/20 overflow-hidden fade-in">
                <div className="p-6 border-b border-purple-500/20 bg-purple-900/10">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                        </svg>
                        Modern Portfolio Theory (MPT) Analysis
                    </h3>
                    <p className="text-purple-200/60 text-sm mt-1">Efficient Frontier Optimization & Sharpe Ratio Maximization</p>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Metrics Comparison */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-400 uppercase mb-4">Performance Metrics</h4>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-800/50 p-3 rounded border border-purple-500/20">
                                <div className="text-xs text-slate-400 mb-1">Current Sharpe Ratio</div>
                                <div className="text-xl font-mono font-bold text-white">{mptResult.currentMetrics.sharpeRatio.toFixed(2)}</div>
                                <div className="text-xs text-slate-500">Ret: {mptResult.currentMetrics.expectedReturn}% | Vol: {mptResult.currentMetrics.volatility}%</div>
                            </div>
                            <div className="bg-green-900/20 p-3 rounded border border-green-500/30">
                                <div className="text-xs text-green-400 mb-1">Optimal Sharpe Ratio</div>
                                <div className="text-xl font-mono font-bold text-green-300">{mptResult.optimalMetrics.sharpeRatio.toFixed(2)}</div>
                                <div className="text-xs text-green-500/70">Ret: {mptResult.optimalMetrics.expectedReturn}% | Vol: {mptResult.optimalMetrics.volatility}%</div>
                            </div>
                        </div>

                        <h4 className="text-sm font-bold text-slate-400 uppercase mb-4">Efficient Frontier</h4>
                        <div className="h-48 w-full bg-slate-900/50 rounded-lg border border-purple-500/20 p-2">
                             <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart>
                                    <XAxis dataKey="risk" type="number" name="Risk" domain={['auto', 'auto']} hide />
                                    <YAxis dataKey="return" type="number" name="Return" domain={['auto', 'auto']} hide />
                                    <Tooltip 
                                        cursor={{ strokeDasharray: '3 3' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-slate-900 border border-slate-700 p-2 rounded text-xs">
                                                        <p className="text-slate-300">Risk: {Number(payload[0].value).toFixed(2)}%</p>
                                                        <p className="text-slate-300">Return: {Number(payload[1].value).toFixed(2)}%</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    {/* The Frontier Curve */}
                                    <Line data={mptResult.efficientFrontier} type="monotone" dataKey="return" stroke="#a855f7" strokeWidth={2} dot={false} />
                                    
                                    {/* Current Portfolio Point */}
                                    <Scatter name="Current" data={[{ risk: mptResult.currentMetrics.volatility, return: mptResult.currentMetrics.expectedReturn }]} fill="#f87171">
                                        <Cell fill="#f87171" />
                                    </Scatter>
                                    
                                    {/* Optimal Portfolio Point */}
                                    <Scatter name="Optimal" data={[{ risk: mptResult.optimalMetrics.volatility, return: mptResult.optimalMetrics.expectedReturn }]} fill="#4ade80">
                                        <Cell fill="#4ade80" />
                                    </Scatter>
                                </ComposedChart>
                             </ResponsiveContainer>
                             <div className="flex justify-center gap-4 mt-2 text-[10px]">
                                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400"></span> Current</div>
                                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400"></span> Optimal</div>
                                <div className="flex items-center gap-1"><span className="w-2 h-1 bg-purple-500"></span> Efficient Frontier</div>
                             </div>
                        </div>
                    </div>

                    {/* Rebalancing Suggestions */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-400 uppercase mb-4">AI Rebalancing Plan</h4>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {mptResult.suggestions.map((sug, idx) => (
                                <div key={idx} className="bg-slate-800/30 p-3 rounded border border-purple-500/20 flex gap-3 items-start">
                                    <div className={`mt-1 p-1 rounded-full ${sug.action === 'Buy' ? 'bg-green-500/20 text-green-400' : sug.action === 'Sell' ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                        {sug.action === 'Buy' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>}
                                        {sug.action === 'Sell' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>}
                                        {sug.action === 'Hold' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" /></svg>}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-white">{sug.ticker}</span>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${sug.action === 'Buy' ? 'bg-green-900 text-green-300' : sug.action === 'Sell' ? 'bg-red-900 text-red-300' : 'bg-slate-700 text-slate-300'}`}>
                                                {sug.action.toUpperCase()} {sug.amount}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                            {sug.reason}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Stats / Allocation / ETF Engine */}
      <div className="space-y-6">
         {/* ETF Replication Engine */}
         <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-6 shadow-lg">
             <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3 3l-3 3" />
                 </svg>
                 ETF Replication Engine
             </h3>
             <p className="text-xs text-slate-400 mb-4">Adopt institutional allocations from major ETFs (e.g. QQQ, ARKK) into your portfolio.</p>
             
             <form onSubmit={handleScanETF} className="mb-2">
                 <div className="flex gap-2">
                     <input 
                         type="text" 
                         value={etfTicker}
                         onChange={(e) => setEtfTicker(e.target.value.toUpperCase())}
                         placeholder="ETF Ticker (e.g. QQQ)"
                         className="flex-1 bg-[#1e293b] border border-slate-700 rounded px-3 py-2 text-white focus:border-purple-500 outline-none text-sm uppercase"
                     />
                     <button 
                         type="submit"
                         disabled={!etfTicker || etfLoading}
                         className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded text-sm disabled:opacity-50"
                     >
                         {etfLoading ? 'Scanning...' : 'Scan'}
                     </button>
                 </div>
             </form>
             
             {/* ETF Watchlist */}
             <div className="flex flex-wrap gap-2 mb-4">
                 {etfWatchlist.map(t => (
                    <div 
                        key={t}
                        onClick={() => fetchEtfProfile(t)}
                        className="group flex items-center gap-1 cursor-pointer text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 px-2 py-1 rounded transition-colors"
                    >
                        <span className="font-mono font-bold">{t}</span>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleWatchlist(t);
                            }}
                            className="text-slate-500 hover:text-red-400 hidden group-hover:block"
                        >
                            ×
                        </button>
                    </div>
                 ))}
             </div>

             {etfResult && (
                 <div className="bg-slate-800/40 rounded border border-blue-500/20 p-3 animate-fade-in">
                     <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-blue-300">{etfResult.name}</span>
                            <button 
                                onClick={() => toggleWatchlist(etfResult.ticker)}
                                className={`text-xs ${etfWatchlist.includes(etfResult.ticker) ? 'text-yellow-400' : 'text-slate-500 hover:text-yellow-400'}`}
                                title={etfWatchlist.includes(etfResult.ticker) ? "Remove from Watchlist" : "Add to Watchlist"}
                            >
                                ★
                            </button>
                        </div>
                        <span className="text-[10px] bg-blue-900/30 text-blue-200 px-1.5 py-0.5 rounded">{etfResult.topHoldings.length} Assets</span>
                     </div>
                     
                     <div className="space-y-1 mb-4 max-h-[150px] overflow-y-auto custom-scrollbar">
                         {etfResult.topHoldings.map(h => (
                             <div key={h.ticker} className="flex justify-between text-xs">
                                 <span className="text-slate-300 font-mono font-bold">{h.ticker}</span>
                                 <span className="text-slate-400 font-mono">{h.weight}%</span>
                             </div>
                         ))}
                     </div>

                     <div className="pt-3 border-t border-slate-700">
                         <label className="block text-[10px] text-slate-400 mb-1 uppercase font-bold">Capital to Deploy ($)</label>
                         <div className="flex gap-2">
                             <input 
                                 type="number"
                                 value={etfCapital}
                                 onChange={(e) => setEtfCapital(e.target.value)}
                                 className="flex-1 bg-[#0f172a] border border-slate-600 rounded px-2 py-1 text-white text-xs"
                             />
                             <button 
                                 onClick={handleAdoptETF}
                                 className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-3 py-1 rounded"
                             >
                                 Adopt
                             </button>
                         </div>
                     </div>
                 </div>
             )}
         </div>

         <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Allocation</h3>
            <div className="space-y-4">
                {holdings.length === 0 && <p className="text-sm text-slate-500">No assets to display.</p>}
                {holdings.map((h) => (
                    <div key={h.ticker}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-300">{h.ticker}</span>
                            <span className="text-slate-400">{totalValue > 0 ? ((h.marketValue / totalValue) * 100).toFixed(1) : 0}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                            <div 
                                className="bg-purple-600 h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${totalValue > 0 ? (h.marketValue / totalValue) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
         </div>

         {mptResult && mptResult.correlationMatrix.length > 0 && (
             <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Asset Correlations</h3>
                <div className="text-xs space-y-2">
                    {mptResult.correlationMatrix.slice(0, 5).map((corr, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-purple-500/20 pb-1">
                            <span className="text-slate-400">{corr.ticker1} / {corr.ticker2}</span>
                            <span className={`font-mono font-bold ${corr.value > 0.7 ? 'text-red-400' : corr.value < 0.3 ? 'text-green-400' : 'text-yellow-400'}`}>
                                {corr.value.toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>
             </div>
         )}
      </div>
    </div>
  );
};

export default PortfolioView;