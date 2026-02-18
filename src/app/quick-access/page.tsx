"use client";

import { useEffect } from "react";
import QuickAccessContent from "@/components/home/QuickAccessContent";
import { useLocale } from "@/providers/LocaleProvider";
import { useAppDispatch } from "@/lib/store/hook";
import { fetchShortcuts } from "@/lib/store/slices/globalSlice";

export default function QuickAccessPage() {
    const { t, locale } = useLocale();
    const dispatch = useAppDispatch();

    useEffect(() => {
        const load = async () => {
            try {
                await dispatch(fetchShortcuts());
            } catch (e) {
                console.error(e);
            }
        };
        load();
    }, [dispatch, locale]);

    return (
        <main className="min-h-screen">
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
      "
                    >
                        {t("quick_access_page.hero_title")}
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
                        {t("quick_access_page.hero_subtitle")}
                    </p>
                </div>
            </section>
            <QuickAccessContent standalone={true} />
        </main>
    );
}
