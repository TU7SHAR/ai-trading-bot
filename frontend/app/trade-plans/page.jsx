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
    <div className="p-6 max-w-6xl w-full mx-auto flex flex-col gap-6 font-mono text-xs text-zinc-900 dark:text-zinc-100">
      {/* PARAMETER CONFIGURATION TOOLBAR ROW */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl transition-colors">
        <div>
          <h2 className="font-bold tracking-tight">
            // ALGO_EXECUTION_PLANNER
          </h2>
          <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
            Parse live book liquidity imbalances into boundary bracket profiles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStock}
            onChange={(e) => {
              setSelectedStock(e.target.value);
              setPlan(null);
            }}
            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-zinc-400 cursor-pointer text-zinc-900 dark:text-zinc-100"
          >
            <option value="RELIANCE-EQ">RELIANCE-EQ</option>
            <option value="SILVERBEES-EQ">SILVERBEES-EQ</option>
            <option value="TATSILV-EQ">TATSILV-EQ</option>
          </select>
          <button
            onClick={buildAiTradePlan}
            disabled={generating}
            className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-4 py-1.5 rounded-lg font-bold border border-transparent hover:opacity-80 transition-all disabled:opacity-30"
          >
            {generating ? "COMPILING_PLAN..." : "EXECUTE PLANNER"}
          </button>
        </div>
      </div>

      {plan ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
          {/* CONVICTION DATA VALUE ROWS */}
          <div className="lg:col-span-1 flex flex-col gap-4 font-mono text-xs text-zinc-900 dark:text-zinc-100">
            <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl flex flex-col transition-colors">
              <span className="text-[9px] text-zinc-400">
                ENGINE_A DATA BIAS
              </span>
              <div className="flex justify-between items-center mt-2">
                <span className="font-bold">{plan.groq?.recommendation}</span>
                <span className="text-zinc-400">
                  ({plan.groq?.sentiment_score})
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl flex flex-col transition-colors">
              <span className="text-[9px] text-zinc-400">
                ENGINE_B DATA BIAS
              </span>
              <div className="flex justify-between items-center mt-2">
                <span className="font-bold">{plan.gemini?.recommendation}</span>
                <span className="text-zinc-400">
                  ({plan.gemini?.sentiment_score})
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl flex flex-col gap-2.5 text-[11px] transition-colors">
              <span className="text-[9px] text-zinc-400 uppercase block border-b border-zinc-200 dark:border-zinc-800 pb-1">
                Risk Ticket Bounds
              </span>
              <div className="flex justify-between text-zinc-400">
                <span>LIMIT_ENTRY_POINT:</span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  Auto-Market
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>PROFIT_OBJECTIVE:</span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  +2.40% Scalp
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>LIQUIDATION_SL:</span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  -0.85% Tight
                </span>
              </div>
            </div>
          </div>

          {/* ANALYSIS VERBOSE BLOCK PANEL */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl flex flex-col transition-colors">
            <span className="text-[10px] font-mono text-zinc-400 uppercase block border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">
              Consolidated Multi-Factor Consensus Report
            </span>
            <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans rounded-xl whitespace-pre-wrap flex-1 max-h-[380px] overflow-y-auto shadow-inner">
              {plan.gemini?.reasoning || plan.groq?.reasoning}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900/10 border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center flex flex-col items-center justify-center min-h-[300px] rounded-xl transition-colors">
          <span className="text-zinc-400 uppercase font-bold tracking-wider text-[10px]">
            [ STRATEGY GENERATOR SYSTEM IDLE ]
          </span>
          <p className="text-zinc-400 font-sans max-w-xs mt-1.5 leading-relaxed">
            Select a script tracking component profile string name variant
            template from the selection option box menu array context layer
            module parameters above.
          </p>
        </div>
      )}
    </div>
  );
}
