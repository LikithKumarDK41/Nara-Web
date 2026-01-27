"use client";

import Link from "next/link";
import { useLocale } from "@/providers/LocaleProvider";
import BrandLogo from "./BrandLogo";

export default function FooterBar() {
  const { t } = useLocale();

  return (
    <footer className="relative border-t border-border bg-background/80 backdrop-blur">
      {/* Top gradient line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500" />

      <div className="mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-between">

          {/* ✅ Brand Logo — SAME AS HEADER */}
          <BrandLogo />
        </div>

        {/* Copyright */}
        <div
          className="
            mt-6 flex flex-col items-center text-center gap-2
            border-t pt-4 text-xs text-muted-foreground
            md:flex-row md:justify-between md:text-left
          "
        >
          <div>{t("footer.copyright", { year: new Date().getFullYear() })}</div>

          <div className="flex gap-3">
          <Link href="/privacy-policy" className="hover:text-foreground transition">
            {t("privacyPolicy")}
          </Link>
           <Link href="/terms-of-use" className="hover:text-foreground transition">
            {t("termsOfUse")}
          </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
