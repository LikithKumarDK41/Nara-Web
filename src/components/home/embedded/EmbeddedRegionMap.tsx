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
            className="group relative flex flex-col h-[520px] rounded-3xl overflow-hidden bg-white dark:bg-[#15191f] border border-slate-200/80 dark:border-slate-700/60 shadow-lg hover:shadow-2xl hover:shadow-teal-500/20 dark:hover:shadow-teal-900/40 transition-all duration-500 hover:-translate-y-2 cursor-pointer isolate"
            onClick={() => {
                sessionStorage.setItem("returnToRegionModal", "true");
                router.push(`/regions?id=${r._id}`);
            }}
        >
            {/* IMAGE */}
            <div className="relative h-[280px] w-full overflow-hidden flex-shrink-0">
                {r.image?.secure_url ? (
                    <img
                        src={r.image.secure_url}
                        alt={r.title}
                        className="block h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                        <ImageIcon className="h-12 w-12 text-slate-400 dark:text-slate-600" />
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-40 dark:opacity-70 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-20 dark:group-hover:opacity-0 transition-opacity duration-500" />
            </div>
            {/* CONTENT */}
            <div className="relative flex-1 p-8 flex flex-col justify-between bg-gradient-to-br from-white to-slate-50/50 dark:from-[#15191f] dark:to-[#1a1f28]">
                <div className="space-y-3">
                    <h3 className="font-serif italic text-2xl font-bold text-slate-900 dark:text-white line-clamp-1 leading-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300">
                        {r.title}
                    </h3>

                    {r.content?.brief && (
                        <p
                            className="text-sm font-light text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: r.content.brief }}
                        />
                    )}
                </div>

                <div className="flex items-center justify-between pt-6 mt-auto border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-xs font-bold text-teal-600/80 dark:text-teal-400/80 uppercase tracking-widest group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {t("tourDetails.viewDetails")}
                    </span>
                    <div className="w-11 h-11 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a2029] flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-teal-500 group-hover:to-teal-600 group-hover:border-teal-500 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:shadow-teal-500/50">
                        <ArrowRight className="w-5 h-5" />
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
