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
  Layers,
  Route,
  ArrowUpRight,
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
  // Get featured tours for carousel
  const featuredTours = tours.filter((t) => t.featured);

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

  const aboutScrollRef = useRef<HTMLDivElement>(null);

  const scrollAbout = (dir: "left" | "right") => {
    if (!aboutScrollRef.current) return;
    const offset = dir === "left" ? -320 : 320;
    aboutScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  /* -------------------- Render -------------------- */
  return (
    // <div className="flex flex-col w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-[#0a0d12] dark:via-[#0f1318] dark:to-[#0d1520]">
    <div className="flex flex-col w-full min-h-screen ">
      {/* ================= HERO CAROUSEL ================= */}
      <HeroCarousel />

      {/* ================= SECTION DIVIDER ================= */}
      <div className="relative z-10 flex justify-center -mt-8 mb-10">
        <div className="flex items-center gap-4 px-8 py-3.5 bg-white/90 dark:bg-[#1a1d24]/95 backdrop-blur-xl rounded-full border border-teal-200/40 dark:border-teal-500/20 shadow-xl shadow-teal-500/10 dark:shadow-teal-900/30">
          <span className="h-2 w-2 rounded-full bg-gradient-to-r from-teal-400 to-teal-600 animate-pulse shadow-lg shadow-teal-500/50" />
          <span className="text-xs tracking-[0.25em] uppercase text-slate-800 dark:text-slate-100 font-bold">
            {t("home.quick_access")}
          </span>
        </div>
      </div>

      {/* ================= PRIMARY SHORTCUTS (Dock Style) ================= */}
      {!globalLoading && sectionOne.length > 0 && (
        <section className="w-full px-4 pb-6">
          <div
            className="
    grid grid-cols-3 gap-3 sm:gap-4
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
            />
          </div>
        </section>
      )}

      {/* ================= CONTENT CONTAINER ================= */}
      {/* <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16 pb-16"> */}
      <div className="mx-auto w-full px-4 space-y-10 pb-0">

        {/* ================= SERVICE INFO (Modern Grid) ================= */}
        {!globalLoading && sectionTwo.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-200/60 dark:border-slate-700/60">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-500/10 to-teal-600/5 backdrop-blur-sm border border-teal-200/30 dark:border-teal-500/20 shadow-lg shadow-teal-500/5">
                <Layers className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                {t("home.explore_categories")}
              </h2>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <ShortcutRow
                items={sectionTwo}
                variant="secondary"
                onOpenSearch={() => setSearchOpen(true)}
                onStreetView={() => setStreetViewOpen(true)}
                onOpenRegionMap={() => setRegionMapOpen(true)}
              />
            </div>
          </section>
        )}

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

              <div className="hidden md:flex gap-2">
                <button
                  onClick={() => scrollAbout("left")}
                  className="cursor-pointer p-2 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollAbout("right")}
                  className="cursor-pointer p-2 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div
              ref={aboutScrollRef}
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
                    min-w-[280px] md:min-w-[320px]
                    snap-center
                    rounded-3xl overflow-hidden
                    bg-white dark:bg-[#15191f]
                    border border-slate-100 dark:border-slate-800
                    shadow-sm hover:shadow-xl
                    transition-all duration-300
                    cursor-pointer
                    group
                  "
                >
                  <div className="relative h-[200px] w-full overflow-hidden">
                    {item.image?.secure_url ? (
                      <img
                        src={item.image.secure_url}
                        alt={item.title ?? "About Nara"}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full bg-slate-200 dark:bg-slate-800" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-lg font-bold text-white line-clamp-2">
                        {item.title ?? ""}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4">
                      {stripHTML(item.content?.brief)}
                    </p>
                    <div className="flex items-center text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wider group-hover:gap-2 transition-all">
                      {t("tourDetails.viewDetails")} <ArrowRight className="w-3 h-3 ml-1" />
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
                className="rounded-full w-auto px-6 bg-teal-600/10 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400 border border-teal-200 dark:border-teal-800"
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

function ShortcutRow({
  items,
  variant,
  onOpenSearch,
  onStreetView,
  onOpenRegionMap,
}: {
  items: any[];
  variant: "primary" | "secondary";
  onOpenSearch: () => void;
  onStreetView: () => void;
  onOpenRegionMap: () => void;
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
      const p = shortcut?.priority;
      if (typeof p !== "number" || p < 4 || p > 9) return;

      const routes: Record<number, string> = {
        4: "/category/politics",
        5: "/category/economy",
        6: "/category/faith",
        7: "/category/art",
        8: "/category/technology",
        9: "/category/nature",
      };

      if (routes[p]) router.push(routes[p]);
    } catch (err) {
      console.error("❌ Shortcut V2 Link Error:", err);
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
           border border-slate-200/80 dark:border-slate-700/60
           hover:border-teal-400 dark:hover:border-teal-500
           transition-all duration-300 ease-out
           hover:-translate-y-1 
           hover:shadow-[0_12px_40px_-8px_rgba(20,184,166,0.25)]
           dark:hover:shadow-[0_12px_40px_-8px_rgba(20,184,166,0.35)]
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
  flex flex-col items-center justify-center gap-3
  w-full md:min-w-[150px] md:max-w-[150px]
  h-[110px] md:h-[120px]
  rounded-2xl md:rounded-3xl
  shadow-md hover:shadow-xl
  bg-gradient-to-br from-white to-slate-50/80 dark:from-[#0f1115] dark:to-[#15191f]
  border-slate-200/80 dark:border-slate-700/60
  hover:scale-105
  hover:shadow-teal-500/20 dark:hover:shadow-teal-900/40
`}
            >
              {/* Icon */}
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-900/30 dark:to-teal-800/20 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-200/50 dark:border-teal-500/30 shadow-sm group-hover:shadow-md group-hover:shadow-teal-500/30 transition-all duration-300">
                {item.icon?.secure_url ? (
                  <img
                    src={item.icon.secure_url}
                    alt={item.title}
                    className="w-6 h-6 md:w-9 md:h-9 object-contain"
                    style={{
                      filter: isDark
                        ? "brightness(0) saturate(100%) invert(81%) sepia(31%) saturate(545%) hue-rotate(124deg) brightness(98%) contrast(92%)"
                        : "brightness(0) saturate(100%) invert(70%) sepia(40%) saturate(700%) hue-rotate(124deg) brightness(80%) contrast(115%)",
                    }}
                  />
                ) : (
                  <MapPinned className="w-6 h-6" />
                )}
              </div>

              {/* Text */}
              <span
                className="
    text-xs md:text-sm font-bold
    text-center
    text-slate-800 dark:text-slate-200
    group-hover:text-teal-700 dark:group-hover:text-teal-300
    whitespace-nowrap
    overflow-hidden
    text-ellipsis
    max-w-full
    px-2
    transition-colors duration-200
  "
                title={item.title}
              >
                {item.title}
              </span>
            </div>
          );
        }

        // Secondary Design (Categories) - Compact Version of the SAME style
        return (
          <div
            key={item._id}
            onClick={() => handleShortcutLink2(item)}
            className={`
    ${baseCardStyles}
    flex-col items-center md:flex-row gap-3 md:gap-4 px-3 md:px-5 py-4 md:py-4
    w-full min-w-0 h-auto md:min-h-[80px]
    rounded-2xl md:rounded-3xl
    shadow-md hover:shadow-xl
    bg-gradient-to-br from-white to-slate-50/80 dark:from-[#0f1115] dark:to-[#15191f]
    border-slate-200/80 dark:border-slate-700/60
    hover:scale-[1.02]
    hover:shadow-teal-500/15 dark:hover:shadow-teal-900/30
  `}
          >
            <div className="flex-shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-900/30 dark:to-teal-800/20 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-200/50 dark:border-teal-500/30 shadow-sm group-hover:shadow-md group-hover:shadow-teal-500/30 transition-all duration-300">
              {item.icon?.secure_url ? (
                <div className="w-6 h-6 text-current">
                  <img
                    src={item.icon.secure_url}
                    alt={item.title}
                    className="w-full h-full object-contain"
                    style={{
                      filter: isDark
                        ? "brightness(0) saturate(100%) invert(81%) sepia(31%) saturate(545%) hue-rotate(124deg) brightness(98%) contrast(92%)"
                        : "brightness(0) saturate(100%) invert(70%) sepia(40%) saturate(700%) hue-rotate(124deg) brightness(80%) contrast(115%)",
                    }}
                  />
                </div>
              ) : (
                <Search className="w-6 h-6" />
              )}
            </div>

            <span
              className="
    text-xs md:text-sm font-bold
    text-center md:text-left
    text-slate-700 dark:text-slate-200
    group-hover:text-teal-700 dark:group-hover:text-teal-300
    leading-tight
    whitespace-nowrap
    overflow-hidden
    text-ellipsis
    flex-1
    transition-colors duration-200
  "
              title={item.title}
            >
              {item.title}
            </span>

            {/* Arrow Hint */}
            <div className="hidden md:block ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-teal-600 dark:text-teal-400">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </>
  );
}
