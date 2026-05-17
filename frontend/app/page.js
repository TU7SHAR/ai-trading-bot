"use client";

import { useState, useRef, useEffect } from "react";
import {
  Activity,
  TrendingUp,
  Search,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [trackStatus, setTrackStatus] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef(null);

  const API_URL = "http://localhost:8000";

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (symbol.trim().length >= 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`${API_URL}/search/${symbol.trim()}`);
          if (res.ok) {
            const data = await res.json();
            setSuggestions(data);
            setShowDropdown(data.length > 0);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [symbol]);

  const selectSymbol = (selectedSymbol) => {
    setSymbol(selectedSymbol);
    setShowDropdown(false);
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!symbol) return;

    setLoading(true);
    setError(null);
    setTrackStatus(null);
    setAnalysis(null);
    setShowDropdown(false);

    try {
      const res = await fetch(`${API_URL}/track/${symbol}`);
      if (!res.ok) throw new Error("Failed to track symbol");
      const data = await res.json();
      setTrackStatus(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!symbol) return;

    setLoading(true);
    setError(null);
    setTrackStatus(null);
    setAnalysis(null);
    setShowDropdown(false);

    try {
      const res = await fetch(`${API_URL}/brain/analyze/${symbol}`);
      if (!res.ok) throw new Error("Failed to analyze symbol");
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <nav className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
          <Activity className="w-5 h-5 text-blue-600" />
          <span>TradeBrain</span>
        </div>
        <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          Live Connection: Active
        </div>
      </nav>

      <main className="max-w-3xl mx-auto mt-16 px-6">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3 text-slate-900">
            Market Intelligence
          </h1>
          <p className="text-slate-500 text-lg">
            Track assets or run deep AI sentiment analysis in real-time.
          </p>
        </div>

        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md mb-8">
          <form
            className="flex flex-col sm:flex-row gap-2 relative"
            ref={dropdownRef}
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                onFocus={() => {
                  if (suggestions.length > 0) setShowDropdown(true);
                }}
                placeholder="Search NSE symbols..."
                className="w-full pl-11 pr-4 py-3 bg-transparent border-none focus:ring-0 text-lg placeholder-slate-400 outline-none uppercase font-medium"
                autoComplete="off"
              />

              {showDropdown && (
                <ul className="absolute left-0 right-0 mt-3 z-20 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  {isSearching && suggestions.length === 0 ? (
                    <li className="px-5 py-4 text-slate-400 text-sm flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mr-2"></div>
                      Searching live market...
                    </li>
                  ) : (
                    suggestions.map((stock, idx) => (
                      <li
                        key={`${stock.symbol}-${idx}`}
                        onClick={() => selectSymbol(stock.symbol)}
                        className="px-5 py-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between border-b border-slate-100 last:border-0 transition-colors"
                      >
                        <span className="font-bold text-slate-900">
                          {stock.symbol}
                        </span>
                        <span className="text-sm text-slate-500 truncate ml-4">
                          {stock.name}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>

            <div className="flex gap-2 p-1">
              <button
                onClick={handleTrack}
                disabled={loading || !symbol}
                className="px-6 py-2 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Track Live
              </button>
              <button
                onClick={handleAnalyze}
                disabled={loading || !symbol}
                className="px-6 py-2 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Analyze
              </button>
            </div>
          </form>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-slate-500 text-sm font-medium">
                Processing request...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 border border-red-100 mb-6">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold">System Error</h4>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        )}

        {trackStatus && (
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full text-green-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-900">
                {trackStatus.symbol}
              </h3>
              <p className="text-slate-500">{trackStatus.status}</p>
            </div>
          </div>
        )}

        {analysis && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xl font-bold text-slate-800 px-1">
              Analysis Breakdown: {analysis.symbol}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                <div className="p-6 border-b border-slate-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">
                        Groq (Llama-3 70B)
                      </p>
                      <span
                        className={`inline-block mt-1 px-3 py-1 rounded-full font-bold text-xs tracking-wide ${
                          analysis.groq.recommendation === "BUY"
                            ? "bg-green-100 text-green-700"
                            : analysis.groq.recommendation === "SELL"
                              ? "bg-red-100 text-red-700"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {analysis.groq.recommendation}
                      </span>
                    </div>
                    <div className="font-mono text-lg font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg">
                      {analysis.groq.sentiment_score > 0 ? "+" : ""}
                      {analysis.groq.sentiment_score.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-slate-50/50 flex-1">
                  <p className="text-sm font-semibold text-slate-500 mb-1">
                    Reasoning Output
                  </p>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {analysis.groq.reasoning}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                <div className="p-6 border-b border-slate-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">
                        Gemini 3.1 Flash-Lite
                      </p>
                      <span
                        className={`inline-block mt-1 px-3 py-1 rounded-full font-bold text-xs tracking-wide ${
                          analysis.gemini.recommendation === "BUY"
                            ? "bg-green-100 text-green-700"
                            : analysis.gemini.recommendation === "SELL"
                              ? "bg-red-100 text-red-700"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {analysis.gemini.recommendation}
                      </span>
                    </div>
                    <div className="font-mono text-lg font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg">
                      {analysis.gemini.sentiment_score > 0 ? "+" : ""}
                      {analysis.gemini.sentiment_score.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-slate-50/50 flex-1">
                  <p className="text-sm font-semibold text-slate-500 mb-1">
                    Reasoning Output
                  </p>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {analysis.gemini.reasoning}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
