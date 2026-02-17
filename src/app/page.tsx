"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import {
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

import { useAppDispatch } from "@/lib/store/hook";
import {
  fetchShortcuts,
} from "@/lib/store/slices/globalSlice";
import { setActiveAbout } from "@/lib/store/slices/globalSlice";

import { useLocale } from "@/providers/LocaleProvider";
import { useGlobalLoader } from "@/providers/LoaderProvider";
import { apiFetchToursVersionTwo } from "@/services/userTourService";
import type { Tour } from "@/lib/types/userTour.types";
import { normalizeHTML, stripHTML } from "@/lib/utils";
import { apiFetchAbouts } from "@/services/userGlobalservice";
import { About } from "@/lib/types/userGlobal.types";
import SearchModal from "@/components/shortcuts-modal/searchModal";
import StreetViewModal from "@/components/shortcuts-modal/streetViewModal";
import RegionMapModal from "@/components/shortcuts-modal/regionMapModal";

import HomeTabs from "@/components/home/HomeTabs";
import HeroCarousel from "@/components/home/HeroCarousel";

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
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const hasTours = (tours?.length ?? 0) > 0;

  /* -------------------- Render -------------------- */
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* ================= HERO CAROUSEL ================= */}
      <HeroCarousel />

      {/* ================= TAB NAVIGATION ================= */}
      <HomeTabs />

      {/* ================= DISCOVERY SECTION HEADER ================= */}
      {abouts.length > 0 && (
        <section className="w-full bg-white dark:bg-black py-10 px-6 border-b border-slate-200 dark:border-white/5 flex flex-col items-center justify-center text-center overflow-hidden relative transition-colors duration-500">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="z-10"
          >
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="w-12 h-px bg-slate-900/10 dark:bg-white/20" />
              <span className="text-[10px] font-black text-slate-500 dark:text-white/50 uppercase tracking-[0.5em]">
                {t("home.heritage") || "Heritage"}
              </span>
              <div className="w-12 h-px bg-slate-900/10 dark:bg-white/20" />
            </div>
            <h2 className="text-3xl md:text-5xl font-serif italic text-slate-900 dark:text-white tracking-tighter leading-none mb-1">
              {t("home.about_nara") || "Discovery Nara"}
            </h2>
            <p className="text-[11px] md:text-sm font-light text-slate-500 dark:text-white/40 tracking-[0.2em] uppercase mt-2">
              Journey through the layers of Japan&apos;s ancient capital
            </p>
          </motion.div>

          {/* Subtle background texture/glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-full bg-slate-400/[0.05] dark:bg-white/[0.02] blur-[100px] pointer-events-none" />
        </section>
      )}

      {/* ================= ABOUT NARA HERITAGE (Interactive Snap-Scroll Panorama) ================= */}
      {abouts.length > 0 && (
        <section className="w-full relative bg-white dark:bg-black border-b border-slate-200 dark:border-white/5 scroll-smooth group/mosaic transition-colors duration-500">
          {/* Navigation Arrows */}
          <button
            onClick={() => scrollMosaic("left")}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-50 h-12 w-12 flex items-center justify-center rounded-full bg-white/80 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white backdrop-blur-lg opacity-0 group-hover/mosaic:opacity-100 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:scale-110 transition-all duration-300 pointer-events-auto shadow-lg"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => scrollMosaic("right")}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-50 h-12 w-12 flex items-center justify-center rounded-full bg-white/80 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white backdrop-blur-lg opacity-0 group-hover/mosaic:opacity-100 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:scale-110 transition-all duration-300 pointer-events-auto shadow-lg"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div
            ref={scrollRef}
            className="flex flex-col md:flex-row w-full md:h-[400px] overflow-x-auto scrollbar-hide snap-x snap-mandatory"
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

                {/* Dark Cinematic Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black/95 via-transparent opacity-90 group-hover:opacity-40 transition-opacity duration-700" />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-white dark:from-black to-transparent" />

                {/* Content Overlay */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end transform transition-all duration-500 translate-y-3 group-hover:translate-y-0">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-[0.4em] group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      {idx + 1 < 10 ? `0${idx + 1}` : idx + 1} / {t("home.heritage") || "Heritage"}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-serif italic font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
                      {item.title ?? ""}
                    </h3>
                  </div>

                  {/* Detailed Reveal on Hover */}
                  <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-500 opacity-0 group-hover:opacity-100 mt-4">
                    <p className="text-slate-600 dark:text-white/60 text-[11px] md:text-xs leading-relaxed mb-4 line-clamp-2 max-w-sm font-light">
                      {stripHTML(item.content?.brief)}
                    </p>
                    <div className="flex items-center gap-3 text-slate-900 dark:text-white text-[11px] font-black uppercase tracking-[0.2em]">
                      Explore Foundation
                      <div className="w-8 h-px bg-slate-900/30 dark:bg-white/30 group-hover:w-12 transition-all duration-500" />
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ================= CONTENT CONTAINER ================= */}
      <div className="mx-auto max-w-7xl w-full py-10 space-y-12">

        {/* ================= FEATURED TOURS ================= */}
        {!loading && hasTours && (
          <section>
            <div className="flex flex-col items-center justify-center text-center mb-16 px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl"
              >
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-12 h-px bg-slate-900/10 dark:bg-white/20" />
                  <span className="text-[10px] font-black text-slate-500 dark:text-white/50 uppercase tracking-[0.5em]">
                    {t("home.curated_tours") || "Experience"}
                  </span>
                  <div className="w-12 h-px bg-slate-900/10 dark:bg-white/20" />
                </div>

                <h2 className="text-4xl md:text-6xl font-serif italic text-slate-900 dark:text-white tracking-tighter leading-tight mb-4">
                  {t("home.guide_tour")}
                </h2>

                <p className="text-[11px] md:text-sm font-light text-slate-500 dark:text-white/40 tracking-[0.3em] uppercase mb-8">
                  Artfully curated journeys through the heart of ancient Japan
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

            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {tours
                .filter((tour) => tour.featured === true)
                .slice(0, 3)
                .map((tour, idx) => (
                  <TourCard key={tour._id} tour={tour} t={t} idx={idx} />
                ))}
            </div>
          </section>
        )}

        {!loading && !hasTours && (
          <div className="py-12 text-center border rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-muted-foreground text-sm">
              {t("no_tours_available")}
            </p>
          </div>
        )}
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <StreetViewModal
        openModal={streetViewOpen}
        onClose={() => setStreetViewOpen(false)}
      />
      <RegionMapModal
        openMapModal={regionMapOpen}
        onCloseMapModal={() => setRegionMapOpen(false)}
      />
    </div>
  );
}



/* =======================================================================
   SUB-COMPONENTS (ShortcutRow, TourCard)
======================================================================= */

function TourCard({ tour, t, idx }: { tour: Tour; t: any; idx: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col h-full p-3 rounded-[3rem] bg-white dark:bg-[#0a0a0a] border border-slate-100 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-700 cursor-pointer"
      onClick={() => (window.location.href = `/tours/detail?id=${tour._id}`)}
    >
      {/* 🖼️ Premium Inset Image Container */}
      <div className="relative h-[280px] w-full rounded-[2.2rem] overflow-hidden bg-slate-50 dark:bg-zinc-900 shrink-0 border border-slate-50 dark:border-white/5">
        {tour.image?.secure_url ? (
          <img
            src={tour.image.secure_url}
            alt={tour.title}
            className="block h-full w-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-10 w-10 text-slate-300 dark:text-zinc-700" />
          </div>
        )}

        {/* Ambient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* ✍️ Content Area */}
      <div className="flex-1 px-8 py-9 flex flex-col min-h-0 bg-transparent">
        <div className="flex-1 space-y-4">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white line-clamp-2 font-serif italic tracking-tight leading-tight">
            {tour.title}
          </h3>

          {tour.content?.brief && (
            <p
              className="text-sm text-slate-500 dark:text-white/40 line-clamp-3 leading-relaxed font-light"
              dangerouslySetInnerHTML={{
                __html: normalizeHTML(tour.content.brief),
              }}
            />
          )}
        </div>

        {/* Architectural Full-Width Action */}
        <div className="mt-8 pt-7 border-t border-slate-50 dark:border-white/5">
          <div className="flex items-center justify-between group/link">
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.25em] transition-colors duration-300">
              {t("actions.explore_now") || "Explore Now"}
            </span>
            <div className="flex-1 mx-4 h-px bg-slate-100 dark:bg-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-slate-900 dark:bg-white -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-900 dark:text-white transform transition-transform duration-500 ease-out group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
