"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

import { ImageIcon, ChevronLeft, ChevronRight, Search, MapPinned, ArrowRight, Star, Compass, Play, Pause, BookOpen, Layers, Route, ArrowUpRight } from "lucide-react";

import { useAppSelector, useAppDispatch } from "@/lib/store/hook";
import {
  fetchShortcuts,
  selectShortcuts,
  selectGlobalLoading,
  setActiveTheme,
} from "@/lib/store/slices/globalSlice";
import { setActiveAbout } from "@/lib/store/slices/globalSlice";

import { useLocale } from "@/providers/LocaleProvider";
import { useGlobalLoader } from "@/providers/LoaderProvider";
import { Button } from "@/components/ui/button";
import { apiFetchToursVersionTwo } from "@/services/userTourService";
import type { Tour } from "@/lib/types/userTour.types";
import { normalizeHTML, stripHTML } from "@/lib/utils";
import { apiFetchAbouts } from "@/services/userGlobalservice";
import { About } from "@/lib/types/userGlobal.types";

/* =======================================================================
   MAIN PAGE - HERO CAROUSEL & COMPACT LAYOUT
======================================================================= */
export default function ToursDashboardPage() {
  const { t } = useLocale();
  const dispatch = useAppDispatch();
  const { show, hide } = useGlobalLoader();
  const router = useRouter();

  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [abouts, setAbouts] = useState<About[]>([]);

  useEffect(() => {
    let mounted = true;
    const loadAbouts = async () => {
      try {
        show();
        const data = await apiFetchAbouts();
        if (mounted) setAbouts(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) hide();
      }
    };

    loadAbouts();

    return () => {
      mounted = false;
    };
  }, []);

  const shortcuts = useAppSelector(selectShortcuts);
  const globalLoading = useAppSelector(selectGlobalLoading);

  /* -------------------- Data Fetching -------------------- */
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        show();
        const [tourData] = await Promise.all([
          apiFetchToursVersionTwo({ sort: "sortOrder" }),
          dispatch(fetchShortcuts()),
        ]);
        if (mounted) {
          setTours(tourData);
        }
      } catch (err) {
        console.error("Failed to load tours:", err);
      } finally {
        if (mounted) {
          hide();
          setLoading(false);
        }
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, [dispatch, show, hide]);

  const hasTours = (tours?.length ?? 0) > 0;
  // Get featured tours for the carousel, fallback to first 5
  const heroTours = tours.filter(t => t.featured).slice(0, 5);
  const carouselItems = heroTours.length > 0 ? heroTours : tours.slice(0, 5);

  /* -------------------- Priority Logic -------------------- */
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

  const sectionOne = placeByPriority(
    shortcuts.filter((s) => {
      const p = s.priority ?? 0;
      return p >= 0 && p <= 3;
    })
  );

  const sectionTwo = placeByPriority(
    shortcuts.filter((s) => {
      const p = s.priority ?? 0;
      return p >= 4 && p <= 9;
    })
  );

  const aboutScrollRef = useRef<HTMLDivElement>(null);

  const scrollAbout = (dir: "left" | "right") => {
    if (!aboutScrollRef.current) return;
    const offset = dir === "left" ? -280 : 280;
    aboutScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  /* -------------------- Render -------------------- */
  return (
    <div className="flex flex-col w-full min-h-screen">

      {/* ================= HERO CAROUSEL ================= */}
      <TextHeroSlider />

      {/* ================= SECTION DIVIDER ================= */}
      <div className="relative z-10 flex justify-center py-6">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-teal-500/40" />
          <span className="text-xs tracking-widest uppercase">
            {t("home.quick_access")}
          </span>
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-teal-500/40" />
        </div>
      </div>

      {/* ================= PRIMARY SHORTCUTS (Dock Style) ================= */}
      {!globalLoading && sectionOne.length > 0 && (
        <section className="w-full p-4">
          <div
            className="
        flex flex-wrap
        gap-4
        justify-center
        md:flex-nowrap md:justify-center
        md:overflow-visible
      "
          >
            <ShortcutRow items={sectionOne} variant="primary" />
          </div>
        </section>
      )}

      {/* ================= CONTENT CONTAINER ================= */}
      <div className=" mx-auto w-full px-4 md:px-8 space-y-12">

        {/* ================= SERVICE INFO (Unique Title) ================= */}
        {!globalLoading && sectionTwo.length > 0 && (
          <section className="py-2">
            <div className="flex items-center gap-3 mb-5 px-1 border-b border-dashed border-teal-500/30 pb-2">
              <Layers className="h-5 w-5 text-teal-500" />
              <h2 className="text-xl font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                {t("home.explore_categories")}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <ShortcutRow items={sectionTwo} variant="secondary" />
            </div>
          </section>
        )}

        {/* ================= ABOUT NARA HERITAGE ================= */}
        {abouts.length > 0 && (
          <section className="w-full mt-10 mb-12">

            {/* ===== Section Header (UNCHANGED) ===== */}
            <div className="flex items-center gap-3 mb-5 px-1 border-b border-dashed border-teal-500/30 pb-2">
              <BookOpen className="h-5 w-5 text-teal-500" />
              <h2 className="text-xl font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                {t("home.about_nara")}
              </h2>
            </div>

            {/* ===== Cards + Overlay Arrows ===== */}
            <div className="relative">

              {/* LEFT ARROW (desktop only) */}
              <button
                onClick={() => scrollAbout("left")}
                className="
    hidden md:flex
    absolute
    left-[-18px]
    top-[72px]
    z-20

    w-10 h-10
    rounded-2xl

    bg-white/80 dark:bg-[#0f1115]/80
    backdrop-blur

    border border-slate-200 dark:border-white/10
    shadow-lg

    items-center justify-center
    text-slate-600 dark:text-slate-300

    hover:text-teal-500
    hover:border-teal-400/50
    hover:shadow-teal-500/20

    transition-all duration-300 cursor-pointer
  "
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>


              {/* RIGHT ARROW (desktop only) */}
              <button
                onClick={() => scrollAbout("right")}
                className="
    hidden md:flex
    absolute
    right-[-18px]
    top-[72px]
    z-20

    w-10 h-10
    rounded-2xl

    bg-white/80 dark:bg-[#0f1115]/80
    backdrop-blur

    border border-slate-200 dark:border-white/10
    shadow-lg

    items-center justify-center
    text-slate-600 dark:text-slate-300

    hover:text-teal-500
    hover:border-teal-400/50
    hover:shadow-teal-500/20

    transition-all duration-300 cursor-pointer
  "
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* ===== Card Row ===== */}
              <div
                ref={aboutScrollRef}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
              >
                {abouts.map((item) => (
                  <div
                    key={item._id}
                    className="
        relative
        min-w-[260px] max-w-[260px]
        sm:min-w-[280px]
        snap-center
        rounded-2xl overflow-hidden
        bg-white dark:bg-[#0f1115]
        border border-slate-200 dark:border-white/10
        shadow-md hover:shadow-xl
        transition-all duration-300
        cursor-pointer
      "
                  >

                    {/* ===== Action Icon (Go to About) ===== */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // prevent card click conflicts
                        dispatch(setActiveAbout(item._id));
                        router.push("/about");
                      }}
                      className="
    absolute
    top-3 right-3
    z-10

    w-9 h-9
    rounded-xl

    bg-white/90 dark:bg-black/70
    backdrop-blur

    border border-slate-200 dark:border-white/10
    shadow-md

    flex items-center justify-center

    text-slate-600 dark:text-slate-300
    hover:text-teal-500
    hover:border-teal-400/50
    hover:shadow-[0_0_12px_rgba(20,184,166,0.35)]

    transition-all duration-300 cursor-pointer
  "
                      aria-label="Open About"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>

                    {/* ===== Image ===== */}
                    <div className="relative h-[150px] w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                      {item.image?.secure_url && (
                        <img
                          src={item.image.secure_url}
                          alt={item.title ?? "About Nara"}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>

                    {/* ===== Content ===== */}
                    <div className="p-4 space-y-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                        {item.title ?? ""}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                        {stripHTML(item.content?.brief)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>
        )}

        {/* ================= FEATURED TOURS ================= */}
        {!loading && hasTours && (
          <section>
            <div className="flex items-center justify-between mb-6 px-1 border-b border-dashed border-teal-500/30 pb-2">
              <div className="flex items-center gap-3">
                <Route className="h-5 w-5 text-teal-500" />
                <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  {t("home.guide_tour")}
                </h2>
              </div>
              <Button variant="ghost" size="sm" className="hidden md:flex gap-1 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30" asChild>
                <Link href="/tours">
                  {t("actions.show_more")} <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tours
                .filter((tour) => tour.featured === true)
                .slice(0, 6)
                .map((tour, idx) => (
                  <TourCard key={tour._id} tour={tour} t={t} idx={idx} />
                ))}
            </div>

            {/* Mobile Show More */}
            <div className="mt-8 md:hidden flex justify-center">
              <Button
                className="rounded-full w-auto px-6 bg-teal-600/10 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400 border border-teal-200 dark:border-teal-800"
                asChild
              >
                <Link href="/tours">{t("actions.show_more")}</Link>
              </Button>
            </div>

            {!loading && !hasTours && (
              <div className="py-12 text-center border rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-muted-foreground text-sm">{t("no_tours_available")}</p>
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
}

/* =======================================================================
   HERO TEXT SLIDER COMPONENT (No Images, Typography Focused)
======================================================================= */
function TextHeroSlider() {
  const { t } = useLocale();
  const [current, setCurrent] = useState(0);

  const HERO_SLIDES = [
    {
      title: t("home.hero.slides.0.title"),
      subtitle: t("home.hero.slides.0.subtitle"),
      description: t("home.hero.slides.0.description"),
    },
    {
      title: t("home.hero.slides.1.title"),
      subtitle: t("home.hero.slides.1.subtitle"),
      description: t("home.hero.slides.1.description"),
    },
    {
      title: t("home.hero.slides.2.title"),
      subtitle: t("home.hero.slides.2.subtitle"),
      description: t("home.hero.slides.2.description"),
    },
    {
      title: t("home.hero.slides.3.title"),
      subtitle: t("home.hero.slides.3.subtitle"),
      description: t("home.hero.slides.3.description"),
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[current];

  return (
    <section
      className="
        relative w-full overflow-hidden
        min-h-[220px]
        sm:min-h-[300px]
        md:min-h-[380px]
        lg:min-h-[420px]
        flex items-center
      "
    >
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 w-full h-28 bg-gradient-to-b from-transparent to-white dark:to-black pointer-events-none" />

      {/* ================= TEXT ================= */}
      <div className="relative z-10 w-full px-6 md:px-12">

        {/* ⬆ Intentional upward positioning */}
        <div
          key={current}
          className="
    max-w-4xl
    mx-auto
    space-y-5
    animate-focus-rise
    text-center
    -translate-y-6 sm:-translate-y-10 md:-translate-y-14
  "
        >
          {/* Accent line – centered */}
          <div className="flex justify-center">
            <span className="h-[2px] w-10 bg-teal-500 rounded-full" />
          </div>

          {/* Title */}
          <h1
            className="
      font-extrabold
      tracking-tight
      leading-[1.05]
      text-slate-900 dark:text-white
      text-[clamp(2rem,6vw,3.8rem)]
      md:text-[clamp(3rem,5vw,5rem)]
    "
          >
            {slide.title}
          </h1>

          {/* Subtitle */}
          <p
            className="
      uppercase tracking-[0.3em]
      text-[11px]
      font-semibold
      text-teal-600 dark:text-teal-400
    "
          >
            {slide.subtitle}
          </p>

          {/* Description */}
          <p
            className="
      max-w-md
      mx-auto
      text-sm md:text-base
      leading-relaxed
      text-slate-600 dark:text-slate-300
    "
          >
            {slide.description}
          </p>
        </div>
      </div>

      {/* ================= DOTS ================= */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`
              transition-all duration-500
              ${idx === current
                ? "w-7 h-1.5 bg-teal-500"
                : "w-1.5 h-1.5 bg-slate-400"
              }
              rounded-full
            `}
          />
        ))}
      </div>
    </section>
  );
}

/* =======================================================================
   SUB-COMPONENTS (ShortcutRow, TourCard)
======================================================================= */

function TourCard({ tour, t, idx }: { tour: Tour; t: any; idx: number }) {
  return (
    <div
      className="group relative flex flex-col h-[480px] rounded-[32px] overflow-hidden bg-white dark:bg-[#15191f] border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_20px_40px_rgba(0,184,166,0.15)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-2 cursor-pointer isolate"
      style={{ transitionDelay: `${idx * 50}ms` }}
      onClick={() => (window.location.href = `/tours/detail?id=${tour._id}`)}
    >
      <div className="relative h-[180px] w-full overflow-hidden flex-shrink-0">
        {tour.image?.secure_url ? (
          <img
            src={tour.image.secure_url}
            alt={tour.title}
            className="block h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
            <ImageIcon className="h-12 w-12 text-slate-300" />
          </div>
        )}

        <div className="absolute top-5 left-5 z-20">
          <div className="px-4 py-1.5 rounded-full bg-white/95 dark:bg-black/80 backdrop-blur-md text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5 shadow-sm border border-teal-100 dark:border-teal-900/50">
            <Star className="w-3.5 h-3.5 fill-teal-500 text-teal-500" />
            <span className="tracking-wide uppercase">{t("actions.featured")}</span>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#15191f] via-transparent to-transparent opacity-0 dark:opacity-60 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-0 group-hover:opacity-10 dark:group-hover:opacity-0 transition-opacity duration-500" />
      </div>

      <div className="relative flex-1 p-8 flex flex-col justify-between bg-white dark:bg-[#15191f]">
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300">
            {tour.title}
          </h3>
          {tour.content?.brief && (
            <p
              className="text-sm font-light text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: normalizeHTML(tour.content.brief),
              }}
            />
          )}
        </div>

        <div className="flex items-center justify-between pt-6 mt-auto">
          <span className="text-xs font-bold text-teal-600/70 dark:text-teal-400/70 uppercase tracking-widest group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            {t("home.explore_link")}
          </span>
          <div className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#1a2029] flex items-center justify-center group-hover:bg-teal-500 group-hover:border-teal-500 group-hover:text-white transition-all duration-300 shadow-sm">
            <ArrowRight className="w-5 h-5 -ml-0.5" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ShortcutRow({ items, variant }: { items: any[]; variant: "primary" | "secondary" }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useLocale();

  const handleShortcutClick = (shortcut: any) => {
    try {
      if (shortcut.link && shortcut.link.trim().startsWith("{")) {
        const parsedLink = JSON.parse(shortcut.link);
        if (parsedLink.theme) {
          dispatch(setActiveTheme(parsedLink.theme));
        }
      }
      const priority = shortcut.priority ?? null;

      const routes: Record<number, string> = {
        2: "/shortcuts/tourist-attractions",
        3: "/shortcuts/about",
        4: "/shortcuts/events",
        5: "/shortcuts/gourmet-products",
        6: "/shortcuts/facility",
        7: "/shortcuts/mt-kongo-and-katsuragi",
        8: "/shortcuts/city-promotion",
        9: "/shortcuts/meetings",
      };

      if (priority === null) router.push("/shortcuts/tourist-map");
      else if (routes[priority]) router.push(routes[priority]);
      else router.push("/shortcuts/others");

    } catch (err) {
      console.error("❌ Link Error:", err);
    }
  };

  return (
    <>
      {items.map((item) => {
        const isPrimary = variant === "primary";

        // =========================================================
        // PRIMARY & SECONDARY SHARED DESIGN LANGUAGE
        // "Nara Glass" - Unified Premium Look
        // =========================================================
        const baseCardStyles = `
           group relative cursor-pointer
           bg-white dark:bg-[#0f1115] 
           border border-slate-200 dark:border-white/10
           hover:border-teal-500 dark:hover:border-teal-400
           transition-all duration-300 ease-out
           hover:-translate-y-1 
           hover:shadow-[0_10px_40px_-5px_rgba(20,184,166,0.15)]
           active:scale-95
           flex items-center
        `;

        if (isPrimary) {
          return (
            <div
              key={item._id}
              onClick={() => handleShortcutClick(item)}
              className={`
    ${baseCardStyles}
    flex flex-col items-center justify-center
    min-w-[140px] max-w-[140px]
    h-[110px]
    snap-center
    rounded-2xl
    shadow-md
    bg-white dark:bg-[#0f1115]
  `}
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-500/20 mb-2">
                {item.icon?.secure_url ? (
                  <img
                    src={item.icon.secure_url}
                    alt={item.title}
                    className="w-6 h-6 object-contain"
                    style={{
                      filter:
                        "brightness(0) saturate(100%) invert(81%) sepia(31%) saturate(545%) hue-rotate(124deg) brightness(98%) contrast(92%)",
                    }}
                  />
                ) : (
                  <MapPinned className="w-6 h-6" />
                )}
              </div>

              {/* Text */}
              <span className="text-sm font-bold text-center text-slate-800 dark:text-slate-200 leading-tight">
                {item.title}
              </span>
            </div>
          )
        }

        // Secondary Design (Categories) - Compact Version of the SAME style
        return (
          <div
            key={item._id}
            onClick={() => handleShortcutClick(item)}
            className={`
               ${baseCardStyles}
               flex-row gap-4 px-4 py-3.5
               w-full h-auto min-h-[72px]
               rounded-2xl
               shadow-sm hover:shadow-lg hover:shadow-teal-500/10 dark:hover:shadow-teal-900/20
               bg-white dark:bg-[#0f1115] border-slate-200 dark:border-white/5
            `}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-500/20 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
              {item.icon?.secure_url ? (
                <div className="w-5 h-5 text-current">
                  <img src={item.icon.secure_url} alt={item.title} className="w-full h-full object-contain" style={{ filter: "brightness(0) saturate(100%) invert(81%) sepia(31%) saturate(545%) hue-rotate(124deg) brightness(98%) contrast(92%)" }} />
                </div>
              ) : (
                <Search className="w-5 h-5" />
              )}
            </div>

            <span className="text-sm font-bold text-left text-slate-700 dark:text-slate-200 group-hover:text-teal-700 dark:group-hover:text-white leading-tight">
              {item.title}
            </span>

            {/* Arrow Hint */}
            <div className="ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-teal-500 dark:text-teal-400 cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        );
      })}
    </>
  );
}
