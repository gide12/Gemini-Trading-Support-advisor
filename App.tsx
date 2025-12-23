
import React, { useState } from "react";
import Header from "./components/Header";
import StockTicker from "./components/StockTicker";
import AnalysisView from "./components/AnalysisView";
import PortfolioView from "./components/PortfolioView";
import MarketDataView from "./components/MarketDataView";
import BacktestView from "./components/BacktestView";
import MLView from "./components/MLView";
import CommunityView from "./components/CommunityView";
import FuzzyLogicView from "./components/FuzzyLogicView";
import ChartView from "./components/ChartView";
import LandingPage from "./components/LandingPage";
import { View } from "./types";

const App: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [currentView, setCurrentView] = useState<View>('analysis');

  if (!isStarted) {
    return <LandingPage onStart={() => setIsStarted(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#0B1221] text-slate-200 flex flex-col font-sans fade-in">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      <StockTicker />
      
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-10">
        {currentView === 'analysis' && <AnalysisView />}
        {currentView === 'portfolio' && <PortfolioView />}
        {currentView === 'market' && <MarketDataView />}
        {currentView === 'chart' && <ChartView />}
        {currentView === 'ml' && <MLView />}
        {currentView === 'backtest' && <BacktestView />}
        {currentView === 'community' && <CommunityView />}
        {currentView === 'fuzzy' && <FuzzyLogicView />}
      </main>
      
      <footer className="py-6 text-center text-slate-600 text-sm border-t border-slate-900 mt-auto">
        <p>© 2025 Gemini Trading Support. Powered by Google Gemini 2.5 Flash.</p>
      </footer>
    </div>
  );
};

export default App;
