"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Landmark,
  Star,
} from "lucide-react";
import { useLocale } from "@/providers/LocaleProvider";
import { useGlobalLoader } from "@/providers/LoaderProvider";
import { Button } from "@/components/ui/button";
import { normalizeHTML } from "@/lib/utils";
import {
  apiFetchMonumentDetails,
  apiFetchMonumentSorts,
} from "@/services/userTourService";
import MonumentDetailModal from "@/components/tour/MonumentDetailModal";
import { apiFetchRegionDetails } from "@/services/userGlobalservice";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MonumentSort } from "@/lib/types/userTour.types";
import { useSelector } from "react-redux";
import { sortByPopularityThenName } from "@/lib/monumentSort";

export default function RegionDetailsPage() {
  const searchParams = useSearchParams();
  const regionId = searchParams.get("id"); // ✅ FIX

  const { t, locale } = useLocale();
  const { show, hide } = useGlobalLoader();

  const [region, setRegion] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedMonument, setSelectedMonument] = useState<any>(null);

  const [page, setPage] = useState(1);
  const limit = 6;

  // optional (future-ready)
  const [query, setQuery] = useState("");
  const activeThemeId = useSelector((state: any) => state.global.activeThemeId);
  const [selectedSort, setSelectedSort] = useState<string | null>(null);

  const featuredMonuments = Array.isArray(region?.featuredmonument)
    ? [...region.featuredmonument]
    : [];

  const sortedMonuments = useMemo(() => {
    let list = featuredMonuments;

    // ⭐ ONLY when popular sort selected
    if (selectedSort === "-popularity") {
      list = sortByPopularityThenName(list);
    }

    if (!query.trim()) return list;

    const q = query.toLowerCase();
    return list.filter(
      (m) =>
        m.title?.toLowerCase().includes(q) || m.name?.toLowerCase().includes(q),
    );
  }, [featuredMonuments, query, selectedSort]);

  const total = sortedMonuments.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const currentData = sortedMonuments.slice((page - 1) * limit, page * limit);

  useEffect(() => {
    setPage(1);
    document.body.style.overflow = "auto";
  }, [regionId, query, selectedSort]);

  /* ---------------- Fetch Region ---------------- */
  useEffect(() => {
    if (!regionId) return;

    let mounted = true;

    const loadRegion = async () => {
      try {
        show();
        const backendSort =
          selectedSort === "-popularity"
            ? "-popularity"
            : (selectedSort ?? undefined);
        const data = await apiFetchRegionDetails(regionId, backendSort);
        if (mounted) setRegion(data);
        console.log("Region data:", data);
      } catch (err: any) {
        console.error("Failed to load region:", err);
        setError(err.message || "Failed to load region");
      } finally {
        if (mounted) hide();
      }
    };

    loadRegion();
    return () => {
      mounted = false;
    };
  }, [regionId, selectedSort]);

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  if (!region) return null;

  /* ---------------- Monument Modal ---------------- */
  const handleOpenMonument = async (id: string) => {
    setModalLoading(true);
    try {
      const data = await apiFetchMonumentDetails(id);
      setSelectedMonument(data);
      setOpen(true);
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenAnother = async (id: string) => {
    setModalLoading(true);
    try {
      const data = await apiFetchMonumentDetails(id);
      setSelectedMonument(data);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HERO */}
      {total === 0 && (
        <EmptyState
          icon={<Landmark className="h-8 w-8" />}
          title={t("no_monuments")}
          subtitle={t("no_monuments_desc")}
        />
      )}

      {total > 0 && (
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
                  {t("region")}
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
      "
              >
                {region.title}
              </h1>
            </div>
          </section>

          <MonumentsToolbar
            query={query}
            setQuery={setQuery}
            onSortSelect={(v) => setSelectedSort(v)}
            selectedSort={selectedSort}
            activeThemeId={activeThemeId}
          />

          {/* MONUMENTS */}
          <section className="px-6">
            {/* FEATURED MONUMENTS */}
            {Array.isArray(region.featuredmonument) &&
              region.featuredmonument.length > 0 && (
                <section className="">
                  <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                    {currentData.map((m: any) => (
                      <div
                        key={m._id}
                        className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white/90 dark:bg-slate-900/40 shadow-md hover:shadow-xl transition-all"
                      >
                        <div className="rounded-2xl bg-white dark:bg-slate-900/40 shadow hover:shadow-lg transition overflow-hidden">
                          <div className="relative h-48 w-full overflow-hidden">
                            {m.image?.secure_url ? (
                              <img
                                src={m.image.secure_url}
                                alt={m.title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                              />
                            ) : (
                              <div className="grid h-full w-full place-items-center bg-muted text-muted-foreground">
                                <ImageIcon className="h-8 w-8" />
                              </div>
                            )}
                          </div>

                          <div className="flex flex-1 flex-col justify-between p-4">
                            <h3 className="font-semibold text-teal-700 dark:text-teal-300">
                              {m.title?.[locale] || m.title?.en}
                            </h3>

                            {m.content?.brief && (
                              <p
                                className="mt-1 text-xs text-muted-foreground line-clamp-2"
                                dangerouslySetInnerHTML={{
                                  __html: normalizeHTML(
                                    m.content.brief?.[locale] ||
                                      m.content.brief?.en ||
                                      "",
                                  ),
                                }}
                              />
                            )}

                            <div className="mt-2 flex items-center gap-0.5">
                              {Array.from({ length: 4 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 ${
                                    i < m.popularity
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-gray-300 dark:text-gray-600"
                                  }`}
                                />
                              ))}
                            </div>

                            <button
                              className="mt-3 cursor-pointer rounded-lg bg-gradient-to-r from-teal-500 via-teal-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                              onClick={() => handleOpenMonument(m._id)}
                            >
                              {t("tourDetails.viewDetails")}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
          </section>

          {/* PAGINATION */}
          <PageNavigator
            totalPages={totalPages}
            page={page}
            onPageChange={setPage}
            t={t}
          />

          {/* MONUMENT DETAIL MODAL */}
          {selectedMonument && (
            <MonumentDetailModal
              open={open}
              onClose={() => setOpen(false)}
              loading={modalLoading}
              details={selectedMonument}
              onOpenAnother={handleOpenAnother}
            />
          )}
        </>
      )}
    </div>
  );
}

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

function PageNavigator({ totalPages, page, onPageChange, t }: any) {
  return (
    <div className="mt-4 flex items-center justify-between gap-3">
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

/* =========================================================
   🔎 Toolbar (Search + Filter + Sort)
========================================================= */
function MonumentsToolbar({
  onSortSelect,
  selectedSort,
}: {
  query: string;
  setQuery: (v: string) => void;
  onSortSelect: (v: string) => void;
  selectedSort?: string | null;
  activeThemeId?: string | null;
}) {
  const { t } = useLocale();
  const [sortOptions, setSortOptions] = useState<MonumentSort[]>([]);
  const [loadingSorts, setLoadingSorts] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadSorts = async () => {
      try {
        setLoadingSorts(true);
        const data = await apiFetchMonumentSorts();
        if (mounted) {
          const sorted = data.sort(
            (a, b) => (a.priority ?? 99) - (b.priority ?? 99),
          );
          setSortOptions(sorted);
          if (sorted.length > 0) {
            const defaultSort = sorted.reduce((max, cur) =>
              (cur.priority ?? 0) > (max.priority ?? 0) ? cur : max,
            );

            onSortSelect(defaultSort.link || "");
          }
        }
      } catch (err) {
        console.error("Failed to fetch monument sorts:", err);
      } finally {
        setLoadingSorts(false);
      }
    };
    loadSorts();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="mt-2 mb-2 flex justify-end items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer rounded-full text-teal-700 dark:text-teal-300 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/30"
          >
            <ArrowUpDown className="h-8 w-8" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{t("sort")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {loadingSorts ? (
            <DropdownMenuItem disabled>{t("loading")}</DropdownMenuItem>
          ) : sortOptions.length > 0 ? (
            sortOptions.map((s) => (
              <DropdownMenuItem
                key={s._id}
                onClick={() => onSortSelect(s.link || s.name || "")}
                className={`cursor-pointer text-black dark:text-white  flex items-center gap-2 ${
                  selectedSort == s.link
                    ? "bg-gray-100 dark:bg-neutral-800 font-semibold"
                    : ""
                }`}
              >
                {s.icon?.secure_url ? (
                  <img
                    src={s.icon.secure_url}
                    alt={s.title || s.name}
                    className="h-4 w-4 rounded-sm object-contain"
                  />
                ) : (
                  <ImageIcon className="h-4 w-4 " />
                )}
                <span>{s.title || s.name}</span>
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>
              {t("tourist_attractions.no_sort_options")}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
