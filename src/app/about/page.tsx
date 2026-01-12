"use client";

import { useEffect, useMemo, useState } from "react";
import {
    ImageIcon,
    Search,
    ChevronLeft,
    ChevronRight,
    Landmark,
    Filter,
    ArrowUpDown,
} from "lucide-react";
import { useLocale } from "@/providers/LocaleProvider";
import { useGlobalLoader } from "@/providers/LoaderProvider";
import { useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import MonumentDetailModal from "@/components/tour/MonumentDetailModal";
import { apiFetchSubthemesWithQuery } from "@/services/userGlobalservice";
import {
    apiFetchAllMonumentsWithQuery,
    apiFetchMonumentDetails,
    apiFetchMonumentSorts,
} from "@/services/userTourService";
import type { Monument, MonumentSort } from "@/lib/types/userTour.types";
import { Star } from "lucide-react";
import { sortByPopularityThenName } from "@/lib/monumentSort";
import { normalizeHTML } from "@/lib/utils";

/* =========================================================
   🏛️ Monuments Page
========================================================= */
export default function MonumentsPage() {
    const { t } = useLocale();
    const { show, hide } = useGlobalLoader();
    const activeThemeId = useSelector((state: any) => state.global.activeThemeId);

    const [monuments, setMonuments] = useState<Monument[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
    const [selectedSort, setSelectedSort] = useState<string | null>(null);

    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const limit = 6;

    const [open, setOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedMonument, setSelectedMonument] = useState<Monument | null>(
        null
    );

    /* -------------------- Fetch All Monuments -------------------- */
    useEffect(() => {
        let mounted = true;

        const loadMonuments = async () => {
            try {
                show();

                // 🔑 BACKEND SORT DECISION
                const backendSort =
                    selectedSort === "-popularity" ? "+title" : selectedSort ?? undefined;

                const data = await apiFetchAllMonumentsWithQuery({
                    filter: selectedFilter
                        ? ({ subtheme: selectedFilter } as Record<string, any>)
                        : { theme: activeThemeId },
                    sort: backendSort,
                });

                if (mounted) setMonuments(data);
            } catch (err: any) {
                console.error("Failed to fetch monuments:", err);
                setError(err.message);
            } finally {
                if (mounted) hide();
            }
        };

        loadMonuments();
        return () => {
            mounted = false;
        };
    }, [selectedFilter, selectedSort, activeThemeId]);

    /* -------------------- Filtering -------------------- */
    useEffect(() => setPage(1), [query, selectedFilter, selectedSort]);

    const filtered = useMemo(() => {
        let list = monuments;

        // ⭐ ONLY when popular sort selected
        if (selectedSort === "-popularity") {
            list = sortByPopularityThenName(list);
        }

        if (!query.trim()) return list;

        const q = query.toLowerCase();
        return list.filter(
            (m) =>
                m.title?.toLowerCase().includes(q) || m.name?.toLowerCase().includes(q)
        );
    }, [monuments, query, selectedSort]);

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentData = filtered.slice((page - 1) * limit, page * limit);

    /* -------------------- Detail Modal -------------------- */
    const handleOpenMonument = async (id: string) => {
        setModalLoading(true);
        try {
            const data = await apiFetchMonumentDetails(id);
            setSelectedMonument(data);
            setOpen(true);
        } catch (err) {
            console.error("Failed to fetch monument details:", err);
        } finally {
            setModalLoading(false);
        }
    };

    const handleOpenAnother = async (id: string) => {
        setModalLoading(true);
        try {
            const data = await apiFetchMonumentDetails(id);
            setSelectedMonument(data);
        } catch (err) {
            console.error("Failed to open another monument:", err);
        } finally {
            setModalLoading(false);
        }
    };

    /* =========================================================
              Render
          ========================================================= */
    if (error)
        return (
            <div className="text-center text-lg text-red-500 mt-10">{error}</div>
        );

    return (
        <div className="space-y-6">
            {/* ===== HERO SECTION ===== */}
            <section className="relative w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white rounded-2xl shadow-xl overflow-hidden">
                <div className="max-w-5xl mx-auto py-3 md:py-16 px-6 text-center">
                    <h1 className="text-2xl md:text-5xl font-extrabold tracking-wide mb-3 drop-shadow-md">
                        {t("shortcut.tourist_attraction")}
                    </h1>
                    <p className="text-sm md:text-xl font-medium opacity-90">
                        {t("shortcut.tourist_attraction_desc")}
                    </p>
                </div>
            </section>

            {/* ===== SEARCH + FILTER BAR ===== */}
            <MonumentsToolbar
                query={query}
                setQuery={setQuery}
                onSortSelect={(v) => setSelectedSort(v)}
                selectedSort={selectedSort}
                onFilterSelect={(v) => setSelectedFilter(v)}
                selectedFilter={selectedFilter}
                activeThemeId={activeThemeId}
            />

            {/* ===== EMPTY STATE ===== */}
            {filtered.length === 0 && (
                <EmptyState
                    icon={<Landmark className="h-8 w-8" />}
                    title={t("tourist_attractions.no_results_title")}
                    subtitle={t("tourist_attractions.no_results_subtitle")}
                />
            )}

            {/* ===== GRID ===== */}
            {filtered.length > 0 && (
                <>
                    <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                        {currentData.map((m) => (
                            <MonumentCard
                                key={m._id}
                                m={m}
                                onOpen={() => handleOpenMonument(m._id)}
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

            {/* ===== DETAIL MODAL ===== */}
            {selectedMonument && (
                <MonumentDetailModal
                    open={open}
                    onClose={() => setOpen(false)}
                    loading={modalLoading}
                    details={selectedMonument}
                    onOpenAnother={handleOpenAnother}
                    customStyle="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white hover:opacity-90"
                />
            )}
        </div>
    );
}

/* =========================================================
   📦 Monument Card
========================================================= */
function MonumentCard({ m, onOpen }: { m: Monument; onOpen: () => void }) {
    const { t } = useLocale();

    const activeThemeId = useSelector((state: any) => state.global.activeThemeId);

    // normalize
    const subthemes = m.subtheme ?? [];

    // only matching subthemes
    const matchedSubthemes = activeThemeId
        ? subthemes.filter(
            (st) => Array.isArray(st.theme) && st.theme.includes(activeThemeId)
        )
        : subthemes;

    const popularity: number = m.popularity ?? 0;

    return (
        <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white/90 dark:bg-slate-900/40 shadow-md hover:shadow-xl transition-all">
            {/* IMAGE */}
            <div className="relative h-48 w-full overflow-hidden">
                {m.image?.secure_url ? (
                    <img
                        src={m.image.secure_url}
                        alt={m.title || m.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                ) : (
                    <div className="grid h-full w-full place-items-center bg-muted text-muted-foreground">
                        <ImageIcon className="h-8 w-8" />
                    </div>
                )}
            </div>

            {/* CONTENT */}
            <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                    {/* TITLE */}
                    <h3 className="line-clamp-1 text-base font-semibold text-amber-700 dark:text-amber-300">
                        {m.title || m.name}
                    </h3>

                    {/* BRIEF */}
                    {m.content?.brief && (
                        <p
                            className="mt-1 line-clamp-2 text-xs text-muted-foreground whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{
                                __html: normalizeHTML(m.content.brief),
                            }}
                        />
                    )}

                    <div className="mt-2 flex items-center gap-0.5">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${i < popularity
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-gray-300 dark:text-gray-600"
                                    }`}
                            />
                        ))}
                    </div>

                    {/* ✅ ONLY MATCHING SUBTHEME CHIPS */}
                    {matchedSubthemes.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                            {matchedSubthemes.map((s) => (
                                <span
                                    key={s._id}
                                    className="
                    rounded-full px-2.5 py-0.5 text-[11px] font-medium
                    bg-amber-100 text-amber-800
                    dark:bg-amber-900/40 dark:text-amber-300
                  "
                                >
                                    {s.title}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* BUTTON */}
                <Button
                    className="mt-3 cursor-pointer bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white hover:opacity-90"
                    onClick={onOpen}
                >
                    {t("tourDetails.viewDetails")}
                </Button>
            </div>
        </div>
    );
}

/* =========================================================
   🧭 Pagination
========================================================= */
function PageNavigator({ totalPages, page, onPageChange, t }: any) {
    return (
        <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
                {t("pagination_left", { current: page, total: totalPages })}
            </div>
            <div className="flex items-center gap-1">
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
            <div className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white shadow">
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
   🔎 Toolbar (Search + Filter + Sort)
========================================================= */
function MonumentsToolbar({
    query,
    setQuery,
    onSortSelect,
    onFilterSelect,
    selectedSort,
    selectedFilter,
    activeThemeId,
}: {
    query: string;
    setQuery: (v: string) => void;
    onSortSelect: (v: string) => void;
    onFilterSelect: (v: string) => void;
    selectedSort?: string | null;
    selectedFilter?: string | null;
    activeThemeId?: string | null;
}) {
    const { t } = useLocale();
    const [sortOptions, setSortOptions] = useState<MonumentSort[]>([]);
    const [loadingSorts, setLoadingSorts] = useState(false);
    const [filterOptions, setFilterOptions] = useState<any[]>([]);
    const [loadingFilters, setLoadingFilters] = useState(false);

    useEffect(() => {
        let mounted = true;
        const loadSorts = async () => {
            try {
                setLoadingSorts(true);
                const data = await apiFetchMonumentSorts();
                if (mounted) {
                    const sorted = data.sort(
                        (a, b) => (a.priority ?? 99) - (b.priority ?? 99)
                    );
                    setSortOptions(sorted);
                    if (sorted.length > 0) {
                        const defaultSort = sorted.reduce((max, cur) =>
                            (cur.priority ?? 0) > (max.priority ?? 0) ? cur : max
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

    useEffect(() => {
        const loadFilters = async () => {
            try {
                setLoadingFilters(true);
                const data = await apiFetchSubthemesWithQuery({
                    filter: activeThemeId ? { theme: activeThemeId } : undefined,
                    sort: "sortOrder",
                });
                setFilterOptions(data);
            } catch (err) {
                console.error("Failed to fetch monument filters", err);
            } finally {
                setLoadingFilters(false);
            }
        };

        loadFilters();
    }, []);

    return (
        <div className="flex justify-end items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer rounded-full text-amber-700 dark:text-amber-300 hover:text-amber-700 hover:bg-orange-50 dark:hover:bg-orange-900/30"
                    >
                        <Search className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2">
                    <DropdownMenuLabel>
                        {t("shortcut.tourist_attraction_search")}
                    </DropdownMenuLabel>
                    <Input
                        autoFocus
                        placeholder={t("shortcut.tourist_attraction_search_placeholder")}
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
                        className="cursor-pointer rounded-full text-amber-700 dark:text-amber-300 hover:text-amber-700 hover:bg-orange-50 dark:hover:bg-orange-900/30"
                    >
                        <Filter className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>{t("filter")}</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {/* ✅ All Option */}
                    <DropdownMenuItem
                        onClick={() => onFilterSelect("")}
                        className={`cursor-pointer flex items-center gap-2 ${!selectedFilter
                            ? "bg-gray-100 dark:bg-neutral-800 font-semibold"
                            : ""
                            }`}
                    >
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span>{t("all")}</span>
                    </DropdownMenuItem>

                    {/* ------- Other Filters ------- */}
                    {loadingFilters ? (
                        <DropdownMenuItem disabled>{t("loading")}</DropdownMenuItem>
                    ) : filterOptions.length > 0 ? (
                        filterOptions.map((f) => {
                            const filterId = f._id;

                            return (
                                <DropdownMenuItem
                                    key={filterId}
                                    onClick={() => onFilterSelect(filterId)}
                                    className={`cursor-pointer flex items-center gap-2 ${selectedFilter === filterId
                                        ? "bg-gray-100 dark:bg-neutral-800 font-semibold"
                                        : ""
                                        }`}
                                >
                                    {f.icon ? (
                                        <img
                                            src={f.icon}
                                            className="h-4 w-4 object-contain rounded-sm"
                                        />
                                    ) : (
                                        <Filter className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span>{f.title}</span>
                                </DropdownMenuItem>
                            );
                        })
                    ) : (
                        <DropdownMenuItem disabled>
                            {t("tourist_attractions.no_filters")}
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer rounded-full text-amber-700 dark:text-amber-300 hover:text-amber-700 hover:bg-orange-50 dark:hover:bg-orange-900/30"
                    >
                        <ArrowUpDown className="h-4 w-4" />
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
                                className={`cursor-pointer text-black dark:text-white  flex items-center gap-2 ${selectedSort == s.link
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