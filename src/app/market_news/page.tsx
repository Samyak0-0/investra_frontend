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

const Page = () => {
  const [company, setCompany] = useState<string>("google")
  const [sentimentData, setSentimentData] = useState<SentimentResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [stockLoading, setStockLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [stockError, setStockError] = useState<string | null>(null)
  const [stockChartData, setStockChartData] = useState<any>(null)

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
      try {
        console.log("Fetching stock data for:", company2ticker[company])
        const data = await fetchStockData(company2ticker[company])
        console.log("Raw stock data:", data)

        // Check if data exists and has the expected structure
        if (!data) {
          throw new Error("No data received from stock API")
        }

        const timeSeries = data["Time Series (Daily)"]
        console.log("Time Series data:", timeSeries)

        if (!timeSeries || typeof timeSeries !== "object") {
          throw new Error("Invalid time series data structure")
        }

        const dates = Object.keys(timeSeries).sort().slice(-30) // Get last 30 days
        const prices = dates.map((date) => {
          const dayData = timeSeries[date]
          if (!dayData || !dayData["4. close"]) {
            console.warn("Missing close price for date:", date)
            return 0
          }
          return Number.parseFloat(dayData["4. close"])
        })

        console.log("Processed dates:", dates)
        console.log("Processed prices:", prices)

        setStockChartData({
          labels: dates.map((date) => new Date(date).toLocaleDateString()),
          datasets: [
            {
              label: `${company2ticker[company]} Price ($)`,
              data: prices,
              fill: false,
              tension: 0.3,
              borderColor: "rgb(59, 130, 246)",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              pointBackgroundColor: "rgb(59, 130, 246)",
              pointBorderColor: "rgb(59, 130, 246)",
            },
          ],
        })
      } catch (err) {
        console.error("Stock fetch error:", err)
        setStockError(`Failed to fetch stock data: ${err instanceof Error ? err.message : "Unknown error"}`)
      } finally {
        setStockLoading(false)
      }
    }

    fetchStockData_()
  }, [company])

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `${company2ticker[company]} Stock Price (Last 30 Days)`,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: "Price ($)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
    },
  }

  return (
    <div className="bg-white backdrop-blur-md rounded-xl p-6 border border-gray-200 shadow-sm space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Market News with Sentiment</h3>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
          Select Company
        </label>
        <select
          id="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {companies.map((c) => (
            <option key={c} value={c}>
              {c.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Stock Chart Section */}
      <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
        <h4 className="text-md font-medium text-gray-800 mb-3">Stock Price Chart</h4>
        {stockLoading && (
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-gray-500">Loading stock data...</p>
          </div>
        )}
        {stockError && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-sm text-red-500 mb-2">{stockError}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-xs text-blue-500 hover:text-blue-700 underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        {stockChartData && !stockLoading && !stockError && (
          <div className="h-64">
            <Line data={stockChartData} options={chartOptions} />
          </div>
        )}
      </div>

      {/* Sentiment Section */}
      {loading && <p className="text-sm text-gray-500">Loading sentiment...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {sentimentData && (
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-800">Recent News Sentiment</h4>
          <div className="grid gap-3">
            {sentimentData.articles.slice(0, 10).map((article, index) => {
              const bgColor =
                article.sentiment === "positive"
                  ? "bg-green-50 border-green-200"
                  : article.sentiment === "negative"
                    ? "bg-red-50 border-red-200"
                    : "bg-gray-50 border-gray-200"

              const textColor =
                article.sentiment === "positive"
                  ? "text-green-800"
                  : article.sentiment === "negative"
                    ? "text-red-800"
                    : "text-gray-800"

              return (
                <div key={index} className={`border rounded-lg p-3 ${bgColor}`}>
                  <h5 className="text-sm font-medium mb-2 leading-tight text-gray-800">
                    {article.text.length > 120 ? article.text.slice(0, 120) + "..." : article.text}
                  </h5>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`capitalize font-medium ${textColor}`}>{article.sentiment}</span>
                    <span className="text-gray-600">Confidence: {(article.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Page
