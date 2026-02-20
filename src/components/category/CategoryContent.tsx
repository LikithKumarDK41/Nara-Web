"use client";

import { useEffect, useState } from "react";
import {
    apiFetchSubthemesWithQuery,
    apiFetchByLink,
    apiFetchThemes,
} from "@/services/userGlobalservice";
import {
    apiFetchMonumentSorts,
    apiFetchMonumentDetails,
} from "@/services/userTourService";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import MonumentDetailModal from "@/components/tour/MonumentDetailModal";
import {
    ArrowRight,
    Layers,
    MapPin,
    Star,
    BookOpen,
    ArrowUpDown,
    ImageIcon,
} from "lucide-react";
import { useGlobalLoader } from "@/providers/LoaderProvider";
import { normalizeHTML } from "@/lib/utils";
import MonumentCard from "@/components/tour/MonumentCard";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MonumentSort } from "@/lib/types/userTour.types";
import { useLocale } from "@/providers/LocaleProvider";

interface CategoryContentProps {
    themeId: string | null;
    hideHero?: boolean;
}

export default function CategoryContent({ themeId, hideHero = false }: CategoryContentProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentSubthemeId = searchParams.get("subtheme");
    const currentMonumentId = searchParams.get("monument");

    const [subthemes, setSubthemes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [themeInfo, setThemeInfo] = useState<any | null>(null);
    const { t, locale } = useLocale();

    const [view, setView] = useState<"subthemes" | "monuments">("subthemes");
    const [activeSubtheme, setActiveSubtheme] = useState<any | null>(null);
    const [monuments, setMonuments] = useState<any[]>([]);
    const [monumentsLoading, setMonumentsLoading] = useState(false);
    const { show, hide } = useGlobalLoader();
    const [modalOpen, setModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedMonument, setSelectedMonument] = useState<any | null>(null);
    const [selectedSort, setSelectedSort] = useState<string | null>(null);
    const [sortOptions, setSortOptions] = useState<MonumentSort[]>([]);

    // Reset view when themeId changes (or handle URL changes)
    useEffect(() => {
        // If themeId changes, we might want to clear subtheme/monument params?
        // But for now, let's rely on the URL params driving the state.

        // If no subtheme in URL, ensure we are in subthemes view
        if (!currentSubthemeId) {
            setView("subthemes");
            setActiveSubtheme(null);
            setMonuments([]);
        }
        // If subtheme in URL, set active (logic moved to separate effect)
    }, [themeId, currentSubthemeId]);

    // Sync State with URL Params
    useEffect(() => {
        if (subthemes.length > 0 && currentSubthemeId) {
            const found = subthemes.find((s) => s._id === currentSubthemeId);
            if (found) {
                setActiveSubtheme(found);
                setView("monuments");
            }
        }
    }, [currentSubthemeId, subthemes]);

    useEffect(() => {
        const fetchMonumentDetails = async () => {
            if (currentMonumentId) {
                try {
                    // If already open and same ID, skip
                    if (modalOpen && selectedMonument?._id === currentMonumentId) return;

                    setModalLoading(true);
                    show();
                    const data = await apiFetchMonumentDetails(currentMonumentId);
                    if (data) {
                        setSelectedMonument(data);
                        setModalOpen(true);
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    setModalLoading(false);
                    hide();
                }
            } else {
                setModalOpen(false);
                setSelectedMonument(null);
            }
        }
        fetchMonumentDetails();
    }, [currentMonumentId, show, hide]); // Intentionally omitting modalOpen to avoid loops

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            if (!themeId) {
                setSubthemes([]);
                return;
            }

            try {
                setLoading(true);
                show();

                const data = await apiFetchSubthemesWithQuery({
                    filter: { theme: themeId },
                });
                if (mounted) setSubthemes(data);

                // Try to fetch theme metadata (title/image) for hero
                try {
                    const themes = await apiFetchThemes();
                    const found =
                        themes.find((t: any) => t._id === themeId) || null;
                    if (mounted) setThemeInfo(found);
                } catch (e) {
                    // ignore
                }
            } catch (err) {
                console.error("Failed to load subthemes:", err);
                if (mounted) setSubthemes([]);
            } finally {
                if (mounted) setLoading(false);
                hide();
            }
        };

        load();

        return () => {
            mounted = false;
        };
    }, [themeId, show, hide, locale]);

    useEffect(() => {
        let mounted = true;

        const loadDefaultSort = async () => {
            try {
                const sorts = await apiFetchMonumentSorts();
                setSortOptions(sorts);

                if (!mounted || !sorts?.length) return;

                // pick highest-priority default
                const defaultSort = "-popularity";

                setSelectedSort(defaultSort);
            } catch (e) {
                console.error("Failed to load default sort", e);
                setSelectedSort("-popularity"); // safe fallback
            }
        };

        loadDefaultSort();
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (!activeSubtheme || view !== "monuments") return;

        let mounted = true;

        const fetchMonuments = async () => {
            const backendSort =
                selectedSort === "-popularity"
                    ? "-popularity"
                    : (selectedSort ?? "-popularity");

            try {
                setMonuments([]);
                setMonumentsLoading(true);
                show();

                const data = await apiFetchByLink(
                    "monuments",
                    { subtheme: activeSubtheme._id },
                    backendSort,
                );

                if (mounted) {
                    setMonuments(data || []);
                }
            } catch (err) {
                console.error(err);
                if (mounted) setMonuments([]);
            } finally {
                if (mounted) {
                    setMonumentsLoading(false);
                    hide();
                }
            }
        };

        fetchMonuments();

        return () => {
            mounted = false;
        };
    }, [selectedSort, activeSubtheme, view, locale]);

    const handleOpenMonument = (monumentId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("monument", monumentId);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="w-full">
            {/* ================= ENHANCED HERO SECTION ================= */}
            {!hideHero && (
                <section
                    className="
            w-full
            rounded-3xl
            bg-gradient-to-br
            from-teal-600 via-cyan-600 to-emerald-700
            dark:from-[#0a1f2e] dark:via-[#1a3a4a] dark:to-[#2d5a6f]
            shadow-[0_40px_100px_rgba(0,120,100,0.25)]
            px-6 sm:px-10 md:px-16 lg:px-20
            py-4 md:py-6 lg:py-8
            relative
            overflow-hidden
            mb-8
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
                                {t("nara_heritage_theme")}
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
              "
                        >
                            {themeInfo?.title || t("explore_nara")}
                            <span className="block text-sm sm:text-base md:text-lg lg:text-xl mt-1 font-bold text-white/80">
                                {t("cultural_heritage_collection")}
                            </span>
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
                            {t("category_desc")}
                        </p>

                        {/* Stats row */}
                        <div className="mt-3 flex flex-wrap justify-center gap-4 md:gap-6">
                            <div className="flex flex-col items-center">
                                <span className="text-lg md:text-xl font-bold text-teal-300">
                                    {subthemes.length}
                                </span>
                                <span className="text-[10px] md:text-xs text-white/70 font-medium">
                                    {t("themes")}
                                </span>
                            </div>
                            <div className="hidden sm:flex flex-col items-center">
                                <span className="text-lg md:text-xl font-bold text-cyan-300">
                                    ∞
                                </span>
                                <span className="text-[10px] md:text-xs text-white/70 font-medium">
                                    {t("discovery")}
                                </span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-lg md:text-xl font-bold text-emerald-300">
                                    {t("curated")}
                                </span>
                                <span className="text-[10px] md:text-xs text-white/70 font-medium">
                                    {t("collection")}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {view === "subthemes" && (
                <section className="space-y-10 pt-4">
                    {/* Header */}
                    {!hideHero && <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-white/10">
                        <Layers className="w-5 h-5 text-teal-500" />
                        <h2 className="text-lg font-bold tracking-wider uppercase text-slate-900 dark:text-white">
                            {t("related_themes")}
                        </h2>
                    </div>}

                    {/* Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {subthemes.map((s) => {
                            //   const themeTitle = s.theme?.[0]?.title || s.theme?.[0]?.name;

                            const themeTitle = s.theme
                                ?.map((tt: any) => tt.title || tt.name)
                                .filter(Boolean)
                                .join(", ");

                            return (
                                <div
                                    key={s._id}
                                    className="cursor-pointer
              group relative
              h-[150px]
              rounded-xl overflow-hidden
            " onClick={async (e) => {
                                        e.stopPropagation();
                                        // Update URL to active subtheme
                                        const params = new URLSearchParams(searchParams.toString());
                                        params.set("subtheme", s._id);
                                        // Clear any monument param just in case
                                        params.delete("monument");
                                        router.push(`${pathname}?${params.toString()}`, { scroll: false });
                                    }}
                                >
                                    {/* Image */}
                                    {s.image?.secure_url && (
                                        <img
                                            src={s.image.secure_url}
                                            alt={s.title || s.name}
                                            className="
                  absolute inset-0
                  h-full w-full object-cover
                  transition-transform duration-500
                  group-hover:scale-105
                "
                                        />
                                    )}

                                    {/* Dark overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

                                    {/* Theme badge */}
                                    {themeTitle && (
                                        <div
                                            className="font-serif italic
                absolute top-3 left-3
                px-2.5 py-1
                rounded-full
                text-[10px] font-semibold
                bg-black/55 backdrop-blur-md
                text-teal-300
                border border-white/10
              "
                                        >
                                            {themeTitle}
                                        </div>
                                    )}

                                    {/* Bottom content */}
                                    <div
                                        className="font-serif italic
              absolute inset-x-0 bottom-0
              px-4 py-3
              flex items-center gap-2 justify-between
            "
                                    >
                                        {/* Title */}
                                        <h3 className="font-serif italic
 text-sm font-semibold text-white leading-tight line-clamp-2">
                                            {s.title || s.name}
                                        </h3>

                                        {/* ✅ Explore button ONLY */}
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                const params = new URLSearchParams(searchParams.toString());
                                                params.set("subtheme", s._id);
                                                params.delete("monument");
                                                router.push(`${pathname}?${params.toString()}`, { scroll: false });
                                            }}
                                            className="
                  flex items-center gap-1
                  text-xs font-semibold
                  text-teal-300
                  opacity-90
                  group-hover:opacity-100
                  transition
                  cursor-pointer
                "
                                        >
                                            <span>{t("explore")}</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ================= SELECTED SUBTHEME INTRO ================= */}
            {activeSubtheme && (
                <section className="space-y-4 pt-8">
                    {/* Header */}
                    <div className="flex justify-between  border-b border-slate-200 dark:border-white/10">
                        <div className="flex items-center gap-3 pb-4">
                            <BookOpen className="w-5 h-5 text-teal-500" />
                            <h2 className="font-serif italic
 text-lg font-bold tracking-wider uppercase text-slate-900 dark:text-white">
                                {t("theme_overview")}
                            </h2>
                        </div>

                        <div className="flex justify-end items-end gap-3 pb-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="cursor-pointer rounded-full p-2
        text-teal-600 dark:text-teal-400
        hover:bg-teal-50 dark:hover:bg-teal-900/30"
                                    >
                                        <ArrowUpDown className="w-5 h-5" />
                                    </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-[#15191f] border border-slate-200/80 dark:border-slate-700/60">
                                    <DropdownMenuLabel>{t("sort")}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />

                                    {sortOptions.map((so) => (
                                        <DropdownMenuItem
                                            key={so._id}
                                            onClick={() => setSelectedSort(so.link || so.name || "")}
                                            className={`cursor-pointer flex items-center gap-2 ${selectedSort === so.link
                                                ? "bg-gray-100 dark:bg-neutral-800 font-semibold"
                                                : ""
                                                }`}
                                        >
                                            {/* optional icon */}
                                            {so.icon?.secure_url ? (
                                                <img
                                                    src={so.icon.secure_url}
                                                    alt={so.title || so.name}
                                                    className="h-4 w-4 rounded-sm object-contain"
                                                />
                                            ) : (
                                                <ImageIcon className="h-4 w-4" />
                                            )}

                                            {/* label from backend */}
                                            <span>{so.title || so.name}</span>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Content - Text Only */}
                    <div className="pt-2">
                        {/* Title */}
                        <h1
                            className="font-serif italic
        text-3xl md:text-4xl
        font-bold
        text-slate-900 dark:text-white
        mb-6
        leading-tight
      "
                        >
                            {activeSubtheme.title || activeSubtheme.name || "Theme"}
                        </h1>

                        {/* Accent line */}
                        <div className="h-1 w-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full mb-6" />

                        {/* Description */}
                        {activeSubtheme.description ? (
                            <div
                                className="
          text-slate-700 dark:text-slate-300
          text-base md:text-lg
          leading-[1.8]
          font-light
          [&>p]:mb-4
          [&>p:last-child]:mb-0
          [&>strong]:font-semibold
          [&>em]:italic
        "
                                dangerouslySetInnerHTML={{
                                    __html: activeSubtheme.description,
                                }}
                            />
                        ) : (
                            <p className="text-base text-slate-500 dark:text-slate-400 italic font-light">
                                {t("no_desc_available")}
                            </p>
                        )}
                    </div>
                </section>
            )}

            {view === "monuments" && (
                <section className="space-y-14 pt-8">
                    {/* Header */}
                    <div
                        className="font-serif italic
        flex items-center justify-between
        pb-4
        border-b border-slate-200 dark:border-white/10
      "
                    >
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-teal-500" />
                            <h2 className="text-lg font-bold tracking-wider uppercase text-slate-900 dark:text-white">
                                {t("related_spots")}
                            </h2>
                        </div>

                        {/* Back */}
                        <button
                            onClick={() => {
                                const params = new URLSearchParams(searchParams.toString());
                                params.delete("subtheme");
                                params.delete("monument");
                                router.push(`${pathname}?${params.toString()}`, { scroll: false });
                            }}
                            className="font-serif italic
          inline-flex items-center gap-1.5
          text-xs font-semibold
          text-teal-600 dark:text-teal-400
          hover:text-teal-500
          transition-colors cursor-pointer
        "
                        >
                            ← {t("back")}
                        </button>
                    </div>

                    {/* Empty */}
                    {monuments.length === 0 && !monumentsLoading && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {t("no_monuments_found_")}
                        </p>
                    )}

                    {/* Editorial Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {monuments.map((m, idx) => (
                            <MonumentCard
                                key={m._id}
                                monument={m}
                                t={t}
                                idx={idx}
                                onClick={() => handleOpenMonument(m._id)}
                            />
                        ))}
                    </div>
                </section>
            )
            }

            {
                selectedMonument && (
                    <MonumentDetailModal
                        open={modalOpen}
                        onClose={() => {
                            // Remove monument param from URL
                            const params = new URLSearchParams(searchParams.toString());
                            params.delete("monument");
                            router.push(`${pathname}?${params.toString()}`, { scroll: false });
                        }}
                        loading={modalLoading}
                        details={selectedMonument}
                        onOpenAnother={(id: string) => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set("monument", id);
                            router.push(`${pathname}?${params.toString()}`, { scroll: false });
                        }}
                    />
                )}
        </div >
    );
}
