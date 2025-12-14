
import React, { useState, useEffect } from "react";
import { runMLSimulation } from "../services/geminiService";
import { MLPredictionResult } from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  ComposedChart,
} from "recharts";

const MODEL_TYPES = [
  "Transformer (Time-Series)",
  "LSTM-Attention Network",
  "Autoregressive Integrated Moving Average (ARIMA)",
  "Hybrid ES-DRNN (Exp. Smoothing + Dilated RNN)",
  "Linear-Exponential-Polynomial model",
  "Ridge Regression",
  "Multivariate Time Series Forecasting (GRU)",
  "GRU (Gated Recurrent Unit)",
  "Recurrent Neural Network (RNN)",
  "Convolutional Neural Network (CNN)",
  "Back Propagation Neural Network (BPNN)",
  "Extreme Learning Machine (ELM)",
  "Radial Basis Function Network (RBFNN)",
  "Generative Adversarial Networks (GANs)",
  "Adaptive Neuro-Fuzzy Inference System (ANFIS)",
  "Fuzzy Logic System",
  "XGBoost Ensemble",
  "Random Forest Regressor",
  "Logistic Regression",
  "Reinforcement Learning (DCRL)",
  "Twin Delayed Deep Deterministic Policy Gradient (TD3)",
  "Deep Recurrent Q-Network (DRQN)",
  "DeltaLag (Deep Learning)",
  "Multi-Granularity Spatio-Temporal Correlation Networks",
  "Multi-Granularity Deep Spatio-Temporal Correlation Framework (MDSTCF)",
  "HA-NARX (Hybrid Associative NARX)",
  "Rectified Linear Unit (ReLU)",
  "Gaussian Naive Bayes",
  "Function-on-Function Direct Neural Networks (FFDNNs)",
  "Function-on-Function Basis Neural Networks (FFBNNs)",
];

const FEATURE_OPTIONS = [
  "Price History (OHLC)",
  "Volume Profile",
  "RSI & MACD",
  "Social Sentiment",
  "Macro Indicators (Interest Rates)",
  "Volatility Index (VIX)",
  "Fibonacci Retracement",
  "ATR (Average True Range)",
  "SMA (Simple Moving Average)",
  "EMA (Exponential Moving Average)",
  "Stochastic Oscillator",
  "Bollinger Bands",
  "ADX (Average Directional Index)",
  "Money Flow Index (MFI)",
  "On-Balance Volume (OBV)",
  "Momentum"
];

const TRAINING_PERIODS = [
    "3 Months",
    "6 Months",
    "1 Year",
    "3 Years",
    "5 Years"
];

const PREDICTION_HORIZONS = [
    "7 Days",
    "2 Weeks",
    "1 Month"
];

const MLView: React.FC = () => {
  const [ticker, setTicker] = useState("NVDA");
  const [modelType, setModelType] = useState(MODEL_TYPES[0]);
  const [trainingPeriod, setTrainingPeriod] = useState("1 Year");
  const [trainingEndDate, setTrainingEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [predictionHorizon, setPredictionHorizon] = useState("7 Days");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    "Price History (OHLC)",
    "Volume Profile",
    "RSI & MACD",
  ]);
  const [status, setStatus] = useState<'idle' | 'training' | 'complete'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<MLPredictionResult | null>(null);

  const toggleFeature = (feat: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  const setAllFeatures = (select: boolean) => {
      if (select) {
          setSelectedFeatures(FEATURE_OPTIONS);
      } else {
          setSelectedFeatures([]);
      }
  };

  const startSimulation = async () => {
    if (!ticker.trim()) return;
    
    setStatus('training');
    setLogs([]);
    setResult(null);

    // Simulate Training Log Sequence
    const logMessages = [
      `Initializing ${modelType} architecture...`,
      `Loading historical data for ${ticker} (${trainingPeriod} dataset ending ${trainingEndDate})...`,
      `Normalizing input vectors [${selectedFeatures.length} features]...`,
      `Setting prediction horizon to ${predictionHorizon}...`,
      "Epoch 1/50: Loss 0.4322 - Val_Loss 0.4501",
      "Epoch 10/50: Loss 0.2105 - Val_Loss 0.2210",
      "Epoch 25/50: Loss 0.1502 - Val_Loss 0.1550",
      "Epoch 50/50: Loss 0.0945 - Val_Loss 0.1012",
      "Optimizing weights...",
      "Running inference on test set...",
    ];

    for (const msg of logMessages) {
      await new Promise((r) => setTimeout(r, 400)); // Delay for effect
      setLogs((prev) => [...prev, msg]);
    }

    try {
      const data = await runMLSimulation(ticker, modelType, selectedFeatures, trainingPeriod, predictionHorizon, trainingEndDate);
      setResult(data);
      setStatus('complete');
    } catch (error) {
      console.error(error);
      setLogs((prev) => [...prev, "Error: Model failed to converge."]);
      setStatus('idle');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* CONFIG PANEL */}
      <div className="lg:col-span-4 bg-[#0f172a] rounded-xl border border-purple-500/30 p-6 shadow-lg flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12h1.5m-1.5 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Model Lab
          </h2>
          <p className="text-xs text-slate-400 mt-1">Configure and train custom AI models.</p>
        </div>

        <div className="space-y-5 flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Asset</label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="w-full bg-[#1e293b] border border-slate-700 rounded px-3 py-2 text-white focus:border-purple-500 outline-none"
              placeholder="e.g. NVDA"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Architecture</label>
            <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-2">
              {MODEL_TYPES.map((model) => (
                <div
                  key={model}
                  onClick={() => setModelType(model)}
                  className={`cursor-pointer px-3 py-2 rounded text-sm border transition-all ${
                    modelType === model
                      ? "bg-purple-900/30 border-purple-500 text-white"
                      : "bg-[#1e293b] border-transparent text-slate-400 hover:border-purple-500/30"
                  }`}
                >
                  {model}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Training Dataset</label>
                <div className="space-y-1">
                    {TRAINING_PERIODS.map(period => (
                        <button
                            key={period}
                            onClick={() => setTrainingPeriod(period)}
                            className={`w-full text-left px-3 py-1.5 rounded text-xs border transition-all ${
                                trainingPeriod === period
                                ? "bg-purple-900/30 border-purple-500 text-white"
                                : "bg-[#1e293b] border-transparent text-slate-400 hover:border-purple-500/20"
                            }`}
                        >
                            {period}
                        </button>
                    ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Prediction Horizon</label>
                <div className="space-y-1">
                    {PREDICTION_HORIZONS.map(horizon => (
                        <button
                            key={horizon}
                            onClick={() => setPredictionHorizon(horizon)}
                            className={`w-full text-left px-3 py-1.5 rounded text-xs border transition-all ${
                                predictionHorizon === horizon
                                ? "bg-blue-900/30 border-blue-500 text-white"
                                : "bg-[#1e293b] border-transparent text-slate-400 hover:border-blue-500/20"
                            }`}
                        >
                            {horizon}
                        </button>
                    ))}
                </div>
              </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Training End Date</label>
            <input 
                type="date"
                value={trainingEndDate}
                onChange={(e) => setTrainingEndDate(e.target.value)}
                className="w-full bg-[#1e293b] border border-slate-700 rounded px-3 py-2 text-white focus:border-purple-500 outline-none text-sm"
            />
            <p className="text-[10px] text-slate-600 mt-1">Leave as today for latest data, or select past date for validation.</p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Input Features</label>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setAllFeatures(true)}
                        className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors"
                    >
                        Select All
                    </button>
                    <span className="text-slate-600 text-[10px]">|</span>
                    <button 
                        onClick={() => setAllFeatures(false)}
                        className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        Deselect All
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-2">
              {FEATURE_OPTIONS.map((feat) => (
                <div
                  key={feat}
                  onClick={() => toggleFeature(feat)}
                  className={`cursor-pointer px-2 py-2 rounded text-xs border text-center transition-all ${
                    selectedFeatures.includes(feat)
                      ? "bg-purple-900/20 border-purple-400 text-purple-200"
                      : "bg-[#1e293b] border-transparent text-slate-500 hover:text-slate-300 hover:border-purple-500/20"
                  }`}
                >
                  {feat}
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={startSimulation}
          disabled={status === 'training' || !ticker}
          className={`w-full py-3 mt-6 rounded font-bold text-white transition-all flex justify-center items-center gap-2 ${
            status === 'training'
              ? "bg-slate-700 cursor-wait"
              : "bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 shadow-lg shadow-purple-900/20"
          }`}
        >
          {status === 'training' ? "Training..." : "Train Model & Predict"}
        </button>
      </div>

      {/* RESULTS PANEL */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Console / Status */}
        <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-4 min-h-[160px] font-mono text-xs overflow-y-auto flex flex-col-reverse custom-scrollbar">
            {status === 'idle' && <div className="text-slate-500 italic">Ready to initialize model training...</div>}
            {logs.map((log, i) => (
                <div key={i} className="text-green-400 border-l-2 border-green-900 pl-2 mb-1">
                    <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                    {log}
                </div>
            ))}
        </div>

        {status === 'complete' && result && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 fade-in">
                {/* Prediction Card */}
                <div className="md:col-span-2 bg-[#131B2E] rounded-xl border border-purple-500/30 p-6 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-48 h-48 text-purple-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                        </svg>
                     </div>
                     
                     <div className="relative z-10 flex justify-between items-end">
                        <div>
                            <div className="text-slate-400 text-sm uppercase tracking-widest mb-1">{predictionHorizon} Forecast</div>
                            <div className="text-5xl font-bold text-white mb-2">${result.predictedPrice.toFixed(2)}</div>
                            <div className={`flex items-center gap-2 text-sm ${result.predictedPrice > result.currentPrice ? 'text-green-400' : 'text-red-400'}`}>
                                <span>Current: ${result.currentPrice.toFixed(2)}</span>
                                <span>({((result.predictedPrice - result.currentPrice) / result.currentPrice * 100).toFixed(2)}%)</span>
                            </div>
                        </div>
                        <div className="text-right">
                             <div className="text-sm text-slate-400 mb-1">Confidence</div>
                             <div className="text-3xl font-bold text-purple-400">{result.confidenceScore}%</div>
                             <div className="text-xs text-slate-500 mt-1">Volatility: {result.volatility}</div>
                        </div>
                     </div>

                     <div className="mt-6 h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={result.predictionPath}>
                                <defs>
                                    <linearGradient id="confidence" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0.05}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 10}} />
                                <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{fontSize: 10}} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                                <Area type="monotone" dataKey="upper" stackId="1" stroke="transparent" fill="transparent" />
                                <Area type="monotone" dataKey="lower" stackId="1" stroke="#8884d8" strokeDasharray="3 3" fill="url(#confidence)" />
                                <Line type="monotone" dataKey="price" stroke="#22d3ee" strokeWidth={3} dot={{r: 4}} />
                            </ComposedChart>
                        </ResponsiveContainer>
                     </div>
                </div>

                {/* Performance Evaluation Dashboard */}
                {result.evaluationMetrics && result.tradingMetrics && (
                    <div className="md:col-span-2 bg-[#0f172a] rounded-xl border border-purple-500/30 p-6 shadow-lg">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-cyan-400">
                                 <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                             </svg>
                             Performance Evaluation Dashboard
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Classification Metrics */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 border-b border-purple-500/20 pb-1">Model Classification Metrics</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-[#1e293b] p-3 rounded border border-purple-500/10">
                                        <div className="text-[10px] text-slate-400 uppercase">Accuracy Rate (AR)</div>
                                        <div className="text-xl font-mono text-white font-bold">{(result.evaluationMetrics.accuracy * 100).toFixed(1)}%</div>
                                    </div>
                                    <div className="bg-[#1e293b] p-3 rounded border border-purple-500/10">
                                        <div className="text-[10px] text-slate-400 uppercase">Precision (PR)</div>
                                        <div className="text-xl font-mono text-cyan-300 font-bold">{(result.evaluationMetrics.precision * 100).toFixed(1)}%</div>
                                    </div>
                                    <div className="bg-[#1e293b] p-3 rounded border border-purple-500/10">
                                        <div className="text-[10px] text-slate-400 uppercase">Recall (RR)</div>
                                        <div className="text-xl font-mono text-cyan-300 font-bold">{(result.evaluationMetrics.recall * 100).toFixed(1)}%</div>
                                    </div>
                                    <div className="bg-[#1e293b] p-3 rounded border border-purple-500/10">
                                        <div className="text-[10px] text-slate-400 uppercase">F1-Score / AUC</div>
                                        <div className="text-lg font-mono text-slate-200 font-bold">
                                            {result.evaluationMetrics.f1Score.toFixed(2)} <span className="text-slate-500 text-sm font-normal mx-1">/</span> {result.evaluationMetrics.auc.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Trading Performance Metrics */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 border-b border-purple-500/20 pb-1">Simulated Trading Performance</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-[#1e293b] p-3 rounded border border-purple-500/10">
                                        <div className="text-[10px] text-slate-400 uppercase">Winning Rate (WR)</div>
                                        <div className={`text-xl font-mono font-bold ${result.tradingMetrics.winningRate > 0.5 ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {(result.tradingMetrics.winningRate * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                    <div className="bg-[#1e293b] p-3 rounded border border-purple-500/10">
                                        <div className="text-[10px] text-slate-400 uppercase">Annual Return (ARR)</div>
                                        <div className={`text-xl font-mono font-bold ${result.tradingMetrics.annualizedReturn > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {(result.tradingMetrics.annualizedReturn * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                    <div className="bg-[#1e293b] p-3 rounded border border-purple-500/10">
                                        <div className="text-[10px] text-slate-400 uppercase">Sharpe Ratio (ASR)</div>
                                        <div className="text-xl font-mono text-purple-300 font-bold">{result.tradingMetrics.sharpeRatio.toFixed(2)}</div>
                                    </div>
                                    <div className="bg-[#1e293b] p-3 rounded border border-purple-500/10">
                                        <div className="text-[10px] text-slate-400 uppercase">Max Drawdown (MDD)</div>
                                        <div className="text-xl font-mono text-red-400 font-bold">{(result.tradingMetrics.maxDrawdown * 100).toFixed(1)}%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Feature Importance */}
                <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Feature Importance</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={result.featureImportance}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="feature" type="category" width={100} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                                <Bar dataKey="score" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Explanation */}
                <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Model Logic</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                        {result.explanation}
                    </p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default MLView;
