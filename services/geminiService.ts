
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
  CAPMAPTResult,
  OptionsExpertAnalysisData,
  FundamentalAnalysisData,
  UserProfile,
  PortfolioPlanResult,
  GovDatabaseResult
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
    if (analysisType === AnalysisType.Fundamental) {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `Act as a senior buy-side equity analyst. Produce a professional-grade fundamental analysis for ${ticker} as of February 2, 2026.
            Synthesize:
            1. Economic Moat: Scale, network effects, IP, pricing power.
            2. Financial Quality: ROIC vs WACC spread, margins (Gross/Opt/FCF), cash conversion.
            3. Solvency: Net Debt/EBITDA, coverage, financial flexibility.
            4. Allocation: CapEx discipline, shareholder yield, buyback effectiveness.
            5. Valuation: DCF intrinsic value, Peer PE/EV-EBITDA, Intrinsic Range.
            6. Risk: Fundamental beta, factor exposure (Growth/Quality), drawdown profile.
            7. Thesis: Bull/Base/Bear cases with narrative catalysts and financial impacts.
            
            Return the analysis in JSON exactly:
            {
                "ticker": "${ticker}",
                "companyName": "string",
                "date": "February 2, 2026",
                "moat": {
                    "narrative": "string",
                    "advantages": ["string"],
                    "pricingPower": "High"|"Medium"|"Low",
                    "marginSustainability": "string"
                },
                "efficiency": {
                    "roic": number,
                    "wacc": number,
                    "spread": number,
                    "fcfMargin": number,
                    "operatingMargin": number,
                    "grossMargin": number,
                    "cashConversionCycle": number,
                    "incrementalRoic": "string"
                },
                "solvency": {
                    "netDebtEbitda": number,
                    "interestCoverage": number,
                    "liquidityBuffer": "string",
                    "downsideProtection": "string"
                },
                "allocation": {
                    "shareholderYield": number,
                    "capexDiscipline": "string",
                    "buybackEffectiveness": "string",
                    "dividendSustainability": "string",
                    "capitalMisallocationRisk": number
                },
                "valuation": {
                    "dcfIntrinsicValue": number,
                    "relativePe": number,
                    "evEbitda": number,
                    "marginOfSafety": number,
                    "intrinsicRange": { "low": number, "high": number },
                    "valuationSensitivity": "string"
                },
                "risk": {
                    "fundamentalBeta": number,
                    "earningsVolatility": "string",
                    "drawdownBehavior": "string",
                    "factorExposure": ["string"]
                },
                "thesis": {
                    "bull": { "narrative": "string", "financialImpact": "string", "valuationImplication": number },
                    "base": { "narrative": "string", "financialImpact": "string", "valuationImplication": number },
                    "bear": { "narrative": "string", "financialImpact": "string", "valuationImplication": number }
                },
                "conclusion": {
                    "conviction": "High"|"Medium"|"Low",
                    "variablesToMonitor": ["string"],
                    "thesisInvalidation": "string"
                },
                "summary": "Institutional Research Memo Summary."
            }`,
            config: { 
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json" 
            }
        });
        const json = cleanAndParseJSON(response.text);
        return { ticker, type: analysisType, content: json.summary, fundamentalAnalysis: json };
    }

    if (analysisType === AnalysisType.OptionsExpert) {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: `Act as a senior institutional options strategist. Produce an expert-level options analysis for ${ticker} as of February 2, 2026.
            Synthesize:
            1. Institutional Flow: Call/Put dollar volume skew, V/OI ratios, hedge-related signatures.
            2. Volatility: 30D IV, Rank, earnings-implied move, IV Crush risks.
            3. Catalysts: AI licensing, Cloud growth, CapEx, Valuation anchors.
            4. Technicals: Gamma zones, Support/Resistance, Gamma squeeze risk.
            5. Strategy Playbook: Short, medium, and long-term structures.
            
            Format the response in JSON exactly:
            {
                "ticker": "${ticker}",
                "date": "February 2, 2026",
                "positioning": {
                    "callPutSkew": "string",
                    "dominantStrikes": [ { "strike": number, "type": "Call"|"Put", "significance": "string" } ],
                    "unusualActivity": [ { "contract": "string", "v_oi_ratio": number, "interpretation": "string" } ],
                    "tailRiskProtection": "string"
                },
                "volatility": {
                    "ivLevel": number,
                    "ivRank": number,
                    "impliedMove": { "percent": number, "dollar": number },
                    "ivCrushRisk": "string",
                    "preferredStructures": ["string"]
                },
                "fundamentals": {
                    "aiLicensing": "string",
                    "cloudGrowth": "string",
                    "valuationAnchors": "string"
                },
                "technicals": {
                    "resistance": number,
                    "support": number,
                    "gammaZones": "string",
                    "squeezeConditions": "string"
                },
                "strategy": {
                    "shortTerm": "string",
                    "mediumTerm": "string",
                    "longTerm": "string",
                    "playbook": {
                        "volatilityTrader": "string",
                        "directionalTrader": "string",
                        "longTermHolder": "string"
                    }
                },
                "conclusion": "Full Expert Consensus Verdict."
            }`,
            config: { responseMimeType: "application/json" }
        });
        const json = cleanAndParseJSON(response.text);
        return { ticker, type: analysisType, content: json.conclusion, optionsExpert: json };
    }

    if (analysisType === AnalysisType.Clustering) {
        let promptGuidance = `Produce ACTUAL CLUSTERING RESULTS for a universe of stocks using ${ticker}.`;
        
        if (ticker === "GBML-EMO CLUSTERING") {
            promptGuidance = `
                Act as a quantitative finance AI and graph-based probabilistic clustering engine.
                Perform GBML-EMO (Graph-Based Machine Learning with Expectation-Maximization Optimization) on a stock universe.
                Algorithm details: kNN (k=20) similarity graph, normalized Laplacian, soft assignment via EM optimization, maximizing ELBO.
                Universe: Mag 7 (AAPL, NVDA, MSFT, GOOGL, AMZN, TSLA, META) + 15 S&P 100 Leaders.
            `;
        } else if (ticker === "SPECTRAL CLUSTERING") {
            promptGuidance = `
                Act as a senior quantitative finance AI and graph-based clustering engine.
                Perform Spectral Clustering on a high-cap stock investment universe.
                Algorithm: Normalized Graph Laplacian, RBF kernel similarity, kNN (k=20).
                Universe: Magnificent 7, S&P 100 Leaders.
            `;
        } else if (ticker === "AGGLOMERATIVE CLUSTERING") {
            promptGuidance = `
                Act as a senior quantitative finance AI and hierarchical clustering engine.
                Perform Agglomerative Hierarchical Clustering using Ward Linkage (minimum variance).
                Universe: Magnificent 7, Top 25 S&P 100 components.
            `;
        } else if (ticker === "BIRCH CLUSTERING") {
            promptGuidance = `
                Act as a quantitative finance AI and large-scale hierarchical clustering engine.
                Perform stock clustering using the BIRCH (Balanced Iterative Reducing and Clustering using Hierarchies) algorithm.
                Universe: Magnificent 7, S&P 100 components.
            `;
        } else if (ticker === "GAUSSIAN MIXTURE MODEL") {
            promptGuidance = `
                Act as a quantitative finance AI specializing in probabilistic clustering.
                Perform stock clustering using a Gaussian Mixture Model (GMM) with EM estimation and full covariance.
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
            Return a detailed summary and a structured list of at least 5 news items. Make sure the 'url' field contains the direct link to the original article on the publisher's website, NOT a Google Search link.`,
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
            contents: `Act as a Head of Research at a top Quant Hedge Fund. Generate a specific high-probability Trade Idea for ${ticker}.`,
            config: { 
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        bias: { type: Type.STRING },
                        timeframe: { type: Type.STRING },
                        conviction: { type: Type.NUMBER },
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
                        riskRewardRatio: { type: Type.STRING },
                        rationale: { type: Type.STRING }
                    }
                }
            }
        });
        const json = cleanAndParseJSON(response.text);
        return { ticker, type: analysisType, content: json.rationale, tradeIdea: json, sources: extractSources(response) };
    }

    if (analysisType === AnalysisType.BrokerIntel) {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: `Act as a Senior Institutional Data Analyst. Provide Broker Intelligence for ${ticker}.`,
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
                    }
                }
            }
        });
        const json = cleanAndParseJSON(response.text);
        return { ticker, type: analysisType, content: json.analystSynthesis, brokerIntel: json };
    }

    if (analysisType === AnalysisType.PriceAction) {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: `Act as a Senior Quant. Analyze ${ticker} using SMC. Generate 30 OHLC candles and levels.`,
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
                                    label: { type: Type.STRING, nullable: true }
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
            contents: `Analyze ${ticker} using Indicators.`,
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
                                rsiVal: { type: Type.NUMBER },
                                macdVal: { type: Type.NUMBER }
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
    
    if (analysisType === AnalysisType.SmartMoney) {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: `You are SMART MONEY AI, an advanced market intelligence assistant. Your goal is to analyze a stock's price and volume data to detect **smart money accumulation/distribution** and provide **probabilistic trend predictions** using both technical indicators and advanced logic for ${ticker}.

Inputs:
- Historical OHLC (Open, High, Low, Close) data
- Volume data per candle
- Moving Averages: MA20, MA50, MA100
- Optional: news sentiment, sector info

Rules / Logic:
1. Identify MA cross events:
   - MA20 crossing MA50 or MA100 = reference point for potential trend reversal or continuation.
2. Calculate Ratio Volume:
   - Ratio Volume = Current candle volume / Average volume since last MA cross.
   - Interpret:
     - Ratio > 1 → strong participation, possible accumulation (bullish) or distribution (bearish)
     - Ratio < 1 → low participation, market possibly passive
     - Ratio ~ 1 → sideways / uncertain, requires additional AI analysis
3. Trend probability logic:
   - If Ratio > 1 AND MA20 > MA50 & MA100 → assign high bullish probability
   - If Ratio < 1 AND MA20 < MA50 & MA100 → assign high bearish probability
   - If Ratio ~ 1 → analyze using AI pattern recognition on price action, volume clusters, and MA alignment for trend probability
4. Smart Money Detection:
   - Detect unusual volume clusters and directional price movement that indicate institutional participation.
   - Highlight possible accumulation (buying pressure) and distribution (selling pressure) zones.
5. Output:
   - Probabilistic trend prediction (Bullish %, Bearish %, Sideways %)
   - Recommended action for retail traders: Follow smart money / Wait / Hedge
   - Key support/resistance zones and volume clusters for guidance
   - Confidence score for each prediction

Constraints:
- Probabilities must be normalized and sum to 100%
- Provide reasoning behind each recommendation
- Highlight if market shows signs of manipulation or low liquidity that may invalidate signals
- Focus on actionable insights for both bullish and bearish markets

Return JSON exactly in this format:
{
    "ticker": "${ticker}",
    "ratioVolume": number,
    "maStatus": "string",
    "smartMoneyActivity": "Accumulation" | "Distribution" | "Neutral",
    "probabilities": {
        "bullish": number,
        "bearish": number,
        "sideways": number
    },
    "recommendation": "Follow smart money" | "Wait" | "Hedge",
    "confidenceScore": number,
    "keyZones": {
        "support": [number],
        "resistance": [number],
        "volumeClusters": [number]
    },
    "reasoning": "string",
    "warnings": "string"
}`,
            config: { 
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json" 
            }
        });
        const json = cleanAndParseJSON(response.text);
        return { ticker, type: analysisType, content: json.reasoning, smartMoney: json, sources: extractSources(response) };
    }

    if (analysisType === AnalysisType.MarineTraffic) {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `Act as a global supply chain and maritime intelligence analyst. Provide a MarineTraffic and port congestion analysis for ${ticker} (or the general macroeconomic shipping environment if ${ticker} is an index/macro asset) as of February 2, 2026.
            Include:
            1. Chokepoint Throughput Index (0-100) and major bottlenecks.
            2. Port Congestion Index (0-100) and average wait time in days.
            3. Vessel Activity (arrivals, departures, total in port).
            4. Time-in-Port Indicator and status (Efficient, Delayed, Critical).
            
            Return the analysis in JSON exactly:
            {
                "ticker": "${ticker}",
                "chokepointThroughput": {
                    "index": number,
                    "trend": "Up" | "Down" | "Stable",
                    "majorBottlenecks": ["string"]
                },
                "portCongestion": {
                    "index": number,
                    "trend": "Up" | "Down" | "Stable",
                    "averageWaitTimeDays": number
                },
                "vesselActivity": {
                    "arrivals": number,
                    "departures": number,
                    "totalInPort": number
                },
                "timeInPort": {
                    "indicator": number,
                    "historicalAverage": number,
                    "status": "Efficient" | "Delayed" | "Critical"
                },
                "summary": "string"
            }`,
            config: { 
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json" 
            }
        });
        const json = cleanAndParseJSON(response.text);
        return { ticker, type: analysisType, content: json.summary, marineTraffic: json, sources: extractSources(response) };
    }

    if (analysisType === AnalysisType.BISReport) {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `Act as a central bank and macro-liquidity analyst. Provide a Bank for International Settlements (BIS) style macro report for the current global environment (or specifically tailored to ${ticker} if it's a macro asset/currency) as of February 2, 2026.
            Include:
            1. Global Liquidity (USD credit, trend, YoY change).
            2. Cross-Border Claims (total, emerging markets, advanced economies).
            3. Policy Rates (stance, divergence index).
            4. Systemic Risk (indicator 0-100, primary vulnerability).
            5. Key Takeaways (array of strings).
            6. Executive Summary.
            
            Return the analysis in JSON exactly:
            {
                "date": "February 2, 2026",
                "globalLiquidity": {
                    "usdCredit": "string",
                    "trend": "Expanding" | "Contracting" | "Stable",
                    "yoyChange": number
                },
                "crossBorderClaims": {
                    "total": "string",
                    "emergingMarkets": "string",
                    "advancedEconomies": "string"
                },
                "policyRates": {
                    "stance": "Hawkish" | "Dovish" | "Neutral",
                    "divergenceIndex": number
                },
                "systemicRisk": {
                    "indicator": number,
                    "primaryVulnerability": "string"
                },
                "keyTakeaways": ["string"],
                "executiveSummary": "string"
            }`,
            config: { 
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json" 
            }
        });
        const json = cleanAndParseJSON(response.text);
        return { ticker, type: analysisType, content: json.executiveSummary, bisReport: json, sources: extractSources(response) };
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Analyze ${ticker} for ${analysisType}.`,
      config: { tools: [{ googleSearch: {} }] },
    });
    return { ticker, type: analysisType, content: response.text || "No analysis.", sources: extractSources(response) };
  } catch (error: any) {
    throw new Error(error.message || "Error.");
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
    const prompt = `Perform financial backtest simulation for ${ticker} from ${startDate} to ${endDate}. 
    Strategy: ${strategy}. 
    Simulation Model: ${simulationModel}. 
    Risk Params: RR ${riskReward}, SL ${stopLoss}, TP ${takeProfit}, Trailing ${trailingStop}.
    Return JSON:
    {
        "metrics": { "totalReturn": "string", "maxDrawdown": "string", "winRate": "string", "tradesCount": number },
        "equityCurve": [ { "date": "string", "value": number } ],
        "trades": [ { "date": "string", "type": "Buy"|"Sell", "price": number, "result": "string" } ],
        "summary": "AI breakdown."
    }`;
    const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text);
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
    const prompt = `Machine Learning simulation for ${ticker} using ${modelType}. Features: ${features.join(", ")}.
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
        "explanation": "string",
        "evaluationMetrics": { "accuracy": number, "f1Score": number },
        "tradingMetrics": { "annualizedReturn": number, "sharpeRatio": number },
        "performanceMetrics": { "mse": number, "mae": number, "rmse": number }
    }`;
    const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text);
};

export const runAdvancedPricingAnalysis = async (ticker: string): Promise<AdvancedPricingResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Act as an institutional quant engine. Pricing calibration for ${ticker}.
    Return JSON:
    {
        "ticker": "${ticker}",
        "bsm": { "fairValue": number, "impliedVol": number, "valuationStatus": "FAIR VALUE"|"OVERPRICED"|"UNDERPRICED", "greeks": { "delta": number, "gamma": number, "theta": number, "vega": number, "rho": number } },
        "heston": { "parameters": { "v0": number, "kappa": number, "theta": number, "sigmaV": number, "rho": number }, "skewStatus": "CALIBRATED"|"FLAT"|"DISTORTED", "implication": "string" },
        "jumpDiffusion": { "jumpProbability": number, "parameters": { "lambda": number, "mu": number, "delta": number }, "riskAssessment": "string" },
        "varianceSwap": { "fairVarianceStrike": number, "payoffTopology": "string", "volOfVolPremium": "string" },
        "diagnostics": { "spotPrice": "OK"|"MISSING"|"STALE", "optionChain": "OK"|"THIN"|"EMPTY", "yieldCurve": "OK"|"INVERTED"|"MISSING", "dividendYield": "OK"|"ASSUMED"|"MISSING", "calibrationStatus": "string", "failureRootCause": "string" },
        "summary": "Full Institutional Report."
    }`;
    const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text);
};

export const runFTSLFIGAnalysis = async (ticker: string): Promise<FTSLFIGResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `FTS-LFIG analysis for ${ticker}. JSON format.`;
    const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text);
};

export const runQuantumMCDMAnalysis = async (ticker: string): Promise<QuantumMCDMResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: modelName,
        contents: `Run Quantum MCDM for ${ticker}. JSON.`,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text);
};

export const runFFTSPLPRAnalysis = async (ticker: string): Promise<FFTSPLPRResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: modelName,
        contents: `Run FFTS-PLPR for ${ticker}. JSON.`,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text);
};

export const runFFFCMGNNAnalysis = async (ticker: string): Promise<FFFCMGNNResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: modelName,
        contents: `Run FF-FCM-GNN for ${ticker}. JSON.`,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text);
};

export const runOptimalFuzzyDesignAnalysis = async (ticker: string): Promise<OptimalFuzzyDesignResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: modelName,
        contents: `Run Optimal Fuzzy FIS for ${ticker}. JSON.`,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text);
};

export const runMPTAnalysis = async (holdings: Holding[], strategy: string, views: any[]): Promise<MPTAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `MPT analysis for ${JSON.stringify(holdings)}. JSON.`,
      config: { responseMimeType: "application/json" }
  });
  return cleanAndParseJSON(response.text);
};

export const getETFProfile = async (ticker: string): Promise<ETFProfile> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
      model: modelName,
      contents: `ETF holdings for ${ticker}. JSON.`,
      config: { responseMimeType: "application/json" }
  });
  return cleanAndParseJSON(response.text);
};

export const runCAPMAPTAnalysis = async (ticker: string, rfRate: number, marketReturn: number): Promise<CAPMAPTResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `CAPM/APT for ${ticker}. JSON.`,
      config: { responseMimeType: "application/json" }
  });
  return cleanAndParseJSON(response.text);
};

export const analyzeSECReport = async (ticker: string): Promise<any> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `You are a senior hedge fund analyst and institutional asset manager with expertise in forensic accounting, valuation modeling, and macro risk analysis.

Your task is to perform a deep fundamental analysis of the latest SEC filing from the U.S. Securities and Exchange Commission for ${ticker}.

Analyze the document as if preparing an internal investment memo for a hedge fund investment committee.

Structure your analysis into the following sections:

1. Executive Summary
- Provide a concise investment thesis
- Bull case vs Bear case
- Key catalysts in the next 6–24 months
- Overall rating: Strong Buy / Buy / Hold / Sell / Avoid

2. Business Model Analysis
- Core revenue streams
- Competitive moat (network effects, switching costs, brand, cost advantage)
- Industry positioning
- Total addressable market (TAM)

3. Financial Statement Deep Dive
Analyze the following trends over 5–10 years if available:
Revenue growth, Gross margin trends, Operating margin, Free cash flow generation, ROIC (Return on Invested Capital), Debt levels and leverage ratios, Capital allocation strategy (buybacks, dividends, acquisitions)
Identify: Earnings quality, Accounting red flags, Revenue recognition risks

4. Management & Governance
- Management incentives and compensation
- Insider ownership and insider trading activity
- Capital discipline
- Corporate governance risks

5. Risk Analysis
Identify major risks mentioned in the filing and also hidden risks:
Regulatory risk, Technological disruption, Competitive pressure, Macroeconomic exposure, Supply chain risk, Legal liabilities

6. Valuation Framework
Provide multiple valuation approaches:
DCF valuation, Comparable company multiples, EV/EBITDA, P/E ratio vs industry, Sum-of-the-parts (if relevant)
Determine whether the company is: Undervalued / Fairly valued / Overvalued.

7. Hidden Insights
Look for subtle signals often missed by retail investors:
Footnotes, Changes in accounting policies, Segment reporting anomalies, Off-balance-sheet liabilities, Stock-based compensation impact

8. Shareholders
Provide data on the shareholders of the stock:
- Institutional ownership percentage
- Top shareholders (name, percentage, shares)
- Recent changes in ownership

9. Investment Conclusion
Provide:
- Target price estimate
- Probability-weighted scenario analysis
- Key metrics to monitor in future earnings

Be extremely analytical and think like a hedge fund manager allocating billions of dollars.

Return JSON exactly in this format:
{
  "ticker": "${ticker}",
  "executiveSummary": {
    "thesis": "string",
    "bullCase": "string",
    "bearCase": "string",
    "catalysts": ["string"],
    "rating": "Strong Buy" | "Buy" | "Hold" | "Sell" | "Avoid"
  },
  "businessModel": {
    "revenueStreams": ["string"],
    "moat": "string",
    "positioning": "string",
    "tam": "string"
  },
  "financials": {
    "revenueGrowth": "string",
    "grossMargin": "string",
    "operatingMargin": "string",
    "fcf": "string",
    "roic": "string",
    "debt": "string",
    "capitalAllocation": "string",
    "earningsQuality": "string",
    "redFlags": ["string"],
    "revenueRisks": "string"
  },
  "management": {
    "incentives": "string",
    "insiderActivity": "string",
    "capitalDiscipline": "string",
    "governanceRisks": ["string"]
  },
  "risks": {
    "regulatory": "string",
    "technological": "string",
    "competitive": "string",
    "macroeconomic": "string",
    "supplyChain": "string",
    "legal": "string"
  },
  "valuation": {
    "dcf": "string",
    "comparables": "string",
    "evEbitda": "string",
    "peRatio": "string",
    "sotp": "string",
    "conclusion": "Undervalued" | "Fairly valued" | "Overvalued"
  },
  "hiddenInsights": {
    "footnotes": "string",
    "accountingChanges": "string",
    "segmentAnomalies": "string",
    "offBalanceSheet": "string",
    "stockComp": "string"
  },
  "shareholders": {
    "institutionalOwnership": "string",
    "topShareholders": [
      {
        "name": "string",
        "percentage": "string",
        "shares": "string"
      }
    ],
    "recentChanges": "string"
  },
  "conclusion": {
    "targetPrice": "string",
    "scenarioAnalysis": "string",
    "metricsToMonitor": ["string"]
  }
}`,
        config: { 
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json" 
        }
    });
    return cleanAndParseJSON(response.text);
};

export const runHedgeAnalysis = async (holdings: Holding[]): Promise<DeltaGammaHedgeResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Delta-Gamma hedge for ${JSON.stringify(holdings)}. JSON.`,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text);
};

export const generatePortfolioPlan = async (profile: UserProfile): Promise<PortfolioPlanResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Act as an expert fiduciary Robo-Advisor and Wealth Manager. 
Generate a comprehensive, diversified portfolio plan tailored to the following user profile:
Risk Tolerance: ${profile.riskTolerance}
Investment Horizon: ${profile.investmentHorizon}
Initial Capital: $${profile.initialCapital}
Investment Goal: ${profile.goal}

Provide a well-researched asset allocation and specific stock/ETF recommendations with predicted potential growing prices based on current market trends.

Respond STRICTLY with a JSON object matching this structure:
{
    "summary": "High-level summary of the strategy.",
    "assetAllocation": [
        { "assetClass": "Equities", "percentage": 60 },
        { "assetClass": "Fixed Income", "percentage": 30 },
        { "assetClass": "Cash/Equivalents", "percentage": 10 }
    ],
    "recommendedHoldings": [
        {
            "ticker": "AAPL",
            "name": "Apple Inc.",
            "assetClass": "Equities",
            "weight": 15,
            "currentPriceEstimate": 180,
            "targetPrice": 210,
            "predictedGrowth": 16.6,
            "rationale": "Strong balance sheet, share buybacks."
        }
    ],
    "diversificationStrategy": "Detailed explanation of how this mitigates risk.",
    "estimatedAnnualReturn": 7.5,
    "riskMetrics": {
        "maxDrawdown": 12.5,
        "volatility": 10.2
    }
}`;
    
    const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: { 
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json" 
        }
    });

    return cleanAndParseJSON(response.text);
};

export async function fetchGovDatabase(ticker: string): Promise<GovDatabaseResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Search for the latest data from US Government and Regulatory databases regarding ${ticker}.
Include information from:
1. SEC Form 13F (Institutional Holdings)
2. SEC N-PORT (Mutual Fund Holdings)
3. SEC Schedule 13D/G (Beneficial Ownership)
4. SEC Form 4 (Insider Trading)
5. CFTC Commitments of Traders (COT) report (if applicable)
6. USAspending.gov (Government contracts)
7. Treasury TIC (Treasury International Capital) data

Provide a detailed summary and specific insights extracted from each database. If a database is not directly applicable to the specific ticker (e.g. COT for an individual stock), provide a brief explanation or related proxy data.

Respond STRICTLY with a JSON object matching this structure:
{
  "sec13F": "Institutional ownership trends, major buyers/sellers from recent 13F filings.",
  "secNPort": "Mutual fund exposure and shifts based on N-PORT data.",
  "sec13DG": "Activist blocks or >5% ownership stakes from 13D/13G filings.",
  "secForm4": "Recent insider buying or selling patterns.",
  "cftcCot": "Relevant futures positioning or macro context.",
  "usASpending": "Relevant government contracts or grants.",
  "treasuryTic": "Foreign investment flows or macro context.",
  "summary": "Overall synthesis of what government and regulatory data reveals about the asset."
}`;
    
  const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: { 
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json" 
      }
  });

  return cleanAndParseJSON(response.text);
}

