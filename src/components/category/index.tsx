"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/lib/store/hook";
import { selectActiveThemeId } from "@/lib/store/slices/globalSlice";
import {
  apiFetchSubthemesWithQuery,
  apiFetchByLink,
  apiFetchThemes,
} from "@/services/userGlobalservice";
import {
  apiFetchMonumentDetails,
  apiFetchMonumentSorts,
} from "@/services/userTourService";
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

export default function CategoryExplorer() {
  const activeThemeId = useAppSelector(selectActiveThemeId);
  const [subthemes, setSubthemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [themeInfo, setThemeInfo] = useState<any | null>(null);
  const { t } = useLocale();

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

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!activeThemeId) {
        setSubthemes([]);
        return;
      }

      try {
        setLoading(true);
        show();

        const data = await apiFetchSubthemesWithQuery({
          filter: { theme: activeThemeId },
        });
        if (mounted) setSubthemes(data);

        // Try to fetch theme metadata (title/image) for hero
        try {
          const themes = await apiFetchThemes();
          const found =
            themes.find((t: any) => t._id === activeThemeId) || null;
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
  }, [activeThemeId, show, hide]);

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
  }, [selectedSort, activeSubtheme, view]);

  return (
    <main className="w-full">
      {/* ================= ENHANCED HERO SECTION ================= */}
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

      {view === "subthemes" && (
        <section className="space-y-10 pt-8">
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-white/10">
            <Layers className="w-5 h-5 text-teal-500" />
            <h2 className="text-lg font-bold tracking-wider uppercase text-slate-900 dark:text-white">
              {t("related_themes")}
            </h2>
          </div>

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
                    e.stopPropagation(); // 🔥 important
                    setActiveSubtheme(s);
                    setMonuments([]);
                    setMonumentsLoading(true);
                    setView("monuments");
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
                      className="
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
                    className="
              absolute inset-x-0 bottom-0
              px-4 py-3
              flex items-center justify-between
            "
                  >
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
              <h2 className="text-lg font-bold tracking-wider uppercase text-slate-900 dark:text-white">
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

                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{t("sort")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {sortOptions.map((so) => (
                    <DropdownMenuItem
                      key={so._id}
                      onClick={() => setSelectedSort(so.link || so.name || "")}
                      className={`cursor-pointer flex items-center gap-2 ${selectedSort === so.link
                        ? "bg-slate-100 dark:bg-neutral-800 font-semibold"
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
              className="
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
            className="
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
                setView("subthemes");
                setMonuments([]);
                setActiveSubtheme(null);
                setSelectedSort("-popularity");
              }}
              className="
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
                    }}
                    disabled={modalLoading}
                    className="
                inline-flex items-center gap-2
                text-[10px] font-black
                uppercase tracking-[0.25em]
                text-teal-600 dark:text-teal-400
                hover:text-teal-500
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors cursor-pointer
              "
                  >
                    {t("discover_details")}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {selectedMonument && (
        <MonumentDetailModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedMonument(null);
          }}
          loading={modalLoading}
          details={selectedMonument}
          onOpenAnother={async (id: string) => {
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
          }}
        />
      )}
    </main>
  );
}
