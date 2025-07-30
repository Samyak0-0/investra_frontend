// @ts-nocheck
"use client"
import React, { useState, useEffect, useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, Eye, Star, Bell, Search, Filter, Calendar } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { signOut } from "next-auth/react";
import { format } from 'date-fns';
import { UserContext } from "@/provider/ContextProvider";



const getNewsData = async (country: String, category: String,company: String) => {
  if (country != null || category != null) {
    const response = await fetch(
      `http://127.0.0.1:5000/api/news/${country}/${category}/${company}`
    );
    return response.json()
  }
};



const StockDashboard = () => {


  const { data, status } = useSession();


  const [userPortfolio, setUserPortfolio] = useState([]);
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [timeRange, setTimeRange] = useState('1D');
  const [activeTab, setActiveTab] = useState('overview');
  const [newsData, setNewsData] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState('');
  const { portfolioStats } = useContext(UserContext);


  const dailyGainLoss =
    portfolioStats?.totalValue - portfolioStats?.yesterdaysValue;
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedView, setSelectedView] = useState("overview");
  let totalShares = 0;

  const pieChartColors = [
    "#06b6d4",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
  ];

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

  useEffect(() => {
    const fetchNews = async () => {
      setNewsLoading(true);
      setNewsError(null);

      try {
        const data = await getNewsData('us', 'business','google');
        // Transform the API response to match your component's expected format
        if (data && data.articles) {
          const trNews = [];
          data.articles.slice(0, 5).forEach(element => {
            trNews.push({
              title: element.title,
              source: element.source.name,
              time: element.publishedAt,
            })
          });
          setNewsData(trNews)
        } else {
          // Fallback to mock data if API fails
          setNewsData([{
            title: '',
            source: '',
            time: '',
          }
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch news:', error);
        setNewsError('Failed to load news');

        // Set fallback data
        setNewsData([{
          title: '',
          source: '',
          time: '',
        }]
        );
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNews();
  }, []);

  const pieChartData =
    portfolioStats &&
    portfolioStats.portfolio.map((stock, index) => {
      const totalValue = parseFloat(stock.closing_price) * stock.stock_amt;
      return {
        name: stock.stock_name,
        value: totalValue,
        percentage: ((totalValue / portfolioStats.totalValue) * 100).toFixed(1),
        color: pieChartColors[index % pieChartColors.length],
      };
    });


  // Sample stock data
  const stockData = {
    AAPL: {
      name: 'Apple Inc.',
      price: 189.25,
      change: 2.45,
      changePercent: 1.31,
      volume: '45.2M',
      marketCap: '2.95T',
      pe: 29.8,
      dividend: 0.96,
      high52: 199.62,
      low52: 164.08
    },
    GOOGL: {
      name: 'Alphabet Inc.',
      price: 142.86,
      change: -1.23,
      changePercent: -0.85,
      volume: '28.7M',
      marketCap: '1.78T',
      pe: 26.4,
      dividend: 0.00,
      high52: 151.55,
      low52: 121.46
    },
    TSLA: {
      name: 'Tesla Inc.',
      price: 248.50,
      change: 8.75,
      changePercent: 3.65,
      volume: '62.1M',
      marketCap: '790B',
      pe: 58.9,
      dividend: 0.00,
      high52: 299.29,
      low52: 138.80
    }
  };

  // Sample price chart data
  const priceData = [
    { time: '09:30', price: 186.80 },
    { time: '10:00', price: 187.25 },
    { time: '10:30', price: 186.95 },
    { time: '11:00', price: 188.10 },
    { time: '11:30', price: 187.75 },
    { time: '12:00', price: 188.45 },
    { time: '12:30', price: 189.20 },
    { time: '13:00', price: 188.90 },
    { time: '13:30', price: 189.25 },
    { time: '14:00', price: 189.60 },
    { time: '14:30', price: 189.85 },
    { time: '15:00', price: 189.25 }
  ];

  // Sample volume data
  const volumeData = [
    { time: '09:30', volume: 2500000 },
    { time: '10:00', volume: 1800000 },
    { time: '10:30', volume: 1200000 },
    { time: '11:00', volume: 1600000 },
    { time: '11:30', volume: 1100000 },
    { time: '12:00', volume: 900000 },
    { time: '12:30', volume: 1300000 },
    { time: '13:00', volume: 1500000 },
    { time: '13:30', volume: 1700000 },
    { time: '14:00', volume: 2100000 },
    { time: '14:30', volume: 1900000 },
    { time: '15:00', volume: 2800000 }
  ];

  const portfolioData = [
    { name: 'AAPL', value: 45000, color: '#007AFF' },
    { name: 'GOOGL', value: 28000, color: '#34C759' },
    { name: 'TSLA', value: 32000, color: '#FF3B30' },
    { name: 'MSFT', value: 25000, color: '#FF9500' },
    { name: 'AMZN', value: 18000, color: '#AF52DE' }
  ];

  // Market movers
  const topGainers = [
    { symbol: 'NVDA', price: 875.28, change: 45.32, changePercent: 5.46 },
    { symbol: 'TSLA', price: 248.50, change: 8.75, changePercent: 3.65 },
    { symbol: 'AMD', price: 142.89, change: 4.21, changePercent: 3.03 }
  ];

  const topLosers = [
    { symbol: 'META', price: 324.56, change: -12.45, changePercent: -3.69 },
    { symbol: 'NFLX', price: 445.21, change: -8.34, changePercent: -1.84 },
    { symbol: 'GOOGL', price: 142.86, change: -1.23, changePercent: -0.85 }
  ];

  // News data

  const currentStock = stockData[selectedStock];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 text-gray-800">
      {/* Header not necessary now but might cum in handy later*/}
      {/* <header className="bg-[#f2f2f2] backdrop-blur-md border-b border-gray-300 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-[#0cb9c1]" />
                <h1 className="text-2xl font-bold text-[#0cb9c1] tracking-wide">
                  Investra
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search stocks..."
                  className="bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0cb9c1] focus:border-transparent shadow-sm"
                />
              </div>
              <button className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                <Bell className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                <Filter className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header> */}


      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stock Selector */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {Object.keys(stockData).map((symbol) => (
              <button
                key={symbol}
                onClick={() => setSelectedStock(symbol)}
                className={`px-4 py-2 rounded-lg transition-all shadow-sm cursor-pointer ${selectedStock === symbol
                  ? 'bg-[#0cb9c1] text-white font-semibold'
                  : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Stock Info */}
          <div className="col-span-3 space-y-6">
            {/* Current Stock Card */}
            <div className="bg-white backdrop-blur-md rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">{selectedStock}</h2>
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-gray-600 text-sm mb-4">{currentStock.name}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-gray-800">${currentStock.price}</span>
                  <div className={`flex items-center space-x-1 ${currentStock.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {currentStock.change >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="font-semibold">
                      {currentStock.change >= 0 ? '+' : ''}{currentStock.change}
                    </span>
                    <span>({currentStock.changePercent >= 0 ? '+' : ''}{currentStock.changePercent}%)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Volume</p>
                    <p className="font-semibold text-gray-800">{currentStock.volume}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Market Cap</p>
                    <p className="font-semibold text-gray-800">{currentStock.marketCap}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">P/E Ratio</p>
                    <p className="font-semibold text-gray-800">{currentStock.pe}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Dividend</p>
                    <p className="font-semibold text-gray-800">{currentStock.dividend}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Movers */}
            <div className="bg-white backdrop-blur-md rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Market Movers</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-green-600 mb-2">Top Gainers</h4>
                  {topGainers.map((stock, index) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <span className="text-sm font-medium text-gray-800">{stock.symbol}</span>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-800">${stock.price}</div>
                        <div className="text-xs text-green-600">+{stock.changePercent}%</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-red-600 mb-2">Top Losers</h4>
                  {topLosers.map((stock, index) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <span className="text-sm font-medium text-gray-800">{stock.symbol}</span>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-800">${stock.price}</div>
                        <div className="text-xs text-red-600">{stock.changePercent}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Chart Area */}
          <div className="col-span-6 space-y-6">
            {/* Price Chart */}
            <div className="bg-white backdrop-blur-md rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Price Chart</h3>
                <div className="flex space-x-2">
                  {['1D', '1W', '1M', '3M', '1Y'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1 rounded text-sm transition-colors cursor-pointer ${timeRange === range
                        ? 'bg-[#0cb9c1] text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="time" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        color: '#374151'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#0cb9c1"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Volume Chart */}
            <div className="bg-white backdrop-blur-md rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Volume</h3>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="time" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        color: '#374151'
                      }}
                    />
                    <Bar dataKey="volume" fill="#0cb9c1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-3 space-y-6">
            {/* Portfolio Overview */}
            <div className="bg-white backdrop-blur-md rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Portfolio</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#0cb9c1]">$148,000</div>
                  <div className="text-sm text-gray-500">Total Value</div>
                  <div className="text-sm text-green-600">+$2,340 (+1.6%)</div>
                </div>

                <div className="h-32">
                {pieChartData &
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
                    </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                }
                </div>

                <div className="space-y-2">
                  {portfolioData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-gray-800">{item.name}</span>
                      </div>
                      <span className="font-medium text-gray-800">${(item.value / 1000).toFixed(0)}K</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* News Feed */}
            <div className="bg-white backdrop-blur-md rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Market News</h3>
              <div className="space-y-4">
                {newsData.map((news, index) => (
                  <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                    <h4 className="text-sm font-medium mb-1 leading-tight text-gray-800">
                      {news.title}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{news.source}</span>
                      <span>{format(news.time, "MM/dd/yyyy")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold mb-4">Market Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">S&P 500</span>
                  <div className="text-right">
                    <div className="text-sm font-semibold">4,789.32</div>
                    <div className="text-xs text-emerald-400">+0.82%</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">NASDAQ</span>
                  <div className="text-right">
                    <div className="text-sm font-semibold">15,156.78</div>
                    <div className="text-xs text-emerald-400">+1.24%</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">DOW</span>
                  <div className="text-right">
                    <div className="text-sm font-semibold">37,248.56</div>
                    <div className="text-xs text-red-400">-0.15%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDashboard;
