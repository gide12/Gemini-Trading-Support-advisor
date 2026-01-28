
import { GoogleGenAI, Type } from "@google/genai";
import { 
  AnalysisType, 
  AnalysisResult, 
  PriceActionData,
  TechnicalAnalysisData,
  BacktestResult
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
      try { return JSON.parse(text.substring(firstBrace, lastBrace + 1)); } catch (innerE) {}
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
                                },
                                required: ["time", "open", "high", "low", "close", "volume"]
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
                    },
                    required: ["summary", "candles", "orderBlocks", "liquiditySweeps", "targets", "bias", "marketRegime"]
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
                                macdVal: { type: Type.NUMBER },
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
                    },
                    required: ["currentPrice", "trend", "summary", "priceHistory", "indicators", "supportResistance"]
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
    const prompt = `Perform a financial backtest simulation for ${ticker} from ${startDate} to ${endDate}.
    Strategy: ${strategy}
    Timeframe: ${timeframe}
    Risk Params: RR ${riskReward}, SL ${stopLoss}, TP ${takeProfit}, Trailing ${trailingStop}
    Simulation Model: ${simulationModel}. 
    
    Note: If "Gordon Constant Growth Model" is selected, evaluate the ticker based on its dividend payout ratio, 
    required rate of return, and dividend growth rate to determine intrinsic value pathways.

    Return JSON matching this structure:
    {
        "metrics": { "totalReturn": "string %", "maxDrawdown": "string %", "winRate": "string %", "tradesCount": int },
        "equityCurve": [ { "date": "string", "value": number } ],
        "trades": [ { "date": "string", "type": "Buy"|"Sell", "price": number, "result": "string" } ],
        "summary": "AI breakdown of the simulation pathways.",
        "blackScholesMetrics": { "impliedVolatility": number, "callOptionPrice": number, "putOptionPrice": number } 
    }
    IMPORTANT: Generate exactly 20-30 data points for the equity curve.`;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text);
    } catch (e: any) {
        console.error(e);
        throw new Error("Simulation Engine Offline: Failed to compute pathways.");
    }
};

export const runQuantumMCDMAnalysis = async (t:any) => ({} as any);
export const runFFTSPLPRAnalysis = async (t:any) => ({} as any);
export const runFFFCMGNNAnalysis = async (t:any) => ({} as any);
export const runOptimalFuzzyDesignAnalysis = async (t:any) => ({} as any);
export const runMLSimulation = async (t:any, m:any, f:any, tp:any, ph:any, ted:any) => ({} as any);
export const runMPTAnalysis = async (h:any, s:any, v:any) => ({} as any);
export const getETFProfile = async (t:any) => ({} as any);
export const runHedgeAnalysis = async (h:any) => ({} as any);
export const runAdvancedPricingAnalysis = async (t:any) => ({} as any);
export const runCAPMAPTAnalysis = async (t:any, r:any, m:any) => ({} as any);
