"use client";

import { Languages } from "lucide-react";
import { useLocale } from "@/providers/LocaleProvider";
import { useGlobalLoader } from "@/providers/LoaderProvider";

export default function LanguageToggle() {
  const { locale, setLocale, t } = useLocale();
  const { show, hide } = useGlobalLoader();

  const cycle = async () => {
    const next = locale === "en" ? "ja" : "en";
    const start = Date.now();
    const MIN_DURATION = 800;

    try {
      show();
      await setLocale(next);
      window.dispatchEvent(new Event("locale-changed"));
    } finally {
      const elapsed = Date.now() - start;
      setTimeout(hide, Math.max(0, MIN_DURATION - elapsed));
    }
  };

  return (
    <button
      onClick={cycle}
      title={
        locale === "en"
          ? t("actions.switchToJapanese")
          : t("actions.switchToEnglish")
      }
      className="
        relative h-9 w-9 flex items-center justify-center rounded-full backdrop-blur-md shadow-sm cursor-pointer transition-all
        
        /* ⚪ Light Mode: White Bg + Black Icon */
        bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 hover:shadow-md

        /* ⚫ Dark Mode: Slate Bg + White Icon */
        dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100 dark:hover:bg-slate-700
      "
    >
      {/* 🌐 Icon */}
      <Languages className="h-4 w-4" />
    </button>
  );
}
