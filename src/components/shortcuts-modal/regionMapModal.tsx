"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useLocale } from "@/providers/LocaleProvider";
import RegionMap from "../map/regionMap";
import { apiFetchRegions } from "@/services/userGlobalservice";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import MonumentCard from "@/components/tour/MonumentCard";

export default function RegionMapModal({
  openMapModal,
  onCloseMapModal,
}: {
  openMapModal: boolean;
  onCloseMapModal: () => void;
}) {
  const { t } = useLocale();
  const router = useRouter();

  const [view, setView] = useState<"region" | "map">("region");
  const [regions, setRegions] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  // 📐 Ref for scrolling the modal container to top on pagination
  const modalScrollRef = useRef<HTMLDivElement>(null);

  // ✅ Auto-scroll to top of modal when page changes
  useEffect(() => {
    if (modalScrollRef.current) {
      modalScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [page]);

  const limit = 6;
  const total = regions.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentData = regions.slice((page - 1) * limit, page * limit);

  /* ---------------- Lock scroll ---------------- */
  useEffect(() => {
    document.body.style.overflow = openMapModal ? "hidden" : "auto";
  }, [openMapModal]);

  /* ---------------- Fetch regions ---------------- */
  const [error, setError] = useState<string | null>(null);

  const loadRegions = async (mountedRef?: { current: boolean }) => {
    try {
      setError(null);

      const data = await apiFetchRegions();
      const list = data?.regions?.results;

      if (!Array.isArray(list)) {
        throw new Error("Invalid regions response");
      }

      if (!mountedRef || mountedRef.current) {
        setRegions(list);
      }
    } catch (e: any) {
      console.error("Failed to load regions:", e);

      if (!mountedRef || mountedRef.current) {
        setRegions([]);
        setError(e?.message || "Unable to load regions. Please try again.");
      }
    }
  };

  useEffect(() => {
    if (!openMapModal) return;

    const mountedRef = { current: true };

    loadRegions();

    return () => {
      mountedRef.current = false;
    };
  }, [openMapModal]);

  /* ---------------- Reset page on view change ---------------- */
  useEffect(() => {
    setPage(1);
  }, [view, openMapModal]);

  useEffect(() => {
    if (!openMapModal) return;
    if (view !== "region") return;

    loadRegions();
  }, [view]);

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {openMapModal && (
          <motion.div
            ref={modalScrollRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="
            fixed inset-0 z-[9999]
            bg-gradient-to-br
              from-orange-50/20
              via-amber-50/15
              to-yellow-50/10
            dark:from-orange-950/12
            dark:via-amber-950/10
            dark:to-yellow-950/8
            bg-white dark:bg-black
            backdrop-blur-2xl
            flex flex-col items-center justify-start
            overflow-y-auto py-4 h-[100dvh]
  md:h-[100dvh] lg:h-screen
          "
          >
            {/* Close button */}
            <button
              onClick={() => {
                onCloseMapModal();
              }}
              className="cursor-pointer absolute top-8 right-6 -translate-y-1/2 
           text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 
           transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 p-2"
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
                <div className="inline-grid grid-cols-2 gap-2 rounded-2xl p-1.5 bg-white dark:bg-[#15191f] border border-slate-200/80 dark:border-slate-700/60 backdrop-blur border">
                  {["region", "map"].map((v) => (
                    <button
                      key={v}
                      onClick={() => setView(v as any)}
                      className={`cursor-pointer truncate px-6 py-3 rounded-xl font-semibold transition-all text-center ${view === v
                        ? "bg-gradient-to-r from-teal-500 to-teal-500 text-white shadow"
                        : "text-slate-600 dark:text-white hover:bg-teal-500 hover:text-white"
                        }`}
                    >
                      {v === "region" ? t("region_title") : t("map_title")}
                    </button>
                  ))}
                </div>
              </div>

              {/* ================= REGION VIEW ================= */}
              {view === "region" && (
                <>
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
                          {t("nara_heritage")}
                        </span>
                      </div>

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
                        {t("region_title")}
                      </h1>

                      {/* Decorative accent line */}
                      <div className="flex items-center justify-center gap-3 my-2">
                        <div className="h-0.5 w-8 bg-gradient-to-r from-teal-300 to-cyan-300 rounded-full" />
                        <span className="text-white/60 text-xs font-medium">
                          ✦
                        </span>
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
                        {t("region_desc")}
                      </p>
                    </div>
                  </section>

                  {regions.length === 0 && (
                    <EmptyState
                      icon={<ImageIcon className="h-8 w-8" />}
                      title={t("no_regions")}
                      subtitle={t("no_regions_desc")}
                    />
                  )}

                  {regions.length > 0 && (
                    <>
                      {/* Scroll Anchor */}


                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {currentData.map((r, idx) => (
                          <MonumentCard
                            key={r._id}
                            monument={r}
                            t={t}
                            idx={idx}
                            onClick={() => {
                              onCloseMapModal();
                              sessionStorage.setItem("returnToRegionModal", "true");
                              router.push(`/regions?id=${r._id}`);
                            }}
                          />
                        ))}
                      </div>

                      <PageNavigator
                        totalPages={totalPages}
                        page={page}
                        onPageChange={setPage}
                        t={t}
                      />
                    </>
                  )}
                </>
              )}

              {/* ================= MAP VIEW ================= */}
              {view === "map" && (
                <>
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
                          {t("nara_heritage")}
                        </span>
                      </div>

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
                        {t("map_title")}
                      </h1>

                      {/* Decorative accent line */}
                      <div className="flex items-center justify-center gap-3 my-2">
                        <div className="h-0.5 w-8 bg-gradient-to-r from-teal-300 to-cyan-300 rounded-full" />
                        <span className="text-white/60 text-xs font-medium">
                          ✦
                        </span>
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



/* =========================================================
   🪶 Empty State
========================================================= */
function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="grid place-items-center rounded-3xl bg-gradient-to-br from-white/60 to-pink-50/40 dark:from-gray-900/50 dark:to-gray-800/50 p-10 text-center shadow-inner">
      <div className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-r from-teal-500 via-teal-500 to-teal-500 text-white shadow">
        {icon}
      </div>
      <div className="text-base font-semibold text-gray-800 dark:text-white">
        {title}
      </div>
      <div className="mt-1 max-w-md text-xs text-gray-600 dark:text-gray-400">
        {subtitle}
      </div>
    </div>
  );
}

/* =========================================================
   🧭 Pagination
========================================================= */
function PageNavigator({ totalPages, page, onPageChange, t }: any) {
  return (
    <div className="mt-10 mb-10 flex items-center justify-between gap-3">
      <div className="text-xs text-muted-foreground">
        {t("pagination_left", { current: page, total: totalPages })}
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="
            cursor-pointer h-8
            text-teal-600 dark:text-teal-400
            hover:bg-teal-50 dark:hover:bg-teal-900/30
          "
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {t("tours.prev")}
        </Button>
        <div className="hidden sm:flex items-center gap-1">
          {rangeAround(page, totalPages, 2).map((n, i) =>
            n === "…" ? (
              <span
                key={`dots-${i}`}
                className="px-2 text-sm text-muted-foreground"
              >
                …
              </span>
            ) : (
              <button
                key={`page-${n}-${i}`}
                onClick={() => onPageChange(n)}
                className={`cursor-pointer h-8 min-w-8 rounded-md px-2 text-sm transition-all
                  ${n === page
                    ? "bg-gradient-to-r from-teal-500 via-teal-500 to-teal-500 text-white shadow-sm"
                    : `
                        text-teal-600 dark:text-teal-400
                        hover:bg-teal-50 dark:hover:bg-teal-900/30
                      `
                  }
                `}
              >
                {n}
              </button>
            ),
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="
            cursor-pointer h-8
            text-teal-600 dark:text-teal-400
            hover:bg-teal-50 dark:hover:bg-teal-900/30
          "
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          {t("tours.next")}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function rangeAround(
  current: number,
  total: number,
  radius: number,
): (number | "…")[] {
  const out: (number | "…")[] = [];
  const start = Math.max(1, current - radius);
  const end = Math.min(total, current + radius);
  if (start > 1) {
    out.push(1);
    if (start > 2) out.push("…");
  }
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total) {
    if (end < total - 1) out.push("…");
    out.push(total);
  }
  return out;
}
