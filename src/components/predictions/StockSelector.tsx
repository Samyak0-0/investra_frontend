"use client";
import React from "react";

interface Props {
  onCompanyChange: (symbol: string) => void;
  onDaysChange: (days: number) => void;
  selectedCompany: string;
  selectedDays: number;
}

const companies = ["AAPL", "MSFT", "NVDA", "AMZN", "TSLA", "GOOGL"];
const dayOptions = [
  { label: "1 Week (7 days)", value: 7 },
  { label: "1 Month (30 days)", value: 30 },
];

export default function StockSelector({
  onCompanyChange,
  onDaysChange,
  selectedCompany,
  selectedDays,
}: Props) {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-center mb-6">
      {/* Company Selector */}
      {companies.map((company) => (
        <button
          key={company}
          onClick={() => onCompanyChange(company)}
          className={`px-4 py-2 rounded-lg ${
            selectedCompany === company
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {company}
        </button>
      ))}

      {/* Days Selector */}
      {dayOptions.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onDaysChange(opt.value)}
          className={`px-4 py-2 rounded-lg ${
            selectedDays === opt.value
              ? "bg-green-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
