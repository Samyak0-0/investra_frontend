"use client"

import { useState, useEffect } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { fetchStockData } from "@/lib/api"
import { TrendingUp, BarChart3 } from "lucide-react"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

type SentimentArticle = {
  text: string
  sentiment: "positive" | "neutral" | "negative"
  confidence: number
}

type SentimentResponse = {
  company: string
  date: string
  total_articles: number
  sentiment_distribution: {
    positive: number
    neutral: number
    negative: number
  }
  overall_sentiment: "positive" | "neutral" | "negative"
  average_confidence: number
  articles: SentimentArticle[]
}

const companies = ["google", "tesla", "microsoft", "nvidia"]

const companyApiNames: Record<string, string> = {
  google: "Google",
  tesla: "Tesla",
  microsoft: "Microsoft",
  nvidia: "NVIDIA",
}

const company2ticker: Record<string, string> = {
  google: "GOOGL",
  tesla: "TSLA",
  microsoft: "MSFT",
  nvidia: "NVDA",
}

// Function to get colors based on sentiment
function getSentimentColors(sentiment: "positive" | "neutral" | "negative") {
  switch (sentiment) {
    case "positive":
      return {
        background: "rgba(34, 197, 94, 0.1)",
        border: "rgb(34, 197, 94)",
        point: "rgb(34, 197, 94)",
        chartBg: "bg-green-50",
        textColor: "text-green-800",
        borderColor: "border-green-200",
      }
    case "negative":
      return {
        background: "rgba(239, 68, 68, 0.1)",
        border: "rgb(239, 68, 68)",
        point: "rgb(239, 68, 68)",
        chartBg: "bg-red-50",
        textColor: "text-red-800",
        borderColor: "border-red-200",
      }
    default: // neutral
      return {
        background: "rgba(107, 114, 128, 0.1)",
        border: "rgb(107, 114, 128)",
        point: "rgb(107, 114, 128)",
        chartBg: "bg-gray-50",
        textColor: "text-gray-800",
        borderColor: "border-gray-200",
      }
  }
}

// Function to process different API response formats
function processStockData(data: any, ticker: string) {
  // Check if it's Alpha Vantage format
  if (data["Time Series (Daily)"]) {
    const timeSeries = data["Time Series (Daily)"]
    const dates = Object.keys(timeSeries).sort().slice(-30)
    const prices = dates.map((date) => Number.parseFloat(timeSeries[date]["4. close"]))
    return { dates, prices }
  }

  // Check if it's an array of stock data points
  if (Array.isArray(data)) {
    const dates = data
      .map((item) => {
        return item.date || item.timestamp || item.time || item.Date
      })
      .filter(Boolean)

    const prices = data.map((item) => {
      return Number.parseFloat(item.close || item.price || item.Close || item.value || 0)
    })

    return { dates: dates.slice(-30), prices: prices.slice(-30) }
  }

  // Check if it's an object with data array
  if (data.data && Array.isArray(data.data)) {
    return processStockData(data.data, ticker)
  }

  // Check if it has prices/historical data
  if (data.prices || data.historical || data.history) {
    const priceData = data.prices || data.historical || data.history
    return processStockData(priceData, ticker)
  }

  // Check if it's a simple object with date keys
  const keys = Object.keys(data || {})
  if (keys.length > 0 && keys[0].match(/\d{4}-\d{2}-\d{2}/)) {
    const dates = keys.sort().slice(-30)
    const prices = dates.map((date) => {
      const dayData = data[date]
      return Number.parseFloat(dayData.close || dayData.price || dayData.Close || 0)
    })
    return { dates, prices }
  }

  throw new Error("Unable to process stock data format. Please check the API response structure.")
}

const Page = () => {
  const [company, setCompany] = useState<string>("google")
  const [sentimentData, setSentimentData] = useState<SentimentResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [stockLoading, setStockLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [stockError, setStockError] = useState<string | null>(null)
  const [stockChartData, setStockChartData] = useState<any>(null)

  // Get current sentiment for styling
  const currentSentiment = sentimentData?.overall_sentiment || "neutral"
  const sentimentColors = getSentimentColors(currentSentiment)

  useEffect(() => {
    const fetchSentiment = async () => {
      setLoading(true)
      setError(null)
      try {
        const apiCompany = companyApiNames[company]
        const res = await fetch(`http://127.0.0.1:5000/api/news/sentiment/${apiCompany}`)
        if (!res.ok) throw new Error("Failed to fetch sentiment data")
        const data: SentimentResponse = await res.json()
        setSentimentData(data)
      } catch (err) {
        setError("Error loading sentiment data.")
        console.error("Sentiment fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchSentiment()
  }, [company])

  useEffect(() => {
    const fetchStockData_ = async () => {
      setStockLoading(true)
      setStockError(null)
      setStockChartData(null)

      try {
        const data = await fetchStockData(company2ticker[company])

        if (!data) {
          throw new Error("No data received from stock API")
        }

        const { dates, prices } = processStockData(data, company2ticker[company])

        if (!dates || !prices || dates.length === 0 || prices.length === 0) {
          throw new Error("No valid price data found")
        }

        // Create chart data with sentiment-based colors
        setStockChartData({
          labels: dates.map((date) => {
            const dateObj = new Date(date)
            return dateObj.toLocaleDateString()
          }),
          datasets: [
            {
              label: `${company2ticker[company]} Price ($)`,
              data: prices,
              fill: true,
              tension: 0.3,
              borderColor: sentimentColors.border,
              backgroundColor: sentimentColors.background,
              pointBackgroundColor: sentimentColors.point,
              pointBorderColor: sentimentColors.point,
              pointRadius: 3,
              pointHoverRadius: 5,
              borderWidth: 2,
            },
          ],
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error"
        console.error("Stock fetch error:", err)
        setStockError(`Failed to fetch stock data: ${errorMessage}`)
      } finally {
        setStockLoading(false)
      }
    }

    fetchStockData_()
  }, [company])

  // Update chart colors when sentiment changes
  useEffect(() => {
    if (stockChartData && sentimentData) {
      setStockChartData((prevData: any) => ({
        ...prevData,
        datasets: [
          {
            ...prevData.datasets[0],
            borderColor: sentimentColors.border,
            backgroundColor: sentimentColors.background,
            pointBackgroundColor: sentimentColors.point,
            pointBorderColor: sentimentColors.point,
          },
        ],
      }))
    }
  }, [sentimentData])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend for cleaner look
      },
      title: {
        display: false, // Remove chart title for minimal design
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          maxTicksLimit: 6,
        },
      },
    },
    elements: {
      point: {
        hoverRadius: 6,
      },
    },
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-blue-500">Market News Sentiment</h1>
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Company Selector */}
          <div className="p-6 border-b border-gray-100">
            <div className="max-w-xs">
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <select
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {companies.map((c) => (
                  <option key={c} value={c}>
                    {companyApiNames[c]} ({company2ticker[c]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sentiment Overview */}
          {sentimentData && (
            <div className={`p-6 border-b border-gray-100 ${sentimentColors.chartBg}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${sentimentColors.border.replace("rgb", "bg").replace("(", "-").replace(")", "").replace(/,/g, "-").replace(/ /g, "")}`}
                      style={{ backgroundColor: sentimentColors.border }}
                    ></div>
                    <span className={`text-lg font-semibold ${sentimentColors.textColor}`}>
                      {currentSentiment.charAt(0).toUpperCase() + currentSentiment.slice(1)} Sentiment
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {sentimentData.total_articles} articles • {(sentimentData.average_confidence * 100).toFixed(0)}%
                    confidence
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    +{sentimentData.sentiment_distribution.positive}
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                    ={sentimentData.sentiment_distribution.neutral}
                  </span>
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                    -{sentimentData.sentiment_distribution.negative}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Stock Chart Section */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">{company2ticker[company]} Stock Price</h2>
            </div>

            {stockLoading && (
              <div className="flex items-center justify-center h-80">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                  <p className="text-gray-500">Loading stock data...</p>
                </div>
              </div>
            )}

            {stockError && (
              <div className="flex items-center justify-center h-80">
                <div className="text-center">
                  <p className="text-red-500 mb-3">{stockError}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-blue-500 hover:text-blue-700 underline"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {stockChartData && !stockLoading && !stockError && (
              <div className="h-80">
                <Line data={stockChartData} options={chartOptions} />
              </div>
            )}
          </div>
        </div>

        {/* News Articles */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading sentiment analysis...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {sentimentData && sentimentData.articles && sentimentData.articles.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent News Analysis</h2>
            <div className="grid gap-4">
              {sentimentData.articles.slice(0, 8).map((article, index) => {
                const bgColor =
                  article.sentiment === "positive"
                    ? "bg-green-50 border-green-100"
                    : article.sentiment === "negative"
                      ? "bg-red-50 border-red-100"
                      : "bg-gray-50 border-gray-100"

                const textColor =
                  article.sentiment === "positive"
                    ? "text-green-700"
                    : article.sentiment === "negative"
                      ? "text-red-700"
                      : "text-gray-700"

                return (
                  <div key={index} className={`border rounded-xl p-4 ${bgColor} hover:shadow-sm transition-shadow`}>
                    <p className="text-gray-800 leading-relaxed mb-3">
                      {article.text.length > 150 ? article.text.slice(0, 150) + "..." : article.text}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`capitalize font-medium text-sm ${textColor}`}>{article.sentiment}</span>
                      <span className="text-gray-500 text-sm">{(article.confidence * 100).toFixed(0)}% confidence</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Page
