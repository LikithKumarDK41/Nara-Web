"use client";

import { useMemo, useState, useEffect } from "react";
import { ImageIcon, Search, ArrowUpDown, ArrowRight } from "lucide-react";
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
import { normalizeHTML } from "@/lib/utils";

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

  useEffect(() => setPage(1), [query, perPage, sortOrder]);

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
    arr = arr.filter((t) => t.featured === true);

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
        className="relative w-full mx-auto bg-gradient-to-r from-teal-500 via-teal-500 to-teal-500
            text-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="max-w-5xl mx-auto py-3 md:py-16 px-6 text-center">
          <h1 className="text-2xl md:text-5xl font-extrabold tracking-wide mb-3 drop-shadow-md">
            {t("tours.exploreTours")}
          </h1>
          <p className="text-sm md:text-xl font-medium opacity-90">
            {t("tours.liveTours")}
          </p>
        </div>
      </section>

      {/* ===== Toolbar (Search + Sort) ===== */}
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
            {pageItems.map((tour) => (
              <div
                key={tour._id}
                onClick={() =>
                  (window.location.href = `/tours/detail?id=${tour._id}`)
                }
                className="group relative flex flex-col h-[480px] rounded-[32px] overflow-hidden bg-white dark:bg-[#15191f] border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_20px_40px_rgba(0,184,166,0.15)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-2 cursor-pointer isolate"
              >
                {/* ===== Image Section ===== */}
                <div className="relative h-[220px] w-full overflow-hidden flex-shrink-0">
                  {tour.image?.secure_url ? (
                    <img
                      src={tour.image.secure_url}
                      alt={tour.title}
                      className="block h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
                      <ImageIcon className="h-12 w-12 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#15191f] via-transparent to-transparent opacity-0 dark:opacity-60 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-0 group-hover:opacity-10 dark:group-hover:opacity-0 transition-opacity duration-500" />
                </div>

                {/* ===== Content Section ===== */}
                <div className="relative flex-1 p-8 flex flex-col justify-between bg-white dark:bg-[#15191f]">
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300">
                      {tour.title}
                    </h3>

                    {tour.content?.brief && (
                      <p
                        className="text-sm font-light text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: normalizeHTML(tour.content.brief),
                        }}
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-6 mt-auto">
                    <span className="text-xs font-bold text-teal-600/70 dark:text-teal-400/70 uppercase tracking-widest group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {t("actions.details")}
                    </span>
                    <div className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#1a2029] flex items-center justify-center group-hover:bg-teal-500 group-hover:border-teal-500 group-hover:text-white transition-all duration-300 shadow-sm">
                      <ArrowRight className="w-5 h-5 -ml-0.5" />
                    </div>
                  </div>
                </div>
              </div>
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
        <DropdownMenuContent align="end" className="w-64 p-2">
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
        <DropdownMenuContent align="end" className="w-48">
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
                ? "bg-gray-100 dark:bg-neutral-800 font-semibold"
                : ""
            }
          >
            {t("sort_desc")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
    <div className="flex items-center justify-between gap-3">
      {/* PAGE INFO */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        ページ {page} / {totalPages}
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
                  ${
                    n === page
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
