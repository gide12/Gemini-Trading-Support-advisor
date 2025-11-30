import { Type } from "@google/genai";

export enum AnalysisType {
  News = "News Analysis",
  YahooFinance = "Yahoo Finance",
  Fundamental = "Fundamental Analysis",
  Technical = "Technical Analysis",
  Clustering = "Cluster Analysis",
  Chart = "Chart",
  Quantum = "Quantum Forecast",
  Ideas = "Trade Ideas"
}

export type View = 'analysis' | 'portfolio' | 'backtest' | 'market' | 'ml' | 'community' | 'fuzzy' | 'chart';

export interface ChartDataPoint {
  date: string;
  price: number;
}

export interface NewsItem {
  title: string;
  source: string;
  url: string;
}

export interface TechnicalAnalysisData {
  currentPrice: number;
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
  summary: string;
}

export interface ClusteringData {
  algorithm: string;
  clusters: {
    name: string;
    description: string;
    stocks: string[];
  }[];
}

export interface AnalysisResult {
  ticker: string;
  type: AnalysisType;
  content: string;
  sentiment?: "Bullish" | "Bearish" | "Neutral";
  score?: number; // 0-100
  chartData?: ChartDataPoint[];
  sources?: { title: string; url: string }[];
  tradeSetup?: {
    entry: string;
    stopLoss: string;
    takeProfit: string;
  };
  financials?: Record<string, string>;
  technicalAnalysis?: TechnicalAnalysisData;
  clusteringData?: ClusteringData;
  valuationStatus?: "Overvalued" | "Undervalued" | "Fair Value";
  intrinsicValue?: string;
  mpidData?: {
    code: string;
    name: string;
    type: string; // e.g. "Market Maker", "ECN"
  }[];
}

export interface TabItem {
  id: AnalysisType;
  label: string;
}

// --- New Types for Portfolio & Market Data ---

export interface Holding {
  ticker: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  marketValue: number;
  pl: number;
  plPercent: number;
}

export interface MarketTicker {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  bid: number;
  ask: number;
  volume: number;
}

export interface BacktestResult {
  metrics: {
    totalReturn: string;
    maxDrawdown: string;
    winRate: string;
    tradesCount: number;
  };
  equityCurve: { date: string; value: number }[];
  trades: { date: string; type: 'Buy' | 'Sell'; price: number; result?: string }[];
  summary: string;
}

// --- ML Types ---

export interface MLPredictionResult {
  ticker: string;
  currentPrice: number;
  predictedPrice: number;
  confidenceScore: number; // 0-100
  volatility: string;
  modelUsed: string;
  featureImportance: { feature: string; score: number }[];
  predictionPath: { date: string; price: number; upper: number; lower: number }[];
  explanation: string;
}

// --- Community & Institutional Types ---

export interface CommunityInsightResult {
  ticker: string;
  retailSentiment: number; // 0-100
  institutionalSentiment: number; // 0-100
  summary: string;
  forumTopics: {
    topic: string;
    sentiment: "Bullish" | "Bearish" | "Neutral";
    mentions: number; // simulated volume
    platform: "Reddit" | "Twitter" | "Discord";
  }[];
  hedgeFundActivity: {
    fundName: string;
    action: "Bought" | "Sold" | "Held";
    shares: string;
    date: string;
    url?: string; // URL to fund site or 13F
  }[];
  academicMentions: {
    institution: string; // University Name
    type: "University" | "Research Lab" | "Campus";
    relevance: string; // e.g. "Endowment Holder", "Published Research"
    url: string;
  }[];
  analystRatings: {
    buy: number;
    hold: number;
    sell: number;
    consensus: string;
  };
}

export interface InstitutionalDeepDiveResult {
    institution: string;
    ticker: string;
    relationship: "Holder" | "Observer" | "Bearish" | "Unknown";
    summary: string;
    sourceUrl: string;
    lastFilingDate?: string;
}

// --- Modern Portfolio Theory Types ---

export interface MPTAnalysisResult {
  currentMetrics: {
    expectedReturn: number;
    volatility: number;
    sharpeRatio: number;
  };
  optimalMetrics: {
    expectedReturn: number;
    volatility: number;
    sharpeRatio: number;
  };
  efficientFrontier: { risk: number; return: number }[];
  suggestions: {
    ticker: string;
    action: "Buy" | "Sell" | "Hold";
    amount: string;
    reason: string;
  }[];
  correlationMatrix: { ticker1: string; ticker2: string; value: number }[];
}

// --- Fuzzy Logic Types ---

export interface FuzzyAnalysisResult {
  ticker: string;
  marketMakerBehavior: {
    score: string; // Weak, Moderate, Strong
    value: number; // 0-100
    metrics: {
        spreadCompression: string;
        orderBookImbalance: string;
        icebergProbability: string;
        depthVolatility: string;
    };
  };
  whaleActivity: {
    score: string; // None, Low, Elevated, Extreme
    value: number; // 0-100
    metrics: {
        blockTradeFreq: string;
        sweepOrders: string;
        flowToxicity: string;
        hiddenOrders: string;
    };
  };
  accumulation: {
    score: string; // Low, Medium, High, Very High
    value: number; // 0-100
    metrics: {
        netBuyingPressure: string;
        darkPoolRatio: string;
        volVolatilityDiv: string;
        sarClusters: string;
    };
  };
  summary: string;
}

export interface FFFCMGNNResult {
    ticker: string;
    famaFrenchFactors: {
        marketRisk: { value: number; description: string }; // MKT
        sizeFactorSMB: { value: number; description: string }; // SMB
        valueFactorHML: { value: number; description: string }; // HML
    };
    fuzzyCognitiveMap: {
        nodes: {
            id: string;
            name: string;
            activationLevel: number; // 0-1
            influenceType: "Positive" | "Negative" | "Neutral";
        }[];
        primaryCausalLink: string; // Text description of main link
    };
    gnnPrediction: {
        signal: "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell";
        confidence: number;
        graphEmbedding: number[]; // Array for visualization
        predictedTrend: string;
    };
    summary: string;
}

export interface OptimalFuzzyDesignResult {
    ticker: string;
    gfsAnalysis: { 
        score: number; // 0-100 (Optimization Level)
        optimizationStatus: string; 
        description: string;
    };
    nfsAnalysis: { 
        networkDepth: number; 
        learningRate: number; 
        description: string;
    };
    hfsAnalysis: { 
        layers: number; 
        reducedRules: number; 
        description: string;
    };
    efsAnalysis: { 
        evolvingStatus: "Expanding" | "Pruning" | "Stable"; 
        adaptationSpeed: number; // 0-100
        description: string;
    };
    mfsAnalysis: { 
        accuracy: number; // 0-100
        interpretability: number; // 0-100
        paretoOptimal: boolean; 
        description: string;
    };
    summary: string;
}

// --- ETF Types ---
export interface ETFProfile {
  ticker: string;
  name: string;
  topHoldings: {
    ticker: string;
    name: string;
    weight: number; // percentage
  }[];
}