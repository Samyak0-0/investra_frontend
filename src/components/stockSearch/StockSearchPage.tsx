"use client"
import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const StockSearchPage = () => {
  const [ticker, setTicker] = useState("");
  const [interval, setInterval] = useState("daily");
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add new state for chart options
  const [chartOptions, setChartOptions] = useState({
    chart: {
      type: 'candlestick',
      height: 400,
      toolbar: {
        show: true
      }
    },
    title: {
      text: 'Stock Price Chart',
      align: 'left'
    },
    xaxis: {
      type: 'datetime'
    },
    yaxis: {
      tooltip: {
        enabled: true
      }
    }
  });

  // Function to transform stock data into ApexCharts format
  const transformStockData = (data) => {
    if (!data) return [];
    
    // Determine which time series to use based on the interval
    let timeSeriesKey;
    switch (interval) {
      case 'daily':
        timeSeriesKey = 'Time Series (Daily)';
        break;
      case 'weekly':
        timeSeriesKey = 'Weekly Time Series';
        break;
      case 'monthly':
        timeSeriesKey = 'Monthly Time Series';
        break;
      default:
        timeSeriesKey = 'Time Series (Daily)';
    }

    if (!data[timeSeriesKey]) return [];
    
    return Object.entries(data[timeSeriesKey])
      .map(([date, values]) => ({
        x: new Date(date).getTime(),
        y: [
          parseFloat(values['1. open']),
          parseFloat(values['2. high']),
          parseFloat(values['3. low']),
          parseFloat(values['4. close'])
        ]
      }))
      .sort((a, b) => a.x - b.x); // Sort by date
  };

  useEffect(() => {
    const handleIntervalChange = async () => {
      
      setLoading(true);
      setError(null);
  
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/api/stock/${ticker}?interval=${interval}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch stock data");
        }
        const data = await response.json();
        setStockData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    handleIntervalChange();
  },[interval])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/stock/${ticker}?interval=${interval}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch stock data");
      }
      const data = await response.json();
      setStockData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="ticker" className="block text-sm font-medium mb-1">
            Stock Ticker
          </label>
          <input
            type="text"
            id="ticker"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            className="w-full p-2 border rounded"
            placeholder="Enter ticker (e.g., AAPL)"
            required
          />
          
        </div>

        <div>
          <label htmlFor="interval" className="block text-sm font-medium mb-1">
            Interval
          </label>
          {/* <select
            id="interval"
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select> */}
          <button type="button" onClick={() => setInterval("daily")} className="text-sm cursor-pointer text-white bg-blue-500 rounded-md px-2 py-1 mr-2 my-2">Daily</button>
          <button type="button" onClick={() => setInterval("weekly")} className="text-sm cursor-pointer text-white bg-blue-500 rounded-md px-2 py-1 m-2">Weekly</button>
          <button type="button" onClick={() => setInterval("monthly")} className="text-sm cursor-pointer text-white bg-blue-500 rounded-md px-2 py-1 m-2">Monthly</button>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Loading..." : "Get Stock Data"}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {stockData && (
        <div className="mt-4">
          <div className="bg-white p-4 rounded shadow">
            <Chart
              options={chartOptions}
              series={[{
                data: transformStockData(stockData)
              }]}
              type="candlestick"
              height={600}
            />
          </div>
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h2 className="text-xl font-bold mb-2">Raw Stock Data</h2>
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(stockData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockSearchPage;
