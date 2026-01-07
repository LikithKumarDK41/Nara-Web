"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, X, Check, Star } from "lucide-react";

import { useLocale } from "@/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import {
  apiFetchMonumentDetails,
  apiFetchAllMonumentsWithQuery,
} from "@/services/userTourService";
import {
  apiFetchSearchFilters,
  apiFetchSearchSuggestionsAdv,
  apiFetchFreeTextSearch,
} from "@/services/userGlobalservice";
import type { Monument } from "@/lib/types/userTour.types";
import type { SearchFilter } from "@/lib/types/userGlobal.types";
import MonumentDetailModal from "@/components/tour/MonumentDetailModal";
import { motion, AnimatePresence } from "framer-motion";
import { sortGlobalByPopularityThenName } from "@/lib/globalMonumentSort";
import { normalizeHTML } from "@/lib/utils";

export default function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t, locale } = useLocale();

  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [monuments, setMonuments] = useState<Monument[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage] = useState(6);
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedMonument, setSelectedMonument] = useState<Monument | null>(
    null
  );

  /* -------------------- Initial Load -------------------- */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      fetchDefaultData();
    } else {
      document.body.style.overflow = "auto";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function fetchDefaultData() {
    try {
      setLoading(true);
      const [filtersData, monumentsData] = await Promise.all([
        apiFetchSearchFilters(),
        apiFetchAllMonumentsWithQuery({ sort: "-popularity" }),
      ]);
      setFilters(filtersData);
      setMonuments(monumentsData);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function openMonumentModal(id: string) {
    try {
      setLoading(true);
      const data = await apiFetchMonumentDetails(id);
      setSelectedMonument(data);
    } catch (err) {
      console.error("Failed to fetch monument details:", err);
    } finally {
      setLoading(false);
    }
  }

  /* -------------------- Filter Change -------------------- */
  useEffect(() => {
    if (!open) return; // avoid firing when modal closed

    if (selectedFilters.length === 0) {
      fetchDefaultData();
      return;
    }

    async function applyFilters() {
      try {
        setLoading(true);

        const selectedData = filters.filter((f) =>
          selectedFilters.includes(f._id)
        );

        const filter1 = filters[0];
        const filter2 = filters[1];

        const isFilter1Selected =
          filter1 && selectedFilters.includes(filter1._id);
        const isFilter2Selected =
          filter2 && selectedFilters.includes(filter2._id);

        // Case 1: Only filter 1 & 2 selected → call both APIs & combine
        if (
          isFilter1Selected &&
          isFilter2Selected &&
          selectedFilters.length === 2
        ) {
          const results = await Promise.all(
            [filter1, filter2].map(async (f) => {
              try {
                const parsed = f.link ? JSON.parse(f.link) : {};
                const sortOrder = f.sortby || "-popularity";
                const payload = { filter: parsed, sort: sortOrder };
                const data: any = await apiFetchAllMonumentsWithQuery(payload);

                return Array.isArray(data)
                  ? data
                  : data?.monuments?.results || [];
              } catch (err) {
                console.warn("Error fetching filter:", f.title);
                return [];
              }
            })
          );

          const combined = results.flat();
          const unique = combined.filter(
            (m, i, arr) => arr.findIndex((x) => x._id === m._id) === i
          );

          setMonuments(unique);
          return;
        }

        //  Case 2: For all other filters → merge filters normally
        const mergedFilter: Record<string, any> = {};
        let sortOrder = "-popularity";

        selectedData.forEach((f) => {
          try {
            const parsed = f.link ? JSON.parse(f.link) : {};
            Object.assign(mergedFilter, parsed);
            if (f.sortby) sortOrder = f.sortby;
          } catch (err) {
            console.warn("Invalid link JSON:", f.link);
          }
        });

        const payload = { filter: mergedFilter, sort: sortOrder };
        const data: any = await apiFetchAllMonumentsWithQuery(payload);
        const results = Array.isArray(data)
          ? data
          : data?.monuments?.results || [];
        setMonuments(results);
      } catch (err) {
        console.error("Failed to apply filters:", err);
      } finally {
        setLoading(false);
      }
    }

    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilters, open]);

  function toggleFilter(id: string) {
    setSelectedFilters((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  }

  /* -------------------- Autocomplete Suggestions -------------------- */
  useEffect(() => {
    if (!open) return;

    if (!keyword.trim()) {
      setSuggestions([]);
      return;
    }

    const debounce = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const data = await apiFetchSearchSuggestionsAdv(keyword);
        setSuggestions(data || []);
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(debounce);
  }, [keyword, open]);

  useEffect(() => {
    if (!open) return;
    setPage(1);
  }, [keyword, selectedFilters, open]);

  /* -------------------- Handle Suggestion Click -------------------- */
  async function handleSuggestionClick(item: any, isAll: boolean) {
    try {
      setLoading(true);
      setSuggestions([]);
      setPage(1);

      if (isAll) {
        const data = await apiFetchFreeTextSearch(keyword);
        setMonuments(data?.monuments || []);
      } else {
        const payload = {
          filter: item.filters || {},
          sort: "-popularity",
        };
        const data = await apiFetchAllMonumentsWithQuery(payload);
        setMonuments(data || []);
      }

      setSuggestions([]);
    } catch (err) {
      console.error("Failed to load monuments:", err);
    } finally {
      setLoading(false);
    }
  }

  /* -------------------- Handle Clear / Reset -------------------- */
  async function handleClear() {
    setKeyword("");
    setSuggestions([]);
    setSelectedFilters([]);
    await fetchDefaultData();
  }

  function resetAll() {
    setKeyword("");
    setSuggestions([]);
    setSelectedFilters([]);
    setMonuments([]);
    setFilters([]);
    setPage(1);
  }

  /* -------------------- Sorting -------------------- */
  const sortedMonuments = useMemo(() => {
    return sortGlobalByPopularityThenName(monuments);
  }, [monuments]);

  /* -------------------- Pagination -------------------- */
  const total = monuments.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(page, totalPages);
  const startIdx = (current - 1) * perPage;
  const pageItems = useMemo(() => {
    return sortedMonuments.slice(startIdx, startIdx + perPage);
  }, [sortedMonuments, startIdx, perPage]);

  const shouldShowMonuments = pageItems.length > 0;

  /* -------------------- Render -------------------- */
  return (
    <AnimatePresence>
      {open && (
        <motion.div
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
    backdrop-blur-2xl
    flex flex-col items-center justify-start
    overflow-y-auto
  "
        >
          {/* Close button */}
          <button
            onClick={() => {
              resetAll();
              onClose();
            }}
            className="cursor-pointer absolute top-8 right-6 -translate-y-1/2 
       text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 
       transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 p-2"
          >
            <X className="h-7 w-7" />
          </button>

          {/* Search Bar + Suggestions */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative w-full max-w-2xl mt-24 px-6 z-50 mx-auto flex justify-center"
          >
            <div className="relative w-full max-w-[640px]">
              <div
                className={`flex items-center w-full px-5 py-4 shadow-lg transition-all
        border border-orange-400/40 dark:border-amber-500/35
        bg-white/60 dark:bg-slate-900/60
        backdrop-blur-2xl
        focus-within:ring-2 focus-within:ring-orange-400/40
        ${keyword && suggestions.length > 0 ? "rounded-t-2xl" : "rounded-2xl"}
      `}
              >
                {/* ICON — solid color */}
                <Search className="h-5 w-5 text-orange-500 dark:text-amber-400 mr-3" />

                {/* INPUT — solid text */}
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={locale === "en" ? "Search" : "検索"}
                  className="
          w-full bg-transparent
          text-gray-900 dark:text-gray-100
          placeholder:text-gray-500 dark:placeholder:text-gray-400
          caret-orange-500
          focus:outline-none text-base
        "
                  autoFocus
                />

                {keyword && (
                  <button
                    onClick={handleClear}
                    className="
            ml-2 text-orange-500
            hover:text-orange-600
            dark:text-amber-400
            dark:hover:text-amber-500
            transition-colors focus:outline-none
          "
                    aria-label="Clear search"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {keyword && suggestions.length > 0 && (
                <div
                  className="
          absolute top-full left-0 right-0
          border-x border-b border-orange-400/40 dark:border-amber-500/35
          bg-white/70 dark:bg-slate-900/70
          backdrop-blur-2xl
          shadow-xl rounded-b-2xl
          overflow-y-auto max-h-56
          [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
        "
                  style={{ zIndex: 9999 }}
                >
                  {searchLoading ? (
                    <div className="flex justify-center py-6">
                      <div
                        className="
                w-8 h-8 animate-spin rounded-full
                border-4 border-transparent
                border-t-orange-500
                border-r-amber-500
                border-b-yellow-400
              "
                      />
                    </div>
                  ) : (
                    <>
                      {/* Static "All" Option */}
                      <div
                        onClick={() => handleSuggestionClick(null, true)}
                        className="
                px-5 py-3 text-sm
                text-gray-900 dark:text-gray-100
                hover:bg-orange-50/60 dark:hover:bg-slate-800/70
                cursor-pointer transition-colors
                border-b border-black/5 dark:border-white/10
              "
                      >
                        <span className="font-medium">{keyword}</span>{" "}
                        <span className="text-gray-500">@</span>{" "}
                        <span className="text-orange-600 dark:text-amber-400 font-medium">
                          All
                        </span>
                      </div>

                      {/* API Suggestions */}
                      {suggestions.map((s: any, i: number) => (
                        <div
                          key={i}
                          onClick={() => handleSuggestionClick(s, false)}
                          className="
                  px-5 py-3 text-sm
                  text-gray-900 dark:text-gray-100
                  hover:bg-orange-50/60 dark:hover:bg-slate-800/70
                  cursor-pointer transition-colors
                  border-b border-black/5 dark:border-white/10 last:border-0
                "
                        >
                          <span className="font-medium">{keyword}</span>{" "}
                          <span className="text-gray-500">@</span>{" "}
                          <span className="text-orange-600 dark:text-amber-400 font-medium">
                            {s.title || s.key || ""}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Filters Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12 w-full px-6 flex flex-col items-center z-10"
          >
            {filters.length > 0 && (
              <div className="flex flex-wrap justify-center gap-10">
                {filters.map((f) => {
                  const isActive = selectedFilters.includes(f._id);

                  return (
                    <div
                      key={f._id}
                      onClick={() => toggleFilter(f._id)}
                      className={`flex flex-col items-center cursor-pointer transition-transform hover:scale-105 ${
                        isActive
                          ? "opacity-100"
                          : "opacity-90 hover:opacity-100"
                      }`}
                    >
                      <div
                        className={`relative h-20 w-20 rounded-full flex items-center justify-center shadow-md transition-all
                bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500
                ${!isActive ? "opacity-70" : ""}
              `}
                      >
                        {/* ICON WRAPPER (KEY FIX) */}
                        <div
                          className="
                h-12 w-12 rounded-full
                bg-white/90 dark:bg-slate-900/90
                flex items-center justify-center
                shadow-sm
              "
                        >
                          {f.icon?.secure_url ? (
                            <img
                              src={f.icon.secure_url}
                              alt={f.title}
                              className="h-7 w-7 object-contain"
                            />
                          ) : (
                            <Search className="h-6 w-6 text-orange-600 dark:text-amber-400" />
                          )}
                        </div>

                        {isActive && (
                          <div className="absolute bottom-1 right-1 bg-white dark:bg-slate-800 rounded-full p-1 shadow">
                            <Check className="h-4 w-4 text-orange-500" />
                          </div>
                        )}
                      </div>

                      <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-200 text-center">
                        {f.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Monuments Grid */}
          <div className="mt-16 w-full max-w-7xl px-6 pb-20 relative z-0">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div
                  className="
      w-10 h-10 animate-spin rounded-full
      border-4 border-transparent
      border-t-orange-500
      border-r-amber-500
      border-b-yellow-500
    "
                />
              </div>
            ) : shouldShowMonuments ? (
              <>
                <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                  {pageItems.map((m) => (
                    <div
                      key={m._id}
                      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white/90 dark:bg-slate-900/40 shadow-md hover:shadow-xl transition-all border border-orange-400/10"
                    >
                      <div className="relative h-48 w-full overflow-hidden">
                        {m.image?.secure_url ? (
                          <img
                            src={m.image.secure_url}
                            alt={m.title || m.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center bg-muted text-muted-foreground">
                            <Search className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex flex-col justify-between flex-1">
                        <div>
                          <h3 className="line-clamp-1 text-base font-semibold text-amber-700 dark:text-amber-300">
                            {m.title || m.name}
                          </h3>
                          <div className="mt-2 flex items-center gap-0.5">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <Star
                                key={`star-${m._id}-${i}`}
                                className={`h-3.5 w-3.5 ${
                                  i < (m.popularity ?? 0)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-gray-300 dark:text-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                          {m.content?.brief && (
                            <p
                              className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 whitespace-pre-wrap"
                              dangerouslySetInnerHTML={{
                                __html: normalizeHTML(m.content.brief),
                              }}
                            />
                          )}
                        </div>
                        <Button
                          onClick={() => openMonumentModal(m._id)}
                          className="cursor-pointer mt-3 h-9 rounded-lg bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white hover:opacity-90 transition-all"
                        >
                          {t("actions.details")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <PageNavigator
                  totalPages={totalPages}
                  page={page}
                  onPageChange={setPage}
                  t={t}
                />

                {selectedMonument && (
                  <MonumentDetailModal
                    open={selectedMonument !== null}
                    onClose={() => setSelectedMonument(null)}
                    loading={loading}
                    details={selectedMonument}
                    onOpenAnother={(id: string) => openMonumentModal(id)}
                    customStyle="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white hover:opacity-90 transition-all"
                  />
                )}
              </>
            ) : (
              <div className="text-center text-gray-600 dark:text-gray-400">
                {t("no_information_to_display")}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* =======================================================================
   PAGINATION
======================================================================= */
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
    <div className="flex items-center justify-between gap-3 pt-8">
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
            text-orange-600 dark:text-amber-400
            hover:bg-orange-50 dark:hover:bg-orange-900/30
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
                      ? "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white shadow-sm"
                      : `
                        text-orange-600 dark:text-amber-400
                        hover:bg-orange-50 dark:hover:bg-orange-900/30
                      `
                  }
                `}
              >
                {n}
              </button>
            )
          )}
        </div>

        {/* NEXT */}
        <Button
          variant="ghost"
          size="sm"
          className="
            cursor-pointer h-8
            text-orange-600 dark:text-amber-400
            hover:bg-orange-50 dark:hover:bg-orange-900/30
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

/* Helper */
function rangeAround(
  current: number,
  total: number,
  radius: number
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
