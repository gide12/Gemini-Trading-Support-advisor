import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import YahooFinance from "yahoo-finance2";
import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/market-data", async (req, res) => {
    try {
      const symbols = ["^GSPC", "^DJI", "^IXIC", "^RUT", "BTC-USD", "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META", "AMD"];
      const quotes = await yahooFinance.quote(symbols);
      
      const results = quotes.map((quote) => {
        if (!quote) return null;
        return {
          symbol: quote.symbol,
          name: quote.shortName || quote.longName || quote.symbol,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent,
          bid: quote.bid || quote.regularMarketPrice,
          ask: quote.ask || quote.regularMarketPrice,
          volume: quote.regularMarketVolume || 0,
        };
      }).filter(r => r !== null);
      
      res.json(results);
    } catch (error) {
      console.error("market-data fetch error:", error);
      res.status(500).json({ error: "Failed to fetch market data" });
    }
  });

  app.get("/api/quote/:ticker", async (req, res) => {
    try {
      const ticker = req.params.ticker.toUpperCase();
      const quote = await yahooFinance.quote(ticker);
      if (!quote) return res.status(404).json({ error: "Ticker not found" });
      
      res.json({
        symbol: quote.symbol,
        price: quote.regularMarketPrice,
      });
    } catch (error) {
      console.error("quote fetch error:", error);
      res.status(500).json({ error: "Failed to fetch quote" });
    }
  });

  app.get("/api/screener-data", async (req, res) => {
    try {
      // Approximating market screener with some known volatile tickers
      const symbols = [
        "SMCI", "ARM", "COIN", "PLTR", "MSTR", "NVDA", "DELL", "VRT", "AMD", "AVGO", "ANET", "ELF", "MU", "CRWD", "PANW",
        "TSLA", "BA", "LULU", "NKE", "INTC", "RIVN", "LCID", "PTON", "CVNA", "PYPL", "SQ", "SNAP", "Z", "U", "PARA"
      ];
      
      const quotes = await yahooFinance.quote(symbols);
      
      const results = quotes.map((quote) => {
        if (!quote) return null;
        return {
          symbol: quote.symbol,
          name: quote.shortName || quote.longName || quote.symbol,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent,
          bid: quote.bid || quote.regularMarketPrice,
          ask: quote.ask || quote.regularMarketPrice,
          volume: quote.regularMarketVolume || 0,
        };
      });

      const validResults = results.filter((r) => r !== null && r.changePercent !== undefined) as any[];
      validResults.sort((a, b) => b.changePercent - a.changePercent);

      const gainers = validResults.slice(0, 15);
      const losers = [...validResults].reverse().slice(0, 15);

      res.json({ gainers, losers });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch screener data" });
    }
  });

  app.get("/api/holdings", async (req, res) => {
    try {
      const portfolio = [
        { ticker: "AAPL", quantity: 50, avgBuyPrice: 150.00 },
        { ticker: "NVDA", quantity: 10, avgBuyPrice: 450.00 },
        { ticker: "GOOGL", quantity: 20, avgBuyPrice: 130.00 },
        { ticker: "TSLA", quantity: 100, avgBuyPrice: 220.00 },
      ];

      const tickers = portfolio.map(p => p.ticker);
      const quotes = await yahooFinance.quote(tickers);

      const results = quotes.map((quote) => {
        const pos = portfolio.find(p => p.ticker === quote.symbol);
        if (!pos || !quote) return null;
        
        const currentPrice = quote.regularMarketPrice || pos.avgBuyPrice;
        const marketValue = currentPrice * pos.quantity;
        const pl = marketValue - (pos.avgBuyPrice * pos.quantity);
        const plPercent = ((currentPrice - pos.avgBuyPrice) / pos.avgBuyPrice) * 100;
        
        return {
          ...pos,
          currentPrice,
          marketValue,
          pl,
          plPercent,
          mean: 0.01,
          variance: 0.005,
          deviation: 0.07,
          npv: marketValue + 100 // dummy calculation
        };
      });
      res.json(results.filter(Boolean));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch holdings data" });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
