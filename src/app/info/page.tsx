"use client";

import React, { useState } from "react";
import { useLocale } from "@/providers/LocaleProvider";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Map,
  Info,
  List,
  Layers,
  Globe,
  Video,
  MapPin,
  Play,
  CheckCircle,
  AlertTriangle,
  Wifi,
  Monitor,
  ShieldAlert,
  MoreHorizontal,
  Navigation,
  MousePointerClick
} from "lucide-react";

// Lucide Icon Mapping
const itemIcons: Record<string, React.ReactNode> = {
  blueprint_home: <Home className="w-8 h-8" />,
  blueprint_tours: <Map className="w-8 h-8" />,

  // Child Icons (Generic fallbacks if needed)
  default: <Info className="w-5 h-5" />
};

const blueprintItems = [
  {
    icon: <Home className="w-10 h-10 text-teal-600 dark:text-teal-400" />,
    title: "blueprint_home",
    desc: "blueprint_home_desc",
    children: [
      {
        icon: <Info className="w-5 h-5" />,
        title: "blueprint_about_kofun_title",
        desc: "blueprint_about_kofun_desc",
      },
      {
        icon: <Layers className="w-5 h-5" />,
        title: "blueprint_home_main_categories",
        desc: "blueprint_home_main_categories_desc",
        points: [
          "blueprint_home_main_categories_point_1",
          "blueprint_home_main_categories_point_2",
          "blueprint_home_main_categories_point_3",
        ],
      },
      {
        icon: <MoreHorizontal className="w-5 h-5" />,
        title: "blueprint_home_more_options",
        desc: "blueprint_home_more_options_desc",
        points: [
          "blueprint_home_more_options_point_1",
          "blueprint_home_more_options_point_2",
          "blueprint_home_more_options_point_3",
          "blueprint_home_more_options_point_4",
          "blueprint_home_more_options_point_5",
          "blueprint_home_more_options_point_6",
        ],
      },
      {
        icon: <List className="w-5 h-5" />,
        title: "blueprint_home_tour_list",
        desc: "blueprint_home_tour_list_desc",
        points: [
          "blueprint_home_tour_list_point_1",
          "blueprint_home_tour_list_point_2",
          "blueprint_home_tour_list_point_3",
        ],
      },
      {
        icon: <CheckCircle className="w-5 h-5" />,
        title: "blueprint_global_header_my_list",
        desc: "blueprint_global_header_my_list_desc",
      },
      { icon: <Video className="w-5 h-5" />, title: "blueprint_home_video", desc: "blueprint_home_video_desc" },
    ],
  },
  {
    icon: <Map className="w-10 h-10 text-teal-600 dark:text-teal-400" />,
    title: "blueprint_tours",
    desc: "blueprint_tours_desc",
    children: [
      {
        icon: <Info className="w-5 h-5" />,
        title: "blueprint_tours_details",
        desc: "blueprint_tours_details_desc",
      },
      { icon: <Play className="w-5 h-5" />, title: "blueprint_tours_start", desc: "blueprint_tours_start_desc" },
      { icon: <Navigation className="w-5 h-5" />, title: "blueprint_tours_active", desc: "blueprint_tours_active_desc" },
      {
        icon: <CheckCircle className="w-5 h-5" />,
        title: "blueprint_tours_completion",
        desc: "blueprint_tours_completion_desc",
      },
    ],
  },
];

const appLimitations = [
  { icon: <Globe className="w-5 h-5 text-red-500" />, title: "location.noGps.title", desc: "location.noGps.desc" },
  { icon: <Wifi className="w-5 h-5 text-red-500" />, title: "location.wifiAccuracy.title", desc: "location.wifiAccuracy.desc" },
  { icon: <Monitor className="w-5 h-5 text-red-500" />, title: "location.ethernet.title", desc: "location.ethernet.desc" },
  { icon: <ShieldAlert className="w-5 h-5 text-red-500" />, title: "location.vpn.title", desc: "location.vpn.desc" },
  { icon: <MapPin className="w-5 h-5 text-red-500" />, title: "location.background.title", desc: "location.background.desc" },
  { icon: <MousePointerClick className="w-5 h-5 text-red-500" />, title: "location.motion.title", desc: "location.motion.desc" },
];

export default function BlueprintPage() {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<"info" | "limits">("info");
  const [highlightTours, setHighlightTours] = useState(false);

  return (
    <div className="min-h-screen space-y-8 pb-20">
      {/* ================= HERO (PRESERVED) ================= */}
      <section
        className="mb-4
    w-full
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
        font-serif italic
      "
          >
            {t("blueprint_title")}
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
            {t("blueprint_subtitle")}
          </p>
        </div>
      </section>

      {/* BREADCRUMB */}
      <div className="px-4 w-full">
        <Breadcrumb
          items={[
            { label: t("blueprint_title") || "Info" },
          ]}
        />

        {/* ================= TABS ================= */}
        <div className="mt-8 flex justify-center">
          <div className="relative inline-flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-full border border-slate-200 dark:border-slate-700/50 backdrop-blur-md">
            {["info", "limits"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`cursor-pointer relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors duration-300
                ${activeTab === tab
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-teal-600 rounded-full shadow-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">
                  {t(
                    tab === "info"
                      ? "blueprint_tab_app_info"
                      : "blueprint_tab_app_restrictions",
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ================= CONTENT AREA ================= */}
        <div className="mt-10">
          <AnimatePresence mode="wait">
            {activeTab === "info" ? (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                {blueprintItems.map((item, index) => (
                  <div
                    key={index}
                    id={item.title === "blueprint_tours" ? "tours-section" : undefined}
                    className={`
                    group relative overflow-hidden rounded-3xl p-8 border transition-all duration-300
                    ${item.title === "blueprint_tours" && highlightTours
                        ? "border-teal-400 ring-2 ring-teal-400/50 bg-teal-50 dark:bg-teal-900/10"
                        : "bg-white dark:bg-[#1e293b] border-slate-200/80 dark:border-slate-700/60 shadow-lg shadow-slate-200/50 dark:shadow-none hover:shadow-xl hover:-translate-y-1"
                      }
                `}
                  >
                    {/* Decorative blob */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 dark:bg-teal-900/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />

                    <div className="relative z-10">
                      <div className="mb-4 bg-teal-50 dark:bg-teal-900/20 w-16 h-16 rounded-2xl flex items-center justify-center border border-teal-100 dark:border-teal-800">
                        {item.icon}
                      </div>

                      <h3
                        className={`text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-2
                    ${item.title === "blueprint_home" || item.title === "blueprint_tours"
                            ? "cursor-pointer group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors"
                            : ""
                          }`}
                        onClick={() => {
                          if (item.title === "blueprint_tours") window.location.href = "/tours";
                          if (item.title === "blueprint_home") window.location.href = "/";
                        }}
                      >
                        {t(item.title)}
                      </h3>

                      <p className="text-slate-500 dark:text-slate-300 mb-8 leading-relaxed">
                        {t(item.desc)}
                      </p>

                      {item.children && (
                        <div className="mt-8 space-y-8 relative">
                          {/* Connecting Line - properly centered under icons (w-10 = 40px, center 20px, line 2px -> left-[19px]) */}
                          <div className="absolute left-[19px] top-4 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />

                          {item.children.map((child, idx) => (
                            <div key={idx} className="relative flex gap-5 group/child">
                              {/* Icon Wrapper */}
                              <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-sm transition-all duration-300 group-hover/child:scale-110 group-hover/child:border-teal-300 dark:group-hover/child:border-teal-700 group-hover/child:shadow-md">
                                {child.icon}
                              </div>

                              <div className="flex-1 pt-0.5">
                                <p
                                  className={`font-semibold text-lg
                                    ${child.title === "blueprint_home_tour_list"
                                      ? "cursor-pointer text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 underline decoration-teal-300 dark:decoration-teal-700 underline-offset-4"
                                      : "text-slate-700 dark:text-slate-200"
                                    }`}
                                  onClick={() => {
                                    if (child.title === "blueprint_home_tour_list") {
                                      document.getElementById("tours-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
                                      setHighlightTours(true);
                                      setTimeout(() => setHighlightTours(false), 2500);
                                    }
                                  }}
                                >
                                  {t(child.title)}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
                                  {t(child.desc)}
                                </p>
                                {child.points && (
                                  <ul className="mt-3 space-y-2">
                                    {child.points.map((p, i) => (
                                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
                                        <span>{t(p)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="limits"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-4xl mx-auto"
              >
                <div className="bg-white dark:bg-[#1e293b] border border-red-100 dark:border-red-900/30 rounded-3xl p-8 md:p-12 shadow-xl shadow-red-100/20 dark:shadow-none relative overflow-hidden">
                  {/* Decorative Alert Icon BG */}
                  <AlertTriangle className="absolute -top-10 -right-10 w-64 h-64 text-red-50 dark:text-red-900/10 opacity-50" />

                  <div className="relative z-10 text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold text-sm mb-4">
                      <AlertTriangle className="w-4 h-4" />
                      {t("applicationRestrictions.title")}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                      {t("applicationRestrictions.desktopOnly")}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                    {appLimitations.map((item, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-[#334155] hover:shadow-md transition-all duration-300">
                        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0 border border-red-200 dark:border-red-800/50">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1">
                            {t(item.title)}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed">
                            {t(item.desc)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 text-center">
                    <p className="inline-block px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400">
                      {t("applicationRestrictions.browserLimitations")}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
