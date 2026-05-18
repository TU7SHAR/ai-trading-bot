"use strict";
"use client";

import React, { useState, useEffect } from "react";

export default function SmoothTickerCanvas() {
  const [activeFrame, setActiveFrame] = useState("1M");
  const [tickFeed, setTickFeed] = useState([]);

  useEffect(() => {
    let basePrice = 2450.0;
    const interval = setInterval(() => {
      const noise = (Math.random() - 0.5) * 4.5;
      basePrice = Math.round((basePrice + noise) * 100) / 100;
      const timestamp = new Date().toLocaleTimeString();

      setTickFeed((prev) => [
        {
          time: timestamp,
          price: basePrice,
          variation: noise >= 0 ? "UP" : "DOWN",
        },
        ...prev.slice(0, 16),
      ]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
      {/* HIGH DENSITY GRAPHS PANEL (8 UNITS) */}
      <div className="lg:col-span-8 bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl flex flex-col gap-4 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <h2 className="text-xs font-bold tracking-tight">
              // GRAPHIC_TAPE_FEED
            </h2>
            <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
              Asset context reference string: RELIANCE-EQ (NSE CASH)
            </p>
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-zinc-950 p-1 border border-zinc-200 dark:border-zinc-800 text-[9px] rounded-lg">
            {["1M", "5M", "15M", "1H", "1D"].map((tf) => (
              <button
                key={tf}
                onClick={() => setActiveFrame(tf)}
                className={`px-2 py-1 font-bold transition-all rounded-md ${
                  activeFrame === tf
                    ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950"
                    : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* REBUILT GRAPH: SOFT ROUNDED CAPS WITH A CLEAN MINIMAL INTERFACE */}
        <div className="h-72 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 flex items-end gap-2 relative overflow-hidden rounded-xl shadow-inner transition-colors duration-300">
          <div className="absolute top-3 left-3 text-[9px] text-zinc-400 bg-zinc-100/80 dark:bg-zinc-900/80 px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 font-sans">
            Time-Series Volatility Vector: Active
          </div>

          {tickFeed
            .slice()
            .reverse()
            .map((tick, idx) => {
              const h = Math.min(Math.max((tick.price - 2430) * 3.5, 8), 95);
              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative"
                >
                  <div
                    style={{ height: `${h}%` }}
                    className={`w-full transition-all duration-300 rounded-full ${
                      tick.variation === "UP"
                        ? "bg-zinc-950 dark:bg-zinc-100" // Up = solid black or white pill
                        : "bg-transparent border-2 border-zinc-300 dark:border-zinc-700 group-hover:border-zinc-400" // Down = subtle framed hollow container
                    }`}
                  />
                  <div className="absolute bottom-full mb-1.5 bg-zinc-900 text-white font-sans text-[8px] border border-zinc-700 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                    ₹{tick.price}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* REBUILT SPEED PRINT FEED DATA BLOCK (4 UNITS) */}
      <div className="lg:col-span-4 bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl flex flex-col transition-colors duration-300">
        <span className="text-[10px] text-zinc-400 uppercase block border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-2">
          High Frequency Order Log
        </span>
        <div className="flex-1 overflow-y-auto max-h-[300px] flex flex-col gap-1 text-[10px]">
          {tickFeed.map((tick, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center p-2 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm"
            >
              <span className="text-zinc-400">{tick.time}</span>
              <span className="font-bold">₹{tick.price}</span>
              <span
                className={`font-bold text-[9px] px-2 py-0.5 rounded-full border ${
                  tick.variation === "UP"
                    ? "bg-zinc-100 dark:bg-white text-zinc-950 border-transparent font-black"
                    : "bg-transparent text-zinc-400 border-zinc-300 dark:border-zinc-700"
                }`}
              >
                {tick.variation === "UP" ? "BID" : "ASK"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
