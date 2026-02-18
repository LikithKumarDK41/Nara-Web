"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ImageIcon,
  Landmark,
  MapPin,
  Store,
  Route,
  Layers,
  Star,
  Globe,
  Info,
  X,
  BookmarkCheck,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  MapPinned,
  Camera,
  SwitchCamera,
  Maximize2,
} from "lucide-react";
import { useLocale } from "@/providers/LocaleProvider";
import { useRef, useEffect, useState } from "react";
import {
  apiFetchEventsByMonument,
  apiFetchBookmarkByRef,
  apiRemoveBookmark,
  apiCreateBookmark,
} from "@/services/userGlobalservice";
import { motion, AnimatePresence } from "framer-motion";
import type { EventItem } from "@/lib/types/userGlobal.types";
import { toast } from "sonner";
import { useAppSelector } from "@/lib/store/hook";
import { selectNav } from "@/lib/store/slices/navSlice";
import MonumentMapModal from "../map/MonumentsMapModal";
import { getDistanceInMeters, normalizeHTML, stripHTML } from "@/lib/utils";
import { useGlobalLoader } from "@/providers/LoaderProvider";
import PlaceDetailModal from "./PlaceDetailModal";

/* ------------------------------------------------------------------ */
interface MonumentDetailModalProps {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  details: any;
  onOpenAnother: (id: string) => void;
  customStyle?: string;
}

/* ------------------------------------------------------------------ */
export default function MonumentDetailModal({
  open,
  onClose,
  loading,
  details,
  onOpenAnother,
  customStyle,
}: MonumentDetailModalProps) {
  const { t } = useLocale();
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const { show, hide } = useGlobalLoader();
  const nav = useAppSelector(selectNav);
  const auth = useAppSelector((s) => s.auth);
  const customStyleDefault =
    "bg-gradient-to-r from-teal-500 via-teal-500 to-teal-500 hover:opacity-90 text-white font-semibold shadow-md hover:shadow-xl transition-all";

  const localUsertour = nav.usertour;
  const localTourId = localUsertour?.tour?._id
    ? localUsertour?.tour?._id
    : null;

  const userData =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("auth_user") || "null")
      : null;

  const userId = userData?.user?._id || null;
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [mainViewerOpen, setMainViewerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile =
    typeof window !== "undefined" &&
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const [placeOpen, setPlaceOpen] = useState(false);
  const [activePlace, setActivePlace] = useState<any>(null);
  const [placeLoading, setPlaceLoading] = useState(false);

  const openPlaceDetails = async (service: any) => {
    setPlaceLoading(true);
    setActivePlace(service); // you already have full object
    setPlaceOpen(true);
    setPlaceLoading(false);
  };

  const openViewer = (index: number) => {
    setActiveIndex(index);
    setViewerOpen(true);
  };

  const closeViewer = () => setViewerOpen(false);
  const galleryLength = details?.gallery?.length || 0;
  const isSingleImage = galleryLength <= 1;

  const prevImage = () => {
    if (isSingleImage) return;
    setActiveIndex((i) => (i === 0 ? details.gallery.length - 1 : i - 1));
  };

  const nextImage = () => {
    if (isSingleImage) return;
    setActiveIndex((i) => (i === details.gallery.length - 1 ? 0 : i + 1));
  };

  // Keyboard navigation for gallery viewer
  useEffect(() => {
    if (!viewerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        prevImage();
      } else if (e.key === "ArrowRight") {
        nextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewerOpen, activeIndex, isSingleImage]);

  useEffect(() => {
    if (details?._id) {
      (async () => {
        try {
          const data = await apiFetchEventsByMonument(details._id);

          setEvents(data);
        } catch (err) {
          console.error("Failed to load events:", err);
        }
      })();
    }
  }, [details]);

  // Scroll to top whenever new monument details are loaded
  useEffect(() => {
    if (details && contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [details]);

  const safeText = (v: any): string => {
    if (!v) return "";
    if (typeof v === "string") return v;
    if (Array.isArray(v))
      return v
        .map((x) => x?.title || x?.name || "")
        .filter(Boolean)
        .join(", ");
    if (typeof v === "object") return v.title || v.name || v._id || "";
    return String(v);
  };

  const plainAddress = stripHTML(details?.access);
  interface BookmarkItem {
    _id: string;
    marktype: string;
    status: string;
    monument?: { _id: string };
    tour?: { _id: string };
  }

  useEffect(() => {
    if (!details?._id || !userId) return;

    let stop = false;

    (async () => {
      try {
        const res = (await apiFetchBookmarkByRef(auth.data?.user?._id)) as any;
        if (stop) return;

        let bookmark: BookmarkItem | null = null;

        if (Array.isArray(res?.bookmarks?.results)) {
          bookmark =
            res.bookmarks.results.find(
              (b: BookmarkItem) =>
                b.marktype === "monument" &&
                b.monument?._id === details._id &&
                b.status === "active",
            ) || null;
        } else if (res?.monument?._id === details._id) {
          bookmark = res as BookmarkItem;
        }

        const bmId =
          bookmark?._id ||
          (bookmark as any)?.data?._id ||
          (bookmark as any)?.bookmark?._id ||
          null;

        setIsBookmarked(!!bmId);
        setBookmarkId(bmId);
      } catch (e) {
        console.error("Bookmark check failed:", e);
        if (!stop) {
          setIsBookmarked(false);
          setBookmarkId(null);
        }
      }
    })();

    return () => {
      stop = true;
    };
  }, [details?._id, userId]);

  const handleBookmarkToggle = async () => {
    if (!userId || !details?._id) {
      toast.error(t("login_bookmark"));
      return;
    }

    const marktype = details?.type === "tour" ? "tour" : "monument";

    try {
      if (isBookmarked) {
        if (!bookmarkId) {
          console.warn("❌ No bookmark ID to remove");
          return;
        }

        await apiRemoveBookmark(bookmarkId);

        setIsBookmarked(false);
        setBookmarkId(null);
        toast.info(t("bookmark_removed"));
        return;
      }

      // ADD bookmark
      const payload = {
        user: userId,
        marktype,
        [marktype]: details._id,
        status: "active",
      };

      const created: any = await apiCreateBookmark(payload);

      const newId =
        created?._id || created?.data?._id || created?.bookmark?._id || null;

      setIsBookmarked(true);
      setBookmarkId(newId);
      toast.success(t("bookmark_added"));
    } catch (err) {
      console.error("Bookmark toggle failed:", err);
      toast.error(t("failed_to_update_bookmark"));
    }
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">(
    "environment",
  );

  useEffect(() => {
    if (!cameraOpen) return;

    const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(
      navigator.userAgent,
    );

    const constraints: MediaStreamConstraints = {
      video: isMobileDevice
        ? { facingMode: { exact: cameraFacing } } // 📱 mobile
        : true, // 💻 desktop fallback
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;

        video.onloadedmetadata = () => {
          video.play(); // ✅ VERY IMPORTANT
        };
      })
      .catch(() => {
        toast.error(t("camera_permission_denied"));
      });

    return () => {
      const tracks = videoRef.current?.srcObject as MediaStream;
      tracks?.getTracks()?.forEach((t) => t.stop());
    };
  }, [cameraOpen, cameraFacing]);

  const [isNearby, setIsNearby] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  function openStreetViewFromApi(loc: [number, number]) {
    const [lng, lat] = loc;

    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isIOS = /iPad|iPhone|iPod/.test(ua);

    let url = "";

    if (isIOS) {
      // 🍎 Apple Maps (Look Around if available)
      url = `https://maps.apple.com/?ll=${lat},${lng}&q=${lat},${lng}`;
    } else {
      // 🌍 Google Street View
      url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
    }

    window.open(url, "_blank");
  }

  function normalizeCoords(loc?: any): {
    lat: number | null;
    lng: number | null;
  } {
    if (!Array.isArray(loc)) return { lat: null, lng: null };

    return {
      lng: loc[0],
      lat: loc[1],
    };
  }

  const { lat, lng } = normalizeCoords(details?.avlocation);

  const hasAnyDetails =
    safeText(details?.era) ||
    safeText(details?.year) ||
    safeText(details?.size) ||
    safeText(details?.mtype) ||
    details?.featured ||
    details?.rare ||
    (details?.popularity != null && details.popularity !== "0") ||
    !!details?.priority;

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      toast.info(t("camera_loading_info"));
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 🤳 Fix selfie mirroring
    if (cameraFacing === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    if (!isMobile && cameraFacing != "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);

    // reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const logo = new window.Image();
    logo.src = "/nara_logo.png";
    logo.onload = () => {
      const size = 128;
      ctx.drawImage(
        logo,
        canvas.width / 2 - size / 2,
        canvas.height / 2 - size / 2,
        size,
        size,
      );

      setCapturedImage(canvas.toDataURL("image/png"));
      closeCamera();
      setPreviewOpen(true);
    };
  }

  async function shareImage() {
    if (!capturedImage) return;

    const blob = await (await fetch(capturedImage)).blob();
    const file = new File([blob], "nara-visit.png", {
      type: "image/png",
    });

    // 📱 MOBILE: use native share (WhatsApp, Mail, Messages)
    if (
      isMobile &&
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      await navigator.share({
        title: t("nara_visit"),
        text: t("captured_at") + (details.title || details.name) + t("monument_"),
        files: [file],
      });
      return;
    }

    // 💻 DESKTOP / TEAMS: download fallback
    downloadImageFallback(capturedImage);
  }

  function downloadImageFallback(dataUrl: string) {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "nara-visit.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast.success(t("image_downloaded"));
  }

  function closeCamera() {
    const video = videoRef.current;

    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      video.srcObject = null; // 🔑 VERY IMPORTANT
    }

    setCameraOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {open && (
        <div className="fixed inset-0 z-[40] bg-black/60 backdrop-blur-sm" />
      )}
      <DialogContent
        showCloseButton={false}
        className="z-50
  w-screen
  h-[100dvh]
  md:h-[100dvh] lg:h-screen
  bg-background
  p-0
  !max-w-full
  overflow-hidden
"
      >
        {/* ---------------- Header ---------------- */}
        <DialogHeader className="flex items-center border-b bg-background py-4 px-8 relative">
          <DialogTitle
            className="font-serif italic
    text-xl font-semibold 
    px-12 
    whitespace-nowrap 
    overflow-hidden 
    text-ellipsis 
    transition-opacity duration-300
    max-w-[80vw]
  "
          >
            {safeText(details?.title || details?.name || "Details")}
          </DialogTitle>

          <button
            onClick={onClose}
            aria-label="Close"
            className="z-[999] cursor-pointer absolute right-6 top-1/2 -translate-y-1/2 
       text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 
       transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 p-2"
          >
            <X className="h-6 w-6" strokeWidth={2} />
          </button>
        </DialogHeader>

        {/* ---------------- Content ---------------- */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto px-8 py-6 space-y-10 transition-opacity duration-300"
        >
          {loading ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              {t("common.loading")}
            </div>
          ) : (
            details && (
              <>
                {/* 🖼 Main Image */}
                {details.image?.secure_url && (
                  <div className="relative h-[420px] w-full overflow-hidden rounded-xl shadow-md ring-1 ring-border group">
                    <Image
                      src={details.image.secure_url}
                      alt={safeText(details.title)}
                      fill
                      onClick={() => setMainViewerOpen(true)}
                      className="cursor-pointer object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Hover Icon Overlay */}
                    <div className="absolute inset-0 bg-black/10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 scale-100 md:scale-90 md:group-hover:scale-100 transition-transform duration-300">
                        <Maximize2 size={20} />
                      </div>
                    </div>
                    {/* 🔖 Bookmark Button */}
                    <button
                      onClick={handleBookmarkToggle}
                      aria-label="Toggle bookmark"
                      className="cursor-pointer
    absolute top-4 right-4 z-10
    flex items-center justify-center
    p-2 rounded-full
    bg-black/40 hover:bg-black/60
    backdrop-blur-md
    border border-white/10
    shadow-lg
    transition-all
  "
                    >
                      {isBookmarked ? (
                        <BookmarkCheck
                          className="cursor-pointer
        h-8 w-8
        text-teal-400
        drop-shadow-[0_0_6px_rgba(45,212,191,0.6)]
      "
                        />
                      ) : (
                        <Bookmark
                          className="
        h-8 w-8 cursor-pointer
        text-white/90
        hover:text-teal-300
        transition-colors
      "
                        />
                      )}
                    </button>

                    {details.avenabled && details.avlocation && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openStreetViewFromApi(details.avlocation);
                        }}
                        aria-label="Open street view"
                        title={t("open_street_view")}
                        className="cursor-pointer absolute top-20 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                      >
                        <MapPinned className="h-8 w-8 text-white cursor-pointer" />

                        {/* 360 badge */}
                        <span className="absolute -right-2 -top-1 rounded-full bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          360
                        </span>
                      </button>
                    )}

                    {details.arenabled && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          show();

                          navigator.geolocation.getCurrentPosition(
                            (pos) => {
                              const userLat = pos.coords.latitude;
                              const userLng = pos.coords.longitude;

                              const [lng, lat] = details.location;
                              const distance = getDistanceInMeters(
                                userLat,
                                userLng,
                                lat,
                                lng,
                              );

                              const nearby =
                                distance <=
                                (details.georadius ? details.georadius : 150);

                              setIsNearby(nearby);
                              if (!nearby) {
                                toast.error(t("move_closer_to_monument"));
                                hide();
                                return;
                              } else {
                                setCameraOpen(true);
                                setTimeout(() => {
                                  hide();
                                }, 500);
                              }
                            },
                            (err) => {
                              console.error("Geolocation error:", err);
                              toast.error("location_permission_required");
                            },
                            { enableHighAccuracy: true },
                          );
                        }}
                        title={t("open_camera")}
                        className={`cursor-pointer absolute right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition
  ${details?.avenabled && details?.avlocation ? "top-36" : "top-20"}
`}
                      >
                        <Camera className="h-8 w-8 text-white" />

                        {/* badge */}
                        <span className="absolute -right-2 -top-1 rounded-full bg-teal-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          AR
                        </span>
                      </button>
                    )}
                  </div>
                )}

                <AnimatePresence>
                  {mainViewerOpen && details.image?.secure_url && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-[100%] fixed inset-0 z-[9999] bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 md:p-8"
                      onClick={() => setMainViewerOpen(false)}
                    >
                      {/* CLOSE BUTTON */}
                      <button
                        onClick={() => setMainViewerOpen(false)}
                        className="cursor-pointer absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50"
                      >
                        <X size={32} />
                      </button>

                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative max-w-7xl max-h-[90vh] w-auto h-auto outline-none flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <img
                          src={details.image.secure_url}
                          alt={safeText(details.title)}
                          className="max-w-full max-h-[85vh] object-contain drop-shadow-2xl rounded-lg"
                        />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!details.image?.secure_url && (
                  <div className="relative h-[420px] w-full overflow-hidden rounded-xl shadow-md ring-1 ring-border">
                    <div className="flex justify-center items-center h-full bg-gray-200 dark:bg-gray-700 rounded-t-2xl">
                      <ImageIcon className="h-8 w-8 text-slate-400 dark:text-slate-600" />
                    </div>

                    <button
                      onClick={handleBookmarkToggle}
                      className="cursor-pointer absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                      aria-label="Toggle bookmark"
                    >
                      {isBookmarked ? (
                        <BookmarkCheck
                          className="
        h-8 w-8 cursor-pointer
        text-teal-400
        drop-shadow-[0_0_6px_rgba(45,212,191,0.6)]
      "
                        />
                      ) : (
                        <Bookmark
                          className="
        h-8 w-8 cursor-pointer
        text-white/90
        hover:text-teal-300
        transition-colors
      "
                        />
                      )}
                    </button>

                    {details.avenabled && details.avlocation && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openStreetViewFromApi(details.avlocation);
                        }}
                        aria-label="Open street view"
                        title={t("open_street_view")}
                        className="cursor-pointer absolute top-20 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                      >
                        <MapPinned className="h-8 w-8 text-white cursor-pointer" />

                        {/* 360 badge */}
                        <span className="absolute -right-2 -top-1 rounded-full bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          360
                        </span>
                      </button>
                    )}

                    {details.arenabled && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          show();

                          navigator.geolocation.getCurrentPosition(
                            (pos) => {
                              const userLat = pos.coords.latitude;
                              const userLng = pos.coords.longitude;

                              const [lng, lat] = details.location;
                              const distance = getDistanceInMeters(
                                userLat,
                                userLng,
                                lat,
                                lng,
                              );

                              const nearby =
                                distance <=
                                (details.georadius ? details.georadius : 150);
                              setIsNearby(nearby);
                              if (!nearby) {
                                toast.error(t("move_closer_to_monument"));
                                hide();
                                return;
                              } else {
                                setCameraOpen(true);
                                setTimeout(() => {
                                  hide();
                                }, 500);
                              }
                            },
                            (err) => {
                              console.error("Geolocation error:", err);
                              toast.error(t("location_permission_required"));
                            },
                            { enableHighAccuracy: true },
                          );
                        }}
                        title={t("open_camera")}
                        className={`cursor-pointer absolute right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition
  ${details?.avenabled && details?.avlocation ? "top-36" : "top-20"}
`}
                      >
                        <Camera className="h-8 w-8 text-white" />

                        {/* badge */}
                        <span className="absolute -right-2 -top-1 rounded-full bg-teal-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          AR
                        </span>
                      </button>
                    )}
                  </div>
                )}

                {/* 🏛 Title + Region */}
                <section>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    {safeText(details.title || details.name)}
                  </h2>
                  {details.region &&
                    (details.region.title || details.region.name) && (
                      <p className="mt-1 text-sm flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        {safeText(details.region.title || details.region.name)}
                      </p>
                    )}
                </section>

                {/* 📖 Content */}
                {(details.content?.brief || details.content?.extended) && (
                  <section className="prose max-w-none text-sm leading-relaxed text-muted-foreground space-y-3 dark:prose-invert whitespace-pre-wrap">
                    {details.content?.brief && (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: normalizeHTML(details.content.brief),
                        }}
                      />
                    )}
                    {details.content?.extended && (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: normalizeHTML(details.content.extended),
                        }}
                      />
                    )}
                  </section>
                )}

                {/* 🏷 Meta */}
                {hasAnyDetails && (
                  <section className="flex flex-wrap gap-2">
                    {safeText(details?.era) && (
                      <Badge
                        className={`whitespace-normal break-words ${customStyle || customStyleDefault
                          }`}
                      >
                        {t("shortcut.tourist_attraction_details.era")}:{" "}
                        {details.era}
                      </Badge>
                    )}
                    {safeText(details?.year) && (
                      <Badge
                        className={`whitespace-normal break-words ${customStyle || customStyleDefault
                          }`}
                      >
                        {t("shortcut.tourist_attraction_details.year")}:{" "}
                        {details.year}
                      </Badge>
                    )}
                    {safeText(details?.size) && (
                      <Badge
                        className={`whitespace-normal break-words ${customStyle || customStyleDefault
                          }`}
                      >
                        {t("shortcut.tourist_attraction_details.size")}:{" "}
                        {details.size}
                      </Badge>
                    )}
                    {safeText(details?.mtype) && (
                      <Badge
                        className={`whitespace-normal break-words ${customStyle || customStyleDefault
                          }`}
                      >
                        {t("shortcut.tourist_attraction_details.type")}:{" "}
                        {details.mtype}
                      </Badge>
                    )}
                    {details?.featured && (
                      <Badge
                        className={`whitespace-normal break-words ${customStyle || customStyleDefault
                          }`}
                      >
                        {t("shortcut.tourist_attraction_details.featured")}
                      </Badge>
                    )}
                    {details?.rare && (
                      <Badge
                        className={`whitespace-normal break-words${customStyle || customStyleDefault
                          }`}
                      >
                        {t("shortcut.tourist_attraction_details.rare")}
                      </Badge>
                    )}
                    {details?.popularity && details?.popularity !== "0" && (
                      <Badge
                        className={`whitespace-normal break-words ${customStyle || customStyleDefault
                          }`}
                      >
                        {t("shortcut.tourist_attraction_details.popularity")}:{" "}
                        {details.popularity}
                      </Badge>
                    )}
                    {details?.priority && (
                      <Badge
                        className={`whitespace-normal break-words ${customStyle || customStyleDefault
                          }`}
                      >
                        {t("shortcut.tourist_attraction_details.priority")}:{" "}
                        {details.priority}
                      </Badge>
                    )}
                  </section>
                )}

                {/* 🏠 Address */}
                {plainAddress && (
                  <section>
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
                      <Layers className="h-4 w-4 text-gray-500" />{" "}
                      {t("shortcut.tourist_attraction_details.address")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {plainAddress}
                    </p>
                  </section>
                )}

                {/* 🌍 Region Info */}
                {details.region.content && (
                  <section>
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4 text-gray-500" />{" "}
                      {t("shortcut.tourist_attraction_details.region_info")}
                    </h3>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {details.region.content?.brief && (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: normalizeHTML(details.region.content.brief),
                          }}
                        />
                      )}

                      {details.region.content?.extended && (
                        <div
                          className="mt-2"
                          dangerouslySetInnerHTML={{
                            __html: normalizeHTML(
                              details.region.content.extended,
                            ),
                          }}
                        />
                      )}
                    </div>
                  </section>
                )}

                {/* 📷 Image Credit */}
                {details?.imagecredit && details.imagecredit.replace(/<[^>]*>/g, "").trim() !== "" && (
                  <section>
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
                      <Info className="h-4 w-4 text-gray-500" />
                      {t("shortcut.tourist_attraction_details.image_credit")}
                    </h3>

                    <div
                      className="
    text-sm text-muted-foreground
    prose prose-sm max-w-none
    [&_a]:text-blue-600
    [&_a]:underline
    hover:[&_a]:text-blue-800
  "
                      dangerouslySetInnerHTML={{ __html: details.imagecredit }}
                    />
                  </section>
                )}

                {/* 🏷 Theme / Subtheme */}
                {(details?.theme?.length > 0 ||
                  details?.subtheme?.length > 0) && (
                    <section>
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 text-gray-500" />{" "}
                        {t("shortcut.tourist_attraction_details.classification")}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {details.theme?.map((th: any, i: number) => (
                          <Badge
                            key={th._id || `theme-${i}`}
                            className={`whitespace-normal break-words ${customStyle || customStyleDefault
                              }`}
                          >
                            {safeText(th.title || th.name)}
                          </Badge>
                        ))}
                        {details.subtheme?.map((sth: any, i: number) => (
                          <Badge
                            key={sth._id || `subtheme-${i}`}
                            className={`whitespace-normal break-words ${customStyle || customStyleDefault
                              }`}
                          >
                            {safeText(sth.title || sth.name)}
                          </Badge>
                        ))}
                      </div>
                    </section>
                  )}

                {/* 🖼 Gallery */}
                {!!details.gallery?.length && (
                  <section>
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-lg text-foreground">
                      <ImageIcon className="h-5 w-5 text-slate-400 dark:text-slate-600" />
                      {t("shortcut.tourist_attraction_details.gallery")}
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {details.gallery.map((img: any, i: number) =>
                        img.secure_url ? (
                          <div
                            key={img.secure_url || `gallery-${i}`}
                            onClick={() => openViewer(i)}
                            className="cursor-pointer group relative h-40 overflow-hidden rounded-xl shadow-md ring-1 ring-border"
                          >
                            <Image
                              src={img.secure_url}
                              alt=""
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {/* Hover Icon Overlay */}
                            <div className="absolute inset-0 bg-black/10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 pointer-events-none">
                              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 scale-100 md:scale-90 md:group-hover:scale-100 transition-transform duration-300">
                                <Maximize2 size={18} />
                              </div>
                            </div>
                          </div>
                        ) : null,
                      )}
                    </div>
                  </section>
                )}

                <AnimatePresence>
                  {viewerOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-[100%] fixed inset-0 z-[9999] bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 md:p-8"
                      onClick={closeViewer}
                    >
                      {/* CLOSE BUTTON */}
                      <button
                        onClick={closeViewer}
                        className="cursor-pointer absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50"
                      >
                        <X size={32} />
                      </button>

                      {/* PREVIOUS */}
                      {!isSingleImage && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                          }}
                          className="cursor-pointer absolute left-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
                        >
                          <ChevronLeft className="h-8 w-8" />
                        </button>
                      )}

                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative max-w-7xl max-h-[90vh] w-auto h-auto outline-none flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <img
                          src={details.gallery[activeIndex].secure_url}
                          alt=""
                          className="max-w-full max-h-[85vh] object-contain drop-shadow-2xl rounded-lg"
                        />
                      </motion.div>

                      {/* NEXT */}
                      {!isSingleImage && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                          }}
                          className="cursor-pointer absolute right-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
                        >
                          <ChevronRight className="h-8 w-8" />
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 🏛 Nearby Monuments */}
                {!!details.nearbymonuments?.length && (
                  <section>
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-lg text-foreground">
                      <Landmark className="h-5 w-5 text-gray-500" />{" "}
                      {t(
                        "shortcut.tourist_attraction_details.nearby_monuments",
                      )}
                    </h3>
                    <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                      {details.nearbymonuments.map((m: any) => (
                        <div
                          key={m._id}
                          onClick={() => onOpenAnother(m._id)}
                          className="cursor-pointer group relative flex flex-col h-full overflow-hidden rounded-2xl bg-white dark:bg-[#15191f] border border-slate-200/80 dark:border-slate-700/60 shadow-md hover:shadow-xl transition-all border"
                        >
                          <div className="h-48 w-full overflow-hidden bg-muted flex items-center justify-center">
                            {m.image?.secure_url ? (
                              <img
                                src={m.image.secure_url}
                                alt={safeText(m.title)}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                              />
                            ) : (
                              <ImageIcon className="h-9 w-8 text-slate-400 dark:text-slate-600" />
                            )}
                          </div>

                          <div className="flex flex-col flex-1 justify-between p-4">
                            <h4 className="text-sm font-semibold text-foreground">
                              {safeText(m.title)}
                            </h4>

                            {m.content?.brief && (
                              <p
                                className="text-xs text-muted-foreground mt-1 line-clamp-2 whitespace-pre-wrap"
                                dangerouslySetInnerHTML={{
                                  __html: normalizeHTML(m.content.brief),
                                }}
                              />
                            )}
                            {/* If no content, keep height consistent */}
                            {!m.content?.brief && <div className="h-5"></div>}

                            <Button
                              size="sm"
                              className={`cursor-pointer w-full rounded-full mt-3 ${customStyle || customStyleDefault
                                } group-hover:opacity-90`}
                            >
                              {t("tourDetails.viewDetails")}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 🧭 Related Tours */}
                {!!details.relatedtours?.length && (
                  <section>
                    {details.relatedtours.filter(
                      (tour: any) => !(localTourId && localTourId === tour._id),
                    ).length > 0 && (
                        <h3 className="mb-3 flex items-center gap-2 font-semibold text-lg text-foreground">
                          <Route className="h-5 w-5 text-gray-500" />{" "}
                          {t("shortcut.tourist_attraction_details.related_tours")}
                        </h3>
                      )}
                    <div>
                      <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                        {details.relatedtours
                          .filter(
                            (tour: any) =>
                              !(localTourId && localTourId === tour._id),
                          )
                          .map((tour: any) => (
                            <div
                              key={tour._id}
                              onClick={() => {
                                if (!(localTourId !== tour._id)) {
                                  router.push(`/tours/detail/?id=${tour._id}`);
                                } else if (!localTourId) {
                                  router.push(`/tours/detail/?id=${tour._id}`);
                                }
                              }}
                              className={`
  group relative flex flex-col h-full overflow-hidden rounded-2xl
  bg-white dark:bg-[#15191f] border border-slate-200/80 dark:border-slate-700/60 shadow-md transition-all border
  ${!localTourId ? "cursor-pointer hover:shadow-xl" : "cursor-not-allowed"}
   ${!(localTourId !== tour._id)
                                  ? "cursor-pointer hover:shadow-xl"
                                  : "cursor-not-allowed"
                                }
`}
                            >
                              {/* IMAGE */}
                              <div className="h-48 w-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                {tour.image?.secure_url ? (
                                  <img
                                    src={tour.image.secure_url}
                                    alt={safeText(tour.title)}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                                  />
                                ) : (
                                  <ImageIcon className="h-9 w-8 text-slate-400 dark:text-slate-600" />
                                )}
                              </div>

                              {/* CONTENT + BUTTON */}
                              <div className="flex flex-col flex-1 justify-between p-4">
                                {/* Text Section (auto-height) */}
                                <div className="flex-1">
                                  <h3 className="line-clamp-1 text-base font-semibold text-sm font-semibold text-foreground">
                                    {safeText(tour.title)}
                                  </h3>

                                  {tour.content?.brief && (
                                    <p
                                      className="text-xs text-muted-foreground mt-1 line-clamp-2 whitespace-pre-wrap"
                                      dangerouslySetInnerHTML={{
                                        __html: normalizeHTML(
                                          tour.content.brief,
                                        ),
                                      }}
                                    />
                                  )}

                                  {/* If no content, keep height consistent */}
                                  {!tour.content?.brief && (
                                    <div className="h-5"></div>
                                  )}
                                </div>

                                {/* BUTTON ALWAYS AT BOTTOM */}
                                <Button
                                  size="sm"
                                  className={`cursor-pointer w-full rounded-full mt-3 ${customStyle || customStyleDefault
                                    } group-hover:opacity-90`}
                                  disabled={
                                    localTourId
                                      ? localTourId !== tour._id
                                      : false
                                  }
                                >
                                  {t(
                                    "shortcut.tourist_attraction_details.go_tour",
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* 🏬 Nearby Services */}
                {!!details.nearbyservices?.length && (
                  <section>
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-lg text-foreground">
                      <Store className="h-5 w-5 text-gray-500" />{" "}
                      {t("shortcut.tourist_attraction_details.nearby_services")}
                    </h3>
                    <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                      {details.nearbyservices.map((srv: any) => (
                        <div
                          key={srv._id || srv.name}
                          onClick={() => openPlaceDetails(srv)}
                          className="cursor-pointer group relative flex flex-col h-full overflow-hidden rounded-2xl bg-white dark:bg-[#15191f] border border-slate-200/80 dark:border-slate-700/60 shadow-md hover:shadow-xl transition-all border"
                        >
                          {/* IMAGE */}
                          <div className="h-48 w-full overflow-hidden bg-muted flex items-center justify-center">
                            {srv.image?.secure_url ? (
                              <img
                                src={srv.image?.secure_url}
                                alt={safeText(srv.name)}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                              />
                            ) : (
                              <ImageIcon className="h-9 w-8 text-slate-400 dark:text-slate-600" />
                            )}
                          </div>
                          <div className="flex flex-col flex-1 justify-between p-4">
                            <div className="flex-1">
                              <h3 className="line-clamp-1 text-base font-semibold text-sm font-semibold text-foreground">
                                {safeText(srv.name)}
                              </h3>
                              {srv.category && (
                                <p className="text-xs text-muted-foreground">
                                  {t(
                                    "shortcut.tourist_attraction_details.category",
                                  )}
                                  : {safeText(srv.category.name)}
                                </p>
                              )}
                              {/* If no content, keep height consistent */}
                              {!srv.category && <div className="h-5"></div>}
                            </div>
                            {/* ✅ DETAILS BUTTON */}
                            <Button
                              size="sm"
                              className={`cursor-pointer w-full rounded-full mt-3 ${customStyle || customStyleDefault
                                } group-hover:opacity-90`}
                            >
                              {t("tourDetails.viewDetails")}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )
          )}
        </div>

        {/* ---------------- Footer ---------------- */}
        <div className="border-t bg-background p-6">
          <Button
            size="lg"
            onClick={() => setMapOpen(true)}
            className={`cursor-pointer w-full rounded-full flex items-center justify-center gap-2 ${customStyle || customStyleDefault
              }`}
          >
            <MapPin className="h-5 w-5" />
            {t("view_map")}
          </Button>
        </div>

        {details && (
          <MonumentMapModal
            open={mapOpen}
            onClose={() => setMapOpen(false)}
            monument={details}
            showMonument={!!details.nearbymonuments?.length}
            showAttraction={!!details.nearbyservices?.length}
          />
        )}

        {cameraOpen && (
          <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center">
            {/* ❌ CLOSE CAMERA */}
            <button
              // onClick={() => setCameraOpen(false)}
              onClick={closeCamera}
              className="cursor-pointer absolute top-4 right-4 z-[10000] bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition"
              aria-label="Close camera"
            >
              <X className="h-6 w-6" />
            </button>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover
    ${isMobile && cameraFacing === "user" ? "scale-x-[-1]" : ""}
    ${!isMobile && cameraFacing != "user" ? "scale-x-[-1]" : ""}
  `}
            />

            {/* GOSE LOGO */}
            <img
              src="/nara_logo.png"
              alt="Nara"
              className="absolute w-32 opacity-80"
            />

            {/* Capture */}
            <button
              onClick={capturePhoto}
              className="cursor-pointer absolute bottom-10 bg-gradient-to-r from-teal-500 via-teal-500 to-teal-500  p-4 rounded-full shadow-lg"
            >
              <Camera className="h-8 w-8 text-white" />
            </button>

            {/* 🔁 SWITCH CAMERA */}
            <button
              onClick={() =>
                setCameraFacing((prev) =>
                  prev === "environment" ? "user" : "environment",
                )
              }
              className={`cursor-pointer absolute top-4 left-4 z-[10000] bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition ${isMobile ? "" : "hidden"
                }`}
              aria-label="Switch camera"
            >
              <SwitchCamera className="h-6 w-6" />
            </button>

            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {previewOpen && capturedImage && (
          <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center">
            {/* Close */}
            <button
              onClick={() => setPreviewOpen(false)}
              className="cursor-pointer absolute top-4 right-4 text-white bg-black/60 p-2 rounded-full"
            >
              <X />
            </button>

            {/* Image */}
            <img
              src={capturedImage}
              alt="Captured"
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl shadow-xl"
            />

            {/* Share */}
            <Button
              onClick={shareImage}
              className="cursor-pointer mt-6 rounded-full px-10 py-4 bg-gradient-to-r from-teal-500 via-teal-500 to-teal-500 text-white shadow-lg hover:opacity-90 transition"
            >
              {isMobile ? t("share_photo") : t("download_photo")}
            </Button>
          </div>
        )}
        {activePlace && (
          <PlaceDetailModal
            open={placeOpen}
            onClose={() => setPlaceOpen(false)}
            loading={placeLoading}
            details={activePlace}
            customStyle={customStyleDefault}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
