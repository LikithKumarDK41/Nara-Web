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
        relative
        h-9 w-9
        flex items-center justify-center
        rounded-full
        border border-teal-500/40
        bg-black/80
        backdrop-blur-md
        shadow
        cursor-pointer
        transition-all

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
      {/* 🌐 Icon */}
      <Languages className="h-4 w-4 text-teal-600 dark:text-teal-300" />

      {/* 🔖 TOP badge (shows NEXT language) */}
      {/* <span
        className="
          absolute -top-2 -right-1
          min-w-[18px] h-[18px]
          px-1
          flex items-center justify-center
          rounded-full
          text-[9px] font-bold
          text-black
          shadow

          bg-white
          border border-orange-400/40
          hover:shadow-[0_0_10px_rgba(251,146,60,0.35)]

          dark:bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400
        "
      >
        {locale === "en" ? "JP" : "EN"}
      </span> */}
    </button>
  );
}
