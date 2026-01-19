"use client";

import { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import type mapboxgl from "mapbox-gl";
import MapboxLanguage from "@mapbox/mapbox-gl-language";
import { useLocale } from "@/providers/LocaleProvider";
import { Landmark, Navigation, Star } from "lucide-react";
import {
  apiGetNearbyAttractionCategories,
  apiGetNearbyAttractions,
  apiGetNearbyAttractionsByCategory,
  apiGetNearbyMonuments,
} from "@/services/nearByService";

const DEFAULT_CENTER: [number, number] = [135.7214, 34.4342];
const DEFAULT_ZOOM = 11;

type PinKind = "monument" | "attraction";

function escapeText(s?: string) {
  if (!s) return "";
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default function MonumentsMap({
  height = "100dvh",
  singleLocation,
  showMonument,
  showAttraction,
  near_monuments,
}: {
  height?: number | string;
  showMonument?: boolean;
  showAttraction?: boolean;
  near_monuments?: any;
  singleLocation?: {
    id: string;
    title: string;
    lat: number;
    lng: number;
    image?: string;
    brief?: string;
  };
}) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapDivRef = useRef<HTMLDivElement | null>(null);

  // ✅ runtime mapbox-gl module (because you dynamically import it)
  const mapboxglRef = useRef<any>(null);

  // ✅ track extra markers (nearby) so we can clear/replace them

  const { t, locale } = useLocale();

  const [loading, setLoading] = useState(true);
  const [nearbyMonuments, setNearbyMonuments] = useState<any[]>([]);
  const [nearbyAttractions, setNearbyAttractions] = useState<any[]>([]);

  const [showMonuments, setShowMonuments] = useState(false);
  const [showAttractions, setShowAttractions] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(
    null
  );

  // store markers separately
  const monumentMarkersRef = useRef<any[]>([]);
  const attractionMarkersRef = useRef<any[]>([]);

  function clearMarkers(kind: PinKind) {
    const ref = kind === "monument" ? monumentMarkersRef : attractionMarkersRef;

    ref.current.forEach((m) => m.remove());
    ref.current = [];
  }

  const [attractionCategories, setAttractionCategories] = useState<any[]>([]);
  async function fetchAttractionCategories() {
    if (!singleLocation) return;

    const { lat, lng, id } = singleLocation;

    try {
      const data = await apiGetNearbyAttractionCategories({
        lat,
        lng,
        monumentId: id,
        radius: 1000,
      });

      // ← RESPONSE STRUCTURE YOU MENTIONED
      setAttractionCategories(data.categories || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  }

  const [activeCategories, setActiveCategories] = useState<string[]>([]);

  async function loadCategory(categoryId: string) {
    if (activeCategories.includes(categoryId)) {
      const updated = activeCategories.filter((id) => id !== categoryId);

      setActiveCategories(updated);

      // ✅ NOW CLEAR
      clearMarkers("attraction");
      setSelectedCoords(null);

      return;
    }

    const updated = [...activeCategories, categoryId];

    setActiveCategories(updated);

    await Promise.all(updated.map((id) => showAttractionsByCategory(id)));
  }

  async function showAttractionsByCategory(categoryId: string) {
    if (!singleLocation) return;

    const { lat, lng, id } = singleLocation;

    try {
      const data = await apiGetNearbyAttractionsByCategory({
        lat,
        lng,
        radius: 1000,
        category: categoryId, // ← SEND ID
        monumentId: id,
      });

      const attractions = data.attractions || [];

      setNearbyAttractions((prev) => [
        ...prev.filter((a) => a.categoryId !== categoryId),
        ...attractions,
      ]);

      addMarkersToMap(attractions, "attraction");
    } catch (err) {
      console.error("Category fetch error:", err);
    }
  }

  // ✅ Same pin style as your current marker; only inner icon changes
  /* ---------- makePin : outer pin same; inner icon from category image ---------- */
  function makePin(kind: PinKind, categoryImageUrl?: string) {
    const pinFill = "rgb(249, 115, 22)"; // your existing orange shell

    const el = document.createElement("div");
    el.style.width = "40px";
    el.style.height = "56px";
    el.style.cursor = "pointer";
    el.style.transform = "translateY(-6px)";
    el.classList.add("map-marker-normal");

    const innerIconImg = categoryImageUrl
      ? `<image href="${categoryImageUrl}" x="10" y="9" width="20" height="20" />`
      : "";

    const monumentIcon = `
    <g transform="translate(10,9)" fill="none"
      stroke="${pinFill}" stroke-width="1.8"
      stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 8h16L10 2z"/>
      <rect x="4" y="8" width="12" height="9" rx="1.5"/>
    </g>`;

    el.innerHTML = `
    <svg viewBox="0 0 40 56" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 0c11 0 20 8.6 20 19.2 0 12.7-13.6 26.5-18.4 31.1a2.2 2.2 0 0 1-3.2 0
           C13.6 45.7 0 31.9 0 19.2 0 8.6 9 0 20 0z"
        fill="${pinFill}"
      />
      <circle cx="20" cy="19" r="12" fill="white" />

      ${kind === "attraction" ? innerIconImg : monumentIcon}

    </svg>`;

    return el;
  }

  /* ---------- addMarkersToMap : USE category secure_url ---------- */

  function createPopupHTML(item: any) {
    const rawBrief = item.content?.brief || item.brief || "";
    return `
    <div class="monument_map-popup__card">
      ${
        item.image?.secure_url
          ? `<img src="${item.image.secure_url}" />`
          : `
            <div class="tour-popup__noimg">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <path d="M21 15l-5-5L5 21"></path>
              </svg>
            </div>
          `
      }
      <div class="monument_map-popup__title">
        ${escapeText(item.title || item.name || "")}
      </div>
      <div class="monument_map-popup__brief">
      ${rawBrief.replace(/<[^>]+>/g, "")}
      </div>
    </div>
  `;
  }

  function addMarkersToMap(items: any[], kind: PinKind) {
    const map = mapRef.current;
    const mapboxgl = mapboxglRef.current;
    if (!map || !mapboxgl) return;

    items.forEach((item) => {
      if (!Array.isArray(item.location)) return;

      const [lng, lat] = item.location;
      const categoryImageUrl =
        kind === "attraction" ? item.category?.image?.secure_url || "" : "";

      const pin = makePin(
        kind,
        categoryImageUrl // pass secure_url here
      );

      const popupClass = "tour-popup"; // CSS controls dark/light

      const marker = new mapboxgl.Marker({ element: pin })
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({
            offset: 25,
            closeButton: true,
            closeOnClick: true,
            className: popupClass,
          }).setHTML(`
          <div class="monument_map-popup__card">
            ${
              item.image?.secure_url
                ? `<img src="${item.image.secure_url}" />`
                : `
    <div class="tour-popup__noimg">
    <svg
  xmlns="http://www.w3.org/2000/svg"
  width="32"
  height="32"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.8"
  stroke-linecap="round"
  stroke-linejoin="round"
  class="tour-popup__icon"
>
  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
  <circle cx="8.5" cy="8.5" r="1.5"></circle>
  <path d="M21 15l-5-5L5 21"></path>
</svg>

    </div>
  `
            }
            <div class="monument_map-popup__title">
              ${escapeText(item.title || item.name)}
            </div>
            <div class="monument_map-popup__brief">
              ${(item.content?.brief || "").replace(/<[^>]+>/g, "")}
            </div>
          </div>
        `)
        )
        .addTo(map);
      marker.getPopup()?.on("open", () => {
        // ✅ when popup opens mark this as active
        setSelectedCoords([lat, lng]);
      });

      if (kind === "monument") {
        monumentMarkersRef.current.push(marker);
      } else {
        attractionMarkersRef.current.push(marker);
      }
    });
  }

  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  /* ---------------- Initialize Map ---------------- */
  useEffect(() => {
    if (!mapDivRef.current) return;

    let map: any = null;

    (async () => {
      const mod = await import("mapbox-gl");
      const mapboxgl = mod.default;

      mapboxglRef.current = mapboxgl;
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

      const center: [number, number] = singleLocation
        ? [singleLocation.lng, singleLocation.lat]
        : DEFAULT_CENTER;

      map = new mapboxgl.Map({
        container: mapDivRef.current!,
        style: "mapbox://styles/mapbox/streets-v11",
        center,
        zoom: singleLocation ? 14 : DEFAULT_ZOOM,
      });

      mapRef.current = map;

      map.addControl(new mapboxgl.NavigationControl(), "top-right");
      map.addControl(new MapboxLanguage({ defaultLanguage: locale }));

      map.on("load", () => {
        if (singleLocation) {
          const { lat, lng } = singleLocation;

          // ✅ main marker uses same pin style
          const pin = makePin("monument", "rgb(249, 115, 22)");

          const mainMarker = new mapboxgl.Marker({ element: pin })
            .setLngLat([lng, lat])
            .setPopup(
              new mapboxgl.Popup({
                offset: 25,
                closeButton: true,
                closeOnClick: true,
                className: "tour-popup",
              }).setHTML(
                createPopupHTML({
                  title: singleLocation.title,
                  image: singleLocation.image,
                  brief: singleLocation.brief,
                })
              )
            )
            .addTo(map);
          fetchAttractionCategories();
        }

        map.resize();
        setTimeout(() => map.resize(), 0);
        setTimeout(() => map.resize(), 100);
        setTimeout(() => map.resize(), 300);

        setLoading(false);
      });
    })();

    // ✅ cleanup when location/locale changes or component unmounts
    return () => {
      try {
        clearMarkers("monument");
        clearMarkers("attraction");
        if (map) map.remove();
        mapRef.current = null;
      } catch (e) {
        // ignore cleanup errors
      }
    };
  }, [singleLocation, locale]);

  const toggleMonuments = async () => {
    if (showMonuments) {
      clearMarkers("monument");
      setShowMonuments(false);
      return;
    }

    // await fetchNearbyMonuments();
    // setShowMonuments(true);
    if (Array.isArray(near_monuments) && near_monuments.length) {
      setNearbyMonuments(near_monuments);
      addMarkersToMap(near_monuments, "monument");
      setShowMonuments(true);
    }
  };

  const toggleAttractions = async () => {
    if (showAttractions) {
      clearMarkers("attraction");
      setShowAttractions(false);
      return;
    }

    await fetchNearbyAttractions();
    setShowAttractions(true);
  };

  /* ---------------- Google Maps Navigation ---------------- */
  const handleNavigate = () => {
    const destination = selectedCoords || [
      singleLocation!.lat,
      singleLocation!.lng,
    ];

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const origin = `${pos.coords.latitude},${pos.coords.longitude}`;

        openMaps(origin, `${destination[0]},${destination[1]}`);
      },
      () => {
        openMaps(null, `${destination[0]},${destination[1]}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  function openMaps(origin: string | null, destination: string) {
    const ua = navigator.userAgent || navigator.vendor;
    const isIOS = /iPad|iPhone|iPod/.test(ua);

    if (isIOS) {
      const appleMapsUrl = origin
        ? `maps://?saddr=${origin}&daddr=${destination}&dirflg=d`
        : `maps://?daddr=${destination}&dirflg=d`;

      window.location.href = appleMapsUrl;
    } else {
      const webUrl = origin
        ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`
        : `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

      window.open(webUrl, "_blank");
    }
  }

  // 🏛️ Fetch Nearby Monuments
  async function fetchNearbyMonuments() {
    if (!singleLocation) return;
    const { lat, lng } = singleLocation;

    try {
      const data = await apiGetNearbyMonuments({ lat, lng });

      if (data?.monuments?.length) {
        setNearbyMonuments(data.monuments);
        addMarkersToMap(data.monuments, "monument");
        setSelectedCoords([
          data.monuments[0].location[1],
          data.monuments[0].location[0],
        ]);
      } else {
        setNearbyMonuments([]);
        clearMarkers("monument");
      }
    } catch (err) {
      console.error("Error fetching nearby monuments:", err);
    }
  }

  // 🎢 Fetch Nearby Attractions
  async function fetchNearbyAttractions() {
    if (!singleLocation) return;
    const { lat, lng, id } = singleLocation;

    try {
      const data = await apiGetNearbyAttractions({
        lat,
        lng,
        monumentId: id,
      });

      if (data?.attractions?.length) {
        setNearbyAttractions(data.attractions);
        addMarkersToMap(data.attractions, "attraction");
      } else {
        setNearbyAttractions([]);
        clearMarkers("attraction");
      }
    } catch (err) {
      console.error("Error fetching nearby attractions:", err);
    }
  }

  return (
    <div
      className="relative w-full overflow-hidden bg-white"
      style={{
        height,
        width: "100vw",
        maxWidth: "100vw",
      }}
    >
      <div ref={mapDivRef} className="w-full h-full" />

      {/* Right-side Floating Buttons */}
      {singleLocation && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-[5]">
          {showMonument && (
            <button
              onClick={toggleMonuments}
              className={`cursor-pointer relative rounded-2xl px-3 py-2 shadow-md bg-white rounded-2xl px-2 py-2 shadow-md relative
    
  `}
            >
              <Landmark className="text-amber-600" />

              {showMonuments && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full px-1">
                  ✓
                </span>
              )}
            </button>
          )}

          {attractionCategories.map((cat) => {
            const isSelected = activeCategories.includes(cat._id);

            return (
              <>
                {showAttraction && (
                  <button
                    key={cat._id}
                    onClick={() => loadCategory(cat._id)}
                    className={`cursor-pointer flex items-center justify-center bg-white rounded-2xl px-2 py-2 shadow-md relative`}
                  >
                    <img
                      src={cat.image?.secure_url}
                      className="w-8 h-8 object-contain"
                    />

                    {isSelected && (
                      <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full px-1">
                        ✓
                      </span>
                    )}
                  </button>
                )}
              </>
            );
          })}
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 grid place-items-center bg-white/70 dark:bg-black/50 text-lg">
          {t("loading_map_data")}
        </div>
      )}

      {/* Bottom Navigate Button */}
      {singleLocation && (
        <button
          onClick={handleNavigate}
          className="
            absolute bottom-[5%] md:bottom-[4%] left-1/2 -translate-x-1/2
            bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:opacity-90
            text-white px-4 py-2 rounded-full shadow-lg cursor-pointer
          "
        >
          <div className="flex items-center gap-2">
            <span>
              <Navigation className="w-4 h-4" />
            </span>
            {t("navigate")}
          </div>
        </button>
      )}
    </div>
  );
}
