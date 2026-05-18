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
      <body className="antialiased min-h-screen flex flex-col md:flex-row font-mono text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
        {/* PERSISTENT SYSTEM NAVIGATION SIDEBAR */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r p-6 flex flex-col shrink-0 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 transition-colors duration-200">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-widest uppercase">
                QUANT_DESK
              </span>
              <span className="text-[10px] text-zinc-400 font-sans mt-0.5">
                Terminal Node v2.4
              </span>
            </div>

            {/* THEME CONTROLLER TOGPLE BUTTON */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="text-[10px] font-bold px-3 py-1 rounded-xl border transition-all active:scale-95 bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 hover:border-zinc-950 dark:hover:border-white text-zinc-900 dark:text-zinc-100"
            >
              {isDark ? "MODE: LIGHT" : "MODE: DARK"}
            </button>
          </div>

          <nav className="flex flex-col gap-1 text-xs">
            <a
              href="/"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-zinc-50/50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800/60 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-600 transition-all"
            >
              <span>01 /</span>
              <span>LIVE CORE MONITOR</span>
            </a>
            <a
              href="/trade-plans"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-zinc-50/50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800/60 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-600 transition-all"
            >
              <span>02 /</span>
              <span>AI EXECUTION PLAN</span>
            </a>
            <a
              href="/charts"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-zinc-50/50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800/60 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-600 transition-all"
            >
              <span>03 /</span>
              <span>HIGH FREQ TAPE</span>
            </a>
          </nav>

          <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800 font-mono text-[9px] text-zinc-400 flex justify-between items-center">
            <span>SOCKET_STATUS:</span>
            <span className="font-bold text-zinc-900 dark:text-white">
              SYNCHRONIZED
            </span>
          </div>
        </aside>

        {/* WORKSPACE VIEW AREA */}
        <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
