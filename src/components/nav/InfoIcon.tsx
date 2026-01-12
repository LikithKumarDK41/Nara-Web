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
        h-9 w-9
        flex items-center justify-center
        rounded-full
        backdrop-blur-md
        transition-all duration-300
        cursor-pointer

        /* 🌞 Light mode */
        bg-white
        border border-teal-400/40
        text-teal-600
        hover:shadow-[0_0_10px_rgba(20,184,166,0.35)]

        /* 🌙 Dark mode */
        dark:bg-black/80
        dark:border-teal-400/40
        dark:text-teal-300
        dark:hover:shadow-[0_0_14px_rgba(45,212,191,0.55)]
      "
    >
      <Notebook className="h-4 w-4" />
    </button>
  );
}
