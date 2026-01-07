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
      className="flex items-center justify-center w-full h-full cursor-pointer focus:outline-none"
    >
      <Notebook className="h-5 w-5 text-current" />
    </button>
  );
}
