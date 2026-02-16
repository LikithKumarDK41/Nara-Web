"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

import {
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  MapPinned,
  ArrowRight,
  Star,
  BookOpen,
  Route,
} from "lucide-react";

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
import SearchModal from "@/components/shortcuts-modal/searchModal";
import StreetViewModal from "@/components/shortcuts-modal/streetViewModal";
import RegionMapModal from "@/components/shortcuts-modal/regionMapModal";

import HomeTabs from "@/components/home/HomeTabs";
import QuickAccessContent from "@/components/home/QuickAccessContent";
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
  // Removed activeTab state
  // Removed selectedCategory state

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
    // <div className="flex flex-col w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-[#0a0d12] dark:via-[#0f1318] dark:to-[#0d1520]">
    <div className="flex flex-col w-full min-h-screen ">
      {/* ================= HERO CAROUSEL ================= */}
      <HeroCarousel />

      {/* ================= TAB NAVIGATION ================= */}
      <HomeTabs activeTab="shortcuts" />

      {/* ================= CONTENT CONTAINER ================= */}
      <div className="mx-auto w-full px-4 space-y-10 pb-0">

        {/* ================= DYNAMIC TAB CONTENT ================= */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {!globalLoading && (
            <QuickAccessContent />
          )}
        </div>

        {/* ================= ABOUT NARA HERITAGE ================= */}
        {abouts.length > 0 && (
          <section className="w-full relative">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-500/10 to-teal-600/5 backdrop-blur-sm border border-teal-200/30 dark:border-teal-500/20 shadow-lg shadow-teal-500/5">
                  <BookOpen className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  {t("home.about_nara")}
                </h2>
              </div>
            </div>

            <div
              className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0"
            >
              {abouts.map((item) => (
                <div
                  key={item._id}
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(setActiveAbout(item._id));
                    router.push("/about");
                  }}
                  className="
                    relative
                    min-w-[280px] md:min-w-[340px]
                    aspect-[3/4]
                    snap-center
                    rounded-3xl overflow-hidden
                    bg-slate-900
                    shadow-lg hover:shadow-2xl hover:shadow-teal-900/20
                    transition-all duration-500
                    cursor-pointer
                    group
                    isolate
                  "
                >
                  {/* Background Image */}
                  {item.image?.secure_url ? (
                    <img
                      src={item.image.secure_url}
                      alt={item.title ?? "About Nara"}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-slate-800" />
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                      <div className="mb-2 w-10 h-1 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full" />

                      <h3 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight drop-shadow-md line-clamp-1">
                        {item.title ?? ""}
                      </h3>

                      <p className="text-white/80 text-sm leading-relaxed mb-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100 hidden md:line-clamp-2">
                        {stripHTML(item.content?.brief)}
                      </p>

                      <div className="inline-flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 group-hover:bg-teal-500 group-hover:text-white group-hover:border-teal-500 transition-all duration-300">
                        {t("tourDetails.viewDetails")} <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================= FEATURED TOURS ================= */}
        {!loading && hasTours && (
          <section>
            <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-dashed border-teal-500/30 dark:border-teal-500/20">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-500/10 to-teal-600/5 backdrop-blur-sm border border-teal-200/30 dark:border-teal-500/20 shadow-lg shadow-teal-500/5">
                  <Route className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent uppercase tracking-wide">
                  {t("home.guide_tour")}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex gap-1 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-700 dark:hover:text-teal-300 transition-all duration-200"
                asChild
              >
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
                className="rounded-full w-auto px-6 bg-teal-600/10 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400 hover:bg-teal-500 hover:text-white dark:hover:bg-teal-700 dark:hover:text-white border border-teal-200 dark:border-teal-800"
                asChild
              >
                <Link href="/tours">{t("actions.show_more")}</Link>
              </Button>
            </div>

            {!loading && !hasTours && (
              <div className="py-12 text-center border rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-muted-foreground text-sm">
                  {t("no_tours_available")}
                </p>
              </div>
            )}
          </section>
        )}

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
    </div>
  );
}



/* =======================================================================
   SUB-COMPONENTS (ShortcutRow, TourCard)
======================================================================= */

function TourCard({ tour, t, idx }: { tour: Tour; t: any; idx: number }) {
  return (
    <div
      className="group relative flex flex-col h-[520px] rounded-3xl overflow-hidden bg-white dark:bg-[#15191f] border border-slate-200/80 dark:border-slate-700/60 shadow-lg hover:shadow-2xl hover:shadow-teal-500/20 dark:hover:shadow-teal-900/40 transition-all duration-500 hover:-translate-y-2 cursor-pointer isolate"
      style={{ transitionDelay: `${idx * 50}ms` }}
      onClick={() => (window.location.href = `/tours/detail?id=${tour._id}`)}
    >
      <div className="relative h-[280px] w-full overflow-hidden flex-shrink-0">
        {tour.image?.secure_url ? (
          <img
            src={tour.image.secure_url}
            alt={tour.title}
            className="block h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
            <ImageIcon className="h-12 w-12 text-slate-400 dark:text-slate-600" />
          </div>
        )}

        <div className="absolute top-5 left-5 z-20">
          <div className="px-4 py-2 rounded-full bg-white/95 dark:bg-black/90 backdrop-blur-xl text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-2 shadow-lg border border-teal-200/50 dark:border-teal-500/30">
            <Star className="w-3.5 h-3.5 fill-teal-500 text-teal-500 dark:fill-teal-400 dark:text-teal-400" />
            <span className="tracking-wide uppercase">
              {t("actions.featured")}
            </span>
          </div>
        </div>

        {/* Gradient overlays for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-40 dark:opacity-70 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-20 dark:group-hover:opacity-0 transition-opacity duration-500" />
      </div>

      <div className="relative flex-1 p-8 flex flex-col justify-between bg-gradient-to-br from-white to-slate-50/50 dark:from-[#15191f] dark:to-[#1a1f28]">
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white line-clamp-1 leading-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300">
            {tour.title}
          </h3>
          {tour.content?.brief && (
            <p
              className="text-sm font-light text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: normalizeHTML(tour.content.brief),
              }}
            />
          )}
        </div>

        <div className="flex items-center justify-between pt-6 mt-auto border-t border-slate-200/60 dark:border-slate-700/60">
          <span className="text-xs font-bold text-teal-600/80 dark:text-teal-400/80 uppercase tracking-widest group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            {t("home.explore_link")}
          </span>
          <div className="w-11 h-11 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a2029] flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-teal-500 group-hover:to-teal-600 group-hover:border-teal-500 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:shadow-teal-500/50">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}


