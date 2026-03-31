
import React, { useState } from "react";
import { AnalysisType, View } from "../types";
import { ChevronDown, ChevronRight } from "lucide-react";

interface TabsProps {
  activeTab: AnalysisType;
  onTabChange: (tab: AnalysisType) => void;
  onNavigate?: (view: View) => void;
}

type TabItem = {
  id: AnalysisType | View;
  label: string;
  icon: string;
  isView?: boolean;
};

type TabGroup = {
  title: string;
  items: TabItem[];
};

const groups: TabGroup[] = [
  {
    title: "Intelligence",
    items: [
      { id: AnalysisType.News, label: "News Intel", icon: "N" },
      { id: AnalysisType.BrokerIntel, label: "Broker Intel", icon: "B" },
      { id: AnalysisType.Ideas, label: "Trade Ideas", icon: "I" },
      { id: AnalysisType.OptionsExpert, label: "Options Expert", icon: "O" },
      { id: AnalysisType.SmartMoney, label: "Smart Money AI", icon: "M" },
    ]
  },
  {
    title: "Analytics",
    items: [
      { id: AnalysisType.Technical, label: "Technical", icon: "T" },
      { id: AnalysisType.PriceAction, label: "SIGNAL", icon: "S" },
      { id: AnalysisType.Clustering, label: "Regime Cluster", icon: "R" },
      { id: AnalysisType.Fundamental, label: "Fundamental", icon: "D" },
    ]
  }
];

const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange, onNavigate }) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Intelligence": true,
    "Analytics": true
  });

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <div className="w-full mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((group) => {
          const isExpanded = expandedGroups[group.title];
          return (
            <div key={group.title} className="bg-[#131B2E]/50 border border-slate-700/30 rounded-lg p-2">
              <button 
                onClick={() => toggleGroup(group.title)}
                className="w-full flex items-center justify-between text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1 hover:text-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  {group.title}
                </div>
                <div className="h-px flex-1 bg-slate-800 ml-2"></div>
              </button>
              
              <div className={`grid grid-cols-1 gap-1 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                {group.items.map((tab) => {
                  const isActive = !tab.isView && activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (tab.isView && onNavigate) {
                          onNavigate(tab.id as View);
                        } else if (!tab.isView) {
                          onTabChange(tab.id as AnalysisType);
                        }
                      }}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded transition-all duration-200 text-left
                        ${isActive 
                          ? "bg-emerald-500/10 border-l-2 border-emerald-500 text-emerald-400" 
                          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-l-2 border-transparent"}
                      `}
                    >
                      <span className={`text-[10px] font-mono font-bold w-4 h-4 flex items-center justify-center rounded border ${isActive ? 'border-emerald-500/50' : 'border-slate-700 text-slate-600'}`}>
                        {tab.icon}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-tight truncate">
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;
