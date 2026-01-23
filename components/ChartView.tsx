import React, { useState, useEffect, useRef } from "react";

declare global {
  interface Window {
    TradingView: any;
  }
}

// Internal component for the TradingView Widget
const TradingViewWidget = ({ ticker }: { ticker: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clean up previous widget if exists by clearing the container
    if (containerRef.current) {
        containerRef.current.innerHTML = "";
    }

    const scriptId = 'tradingview-widget-script';
    const widgetContainerId = `tradingview_widget_${ticker.replace(/[^a-zA-Z0-9]/g, '')}_${Math.random().toString(36).substring(7)}`;

    if (containerRef.current) {
        // Create a dedicated div for the widget inside our ref
        const widgetDiv = document.createElement('div');
        widgetDiv.id = widgetContainerId;
        widgetDiv.style.height = "100%";
        widgetDiv.style.width = "100%";
        containerRef.current.appendChild(widgetDiv);

        const initWidget = () => {
          if (window.TradingView) {
            try {
                // Initialize the TradingView widget with institutional settings
                new window.TradingView.widget({
                  autosize: true,
                  symbol: ticker,
                  interval: "D",
                  timezone: "Etc/UTC",
                  theme: "dark",
                  style: "1",
                  locale: "en",
                  enable_publishing: false,
                  allow_symbol_change: true,
                  container_id: widgetContainerId,
                  hide_side_toolbar: false,
                  details: true,
                  calendar: true,
                  studies: [
                    "RSI@tv-basicstudies",
                    "MASimple@tv-basicstudies"
                  ]
                });
            } catch(e) {
                console.error("Error initializing TradingView widget", e);
            }
          }
        };

        if (!window.TradingView) {
          const script = document.createElement('script');
          script.id = scriptId;
          script.src = 'https://s3.tradingview.com/tv.js';
          script.async = true;
          script.onload = initWidget;
          document.head.appendChild(script);
        } else {
          initWidget();
        }
    }
  }, [ticker]);

  return (
    <div ref={containerRef} className="tradingview-widget-container h-full w-full bg-[#131722]" />
  );
};

const ChartView: React.FC = () => {
    const [ticker, setTicker] = useState("SPY");
    const [input, setInput] = useState("SPY");
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            setTicker(input.trim().toUpperCase());
            setIsSearchVisible(false);
        }
    };

    return (
        <div className="relative w-full h-full bg-[#131722] overflow-hidden">
            {/* FLOATING MINIMALIST SEARCH OVERLAY */}
            <div className={`absolute top-4 left-4 z-50 transition-all duration-300 ${isSearchVisible ? 'w-72' : 'w-10'}`}>
                {isSearchVisible ? (
                    <form onSubmit={handleSubmit} className="flex items-center bg-[#1e222d] border border-slate-700 rounded-md shadow-2xl overflow-hidden ring-2 ring-purple-500/20">
                        <input
                            autoFocus
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value.toUpperCase())}
                            onBlur={() => !input.trim() && setIsSearchVisible(false)}
                            className="bg-transparent text-white px-3 py-2 text-xs font-bold outline-none flex-1 uppercase"
                            placeholder="Search Ticker..."
                        />
                        <button type="submit" className="px-3 py-2 text-slate-400 hover:text-white transition-colors border-l border-slate-700">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </form>
                ) : (
                    <button 
                        onClick={() => setIsSearchVisible(true)}
                        className="w-10 h-10 flex items-center justify-center bg-[#1e222d] border border-slate-700 rounded-md shadow-2xl text-slate-400 hover:text-purple-400 hover:border-purple-500/50 transition-all group"
                        title="Search Asset"
                    >
                        <div className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
                            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
            </div>

            {/* SYMBOL BADGE */}
            <div className="absolute top-4 right-4 z-40 pointer-events-none flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Institutional Feed:</span>
                 <span className="text-xs font-mono font-bold text-white bg-slate-900/80 px-2 py-0.5 rounded border border-white/5">{ticker}</span>
            </div>

            {/* THE CHART: TRUE EDGE TO EDGE */}
            <div className="w-full h-full">
                <TradingViewWidget ticker={ticker} />
            </div>
        </div>
    );
};

export default ChartView;