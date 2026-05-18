"use strict";
"use client";

import React, { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function HighFrequencyTapeCanvas() {
  const [activeFrame, setActiveFrame] = useState("1M");
  const [selectedStock, setSelectedStock] = useState("RELIANCE-EQ");
  const [tickFeed, setTickFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  const availableAssets = [
    "RELIANCE-EQ",
    "SILVERBEES-EQ",
    "TATSILV-EQ",
    "INDIA VIX",
  ];

  const fetchChartData = async (stock, timeframe) => {
    try {
      const res = await fetch(
        `${API_URL}/history/${stock}?timeframe=${timeframe}`,
      );
      if (res.ok) {
        const data = await res.json();
        setTickFeed(data.series || []);
      }
    } catch (err) {
      console.error("Failed to load time series metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData(selectedStock, activeFrame);

    // Poll the backend endpoint frequently to pull newly committed depth entries
    const interval = setInterval(() => {
      fetchChartData(selectedStock, activeFrame);
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedStock, activeFrame]);

  // Extract OBI limits to scale the vertical bars accurately
  const ratios = tickFeed.map((t) => t.obi_ratio);
  const maxRatio = ratios.length ? Math.max(...ratios, 2.0) : 2.0;
  const minRatio = ratios.length ? Math.min(...ratios, 0.2) : 0.2;
  const ratioRange = maxRatio - minRatio || 1;

  return (
    <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-3 text-zinc-600 dark:text-zinc-400">
      {/* HIGH FREQUENCY OBI GRAPH PLOT AREA */}
      <div className="lg:col-span-8 bg-[#fcfbfa] dark:bg-zinc-900/60 border border-zinc-300/50 dark:border-zinc-800/80 p-4 rounded-lg flex flex-col gap-4 shadow-sm transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-200/40 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="font-semibold text-xs text-zinc-800 dark:text-zinc-200">
                Order Book Imbalance (OBI) Tracker
              </h2>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                Real-time buyer vs seller liquidity volume accumulation ratios
              </p>
            </div>

            <select
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[11px] focus:outline-none focus:border-zinc-400 text-zinc-700 dark:text-zinc-300 font-medium cursor-pointer"
            >
              {availableAssets.map((asset) => (
                <option key={asset} value={asset}>
                  {asset}
                </option>
              ))}
            </select>
          </div>

          <div className="text-[10px] text-zinc-400 font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-950">
            Ratio &gt; 1.0 = Buyer Dominance
          </div>
        </div>

        {/* TIME-SERIES OBI BAR CHART */}
        <div className="h-64 bg-zinc-50/60 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/60 p-4 flex items-end gap-2 relative overflow-hidden rounded-md shadow-inner">
          {tickFeed.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-[11px] text-zinc-400">
              {loading
                ? "Initializing tracking pipeline..."
                : "Waiting for background processor tick metrics..."}
            </div>
          ) : null}

          {tickFeed.map((tick, idx) => {
            // Scale bar height dynamically based on the OBI ratio weight
            const barHeight =
              ((tick.obi_ratio - minRatio) / ratioRange) * 85 + 5;

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center justify-end h-full group relative"
              >
                <div
                  style={{ height: `${barHeight}%` }}
                  className={`w-full transition-all duration-300 rounded-t-xs ${
                    tick.obi_ratio >= 1.0
                      ? "bg-zinc-400 dark:bg-zinc-500" // Stronger buy volume
                      : "bg-zinc-300/40 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700" // Sellers leading
                  }`}
                />

                <span className="text-[8px] font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-full">
                  {tick.time.split(":")[1]}:{tick.time.split(":")[2]}
                </span>

                {/* Enhanced Hover Tooltip */}
                <div className="absolute bottom-full mb-1 bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 text-[10px] p-2 rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 min-w-[120px] font-medium">
                  <div className="border-b border-zinc-700/40 dark:border-zinc-300 pb-1 mb-1 font-bold">
                    OBI Ratio: {tick.obi_ratio}
                  </div>
                  <div>LTP: ₹{tick.price}</div>
                  <div className="text-zinc-400 dark:text-zinc-600 text-[9px]">
                    Bids: {tick.buy_vol.toLocaleString()}
                  </div>
                  <div className="text-zinc-400 dark:text-zinc-600 text-[9px]">
                    Asks: {tick.sell_vol.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* METRICS STREAM LOG GRID */}
      <div className="lg:col-span-4 bg-[#fcfbfa] dark:bg-zinc-900/60 border border-zinc-300/50 dark:border-zinc-800/80 p-4 rounded-lg flex flex-col shadow-sm transition-all">
        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block border-b border-zinc-200/40 dark:border-zinc-800 pb-2 mb-2">
          Microstructure Feed Ticks
        </span>
        <div className="flex-1 overflow-y-auto max-h-[260px] flex flex-col gap-1 pr-0.5">
          {tickFeed
            .slice()
            .reverse()
            .map((tick, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-2 bg-zinc-50/50 dark:bg-zinc-950/40 rounded border border-zinc-200/40 dark:border-zinc-800/40 text-[11px]"
              >
                <span className="text-zinc-400 font-mono text-[10px]">
                  {tick.time}
                </span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  Ratio: {tick.obi_ratio.toFixed(2)}
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                    tick.obi_ratio >= 1.0
                      ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500"
                  }`}
                >
                  {tick.obi_ratio >= 1.0 ? "ACCUM" : "DIST"}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
