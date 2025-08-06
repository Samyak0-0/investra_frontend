// @ts-nocheck
"use client";
import React, { useState, useEffect, useContext } from "react";
import dynamic from "next/dynamic";
import { UserContext } from "@/provider/ContextProvider";
import { StockList } from "@/provider/StockListProvider";
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

  const { user } = useContext(UserContext);

  const [showAddModal, setShowAddModal] = useState(false);
  const [no_of_Stocks, set_no_of_Stocks] = useState<number>(0);

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
    let valueKey; // To differentiate between "4. close" and "5. adjusted close"

    switch (interval) {
      case "daily":
        timeSeriesKey = "Time Series (Daily)";
        valueKey = "4. close";
        break;
      case "weekly":
        timeSeriesKey = "Weekly Adjusted Time Series";
        valueKey = "5. adjusted close"; // Assuming weekly and monthly also use adjusted close
        break;
      case "monthly":
        timeSeriesKey = "Monthly Adjusted Time Series";
        valueKey = "5. adjusted close"; // Assuming weekly and monthly also use adjusted close
        break;
      default:
        timeSeriesKey = "Time Series (Daily)";
        valueKey = "4. close";
    }

    // **Crucial: Check if data[timeSeriesKey] exists BEFORE Object.entries()**
    if (!data[timeSeriesKey]) {
      console.log(
        "No data found for key:",
        timeSeriesKey,
        "in transformStockData2"
      );
      return [];
    }

    return Object.entries(data[timeSeriesKey])
      .map(([date, values]: [string, any]) => ({
        x: new Date(date).getTime(),
        y: parseFloat(values[valueKey]),
      }))
      .sort((a, b) => a.x - b.x);
  };

  // 3. Memoized values
  const chartOptions = React.useMemo(
    () => ({
      chart: {
        type: chartType,
        height: 400,
        toolbar: {
          show: true,
        },
        animations: {
          enabled: true,
          easing: "easeinout",
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
            upward: "#00E396",
            downward: "#FF4560",
          },
        },
      },
      tooltip: {
        enabled: true,
        custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
          const data =
            w.globals.initialSeries[seriesIndex].data[dataPointIndex];
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
            // Show "Close" for daily, "Adjusted Close" for weekly/monthly
            let valueLabel = "Adjusted Close";
            if (interval === "daily") valueLabel = "Close";
            const value = data.y;
            return `
        <div class="p-2 bg-white border border-gray-200 rounded shadow">
          <div class="font-bold">${date}</div>
          <div>${valueLabel}: $${value.toFixed(2)}</div>
        </div>
      `;
          }
        },
      },
    }),
    [chartType, ticker]
  );

  const transformedData = React.useMemo(() => {
    if (!stockData) return [];
    if (chartType === "candlestick") {
      // Only take the most recent 300 data points for candlestick
      const allData = transformStockData(stockData);
      return allData.slice(-150);
    } else {
      return transformStockData2(stockData);
    }
  }, [stockData, chartType, interval]); // Added interval as dependency

  // 4. Event handlers
  const handleGraphChange = React.useCallback(() => {
    setChartType((prev) => (prev === "line" ? "candlestick" : "line"));
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

  const handleAddStock = () => {
    if (!ticker || !no_of_Stocks) {
      alert("Invalid Inputs.");
      return;
    }

    if (!StockList.includes(ticker.toUpperCase())) {
      alert("Invalid stock ticker. Please enter a valid one.");
      return;
    }

    fetch("http://127.0.0.1:5000/api/stocks/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stockTicker: ticker,
        no_of_Stocks,
        userId: user?.id,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        return fetch(`http://127.0.0.1:5000/api/reset/?userId=${user?.id}`, {
          method: "DELETE",
        });
      })
      .then(() => {
        setShowAddModal(false);
        set_no_of_Stocks(0);
        window.location.reload();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // 6. Render
  return (
    // <>
    //   <div className=" mx-auto p-4">
    //     <form onSubmit={handleSubmit} className="space-y-4">
    //       <div>
    //         <label htmlFor="ticker" className="block text-sm font-medium mb-1">
    //           Stock Ticker
    //         </label>
    //         <input
    //           type="text"
    //           id="ticker"
    //           value={ticker}
    //           onChange={(e) => setTicker(e.target.value.toUpperCase())}
    //           className="w-full p-2 border rounded"
    //           placeholder="Enter ticker (e.g., AAPL)"
    //           required
    //         />
    //       </div>
    //       {/* <div>
    //       <button
    //         onClick={handleGraphChange}
    //         className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
    //       >
    //         Switch to {chartType === "line" ? "Candlestick" : "Line"} Chart
    //       </button>
    //     </div> */}
    //       <div>
    //         <label
    //           htmlFor="interval"
    //           className="block text-sm font-medium mb-1"
    //         >
    //           Interval
    //         </label>

    //         <button
    //           type="button"
    //           onClick={() => setInterval("daily")}
    //           className="text-sm cursor-pointer text-white bg-blue-500 rounded-md px-2 py-1 mr-2 my-2"
    //         >
    //           Daily
    //         </button>
    //         <button
    //           type="button"
    //           onClick={() => setInterval("weekly")}
    //           className="text-sm cursor-pointer text-white bg-blue-500 rounded-md px-2 py-1 m-2"
    //         >
    //           Weekly
    //         </button>
    //         <button
    //           type="button"
    //           onClick={() => setInterval("monthly")}
    //           className="text-sm cursor-pointer text-white bg-blue-500 rounded-md px-2 py-1 m-2"
    //         >
    //           Monthly
    //         </button>
    //       </div>

    //       <button
    //         onClick={() => setShowAddModal(true)}
    //         className="px-5 py-2 bg-blue-500 text-white m-2 ml-0 rounded hover:bg-blue-600"
    //       >
    //         + Add to Portfolio
    //       </button>

    //       <button
    //         type="submit"
    //         className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
    //         disabled={loading}
    //       >
    //         {loading ? "Loading..." : "Get Stock Data"}
    //       </button>
    //     </form>

    //     {error && (
    //       <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
    //         {error}
    //       </div>
    //     )}

    //     {transformedData.length > 0 && (
    //       <div className="mt-4 bg-white p-4 rounded shadow">
    //         <Chart
    //           options={chartOptions}
    //           series={[
    //             {
    //               name: ticker,
    //               data: transformedData,
    //             },
    //           ]}
    //           type={chartType}
    //           height={600}
    //         />
    //       </div>
    //     )}
    //     {stockData && (
    //       <div className="mt-4 p-4 bg-gray-100 rounded">
    //         <h2 className="text-xl font-bold mb-2">Raw Stock Data</h2>
    //         <pre className="whitespace-pre-wrap">
    //           {JSON.stringify(stockData, null, 2)}
    //         </pre>
    //       </div>
    //     )}

    //     {showAddModal && (
    //           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    //             <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 w-full max-w-md">
    //               <h3 className="text-xl font-bold text-white mb-6">
    //                 Add New Stock
    //               </h3>
    //               <div className="space-y-4">
    //                 <div>
    //                   <label className="block text-gray-300 text-sm mb-2">
    //                     Stock Symbol
    //                   </label>
    //                   <input
    //                     type="text"
    //                     className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
    //                     placeholder="e.g., AAPL"
    //                     value={ticker}
    //                     readOnly
    //                   />
    //                 </div>
    //                 <div>
    //                   <label className="block text-gray-300 text-sm mb-2">
    //                     Number of Shares
    //                   </label>
    //                   <input
    //                     type="number"
    //                     className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
    //                     placeholder="10"
    //                     value={no_of_Stocks || 0}
    //                     onChange={(e) =>
    //                       set_no_of_Stocks(Number(e.target.value))
    //                     }
    //                   />
    //                 </div>
    //               </div>
    //               <div className="flex space-x-4 mt-8">
    //                 <button
    //                   onClick={() => setShowAddModal(false)}
    //                   className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg transition-all"
    //                 >
    //                   Cancel
    //                 </button>
    //                 <button
    //                   className="flex-1 bg-gradient-to-r from-slate-500 to-cyan-200 hover:from-slate-600 hover:to-cyan-300 text-white py-3 rounded-lg transition-all"
    //                   onClick={handleAddStock}
    //                 >
    //                   Add Stock
    //                 </button>
    //               </div>
    //             </div>
    //           </div>
    //         )}
    //   </div>
    // </>

    // <>
    //   <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    //     <div className="container mx-auto p-6">
    //       {/* Header */}
    //       <div className="text-center mb-10">
    //         <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
    //           Stock Market Analytics
    //         </h1>
    //         <p className="text-gray-300 text-lg">
    //           Analyze and track your favorite stocks with real-time data
    //         </p>
    //       </div>

    //       {/* Main Content Card */}
    //       <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl mb-8">
    //         <form onSubmit={handleSubmit} className="space-y-8">
    //           {/* Stock Ticker Input */}
    //           <div className="space-y-3">
    //             <label htmlFor="ticker" className="block text-white font-semibold text-lg">
    //               Stock Ticker Symbol
    //             </label>
    //             <div className="relative">
    //               <input
    //                 type="text"
    //                 id="ticker"
    //                 value={ticker}
    //                 onChange={(e) => setTicker(e.target.value.toUpperCase())}
    //                 className="w-full p-4 bg-white/10 backdrop-blur border border-white/30 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all duration-300 text-lg"
    //                 placeholder="Enter ticker symbol (e.g., AAPL, TSLA, MSFT)"
    //                 required
    //               />
    //               <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
    //                 <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    //                 </svg>
    //               </div>
    //             </div>
    //           </div>

    //           {/* Interval Selection */}
    //           <div className="space-y-4">
    //             <label className="block text-white font-semibold text-lg">
    //               Time Interval
    //             </label>
    //             <div className="flex flex-wrap gap-3">
    //               {['daily', 'weekly', 'monthly'].map((int) => (
    //                 <button
    //                   key={int}
    //                   type="button"
    //                   onClick={() => setInterval(int)}
    //                   className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${interval === int
    //                     ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg transform scale-105'
    //                     : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border border-white/20'
    //                     }`}
    //                 >
    //                   {int.charAt(0).toUpperCase() + int.slice(1)}
    //                 </button>
    //               ))}
    //             </div>
    //           </div>

    //           {/* Action Buttons */}
    //           <div className="flex flex-col sm:flex-row gap-4">
    //             <button
    //               onClick={() => setShowAddModal(true)}
    //               type="button"
    //               className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
    //             >
    //               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    //               </svg>
    //               Add to Portfolio
    //             </button>

    //             <button
    //               type="submit"
    //               className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
    //               disabled={loading}
    //             >
    //               {loading ? (
    //                 <>
    //                   <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
    //                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    //                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    //                   </svg>
    //                   Analyzing...
    //                 </>
    //               ) : (
    //                 <>
    //                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    //                   </svg>
    //                   Get Stock Data
    //                 </>
    //               )}
    //             </button>
    //           </div>
    //         </form>
    //       </div>

    //       {/* Error Display */}
    //       {error && (
    //         <div className="bg-red-500/20 backdrop-blur border border-red-500/30 text-red-200 p-6 rounded-2xl mb-8 flex items-center gap-3">
    //           <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    //           </svg>
    //           <span className="font-medium">{error}</span>
    //         </div>
    //       )}

    //       {/* Chart Display */}
    //       {transformedData.length > 0 && (
    //         <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl mb-8">
    //           <div className="flex justify-between items-center mb-6">
    //             <h2 className="text-2xl font-bold text-white">Stock Performance</h2>
    //             <button
    //               onClick={handleGraphChange}
    //               className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all duration-300"
    //             >
    //               {chartType === "line" ? "📈 Line Chart" : "🕯️ Candlestick"}
    //             </button>
    //           </div>
    //           <div className="bg-white rounded-2xl p-4">
    //             <Chart
    //               options={chartOptions}
    //               series={[
    //                 {
    //                   name: ticker,
    //                   data: transformedData,
    //                 },
    //               ]}
    //               type={chartType}
    //               height={600}
    //             />
    //           </div>
    //         </div>
    //       )}

    //       {/* Raw Data Display */}
    //       {stockData && (
    //         <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl">
    //           <div className="flex items-center gap-3 mb-6">
    //             <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    //             </svg>
    //             <h2 className="text-2xl font-bold text-white">Raw Stock Data</h2>
    //           </div>
    //           <div className="bg-black/30 rounded-2xl p-6 max-h-96 overflow-auto">
    //             <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
    //               {JSON.stringify(stockData, null, 2)}
    //             </pre>
    //           </div>
    //         </div>
    //       )}

    //       {/* Add Stock Modal */}
    //       {showAddModal && (
    //         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    //           <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/30 w-full max-w-md shadow-2xl">
    //             <div className="text-center mb-8">
    //               <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
    //                 <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    //                 </svg>
    //               </div>
    //               <h3 className="text-2xl font-bold text-white mb-2">
    //                 Add to Portfolio
    //               </h3>
    //               <p className="text-gray-300">
    //                 Add this stock to your investment portfolio
    //               </p>
    //             </div>

    //             <div className="space-y-6">
    //               <div>
    //                 <label className="block text-gray-200 font-medium mb-3">
    //                   Stock Symbol
    //                 </label>
    //                 <input
    //                   type="text"
    //                   className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all duration-300"
    //                   value={ticker}
    //                   readOnly
    //                 />
    //               </div>
    //               <div>
    //                 <label className="block text-gray-200 font-medium mb-3">
    //                   Number of Shares
    //                 </label>
    //                 <input
    //                   type="number"
    //                   className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all duration-300"
    //                   placeholder="Enter number of shares"
    //                   value={no_of_Stocks || ''}
    //                   onChange={(e) =>
    //                     set_no_of_Stocks(Number(e.target.value))
    //                   }
    //                 />
    //               </div>
    //             </div>

    //             <div className="flex gap-4 mt-8">
    //               <button
    //                 onClick={() => setShowAddModal(false)}
    //                 className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition-all duration-300 font-medium border border-white/20"
    //               >
    //                 Cancel
    //               </button>
    //               <button
    //                 className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white py-3 rounded-xl transition-all duration-300 font-medium shadow-lg transform hover:scale-105"
    //                 onClick={handleAddStock}
    //               >
    //                 Add Stock
    //               </button>
    //             </div>
    //           </div>
    //         </div>
    //       )}
    //     </div>
    //   </div>
    // </>

    <>
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Stock Search
            </h1>
            <p className="text-gray-600">
              Search and analyze stock data with interactive charts
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Stock Ticker Input */}
              <div>
                <label
                  htmlFor="ticker"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Stock Ticker Symbol
                </label>
                <input
                  type="text"
                  id="ticker"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-800 font-medium"
                  placeholder="Enter ticker symbol (e.g., AAPL, GOOGL, TSLA)"
                  required
                />
              </div>

              {/* Interval Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Time Interval
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setInterval("daily")}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${interval === "daily"
                      ? "bg-blue-500 text-white shadow-lg transform scale-105 cursor-pointer"
                      : "bg-white text-blue-600 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-400 cursor-pointer"
                      }`}
                  >
                    Daily
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterval("weekly")}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${interval === "weekly"
                      ? "bg-blue-600 text-white shadow-lg transform scale-105 cursor-pointer"
                      : "bg-white text-blue-600 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-400 cursor-pointer"
                      }`}
                  >
                    Weekly
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterval("monthly")}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${interval === "monthly"
                      ? "bg-blue-700 text-white shadow-lg transform scale-105 cursor-pointer"
                      : "bg-white text-blue-600 border-2 border-blue-200 cursor-pointer hover:bg-blue-50 hover:border-blue-400"
                      }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowAddModal(true)}
                  type="button"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  Add to Portfolio
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    " Get Stock Data"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-xl">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-red-700 font-medium">❌ Error occurred</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Chart Section */}
          {transformedData.length > 0 && (
            <div className="mb-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {ticker} Stock Chart
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Interactive stock price visualization
                    </p>
                  </div>
                  <button
                    onClick={handleGraphChange}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md cursor-pointer"
                  >
                    🔄 Switch to {chartType === "line" ? "Candlestick" : "Line"}{" "}
                    Chart
                  </button>
                </div>
              </div>
              <div className="p-6 bg-white">
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
            </div>
          )}

          {/* Raw Data Section */}
          {/* {stockData && (
            <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700">
                <h2 className="text-xl font-bold text-white flex items-center">
                  🔍 Raw Stock Data
                  <span className="ml-2 text-sm bg-white/20 px-3 py-1 rounded-full">JSON</span>
                </h2>
              </div>
              <div className="p-6 bg-gray-50 max-h-96 overflow-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                  {JSON.stringify(stockData, null, 2)}
                </pre>
              </div>
            </div>
          )} */}

          {/* Add Stock Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                    Add to Portfolio
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Add this stock to your investment portfolio
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Stock Symbol
                    </label>
                    <input
                      type="text"
                      className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                      value={ticker}
                      onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Number of Shares
                    </label>
                    <input
                      type="number"
                      className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                      placeholder="Enter number of shares"
                      value={no_of_Stocks || ""}
                      onChange={(e) => set_no_of_Stocks(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex space-x-4 rounded-b-2xl">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition-all duration-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg cursor-pointer"
                    onClick={handleAddStock}
                  >
                    Add Stock
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StockSearchPage;
