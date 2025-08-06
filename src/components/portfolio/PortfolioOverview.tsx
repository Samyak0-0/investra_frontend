"use client";

import { UserContext } from "@/provider/ContextProvider";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Edit3,
  Trash2,
  DollarSign,
  Activity,
  Target,
  BarChart3,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useContext, useState } from "react";
import PortfolioComparison from "./PortfolioComparison";
import PortfolioSimulation from "./PortfolioSimulation";
import { StockList } from "@/provider/StockListProvider";
import { set } from "date-fns";

const PortfolioOverview = () => {
  const { portfolioStats, user } = useContext(UserContext);
  const dailyGainLoss =
    portfolioStats?.totalValue - portfolioStats?.yesterdaysValue;
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedView, setSelectedView] = useState("overview");

  const [stockTicker, setStockTicker] = useState("");
  const [stockSelectedTicker, setStockSelectedTicker] = useState(null);
  const [no_of_Stocks, set_no_of_Stocks] = useState(0);
  const [new_no_of_Stocks, set_new_no_of_Stocks] = useState(0);
  const [pendingDeleteStock, setPendingDeleteStock] = useState<string | null>(
    null
  );

  const generateColors = (count: number): string[] => {
    const colors: string[] = [];
    const saturation = 70;
    const lightness = 50;

    for (let i = 0; i < count; i++) {
      const hue = Math.floor((360 / count) * i); // Evenly spaced hues
      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }

    return colors;
  };

  const pieChartColors: string[] = [];

  const pieChartData =
    portfolioStats &&
    (() => {
      const colors = generateColors(portfolioStats.portfolio.length);
      return portfolioStats.portfolio.map((stock, index) => {
        const totalValue = parseFloat(stock.closing_price) * stock.stock_amt;
        const color = colors[index];
        pieChartColors.push(color);

        return {
          name: stock.stock_name,
          value: totalValue,
          percentage: ((totalValue / portfolioStats.totalValue) * 100).toFixed(
            1
          ),
          color,
        };
      });
    })();

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const handleAddStock = () => {
    if (!stockTicker || !no_of_Stocks) {
      alert("Invalid Inputs.");
      return;
    }

    if (!StockList.includes(stockTicker.toUpperCase())) {
      alert("Invalid stock ticker. Please enter a valid one.");
      return;
    }

    fetch("http://127.0.0.1:5000/api/stocks/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stockTicker,
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
        setStockTicker("");
        set_no_of_Stocks(0);
        window.location.reload();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleStockDelete = (stockName: string) => {
    fetch("/api/deletePortfolio", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stockName,
        userId: user?.id,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        console.log("Stock deleted successfully");
        window.location.reload();
      })
      .catch((err) => {
        console.error("Error deleting stock:", err);
      });
  };

  const handleEditStock = () => {
    fetch("/api/editPortfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stockName: stockSelectedTicker,
        userId: user?.id,
        stock_Amt: new_no_of_Stocks,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setShowEditModal(false);
        setStockSelectedTicker(null);
        set_new_no_of_Stocks(0);
        window.location.reload();
        console.log("Stock edited successfully");
      })
      .catch((err) => {
        console.error("Error editing stock:", err);
      });
  };

  return (
    <div className="min-h-screen w-full bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">
            Portfolio Dashboard
          </h1>
          <p className="text-gray-600 text-3xl">
            Track your investments and analyze performance
          </p>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${Number(portfolioStats?.totalValue).toFixed(2)}
                </p>
              </div>
              <DollarSign className="text-green-500 w-8 h-8" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Today's Change</p>
                <p
                  className={`text-2xl font-bold ${
                    dailyGainLoss >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {dailyGainLoss >= 0 ? "+" : ""}$
                  {Number(dailyGainLoss).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              {dailyGainLoss >= 0 ? (
                <TrendingUp className="text-green-500 w-8 h-8" />
              ) : (
                <TrendingDown className="text-red-500 w-8 h-8" />
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Holdings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {portfolioStats?.portfolio.length}
                </p>
              </div>
              <Activity className="text-blue-500 w-8 h-8" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Performance</p>
                <p className="text-2xl font-bold text-green-500">
                  {portfolioStats?.totalValue
                    ? (
                        (dailyGainLoss / portfolioStats.totalValue) *
                        100
                      ).toFixed(2)
                    : "0.00"}{" "}
                  %
                </p>
              </div>
              <Target className="text-cyan-500 w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="flex space-x-1 mb-8 bg-white/10 backdrop-blur-md rounded-xl p-1">
          {["overview", "comparison", "simulation"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedView(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedView === tab
                  ? " bg-slate-800/30 text-black shadow-lg"
                  : "text-gray-600 hover:text-slate-900 hover:bg-white/10"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {selectedView === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            {/* Portfolio Holdings */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Holdings</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Stock</span>
                </button>
              </div>

              <div className="space-y-4">
                {portfolioStats?.portfolio.map((stock, index) => (
                  <div
                    key={stock.stock_name}
                    className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: pieChartColors[index] }}
                        ></div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {stock.stock_name}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {`( ${stock.stock_amt} )`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${stock.closing_price.toLocaleString()}
                        </p>
                        <p
                          className={`text-sm ${
                            stock.closing_price - stock.second_price >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {stock.closing_price - stock.second_price >= 0
                            ? "+"
                            : ""}
                          {(
                            ((stock.closing_price - stock.second_price) /
                              stock.closing_price) *
                            100
                          ).toFixed(2)}{" "}
                          %{" "}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-gray-500 hover:text-gray-900">
                          <Edit3
                            className="w-4 h-4"
                            onClick={() => {
                              setShowEditModal(true);
                              setStockSelectedTicker(stock.stock_name);
                              set_new_no_of_Stocks(stock.stock_amt);
                            }}
                          />
                        </button>
                        <button
                          className="text-gray-500 hover:text-red-500"
                          onClick={() =>
                            setPendingDeleteStock(stock.stock_name)
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* {selectedView === "comparison" && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-6">
                  Market Comparison
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={marketComparison}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "none",
                        borderRadius: "8px",
                        color: "white",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="portfolio"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      name="Your Portfolio"
                    />
                    <Line
                      type="monotone"
                      dataKey="sp500"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="S&P 500"
                    />
                    <Line
                      type="monotone"
                      dataKey="dowjones"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      name="Dow Jones"
                    />
                  </LineChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-purple-400 font-semibold">
                      Your Portfolio
                    </p>
                    <p className="text-white text-2xl font-bold">+6.2%</p>
                    <p className="text-gray-300 text-sm">vs last month</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-green-400 font-semibold">S&P 500</p>
                    <p className="text-white text-2xl font-bold">+4.8%</p>
                    <p className="text-gray-300 text-sm">vs last month</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-yellow-400 font-semibold">Dow Jones</p>
                    <p className="text-white text-2xl font-bold">+3.9%</p>
                    <p className="text-gray-300 text-sm">vs last month</p>
                  </div>
                </div>
              </div>
            )} */}

            {/* Portfolio Allocation Pie Chart */}
            {pieChartData && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Portfolio Allocation
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        color: "#374151",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                      formatter={(value, name) => [
                        `${value.toFixed(2)} (${
                          pieChartData.find((item) => item.name === name)
                            ?.percentage
                        }%)`,
                        name,
                      ]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry) => (
                        <span style={{ color: "#374151" }}>
                          {value} : $
                          {pieChartData
                            .find((item) => item.name === value)
                            ?.value.toFixed(2)}
                          &nbsp;&nbsp;
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {showAddModal && (
              //light mode made few commits ago
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 border border-gray-300 w-full max-w-md">
                  <h3 className="text-xl font-bold text-black mb-6">
                    Add New Stock
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">
                        Stock Symbol
                      </label>
                      <input
                        type="text"
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., AAPL"
                        value={stockTicker || ""}
                        onChange={(e) =>
                          setStockTicker(e.target.value.toUpperCase())
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">
                        Number of Shares
                      </label>
                      <input
                        type="number"
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="10"
                        value={no_of_Stocks || 0}
                        onChange={(e) =>
                          set_no_of_Stocks(Number(e.target.value))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex space-x-4 mt-8">
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-black py-3 rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      className="flex-1 bg-gradient-to-r from-blue-400 to-cyan-300 hover:from-blue-500 hover:to-cyan-400 text-white py-3 rounded-lg transition-all"
                      onClick={handleAddStock}
                    >
                      Add Stock
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showEditModal && (
              //light mode made few commits ago
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 border border-gray-300 w-full max-w-md">
                  <h3 className="text-xl font-bold text-black mb-6">
                    Edit Stock Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">
                        Stock Symbol
                      </label>
                      <input
                        type="text"
                        className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., AAPL"
                        value={stockSelectedTicker || ""}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">
                        Number of Shares
                      </label>
                      <input
                        type="number"
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="10"
                        value={new_no_of_Stocks || 0}
                        onChange={(e) =>
                          set_new_no_of_Stocks(Number(e.target.value))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex space-x-4 mt-8">
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-black py-3 rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      className="flex-1 bg-gradient-to-r from-blue-400 to-cyan-300 hover:from-blue-500 hover:to-cyan-400 text-white py-3 rounded-lg transition-all"
                      onClick={handleEditStock}
                    >
                      Edit Stock
                    </button>
                  </div>
                </div>
              </div>
            )}

            {pendingDeleteStock && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 border border-gray-200 w-full max-w-md">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Confirm Deletion
                  </h3>
                  <p className="mb-6 text-gray-700">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold">{pendingDeleteStock}</span>{" "}
                    from your portfolio?
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setPendingDeleteStock(null)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg transition-all"
                      onClick={() => {
                        handleStockDelete(pendingDeleteStock);
                        setPendingDeleteStock(null);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedView === "comparison" && <PortfolioComparison />}
        {selectedView === "simulation" && <PortfolioSimulation />}
      </div>
    </div>
  );
};

export default PortfolioOverview;
