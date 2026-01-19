"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hook";
import { selectActiveThemeId } from "@/lib/store/slices/globalSlice";
import { apiFetchSubthemesWithQuery, apiFetchByLink, apiFetchThemes } from "@/services/userGlobalservice";
import { apiFetchMonumentDetails } from "@/services/userTourService";
import MonumentDetailModal from "@/components/tour/MonumentDetailModal";
import { ArrowRight, Layers, MapPin, Star } from "lucide-react";
import { useGlobalLoader } from "@/providers/LoaderProvider";

export default function PoliticsPage() {
    const activeThemeId = useAppSelector(selectActiveThemeId);
    const [subthemes, setSubthemes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [themeInfo, setThemeInfo] = useState<any | null>(null);

    const [view, setView] = useState<"subthemes" | "monuments">("subthemes");
    const [activeSubtheme, setActiveSubtheme] = useState<any | null>(null);
    const [monuments, setMonuments] = useState<any[]>([]);
    const [monumentsLoading, setMonumentsLoading] = useState(false);
    const { show, hide } = useGlobalLoader();
    const dispatch = useAppDispatch();
    const [modalOpen, setModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedMonument, setSelectedMonument] = useState<any | null>(null);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            if (!activeThemeId) {
                setSubthemes([]);
                return;
            }

            try {
                setLoading(true);
                const data = await apiFetchSubthemesWithQuery({ filter: { theme: activeThemeId }, sort: "sortOrder" });
                if (mounted) setSubthemes(data);

                // Try to fetch theme metadata (title/image) for hero
                try {
                    const themes = await apiFetchThemes();
                    const found = themes.find((t: any) => t._id === activeThemeId) || null;
                    if (mounted) setThemeInfo(found);
                } catch (e) {
                    // ignore
                }
            } catch (err) {
                console.error("Failed to load subthemes:", err);
                if (mounted) setSubthemes([]);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();

        return () => {
            mounted = false;
        };
    }, [activeThemeId]);

    return (
        <main className="w-full">
            {/* ================= RESPONSIVE HERO (POLISHED) ================= */}
            <section
                className="
    w-full
    rounded-3xl
    bg-gradient-to-r
    from-teal-700 via-cyan-700 to-emerald-700
    dark:from-[#0f2027] dark:via-[#203a43] dark:to-[#2c5364]
    shadow-[0_30px_80px_rgba(0,0,0,0.35)]
    px-6 sm:px-10 md:px-14
    py-10 md:py-14
    relative
    overflow-hidden
  "
            >
                {/* Soft radial highlight */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[420px] h-[140px] bg-white/10 blur-[120px] rounded-full pointer-events-none" />

                {/* Bottom fade */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">

                    {/* Title */}
                    <div className="text-center px-2">

                        <h1
                            className="
          text-2xl sm:text-3xl md:text-4xl
          font-bold
          text-white
          tracking-tight
          leading-tight
        "
                        >
                            {themeInfo?.title}
                        </h1>

                        {/* Context row (responsive) */}
                        <div
                            className="
          mt-3
          flex flex-wrap justify-center gap-x-4 gap-y-1
          text-xs sm:text-sm
          text-white/70
        "
                        >
                            <span>Historical Theme</span>
                            <span className="opacity-40 hidden sm:inline">•</span>
                            <span>Curated Archive</span>
                            <span className="opacity-40 hidden sm:inline">•</span>
                            <span>Nara Heritage</span>
                        </div>

                        {/* Divider */}
                        <div className="mt-5 mb-6 h-px w-full max-w-3xl mx-auto bg-white/30" />
                    </div>

                    {/* Subthemes */}
                    <div
                        className="
        flex flex-wrap justify-center
        gap-2 sm:gap-3
        px-2
      "
                    >
                        {subthemes.map((s) => (
                            <span
                                key={s._id}
                                className="
            px-3 sm:px-4
            py-1.5
            rounded-full
            text-xs sm:text-sm
            font-medium
            text-white/90
            bg-white/15
            border border-white/20
            backdrop-blur-sm
            hover:bg-white/25
            transition-all
            cursor-pointer
            whitespace-nowrap
          "
                            >
                                {s.title}
                            </span>
                        ))}
                    </div>

                </div>
            </section>

            {view === "subthemes" && (
                <section className="space-y-10 pt-8">

                    {/* Header */}
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-white/10">
                        <Layers className="w-5 h-5 text-teal-500" />
                        <h2 className="text-lg font-bold tracking-wider uppercase text-slate-900 dark:text-white">
                            関連テーマ
                        </h2>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {subthemes.map((s) => {
                            const themeTitle = s.theme?.[0]?.title || s.theme?.[0]?.name;

                            return (
                                <div
                                    key={s._id}
                                    className="
              group relative
              h-[150px]
              rounded-xl overflow-hidden
            "
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
                                        <div className="
                absolute top-3 left-3
                px-2.5 py-1
                rounded-full
                text-[10px] font-semibold
                bg-black/55 backdrop-blur-md
                text-teal-300
                border border-white/10
              ">
                                            {themeTitle}
                                        </div>
                                    )}

                                    {/* Bottom content */}
                                    <div className="
              absolute inset-x-0 bottom-0
              px-4 py-3
              flex items-center justify-between
            ">
                                        {/* Title */}
                                        <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2">
                                            {s.title || s.name}
                                        </h3>

                                        {/* ✅ Explore button ONLY */}
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation(); // 🔥 important
                                                setActiveSubtheme(s);
                                                setMonuments([]);
                                                setMonumentsLoading(true);
                                                setView("monuments");

                                                try {
                                                    show();
                                                    const data = await apiFetchByLink("monuments", { subtheme: s._id });
                                                    setMonuments(data || []);
                                                } catch (err) {
                                                    console.error(err);
                                                    setMonuments([]);
                                                } finally {
                                                    setMonumentsLoading(false);
                                                    hide();
                                                }
                                            }}
                                            className="
                  flex items-center gap-1
                  text-xs font-semibold
                  text-teal-300
                  opacity-90
                  hover:opacity-100
                  transition
                  cursor-pointer
                "
                                        >
                                            <span>Explore</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}


            {view === "monuments" && (
                <section className="space-y-14 pt-8">

                    {/* Header */}
                    <div
                        className="
        flex items-center justify-between
        pb-4
        border-b border-slate-200 dark:border-white/10
      "
                    >
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-teal-500" />
                            <h2 className="text-lg font-bold tracking-wider uppercase text-slate-900 dark:text-white">
                                関連スポット
                            </h2>
                        </div>

                        {/* Back */}
                        <button
                            onClick={() => {
                                setView("subthemes");
                                setMonuments([]);
                                setActiveSubtheme(null);
                            }}
                            className="
          inline-flex items-center gap-1.5
          text-xs font-semibold
          text-teal-600 dark:text-teal-400
          hover:text-teal-500
          transition-colors
        "
                        >
                            ← 戻る
                        </button>
                    </div>

                    {/* Empty */}
                    {monuments.length === 0 && !monumentsLoading && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            No monuments found.
                        </p>
                    )}

                    {/* Editorial list */}
                    <div className="space-y-16">
                        {monuments.map((m) => (
                            <div
                                key={m._id}
                                className="
            group
            grid grid-cols-1 md:grid-cols-12
            gap-8 md:gap-12
            items-start
          "
                            >
                                {/* Image */}
                                <div className="md:col-span-4 lg:col-span-3">
                                    <div
                                        className="
                relative aspect-[4/3]
                rounded-2xl overflow-hidden
                border border-slate-200 dark:border-white/10
                bg-slate-100 dark:bg-[#0c0e11]
              "
                                    >
                                        {m.image?.secure_url && (
                                            <img
                                                src={m.image.secure_url}
                                                alt={m.title}
                                                className="
                    h-full w-full object-cover
                    transition-transform duration-700
                    group-hover:scale-105
                  "
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="md:col-span-8 lg:col-span-9 space-y-5">

                                    {/* Title + divider */}
                                    <div className="flex items-center gap-4">
                                        <h3
                                            className="
                  text-xl md:text-2xl font-bold
                  text-slate-900 dark:text-white
                  group-hover:text-teal-500
                  transition-colors
                "
                                        >
                                            {m.title}
                                        </h3>

                                        <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                                    </div>

                                    {/* Description */}
                                    {m.content?.brief && (
                                        <div
                                            className="
                  prose prose-slate
                  dark:prose-invert
                  max-w-4xl
                  text-slate-700 dark:text-slate-400
                  prose-p:leading-relaxed
                "
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    typeof m.content.brief === "string"
                                                        ? m.content.brief
                                                        : "",
                                            }}
                                        />
                                    )}

                                    {/* Stars */}
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: 4 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`
                    w-4 h-4
                    ${i < (m.popularity || 0)
                                                        ? "fill-amber-400 text-amber-400"
                                                        : "text-slate-300 dark:text-slate-600"
                                                    }
                  `}
                                            />
                                        ))}
                                    </div>

                                    {/* CTA */}
                                    <button
                                        onClick={async () => {
                                            try {
                                                setModalLoading(true);
                                                show();
                                                const data = await apiFetchMonumentDetails(m._id);
                                                setSelectedMonument(data);
                                                setModalOpen(true);
                                            } catch (e) {
                                                console.error(e);
                                            } finally {
                                                setModalLoading(false);
                                                hide();
                                            }
                                        }}
                                        className="
                inline-flex items-center gap-2
                text-[10px] font-black
                uppercase tracking-[0.25em]
                text-teal-600 dark:text-teal-400
                hover:text-teal-500
                transition-colors cursor-pointer
              "
                                    >
                                        Discover Details
                                        <ArrowRight className="w-3 h-3" />
                                    </button>

                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {selectedMonument && (
                <MonumentDetailModal open={modalOpen} onClose={() => { setModalOpen(false); setSelectedMonument(null); }} loading={modalLoading} details={selectedMonument} onOpenAnother={async (id: string) => {
                    try {
                        setModalLoading(true);
                        show();
                        const data = await apiFetchMonumentDetails(id);
                        setSelectedMonument(data);
                    } catch (e) {
                        console.error(e);
                    } finally {
                        setModalLoading(false);
                        hide();
                    }
                }} />
            )}
        </main>
    );
}
