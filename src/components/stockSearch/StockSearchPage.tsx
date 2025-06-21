// @ts-nocheck
"use client";
import React, { useState, useEffect, useContext } from "react";
import dynamic from "next/dynamic";
import { UserContext } from "@/provider/ContextProvider";
// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const StockSearchPage = () => {
  // 1. State declarations
  const [ticker, setTicker] = useState("");
  const [interval, setInterval] = useState("daily");
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState<"line" | "candlestick">("line");

  const {user} = useContext(UserContext)

  // 2. Transform functions (moved up)
  const transformStockData = (data: any) => {
    if (!data) return [];

    let timeSeriesKey;
    switch (interval) {
      case "daily":
        timeSeriesKey = "Time Series (Daily)";
        break;
      case "weekly":
        timeSeriesKey = "Weekly Adjusted Time Series";
        break;
      case "monthly":
        timeSeriesKey = "Monthly Adjusted Time Series";
        break;
      default:
        timeSeriesKey = "Time Series (Daily)";
    }

    if (!data[timeSeriesKey]) {
      console.log("No data found for key:", timeSeriesKey);
      return [];
    }

    return Object.entries(data[timeSeriesKey])
      .map(([date, values]: [string, any]) => ({
        x: new Date(date).getTime(),
        y: [
          parseFloat(values["1. open"]),
          parseFloat(values["2. high"]),
          parseFloat(values["3. low"]),
          parseFloat(values["4. close"]),
        ],
      }))
      .sort((a, b) => a.x - b.x);
  };

  const transformStockData2 = (data: any) => {
    if (!data) return [];

    let timeSeriesKey;
    switch (interval) {
      case "daily":
        timeSeriesKey = "Time Series (Daily)";
        break;
      case "weekly":
        timeSeriesKey = "Weekly Adjusted Time Series";
        break;
      case "monthly":
        timeSeriesKey = "Monthly Adjusted Time Series";
        break;
      default:
        timeSeriesKey = "Time Series (Daily)";
    }

    if (!data[timeSeriesKey]) return [];

    return Object.entries(data[timeSeriesKey])
      .map(([date, values]: [string, any]) => ({
        x: new Date(date).getTime(),
        y: parseFloat(values["5. adjusted close"]),
      }))
      .sort((a, b) => a.x - b.x);
  };

  // 3. Memoized values
  const chartOptions = React.useMemo(() => ({
    chart: {
      type: chartType,
      height: 400,
      toolbar: {
        show: true,
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 300,
      },
    },
    title: {
      text: `${ticker} Stock Price Chart`,
      align: "left",
    },
    xaxis: {
      type: "datetime",
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
    },
    stroke: {
      width: chartType === "line" ? 1.5 : 1,
    },
    plotOptions: {
      candlestick: {
        wick: {
          useFillColor: true,
          thickness: 0.5,
        },
        colors: {
          upward: '#00E396',
          downward: '#FF4560'
        }
      }
    },
    tooltip: {
      enabled: true,
      custom: function({ series, seriesIndex, dataPointIndex, w }: any) {
        const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
        const date = new Date(data.x).toLocaleDateString();
        
        if (chartType === "candlestick") {
          const [open, high, low, close] = data.y;
          return `
            <div class="p-2 bg-white border border-gray-200 rounded shadow">
              <div class="font-bold">${date}</div>
              <div>Open: $${open.toFixed(2)}</div>
              <div>High: $${high.toFixed(2)}</div>
              <div>Low: $${low.toFixed(2)}</div>
              <div>Close: $${close.toFixed(2)}</div>
            </div>
          `;
        } else {
          const adjustedClose = data.y;
          return `
            <div class="p-2 bg-white border border-gray-200 rounded shadow">
              <div class="font-bold">${date}</div>
              <div>Adjusted Close: $${adjustedClose.toFixed(2)}</div>
            </div>
          `;
        }
      }
    },
  }), [chartType, ticker]);

  const transformedData = React.useMemo(() => {
    if (!stockData) return [];
    return chartType === "candlestick" 
      ? transformStockData(stockData)
      : transformStockData2(stockData);
  }, [stockData, chartType, interval]); // Added interval as dependency

  // 4. Event handlers
  const handleGraphChange = React.useCallback(() => {
    setChartType(prev => prev === "line" ? "candlestick" : "line");
  }, []);

  // 5. Effects
  useEffect(() => {
    const handleIntervalChange = async () => {
      if (!ticker) return;
      
      setLoading(true);
      setError(null);

      try {
        // const response = await fetch(
        //   `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY_ADJUSTED&symbol=IBM&apikey=demo`
        // );
        const response = await fetch(
          `http://127.0.0.1:5000/api/stocks/${ticker}?interval=${interval}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch stock data");
        }
        const data = await response.json();
        setStockData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    handleIntervalChange();
  }, [interval]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // const response = await fetch(
      //   `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY_ADJUSTED&symbol=IBM&apikey=demo`
      // );
      const response = await fetch(
        `http://127.0.0.1:5000/api/stocks/${ticker}?interval=${interval}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch stock data");
      }
      const data = await response.json();
      setStockData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePortfolio = async () => {
    try {
      
      const response = await fetch(
        `/api/addPortfolio?ticker=${ticker}&userId=${user.id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch stock data");
      }
      const data = await response.json()
      console.log(data)
    } catch (err: any) {
      console.log("Error: ", err)
    }
  }

  // 6. Render
  return (
    <>
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
        {/* <div>
          <button 
            onClick={handleGraphChange}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Switch to {chartType === "line" ? "Candlestick" : "Line"} Chart
          </button>
        </div> */}
        <div>
          <label htmlFor="interval" className="block text-sm font-medium mb-1">
            Interval
          </label>

          <button
            type="button"
            onClick={() => setInterval("daily")}
            className="text-sm cursor-pointer text-white bg-blue-500 rounded-md px-2 py-1 mr-2 my-2"
          >
            Daily
          </button>
          <button
            type="button"
            onClick={() => setInterval("weekly")}
            className="text-sm cursor-pointer text-white bg-blue-500 rounded-md px-2 py-1 m-2"
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => setInterval("monthly")}
            className="text-sm cursor-pointer text-white bg-blue-500 rounded-md px-2 py-1 m-2"
          >
            Monthly
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Loading..." : "Get Stock Data"}
        </button>
      </form>

      <button onClick={handlePortfolio} className="px-5 py-2 bg-blue-500 text-white m-2 ml-0 rounded hover:bg-blue-600">
        + Add to Portfolio
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {transformedData.length > 0 && (
        <div className="mt-4 bg-white p-4 rounded shadow">
          <Chart
            options={chartOptions}
            series={[
              {
                name: ticker,
                data: transformedData,
              },
            ]}
            type={chartType}
            height={600}
          />
        </div>
      )}
      {stockData && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-bold mb-2">Raw Stock Data</h2>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(stockData, null, 2)}
          </pre>
        </div>
      )}
    </div>

    </>
  );
};

export default StockSearchPage;
