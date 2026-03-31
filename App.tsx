
import React, { useState } from "react";
import Header from "./components/Header";
import StockTicker from "./components/StockTicker";
import SentimentTicker from "./components/SentimentTicker";
import AnalysisView from "./components/AnalysisView";
import PortfolioView from "./components/PortfolioView";
import MarketDataView from "./components/MarketDataView";
import BacktestView from "./components/BacktestView";
import MLView from "./components/MLView";
import CommunityView from "./components/CommunityView";
import FuzzyLogicView from "./components/FuzzyLogicView";
import QuantumView from "./components/QuantumView";
import ChartView from "./components/ChartView";
import LandingPage from "./components/LandingPage";
import OnboardingWizard from "./components/OnboardingWizard";
import NewsFrontView from "./components/NewsFrontView";
import HedgeFundView from "./components/HedgeFundView";
import MonitoringView from "./components/MonitoringView";
import SecReportView from "./components/SecReportView";
import { View } from "./types";

const App: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [currentView, setCurrentView] = useState<View>('news');

  if (!isStarted) {
    return <LandingPage onStart={() => setIsStarted(true)} />;
  }

  if (!hasCompletedOnboarding) {
    return (
      <OnboardingWizard 
        onComplete={(data) => {
          console.log("Onboarding complete:", data);
          setHasCompletedOnboarding(true);
        }} 
      />
    );
  }

  const isChartView = currentView === 'chart';

  return (
    <div className="min-h-screen bg-[#0B1221] text-slate-200 flex flex-col font-sans fade-in">
      <Header currentView={currentView} onViewChange={setCurrentView} onGoHome={() => setIsStarted(false)} />
      <StockTicker />
      <SentimentTicker />
      
      <main className={`flex-1 w-full flex flex-col ${isChartView ? 'p-0 max-w-none' : 'max-w-7xl mx-auto p-6 lg:p-10'}`}>
        {currentView === 'news' && <NewsFrontView />}
        {currentView === 'analysis' && <AnalysisView />}
        {currentView === 'portfolio' && <PortfolioView />}
        {currentView === 'market' && <MarketDataView />}
        {currentView === 'chart' && <ChartView />}
        {currentView === 'ml' && <MLView />}
        {currentView === 'backtest' && <BacktestView />}
        {currentView === 'community' && <CommunityView />}
        {currentView === 'fuzzy' && <FuzzyLogicView />}
        {currentView === 'quantum' && <QuantumView />}
        {currentView === 'hedge_fund' && <HedgeFundView />}
        {currentView === 'monitoring' && <MonitoringView />}
        {currentView === 'sec_report' && <SecReportView />}
      </main>
      
      {!isChartView && (
        <footer className="py-6 text-center text-slate-600 text-sm border-t border-slate-900 mt-auto">
          <p>© 2025 Gemini Trading Support. Powered by Google Gemini 3 Flash.</p>
        </footer>
      )}
    </div>
  );
};

export default App;
