import React from "react";
import { View } from "../types";

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const navItems: { id: View; label: string }[] = [
    { id: 'analysis', label: 'AI Analysis' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'market', label: 'Live Market' },
    { id: 'ml', label: 'ML Models' },
    { id: 'backtest', label: 'Backtester' },
    { id: 'community', label: 'Community' },
  ];

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B1221] sticky top-0 z-50">
      <div className="flex items-center gap-3 mb-4 md:mb-0 cursor-pointer" onClick={() => onViewChange('analysis')}>
        <div className="w-8 h-8 text-cyan-400">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M21 16.5C21 16.88 20.79 17.21 20.47 17.38L12.57 21.82C12.41 21.94 12.21 22 12 22C11.79 22 11.59 21.94 11.43 21.82L3.53 17.38C3.21 17.21 3 16.88 3 16.5V7.5C3 7.12 3.21 6.79 3.53 6.62L11.43 2.18C11.59 2.06 11.79 2 12 2C12.21 2 12.41 2.06 12.57 2.18L20.47 6.62C20.79 6.79 21 7.12 21 7.5V16.5ZM12 4.15L6.04 7.5L12 10.85L17.96 7.5L12 4.15ZM5 8.66V15.34L11 18.71V12.03L5 8.66ZM13 18.71L19 15.34V8.66L13 12.03V18.71Z" />
            </svg>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Gemini Trading Support
        </h1>
      </div>
      
      <nav className="flex space-x-1 bg-[#0f172a] p-1 rounded-lg border border-slate-800 overflow-x-auto max-w-full">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`
              px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap
              ${
                currentView === item.id
                  ? "bg-slate-700 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
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