"use client";

import Link from "next/link";
import { useLocale } from "@/providers/LocaleProvider";
import Image from "next/image";

export default function FooterBar() {
  const { t } = useLocale();

  return (
    <footer className="relative border-t border-border bg-background/80 backdrop-blur">
      {/* Top gradient line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500" />

      <div className="mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-between">

          {/* ✅ Brand Logo — SAME AS HEADER */}
          <Link
            href="/"
            aria-label="Nara Kofun & Heritage Foundation"
            className="group inline-flex items-center focus:outline-none"
          >
            {/* 🟠 Gradient Badge */}
            <div
              className="
                relative flex items-center justify-center
                h-11 w-11 rounded-full
                bg-gradient-to-br from-teal-500 via-cyan-500 to-emerald-400
                shadow-[0_0_14px_rgba(20,184,166,0.45)]
              "
            >
              {/* Inner circle */}
              <div
                className="
                  h-10 w-10 rounded-full
                  bg-white dark:bg-black
                  flex items-center justify-center
                "
              >
                <Image
                  src="/logos/gose_logo.png"
                  alt="Nara Kofun & Heritage Foundation"
                  width={44}
                  height={44}
                  priority
                  className="object-contain"
                />
              </div>
            </div>

            {/* Divider */}
            <span
              className="
                mx-3 h-8 w-px
                bg-gradient-to-b
                from-transparent via-teal-400/70 to-transparent
              "
            />

            {/* Text */}
            <div className="flex flex-col leading-tight select-none">
              <span
                className="
                  text-[15px] font-bold tracking-wide
                  bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-400
                  bg-clip-text text-transparent
                "
              >
                御所市観光ナビ
              </span>

              <span className="text-[12px] tracking-wide text-gray-600 dark:text-gray-300">
                Nara Kofun & Heritage Foundation
              </span>
            </div>
          </Link>
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

          <Link href="/privacy-policy" className="hover:text-foreground transition">
            {t("privacyPolicy")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
