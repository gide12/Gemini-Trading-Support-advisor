
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisType, AnalysisResult, ChartDataPoint, BacktestResult, MLPredictionResult, CommunityInsightResult, MPTAnalysisResult, Holding, FuzzyAnalysisResult, FFFCMGNNResult, InstitutionalDeepDiveResult, ETFProfile, OptimalFuzzyDesignResult, FFTSPLPRResult, TotalViewData, OptionsAnalysisData } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = "gemini-2.5-flash";

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

    // 3. Fallback: standard cleanup (remove markdown code blocks if regex didn't catch them)
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
    // 1. CHART (TradingView Widget)
    if (analysisType === AnalysisType.Chart) {
      return {
        ticker,
        type: analysisType,
        content: "Interactive TradingView Chart",
      };
    }

    // 2. NEWS ANALYSIS
    if (analysisType === AnalysisType.News) {
      const prompt = `Find the latest news for ${ticker} stock. 
      
      Please provide a structured summary:
      1. **Headline Summary**: A brief 2-sentence overview of the current situation.
      2. **Key Drivers**: A bulleted list of the specific events moving the stock.
      3. **Sentiment**: Explicitly state if the news is Bullish, Bearish, or Neutral.
      
      Use markdown formatting.`;
      
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => ({
          title: chunk.web?.title || "Source",
          url: chunk.web?.uri || "#",
        }))
        .filter((s: any) => s.url !== "#") || [];

      const text = response.text || "";
      let sentiment: "Bullish" | "Neutral" | "Bearish" = "Neutral";
      if (text.toLowerCase().includes("bullish") || text.toLowerCase().includes("positive")) sentiment = "Bullish";
      if (text.toLowerCase().includes("bearish") || text.toLowerCase().includes("negative")) sentiment = "Bearish";

      return {
        ticker,
        type: analysisType,
        content: text,
        sentiment,
        sources,
      };
    }

    // 3. YAHOO FINANCE
    if (analysisType === AnalysisType.YahooFinance) {
      const prompt = `Retrieve the latest financial data for ${ticker} using Yahoo Finance as the primary source.
      
      Get these specific metrics:
      - Current Price
      - Market Cap
      - Trailing P/E
      - Forward P/E
      - PEG Ratio
      - Price/Sales
      - Price/Book
      - EV/Revenue
      - EV/EBITDA
      
      IMPORTANT: Return ONLY a raw JSON object with this structure:
      {
        "summary": "string (company profile)",
        "metrics": { "Current Price": "string", "Market Cap": "string", ... }
      }`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] },
      });

      const json = cleanAndParseJSON(response.text || "{}");
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => ({ title: chunk.web?.title || "Source", url: chunk.web?.uri || "#" }))
        .filter((s: any) => s.url !== "#") || [];

      return {
        ticker,
        type: analysisType,
        content: json.summary || "No profile available.",
        financials: json.metrics || {},
        sources
      };
    }

    // 4. TRADE IDEAS
    if (analysisType === AnalysisType.Ideas) {
      const prompt = `Based on current market conditions for ${ticker}, suggest a potential trade setup.
      Return JSON: { "reasoning": "string", "entry": "string", "stopLoss": "string", "takeProfit": "string", "sentiment": "Bullish" | "Bearish" | "Neutral" }`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] },
      });

      const json = cleanAndParseJSON(response.text || "{}");
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => ({ title: chunk.web?.title || "Source", url: chunk.web?.uri || "#" }))
        .filter((s: any) => s.url !== "#");

      return {
        ticker,
        type: analysisType,
        content: json.reasoning,
        tradeSetup: { entry: json.entry, stopLoss: json.stopLoss, takeProfit: json.takeProfit },
        sentiment: json.sentiment,
        sources
      };
    }

    // 5. TECHNICAL ANALYSIS (NEW STRUCTURED)
    if (analysisType === AnalysisType.Technical) {
        const prompt = `Act as a quantitative technical analyst. Analyze ${ticker} using standard indicators AND Institutional Order Flow logic.
        
        1. Standard: RSI, MACD, Moving Averages.
        2. **Log Returns**: Calculate the **Daily Log Return**: ln(Current Price / Previous Close).
        3. **Order Flow Autocorrelation**: Investigate the presence of metaorders (large institutional orders broken into child orders).
           - Analyze Trade Signs (Buy/Sell/None): Expect minimal autocorrelation (randomness).
           - Analyze Trade Volume (Shares): Expect power-law decay (persistence) if institutions are active.
           - Analyze Returns: Expect near zero autocorrelation (Efficient Market).

        IMPORTANT: Return ONLY a raw JSON object (no markdown) with this structure:
        {
          "currentPrice": number,
          "dailyLogReturn": number,
          "trend": "Bullish" | "Bearish" | "Neutral",
          "signalStrength": "Strong" | "Moderate" | "Weak",
          "indicators": {
            "rsi": "string",
            "macd": "string",
            "movingAverages": "string",
            "bollingerBands": "string"
          },
          "supportResistance": {
            "support": [number, number],
            "resistance": [number, number]
          },
          "orderFlowAnalysis": {
            "tradeSignAcf": [number, ...],
            "volumeAcf": [number, ...],
            "returnAcf": [number, ...],
            "interpretation": "string"
          },
          "summary": "string"
        }`;

        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] },
        });

        const json = cleanAndParseJSON(response.text || "{}");
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map((chunk: any) => ({ title: chunk.web?.title || "Source", url: chunk.web?.uri || "#" }))
            .filter((s: any) => s.url !== "#");

        return {
            ticker,
            type: analysisType,
            content: json.summary,
            sentiment: json.trend,
            technicalAnalysis: json,
            sources
        };
    }

    // 6. OPTIONS EXPERT ANALYSIS (NEW)
    if (analysisType === AnalysisType.OptionsExpert) {
        const prompt = `Act as an Options Strategist and Price Action Expert. Perform an analysis on ${ticker} focusing on Breakout and Bounce scenarios.
        
        1. **Breakout vs Bounce Prediction**: Predict the most likely immediate structural move (Breakout/Bounce/Consolidation).
        2. **Volume Confirmation**: Analyze recent volume relative to average. Look for confirmation of price action.
        3. **Price Action & Candle Patterns**: Identify specific candlestick patterns (e.g., Engulfing, Pin Bar, Inside Bar).
        
        IMPORTANT: Return ONLY a raw JSON object (no markdown) with this structure:
        {
          "prediction": {
            "type": "Breakout" | "Bounce" | "Consolidation",
            "side": "Upside" | "Downside" | "Neutral",
            "probability": number (0-100),
            "target": number (estimated price target),
            "stop": number (estimated failure level)
          },
          "volumeSignal": {
            "intensity": "High" | "Average" | "Low",
            "trend": "Accumulation" | "Distribution" | "Neutral",
            "confirmation": boolean,
            "description": "string (brief summary of volume dynamics)"
          },
          "patterns": [
            { "pattern": "string", "type": "Bullish" | "Bearish", "strength": "Strong" | "Moderate" | "Emerging" }
          ],
          "summary": "string (Options expert tactical recommendation)"
        }`;

        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] },
        });

        const json = cleanAndParseJSON(response.text || "{}");
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map((chunk: any) => ({ title: chunk.web?.title || "Source", url: chunk.web?.uri || "#" }))
            .filter((s: any) => s.url !== "#");

        let sentiment: "Bullish" | "Bearish" | "Neutral" = "Neutral";
        if (json.prediction.side === "Upside") sentiment = "Bullish";
        if (json.prediction.side === "Downside") sentiment = "Bearish";

        return {
            ticker,
            type: analysisType,
            content: json.summary,
            sentiment,
            optionsAnalysis: json,
            sources
        };
    }

    // 7. FUNDAMENTAL ANALYSIS (Structured)
    if (analysisType === AnalysisType.Fundamental) {
        const prompt = `Act as a professional equity research analyst. Perform a deep-dive fundamental analysis on ${ticker} using the latest data.
        
        1. Determine if the stock is Overvalued, Undervalued, or Fair Value based on DCF models, P/E ratios, and growth prospects.
        2. Retrieve key market statistics: Open, Range, Beta, etc.
        3. Identify major MPIDs.
        
        IMPORTANT: Return ONLY a raw JSON object (no markdown code blocks) with this structure:
        {
          "valuationStatus": "Overvalued" | "Undervalued" | "Fair Value",
          "intrinsicValue": "string",
          "summary": "string",
          "sentiment": "Bullish" | "Bearish" | "Neutral",
          "metrics": { "open": "string", ... },
          "mpidData": [{ "code": "string", "name": "string", "type": "string" }]
        }`;

        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] },
        });

        const json = cleanAndParseJSON(response.text || "{}");
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map((chunk: any) => ({ title: chunk.web?.title || "Source", url: chunk.web?.uri || "#" }))
            .filter((s: any) => s.url !== "#");

        return {
            ticker,
            type: analysisType,
            content: json.summary,
            sentiment: json.sentiment,
            valuationStatus: json.valuationStatus,
            intrinsicValue: json.intrinsicValue,
            mpidData: json.mpidData,
            fundamentalMetrics: json.metrics,
            sources
        };
    }

    // 8. NASDAQ TOTALVIEW (LEVEL 2)
    if (analysisType === AnalysisType.TotalView) {
        const prompt = `Act as a NASDAQ TotalView emulator. Simulate Level 2 market depth data for ${ticker}.
        Return ONLY a raw JSON object.`;

        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] },
        });

        const json = cleanAndParseJSON(response.text || "{}");
        
        return {
            ticker,
            type: analysisType,
            content: json.summary,
            totalViewData: json
        };
    }

    // 9. CLUSTERING (Structured JSON)
    if (analysisType === AnalysisType.Clustering) {
      let prompt = `Act as a Quantitative Analyst. Group US stocks using ${ticker} algorithm. Return JSON.`;
      
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        },
      });

      const json = JSON.parse(response.text || "{}");
      return {
        ticker,
        type: analysisType,
        content: "Market Clustering Complete",
        clusteringData: json,
      };
    }

    // 10. QUANTUM (General Text)
    const promptMap: Record<string, string> = {
      [AnalysisType.Quantum]: `Perform a theoretical Quantum Financial Forecast for ${ticker}.`,
    };

    const prompt = promptMap[analysisType] || `Analyze ${ticker}`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    return {
      ticker,
      type: analysisType,
      content: response.text || "No analysis generated.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => ({
            title: chunk.web?.title || "Source",
            url: chunk.web?.uri || "#"
        }))
        .filter((s: any) => s.url !== "#")
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const msg = error.message || error.toString();
    throw new Error(`Analysis Failed: ${msg}`);
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
  simulationModel: string = "Standard (Historical)"
): Promise<BacktestResult> => {
  const prompt = `Simulate a trading backtest for ${ticker}. Strategy: ${strategy}. Return JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "{}") as BacktestResult;
  } catch (error: any) {
    console.error("Backtest Error:", error);
    throw new Error(`Backtest Failed`);
  }
};

export const runMLSimulation = async (
  ticker: string,
  modelType: string,
  features: string[],
  trainingPeriod: string,
  predictionHorizon: string,
  trainingEndDate: string
): Promise<MLPredictionResult> => {
  const prompt = `Act as AI Trading Model (${modelType}). Analyze ${ticker}. Return JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    return JSON.parse(response.text || "{}") as MLPredictionResult;

  } catch (error: any) {
    console.error("ML Sim Error:", error);
    throw new Error(`ML Simulation Failed`);
  }
};

export const getCommunityInsights = async (ticker: string): Promise<CommunityInsightResult> => {
  const prompt = `Analyze the community and institutional sentiment for ${ticker}. Return JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    return cleanAndParseJSON(response.text || "{}") as CommunityInsightResult;
  } catch (error: any) {
    console.error("Community Insight Error:", error);
    throw new Error(`Community Insight Failed`);
  }
};

export const runInstitutionalDeepDive = async (ticker: string, institution: string): Promise<InstitutionalDeepDiveResult> => {
    const prompt = `Conduct a deep dive investigation into **${institution}**'s relationship with **${ticker}**. Return JSON.`;
    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        return cleanAndParseJSON(response.text || "{}") as InstitutionalDeepDiveResult;
    } catch (error: any) {
        throw new Error("Deep Dive Analysis Failed");
    }
};

export const runMPTAnalysis = async (holdings: Holding[], rebalancingStrategy: string = "Standard MPT"): Promise<MPTAnalysisResult> => {
    const prompt = `Perform MPT optimization for these holdings. Return JSON.`;
    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] },
        });
        return cleanAndParseJSON(response.text || "{}") as MPTAnalysisResult;
    } catch (e: any) {
        throw new Error("MPT Analysis Failed");
    }
};

export const getETFProfile = async (ticker: string): Promise<ETFProfile> => {
  const prompt = `Analyze the ETF **${ticker}**. Return top holdings. Return JSON.`;
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return cleanAndParseJSON(response.text || "{}") as ETFProfile;
  } catch (error: any) {
    throw new Error("Failed to fetch ETF Profile");
  }
};

export const runFuzzyAnalysis = async (ticker: string): Promise<FuzzyAnalysisResult> => {
  const prompt = `Act as Fuzzy Logic Financial System. Analyze **${ticker}**. Return JSON.`;
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return cleanAndParseJSON(response.text || "{}") as FuzzyAnalysisResult;
  } catch (error: any) {
    throw new Error("Fuzzy Analysis Failed");
  }
};

export const runFFFCMGNNAnalysis = async (ticker: string): Promise<FFFCMGNNResult> => {
  const prompt = `Perform Hybrid FF-FCM-GNN Analysis for **${ticker}**. Return JSON.`;
  try {
     const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] },
    });
    return cleanAndParseJSON(response.text || "{}") as FFFCMGNNResult;
  } catch (e: any) {
    throw new Error("FF-FCM-GNN Analysis Failed");
  }
};

export const runOptimalFuzzyDesignAnalysis = async (ticker: string): Promise<OptimalFuzzyDesignResult> => {
    const prompt = `Perform Optimal FIS Design Analysis for **${ticker}**. Return JSON.`;
    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] },
        });
        return cleanAndParseJSON(response.text || "{}") as OptimalFuzzyDesignResult;
    } catch (e: any) {
        throw new Error("Optimal FIS Analysis Failed");
    }
};

export const runFFTSPLPRAnalysis = async (ticker: string): Promise<FFTSPLPRResult> => {
    const prompt = `Perform FFTS-PLPR Analysis for **${ticker}**. Return JSON.`;
    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] },
        });
        return cleanAndParseJSON(response.text || "{}") as FFTSPLPRResult;
    } catch (e: any) {
        throw new Error("FFTS-PLPR Analysis Failed");
    }
};
