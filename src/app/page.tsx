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
    <div className="flex flex-col w-full min-h-screen">
      {/* ================= HERO CAROUSEL ================= */}
      <HeroCarousel />

      {/* ================= SECTION DIVIDER ================= */}
      <div className="relative z-10 flex justify-center -mt-8 mb-8">
        <div className="flex items-center gap-4 px-8 py-3 bg-white/80 dark:bg-[#1a1d24]/90 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-xs tracking-[0.2em] uppercase text-slate-800 dark:text-slate-100 font-bold">
            {t("home.quick_access")}
          </span>
        </div>
      </div>

      {/* ================= PRIMARY SHORTCUTS (Dock Style) ================= */}
      {!globalLoading && sectionOne.length > 0 && (
        <section className="w-full p-4">
          <div
            className="
    grid grid-cols-3 gap-3           /* ✅ MOBILE: force 3 in one row */
    md:flex md:flex-nowrap md:gap-4 /* ✅ TAB & DESKTOP: SAME AS BEFORE */
    justify-center
    md:overflow-visible
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
      <div className="mx-auto w-full px-4 space-y-10 pb-0">

        {/* ================= SERVICE INFO (Modern Grid) ================= */}
        {!globalLoading && sectionTwo.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-teal-500/10">
                <Layers className="h-6 w-6 text-teal-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
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
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-500/10">
                  <BookOpen className="h-6 w-6 text-teal-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
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
            <div className="flex items-center justify-between mb-6 px-1 border-b border-dashed border-teal-500/30 pb-2">
              <div className="flex items-center gap-3">
                <Route className="h-5 w-5 text-teal-500" />
                <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  {t("home.guide_tour")}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex gap-1 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30"
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
      className="group relative flex flex-col h-[520px] rounded-3xl overflow-hidden bg-white dark:bg-[#15191f] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-teal-900/10 transition-all duration-500 hover:-translate-y-2 cursor-pointer isolate"
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
          <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
            <ImageIcon className="h-12 w-12 text-slate-300" />
          </div>
        )}

        <div className="absolute top-5 left-5 z-20">
          <div className="px-4 py-1.5 rounded-full bg-white/95 dark:bg-black/80 backdrop-blur-md text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5 shadow-sm border border-teal-100 dark:border-teal-900/50">
            <Star className="w-3.5 h-3.5 fill-teal-500 text-teal-500" />
            <span className="tracking-wide uppercase">
              {t("actions.featured")}
            </span>
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
  w-full md:min-w-[140px] md:max-w-[140px]  /* ✅ fixed ONLY on md+ */
  h-[101px] md:h-[110px]
  rounded-2xl
  shadow-md
  bg-white dark:bg-[#0f1115]
`}
            >
              {/* Icon */}
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-2xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-500/20 mb-2">
                {item.icon?.secure_url ? (
                  <img
                    src={item.icon.secure_url}
                    alt={item.title}
                    className="w-7 h-7 md:w-8 md:h-8 object-contain"
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
    whitespace-nowrap
    overflow-hidden
    text-ellipsis
    max-w-full
    px-2
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
    flex-col items-center md:flex-row gap-2 md:gap-4 px-2 md:px-4 py-3.5 md:py-3.5
    w-full min-w-0 h-auto md:min-h-[72px]
    rounded-2xl
    shadow-sm hover:shadow-lg hover:shadow-teal-500/10 dark:hover:shadow-teal-900/20
    bg-white dark:bg-[#0f1115] border-slate-200 dark:border-white/5
  `}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-500/20 transition-all duration-300">
              {item.icon?.secure_url ? (
                <div className="w-5 h-5 text-current">
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
                <Search className="w-5 h-5" />
              )}
            </div>

            <span
              className="
    text-xs md:text-sm font-bold
    text-left
    text-slate-700 dark:text-slate-200
    group-hover:text-teal-700 dark:group-hover:text-white
    leading-tight
    whitespace-nowrap
    overflow-hidden
    text-ellipsis
    flex-1
  "
              title={item.title} // 👈 tooltip on hover (desktop)
            >
              {item.title}
            </span>

            {/* Arrow Hint */}
            <div className="hidden md:block ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-teal-500 dark:text-teal-400 cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        );
      })}
    </>
  );
}
