
import { Type } from "@google/genai";

export enum AnalysisType {
  News = "News Analysis",
  YahooFinance = "Yahoo Finance",
  Fundamental = "Fundamental Analysis",
  Technical = "Technical Analysis",
  Clustering = "Cluster Analysis",
  TotalView = "Nasdaq TotalView",
  Chart = "Chart",
  Quantum = "Quantum Forecast",
  Ideas = "Trade Ideas",
  OptionsExpert = "Options Expert Analysis",
  BrokerIntel = "Broker Intelligence"
}

export type View = 'analysis' | 'portfolio' | 'backtest' | 'market' | 'ml' | 'community' | 'fuzzy' | 'chart';

export interface ChartDataPoint {
  date: string;
  price: number;
}

export interface TechnicalAnalysisData {
  currentPrice: number;
  dailyLogReturn?: number;
  trend: "Bullish" | "Bearish" | "Neutral";
  signalStrength: "Strong" | "Moderate" | "Weak";
  indicators: {
    rsi: string;
    macd: string;
    movingAverages: string;
    bollingerBands: string;
  };
  supportResistance: {
    support: number[];
    resistance: number[];
  };
  breakoutPoints?: {
    price: number;
    type: "Breakout" | "Breakdown";
    label: string;
    dateIndex: number; 
  }[];
  footprintProfile?: {
    price: number;
    bidVol: number;
    askVol: number;
    isPoc?: boolean;
    isImbalance?: boolean;
  }[];
  summary: string;
}

export interface BrokerIntelData {
    metrics: {
        brokerFlow: { netBuyRatio: number; flowConsistency: number; participantQuality: number; };
        priceAction: { structureStrength: number; volatilityControl: number; reactionQuality: number; };
        context: { trendAlignment: number; liquidityPresence: number; };
    };
    systemStatus: { volumeThresholdMet: boolean; dataGapPercentage: number; noiseDetected: boolean; };
    activity: string;
    dominantSide: "Net Buy" | "Net Sell" | "Neutral";
    marketReaction: string;
    traderBiasNote: string;
    investorBiasNote: string;
    dominantFactor: string;
    summary: string;
    advancedTable: { type: string; netBuy: string; days: number; impact: string; }[];
}

export interface QuantumMCDMResult {
    ticker: string;
    delphiValidation: { criteria: string; validationScore: number; status: string }[];
    dematelAnalysis: {
        criteria: string;
        centrality: number; // (R+C)
        causality: number;   // (R-C)
        type: "Cause" | "Effect";
    }[];
    sphericalFuzzyModeling: {
        membership: number;     // Alpha
        nonMembership: number;  // Beta
        hesitancy: number;      // Gamma
        uncertaintyRadius: number;
    };
    alternativeEvaluation: {
        alternative: string;
        cocosoRank: number;
        topsisRank: number;
        multimooraRank: number;
        aggregatedScore: number;
    }[];
    finalDecision: {
        rank: number;
        alternative: string;
        actionableIntel: string;
    }[];
    summary: string;
}

export interface AnalysisResult {
  ticker: string;
  type: AnalysisType;
  content: string;
  sentiment?: "Bullish" | "Bearish" | "Neutral";
  sources?: { title: string; url: string }[];
  financials?: Record<string, string>;
  technicalAnalysis?: TechnicalAnalysisData;
  brokerIntel?: BrokerIntelData;
  quantumMCDM?: QuantumMCDMResult;
}

export interface MPTAnalysisResult {
  currentMetrics: { sharpeRatio: number; expectedReturn: number; volatility: number };
  optimalMetrics: { sharpeRatio: number; expectedReturn: number; volatility: number };
  efficientFrontier: { risk: number; return: number }[];
  suggestions: { ticker: string; action: "Buy" | "Sell" | "Hold"; amount: string; reason: string }[];
  correlationMatrix: { ticker1: string; ticker2: string; value: number }[];
  rebalancingContext?: { strategyUsed: string; notes: string; nextRebalanceDate: string };
}

export interface TabItem { id: AnalysisType; label: string; }
export interface Holding { ticker: string; quantity: number; avgBuyPrice: number; currentPrice: number; marketValue: number; pl: number; plPercent: number; }
export interface MarketTicker { symbol: string; name: string; price: number; change: number; changePercent: number; bid: number; ask: number; volume: number; }

export interface BacktestResult { 
  metrics: { totalReturn: string; maxDrawdown: string; winRate: string; tradesCount: number; }; 
  equityCurve: { date: string; value: number }[]; 
  trades: { date: string; type: 'Buy' | 'Sell'; price: number; result?: string }[]; 
  summary: string;
  blackScholesMetrics?: {
    impliedVolatility: number;
    callOptionPrice: number;
    putOptionPrice: number;
    greeks: { delta: number; gamma: number; theta: number; vega: number; rho: number; };
  };
}

export interface MLPredictionResult { ticker: string; currentPrice: number; predictedPrice: number; confidenceScore: number; volatility: string; modelUsed: string; featureImportance: { feature: string; score: number }[]; predictionPath: { date: string; price: number; upper: number; lower: number }[]; explanation: string; evaluationMetrics: any; tradingMetrics: any; }
export interface ETFProfile { ticker: string; name: string; topHoldings: { ticker: string; name: string; weight: number; }[]; }
export interface DeltaGammaHedgeResult { portfolioGreeks: any; hedgingActions: any; sensitivityPath: any; riskSummary: string; }
export interface AdvancedPricingResult { ticker: string; bsm: any; heston: any; jumpDiffusion: any; localVol?: any; varianceSwap: any; summary: string; }
export interface CAPMAPTResult { ticker: string; capm: any; apt: any; summary: string; }
export interface InvestorView { type: "Absolute" | "Relative"; asset1: string; asset2?: string; expectedReturn: number; confidence: number; }

export interface FFFCMGNNResult {
  ticker: string;
  famaFrenchFactors: {
    factor: string;
    loading: number;
    significance: "High" | "Med" | "Low";
  }[];
  fuzzyCognitiveMap: {
    node: string;
    influence: number;
    target: string;
    state: "Activated" | "Inhibited" | "Neutral";
  }[];
  gnnPrediction: {
    layers: { name: string; activation: number; status: string }[];
    latentForecast: number;
    confidence: number;
  };
  summary: string;
}

export interface OptimalFuzzyDesignResult {
  ticker: string;
  systemType: "Mamdani" | "Sugeno";
  membershipFunctions: {
    variable: string;
    sets: {
      name: "Low" | "Mid" | "High";
      points: number[];
    }[];
  }[];
  ruleBase: {
    if: string;
    then: string;
    weight: number;
  }[];
  defuzzification: {
    method: string;
    result: number;
    label: string;
  };
  gfsAnalysis: {
    generations: number;
    bestFitness: number;
  };
  nfsAnalysis: {
    neurons: number;
    errorRate: number;
  };
  summary: string;
}

// Refined: FFTS-PLPR
export interface FFTSPLPRResult {
  ticker: string;
  twoFactorGroups: {
      group: string;
      f1_state: string;
      f2_state: string;
      probability: number;
      implication: string;
  }[];
  plprDistributions: {
      term: string;
      probability: number;
      label: string;
  }[];
  forecast: {
      linguisticValue: string;
      numericalEstimate: number;
      lowerBound: number;
      upperBound: number;
  };
  summary: string;
}
