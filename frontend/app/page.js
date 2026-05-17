"use client";

import { useState } from "react";
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

  const API_URL = "http://localhost:8000";

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!symbol) return;

    setLoading(true);
    setError(null);
    setTrackStatus(null);
    setAnalysis(null);

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
      {/* Top Navigation */}
      <nav className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
          <Activity className="w-5 h-5 text-blue-600" />
          <span>TradeBrain</span>
        </div>
        <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          Market Status: Live
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto mt-16 px-6">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3 text-slate-900">
            Market Intelligence
          </h1>
          <p className="text-slate-500 text-lg">
            Track assets or run deep AI sentiment analysis in real-time.
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md mb-8">
          <form className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="Enter symbol (e.g. RELIANCE, TATSILV)"
                className="w-full pl-11 pr-4 py-3 bg-transparent border-none focus:ring-0 text-lg placeholder-slate-400 outline-none uppercase font-medium"
                required
              />
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

        {/* Loading State */}
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

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 border border-red-100 mb-6">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold">Connection Error</h4>
              <p className="text-sm opacity-90">
                {error}. Is your FastAPI backend running on port 8000?
              </p>
            </div>
          </div>
        )}

        {/* Tracking Result */}
        {trackStatus && (
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

        {/* Analysis Result */}
        {analysis && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 border-b border-slate-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">
                    AI Recommendation
                  </p>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {analysis.symbol}
                  </h3>
                </div>
                <div
                  className={`px-4 py-1.5 rounded-full font-bold text-sm tracking-wide ${
                    analysis.recommendation === "BUY"
                      ? "bg-green-100 text-green-700"
                      : analysis.recommendation === "SELL"
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {analysis.recommendation}
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-6 flex justify-between items-center">
              <span className="text-slate-500 font-medium">
                Confidence Score
              </span>
              <span className="font-mono text-lg font-semibold text-slate-700">
                {analysis.sentiment_score > 0 ? "+" : ""}
                {analysis.sentiment_score.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
