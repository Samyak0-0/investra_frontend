"use client";
import { UserContext } from "@/provider/ContextProvider";
import React, { useState, useEffect, useContext } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const PortfolioComparison = () => {
  const [apiData, setApiData] = useState();
  const { user } = useContext(UserContext);
  const [timeInterval, setTimeInterval] = useState("30D");

  useEffect(() => {
    const fetchComparisonData = async () => {
      if (user) {
        try {
          const response = await fetch(
            `http://127.0.0.1:5000/api/comparison?userId=${user.id}&time=${timeInterval}`
          );
          const result = await response.json();

          setApiData(result);
        } catch (error) {
          console.error(error);
        }
      }
    };

    fetchComparisonData();
  }, [user, timeInterval]);

  let chartData;
  let lastDate;
  if (apiData) {
    const dates = Object.keys(apiData?.DIA);
    lastDate = dates[dates.length - 1];

    chartData = dates.map((date) => ({
      date,
      DIA: apiData?.DIA[date],
      QQQ: apiData?.QQQ[date],
      SPY: apiData?.SPY[date],
      Portfolio: apiData?.portfolio[date],
    }));
  }

  const returnList = [
    { Portfolio: "Your Portfolio" },
    { SPY: "S&P 500" },
    { DIA: "DOW JONES" },
    { QQQ: "NASDAQ 100" },
  ];

  return (
    <div>
      <div style={{ width: "100%", height: 700 }}>
        <div className="flex space-x-1 mb-8 bg-white/10 backdrop-blur-md rounded-xl p-1">
          {["30D", "60D", "90D", "1Y", "2Y", "5Y"].map((tab) => (
            <button
              key={tab}
              onClick={() => setTimeInterval(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                timeInterval === tab
                  ? " bg-slate-800/30 text-black shadow-lg"
                  : "text-gray-600 hover:text-slate-900 hover:bg-white/10"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {chartData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {returnList.map((entry) => {
              const [key, value] = Object.entries(entry)[0];
              const returns = chartData[chartData.length - 1][key];

              return (
                <div
                  className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
                  key={key}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">{value}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${((returns - 1)*100).toFixed(2)} %
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              angle={-45}
              textAnchor="end"
              height={60}
              tickFormatter={(date) => date.split("-").slice(1).join("-")} // Show MM-DD format
            />
            <YAxis
              domain={["auto", "auto"]}
              tickFormatter={(value) => value.toFixed(3)}
            />
            <Tooltip
              // formatter={(value) => value.toFixed(3)}
              labelFormatter={(date) => `Date: ${date}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Portfolio"
              stroke="#3794e6"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
              name="Your Portfolio"
            />
            <Line
              type="monotone"
              dataKey="SPY"
              stroke="#ff9900"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
              name="SPY (S&P 500 ETF)"
            />
            <Line
              type="monotone"
              dataKey="DIA"
              stroke="#610a70"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
              name="DIA (Dow Jones ETF)"
            />
            <Line
              type="monotone"
              dataKey="QQQ"
              stroke="#82ca9d"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
              name="QQQ (Nasdaq 100 ETF)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PortfolioComparison;
