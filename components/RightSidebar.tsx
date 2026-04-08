import React from 'react';
import { Zap, Activity } from 'lucide-react';

const ALERTS = [
  { time: "10:42", text: "Large block trade detected in NVDA options", type: "info", factor: "Options Flow", value: "$45M Prem" },
  { time: "10:15", text: "VIX spikes above 20", type: "warning", factor: "Volatility", value: "21.50 (+15%)" },
  { time: "09:30", text: "CPI data exceeds consensus", type: "critical", factor: "Macro", value: "3.4% YoY" },
  { time: "08:45", text: "BOJ unexpected rate hike", type: "critical", factor: "Rates", value: "+25 bps" },
  { time: "08:15", text: "Gold hits new all-time high", type: "info", factor: "Commodities", value: "$2,450/oz" },
];

const RightSidebar: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-[#0B1221] border-l border-slate-800/50">
      {/* System Alerts */}
      <div className="p-5 flex-1 overflow-y-auto custom-scrollbar bg-[#0f172a]/20">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          System Alerts
        </h3>
        <div className="space-y-3">
          {ALERTS.map((alert, idx) => (
            <div key={idx} className={`p-3 rounded-lg border text-xs relative overflow-hidden ${
              alert.type === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-200' :
              alert.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' :
              'bg-cyan-500/10 border-cyan-500/20 text-cyan-200'
            }`}>
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                alert.type === 'critical' ? 'bg-red-500' :
                alert.type === 'warning' ? 'bg-amber-500' :
                'bg-cyan-500'
              }`}></div>
              <div className="font-mono text-[10px] opacity-70 mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  {alert.time}
                </div>
                <div className="font-bold uppercase tracking-wider">{alert.factor}</div>
              </div>
              <div className="leading-relaxed mb-2">{alert.text}</div>
              <div className={`text-[11px] font-mono font-bold px-2 py-1 rounded inline-block ${
                alert.type === 'critical' ? 'bg-red-500/20 text-red-300' :
                alert.type === 'warning' ? 'bg-amber-500/20 text-amber-300' :
                'bg-cyan-500/20 text-cyan-300'
              }`}>
                {alert.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
