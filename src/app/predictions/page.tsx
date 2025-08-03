"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const PredictionsPage = () => {
  const [ticker, setTicker] = useState("AAPL");
  const [stockData, setStockData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<"line" | "candlestick">("line");

  // Fetch data from same backend endpoint as Market page
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/stocks/${ticker}?interval=daily`
      );
      if (!res.ok) throw new Error("Failed to fetch stock data");
      const data = await res.json();
      setStockData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [ticker]);

  // Transform to ApexCharts format
  const transformData = () => {
    if (!stockData || !stockData["Time Series (Daily)"]) return [];
    return Object.entries(stockData["Time Series (Daily)"])
      .map(([date, values]: any) => ({
        x: new Date(date).getTime(),
        y:
          chartType === "line"
            ? parseFloat(values["4. close"])
            : [
                parseFloat(values["1. open"]),
                parseFloat(values["2. high"]),
                parseFloat(values["3. low"]),
                parseFloat(values["4. close"]),
              ],
      }))
      .sort((a, b) => a.x - b.x);
  };

  const chartOptions = {
    chart: { type: chartType, height: 400 },
    xaxis: { type: "datetime" },
    yaxis: { tooltip: { enabled: true } },
    title: { text: `${ticker} Historical & Predicted Closing Prices`, align: "center" },
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Stock Predictions</h1>

      <div className="mb-4 flex items-center gap-4">
        <select
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="AAPL">AAPL</option>
          <option value="NVDA">NVDA</option>
          <option value="AMZN">AMZN</option>
          <option value="TSLA">TSLA</option>
        </select>

        <button
          onClick={() =>
            setChartType(chartType === "line" ? "candlestick" : "line")
          }
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Switch to {chartType === "line" ? "Candlestick" : "Line"} Chart
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {stockData && (
        <Chart
          options={chartOptions}
          series={[{ name: ticker, data: transformData() }]}
          type={chartType}
          height={500}
        />
      )}
    </div>
  );
};

export default PredictionsPage;
