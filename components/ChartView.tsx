
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
    <div ref={containerRef} className="tradingview-widget-container h-full w-full bg-[#131722] rounded-lg overflow-hidden border border-purple-500/30" />
  );
};

const ChartView: React.FC = () => {
    const [ticker, setTicker] = useState("SPY");
    const [input, setInput] = useState("SPY");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            setTicker(input.trim().toUpperCase());
        }
    };

    return (
        <div className="fade-in space-y-4 h-full flex flex-col">
            <div className="bg-[#0f172a] rounded-xl border border-purple-500/30 p-4 shadow-lg flex-shrink-0">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                            </svg>
                            Interactive Technical Chart
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="flex gap-2 w-full md:w-auto">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value.toUpperCase())}
                            className="bg-[#1e293b] border border-slate-700 rounded px-4 py-2 text-white focus:border-purple-500 outline-none w-full md:w-64"
                            placeholder="Enter Ticker (e.g. AAPL)"
                        />
                        <button 
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded transition-colors"
                        >
                            Load
                        </button>
                    </form>
                </div>
            </div>

            <div className="flex-1 bg-[#0f172a] rounded-xl border border-purple-500/30 p-1 shadow-lg overflow-hidden min-h-[500px]">
                <TradingViewWidget ticker={ticker} />
            </div>
        </div>
    );
};

export default ChartView;
