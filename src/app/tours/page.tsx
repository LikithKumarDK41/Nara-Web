"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { useGlobalLoader } from "@/providers/LoaderProvider";
import { useLocale } from "@/providers/LocaleProvider";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { apiFetchToursVersionTwo } from "@/services/userTourService";
import type { Tour } from "@/lib/types/userTour.types";
import Breadcrumb from "@/components/ui/Breadcrumb";
import TourCard from "@/components/tour/TourCard";

/* =========================================================
   🧹 Safe HTML Sanitizer
========================================================= */
function sanitizeHTML(input: string): string {
  if (!input) return "";
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
}

/* =========================================================
   🗺️ Tours Page
========================================================= */
export default function ToursPage() {
  const { t } = useLocale();
  const { show, hide } = useGlobalLoader();

  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [perPage, setPerPage] = useState(6);
  const [page, setPage] = useState(1);

  // 📐 Ref for scrolling to top of results on pagination
  const resultsTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => setPage(1), [query, perPage, sortOrder]);

  // ✅ Auto-scroll to top of results when page changes
  useEffect(() => {
    if (resultsTopRef.current) {
      resultsTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [page]);

  /* -------------------- Fetch Tours -------------------- */
  useEffect(() => {
    let mounted = true;
    const fetchToursData = async () => {
      try {
        show();
        const data = await apiFetchToursVersionTwo({
          sort: "sortOrder",
        });
        if (mounted) setTours(data);
      } catch (err) {
        console.error("Failed to fetch tours:", err);
      } finally {
        if (mounted) {
          hide();
          setLoading(false);
        }
      }
    };
    fetchToursData();
    return () => {
      mounted = false;
    };
  }, [show, hide]);

  /* -------------------- Search + Sort -------------------- */
  const filtered = useMemo(() => {
    let arr = [...tours];

    // ✅ 1️⃣ FEATURED FIRST
    // arr = arr.filter((t) => t.featured === true);

    // ✅ 2️⃣ SEARCH
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description ?? "").toLowerCase().includes(q),
      );
    }

    // ✅ 3️⃣ SORT
    // API order is ASC → keep as-is
    // Only when DESC → reverse
    if (sortOrder === "desc") {
      arr = [...arr].reverse();
    }

    return arr;
  }, [tours, query, sortOrder]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(page, totalPages);
  const startIdx = (current - 1) * perPage;
  const pageItems = filtered.slice(startIdx, startIdx + perPage);

  const hasTours = tours.length > 0;

  /* =========================================================
     💠 Render
  ========================================================= */
  return (
    <div className="space-y-6">
      {/* ===== HERO SECTION ===== */}
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
            {t("tours.exploreTours")}
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
            {t("tours.liveTours")}
          </p>
        </div>
      </section>

      {/* ===== Toolbar (Search + Sort) ===== */}
      <div className="px-4 space-y-6">
        {/* Scroll Anchor */}
        <div ref={resultsTopRef} className="scroll-mt-24" />

        <ToursToolbar
          query={query}
          setQuery={setQuery}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        {/* ===== Tours Grid ===== */}
        {!loading && hasTours && total > 0 && (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((tour, idx) => (
                <TourCard key={tour._id} tour={tour} t={t} idx={idx} />
              ))}
            </div>

            {/* ===== Pagination ===== */}
            <PageNavigator
              totalPages={totalPages}
              page={page}
              onPageChange={setPage}
              t={t}
            />
          </>
        )}

        {!loading && (!hasTours || total === 0) && (
          <div className="rounded-xl border p-10 text-center">
            <p className="text-sm text-muted-foreground">
              {t("no_tours_available")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   🔎 Toolbar (Search + Sort)
========================================================= */
function ToursToolbar({
  query,
  setQuery,
  sortOrder,
  setSortOrder,
}: {
  query: string;
  setQuery: (v: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (v: "asc" | "desc") => void;
}) {
  const { t } = useLocale();

  return (
    <div className="flex justify-between items-center gap-2">
      {/* BREADCRUMB */}
      <div className="mt-2 flex justify-start">
        <Breadcrumb
          items={[
            { label: t("tours_breadcrumb") || "Tours" },
          ]}
        />
      </div>
      <div className="flex justify-end items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer rounded-full text-teal-700 dark:text-teal-300 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/30"
            >
              <Search className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 bg-white dark:bg-[#15191f] border border-slate-200/80 dark:border-slate-700/60">
            <DropdownMenuLabel>{t("tours.search_tours")}</DropdownMenuLabel>
            <Input
              autoFocus
              placeholder={t("tours.searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mt-2"
            />
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer rounded-full text-teal-700 dark:text-teal-300 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/30"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-[#15191f] border border-slate-200/80 dark:border-slate-700/60">
            <DropdownMenuLabel>{t("sort")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setSortOrder("asc")}
              className={
                sortOrder === "asc"
                  ? "bg-gray-100 dark:bg-neutral-800 font-semibold"
                  : ""
              }
            >
              {t("sort_asc")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortOrder("desc")}
              className={
                sortOrder === "desc"
                  ? "bg-gray-100 dark:bg-neutral-700 font-semibold"
                  : ""
              }
            >
              {t("sort_desc")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/* =========================================================
   🌿 Pagination Component (Sky / Cyan / Emerald Theme)
========================================================= */
function PageNavigator({
  totalPages,
  page,
  onPageChange,
  t,
}: {
  totalPages: number;
  page: number;
  onPageChange: (n: number) => void;
  t: any;
}) {
  return (
    <div className="mt-10 mb-10 flex items-center justify-between gap-3">
      {/* PAGE INFO */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {t("pagination_left", { current: page, total: totalPages })}
      </div>

      <div className="flex items-center gap-1">
        {/* PREV */}
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
          ‹ {t("tours.prev")}
        </Button>

        {/* PAGE NUMBERS */}
        <div className="hidden md:flex items-center gap-1">
          {rangeAround(page, totalPages, 2).map((n, i) =>
            n === "…" ? (
              <span
                key={`dots-${i}`}
                className="px-2 text-sm text-gray-400 dark:text-gray-500"
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

        {/* NEXT */}
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
          {t("tours.next")} ›
        </Button>
      </div>
    </div>
  );
}

/* =========================================================
   📎 Helpers
========================================================= */
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
