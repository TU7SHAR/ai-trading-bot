"use strict";
"use client";

import React, { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function PrimaryDeskMonitor() {
  const [symbol, setSymbol] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState("RELIANCE-EQ");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fallback initial list
  const [watchlist, setWatchlist] = useState([
    { symbol: "INDIA VIX", description: "Volatility Benchmark Index" },
    { symbol: "SILVERBEES-EQ", description: "Nippon India Silver ETF" },
    { symbol: "TATSILV-EQ", description: "Tata Capital Silver ETF" },
    { symbol: "RELIANCE-EQ", description: "Reliance Industries Equity" },
  ]);

  // 1. PERSISTENCE LAYER: Load saved symbols from storage on initialization
  useEffect(() => {
    const savedWatchlist = localStorage.getItem("quant_desk_watchlist");
    if (savedWatchlist) {
      try {
        setWatchlist(JSON.parse(savedWatchlist));
      } catch (err) {
        console.error("Failed parsing stored watchlist:", err);
      }
    }
  }, []);

  // Helper method to update state and save to local storage simultaneously
  const saveWatchlistUpdate = (updatedList) => {
    setWatchlist(updatedList);
    localStorage.setItem("quant_desk_watchlist", JSON.stringify(updatedList));
  };

  // Helper method to remove an asset from your active layout matrix
  const removeAssetFromWatchlist = (symToRemove) => {
    const filtered = watchlist.filter((item) => item.symbol !== symToRemove);
    saveWatchlistUpdate(filtered);
  };

  useEffect(() => {
    if (!symbol.trim()) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`${API_URL}/search/${symbol.trim()}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [symbol]);

  const triggerLiveTracking = async (tgtSymbol) => {
    try {
      await fetch(`${API_URL}/track/${tgtSymbol}`);
    } catch (err) {
      console.error(err);
    }
  };

  const executeQuantAnalysis = async (tgtSymbol) => {
    setLoading(true);
    setSelectedAsset(tgtSymbol);
    try {
      const res = await fetch(`${API_URL}/brain/analyze/${tgtSymbol}`);
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto flex flex-col gap-3 text-zinc-600 dark:text-zinc-400">
      {/* STATUS GATEWAY PANEL */}
      <header className="p-3.5 rounded-lg bg-[#fcfbfa] dark:bg-zinc-900/60 border border-zinc-300/50 dark:border-zinc-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 transition-all">
        <div>
          <h2 className="font-semibold text-xs text-zinc-800 dark:text-zinc-200">
            Data Stream Gateway
          </h2>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            Real-time gateway routing endpoint validation matrix nodes.
          </p>
        </div>
        <div className="text-[10px] px-2.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-950 text-zinc-500 border border-zinc-200 dark:border-zinc-800/80">
          Node: <span className="font-mono">{API_URL}</span>
        </div>
      </header>

      {/* GRID CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* INPUT FILTER */}
          <div className="bg-[#fcfbfa] dark:bg-zinc-900/60 border border-zinc-300/50 dark:border-zinc-800/80 p-3.5 rounded-lg relative">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Asset Filter
            </span>
            <input
              type="text"
              placeholder="Search symbol..."
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 focus:outline-none focus:border-zinc-400 text-xs text-zinc-800 dark:text-zinc-200"
            />

            {suggestions.length > 0 && (
              <div className="absolute left-3.5 right-3.5 mt-1 bg-[#fcfbfa] dark:bg-zinc-950 border border-zinc-300/60 dark:border-zinc-800 rounded shadow-md z-50 max-h-40 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                {suggestions.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSymbol("");
                      setSuggestions([]);
                      if (!watchlist.some((w) => w.symbol === item.symbol)) {
                        // Persist updates cleanly to internal memory and local storage
                        saveWatchlistUpdate([
                          ...watchlist,
                          { symbol: item.symbol, description: item.name },
                        ]);
                      }
                    }}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer flex flex-col"
                  >
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      {item.symbol}
                    </span>
                    <span className="text-[10px] text-zinc-400 truncate">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MONITOR WATCHLIST DISPLAY */}
          <div className="bg-[#fcfbfa] dark:bg-zinc-900/60 border border-zinc-300/50 dark:border-zinc-800/80 p-3.5 rounded-lg flex-1 flex flex-col">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
              Watchlist Deck
            </span>
            <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[380px]">
              {watchlist.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 border rounded transition-all relative group ${
                    selectedAsset === item.symbol
                      ? "bg-zinc-200/50 dark:bg-zinc-800/60 border-zinc-400 dark:border-zinc-600"
                      : "bg-zinc-50/60 dark:bg-zinc-950/20 border-zinc-200/60 dark:border-zinc-800/40 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">
                        {item.symbol}
                      </span>
                      <span className="text-[10px] text-zinc-400 line-clamp-1">
                        {item.description}
                      </span>
                    </div>
                    {/* Delete item click target handler */}
                    <button
                      onClick={() => removeAssetFromWatchlist(item.symbol)}
                      className="text-[10px] text-zinc-300 hover:text-rose-500 transition-colors font-bold cursor-pointer px-1"
                      title="Remove asset"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    <button
                      onClick={() => triggerLiveTracking(item.symbol)}
                      className="flex-1 border border-zinc-300 dark:border-zinc-700 rounded hover:bg-white dark:hover:bg-zinc-800 py-0.5 font-medium text-[10px] text-zinc-600 dark:text-zinc-400 cursor-pointer"
                    >
                      Track
                    </button>
                    <button
                      onClick={() => executeQuantAnalysis(item.symbol)}
                      className="flex-1 bg-zinc-700 dark:bg-zinc-300 text-white dark:text-zinc-900 rounded font-medium py-0.5 text-[10px] hover:opacity-90 cursor-pointer"
                    >
                      Analyze
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ANALYSIS VIEW TIERS */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="bg-[#fcfbfa] dark:bg-zinc-900/60 border border-zinc-300/50 dark:border-zinc-800/80 p-3.5 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Evaluation Profile
              </p>
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-white mt-0.5">
                {selectedAsset}
              </h2>
            </div>
            {loading && (
              <span className="text-[10px] text-zinc-500 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded animate-pulse">
                Evaluating models...
              </span>
            )}
          </div>

          {analysis ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#fcfbfa] dark:bg-zinc-900/60 border border-zinc-300/50 dark:border-zinc-800/80 rounded-lg overflow-hidden flex flex-col">
                <div className="bg-zinc-100/50 dark:bg-zinc-950 p-2.5 border-b border-zinc-200/60 dark:border-zinc-800 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                      Engine A
                    </h3>
                    <p className="text-[9px] text-zinc-400">Llama-3.3 70B</p>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-600">
                    {analysis.groq?.recommendation || "HOLD"}
                  </span>
                </div>
                <div className="p-3 flex flex-col gap-2 flex-1">
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded border border-zinc-200/40 dark:border-zinc-800/80 flex justify-between text-[10px]">
                    <span className="text-zinc-400">Conviction Weight:</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      {analysis.groq?.sentiment_score?.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-zinc-50/40 dark:bg-zinc-950/20 p-2 rounded text-[11px] leading-relaxed min-h-[160px] whitespace-pre-wrap border border-zinc-200/40 dark:border-zinc-800/40 text-zinc-500 dark:text-zinc-400">
                    {analysis.groq?.reasoning}
                  </div>
                </div>
              </div>

              <div className="bg-[#fcfbfa] dark:bg-zinc-900/60 border border-zinc-300/50 dark:border-zinc-800/80 rounded-lg overflow-hidden flex flex-col">
                <div className="bg-zinc-100/50 dark:bg-zinc-950 p-2.5 border-b border-zinc-200/60 dark:border-zinc-800 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                      Engine B
                    </h3>
                    <p className="text-[9px] text-zinc-400">Flash-Lite 3.1</p>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-600">
                    {analysis.gemini?.recommendation || "HOLD"}
                  </span>
                </div>
                <div className="p-3 flex flex-col gap-2 flex-1">
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded border border-zinc-200/40 dark:border-zinc-800/80 flex justify-between text-[10px]">
                    <span className="text-zinc-400">Conviction Weight:</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      {analysis.gemini?.sentiment_score?.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-zinc-50/40 dark:bg-zinc-950/20 p-2 rounded text-[11px] leading-relaxed min-h-[160px] whitespace-pre-wrap border border-zinc-200/40 dark:border-zinc-800/40 text-zinc-500 dark:text-zinc-400">
                    {analysis.gemini?.reasoning}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-zinc-300 dark:border-zinc-800 bg-[#fcfbfa]/40 dark:bg-zinc-900/10 rounded-lg flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[260px]">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Log Vector Uninitialized
              </span>
              <p className="text-zinc-400 text-[10px] max-w-xs mt-1 leading-relaxed">
                Execute an assessment mapping array configuration from your
                watched parameters context above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
