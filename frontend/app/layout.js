"use client";

import React, { useState, useEffect } from "react";
import "../app/globals.css";

export default function RootLayout({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <html lang="en" className={isDark ? "dark" : ""}>
      <body className="antialiased min-h-screen flex flex-col md:flex-row text-xs text-zinc-600 dark:text-zinc-400 transition-colors duration-150">
        {/* MUTED SIDEBAR ASIDE */}
        <aside className="w-full md:w-52 p-4 flex flex-col shrink-0 bg-[#ebeae6] dark:bg-zinc-900/40 border-b md:border-b-0 md:border-r border-zinc-300/60 dark:border-zinc-800/80 transition-all">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-zinc-300/40 dark:border-zinc-800">
            <div className="flex flex-col">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 tracking-tight flex items-center gap-1.5">
                <span className="h-2 w-2 bg-zinc-400 dark:bg-zinc-500 rounded-full inline-block"></span>
                QuantCore
              </span>
              <span className="text-[10px] text-zinc-400 mt-0.5">
                Workspace v2.4
              </span>
            </div>

            <button
              onClick={() => setIsDark(!isDark)}
              className="text-[10px] px-2 py-1 rounded border bg-[#f4f3ef] dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all cursor-pointer"
            >
              {isDark ? "Light" : "Dark"}
            </button>
          </div>

          <nav className="flex flex-col gap-0.5">
            <a
              href="/"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300/40 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all"
            >
              <span>Live Desk Monitor</span>
            </a>
            <a
              href="/trade-plans"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300/40 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all"
            >
              <span>Strategic Planner</span>
            </a>
            <a
              href="/charts"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300/40 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all"
            >
              <span>Tape Stream Feed</span>
            </a>
          </nav>

          <div className="mt-auto pt-3 border-t border-zinc-300/40 dark:border-zinc-800 text-[10px] text-zinc-400 flex justify-between items-center">
            <span>Status:</span>
            <span className="text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full"></span>{" "}
              Connected
            </span>
          </div>
        </aside>

        {/* MAIN DESK DISPLAY WORKSPACE */}
        <main className="flex-1 min-w-0 flex flex-col p-4 transition-all">
          {children}
        </main>
      </body>
    </html>
  );
}
