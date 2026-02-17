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
  const { t } = useLocale();

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
            h-9 w-9 flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer backdrop-blur-md shadow-sm
            
            /* ⚪ Light Mode */
            bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 hover:shadow-md

            /* ⚫ Dark Mode */
            dark:bg-black/80 dark:border-slate-800 dark:text-white dark:hover:bg-slate-900
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
          bg-white
          border border-slate-200
          text-slate-900

          /* Dark */
          dark:bg-slate-950/90
          dark:border-slate-800
          dark:text-white
        "
      >
        <DropdownMenuItem
          onClick={() => onPick("light")}
          className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Sun className="mr-2 h-4 w-4" />
          {t("actions.theme.light")}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onPick("dark")}
          className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Moon className="mr-2 h-4 w-4" />
          {t("actions.theme.dark")}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onPick("system")}
          className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Monitor className="mr-2 h-4 w-4" />
          {t("actions.theme.system")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
