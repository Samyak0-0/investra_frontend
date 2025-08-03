"use client";
import React, { useState, useEffect } from "react";
import StockSelector from "@/components/predictions/StockSelector";
import StockChart from "@/components/predictions/StockChart";
import { fetchStockData, fetchPredictions } from "@/lib/api";
import { StockPoint } from "@/types/stock";

export default function PredictionPage() {
  const [company, setCompany] = useState("AAPL");
  const [days, setDays] = useState(7);
  const [actualData, setActualData] = useState<StockPoint[]>([]);
  const [predictedData, setPredictedData] = useState<StockPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const transformStockData = (data: any): StockPoint[] => {
    if (!data["Time Series (Daily)"]) return [];
    return Object.entries(data["Time Series (Daily)"])
      .map(([date, values]: [string, any]) => ({
        x: new Date(date).getTime(),
        y: parseFloat(values["4. close"]),
      }))
      .sort((a, b) => a.x - b.x);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch actual data
        const actual = await fetchStockData(company, "daily");
        const transformed = transformStockData(actual);
        setActualData(transformed);

        // Fetch predicted data
        const prediction = await fetchPredictions(company, days);
        const startDate = transformed[transformed.length - 1]?.x || Date.now();

        const predicted = prediction.predictions.map((price: number, i: number) => {
          const nextDate = new Date(startDate);
          nextDate.setDate(nextDate.getDate() + i + 1);
          return { x: nextDate.getTime(), y: price };
        });

        setPredictedData(predicted);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [company, days]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Stock Predictions</h1>
      <StockSelector
        onCompanyChange={setCompany}
        onDaysChange={setDays}
        selectedCompany={company}
        selectedDays={days}
      />

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <StockChart actualData={actualData} predictedData={predictedData} />
      )}
    </div>
  );
}
