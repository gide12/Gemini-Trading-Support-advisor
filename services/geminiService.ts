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
    // 1. CHART DATA GENERATION (Mock/Simulation via AI)
    if (analysisType === AnalysisType.Chart) {
      const prompt = `Generate a JSON array representing a 30-day simulated price history for ${ticker} ending today. The trend should reflect current real-world market sentiment if known, otherwise random walk.
      Schema: Array of objects with 'date' (YYYY-MM-DD) and 'price' (number).
      Use a realistic price range for this stock.`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                price: { type: Type.NUMBER },
              },
            },
          },
        },
      });

      const chartData = JSON.parse(response.text || "[]") as ChartDataPoint[];
      
      return {
        ticker,
        type: analysisType,
        content: `Simulated 30-day price action for ${ticker}.`,
        chartData,
      };
    }

    // 2. NEWS ANALYSIS (Uses Google Search Grounding)
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

      // Basic sentiment extraction heuristic from text if not explicit
      let sentiment: "Bullish" | "Neutral" | "Bearish" = "Neutral";
      const text = response.text || "";
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

    // 3. YAHOO FINANCE DATA (Uses Google Search Grounding to simulate API access)
    if (analysisType === AnalysisType.YahooFinance) {
      const prompt = `Retrieve the latest financial data for ${ticker} using Yahoo Finance as the primary source.
      
      Get these specific metrics:
      - Current Price
      - Market Cap (Intraday)
      - Trailing P/E
      - Forward P/E
      - PEG Ratio (5 yr expected)
      - Price/Sales
      - Price/Book
      - Enterprise Value/Revenue
      - Enterprise Value/EBITDA
      
      Also provide a summary of the "Company Profile".
      
      IMPORTANT: Return ONLY a raw JSON object (no markdown) with this structure:
      {
        "summary": "string (company profile)",
        "metrics": {
           "Current Price": "string",
           "Market Cap": "string",
           "Trailing P/E": "string",
           "Forward P/E": "string",
           "PEG Ratio": "string",
           "Price/Sales": "string",
           "Price/Book": "string",
           "EV/Revenue": "string",
           "EV/EBITDA": "string"
        }
      }`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const json = cleanAndParseJSON(response.text || "{}");
      
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => ({
            title: chunk.web?.title || "Source",
            url: chunk.web?.uri || "#"
        }))
        .filter((s: any) => s.url !== "#") || [];

      return {
        ticker,
        type: analysisType,
        content: json.summary || "No profile available.",
        financials: json.metrics || {},
        sources
      };
    }

    // 4. TRADE IDEAS (Structured Output)
    if (analysisType === AnalysisType.Ideas) {
      const prompt = `Based on current market conditions for ${ticker}, suggest a potential trade setup.
      Provide an Entry Price, Stop Loss, and Take Profit.
      Also provide a brief reasoning.
      
      IMPORTANT: Return ONLY a raw JSON object (no markdown formatting) with this structure:
      {
        "reasoning": "string",
        "entry": "string",
        "stopLoss": "string",
        "takeProfit": "string",
        "sentiment": "Bullish" | "Bearish" | "Neutral"
      }`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }], // Use search to get current price context
        },
      });

      const json = cleanAndParseJSON(response.text || "{}");
      
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => ({
            title: chunk.web?.title || "Source",
            url: chunk.web?.uri || "#"
        }))
        .filter((s: any) => s.url !== "#");

      return {
        ticker,
        type: analysisType,
        content: json.reasoning,
        tradeSetup: {
          entry: json.entry,
          stopLoss: json.stopLoss,
          takeProfit: json.takeProfit,
        },
        sentiment: json.sentiment,
        sources
      };
    }

    // 5. TECHNICAL / FORECASTS / FUNDAMENTAL (General Text with Search)
    const promptMap: Record<string, string> = {
      [AnalysisType.Fundamental]: `Act as a professional equity research analyst. Perform a deep-dive fundamental analysis on ${ticker}.
      
      Structure your response using the following Markdown headers. Use bullet points for clarity and keep paragraphs concise.
      
      ### Business Overview & Economic Moat
      * [Summary of business model]
      * [Competitive advantages]
      
      ### Financial Performance
      * [Revenue trends]
      * [Profit Margins]
      * [Cash Flow status]
      
      ### Valuation Analysis
      * [P/E, P/S vs Peers]
      * [Historical valuation comparison]
      
      ### Growth Drivers
      * [Key future catalysts]
      
      ### Key Risks
      * [Main downside risks]
      
      Use the latest available financial data and news found via search.`,

      [AnalysisType.Technical]: `Act as a technical analyst. Analyze ${ticker} using indicators like RSI, MACD, and Moving Averages based on recent data found via search.
      
      Structure the response:
      ### Trend Analysis
      * [Current Trend Direction]
      
      ### Key Indicators
      * **RSI**: [Value & Interpretation]
      * **MACD**: [Signal]
      * **Moving Averages**: [50-day vs 200-day status]
      
      ### Support & Resistance
      * **Support Levels**: [Price 1, Price 2]
      * **Resistance Levels**: [Price 1, Price 2]`,

      [AnalysisType.LSTM]: `Explain how an LSTM (Long Short-Term Memory) model might forecast ${ticker} based on its recent volatility and volume. 
      
      Structure the response:
      ### Model Logic
      [Explain the LSTM approach for this specific stock]
      
      ### Simulated Forecast Scenario
      * **Predicted Trend**: [Up/Down/Flat]
      * **Key Factors**: [Volume, Volatility, etc.]`,

      [AnalysisType.LEP]: `Generate a Logical Event Probability (LEP) forecast for ${ticker}.
      
      Structure the response:
      ### Upcoming Events
      * [Event 1]: [Probability of Impact]
      * [Event 2]: [Probability of Impact]
      
      ### Scenario Analysis
      * **Bull Case**: [Description]
      * **Bear Case**: [Description]`,

      [AnalysisType.Quantum]: `Simulate a 'Quantum Forecast' for ${ticker}. This is a theoretical exercise.
      
      Structure the response:
      ### Probabilistic Superposition
      * [Outcome A]: [Probability %]
      * [Outcome B]: [Probability %]
      
      ### Wave Function Collapse Trigger
      [What event might crystallize the price action?]`,
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
  endDate: string
): Promise<BacktestResult> => {
  const prompt = `Simulate a trading backtest for ${ticker} using the following strategy: "${strategy}".
  Date Range: ${startDate} to ${endDate}.
  
  Assume a starting capital of $10,000.
  
  Return a JSON object with:
  1. metrics: { totalReturn (percentage string), maxDrawdown (percentage string), winRate (percentage string), tradesCount (number) }
  2. equityCurve: Array of objects { date: 'YYYY-MM-DD', value: number } (at least 10 points spread across the range)
  3. trades: Array of objects { date, type ('Buy' or 'Sell'), price, result (string like '+5%') } (limit to 5-10 key trades)
  4. summary: A brief text summary of why the strategy performed this way.
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
  features: string[]
): Promise<MLPredictionResult> => {
  const prompt = `Act as an advanced AI Trading Model (${modelType}). 
  Analyze ${ticker} based on these features: ${features.join(', ')}.
  
  Simulate a prediction for the next 7 days based on your internal knowledge of the asset's behavior.
  
  Return JSON with:
  1. currentPrice: number (estimate based on knowledge)
  2. predictedPrice: number (target for 7 days from now)
  3. confidenceScore: number (0-100)
  4. volatility: string (e.g., "High", "Low")
  5. featureImportance: Array of {feature: string, score: number} (sum to 100)
  6. predictionPath: Array of 7 objects { date: 'YYYY-MM-DD', price: number, upper: number, lower: number } (confidence intervals)
  7. explanation: Technical explanation of why the model predicts this.
  `;

  try {
    // NOTE: Removed googleSearch here to allow strict responseSchema usage for complex chart data
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
    
    IMPORTANT: Return ONLY a raw JSON object (no markdown) with this structure:
    {
        "retailSentiment": number (0-100),
        "institutionalSentiment": number (0-100),
        "summary": "string",
        "forumTopics": [{ "topic": "string", "sentiment": "Bullish"|"Bearish"|"Neutral", "mentions": number, "platform": "Reddit"|"Twitter"|"Discord" }],
        "hedgeFundActivity": [{ "fundName": "string", "action": "Bought"|"Sold"|"Held", "shares": "string", "date": "YYYY-MM-DD" }],
        "analystRatings": { "buy": number, "hold": number, "sell": number, "consensus": "string" }
    }
  `;

  try {
    // NOTE: Using googleSearch requires removing responseSchema/responseMimeType
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
  const portfolioSummary = holdings.map(h => `${h.ticker}: ${h.quantity} shares (~$${h.marketValue})`).join(", ");
  
  const prompt = `
    Perform a Modern Portfolio Theory (MPT) analysis on the following portfolio:
    ${portfolioSummary}
    
    1. Estimate the current portfolio's expected annual return and volatility based on historical asset data.
    2. Calculate an "Optimal" portfolio configuration (Maximize Sharpe Ratio) using these assets.
    3. Generate 20 data points representing the "Efficient Frontier" curve (Risk on X, Return on Y).
    4. Provide specific rebalancing suggestions to move from Current to Optimal.
    
    Return JSON matching this schema:
    {
      "currentMetrics": { "expectedReturn": number (%), "volatility": number (%), "sharpeRatio": number },
      "optimalMetrics": { "expectedReturn": number (%), "volatility": number (%), "sharpeRatio": number },
      "efficientFrontier": [{ "risk": number, "return": number }],
      "suggestions": [{ "ticker": "string", "action": "Buy"|"Sell"|"Hold", "amount": "string", "reason": "string" }],
      "correlationMatrix": [{ "ticker1": "string", "ticker2": "string", "value": number }]
    }
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