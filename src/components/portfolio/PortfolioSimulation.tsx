"use client";
import { UserContext } from "@/provider/ContextProvider";
import React, { useContext, useEffect, useState } from "react";
import {
  Play,
  Settings,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";

const PortfolioSimulation = () => {
  const { user } = useContext(UserContext);

  const [simulations, setSimulations] = useState(1000);
  const [timeHorizon, setTimeHorizon] = useState(252); // 1 year in trading days
  const [confidenceLevel, setConfidenceLevel] = useState(95);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);

  const runSimulation = async () => {
    setIsRunning(true);

    const fetchURL = new URL(`http://127.0.0.1:5000/api/simulation/`);
    const params = {
      simulations: simulations,
      timeHorizon: timeHorizon,
      confLevel: confidenceLevel,
      userId: user?.id,
    };

    // Add parameters to URL
    Object.keys(params).forEach((key) =>
      fetchURL.searchParams.append(key, params[key as keyof typeof params])
    );

    try {
      const fetchSimulations = await fetch(fetchURL.toString(), {
        cache: "no-cache",
        headers: {
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
        },
      });

      if (!fetchSimulations.ok) {
        throw new Error(`HTTP error! status: ${fetchSimulations.status}`);
      }

      const response = await fetchSimulations.json();
      setResults(response);
    } catch (error) {
      console.error("Error fetching simulations:", error);
    }

    setIsRunning(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Portfolio Monte Carlo Simulation
        </h1>
        <p className="text-gray-600">
          Analyze potential future portfolio values using historical return
          patterns
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="text-blue-600" size={20} />
          <h2 className="text-xl font-semibold">Simulation Parameters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Simulations
            </label>
            <input
              type="number"
              value={simulations}
              onChange={(e) => setSimulations(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
              min="100"
              max="10000"
              step="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Horizon (days)
            </label>
            <input
              type="number"
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
              min="30"
              max="1260"
              step="30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confidence Level (%)
            </label>
            <input
              type="number"
              value={confidenceLevel}
              onChange={(e) => setConfidenceLevel(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
              min="80"
              max="99"
              step="1"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={runSimulation}
              disabled={isRunning}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Running...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Run Simulation
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {results && (
        <div className="">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="text-green-600" size={24} />
                <h3 className="text-lg font-semibold">Expected Value</h3>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {results?.mean_final_value}
              </p>
              <p className="text-sm text-gray-600">Mean outcome</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="text-slate-900" size={24} />
                <h3 className="text-lg font-semibold">Median Value</h3>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {results?.median_final_value}
              </p>
              <p className="text-sm text-gray-600">Median outcome</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="text-blue-600" size={24} />
                <h3 className="text-lg font-semibold">Confidence Range</h3>
              </div>
              <p className="text-lg font-bold text-blue-600">
                $ {results?.low_interval}&nbsp;&nbsp;-&nbsp;&nbsp;$ {results?.high_interval}
              </p>
              <p className="text-sm text-gray-600">
                {confidenceLevel}% confidence
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown className="text-red-600" size={24} />
                <h3 className="text-lg font-semibold">Risk of Loss</h3>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {results?.probability_of_loss}%
              </p>
              <p className="text-sm text-gray-600">
                Probability below current value
              </p>
            </div>
          </div>

          <div className=" grid grid-cols-1">
            <div>
              <img src={results?.paths_plot} alt="Paths visualization" />
              <img src={results?.histogram} alt="histogram" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioSimulation;
