"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Landmark,
  Bookmark,
  CheckCircle2,
  Compass,
  ImageIcon,
  Trash2,
  PlayCircle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useLocale } from "@/providers/LocaleProvider";
import type { AppDispatch } from "@/lib/store";
import { fetchMonumentDetails } from "@/lib/store/slices/touristSlice";
import { useGlobalLoader } from "@/providers/LoaderProvider";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MonumentDetailModal from "@/components/tour/MonumentDetailModal";
import {
  apiGetUserBookmarks,
  apiGetVisitHistoryByUser,
  apiDeleteBookmark,
  apiDeleteVisitHistory,
} from "@/services/myListService";
import { apiDeleteUserTour } from "@/services/userTourService";
import { useAppSelector } from "@/lib/store/hook";
import { selectNav, resetAll as resetNav } from "@/lib/store/slices/navSlice";
import { resetAll as resetGeofence } from "@/lib/store/slices/geofenceSlice";
import { clearTourDetail } from "@/lib/store/slices/touristSlice";
import Breadcrumb from "@/components/ui/Breadcrumb";

/* MAIN PAGE */
export default function LibraryPage() {
  const { t } = useLocale();
  const dispatch = useDispatch<AppDispatch>();
  const nav = useAppSelector(selectNav);
  const usertour = nav.usertour;

  const loadingState = useSelector((s: any) => s.tourist.loading);

  const { show, hide } = useGlobalLoader();

  const [topTab, setTopTab] = useState<"bookmarks" | "visited">("bookmarks");
  const [innerTab, setInnerTab] = useState<"monuments" | "tours">("monuments");

  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState({
    bookmarkedMonuments: 1,
    bookmarkedTours: 1,
    visitedMonuments: 1,
    visitedTours: 1,
  });

  const limit = 6;

  const [open, setOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedMonument, setSelectedMonument] = useState<any | null>(null);

  /* ============================
        FETCH BOOKMARKS
     ============================ */
  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const res = await apiGetUserBookmarks();

      const monuments = (res.monuments || []).map((m: any) => ({
        bookmarkId: m._id,
        marktype: "monument",
        monument: m.monument,
      }));

      const tours = (res.tours || []).map((t: any) => ({
        bookmarkId: t._id,
        marktype: "tour",
        tour: t.tour,
      }));

      setBookmarks([...monuments, ...tours]);
    } catch (err) {
      console.error("Failed to fetch bookmarks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  /* ============================
        FETCH VISIT HISTORY
     ============================ */
  const loadVisits = async () => {
    try {
      const res = await apiGetVisitHistoryByUser();

      const combined = [
        ...(res.monuments || []).map((m: any) => ({
          visitId: m._id,
          historytype: "monument",
          monument: m.monument,
        })),
        ...(res.tours || []).map((t: any) => ({
          visitId: t._id,
          historytype: "tour",
          tour: t.tour,
          status: t.status,
        })),
      ];

      setVisits(combined);
    } catch (err) {
      console.error("Failed to fetch visit histories:", err);
    }
  };

  useEffect(() => {
    loadVisits();
  }, []);

  /* ============================
        DATA FORMATTERS
     ============================ */
  const cleanText = (html: string) =>
    (html || "")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;|&#160;/gi, " ")
      .replace(/\u00A0/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const bookmarkedMonuments = useMemo(
    () =>
      bookmarks
        .filter((b) => b.marktype === "monument" && b.monument)
        .map((b) => ({
          bookmarkId: b.bookmarkId,
          _id: b.monument._id,
          name: b.monument.title,
          image: b.monument.image?.secure_url || b.monument.image?.url,
          description: cleanText(b.monument.content?.brief || ""),
        })),
    [bookmarks],
  );

  const bookmarkedTours = useMemo(
    () =>
      bookmarks
        .filter((b) => b.marktype === "tour" && b.tour)
        .map((b) => ({
          bookmarkId: b.bookmarkId,
          _id: b.tour._id,
          title: b.tour.title,
          image: b.tour.image?.secure_url || b.tour.image?.url,
          description: cleanText(b.tour.content?.brief || ""),
        })),
    [bookmarks],
  );

  const visitedMonuments = useMemo(
    () =>
      visits
        .filter((v) => v.historytype === "monument" && v.monument)
        .map((v) => ({
          visitId: v.visitId,
          _id: v.monument._id,
          name: v.monument.title,
          image: v.monument.image?.secure_url || v.monument.image?.url,
          description: cleanText(v.monument.content?.brief || ""),
        })),
    [visits],
  );

  const visitedTours = useMemo(
    () =>
      visits
        .filter((v) => v.historytype === "tour" && v.tour)
        .map((v) => ({
          visitId: v.visitId,
          _id: v.tour._id,
          title: v.tour.title,
          image: v.tour.image?.secure_url || v.tour.image?.url,
          description: cleanText(v.tour.content?.brief || ""),
          status: v.status,
        })),
    [visits],
  );

  /* ============================
        DELETE HANDLERS
     ============================ */
  const deleteBookmark = async (bookmarkId: string) => {
    try {
      show();
      await apiDeleteBookmark(bookmarkId);
      await loadBookmarks(); // refresh
    } finally {
      hide();
    }
  };

  const deleteVisit = async (visitId: string) => {
    try {
      show();
      await apiDeleteVisitHistory(visitId);
      await loadVisits(); // refresh
    } finally {
      hide();
    }
  };

  /* ============================
        PAGINATION
     ============================ */
  const getPageKey = () => {
    if (topTab === "bookmarks" && innerTab === "monuments")
      return "bookmarkedMonuments";
    if (topTab === "bookmarks" && innerTab === "tours")
      return "bookmarkedTours";
    if (topTab === "visited" && innerTab === "monuments")
      return "visitedMonuments";
    return "visitedTours";
  };

  const handlePageChange = (p: number) => {
    const key = getPageKey();
    setPage((prev) => ({ ...prev, [key]: p }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentPage = page[getPageKey()];

  const dataList =
    topTab === "bookmarks"
      ? innerTab === "monuments"
        ? bookmarkedMonuments
        : bookmarkedTours
      : innerTab === "monuments"
        ? visitedMonuments
        : visitedTours;

  const totalPages = Math.ceil(dataList.length / limit) || 1;

  const currentData = dataList.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );

  /**
 * PAGINATION AUTO-ADJUST:
 * If an item is deleted and the current page becomes empty, jump back.
 */
  useEffect(() => {
    const key = getPageKey();
    const currentPageVal = page[key];
    const totalPagesVal = Math.ceil(dataList.length / limit) || 1;

    if (currentPageVal > totalPagesVal) {
      setPage((prev) => ({ ...prev, [key]: totalPagesVal }));
    }
  }, [dataList.length, limit, topTab, innerTab, page]);

  /* ============================
        MONUMENT DETAILS
     ============================ */
  const handleOpenMonument = async (id: string) => {
    setModalLoading(true);
    try {
      const thunk = dispatch(fetchMonumentDetails(id));
      const data = await thunk.unwrap();
      setSelectedMonument(data);
      setOpen(true);
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenAnother = async (id: string) => {
    setModalLoading(true);
    try {
      const thunk = dispatch(fetchMonumentDetails(id));
      const data = await thunk.unwrap();
      setSelectedMonument(data);
    } catch (err) {
      console.error("Failed to open another monument:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const refreshAll = async () => {
    try {
      const b = await apiGetUserBookmarks();
      const v = await apiGetVisitHistoryByUser();

      const monumentBookmarks = (b.monuments || []).map((m: any) => ({
        bookmarkId: m._id, // keep bookmark id
        marktype: "monument",
        monument: m.monument,
      }));

      const tourBookmarks = (b.tours || []).map((t: any) => ({
        bookmarkId: t._id,
        marktype: "tour",
        tour: t.tour,
      }));

      setBookmarks([...monumentBookmarks, ...tourBookmarks]);

      const combinedVisits = [
        ...(v.monuments || []).map((m: any) => ({
          visitId: m._id,
          historytype: "monument",
          monument: m.monument,
        })),
        ...(v.tours || []).map((t: any) => ({
          visitId: t._id,
          historytype: "tour",
          tour: t.tour,
        })),
      ];

      setVisits(combinedVisits);
    } catch (err) {
      console.error("Failed to refresh data:", err);
    }
  };

  const deleteUserTour = async (visitId: string) => {
    try {
      show();
      await apiDeleteUserTour(visitId);
      if (usertour && usertour._id === visitId) {
        dispatch(resetNav());
        dispatch(resetGeofence());
        dispatch(clearTourDetail());
      }
      await loadVisits(); // refresh only visit history list
    } finally {
      hide();
    }
  };

  return (
    <div className="space-y-6">
      {/* HERO BANNER */}
      <section
        className="mb-4
    w-full
    bg-gradient-to-br
    from-teal-600 via-cyan-600 to-emerald-700
    dark:from-[#0a1f2e] dark:via-[#1a3a4a] dark:to-[#2d5a6f]
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
              {t("nara_heritage")}
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
        font-serif italic
      "
          >
            {t("personal_library")}
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
            {t("personal_library_subtitle")}
          </p>
        </div>
      </section>

      <div className="px-4 space-y-6">
        {/* BREADCRUMB */}
        <div className="mt-2 flex justify-start">
          <Breadcrumb
            items={[
              { label: t("personal_library") || "My List" },
            ]}
          />
        </div>

        {/* MAIN TABS */}
        <Tabs
          value={topTab}
          onValueChange={(v) => setTopTab(v as any)}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 rounded-full bg-muted/70 p-1 shadow ring-1 ring-border">
            <TabsTrigger value="bookmarks" className="cursor-pointer">
              <Bookmark className="mr-2 h-4 w-4" /> {t("Bookmarks")}
            </TabsTrigger>
            <TabsTrigger value="visited" className="cursor-pointer">
              <CheckCircle2 className="mr-2 h-4 w-4" /> {t("Visited")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={topTab}>
            <InnerTabs
              key={`${topTab}-${innerTab}`}
              value={innerTab}
              onChange={setInnerTab}
              data={currentData}
              totalPages={totalPages}
              page={currentPage}
              onPageChange={handlePageChange}
              t={t}
              onOpenMonument={handleOpenMonument}
              onDeleteBookmark={deleteBookmark}
              onDeleteVisit={deleteVisit}
              onDeleteUserTour={deleteUserTour}
              isBookmarkTab={topTab === "bookmarks"}
            />
          </TabsContent>
        </Tabs>

        {selectedMonument && (
          <MonumentDetailModal
            open={open}
            onClose={async () => {
              setOpen(false);
              await refreshAll(); // 🔥 reload list on modal close
            }}
            loading={modalLoading || loadingState}
            details={selectedMonument}
            onOpenAnother={handleOpenAnother}
          />
        )}
      </div>
    </div>
  );
}

/* ============================================
        INNER TAB CONTENT (CARDS)
   ============================================ */
function InnerTabs({
  value,
  onChange,
  data,
  totalPages,
  page,
  onPageChange,
  t,
  onOpenMonument,
  onDeleteBookmark,
  onDeleteVisit,
  isBookmarkTab,
  onDeleteUserTour,
}: any) {
  const hasData = data.length > 0;
  const isMonument = value === "monuments";

  return (
    <Tabs
      value={value}
      onValueChange={(v) => {
        onChange(v as any);
        onPageChange(1);
      }}
      className="space-y-6"
    >
      <div className="flex justify-center">
        <TabsList className="mx-auto flex w-[420px] max-w-full items-center justify-center rounded-full bg-muted/50 p-1 shadow ring-1 ring-border">
          <TabsTrigger value="monuments" className="cursor-pointer">
            <Landmark className="mr-2 h-4 w-4" /> {t("Monuments")}
          </TabsTrigger>
          <TabsTrigger value="tours" className="cursor-pointer">
            <Compass className="mr-2 h-4 w-4" /> {t("Tours")}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value={value}>
        {!hasData ? (
          <EmptyState
            icon={
              isMonument ? (
                <Landmark className="h-8 w-8" />
              ) : (
                <Compass className="h-8 w-8" />
              )
            }
            title={isMonument ? t("no_monuments_found") : t("no_tours_found")}
            subtitle={
              isMonument
                ? t("bookmark_or_visit_monuments_to_see_them_here")
                : t("bookmark_or_visit_tours_to_see_them_here")
            }
          />
        ) : (
          <>
            <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {data.map((item: any, idx: number) =>
                isMonument ? (
                  <MonumentCard
                    key={`mon-${item._id}-${idx}`}
                    m={item}
                    onOpen={onOpenMonument}
                    onDeleteBookmark={onDeleteBookmark}
                    onDeleteVisit={onDeleteVisit}
                    isBookmarkTab={isBookmarkTab}
                  />
                ) : (
                  <TourCard
                    key={`tour-${item._id}-${idx}`}
                    t={item}
                    onDeleteBookmark={onDeleteBookmark}
                    onDeleteVisit={onDeleteVisit}
                    isBookmarkTab={isBookmarkTab}
                    onDeleteUserTour={onDeleteUserTour}
                  />
                ),
              )}
            </div>

            <PageNavigator
              totalPages={totalPages}
              page={page}
              onPageChange={onPageChange}
              t={t}
            />
          </>
        )}
      </TabsContent>
    </Tabs>
  );
}

/* ============================================
        MONUMENT CARD WITH DELETE ICON
   ============================================ */
function MonumentCard({
  m,
  onOpen,
  onDeleteBookmark,
  onDeleteVisit,
  isBookmarkTab,
}: any) {
  const { t } = useLocale();

  return (
    <div
      className="group relative flex flex-col h-full p-3 rounded-[3rem] bg-white dark:bg-[#0a0a0a] border border-slate-100 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-700 cursor-pointer"
      onClick={() => onOpen(m._id)}
    >
      {/* 🖼️ Premium Inset Image Container */}
      <div className="relative h-[280px] w-full rounded-[2.2rem] overflow-hidden bg-slate-50 dark:bg-zinc-900 shrink-0 border border-slate-50 dark:border-white/5">
        {m.image ? (
          <img
            src={m.image}
            alt={m.name}
            className="block h-full w-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-10 w-10 text-slate-300 dark:text-zinc-700" />
          </div>
        )}

        {/* DELETE BUTTON - Top Right */}
        <button
          className="cursor-pointer absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-md text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm border border-white/20"
          onClick={(e) => {
            e.stopPropagation();
            isBookmarkTab
              ? onDeleteBookmark(m.bookmarkId)
              : onDeleteVisit(m.visitId);
          }}
          title={t("delete") || "Delete"}
        >
          <Trash2 className="h-4 w-4" />
        </button>

        {/* Ambient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* ✍️ Content Area */}
      <div className="flex-1 px-8 py-9 flex flex-col min-h-0 bg-transparent">
        <div className="flex-1 space-y-4">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white line-clamp-2 font-serif italic tracking-tight leading-tight">
            {m.name}
          </h3>

          {m.description && (
            <p className="text-sm text-slate-500 dark:text-white/40 line-clamp-3 leading-relaxed font-light">
              {m.description}
            </p>
          )}
        </div>

        {/* Architectural Full-Width Action */}
        <div className="mt-8 pt-7 border-t border-slate-50 dark:border-white/5">
          <div className="flex items-center justify-between group/link">
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.25em] transition-colors duration-300">
              {t("Details")}
            </span>
            <div className="flex-1 mx-4 h-px bg-slate-100 dark:bg-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-slate-900 dark:bg-white -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-900 dark:text-white transform transition-transform duration-500 ease-out group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================
        TOUR CARD WITH DELETE ICON
   ============================================ */
function TourCard({
  t: tour,
  onDeleteBookmark,
  onDeleteVisit,
  isBookmarkTab,
  onDeleteUserTour,
}: any) {
  const { t: tr } = useLocale();

  return (
    <div className="group relative flex flex-col h-full p-3 rounded-[3rem] bg-white dark:bg-[#0a0a0a] border border-slate-100 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-700 cursor-pointer">
      {/* 🖼️ Premium Inset Image Container */}
      <div className="relative h-[280px] w-full rounded-[2.2rem] overflow-hidden bg-slate-50 dark:bg-zinc-900 shrink-0 border border-slate-50 dark:border-white/5">
        {/* Main Image */}
        {tour.image ? (
          <img
            src={tour.image}
            alt={tour.title}
            className="block h-full w-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-10 w-10 text-slate-300 dark:text-zinc-700" />
          </div>
        )}

        {/* DELETE BUTTON */}
        <button
          className="cursor-pointer absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-md text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm border border-white/20"
          onClick={(e) => {
            e.stopPropagation();
            if (isBookmarkTab) {
              onDeleteBookmark(tour.bookmarkId);
            } else {
              onDeleteUserTour(tour.visitId);
            }
          }}
          title={tr("delete") || "Delete"}
        >
          <Trash2 className="h-4 w-4" />
        </button>

        {/* STATUS OVERLAYS */}
        {(tour.status === "pause" || tour.status === "start") && (
          <div className="absolute top-4 left-4 z-20">
            <div className="flex items-center gap-2 rounded-full bg-black/70 backdrop-blur-md px-3 py-1.5 text-white shadow-lg border border-white/10">
              <PlayCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {tr("in_progress")}
              </span>
            </div>
          </div>
        )}
        {tour.status === "end" && (
          <div className="absolute top-4 left-4 z-20">
            <div className="flex items-center gap-2 rounded-full bg-emerald-600/90 backdrop-blur-md px-3 py-1.5 text-white shadow-lg border border-white/10">
              <CheckCircle className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {tr("completed")}
              </span>
            </div>
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

          {tour.description && (
            <p className="text-sm text-slate-500 dark:text-white/40 line-clamp-3 leading-relaxed font-light">
              {tour.description}
            </p>
          )}
        </div>

        {/* Action Bar */}
        <div className="mt-8 pt-7 border-t border-slate-50 dark:border-white/5 space-y-4">
          {/* Default Action */}
          <Link
            href={`/tours/detail?id=${encodeURIComponent(tour._id)}`}
            className="flex items-center justify-between group/link w-full"
          >
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.25em] transition-colors duration-300">
              {tr("Details")}
            </span>
            <div className="flex-1 mx-4 h-px bg-slate-100 dark:bg-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-slate-900 dark:bg-white -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-900 dark:text-white transform transition-transform duration-500 ease-out group-hover:translate-x-1" />
          </Link>

          {/* Secondary Action: History (If Completed) */}
          {tour.status === "end" && !isBookmarkTab && (
            <div className="flex justify-end">
              <Link
                target="_blank"
                href={`/tours/history/finish?visitId=${encodeURIComponent(
                  tour.visitId,
                )}&tourId=${encodeURIComponent(tour._id)}`}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 hover:text-teal-500 transition-colors"
              >
                <span>{tr("buttons.history") || "History"}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================
        PAGINATION
   ============================================ */
function PageNavigator({
  totalPages,
  page,
  onPageChange,
  t,
}: {
  totalPages: number;
  page: number;
  onPageChange: (n: number) => void;
  t: any;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3 pt-6">
      {/* PAGE INFO */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {t("pagination_left", { current: page, total: totalPages })}
      </div>

      <div className="flex items-center gap-1">
        {/* PREV */}
        <Button
          variant="ghost"
          size="sm"
          className="
            cursor-pointer h-8
            text-teal-600 dark:text-teal-400
            hover:bg-teal-50 dark:hover:bg-teal-900/30
          "
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          ‹ {t("tours.prev")}
        </Button>

        {/* PAGE NUMBERS */}
        <div className="hidden md:flex items-center gap-1">
          {rangeAround(page, totalPages, 2).map((n, i) =>
            n === "…" ? (
              <span
                key={`dots-${i}`}
                className="px-2 text-sm text-gray-400 dark:text-gray-500"
              >
                …
              </span>
            ) : (
              <button
                key={`page-${n}-${i}`}
                onClick={() => onPageChange(n)}
                className={`cursor-pointer h-8 min-w-8 rounded-md px-2 text-sm transition-all
                  ${n === page
                    ? "bg-gradient-to-r from-teal-500 via-teal-500 to-teal-500 text-white shadow-sm"
                    : `
                        text-teal-600 dark:text-teal-400
                        hover:bg-teal-50 dark:hover:bg-teal-900/30
                      `
                  }
                `}
              >
                {n}
              </button>
            ),
          )}
        </div>

        {/* NEXT */}
        <Button
          variant="ghost"
          size="sm"
          className="
            cursor-pointer h-8
            text-teal-600 dark:text-teal-400
            hover:bg-teal-50 dark:hover:bg-teal-900/30
          "
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          {t("tours.next")} ›
        </Button>
      </div>
    </div>
  );
}

function rangeAround(
  current: number,
  total: number,
  radius: number,
): (number | "…")[] {
  const out: (number | "…")[] = [];
  const start = Math.max(1, current - radius);
  const end = Math.min(total, current + radius);
  if (start > 1) {
    out.push(1);
    if (start > 2) out.push("…");
  }
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total) {
    if (end < total - 1) out.push("…");
    out.push(total);
  }
  return out;
}

function EmptyState({ icon, title, subtitle }: any) {
  return (
    <div className="grid place-items-center rounded-3xl border bg-gradient-to-br from-sky-50 to-cyan-100 dark:from-gray-900/50 dark:to-gray-800/50 p-10 text-center shadow-inner">
      <div className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-r from-teal-500 via-teal-500 to-teal-500 text-white shadow">
        {icon}
      </div>
      <div className="text-base font-semibold text-gray-800 dark:text-white">
        {title}
      </div>
      <div className="mt-1 max-w-md text-xs text-gray-600 dark:text-gray-400">
        {subtitle}
      </div>
    </div>
  );
}
