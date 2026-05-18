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
    <div className="p-6 max-w-6xl w-full mx-auto flex flex-col gap-6 font-mono text-xs">
      {/* SELECTION PANEL DECK */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-100/60 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl transition-colors duration-200">
        <div>
          <h2 className="font-bold tracking-tight">
            // STRATEGIC_BRACKET_COMPILER
          </h2>
          <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
            Convert order sheet metric data indices into operational protection
            tickets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStock}
            onChange={(e) => {
              setSelectedStock(e.target.value);
              setPlan(null);
            }}
            className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-2 py-1.5 focus:outline-none focus:border-zinc-400 cursor-pointer text-zinc-900 dark:text-zinc-100"
          >
            <option value="RELIANCE-EQ">RELIANCE-EQ</option>
            <option value="SILVERBEES-EQ">SILVERBEES-EQ</option>
            <option value="TATSILV-EQ">TATSILV-EQ</option>
          </select>
          <button
            onClick={buildAiTradePlan}
            disabled={generating}
            className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-4 py-1.5 rounded-xl border border-transparent font-bold hover:opacity-80 transition-all disabled:opacity-30"
          >
            {generating ? "PROCESSING..." : "RUN STRATEGY"}
          </button>
        </div>
      </div>

      {plan ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CRITICAL CONVICTION BLOCKS CONTAINER */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="bg-zinc-100/60 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl flex flex-col bg-white dark:bg-zinc-950">
              <span className="text-[9px] text-zinc-400">
                ENGINE_A LOGIC BIAS
              </span>
              <div className="flex justify-between items-center mt-2 text-[11px]">
                <span className="font-bold">{plan.groq?.recommendation}</span>
                <span className="text-zinc-400">
                  ({plan.groq?.sentiment_score})
                </span>
              </div>
            </div>

            <div className="bg-zinc-100/60 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl flex flex-col bg-white dark:bg-zinc-950">
              <span className="text-[9px] text-zinc-400">
                ENGINE_B LOGIC BIAS
              </span>
              <div className="flex justify-between items-center mt-2 text-[11px]">
                <span className="font-bold">{plan.gemini?.recommendation}</span>
                <span className="text-zinc-400">
                  ({plan.gemini?.sentiment_score})
                </span>
              </div>
            </div>

            <div className="bg-zinc-100/60 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl flex flex-col gap-2.5 bg-white dark:bg-zinc-950 text-[11px]">
              <span className="text-[9px] text-zinc-400 uppercase block border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                Bracket Metrics
              </span>
              <div className="flex justify-between text-zinc-400">
                <span>LIMIT_TRIGGER:</span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  Auto-Market
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>TAKE_PROFIT_T1:</span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  +2.40% Scalp
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>STOP_PROTECTION:</span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  -0.85% Tight
                </span>
              </div>
            </div>
          </div>

          {/* SYSTEM NARRATIVE PARAGRAPH COMPONENT MODULE */}
          <div className="lg:col-span-2 bg-zinc-100/60 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl flex flex-col transition-colors duration-200">
            <span className="text-[10px] text-zinc-400 uppercase block border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">
              Consolidated Consensus Risk Assessment Report
            </span>
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans rounded-xl whitespace-pre-wrap flex-1 max-h-[380px] overflow-y-auto shadow-inner">
              {plan.gemini?.reasoning || plan.groq?.reasoning}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-100/20 dark:bg-zinc-900/10 border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center flex flex-col items-center justify-center min-h-[300px] rounded-2xl">
          <span className="text-zinc-400 uppercase font-bold">
            [ COMPILATION_WORKSPACE_STANDBY ]
          </span>
          <p className="text-zinc-400 font-sans max-w-xs mt-1.5 leading-relaxed">
            Select a target framework string component from the matrix console
            parameters above and run execution processes.
          </p>
        </div>
      )}
    </div>
  );
}
