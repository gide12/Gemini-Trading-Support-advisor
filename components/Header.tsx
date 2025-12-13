
import React, { useState } from "react";
import { View } from "../types";

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const [activeTab, setActiveTab] = useState<string>("Analysis");

  const ribbonData: Record<string, { id: View; label: string; icon: React.ReactNode }[]> = {
    "Analysis": [
      { 
        id: 'analysis', 
        label: 'Deep Dive', 
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        )
      },
      { 
        id: 'chart', 
        label: 'Tech Chart', 
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        )
      },
      { 
        id: 'fuzzy', 
        label: 'Fuzzy Engine', 
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12h1.5m-1.5 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" />
          </svg>
        )
      },
    ],
    "Markets": [
      { 
        id: 'portfolio', 
        label: 'Portfolio', 
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
          </svg>
        )
      },
      { 
        id: 'market', 
        label: 'Live Market', 
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
          </svg>
        )
      },
    ],
    "Quant Lab": [
      { 
        id: 'ml', 
        label: 'ML Models', 
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
          </svg>
        )
      },
      { 
        id: 'backtest', 
        label: 'Backtester', 
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        )
      },
    ],
    "Network": [
      { 
        id: 'community', 
        label: 'Community', 
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        )
      },
    ]
  };

  return (
    <header className="flex flex-col w-full z-50 sticky top-0 font-sans shadow-xl">
      {/* ROW 1: Title Bar & Tabs */}
      <div className="flex items-center px-4 bg-[#0B1221] border-b border-purple-900/20 h-10 md:h-12 select-none relative z-20">
         {/* Logo Area */}
         <div className="flex items-center gap-3 mr-6 md:mr-10 cursor-pointer group" onClick={() => onViewChange('analysis')}>
            <div className="w-6 h-6 text-purple-500 group-hover:text-purple-400 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                    <path d="M4 5l8 16 8-16" />
                    <circle cx="7" cy="10" r="3" />
                    <path d="M17 13a3 3 0 1 0 0-6" />
                </svg>
            </div>
            <h1 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200 tracking-tight hidden md:block">
              Gemini Trading
            </h1>
         </div>

         {/* Ribbon Tabs */}
         <div className="flex h-full items-end gap-1 overflow-x-auto custom-scrollbar-hide">
            {Object.keys(ribbonData).map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
                        px-3 md:px-5 py-2 text-[10px] md:text-xs uppercase font-semibold tracking-wider transition-all duration-200 border-t-2 border-x border-transparent rounded-t-sm whitespace-nowrap
                        ${activeTab === tab 
                            ? 'bg-[#1e293b] text-purple-100 border-t-purple-500 border-x-[#1e293b] relative top-[1px] z-30' 
                            : 'text-slate-400 hover:text-white hover:bg-white/5'}
                    `}
                >
                    {tab}
                </button>
            ))}
         </div>
      </div>

      {/* ROW 2: The Ribbon Toolbar */}
      <div className="bg-[#1e293b] border-b border-purple-500/30 px-2 md:px-4 py-2 h-24 md:h-28 flex items-center gap-2 overflow-x-auto custom-scrollbar relative z-10 shadow-lg">
          {ribbonData[activeTab].map(item => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`
                    flex flex-col items-center justify-center gap-2 h-full min-w-[70px] md:min-w-[90px] px-2 rounded-md transition-all duration-200 group relative overflow-hidden
                    ${currentView === item.id 
                        ? 'bg-purple-500/10 text-purple-300 border border-purple-500/40 shadow-[inset_0_0_10px_rgba(168,85,247,0.1)]' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}
                `}
              >
                  {/* Selection Indicator Bar */}
                  {currentView === item.id && (
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-purple-500 shadow-[0_0_5px_#a855f7]"></div>
                  )}

                  <div className={`p-2 rounded-full transition-all duration-300 ${currentView === item.id ? 'bg-gradient-to-br from-purple-600 to-purple-800 text-white shadow-lg shadow-purple-900/50 scale-110' : 'bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-slate-700 group-hover:scale-105'}`}>
                      {item.icon}
                  </div>
                  <span className={`text-[10px] font-medium leading-tight text-center ${currentView === item.id ? 'text-white' : 'text-slate-400'}`}>{item.label}</span>
              </button>
          ))}
          
          {/* Vertical Separator */}
          <div className="h-3/5 w-px bg-slate-700/50 mx-2 hidden md:block"></div>
          
          {/* Context Info */}
          <div className="hidden md:flex flex-col justify-center px-4 h-full border-l border-slate-700/50 pl-6 ml-2 opacity-60">
             <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest mb-1">Active Module</span>
             <div className="text-xs text-purple-300 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                {currentView.toUpperCase().replace('_', ' ')}
             </div>
          </div>
      </div>
    </header>
  );
};

export default Header;
