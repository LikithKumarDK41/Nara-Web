"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Search,
  MapPinned,
  Layers,
  ArrowUpRight,
} from "lucide-react";

import { useAppSelector, useAppDispatch } from "@/lib/store/hook";
import {
  fetchShortcuts,
  setActiveTheme,
  setActiveAbout,
} from "@/lib/store/slices/globalSlice";

import { useLocale } from "@/providers/LocaleProvider";
import { useGlobalLoader } from "@/providers/LoaderProvider";
import { apiFetchToursVersionTwo } from "@/services/userTourService";
import type { Tour } from "@/lib/types/userTour.types";
import { stripHTML } from "@/lib/utils";
import { apiFetchAbouts } from "@/services/userGlobalservice";
import { About } from "@/lib/types/userGlobal.types";
import SearchModal from "@/components/shortcuts-modal/searchModal";
import StreetViewModal from "@/components/shortcuts-modal/streetViewModal";
import RegionMapModal from "@/components/shortcuts-modal/regionMapModal";

import HomeTabs from "@/components/home/HomeTabs";
import HeroCarousel from "@/components/home/HeroCarousel";
import TourCard from "@/components/tour/TourCard";

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [streetViewOpen, setStreetViewOpen] = useState(false);
  const [regionMapOpen, setRegionMapOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const toursScrollRef = useRef<HTMLDivElement>(null);

  const { shortcuts, loading: globalLoading } = useAppSelector((state) => state.global);

  const scrollTours = (direction: "left" | "right") => {
    if (toursScrollRef.current) {
      const amount = direction === "left" ? -400 : 400;
      toursScrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  const scrollMosaic = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -450 : 450;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

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
  }, [show, hide]);



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

  useEffect(() => {
    const shouldOpen = sessionStorage.getItem("returnToRegionModal");

    if (shouldOpen === "true") {
      setRegionMapOpen(true);
      sessionStorage.removeItem("returnToRegionModal"); // important
    }
  }, []);

  useEffect(() => {
    const el = toursScrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const totalScroll = scrollWidth - clientWidth;
      const progress = totalScroll > 0 ? (scrollLeft / totalScroll) * 100 : 0;
      setScrollProgress(progress);
    };

    handleScroll(); // Initial check
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [tours]);

  const hasTours = (tours?.length ?? 0) > 0;

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
    shortcuts.filter((s: any) => {
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
      <HeroCarousel />

      {/* ================= TAB NAVIGATION ================= */}
      {/* <HomeTabs /> Removed per user request */}

      {/* ================= DISCOVERY SECTION HEADER ================= */}
      {abouts.length > 0 && (
        <section className="w-full bg-transparent py-10 px-6 flex flex-col items-center justify-center text-center overflow-hidden relative transition-colors duration-500">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="z-10"
          >
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="w-12 h-px bg-teal-500/30 dark:bg-teal-400/20" />
              <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.5em]">
                {t("home.heritage")}
              </span>
              <div className="w-12 h-px bg-teal-500/30 dark:bg-teal-400/20" />
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif italic text-slate-900 dark:text-white tracking-tighter leading-none mb-1">
              {t("home.about_nara") || "Discovery Nara"}
            </h2>
            <p className="text-[11px] md:text-sm font-light text-slate-600 dark:text-white/40 tracking-[0.25em] uppercase mt-4">
              {t("home.legacy_layers")}
            </p>
          </motion.div>

          {/* Subtle background texture/glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-full bg-slate-400/[0.05] dark:bg-white/[0.02] blur-[100px] pointer-events-none" />
        </section>
      )}

      {/* ================= ABOUT NARA HERITAGE (Interactive Snap-Scroll Panorama) ================= */}
      {abouts.length > 0 && (
        <section className="w-full relative bg-transparent border-b border-slate-200 dark:border-white/5 scroll-smooth group/mosaic transition-colors duration-500">
          {/* Navigation Arrows */}
          <div className="hidden md:flex absolute inset-y-0 left-0 z-50 flex items-center px-4 md:px-8 pointer-events-none">
            <button
              onClick={() => scrollMosaic("left")}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-500 transition-all duration-300 active:scale-95 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xl pointer-events-auto"
              aria-label="Scroll Left"
            >
              <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" />
            </button>
          </div>

          <div className="hidden md:flex absolute inset-y-0 right-0 z-50 flex items-center px-4 md:px-8 pointer-events-none">
            <button
              onClick={() => scrollMosaic("right")}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 md:w-14 md:h-14 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-500 transition-all duration-300 active:scale-95 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xl pointer-events-auto"
              aria-label="Scroll Right"
            >
              <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex flex-col md:flex-row w-full md:h-[400px] overflow-x-auto scrollbar-hide snap-x snap-mandatory px-0 md:px-[10%]"
          >
            {abouts.map((item, idx) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: idx * 0.1 }}
                onClick={() => {
                  dispatch(setActiveAbout(item._id));
                  router.push("/about");
                }}
                className="
                  relative flex-shrink-0 md:flex-1 group overflow-hidden 
                  w-full md:min-w-[400px]
                  snap-center md:snap-start
                  border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 last:border-0
                  transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
                  md:hover:flex-[1.6] min-h-[250px] md:min-h-0 cursor-pointer isolate
                "
              >
                {/* Background Image */}
                {item.image?.secure_url ? (
                  <img
                    src={item.image.secure_url}
                    alt={item.title ?? "About Nara"}
                    className="absolute inset-0 w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-slate-900" />
                )}

                {/* Dark Cinematic Gradient Overlay - ALWAYS DARK for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-700" />
                <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black via-black/50 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="space-y-2">
                    <div className="w-12 h-0.5 bg-teal-500/80 mb-2 transform origin-left group-hover:scale-x-150 transition-transform duration-700" />
                    <h3 className="text-2xl md:text-3xl font-serif italic font-bold text-white leading-tight tracking-tight drop-shadow-md">
                      {item.title ?? ""}
                    </h3>
                  </div>

                  {/* Content Always Visible */}
                  <div className="mt-4">
                    <p className="text-white/80 text-[11px] md:text-xs leading-relaxed mb-4 line-clamp-2 max-w-sm font-light drop-shadow-sm">
                      {stripHTML(item.content?.brief)}
                    </p>
                    <div className="flex items-center gap-3 text-white text-[11px] font-black uppercase tracking-[0.2em] drop-shadow-md">
                      {t("home.explore_foundation")}
                      <div className="w-8 h-px bg-white/50 group-hover:w-12 transition-all duration-500" />
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )
      }

      {/* ================= NAVIGATION HUB HEADER ================= */}
      <section className="w-full bg-transparent pt-6 pb-10 px-6 flex flex-col items-center justify-center text-center overflow-hidden relative transition-colors duration-500">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="z-10"
        >
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="w-8 h-px bg-slate-900/10 dark:bg-white/10" />
            <span className="text-[10px] font-black text-teal-600/80 dark:text-teal-400/60 uppercase tracking-[0.5em]">
              {t("home.portal")}
            </span>
            <div className="w-8 h-px bg-slate-900/10 dark:bg-white/10" />
          </div>
          <h2 className="text-3xl md:text-5xl font-serif italic text-slate-900 dark:text-white tracking-tighter leading-none mb-1">
            {t("home.quick_access") || "Quick Access"}
          </h2>
          <p className="text-[10px] md:text-xs font-light text-slate-600 dark:text-white/30 tracking-[0.2em] uppercase mt-2">
            {t("home.navigate_heritage")}
          </p>
        </motion.div>

        {/* Subtle background texture/glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-full bg-teal-400/[0.04] dark:bg-teal-500/[0.01] blur-[100px] pointer-events-none" />
      </section>

      {/* ================= PRIMARY SHORTCUTS (Dock Style) ================= */}
      {
        !globalLoading && sectionOne.length > 0 && (
          <section className="w-full px-4 pb-8">
            <div
              className="
    grid grid-cols-3 sm:grid-cols-3 gap-x-3 gap-y-6 sm:gap-4
    md:flex md:flex-nowrap md:gap-5
    justify-center items-center
    max-w-4xl mx-auto
  "
            >
              <ShortcutRow
                items={sectionOne}
                variant="primary"
                onOpenSearch={() => setSearchOpen(true)}
                onStreetView={() => setStreetViewOpen(true)}
                onOpenRegionMap={() => setRegionMapOpen(true)}
                t={t}
              />
            </div>
          </section>
        )
      }

      {/* ================= CONTENT CONTAINER ================= */}
      <div className="mx-auto w-full px-4 pb-4 max-w-7xl">

        {/* ================= CATEGORIES HEADER (Matches Quick Access Style) ================= */}
        {!globalLoading && sectionTwo.length > 0 && (
          <section className="w-full bg-transparent pt-2 pb-8 flex flex-col items-center justify-center text-center overflow-hidden relative transition-colors duration-500">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="z-10"
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-8 h-px bg-teal-500/30 dark:bg-teal-400/20" />
                <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.5em]">
                  {t("home.explore")}
                </span>
                <div className="w-8 h-px bg-teal-500/30 dark:bg-teal-400/20" />
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif italic text-slate-900 dark:text-white tracking-tighter leading-none mb-1">
                {t("home.explore_categories") || "Cultural Categories"}
              </h2>
              <p className="text-[11px] md:text-sm font-light text-slate-600 dark:text-white/40 tracking-[0.25em] uppercase mt-4">
                {t("home.diverse_heritage")}
              </p>
            </motion.div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-full bg-teal-400/[0.04] dark:bg-teal-500/[0.01] blur-[100px] pointer-events-none" />
          </section>
        )}

        {/* ================= SERVICE INFO (Modern Grid) ================= */}
        {!globalLoading && sectionTwo.length > 0 && (
          <section className="pb-8">
            <div className="px-2 tracking-tight">
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 md:gap-x-3 md:gap-y-6">
                <ShortcutRow
                  items={sectionTwo}
                  variant="secondary"
                  onOpenSearch={() => setSearchOpen(true)}
                  onStreetView={() => setStreetViewOpen(true)}
                  onOpenRegionMap={() => setRegionMapOpen(true)}
                  t={t}
                />
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ================= FEATURED TOURS (Full Width Carousel) ================= */}
      {
        !loading && hasTours && (
          <section className="w-full pt-0 pb-0 bg-transparent relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 flex flex-col items-center justify-center text-center mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl relative z-10"
              >
                <div className="flex items-center justify-center gap-4 mb-3">
                  <div className="w-12 h-px bg-teal-500/30 dark:bg-teal-400/20" />
                  <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.5em]">
                    {t("home.curated_tours")}
                  </span>
                  <div className="w-12 h-px bg-teal-500/30 dark:bg-teal-400/20" />
                </div>

                <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif italic text-slate-900 dark:text-white tracking-tighter leading-none mb-1">
                  {t("home.guide_tour")}
                </h2>

                <p className="text-[11px] md:text-sm font-light text-slate-600 dark:text-white/40 tracking-[0.25em] uppercase mt-4 mb-8">
                  {t("home.curated_journeys")}
                </p>

                <Link
                  href="/tours"
                  className="
                    group/btn inline-flex items-center gap-4 
                    text-slate-900 dark:text-white 
                    transition-all duration-300
                  "
                >
                  <span className="text-[11px] font-black uppercase tracking-[0.4em]">
                    {t("actions.show_more")}
                  </span>
                  <div className="flex items-center gap-2 group-hover/btn:gap-3 transition-all duration-500">
                    <div className="w-12 h-px bg-slate-900/20 dark:bg-white/30 group-hover/btn:w-20 group-hover/btn:bg-slate-900 dark:group-hover/btn:bg-white transition-all duration-500" />
                    <ChevronRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform duration-500" />
                  </div>
                </Link>
              </motion.div>
            </div>

            {/* Full Width Scroll Container with Side Arrows */}
            <div className="relative w-full group/carousel">
              {/* Floating Navigation Arrows */}
              <div className="absolute inset-y-0 left-0 z-20 flex items-center px-4 md:px-8 pointer-events-none">
                <button
                  onClick={() => scrollTours("left")}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-500 transition-all duration-300 active:scale-95 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xl pointer-events-auto"
                >
                  <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" />
                </button>
              </div>
              <div className="absolute inset-y-0 right-0 z-20 flex items-center px-4 md:px-8 pointer-events-none">
                <button
                  onClick={() => scrollTours("right")}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-500 transition-all duration-300 active:scale-95 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xl pointer-events-auto"
                >
                  <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />
                </button>
              </div>
              <div
                ref={toursScrollRef}
                className="flex gap-8 overflow-x-auto overflow-y-hidden scrollbar-hide snap-x px-4 md:px-[10%] pt-4 pb-12 transition-all"
              >
                {tours
                  .filter((tour) => tour.featured === true)
                  .map((tour, idx) => (
                    <div key={tour._id} className="flex-shrink-0 w-full sm:w-[320px] md:w-[380px] snap-center">
                      <TourCard tour={tour} t={t} idx={idx} />
                    </div>
                  ))}
              </div>


            </div>
          </section>
        )
      }

      {
        !loading && !hasTours && (
          <div className="mx-auto max-w-7xl px-4 py-12">
            <div className="py-12 text-center border rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-muted-foreground text-sm">
                {t("no_tours_available")}
              </p>
            </div>
          </div>
        )
      }

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <StreetViewModal
        openModal={streetViewOpen}
        onClose={() => setStreetViewOpen(false)}
      />
      <RegionMapModal
        openMapModal={regionMapOpen}
        onCloseMapModal={() => setRegionMapOpen(false)}
      />
    </div >
  );
}



/* =======================================================================
   SUB-COMPONENTS (ShortcutRow)
======================================================================= */

function ShortcutRow({
  items,
  variant,
  onOpenSearch,
  onStreetView,
  onOpenRegionMap,
  t,
}: {
  items: any[];
  variant: "primary" | "secondary";
  onOpenSearch: () => void;
  onStreetView: () => void;
  onOpenRegionMap: () => void;
  t: any;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
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

  const handleShortcutClick = (shortcut: any) => {
    try {
      if (shortcut.link && shortcut.link.trim().startsWith("{")) {
        const parsedLink = JSON.parse(shortcut.link);
        if (parsedLink.theme) {
          dispatch(setActiveTheme(parsedLink.theme));
        }
      }
      const priority = shortcut.priority ?? null;

      if (priority === 1) return onOpenRegionMap();
      if (priority === 2) return onOpenSearch();
      if (priority === 3) return onStreetView();
    } catch (err) {
      console.error("❌ Link Error:", err);
    }
  };

  const handleShortcutLink2 = (shortcut: any) => {
    try {
      if (shortcut.link && shortcut.link.trim().startsWith("{")) {
        const parsedLink = JSON.parse(shortcut.link);
        if (parsedLink.theme) dispatch(setActiveTheme(parsedLink.theme));
      }

      // ✅ Route to Explore Page with Category ID
      if (shortcut._id) {
        router.push(`/explore?category=${shortcut._id}`);
      }
    } catch (err) {
      console.error("❌ Shortcut V2 Link Error:", err);
    }
  };

  return (
    <>
      {items.map((item) => {
        const isPrimary = variant === "primary";

        if (isPrimary) {
          return (
            <motion.div
              key={item._id}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleShortcutClick(item)}
              className="
                group relative cursor-pointer
                w-full md:min-w-[170px] md:max-w-[170px]
                h-[120px] md:h-[135px]
                rounded-[2.5rem]
                bg-white dark:bg-[#1e293b]
                border border-teal-500/30 dark:border-teal-400/20
                flex flex-col items-center justify-center gap-3
                shadow-[0_15px_35px_-12px_rgba(0,0,0,0.15),0_5px_15px_-5px_rgba(0,0,0,0.08)]
                dark:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)]
                hover:shadow-[0_25px_50px_-15px_rgba(20,184,166,0.2)]
                transition-all duration-500 overflow-hidden
                px-2
              "
            >
              {/* Inner Glow Polish */}
              <div className="absolute inset-px rounded-[2.4rem] border border-white dark:border-white/5 pointer-events-none opacity-50" />

              <div className="
                w-12 h-12 md:w-16 md:h-16 
                rounded-[1.8rem] 
                bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/40 dark:to-slate-900/40
                flex items-center justify-center 
                shadow-inner border border-slate-200/50 dark:border-white/5
                group-hover:shadow-teal-500/20 group-hover:border-teal-400/30
                group-hover:-translate-y-1 transition-all duration-500
              ">
                {item.icon?.secure_url ? (
                  <img
                    src={item.icon.secure_url}
                    alt={item.title}
                    className="w-7 h-7 md:w-10 md:h-10 object-contain drop-shadow-md"
                    style={{
                      filter: isDark
                        ? "brightness(0) saturate(100%) invert(81%) sepia(31%) saturate(545%) hue-rotate(124deg) brightness(98%) contrast(92%)"
                        : "brightness(0) saturate(100%) invert(40%) sepia(80%) saturate(600%) hue-rotate(130deg) brightness(90%) contrast(100%)",
                    }}
                  />
                ) : (
                  <MapPinned className="w-7 h-7 text-teal-600 dark:text-teal-400" />
                )}
              </div>

              <span className="text-[9px] w-full text-center truncate md:text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white transition-colors">
                {item.title}
              </span>

              {/* Orbital Glow Background */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-teal-500/10 dark:bg-teal-400/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </motion.div>
          );
        }

        {/* Secondary (Category) Cards: 'Architectural Blueprint Tab' Style */ }
        return (
          <motion.div
            key={item._id}
            whileHover={{ y: -2, x: 0 }}
            onClick={() => handleShortcutLink2(item)}
            className="
              group relative cursor-pointer
              flex flex-col sm:flex-row items-center sm:gap-4 px-2 py-3 sm:px-5 sm:py-5
              bg-[#fcfdfe] dark:bg-[#1e293b]
              hover:bg-white dark:hover:bg-[#334155]
              border border-teal-500/30 dark:border-teal-400/20
              hover:border-teal-500/60 dark:hover:border-teal-400/50
              transition-all duration-300
              shadow-[0_8px_20px_-10px_rgba(0,0,0,0.12),0_2px_8px_-2px_rgba(0,0,0,0.06)]
              hover:shadow-[0_15px_40px_-12px_rgba(20,184,166,0.2)]
              rounded-2xl
              w-full h-auto min-h-[90px] sm:min-h-[75px]
              justify-center sm:justify-start
              text-center sm:text-left
              overflow-hidden
            "
          >
            {/* Accent Bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 transition-colors duration-300" />

            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{ backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`, backgroundSize: '12px 12px' }} />

            <div className="
              w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 
              flex items-center justify-center 
              bg-white dark:bg-slate-800/50
              border border-slate-200/50 dark:border-white/5 
              shadow-sm rounded-xl
              group-hover:scale-110 group-hover:shadow-teal-500/10 transition-all duration-300
              mb-1 sm:mb-0
            ">
              {item.icon?.secure_url ? (
                <img
                  src={item.icon.secure_url}
                  alt={item.title}
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                  style={{
                    filter: isDark
                      ? "brightness(0) saturate(100%) invert(81%) sepia(31%) saturate(545%) hue-rotate(124deg) brightness(98%) contrast(92%)"
                      : "brightness(0) saturate(100%) invert(40%) sepia(80%) saturate(600%) hue-rotate(130deg) brightness(90%) contrast(100%)",
                  }}
                />
              ) : (
                <Layers className="w-5 h-5 text-slate-400 group-hover:text-teal-500 transition-colors" />
              )}
            </div>

            <div className="flex flex-col w-full overflow-hidden">
              <span className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-teal-600/60 dark:text-teal-400/50 mb-0.5 transition-colors">
                {t("home.explore") || "Explore"}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white transition-colors truncate w-full">
                {item.title}
              </span>
            </div>

            <div className="hidden sm:block ml-auto opacity-100 translate-x-0 transition-all duration-500 text-teal-500 dark:text-teal-400 font-serif italic text-lg">
              →
            </div>
          </motion.div>
        );
      })}
    </>
  );
}


