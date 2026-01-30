
import { Type } from "@google/genai";

export enum AnalysisType {
  News = "News Analysis",
  YahooFinance = "Yahoo Finance",
  Fundamental = "Fundamental Analysis",
  Technical = "Technical Analysis",
  Clustering = "Cluster Analysis",
  PriceAction = "Price Action Advanced",
  Chart = "Chart",
  Ideas = "Trade Ideas",
  OptionsExpert = "Options Expert Analysis",
  BrokerIntel = "Broker Intelligence"
}

export type View = 'analysis' | 'portfolio' | 'backtest' | 'market' | 'ml' | 'community' | 'fuzzy' | 'chart' | 'quantum';

export interface NewsItem {
    title: string;
    url: string;
    source: "Bloomberg" | "Financial Times" | "Wall Street Journal" | "Yahoo Finance" | "Other";
    snippet: string;
    time: string;
    sentiment: "Positive" | "Negative" | "Neutral";
}

export interface PriceActionCandle {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    label?: "HH" | "HL" | "LH" | "LL" | "BOS" | "CHoCH";
    breakLinePrice?: number;
}

export interface OrderBlock {
    type: "Bullish" | "Bearish";
    top: number;
    bottom: number;
    startIdx: number;
    endIdx: number;
    label: string;
}

export interface LiquiditySweep {
    type: "Grab" | "Sweep";
    top: number;
    bottom: number;
    startIdx: number;
    endIdx: number;
    label: string;
}

export interface PriceActionData {
  candles: PriceActionCandle[];
  orderBlocks: OrderBlock[];
  liquiditySweeps: LiquiditySweep[];
  targets: { price: number; label: string }[];
  momentum: { startIdx: number; endIdx: number; direction: "Bullish" | "Bearish"; label: string }[];
  marketRegime: string;
  bias: "Bullish" | "Bearish" | "Neutral";
  summary: string;
}

export interface TechnicalAnalysisData {
  currentPrice: number;
  dailyLogReturn?: number;
  trend: "Bullish" | "Bearish" | "Neutral";
  signalStrength: "Strong" | "Moderate" | "Weak";
  priceHistory: { time: string; price: number; volume: number }[];
  indicators: {
    rsi: string;
    rsiVal: number;
    macd: string;
    macdVal: number;
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
    time: string;
    confidence: number;
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
    analystSynthesis: string;
    metrics: {
        brokerFlow: { netBuyRatio: number; flowConsistency: number; participantQuality: number; };
    };
    dominantSide: "Net Buy" | "Net Sell" | "Neutral";
    brokerActivityHistory: { date: string; activity: number }[];
    summary: string;
}

export interface TradeIdeaData {
    bias: "Bullish" | "Bearish" | "Neutral";
    timeframe: string;
    conviction: number; // 0 to 100
    entryRange: { low: number; high: number };
    stopLoss: number;
    targets: { price: number; label: string }[];
    catalysts: string[];
    riskRewardRatio: string;
    rationale: string;
}

export interface AnalysisResult {
  ticker: string;
  type: AnalysisType;
  content: string;
  sources?: { title: string; url: string }[];
  technicalAnalysis?: TechnicalAnalysisData;
  brokerIntel?: BrokerIntelData;
  priceAction?: PriceActionData;
  newsItems?: NewsItem[];
  tradeIdea?: TradeIdeaData;
}

export interface TabItem { id: AnalysisType; label: string; }
export interface Holding { 
    ticker: string; 
    quantity: number; 
    avgBuyPrice: number; 
    currentPrice: number; 
    marketValue: number; 
    pl: number; 
    plPercent: number;
    mean?: number;
    variance?: number;
    deviation?: number;
}
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
    greeks?: {
      delta: number;
      gamma: number;
      theta: number;
      vega: number;
      rho: number;
    };
  };
}

export interface MLPredictionResult { ticker: string; currentPrice: number; predictedPrice: number; confidenceScore: number; volatility: string; modelUsed: string; featureImportance: { feature: string; score: number }[]; predictionPath: { date: string; price: number; upper: number; lower: number }[]; explanation: string; evaluationMetrics: any; tradingMetrics: any; }
export interface ETFProfile { ticker: string; name: string; topHoldings: { ticker: string; name: string; weight: number; }[]; }
export interface DeltaGammaHedgeResult { portfolioGreeks: any; hedgingActions: any; sensitivityPath: any; riskSummary: string; }
export interface AdvancedPricingResult { ticker: string; bsm: any; heston: any; jumpDiffusion: any; varianceSwap: any; summary: string; }
export interface AdvancedPricingResult { ticker: string; bsm: any; heston: any; jumpDiffusion: any; varianceSwap: any; summary: string; }
export interface CAPMAPTResult { ticker: string; capm: any; apt: any; summary: string; }
export interface InvestorView { type: "Absolute" | "Relative"; asset1: string; asset2?: string; expectedReturn: number; confidence: number; }

export interface MPTAnalysisResult {
  currentMetrics: { sharpeRatio: number; expectedReturn: number; volatility: number; };
  optimalMetrics: { sharpeRatio: number; expectedReturn: number; volatility: number; };
  suggestions: { ticker: string; action: 'Buy' | 'Sell' | 'Hold'; amount: string; reason: string; }[];
  efficientFrontier: { risk: number; return: number; }[];
  correlationMatrix?: { ticker1: string; ticker2: string; value: number; }[];
  rebalancingContext?: { strategyUsed: string; notes: string; nextRebalanceDate: string; };
}

export interface FFFCMGNNResult {
  ticker: string;
  famaFrenchFactors: { factor: string; loading: number; significance: "High" | "Med" | "Low"; }[];
  fuzzyCognitiveMap: { node: string; influence: number; target: string; state: string; }[];
  gnnPrediction: { layers: { name: string; activation: number; status: string }[]; latentForecast: number; confidence: number; };
  summary: string;
}

export interface OptimalFuzzyDesignResult {
  ticker: string;
  systemType: "Mamdani" | "Sugeno";
  membershipFunctions: { variable: string; sets: { name: "Low" | "Mid" | "High"; points: number[]; }[]; }[];
  ruleBase: { if: string; then: string; weight: number; }[];
  defuzzification: { method: string; result: number; label: string; };
  gfsAnalysis: { generations: number; bestFitness: number; };
  nfsAnalysis: { neurons: number; errorRate: number; };
  summary: string;
}

export interface FFTSPLPRResult {
  ticker: string;
  twoFactorGroups: { group: string; f1_state: string; f2_state: string; probability: number; implication: string; }[];
  plprDistributions: { term: string; probability: number; label: string; }[];
  forecast: { linguisticValue: string; numericalEstimate: number; lowerBound: number; upperBound: number; };
  summary: string;
}

export interface FTSLFIGResult {
    ticker: string;
    granules: {
        time: string;
        lower: number;
        center: number;
        upper: number;
        label: string;
    }[];
    transitions: {
        from: string;
        to: string;
        probability: number;
    }[];
    forecast: {
        linguisticValue: string;
        numericalEstimate: number;
    };
    summary: string;
}

export interface QuantumMCDMResult {
    ticker: string;
    delphiValidation: { criteria: string; validationScore: number; status: string }[];
    dematelAnalysis: { criteria: string; centrality: number; causality: number; type: "Cause" | "Effect"; }[];
    sphericalFuzzyModeling: { membership: number; nonMembership: number; hesitancy: number; uncertaintyRadius: number; };
    alternativeEvaluation: { alternative: string; cocosoRank: number; topsisRank: number; multimooraRank: number; aggregatedScore: number; }[];
    finalDecision: { rank: number; alternative: string; actionableIntel: string; }[];
    summary: string;
}

export interface QuantumResult {
  ticker: string;
  model: "Standard Quantum Path" | "Quantum Attention Deep Q-Network (QADQN)" | "Quantum Graph Neural Network (QGNN)";
  expectedPrice: number;
  entanglementScore: number;
  decoherenceRisk: string;
  distribution: { price: string; probability: number }[];
  summary: string;
  // QADQN specific
  agentPolicy?: { action: string; qValue: number; probability: number }[];
  attentionMap?: { head: string; weight: number }[];
  rewardExpectation?: number;
  // QGNN specific
  graphTopology?: { node: string; neighbor: string; weight: number }[];
  benchmarks?: { metric: string; classical: number; quantum: number }[];
  circuitComplexity?: number;
}
