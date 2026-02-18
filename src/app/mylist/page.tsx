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
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl  bg-white dark:bg-[#15191f] border border-slate-200/80 dark:border-slate-700/60 shadow-md hover:shadow-xl">
      {/* DELETE BUTTON */}
      <button
        className="cursor-pointer absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow hover:bg-red-600 z-20"
        onClick={() =>
          isBookmarkTab
            ? onDeleteBookmark(m.bookmarkId)
            : onDeleteVisit(m.visitId)
        }
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {/* IMAGE */}
      <div className="relative h-48 w-full overflow-hidden">
        {m.image ? (
          <img
            src={m.image}
            alt={m.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-muted text-muted-foreground">
            <ImageIcon className="h-8 w-8 text-slate-400 dark:text-slate-600" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h3 className="line-clamp-1 text-base font-semibold text-teal-700 dark:text-teal-300">
            {m.name}
          </h3>
          {m.description && (
            <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
              {m.description}
            </p>
          )}
        </div>

        <Button
          className="cursor-pointer mt-3 h-9 rounded-lg bg-gradient-to-r from-teal-500 via-teal-500 to-teal-500 text-white hover:opacity-90"
          onClick={() => onOpen(m._id)}
        >
          {t("Details")}
        </Button>
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
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl  bg-white dark:bg-[#15191f] border border-slate-200/80 dark:border-slate-700/60 shadow-md hover:shadow-xl">
      {/* DELETE BUTTON */}
      <button
        className="cursor-pointer absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow hover:bg-red-600 z-20"
        onClick={() => {
          if (isBookmarkTab) {
            onDeleteBookmark(tour.bookmarkId);
          } else {
            onDeleteUserTour(tour.visitId); // ✅ FIXED
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <div className="relative h-48 w-full overflow-hidden">
        {tour.image ? (
          <img
            src={tour.image}
            alt={tour.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-muted text-muted-foreground">
            <ImageIcon className="h-8 w-8 text-slate-400 dark:text-slate-600" />
          </div>
        )}

        {/* ⏸ PAUSE OVERLAY */}
        {/* ⏸ PAUSE / IN-PROGRESS OVERLAY */}
        {(tour.status === "pause" || tour.status === "start") && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-white shadow-lg">
              <PlayCircle className="h-6 w-6" />
              <span className="text-sm font-medium">
                {tr("in_progress")}
              </span>
            </div>
          </div>
        )}
        {/* ✅ COMPLETED OVERLAY */}
        {tour.status === "end" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="flex items-center gap-2 rounded-full bg-emerald-600/80 px-4 py-2 text-white shadow-lg">
              <CheckCircle className="h-6 w-6" />
              <span className="text-sm font-bold">
                {tr("completed")}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
        <div>
          <h3 className="line-clamp-1 text-base font-semibold text-teal-700 dark:text-teal-300">
            {tour.title}
          </h3>
          {tour.description && (
            <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
              {tour.description}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {/* === COMPLETED TOURS: Details + History === */}
          {tour.status === "end" && (
            <>
              <Button
                asChild
                className="cursor-pointer h-9 flex-1 rounded-lg bg-gradient-to-r from-teal-500 via-teal-500 to-teal-500 text-white hover:opacity-90"
              >
                <Link href={`/tours/detail?id=${encodeURIComponent(tour._id)}`}>
                  {tr("Details")}
                </Link>
              </Button>

              {!isBookmarkTab && (
                <Button
                  asChild
                  variant="outline"
                  className="cursor-pointer h-9 flex-1 rounded-lg border-teal-500 text-teal-600 dark:text-teal-400 dark:border-teal-400 hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-900/20 dark:hover:text-teal-400"
                >
                  <Link
                    target="_blank"
                    href={`/tours/history/finish?visitId=${encodeURIComponent(
                      tour.visitId
                    )}&tourId=${encodeURIComponent(tour._id)}`}
                  >
                    {tr("buttons.history") || "History"}
                  </Link>
                </Button>
              )}
            </>
          )}

          {/* === IN-PROGRESS TOURS: Only Details === */}
          {tour.status !== "end" && (
            <Button
              asChild
              className="cursor-pointer h-9 flex-1 rounded-lg bg-gradient-to-r from-teal-500 via-teal-500 to-teal-500 text-white hover:opacity-90"
            >
              <Link href={`/tours/detail?id=${encodeURIComponent(tour._id)}`}>
                {tr("Details")}
              </Link>
            </Button>
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
