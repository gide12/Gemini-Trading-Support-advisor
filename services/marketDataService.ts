import { MarketTicker, Holding } from "../types";

const INITIAL_TICKERS: MarketTicker[] = [
  { symbol: "AAPL", name: "Apple Inc.", price: 175.50, change: 1.25, changePercent: 0.72, bid: 175.45, ask: 175.55, volume: 45000000 },
  { symbol: "MSFT", name: "Microsoft Corp", price: 380.20, change: -2.10, changePercent: -0.55, bid: 380.10, ask: 380.30, volume: 22000000 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 142.80, change: 0.90, changePercent: 0.63, bid: 142.75, ask: 142.85, volume: 18000000 },
  { symbol: "AMZN", name: "Amazon.com", price: 155.30, change: 1.50, changePercent: 0.97, bid: 155.25, ask: 155.35, volume: 32000000 },
  { symbol: "NVDA", name: "NVIDIA Corp", price: 780.00, change: 15.40, changePercent: 2.01, bid: 779.80, ask: 780.20, volume: 48000000 },
  { symbol: "TSLA", name: "Tesla Inc", price: 190.50, change: -3.20, changePercent: -1.65, bid: 190.40, ask: 190.60, volume: 95000000 },
  { symbol: "META", name: "Meta Platforms", price: 470.10, change: 5.10, changePercent: 1.10, bid: 470.00, ask: 470.20, volume: 15000000 },
  { symbol: "AMD", name: "Adv. Micro Dev", price: 178.90, change: 4.30, changePercent: 2.46, bid: 178.80, ask: 179.00, volume: 65000000 },
];

const INITIAL_HOLDINGS: Holding[] = [
  { ticker: "AAPL", quantity: 50, avgBuyPrice: 150.00, currentPrice: 175.50, marketValue: 8775, pl: 1275, plPercent: 17.0 },
  { ticker: "NVDA", quantity: 10, avgBuyPrice: 450.00, currentPrice: 780.00, marketValue: 7800, pl: 3300, plPercent: 73.3 },
  { ticker: "GOOGL", quantity: 20, avgBuyPrice: 130.00, currentPrice: 142.80, marketValue: 2856, pl: 256, plPercent: 9.8 },
  { ticker: "TSLA", quantity: 100, avgBuyPrice: 220.00, currentPrice: 190.50, marketValue: 19050, pl: -2950, plPercent: -13.4 },
];

// Simulate slight market movements
export const simulateMarketUpdate = (tickers: MarketTicker[]): MarketTicker[] => {
  return tickers.map(t => {
    const move = (Math.random() - 0.5) * (t.price * 0.002); // 0.2% max variance per tick
    const newPrice = t.price + move;
    const change = t.change + move;
    const changePercent = (change / (newPrice - change)) * 100;
    
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

export const getInitialMarketData = () => INITIAL_TICKERS;
export const getInitialHoldings = () => INITIAL_HOLDINGS;

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
