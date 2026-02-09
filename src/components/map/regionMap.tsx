"use client";

import { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import type mapboxgl from "mapbox-gl";
import MapboxLanguage from "@mapbox/mapbox-gl-language";
import { useLocale } from "@/providers/LocaleProvider";
import {
  apiFetchAllMonuments,
  apiFetchMonumentDetails,
} from "@/services/userTourService";
import type { Monument } from "@/lib/types/userTour.types";
import MonumentDetailModal from "@/components/tour/MonumentDetailModal";

/* ---------------- DEFAULT VIEW ---------------- */
const DEFAULT_CENTER: [number, number] = [
  135.7214320478452, 34.434292929246524,
];
const DEFAULT_ZOOM = 11.2;

/* ---------------- Helpers ---------------- */
function normalize(loc?: any): [number, number] | null {
  if (!loc) return null;
  if (Array.isArray(loc) && loc.length >= 2) return [loc[0], loc[1]];
  if (typeof loc === "object") return [loc.lng, loc.lat];
  return null;
}

function makePin(fill = "rgb(20, 184, 166)") {
  const el = document.createElement("div");
  el.style.width = "40px";
  el.style.height = "56px";
  el.style.cursor = "pointer";
  el.style.transform = "translateY(-6px)";
  el.classList.add("map-marker-normal");

  el.innerHTML = `
    <svg viewBox="0 0 40 56" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer pin shape -->
      <path
        d="M20 0c11 0 20 8.6 20 19.2 0 12.7-13.6 26.5-18.4 31.1a2.2 2.2 0 0 1-3.2 0C13.6 45.7 0 31.9 0 19.2 0 8.6 9 0 20 0z"
        fill="${fill}"
      />

      <!-- White circle background -->
      <circle cx="20" cy="19" r="12" fill="white" />

      <!-- Icon inside (temple/building style, Lucide-like) -->
      <g
        transform="translate(10, 9) scale(1)"
        fill="none"
        stroke="${fill}"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <!-- Roof -->
        <path d="M2 8h16L10 2z" />
        <!-- Body -->
        <rect x="4" y="8" width="12" height="9" rx="1.5" />
        <!-- Center line / door -->
        <path d="M10 8v9" />
      </g>
    </svg>
  `;

  return el;
}

export default function RegionMap({
  height = 500,
}: {
  height?: number | string;
}) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const selectedMarkerRef = useRef<HTMLDivElement | null>(null);

  const [monuments, setMonuments] = useState<Monument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { t, locale } = useLocale();

  /* ---------------- MODAL STATE ---------------- */
  const [open, setOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedMonument, setSelectedMonument] = useState<Monument | null>(
    null
  );

  const handleOpenMonument = async (id: string) => {
    try {
      setModalLoading(true);
      const data = await apiFetchMonumentDetails(id);
      setSelectedMonument(data);
      setOpen(true);
    } catch (err) {
      console.error("Failed to fetch monument:", err);
    } finally {
      setModalLoading(false);
    }
  };

  /* ---------------- Inject Component-Level CSS ---------------- */
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
    .mapboxgl-popup-content {
      background: transparent !important;
      box-shadow: none !important;
      padding: 0 !important;
      border-radius: 0 !important;
    }

    .mapboxgl-popup-tip { display: none !important; }

    /* LIGHT MODE */
    .ni-map-popup {
      width: 270px;
      background: #ffffff;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 4px 14px rgba(0,0,0,0.25);
      font-family: sans-serif;
      color: #000;
    }

    /* DARK MODE */
    html.dark .ni-map-popup {
      background: #0f0f0f;
      color: #fff;
      box-shadow: 0 4px 14px rgba(255,255,255,0.15);
    }

    .ni-map-popup-img-wrap {
      position: relative;
      width: 100%;
      height: 150px;
      overflow: hidden;
    }

    .ni-map-popup-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .ni-map-popup-noimg {
  width: 100%;
  height: 150px;
  max-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb; /* gray-200 */
}

html.dark .ni-map-popup-noimg {
  background: #374151; /* gray-700 */
}

.ni-map-popup-noimg-icon {
  color: #6b7280; /* gray-500 */
}

html.dark .ni-map-popup-noimg-icon {
  color: #d1d5db; /* gray-300 */
}


    .ni-map-popup-close {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: rgba(0,0,0,0.6);
      border: none;
      color: white;
      font-size: 14px;
      cursor: pointer;
    }

    .ni-map-popup-body { padding: 12px; }

    .ni-map-popup-title {
      font-weight: 700;
      font-size: 15px;
      margin-bottom: 4px;
    }

    .ni-map-popup-desc {
      font-size: 12px;
      color: #555;
      line-height: 1.35;
    }

    html.dark .ni-map-popup-desc {
      color: #ccc;
    }

    .ni-map-popup-view {
      margin-top: 10px;
      width: 100%;
      padding: 8px;
      font-size: 13px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
    }

    .map-marker-selected {
      transform: scale(1.4) translateY(-6px);
      filter: drop-shadow(0 0 6px lab(57.1026% 64.2584 89.8886));
      transition: 0.25s ease;
    }

    .map-marker-normal {
      transform: scale(1) translateY(-6px);
      filter: none;
      transition: 0.25s ease;
    }

    .mapboxgl-popup-close-button{
      display: none;
      }
  `;
    document.head.appendChild(style);
  }, []);

  /* ---------------- Load Monument Points ---------------- */
  useEffect(() => {
    (async () => {
      try {
        const list = await apiFetchAllMonuments();
        setMonuments(list);
      } catch {
        setError("Unable to load monuments");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------------- Initialize Map ---------------- */
  useEffect(() => {
    if (!mapDivRef.current) return;

    (async () => {
      const mapboxglMod = await import("mapbox-gl");
      const mapboxgl = mapboxglMod.default;

      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

      const map = new mapboxgl.Map({
        container: mapDivRef.current!,
        style: "mapbox://styles/mapbox/streets-v11",
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
      });

      mapRef.current = map;

      map.addControl(new mapboxgl.NavigationControl(), "top-right");
      map.addControl(
        new MapboxLanguage({ defaultLanguage: locale === "ja" ? "ja" : "en" })
      );

      map.on("load", () => {
        map.setCenter(DEFAULT_CENTER);
        map.setZoom(DEFAULT_ZOOM);

        monuments.forEach((m) => {
          const loc = normalize(m.location);
          if (!loc) return;

          const pin = makePin();

          const popupHTML = `
            <div class="ni-map-popup">
              <div class="ni-map-popup-img-wrap">
  ${
    m.image?.secure_url
      ? `
        <img
          src="${m.image.secure_url}"
          class="ni-map-popup-img"
          alt=""
        />
      `
      : `
        <div class="ni-map-popup-noimg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="ni-map-popup-noimg-icon"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <path d="M21 15l-5-5L5 21"></path>
          </svg>
        </div>
      `
  }
  <button class="ni-map-popup-close" data-id="${m._id}">✕</button>
</div>
              <div class="ni-map-popup-body">
                <div class="ni-map-popup-title">${m.title}</div>
                <div class="ni-map-popup-desc">${(m.content?.brief || "").slice(
                  0,
                  80
                )}…</div>
                <button class="ni-map-popup-view bg-gradient-to-r from-teal-500 via-teal-500 to-teal-500 text-white hover:opacity-90" data-id="${
                  m._id
                }">${t("tourDetails.viewDetails")}</button>
              </div>
            </div>
          `;

          const marker = new mapboxgl.Marker({ element: pin })
            .setLngLat(loc)
            .setPopup(new mapboxgl.Popup({ offset: 20 }).setHTML(popupHTML))
            .addTo(map);

          pin.addEventListener("click", () => {
            if (selectedMarkerRef.current) {
              selectedMarkerRef.current.classList.remove("map-marker-selected");
              selectedMarkerRef.current.classList.add("map-marker-normal");
            }

            pin.classList.remove("map-marker-normal");
            pin.classList.add("map-marker-selected");
            selectedMarkerRef.current = pin;

            map.easeTo({
              center: {
                lng: loc[0],
                lat: loc[1] + 0.0035, // 🟢 Moves map UP so popup appears fully visible
              },
              zoom: 15,
              duration: 800,
              padding: { top: 200 }, // 🟢 Extra safe spacing (optional)
            });

            setTimeout(() => {
              const closeBtn = document.querySelector(
                `.ni-map-popup-close[data-id="${m._id}"]`
              );
              const viewBtn = document.querySelector(
                `.ni-map-popup-view[data-id="${m._id}"]`
              );

              if (closeBtn)
                closeBtn.addEventListener("click", (e) => {
                  e.stopPropagation();
                  marker.getPopup()?.remove();
                });

              if (viewBtn)
                viewBtn.addEventListener("click", (e) => {
                  e.stopPropagation();
                  handleOpenMonument(m._id); // ⭐ OPEN MODAL
                });
            }, 100);
          });
        });

        map.on("zoomend", () => {
          if (map.getZoom() <= 12) {
            document.querySelectorAll(".map-marker-selected").forEach((el) => {
              el.classList.remove("map-marker-selected");
              el.classList.add("map-marker-normal");
            });
          }
        });
      });
    })();
  }, [monuments, locale]);

  /* ---------------- UI ---------------- */
  return (
    <div
      className="relative w-full rounded-lg border overflow-hidden"
      style={{ height }}
    >
      <div ref={mapDivRef} className="w-full h-full" />

      {loading && (
        <div className="absolute inset-0 grid place-items-center bg-white/70 dark:bg-black/40">
          {t("loading_map_data")}
        </div>
      )}

      {error && (
        <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {/* ---------------- MODAL RENDER ---------------- */}
      {selectedMonument && (
        <MonumentDetailModal
          open={open}
          onClose={() => setOpen(false)}
          loading={modalLoading}
          details={selectedMonument}
          onOpenAnother={(id: string) => handleOpenMonument(id)}
          customStyle="bg-gradient-to-r from-teal-500 via-teal-500 to-teal-500 text-white hover:opacity-90"
        />
      )}
    </div>
  );
}
