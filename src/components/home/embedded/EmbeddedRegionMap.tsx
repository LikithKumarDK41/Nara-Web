"use client";

import { useEffect, useState } from "react";
import {
    ImageIcon,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
} from "lucide-react";

import { useLocale } from "@/providers/LocaleProvider";
import RegionMap from "@/components/map/regionMap";
import { apiFetchRegions } from "@/services/userGlobalservice";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function EmbeddedRegionMap() {
    const { t } = useLocale();

    const [view, setView] = useState<"region" | "map">("region");
    const [regions, setRegions] = useState<any[]>([]);
    const [page, setPage] = useState(1);

    const limit = 6;
    const total = regions.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentData = regions.slice((page - 1) * limit, page * limit);

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
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {currentData.map((r) => (
                                    <RegionCard key={r._id} r={r} />
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
                    <RegionMap height={500} />
                </div>
            )}
        </div>
    );
}

function RegionCard({ r }: { r: any }) {
    const { t } = useLocale();
    const router = useRouter();
    return (
        <div
            className="group relative flex flex-col h-full p-3 rounded-[3rem] bg-white dark:bg-[#0a0a0a] border border-slate-100 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-700 cursor-pointer"
            onClick={() => {
                sessionStorage.setItem("returnToRegionModal", "true");
                router.push(`/regions?id=${r._id}`);
            }}
        >
            {/* 🖼️ Premium Inset Image Container */}
            <div className="relative h-[280px] w-full rounded-[2.2rem] overflow-hidden bg-slate-50 dark:bg-zinc-900 shrink-0 border border-slate-50 dark:border-white/5">
                {r.image?.secure_url ? (
                    <img
                        src={r.image.secure_url}
                        alt={r.title}
                        className="block h-full w-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon className="h-10 w-10 text-slate-300 dark:text-zinc-700" />
                    </div>
                )}

                {/* Ambient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* ✍️ Content Area */}
            <div className="flex-1 px-6 py-6 flex flex-col min-h-0 bg-transparent">
                <div className="flex-1 space-y-3">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white line-clamp-2 font-serif italic tracking-tight leading-tight">
                        {r.title}
                    </h3>

                    {r.content?.brief && (
                        <p
                            className="text-sm text-slate-500 dark:text-white/40 line-clamp-3 leading-relaxed font-light"
                            dangerouslySetInnerHTML={{ __html: r.content.brief }}
                        />
                    )}
                </div>

                {/* Architectural Full-Width Action */}
                <div className="mt-6 pt-5 border-t border-slate-50 dark:border-white/5">
                    <div className="flex items-center justify-between group/link">
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.25em] transition-colors duration-300">
                            {t("tourDetails.viewDetails")}
                        </span>
                        <div className="flex-1 mx-4 h-px bg-slate-100 dark:bg-white/5 relative overflow-hidden">
                            <div className="absolute inset-0 bg-slate-900 dark:bg-white -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-900 dark:text-white transform transition-transform duration-500 ease-out group-hover:translate-x-1" />
                    </div>
                </div>
            </div>
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
