"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  BookOpen,
  MapPin,
  ChevronRight,
  Maximize2,
  ArrowRight,
  ScanEye,
  Star,
  Route,
  Layers,
  ImageIcon,
  ArrowUpDown,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  apiFetchAboutById,
  apiFetchByLink,
  apiFetchSubthemesWithQuery,
} from "@/services/userGlobalservice";
import {
  apiFetchMonumentDetails,
  apiFetchMonumentSorts,
} from "@/services/userTourService";
import { selectActiveAboutId } from "@/lib/store/slices/globalSlice";
import { normalizeHTML } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { parseApiLink } from "@/lib/utils";

import type { Monument, MonumentSort } from "@/lib/types/userTour.types";
import { SubthemeItem } from "@/lib/types/userGlobal.types";
import { useGlobalLoader } from "@/providers/LoaderProvider";
import MonumentDetailModal from "@/components/tour/MonumentDetailModal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useLocale } from "@/providers/LocaleProvider";
import Breadcrumb from "@/components/ui/Breadcrumb";

type About = any;

export default function AboutDetailPage() {
  const router = useRouter();
  const activeAboutId = useSelector(selectActiveAboutId);
  const { t } = useLocale();

  const [about, setAbout] = useState<About | null>(null);
  const [monuments, setMonuments] = useState<Monument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImage, setShowImage] = useState(false);
  const { show, hide } = useGlobalLoader();

  const [resourceType, setResourceType] = useState<
    "monuments" | "subthemes" | null
  >(null);

  const [view, setView] = useState<"subthemes" | "monuments">("subthemes");
  const [activeSubtheme, setActiveSubtheme] = useState<SubthemeItem | null>(
    null,
  );

  const [subthemes, setSubthemes] = useState<SubthemeItem[]>([]);

  // Monument detail modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedMonument, setSelectedMonument] = useState<any | null>(null);
  const [selectedSort, setSelectedSort] = useState<string | null>(null);
  const [sortOptions, setSortOptions] = useState<MonumentSort[]>([]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (!activeAboutId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchAbout = async () => {
      try {
        setLoading(true);
        show();

        const data = await apiFetchAboutById(activeAboutId);
        if (!cancelled) setAbout(data);
      } catch (err) {
        if (!cancelled) setAbout(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
          hide();
        }
      }
    };

    fetchAbout();

    return () => {
      cancelled = true;
    };
  }, [activeAboutId]);

  const parsedLink = useMemo(() => {
    if (!about?.link) return null;
    try {
      return parseApiLink(about.link);
    } catch (err) {
      console.error("Failed to parse link", err);
      return null;
    }
  }, [about?.link]);

  useEffect(() => {
    if (!parsedLink) return;

    const { resource, filter } = parsedLink;

    setResourceType(resource as any);

    let cancelled = false;

    const fetchData = async () => {
      try {
        show();

        if (resource === "monuments") {
          const data = await apiFetchByLink<Monument>(
            "monuments",
            filter,
            "-popularity",
          );
          if (!cancelled) {
            setMonuments(data);
            setSubthemes([]);
          }
        } else if (resource === "subthemes") {
          const data = await apiFetchSubthemesWithQuery({ filter });
          if (!cancelled) {
            setSubthemes(data);
            setMonuments([]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) hide();
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [parsedLink, show, hide]);

  const fetchSubthemes = useCallback(async () => {
    try {
      show();

      setView("subthemes");
      setResourceType("subthemes");
      setMonuments([]);
      setActiveSubtheme(null);

      const filter = parsedLink?.filter || {};

      const data = await apiFetchSubthemesWithQuery({
        filter,
        sort: "sortOrder",
      });

      setSubthemes(data);
    } catch (err) {
      console.error("Failed to fetch subthemes", err);
    } finally {
      hide();
    }
  }, [parsedLink, show, hide]);

  const handleExploreSubtheme = useCallback(
    async (subthemeId: string) => {
      try {
        show();

        const subtheme = subthemes.find((s) => s._id === subthemeId) || null;
        setResourceType("monuments");
        setActiveSubtheme(subtheme);

        const filter = { subtheme: subthemeId };

        const data = await apiFetchByLink<Monument>(
          "monuments",
          filter,
          "-popularity",
        );

        setMonuments(data);
        setView("monuments");
      } catch (err) {
        console.error(err);
      } finally {
        hide();
      }
    },
    [subthemes, show, hide],
  );

  const handleOpenMonument = useCallback(
    async (id: string) => {
      try {
        setModalLoading(true);
        show();

        const data = await apiFetchMonumentDetails(id);
        setSelectedMonument(data);
        setModalOpen(true);
      } catch (err) {
        console.error("Failed to load monument details:", err);
      } finally {
        setModalLoading(false);
        hide();
      }
    },
    [show, hide],
  );

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedMonument(null);
  }, []);

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
    if (resourceType !== "monuments") return;

    // 🔑 determine filter source
    let filter: Record<string, any> | null = null;

    if (activeSubtheme) {
      filter = { subtheme: activeSubtheme._id };
    } else if (parsedLink?.filter) {
      filter = parsedLink.filter;
    }

    if (!filter) return;

    let cancelled = false;

    const fetchMonuments = async () => {
      const backendSort = selectedSort ?? "-popularity";

      try {
        show();

        const data = await apiFetchByLink<Monument>(
          "monuments",
          filter,
          backendSort,
        );

        if (!cancelled) {
          setMonuments(data || []);
        }
      } catch (err) {
        console.error("Failed to fetch monuments on sort change", err);
        if (!cancelled) setMonuments([]);
      } finally {
        if (!cancelled) hide();
      }
    };

    fetchMonuments();

    return () => {
      cancelled = true;
    };
  }, [selectedSort, activeSubtheme, resourceType, parsedLink]);

  return (
    <div className="text-slate-100 min-h-screen">
      {/* ================= HERO BANNER ================= */}
      <section className="relative h-[380px] w-full overflow-hidden flex items-end">
        {about?.image?.secure_url && (
          <img
            src={about?.image?.secure_url}
            alt={about?.title}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-[#050608]/20 to-transparent" />

        {/* Floating Navigation */}
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={() => setShowImage(true)}
            className="
      p-2.5
      rounded-xl
      bg-black/40
      hover:bg-black/60
      backdrop-blur-md
      border border-white/10
      text-white
      transition cursor-pointer
    "
            aria-label="View image fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 pb-12">
          <div className="space-y-4">
            <Badge className="bg-teal-500/20 text-teal-400 border border-teal-500/30 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase">
              Heritage Story
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              {about?.title}
            </h1>
          </div>
        </div>
      </section>

      {showImage && about.image?.secure_url && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center cursor-pointer"
          onClick={() => setShowImage(false)}
        >
          <img
            src={about?.image?.secure_url}
            alt={about?.title}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />

          {/* Close hint */}
          <span className="absolute top-6 right-6 text-xs text-white/60">
            {t("click_anywhere_to_close")}
          </span>
        </div>
      )}

      {/* BREADCRUMB */}
      <div className="mt-2 flex justify-start">
        <Breadcrumb
          items={[
            ...(about ? [{ label: about.title }] : [])
          ]}
        />
      </div>

      {selectedMonument && (
        <MonumentDetailModal
          open={modalOpen}
          onClose={handleCloseModal}
          loading={modalLoading}
          details={selectedMonument}
          onOpenAnother={handleOpenMonument}
        />
      )}

      {/* ================= MAIN CONTENT ================= */}

      {/* STORY CONTENT (Full Display) */}
      {(about?.content?.brief || about?.content?.extended) && (
        <section className="space-y-8 mt-8">
          <div
            className="
  flex items-center gap-3 pb-4
  border-b
  border-slate-200
  dark:border-white/10
"
          >
            <BookOpen className="w-5 h-5 text-teal-500" />
            <h2 className="text-lg font-bold tracking-wider text-slate-900 dark:text-white uppercase">
              {about.title}{t("about")}
            </h2>
          </div>
          <div className="leading-relaxed text-slate-300 text-base md:text-lg">
            <div
              className="
    prose prose-slate
    dark:prose-invert
    max-w-none
    text-slate-800 dark:text-slate-300
    prose-p:leading-relaxed
    prose-p:text-[1.05rem]
    prose-headings:text-slate-900
    dark:prose-headings:text-white
  "
              dangerouslySetInnerHTML={{
                __html: normalizeHTML(
                  about.content?.extended || about.content?.brief,
                ),
              }}
            />
          </div>
        </section>
      )}

      {/* RELATED SPOTS (Editorial List Design) */}
      {resourceType === "monuments" && monuments.length > 0 && !loading && (
        <section className="space-y-12 mt-8">
          <div
            className="
    flex items-center justify-between
    gap-3 pb-4
    border-b
    border-slate-200
    dark:border-white/10
  "
          >
            {/* Left: Title */}
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-teal-500" />
              <h2
                className="text-lg font-bold tracking-wider uppercase
      text-slate-900 dark:text-white
    "
              >
                {t("related_spots")}
              </h2>
            </div>
            <div className="flex justify-end items-end gap-3">
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

            {/* Right: Back */}
            {view === "monuments" && (
              <button
                onClick={fetchSubthemes}
                className="
      inline-flex items-center gap-1.5
      text-xs font-semibold
      text-teal-600 dark:text-teal-400
      hover:text-teal-500
      transition-colors cursor-pointer
    "
              >
                <ArrowLeft className="w-4 h-4" />
                {t("Back")}
              </button>
            )}
          </div>

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
                {/* Image Column */}
                <div className="md:col-span-4 lg:col-span-3">
                  <div
                    className="
      relative aspect-[4/3]
      rounded-2xl overflow-hidden
      border
      border-slate-200 dark:border-white/10
      bg-slate-100 dark:bg-[#0c0e11]
    "
                  >
                    {m.image?.secure_url && (
                      <img
                        src={m.image.secure_url}
                        alt={m.title}
                        className="
            h-full w-full object-cover
            transition-all duration-700
            group-hover:scale-105
          "
                      />
                    )}
                  </div>
                </div>

                {/* Content Column */}
                <div className="md:col-span-8 lg:col-span-9 space-y-5">
                  {/* Title + Divider */}
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

                    <div
                      className="
        h-px flex-1
        bg-slate-200 dark:bg-white/10
      "
                    />
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
                        __html: normalizeHTML(m.content.brief),
                      }}
                    />
                  )}

                  {/* ⭐ Meta Row (Stars + AR) */}
                  <div className="flex flex-wrap items-center gap-4">
                    {/* ⭐ Popularity (always show 4 stars) */}
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

                    {/* AR Enabled */}
                    {m.arenabled && (
                      <span
                        className="
          inline-flex items-center gap-1
          px-2 py-0.5
          rounded-full
          text-[10px] font-semibold
          bg-teal-100 text-teal-700
          dark:bg-teal-500/15 dark:text-teal-300
        "
                      >
                        <ScanEye className="w-3.5 h-3.5" />
                        AR対応
                      </span>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="pt-3">
                    <button
                      onClick={() => handleOpenMonument(m._id)}
                      className="
        inline-flex items-center gap-2
        text-[10px] font-black
        uppercase tracking-[0.25em]
        text-teal-600 dark:text-teal-400
        hover:text-teal-500
        transition-colors cursor-pointer
      "
                    >
                      {t("discover_details")}
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= SUBTHEMES (COMPACT GRID WITH THEME BADGE) ================= */}
      {resourceType === "subthemes" &&
        view === "subthemes" &&
        subthemes.length > 0 &&
        !loading && (
          <section className="space-y-10 mt-8">
            {/* Header */}
            <div
              className="
      flex items-center gap-3 pb-4
      border-b border-slate-200 dark:border-white/10
    "
            >
              <Layers className="w-5 h-5 text-teal-500" />
              <h2
                className="text-lg font-bold tracking-wider uppercase
        text-slate-900 dark:text-white
      "
              >
                {t("related_themes")}
              </h2>
            </div>

            {/* Grid */}
            <div
              className="
      grid grid-cols-1
      sm:grid-cols-2
      lg:grid-cols-3
      gap-5
    "
            >
              {subthemes.map((s) => {
                const themeTitle = s.theme?.[0]?.title || s.theme?.[0]?.name;

                return (
                  <div
                    key={s._id}
                    className="
              group relative
              h-[150px]
              rounded-xl overflow-hidden
              cursor-pointer
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

                    {/* Dark Overlay */}
                    <div
                      className="
              absolute inset-0
              bg-gradient-to-t
              from-black/70 via-black/25 to-transparent
            "
                    />

                    {/* 🏷 Theme Badge */}
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

                    {/* Bottom Content */}
                    <div
                      className="
              absolute inset-x-0 bottom-0
              px-4 py-3
              flex items-center justify-between
            "
                    >
                      {/* Title */}
                      <h3
                        className="
                text-sm font-semibold
                text-white
                leading-tight
                line-clamp-2
              "
                      >
                        {s.title || s.name}
                      </h3>

                      <div
                        onClick={() => handleExploreSubtheme(s._id)}
                        className="
    flex items-center gap-1
    text-xs font-semibold
    text-teal-300
    opacity-90
    group-hover:opacity-100
    transition
  "
                      >
                        <span>{t("explore")}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      {/* ================= RELATED TOURS ================= */}
      {about?.relatedtours?.length > 0 && (
        <section className="space-y-8 mt-8">
          {/* Header */}
          <div
            className="
  flex items-center gap-3 pb-4
  border-b
  border-slate-200
  dark:border-white/10
"
          >
            <Route className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-lg font-bold tracking-wider text-slate-900 dark:text-white uppercase">
              {t("recommended_experiences")}
            </h2>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {about.relatedtours.map((rt: any) => (
              <div
                key={rt._id}
                onClick={() => router.push(`/tours/detail/?id=${rt._id}`)}
                className="
        group
        relative
        cursor-pointer
        rounded-2xl
        bg-white dark:bg-[#15191f] border border-slate-200/80 dark:border-slate-700/60
        backdrop-blur-md
        shadow-sm hover:shadow-lg
        transition-all
        overflow-hidden
      "
              >
                {/* Image */}
                {rt.image?.secure_url && (
                  <div className="h-40 w-full overflow-hidden">
                    <img
                      src={rt.image.secure_url}
                      alt={rt.title}
                      className="
              h-full w-full object-cover
              transition-transform duration-500
              group-hover:scale-[1.05]
            "
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-6 space-y-3">
                  {/* Title */}
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white leading-snug">
                    {rt.title}
                  </h3>

                  {/* Description */}
                  {rt.content?.brief && (
                    <div
                      className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3"
                      dangerouslySetInnerHTML={{
                        __html: normalizeHTML(rt.content.brief),
                      }}
                    />
                  )}

                  {/* CTA */}
                  <div className="pt-2 flex items-center gap-2 text-sm font-medium text-teal-600 dark:text-teal-400">
                    <span>{t("see_details")}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
