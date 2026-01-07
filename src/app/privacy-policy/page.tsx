"use client";

import React from "react";
import { useLocale } from "@/providers/LocaleProvider";

export default function PrivacyPolicyPage() {
  const { t, locale } = useLocale();

  return (
    <div className="space-y-6">
      {/* ===== HERO SECTION ===== */}
      <section className="relative w-full mx-auto bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white rounded-2xl shadow-xl overflow-hidden">
        <div className="max-w-5xl mx-auto py-3 md:py-16 px-6 text-center">
          <h1 className="text-2xl md:text-5xl font-extrabold tracking-wide mb-3 drop-shadow-md">
            {t("privacy.title")}
          </h1>
          <p className="text-sm md:text-xl font-medium opacity-90">
            {t("privacy.updated")}:{" "}
            {locale == "en" ? "2025-01-01" : "2025年1月1日"}
          </p>
        </div>
      </section>

      <div className="sm:px-6">
        {/* Sections */}
        <div className="bg-white/70 dark:bg-white/10 p-8 rounded-2xl shadow-md">
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
  return (
    <section className="mb-6">
      <h2 className="text-xl md:text-2xl font-bold text-amber-700 dark:text-amber-300 mb-3 border-b pb-2">
        {title}
      </h2>
      <p className="leading-relaxed whitespace-pre-line text-slate-600 dark:text-slate-200">
        {desc}
      </p>
    </section>
  );
}
