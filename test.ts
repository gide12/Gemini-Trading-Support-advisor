import YahooFinance from 'yahoo-finance2';
async function run() {
  try {
    const yf = new YahooFinance();
    const result = await yf.quote('AAPL');
    console.log("Success:", result.regularMarketPrice);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
