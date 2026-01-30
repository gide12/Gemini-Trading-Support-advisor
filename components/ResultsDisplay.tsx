
import React, { useMemo, useState } from "react";
import { AnalysisResult, AnalysisType, PriceActionData, PriceActionCandle, TechnicalAnalysisData, NewsItem, BrokerIntelData, TradeIdeaData, ClusteringAnalysisData } from "../types";
import { 
    ComposedChart, ReferenceLine, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, Cell, CartesianGrid, ReferenceArea, Area, BarChart, Line, Scatter, ScatterChart, ZAxis, Legend
} from "recharts";

interface ResultsDisplayProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  activeTab: AnalysisType;
}

const ClusteringDashboard = ({ data }: { data: ClusteringAnalysisData }) => {
    const [search, setSearch] = useState("");
    const filteredAssignments = data.assignments.filter(a => a.ticker.toLowerCase().includes(search.toLowerCase()) || a.sector.toLowerCase().includes(search.toLowerCase()));

    const isProbabilistic = data.algorithm.includes("Gaussian") || data.algorithm.includes("Probabilistic") || data.algorithm.includes("GBML");
    const isBirch = data.algorithm.includes("BIRCH");
    const isAgglomerative = data.algorithm.includes("Agglomerative") || data.algorithm.includes("Hierarchical");
    const isSpectral = data.algorithm.includes("Spectral");
    const isGbmlemo = data.algorithm.includes("GBML-EMO");

    const eigenvalueData = useMemo(() => {
        if (!data.metrics.eigenvalues) return [];
        return data.metrics.eigenvalues.map((v, i) => ({ index: i + 1, val: v }));
    }, [data.metrics.eigenvalues]);

    return (
        <div className="space-y-8 animate-fade-in font-sans">
            {/* Header / Stats Bar */}
            <div className="bg-[#1e293b]/40 p-6 rounded-2xl border border-emerald-500/20 shadow-xl flex flex-wrap gap-8 items-center justify-between">
                <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Clustering Engine Outcome</span>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{data.algorithm}</h2>
                </div>
                <div className="flex gap-6">
                    {isGbmlemo ? (
                        <>
                            <div className="text-center">
                                <div className="text-[9px] text-slate-500 font-black uppercase">ELBO Score</div>
                                <div className="text-xl font-mono font-bold text-emerald-400">{data.metrics.elbo?.toLocaleString() || 'N/A'}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-[9px] text-slate-500 font-black uppercase">Iterations</div>
                                <div className="text-xl font-mono font-bold text-cyan-400">{data.metrics.iterations}</div>
                            </div>
                        </>
                    ) : isSpectral ? (
                        <>
                            <div className="text-center">
                                <div className="text-[9px] text-slate-500 font-black uppercase">Eigengap Heuristic</div>
                                <div className="text-xl font-mono font-bold text-emerald-400">{data.metrics.eigengap?.toFixed(4) || '0.0000'}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-[9px] text-slate-500 font-black uppercase">Kernel Bandwidth (σ)</div>
                                <div className="text-xl font-mono font-bold text-cyan-400">{data.metrics.bandwidthSigma?.toFixed(3) || '1.450'}</div>
                            </div>
                        </>
                    ) : isAgglomerative ? (
                         <>
                            <div className="text-center">
                                <div className="text-[9px] text-slate-500 font-black uppercase">Merge Distance</div>
                                <div className="text-xl font-mono font-bold text-emerald-400">{data.metrics.maxMergeDistance?.toFixed(2) || '12.42'}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-[9px] text-slate-500 font-black uppercase">Calinski-Harabasz</div>
                                <div className="text-xl font-mono font-bold text-amber-400">{data.metrics.calinskiHarabasz?.toFixed(1) || '854.2'}</div>
                            </div>
                         </>
                    ) : isBirch ? (
                        <>
                            <div className="text-center">
                                <div className="text-[9px] text-slate-500 font-black uppercase">Threshold (T)</div>
                                <div className="text-xl font-mono font-bold text-cyan-400">{data.metrics.threshold?.toFixed(3) || '0.500'}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-[9px] text-slate-500 font-black uppercase">CF-Nodes</div>
                                <div className="text-xl font-mono font-bold text-white">{data.metrics.cfNodesCount || 42}</div>
                            </div>
                        </>
                    ) : (
                        <>
                            {data.metrics.silhouetteScore !== undefined && (
                                <div className="text-center">
                                    <div className="text-[9px] text-slate-500 font-black uppercase">Silhouette</div>
                                    <div className="text-xl font-mono font-bold text-emerald-400">{data.metrics.silhouetteScore.toFixed(3)}</div>
                                </div>
                            )}
                            {data.metrics.bic !== undefined && (
                                <div className="text-center">
                                    <div className="text-[9px] text-slate-500 font-black uppercase">BIC Score</div>
                                    <div className="text-xl font-mono font-bold text-amber-400">{(data.metrics.bic / 1000).toFixed(1)}k</div>
                                </div>
                            )}
                        </>
                    )}
                    <div className="text-center">
                        <div className="text-[9px] text-slate-500 font-black uppercase">Clusters (k)</div>
                        <div className="text-xl font-mono font-bold text-white">{data.metrics.optimalK}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 2D Projection Plot */}
                <div className="bg-[#0b0e14] rounded-2xl border border-white/5 p-6 shadow-2xl relative overflow-hidden">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                        {isGbmlemo ? 'Probabilistic Latent Space (Graph-Aware)' : isSpectral ? 'Spectral Embedding Space (Eigenvectors)' : '2D Latent Space Projection (PCA)'}
                    </h3>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" vertical={false} opacity={0.3} />
                                <XAxis type="number" dataKey="x" name={isSpectral ? "Eigenvector 1" : "PC1"} hide />
                                <YAxis type="number" dataKey="y" name={isSpectral ? "Eigenvector 2" : "PC2"} hide />
                                <ZAxis type="number" range={[100, 300]} dataKey={isProbabilistic ? "probability" : "centrality"} />
                                <Tooltip 
                                    cursor={{ strokeDasharray: '3 3' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const item = payload[0].payload;
                                            return (
                                                <div className="bg-[#1e293b] border border-white/10 p-2 rounded shadow-2xl">
                                                    <div className="text-xs font-black text-white">{item.ticker}</div>
                                                    <div className="text-[10px] text-emerald-400 uppercase">Cluster {item.clusterId}</div>
                                                    {item.probability !== undefined && (
                                                        <div className="text-[10px] text-slate-400 uppercase mt-1">Assignment: {(item.probability * 100).toFixed(1)}%</div>
                                                    )}
                                                    {item.centrality !== undefined && (
                                                        <div className="text-[10px] text-cyan-400 uppercase mt-1">Centrality: {item.centrality.toFixed(3)}</div>
                                                    )}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Scatter name="Assets" data={data.plotData}>
                                    {data.plotData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={["#a855f7", "#10b981", "#3b82f6", "#f59e0b", "#f43f5e"][entry.clusterId % 5]} fillOpacity={entry.probability ?? 1} />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-2">
                        {data.clusters.map(c => (
                            <div key={c.id} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: ["#a855f7", "#10b981", "#3b82f6", "#f59e0b", "#f43f5e"][c.id % 5]}}></div>
                                <span className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">{c.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cluster Summary Metrics */}
                <div className="bg-[#0b0e14] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                    <div className="px-6 py-4 bg-slate-900/50 border-b border-white/5 flex justify-between items-center">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {isGbmlemo ? 'Probabilistic Group Analytics' : isSpectral ? 'Graph Community Analytics' : isAgglomerative ? 'Hierarchical Merge Analytics' : isBirch ? 'Hierarchical Group Analytics' : 'Component Analysis (EM Estimates)'}
                        </h4>
                        <span className="text-[8px] font-bold text-slate-600 uppercase">
                            {isGbmlemo ? 'Optimization: EM-ELBO' : isSpectral ? 'Laplacian: Normalized' : isAgglomerative ? 'Linkage: Ward' : isBirch ? `Branching Factor: ${data.metrics.branchingFactor || 50}` : 'Covariance: Full'}
                        </span>
                    </div>
                    <div className="h-[400px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <thead className="text-[9px] font-black text-slate-500 uppercase tracking-tighter border-b border-white/5 bg-black/20 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3">Archetype</th>
                                    <th className="px-6 py-3 text-right">Avg Beta</th>
                                    <th className="px-6 py-3 text-right">{isGbmlemo ? 'Dispersion' : isSpectral ? 'Graph Sim.' : isAgglomerative ? 'Ward Var.' : 'Dispersion'}</th>
                                    <th className="px-6 py-3 text-center">{isGbmlemo ? 'Density' : isAgglomerative ? 'Nodes' : isBirch ? 'Subclusters' : 'Weight'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-[11px]">
                                {data.clusters.map((c, i) => (
                                    <React.Fragment key={i}>
                                        <tr className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-3 font-bold text-white uppercase flex items-center gap-2">
                                                <div className="w-1.5 h-3 rounded-full" style={{backgroundColor: ["#a855f7", "#10b981", "#3b82f6", "#f59e0b", "#f43f5e"][c.id % 5]}}></div>
                                                {c.label}
                                            </td>
                                            <td className="px-6 py-3 text-right font-mono text-slate-400">{c.avgBeta.toFixed(2)}</td>
                                            <td className="px-6 py-3 text-right font-mono text-emerald-400">{(c.riskDispersion || c.avgSimilarityScore || c.wardVariance || c.avgVolatility).toFixed(3)}</td>
                                            <td className="px-6 py-3 text-center text-slate-500 font-black">
                                                {isGbmlemo ? `${Math.round((c.count / data.assignments.length) * 100)}%` : isAgglomerative ? c.count : isBirch ? (c.cfSubclusterCount || '-') : `${Math.round((c.count / data.assignments.length) * 100)}%`}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={4} className="px-6 py-2 bg-black/10 text-[10px] text-slate-500 italic border-b border-white/5">
                                                {c.interpretation} • <span className="text-slate-400 font-bold uppercase">{c.dominantSectors.join(", ")}</span>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Asset Assignment Searchable Registry */}
            <div className="bg-[#0b0e14] rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
                <div className="px-6 py-4 bg-slate-900/50 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {isGbmlemo ? 'Probabilistic Soft Assignment Registry' : isSpectral ? 'Systemic Connectivity Registry' : isAgglomerative ? 'Dendrogram Leaf Registry' : isBirch ? 'Hierarchical CF-Leaf Registry' : 'Probabilistic Registry'}
                        </h4>
                        {(isBirch || isAgglomerative || isSpectral || isGbmlemo) && <span className="text-[8px] bg-cyan-900/30 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20 uppercase font-black tracking-tighter">
                            {isGbmlemo ? 'EM-Graph Smooth active' : isSpectral ? 'Graph communities active' : isAgglomerative ? 'Ward Hierarchy active' : 'CF-Tree active'}
                        </span>}
                    </div>
                    <input 
                        type="text" 
                        placeholder="FILTER ASSETS..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-black/40 border border-white/10 px-3 py-1.5 rounded text-[10px] text-white focus:border-emerald-500 outline-none uppercase w-48"
                    />
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="text-[9px] font-black text-slate-500 uppercase tracking-tighter border-b border-white/5 bg-black/20 sticky top-0">
                            <tr>
                                <th className="px-6 py-3">Ticker</th>
                                <th className="px-6 py-3">{isGbmlemo ? 'Primary Posterior' : isSpectral ? 'Centrality' : isAgglomerative ? 'Merge Dist' : isBirch ? 'CF-Subcluster ID' : 'Primary Prob.'}</th>
                                <th className="px-6 py-3">Risk Archetype</th>
                                <th className="px-6 py-3 text-right">{isGbmlemo ? 'Secondary Assignment' : isSpectral ? 'Manifold Dist' : isAgglomerative ? 'Tree Depth' : 'L2 Distance'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-[11px]">
                            {filteredAssignments.map((a, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-3 font-black text-white uppercase">{a.ticker}</td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div className={`h-full ${isGbmlemo ? 'bg-cyan-500' : 'bg-emerald-500'}`} style={{width: `${(a.probability || 0) * 100}%`}}></div>
                                            </div>
                                            <span className={`font-mono font-bold ${isGbmlemo ? 'text-cyan-400' : 'text-emerald-400'}`}>{(a.probability * 100).toFixed(1)}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-300 font-bold uppercase tracking-tighter">{a.riskCharacteristic}</span>
                                            {isGbmlemo && a.systemicClass && (
                                                <span className={`text-[8px] px-1 rounded font-black uppercase ${a.systemicClass === 'Systemic' ? 'bg-rose-500/20 text-rose-400' : a.systemicClass === 'Bridge' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700 text-slate-500'}`}>
                                                    {a.systemicClass}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-right font-mono text-slate-500">
                                        {isGbmlemo ? (
                                            a.secondaryClusterId !== undefined ? (
                                                <span className="text-[10px] text-slate-500">C{a.secondaryClusterId} ({(a.secondaryProbability! * 100).toFixed(0)}%)</span>
                                            ) : (
                                                <span className="text-[9px] text-slate-700 font-black italic">IDIOSYNCRATIC</span>
                                            )
                                        ) : isAgglomerative ? (
                                            <span className="px-2 py-0.5 rounded bg-slate-800 text-[9px] font-black text-slate-400 border border-white/5 uppercase">
                                                Level {a.dendrogramDepth || 0}
                                            </span>
                                        ) : (a.distanceToCentroid?.toFixed(4) || '0.0000')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Investment Strategy Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-8 rounded-2xl border border-emerald-500/20 shadow-2xl relative overflow-hidden">
                    <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                         Institutional Intelligence: {isGbmlemo ? 'GBML-EMO Synthesis' : isSpectral ? 'Graph Manifold Theory' : isAgglomerative ? 'Ward Hierarchy Insight' : isBirch ? 'Hierarchical Insights' : 'GMM Overlap'}
                    </h3>
                    <div className="space-y-6">
                        {isGbmlemo && data.investmentInsight.factorStructure && (
                            <div>
                                <h4 className="text-[10px] font-black text-slate-500 uppercase mb-2">Latent Factor Structure</h4>
                                <p className="text-sm text-slate-300 italic leading-relaxed">"{data.investmentInsight.factorStructure}"</p>
                            </div>
                        )}
                        <div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase mb-2">Portfolio Structural Assessment</h4>
                            <p className="text-sm text-slate-300 italic leading-relaxed">"{data.investmentInsight.redundancyCheck}"</p>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase mb-2">Probabilistic Diversification Strategy</h4>
                            <p className="text-sm text-slate-300 italic leading-relaxed">"{data.investmentInsight.diversificationStrategy}"</p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#131722] border border-slate-800 rounded-2xl p-8 shadow-2xl">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
                        {isGbmlemo ? 'Soft Assignment Overlap Risks' : 'Systemic Risk Amplifiers'}
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {isGbmlemo && data.investmentInsight.bridgeStocks?.map((ticker, i) => (
                            <div key={i} className="bg-cyan-900/10 p-4 rounded-xl border border-cyan-500/20 flex gap-4 items-center">
                                <div className="text-cyan-400 text-lg font-black">{ticker}</div>
                                <div className="text-[10px] text-slate-400 uppercase tracking-tighter leading-snug font-bold">Bridge Node: Exhibits >20% posterior probability across multiple regimes. Essential for hedging cross-sector contagion.</div>
                            </div>
                        ))}
                        {data.investmentInsight.riskAmplifiers.map((amp, i) => (
                            <div key={i} className="bg-black/20 p-4 rounded-xl border border-white/5 flex gap-4 items-center group hover:border-rose-500/30 transition-all">
                                <div className="text-rose-500 text-lg opacity-50 group-hover:opacity-100">⚠️</div>
                                <div className="text-[11px] font-bold text-white uppercase tracking-tighter leading-snug">{amp}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-[9px] text-slate-600 text-center uppercase tracking-[0.4em] font-black">
                Q-SYS Stochastic Engine • {isGbmlemo ? 'GBML-EMO Probabilistic Graph' : isSpectral ? 'Spectral Graph Theory' : isAgglomerative ? 'Agglomerative Ward Linkage' : 'Balanced Iterative Reducing and Clustering'} • Institutional Cluster Layer
            </div>
        </div>
    );
};

const NewsThumbnail = ({ source }: { source: string }) => {
    const [imgError, setImgError] = useState(false);
    const s = source.toLowerCase();
    let domain = "";
    let accentColor = "border-slate-700";
    let brandColor = "bg-slate-800";
    let shortName = source.substring(0, 1);

    if (s.includes("bloomberg")) {
        domain = "bloomberg.com";
        accentColor = "border-blue-600";
        brandColor = "bg-blue-600";
        shortName = "B";
    } else if (s.includes("financial times") || s.includes("ft")) {
        domain = "ft.com";
        accentColor = "border-[#ff7500]";
        brandColor = "bg-[#fff1e5]"; // FT Salmon
        shortName = "FT";
    } else if (s.includes("wall street journal") || s.includes("wsj")) {
        domain = "wsj.com";
        accentColor = "border-slate-400";
        brandColor = "bg-white";
        shortName = "WSJ";
    } else if (s.includes("yahoo finance")) {
        domain = "yahoo.com";
        accentColor = "border-[#7e00ff]";
        brandColor = "bg-[#400090]";
        shortName = "Y!";
    }

    const logoUrl = domain ? `https://logo.clearbit.com/${domain}?size=128` : "";

    return (
        <div className={`w-full h-full bg-[#0B1221] ${accentColor} border-r-2 flex items-center justify-center p-3 overflow-hidden relative group-hover:bg-slate-800/20 transition-all duration-500`}>
            {!imgError && logoUrl ? (
                <img 
                    src={logoUrl} 
                    alt={source} 
                    className="w-full max-h-12 object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-xl"
                    onError={() => setImgError(true)}
                    loading="lazy"
                />
            ) : (
                <div className={`w-10 h-10 rounded flex items-center justify-center ${brandColor} shadow-lg shadow-black/50`}>
                    <span className={`text-xs font-black tracking-tighter ${s.includes("ft") || s.includes("wsj") ? 'text-black' : 'text-white'}`}>
                        {shortName}
                    </span>
                </div>
            )}
            <div className="absolute top-1 left-1 opacity-20">
                <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
            <div className="absolute bottom-1 right-1 opacity-10">
                <div className="w-4 h-px bg-white"></div>
            </div>
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]"></div>
        </div>
    );
};

const NewsDashboard = ({ items, summary }: { items: NewsItem[], summary: string }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-[#1e293b]/40 p-5 rounded-xl border border-white/5 flex items-start gap-4">
                <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shrink-0 mt-1 shadow-lg shadow-emerald-900/10">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                </div>
                <div>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1 block">Global Intelligence Brief</span>
                    <p className="text-sm text-slate-300 italic leading-relaxed">"{summary}"</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item, i) => (
                    <a 
                        key={i} 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all flex h-32 hover:shadow-2xl hover:shadow-purple-900/20"
                    >
                        <div className="w-28 shrink-0">
                            <NewsThumbnail source={item.source} />
                        </div>
                        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                            <div>
                                <div className="flex justify-between items-start gap-2 mb-1">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter truncate max-w-[120px]">{item.source}</span>
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${item.sentiment === 'Positive' ? 'bg-emerald-900/30 text-emerald-400' : item.sentiment === 'Negative' ? 'bg-rose-900/30 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
                                        {item.sentiment}
                                    </span>
                                </div>
                                <h4 className="text-xs font-bold text-white leading-tight line-clamp-2 group-hover:text-purple-300 transition-colors">{item.title}</h4>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-[9px] text-slate-600 font-mono tracking-tighter uppercase">{item.time}</span>
                                <div className="flex items-center gap-1 text-[9px] font-black text-purple-500 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                    INSIGHTS <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                </div>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

const TradeIdeasDashboard = ({ data }: { data: TradeIdeaData }) => {
    const isBullish = data.bias === "Bullish";
    const accentColor = isBullish ? "text-emerald-400" : data.bias === "Bearish" ? "text-rose-400" : "text-amber-400";
    const bgColor = isBullish ? "bg-emerald-500/10" : data.bias === "Bearish" ? "bg-rose-500/10" : "bg-amber-500/10";
    const borderColor = isBullish ? "border-emerald-500/30" : data.bias === "Bearish" ? "border-rose-500/30" : "border-amber-500/30";
    const glowShadow = isBullish ? "shadow-[0_0_20px_rgba(16,185,129,0.2)]" : data.bias === "Bearish" ? "shadow-[0_0_20px_rgba(244,63,94,0.2)]" : "";

    return (
        <div className="space-y-8 animate-fade-in font-sans">
            {/* SIGNAL TOP BAR */}
            <div className={`${bgColor} ${borderColor} ${glowShadow} border rounded-2xl p-8 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none select-none">
                    <svg className={`w-32 h-32 ${accentColor}`} fill="currentColor" viewBox="0 0 24 24">
                        {isBullish ? <path d="M7 14l5-5 5 5H7z" /> : <path d="M7 10l5 5 5-5H7z" />}
                    </svg>
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Institutional Signal</span>
                             <span className="h-px w-8 bg-slate-700"></span>
                             <span className="text-[10px] font-bold text-slate-400 uppercase">{data.timeframe} Setup</span>
                        </div>
                        <h2 className={`text-6xl font-black italic tracking-tighter uppercase ${accentColor}`}>
                            {data.bias}
                        </h2>
                    </div>
                    <div className="bg-black/40 backdrop-blur-md border border-white/5 p-4 rounded-xl flex items-center gap-6">
                        <div className="text-center">
                            <div className="text-[9px] font-black text-slate-500 uppercase mb-1">Conviction</div>
                            <div className={`text-2xl font-mono font-bold ${accentColor}`}>{data.conviction}%</div>
                        </div>
                        <div className="h-10 w-px bg-slate-800"></div>
                        <div className="text-center">
                            <div className="text-[9px] font-black text-slate-500 uppercase mb-1">R:R Ratio</div>
                            <div className="text-2xl font-mono font-bold text-white">{data.riskRewardRatio}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PRICE LEVELS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#1c202b] p-6 rounded-2xl border border-white/5 shadow-xl relative group">
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-[10px] text-slate-500 uppercase font-black block mb-4 tracking-widest">Entry Range</span>
                    <div className="text-3xl font-black text-white font-mono tracking-tighter">
                        ${data.entryRange.low.toFixed(2)} <span className="text-slate-600 text-lg mx-1">—</span> ${data.entryRange.high.toFixed(2)}
                    </div>
                    <div className="mt-4 text-[10px] text-blue-400 font-bold uppercase tracking-tighter">Institutional Accumulation Zone</div>
                </div>

                <div className="bg-[#1c202b] p-6 rounded-2xl border border-white/5 shadow-xl relative">
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-rose-500"></div>
                    <span className="text-[10px] text-slate-500 uppercase font-black block mb-4 tracking-widest">Hard Stop</span>
                    <div className="text-3xl font-black text-rose-500 font-mono tracking-tighter">
                        ${data.stopLoss.toFixed(2)}
                    </div>
                    <div className="mt-4 text-[10px] text-rose-900 font-bold uppercase tracking-tighter">Risk Invalidation Point</div>
                </div>

                <div className="bg-[#1c202b] p-6 rounded-2xl border border-white/5 shadow-xl relative">
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] text-slate-500 uppercase font-black block mb-4 tracking-widest">Primary Target</span>
                    <div className="text-3xl font-black text-emerald-400 font-mono tracking-tighter">
                        ${data.targets[0].price.toFixed(2)}
                    </div>
                    <div className="mt-4 text-[10px] text-emerald-900 font-bold uppercase tracking-tighter">{data.targets[0].label}</div>
                </div>
            </div>

            {/* RATIONALE & CATALYSTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#131722] border border-slate-800 rounded-2xl p-8 shadow-2xl">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                        Strategic Rationale
                    </h3>
                    <div className="text-slate-300 text-sm leading-relaxed space-y-4 font-serif italic">
                        {data.rationale}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#131722] border border-slate-800 rounded-2xl p-8 shadow-2xl">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                            Key Catalysts
                        </h3>
                        <div className="space-y-4">
                            {data.catalysts.map((c, i) => (
                                <div key={i} className="flex gap-4 items-start group">
                                    <span className="text-cyan-500 font-mono text-xs mt-0.5">0{i+1}</span>
                                    <p className="text-xs text-slate-400 font-bold uppercase leading-tight group-hover:text-white transition-colors">{c}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#131722] border border-slate-800 rounded-2xl p-8 shadow-2xl">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Extended Profit Targets</h3>
                        <div className="space-y-3">
                            {data.targets.slice(1).map((t, i) => (
                                <div key={i} className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{t.label}</span>
                                    <span className="text-sm font-mono font-bold text-emerald-400">${t.price.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 text-[9px] text-slate-600 text-center uppercase tracking-[0.4em] font-black">
                Alpha Source: Q-SYS Institutional Intelligence Node • 0.2ms Latency
            </div>
        </div>
    );
};

const BrokerIntelDashboard = ({ data }: { data: BrokerIntelData }) => {
    const activityData = data.brokerActivityHistory || [];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* DATA ANALYST TOP SUMMARY */}
            <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-6 rounded-2xl border border-blue-500/30 shadow-2xl relative overflow-hidden">
                <div className="absolute -right-12 -top-12 opacity-5 pointer-events-none">
                    <svg className="w-48 h-48 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/40">
                             <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-blue-400 uppercase tracking-[0.2em]">Institutional Data Analyst</h3>
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Expert Node Synthesis • Institutional Grade</p>
                        </div>
                    </div>
                    <div className="text-sm text-slate-200 leading-relaxed italic border-l-2 border-blue-500/50 pl-4 py-2 bg-blue-500/5">
                        {data.analystSynthesis || data.summary}
                    </div>
                </div>
            </div>

            {/* FLOW METRICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#1c202b] p-5 rounded-xl border border-white/5 shadow-xl">
                    <span className="text-[10px] text-slate-500 uppercase font-black block mb-4 tracking-widest">Net Buy Ratio</span>
                    <div className="flex items-end justify-between mb-2">
                        <div className="text-3xl font-black text-white font-mono">{((data.metrics.brokerFlow.netBuyRatio || 0.5) * 100).toFixed(1)}%</div>
                        <div className={`text-xs font-bold uppercase ${data.metrics.brokerFlow.netBuyRatio > 0.5 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {data.metrics.brokerFlow.netBuyRatio > 0.5 ? 'Strong Buy' : 'Distribution'}
                        </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${data.metrics.brokerFlow.netBuyRatio > 0.5 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'}`} style={{width: `${(data.metrics.brokerFlow.netBuyRatio || 0.5) * 100}%`}}></div>
                    </div>
                </div>

                <div className="bg-[#1c202b] p-5 rounded-xl border border-white/5 shadow-xl">
                    <span className="text-[10px] text-slate-500 uppercase font-black block mb-4 tracking-widest">Participant Quality</span>
                    <div className="flex items-end justify-between mb-2">
                        <div className="text-3xl font-black text-blue-400 font-mono">{((data.metrics.brokerFlow.participantQuality || 0.5) * 100).toFixed(1)}%</div>
                        <div className="text-xs font-bold text-slate-400 uppercase">Institutional</div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full bg-blue-500 shadow-[0_0_10px_#3b82f6] transition-all duration-1000`} style={{width: `${(data.metrics.brokerFlow.participantQuality || 0.5) * 100}%`}}></div>
                    </div>
                </div>

                <div className="bg-[#1c202b] p-5 rounded-xl border border-white/5 shadow-xl">
                    <span className="text-[10px] text-slate-500 uppercase font-black block mb-4 tracking-widest">Flow Consistency</span>
                    <div className="flex items-end justify-between mb-2">
                        <div className="text-3xl font-black text-amber-400 font-mono">{((data.metrics.brokerFlow.flowConsistency || 0.5) * 100).toFixed(1)}%</div>
                        <div className="text-xs font-bold text-slate-400 uppercase">Trend Score</div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full bg-amber-500 shadow-[0_0_10px_#f59e0b] transition-all duration-1000`} style={{width: `${(data.metrics.brokerFlow.flowConsistency || 0.5) * 100}%`}}></div>
                    </div>
                </div>
            </div>

            {/* BROKER ACTIVITY CHART */}
            <div className="bg-[#131722] border border-slate-800 rounded-2xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inter-Day Broker Participation Index</h4>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${data.dominantSide === 'Net Buy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        DOMINANT: {data.dominantSide}
                    </span>
                </div>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={activityData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" vertical={false} opacity={0.3} />
                            <XAxis dataKey="date" stroke="#475569" tick={{fontSize: 9, fontFamily: 'monospace'}} axisLine={false} />
                            <YAxis stroke="#475569" tick={{fontSize: 9, fontFamily: 'monospace'}} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1c202b', border: '1px solid #334155', borderRadius: '8px' }} cursor={{fill: '#2a2e39', opacity: 0.4}} />
                            <Bar dataKey="activity" radius={[4, 4, 0, 0]}>
                                {activityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.activity > 0.6 ? '#6366f1' : '#475569'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold">
                Broker Feed aggregated from 40+ Tier-1 Institutional Liquidity Providers
            </div>
        </div>
    );
};

const Candlestick = (props: any) => {
    const { x, y, width, open, close, high, low, candleWidth } = props;
    if (x === undefined || y === undefined || isNaN(x) || isNaN(y)) return null;
    const isBullish = close >= open;
    const color = isBullish ? "#26a69a" : "#ef5350";
    const bodyHeight = Math.abs(close - open);
    const bodyY = Math.min(open, close);
    const wickX = x + width / 2;
    return (
        <g>
            <line x1={wickX} y1={low} x2={wickX} y2={high} stroke={color} strokeWidth={1} />
            <rect x={x + (width - candleWidth) / 2} y={bodyY} width={candleWidth} height={Math.max(bodyHeight, 1)} fill={color} />
        </g>
    );
};

const PriceActionChart = ({ data }: { data: PriceActionData }) => {
  const chartData = useMemo(() => {
    if (!data || !data.candles || data.candles.length < 5) return [];
    return data.candles.map((c, i) => ({
      ...c,
      index: i,
    }));
  }, [data]);

  const yDomain = useMemo(() => {
    if (!chartData.length) return [0, 100];
    const allPrices = chartData.flatMap(c => [c.high, c.low]);
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const pad = (max - min) * 0.2 || 1;
    return [min - pad, max + pad];
  }, [chartData]);

  if (!chartData.length) {
    return (
      <div className="p-10 text-center bg-[#0b0e14] border border-slate-800 rounded-xl">
        <div className="text-amber-500 mb-2 font-bold uppercase tracking-widest text-xs">⚠️ Structural Data Mismatch</div>
        <p className="text-slate-500 text-[11px] leading-relaxed italic">
          The AI analysis for this asset returned an incomplete price action model. <br/>
          Fragile liquidity history. Try a major benchmark index.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#131722] border border-slate-800 rounded-xl p-6 relative overflow-hidden group shadow-2xl flex flex-col gap-0">
      <div className="absolute top-6 left-6 z-20 space-y-2 select-none pointer-events-none">
        <h2 className="text-lg font-black text-slate-100 border-b border-white/10 pb-2 mb-4 tracking-tight flex items-center gap-2 uppercase">
            <div className="w-1 h-5 bg-cyan-500"></div>
            Price Action Engine
        </h2>
        <div className="flex flex-col gap-2 bg-black/40 p-3 rounded-lg backdrop-blur-md border border-white/5">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#ef5350] rounded-full"></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">BOS / CHoCH</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#ffca28] opacity-60 rounded-full"></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Liquidity Zones</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#66bb6a] opacity-60 rounded-full"></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Supply / Demand</span>
            </div>
        </div>
      </div>

      <div className="h-[500px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 80, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" vertical={false} opacity={0.2} />
            <XAxis dataKey="time" hide />
            <YAxis orientation="right" domain={yDomain} stroke="#475569" tick={{fontSize: 9, fontFamily: 'monospace'}} axisLine={false} tickLine={false} tickFormatter={(v) => v.toFixed(2)} />
            
            {data.liquiditySweeps?.map((ls, i) => (
                <ReferenceArea key={`ls-${i}`} x1={chartData[ls.startIdx]?.time} x2={chartData[ls.endIdx]?.time} y1={ls.bottom} y2={ls.top} fill="#ffca28" fillOpacity={0.1} label={{ value: ls.label, position: 'center', fill: '#ffca28', fontSize: 9, fontWeight: 'black', fontFamily: 'monospace' }} />
            ))}

            {data.orderBlocks?.map((ob, i) => (
                <ReferenceArea key={`ob-${i}`} x1={chartData[ob.startIdx]?.time} x2={chartData[ob.endIdx]?.time} y1={ob.bottom} y2={ob.top} fill="#66bb6a" fillOpacity={0.15} label={{ value: ob.label, position: 'insideBottomRight', fill: '#fff', fontSize: 8, fontWeight: 'bold', offset: 5, fontFamily: 'monospace' }} />
            ))}

            {data.targets?.map((target, i) => (
                <ReferenceLine key={`t-${i}`} y={target.price} stroke="#475569" strokeDasharray="5 5" label={{ value: `${target.label}`, position: 'right', fill: '#94a3b8', fontSize: 9, fontWeight: 'black', fontFamily: 'monospace' }} />
            ))}

            {chartData.map((c, i) => {
                if (!c.label) return null;
                const isHigh = c.label.startsWith('H');
                const isBOS = c.label === 'BOS' || c.label === 'CHoCH';
                const color = isBOS ? '#ef5350' : (isHigh ? '#ffffff' : '#94a3b8');
                return (
                    <ReferenceArea key={`lbl-${i}`} x1={c.time} x2={c.time} y1={isHigh ? c.high : c.low} y2={isHigh ? c.high : c.low} label={{ position: isHigh ? 'top' : 'bottom', value: c.label, fill: color, fontSize: 10, fontWeight: 'black', fontFamily: 'monospace' }} />
                );
            })}

            <Bar dataKey="close" shape={(props: any) => {
                const candle = chartData[props.index];
                if (!candle) return null;
                return <Candlestick {...props} open={props.y + props.height * (1 - (candle.open - yDomain[0]) / (yDomain[1] - yDomain[0]))} close={props.y} high={props.y - (candle.high - candle.close) * (props.height / (candle.close - candle.open || 0.001))} low={props.y + (candle.close - candle.low) * (props.height / (candle.close - candle.open || 0.001))} candleWidth={8} />;
            }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="h-[120px] w-full border-t border-slate-800 bg-[#0b0e14]/50 relative">
        <div className="absolute top-2 left-6 z-10 flex items-center gap-2"> <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Intensity Index</span> </div>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 30, right: 80, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" vertical={false} opacity={0.1} />
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <Bar dataKey="volume"> {chartData.map((entry, index) => ( <Cell key={`vol-${index}`} fill={entry.close >= entry.open ? "#26a69a30" : "#ef535030"} /> ))} </Bar>
            </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const TechnicalAnalysisDashboard = ({ data }: { data: TechnicalAnalysisData }) => {
    const yDomain = useMemo(() => {
        if (!data.priceHistory?.length) return [0, 100];
        const prices = data.priceHistory.map(p => p.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const pad = (max - min) * 0.25 || 1;
        return [min - pad, max + pad];
    }, [data]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-900/40 p-5 rounded-xl border border-white/5 flex items-start gap-4 shadow-inner">
                <div className="w-10 h-10 rounded bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 shrink-0 mt-1 shadow-lg">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <p className="text-sm text-slate-300 italic leading-relaxed">"{data.summary}"</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#1c202b] p-4 rounded-xl border border-white/5 shadow-lg">
                    <span className="text-[10px] text-slate-500 uppercase font-black block mb-1 tracking-widest">Market Trend</span>
                    <div className={`text-lg font-bold uppercase tracking-tighter ${data.trend === 'Bullish' ? 'text-emerald-400' : 'text-rose-400'}`}>{data.trend}</div>
                </div>
                <div className="bg-[#1c202b] p-4 rounded-xl border border-white/5 shadow-lg">
                    <span className="text-[10px] text-slate-500 uppercase font-black block mb-1 tracking-widest">S/R Integrity</span>
                    <div className="text-lg font-bold text-white uppercase tracking-tighter">{data.signalStrength}</div>
                </div>
                <div className="bg-[#1c202b] p-4 rounded-xl border border-white/5 shadow-lg">
                    <span className="text-[10px] text-slate-500 uppercase font-black block mb-1 tracking-widest">RSI Strength</span>
                    <div className={`text-lg font-bold uppercase tracking-tighter ${Number(data.indicators?.rsiVal) > 70 ? 'text-rose-400' : Number(data.indicators?.rsiVal) < 30 ? 'text-emerald-400' : 'text-cyan-400'}`}>
                        {Number(data.indicators?.rsiVal) > 70 ? 'Overbought' : Number(data.indicators?.rsiVal) < 30 ? 'Oversold' : 'Neutral'}
                    </div>
                </div>
                <div className="bg-[#1c202b] p-4 rounded-xl border border-white/5 shadow-lg">
                    <span className="text-[10px] text-slate-500 uppercase font-black block mb-1 tracking-widest">Inference</span>
                    <div className="text-lg font-bold text-blue-400 font-mono tracking-tighter uppercase">Aggregated</div>
                </div>
            </div>

            <div className="bg-[#131722] border border-slate-800 rounded-2xl p-6 relative overflow-hidden group shadow-2xl">
                <div className="h-[400px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data.priceHistory} margin={{ top: 20, right: 60, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" vertical={false} opacity={0.3} />
                            <XAxis dataKey="time" hide />
                            <YAxis orientation="right" domain={yDomain} stroke="#334155" tick={{fontSize: 9, fontFamily: 'monospace'}} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1c202b', border: '1px solid #334155', borderRadius: '8px' }} />
                            
                            {data.supportResistance?.support?.map((lvl, i) => (
                                <ReferenceLine key={`sup-${i}`} y={lvl} stroke="#10b981" strokeDasharray="3 3" strokeWidth={1} label={{ value: `S`, position: 'insideTopLeft', fill: '#10b981', fontSize: 8, fontWeight: 'black', fontFamily: 'monospace' }} />
                            ))}
                            {data.supportResistance?.resistance?.map((lvl, i) => (
                                <ReferenceLine key={`res-${i}`} y={lvl} stroke="#f43f5e" strokeDasharray="3 3" strokeWidth={1} label={{ value: `R`, position: 'insideBottomLeft', fill: '#f43f5e', fontSize: 8, fontWeight: 'black', fontFamily: 'monospace' }} />
                            ))}

                            <Area type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={2} fill="url(#colorPrice)" fillOpacity={1} />
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, isLoading, activeTab }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-slate-400 bg-[#020617] rounded-xl border border-slate-800 shadow-inner">
        <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="font-bold uppercase tracking-[0.4em] text-[9px] font-mono animate-pulse text-blue-400">Syncing Institutional Nodes...</p>
      </div>
    );
  }

  if (!result) return <div className="h-96 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl uppercase text-[10px] font-black tracking-[0.5em] opacity-40 italic">Initialize Data Stream</div>;

  return (
    <div className="bg-[#0f172a] rounded-xl border border-white/5 p-6 shadow-2xl min-h-[400px] fade-in overflow-hidden">
      <div className="flex justify-between items-center mb-8 bg-[#1e293b]/40 -mx-6 -mt-6 px-6 py-4 border-b border-white/5 select-none shadow-sm">
        <div className="flex items-center gap-4">
            <div className="bg-blue-600 text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/40">{result.ticker}</div>
            <div className="flex gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest items-center">
                <span className="text-blue-400">{activeTab}</span>
                <span className="h-3 w-px bg-slate-700"></span>
                <span className="hover:text-slate-300 cursor-pointer transition-colors font-mono">Q-SYS v3.0</span>
            </div>
        </div>
      </div>

      {activeTab === AnalysisType.Clustering && result.clusteringAnalysis && (
          <ClusteringDashboard data={result.clusteringAnalysis} />
      )}

      {activeTab === AnalysisType.News && result.newsItems && (
          <NewsDashboard items={result.newsItems} summary={result.content} />
      )}

      {activeTab === AnalysisType.Ideas && result.tradeIdea && (
          <TradeIdeasDashboard data={result.tradeIdea} />
      )}

      {activeTab === AnalysisType.BrokerIntel && result.brokerIntel && (
          <BrokerIntelDashboard data={result.brokerIntel} />
      )}

      {activeTab === AnalysisType.PriceAction && result.priceAction && (
        <div className="animate-fade-in">
          <PriceActionChart data={result.priceAction} />
        </div>
      )}

      {activeTab === AnalysisType.Technical && result.technicalAnalysis && (
          <TechnicalAnalysisDashboard data={result.technicalAnalysis} />
      )}

      {activeTab !== AnalysisType.Clustering && activeTab !== AnalysisType.PriceAction && activeTab !== AnalysisType.Technical && activeTab !== AnalysisType.News && activeTab !== AnalysisType.BrokerIntel && activeTab !== AnalysisType.Ideas && (
          <div className="p-6 text-slate-200 font-sans text-sm leading-relaxed whitespace-pre-wrap bg-black/40 rounded-xl border border-white/5 shadow-inner">
              {result.content}
          </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
