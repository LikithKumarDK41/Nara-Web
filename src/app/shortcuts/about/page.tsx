"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/providers/LocaleProvider";
import { useGlobalLoader } from "@/providers/LoaderProvider";

import { apiFetchAbouts } from "@/services/userGlobalservice";
import type { About } from "@/lib/types/userGlobal.types";
import { normalizeHTML } from "@/lib/utils";

export default function AboutGosePage() {
  const { t } = useLocale();
  const { show, hide } = useGlobalLoader();

  const [abouts, setAbouts] = useState<About[]>([]);
  const [activeTab, setActiveTab] = useState("about-gose-location");

  const tabs = [
    { key: "about-gose-location", label: "shortcut.about_tab_1" },
    { key: "about-gose-history", label: "shortcut.about_tab_2" },
    { key: "about-gose-logo", label: "shortcut.about_tab_3" },
  ];

  useEffect(() => {
    async function load() {
      try {
        show();
        const data = await apiFetchAbouts();
        setAbouts(data);
      } finally {
        hide();
      }
    }
    load();
  }, [show, hide]);

  const item = abouts.find((a) => a.name === activeTab);

  return (
    <div className="space-y-6">
      {/* ==== HERO SECTION ==== */}
      <section className="relative w-full mx-auto bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white rounded-2xl shadow-lg overflow-hidden">
        <div className="max-w-5xl mx-auto py-3 md:py-16 px-6 text-center">
          <h1 className="text-2xl md:text-5xl font-extrabold tracking-wide mb-3 drop-shadow-md">
            {t("shortcut.about")}
          </h1>
          <p className="text-sm md:text-xl font-medium opacity-90">
            {t("shortcut.about_desc")}
          </p>
        </div>

        {/* Subtle overlay for glow depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-black/5 to-black/20 rounded-2xl pointer-events-none" />
      </section>

      {/* ==== TAB BUTTONS ==== */}
      <div className="flex justify-center px-4">
        <div className="bg-white/70 dark:bg-white/10 rounded-full p-1 flex flex-wrap justify-center gap-1 shadow-lg backdrop-blur border border-orange-200 dark:border-orange-700">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`cursor-pointer px-5 md:px-7 py-2.5 rounded-full text-sm md:text-base font-medium transition-all duration-300
                ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white shadow-md"
                    : "text-gray-700 dark:text-gray-300 hover:bg-emerald-100/60 dark:hover:bg-white/10"
                }`}
            >
              {t(tab.label)}
            </button>
          ))}
        </div>
      </div>

      {/* ==== CONTENT AREA ==== */}
      <div className="px-4 md:px-10 lg:px-24">
        {item ? (
          <div
            key={item.name}
            className="animate-fade-slide rounded-2xl bg-white/80 dark:bg-white/10 backdrop-blur-lg 
                       p-6 md:p-10 shadow-xl transition-all duration-300"
          >
            {/* Image Section */}
            {item.image?.secure_url && (
              <img
                src={item.image.secure_url}
                alt={item.title}
                className="rounded-xl w-full h-auto max-h-[420px] object-contain mb-6"
              />
            )}

            {/* Content Section */}
            {(item.content?.brief || item.content?.extended) && (
              <div
                className="prose prose-sm md:prose-base dark:prose-invert text-slate-800 dark:text-slate-100 
                         max-w-none leading-relaxed tracking-wide whitespace-pre-wrap"
              >
                {item.content?.brief && (
                  <div
                    className=""
                    dangerouslySetInnerHTML={{
                      __html: normalizeHTML(item.content.brief),
                    }}
                  />
                )}
                {item.content?.extended && (
                  <div
                    className=""
                    dangerouslySetInnerHTML={{
                      __html: normalizeHTML(item.content.extended),
                    }}
                  />
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-300 py-6">
            {t("no_data")}
          </p>
        )}
      </div>
    </div>
  );
}
