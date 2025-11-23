import { MarketTicker, Holding } from "../types";

const INITIAL_TICKERS: MarketTicker[] = [
  // Major Indices
  { symbol: "^GSPC", name: "S&P 500", price: 5234.18, change: 14.25, changePercent: 0.27, bid: 5233.50, ask: 5234.80, volume: 2150000000 },
  { symbol: "^DJI", name: "Dow Jones Industrial", price: 39512.84, change: -78.30, changePercent: -0.20, bid: 39510.00, ask: 39515.00, volume: 310000000 },
  { symbol: "^IXIC", name: "NASDAQ Composite", price: 16349.25, change: 56.10, changePercent: 0.34, bid: 16348.00, ask: 16350.50, volume: 4800000000 },
  { symbol: "^RUT", name: "Russell 2000", price: 2074.50, change: 12.20, changePercent: 0.59, bid: 2074.00, ask: 2075.00, volume: 1200000000 },
  
  // Crypto
  { symbol: "BTC-USD", name: "Bitcoin USD", price: 68500.00, change: 1200.00, changePercent: 1.78, bid: 68490.00, ask: 68510.00, volume: 25000000000 },

  // Stocks
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

// New function for Screener with full MarketTicker objects to support simulation
export const getInitialScreenerData = () => {
    return {
        gainers: [
            { symbol: "SMCI", name: "Super Micro", price: 1120.45, change: 115.20, changePercent: 11.45, bid: 1120.00, ask: 1121.00, volume: 8500000 },
            { symbol: "ARM", name: "Arm Holdings", price: 145.30, change: 12.50, changePercent: 9.41, bid: 145.20, ask: 145.40, volume: 12000000 },
            { symbol: "COIN", name: "Coinbase", price: 255.80, change: 18.40, changePercent: 7.75, bid: 255.50, ask: 256.00, volume: 5600000 },
            { symbol: "PLTR", name: "Palantir", price: 26.50, change: 1.80, changePercent: 7.29, bid: 26.45, ask: 26.55, volume: 45000000 },
            { symbol: "MSTR", name: "MicroStrategy", price: 1650.00, change: 98.50, changePercent: 6.35, bid: 1648.00, ask: 1652.00, volume: 1200000 },
            { symbol: "NVDA", name: "NVIDIA Corp", price: 890.50, change: 45.20, changePercent: 5.35, bid: 890.00, ask: 891.00, volume: 52000000 },
            { symbol: "DELL", name: "Dell Tech", price: 125.40, change: 5.80, changePercent: 4.85, bid: 125.30, ask: 125.50, volume: 3200000 },
            { symbol: "VRT", name: "Vertiv", price: 78.20, change: 3.40, changePercent: 4.55, bid: 78.10, ask: 78.30, volume: 4100000 },
            { symbol: "AMD", name: "AMD", price: 182.10, change: 7.50, changePercent: 4.30, bid: 182.00, ask: 182.20, volume: 65000000 },
            { symbol: "AVGO", name: "Broadcom", price: 1350.20, change: 52.10, changePercent: 4.01, bid: 1350.00, ask: 1350.50, volume: 2100000 },
            { symbol: "ANET", name: "Arista Networks", price: 295.60, change: 10.40, changePercent: 3.65, bid: 295.50, ask: 295.70, volume: 1500000 },
            { symbol: "ELF", name: "e.l.f. Beauty", price: 198.50, change: 6.80, changePercent: 3.55, bid: 198.40, ask: 198.60, volume: 980000 },
            { symbol: "MU", name: "Micron", price: 98.40, change: 3.20, changePercent: 3.36, bid: 98.30, ask: 98.50, volume: 15000000 },
            { symbol: "CRWD", name: "CrowdStrike", price: 325.80, change: 9.50, changePercent: 3.00, bid: 325.60, ask: 326.00, volume: 4500000 },
            { symbol: "PANW", name: "Palo Alto", price: 285.40, change: 7.80, changePercent: 2.81, bid: 285.20, ask: 285.60, volume: 3800000 },
        ] as MarketTicker[],
        losers: [
            { symbol: "TSLA", name: "Tesla Inc", price: 175.20, change: -8.40, changePercent: -4.57, bid: 175.10, ask: 175.30, volume: 85000000 },
            { symbol: "BA", name: "Boeing Co", price: 182.50, change: -6.80, changePercent: -3.59, bid: 182.40, ask: 182.60, volume: 6500000 },
            { symbol: "LULU", name: "Lululemon", price: 390.10, change: -12.30, changePercent: -3.06, bid: 390.00, ask: 390.25, volume: 2300000 },
            { symbol: "NKE", name: "Nike Inc", price: 98.40, change: -2.50, changePercent: -2.48, bid: 98.35, ask: 98.45, volume: 5400000 },
            { symbol: "INTC", name: "Intel Corp", price: 42.10, change: -0.90, changePercent: -2.09, bid: 42.08, ask: 42.12, volume: 32000000 },
            { symbol: "RIVN", name: "Rivian", price: 10.50, change: -0.85, changePercent: -7.49, bid: 10.45, ask: 10.55, volume: 12000000 },
            { symbol: "LCID", name: "Lucid", price: 2.85, change: -0.20, changePercent: -6.56, bid: 2.84, ask: 2.86, volume: 8500000 },
            { symbol: "PTON", name: "Peloton", price: 4.20, change: -0.25, changePercent: -5.62, bid: 4.19, ask: 4.21, volume: 5600000 },
            { symbol: "CVNA", name: "Carvana", price: 75.40, change: -3.80, changePercent: -4.80, bid: 75.30, ask: 75.50, volume: 4200000 },
            { symbol: "PYPL", name: "PayPal", price: 62.50, change: -2.40, changePercent: -3.70, bid: 62.40, ask: 62.60, volume: 9500000 },
            { symbol: "SQ", name: "Block", price: 78.90, change: -2.80, changePercent: -3.43, bid: 78.80, ask: 79.00, volume: 6800000 },
            { symbol: "SNAP", name: "Snap Inc", price: 11.20, change: -0.35, changePercent: -3.03, bid: 11.18, ask: 11.22, volume: 14000000 },
            { symbol: "Z", name: "Zillow", price: 45.60, change: -1.30, changePercent: -2.77, bid: 45.50, ask: 45.70, volume: 2100000 },
            { symbol: "U", name: "Unity", price: 26.80, change: -0.70, changePercent: -2.55, bid: 26.75, ask: 26.85, volume: 3500000 },
            { symbol: "PARA", name: "Paramount", price: 11.40, change: -0.28, changePercent: -2.40, bid: 11.38, ask: 11.42, volume: 5200000 },
        ] as MarketTicker[]
    }
};