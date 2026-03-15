import React, { useState } from "react";
import { analyzeSECReport } from "../services/geminiService";
import { SECReportResult } from "../types";

const SecReportView: React.FC = () => {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<SECReportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!ticker) return;
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const data = await analyzeSECReport(ticker);
      setReport(data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze SEC report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 fade-in">
      <div className="bg-[#0B1221] border border-blue-900/30 rounded-xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <div className="w-2 h-6 bg-blue-500"></div>
          SEC Report Analysis
        </h2>
        <p className="text-slate-400 text-sm mb-6">Deep fundamental analysis of SEC filings for institutional asset management.</p>
        
        <div className="flex gap-4 max-w-xl relative z-10">
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="ENTER TICKER (e.g. AAPL)"
            className="flex-1 bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 font-mono"
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !ticker}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-bold transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ANALYZING...
              </>
            ) : (
              'ANALYZE'
            )}
          </button>
        </div>
        {error && <div className="mt-4 text-red-400 text-sm bg-red-900/20 p-3 rounded border border-red-900/50">{error}</div>}
      </div>

      {report && (
        <div className="space-y-6 fade-in">
          {/* Executive Summary */}
          <div className="bg-[#0B1221] border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-2">Executive Summary</h3>
              <div className={`px-4 py-1 rounded font-bold text-sm ${
                report.executiveSummary.rating === 'Strong Buy' || report.executiveSummary.rating === 'Buy' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                report.executiveSummary.rating === 'Hold' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {report.executiveSummary.rating}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-xs text-slate-500 uppercase font-bold mb-1">Investment Thesis</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{report.executiveSummary.thesis}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-900/10 p-4 rounded border border-emerald-900/30">
                  <h4 className="text-xs text-emerald-500 uppercase font-bold mb-2">Bull Case</h4>
                  <p className="text-slate-300 text-sm">{report.executiveSummary.bullCase}</p>
                </div>
                <div className="bg-red-900/10 p-4 rounded border border-red-900/30">
                  <h4 className="text-xs text-red-500 uppercase font-bold mb-2">Bear Case</h4>
                  <p className="text-slate-300 text-sm">{report.executiveSummary.bearCase}</p>
                </div>
              </div>
              <div>
                <h4 className="text-xs text-slate-500 uppercase font-bold mb-2">Key Catalysts (6-24 Months)</h4>
                <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                  {report.executiveSummary.catalysts.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Business Model */}
            <div className="bg-[#0B1221] border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Business Model</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs text-slate-500 uppercase font-bold mb-1">Revenue Streams</h4>
                  <div className="flex flex-wrap gap-2">
                    {report.businessModel.revenueStreams.map((s, i) => (
                      <span key={i} className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs text-slate-500 uppercase font-bold mb-1">Competitive Moat</h4>
                  <p className="text-slate-300 text-sm">{report.businessModel.moat}</p>
                </div>
                <div>
                  <h4 className="text-xs text-slate-500 uppercase font-bold mb-1">Positioning & TAM</h4>
                  <p className="text-slate-300 text-sm mb-2">{report.businessModel.positioning}</p>
                  <p className="text-blue-400 text-sm font-mono">{report.businessModel.tam}</p>
                </div>
              </div>
            </div>

            {/* Financials */}
            <div className="bg-[#0B1221] border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Financial Deep Dive</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-xs text-slate-500 uppercase font-bold mb-1">Revenue Growth</h4>
                  <p className="text-slate-300 text-sm">{report.financials.revenueGrowth}</p>
                </div>
                <div>
                  <h4 className="text-xs text-slate-500 uppercase font-bold mb-1">Margins (Gross / Op)</h4>
                  <p className="text-slate-300 text-sm">{report.financials.grossMargin} / {report.financials.operatingMargin}</p>
                </div>
                <div>
                  <h4 className="text-xs text-slate-500 uppercase font-bold mb-1">FCF & ROIC</h4>
                  <p className="text-slate-300 text-sm">{report.financials.fcf} | {report.financials.roic}</p>
                </div>
                <div>
                  <h4 className="text-xs text-slate-500 uppercase font-bold mb-1">Debt & Allocation</h4>
                  <p className="text-slate-300 text-sm">{report.financials.debt}</p>
                  <p className="text-slate-300 text-sm mt-1">{report.financials.capitalAllocation}</p>
                </div>
              </div>
              <div className="bg-red-900/10 p-3 rounded border border-red-900/30">
                <h4 className="text-xs text-red-500 uppercase font-bold mb-1">Red Flags & Risks</h4>
                <p className="text-slate-300 text-sm mb-1">Quality: {report.financials.earningsQuality}</p>
                <p className="text-slate-300 text-sm mb-1">Rev Risks: {report.financials.revenueRisks}</p>
                <ul className="list-disc list-inside text-slate-300 text-xs mt-2">
                  {report.financials.redFlags.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Management */}
            <div className="bg-[#0B1221] border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Management</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs text-slate-500 uppercase font-bold mb-1">Incentives</h4>
                  <p className="text-slate-300 text-sm">{report.management.incentives}</p>
                </div>
                <div>
                  <h4 className="text-xs text-slate-500 uppercase font-bold mb-1">Insider Activity</h4>
                  <p className="text-slate-300 text-sm">{report.management.insiderActivity}</p>
                </div>
                <div>
                  <h4 className="text-xs text-slate-500 uppercase font-bold mb-1">Capital Discipline</h4>
                  <p className="text-slate-300 text-sm">{report.management.capitalDiscipline}</p>
                </div>
                <div>
                  <h4 className="text-xs text-slate-500 uppercase font-bold mb-1">Gov Risks</h4>
                  <ul className="list-disc list-inside text-slate-300 text-xs">
                    {report.management.governanceRisks.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            {/* Risks */}
            <div className="bg-[#0B1221] border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Risk Analysis</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs text-slate-500 uppercase font-bold mb-1">Regulatory & Legal</h4>
                  <p className="text-slate-300 text-sm">{report.risks.regulatory}</p>
                  <p className="text-slate-300 text-sm mt-1">{report.risks.legal}</p>
                </div>
                <div>
                  <h4 className="text-xs text-slate-500 uppercase font-bold mb-1">Competitive & Tech</h4>
                  <p className="text-slate-300 text-sm">{report.risks.competitive}</p>
                  <p className="text-slate-300 text-sm mt-1">{report.risks.technological}</p>
                </div>
                <div>
                  <h4 className="text-xs text-slate-500 uppercase font-bold mb-1">Macro & Supply</h4>
                  <p className="text-slate-300 text-sm">{report.risks.macroeconomic}</p>
                  <p className="text-slate-300 text-sm mt-1">{report.risks.supplyChain}</p>
                </div>
              </div>
            </div>

            {/* Valuation */}
            <div className="bg-[#0B1221] border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Valuation</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded">
                  <span className="text-xs text-slate-400 uppercase font-bold">Conclusion</span>
                  <span className={`text-sm font-bold ${report.valuation.conclusion === 'Undervalued' ? 'text-emerald-400' : report.valuation.conclusion === 'Overvalued' ? 'text-red-400' : 'text-blue-400'}`}>{report.valuation.conclusion}</span>
                </div>
                <div>
                  <h4 className="text-xs text-slate-500 uppercase font-bold mb-1">DCF & SOTP</h4>
                  <p className="text-slate-300 text-sm">{report.valuation.dcf}</p>
                  <p className="text-slate-300 text-sm mt-1">{report.valuation.sotp}</p>
                </div>
                <div>
                  <h4 className="text-xs text-slate-500 uppercase font-bold mb-1">Multiples</h4>
                  <p className="text-slate-300 text-sm">EV/EBITDA: {report.valuation.evEbitda}</p>
                  <p className="text-slate-300 text-sm">P/E: {report.valuation.peRatio}</p>
                  <p className="text-slate-300 text-sm">Comps: {report.valuation.comparables}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shareholders */}
          <div className="bg-[#0B1221] border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Shareholders & Ownership</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                  <h4 className="text-xs text-slate-400 uppercase font-bold mb-1">Institutional Ownership</h4>
                  <p className="text-2xl font-mono font-bold text-white">{report.shareholders?.institutionalOwnership || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-xs text-slate-500 uppercase font-bold mb-1">Recent Changes</h4>
                  <p className="text-slate-300 text-sm">{report.shareholders?.recentChanges || 'N/A'}</p>
                </div>
              </div>
              <div className="md:col-span-2">
                <h4 className="text-xs text-slate-500 uppercase font-bold mb-3">Top Shareholders</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-2 rounded-tl-lg">Name</th>
                        <th className="px-4 py-2">Percentage</th>
                        <th className="px-4 py-2 rounded-tr-lg">Shares</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.shareholders?.topShareholders?.map((sh, i) => (
                        <tr key={i} className="border-b border-slate-800/50 last:border-0">
                          <td className="px-4 py-3 font-medium text-white">{sh.name}</td>
                          <td className="px-4 py-3 font-mono text-blue-400">{sh.percentage}</td>
                          <td className="px-4 py-3 font-mono">{sh.shares}</td>
                        </tr>
                      ))}
                      {(!report.shareholders?.topShareholders || report.shareholders.topShareholders.length === 0) && (
                        <tr>
                          <td colSpan={3} className="px-4 py-4 text-center text-slate-500 italic">No shareholder data available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Hidden Insights & Conclusion */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0B1221] border border-purple-900/30 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              <h3 className="text-lg font-bold text-purple-400 mb-4 border-b border-purple-900/30 pb-2">Hidden Insights</h3>
              <div className="space-y-3 relative z-10">
                <div>
                  <h4 className="text-xs text-purple-300/70 uppercase font-bold mb-1">Footnotes & Accounting</h4>
                  <p className="text-slate-300 text-sm">{report.hiddenInsights.footnotes}</p>
                  <p className="text-slate-300 text-sm mt-1">{report.hiddenInsights.accountingChanges}</p>
                </div>
                <div>
                  <h4 className="text-xs text-purple-300/70 uppercase font-bold mb-1">Anomalies & Off-Balance</h4>
                  <p className="text-slate-300 text-sm">{report.hiddenInsights.segmentAnomalies}</p>
                  <p className="text-slate-300 text-sm mt-1">{report.hiddenInsights.offBalanceSheet}</p>
                </div>
                <div>
                  <h4 className="text-xs text-purple-300/70 uppercase font-bold mb-1">Stock Comp Impact</h4>
                  <p className="text-slate-300 text-sm">{report.hiddenInsights.stockComp}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#0B1221] border border-blue-900/30 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl -mr-10 -mb-10 pointer-events-none"></div>
              <h3 className="text-lg font-bold text-blue-400 mb-4 border-b border-blue-900/30 pb-2">Investment Conclusion</h3>
              <div className="space-y-4 relative z-10">
                <div className="bg-blue-900/20 p-4 rounded border border-blue-900/50 text-center">
                  <h4 className="text-xs text-blue-300/70 uppercase font-bold mb-1">Target Price Estimate</h4>
                  <p className="text-2xl font-mono font-bold text-white">{report.conclusion.targetPrice}</p>
                </div>
                <div>
                  <h4 className="text-xs text-blue-300/70 uppercase font-bold mb-1">Scenario Analysis</h4>
                  <p className="text-slate-300 text-sm">{report.conclusion.scenarioAnalysis}</p>
                </div>
                <div>
                  <h4 className="text-xs text-blue-300/70 uppercase font-bold mb-2">Metrics to Monitor</h4>
                  <div className="flex flex-wrap gap-2">
                    {report.conclusion.metricsToMonitor.map((m, i) => (
                      <span key={i} className="bg-blue-900/30 border border-blue-800/50 text-blue-200 text-xs px-2 py-1 rounded">{m}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecReportView;
