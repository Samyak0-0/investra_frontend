// @ts-nocheck
"use client";
import React, { useState, useEffect, useContext } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Eye,
  Star,
  Bell,
  Search,
  Filter,
  Calendar,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { format } from "date-fns";
import { UserContext } from "@/provider/ContextProvider";

const getNewsData = async (country: String, category: String) => {
  if (country != null || category != null) {
    const response = await fetch(
      `http://127.0.0.1:5000/api/news/${country}/${category}`
    );
    return response.json();
  }
};

const StockDashboard = () => {
  const { data, status } = useSession();

  const { user, portfolioStats } = useContext(UserContext);

  const [selectedStock, setSelectedStock] = useState(
    "Add or Select a Stock"
  );
  const [newsData, setNewsData] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState("");

  const dailyGainLoss =
    portfolioStats?.totalValue - portfolioStats?.yesterdaysValue;

  const pieChartColors = ["#06b6d4", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#22c55e", "#eab308", "#0ea5e9", "#6366f1", "#14b8a6", "#f97316", "#db2777", "#4ade80", "#60a5fa", "#f43f5e", "#a855f7", "#84cc16", "#c026d3"];


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
        fontSize="20"
        fontWeight={"bold"}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  useEffect(() => {
    const fetchNews = async () => {
      setNewsLoading(true);
      setNewsError(null);

      try {
        const data = await getNewsData("us", "business");
        if (data && data.articles) {
          const trNews = [];
          data.articles.slice(0, 5).forEach((element) => {
            trNews.push({
              title: element.title,
              source: element.source.name,
              time: element.publishedAt,
            });
          });
          setNewsData(trNews);
        } else {
          setNewsData([
            {
              title: "",
              source: "",
              time: "",
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch news:", error);
        setNewsError("Failed to load news");
        setNewsData([
          {
            title: "",
            source: "",
            time: "",
          },
        ]);
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Create pie chart data from portfolioStats
  const pieChartData =
    portfolioStats &&
    portfolioStats?.portfolio.map((stock, index) => {
      const totalValue = parseFloat(stock.closing_price) * stock.stock_amt;
      return {
        name: stock.stock_name,
        value: totalValue,
        percentage: ((totalValue / portfolioStats.totalValue) * 100).toFixed(1),
        color: pieChartColors[index % pieChartColors.length],
      };
    });

  // Get current selected stock data from portfolio
  const getCurrentStockData = () => {
    if (!portfolioStats || !portfolioStats.portfolio) return null;
    return portfolioStats.portfolio.find(
      (stock) => stock.stock_name === selectedStock
    );
  };

  const currentStock = getCurrentStockData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 text-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome {portfolioStats?.name || "User"},
          </h1>
        </div>

        {/* Stock Selector */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {portfolioStats?.portfolio?.map((stock) => (
              <button
                key={stock.stock_name}
                onClick={() => setSelectedStock(stock.stock_name)}
                className={`px-4 py-2 rounded-lg transition-all shadow-sm cursor-pointer ${
                  selectedStock === stock.stock_name
                    ? "bg-[#0cb9c1] text-white font-semibold"
                    : "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700"
                }`}
              >
                {stock.stock_name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid - Stock Data and Portfolio */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          {/* Left Side - Stock Data */}
          <div className="col-span-4">
            {/* Current Stock Card */}
            <div className="bg-white backdrop-blur-md rounded-xl p-6 border border-gray-200 shadow-sm h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedStock}
                </h2>
                <Star fill="orange" className="h-5 w-5 text-yellow-500" />
              </div>

              {currentStock && (
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-gray-800">
                      ${parseFloat(currentStock.closing_price).toFixed(2)}
                    </span>
                    <div
                      className={`flex items-center justify-center space-x-1 mt-2 ${
                        parseFloat(currentStock.closing_price) >=
                        parseFloat(currentStock.second_price)
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {parseFloat(currentStock.closing_price) >=
                      parseFloat(currentStock.second_price) ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="font-semibold">
                        {parseFloat(currentStock.closing_price) >=
                        parseFloat(currentStock.second_price)
                          ? "+"
                          : ""}
                        {(
                          parseFloat(currentStock.closing_price) -
                          parseFloat(currentStock.second_price)
                        ).toFixed(2)}
                      </span>
                      <span>
                        (
                        {(
                          ((parseFloat(currentStock.closing_price) -
                            parseFloat(currentStock.second_price)) /
                            parseFloat(currentStock.second_price)) *
                          100
                        ).toFixed(2)}
                        %)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="border-b border-gray-200 pb-2">
                      <p className="text-lg text-gray-800">Shares Owned</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {currentStock.stock_amt}
                      </p>
                    </div>
                    <div className="border-b border-gray-200 pb-2">
                      <p className="text-lg text-gray-800">Total Value</p>
                      <p className="text-lg font-semibold text-gray-800">
                        $
                        {(
                          parseFloat(currentStock.closing_price) *
                          currentStock.stock_amt
                        ).toFixed(2)}
                      </p>
                    </div>
                    <div className="border-b border-gray-200 pb-2">
                      <p className="text-lg text-gray-800">Closing Price</p>
                      <p className="text-lg font-semibold text-gray-800">
                        ${parseFloat(currentStock.closing_price).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-lg text-gray-800">Second Price</p>
                      <p className="text-lg font-semibold text-gray-800">
                        ${parseFloat(currentStock.second_price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Portfolio Overview */}
          <div className="col-span-8">
            <div className="bg-white backdrop-blur-md rounded-xl p-6 border border-gray-200 shadow-sm h-full">
              <h3 className="text-3xl font-semibold mb-4 text-gray-800">
                Portfolio
              </h3>
              <div className="grid grid-cols-2 gap-6 h-full">
                {/* Left side - Stats */}
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-lg text-gray-500 mt-1">
                      Total Value:
                    </div>
                    <div className="text-3xl font-bold text-[#0cb9c1]">
                      ${portfolioStats?.totalValue?.toFixed(2) || "0.00"}
                    </div>
                    <div
                      className={`text-lg mt-1 ${
                        dailyGainLoss >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {dailyGainLoss >= 0 ? "+" : ""}$
                      {dailyGainLoss?.toFixed(2)}(
                      {(
                        (dailyGainLoss / portfolioStats?.yesterdaysValue) *
                        100
                      )?.toFixed(2)}
                      %)
                    </div>
                  </div>

                  {/* Portfolio Breakdown */}
                  <div className="space-y-2">
                    {pieChartData?.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-xl text-gray-800">
                            {item.name}
                          </span>
                        </div>
                        <div className="text-center space-x-10">
                          <div className="text-lg text-gray-800">
                            ${item.value.toFixed(2)}
                          </div>
                          <div className="text-md text-gray-800">
                            {item.percentage}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right side - Pie Chart */}
                <div className="flex items-center justify-center">
                  {pieChartData && (
                    <div className="h-95 w-80">
                      <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="45%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={150}
                            fill="#8884d8"
                            stroke="#ffffff" // Border color between slices
                            strokeWidth={1.5} // Thickness of the border
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Market News - Full Width Bottom */}
        <div className="w-full">
          <div className="bg-white backdrop-blur-md rounded-xl p-8 border border-gray-200 shadow-sm">
            <h3 className="p-3 text-3xl font-semibold mb-6 text-gray-800">
              Market News
            </h3>
            <div className="space-y-4">
              {newsData.map((news, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0"
                >
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-800 leading-tight">
                      {news.title || `News Item ${index + 1}`}
                    </h4>
                  </div>
                  <div className="p-2 flex items-center space-x-8 text-base text-gray-500 ml-4">
                    <span className="font-medium">
                      {news.source || "News Source"}
                    </span>
                    <span>
                      {news.time
                        ? format(new Date(news.time), "MM/dd/yyyy")
                        : "Today"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDashboard;
