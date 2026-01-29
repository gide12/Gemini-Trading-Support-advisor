
import { GoogleGenAI, Type } from "@google/genai";
import { 
  AnalysisType, 
  AnalysisResult, 
  PriceActionData,
  TechnicalAnalysisData,
  BacktestResult,
  BrokerIntelData,
  MLPredictionResult
} from "../types";

const modelName = "gemini-3-flash-preview";

const cleanAndParseJSON = (text: string) => {
  if (!text) throw new Error("AI returned an empty response.");
  try {
    return JSON.parse(text);
  } catch (e) {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try { return JSON.parse(jsonMatch[1]); } catch (innerE) {}
    }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      try { return JSON.parse(lastBrace > firstBrace ? text.substring(firstBrace, lastBrace + 1) : text.substring(firstBrace)); } catch (innerE) {}
    }
    throw new Error("Analysis Failed: AI response was not valid JSON.");
  }
};

const extractSources = (response: any) => {
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return chunks
    .map((chunk: any) => ({
      title: chunk.web?.title || chunk.maps?.title || "Source",
      url: chunk.web?.uri || chunk.maps?.uri || ""
    }))
    .filter((s: any) => s.url);
};

export const analyzeStock = async (ticker: string, analysisType: AnalysisType): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    if (analysisType === AnalysisType.News) {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: `Search for the latest financial news regarding ${ticker}. Focus specifically on major publishers like Bloomberg, Financial Times, Wall Street Journal, and Yahoo Finance. 
            Return a detailed summary and a structured list of at least 5 news items.`,
            config: { 
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        newsItems: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    url: { type: Type.STRING },
                                    source: { type: Type.STRING, description: "Choose from: Bloomberg, Financial Times, Wall Street Journal, Yahoo Finance, or Other" },
                                    snippet: { type: Type.STRING },
                                    time: { type: Type.STRING },
                                    sentiment: { type: Type.STRING, description: "Positive, Negative, or Neutral" }
                                },
                                required: ["title", "url", "source", "snippet", "time", "sentiment"]
                            }
                        }
                    },
                    required: ["summary", "newsItems"]
                }
            }
        });
        const json = cleanAndParseJSON(response.text);
        return { ticker, type: analysisType, content: json.summary, newsItems: json.newsItems, sources: extractSources(response) };
    }

    if (analysisType === AnalysisType.BrokerIntel) {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: `Act as a Senior Institutional Data Analyst. Provide Broker Intelligence for ${ticker}. 
            Analyze institutional flow, net buy ratios, and broker activity trends. 
            Include a "Data Analyst Synthesis" (at least 2 paragraphs) summarizing the high-level positioning.`,
            config: { 
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        analystSynthesis: { type: Type.STRING },
                        dominantSide: { type: Type.STRING },
                        metrics: {
                            type: Type.OBJECT,
                            properties: {
                                brokerFlow: {
                                    type: Type.OBJECT,
                                    properties: {
                                        netBuyRatio: { type: Type.NUMBER },
                                        flowConsistency: { type: Type.NUMBER },
                                        participantQuality: { type: Type.NUMBER }
                                    }
                                }
                            }
                        },
                        brokerActivityHistory: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    date: { type: Type.STRING },
                                    activity: { type: Type.NUMBER }
                                }
                            }
                        },
                        summary: { type: Type.STRING }
                    },
                    required: ["analystSynthesis", "dominantSide", "metrics", "brokerActivityHistory", "summary"]
                }
            }
        });
        const json = cleanAndParseJSON(response.text);
        return { ticker, type: analysisType, content: json.analystSynthesis, brokerIntel: json };
    }

    if (analysisType === AnalysisType.PriceAction) {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: `Act as a Senior Quant. Analyze ${ticker} using Smart Money Concepts (SMC). 
            Generate exactly 30 candles of OHLC data. Identify Break of Structure (BOS), Change of Character (CHoCH), 
            Bullish/Bearish Order Blocks, and Liquidity Sweeps.`,
            config: { 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        marketRegime: { type: Type.STRING },
                        bias: { type: Type.STRING },
                        candles: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    time: { type: Type.STRING },
                                    open: { type: Type.NUMBER },
                                    high: { type: Type.NUMBER },
                                    low: { type: Type.NUMBER },
                                    close: { type: Type.NUMBER },
                                    volume: { type: Type.NUMBER },
                                    label: { type: Type.STRING, nullable: true },
                                    breakLinePrice: { type: Type.NUMBER, nullable: true }
                                }
                            }
                        },
                        orderBlocks: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING },
                                    top: { type: Type.NUMBER },
                                    bottom: { type: Type.NUMBER },
                                    startIdx: { type: Type.NUMBER },
                                    endIdx: { type: Type.NUMBER },
                                    label: { type: Type.STRING }
                                }
                            }
                        },
                        liquiditySweeps: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING },
                                    top: { type: Type.NUMBER },
                                    bottom: { type: Type.NUMBER },
                                    startIdx: { type: Type.NUMBER },
                                    endIdx: { type: Type.NUMBER },
                                    label: { type: Type.STRING }
                                }
                            }
                        },
                        targets: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    price: { type: Type.NUMBER },
                                    label: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });
        const json = cleanAndParseJSON(response.text);
        return { ticker, type: analysisType, content: json.summary, priceAction: json };
    }
    
    if (analysisType === AnalysisType.Technical) {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: `Analyze ${ticker} using Technical Indicators. Include Support/Resistance and price history.`,
            config: { 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        currentPrice: { type: Type.NUMBER },
                        trend: { type: Type.STRING },
                        signalStrength: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        priceHistory: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    time: { type: Type.STRING },
                                    price: { type: Type.NUMBER },
                                    volume: { type: Type.NUMBER }
                                }
                            }
                        },
                        indicators: {
                            type: Type.OBJECT,
                            properties: {
                                rsi: { type: Type.STRING },
                                rsiVal: { type: Type.NUMBER },
                                macd: { type: Type.STRING },
                                movingAverages: { type: Type.STRING },
                                bollingerBands: { type: Type.STRING }
                            }
                        },
                        supportResistance: {
                            type: Type.OBJECT,
                            properties: {
                                support: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                                resistance: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                            }
                        }
                    }
                }
            }
        });
        const json = cleanAndParseJSON(response.text);
        return { ticker, type: analysisType, content: json.summary, technicalAnalysis: json };
    }
    
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Analyze ${ticker} for ${analysisType}. Provide detailed institutional insights.`,
      config: { tools: [{ googleSearch: {} }] },
    });
    return { ticker, type: analysisType, content: response.text || "No analysis generated.", sources: extractSources(response) };
  } catch (error: any) {
    throw new Error(error.message || "An unexpected error occurred.");
  }
};

export const runBacktest = async (
    ticker: string, 
    strategy: string, 
    startDate: string, 
    endDate: string, 
    timeframe: string, 
    riskReward: string, 
    stopLoss: string, 
    takeProfit: string, 
    trailingStop: string,
    simulationModel: string
): Promise<BacktestResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Perform a financial backtest simulation for ${ticker} from ${startDate} to ${endDate}. Strategy: ${strategy}. Simulation Model: ${simulationModel}. 
    Return JSON matching the expected structure.`;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text);
    } catch (e: any) {
        throw new Error("Simulation Engine Offline.");
    }
};

export const runMLSimulation = async (
    ticker: string, 
    modelType: string, 
    features: string[], 
    trainingPeriod: string, 
    predictionHorizon: string, 
    endDate: string
): Promise<MLPredictionResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Perform a Machine Learning simulation for ${ticker} using the ${modelType} architecture.
    Features: ${features.join(", ")}. Training: ${trainingPeriod} ending ${endDate}. Prediction: ${predictionHorizon}.
    If model is "PCA-ML", emphasize the extraction of principal components and dimensionality reduction impact.
    Return JSON:
    {
        "ticker": "string",
        "currentPrice": number,
        "predictedPrice": number,
        "confidenceScore": number,
        "volatility": "string",
        "modelUsed": "string",
        "featureImportance": [ { "feature": "string", "score": number } ],
        "predictionPath": [ { "date": "string", "price": number, "upper": number, "lower": number } ],
        "explanation": "string describing model logic and PCA components if applicable",
        "evaluationMetrics": { "accuracy": number, "f1Score": number },
        "tradingMetrics": { "annualizedReturn": number, "sharpeRatio": number }
    }`;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text);
    } catch (e: any) {
        throw new Error("ML Engine Convergence Failure.");
    }
};

export const runQuantumMCDMAnalysis = async (t:any) => ({} as any);
export const runFFTSPLPRAnalysis = async (t:any) => ({} as any);
export const runFFFCMGNNAnalysis = async (t:any) => ({} as any);
export const runOptimalFuzzyDesignAnalysis = async (t:any) => ({} as any);
export const runMPTAnalysis = async (h:any, s:any, v:any) => ({} as any);
export const getETFProfile = async (t:any) => ({} as any);
export const runHedgeAnalysis = async (h:any) => ({} as any);
export const runAdvancedPricingAnalysis = async (t:any) => ({} as any);
export const runCAPMAPTAnalysis = async (t:any, r:any, m:any) => ({} as any);
