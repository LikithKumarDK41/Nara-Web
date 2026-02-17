"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import HeroCarousel from "@/components/home/HeroCarousel";
import HomeTabs from "@/components/home/HomeTabs";
import Breadcrumb from "@/components/ui/Breadcrumb";
import CategoryContent from "@/components/category/CategoryContent";
import { useAppSelector, useAppDispatch } from "@/lib/store/hook";
import { selectShortcuts, selectGlobalLoading, fetchShortcuts } from "@/lib/store/slices/globalSlice";
import { useLocale } from "@/providers/LocaleProvider";
import { useGlobalLoader } from "@/providers/LoaderProvider";

export default function ExplorePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ExplorePageContent />
        </Suspense>
    );
}

function ExplorePageContent() {
    const { t, locale } = useLocale();
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { show, hide } = useGlobalLoader();
    const shortcuts = useAppSelector(selectShortcuts);
    const globalLoading = useAppSelector(selectGlobalLoading);

    const currentCategoryId = searchParams.get("category");
    const [selectedCategory, setSelectedCategory] = useState<any | null>(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                // Always fetch to ensure we have data for the current locale
                await dispatch(fetchShortcuts());
            } catch (e) {
                console.error(e);
            }
        }
        load();
        return () => { mounted = false; };
    }, [dispatch, locale]);

    /* -------------------- Priority Logic (Copy/Share?) -------------------- */
    const sectionTwo = useMemo(() => {
        function placeByPriority(list: any[]) {
            const ordered: any[] = [];
            const nullZero: any[] = [];
            const leftovers: any[] = [];

            list.forEach((s) => {
                const p = s.priority ?? 0;
                if (p === 0) nullZero.push(s);
                else if (Number.isInteger(p) && p > 0) ordered[p] = s;
                else leftovers.push(s);
            });
            return nullZero.concat(ordered.filter(Boolean)).concat(leftovers);
        }

        return placeByPriority(
            shortcuts.filter((s) => {
                const p = s.priority ?? 0;
                return p >= 4 && p <= 9;
            })
        );
    }, [shortcuts]);

    // Set default selected category
    // Sync State with URL or Default
    useEffect(() => {
        if (sectionTwo.length > 0) {
            if (currentCategoryId) {
                // Find category by ID from URL
                const found = sectionTwo.find((c) => c._id === currentCategoryId);
                if (found) {
                    setSelectedCategory(found);
                } else {
                    // URL has invalid ID, fallback to first? or just ignore
                    setSelectedCategory(sectionTwo[0]);
                }
            } else {
                // No URL param, default to first AND set URL
                const defaultCat = sectionTwo[0];
                setSelectedCategory(defaultCat);
                // Avoid overwriting if we just cleared it, but initial load should have one.
                // Using replace to not break history stack navigation
                if (defaultCat?._id) {
                    router.replace(`${pathname}?category=${defaultCat._id}`);
                }
            }
        }
    }, [currentCategoryId, sectionTwo, pathname, router]);

    const handleCategoryClick = (cat: any) => {
        setSelectedCategory(cat);
        router.push(`${pathname}?category=${cat._id}`);
    };

    const getThemeIdFromLink = (link?: string) => {
        try {
            if (link && link.trim().startsWith("{")) {
                const parsed = JSON.parse(link);
                return parsed.theme || null;
            }
        } catch (e) {
            return null;
        }
        return null;
    };

    const selectedThemeId = selectedCategory ? getThemeIdFromLink(selectedCategory.link) : null;

    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const html = document.documentElement;
        setIsDark(html.classList.contains("dark"));
        const observer = new MutationObserver(() => {
            setIsDark(html.classList.contains("dark"));
        });
        observer.observe(html, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    return (
        <div className="flex flex-col w-full">
            {/* ===== HERO SECTION ===== */}
            <section
                className="mb-4
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
      "
                    >
                        {t("home.explore_categories")}
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
                        {t("home.explore_subtitle")}
                    </p>
                </div>
            </section>
            {/* <HomeTabs activeTab="categories" /> */}

            <div className="mx-auto w-full px-4 space-y-6 pb-0">
                <div className="min-h-[200px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {!globalLoading && sectionTwo.length > 0 && (
                        <div className="space-y-6">
                            {/* --- Sub Navigation (Pills) --- */}
                            <div className="flex justify-center flex-wrap gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                                {sectionTwo.map((cat: any) => {
                                    const isActive = selectedCategory?._id === cat._id;
                                    return (
                                        <button
                                            key={cat._id}
                                            onClick={() => handleCategoryClick(cat)}
                                            className={`cursor-pointer
                          flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 border
                          ${isActive
                                                    ? "bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-500/25 scale-105"
                                                    : "bg-white dark:bg-[#15191f] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-teal-400 dark:hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400"
                                                }
                        `}
                                        >
                                            {cat.icon?.secure_url && (
                                                <img
                                                    src={cat.icon.secure_url}
                                                    alt=""
                                                    className={`w-4 h-4 object-contain ${isActive ? "!brightness-0 invert" : ""}`}
                                                    style={{
                                                        filter: isDark
                                                            ? "brightness(0) saturate(100%) invert(81%) sepia(31%) saturate(545%) hue-rotate(124deg) brightness(98%) contrast(92%)"
                                                            : "brightness(0) saturate(100%) invert(70%) sepia(40%) saturate(700%) hue-rotate(124deg) brightness(80%) contrast(115%)",
                                                    }}
                                                />
                                            )}
                                            {cat.title}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* BREADCRUMB */}
                            <div className="flex justify-start -mt-10">
                                <Breadcrumb
                                    items={[
                                        { label: t("explore_nara") || "Explore", href: "/explore" },
                                        ...(selectedCategory ? [{
                                            label: selectedCategory.title,
                                            href: `/explore?category=${selectedCategory._id}`
                                        }] : [])
                                    ]}
                                />
                            </div>

                            {/* --- Dynamic Content --- */}
                            <div className="h-auto">
                                {selectedThemeId ? (
                                    <CategoryContent themeId={selectedThemeId} hideHero={true} />
                                ) : (
                                    <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
                                        {t("select_category_to_view")}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
