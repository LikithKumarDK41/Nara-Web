"use client";

import React, { useEffect, useCallback, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { useGlobalLoader } from "@/providers/LoaderProvider";
import { useLocale } from "@/providers/LocaleProvider";
import { useAppDispatch, useAppSelector } from "@/lib/store/hook";

import { Button } from "@/components/ui/button";
import MapboxTourMap from "@/components/map/MapboxTourMap";
import TimelineRight from "@/components/tour/TimelineRight";

// ⭐ DIRECT API IMPORT — for this page's tour data
import {
  apiFetchTourById,
  apiFetchTourPoints,
} from "@/services/userTourService";

import {
  apiCreateBookmark,
  apiRemoveBookmark,
  apiFetchBookmarkByRef,
} from "@/services/userGlobalservice";

import { getPersistedUser } from "@/services/userAuthService";

// ⭐ Redux slice used ONLY for navigation flow
import {
  fetchTourById as fetchTourByIdForNav,
  fetchTourPoints as fetchTourPointsForNav,
} from "@/lib/store/slices/touristSlice";
import { resetAll, selectNav } from "@/lib/store/slices/navSlice";

import { resetAll as geofenceReset } from "@/lib/store/slices/geofenceSlice";
import { resetTourist } from "@/lib/store/slices/touristSlice";

export default function TourDetailsClientPage() {
  const { t, locale } = useLocale();
  const persisted = getPersistedUser();
  const userId = persisted?.user?._id ?? null;

  const router = useRouter();
  const sp = useSearchParams();
  const id = sp.get("id") ?? "";
  const dispatch = useAppDispatch();
  const { show, hide } = useGlobalLoader();

  // ⭐ nav slice (for current running usertour)
  const nav = useAppSelector(selectNav);

  // ⭐ Local tour state (for this details page)
  const [tour, setTour] = useState<any>(null);

  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkCheckLoading, setBookmarkCheckLoading] = useState(true);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);

  // Popup state when a different tour is already running
  const [showDifferentTourPopup, setShowDifferentTourPopup] = useState(false);

  interface BookmarkItem {
    _id: string;
    marktype: "tour" | "monument";
    status: string;
    tour?: { _id: string };
    monument?: { _id: string };
  }

  /* ----------------------------
     BOOKMARK CHECK
  ---------------------------- */
  useEffect(() => {
    /*------
  Before auth changes
  ----------*/
    // if (!id || !userId) return;

    /*------
  After auth changes
  ----------*/
    if (!id || !userId) {
      setBookmarkCheckLoading(false);
      setBookmarked(false);
      setBookmarkId(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await apiFetchBookmarkByRef();
        if (cancelled) return;

        let bookmark: BookmarkItem | null = null;

        // Case 1: list => bookmarks.results
        if (Array.isArray((res as any)?.bookmarks?.results)) {
          bookmark =
            (res as any).bookmarks.results.find(
              (b: BookmarkItem) =>
                b.marktype === "tour" &&
                b.tour?._id === id &&
                b.status === "active"
            ) || null;
        }
        // Case 2: direct bookmark
        else if ((res as any)?.tour?._id === id || (res as any)?._id) {
          bookmark = res as BookmarkItem;
        }

        const bmId =
          bookmark?._id ||
          (bookmark as any)?.data?._id ||
          (bookmark as any)?.bookmark?._id ||
          null;

        setBookmarked(!!bmId);
        setBookmarkId(bmId);
      } catch (err) {
        console.error("Bookmark fetch failed:", err);
        if (!cancelled) {
          setBookmarked(false);
          setBookmarkId(null);
        }
      } finally {
        if (!cancelled) {
          setTimeout(() => setBookmarkCheckLoading(false), 400);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, userId]);

  /* ----------------------------
     Redirect if ID missing
  ---------------------------- */
  useEffect(() => {
    if (!id) router.replace("/tours");
  }, [id, router]);

  /* ----------------------------
     FETCH TOUR (DIRECT API)
  ---------------------------- */
  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    (async () => {
      try {
        const data = await apiFetchTourById(id);
        if (!cancelled) setTour(data);
      } catch (err) {
        console.error("apiFetchTourById failed:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, locale]);

  /* ----------------------------
     FETCH TOUR POINTS (DIRECT API)
  ---------------------------- */
  useEffect(() => {
    if (!id || !tour || tour.tourpoints?.length) return;

    let cancelled = false;

    (async () => {
      try {
        const points = await apiFetchTourPoints(id);
        if (!cancelled) {
          setTour((prev: any) => ({
            ...prev,
            tourpoints: points,
          }));
        }
      } catch (err) {
        console.error("apiFetchTourPoints failed:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, tour]);

  /* ----------------------------
     Jump to Timeline
  ---------------------------- */
  const onJumpTimeline = useCallback((e: any) => {
    e.preventDefault();
    document.getElementById("timeline")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  /* ----------------------------
     TOGGLE BOOKMARK
  ---------------------------- */
  const toggleBookmark = async () => {
    if (!userId) {
      toast.error(t("login_bookmark"));
      return;
    }
    if (!id) return;

    try {
      if (bookmarked && bookmarkId) {
        await apiRemoveBookmark(bookmarkId);
        setBookmarked(false);
        setBookmarkId(null);
        toast.info(t("bookmark_removed"));
        return;
      }

      const payload = {
        user: userId,
        marktype: "tour",
        tour: id,
        status: "active",
      };

      const created: any = await apiCreateBookmark(payload);

      const newId =
        created?._id || created?.data?._id || created?.bookmark?._id || null;

      setBookmarked(true);
      setBookmarkId(newId);
      toast.success(t("bookmark_added"));
    } catch (err) {
      console.error("Bookmark toggle failed:", err);
      toast.error(t("failed_to_update_bookmark"));
    }
  };

  /* ----------------------------
     Loader visibility
  ---------------------------- */
  /*------
  Before auth changes
  ----------*/
  // useEffect(() => {
  //   if (!bookmarkCheckLoading && tour) hide();
  //   else show();
  // }, [bookmarkCheckLoading, tour, show, hide]);
  /*------
  After auth changes
  ----------*/
  useEffect(() => {
    // 🔑 If user is NOT logged in, ignore bookmark loading
    if (!userId) {
      if (tour) hide();
      else show();
      return;
    }

    // Logged-in user: wait for bookmark + tour
    if (!bookmarkCheckLoading && tour) hide();
    else show();
  }, [userId, bookmarkCheckLoading, tour, show, hide]);

  /* ----------------------------
     HELPERS FOR NAVIGATION FLOW
  ---------------------------- */
  const navigateToTour = useCallback(() => {
    router.push(`/tours/detail/navigation?id=${encodeURIComponent(id)}`);
  }, [router, id]);

  const startFreshTourFlow = useCallback(async () => {
    // Reset in correct order
    dispatch(resetTourist());
    dispatch(geofenceReset());
    dispatch(resetAll());

    try {
      await dispatch(fetchTourByIdForNav(id)).unwrap();
    } catch (err) {
      console.error("fetchTourByIdForNav failed:", err);
    }

    try {
      await dispatch(fetchTourPointsForNav(id)).unwrap();
    } catch (err) {
      console.error("fetchTourPointsForNav failed:", err);
    }

    navigateToTour();
  }, [dispatch, id, navigateToTour]);

  const confirmStartDifferentTour = useCallback(async () => {
    setShowDifferentTourPopup(false);
    await startFreshTourFlow();
  }, [startFreshTourFlow]);

  /* ----------------------------
     START NAVIGATION BUTTON HANDLER
  ---------------------------- */
  const handleStartNavigation = useCallback(async () => {
    if (!id) return;

    const localUsertour = nav.usertour;
    const localUsertourId = localUsertour?._id ?? null;
    const localTourId =
      typeof localUsertour?.tour === "string"
        ? localUsertour.tour
        : localUsertour?.tour?._id ?? null;

    try {
      show();

      // 1️⃣ NO LOCAL TOUR → start new tour directly
      if (!localUsertourId) {
        await startFreshTourFlow();
        return;
      }

      // 2️⃣ SAME TOUR → just navigate
      if (localTourId === id) {
        navigateToTour();
        return;
      }

      // 3️⃣ DIFFERENT TOUR → show confirmation popup
      setShowDifferentTourPopup(true);
      return;
    } catch (err) {
      console.error("handleStartNavigation error:", err);
      toast.error(t("failed_to_start_navigation"));
    } finally {
      hide();
    }
  }, [id, nav.usertour, show, hide, startFreshTourFlow, navigateToTour, toast]);

  /* -------------------- shimmer (fallback) -------------------- */
  if (!id || !tour) {
    return (
      <div className="space-y-12">
        {/* Banner shimmer */}
        <div className="relative h-[420px] sm:h-[480px] w-full overflow-hidden rounded-2xl shadow-md">
          <div className="animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 absolute inset-0" />
        </div>

        {/* Floating card shimmer */}
        <div className="relative z-10 flex justify-center -mt-24">
          <div className="w-[90%] sm:w-[80%] max-w-4xl h-[320px] rounded-3xl overflow-hidden animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 shadow-[0_8px_40px_-10px_rgba(0,0,0,0.4)]" />
        </div>

        {/* Map shimmer */}
        <div className="space-y-4">
          <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-[420px] rounded-lg border animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800" />
        </div>
      </div>
    );
  }

  /* -------------------- UI -------------------- */
  return (
    <>
      {/* ===== Different Tour Popup ===== */}
      {showDifferentTourPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t("tourDetails.differentTourTitle") || "Start a different tour?"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              {t("tourDetails.differentTourMessage") ||
                "You already have another tour in progress. Do you want to stop it and start this tour instead?"}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                className="cursor-pointer border-gray-300 dark:border-gray-600"
                onClick={() => setShowDifferentTourPopup(false)}
              >
                {t("actions.cancel")}
              </Button>
              <Button
                className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={confirmStartDifferentTour}
              >
                {t("tourDetails.startNewTour")}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-12">
        {/* ===== Banner ===== */}
        <section className="relative rounded-2xl overflow-hidden shadow-md">
          {/* Banner Image */}
          <div className="relative h-[420px] sm:h-[480px] w-full">
            {tour.image?.secure_url ? (
              <img
                src={tour.image.secure_url}
                alt={tour.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-indigo-300 dark:from-gray-800 dark:to-gray-700" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
          </div>

          <button
            onClick={toggleBookmark}
            aria-label="Bookmark tour"
            className="absolute right-6 top-6 z-10 flex items-center justify-center rounded-full 
               bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition 
               backdrop-blur-md shadow"
          >
            {bookmarked ? (
              <BookmarkCheck className="h-8 w-8 text-amber-300 dark:text-amber-300 cursor-pointer" />
            ) : (
              <Bookmark className="h-8 w-8 text-white cursor-pointer" />
            )}
          </button>

          {/* Title + Subtitle */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
            <h1 className="text-4xl sm:text-5xl font-bold drop-shadow-lg">
              {tour.title}
            </h1>
            {tour.content?.brief && (
              <p className="mt-4 text-sm sm:text-base text-gray-200 max-w-2xl mx-auto leading-relaxed">
                {tour.content.brief.replace(/<[^>]+>/g, "").trim()}
              </p>
            )}
          </div>
        </section>

        {/* ===== Floating Info Card ===== */}
        <section className="relative z-10 flex justify-center px-4">
          <div
            className="
      relative -mt-24 w-full max-w-5xl overflow-hidden rounded-[2.5rem]
      bg-gradient-to-b
        from-orange-50/80 via-white/70 to-amber-50/80
        dark:from-[#1a0f08]/90 dark:via-[#120a06]/95 dark:to-[#1a0f08]/90
      backdrop-blur-2xl
      border border-orange-200/40 dark:border-orange-500/20
      shadow-[0_25px_80px_-25px_rgba(251,146,60,0.45)]
    "
          >
            {/* 🌊 Top Wave */}
            <svg
              className="absolute top-0 left-0 w-full text-orange-400/20 dark:text-orange-500/20"
              viewBox="0 0 500 60"
              preserveAspectRatio="none"
            >
              <path
                d="M0,0 C150,70 350,-30 500,50 L500,0 L0,0 Z"
                fill="currentColor"
              />
            </svg>

            {/* 🌊 Bottom Wave */}
            <svg
              className="absolute bottom-0 left-0 w-full rotate-180 text-orange-400/20 dark:text-orange-500/20"
              viewBox="0 0 500 60"
              preserveAspectRatio="none"
            >
              <path
                d="M0,0 C150,70 350,-30 500,50 L500,0 L0,0 Z"
                fill="currentColor"
              />
            </svg>

            {/* CONTENT */}
            <div className="relative px-8 sm:px-14 py-14 text-center">
              {/* 🔢 STATS */}
              <div className="flex flex-wrap justify-center gap-12 mb-10">
                {[
                  {
                    value: tour.tourpoints?.length ?? 0,
                    label: t("tourDetails.stops"),
                  },
                  { value: tour.duration, label: t("tourDetails.duration") },
                  {
                    value: tour.traveltime,
                    label: t("tourDetails.travelTime"),
                  },
                ].map(
                  (item, i) =>
                    item.value && (
                      <div key={i} className="flex flex-col items-center">
                        <div
                          className="
                    h-16 w-16 rounded-full flex items-center justify-center
                    bg-gradient-to-br from-orange-400/30 to-yellow-400/30
                    border border-orange-400/40
                    shadow-inner shadow-orange-400/20
                    text-orange-600 dark:text-orange-300
                    text-lg font-semibold
                  "
                        >
                          {item.value}
                        </div>
                        <span className="mt-3 text-xs tracking-wide text-gray-600 dark:text-gray-200">
                          {item.label}
                        </span>
                      </div>
                    )
                )}
              </div>

              {/* 🚀 CTA */}
              <div className="flex flex-wrap justify-center gap-5">
                <button
                  onClick={handleStartNavigation}
                  className="cursor-pointer
            px-8 py-3 rounded-full
            bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500
            text-white font-semibold
            transition-all hover:scale-[1.06]
          "
                >
                  {t("tourDetails.startNavigation")}
                </button>

                <button
                  onClick={onJumpTimeline}
                  className="cursor-pointer
            px-8 py-3 rounded-full
            border border-orange-400/60
            text-orange-600 dark:text-orange-300
            hover:bg-orange-100/40 dark:hover:bg-orange-900/40
            backdrop-blur-md
            font-semibold
            transition-all hover:scale-[1.05]
          "
                >
                  {t("tourDetails.jumpToTimeline")}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Map Section ===== */}
        {tour.tourpoints?.length ? (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">{t("tourDetails.map")}</h2>
            <Suspense
              fallback={
                <div className="h-[420px] rounded-lg border animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800" />
              }
            >
              <MapboxTourMap tour={tour} profile="walking" />
            </Suspense>
          </section>
        ) : (
          <div className="space-y-4">
            <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-[420px] rounded-lg border animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800" />
          </div>
        )}

        {/* ===== Timeline Section ===== */}
        {tour.tourpoints?.length && (
          <section id="timeline" className="space-y-4">
            <h2 className="text-lg font-semibold">
              {t("tourDetails.timeline")}
            </h2>
            <br />
            <TimelineRight
              tourpoints={tour.tourpoints}
              tour_id={id}
              customStyle="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:opacity-90
                text-white font-semibold shadow-md hover:shadow-xl transition-all"
            />
          </section>
        )}
      </div>
    </>
  );
}
