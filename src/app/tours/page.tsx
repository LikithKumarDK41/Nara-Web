"use client";

import { useMemo, useState, useEffect } from "react";
import { ImageIcon, Search, ArrowUpDown } from "lucide-react";
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
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {pageItems.map((tour) => (
              <div
                key={tour._id}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white/90 dark:bg-slate-900/40 shadow-md hover:shadow-xl transition-all border"
              >
                {/* ===== Image Section ===== */}
                <div className="relative h-48 w-full overflow-hidden">
                  {tour.image?.secure_url ? (
                    <img
                      src={tour.image.secure_url}
                      alt={tour.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-muted text-muted-foreground">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                </div>

                {/* ===== Content Section ===== */}
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <h3 className="line-clamp-1 text-base font-semibold text-teal-700 dark:text-teal-300">
                      {tour.title}
                    </h3>

                    {tour.content?.brief && (
                      <p
                        className="mt-1 line-clamp-2 text-xs text-muted-foreground"
                        dangerouslySetInnerHTML={{
                          __html: normalizeHTML(tour.content.brief),
                        }}
                      />
                    )}
                  </div>

                  <Button
                    onClick={() =>
                      (window.location.href = `/tours/detail?id=${tour._id}`)
                    }
                    className="mt-3 h-9 cursor-pointer rounded-lg bg-gradient-to-r from-teal-500 via-teal-500 to-teal-500
            text-white hover:opacity-90 transition-all"
                  >
                    {t("actions.details")}
                  </Button>
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
