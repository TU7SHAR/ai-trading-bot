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

  const [watchlist, setWatchlist] = useState([
    { symbol: "INDIA VIX", description: "Volatility Benchmark Index" },
    { symbol: "SILVERBEES-EQ", description: "Nippon India Silver ETF" },
    { symbol: "TATSILV-EQ", description: "Tata Capital Silver ETF" },
    { symbol: "RELIANCE-EQ", description: "Reliance Industries Equity" },
  ]);

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
    <div className="p-6 max-w-7xl w-full mx-auto flex flex-col gap-6 text-zinc-900 dark:text-zinc-100">
      {/* MONITOR CONTROL STATUS BAR */}
      <header className="border p-5 rounded-xl bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
        <div>
          <h2 className="font-bold">// DATA_STREAM_GATEWAY</h2>
          <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
            Telemetry parser routing matrix endpoint node validation execution
            link.
          </p>
        </div>
        <div className="text-[9px] border px-3 py-1 rounded bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
          GATEWAY: <span className="font-bold">{API_URL}</span>
        </div>
      </header>

      {/* COMPONENT CONTENT LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SIDE ACTIONS BAR DECK */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* SCRIP SEARCH FILTER INPUT */}
          <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl relative transition-colors">
            <span className="text-[10px] text-zinc-400 block mb-2">
              INDEX TRACKER SELECTOR
            </span>
            <input
              type="text"
              placeholder="SEARCH SYMBOL..."
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-all text-zinc-900 dark:text-zinc-100"
            />

            {suggestions.length > 0 && (
              <div className="absolute left-5 right-5 mt-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl z-50 max-h-44 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                {suggestions.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSymbol("");
                      setSuggestions([]);
                      if (!watchlist.some((w) => w.symbol === item.symbol)) {
                        setWatchlist([
                          ...watchlist,
                          { symbol: item.symbol, description: item.name },
                        ]);
                      }
                    }}
                    className="p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer flex flex-col"
                  >
                    <span className="font-bold">{item.symbol}</span>
                    <span className="text-[10px] text-zinc-400 font-sans truncate">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTIVE WATCHLIST SYSTEM MATRIX GRID */}
          <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl flex-1 flex flex-col transition-colors">
            <span className="text-[10px] text-zinc-400 block mb-3">
              SYSTEM DESK WATCHLIST
            </span>
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[440px]">
              {watchlist.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 border rounded-lg transition-all ${
                    selectedAsset === item.symbol
                      ? "bg-zinc-100 dark:bg-zinc-950 border-zinc-400 dark:border-zinc-200"
                      : "bg-zinc-50/50 dark:bg-black/10 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div>
                    <span className="font-bold block">{item.symbol}</span>
                    <span className="text-[10px] text-zinc-400 font-sans line-clamp-1 mt-0.5">
                      {item.description}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4 text-[9px]">
                    <button
                      onClick={() => triggerLiveTracking(item.symbol)}
                      className="border border-zinc-200 dark:border-zinc-700 rounded-md hover:border-zinc-400 dark:hover:border-zinc-500 py-1 bg-white dark:bg-zinc-900 transition-colors"
                    >
                      [ TRACK ]
                    </button>
                    <button
                      onClick={() => executeQuantAnalysis(item.symbol)}
                      className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-md font-bold py-1 transition-opacity hover:opacity-80"
                    >
                      [ ANALYZE ]
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT STRATEGIC EVALUATION MATRICES DISPLAY */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
            <div>
              <p className="text-[9px] text-zinc-400 uppercase">
                AUDIT MATRIX OBJECT REFERENCE
              </p>
              <h2 className="font-bold tracking-tight mt-0.5">
                {selectedAsset}
              </h2>
            </div>
            {loading && (
              <span className="border border-zinc-400 dark:border-zinc-200 px-3 py-1 rounded-md animate-pulse text-[9px]">
                CALCULATING COGNITIVE MODEL FIELD VALUES...
              </span>
            )}
          </div>

          {analysis ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GROQ ASSESSMENT LOG SHEET FILE */}
              <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col transition-colors">
                <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/30 p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">ENGINE_A // MODEL</h3>
                    <p className="text-[9px] text-zinc-400 font-sans">
                      Llama-3.3 70B
                    </p>
                  </div>
                  <span className="border border-zinc-300 dark:border-zinc-700 px-2 rounded bg-zinc-50 dark:bg-zinc-950 font-bold">
                    {analysis.groq?.recommendation || "HOLD"}
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-3 flex-1 bg-white dark:bg-zinc-950">
                  <div className="bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 p-2 rounded-lg flex justify-between">
                    <span className="text-zinc-400">NET CONVICTION VALUE:</span>
                    <span className="font-bold">
                      {analysis.groq?.sentiment_score?.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 p-4 rounded-lg text-zinc-500 dark:text-zinc-400 leading-relaxed min-h-[220px] font-sans whitespace-pre-wrap">
                    {analysis.groq?.reasoning}
                  </div>
                </div>
              </div>

              {/* GEMINI ASSESSMENT LOG SHEET FILE */}
              <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col transition-colors">
                <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/30 p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">ENGINE_B // MATRIX</h3>
                    <p className="text-[9px] text-zinc-400 font-sans">
                      Flash-Lite 3.1
                    </p>
                  </div>
                  <span className="border border-zinc-300 dark:border-zinc-700 px-2 rounded bg-zinc-50 dark:bg-zinc-950 font-bold">
                    {analysis.gemini?.recommendation || "HOLD"}
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-3 flex-1 bg-white dark:bg-zinc-950">
                  <div className="bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 p-2 rounded-lg flex justify-between">
                    <span className="text-zinc-400">NET CONVICTION VALUE:</span>
                    <span className="font-bold">
                      {analysis.gemini?.sentiment_score?.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 p-4 rounded-lg text-zinc-500 dark:text-zinc-400 leading-relaxed min-h-[220px] font-sans whitespace-pre-wrap">
                    {analysis.gemini?.reasoning}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 rounded-xl flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[350px]">
              <span className="text-zinc-400 uppercase font-bold tracking-wider text-[10px]">
                [ SYSTEM LOG VECTOR UNINITIALIZED ]
              </span>
              <p className="text-zinc-400 font-sans max-w-xs mt-2 leading-relaxed">
                Fire an execution assessment command array from yourwatched
                asset list component grid to run multi-factor data models.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
