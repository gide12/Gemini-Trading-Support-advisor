
import { GoogleGenAI, Type } from "@google/genai";
import { 
  AnalysisType, 
  AnalysisResult, 
  PriceActionData,
  TechnicalAnalysisData,
  BacktestResult,
  BrokerIntelData,
  MLPredictionResult,
  FTSLFIGResult,
  FFFCMGNNResult,
  OptimalFuzzyDesignResult,
  FFTSPLPRResult,
  QuantumMCDMResult,
  AdvancedPricingResult,
  DeltaGammaHedgeResult,
  Holding,
  ClusteringAnalysisData,
  MPTAnalysisResult,
  ETFProfile,
  CAPMAPTResult
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
      try { return JSON.parse(lastBrace > firstBrace ? text.substring(firstBrace, lastBrace + 1) : text.substring(firstBrace)); } catch (innerE) {}
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
    if (analysisType === AnalysisType.Clustering) {
        let promptGuidance = `Produce ACTUAL CLUSTERING RESULTS for a universe of stocks using ${ticker}.`;
        
        if (ticker === "GBML-EMO CLUSTERING") {
            promptGuidance = `
                Act as a quantitative finance AI and graph-based probabilistic clustering engine.
                Perform GBML-EMO (Graph-Based Machine Learning with Expectation-Maximization Optimization) on a stock universe.
                Algorithm details: kNN (k=20) similarity graph, normalized Laplacian, soft assignment via EM optimization, maximizing ELBO.
                
                MANDATORY DATA REQUIREMENTS:
                1. EM Metrics: Convergence iterations, Evidence Lower Bound (ELBO) value, and optimal K selection.
                2. Probabilistic Assignments: For each stock, provide 'probability' (max posterior) and 'secondaryClusterId' if posterior > 0.20.
                3. Graph Analytics: Provide 'connectivityScore' (node centrality) and 'systemicClass' (Systemic | Idiosyncratic | Bridge).
                4. Cluster Specifics: Risk dispersion derived from the optimized covariance matrix.
                
                Universe: Mag 7 (AAPL, NVDA, MSFT, GOOGL, AMZN, TSLA, META) + 15 S&P 100 Leaders.
            `;
        } else if (ticker === "SPECTRAL CLUSTERING") {
            promptGuidance = `
                Act as a senior quantitative finance AI and graph-based clustering engine.
                Perform Spectral Clustering on a high-cap stock investment universe.
                Algorithm: Normalized Graph Laplacian, RBF kernel similarity, kNN (k=20).
                
                MANDATORY DATA REQUIREMENTS:
                1. Graph Metrics: Eigengap heuristic value, kernel bandwidth (sigma), and top-k eigenvalues.
                2. Spectral Embeddings: For each stock, provide PC1 and PC2 coordinates in the spectral subspace.
                3. Graph Statistics: Provide 'connectivityScore' for each ticker and 'avgSimilarityScore' for each cluster.
                
                Universe: Magnificent 7, S&P 100 Leaders.
            `;
        } else if (ticker === "AGGLOMERATIVE CLUSTERING") {
            promptGuidance = `
                Act as a senior quantitative finance AI and hierarchical clustering engine.
                Perform Agglomerative Hierarchical Clustering using Ward Linkage (minimum variance).
                
                MANDATORY DATA REQUIREMENTS:
                1. Dendrogram Metrics: Calculate optimal cut depth and max merge distance.
                2. Cluster Specifics: Intra-cluster variance (Ward objective).
                3. Asset Detail: For each stock, provide its 'dendrogramDepth' and 'mergeDistance'.
                
                Universe: Magnificent 7, Top 25 S&P 100 components.
            `;
        } else if (ticker === "BIRCH CLUSTERING") {
            promptGuidance = `
                Act as a quantitative finance AI and large-scale hierarchical clustering engine.
                Perform stock clustering using the BIRCH (Balanced Iterative Reducing and Clustering using Hierarchies) algorithm.
                
                MANDATORY DATA REQUIREMENTS:
                1. CF-Tree Metrics: Auto-tuned threshold (T), branching factor (B), and leaf-node count.
                2. Subcluster Mapping: Identify the CF-leaf node ID for each ticker.
                
                Universe: Magnificent 7, S&P 100 components.
            `;
        } else if (ticker === "GAUSSIAN MIXTURE MODEL") {
            promptGuidance = `
                Act as a quantitative finance AI specializing in probabilistic clustering.
                Perform stock clustering using a Gaussian Mixture Model (GMM) with EM estimation and full covariance.
                
                MANDATORY DATA REQUIREMENTS:
                1. Soft Assignments: Primary and Secondary cluster probabilities for each stock.
                
                Universe: Magnificent 7, S&P 100 Leaders.
            `;
        }

        const response = await ai.models.generateContent({
            model: modelName,
            contents: `Act as a senior quantitative finance AI and clustering engine. ${promptGuidance}
            
            Return JSON in this format:
            {
                "algorithm": "string",
                "metrics": { "silhouetteScore": number, "elbo": number, "eigengap": number, "bandwidthSigma": number, "eigenvalues": [number], "calinskiHarabasz": number, "maxMergeDistance": number, "iterations": number, "optimalK": number, "threshold": number, "branchingFactor": number, "cfNodesCount": number },
                "clusters": [
                    { "id": number, "label": "string", "count": number, "avgReturn": number, "avgVolatility": number, "avgBeta": number, "avgDrawdown": number, "avgLiquidity": number, "riskDispersion": number, "wardVariance": number, "avgSimilarityScore": number, "cfSubclusterCount": number, "dominantSectors": ["string"], "interpretation": "string" }
                ],
                "assignments": [
                    { "ticker": "string", "clusterId": number, "spectralPC1": number, "spectralPC2": number, "connectivityScore": number, "cfSubclusterId": "string", "dendrogramDepth": number, "mergeDistance": number, "probability": number, "secondaryClusterId": number, "secondaryProbability": number, "distanceToCentroid": number, "riskCharacteristic": "string", "sector": "string", "systemicClass": "string" }
                ],
                "plotData": [ { "x": number, "y": number, "clusterId": number, "ticker": "string", "probability": number, "centrality": number } ],
                "radarData": [ { "metric": "Volatility|Return|Beta|Drawdown|Liquidity", "Cluster 0": number, "Cluster 1": number, "Cluster 2": number, "Cluster 3": number } ],
                "investmentInsight": { "riskAmplifiers": ["string"], "redundancyCheck": "string", "diversificationStrategy": "string", "regimeShiftImpact": "string", "hierarchicalInsight": "string", "homogeneityScore": "string", "bridgeStocks": ["string"], "factorStructure": "string" },
                "summary": "Institutional quantitative report summary."
            }`,
            config: { responseMimeType: "application/json" }
        });
        const json = cleanAndParseJSON(response.text);
        return { ticker, type: analysisType, content: json.summary, clusteringAnalysis: json };
    }

    if (analysisType === AnalysisType.News) {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: `Search for the latest financial news regarding ${ticker}. Focus specifically on major publishers like Bloomberg, Financial Times, Wall Street Journal, and Yahoo Finance. 
            Return a detailed summary and a structured list of at least 5 news items.`,
            config: { 
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        newsItems: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    url: { type: Type.STRING },
                                    source: { type: Type.STRING, description: "Choose from: Bloomberg, Financial Times, Wall Street Journal, Yahoo Finance, or Other" },
                                    snippet: { type: Type.STRING },
                                    time: { type: Type.STRING },
                                    sentiment: { type: Type.STRING, description: "Positive, Negative, or Neutral" }
                                },
                                required: ["title", "url", "source", "snippet", "time", "sentiment"]
                            }
                        }
                    },
                    required: ["summary", "newsItems"]
                }
            }
        });
        const json = cleanAndParseJSON(response.text);
        return { ticker, type: analysisType, content: json.summary, newsItems: json.newsItems, sources: extractSources(response) };
    }

    if (analysisType === AnalysisType.Ideas) {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: `Act as a Head of Research at a top Quant Hedge Fund. Generate a specific high-probability Trade Idea for ${ticker}. 
            Consider macro factors, technical breakouts, and recent institutional flow.
            Provide precise entry levels, stop loss, and multiple take profit targets.`,
            config: { 
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        bias: { type: Type.STRING, description: "Bullish, Bearish, or Neutral" },
                        timeframe: { type: Type.STRING, description: "Intraday, Swing (1-2 weeks), or Long-term" },
                        conviction: { type: Type.NUMBER, description: "Confidence score 0-100" },
                        entryRange: {
                            type: Type.OBJECT,
                            properties: {
                                low: { type: Type.NUMBER },
                                high: { type: Type.NUMBER }
                            }
                        },
                        stopLoss: { type: Type.NUMBER },
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
                        catalysts: { type: Type.ARRAY, items: { type: Type.STRING } },
                        riskRewardRatio: { type: Type.STRING, description: "e.g. 1:3" },
                        rationale: { type: Type.STRING, description: "Detailed 2-3 paragraph explanation" }
                    },
                    required: ["bias", "timeframe", "conviction", "entryRange", "stopLoss", "targets", "catalysts", "riskRewardRatio", "rationale"]
                }
            }
        });
        const json = cleanAndParseJSON(response.text);
        return { ticker, type: analysisType, content: json.rationale, tradeIdea: json, sources: extractSources(response) };
    }

    if (analysisType === AnalysisType.BrokerIntel) {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: `Act as a Senior Institutional Data Analyst. Provide Broker Intelligence for ${ticker}. 
            Analyze institutional flow, net buy ratios, and broker activity trends. 
            Include a "Data Analyst Synthesis" (at least 2 paragraphs) summarizing the high-level positioning.`,
            config: { 
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        analystSynthesis: { type: Type.STRING },
                        dominantSide: { type: Type.STRING },
                        metrics: {
                            type: Type.OBJECT,
                            properties: {
                                brokerFlow: {
                                    type: Type.OBJECT,
                                    properties: {
                                        netBuyRatio: { type: Type.NUMBER },
                                        flowConsistency: { type: Type.NUMBER },
                                        participantQuality: { type: Type.NUMBER }
                                    }
                                }
                            }
                        },
                        brokerActivityHistory: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    date: { type: Type.STRING },
                                    activity: { type: Type.NUMBER }
                                }
                            }
                        },
                        summary: { type: Type.STRING }
                    },
                    required: ["analystSynthesis", "dominantSide", "metrics", "brokerActivityHistory", "summary"]
                }
            }
        });
        const json = cleanAndParseJSON(response.text);
        return { ticker, type: analysisType, content: json.analystSynthesis, brokerIntel: json };
    }

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
                                }
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
                    }
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
                    }
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
    
    let modelGuidance = "";
    if (simulationModel.includes("Λ-Vol")) {
        modelGuidance = `
            The user has selected the "Λ-Vol (Volatility Frameworks)" model. 
            This is part of an advanced series of Volatility Frameworks. 
            Focus on modeling non-linear variance pathways, volatility clustering, and the impact of tail-risk events on strategy execution.
        `;
    }

    const prompt = `Perform a financial backtest simulation for ${ticker} from ${startDate} to ${endDate}. 
    Strategy: ${strategy}. 
    Simulation Model: ${simulationModel}. 
    ${modelGuidance}
    Risk Params: RR ${riskReward}, SL ${stopLoss}, TP ${takeProfit}, Trailing ${trailingStop}.
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
        throw new Error("Simulation Engine Offline: Failed to compute pathways.");
    }
};

export const runMLSimulation = async (
    ticker: string, 
    modelType: string, 
    features: string[], 
    trainingPeriod: string, 
    predictionHorizon: string, 
    endDate: string
): Promise<MLPredictionResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Perform a Machine Learning simulation for ${ticker} using the ${modelType} architecture.
    Features: ${features.join(", ")}. Training: ${trainingPeriod} ending ${endDate}. Prediction: ${predictionHorizon}.
    If model is "PCA-ML", emphasize the extraction of principal components and dimensionality reduction impact.
    Return JSON:
    {
        "ticker": "string",
        "currentPrice": number,
        "predictedPrice": number,
        "confidenceScore": number,
        "volatility": "string",
        "modelUsed": "string",
        "featureImportance": [ { "feature": "string", "score": number } ],
        "predictionPath": [ { "date": "string", "price": number, "upper": number, "lower": number } ],
        "explanation": "string describing model logic and PCA components if applicable",
        "evaluationMetrics": { "accuracy": number, "f1Score": number },
        "tradingMetrics": { "annualizedReturn": number, "sharpeRatio": number }
    }`;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text);
    } catch (e: any) {
        throw new Error("ML Engine Convergence Failure.");
    }
};

export const runAdvancedPricingAnalysis = async (ticker: string): Promise<AdvancedPricingResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
    Act as a Senior Quant Researcher at a Hedge Fund. Perform a diagnostic multi-model derivatives analysis for ${ticker}.
    MODELS: BSM, Heston Stochastic Vol, Merton Jump Diffusion, Variance Swap.
    
    DIAGNOSTIC TASKS:
    1. Check Spot Price availability.
    2. Assess Option Chain liquidity/depth.
    3. Evaluate Yield Curve and Dividend yield data.
    4. If data is missing or invalid, report it in 'diagnostics' and set values to 0. 
    5. Return a "Quant Analyst Synthesis" explaining failures or analytical results.
    
    Structure the response in JSON exactly:
    {
        "ticker": "${ticker}",
        "bsm": { "fairValue": number, "impliedVol": number, "greeks": { "delta": number, "gamma": number, "theta": number, "vega": number, "rho": number } },
        "heston": { "surfaceStatus": "string", "description": "string", "parameters": { "v0": number, "kappa": number, "theta": number, "sigma": number, "rho": number } },
        "jumpDiffusion": { "jumpProbability": number, "description": "string", "parameters": { "lambda": number, "mu": number, "delta": number } },
        "varianceSwap": { "fairVarianceStrike": number, "payoffDescription": "string" },
        "diagnostics": {
            "spotPrice": "OK"|"MISSING"|"STALE",
            "optionChain": "OK"|"THIN"|"EMPTY",
            "yieldCurve": "OK"|"INVERTED"|"MISSING",
            "dividendYield": "OK"|"ASSUMED"|"MISSING",
            "calibrationStatus": "string",
            "failureRootCause": "string if applicable"
        },
        "summary": "Detailed 2-paragraph Quant Audit summary."
    }`;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text);
    } catch (e) {
        throw new Error("Quant Engine Connection Interrupted.");
    }
};

export const runFTSLFIGAnalysis = async (ticker: string): Promise<FTSLFIGResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Perform a Fuzzy Time Series (FTS) analysis for ${ticker} integrated with Linear Fuzzy Information Granule (LFIG) method.
    Return structured JSON:
    {
        "ticker": "string",
        "granules": [ { "time": "string", "lower": number, "center": number, "upper": number, "label": "string" } ],
        "transitions": [ { "from": "string", "to": "string", "probability": number } ],
        "forecast": { "linguisticValue": "string", "numericalEstimate": number },
        "summary": "string"
    }`;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text);
    } catch (e) {
        throw new Error("FTS-LFIG Model failed to generate.");
    }
};

export const runQuantumMCDMAnalysis = async (ticker: string): Promise<QuantumMCDMResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: modelName,
        contents: `Run Quantum MCDM Analysis for ${ticker}. Return JSON.`,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text);
};

export const runFFTSPLPRAnalysis = async (ticker: string): Promise<FFTSPLPRResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: modelName,
        contents: `Run FFTS-PLPR Analysis for ${ticker}. Return JSON.`,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text);
};

export const runFFFCMGNNAnalysis = async (ticker: string): Promise<FFFCMGNNResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: modelName,
        contents: `Run FF-FCM-GNN Analysis for ${ticker}. Return JSON.`,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text);
};

export const runOptimalFuzzyDesignAnalysis = async (ticker: string): Promise<OptimalFuzzyDesignResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: modelName,
        contents: `Run Optimal Fuzzy FIS Design for ${ticker}. Return JSON.`,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text);
};

export const runMPTAnalysis = async (holdings: Holding[], strategy: string, views: any[]): Promise<MPTAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Perform Mean-Variance Optimization (MPT) and Black-Litterman analysis for these holdings: ${JSON.stringify(holdings)}. 
  Strategy: ${strategy}. Views: ${JSON.stringify(views)}.
  Return JSON:
  {
      "currentMetrics": { "sharpeRatio": number, "expectedReturn": number, "volatility": number },
      "optimalMetrics": { "sharpeRatio": number, "expectedReturn": number, "volatility": number },
      "suggestions": [ { "ticker": "string", "action": "Buy"|"Sell"|"Hold", "amount": "string", "reason": "string" } ],
      "efficientFrontier": [ { "risk": number, "return": number } ],
      "correlationMatrix": [ { "ticker1": "string", "ticker2": "string", "value": number } ],
      "rebalancingContext": { "strategyUsed": "string", "notes": "string", "nextRebalanceDate": "string" }
  }`;

  try {
      const response = await ai.models.generateContent({
          model: "gemini-3-pro-preview",
          contents: prompt,
          config: { responseMimeType: "application/json" }
      });
      return cleanAndParseJSON(response.text);
  } catch (e) {
      throw new Error("MPT Analysis Engine failure.");
  }
};

export const getETFProfile = async (ticker: string): Promise<ETFProfile> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Act as an ETF database. Provide the top 5-10 holdings and weightings for the ETF: ${ticker}.
  Return JSON: { "ticker": "string", "name": "string", "topHoldings": [ { "ticker": "string", "name": "string", "weight": number } ] }`;

  try {
      const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: { responseMimeType: "application/json" }
      });
      return cleanAndParseJSON(response.text);
  } catch (e) {
      throw new Error("ETF Profile Engine failure.");
  }
};

export const runCAPMAPTAnalysis = async (ticker: string, rfRate: number, marketReturn: number): Promise<CAPMAPTResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Perform CAPM and APT risk analysis for ${ticker}. 
  Risk-free rate: ${rfRate}%, Market return: ${marketReturn}%.
  Return JSON:
  {
      "ticker": "${ticker}",
      "capm": { "expectedReturn": number, "beta": number, "alpha": number, "securityMarketLineStatus": "string" },
      "apt": { "factors": [ { "name": "string", "beta": number } ], "totalExpectedReturn": number },
      "summary": "string"
  }`;

  try {
      const response = await ai.models.generateContent({
          model: "gemini-3-pro-preview",
          contents: prompt,
          config: { responseMimeType: "application/json" }
      });
      return cleanAndParseJSON(response.text);
  } catch (e) {
      throw new Error("CAPM/APT Model failed to converge.");
  }
};

export const runHedgeAnalysis = async (holdings: Holding[]): Promise<DeltaGammaHedgeResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Act as a Senior Risk Manager. Perform a Delta-Gamma portfolio hedging and VaR analysis for these holdings: ${JSON.stringify(holdings)}.
    Analyze protection efficiency and variance reduction under hedged scenarios.
    Return JSON structure:
    {
        "summary": "string",
        "metrics": {
            "hedgingEfficiency": number,
            "varianceReduction": number,
            "unhedgedBeta": number,
            "hedgedBeta": number,
            "unhedgedVaR": number,
            "hedgedVaR": number,
            "unhedgedCVaR": number,
            "hedgedCVaR": number
        },
        "exposures": [ { "asset": "string", "grossExposure": number, "netExposure": number, "hedgingCoverage": number, "costOfHedge": number } ],
        "pnlComparison": [ { "time": "string", "unhedgedPnl": number, "hedgedPnl": number } ],
        "recommendations": [ { "priority": "High"|"Med"|"Low", "title": "string", "action": "string" } ]
    }`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text);
    } catch (e) {
        throw new Error("Risk Diagnostic Engine failed.");
    }
};
