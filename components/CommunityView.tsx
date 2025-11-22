import React, { useState } from "react";
import { getCommunityInsights } from "../services/geminiService";
import { CommunityInsightResult } from "../types";
import SearchBar from "./SearchBar";

const CommunityView: React.FC = () => {
  const [ticker, setTicker] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<CommunityInsightResult | null>(null);

  const handleSearch = async (searchTerm: string) => {
    setTicker(searchTerm);
    setIsLoading(true);
    setData(null);
    try {
      const result = await getCommunityInsights(searchTerm);
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fade-in space-y-8">
      <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-6 shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-pink-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 5.472m0 0a9.09 9.09 0 00-3.246 1.514m3.246-1.514a6.189 6.189 0 01.18.651C.57 19.063 0 19.989 0 21h6a6 6 0 016-6 6 6 0 016 6h6c0-1.01-.57-1.937-1.409-2.527z" />
            </svg>
            Community & Institutional Intelligence
          </h2>
          <p className="text-slate-400 text-sm">Aggregate sentiment from Retail Traders, Hedge Funds, and Professional Analysts.</p>
        </div>

        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sentiment Gauges */}
          <div className="lg:col-span-3 bg-[#0f172a] rounded-xl border border-slate-800 p-6 flex flex-col md:flex-row gap-8 justify-around items-center">
            <div className="text-center w-full">
               <h3 className="text-slate-400 uppercase text-xs font-bold mb-4">Retail Sentiment</h3>
               <div className="relative h-4 bg-slate-800 rounded-full w-full overflow-hidden">
                 <div 
                    className={`h-full transition-all duration-1000 ${data.retailSentiment > 50 ? 'bg-green-500' : 'bg-red-500'}`} 
                    style={{width: `${data.retailSentiment}%`}}
                 ></div>
               </div>
               <div className="flex justify-between text-xs mt-2 font-mono">
                  <span className="text-red-400">Bearish</span>
                  <span className="text-white font-bold text-lg">{data.retailSentiment}/100</span>
                  <span className="text-green-400">Bullish</span>
               </div>
            </div>

            <div className="hidden md:block w-px h-24 bg-slate-800"></div>

            <div className="text-center w-full">
               <h3 className="text-slate-400 uppercase text-xs font-bold mb-4">Institutional Sentiment (Smart Money)</h3>
               <div className="relative h-4 bg-slate-800 rounded-full w-full overflow-hidden">
                 <div 
                    className={`h-full transition-all duration-1000 ${data.institutionalSentiment > 50 ? 'bg-blue-500' : 'bg-orange-500'}`} 
                    style={{width: `${data.institutionalSentiment}%`}}
                 ></div>
               </div>
               <div className="flex justify-between text-xs mt-2 font-mono">
                  <span className="text-orange-400">Sell-off</span>
                  <span className="text-white font-bold text-lg">{data.institutionalSentiment}/100</span>
                  <span className="text-blue-400">Accumulation</span>
               </div>
            </div>
          </div>

          {/* Discussion Feed */}
          <div className="lg:col-span-2 bg-[#0f172a] rounded-xl border border-slate-800 p-6">
             <h3 className="text-lg font-bold text-white mb-4">Trending Community Topics</h3>
             <div className="space-y-4">
                {data.forumTopics.map((topic, i) => (
                    <div key={i} className="bg-[#1e293b] p-4 rounded-lg border border-slate-700 flex justify-between items-center">
                        <div className="flex items-start gap-3">
                             <div className={`p-2 rounded-full ${
                                topic.platform === 'Reddit' ? 'bg-orange-900/30 text-orange-500' :
                                topic.platform === 'Twitter' ? 'bg-blue-900/30 text-blue-400' :
                                'bg-indigo-900/30 text-indigo-400'
                             }`}>
                                {topic.platform === 'Reddit' && <span className="font-bold text-xs">r/</span>}
                                {topic.platform === 'Twitter' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>}
                                {topic.platform === 'Discord' && <span className="font-bold text-xs">D</span>}
                             </div>
                             <div>
                                <p className="text-sm text-slate-200 font-medium">"{topic.topic}"</p>
                                <p className="text-xs text-slate-500 mt-1">{topic.mentions.toLocaleString()} mentions in last 24h</p>
                             </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            topic.sentiment === 'Bullish' ? 'bg-green-900/20 text-green-400 border border-green-800' :
                            topic.sentiment === 'Bearish' ? 'bg-red-900/20 text-red-400 border border-red-800' :
                            'bg-slate-700 text-slate-300'
                        }`}>
                            {topic.sentiment}
                        </span>
                    </div>
                ))}
             </div>
             
             <div className="mt-6 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-bold text-slate-400 mb-2">Insight Summary</h3>
                <p className="text-slate-300 text-sm leading-relaxed bg-slate-800/30 p-3 rounded italic">
                    {data.summary}
                </p>
             </div>
          </div>

          {/* Institutional Data */}
          <div className="space-y-6">
             {/* Hedge Fund Activity */}
             <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Hedge Fund Flows
                </h3>
                <div className="space-y-3">
                    {data.hedgeFundActivity.map((act, i) => (
                        <div key={i} className="flex justify-between items-center text-sm border-b border-slate-800 pb-2 last:border-0">
                            <div>
                                <div className="text-slate-200 font-medium">{act.fundName}</div>
                                <div className="text-xs text-slate-500">{act.date}</div>
                            </div>
                            <div className="text-right">
                                <div className={`font-bold ${act.action === 'Bought' ? 'text-green-400' : act.action === 'Sold' ? 'text-red-400' : 'text-yellow-400'}`}>
                                    {act.action}
                                </div>
                                <div className="text-xs text-slate-400">{act.shares} shares</div>
                            </div>
                        </div>
                    ))}
                </div>
             </div>

            {/* Analyst Consensus */}
            <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Wall St. Consensus</h3>
                <div className="flex items-center justify-center mb-4">
                    <div className={`text-3xl font-bold ${
                        data.analystRatings.consensus.includes('Buy') ? 'text-green-400' :
                        data.analystRatings.consensus.includes('Sell') ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                        {data.analystRatings.consensus}
                    </div>
                </div>
                <div className="flex justify-between text-xs uppercase font-bold text-slate-500 mb-1">
                    <span>Buy ({data.analystRatings.buy})</span>
                    <span>Hold ({data.analystRatings.hold})</span>
                    <span>Sell ({data.analystRatings.sell})</span>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full" style={{flex: data.analystRatings.buy}}></div>
                    <div className="bg-yellow-500 h-full" style={{flex: data.analystRatings.hold}}></div>
                    <div className="bg-red-500 h-full" style={{flex: data.analystRatings.sell}}></div>
                </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default CommunityView;