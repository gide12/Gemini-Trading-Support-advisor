import React, { useState } from "react";
import { View } from "../types";
import { 
  Newspaper, Activity, BarChart3, Target, 
  Cpu, Network, ShieldAlert, Globe, 
  Briefcase, Zap, FileText, ChevronDown, ChevronRight, Landmark
} from "lucide-react";

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onGoHome: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, onGoHome }) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Intelligence": true,
    "Analytics": true,
    "Terminal": true
  });

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const menuGroups = [
    {
      title: "Intelligence",
      items: [
        { id: 'news', label: 'News Feed', icon: <Newspaper className="w-4 h-4" /> },
        { id: 'analysis', label: 'Deep Dive', icon: <Activity className="w-4 h-4" /> },
        { id: 'hedge_fund', label: 'Hedge Fund', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'sec_report', label: 'SEC Report', icon: <FileText className="w-4 h-4" /> },
        { id: 'bis_report', label: 'BIS Report', icon: <Landmark className="w-4 h-4" /> },
        { id: 'community', label: 'Community', icon: <Network className="w-4 h-4" /> },
      ]
    },
    {
      title: "Analytics",
      items: [
        { id: 'chart', label: 'Tech Chart', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'fuzzy', label: 'Fuzzy Engine', icon: <Target className="w-4 h-4" /> },
        { id: 'quantum', label: 'Quantum Sim', icon: <Cpu className="w-4 h-4" /> },
        { id: 'ml', label: 'ML Models', icon: <Zap className="w-4 h-4" /> },
        { id: 'backtest', label: 'Backtester', icon: <Activity className="w-4 h-4" /> },
      ]
    },
    {
      title: "Terminal",
      items: [
        { id: 'portfolio', label: 'Portfolio', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'market', label: 'Live Market', icon: <Globe className="w-4 h-4" /> },
        { id: 'monitoring', label: 'Monitoring', icon: <ShieldAlert className="w-4 h-4" /> },
        { id: 'marine_traffic', label: 'Marine Traffic', icon: <Globe className="w-4 h-4" /> },
      ]
    }
  ];

  return (
    <div className="flex flex-col h-full bg-[#0B1221] border-r border-slate-800/50">
      {/* Logo */}
      <div className="p-5 border-b border-slate-800/50 flex items-center gap-3 cursor-pointer group shrink-0" onClick={onGoHome}>
        <div className="w-8 h-8 text-cyan-500 group-hover:text-cyan-400 transition-colors shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <h1 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200 tracking-tight leading-tight">
          GEMINI<br/>Investmarketstation
        </h1>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        {menuGroups.map((group, idx) => {
          const isExpanded = expandedGroups[group.title];
          return (
            <div key={idx} className="mb-4 px-3">
              <button 
                onClick={() => toggleGroup(group.title)}
                className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors"
              >
                <span>{group.title}</span>
                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
              
              <div className={`space-y-1 mt-1 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                {group.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id as View)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                      currentView === item.id 
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]' 
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <div className={currentView === item.id ? 'text-cyan-400' : 'text-slate-500'}>
                      {item.icon}
                    </div>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-slate-800/50 shrink-0 bg-[#0f172a]/30">
        <div className="flex items-center gap-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
          System Online
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
