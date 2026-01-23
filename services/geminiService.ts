
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
  FFFCMGNNResult, 
  OptimalFuzzyDesignResult, 
  FFTSPLPRResult,
  QuantumMCDMResult,
  Holding,
  InvestorView
} from "../types";

const modelName = "gemini-3-flash-preview";
const proModel = "gemini-3-pro-preview";

// Helper to sanitize and parse AI JSON responses
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

/**
 * Extracts grounding sources from a GenerateContentResponse to satisfy compliance.
 */
const extractSources = (response: any) => {
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return chunks
    .map((chunk: any) => ({
      title: chunk.web?.title || chunk.maps?.title || "Source",
      url: chunk.web?.uri || chunk.maps?.uri || ""
    }))
    .filter((s: any) => s.url);
};

export const runQuantumMCDMAnalysis = async (ticker: string): Promise<QuantumMCDMResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Act as an Expert Quant Decision Scientist. Perform a full Multi-Criteria Decision-Making (MCDM) Analysis for ${ticker} following this exact pipeline:
    1. Delphi Method: Identify & validate criteria.
    2. DEMATEL: Analyze causal relationships.
    3. Quantum Spherical Fuzzy: Model uncertainty using 3D Membership.
    4. Evaluation: Rank alternatives using COCOSO, TOPSIS, and MULTIMOORA.
    5. Final Decision: Aggregate rankings.

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

export const runFFTSPLPRAnalysis = async (ticker: string): Promise<FFTSPLPRResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Perform a 2-Factor Fuzzy Time Series (FFTS) and Probabilistic Linguistic Preference Relations (PLPR) analysis for ${ticker}. 
    This is NOT MCDM. This is Fuzzy Forecasting.
    Return Strictly Valid JSON:
    {
        "ticker": "${ticker}",
        "twoFactorGroups": [
            { "group": "G1", "f1_state": "High Vol", "f2_state": "Low Momentum", "probability": float, "implication": "Bearish Transition" },
            { "group": "G2", "f1_state": "Mid Vol", "f2_state": "Mid Momentum", "probability": float, "implication": "Range Stability" },
            { "group": "G3", "f1_state": "Low Vol", "f2_state": "High Momentum", "probability": float, "implication": "Bullish Expansion" }
        ],
        "plprDistributions": [
            { "term": "S1", "probability": float, "label": "Extremely Bearish" },
            { "term": "S2", "probability": float, "label": "Fairly Bearish" },
            { "term": "S3", "probability": float, "label": "Neutral" },
            { "term": "S4", "probability": float, "label": "Fairly Bullish" },
            { "term": "S5", "probability": float, "label": "Extremely Bullish" }
        ],
        "forecast": {
            "linguisticValue": "string",
            "numericalEstimate": float,
            "lowerBound": float,
            "upperBound": float
        },
        "summary": "string"
    }`;
    const response = await ai.models.generateContent({
        model: proModel,
        contents: prompt,
        config: { responseMimeType: "application/json" },
    });
    return cleanAndParseJSON(response.text || "{}");
};

export const runFFFCMGNNAnalysis = async (ticker: string): Promise<FFFCMGNNResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Analyze ${ticker} using a Fama-French 5-Factor + Fuzzy Cognitive Map + Graph Neural Network architecture.
    Return strictly valid JSON:
    {
        "ticker": "${ticker}",
        "famaFrenchFactors": [
            { "factor": "Market (Rm-Rf)", "loading": float, "significance": "High" | "Med" | "Low" },
            { "factor": "Size (SMB)", "loading": float, "significance": "High" | "Med" | "Low" },
            { "factor": "Value (HML)", "loading": float, "significance": "High" | "Med" | "Low" },
            { "factor": "Profitability (RMW)", "loading": float, "significance": "High" | "Med" | "Low" },
            { "factor": "Investment (CMA)", "loading": float, "significance": "High" | "Med" | "Low" }
        ],
        "fuzzyCognitiveMap": [
            { "node": "Concept A", "influence": float, "target": "Concept B", "state": "Activated" | "Inhibited" }
        ],
        "gnnPrediction": {
            "layers": [
                { "name": "Graph Conv L1", "activation": 0-1, "status": "Stable" },
                { "name": "Pooling L2", "activation": 0-1, "status": "Optimized" },
                { "name": "Latent L3", "activation": 0-1, "status": "Converged" }
            ],
            "latentForecast": float,
            "confidence": 0-1
        },
        "summary": "string"
    }`;
    const response = await ai.models.generateContent({
        model: proModel,
        contents: prompt,
        config: { responseMimeType: "application/json" },
    });
    return cleanAndParseJSON(response.text || "{}");
};

export const runOptimalFuzzyDesignAnalysis = async (ticker: string): Promise<OptimalFuzzyDesignResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Design an independent Optimal Fuzzy Inference System (FIS) for ${ticker} trading strategy. 
    Return JSON: 
    { 
      "ticker": "${ticker}", 
      "systemType": "Mamdani" | "Sugeno",
      "membershipFunctions": [ { "variable": "string", "sets": [ { "name": "Low" | "Mid" | "High", "points": [float, float, float] } ] } ],
      "ruleBase": [ { "if": "string", "then": "string", "weight": 0-1 } ],
      "defuzzification": { "method": "string", "result": float, "label": "string" },
      "gfsAnalysis": { "generations": int, "bestFitness": float },
      "nfsAnalysis": { "neurons": int, "errorRate": float },
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    if (analysisType === AnalysisType.BrokerIntel) {
        const prompt = `Act as a Quantitative Decision Engine for ${ticker}. Research broker activity and price action. Return JSON summary.`;
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" },
        });
        const json = cleanAndParseJSON(response.text || "{}");
        const sources = extractSources(response);
        return { ticker, type: analysisType, content: json.summary, brokerIntel: json, sources };
    }
    if (analysisType === AnalysisType.Technical) {
        const prompt = `Perform institutional-grade Technical Analysis for ${ticker}. Focus on Volume Footprint. Return JSON.`;
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" },
        });
        const json = cleanAndParseJSON(response.text || "{}");
        const sources = extractSources(response);
        return { ticker, type: analysisType, content: json.summary, technicalAnalysis: json, sources };
    }
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Analyze ${ticker} for ${analysisType}.`,
      config: { tools: [{ googleSearch: {} }] },
    });
    const sources = extractSources(response);
    return { ticker, type: analysisType, content: response.text || "No analysis generated.", sources };
  } catch (error: any) {
    throw new Error(`Analysis Failed: ${error.message}`);
  }
};

export const runBacktest = async (t:any, s:any, sd:any, ed:any, tf:any, rr:any, sl:any, tp:any, tr:any, sm:any) => ({} as any);
export const runMLSimulation = async (t:any, m:any, f:any, tp:any, ph:any, ted:any) => ({} as any);
export const runMPTAnalysis = async (h:any, s:any, v:any) => ({} as any);
export const getETFProfile = async (t:any) => ({} as any);
export const runHedgeAnalysis = async (h:any) => ({} as any);
export const runAdvancedPricingAnalysis = async (t:any) => ({} as any);
export const runCAPMAPTAnalysis = async (t:any, r:any, m:any) => ({} as any);
