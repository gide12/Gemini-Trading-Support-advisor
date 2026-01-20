
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

export interface NewsItem {
  title: string;
  source: string;
  url: string;
}

export interface OrderFlowAnalysis {
    tradeSignAcf: number[]; // Autocorrelation of Buy/Sell signs (Expect low)
    volumeAcf: number[];    // Autocorrelation of Shares Traded (Expect high/power-law)
    returnAcf: number[];    // Autocorrelation of Returns (Expect near zero)
    interpretation: string;
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
    dateIndex: number; // Index within the 40-day historical window (0-39) or projected (40+)
  }[];
  trendLines?: {
      start: { x: number, y: number };
      end: { x: number, y: number };
      color: string;
  }[];
  orderFlowAnalysis?: OrderFlowAnalysis;
  summary: string;
}

export interface OptionsAnalysisData {
    prediction: {
        type: "Breakout" | "Bounce" | "Consolidation";
        side: "Upside" | "Downside" | "Neutral";
        probability: number; // 0-100
        target: number;
        stop: number;
    };
    volumeSignal: {
        intensity: "High" | "Average" | "Low";
        trend: "Accumulation" | "Distribution" | "Neutral";
        confirmation: boolean;
        description: string;
    };
    patterns: {
        pattern: string;
        type: "Bullish" | "Bearish" | "Neutral";
        strength: "Strong" | "Moderate" | "Emerging";
    }[];
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

export interface TotalViewData {
    currentPrice: number;
    imbalance: {
        shares: number;
        side: "Buy" | "Sell";
        strength: string; // e.g. "Moderate Buy Side Imbalance"
    };
    bids: {
        price: number;
        shares: number;
        venue: string; // MPID e.g. NSDQ, ARCA
        orders: number;
    }[];
    asks: {
        price: number;
        shares: number;
        venue: string;
        orders: number;
    }[];
    summary: string;
}

export interface BrokerIntelData {
    activity: string;
    consistencyDays: number;
    dominantSide: "Net Buy" | "Net Sell" | "Neutral";
    marketReaction: string;
    traderBias: string;
    investorBias: string;
    recommendation: {
        action: string;
        risk: string;
        color: string; // hex color or tailwind class hint
    };
    confidence: number; // 1-5
    advancedTable: {
        type: string;
        netBuy: string;
        days: number;
        impact: string;
    }[];
    summary: string;
}

export interface FundamentalMetrics {
    open: string;
    dayRange: string;
    fiftyTwoWeekRange: string;
    fiveYearRange: string;
    beta: string;
    volume: string;
    avgVolume: string;
    marketCap: string;
    sharesOutstanding: string;
    float: string;
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
  optionsAnalysis?: OptionsAnalysisData;
  clusteringData?: ClusteringData;
  totalViewData?: TotalViewData;
  brokerIntel?: BrokerIntelData;
  valuationStatus?: "Overvalued" | "Undervalued" | "Fair Value";
  intrinsicValue?: string;
  mpidData?: {
    code: string;
    name: string;
    type: string; // e.g. "Market Maker", "ECN"
  }[];
  fundamentalMetrics?: FundamentalMetrics;
}

export interface TabItem {
  id: AnalysisType;
  label: string;
}

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
  blackScholesMetrics?: {
      impliedVolatility: number;
      callOptionPrice: number;
      putOptionPrice: number;
      greeks: {
          delta: number;
          gamma: number;
          theta: number;
          vega: number;
          rho: number;
      };
  };
}

export interface DeltaGammaHedgeResult {
    portfolioGreeks: {
        netDelta: number;
        netGamma: number;
        netTheta: number;
        netVega: number;
    };
    hedgingActions: {
        type: "Delta-Neutral" | "Gamma-Neutral" | "Full Neutral";
        action: string; // e.g. "Sell 450 shares of Underlying"
        instrument: string;
        impact: string;
    }[];
    sensitivityPath: {
        priceShift: number; // -10% to +10%
        pnlImpact: number;
    }[];
    riskSummary: string;
}

export interface AdvancedPricingResult {
    ticker: string;
    bsm: {
        fairValue: number;
        impliedVol: number;
        greeks: { delta: number; gamma: number; theta: number; vega: number; rho: number };
    };
    heston: {
        parameters: { v0: number; kappa: number; theta: number; sigma: number; rho: number };
        surfaceStatus: string;
        description: string;
    };
    jumpDiffusion: {
        parameters: { lambda: number; muJ: number; sigmaJ: number };
        jumpProbability: number;
        description: string;
    };
    localVol: {
        skewIntensity: "High" | "Moderate" | "Low";
        smileProfile: string;
        description: string;
    };
    varianceSwap: {
        fairVarianceStrike: number;
        notionalExposure: number;
        payoffDescription: string;
    };
    summary: string;
}

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
  evaluationMetrics: {
      accuracy: number;
      precision: number;
      recall: number;
      f1Score: number;
      auc: number;
  };
  tradingMetrics: {
      winningRate: number;
      annualizedReturn: number;
      sharpeRatio: number;
      maxDrawdown: number;
  };
}

export interface CommunityInsightResult {
  ticker: string;
  retailSentiment: number; // 0-100
  institutionalSentiment: number; // 0-100
  summary: string;
  forumTopics: {
    topic: string;
    sentiment: "Bullish" | "Bearish" | "Neutral";
    mentions: number;
    platform: "Reddit" | "Twitter" | "Discord";
  }[];
  hedgeFundActivity: {
    fundName: string;
    action: "Bought" | "Sold" | "Held";
    shares: string;
    date: string;
    url?: string;
  }[];
  analystRatings: {
    buy: number;
    hold: number;
    sell: number;
    consensus: string;
  };
}

export interface ModernPortfolioTheoryTypes {
  efficientFrontier: { risk: number; return: number }[];
}

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
  rebalancingContext: {
    strategyUsed: string;
    nextRebalanceDate: string;
    notes: string;
  };
  correlationMatrix: { ticker1: string; ticker2: string; value: number }[];
}

export interface CAPMAPTResult {
    ticker: string;
    capm: {
        beta: number;
        expectedReturn: number;
        alpha: number;
        rSquared: number;
        sharpeRatio: number;
        securityMarketLineStatus: "Above" | "Below" | "On Line";
    };
    apt: {
        factors: { name: string; beta: number; riskPremium: number; contribution: number }[];
        residualRisk: number;
        totalExpectedReturn: number;
    };
    summary: string;
}

export interface InvestorView {
    type: "Absolute" | "Relative";
    asset1: string;
    asset2?: string;
    expectedReturn: number;
    confidence: number;
}

export interface FuzzyAnalysisResult {
  ticker: string;
  marketMakerBehavior: {
    score: string;
    value: number;
    metrics: {
        spreadCompression: string;
        orderBookImbalance: string;
        icebergProbability: string;
        depthVolatility: string;
    };
  };
  whaleActivity: {
    score: string;
    value: number;
    metrics: {
        blockTradeFreq: string;
        sweepOrders: string;
        flowToxicity: string;
        hiddenOrders: string;
    };
  };
  accumulation: {
    score: string;
    value: number;
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
        marketRisk: { value: number; description: string };
        sizeFactorSMB: { value: number; description: string };
        valueFactorHML: { value: number; description: string };
    };
    fuzzyCognitiveMap: {
        nodes: {
            id: string;
            name: string;
            activationLevel: number;
            influenceType: "Positive" | "Negative" | "Neutral";
        }[];
        primaryCausalLink: string;
    };
    gnnPrediction: {
        signal: "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell";
        confidence: number;
        graphEmbedding: number[];
        predictedTrend: string;
    };
    summary: string;
}

export interface OptimalFuzzyDesignResult {
    ticker: string;
    gfsAnalysis: { 
        score: number;
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
        adaptationSpeed: number;
        description: string;
    };
    mfsAnalysis: { 
        accuracy: number;
        interpretability: number;
        paretoOptimal: boolean; 
        description: string;
    };
    summary: string;
}

export interface FFTSPLPRResult {
    ticker: string;
    twoFactors: {
        internalTrend: {
            description: string;
            strength: number;
        };
        externalDisturbance: {
            description: string;
            impact: number;
        };
    };
    plprRules: {
        ruleId: string;
        condition: string;
        preferenceBehavior: string;
        probability: number;
    }[];
    similarityAnalysis: {
        methodUsed: "Euclidean Distance" | "Hamming Distance";
        distanceValue: number;
        closestHistoricalRuleId: string;
    };
    forecast: {
        direction: "Bullish" | "Bearish" | "Neutral";
        confidence: number;
        priceTarget: number;
    };
    summary: string;
}

export interface ETFProfile {
  ticker: string;
  name: string;
  topHoldings: {
    ticker: string;
    name: string;
    weight: number;
  }[];
}
