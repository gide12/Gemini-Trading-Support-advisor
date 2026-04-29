import React from 'react';
import { Newspaper, TrendingUp, TrendingDown, Globe, Zap, ShieldAlert, Activity, ArrowRight } from 'lucide-react';

const NEWS_ITEMS = [
  {
    id: 1,
    category: "BREAKING",
    title: "Polymarket Odds Shift: 2026 Rate Cuts Priced Out Following Hot CPI Print",
    source: "Bloomberg Terminal",
    time: "10m ago",
    impact: "High",
    sentiment: "negative",
    summary: "Prediction markets have aggressively repriced the Fed's path, with the probability of a 25bps cut in Q2 dropping from 65% to 12% in the last hour.",
    url: "https://www.bloomberg.com",
  },
  {
    id: 2,
    category: "HEDGE FUND",
    title: "Citadel, Millennium Expand Multi-Manager Pods in Asia Amid China Rebound",
    source: "Financial Times",
    time: "45m ago",
    impact: "Medium",
    sentiment: "positive",
    summary: "Top-tier multi-strategy funds are deploying significant capital to Hong Kong and Singapore, hunting for alpha in Asian equities as local markets show signs of bottoming.",
    url: "https://www.ft.com",
  },
  {
    id: 3,
    category: "MACRO",
    title: "BOJ Unexpectedly Hikes Rates by 25bps, Yen Surges Across the Board",
    source: "Reuters",
    time: "2h ago",
    impact: "High",
    sentiment: "neutral",
    summary: "The Bank of Japan surprised markets with a hawkish tilt, sending USD/JPY tumbling 2% and triggering a global unwind of yen-funded carry trades.",
    url: "https://www.reuters.com",
  },
  {
    id: 4,
    category: "FINANCIAL",
    title: "NVIDIA Earnings Beat Estimates, Forward Guidance Raised on Next-Gen AI Chips",
    source: "WSJ",
    time: "3h ago",
    impact: "High",
    sentiment: "positive",
    summary: "The semiconductor giant reported record data center revenue, crushing consensus estimates and raising Q3 guidance by $2 billion.",
    url: "https://www.wsj.com",
  },
  {
    id: 5,
    category: "CRYPTO",
    title: "SEC Proposes New Disclosure Rules for Dark Pool Volumes and Crypto ETFs",
    source: "SEC.gov",
    time: "4h ago",
    impact: "Medium",
    sentiment: "negative",
    summary: "New regulatory framework aims to increase transparency in off-exchange trading venues and standardize reporting for digital asset funds.",
    url: "https://www.sec.gov",
  },
  {
    id: 6,
    category: "POLYMARKET",
    title: "Election 2026: Prediction Markets Show Tightening Race in Key Swing States",
    source: "Polymarket Data",
    time: "5h ago",
    impact: "Medium",
    sentiment: "neutral",
    summary: "Trading volume on political outcome contracts hits record highs as polls narrow, with institutional hedging activity detected.",
    url: "https://polymarket.com",
  },
  {
    id: 7,
    category: "FOREX",
    title: "EUR/USD Breaks Key Resistance as ECB Signals Potential Rate Hold",
    source: "ForexLive",
    time: "1h ago",
    impact: "High",
    sentiment: "positive",
    summary: "The Euro surged past the 1.1000 level against the dollar following comments from ECB officials suggesting a pause in the current easing cycle.",
    url: "https://www.forexlive.com",
  }
];

const NewsFrontView: React.FC = () => {
  return (
    <div className="space-y-6 fade-in">
      {/* Header Section */}
      <div className="flex justify-between items-end border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-cyan-400" />
            Global News Feed
          </h2>
          <p className="text-sm text-slate-400 mt-1">Real-time market intelligence, macro events, and alternative data</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          Live Updates Active
        </div>
      </div>

      {/* Top Section: Featured Story */}
      <div className="grid grid-cols-1 gap-6">
        {/* Featured Story */}
        <div 
          className="bg-gradient-to-br from-[#0f172a] to-[#0B1221] rounded-xl border border-cyan-500/30 p-6 shadow-lg relative overflow-hidden group cursor-pointer"
          onClick={() => window.open(NEWS_ITEMS[0].url, '_blank')}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2.5 py-1 bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider rounded border border-red-500/30 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Breaking
            </span>
            <span className="text-xs text-slate-500 font-mono">10m ago • Bloomberg Terminal</span>
          </div>
          
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
            Polymarket Odds Shift: 2026 Rate Cuts Priced Out Following Hot CPI Print
          </h3>
          
          <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-6 max-w-3xl">
            Prediction markets have aggressively repriced the Fed's path, with the probability of a 25bps cut in Q2 dropping from 65% to 12% in the last hour. Institutional flow indicates a rapid unwind of duration positioning.
          </p>
          
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
            Read Full Analysis <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* News Feed Grid */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-slate-400" />
          Latest Intelligence
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {NEWS_ITEMS.slice(1).map((news) => (
            <div 
              key={news.id} 
              className="bg-[#0f172a] rounded-xl border border-slate-800 p-5 shadow-lg hover:border-cyan-500/30 transition-colors cursor-pointer flex flex-col h-full group"
              onClick={() => window.open(news.url, '_blank')}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${
                  news.category === 'HEDGE FUND' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                  news.category === 'MACRO' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  news.category === 'POLYMARKET' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  news.category === 'FOREX' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {news.category}
                </span>
                <span className="text-xs text-slate-500 font-mono">{news.time}</span>
              </div>
              
              <h4 className="text-lg font-bold text-slate-200 mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">
                {news.title}
              </h4>
              
              <p className="text-sm text-slate-400 line-clamp-3 mb-4 flex-1">
                {news.summary}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/50">
                <span className="text-xs text-slate-500">{news.source}</span>
                <div className="flex items-center gap-1">
                  {news.sentiment === 'positive' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                  {news.sentiment === 'negative' && <TrendingDown className="w-3 h-3 text-red-400" />}
                  {news.sentiment === 'neutral' && <Activity className="w-3 h-3 text-slate-400" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsFrontView;
