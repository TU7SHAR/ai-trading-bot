"use client";

import React, { useState, useEffect } from "react";
import "../app/globals.css";

export default function RootLayout({ children }) {
  const [isDark, setIsDark] = useState(true);

  // Synchronize state preferences with the global DOM element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <html lang="en" className={isDark ? "dark" : ""}>
      <body
        className={`antialiased font-mono transition-colors duration-300 min-h-screen flex flex-col md:flex-row ${
          isDark ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"
        }`}
      >
        {/* PERSISTENT MINIMALIST SIDEBAR CONTROL PANEL */}
        <aside
          className={`w-full md:w-64 border-b md:border-b-0 md:border-r p-6 flex flex-col shrink-0 transition-colors duration-300 ${
            isDark ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-200"
          }`}
        >
          {/* Workspace Ticker Label */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-tight tracking-widest uppercase">
                QUANT_LAB
              </span>
              <span className="text-[9px] text-zinc-400 font-sans tracking-wide">
                Terminal Workspace
              </span>
            </div>

            {/* STYLISH PILL-SHAPED RADIUS TOGGLE BUTTON */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all active:scale-95 flex items-center gap-1.5 ${
                isDark
                  ? "bg-white text-zinc-950 border-white hover:bg-zinc-200"
                  : "bg-zinc-950 text-white border-zinc-950 hover:bg-zinc-800"
              }`}
            >
              <span>{isDark ? "○ LIGHT" : "● DARK"}</span>
            </button>
          </div>

          {/* Navigation Anchors Layout */}
          <nav className="flex flex-col gap-1.5 flex-1 text-xs">
            <a
              href="/"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                isDark
                  ? "bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:text-white hover:border-zinc-700"
                  : "bg-zinc-100/70 border-zinc-200 text-zinc-600 hover:text-black hover:border-zinc-400"
              }`}
            >
              <span className="text-xs">01 //</span>
              <span className="font-medium tracking-wide">LIVE MONITOR</span>
            </a>
            <a
              href="/trade-plans"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                isDark
                  ? "bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:text-white hover:border-zinc-700"
                  : "bg-zinc-100/70 border-zinc-200 text-zinc-600 hover:text-black hover:border-zinc-400"
              }`}
            >
              <span className="text-xs">02 //</span>
              <span className="font-medium tracking-wide">AI PLANS</span>
            </a>
            <a
              href="/charts"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                isDark
                  ? "bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:text-white hover:border-zinc-700"
                  : "bg-zinc-100/70 border-zinc-200 text-zinc-600 hover:text-black hover:border-zinc-400"
              }`}
            >
              <span className="text-xs">03 //</span>
              <span className="font-medium tracking-wide">TAPE FEED</span>
            </a>
          </nav>

          {/* Network Connection Footprints */}
          <div className="mt-auto pt-4 border-t border-zinc-800 font-mono text-[9px] text-zinc-400 flex justify-between items-center">
            <span>SYS_STATUS:</span>
            <span
              className={
                isDark ? "text-white font-bold" : "text-zinc-950 font-bold"
              }
            >
              SYS_READY
            </span>
          </div>
        </aside>

        {/* PAGE CONTENT CONTAINER EXPOSURE GRID */}
        <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
