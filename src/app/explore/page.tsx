"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import HeroCarousel from "@/components/home/HeroCarousel";
import HomeTabs from "@/components/home/HomeTabs";
import Breadcrumb from "@/components/ui/Breadcrumb";
import CategoryContent from "@/components/category/CategoryContent";
import { useAppSelector, useAppDispatch } from "@/lib/store/hook";
import { selectShortcuts, selectGlobalLoading, fetchShortcuts } from "@/lib/store/slices/globalSlice";
import { useLocale } from "@/providers/LocaleProvider";
import { useGlobalLoader } from "@/providers/LoaderProvider";
import { ChevronDown, Check } from "lucide-react";

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
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isMenuOpen && !target.closest(".category-dropdown")) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMenuOpen]);

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
        setIsMenuOpen(false);
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
        font-serif italic
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

            <div className="mx-auto w-full px-4 space-y-6 pb-6">
                <div className="min-h-[200px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {!globalLoading && sectionTwo.length > 0 && (
                        <div className="space-y-6">
                            {/* --- Hybrid Category Navigation --- */}
                            <div className="relative z-40 w-full flex justify-center category-dropdown">
                                <div className="relative w-full max-w-md lg:hidden">
                                    {/* Dropdown Trigger (Mobile/Tablet) */}
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className="
                                            w-full flex items-center justify-between gap-4 p-4
                                            bg-white/70 dark:bg-slate-900/40 
                                            backdrop-blur-2xl border border-white/40 dark:border-white/5 
                                            rounded-2xl shadow-xl transition-all duration-300
                                            hover:border-teal-500/50 dark:hover:border-teal-400/30
                                            group/trigger
                                        "
                                    >
                                        <div className="flex items-center gap-3">
                                            {selectedCategory?.icon?.secure_url ? (
                                                <div className="w-10 h-10 rounded-xl bg-teal-600 dark:bg-teal-500 flex items-center justify-center p-2 transition-transform duration-500 group-hover/trigger:scale-110 shadow-lg shadow-teal-500/20">
                                                    <img
                                                        src={selectedCategory.icon.secure_url}
                                                        alt=""
                                                        className="w-full h-full object-contain filter brightness-0 invert"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-teal-500/10" />
                                            )}
                                            <div className="text-left">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-teal-600 dark:text-teal-400">
                                                    {t("select_category")}
                                                </p>
                                                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                                                    {selectedCategory?.title || t("loading")}
                                                </h3>
                                            </div>
                                        </div>
                                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-500 ${isMenuOpen ? "rotate-180" : ""}`} />
                                    </button>

                                    {/* Dropdown Menu (Mobile/Tablet) */}
                                    <AnimatePresence>
                                        {isMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.2, ease: "easeOut" }}
                                                className="
                                                    absolute top-full left-0 right-0 mt-3 p-2
                                                    bg-white/90 dark:bg-slate-900/80 
                                                    backdrop-blur-3xl border border-white/50 dark:border-white/10 
                                                    rounded-2xl shadow-2xl overflow-hidden
                                                "
                                            >
                                                <div className="grid grid-cols-1 gap-1 max-h-[60vh] overflow-y-auto scrollbar-hide">
                                                    {sectionTwo.map((cat: any) => {
                                                        const isActive = selectedCategory?._id === cat._id;
                                                        return (
                                                            <button
                                                                key={cat._id}
                                                                onClick={() => handleCategoryClick(cat)}
                                                                className={`cursor-pointer
                                                                    flex items-center justify-between w-full p-3 rounded-xl
                                                                    transition-all duration-300 group/item
                                                                    ${isActive
                                                                        ? "bg-teal-500 dark:bg-teal-600 text-white shadow-lg shadow-teal-500/20"
                                                                        : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-white/60 hover:text-teal-600 dark:hover:text-white"
                                                                    }
                                                                `}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    {cat.icon?.secure_url && (
                                                                        <img
                                                                            src={cat.icon.secure_url}
                                                                            alt=""
                                                                            className={`w-5 h-5 object-contain transition-all duration-300 ${isActive ? "brightness-0 invert" : "grayscale opacity-60 group-hover/item:grayscale-0 group-hover/item:opacity-100"}`}
                                                                            style={{
                                                                                filter: isActive
                                                                                    ? "brightness(0) invert(1)"
                                                                                    : isDark
                                                                                        ? "brightness(0) saturate(100%) invert(81%) sepia(31%) saturate(545%) hue-rotate(124deg) brightness(98%) contrast(92%)"
                                                                                        : "brightness(0) saturate(100%) invert(40%) sepia(80%) saturate(600%) hue-rotate(130deg) brightness(90%) contrast(100%)",
                                                                            }}
                                                                        />
                                                                    )}
                                                                    <span className="text-sm font-semibold">{cat.title}</span>
                                                                </div>
                                                                {isActive && <Check className="w-4 h-4" />}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Floating Dock Navigation (Large Screens) */}
                                <div className="hidden lg:flex relative max-w-full pointer-events-auto">
                                    <div className="absolute -inset-4 bg-teal-500/5 dark:bg-teal-400/5 blur-3xl rounded-full opacity-0 group-hover/dock-wrapper:opacity-100 transition-opacity duration-700 -z-10" />

                                    <div className="
                                        group/dock flex items-center gap-1 p-1.5 
                                        bg-white/60 dark:bg-slate-900/40 
                                        backdrop-blur-2xl border border-white/40 dark:border-white/5 
                                        rounded-full shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1),0_0_1px_1px_rgba(255,255,255,0.5)] 
                                        dark:shadow-[0_25px_60px_-20px_rgba(0,0,0,0.6),0_0_1px_0.5px_rgba(255,255,255,0.05)]
                                        px-2 mx-auto
                                    ">
                                        {sectionTwo.map((cat: any) => {
                                            const isActive = selectedCategory?._id === cat._id;
                                            return (
                                                <button
                                                    key={cat._id}
                                                    onClick={() => handleCategoryClick(cat)}
                                                    className="relative flex-shrink-0 group/btn focus:outline-none"
                                                >
                                                    <div className={`
                                                        relative z-10 flex items-center gap-3 px-6 py-2.5 rounded-full 
                                                        text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-500
                                                        ${isActive ? 'text-white' : 'text-slate-500 dark:text-white/40 hover:text-teal-600 dark:hover:text-teal-400'}
                                                    `}>
                                                        {cat.icon?.secure_url && (
                                                            <div className={`
                                                                w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500
                                                                ${isActive ? 'bg-white/20' : 'bg-slate-100/80 dark:bg-white/5 group-hover/btn:scale-110 group-hover/btn:bg-teal-500/5'}
                                                            `}>
                                                                <img
                                                                    src={cat.icon.secure_url}
                                                                    alt=""
                                                                    className={`w-4 h-4 object-contain transition-all duration-500 ${isActive ? 'scale-110' : 'grayscale opacity-60 group-hover/btn:grayscale-0 group-hover/btn:opacity-100'}`}
                                                                    style={{
                                                                        filter: isActive
                                                                            ? "brightness(0) invert(1)"
                                                                            : isDark
                                                                                ? "brightness(0) saturate(100%) invert(81%) sepia(31%) saturate(545%) hue-rotate(124deg) brightness(98%) contrast(92%)"
                                                                                : "brightness(0) saturate(100%) invert(40%) sepia(80%) saturate(600%) hue-rotate(130deg) brightness(90%) contrast(100%)",
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                        <span>{cat.title}</span>
                                                    </div>

                                                    {isActive && (
                                                        <motion.div
                                                            layoutId="activeDockPill"
                                                            className="absolute inset-0 z-0 bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 dark:from-teal-400 dark:via-teal-500 dark:to-emerald-500 rounded-full shadow-[0_8px_20px_-5px_rgba(20,184,166,0.3)]"
                                                            transition={{ type: "spring", bounce: 0.22, duration: 0.6 }}
                                                        />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* BREADCRUMB */}
                            <div className="flex justify-start mt-2">
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
