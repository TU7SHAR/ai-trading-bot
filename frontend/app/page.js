"use strict";
"use client";

import React, { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LiveMonitorRoom() {
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
    <div className="p-6 max-w-7xl w-full mx-auto flex flex-col gap-6 font-sans">
      {/* HEADER HERO ROW CONTAINER */}
      <header className="border p-6 rounded-2xl bg-zinc-100/50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors duration-300">
        <div>
          <h2 className="text-md font-bold tracking-tight font-mono">
            // REALTIME_ASSET_MONITOR
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Cross-reference order depth vectors with generative risk parameters.
          </p>
        </div>
        <div className="text-[10px] font-mono border px-3 py-1.5 rounded-full bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
          NODE: <span className="font-bold">{API_URL}</span>
        </div>
      </header>

      {/* COMPONENT STREAM MATRIX VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN COMPILATIONS */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* LOOKUP SEARCH MODULE */}
          <div className="bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl relative transition-colors duration-300">
            <span className="text-[10px] font-mono text-zinc-400 block mb-2.5">
              REGISTRY SEARCH
            </span>
            <input
              type="text"
              placeholder="Type ticker symbol..."
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-all shadow-sm"
            />

            {suggestions.length > 0 && (
              <div className="absolute left-5 right-5 mt-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
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
                    className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer flex flex-col"
                  >
                    <span className="text-xs font-bold font-mono">
                      {item.symbol}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-sans truncate mt-0.5">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* WATCHED TOKENS MATRICES */}
          <div className="bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl flex-1 flex flex-col transition-colors duration-300">
            <span className="text-[10px] font-mono text-zinc-400 block mb-3">
              WORKSPACE RADAR
            </span>
            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[480px]">
              {watchlist.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 border rounded-xl transition-all ${
                    selectedAsset === item.symbol
                      ? "bg-white dark:bg-zinc-900 border-zinc-400 dark:border-white shadow-md"
                      : "bg-white/40 dark:bg-black/20 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold font-mono block">
                      {item.symbol}
                    </span>
                    <span className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                      {item.description}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4 font-mono">
                    <button
                      onClick={() => triggerLiveTracking(item.symbol)}
                      className="text-[10px] border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-zinc-400 dark:hover:border-zinc-400 py-1.5 transition-all bg-white dark:bg-zinc-950"
                    >
                      TRACK
                    </button>
                    <button
                      onClick={() => executeQuantAnalysis(item.symbol)}
                      className="text-[10px] bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-lg font-bold border border-transparent py-1.5 transition-all hover:opacity-90"
                    >
                      ANALYZE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT ANALYST OUTPUT FIELD SHEETS */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-300">
            <div>
              <p className="text-[10px] font-mono text-zinc-400 uppercase">
                ACTIVE EVALUATION OBJECT
              </p>
              <h2 className="text-md font-bold font-mono tracking-tight mt-0.5">
                {selectedAsset}
              </h2>
            </div>
            {loading && (
              <span className="text-[10px] font-mono border border-zinc-400 dark:border-white px-3 py-1 rounded-full animate-pulse">
                GENERATING REGIN ASSESSMENT CODES...
              </span>
            )}
          </div>

          {analysis ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GROQ FRAME MODAL */}
              <div className="bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex flex-col transition-colors duration-300">
                <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-black/40 p-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-bold font-mono">
                      GROQ MODEL ANALYST
                    </h3>
                    <p className="text-[9px] font-mono text-zinc-400">
                      Llama-3.3 70B
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold border border-zinc-300 dark:border-zinc-700 px-2.5 py-0.5 rounded-full bg-white dark:bg-zinc-950">
                    {analysis.groq?.recommendation || "HOLD"}
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-3 flex-1 bg-white dark:bg-zinc-950">
                  <div className="bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl flex justify-between text-xs font-mono">
                    <span className="text-zinc-400">CONVICTION INDEX:</span>
                    <span className="font-bold">
                      {analysis.groq?.sentiment_score?.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed min-h-[220px] font-sans whitespace-pre-wrap">
                    {analysis.groq?.reasoning}
                  </div>
                </div>
              </div>

              {/* GEMINI FRAME MODAL */}
              <div className="bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex flex-col transition-colors duration-300">
                <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-black/40 p-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-bold font-mono">
                      GEMINI REGIME DESK
                    </h3>
                    <p className="text-[9px] font-mono text-zinc-400">
                      Flash-Lite 3.1
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold border border-zinc-300 dark:border-zinc-700 px-2.5 py-0.5 rounded-full bg-white dark:bg-zinc-950">
                    {analysis.gemini?.recommendation || "HOLD"}
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-3 flex-1 bg-white dark:bg-zinc-950">
                  <div className="bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl flex justify-between text-xs font-mono">
                    <span className="text-zinc-400">CONVICTION INDEX:</span>
                    <span className="font-bold">
                      {analysis.gemini?.sentiment_score?.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed min-h-[220px] font-sans whitespace-pre-wrap">
                    {analysis.gemini?.reasoning}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-100/20 dark:bg-zinc-900/10 rounded-2xl flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[380px]">
              <span className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-widest">
                [ INDEX VECTOR SYSTEM UNLIT ]
              </span>
              <p className="text-xs text-zinc-400 font-sans max-w-xs mt-2 leading-relaxed">
                Fire an evaluation matrix audit command from your watched
                metrics ledger to begin compiling quantitative logic fields.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
