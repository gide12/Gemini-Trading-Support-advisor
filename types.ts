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

export type View = 'analysis' | 'portfolio' | 'backtest' | 'market' | 'ml' | 'community';

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
  }[];
  analystRatings: {
    buy: number;
    hold: number;
    sell: number;
    consensus: string;
  };
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