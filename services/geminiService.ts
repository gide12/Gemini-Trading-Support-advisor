
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisType, AnalysisResult, ChartDataPoint, BacktestResult, MLPredictionResult, CommunityInsightResult, MPTAnalysisResult, Holding, FuzzyAnalysisResult, FFFCMGNNResult, InstitutionalDeepDiveResult, ETFProfile, OptimalFuzzyDesignResult, FFTSPLPRResult, TotalViewData } from "../types";

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

    // 6. FUNDAMENTAL ANALYSIS (Structured)
    if (analysisType === AnalysisType.Fundamental) {
        const prompt = `Act as a professional equity research analyst. Perform a deep-dive fundamental analysis on ${ticker} using the latest data.
        
        1. Determine if the stock is Overvalued, Undervalued, or Fair Value based on DCF models, P/E ratios, and growth prospects.
        2. Identify the major **Market Participants (MPIDs)** typical for this stock (e.g., Major Market Makers like CDEL, NITE, or ECNs like ARCA, NSDQ). Simulate a Level 2 perspective.
        
        IMPORTANT: Return ONLY a raw JSON object (no markdown code blocks) with this structure:
        {
          "valuationStatus": "Overvalued" | "Undervalued" | "Fair Value",
          "intrinsicValue": "string (estimated fair price, e.g. '$150.00')",
          "summary": "string (Comprehensive analysis using markdown headers ### and bullet points *)",
          "sentiment": "Bullish" | "Bearish" | "Neutral",
          "mpidData": [
             { "code": "CDEL", "name": "Citadel Securities", "type": "Market Maker" },
             { "code": "NITE", "name": "Virtu Financial", "type": "Market Maker" },
             { "code": "ARCA", "name": "NYSE Arca", "type": "ECN" }
             // Include 4-6 major relevant participants
          ]
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
            sources
        };
    }

    // 7. NASDAQ TOTALVIEW (LEVEL 2)
    if (analysisType === AnalysisType.TotalView) {
        const prompt = `Act as a NASDAQ TotalView emulator. Simulate Level 2 market depth data for ${ticker}.
        
        Generate a realistic Order Book snapshot:
        1. Get the current estimated price.
        2. Create 10 Bid levels and 10 Ask levels around this price.
        3. Use real MPIDs (NSDQ, ARCA, EDGX, BATS, CDEL, NITE).
        4. Calculate Order Imbalance.

        Return ONLY a raw JSON object with this structure:
        {
          "currentPrice": number,
          "imbalance": {
            "shares": number (e.g., 50000),
            "side": "Buy" | "Sell",
            "strength": "string (e.g. 'Heavy Sell Side Pressure')"
          },
          "bids": [
             { "price": number, "shares": number, "venue": "string", "orders": number }
          ],
          "asks": [
             { "price": number, "shares": number, "venue": "string", "orders": number }
          ],
          "summary": "string (brief interpretation of the order flow)"
        }`;

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

    // 8. CLUSTERING (Structured JSON)
    if (analysisType === AnalysisType.Clustering) {
      let prompt = "";
      
      if (ticker === "GBML-EMO CLUSTERING") {
        prompt = `Act as a Quantitative Analyst. Perform a market simulation using **${ticker}**.
        
        Specific Methodology:
        - Use a Multiobjective Fuzzy Genetics-Based Machine Learning (GBML) algorithm.
        - Hybrid Michigan and Pittsburgh approach within Evolutionary Multiobjective Optimization (EMO).
        - Objective 1: Maximize Accuracy (correctly classified trading patterns).
        - Objective 2: Minimize Complexity (number of fuzzy rules/antecedents).
        
        Task: Group stocks based on their position on the Pareto Front of this Interpretability-Accuracy trade-off.
        
        Requirements:
        1. Create clusters representing the trade-off (e.g., "High Accuracy/Low Complexity", "High Accuracy/High Complexity", "Low Accuracy (Noisy)").
        2. Provide a concise description of the trade-off characteristics.
        3. List exactly 6-8 representative stock tickers per cluster.

        Return ONLY raw JSON matching this structure:
        {
          "algorithm": "${ticker}",
          "clusters": [
            { "name": "string (e.g. Pareto Optimal)", "description": "string", "stocks": ["AAPL", "MSFT"] }
          ]
        }`;
      } else {
        prompt = `Act as a Quantitative Analyst. Perform a market simulation using **${ticker}**.
        
        Task: Group major US stocks into clusters based on **${ticker}** logic (identifying structural market regimes).
        
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
      }

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

    // 9. QUANTUM (General Text)
    const promptMap: Record<string, string> = {
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
  riskReward: string,
  stopLoss: string,
  takeProfit: string,
  trailingStop: string,
  simulationModel: string = "Standard (Historical)"
): Promise<BacktestResult> => {
  let modelInstructions = "";
  
  if (simulationModel === "Monte Carlo Simulation") {
      modelInstructions = `
      **Monte Carlo Simulation Mode**:
      - Run 1,000 simulated price paths based on historical volatility and drift derived from the strategy parameters.
      - Provide a probability distribution of returns.
      - In the summary, include the "Confidence Level" of success (e.g., 95% likelihood of profit > X).
      `;
  } else if (simulationModel === "Black-Scholes Model") {
      modelInstructions = `
      **Black-Scholes Model Mode**:
      - Apply Black-Scholes logic to estimate the probability of the price reaching the Take Profit vs Stop Loss levels within the holding period (assuming geometric Brownian motion).
      - Treat the strategy targets as "strike prices" to calculate the theoretical probability of expiring ITM (profitable).
      `;
  } else {
      modelInstructions = `
      **Standard Historical Mode**:
      - Simulate a deterministic backtest against historical price action.
      `;
  }

  const prompt = `Simulate a trading backtest for ${ticker}.
  Strategy: "${strategy}".
  Date Range: ${startDate} to ${endDate}.
  Timeframe: ${timeframe}.
  Risk/Reward Ratio: ${riskReward}.
  Stop Loss: ${stopLoss}.
  Take Profit: ${takeProfit}.
  Trailing Stop: ${trailingStop}.
  
  ${modelInstructions}
  
  Assume a starting capital of $10,000.
  
  Return a JSON object with:
  1. metrics: { totalReturn, maxDrawdown, winRate, tradesCount }
  2. equityCurve: Array of { date, value }
  3. trades: Array of { date, type, price, result }
  4. summary: Text summary explaining the result and the methodology used (${simulationModel}).
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
  } else if (modelType === "DeltaLag (Deep Learning)") {
    specificInstructions = `
    Specific Architecture Instructions:
    - Employ a sparsified cross-attention mechanism to identify dynamic lead-lag relationships between assets.
    - Detect pair-specific lag values to align features from leading stocks to predict the lagger stock.
    - Focus on extracting predictive signals from systematic price movement precedence.
    `;
  } else if (modelType === "Hybrid ES-DRNN (Exp. Smoothing + Dilated RNN)") {
    specificInstructions = `
    Specific Architecture Instructions:
    - Utilize a Hybrid Exponential Smoothing and Dilated Recurrent Neural Network Model (ES-DRNN).
    - Use Exponential Smoothing to capture the main trend and seasonality of the time series.
    - Use the Dilated RNN to capture the non-linear dependencies and long-term residual patterns.
    - Combine both outputs for a robust short-term load/price forecast.
    `;
  } else if (modelType === "Multivariate Time Series Forecasting (GRU)") {
    specificInstructions = `
    Specific Architecture Instructions:
    - Implement Gated Recurrent Unit (GRU) neural networks.
    - Process multiple input variables simultaneously (multivariate) to capture interdependencies.
    - Focus on efficient learning of temporal dependencies in financial time series data.
    `;
  } else if (modelType === "Multi-Granularity Spatio-Temporal Correlation Networks") {
    specificInstructions = `
    Specific Architecture Instructions:
    - Implement Multi-Granularity Spatio-Temporal Correlation Networks.
    - Capture temporal dependencies across multiple time scales (e.g., short-term vs long-term).
    - Model spatial correlations between the target asset and related market entities (sector peers, indices) using graph-based or attention mechanisms.
    - Focus on extracting diverse feature representations from different granularities to improve trend prediction accuracy.
    `;
  } else if (modelType === "Twin Delayed Deep Deterministic Policy Gradient (TD3)") {
    specificInstructions = `
    Specific Architecture Instructions:
    - Implement Twin Delayed Deep Deterministic Policy Gradient (TD3), an advanced reinforcement learning algorithm.
    - Utilize double Q-learning and delayed policy updates to reduce overestimation bias common in DDPG.
    - Treat the trading problem as a continuous control task (e.g. determining optimal portfolio weights or trade sizing).
    - Focus on learning a robust policy for continuous action spaces in the market environment.
    `;
  } else if (modelType === "Multi-Granularity Deep Spatio-Temporal Correlation Framework (MDSTCF)") {
    specificInstructions = `
    Specific Architecture Instructions:
    - Implement the Multi-Granularity Deep Spatio-Temporal Correlation Framework (MDSTCF).
    - Capture complex spatio-temporal dependencies at multiple granularities (e.g., fine-grained and coarse-grained time intervals).
    - Utilize deep learning layers to model the correlation between spatial (inter-asset) and temporal (historical) features.
    - Focus on hierarchical feature extraction to improve long-term trend prediction.
    `;
  } else if (modelType === "HA-NARX (Hybrid Associative NARX)") {
    specificInstructions = `
    Specific Architecture Instructions:
    - Implement the Hybrid Associative Nonlinear AutoRegressive with eXogenous inputs (HA-NARX) model.
    - Utilize NARX logic to relate the current value of the time series to past values of the same series and current/past values of exogenous inputs (e.g., macro indicators, market sentiment).
    - Incorporate associative memory or hybrid mechanisms to enhance pattern recognition capabilities in the nonlinear dynamic system.
    - Focus on capturing complex, nonlinear relationships between the target asset and external market drivers.
    `;
  } else if (modelType === "Deep Recurrent Q-Network (DRQN)") {
    specificInstructions = `
    Specific Architecture Instructions:
    - Implement Deep Recurrent Q-Network (DRQN), combining LSTM (Long Short-Term Memory) with Deep Q-Network (DQN).
    - Address the "Partially Observable Markov Decision Process" (POMDP) nature of financial markets by maintaining an internal state (memory) of past observations.
    - Integrate temporal dependencies directly into the state representation to improve policy learning in non-stationary market conditions.
    `;
  } else if (modelType === "Generative Adversarial Networks (GANs)") {
    specificInstructions = `
    Specific Architecture Instructions:
    - Implement Generative Adversarial Networks (GANs) for financial time-series analysis.
    - Use the Generator to create synthetic future price paths or identify potential market scenarios based on historical data distribution.
    - Use the Discriminator to distinguish between real market movements and generated noise, refining the predictive accuracy.
    - Focus on capturing the underlying probability distribution of asset returns to predict future price movements or volatility.
    `;
  } else if (modelType === "GRU (Gated Recurrent Unit)") {
    specificInstructions = `
    Specific Architecture Instructions:
    - Implement Gated Recurrent Unit (GRU) networks.
    - Leverage the simplified gating mechanism (update and reset gates) compared to LSTM for faster convergence on financial data.
    - Focus on effectively capturing short-to-medium term temporal dependencies in the price action.
    - Mitigate the vanishing gradient problem to learn sequences effectively.
    `;
  } else if (modelType === "Adaptive Neuro-Fuzzy Inference System (ANFIS)") {
    specificInstructions = `
    Specific Architecture Instructions:
    - Implement Adaptive Neuro-Fuzzy Inference System (ANFIS).
    - Combine the learning capabilities of neural networks with the reasoning capabilities of fuzzy logic.
    - Use hybrid learning (backpropagation + least squares) to tune membership functions.
    - Focus on modeling complex non-linear relationships with interpretable fuzzy rules to predict price movements.
    `;
  } else if (modelType === "Function-on-Function Direct Neural Networks (FFDNNs)") {
    specificInstructions = `
    Specific Architecture Instructions:
    - Implement Function-on-Function Direct Neural Networks (FFDNNs) based on Functional Data Analysis (FDA) principles.
    - Treat the financial time series as functional data objects (continuous curves) rather than discrete vectors.
    - Map the functional input (historical price curve) directly to the functional output (future price curve) using functional weights and bias operators.
    - Focus on capturing the continuous underlying dynamics and integral operators of the market process.
    `;
  } else if (modelType === "Function-on-Function Basis Neural Networks (FFBNNs)") {
    specificInstructions = `
    Specific Architecture Instructions:
    - Implement Function-on-Function Basis Neural Networks (FFBNNs).
    - Represent historical price curves and future price trajectories using basis expansions (e.g., B-splines or Fourier series).
    - Learn the mapping between the basis coefficients of the input functions and the output functions to capture the continuous dynamics of the financial time series.
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
  
  Also, calculate and include the following evaluation metrics for the simulated test set:
  1. Model Accuracy (AR), Precision (PR), Recall (RR), F1-Score, and AUC.
  2. Trading Performance: Winning Rate (WR), Annualized Return (ARR), Annualized Sharpe Ratio (ASR), and Maximum Drawdown (MDD).

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
            evaluationMetrics: {
                type: Type.OBJECT,
                properties: {
                    accuracy: { type: Type.NUMBER },
                    precision: { type: Type.NUMBER },
                    recall: { type: Type.NUMBER },
                    f1Score: { type: Type.NUMBER },
                    auc: { type: Type.NUMBER }
                }
            },
            tradingMetrics: {
                type: Type.OBJECT,
                properties: {
                    winningRate: { type: Type.NUMBER },
                    annualizedReturn: { type: Type.NUMBER },
                    sharpeRatio: { type: Type.NUMBER },
                    maxDrawdown: { type: Type.NUMBER }
                }
            },
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
    
    1. Simulate data sources including Reddit, Twitter, Professional Forums, and Institutional Filings (13F).
    2. Identify major **University Endowments** (e.g. Harvard, Yale, Stanford) or **Academic Research Institutes** that hold this stock or have published research relevant to it (or its sector).
    3. **MANDATORY**: For every single Institution, Hedge Fund, or University listed, you MUST provide a valid URL to their website (e.g., "https://www.harvard.edu" or "https://www.bridgewater.com"). If you cannot find a deep link, provide the main homepage.
    
    Return raw JSON object with: 
    - retailSentiment (number 0-100), institutionalSentiment (number 0-100), summary, forumTopics, analystRatings
    - hedgeFundActivity: [{fundName, action, shares, date, url}] (Ensure url is filled)
    - academicMentions: [{institution, type, relevance, url}] (Ensure url is filled, create realistic entries if needed)
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
    
    // Polyfill to prevent React Error #31 (Objects are not valid as a React child)
    // Sometimes AI returns detailed objects (breakdowns) instead of flat numbers.
    let rSentiment = data.retailSentiment;
    if (typeof rSentiment === 'object' && rSentiment !== null) {
        // Extract the overall value if it comes as an object
        rSentiment = rSentiment.overall || rSentiment.score || rSentiment.value || 50;
    }
    
    let iSentiment = data.institutionalSentiment;
    if (typeof iSentiment === 'object' && iSentiment !== null) {
        iSentiment = iSentiment.overall || iSentiment.score || iSentiment.value || 50;
    }

    return { 
        ...data, 
        retailSentiment: Number(rSentiment) || 0,
        institutionalSentiment: Number(iSentiment) || 0,
        ticker 
    } as CommunityInsightResult;

  } catch (error: any) {
    console.error("Community Insight Error:", error);
    const msg = error.message || error.toString();
    throw new Error(`Community Insight Failed: ${msg}`);
  }
};

export const runInstitutionalDeepDive = async (ticker: string, institution: string): Promise<InstitutionalDeepDiveResult> => {
    const prompt = `
    Conduct a deep dive investigation into **${institution}**'s relationship with the stock **${ticker}**.
    
    Find out:
    1. Do they currently hold shares? (Check recent 13F filings or news).
    2. Have they released any specific research reports, notes, or public comments on ${ticker}?
    3. What is their general sentiment? (Bullish/Bearish/Neutral).
    4. Find a direct URL source for this info if possible.

    Return ONLY a raw JSON object with this structure:
    {
      "institution": "${institution}",
      "ticker": "${ticker}",
      "relationship": "Holder" | "Observer" | "Bearish" | "Unknown",
      "summary": "string (brief summary of findings)",
      "sourceUrl": "string (URL to 13F, news, or investor page)",
      "lastFilingDate": "string (optional)"
    }
    `;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const json = cleanAndParseJSON(response.text || "{}");
        // Ensure sourceUrl exists
        const groundingUrl = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.[0]?.web?.uri;

        return {
            institution,
            ticker,
            relationship: json.relationship || "Unknown",
            summary: json.summary || "No specific data found.",
            sourceUrl: json.sourceUrl || groundingUrl || "#",
            lastFilingDate: json.lastFilingDate
        };
    } catch (error: any) {
        console.error("Deep Dive Error:", error);
        throw new Error("Deep Dive Analysis Failed");
    }
};

export const runMPTAnalysis = async (holdings: Holding[], rebalancingStrategy: string = "Standard MPT"): Promise<MPTAnalysisResult> => {
    const holdingsStr = holdings.map(h => `${h.ticker}: $${h.marketValue}`).join(', ');
    const prompt = `
      Perform a Modern Portfolio Theory (MPT) optimization for this portfolio: ${holdingsStr}.
      Calculate Efficient Frontier, Sharpe Ratios, and Rebalancing suggestions.
      
      Selected Rebalancing Strategy: "${rebalancingStrategy}".
      
      Instructions based on Strategy:
      - If "Time-based (Monthly/Quarterly)": Focus rebalancing advice on calendar reset (e.g. adjust to optimal weights at end of month).
      - If "Threshold-based (>5% Deviation)": Only suggest rebalancing if current weight deviates > 5% from optimal weight.
      - If "Hybrid": Combine both approaches (Time-based triggers + Threshold breaches).
      
      Return ONLY a raw JSON object:
      {
        "currentMetrics": { "expectedReturn": number, "volatility": number, "sharpeRatio": number },
        "optimalMetrics": { "expectedReturn": number, "volatility": number, "sharpeRatio": number },
        "efficientFrontier": [{ "risk": number, "return": number }],
        "suggestions": [{ "ticker": "string", "action": "Buy"|"Sell"|"Hold", "amount": "string", "reason": "string" }],
        "rebalancingContext": { "strategyUsed": "string", "nextRebalanceDate": "string", "notes": "string" },
        "correlationMatrix": [{ "ticker1": "string", "ticker2": "string", "value": number }]
      }
    `;
    
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
  const prompt = `
    Analyze the ETF **${ticker}**.
    Retrieve its Name and Top 10 Holdings with their portfolio weights.

    Return ONLY a raw JSON object with this structure:
    {
      "ticker": "${ticker}",
      "name": "string",
      "topHoldings": [
        { "ticker": "string", "name": "string", "weight": number }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const json = cleanAndParseJSON(response.text || "{}");
    return json as ETFProfile;
  } catch (error: any) {
    console.error("ETF Profile Error:", error);
    throw new Error("Failed to fetch ETF Profile");
  }
};

export const runFuzzyAnalysis = async (ticker: string): Promise<FuzzyAnalysisResult> => {
  const prompt = `
    Act as a Fuzzy Logic Financial System. Analyze **${ticker}** to detect non-linear market phenomena.

    1. **Market Maker Behavior**: Analyze spread compression, order book imbalance, iceberg probability.
    2. **Whale Activity**: Analyze block trade frequency, sweep orders, flow toxicity.
    3. **Accumulation**: Analyze net buying pressure, dark pool ratio, volatility divergence.

    Return ONLY a raw JSON object with this structure:
    {
      "ticker": "${ticker}",
      "marketMakerBehavior": {
        "score": "Weak" | "Moderate" | "Strong",
        "value": number (0-100),
        "metrics": { "spreadCompression": "string", "orderBookImbalance": "string", "icebergProbability": "string", "depthVolatility": "string" }
      },
      "whaleActivity": {
        "score": "None" | "Low" | "Elevated" | "Extreme",
        "value": number (0-100),
        "metrics": { "blockTradeFreq": "string", "sweepOrders": "string", "flowToxicity": "string", "hiddenOrders": "string" }
      },
      "accumulation": {
        "score": "Low" | "Medium" | "High" | "Very High",
        "value": number (0-100),
        "metrics": { "netBuyingPressure": "string", "darkPoolRatio": "string", "volVolatilityDiv": "string", "sarClusters": "string" }
      },
      "summary": "string"
    }
  `;

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
    console.error("Fuzzy Analysis Error:", error);
    throw new Error("Fuzzy Analysis Failed");
  }
};

export const runFFFCMGNNAnalysis = async (ticker: string): Promise<FFFCMGNNResult> => {
  const prompt = `
    Perform a Hybrid FF-FCM-GNN Analysis for **${ticker}**.
    
    1. Calculate Fama-French 3-Factor inputs (MKT, SMB, HML).
    2. Construct a Fuzzy Cognitive Map (FCM) of market causalities.
    3. Simulate a Graph Neural Network (GNN) prediction based on these nodes.

    Return ONLY a raw JSON object with this structure:
    {
      "ticker": "${ticker}",
      "famaFrenchFactors": {
         "marketRisk": { "value": number (0-1), "description": "string" },
         "sizeFactorSMB": { "value": number (0-1), "description": "string" },
         "valueFactorHML": { "value": number (0-1), "description": "string" }
      },
      "fuzzyCognitiveMap": {
         "nodes": [
            { "id": "string", "name": "string", "activationLevel": number (0-1), "influenceType": "Positive" | "Negative" | "Neutral" }
         ],
         "primaryCausalLink": "string"
      },
      "gnnPrediction": {
         "signal": "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell",
         "confidence": number,
         "graphEmbedding": [number, number, number, number, number],
         "predictedTrend": "string"
      },
      "summary": "string"
    }
  `;

  try {
     const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] },
    });
    return cleanAndParseJSON(response.text || "{}") as FFFCMGNNResult;
  } catch (e: any) {
    console.error("FF-FCM-GNN Error", e);
    throw new Error("FF-FCM-GNN Analysis Failed");
  }
};

export const runOptimalFuzzyDesignAnalysis = async (ticker: string): Promise<OptimalFuzzyDesignResult> => {
    const prompt = `
      Perform an Optimal FIS Design Analysis for **${ticker}** using 5 computational frameworks:
      GFS (Genetic), NFS (Neuro), HFS (Hierarchical), EFS (Evolving), and MFS (Multiobjective).

      Return ONLY a raw JSON object:
      {
        "ticker": "${ticker}",
        "gfsAnalysis": { "score": number, "optimizationStatus": "string", "description": "string" },
        "nfsAnalysis": { "networkDepth": number, "learningRate": number, "description": "string" },
        "hfsAnalysis": { "layers": number, "reducedRules": number, "description": "string" },
        "efsAnalysis": { "evolvingStatus": "Expanding"|"Pruning"|"Stable", "adaptationSpeed": number, "description": "string" },
        "mfsAnalysis": { "accuracy": number, "interpretability": number, "paretoOptimal": boolean, "description": "string" },
        "summary": "string"
      }
    `;

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
    const prompt = `
      Perform a Two-Factor Fuzzy-Fluctuation (FFTS) Analysis based on Probabilistic Linguistic Preference Relationships (PLPR) for **${ticker}**.
      
      Compare Internal Trends vs External Disturbances.
      Calculate Similarity using Euclidean or Hamming distance against historical rules.

      Return ONLY a raw JSON object:
      {
        "ticker": "${ticker}",
        "twoFactors": {
            "internalTrend": { "description": "string", "strength": number },
            "externalDisturbance": { "description": "string", "impact": number }
        },
        "plprRules": [
            { "ruleId": "string", "condition": "string", "preferenceBehavior": "string", "probability": number }
        ],
        "similarityAnalysis": {
            "methodUsed": "Euclidean Distance",
            "distanceValue": number (0-1),
            "closestHistoricalRuleId": "string"
        },
        "forecast": {
            "direction": "Bullish" | "Bearish" | "Neutral",
            "confidence": number,
            "priceTarget": number
        },
        "summary": "string"
    }
    `;
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
