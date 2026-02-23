"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/lib/store/hook";
import {
    resetAll as resetNav,
} from "@/lib/store/slices/navSlice";
import { resetAll as resetGeofence } from "@/lib/store/slices/geofenceSlice";
import { clearTourDetail } from "@/lib/store/slices/touristSlice";
import { useLocale } from "@/providers/LocaleProvider";


import MapboxTourMapHistory from "@/components/map/MapBoxTourMapHistory";
import ScreenshotButtons from "@/components/tour/ScreenshotButtons";
import type { Tour, TourPoint } from "@/lib/types/userTour.types";

export default function FinishPage() {
    const params = useSearchParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { t } = useLocale();

    const tourId = params.get("tourId") ?? "";
    const visitId = params.get("visitId") ?? "";
    const auth = useAppSelector((s) => s.auth);


    const [mapReady, setMapReady] = useState(false);
    const mapInstanceRef = useRef<any>(null);

    // Data from the new API-based map component
    const [tourData, setTourData] = useState<Tour | null>(null);
    const [stampedCount, setStampedCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    /* ---------- RESET ON BROWSER BACK ---------- */
    useEffect(() => {
        const handler = () => resetAllData();
        window.addEventListener("popstate", handler);
        return () => window.removeEventListener("popstate", handler);
    }, []);

    /* ---------- THEME SYNC FOR NEW TAB ---------- */
    useEffect(() => {
        const storedTheme = localStorage.getItem("theme-mode") || "light";
        const root = document.documentElement;
        root.setAttribute("data-theme", storedTheme);
        if (storedTheme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }, []);

    const resetAllData = () => {
        dispatch(resetNav());
        dispatch(resetGeofence());
        dispatch(clearTourDetail());
    };

    /* ---------- LOADER WHILE LOADING ---------- */
    if (!tourId || !visitId) {
        return (
            <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-emerald-500 mx-auto mb-4" />
                </div>
            </div>
        );
    }

    /* ---------- UI START ---------- */
    const tourImage = tourData?.image?.secure_url;


    return (
        <div className="fixed inset-0 z-[100] bg-background overflow-hidden flex flex-col">
            {/* Scrollable */}
            <div className="flex-1 overflow-y-auto">
                {/* CAPTURABLE SECTION: Hero + Map */}
                <div id="tour-screenshot-section">
                    {/* HERO */}
                    <div className="relative bg-gradient-to-b from-slate-100 via-background to-background dark:from-slate-900 dark:via-background dark:to-background">
                        {tourImage ? (
                            <div className="absolute inset-0">
                                <Image
                                    src={tourImage}
                                    alt={tourData?.title ?? "Tour"}
                                    fill
                                    className="object-cover opacity-80 dark:opacity-90"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-background/70 to-background dark:from-black/60 dark:via-background/70 dark:to-background" />
                            </div>
                        ) : (
                            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800"></div>
                        )}

                        <div className="relative p-6 text-black dark:text-white">
                            <h1 className="text-5xl font-black mb-2">🎉</h1>
                            <h2 className="font-serif italic text-3xl font-black">{t("tour_completed")}!</h2>
                            <p className="font-serif italic text-lg text-emerald-700 dark:text-emerald-300">
                                {tourData?.title ?? ""}
                            </p>

                            <div
                                className="mt-6 p-4 rounded-xl text-center border
                bg-emerald-100 text-emerald-700 border-emerald-300
                dark:bg-emerald-500/20 dark:border-emerald-400/30 dark:text-emerald-300"
                            >
                                <span className="font-serif italic font-bold">✨ {t("congratulations")}!</span>
                                <br />
                                <span className="text-black dark:text-gray-200">
                                    {t("you_collected")}{" "}
                                    <b className="text-emerald-700 dark:text-emerald-400">
                                        {stampedCount}
                                    </b>{" "}
                                    {t("out_of")}{" "}
                                    <b className="text-cyan-700 dark:text-cyan-400">
                                        {totalCount}
                                    </b>{" "}
                                    {t("checkpoints")}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* MAP SECTION */}
                    <div className="px-6 pb-6 bg-background">
                        {/* TOUR DETAILS */}
                        {tourData && (
                            <div
                                className="mb-6 p-5 rounded-2xl shadow-lg border
                bg-card border-border"
                            >
                                <h2 className="font-serif italic text-3xl font-extrabold text-black dark:text-white mb-2">
                                    {tourData.title}
                                </h2>

                                {tourData.content?.brief && (
                                    <p
                                        className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3 whitespace-pre-wrap"
                                        dangerouslySetInnerHTML={{
                                            __html: tourData.content.brief,
                                        }}
                                    />
                                )}

                                {tourData.content?.extended && (
                                    <div
                                        className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap"
                                        dangerouslySetInnerHTML={{
                                            __html: tourData.content.extended,
                                        }}
                                    />
                                )}
                            </div>
                        )}

                        {/* MAP - Uses new API-based component */}
                        <div
                            id="tour-map-only"
                            className="rounded-2xl overflow-hidden border shadow-lg 
            border-gray-300 dark:border-white/10"
                        >
                            <MapboxTourMapHistory
                                tourId={tourId}
                                visitId={visitId}
                                height={360}
                                profile="walking"
                                onMapReady={(map) => {
                                    mapInstanceRef.current = map;
                                    setMapReady(true);
                                }}
                                onTourLoaded={(tour) => setTourData(tour)}
                                onPointsLoaded={(stamped, total) => {
                                    setStampedCount(stamped.length);
                                    setTotalCount(total);
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* FOOTER BUTTONS */}
            <div className="p-6 space-y-3 bg-gradient-to-t from-background to-transparent">
                {/* Screenshot Buttons */}
                <ScreenshotButtons
                    elementId="tour-screenshot-section"
                    filename={`${(tourData?.title ?? "tour").replaceAll(/\s+/g, "_")}_tour.png`}
                    isMapReady={mapReady}
                    mapInstance={mapInstanceRef.current}
                />


            </div>
        </div>
    );
}