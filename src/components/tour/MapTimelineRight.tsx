"use client";

import { useState, useEffect, useMemo, Fragment } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/lib/store";
import { fetchMonumentDetails } from "@/lib/store/slices/touristSlice";
import {
  type TourPoint,
  type Monument,
  type TravelMode,
} from "@/lib/types/userTour.types";
import { Button } from "@/components/ui/button";
import {
  ImageIcon,
  MapPin,
  Footprints,
  Train,
  Car,
  UtensilsCrossed,
} from "lucide-react";
import { useLocale } from "@/providers/LocaleProvider";
import { useGlobalLoader } from "@/providers/LoaderProvider";
import MonumentDetailModal from "@/components/tour/MonumentDetailModal";
import { getPersistedUser } from "@/services/userAuthService";
import { toast } from "sonner";
import { apiCreateVisitHistory } from "@/services/myListService";
import { apiCreateStamp } from "@/services/userNavService";
import type { VisitHistoryPayload } from "@/services/myListService";
import { getCurrentLocation } from "@/lib/gpsWatcher";

/* ------------------------------------------------------------------ */
export default function MapTimelineRight({
  tourpoints,
  customStyle,
  onRefreshTourpoints,
}: {
  tourpoints: TourPoint[];
  customStyle?: string;
  onRefreshTourpoints?: () => Promise<void>;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useLocale();
  const { show, hide } = useGlobalLoader();
  const persisted = getPersistedUser();
  const userId = persisted?.user?._id ?? null;

  const loading = useSelector((s: any) => s.tourist.loading);
  const monumentDetail = useSelector((s: any) => s.tourist.monumentDetail);

  const [openId, setOpenId] = useState<string | null>(null);
  const [activeMonument, setActiveMonument] = useState<Monument | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [distancePopup, setDistancePopup] = useState<{
    show: boolean;
    distance?: number;
    required?: number;
  }>({
    show: false,
  });

  const hasStart = tourpoints.some((tp) => tp.waypointtype === "start");

  const active = useMemo(
    () => tourpoints.find((p) => p._id === openId) ?? null,
    [openId, tourpoints]
  );

  /* -------------------- Load bookmarks -------------------- */
  useEffect(() => {
    if (loading) show();
    else hide();
  }, [loading, show, hide]);

  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 600);
    return () => clearTimeout(timer);
  }, [tourpoints]);

  const handleOpen = async (id: string) => {
    setOpenId(id);
    const point = tourpoints.find((p) => p._id === id);
    const targetId = point?.monument?._id || id;
    if (!targetId) return;

    setModalLoading(true);
    try {
      const thunk = dispatch(fetchMonumentDetails(targetId));
      const data = await thunk.unwrap();
      setActiveMonument(data);
    } catch (err) {
      console.error("Failed to fetch monument:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const details =
    activeMonument && monumentDetail?._id === activeMonument._id
      ? monumentDetail
      : activeMonument ?? active?.monument;

  const formatMinutes = (
    value?: string | number,
    t?: (key: string) => string
  ) => {
    if (!value) return null;

    // Extract number from "10", "10 min", "10分"
    const minutes = String(value).match(/\d+/)?.[0];
    if (!minutes) return value;

    return `${minutes} ${t ? t("time.min") : "min"}`;
  };

  /* -------------------- Loading Skeleton -------------------- */
  if (initialLoading) {
    return (
      <div className="relative mx-auto w-full max-w-6xl animate-pulse">
        <div className="absolute left-[52px] top-0 bottom-0 w-[3px] bg-orange-300 rounded-full" />
        <ul className="space-y-16 md:space-y-20">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="grid grid-cols-[90px_1fr] gap-6 items-start">
              <div className="relative h-full w-[90px]">
                <div className="absolute left-[52px] top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="h-14 w-14 rounded-full bg-gray-300 dark:bg-gray-700 ring-4 ring-white/70 dark:ring-gray-800" />
                </div>
              </div>
              <div className="col-start-2 w-full h-64 rounded-2xl bg-gray-200/60 dark:bg-gray-800/50 shadow-sm" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  return (
    <>
      <div className="relative mx-auto w-full max-w-6xl">
        <div className="absolute left-[52px] top-0 bottom-0 w-[3px] bg-gradient-to-b from-orange-500 via-orange-400 to-orange-600 rounded-full" />

        <ul className="space-y-16 md:space-y-20">
          {tourpoints.map((p, i) => {
            const accent = dynamicColor(i, p.waypointtype);
            const next = tourpoints[i + 1];

            /* -------------------- START / END STATION -------------------- */
            if (
              (p.waypointtype === "start" || p.waypointtype === "end") &&
              p.pointtype === "station"
            ) {
              const colorClass =
                p.waypointtype === "start"
                  ? "bg-green-500 ring-green-300"
                  : "bg-red-500 ring-red-300";
              const hideTop = p.waypointtype === "start";
              const hideBottom = p.waypointtype === "end";
              const travelTitle =
                p.traveltype?.title || capitalize(p.traveltype?.name) || "";

              return (
                <Fragment key={p._id}>
                  <li
                    className={`grid grid-cols-[90px_1fr] gap-1 ${
                      hideBottom ? "pb-8" : "md:pb-10 pb-0"
                    }`}
                  >
                    <div className="relative h-full w-[90px]">
                      <div
                        className={`absolute left-[52px] w-[3px] bg-orange-500 ${
                          hideTop ? "top-[50%]" : "top-0"
                        } ${hideBottom ? "bottom-[50%]" : "bottom-0"}`}
                      />
                      <div className="absolute left-[52px] top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div
                          className={`grid h-14 w-14 place-items-center rounded-full text-white shadow-lg ring-4 ${colorClass}`}
                        >
                          <span className="text-lg font-bold">
                            {p.waypointtype === "start" ? "S" : "E"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center mt-1">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-50 leading-tight">
                        {p.pointtitle ||
                          (p.waypointtype === "start"
                            ? "Start Station"
                            : "End Station")}
                      </h3>
                      {/* {travelTitle && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("travel_mode")}: {travelTitle}
                        </p>
                      )}
                      {p.traveltime !== "" &&
                        p.traveltime !== null &&
                        p.traveltime !== undefined && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t("duration")}: {p.traveltime}
                          </p>
                        )}

                      {p.starttime && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("startTime")}: {p.starttime}
                        </p>
                      )} */}
                    </div>
                  </li>

                  {/* {next && (
                    <li className="hidden md:flex items-center gap-2 ml-[78px] mt-3 text-gray-600 dark:text-gray-300">
                      <TravelConnector
                        info={next.traveltype}
                        time={next.traveltime}
                        next={next}
                      />
                    </li>
                  )} */}
                </Fragment>
              );
            }

            /* -------------------- LUNCH -------------------- */
            if (p.pointtype === "lunch") {
              return (
                <Fragment key={p._id}>
                  <li className="grid grid-cols-[90px_1fr] gap-1 items-start">
                    <TimelineDot
                      index={i}
                      accent={accent}
                      waypointtype={p.waypointtype}
                      hasStart={hasStart}
                    />
                    <div className="col-start-2 p-6 rounded-2xl bg-yellow-50 dark:bg-zinc-800 border border-yellow-200 dark:border-zinc-700 shadow-sm">
                      <div className="flex items-center gap-3">
                        <UtensilsCrossed className="h-6 w-6 text-orange-500" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                          🍱 {p.name || t("lunch_break")}
                        </h3>
                      </div>
                      {p.traveltime && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                          {t("duration")}: {p.traveltime}
                        </p>
                      )}
                    </div>
                  </li>

                  {/* {next && (
                    <li className="flex items-center gap-2 ml-[78px] mt-3 text-gray-600 dark:text-gray-300">
                      <TravelConnector
                        info={next.traveltype}
                        time={next.traveltime}
                        next={next}
                      />
                    </li>
                  )} */}
                </Fragment>
              );
            }

            /* -------------------- PLAIN STATION (NO START / END) -------------------- */
            if (
              p.pointtype === "station" &&
              p.waypointtype !== "start" &&
              p.waypointtype !== "end"
            ) {
              return (
                <Fragment key={p._id}>
                  <li className="grid grid-cols-[90px_1fr] gap-1 items-start">
                    {/* Timeline dot */}
                    <TimelineDot
                      index={i}
                      accent={accent}
                      waypointtype="station"
                      hasStart={hasStart}
                    />

                    {/* SIMPLE TEXT ONLY */}
                    <div className="col-start-2 flex flex-col gap-1">
                      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                        {p.pointtitle || t("station")}
                      </h3>

                      {/* <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t("travel_mode")}: {t("station")}
                      </p> */}
                    </div>
                  </li>

                  {/* {next && (
                    <li className="hidden md:flex items-center gap-2 ml-[78px] mt-3 text-gray-600 dark:text-gray-300">
                      <TravelConnector
                        info={next.traveltype}
                        time={next.traveltime}
                        next={next}
                      />
                    </li>
                  )} */}
                </Fragment>
              );
            }

            /* -------------------- MONUMENT / PLACE -------------------- */
            const m = p.monument;
            return (
              <Fragment key={p._id}>
                {/* ========================= MOBILE VIEW ========================= */}
                <div className="md:hidden w-full mb-12 relative min-h-[120px]">
                  {/* Timeline Dot (Absolute Left) */}
                  <div className="absolute left-[52px] top-0 -translate-x-1/2 z-10">
                    <div
                      className="grid h-12 w-12 place-items-center rounded-full text-white shadow-lg ring-4 ring-white/70 dark:ring-gray-800"
                      style={{ background: accent }}
                    >
                      <span className="text-sm font-bold">{i}</span>
                    </div>
                  </div>

                  <div className="pl-[88px] pr-4 pt-[2px]">
                    {/* Travel Info - Improved Pills */}
                    {/* <div className="flex flex-wrap items-center gap-3 mb-4 mt-0.5">
                      <div
                        className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800
                  px-3 py-1.5 rounded-full
                  border border-gray-200 dark:border-zinc-700 shadow-sm"
                      >
                        {getTravelIcon(p.traveltype?.name || "walk")}
                        <span
                          className="text-xs font-bold uppercase tracking-wide
                     text-gray-700 dark:text-gray-300"
                        >
                          {t(
                            p.traveltype?.title || p.traveltype?.name || "walk"
                          )}
                        </span>
                      </div>

                      {p.traveltime && (
                        <span
                          className="text-xs font-semibold
               text-orange-600 dark:text-orange-400
               bg-orange-50 dark:bg-orange-900/20
               px-2.5 py-1 rounded-md
               border border-orange-100 dark:border-orange-900/30"
                        >
                          {p.traveltime}
                        </span>
                      )}

                      {(p.starttime || "") && (
                        <span
                          className="flex items-center gap-1.5
                     text-xs font-semibold
                     text-blue-600 dark:text-blue-400
                     bg-blue-50 dark:bg-blue-900/20
                     px-2.5 py-1 rounded-md
                     border border-blue-100 dark:border-blue-900/30"
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6v6l4 2M12 22a10 10 0 100-20 10 10 0 000 20z"
                            />
                          </svg>
                          {p.starttime || ""}
                        </span>
                      )}
                    </div> */}

                    {/* Compact Card */}
                    <div className="relative overflow-visible">
                      {/* Stamp (overlapping) */}
                      {p.stamp && Object.keys(p.stamp).length > 0 && (
                        <div className="absolute -top-2 -right-3 z-[10] pointer-events-none">
                          <img
                            src="/stamp.png"
                            className="w-14 h-14 rounded-full drop-shadow-md"
                            alt={t("checked_in")}
                          />
                        </div>
                      )}
                      <div className="group relative rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md">
                        {/* Image Thumbnail */}
                        <div
                          className="relative h-40 w-full cursor-pointer overflow-hidden"
                          onClick={() => handleOpen(p._id)}
                        >
                          {m?.image?.secure_url ? (
                            <Image
                              src={m.image.secure_url}
                              alt={m.name ?? ""}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
                              <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                          {/* Title Overlay on Image */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
                            <h3 className="text-lg font-bold leading-tight shadow-black drop-shadow-sm mb-1">
                              {m?.title || m?.name || p.name}
                            </h3>
                            {m?.region?.title && (
                              <div className="flex items-center gap-1 text-xs opacity-90 font-medium text-gray-200">
                                <MapPin className="h-3.5 w-3.5" />
                                {m.region.title}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Body: Brief + Action */}
                        <div className="p-4 bg-white dark:bg-zinc-900 border-t dark:border-zinc-800">
                          {/* Brief Description */}
                          {m?.content?.brief && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4 leading-relaxed">
                              {m.content.brief.replace(/<[^>]+>/g, "")}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-3 mt-5">
                            <Button
                              size="sm"
                              className="
    cursor-pointer flex-1 rounded-full
    bg-transparent
    text-amber-700
    hover:bg-amber-500/10
    dark:text-amber-300
    dark:hover:bg-amber-500/20
    font-medium
    border border-amber-500/40
    transition
  "
                              onClick={() => handleOpen(p._id)}
                            >
                              {t("tourDetails.viewDetails")}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="cursor-pointer flex-1 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:opacity-90 text-white flex items-center gap-2"
                              disabled={checkingIn}
                              onClick={async () => {
                                try {
                                  setCheckingIn(true);

                                  /* ------------------------------------------------
                                 1️⃣ Validate User Logged In
                              ------------------------------------------------ */
                                  const user =
                                    persisted?.user?._id ||
                                    persisted?.user?.id ||
                                    persisted?.user?.uuid ||
                                    null;

                                  if (!user) {
                                    toast.error(t("please_signin_to_checkin"));
                                    return;
                                  }

                                  /* ------------------------------------------------
                                 2️⃣ Monument & TourPoint Validation
                              ------------------------------------------------ */
                                  const monumentId = p?.monument?._id;
                                  const tourpointId = p?._id;

                                  if (!monumentId || !tourpointId) {
                                    toast.error(t("invalid_point_checkin"));
                                    return;
                                  }

                                  const m = p.monument;
                                  const radius = m?.georadius ?? 0;

                                  if (!m?.location) {
                                    toast.error(t("monument_location_missing"));
                                    return;
                                  }

                                  /* ------------------------------------------------
                                 3️⃣ Parse Monument Coordinates (array OR object)
                              ------------------------------------------------ */
                                  let monumentLat = 0;
                                  let monumentLng = 0;

                                  if (Array.isArray(m.location)) {
                                    monumentLat = m.location[0];
                                    monumentLng = m.location[1];
                                  } else {
                                    monumentLat = m.location?.lat ?? 0;
                                    monumentLng = m.location?.lng ?? 0;
                                  }

                                  if (!monumentLat || !monumentLng) {
                                    toast.error("invalid_monument_coordinates");
                                    return;
                                  }

                                  /* ------------------------------------------------
                                4️⃣ Get User Live Location with getCurrentLocation helper
                              ----------------------------------------------- */
                                  try {
                                    const location = await getCurrentLocation(
                                      100,
                                      20000,
                                      3
                                    ); // 100m accuracy, 20s timeout, 3 retries
                                    const userLocation = {
                                      lat: location.lat,
                                      lng: location.lng,
                                    };

                                    /* ------------------------------------------------
                                  5️⃣ Calculate Distance (meters)
                                ------------------------------------------------ */
                                    const R = 6371e3;
                                    const dLat =
                                      ((userLocation.lat - monumentLat) *
                                        Math.PI) /
                                      180;
                                    const dLng =
                                      ((userLocation.lng - monumentLng) *
                                        Math.PI) /
                                      180;

                                    const a =
                                      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                      Math.cos((monumentLat * Math.PI) / 180) *
                                        Math.cos(
                                          (userLocation.lat * Math.PI) / 180
                                        ) *
                                        Math.sin(dLng / 2) *
                                        Math.sin(dLng / 2);

                                    const c =
                                      2 *
                                      Math.atan2(
                                        Math.sqrt(a),
                                        Math.sqrt(1 - a)
                                      );
                                    const distance = R * c;

                                    /* ------------------------------------------------
                                   6️⃣ Check if user is within required radius
                                ------------------------------------------------ */
                                    if (distance > radius) {
                                      toast.error(
                                        t("too_far_from_monument") ||
                                          `You need to be within ${radius}m to check in. Current distance: ${Math.round(
                                            distance
                                          )}m`
                                      );
                                      return;
                                    }
                                  } catch (error) {
                                    console.warn("Location error:", error);
                                    toast.error(
                                      t("error_getting_location") ||
                                        "Could not get your location. Please try again."
                                    );
                                    return;
                                  }

                                  /* ------------------------------------------------
                                 8️⃣ Create Visit History
                              ------------------------------------------------ */
                                  const visitPayload: VisitHistoryPayload = {
                                    user: String(user),
                                    historytype: "monument",
                                    monument: String(monumentId),
                                    status: "active",
                                    visitmode: "manual",
                                    historytime: Date.now().toString(),
                                  };

                                  await apiCreateVisitHistory(visitPayload);

                                  /* ------------------------------------------------
                                 9️⃣ Create Stamp
                              ------------------------------------------------ */
                                  await apiCreateStamp({
                                    monument: String(monumentId),
                                    tourpoint: String(tourpointId),
                                    user: String(user),
                                    status: "active",
                                    stamptime: Date.now(),
                                  });

                                  /* ------------------------------------------------
                                 🔟 Success Notification
                              ------------------------------------------------ */
                                  toast.success(
                                    `${t("checked_in_at")} ${
                                      m?.name ?? "location"
                                    }`,
                                    {
                                      description: t("visit_progress_success"),
                                      duration: 5000,
                                    }
                                  );

                                  /* ------------------------------------------------
                                 1️⃣1️⃣ Refresh TourPoints ONLY After Stamp Success
                              ------------------------------------------------ */
                                  if (onRefreshTourpoints) {
                                    await onRefreshTourpoints();
                                  }
                                } catch (err) {
                                  console.error("❌ Check-in failed:", err);
                                  toast.error(t("check_in_failed"));
                                } finally {
                                  setCheckingIn(false);
                                }
                              }}
                            >
                              <MapPin className="h-5 w-5" />
                              {checkingIn
                                ? t("checking_in")
                                : t("tourDetails.checkIn")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <li className="hidden md:grid grid-cols-[90px_1fr] gap-1 items-start">
                  <TimelineDot
                    index={i}
                    accent={accent}
                    waypointtype={p.waypointtype}
                    hasStart={hasStart}
                  />

                  <article className="relative col-start-2 w-full rounded-2xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-lg transition hover:-translate-y-[2px] hover:shadow-xl">
                    {/* For above div parent above the relative rounded-xl removed 'overflow-hidden' classname for 'stamp' related if issue in please add 'overflow-hidden' */}
                    {p.stamp && Object.keys(p.stamp).length > 0 && (
                      <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 z-[2]">
                        <img
                          src="/stamp.png"
                          className="w-16 h-16 rounded-full drop-shadow-xl"
                          alt={t("checked_in")}
                        />
                      </div>
                    )}

                    <div
                      className="relative w-full h-64 cursor-pointer"
                      onClick={() => handleOpen(p._id)}
                    >
                      {m?.image?.secure_url ? (
                        <Image
                          src={m.image.secure_url}
                          alt={m.name ?? ""}
                          fill
                          className="object-cover opacity-95 hover:opacity-100 transition rounded-t-2xl"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-gray-200 dark:bg-gray-800 rounded-t-2xl">
                          <ImageIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    </div>

                    <div className="p-6">
                      <h3
                        onClick={() => handleOpen(p._id)}
                        className="cursor-pointer text-lg font-semibold truncate text-amber-700 dark:text-amber-300 transition"
                      >
                        {m?.title ?? m?.name ?? p.name}
                      </h3>

                      {m?.region?.title && (
                        <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                          <MapPin className="h-5 w-5" />
                          <span>{m.region.title}</span>
                        </div>
                      )}

                      {(m?.content?.brief || m?.content?.extended) && (
                        <div className="mt-3 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          {m?.content?.brief && (
                            <p className="line-clamp-2">
                              {m.content.brief.replace(/<[^>]+>/g, "").trim()}
                            </p>
                          )}
                          {m?.content?.extended && (
                            <p className="line-clamp-2 text-gray-500 dark:text-gray-400">
                              {m.content.extended
                                .replace(/<[^>]+>/g, "")
                                .trim()}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="mt-5 flex gap-3">
                        <Button
                          size="sm"
                          className="
    cursor-pointer flex-1 rounded-full
    bg-transparent
    text-amber-700
    hover:bg-amber-500/10
    dark:text-amber-300
    dark:hover:bg-amber-500/20
    font-medium
    border border-amber-500/40
    transition
  "
                          onClick={() => handleOpen(p._id)}
                        >
                          {t("tourDetails.viewDetails")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="cursor-pointer flex-1 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:opacity-90 text-white flex items-center gap-2"
                          disabled={checkingIn}
                          onClick={async () => {
                            try {
                              setCheckingIn(true);

                              /* ------------------------------------------------
                                 1️⃣ Validate User Logged In
                              ------------------------------------------------ */
                              const user =
                                persisted?.user?._id ||
                                persisted?.user?.id ||
                                persisted?.user?.uuid ||
                                null;

                              if (!user) {
                                toast.error(t("please_signin_to_checkin"));
                                return;
                              }

                              /* ------------------------------------------------
                                 2️⃣ Monument & TourPoint Validation
                              ------------------------------------------------ */
                              const monumentId = p?.monument?._id;
                              const tourpointId = p?._id;

                              if (!monumentId || !tourpointId) {
                                toast.error(t("invalid_point_checkin"));
                                return;
                              }

                              const m = p.monument;
                              const radius = m?.georadius ?? 0;

                              if (!m?.location) {
                                toast.error(t("monument_location_missing"));
                                return;
                              }

                              /* ------------------------------------------------
                                 3️⃣ Parse Monument Coordinates (array OR object)
                              ------------------------------------------------ */
                              let monumentLat = 0;
                              let monumentLng = 0;

                              if (Array.isArray(m.location)) {
                                monumentLat = m.location[0];
                                monumentLng = m.location[1];
                              } else {
                                monumentLat = m.location?.lat ?? 0;
                                monumentLng = m.location?.lng ?? 0;
                              }

                              if (!monumentLat || !monumentLng) {
                                toast.error("invalid_monument_coordinates");
                                return;
                              }

                              /* ------------------------------------------------
                                4️⃣ Get User Live Location with getCurrentLocation helper
                              ----------------------------------------------- */
                              try {
                                const location = await getCurrentLocation(
                                  100,
                                  20000,
                                  3
                                ); // 100m accuracy, 20s timeout, 3 retries
                                const userLocation = {
                                  lat: location.lat,
                                  lng: location.lng,
                                };

                                /* ------------------------------------------------
                                  5️⃣ Calculate Distance (meters)
                                ------------------------------------------------ */
                                const R = 6371e3;
                                const dLat =
                                  ((userLocation.lat - monumentLat) * Math.PI) /
                                  180;
                                const dLng =
                                  ((userLocation.lng - monumentLng) * Math.PI) /
                                  180;

                                const a =
                                  Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                  Math.cos((monumentLat * Math.PI) / 180) *
                                    Math.cos(
                                      (userLocation.lat * Math.PI) / 180
                                    ) *
                                    Math.sin(dLng / 2) *
                                    Math.sin(dLng / 2);

                                const c =
                                  2 *
                                  Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                                const distance = R * c;

                                /* ------------------------------------------------
                                   6️⃣ Check if user is within required radius
                                ------------------------------------------------ */
                                if (distance > radius) {
                                  toast.error(
                                    t("too_far_from_monument") ||
                                      `You need to be within ${radius}m to check in. Current distance: ${Math.round(
                                        distance
                                      )}m`
                                  );
                                  return;
                                }
                              } catch (error) {
                                console.warn("Location error:", error);
                                toast.error(
                                  t("error_getting_location") ||
                                    "Could not get your location. Please try again."
                                );
                                return;
                              }

                              /* ------------------------------------------------
                                 8️⃣ Create Visit History
                              ------------------------------------------------ */
                              const visitPayload: VisitHistoryPayload = {
                                user: String(user),
                                historytype: "monument",
                                monument: String(monumentId),
                                status: "active",
                                visitmode: "manual",
                                historytime: Date.now().toString(),
                              };

                              await apiCreateVisitHistory(visitPayload);

                              /* ------------------------------------------------
                                 9️⃣ Create Stamp
                              ------------------------------------------------ */
                              await apiCreateStamp({
                                monument: String(monumentId),
                                tourpoint: String(tourpointId),
                                user: String(user),
                                status: "active",
                                stamptime: Date.now(),
                              });

                              /* ------------------------------------------------
                                 🔟 Success Notification
                              ------------------------------------------------ */
                              toast.success(
                                `${t("checked_in_at")} ${
                                  m?.name ?? "location"
                                }`,
                                {
                                  description: t("visit_progress_success"),
                                  duration: 5000,
                                }
                              );

                              /* ------------------------------------------------
                                 1️⃣1️⃣ Refresh TourPoints ONLY After Stamp Success
                              ------------------------------------------------ */
                              if (onRefreshTourpoints) {
                                await onRefreshTourpoints();
                              }
                            } catch (err) {
                              console.error("❌ Check-in failed:", err);
                              toast.error(t("check_in_failed"));
                            } finally {
                              setCheckingIn(false);
                            }
                          }}
                        >
                          <MapPin className="h-5 w-5" />
                          {checkingIn
                            ? t("checking_in")
                            : t("tourDetails.checkIn")}
                        </Button>
                      </div>
                    </div>
                  </article>
                </li>

                {/* {next && (
                  <li className="hidden md:flex items-center gap-2 ml-[78px] mt-3 text-gray-600 dark:text-gray-300">
                    <TravelConnector
                      info={next.traveltype}
                      time={next.traveltime}
                      next={next}
                    />
                  </li>
                )} */}
              </Fragment>
            );
          })}
        </ul>
      </div>

      {/* Monument Details Modal */}
      <MonumentDetailModal
        open={!!openId}
        onClose={() => setOpenId(null)}
        loading={modalLoading}
        details={details}
        onOpenAnother={handleOpen}
        customStyle={customStyle}
      />

      {distancePopup.show && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-md animate-fadeIn">
          <div className="relative w-[90%] max-w-sm rounded-2xl bg-white/90 dark:bg-zinc-900/80 border border-gray-200 dark:border-gray-700 shadow-2xl p-7 animate-scaleIn">
            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center shadow">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3m0 4h.01M12 3a9 9 0 11-9 9 9 9 0 019-9z"
                  />
                </svg>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {t("too_far_away")}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {t("currently")}{" "}
              <strong className="text-gray-900 dark:text-gray-100">
                {distancePopup.distance}m
              </strong>{" "}
              {t("away")}
              <br />
              {t("must_be")}{" "}
              <strong className="text-gray-900 dark:text-gray-100">
                {distancePopup.required}m
              </strong>{" "}
              {t("within_for_checkin")}
            </p>

            {/* Close Button */}
            <button
              onClick={() => setDistancePopup({ show: false })}
              className="mt-6 w-full py-2.5 rounded-xl bg-gray-900 text-white dark:bg-gray-700 dark:text-white font-semibold hover:bg-gray-800 dark:hover:bg-gray-600 transition shadow"
            >
              {t("okay_close")}
            </button>
          </div>
        </div>
      )}
      <div className="px-4 text-sm text-muted-foreground text-center">
        {t("timeline_footer_desc")}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
function TimelineDot({
  index,
  accent,
  waypointtype,
  hasStart,
}: {
  index: number;
  accent: string;
  waypointtype?: string;
  hasStart: boolean;
}) {
  let label: string | number = index + 1;
  if (waypointtype === "start") label = "S";
  else if (waypointtype === "end") label = "E";
  else if (hasStart) label = index;

  return (
    <div className="relative h-full w-[90px]">
      <div className="absolute left-[52px] top-0 bottom-0 w-[3px] bg-transparent" />
      <div className="absolute left-[52px] top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div
          className="grid h-14 w-14 place-items-center rounded-full text-white shadow-lg ring-4 ring-white/70 dark:ring-gray-800"
          style={{ background: accent }}
        >
          <span className="text-[13px] font-semibold">{label}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
function TravelConnector({
  info,
  time,
  next,
}: {
  info?: { name?: TravelMode; title?: string };
  time?: string;
  next?: TourPoint;
}) {
  const { t } = useLocale();

  const travelMode: TravelMode = (info?.name as TravelMode) || "walk";

  const travelTitle =
    next?.pointtype === "lunch" ? "lunch_break" : info?.title || travelMode;

  const icon =
    next?.pointtype === "lunch" ? (
      <UtensilsCrossed className="h-6 w-6 text-orange-500" />
    ) : (
      getTravelIcon(travelMode)
    );

  // ✅ Start time (safe fallback)
  const startTime = next?.starttime || "";
  null;

  function formatMinutes(value?: string | number, t?: (key: string) => string) {
    if (!value) return null;

    // Extract number from "10", "10 min", "10分"
    const minutes = String(value).match(/\d+/)?.[0];
    if (!minutes) return value;

    return `${minutes} ${t ? t("time.min") : "min"}`;
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-base font-medium text-gray-700 dark:text-gray-300">
      {/* Travel mode */}
      <div className="flex items-center gap-2">
        {icon}
        <span>{t(travelTitle)}</span>
      </div>

      {/* Travel duration */}
      {time && <span className="text-sm opacity-80">{time}</span>}

      {/* Start time */}
      {startTime && (
        <span className="flex items-center gap-1.5 text-sm opacity-80">
          •
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6l4 2M12 22a10 10 0 100-20 10 10 0 000 20z"
            />
          </svg>
          {startTime}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
function getTravelIcon(mode?: TravelMode | string) {
  const iconSize = "h-6 w-6";
  switch (mode) {
    case "walk":
      return <Footprints className={iconSize} />;
    case "train":
      return <Train className={iconSize} />;
    case "car":
      return <Car className={iconSize} />;
    default:
      return <Footprints className={iconSize} />;
  }
}

function capitalize(str?: string) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

function dynamicColor(i: number, type?: "start" | "place" | "end") {
  if (type === "start") return "#10b981"; // green
  if (type === "end") return "#ef4444"; // red
  return "#f97316"; // orange
}
