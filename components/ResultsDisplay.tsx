import React from "react";
import { AnalysisResult, AnalysisType } from "../types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ReactMarkdown from 'react-markdown';


interface ResultsDisplayProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  activeTab: AnalysisType;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  result,
  isLoading,
  activeTab,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400 animate-pulse">
        <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
        <p>Gathering market data and processing analysis...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1}
          stroke="currentColor"
          className="w-20 h-20 mb-4 opacity-50"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"
          />
        </svg>
        <h3 className="text-xl font-semibold text-slate-300 mb-2">
          Market {activeTab}
        </h3>
        <p className="max-w-md text-center text-sm">
          Enter a stock ticker above to generate real-time insights using Gemini 2.5 Flash.
        </p>
      </div>
    );
  }

  const isChart = activeTab === AnalysisType.Chart;
  const isIdea = activeTab === AnalysisType.Ideas;
  const isYahoo = activeTab === AnalysisType.YahooFinance;

  return (
    <div className="bg-[#131B2E] rounded-lg border border-slate-800 p-6 shadow-xl min-h-[400px]">
      <div className="flex justify-between items-start mb-6 border-b border-slate-800 pb-4">
        <div>
            <h2 className="text-2xl font-bold text-white mb-1">
            {result.ticker} <span className="text-slate-500 text-lg font-normal">| {activeTab}</span>
            </h2>
            <p className="text-xs text-slate-400">AI Generated Content • Not Financial Advice</p>
        </div>
        {result.sentiment && (
            <div className={`px-4 py-1 rounded-full text-sm font-bold border ${
                result.sentiment === 'Bullish' ? 'bg-green-900/30 border-green-500 text-green-400' :
                result.sentiment === 'Bearish' ? 'bg-red-900/30 border-red-500 text-red-400' :
                'bg-yellow-900/30 border-yellow-500 text-yellow-400'
            }`}>
                {result.sentiment.toUpperCase()}
            </div>
        )}
      </div>

      {/* Chart View */}
      {isChart && result.chartData && (
        <div className="h-[400px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={result.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                itemStyle={{ color: '#22d3ee' }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#22d3ee"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: "#22d3ee" }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-center text-xs text-slate-500 mt-4 italic">
            *Chart data is simulated/approximated by AI for demonstration purposes.
          </p>
        </div>
      )}

      {/* Yahoo Finance / Financials View */}
      {isYahoo && result.financials && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {Object.entries(result.financials).map(([key, value]) => (
                  <div key={key} className="bg-slate-800/50 p-4 rounded border border-slate-700">
                      <div className="text-slate-400 text-xs uppercase mb-1">{key}</div>
                      <div className="text-white font-mono font-medium">{value}</div>
                  </div>
              ))}
          </div>
      )}

      {/* Trade Idea View */}
      {isIdea && result.tradeSetup && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">Entry Target</div>
                <div className="text-xl font-mono text-blue-400">{result.tradeSetup.entry}</div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">Stop Loss</div>
                <div className="text-xl font-mono text-red-400">{result.tradeSetup.stopLoss}</div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">Take Profit</div>
                <div className="text-xl font-mono text-green-400">{result.tradeSetup.takeProfit}</div>
            </div>
        </div>
      )}

      {/* Text Content */}
      <div className="prose prose-invert max-w-none text-slate-300">
         <ReactMarkdown
            components={{
                h3: ({node, ...props}) => <h3 className="text-xl font-bold text-cyan-400 mt-8 mb-4 border-b border-slate-700 pb-2" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-3 mb-6 text-slate-300" {...props} />,
                li: ({node, ...props}) => <li className="leading-relaxed pl-2" {...props} />,
                p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-slate-300" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold text-white" {...props} />
            }}
         >
            {result.content}
         </ReactMarkdown>
      </div>

      {/* Grounding Sources */}
      {result.sources && result.sources.length > 0 && (
        <div className="mt-8 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">References & Sources</h4>
            <ul className="space-y-2">
                {result.sources.map((source, idx) => (
                    <li key={idx}>
                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-cyan-600 hover:text-cyan-400 transition-colors hover:underline">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                            </svg>
                            <span className="truncate max-w-md">{source.title}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
