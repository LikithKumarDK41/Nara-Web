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
    <div className="space-y-6 min-h-screen">
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
                <section className="mt-6 rounded-3xl bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-700 px-8 py-6 text-center text-white">
                  <h1 className="text-2xl font-black">Region</h1>
                  <p className="mt-2 text-white/80">{t("map_desc")}</p>
                </section>
              )}

              {/* ===== MAP VIEW ===== */}
              {view === "map" && (
                <>
                  <section className="mt-6 rounded-3xl bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-700 px-8 py-6 text-center text-white">
                    <h1 className="text-2xl font-black">{t("map_title")}</h1>
                    <p className="mt-2 text-white/80">{t("map_desc")}</p>
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
