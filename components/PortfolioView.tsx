
import React, { useEffect, useState } from "react";
import { Holding, MPTAnalysisResult, ETFProfile, DeltaGammaHedgeResult, AdvancedPricingResult, CAPMAPTResult, InvestorView } from "../types";
import { getInitialHoldings, getPortfolioHistory } from "../services/marketDataService";
import { runMPTAnalysis, getETFProfile, runHedgeAnalysis, runAdvancedPricingAnalysis, runCAPMAPTAnalysis } from "../services/geminiService";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ComposedChart, Line, Scatter, ScatterChart, ZAxis, Cell, BarChart, Bar, Legend
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

const DiagnosticBadge = ({ label, status }: { label: string, status: "OK" | "MISSING" | "STALE" | "EMPTY" | "THIN" | "INVERTED" | "ASSUMED" | string }) => {
    const isOk = status === "OK" || status === "ASSUMED";
    const isWarning = status === "STALE" || status === "THIN" || status === "INVERTED";
    
    return (
        <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded border border-white/5">
            <div className={`w-1.5 h-1.5 rounded-full ${isOk ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : isWarning ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`}></div>
            <div className="flex flex-col">
                <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">{label}</span>
                <span className={`text-[10px] font-bold ${isOk ? 'text-emerald-400' : isWarning ? 'text-amber-400' : 'text-rose-400'}`}>{status}</span>
            </div>
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
  const [rebalanceStrategy, setRebalanceStrategy] = useState("Threshold-based (>5%)");
  const [showConfirmRebalance, setShowConfirmRebalance] = useState(false);

  // Black-Litterman Views State
  const [investorViews, setInvestorViews] = useState<InvestorView[]>([]);
  const [newViewType, setNewViewType] = useState<"Absolute" | "Relative">("Absolute");
  const [newViewAsset1, setNewViewAsset1] = useState("");
  const [newViewAsset2, setNewViewAsset2] = useState("");
  const [newViewReturn, setNewViewReturn] = useState("");
  const [newViewConfidence, setNewViewConfidence] = useState(50);

  // Hedge State
  const [hedgeLoading, setHedgeLoading] = useState(false);
  const [hedgeResult, setHedgeResult] = useState<DeltaGammaHedgeResult | null>(null);

  // Advanced Pricing State
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingResult, setPricingResult] = useState<AdvancedPricingResult | null>(null);
  const [pricingTicker, setPricingTicker] = useState("");

  // CAPM/APT State
  const [capmLoading, setCapmLoading] = useState(false);
  const [capmResult, setCapmResult] = useState<CAPMAPTResult | null>(null);
  const [capmTicker, setCapmTicker] = useState("");
  const [rfRate, setRfRate] = useState(4.25);
  const [marketReturn, setMarketReturn] = useState(10.0);

  // ETF State
  const [etfTicker, setEtfTicker] = useState("");
  const [etfCapital, setEtfCapital] = useState("10000");
  const [etfLeverage, setEtfLeverage] = useState("1");
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
    if (holdings.length > 0) {
        if (!pricingTicker) setPricingTicker(holdings[0].ticker);
        if (!capmTicker) setCapmTicker(holdings[0].ticker);
    }
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

    // Simulate stats
    const mean = (Math.random() * 0.08) - 0.02; // -2% to 6%
    const variance = Math.random() * 0.02;
    const deviation = Math.sqrt(variance);

    const newHolding: Holding = {
        ticker,
        quantity,
        avgBuyPrice,
        currentPrice,
        marketValue,
        pl,
        plPercent,
        mean,
        variance,
        deviation
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

  const handleAddInvestorView = () => {
      if (!newViewAsset1 || !newViewReturn) return;
      const view: InvestorView = {
          type: newViewType,
          asset1: newViewAsset1,
          asset2: newViewType === "Relative" ? newViewAsset2 : undefined,
          expectedReturn: parseFloat(newViewReturn),
          confidence: newViewConfidence
      };
      setInvestorViews(prev => [...prev, view]);
      setNewViewAsset1("");
      setNewViewAsset2("");
      setNewViewReturn("");
  };

  const handleRemoveInvestorView = (idx: number) => {
      setInvestorViews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleRunMPT = async () => {
    if (holdings.length === 0) return;
    setMptLoading(true);
    setMptResult(null);
    setShowConfirmRebalance(false);
    try {
        const result = await runMPTAnalysis(holdings, rebalanceStrategy, investorViews);
        setMptResult(result);
    } catch (e) {
        console.error(e);
    } finally {
        setMptLoading(false);
    }
  };

  const handleExecuteRebalance = () => {
    if (!mptResult || !mptResult.suggestions) return;

    setHoldings(prev => {
        let next = [...prev];
        
        mptResult.suggestions.forEach(suggestion => {
            const index = next.findIndex(h => h.ticker === suggestion.ticker);
            const holding = next[index];

            const parseAmount = (str: string, basePrice: number) => {
                const numeric = parseFloat(str.replace(/[^0-9.]/g, ''));
                if (str.includes('%')) return (totalValue * (numeric / 100)) / basePrice;
                if (str.includes('$')) return numeric / basePrice;
                return numeric;
            };

            const price = holding ? holding.currentPrice : (Math.random() * 200 + 50);
            const changeInShares = parseAmount(suggestion.amount, price);

            if (suggestion.action === "Buy") {
                if (index >= 0) {
                    const newQty = holding.quantity + changeInShares;
                    next[index] = { 
                        ...holding, 
                        quantity: newQty, 
                        marketValue: newQty * price,
                        pl: (newQty * price) - (newQty * holding.avgBuyPrice),
                        plPercent: (((newQty * price) - (newQty * holding.avgBuyPrice)) / (newQty * holding.avgBuyPrice)) * 100
                    };
                } else {
                    const marketValue = changeInShares * price;
                    next.push({
                        ticker: suggestion.ticker,
                        quantity: changeInShares,
                        avgBuyPrice: price,
                        currentPrice: price,
                        marketValue,
                        pl: 0,
                        plPercent: 0,
                        mean: (Math.random() * 0.05),
                        variance: Math.random() * 0.01,
                        deviation: Math.random() * 0.1
                    });
                }
            } else if (suggestion.action === "Sell") {
                if (index >= 0) {
                    const newQty = Math.max(0, holding.quantity - changeInShares);
                    if (newQty === 0) {
                        next.splice(index, 1);
                    } else {
                        next[index] = { 
                            ...holding, 
                            quantity: newQty,
                            marketValue: newQty * price,
                            pl: (newQty * price) - (newQty * holding.avgBuyPrice),
                            plPercent: (((newQty * price) - (newQty * holding.avgBuyPrice)) / (newQty * holding.avgBuyPrice)) * 100
                        };
                    }
                }
            }
        });
        return next;
    });

    setMptResult(null);
    setShowConfirmRebalance(false);
  };

  const handleRunHedge = async () => {
      if (holdings.length === 0) return;
      setHedgeLoading(true);
      setHedgeResult(null);
      try {
          const result = await runHedgeAnalysis(holdings);
          setHedgeResult(result);
      } catch (e) {
          console.error(e);
      } finally {
          setHedgeLoading(false);
      }
  };

  const handleRunAdvancedPricing = async () => {
      if (!pricingTicker) return;
      setPricingLoading(true);
      setPricingResult(null);
      try {
          const result = await runAdvancedPricingAnalysis(pricingTicker);
          setPricingResult(result);
      } catch (e) {
          console.error(e);
      } finally {
          setPricingLoading(false);
      }
  };

  const handleRunCAPMAPT = async () => {
      if (!capmTicker) return;
      setCapmLoading(true);
      setCapmResult(null);
      try {
          const result = await runCAPMAPTAnalysis(capmTicker, rfRate, marketReturn);
          setCapmResult(result);
      } catch (e) {
          console.error(e);
      } finally {
          setCapmLoading(false);
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
    if (!etfResult || !etfCapital || !etfResult.topHoldings) return;
    const baseCap = parseFloat(etfCapital);
    const leverage = parseFloat(etfLeverage) || 1;
    if (isNaN(baseCap)) return;

    const totalCap = baseCap * leverage;
    const newHoldings: Holding[] = [];

    etfResult.topHoldings.forEach(holding => {
        const allocationAmount = totalCap * (holding.weight / 100);
        const mockPrice = Math.random() * 200 + 50; 
        const qty = allocationAmount / mockPrice;

        const newHolding: Holding = {
            ticker: holding.ticker,
            quantity: qty,
            avgBuyPrice: mockPrice,
            currentPrice: mockPrice,
            marketValue: allocationAmount,
            pl: 0,
            plPercent: 0,
            mean: (Math.random() * 0.05),
            variance: Math.random() * 0.01,
            deviation: Math.random() * 0.1
        };
        newHoldings.push(newHolding);
    });

    setHoldings(newHoldings);
    setEtfResult(null);
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
             <div className="flex-1">
                <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 7.756a4.5 4.5 0 100 8.488M7.5 10.5h5.25m-5.25 3h5.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Total Portfolio Value
                </h2>
                <div className="text-4xl font-bold text-white">
                    ${(totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
             </div>
             
             <div className="bg-[#1e293b]/50 border border-purple-500/20 rounded-lg p-3 min-w-[200px]">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-1">Portfolio Net Gain</h3>
                <div className={`text-2xl font-bold font-mono ${totalPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {totalPL >= 0 ? '+' : ''}{(totalPL || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                        className={`h-full ${totalPL >= 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                        style={{width: `${Math.min(Math.abs((totalPL/totalValue)*100) * 5, 100)}%`}}
                    ></div>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 text-right">
                    Net Impact: {totalValue > 0 ? ((totalPL/totalValue)*100).toFixed(2) : 0}%
                </div>
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

        {/* Portfolio Hedging & Risk Diagnostics */}
        <div className="bg-[#0f172a] rounded-xl border border-pink-500/30 p-6 shadow-lg shadow-pink-900/10">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <svg className="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        Portfolio Hedging & Risk Diagnostics
                    </h3>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Multi-Asset Protection Assessment</p>
                </div>
                <button 
                    onClick={handleRunHedge}
                    disabled={hedgeLoading || holdings.length === 0}
                    className="bg-pink-600 hover:bg-pink-500 text-white text-xs font-black uppercase px-6 py-2.5 rounded-full transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-pink-900/40"
                >
                    {hedgeLoading ? 'Analyzing Performance...' : 'Run Diagnostics'}
                </button>
            </div>

            {hedgeResult ? (
                <div className="animate-fade-in space-y-8">
                    {/* Top Level Quant Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-[#1e293b]/50 border border-pink-500/10 p-4 rounded-2xl flex flex-col items-center text-center">
                            <span className="text-[9px] text-slate-500 font-black uppercase mb-2">Hedging Efficiency</span>
                            <div className="text-2xl font-black text-pink-400">{hedgeResult.metrics.hedgingEfficiency}%</div>
                            <div className="w-full h-1 bg-slate-800 rounded-full mt-2">
                                <div className="h-full bg-pink-500" style={{width: `${hedgeResult.metrics.hedgingEfficiency}%`}}></div>
                            </div>
                        </div>
                        <div className="bg-[#1e293b]/50 border border-emerald-500/10 p-4 rounded-2xl flex flex-col items-center text-center">
                            <span className="text-[9px] text-slate-500 font-black uppercase mb-2">Beta Reduction</span>
                            <div className="text-2xl font-black text-emerald-400">
                                {hedgeResult.metrics.unhedgedBeta.toFixed(2)} <span className="text-slate-600 text-sm">→</span> {hedgeResult.metrics.hedgedBeta.toFixed(2)}
                            </div>
                            <span className="text-[8px] text-slate-500 mt-1 uppercase font-bold">Systemic Offset</span>
                        </div>
                        <div className="bg-[#1e293b]/50 border border-cyan-500/10 p-4 rounded-2xl flex flex-col items-center text-center">
                            <span className="text-[9px] text-slate-500 font-black uppercase mb-2">VaR Reduction (95%)</span>
                            <div className="text-2xl font-black text-cyan-400">
                                {hedgeResult.metrics.varianceReduction}%
                            </div>
                            <span className="text-[8px] text-slate-500 mt-1 uppercase font-bold">Tail Mitigation</span>
                        </div>
                        <div className="bg-[#1e293b]/50 border border-amber-500/10 p-4 rounded-2xl flex flex-col items-center text-center">
                            <span className="text-[9px] text-slate-500 font-black uppercase mb-2">CVaR (Hedged)</span>
                            <div className="text-2xl font-black text-amber-400">
                                ${(hedgeResult.metrics.hedgedCVaR || 0).toLocaleString()}
                            </div>
                            <span className="text-[8px] text-slate-500 mt-1 uppercase font-bold">Expectation of Tail</span>
                        </div>
                    </div>

                    {/* Historical Comparison Chart */}
                    <div className="bg-[#0b0e14] p-6 rounded-2xl border border-white/5">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Historical Comparison: Unhedged vs. Hedged P&L</h4>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={hedgeResult.pnlComparison}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#475569" tick={{fontSize: 9, fontFamily: 'monospace'}} axisLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                                    <Legend iconType="circle" wrapperStyle={{fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold'}} />
                                    <Line type="monotone" name="Unhedged Strategy" dataKey="unhedgedPnl" stroke="#ef4444" strokeWidth={1} dot={false} strokeDasharray="5 5" />
                                    <Area type="monotone" name="Hedged Portfolio" dataKey="hedgedPnl" stroke="#ec4899" strokeWidth={3} fill="#ec4899" fillOpacity={0.1} dot={{r: 2}} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Asset Exposure Table */}
                    <div className="bg-[#0b0e14] rounded-2xl border border-white/5 overflow-hidden">
                        <div className="px-6 py-4 bg-slate-900/50 border-b border-white/5">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Residual Exposure & Coverage Diagnostics</h4>
                        </div>
                        <table className="w-full text-left">
                            <thead className="text-[9px] font-black text-slate-500 uppercase tracking-tighter border-b border-white/5 bg-black/20">
                                <tr>
                                    <th className="px-6 py-3">Asset Instance</th>
                                    <th className="px-6 py-3 text-right">Gross Exp.</th>
                                    <th className="px-6 py-3 text-right">Net Exp.</th>
                                    <th className="px-6 py-3 text-center">Hedge Coverage</th>
                                    <th className="px-6 py-3 text-right">Carry Cost</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-[11px]">
                                {hedgeResult.exposures.map((ex, i) => (
                                    <tr key={i} className="hover:bg-pink-500/5 transition-colors">
                                        <td className="px-6 py-3 font-bold text-white uppercase">{ex.asset}</td>
                                        <td className="px-6 py-3 text-right text-slate-400 font-mono">${ex.grossExposure.toLocaleString()}</td>
                                        <td className="px-6 py-3 text-right text-white font-mono font-bold">${ex.netExposure.toLocaleString()}</td>
                                        <td className="px-6 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-pink-500" style={{width: `${ex.hedgingCoverage}%`}}></div>
                                                </div>
                                                <span className="font-mono text-slate-400">{ex.hedgingCoverage}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-right text-rose-400 font-mono">-${ex.costOfHedge.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-900/40 p-6 rounded-2xl border border-pink-500/10">
                            <h4 className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <div className="w-1 h-3 bg-pink-500"></div>
                                Risk Desk Synthesis
                            </h4>
                            <p className="text-sm text-slate-300 italic leading-relaxed">"{hedgeResult.summary}"</p>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Actionable Optimization Insights</h4>
                            {hedgeResult.recommendations.map((rec, i) => (
                                <div key={i} className="bg-[#131b2e] border border-white/5 p-4 rounded-xl flex gap-4 items-start group hover:border-pink-500/30 transition-all">
                                    <div className={`mt-1 text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${rec.priority === 'High' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                        {rec.priority}
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-bold text-white mb-1 group-hover:text-pink-300 transition-colors">{rec.title}</div>
                                        <p className="text-[10px] text-slate-500 leading-snug">{rec.action}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl group relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.05)_0,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <svg className="w-16 h-16 text-slate-800 mb-4 group-hover:text-pink-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700 mb-2">Initialize Risk Audit</span>
                    <p className="text-[10px] text-slate-500 max-w-xs text-center leading-relaxed">Quant engine requires portfolio composition to perform variance-reduction analysis and VaR modeling.</p>
                </div>
            )}
        </div>

        {/* Capital Asset Modeling (CAPM & APT) */}
        <div className="bg-[#0f172a] rounded-xl border border-indigo-500/30 p-6 shadow-lg shadow-indigo-900/10">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Capital Asset Modeling (CAPM & APT)
                    </h3>
                    <p className="text-xs text-slate-400">Risk-adjusted return expectations and multi-factor macro sensitivity.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <div className="flex flex-col gap-1">
                        <span className="text-[8px] text-slate-500 uppercase font-bold">Asset</span>
                        <select 
                            value={capmTicker}
                            onChange={(e) => setCapmTicker(e.target.value)}
                            className="bg-[#1e293b] border border-indigo-500/30 text-xs text-white rounded px-2 py-1.5 outline-none"
                        >
                            {holdings.map(h => <option key={h.ticker} value={h.ticker}>{h.ticker}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[8px] text-slate-500 uppercase font-bold">Risk-Free %</span>
                        <input 
                            type="number" 
                            value={rfRate} 
                            onChange={(e) => setRfRate(parseFloat(e.target.value))}
                            className="bg-[#1e293b] border border-indigo-500/30 text-xs text-white rounded px-2 py-1 w-16 outline-none"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[8px] text-slate-500 uppercase font-bold">Market Ret %</span>
                        <input 
                            type="number" 
                            value={marketReturn} 
                            onChange={(e) => setMarketReturn(parseFloat(e.target.value))}
                            className="bg-[#1e293b] border border-indigo-500/30 text-xs text-white rounded px-2 py-1 w-16 outline-none"
                        />
                    </div>
                    <button 
                        onClick={handleRunCAPMAPT}
                        disabled={capmLoading || !capmTicker}
                        className="self-end bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-900/40"
                    >
                        {capmLoading ? 'Modeling...' : 'Model Asset'}
                    </button>
                </div>
            </div>

            {capmResult ? (
                <div className="animate-fade-in space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#1e293b]/50 border border-indigo-500/20 p-5 rounded-xl">
                            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">CAPM Performance</h4>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="text-center bg-slate-900/50 p-2 rounded border border-slate-700">
                                    <div className="text-[10px] text-slate-500 uppercase">Expected Return (Ke)</div>
                                    <div className="text-lg font-mono text-white">{(capmResult.capm?.expectedReturn || 0).toFixed(2)}%</div>
                                </div>
                                <div className="text-center bg-slate-900/50 p-2 rounded border border-slate-700">
                                    <div className="text-[10px] text-slate-500 uppercase">Beta (β)</div>
                                    <div className="text-lg font-mono text-white">{(capmResult.capm?.beta || 0).toFixed(2)}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex justify-between text-xs px-2">
                                    <span className="text-slate-500">Alpha (α)</span>
                                    <span className={`font-bold ${(capmResult.capm?.alpha || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{(capmResult.capm?.alpha || 0).toFixed(2)}%</span>
                                </div>
                                <div className="flex justify-between text-xs px-2">
                                    <span className="text-slate-500">SML Status</span>
                                    <span className={`font-bold ${capmResult.capm?.securityMarketLineStatus === 'Above' ? 'text-green-400' : 'text-amber-400'}`}>{capmResult.capm?.securityMarketLineStatus || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#1e293b]/50 border border-emerald-500/20 p-5 rounded-xl">
                            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4">APT Factor Sensitivities</h4>
                            <div className="space-y-3">
                                {(capmResult.apt?.factors || []).map((f: any, i: number) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-[10px] mb-1">
                                            <span className="text-slate-400 font-bold uppercase">{f.name}</span>
                                            <span className="text-emerald-300 font-mono">β: {(f.beta || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${f.beta > 1 ? 'bg-emerald-500' : f.beta > 0 ? 'bg-emerald-400' : 'bg-red-400'}`} 
                                                style={{ width: `${Math.min(Math.abs(f.beta || 0) * 50, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-700/50 flex justify-between items-center">
                                <span className="text-[10px] text-slate-500 uppercase font-bold">Total Macro Expectation</span>
                                <span className="text-sm font-mono font-bold text-white">{(capmResult.apt?.totalExpectedReturn || 0).toFixed(2)}%</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-indigo-900/10 p-5 rounded-xl border border-indigo-500/10">
                        <h4 className="text-xs font-bold text-indigo-500 uppercase mb-2">Modeling Synthesis</h4>
                        <p className="text-sm text-slate-300 italic leading-relaxed">"{capmResult.summary}"</p>
                    </div>
                </div>
            ) : (
                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl">
                    <svg className="w-12 h-12 text-slate-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                    <p className="text-sm text-slate-600">Select an asset to run CAPM and APT risk modeling.</p>
                </div>
            )}
        </div>

        {/* Advanced Quant Pricing Engine */}
        <div className="bg-[#0f172a] rounded-xl border border-cyan-500/30 p-6 shadow-lg shadow-cyan-900/10 relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-6 relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Advanced Quant Pricing Engine
                    </h3>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Multi-Model Calibration Suite</p>
                </div>
                <div className="flex gap-2">
                    <select 
                        value={pricingTicker}
                        onChange={(e) => setPricingTicker(e.target.value)}
                        className="bg-[#1e293b] border border-cyan-500/30 text-xs text-white rounded px-3 py-2 outline-none"
                    >
                        {holdings.map(h => <option key={h.ticker} value={h.ticker}>{h.ticker}</option>)}
                    </select>
                    <button 
                        onClick={handleRunAdvancedPricing}
                        disabled={pricingLoading || !pricingTicker}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase px-4 py-2 rounded transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-cyan-900/40"
                    >
                        {pricingLoading ? 'Recalibrating...' : 'Start Audit'}
                    </button>
                </div>
            </div>

            {pricingResult ? (
                <div className="animate-fade-in space-y-6 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <DiagnosticBadge label="S₀ Spot" status={pricingResult.diagnostics.spotPrice} />
                        <DiagnosticBadge label="Option Chain" status={pricingResult.diagnostics.optionChain} />
                        <DiagnosticBadge label="Yield Curve" status={pricingResult.diagnostics.yieldCurve} />
                        <DiagnosticBadge label="Dividends" status={pricingResult.diagnostics.dividendYield} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className={`bg-[#1e293b]/50 border p-5 rounded-xl transition-all ${pricingResult.bsm?.fairValue === 0 ? 'border-rose-500/20 grayscale opacity-60' : 'border-cyan-500/20 shadow-lg shadow-cyan-950/20'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">BSM Analytic</h4>
                                {pricingResult.bsm?.fairValue === 0 && <span className="text-[8px] px-1.5 py-0.5 rounded bg-rose-500 text-white font-black uppercase">Failure</span>}
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="text-center bg-slate-900/50 p-2 rounded border border-slate-700">
                                    <div className="text-[10px] text-slate-500 uppercase">FAIR VALUE</div>
                                    <div className="text-lg font-mono text-white">${(pricingResult.bsm?.fairValue || 0).toFixed(2)}</div>
                                </div>
                                <div className="text-center bg-slate-900/50 p-2 rounded border border-slate-700">
                                    <div className="text-[10px] text-slate-500 uppercase">IMPLIED VOL (σ)</div>
                                    <div className="text-lg font-mono text-white">{((pricingResult.bsm?.impliedVol || 0) * 100).toFixed(1)}%</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-5 gap-2 text-center">
                                {pricingResult.bsm?.greeks && Object.entries(pricingResult.bsm.greeks).map(([name, val]) => (
                                    <div key={name}>
                                        <div className="text-[8px] text-slate-600 uppercase font-black">{name}</div>
                                        <div className="text-[10px] font-mono text-cyan-300">{(val as number || 0).toFixed(3)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={`bg-[#1e293b]/50 border p-5 rounded-xl transition-all ${pricingResult.heston?.surfaceStatus === "N/A" ? 'border-rose-500/20 grayscale opacity-60' : 'border-purple-500/20 shadow-lg shadow-purple-950/20'}`}>
                            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">Heston Stochastic Vol</h4>
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {pricingResult.heston?.parameters && Object.entries(pricingResult.heston.parameters).map(([key, val]) => (
                                    <div key={key} className="bg-slate-900/50 p-1.5 rounded text-center border border-slate-700/50">
                                        <div className="text-[8px] text-slate-500 font-bold uppercase">{key}</div>
                                        <div className="text-xs font-mono text-purple-300">{(val as number || 0).toFixed(3)}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="text-xs bg-purple-900/10 p-2 rounded border border-purple-500/10">
                                <span className="font-bold text-purple-400">Skew/Smile:</span> {pricingResult.heston?.surfaceStatus || 'N/A'}
                                <p className="text-[10px] text-slate-400 mt-1 leading-tight">{pricingResult.heston?.description}</p>
                            </div>
                        </div>

                        <div className={`bg-[#1e293b]/50 border p-5 rounded-xl transition-all ${pricingResult.jumpDiffusion?.jumpProbability === 0 ? 'border-rose-500/20 grayscale opacity-60' : 'border-amber-500/20 shadow-lg shadow-amber-950/20'}`}>
                            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">Merton Jump Diffusion</h4>
                            <div className="flex items-center gap-6 mb-4">
                                <div className="flex-1">
                                    <div className="flex justify-between text-[10px] mb-1">
                                        <span className="text-slate-500 uppercase">Jump Probability</span>
                                        <span className="text-amber-300 font-bold">{((pricingResult.jumpDiffusion?.jumpProbability || 0) * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{width: `${(pricingResult.jumpDiffusion?.jumpProbability || 0) * 100}%`}}></div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[8px] text-slate-600 font-bold uppercase">λ (Lambda)</div>
                                    <div className="text-lg font-mono text-white">{(pricingResult.jumpDiffusion?.parameters?.lambda || 0).toFixed(2)}</div>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 italic leading-snug">{pricingResult.jumpDiffusion?.description}</p>
                        </div>

                        <div className={`bg-[#1e293b]/50 border p-5 rounded-xl transition-all ${pricingResult.varianceSwap?.fairVarianceStrike === 0 ? 'border-rose-500/20 grayscale opacity-60' : 'border-green-500/20 shadow-lg shadow-green-950/20'}`}>
                            <h4 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-4">Variance Swap Strike</h4>
                            <div className="bg-slate-900/50 p-3 rounded border border-slate-700 mb-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-500 uppercase">Fair Variance Strike</span>
                                    <span className="text-xl font-mono text-green-400 font-bold">{(pricingResult.varianceSwap?.fairVarianceStrike || 0).toFixed(4)}</span>
                                </div>
                            </div>
                            <div className="text-[10px] text-slate-400 leading-tight">
                                <div className="font-bold text-slate-500 mb-1 uppercase tracking-tighter">Payoff Topology</div>
                                {pricingResult.varianceSwap?.payoffDescription || 'N/A'}
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-[#020617] to-cyan-900/10 p-8 rounded-2xl border border-white/5 relative">
                        <div className="absolute top-4 right-8 text-[10px] font-black text-slate-800 uppercase tracking-[0.5em] select-none">Hedge Fund Audit</div>
                        <h4 className="text-xs font-black text-cyan-400 uppercase mb-4 flex items-center gap-2">
                             <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                             Quant Audit Synthesis
                        </h4>
                        <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap italic opacity-90 border-l border-white/10 pl-6">
                            {pricingResult.summary}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl group relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <svg className="w-16 h-16 text-slate-800 mb-4 group-hover:text-cyan-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700 mb-2">Initialize Model Simulation</span>
                    <p className="text-[10px] text-slate-500 max-w-xs text-center leading-relaxed">System requires valid spot prices and yield curve specification to perform risk-neutral valuation.</p>
                </div>
            )}
        </div>

        {/* Holdings Table */}
        <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 overflow-hidden shadow-lg">
            <div className="p-6 border-b border-purple-500/20 flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-xl font-semibold text-white">Current Holdings</h3>
                <div className="flex gap-2 w-full md:w-auto">
                    <select 
                        value={rebalanceStrategy}
                        onChange={(e) => setRebalanceStrategy(e.target.value)}
                        className="bg-[#1e293b] border border-purple-500/30 text-xs text-white rounded px-3 py-2 outline-none focus:border-purple-500"
                    >
                        <option value="Time-based (Monthly)">Time-based (Monthly)</option>
                        <option value="Time-based (Quarterly)">Time-based (Quarterly)</option>
                        <option value="Threshold-based (>5%)">Threshold-based ({'>'}5%)</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Black-Litterman Model">Black-Litterman Model</option>
                    </select>
                    <button 
                        onClick={handleRunMPT}
                        disabled={mptLoading || holdings.length < 2}
                        className={`text-xs font-bold uppercase tracking-wide px-4 py-2 rounded transition-all border whitespace-nowrap ${(mptLoading || holdings.length < 2) ? 'bg-slate-800 text-slate-500 border-transparent cursor-not-allowed' : 'bg-purple-900/20 text-purple-400 border-purple-500/50 hover:bg-purple-900/40 hover:text-purple-200'}`}
                    >
                        {mptLoading ? "Running Strategy..." : "Run Strategy"}
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#1e293b]/50 text-slate-400 text-xs uppercase tracking-wider">
                            <th className="p-4 whitespace-nowrap">Asset</th>
                            <th className="p-4 text-right whitespace-nowrap">Qty</th>
                            <th className="p-4 text-right whitespace-nowrap">Avg Price</th>
                            <th className="p-4 text-right whitespace-nowrap">Cur. Price</th>
                            <th className="p-4 text-right whitespace-nowrap">Value</th>
                            <th className="p-4 text-right whitespace-nowrap">P/L</th>
                            <th className="p-4 text-right whitespace-nowrap">Mean</th>
                            <th className="p-4 text-right whitespace-nowrap">Variance</th>
                            <th className="p-4 text-right whitespace-nowrap">Deviation</th>
                            <th className="p-4 text-center whitespace-nowrap">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/10 text-sm">
                        {holdings.length === 0 ? (
                             <tr>
                                <td colSpan={10} className="p-8 text-center text-slate-500">No assets in portfolio. Add some above.</td>
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
                                    <td className="p-4 text-right text-slate-300 font-mono">{holding.quantity.toFixed(2)}</td>
                                    <td className="p-4 text-right text-slate-300 font-mono">${holding.avgBuyPrice.toFixed(2)}</td>
                                    <td className="p-4 text-right text-slate-300 font-mono">${holding.currentPrice.toFixed(2)}</td>
                                    <td className="p-4 text-right font-medium text-white font-mono">${(holding.marketValue || 0).toLocaleString()}</td>
                                    <td className={`p-4 text-right font-medium font-mono ${holding.pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {holding.pl >= 0 ? '+' : ''}{holding.pl.toFixed(2)} <br/>
                                        <span className="text-[10px] opacity-75">({holding.plPercent.toFixed(2)}%)</span>
                                    </td>
                                    <td className="p-4 text-right text-slate-300 font-mono">{(holding.mean ? holding.mean * 100 : 0).toFixed(2)}%</td>
                                    <td className="p-4 text-right text-slate-400 font-mono">{(holding.variance || 0).toFixed(4)}</td>
                                    <td className="p-4 text-right text-purple-300 font-mono">{(holding.deviation || 0).toFixed(3)}</td>
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
      </div>

      <div className="space-y-6">
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
                     <button type="submit" disabled={!etfTicker || etfLoading} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded text-sm disabled:opacity-50">
                         {etfLoading ? 'Scanning...' : 'Scan'}
                     </button>
                 </div>
             </form>
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
                            <div className="bg-purple-600 h-2 rounded-full transition-all duration-500" style={{ width: `${totalValue > 0 ? (h.marketValue / totalValue) * 100 : 0}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default PortfolioView;
