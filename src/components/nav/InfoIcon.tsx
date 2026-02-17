"use client";

import { Notebook } from "lucide-react";
import { useLocale } from "@/providers/LocaleProvider";

export default function AppInfo() {
  const { t } = useLocale();

  return (
    <button
      onClick={() => (window.location.href = "/info")}
      aria-label={t("actions.info")}
      title={t("actions.info")}
      className="
        h-9 w-9 flex items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer shadow-sm
        
        /* ⚪ Light Mode */
        bg-white border border-slate-200 text-slate-900 hover:shadow-md hover:bg-slate-50

        /* ⚫ Dark Mode */
        dark:bg-black/80 dark:border-slate-800 dark:text-white dark:hover:bg-slate-900
      "
    >
      <Notebook className="h-4 w-4" />
    </button>
  );
}
