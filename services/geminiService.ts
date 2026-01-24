
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
            contents: `Analyze ${ticker} using SMC. Provide 30 candles JSON.`,
            config: { responseMimeType: "application/json" }
        });
        const json = cleanAndParseJSON(response.text);
        return { ticker, type: analysisType, content: json.summary, priceAction: json };
    }
    if (analysisType === AnalysisType.Technical) {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: `Analyze ${ticker} technically. Provide S/R and historical price JSON.`,
            config: { responseMimeType: "application/json" }
        });
        const json = cleanAndParseJSON(response.text);
        return { ticker, type: analysisType, content: json.summary, technicalAnalysis: json };
    }
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Analyze ${ticker} for ${analysisType}.`,
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
    Simulation Model: ${simulationModel} (Note: If Gordon Constant Growth is selected, focus on intrinsic value pathways and dividend growth compounding).

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
