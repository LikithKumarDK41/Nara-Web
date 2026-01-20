"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

import { useLocale } from "@/providers/LocaleProvider";
import RegionMap from "../map/regionMap";

export default function RegionMapModal({
  openMapModal,
  onCloseMapModal,
}: {
  openMapModal: boolean;
  onCloseMapModal: () => void;
}) {
  const { t } = useLocale();
  const [view, setView] = useState<"region" | "map">("region");

  useEffect(() => {
    document.body.style.overflow = openMapModal ? "hidden" : "auto";
  }, [openMapModal]);

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {openMapModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="
              fixed inset-0 z-[9999]
              bg-gradient-to-br
              from-orange-50/20 via-amber-50/15 to-yellow-50/10
              dark:from-orange-950/12 dark:via-amber-950/10 dark:to-yellow-950/8
              backdrop-blur-2xl
              flex flex-col items-center
              overflow-y-auto py-4 h-[100dvh]
            "
          >
            {/* Close */}
            <button
              onClick={()=>{
                onCloseMapModal();
                setView("region");}}
              className="cursor-pointer absolute top-8 right-6 p-2 rounded-full
                text-gray-500 hover:text-gray-900
                dark:text-gray-400 dark:hover:text-gray-200
                hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-7 w-7" />
            </button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-12 w-full px-6 flex flex-col z-10"
            >
              {/* ===== Toggle ===== */}
              <div className="mt-6 flex justify-center">
                <div className="inline-flex rounded-2xl p-1.5 bg-white/60 dark:bg-white/10 backdrop-blur border border-slate-200 dark:border-white/20">
                  <button
                    onClick={() => setView("region")}
                    className={`cursor-pointer px-6 py-3 rounded-xl font-semibold transition-all
                      ${
                        view === "region"
                          ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow"
                          : "text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-white/10"
                      }`}
                  >
                    Region
                  </button>

                  <button
                    onClick={() => setView("map")}
                    className={`cursor-pointer px-6 py-3 rounded-xl font-semibold transition-all
                      ${
                        view === "map"
                          ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow"
                          : "text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-white/10"
                      }`}
                  >
                    Map
                  </button>
                </div>
              </div>

              {/* ===== REGION VIEW ===== */}
              {view === "region" && (
               
                   <section
                className="mt-4 mb-4
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
                      Nara Heritage
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
                    <span className="block text-sm sm:text-base md:text-lg lg:text-xl mt-1 font-bold text-white/80">
                      {"Region"}
                    </span>
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
                    {t("map_desc")}
                  </p>
                </div>
              </section>
              )}

              {/* ===== MAP VIEW ===== */}
              {view === "map" && (
                <>

                   <section
                className="mt-6 mb-4
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
                      Nara Heritage
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
                    <span className="block text-sm sm:text-base md:text-lg lg:text-xl mt-1 font-bold text-white/80">
                      {t("map_title")}
                    </span>
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
                    {t("map_desc")}
                  </p>
                </div>
              </section>

                  <div className="w-full mt-4">
                    <RegionMap height={600} />
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
