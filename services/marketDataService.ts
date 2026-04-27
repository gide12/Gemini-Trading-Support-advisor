
import { MarketTicker, Holding } from "../types";

export const getInitialMarketData = async (): Promise<MarketTicker[]> => {
  try {
    const res = await fetch("/api/market-data");
    if (!res.ok) throw new Error(`Market data fetch failed: ${res.statusText}`);
    const data = await res.json();
    return data;
  } catch(e) {
    console.error("market-data error", e);
    return [];
  }
};

export const getInitialHoldings = async (): Promise<Holding[]> => {
  try {
    const res = await fetch("/api/holdings");
    if (!res.ok) throw new Error(`Holdings fetch failed: ${res.statusText}`);
    const data = await res.json();
    return data;
  } catch(e) {
    console.error("holdings error", e);
    return [];
  }
};

export const getPortfolioHistory = () => {
  // Generate simulated 30 day equity curve
  const data = [];
  let value = 35000;
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    value = value * (1 + (Math.random() - 0.45) * 0.02); // Slight upward bias
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(value)
    });
  }
  return data;
};

export const getInitialScreenerData = async () => {
  try {
    const res = await fetch("/api/screener-data");
    if (!res.ok) throw new Error(`Screener fetch failed: ${res.statusText}`);
    const data = await res.json();
    return data;
  } catch (e) {
    console.error("screener-data error", e);
    return { gainers: [], losers: [] };
  }
};

export const simulateMarketUpdate = (tickers: MarketTicker[]): MarketTicker[] => {
  return tickers.map(t => {
    const move = (Math.random() - 0.5) * (t.price * 0.002);
    const newPrice = t.price + move;
    const change = t.change + move;
    const originalPrice = newPrice - change;
    const changePercent = (change / originalPrice) * 100;
    
    return {
      ...t,
      price: Number(newPrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      bid: Number((newPrice - 0.05).toFixed(2)),
      ask: Number((newPrice + 0.05).toFixed(2)),
      volume: t.volume + Math.floor(Math.random() * 5000)
    };
  });
};

