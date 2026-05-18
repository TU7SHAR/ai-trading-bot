"use strict";
"use client";

import React, { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function TradePlansConsole() {
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
    <div className="p-6 max-w-6xl w-full mx-auto flex flex-col gap-6 font-mono text-xs">
      {/* HEADER ROW BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl transition-colors duration-300">
        <div>
          <h2 className="text-sm font-bold tracking-tight">
            // STRATEGIC_COMPILATION_ROOM
          </h2>
          <p className="text-[10px] text-zinc-400 font-sans mt-1">
            Extract order book liquidity imbalances to plot trailing matrix
            brackets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStock}
            onChange={(e) => {
              setSelectedStock(e.target.value);
              setPlan(null);
            }}
            className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-zinc-500 cursor-pointer"
          >
            <option value="RELIANCE-EQ">RELIANCE-EQ</option>
            <option value="SILVERBEES-EQ">SILVERBEES-EQ</option>
            <option value="TATSILV-EQ">TATSILV-EQ</option>
          </select>
          <button
            onClick={buildAiTradePlan}
            disabled={generating}
            className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border border-transparent font-bold px-4 py-2 rounded-xl transition-all hover:opacity-90 disabled:opacity-40"
          >
            {generating ? "COMPILING..." : "BUILD STRATEGY"}
          </button>
        </div>
      </div>

      {plan ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
          {/* RISK CARD STACKS UNITS */}
          <div className="lg:col-span-1 flex flex-col gap-4 font-mono text-xs">
            <div className="bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl flex flex-col">
              <span className="text-[9px] text-zinc-400">
                MODEL_A ALGO BIAS
              </span>
              <div className="flex justify-between items-center mt-2">
                <span className="font-bold">{plan.groq?.recommendation}</span>
                <span className="text-zinc-400">
                  ({plan.groq?.sentiment_score})
                </span>
              </div>
            </div>

            <div className="bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl flex flex-col">
              <span className="text-[9px] text-zinc-400">
                MODEL_B ALGO BIAS
              </span>
              <div className="flex justify-between items-center mt-2">
                <span className="font-bold">{plan.gemini?.recommendation}</span>
                <span className="text-zinc-400">
                  ({plan.gemini?.sentiment_score})
                </span>
              </div>
            </div>

            <div className="bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl flex flex-col gap-2.5 text-[11px]">
              <span className="text-[9px] text-zinc-400 uppercase block border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                Simulation Ticket
              </span>
              <div className="flex justify-between text-zinc-400">
                <span>LIMIT_ENTRY:</span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  Auto-Market
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>PROFIT_TARGET:</span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  +2.40% Scalp
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>PROTECTION_SL:</span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  -0.85% Tight
                </span>
              </div>
            </div>
          </div>

          {/* MAIN NARRATIVE ANALYTICS TEXT CARDS */}
          <div className="lg:col-span-2 bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl flex flex-col transition-colors duration-300">
            <span className="text-[10px] font-mono text-zinc-400 uppercase block border-b border-zinc-200 dark:border-zinc-800 pb-2.5 mb-3">
              Consolidated Model Risk Assessment Report
            </span>
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans rounded-xl whitespace-pre-wrap flex-1 max-h-[380px] overflow-y-auto shadow-inner">
              {plan.gemini?.reasoning || plan.groq?.reasoning}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-100/20 dark:bg-zinc-900/10 border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center flex flex-col items-center justify-center min-h-[300px] rounded-2xl">
          <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">
            [ COMPILATION_WORKSPACE_IDLE ]
          </span>
          <p className="text-xs text-zinc-400 font-sans max-w-xs mt-1.5 leading-relaxed">
            Select a specific targeting vector asset parameter string from the
            system command console menu header above to initialize assessment
            layout logic.
          </p>
        </div>
      )}
    </div>
  );
}
