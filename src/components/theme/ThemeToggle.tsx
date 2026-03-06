"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useLocale } from "@/providers/LocaleProvider";

type Mode = "light" | "dark";

function applyTheme(next: Mode) {
  const root = document.documentElement;
  root.setAttribute("data-theme", next);
  root.classList.toggle("dark", next === "dark");
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("light");
  const { t } = useLocale();

  useEffect(() => {
    // Default to 'light' if not set
    const stored = (localStorage.getItem("theme-mode") as Mode) || "light";
    setMode(stored);
    applyTheme(stored);
  }, []);

  const toggleTheme = () => {
    const next = mode === "light" ? "dark" : "light";
    setMode(next);
    localStorage.setItem("theme-mode", next);
    applyTheme(next);

    // 🔔 notify app
    window.dispatchEvent(new Event("theme-changed"));
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={mode === "light" ? t("actions.theme.dark") : t("actions.theme.light")}
      title={mode === "light" ? t("actions.theme.dark") : t("actions.theme.light")}
      className="
        h-9 w-9 flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer backdrop-blur-md shadow-sm
        
        /* ⚪ Light Mode */
        bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 hover:shadow-md

        /* ⚫ Dark Mode */
        dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100 dark:hover:bg-slate-700
      "
    >
      <div className="relative w-4 h-4">
        {/* Sun Icon - Visible in Light Mode */}
        <Sun
          className={`
            absolute inset-0 h-4 w-4 transform transition-all duration-500
            ${mode === "light" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}
          `}
        />

        {/* Moon Icon - Visible in Dark Mode */}
        <Moon
          className={`
            absolute inset-0 h-4 w-4 transform transition-all duration-500
            ${mode === "dark" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"}
          `}
        />
      </div>
    </button>
  );
}
