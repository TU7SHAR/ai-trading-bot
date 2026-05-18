"use client";

import React, { useState, useEffect } from "react";
import "../app/globals.css";

export default function RootLayout({ children }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <html lang="en" className={isDark ? "dark" : ""}>
      <body className="antialiased min-h-screen flex flex-col md:flex-row font-mono text-xs text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-150">
        {/* PERSISTENT SYSTEM FRAME SIDEBAR */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r p-6 flex flex-col shrink-0 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 transition-colors duration-150">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
              <span className="font-bold tracking-wider">QUANT_CORE</span>
              <span className="text-[10px] text-zinc-400 mt-0.5">
                Workspace Node v2.4
              </span>
            </div>

            <button
              onClick={() => setIsDark(!isDark)}
              className="text-[10px] font-bold px-3 py-1 border rounded bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-zinc-100 text-zinc-900 dark:text-zinc-100 transition-colors"
            >
              {isDark ? "LIGHT_MODE" : "DARK_MODE"}
            </button>
          </div>

          <nav className="flex flex-col gap-1 text-[11px]">
            <a
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded border bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/80 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
            >
              <span>01 /</span>
              <span>LIVE_DESK_MONITOR</span>
            </a>
            <a
              href="/trade-plans"
              className="flex items-center gap-2 px-3 py-2 rounded border bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/60 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
            >
              <span>02 /</span>
              <span>STRATEGIC_PLANNER</span>
            </a>
            <a
              href="/charts"
              className="flex items-center gap-2 px-3 py-2 rounded border bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/60 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
            >
              <span>03 /</span>
              <span>TAPE_STREAM_FEED</span>
            </a>
          </nav>

          <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800 text-[9px] text-zinc-400 flex justify-between items-center">
            <span>CONN_STATUS:</span>
            <span className="font-bold text-zinc-900 dark:text-white">
              ESTABLISHED
            </span>
          </div>
        </aside>

        {/* INHERITED WORKSPACE FRAME DISPLAY AREA */}
        <main className="flex-1 min-w-0 flex flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors duration-150">
          {children}
        </main>
      </body>
    </html>
  );
}
