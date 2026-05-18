"use strict";
"use client";

import React, { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ExecutionPlansConsole() {
  const [selectedStock, setSelectedStock] = useState("RELIANCE-EQ");
  const [plan, setPlan] = useState(null);
  const [generating, setGenerating] = useState(false);

  const buildAiTradePlan = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${API_URL}/brain/analyze/${selectedStock}`);
      if (res.ok) {
        const data = await res.json();
        setPlan(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl w-full mx-auto flex flex-col gap-6 text-zinc-800 dark:text-zinc-100">
      {/* PARAMETER CONFIGURATION TOOLBAR ROW */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm transition-all">
        <div>
          <h2 className="font-extrabold text-xl text-zinc-900 dark:text-white tracking-tight">
            🎯 Algo Strategic Planner
          </h2>
          <p className="text-sm text-zinc-400 mt-0.5">
            Parse live order liquidity imbalances into boundary bracket profile
            parameters.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedStock}
            onChange={(e) => {
              setSelectedStock(e.target.value);
              setPlan(null);
            }}
            className="bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 focus:outline-none focus:border-orange-500 cursor-pointer text-sm font-semibold text-zinc-700 dark:text-zinc-200 shadow-sm"
          >
            <option value="RELIANCE-EQ">RELIANCE-EQ</option>
            <option value="SILVERBEES-EQ">SILVERBEES-EQ</option>
            <option value="TATSILV-EQ">TATSILV-EQ</option>
          </select>
          <button
            onClick={buildAiTradePlan}
            disabled={generating}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-sm shadow-orange-500/20 disabled:opacity-40 transition-all cursor-pointer shrink-0"
          >
            {generating ? "Compiling..." : "Execute Plan"}
          </button>
        </div>
      </div>

      {plan ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CONVICTION DATA VALUE ROWS */}
          <div className="lg:col-span-1 flex flex-col gap-4 text-zinc-800 dark:text-zinc-100">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl flex flex-col shadow-sm transition-all">
              <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">
                Engine A Bias
              </span>
              <div className="flex justify-between items-center mt-2">
                <span className="font-extrabold text-lg text-zinc-900 dark:text-white">
                  {plan.groq?.recommendation || "HOLD"}
                </span>
                <span className="text-sm font-bold bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-xl text-zinc-500 dark:text-zinc-400">
                  Score: {plan.groq?.sentiment_score}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl flex flex-col shadow-sm transition-all">
              <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">
                Engine B Bias
              </span>
              <div className="flex justify-between items-center mt-2">
                <span className="font-extrabold text-lg text-zinc-900 dark:text-white">
                  {plan.gemini?.recommendation || "HOLD"}
                </span>
                <span className="text-sm font-bold bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-xl text-zinc-500 dark:text-zinc-400">
                  Score: {plan.gemini?.sentiment_score}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl flex flex-col gap-3.5 text-sm shadow-sm transition-all">
              <span className="text-xs font-bold text-orange-500 uppercase tracking-wider block border-b border-zinc-100 dark:border-zinc-800 pb-2">
                Risk Management Boundaries
              </span>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                  Entry Baseline:
                </span>
                <span className="font-bold bg-orange-50 dark:bg-zinc-950 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-xl border border-orange-100 dark:border-zinc-800">
                  Auto-Market
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                  Profit Objective:
                </span>
                <span className="font-bold bg-emerald-50 dark:bg-zinc-950 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-xl border border-emerald-100 dark:border-zinc-800">
                  +2.40% Scalp
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                  Liquidation Stop:
                </span>
                <span className="font-bold bg-rose-50 dark:bg-zinc-950 text-rose-600 dark:text-rose-400 px-3 py-1 rounded-xl border border-rose-100 dark:border-zinc-800">
                  -0.85% Tight
                </span>
              </div>
            </div>
          </div>

          {/* ANALYSIS VERBOSE BLOCK PANEL */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl flex flex-col shadow-sm transition-all">
            <span className="text-xs font-bold text-orange-500 uppercase tracking-wider block border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
              Consolidated Multi-Factor Consensus Report
            </span>
            <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed rounded-2xl whitespace-pre-wrap flex-1 max-h-[380px] overflow-y-auto shadow-inner">
              {plan.gemini?.reasoning || plan.groq?.reasoning}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-12 text-center flex flex-col items-center justify-center min-h-[300px] rounded-3xl shadow-inner transition-all">
          <div className="text-4xl mb-2">📋</div>
          <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">
            Strategy Generator Idle
          </span>
          <p className="text-zinc-400 text-sm max-w-xs mt-2 leading-relaxed">
            Choose a tracking asset template profile from the parameter
            selection menus layer configuration above.
          </p>
        </div>
      )}
    </div>
  );
}
