"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

import { ImageIcon, ChevronRight, Search, MapPinned, ArrowRight, Star, Compass, Play, Pause } from "lucide-react";

import { useAppSelector, useAppDispatch } from "@/lib/store/hook";
import {
  fetchShortcuts,
  selectShortcuts,
  selectGlobalLoading,
  setActiveTheme,
} from "@/lib/store/slices/globalSlice";

import { useLocale } from "@/providers/LocaleProvider";
import { useGlobalLoader } from "@/providers/LoaderProvider";
import { Button } from "@/components/ui/button";
import { apiFetchToursVersionTwo } from "@/services/userTourService";
import type { Tour } from "@/lib/types/userTour.types";
import { normalizeHTML } from "@/lib/utils";

/* =======================================================================
   MAIN PAGE - HERO CAROUSEL & COMPACT LAYOUT
======================================================================= */
export default function ToursDashboardPage() {
  const { t } = useLocale();
  const dispatch = useAppDispatch();
  const { show, hide } = useGlobalLoader();

  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

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

  /* -------------------- Render -------------------- */
  return (
    <div className="flex flex-col w-full min-h-screen">

      {/* ================= HERO CAROUSEL ================= */}
      {/* ================= HERO CAROUSEL ================= */}
      <TextHeroSlider />

      {/* ================= PRIMARY SHORTCUTS (Dock Style) ================= */}
      {!globalLoading && sectionOne.length > 0 && (
        <section className="w-full px-4 mb-12 relative z-20">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-wrap justify-center gap-6">
              <ShortcutRow items={sectionOne} variant="primary" />
            </div>
          </div>
        </section>
      )}

      {/* ================= CONTENT CONTAINER ================= */}
      <div className=" mx-auto w-full px-4 md:px-8 space-y-12">

        {/* ================= SERVICE INFO (Unique Title) ================= */}
        {!globalLoading && sectionTwo.length > 0 && (
          <section className="py-2">
            <div className="flex items-center gap-3 mb-5 px-1 border-b border-dashed border-teal-500/30 pb-2">
              <Compass className="h-5 w-5 text-teal-500" />
              <h2 className="text-xl font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                EXPLORE CATEGORIES
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <ShortcutRow items={sectionTwo} variant="secondary" />
            </div>
          </section>
        )}

        {/* ================= FEATURED TOURS ================= */}
        {!loading && hasTours && (
          <section>
            <div className="flex items-center justify-between mb-6 px-1 border-b border-dashed border-teal-500/30 pb-2">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-teal-500 flex items-center justify-center">
                  <Star className="h-3 w-3 text-white fill-current" />
                </div>
                <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  {t("tour_guide")}
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
              <Button className="rounded-full w-full bg-teal-600/10 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400 border border-teal-200 dark:border-teal-800" asChild>
                <Link href="/tours">
                  {t("actions.show_more")}
                </Link>
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
   HERO CAROUSEL COMPONENT
======================================================================= */
/* =======================================================================
   HERO TEXT SLIDER COMPONENT (No Images, Typography Focused)
======================================================================= */
const HERO_SLIDES = [
  {
    title: "GOSE CITY",
    subtitle: "Experience the Ancient Heart of Japan",
    description: "Walk the paths of emperors and discover the birthplace of Japanese culture."
  },
  {
    title: "SACRED PEAKS",
    subtitle: "Mt. Kongo & Mt. Katsuragi",
    description: "Breathtaking views and spiritual trails that connect heaven and earth."
  },
  {
    title: "HIDDEN GEMS",
    subtitle: "Temples, Shrines & Old Streets",
    description: "Explore the untouched beauty of historic Gose, away from the crowds."
  },
  {
    title: "LOCAL FLAVORS",
    subtitle: "Traditional Medicine & Cuisine",
    description: "Savor the rich heritage of medicinal herbs and authentic local gastronomy."
  }
];

function TextHeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[current];

  return (
    <section className="relative w-full h-[300px] md:h-[350px] flex flex-col items-center justify-center text-center overflow-hidden z-0">
      <div className="relative z-10 max-w-4xl px-4 space-y-6">

        {/* Animated Text Content */}
        <div className="space-y-4">
          <h1 key={current} className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white drop-shadow-sm animate-slideUp backdrop-blur-0">
            {slide.title}
          </h1>

          <div key={`${current}-sub`} className="space-y-3 animate-slideUp" style={{ animationDelay: "150ms" }}>
            <p className="text-lg md:text-xl font-light text-teal-600 dark:text-teal-400 tracking-wide uppercase">
              {slide.subtitle}
            </p>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-200 max-w-xl mx-auto leading-relaxed font-medium">
              {slide.description}
            </p>
          </div>
        </div>

        {/* Navigation Dots (Custom) - Integrated & Styled */}
        <div className="mt-8 md:mt-10 flex items-center justify-center gap-3 px-6 py-2.5 rounded-full animate-slideUp" style={{ animationDelay: "400ms" }}>
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`
                 rounded-full transition-all duration-500 ease-out
                 ${idx === current ? "w-8 h-1.5 bg-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.6)]" : "w-1.5 h-1.5 bg-slate-600 dark:bg-slate-700 hover:bg-slate-500"}
               `}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
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
      <div className="relative h-[65%] w-full overflow-hidden">
        {tour.image?.secure_url ? (
          <img
            src={tour.image.secure_url}
            alt={tour.title}
            className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
            <ImageIcon className="h-12 w-12 text-slate-300" />
          </div>
        )}

        <div className="absolute top-5 left-5 z-20">
          <div className="px-4 py-1.5 rounded-full bg-white/95 dark:bg-black/80 backdrop-blur-md text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5 shadow-sm border border-teal-100 dark:border-teal-900/50">
            <Star className="w-3.5 h-3.5 fill-teal-500 text-teal-500" />
            <span className="tracking-wide">FEATURED</span>
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
            Explore Link
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
                 flex-col sm:flex-row justify-center sm:justify-start items-center gap-4 px-6 py-5
                 w-40 sm:w-64 h-auto min-h-[90px]
                 rounded-2xl
                 shadow-lg shadow-slate-200/50 dark:shadow-black/20 hover:shadow-teal-500/10 dark:hover:shadow-teal-900/10
                 bg-white dark:bg-[#0f1115] border-slate-200 dark:border-white/5
              `}
            >
              {/* Icon Container - Matching Category Style but Larger */}
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-500/20 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                {item.icon?.secure_url ? (
                  <div className="w-6 h-6 text-current">
                    <img src={item.icon.secure_url} alt={item.title} className="w-full h-full object-contain" style={{ filter: "brightness(0) saturate(100%) invert(81%) sepia(31%) saturate(545%) hue-rotate(124deg) brightness(98%) contrast(92%)" }} />
                  </div>
                ) : (
                  <MapPinned className="w-6 h-6" />
                )}
              </div>

              {/* Text Content */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-white text-base leading-tight">
                  {item.title}
                </span>
                <span className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-teal-500/60 uppercase group-hover:text-teal-500 dark:group-hover:text-teal-400 mt-1 transition-colors">
                  Open
                </span>
              </div>
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
            <div className="ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-teal-500 dark:text-teal-400">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        );
      })}
    </>
  );
}
