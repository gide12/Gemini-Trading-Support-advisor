
import { GoogleGenAI, Type } from "@google/genai";
import { 
  AnalysisType, 
  AnalysisResult, 
  BrokerIntelData, 
  BacktestResult, 
  MLPredictionResult, 
  MPTAnalysisResult, 
  ETFProfile, 
  DeltaGammaHedgeResult, 
  AdvancedPricingResult, 
  CAPMAPTResult, 
  FuzzyAnalysisResult, 
  FFFCMGNNResult, 
  OptimalFuzzyDesignResult, 
  FFTSPLPRResult,
  QuantumMCDMResult,
  Holding,
  InvestorView
} from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelName = "gemini-3-flash-preview";
const proModel = "gemini-3-pro-preview";

const cleanAndParseJSON = (text: string) => {
  try {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) return JSON.parse(jsonMatch[1]);
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) return JSON.parse(text.substring(firstBrace, lastBrace + 1));
    return JSON.parse(text);
  } catch (e) {
    throw new Error("AI response was not valid JSON.");
  }
};

export const runQuantumMCDMAnalysis = async (ticker: string): Promise<QuantumMCDMResult> => {
    const prompt = `Act as an Expert Quant Decision Scientist. Perform a full Multi-Criteria Decision-Making (MCDM) Analysis for ${ticker} following this exact pipeline:
    1. Delphi Method: Identify & validate criteria (Volatility, Volume, Sentiment, Macro, Liquidity).
    2. DEMATEL: Analyze causal relationships between criteria (Centrality R+C, Causality R-C). Identify Causes and Effects.
    3. Quantum Spherical Fuzzy: Model uncertainty using 3D Membership (Alpha), Non-membership (Beta), and Hesitancy (Gamma).
    4. Evaluation: Rank alternatives (Aggressive, Moderate, Conservative, Cash) using COCOSO, TOPSIS, and MULTIMOORA.
    5. Final Decision: Aggregate rankings for the optimal decision.

    RETURN JSON:
    {
        "ticker": "${ticker}",
        "delphiValidation": [ { "criteria": "string", "validationScore": 0-1, "status": "string" } ],
        "dematelAnalysis": [ { "criteria": "string", "centrality": float, "causality": float, "type": "Cause" | "Effect" } ],
        "sphericalFuzzyModeling": { "membership": 0-1, "nonMembership": 0-1, "hesitancy": 0-1, "uncertaintyRadius": float },
        "alternativeEvaluation": [ { "alternative": "string", "cocosoRank": int, "topsisRank": int, "multimooraRank": int, "aggregatedScore": float } ],
        "finalDecision": [ { "rank": int, "alternative": "string", "actionableIntel": "string" } ],
        "summary": "string"
    }`;

    const response = await ai.models.generateContent({
        model: proModel,
        contents: prompt,
        config: { responseMimeType: "application/json" },
    });
    return cleanAndParseJSON(response.text || "{}");
};

export const analyzeStock = async (ticker: string, analysisType: AnalysisType): Promise<AnalysisResult> => {
  try {
    if (analysisType === AnalysisType.BrokerIntel) {
        const prompt = `Act as a Quantitative Decision Engine for ${ticker}. Research broker activity and price action. Return JSON.`;
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" },
        });
        const json = cleanAndParseJSON(response.text || "{}");
        return { ticker, type: analysisType, content: json.summary, brokerIntel: json };
    }
    // Technical, Fundamental, etc. logic...
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Analyze ${ticker} for ${analysisType}.`,
      config: { tools: [{ googleSearch: {} }] },
    });
    return { ticker, type: analysisType, content: response.text || "No analysis generated." };
  } catch (error: any) {
    throw new Error(`Analysis Failed: ${error.message}`);
  }
};

export const runBacktest = async (t:any, s:any, sd:any, ed:any, tf:any, rr:any, sl:any, tp:any, tr:any, sm:any) => ({});
export const runMLSimulation = async (t:any, m:any, f:any, tp:any, ph:any, ted:any) => ({});
export const runMPTAnalysis = async (h:any, s:any, v:any) => ({});
export const getETFProfile = async (t:any) => ({});
export const runHedgeAnalysis = async (h:any) => ({});
export const runAdvancedPricingAnalysis = async (t:any) => ({});
export const runCAPMAPTAnalysis = async (t:any, r:any, m:any) => ({});
export const runFuzzyAnalysis = async (t:any) => ({});
export const runFFFCMGNNAnalysis = async (t:any) => ({});
export const runOptimalFuzzyDesignAnalysis = async (t:any) => ({});
export const runFFTSPLPRAnalysis = async (t:any) => ({});
