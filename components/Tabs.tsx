import React from "react";
import { AnalysisType } from "../types";

interface TabsProps {
  activeTab: AnalysisType;
  onTabChange: (tab: AnalysisType) => void;
}

const tabs: AnalysisType[] = [
  AnalysisType.News,
  AnalysisType.YahooFinance,
  AnalysisType.Fundamental,
  AnalysisType.Technical,
  AnalysisType.Chart,
  AnalysisType.LSTM,
  AnalysisType.LEP,
  AnalysisType.Quantum,
  AnalysisType.Ideas,
];

const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="w-full border-b border-slate-700 mb-6 overflow-x-auto">
      <nav className="flex space-x-1 min-w-max" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`
                whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors duration-200
                ${
                  isActive
                    ? "border-cyan-400 text-cyan-400"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600"
                }
              `}
            >
              {tab}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Tabs;