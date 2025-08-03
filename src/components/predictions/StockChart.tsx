"use client";
import React from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  actualData: { x: number; y: number }[];
  predictedData: { x: number; y: number }[];
}

export default function StockChart({ actualData, predictedData }: Props) {
  if (actualData.length === 0) return <p>No data available</p>;

  const predictionStart = actualData[actualData.length - 1]?.x;

  const series = [
    {
      name: "Actual",
      data: actualData,
    },
    {
      name: "Predicted",
      data: predictedData,
    },
  ];

  const options: any = {
    chart: {
      type: "line",
      height: 500,
      zoom: { enabled: true },
    },
    xaxis: {
      type: "datetime",
    },
    stroke: {
      width: 2,
    },
    markers: {
      size: 0,
    },
    tooltip: {
      x: { format: "dd MMM yyyy" },
    },
    annotations: {
      xaxis: [
        {
          x: predictionStart,
          borderColor: "#FF4560",
          label: {
            style: { color: "#fff", background: "#FF4560" },
            text: "Prediction Start",
          },
        },
      ],
    },
  };

  return <Chart options={options} series={series} type="line" height={500} />;
}
