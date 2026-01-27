"use client";

import React, { useState } from "react";
import { useLocale } from "@/providers/LocaleProvider";

const blueprintItems = [
  {
    icon: "🏠",
    title: "blueprint_home",
    desc: "blueprint_home_desc",
    children: [
      {
        title: "blueprint_home_main_categories",
        desc: "blueprint_home_main_categories_desc",
        points: [
          "blueprint_home_main_categories_point_1",
          "blueprint_home_main_categories_point_2",
          "blueprint_home_main_categories_point_3",
        ],
      },
      {
        title: "blueprint_home_more_options",
        desc: "blueprint_home_more_options_desc",
        points: [
          "blueprint_home_more_options_point_1",
          "blueprint_home_more_options_point_2",
          "blueprint_home_more_options_point_3",
          "blueprint_home_more_options_point_4",
        ],
      },
      {
        title:"blueprint_about_kofun_title",
        desc:"blueprint_about_kofun_desc"
      },
      {
        title: "blueprint_home_tour_list",
        desc: "blueprint_home_tour_list_desc",
        points: [
          "blueprint_home_tour_list_point_1",
          "blueprint_home_tour_list_point_2",
          "blueprint_home_tour_list_point_3",
        ],
      },
      { title: "blueprint_global_header_my_list", desc: "blueprint_global_header_my_list_desc" },
      // { title: "blueprint_global_header_map", desc: "blueprint_global_header_map_desc" },
      // { title: "blueprint_home_global_search", desc: "blueprint_home_global_search_desc" },
      { title: "blueprint_home_video", desc: "blueprint_home_video_desc" },
    ],
  },
  {
    icon: "🗺️",
    title: "blueprint_tours",
    desc: "blueprint_tours_desc",
    children: [
      { title: "blueprint_tours_details", desc: "blueprint_tours_details_desc" },
      { title: "blueprint_tours_start", desc: "blueprint_tours_start_desc" },
      { title: "blueprint_tours_active", desc: "blueprint_tours_active_desc" },
      { title: "blueprint_tours_completion", desc: "blueprint_tours_completion_desc" },
    ],
  },
];

const appLimitations = [
  { title: "location.noGps.title", desc: "location.noGps.desc" },
  { title: "location.wifiAccuracy.title", desc: "location.wifiAccuracy.desc" },
  { title: "location.ethernet.title", desc: "location.ethernet.desc" },
  { title: "location.vpn.title", desc: "location.vpn.desc" },
  { title: "location.background.title", desc: "location.background.desc" },
  { title: "location.motion.title", desc: "location.motion.desc" },
];

export default function BlueprintPage() {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<"info" | "limits">("info");
  const [highlightTours, setHighlightTours] = useState(false);

  return (
    <div className="space-y-8">
      {/* ================= HERO ================= */}
      <section className="relative w-full mx-auto bg-gradient-to-r from-teal-500 via-teal-500 to-teal-500 text-white rounded-2xl shadow-xl overflow-hidden">
        <div className="max-w-5xl mx-auto py-3 md:py-16 px-6 text-center">
          <h1 className="text-2xl md:text-5xl font-extrabold tracking-wide mb-3 drop-shadow-md">
            {t("blueprint_title")}
          </h1>
          <p className="text-sm md:text-xl font-medium opacity-90">
            {t("blueprint_subtitle")}
          </p>
        </div>
      </section>

      {/* ================= TABS ================= */}
      <div className="flex justify-center">
        <div className="inline-flex gap-1 rounded-full p-1 border
          bg-white/70 border-orange-200
          dark:bg-slate-900/60 dark:border-slate-700">
          {["info", "limits"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`cursor-pointer px-5 py-2 rounded-full text-sm font-medium transition
                ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-teal-500 via-teal-500 to-teal-500 text-white shadow"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
            >
              {t(tab === "info" ? "blueprint_tab_app_info" : "blueprint_tab_app_restrictions")}
            </button>
          ))}
        </div>
      </div>

      {/* ================= INFO TAB ================= */}
      {activeTab === "info" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {blueprintItems.map((item, index) => (
              <div
                key={index}
                id={item.title === "blueprint_tours" ? "tours-section" : undefined}
                className={`rounded-xl border p-6 transition shadow-sm
                  ${
                    item.title === "blueprint_tours" && highlightTours
                      ? "border-teal-500 ring-2 ring-teal-400/60 bg-teal-50/60 dark:bg-teal-500/10"
                      : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/60"
                  }`}
              >
                <div className="text-3xl mb-3">{item.icon}</div>

                <h3
                  className={`text-lg font-semibold
                    text-teal-700 dark:text-teal-300
                    ${
                      item.title === "blueprint_home" || item.title === "blueprint_tours"
                        ? "cursor-pointer hover:underline"
                        : ""
                    }`}
                  onClick={() => {
                    if (item.title === "blueprint_tours") window.location.href = "/tours";
                    if (item.title === "blueprint_home") window.location.href = "/";
                  }}
                >
                  {t(item.title)}
                </h3>

                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {t(item.desc)}
                </p>

                {item.children && (
                  <div className="relative mt-6 pl-8 space-y-6">
                    {item.children.map((child, idx) => (
                      <div key={idx} className="relative">
                        {idx !== item.children.length - 1 && (
                          <span className="absolute left-[-15px] top-4 bottom-[-32px] w-px
                            bg-gradient-to-r from-teal-500 via-teal-500 to-teal-500" />
                        )}

                        <span className="absolute left-[-20px] top-2 w-3 h-3 rounded-full
                          bg-gradient-to-r from-teal-500 via-teal-500 to-teal-500" />

                        <p
                          className={`font-semibold
                            ${
                              child.title === "blueprint_home_tour_list"
                                ? "cursor-pointer text-teal-700 dark:text-teal-300 hover:underline"
                                : "text-slate-800 dark:text-slate-100"
                            }`}
                          onClick={() => {
                            if (child.title === "blueprint_home_tour_list") {
                              document
                                .getElementById("tours-section")
                                ?.scrollIntoView({ behavior: "smooth", block: "start" });

                              setHighlightTours(true);
                              setTimeout(() => setHighlightTours(false), 2500);
                            }
                          }}
                        >
                          {t(child.title)}
                        </p>

                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          {t(child.desc)}
                        </p>

                        {child.points && (
                          <ul className="mt-2 list-disc pl-5 text-sm
                            text-slate-600 dark:text-slate-400">
                            {child.points.map((p, i) => (
                              <li key={i}>{t(p)}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            {t("blueprint_footer_note")}
          </p>
        </>
      )}

      {/* ================= LIMITS TAB ================= */}
      {activeTab === "limits" && (
        <section className="max-w-4xl mx-auto rounded-2xl p-8 shadow-sm
          bg-white border border-red-200
          dark:bg-slate-900/60 dark:border-slate-700">
          <h2 className="text-2xl font-semibold text-teal-700 dark:text-teal-300">
            {t("applicationRestrictions.title")}
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
            {t("applicationRestrictions.desktopOnly")}
          </p>

          <div className="relative pl-8 space-y-8">
            {appLimitations.map((item, index, arr) => (
              <div key={index} className="relative">
                {index !== arr.length - 1 && (
                  <span className="absolute left-[-15px] top-4 bottom-[-40px] w-px
                    bg-slate-300 dark:bg-slate-700" />
                )}
                <span className="absolute left-[-20px] top-2 w-3 h-3 rounded-full bg-red-500" />
                <p className="font-medium text-slate-800 dark:text-slate-100">
                  {t(item.title)}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t(item.desc)}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs text-slate-500 dark:text-slate-400">
            {t("applicationRestrictions.browserLimitations")}
          </p>
        </section>
      )}
    </div>
  );
}
