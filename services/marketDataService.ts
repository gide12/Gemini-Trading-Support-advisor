
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

export const getPortfolioHistory = (targetValue: number = 35000) => {
  // Generate simulated 30 day equity curve ending at targetValue
  const data = [];
  const now = new Date();
  
  // Create a sequence of returns backward
  const returns = [];
  let cumReturn = 1;
  
  for (let i = 0; i < 30; i++) {
    const dailyReturn = 1 + (Math.random() - 0.45) * 0.02; // Slight upward bias
    returns.push(dailyReturn);
    cumReturn *= dailyReturn;
  }
  
  // Starting value that will result in targetValue after all returns
  let value = targetValue / cumReturn;
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    if (i < 30) {
      value = value * returns[30 - i - 1]; 
    }
    
    // Ensure the last point is exactly targetValue
    if (i === 0) value = targetValue;
    
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

export const getAssetCalendarPerformance = (ticker: string, days: number = 30) => {
    // Generate simulated last days of daily performance for calendar view
    const data = [];
    const now = new Date();
    // Deterministic seed based on ticker
    let seed = 0;
    for (let i = 0; i < ticker.length; i++) {
        seed += ticker.charCodeAt(i);
    }
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // Pseudo-random pseudo-deterministic
        const pseudoRandom = Math.sin(seed + i) * 10000;
        const normalized = pseudoRandom - Math.floor(pseudoRandom);
        
        const changePercent = (normalized - 0.45) * 5; // -2.25% to 2.75%
        data.push({
            date: date.toISOString().split('T')[0],
            changePercent: Number(changePercent.toFixed(2))
        });
    }
    
    return data;
};

