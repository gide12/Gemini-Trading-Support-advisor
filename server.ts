import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

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
      const results = await Promise.all(
        symbols.map(async (symbol) => {
          try {
            const quote = await yahooFinance.quote(symbol);
            if (!quote) return null;
            return {
              symbol,
              name: quote.shortName || quote.longName || symbol,
              price: quote.regularMarketPrice,
              change: quote.regularMarketChange,
              changePercent: quote.regularMarketChangePercent,
              bid: quote.bid || quote.regularMarketPrice,
              ask: quote.ask || quote.regularMarketPrice,
              volume: quote.regularMarketVolume || 0,
            };
          } catch (error) {
            console.error(`Failed to fetch ${symbol}:`, error);
            return null;
          }
        })
      );
      res.json(results.filter((r) => r !== null));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch market data" });
    }
  });

  app.get("/api/screener-data", async (req, res) => {
    try {
      // Approximating market screener with some known volatile tickers
      const symbols = [
        "SMCI", "ARM", "COIN", "PLTR", "MSTR", "NVDA", "DELL", "VRT", "AMD", "AVGO", "ANET", "ELF", "MU", "CRWD", "PANW",
        "TSLA", "BA", "LULU", "NKE", "INTC", "RIVN", "LCID", "PTON", "CVNA", "PYPL", "SQ", "SNAP", "Z", "U", "PARA"
      ];
      
      const results = await Promise.all(
        symbols.map(async (symbol) => {
          try {
            const quote = await yahooFinance.quote(symbol);
            if (!quote) return null;
            return {
              symbol,
              name: quote.shortName || quote.longName || symbol,
              price: quote.regularMarketPrice,
              change: quote.regularMarketChange,
              changePercent: quote.regularMarketChangePercent,
              bid: quote.bid || quote.regularMarketPrice,
              ask: quote.ask || quote.regularMarketPrice,
              volume: quote.regularMarketVolume || 0,
            };
          } catch (error) {
            return null;
          }
        })
      );

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

      const results = await Promise.all(
        portfolio.map(async (pos) => {
          try {
            const quote = await yahooFinance.quote(pos.ticker);
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
          } catch(err) {
            return null;
          }
        })
      );
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
