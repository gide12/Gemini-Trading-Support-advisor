import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    TradingView: any;
  }
}

/* ===============================
   TradingView Widget Component
================================ */
const TradingViewWidget = ({ ticker }: { ticker: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = "";

    const widgetId = `tv_${ticker}_${Date.now()}`;

    const widgetDiv = document.createElement("div");
    widgetDiv.id = widgetId;
    widgetDiv.style.width = "100%";
    widgetDiv.style.height = "100%";

    containerRef.current.appendChild(widgetDiv);

    const initWidget = () => {
      if (!window.TradingView) return;

      new window.TradingView.widget({
        autosize: true,
        symbol: ticker,
        interval: "D",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        container_id: widgetId,
        allow_symbol_change: true,
        hide_side_toolbar: false,
        details: true,
        calendar: true,
        studies: [
          "RSI@tv-basicstudies",
          "MASimple@tv-basicstudies"
        ],
      });
    };

    if (!window.TradingView) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = initWidget;
      document.head.appendChild(script);
    } else {
      initWidget();
    }
  }, [ticker]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: 0 }}
    />
  );
};

/* ===============================
   Chart View (Full Screen)
================================ */
const ChartView: React.FC = () => {
  const [ticker, setTicker] = useState("SPY");
  const [input, setInput] = useState("SPY");
  const [searchOpen, setSearchOpen] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTicker(input.toUpperCase());
    setSearchOpen(false);
  };

  return (
    <div className="relative w-screen h-screen bg-[#131722]">
      {/* SEARCH OVERLAY */}
      <div className="absolute top-4 left-4 z-50">
        {searchOpen ? (
          <form
            onSubmit={submit}
            className="flex items-center bg-[#1e222d] border border-slate-700 rounded-md shadow-xl"
          >
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              onBlur={() => !input && setSearchOpen(false)}
              className="bg-transparent text-white px-3 py-2 text-xs font-bold outline-none w-40"
              placeholder="Ticker..."
            />
            <button className="px-3 text-slate-400 hover:text-white">
              🔍
            </button>
          </form>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="w-10 h-10 bg-[#1e222d] border border-slate-700 rounded-md text-slate-400 hover:text-purple-400"
          >
            🔍
          </button>
        )}
      </div>

      {/* SYMBOL BADGE */}
      <div className="absolute top-4 right-4 z-40 pointer-events-none">
        <span className="text-[10px] text-slate-400 tracking-widest">
          INSTITUTIONAL FEED
        </span>
        <div className="text-xs font-mono text-white bg-black/50 px-2 py-1 rounded border border-white/10">
          {ticker}
        </div>
      </div>

      {/* CHART */}
      <div className="w-full h-full">
        <TradingViewWidget ticker={ticker} />
      </div>
    </div>
  );
};

export default ChartView;
