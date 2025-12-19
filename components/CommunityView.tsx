
import React from "react";

const INSTITUTION_PRESETS = [
    // Universities
    { name: "Harvard Management Co", type: "University", label: "Harvard", url: "https://www.hmc.harvard.edu/" },
    { name: "MIT Investment Mgmt", type: "University", label: "MIT", url: "https://mitimco.org/" },
    { name: "Oxford University Endowment", type: "University", label: "Oxford", url: "https://www.ouem.co.uk/" },
    { name: "Yale Investments Office", type: "University", label: "Yale", url: "https://investments.yale.edu/" },
    { name: "Stanford Management Co", type: "University", label: "Stanford", url: "https://smc.stanford.edu/" },
    { name: "Princeton Univ. Investment", type: "University", label: "Princeton", url: "https://princeton.edu/finance-treasury/princo" },

    // Asset Managers & ETFs
    { name: "BlackRock", type: "Asset Manager", label: "BlackRock", url: "https://www.blackrock.com/" },
    { name: "Vanguard", type: "Asset Manager", label: "Vanguard", url: "https://investor.vanguard.com/" },
    { name: "State Street Global", type: "Asset Manager", label: "State Street", url: "https://www.ssga.com/" },
    { name: "Fidelity Investments", type: "Asset Manager", label: "Fidelity", url: "https://www.fidelity.com/" },

    // Investment Banks
    { name: "J.P. Morgan Asset Mgmt", type: "Bank", label: "J.P. Morgan", url: "https://am.jpmorgan.com/" },
    { name: "Goldman Sachs", type: "Bank", label: "Goldman Sachs", url: "https://www.goldmansachs.com/" },
    { name: "Morgan Stanley", type: "Bank", label: "Morgan Stanley", url: "https://www.morganstanley.com/" },

    // Hedge Funds / Quants
    { name: "Citadel LLC", type: "Hedge Fund", label: "Citadel", url: "https://www.citadel.com/" },
    { name: "Bridgewater Associates", type: "Hedge Fund", label: "Bridgewater", url: "https://www.bridgewater.com/" },
    { name: "Renaissance Technologies", type: "Hedge Fund", label: "RenTech", url: "https://www.rentec.com/" },
    { name: "Point72", type: "Hedge Fund", label: "Point72", url: "https://www.point72.com/" },
];

const COMMUNITY_PRESETS = [
    { name: "r/wallstreetbets", type: "Social", label: "WSB", desc: "High-risk bets & meme stocks", url: "https://www.reddit.com/r/wallstreetbets/" },
    { name: "r/stocks", type: "Social", label: "Reddit Stocks", desc: "Serious analysis & market news", url: "https://www.reddit.com/r/stocks/" },
    { name: "r/investing", type: "Social", label: "Investing", desc: "Long-term & retirement focus", url: "https://www.reddit.com/r/investing/" },
    { name: "StockTwits", type: "Social", label: "StockTwits", desc: "Real-time sentiment & social", url: "https://stocktwits.com/" },
    { name: "InvestorsHub", type: "Forum", label: "iHub", desc: "Penny stocks & OTC boards", url: "https://investorshub.advfn.com/" },
    { name: "Wall Street Oasis", type: "Pro Forum", label: "WSO", desc: "Finance career & pro insights", url: "https://www.wallstreetoasis.com/" },
    { name: "ValuePickr", type: "Forum", label: "ValuePickr", desc: "Mid/Small cap value investing", url: "https://forum.valuepickr.com/" },
    { name: "Elite Trader", type: "Trading", label: "Elite Trader", desc: "Advanced technical strategies", url: "https://www.elitetrader.com/" },
    { name: "Trade2Win", type: "Trading", label: "Trade2Win", desc: "Global trading community", url: "https://www.trade2win.com/" },
];

const CommunityView: React.FC = () => {
  const getDomain = (url: string) => {
      try {
          return new URL(url).hostname;
      } catch {
          return "";
      }
  };

  return (
    <div className="fade-in space-y-10 pb-20">
      {/* Intro Section */}
      <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] rounded-2xl border border-purple-500/30 p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-48 h-48 text-purple-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            Global Alpha Network
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            Direct gateway to institutional research, professional forums, and high-velocity social trading communities.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        
        {/* Section 1: Trading Communities */}
        <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
                <div className="w-1.5 h-8 bg-pink-500 rounded-full"></div>
                <div>
                    <h3 className="text-xl font-bold text-white">Trading Communities</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Social Sentiment & Discussion</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {COMMUNITY_PRESETS.map((comm) => {
                    const domain = getDomain(comm.url);
                    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
                    
                    return (
                        <a
                            key={comm.name}
                            href={comm.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group bg-[#0f172a] border border-slate-700/50 hover:border-pink-500/50 p-4 rounded-xl transition-all duration-300 flex items-center gap-4 hover:shadow-xl hover:shadow-pink-900/10 hover:-translate-y-1"
                        >
                            <div className="w-12 h-12 shrink-0 rounded-lg bg-slate-800 p-2 border border-slate-700 overflow-hidden flex items-center justify-center">
                                <img 
                                    src={faviconUrl} 
                                    alt={comm.label} 
                                    className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).parentElement!.innerText = comm.label[0];
                                    }}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-200 group-hover:text-white transition-colors truncate">{comm.name}</span>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 uppercase font-black">{comm.type}</span>
                                </div>
                                <div className="text-xs text-slate-500 truncate mt-1 group-hover:text-slate-400">{comm.desc}</div>
                            </div>
                            <div className="text-slate-700 group-hover:text-pink-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>

        {/* Section 2: Institutional Directory */}
        <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
                <div className="w-1.5 h-8 bg-blue-500 rounded-full"></div>
                <div>
                    <h3 className="text-xl font-bold text-white">Institutional Directory</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Endowments & Asset Managers</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {INSTITUTION_PRESETS.map((inst) => {
                    const domain = getDomain(inst.url);
                    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
                    
                    return (
                        <a
                            key={inst.name}
                            href={inst.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group bg-[#0f172a] border border-slate-700/50 hover:border-blue-500/50 p-4 rounded-xl transition-all duration-300 flex items-center gap-4 hover:shadow-xl hover:shadow-blue-900/10 hover:-translate-y-1"
                        >
                            <div className="w-12 h-12 shrink-0 rounded-lg bg-white p-2 border border-slate-700 overflow-hidden flex items-center justify-center">
                                <img 
                                    src={faviconUrl} 
                                    alt={inst.label} 
                                    className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).parentElement!.innerText = inst.label[0];
                                    }}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-200 group-hover:text-white transition-colors truncate">{inst.label}</span>
                                </div>
                                <div className={`text-[10px] uppercase font-bold mt-1 inline-block
                                    ${inst.type === 'University' ? 'text-blue-400' : 
                                      inst.type === 'Hedge Fund' ? 'text-purple-400' :
                                      inst.type === 'Bank' ? 'text-amber-400' :
                                      'text-green-400'}
                                `}>
                                    {inst.type}
                                </div>
                            </div>
                            <div className="text-slate-700 group-hover:text-blue-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
                                    <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.81L7.307 11.693a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityView;
