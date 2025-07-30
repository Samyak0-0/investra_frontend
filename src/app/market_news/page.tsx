"use client"

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type SentimentArticle = {
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
};

type SentimentResponse = {
  company: string;
  date: string;
  total_articles: number;
  sentiment_distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  articles: SentimentArticle[];
};

const stockData: Record<string, number[]> = {
  google: [150, 152, 154, 153, 157],
  tesla: [220, 225, 230, 228, 235],
  microsoft: [300, 305, 310, 308, 312],
  nvidia: [480, 485, 490, 495, 500],
};

const companies = ['google', 'tesla', 'microsoft', 'nvidia'];

const Page = () => {
  const [company, setCompany] = useState<string>('google');
  const [sentimentData, setSentimentData] = useState<SentimentResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      {
        label: `${company.toUpperCase()} Stock Price`,
        data: stockData[company],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  useEffect(() => {
    const fetchSentiment = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`http://127.0.0.1:5000/api/news/sentiment/${company}`);
        if (!res.ok) throw new Error("Failed to fetch sentiment data");
        const data: SentimentResponse = await res.json();
        setSentimentData(data);
      } catch (err) {
        setError("Error loading sentiment data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSentiment();
  }, [company]);

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
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          {companies.map((c) => (
            <option key={c} value={c}>
              {c.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
        <Line data={chartData} />
      </div>

      {loading && <p className="text-sm text-gray-500">Loading sentiment...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {sentimentData && (
        <>
          <div className="space-y-4 mt-4">
            {sentimentData.articles.slice(2, 7).map((article, index) => (
              <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                <h4 className="text-sm font-medium mb-1 leading-tight text-gray-800">
                  {article.text.length > 100
                    ? article.text.slice(0, 100) + '...'
                    : article.text}
                </h4>
                <div className="flex items-center justify-between text-xs text-gray-500">
                {article.sentiment?<span className="capitalize">Sentiment: {article.sentiment}</span>:<span className="capitalize"></span>}
                  <span>Confidence: {article.confidence.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
