"use client";

import React from "react";
import { useLocale } from "@/providers/LocaleProvider";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function PrivacyPolicyPage() {
  const { t, locale } = useLocale();

  return (
    <div className="space-y-6">
      {/* ===== HERO SECTION ===== */}
      <section
        className="mb-4
    w-full
    rounded-3xl
    bg-gradient-to-br
    from-teal-600 via-cyan-600 to-emerald-700
    dark:from-[#0a1f2e] dark:via-[#1a3a4a] dark:to-[#2d5a6f]
    px-6 sm:px-10 md:px-16 lg:px-20
    py-4 md:py-6 lg:py-8
    relative
    overflow-hidden
  "
      >
        {/* Animated gradient orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[150px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-300/10 blur-[140px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/4" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Content */}
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          {/* Overline */}
          <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 backdrop-blur-md">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-300 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-semibold text-white/80 tracking-wider uppercase">
              {t("nara_heritage")}
            </span>
          </div>

          {/* Main title - Enhanced typography */}
          <h1
            className="
        text-xl sm:text-2xl md:text-3xl lg:text-4xl
        font-black
        text-white
        tracking-tight
        leading-[1.1]
        mt-2 mb-2
        drop-shadow-lg
      "
          >
            {t("privacy.title")}
          </h1>

          {/* Decorative accent line */}
          <div className="flex items-center justify-center gap-3 my-2">
            <div className="h-0.5 w-8 bg-gradient-to-r from-teal-300 to-cyan-300 rounded-full" />
            <span className="text-white/60 text-xs font-medium">✦</span>
            <div className="h-0.5 w-8 bg-gradient-to-l from-teal-300 to-cyan-300 rounded-full" />
          </div>

          {/* Subtitle with stats */}
          <p
            className="
        text-xs sm:text-sm md:text-base
        text-white/80
        max-w-3xl mx-auto
        leading-relaxed
        font-light
      "
          >
            {t("privacy.updated")}:{" "}
            {locale == "en" ? "2025-01-01" : "2025年1月1日"}
          </p>
        </div>
      </section>

      {/* BREADCRUMB */}
      <div className="mt-2 flex justify-start">
        <Breadcrumb
          items={[
            { label: t("privacy.title") || "Privacy Policy" },
          ]}
        />
      </div>

      <div className="sm:px-6">
        {/* Sections */}
        <div className="bg-white dark:bg-[#15191f] border border-slate-200/80 dark:border-slate-700/60 p-8 rounded-2xl shadow-md">
          <PolicySection
            title={t("privacy.general.title")}
            desc={t("privacy.general.desc")}
          />
          <PolicySection
            title={t("privacy.jurisdiction.title")}
            desc={t("privacy.jurisdiction.desc")}
          />
          <PolicySection
            title={t("privacy.account.title")}
            desc={t("privacy.account.desc")}
          />
          <PolicySection
            title={t("privacy.features.title")}
            desc={t("privacy.features.desc")}
          />
          <PolicySection
            title={t("privacy.analytics.title")}
            desc={t("privacy.analytics.desc")}
          />
          <PolicySection
            title={t("privacy.usage.title")}
            desc={t("privacy.usage.desc")}
          />
          <PolicySection
            title={t("privacy.security.title")}
            desc={t("privacy.security.desc")}
          />
          <PolicySection
            title={t("privacy.location.title")}
            desc={t("privacy.location.desc")}
          />
          <PolicySection
            title={t("privacy.contact.title")}
            desc={t("privacy.contact.desc")}
          />
        </div>
      </div>
    </div>
  );
}

/* ✅ Reusable Section Component */
function PolicySection({ title, desc }: { title: string; desc: string }) {
  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-700 dark:text-teal-300 underline hover:opacity-80"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <section className="mb-6">
      <h2 className="text-xl md:text-2xl font-bold text-teal-700 dark:text-teal-300 mb-3 border-b pb-2">
        {title}
      </h2>
      <p className="leading-relaxed whitespace-pre-line text-slate-600 dark:text-slate-200">
        {renderTextWithLinks(desc)}
      </p>
    </section>
  );
}
