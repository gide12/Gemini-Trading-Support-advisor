import React from "react";
import { View } from "../types";

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const navItems: { id: View; label: string }[] = [
    { id: 'analysis', label: 'Advanced Analysis' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'market', label: 'Live Market' },
    { id: 'chart', label: 'Technical Chart' },
    { id: 'ml', label: 'ML Models' },
    { id: 'backtest', label: 'Backtester' },
    { id: 'community', label: 'Community' },
    { id: 'fuzzy', label: 'Fuzzy Engine' },
  ];

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 border-b border-purple-500/30 bg-[#0B1221] sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
      <div className="flex items-center gap-3 mb-4 md:mb-0 cursor-pointer" onClick={() => onViewChange('analysis')}>
        <div className="w-10 h-10 text-purple-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                {/* V */}
                <path d="M4 5l8 16 8-16" />
                {/* O */}
                <circle cx="7" cy="10" r="3" />
                {/* C */}
                <path d="M17 13a3 3 0 1 0 0-6" />
            </svg>
        </div>
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200 tracking-tight">
          Gemini Trading Support
        </h1>
      </div>
      
      <nav className="flex space-x-1 bg-[#0f172a]/80 p-1 rounded-lg border border-purple-500/30 overflow-x-auto max-w-full">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`
              px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap
              ${
                currentView === item.id
                  ? "bg-purple-900/40 text-white shadow-sm border border-purple-500/50"
                  : "text-slate-400 hover:text-purple-200 hover:bg-purple-900/20"
              }
            `}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
};

export default Header;