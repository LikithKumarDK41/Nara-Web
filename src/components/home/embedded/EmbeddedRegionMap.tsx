"use client";

import { useEffect, useState, useRef } from "react";
import {
    ImageIcon,
    ChevronLeft,
    ChevronRight,
    Landmark,
} from "lucide-react";

import { useLocale } from "@/providers/LocaleProvider";
import {
    apiFetchRegions,
} from "@/services/userGlobalservice";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { normalizeHTML } from "@/lib/utils";
import MonumentCard from "@/components/tour/MonumentCard";

export default function EmbeddedRegionMap() {
    const { t } = useLocale();
    const router = useRouter();

    const [view, setView] = useState<"region" | "map">("region");
    const [regions, setRegions] = useState<any[]>([]);
    const [page, setPage] = useState(1);

    // 📐 Ref for scrolling to top of results on pagination
    const resultsTopRef = useRef<HTMLDivElement>(null);

    // ✅ Auto-scroll to top of results when page changes
    useEffect(() => {
        if (resultsTopRef.current) {
            resultsTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [page]);

    const limit = 6;
    const total = regions.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const pageItems = regions.slice((page - 1) * limit, page * limit);

    /* ---------------- Fetch regions ---------------- */
    const loadRegions = async (mountedRef?: { current: boolean }) => {
        try {
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
            }
        }
    };

    useEffect(() => {
        const mountedRef = { current: true };
        loadRegions(mountedRef);
        return () => {
            mountedRef.current = false;
        };
    }, []);

    /* ---------------- Reset page on view change ---------------- */
    useEffect(() => {
        setPage(1);
    }, [view]);

    return (
        <div className="w-full space-y-6 animate-in fade-in zoom-in duration-300">

            {/* ===== Toggle ===== */}
            <div className="flex justify-center">
                <div className="inline-grid grid-cols-2 gap-2 rounded-2xl p-1.5 bg-card border-foreground/30 backdrop-blur border">
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
                            <div ref={resultsTopRef} className="scroll-mt-6" />

                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {pageItems.map((r, idx) => (
                                    <MonumentCard
                                        key={r._id}
                                        monument={{ ...r, name: r.title }} // Adapter for Region to Monument
                                        t={t}
                                        idx={idx}
                                        onClick={() => router.push(`/regions?id=${r._id}`)}
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
                <div className="w-full mt-4 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg">
                    {/* <RegionMap height={500} /> */}
                </div>
            )}
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
