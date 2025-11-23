import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisType, AnalysisResult, ChartDataPoint, BacktestResult, MLPredictionResult, CommunityInsightResult, MPTAnalysisResult, Holding } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = "gemini-2.5-flash";

// Helper to clean markdown JSON
const cleanAndParseJSON = (text: string) => {
  try {
    // Remove markdown code blocks if present
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
        const prompt = `Act as a technical analyst. Analyze ${ticker} using indicators like RSI, MACD, and Moving Averages based on recent data found via search.
        
        IMPORTANT: Return ONLY a raw JSON object (no markdown) with this structure:
        {
          "currentPrice": number (raw number of current price),
          "trend": "Bullish" | "Bearish" | "Neutral",
          "signalStrength": "Strong" | "Moderate" | "Weak",
          "indicators": {
            "rsi": "string (e.g. '45 - Neutral')",
            "macd": "string (e.g. 'Bullish Crossover')",
            "movingAverages": "string (e.g. 'Price above 200 MA')",
            "bollingerBands": "string (e.g. 'Squeeze')"
          },
          "supportResistance": {
            "support": [number, number] (Array of 2-3 numbers for support levels),
            "resistance": [number, number] (Array of 2-3 numbers for resistance levels)
          },
          "summary": "string (brief analysis text)"
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

    // 6. CLUSTERING (Structured JSON)
    if (analysisType === AnalysisType.Clustering) {
      const prompt = `Act as a Quantitative Analyst. Perform a market simulation using **${ticker}**.
      
      Task: Group major US stocks into clusters based on **Correlation + Hierarchical** logic (identifying structural market regimes).
      
      Requirements:
      1. Generate 4 to 6 distinct clusters.
      2. For each cluster, provide a short 2-3 word Name (e.g. "Semiconductor Momentum", "Defensive Value").
      3. Provide a concise description (max 15 words) explaining the common factor.
      4. List exactly 6-8 representative stock tickers per cluster.

      Return ONLY raw JSON matching this structure:
      {
        "algorithm": "${ticker}",
        "clusters": [
          { "name": "string", "description": "string", "stocks": ["AAPL", "MSFT"] }
        ]
      }`;

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
                         }
                     }
                 }
             }
          }
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

    // 7. FUNDAMENTAL / QUANTUM (General Text)
    const promptMap: Record<string, string> = {
      [AnalysisType.Fundamental]: `Act as a professional equity research analyst. Perform a deep-dive fundamental analysis on ${ticker}. Structure nicely with markdown headers.`,
      
      [AnalysisType.Quantum]: `Perform a theoretical Quantum Financial Forecast for ${ticker} using advanced quantum computing algorithms.
      
      Analyze the asset using these three specific methodologies:

      ### 1. VARIATIONAL QUANTUM EIGENSOLVER analysis
      - **Concept**: Use VQE to simulate the ground state energy of a Hamiltonian representing the asset's volatility surface.
      - **Application**: Determine the "Ground State" price stability of ${ticker}. Is the asset currently in a high-energy (unstable) or low-energy (stable) state?

      ### 2. CONDITIONAL VALUE AT RISK—VARIATIONAL QUANTUM EIGENSOLVER (CVARVQE) analysis
      - **Concept**: An adaptation of VQE that focuses on the tail of the loss distribution (Conditional Value at Risk).
      - **Application**: Assess the specific tail risks (worst 5% outcomes) for ${ticker}. Provide a theoretical downside protection level.

      ### 3. QUANTUM APPROXIMATE OPTIMIZATION ALGORITHM
      - **Concept**: A quantum algorithm for combinatorial optimization problems.
      - **Application**: Model the optimal trading trajectory for ${ticker} as a max-cut problem on a graph of market correlations. What is the optimal action sequence?

      **Conclusion**: Synthesize these quantum indicators into a final theoretical forecast.
      
      Use Markdown formatting.`,
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
  riskReward: string
): Promise<BacktestResult> => {
  const prompt = `Simulate a trading backtest for ${ticker} using the following strategy: "${strategy}".
  Date Range: ${startDate} to ${endDate}.
  Timeframe: ${timeframe}.
  Risk/Reward Ratio: ${riskReward}.
  
  Assume a starting capital of $10,000.
  
  Return a JSON object with:
  1. metrics: { totalReturn, maxDrawdown, winRate, tradesCount }
  2. equityCurve: Array of { date, value }
  3. trades: Array of { date, type, price, result }
  4. summary: Text summary.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            metrics: {
              type: Type.OBJECT,
              properties: {
                totalReturn: { type: Type.STRING },
                maxDrawdown: { type: Type.STRING },
                winRate: { type: Type.STRING },
                tradesCount: { type: Type.NUMBER },
              }
            },
            equityCurve: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                }
              }
            },
            trades: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["Buy", "Sell"] },
                  price: { type: Type.NUMBER },
                  result: { type: Type.STRING },
                }
              }
            },
            summary: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}") as BacktestResult;
  } catch (error: any) {
    console.error("Backtest Error:", error);
    const msg = error.message || error.toString();
    throw new Error(`Backtest Failed: ${msg}`);
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
  let specificInstructions = "";
  
  if (modelType === "Reinforcement Learning (DCRL)") {
    specificInstructions = `
    Specific Architecture Instructions:
    - Utilize Reinforcement Learning (RL) considering the price time-series as the environment.
    - Represent environment states using the Directional Change (DC) event approach.
    - Implement a dynamic DC threshold to optimize dynamic algorithmic trading decisions.
    `;
  }

  const prompt = `Act as an advanced AI Trading Model (${modelType}). 
  ${specificInstructions}
  Analyze ${ticker} based on these features: ${features.join(', ')}.
  
  Configuration Parameters:
  - Training Dataset Period: ${trainingPeriod}
  - Training End Date: ${trainingEndDate} (Do NOT assume data extends to present day unless this is today)
  - Prediction Horizon: ${predictionHorizon}
  
  Simulate a prediction for the specified horizon (${predictionHorizon}) starting AFTER the training end date.
  
  Return JSON matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            currentPrice: { type: Type.NUMBER },
            predictedPrice: { type: Type.NUMBER },
            confidenceScore: { type: Type.NUMBER },
            volatility: { type: Type.STRING },
            modelUsed: { type: Type.STRING },
            featureImportance: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  feature: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                }
              }
            },
            predictionPath: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  upper: { type: Type.NUMBER },
                  lower: { type: Type.NUMBER },
                }
              }
            },
            explanation: { type: Type.STRING }
          }
        }
      }
    });
    
    const result = JSON.parse(response.text || "{}");
    result.modelUsed = modelType; 
    return result as MLPredictionResult;

  } catch (error: any) {
    console.error("ML Sim Error:", error);
    const msg = error.message || error.toString();
    throw new Error(`ML Simulation Failed: ${msg}`);
  }
};

export const getCommunityInsights = async (ticker: string): Promise<CommunityInsightResult> => {
  const prompt = `
    Analyze the community and institutional sentiment for ${ticker}.
    Simulate data sources including Reddit, Twitter, Professional Forums, and Institutional Filings (13F).
    
    Return raw JSON object with: retailSentiment, institutionalSentiment, summary, forumTopics, hedgeFundActivity, analystRatings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const data = cleanAndParseJSON(response.text || "{}");
    return { ...data, ticker } as CommunityInsightResult;

  } catch (error: any) {
    console.error("Community Insight Error:", error);
    const msg = error.message || error.toString();
    throw new Error(`Community Insight Failed: ${msg}`);
  }
};

export const runMPTAnalysis = async (holdings: Holding[]): Promise<MPTAnalysisResult> => {
  const portfolioSummary = holdings.map(h => `${h.ticker}: ${h.quantity} shares`).join(", ");
  
  const prompt = `
    Perform a Modern Portfolio Theory (MPT) analysis on: ${portfolioSummary}.
    1. Estimate current metrics.
    2. Calculate Optimal portfolio.
    3. Generate Efficient Frontier points.
    4. Provide suggestions.
    
    Return JSON matching schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                currentMetrics: {
                    type: Type.OBJECT,
                    properties: {
                        expectedReturn: { type: Type.NUMBER },
                        volatility: { type: Type.NUMBER },
                        sharpeRatio: { type: Type.NUMBER }
                    }
                },
                optimalMetrics: {
                    type: Type.OBJECT,
                    properties: {
                        expectedReturn: { type: Type.NUMBER },
                        volatility: { type: Type.NUMBER },
                        sharpeRatio: { type: Type.NUMBER }
                    }
                },
                efficientFrontier: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            risk: { type: Type.NUMBER },
                            return: { type: Type.NUMBER }
                        }
                    }
                },
                suggestions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            ticker: { type: Type.STRING },
                            action: { type: Type.STRING, enum: ["Buy", "Sell", "Hold"] },
                            amount: { type: Type.STRING },
                            reason: { type: Type.STRING }
                        }
                    }
                },
                correlationMatrix: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            ticker1: { type: Type.STRING },
                            ticker2: { type: Type.STRING },
                            value: { type: Type.NUMBER }
                        }
                    }
                }
            }
        }
      }
    });

    return JSON.parse(response.text || "{}") as MPTAnalysisResult;
  } catch (error: any) {
    console.error("MPT Analysis Error:", error);
    const msg = error.message || error.toString();
    throw new Error(`MPT Analysis Failed: ${msg}`);
  }
};