
import { GoogleGenAI, Type } from "@google/genai";
import { 
  AnalysisType, 
  AnalysisResult, 
  PriceActionData,
  TechnicalAnalysisData
} from "../types";

const modelName = "gemini-3-flash-preview";
const proModel = "gemini-3-pro-preview";

/**
 * Robustly cleans and parses JSON from AI responses.
 * Handles markdown code blocks, preamble text, and potential "thinking" blocks.
 */
const cleanAndParseJSON = (text: string) => {
  if (!text) throw new Error("AI returned an empty response.");
  
  try {
    // 1. Try direct parse
    return JSON.parse(text);
  } catch (e) {
    // 2. Try extracting from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (innerE) {}
    }

    // 3. Try finding the first '{' and last '}'
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      try {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
      } catch (innerE) {}
    }
    
    console.error("Failed to parse AI JSON. Raw text:", text);
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
    // PRICE ACTION ADVANCED: Requires strict JSON for chart rendering
    if (analysisType === AnalysisType.PriceAction) {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: `Act as a Smart Money Concepts (SMC) expert. Analyze ${ticker} price action. 
            Identify HH, HL, LH, LL, BOS, CHoCH, Liquidity Sweeps, and Bullish/Bearish Order Blocks.
            Provide exactly 30 candles of realistic OHLC data that demonstrate a structural shift or trend.`,
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
                                    startIdx: { type: Type.INTEGER },
                                    endIdx: { type: Type.INTEGER },
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
                                    startIdx: { type: Type.INTEGER },
                                    endIdx: { type: Type.INTEGER },
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
                        },
                        momentum: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    startIdx: { type: Type.INTEGER },
                                    endIdx: { type: Type.INTEGER },
                                    direction: { type: Type.STRING },
                                    label: { type: Type.STRING }
                                }
                            }
                        }
                    },
                    required: ["summary", "candles", "orderBlocks", "liquiditySweeps", "targets", "bias", "marketRegime"]
                }
            },
        });
        const json = cleanAndParseJSON(response.text);
        return { ticker, type: analysisType, content: json.summary, priceAction: json };
    }

    // TECHNICAL ANALYSIS: Requires strict JSON for chart rendering
    if (analysisType === AnalysisType.Technical) {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: `Perform high-fidelity Technical Analysis for ${ticker}. Include Support/Resistance zones and volume-confirmed breakout points.`,
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
                                rsiVal: { type: Type.INTEGER },
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
                        },
                        breakoutPoints: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    price: { type: Type.NUMBER },
                                    type: { type: Type.STRING },
                                    label: { type: Type.STRING },
                                    time: { type: Type.STRING },
                                    confidence: { type: Type.NUMBER }
                                }
                            }
                        }
                    },
                    required: ["currentPrice", "trend", "summary", "priceHistory", "indicators", "supportResistance"]
                }
            },
        });
        const json = cleanAndParseJSON(response.text);
        return { ticker, type: analysisType, content: json.summary, technicalAnalysis: json };
    }
    
    // DEFAULT: Conversational with Search Grounding (News, Ideas, etc.)
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Analyze ${ticker} for ${analysisType}. Provide deep institutional insights.`,
      config: { tools: [{ googleSearch: {} }] },
    });
    return { ticker, type: analysisType, content: response.text || "No analysis generated.", sources: extractSources(response) };
  } catch (error: any) {
    console.error(`Gemini Service Error (${analysisType}):`, error);
    throw new Error(error.message || "An unexpected error occurred during AI analysis.");
  }
};

export const runQuantumMCDMAnalysis = async (t:any) => ({} as any);
export const runFFTSPLPRAnalysis = async (t:any) => ({} as any);
export const runFFFCMGNNAnalysis = async (t:any) => ({} as any);
export const runOptimalFuzzyDesignAnalysis = async (t:any) => ({} as any);
export const runBacktest = async (t:any, s:any, sd:any, ed:any, tf:any, rr:any, sl:any, tp:any, tr:any, sm:any) => ({} as any);
export const runMLSimulation = async (t:any, m:any, f:any, tp:any, ph:any, ted:any) => ({} as any);
export const runMPTAnalysis = async (h:any, s:any, v:any) => ({} as any);
export const getETFProfile = async (t:any) => ({} as any);
export const runHedgeAnalysis = async (h:any) => ({} as any);
export const runAdvancedPricingAnalysis = async (t:any) => ({} as any);
export const runCAPMAPTAnalysis = async (t:any, r:any, m:any) => ({} as any);
