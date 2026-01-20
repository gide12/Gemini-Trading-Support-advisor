
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisType, AnalysisResult, ChartDataPoint, BacktestResult, MLPredictionResult, CommunityInsightResult, MPTAnalysisResult, Holding, FuzzyAnalysisResult, FFFCMGNNResult, InstitutionalDeepDiveResult, ETFProfile, OptimalFuzzyDesignResult, FFTSPLPRResult, TotalViewData, OptionsAnalysisData, DeltaGammaHedgeResult, AdvancedPricingResult, CAPMAPTResult, InvestorView, BrokerIntelData } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = "gemini-3-flash-preview";
const proModelName = "gemini-3-pro-preview";

// Helper to clean markdown JSON
const cleanAndParseJSON = (text: string) => {
  try {
    // 1. Try to extract JSON between ```json and ``` markers using Regex
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }

    // 2. Try to extract JSON between first { and last } (ignores preamble/postscript text)
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const candidate = text.substring(firstBrace, lastBrace + 1);
        return JSON.parse(candidate);
    }

    // 3. Fallback: standard cleanup
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse JSON from text:", text);
    throw new Error("AI response was not valid JSON.");
  }
};

export const analyzeStock = async (
  ticker: string,
  analysisType: AnalysisType
): Promise<AnalysisResult> => {
  
  try {
    // 1. CHART
    if (analysisType === AnalysisType.Chart) {
      return { ticker, type: analysisType, content: "Interactive TradingView Chart" };
    }

    // 2. NEWS ANALYSIS
    if (analysisType === AnalysisType.News) {
      const prompt = `Find the latest news for ${ticker} stock. Provide a structured summary with Headline Summary, Key Drivers, and Sentiment (Bullish/Bearish/Neutral). Use markdown.`;
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] },
      });
      const text = response.text || "";
      let sentiment: "Bullish" | "Neutral" | "Bearish" = "Neutral";
      if (text.toLowerCase().includes("bullish")) sentiment = "Bullish";
      if (text.toLowerCase().includes("bearish")) sentiment = "Bearish";

      return {
        ticker,
        type: analysisType,
        content: text,
        sentiment,
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
          title: chunk.web?.title || "Source",
          url: chunk.web?.uri || "#",
        })).filter((s: any) => s.url !== "#") || [],
      };
    }

    // 3. BROKER INTELLIGENCE (Strict JSON)
    if (analysisType === AnalysisType.BrokerIntel) {
        const prompt = `Research broker activity for ${ticker} over the last 10 trading days. Analyze institutional flows vs retail.`;
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        activity: { type: Type.STRING, description: "e.g. Institutional Accumulation" },
                        consistencyDays: { type: Type.NUMBER },
                        dominantSide: { type: Type.STRING, description: "Net Buy, Net Sell, or Neutral" },
                        marketReaction: { type: Type.STRING, description: "e.g. Price Absorption" },
                        traderBias: { type: Type.STRING, description: "Speculative short-term bias" },
                        investorBias: { type: Type.STRING, description: "Long-term accumulation/distribution bias" },
                        recommendation: {
                            type: Type.OBJECT,
                            properties: {
                                action: { type: Type.STRING },
                                risk: { type: Type.STRING },
                                color: { type: Type.STRING, description: "tailwind color name like green-400" }
                            },
                            required: ["action", "risk", "color"]
                        },
                        confidence: { type: Type.NUMBER, description: "1-5 star rating" },
                        advancedTable: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, description: "e.g. Institutional, Retail" },
                                    netBuy: { type: Type.STRING, description: "e.g. +120M" },
                                    days: { type: Type.NUMBER },
                                    impact: { type: Type.STRING, description: "Positive, Negative, or Noise" }
                                },
                                required: ["type", "netBuy", "days", "impact"]
                            }
                        },
                        summary: { type: Type.STRING }
                    },
                    required: ["activity", "consistencyDays", "dominantSide", "marketReaction", "traderBias", "investorBias", "recommendation", "confidence", "advancedTable", "summary"]
                }
            },
        });

        const json = cleanAndParseJSON(response.text || "{}") as BrokerIntelData;
        return {
            ticker,
            type: analysisType,
            content: json.summary,
            brokerIntel: json,
            sentiment: json.dominantSide === "Net Buy" ? "Bullish" : json.dominantSide === "Net Sell" ? "Bearish" : "Neutral"
        };
    }

    // 10. CLUSTERING (Strict JSON)
    if (analysisType === AnalysisType.Clustering) {
      let prompt = `Act as a Quantitative Analyst. Group US stocks using ${ticker} algorithm. Provide clusters with names, descriptions, and a list of typical stock members.`;
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              algorithm: { type: Type.STRING },
              clusters: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    stocks: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["name", "description", "stocks"]
                }
              }
            },
            required: ["algorithm", "clusters"]
          }
        },
      });

      const json = cleanAndParseJSON(response.text || "{}");
      return {
        ticker,
        type: analysisType,
        content: "Market Clustering Analysis Complete",
        clusteringData: json,
      };
    }

    // DEFAULT FALLBACK (NEWS-STYLE TEXT)
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Analyze ${ticker} for ${analysisType}.`,
      config: { tools: [{ googleSearch: {} }] },
    });

    return {
      ticker,
      type: analysisType,
      content: response.text || "No analysis generated.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
          title: chunk.web?.title || "Source",
          url: chunk.web?.uri || "#"
      })).filter((s: any) => s.url !== "#") || []
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(`Analysis Failed: ${error.message || error.toString()}`);
  }
};

export const runBacktest = async (ticker: string, strategy: string, startDate: string, endDate: string, timeframe: string, riskReward: string, stopLoss: string, takeProfit: string, trailingStop: string, simulationModel: string): Promise<BacktestResult> => {
  const prompt = `Perform backtest for ${ticker} strategy: ${strategy}. Model: ${simulationModel}. Return raw JSON only.`;
  const response = await ai.models.generateContent({
    model: proModelName,
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });
  return cleanAndParseJSON(response.text || "{}");
};

export const runMLSimulation = async (ticker: string, modelType: string, features: string[], trainingPeriod: string, predictionHorizon: string, endDate: string): Promise<MLPredictionResult> => {
  const prompt = `Run ML simulation for ${ticker} using ${modelType}. Return raw JSON only.`;
  const response = await ai.models.generateContent({
    model: proModelName,
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });
  return cleanAndParseJSON(response.text || "{}");
};

export const runMPTAnalysis = async (holdings: Holding[], strategy: string, investorViews: InvestorView[]): Promise<MPTAnalysisResult> => {
  const prompt = `Run MPT analysis for portfolio: ${JSON.stringify(holdings)}. Strategy: ${strategy}. Views: ${JSON.stringify(investorViews)}. Return raw JSON only.`;
  const response = await ai.models.generateContent({
    model: proModelName,
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });
  return cleanAndParseJSON(response.text || "{}");
};

export const getETFProfile = async (ticker: string): Promise<ETFProfile> => {
  const prompt = `Fetch ETF profile and holdings for ${ticker}. Return raw JSON only.`;
  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });
  return cleanAndParseJSON(response.text || "{}");
};

export const runHedgeAnalysis = async (holdings: Holding[]): Promise<DeltaGammaHedgeResult> => {
  const prompt = `Run Delta-Gamma hedge analysis for: ${JSON.stringify(holdings)}. Return raw JSON only.`;
  const response = await ai.models.generateContent({
    model: proModelName,
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });
  return cleanAndParseJSON(response.text || "{}");
};

export const runAdvancedPricingAnalysis = async (ticker: string): Promise<AdvancedPricingResult> => {
  const prompt = `Run derivatives pricing for ${ticker}. Return raw JSON only.`;
  const response = await ai.models.generateContent({
    model: proModelName,
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });
  return cleanAndParseJSON(response.text || "{}");
};

export const runCAPMAPTAnalysis = async (ticker: string, rfRate: number, marketReturn: number): Promise<CAPMAPTResult> => {
  const prompt = `Run CAPM/APT multi-factor model for ${ticker}. RF: ${rfRate}%, Market: ${marketReturn}%. Return raw JSON only.`;
  const response = await ai.models.generateContent({
    model: proModelName,
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });
  return cleanAndParseJSON(response.text || "{}");
};

export const runFuzzyAnalysis = async (ticker: string): Promise<FuzzyAnalysisResult> => {
  const prompt = `Run Microstructure Fuzzy Logic for ${ticker}. Return raw JSON only.`;
  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });
  return cleanAndParseJSON(response.text || "{}");
};

export const runFFFCMGNNAnalysis = async (ticker: string): Promise<FFFCMGNNResult> => {
  const prompt = `Run FF-FCM-GNN analysis for ${ticker}. Return raw JSON only.`;
  const response = await ai.models.generateContent({
    model: proModelName,
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });
  return cleanAndParseJSON(response.text || "{}");
};

export const runOptimalFuzzyDesignAnalysis = async (ticker: string): Promise<OptimalFuzzyDesignResult> => {
  const prompt = `Run Optimal FIS Design for ${ticker}. Return raw JSON only.`;
  const response = await ai.models.generateContent({
    model: proModelName,
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });
  return cleanAndParseJSON(response.text || "{}");
};

export const runFFTSPLPRAnalysis = async (ticker: string): Promise<FFTSPLPRResult> => {
  const prompt = `Run FFTS-PLPR analysis for ${ticker}. Return raw JSON only.`;
  const response = await ai.models.generateContent({
    model: proModelName,
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });
  return cleanAndParseJSON(response.text || "{}");
};
