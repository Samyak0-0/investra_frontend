export async function fetchStockData(symbol: string, interval = "daily") {
  const res = await fetch(`http://127.0.0.1:5000/api/stocks/${symbol}?interval=${interval}`);
  if (!res.ok) throw new Error("Failed to fetch stock data");
  return res.json();
}

export async function fetchPredictions(symbol: string, days: number) {
  const res = await fetch(`http://127.0.0.1:5000/api/stocks/predict/${symbol}?days=${days}`);
  if (!res.ok) throw new Error("Failed to fetch predictions");
  return res.json();
}
