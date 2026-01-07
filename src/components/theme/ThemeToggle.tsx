"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, Monitor } from "lucide-react";
import { useLocale } from "@/providers/LocaleProvider";

type Mode = "light" | "dark" | "system";

function applyTheme(next: Mode) {
  const root = document.documentElement;
  root.setAttribute("data-theme", next);

  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const isDark = next === "dark" || (next === "system" && mq.matches);
  root.classList.toggle("dark", isDark);

  const KEY = "__theme_mql_listener__";
  const old = (root as any)[KEY];
  if (old) mq.removeEventListener("change", old);

  if (next === "system") {
    const handler = (e: MediaQueryListEvent) =>
      root.classList.toggle("dark", e.matches);
    mq.addEventListener("change", handler);
    (root as any)[KEY] = handler;
  }
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");
  const { t } = useLocale(); // ✅ add this

  useEffect(() => {
    const stored = (localStorage.getItem("theme-mode") as Mode) || "system";
    setMode(stored);
    applyTheme(stored);
  }, []);

  const onPick = (next: Mode) => {
    setMode(next);
    localStorage.setItem("theme-mode", next);
    applyTheme(next);

    // 🔔 notify app
    window.dispatchEvent(new Event("theme-changed"));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={t("actions.theme.change")}
          title={t("actions.theme.change")}
          className="
            flex items-center justify-center w-full h-full
            cursor-pointer focus:outline-none
            transition-all duration-300
          "
        >
          {/* Sun */}
          <Sun
            className="
              h-4 w-4
              rotate-0 scale-100
              transition-all
              dark:-rotate-90 dark:scale-0
            "
          />

          {/* Moon */}
          <Moon
            className="
              absolute h-4 w-4
              rotate-90 scale-0
              transition-all
              dark:rotate-0 dark:scale-100
            "
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="
          w-40
          backdrop-blur-md

          /* Light */
          bg-white/95
          border border-teal-500/20
          text-slate-700

          /* Dark */
          dark:bg-[#0f1214]/95
          dark:border-teal-400/20
          dark:text-slate-200
        "
      >
        <DropdownMenuItem
          onClick={() => onPick("light")}
          className="cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-600 dark:hover:text-teal-400 focus:bg-teal-50 dark:focus:bg-teal-900/30"
        >
          <Sun className="mr-2 h-4 w-4 text-teal-500" />
          {t("actions.theme.light")}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onPick("dark")}
          className="cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-600 dark:hover:text-teal-400 focus:bg-teal-50 dark:focus:bg-teal-900/30"
        >
          <Moon className="mr-2 h-4 w-4 text-teal-500" />
          {t("actions.theme.dark")}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onPick("system")}
          className="cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-600 dark:hover:text-teal-400 focus:bg-teal-50 dark:focus:bg-teal-900/30"
        >
          <Monitor className="mr-2 h-4 w-4 text-teal-500" />
          {t("actions.theme.system")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
