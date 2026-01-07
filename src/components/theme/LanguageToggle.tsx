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
      className="flex items-center justify-center w-full h-full cursor-pointer focus:outline-none"
    >
      {/* 🌐 Icon */}
      <Languages className="h-5 w-5 text-current" />

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
