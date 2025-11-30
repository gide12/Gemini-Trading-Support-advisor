import React from "react";

const INSTITUTION_PRESETS = [
    // Universities
    { name: "Harvard Management Co", type: "University", label: "Harvard", url: "https://www.hmc.harvard.edu/" },
    { name: "MIT Investment Mgmt", type: "University", label: "MIT", url: "https://mitimco.org/" },
    { name: "Oxford University Endowment", type: "University", label: "Oxford", url: "https://www.ouem.co.uk/" },
    { name: "Yale Investments Office", type: "University", label: "Yale", url: "https://investments.yale.edu/" },
    { name: "Stanford Management Co", type: "University", label: "Stanford", url: "https://smc.stanford.edu/" },
    { name: "Princeton Univ. Investment", type: "University", label: "Princeton", url: "https://princeton.edu/finance-treasury/princo" },
    { name: "Cambridge Investment Mgmt", type: "University", label: "Cambridge", url: "https://www.cam.ac.uk/" },

    // Asset Managers & ETFs
    { name: "BlackRock", type: "Asset Manager", label: "BlackRock", url: "https://www.blackrock.com/" },
    { name: "Vanguard", type: "Asset Manager", label: "Vanguard", url: "https://investor.vanguard.com/" },
    { name: "State Street Global", type: "Asset Manager", label: "State Street", url: "https://www.ssga.com/" },
    { name: "Fidelity Investments", type: "Asset Manager", label: "Fidelity", url: "https://www.fidelity.com/" },
    { name: "PIMCO", type: "Asset Manager", label: "PIMCO", url: "https://www.pimco.com/" },

    // Investment Banks
    { name: "J.P. Morgan Asset Mgmt", type: "Bank", label: "J.P. Morgan", url: "https://am.jpmorgan.com/" },
    { name: "Goldman Sachs", type: "Bank", label: "Goldman Sachs", url: "https://www.goldmansachs.com/" },
    { name: "Morgan Stanley", type: "Bank", label: "Morgan Stanley", url: "https://www.morganstanley.com/" },
    { name: "Bank of America", type: "Bank", label: "Bank of America", url: "https://www.bankofamerica.com/" },

    // Hedge Funds / Quants
    { name: "Citadel LLC", type: "Hedge Fund", label: "Citadel", url: "https://www.citadel.com/" },
    { name: "Bridgewater Associates", type: "Hedge Fund", label: "Bridgewater", url: "https://www.bridgewater.com/" },
    { name: "Renaissance Technologies", type: "Hedge Fund", label: "RenTech", url: "https://www.rentec.com/" },
    { name: "Two Sigma", type: "Hedge Fund", label: "Two Sigma", url: "https://www.twosigma.com/" },
    { name: "Millennium Management", type: "Hedge Fund", label: "Millennium", url: "https://www.mlp.com/" },
    { name: "Elliott Management", type: "Hedge Fund", label: "Elliott", url: "https://www.elliottmgmt.com/" },
    { name: "AQR Capital", type: "Hedge Fund", label: "AQR", url: "https://www.aqr.com/" },
    { name: "Point72", type: "Hedge Fund", label: "Point72", url: "https://www.point72.com/" },
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
    <div className="fade-in space-y-8">
      <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-6 shadow-lg">
        <div className="mb-2">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-pink-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
            </svg>
            Institutional Directory
          </h2>
          <p className="text-slate-400 text-sm">Direct access to major University Endowments, Hedge Funds, and Asset Managers.</p>
        </div>
      </div>

      <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {INSTITUTION_PRESETS.map((inst) => {
                  const domain = getDomain(inst.url);
                  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                  
                  return (
                    <a
                        key={inst.name}
                        href={inst.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                            relative group p-4 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 text-center min-h-[140px] cursor-pointer
                            bg-[#1e293b] border-purple-500/20 hover:border-purple-500/60 hover:bg-[#1e293b]/80 hover:shadow-lg hover:shadow-purple-900/10 hover:-translate-y-1
                        "
                    >
                        <div className="w-12 h-12 rounded-full bg-white p-2 shadow-inner flex items-center justify-center overflow-hidden">
                            <img 
                                src={faviconUrl} 
                                alt={inst.label} 
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    // Fallback if image fails
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).parentElement!.innerText = inst.label[0];
                                }}
                            />
                        </div>

                        <div>
                            <div className="font-bold text-slate-200 group-hover:text-white transition-colors text-sm">{inst.label}</div>
                            <div className={`text-[10px] uppercase font-bold mt-1 px-2 py-0.5 rounded-full inline-block
                                ${inst.type === 'University' ? 'bg-blue-900/30 text-blue-400' : 
                                  inst.type === 'Hedge Fund' ? 'bg-purple-900/30 text-purple-400' :
                                  inst.type === 'Bank' ? 'bg-amber-900/30 text-amber-400' :
                                  'bg-green-900/30 text-green-400'}
                            `}>
                                {inst.type}
                            </div>
                        </div>
                        
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-purple-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                        </div>
                    </a>
                  );
              })}
          </div>
      </div>
    </div>
  );
};

export default CommunityView;