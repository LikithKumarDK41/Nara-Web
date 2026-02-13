"use client";

import { useState, useEffect } from "react";
import { Download, Share2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  downloadScreenshot,
  shareScreenshot,
  copyScreenshotToClipboard,
} from "@/lib/screenshotUtils";
import { useLocale } from "@/providers/LocaleProvider";

interface ScreenshotButtonsProps {
  elementId: string;
  filename?: string;
  shareTitle?: string;
  shareText?: string;
  isMapReady?: boolean;
  mapInstance?: any;
  translationKeys?: {
    download?: string;
    share?: string;
    copy?: string;
    success?: string;
    error?: string;
  };
}

export default function ScreenshotButtons({
  elementId,
  filename = "tour-screenshot.png",
  shareTitle = "check_out_my_tour",
  shareText = "complete_desc",
  isMapReady = true,
  mapInstance,
  translationKeys = {},
}: ScreenshotButtonsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useLocale();

  // Detect mobile/tablet device based on user agent
  useEffect(() => {
    const isMobileDevice =
      typeof window !== "undefined" &&
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsMobile(isMobileDevice);
  }, []);
  const handleDownload = async () => {
    if (!isMapReady) {
      toast.error(t("map_loading"));
      return;
    }
    setIsLoading(true);
    try {
      // Wait for map canvas to fully render
      await new Promise((resolve) => setTimeout(resolve, 1000));
      let mapCanvasDataUrl: string | undefined;
      if (mapInstance && typeof mapInstance.getCanvas === "function") {
        try {
          mapCanvasDataUrl = mapInstance.getCanvas().toDataURL("image/png");
        } catch (e) {
          console.warn("Could not get map canvas data URL:", e);
        }
      }
      await downloadScreenshot(elementId, filename, {}, mapCanvasDataUrl);
      toast.success(t("download_success"));
    } catch (error) {
      toast.error(t("download_failed"));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!isMapReady) {
      toast.error(t("map_loading"));
      return;
    }
    setIsLoading(true);
    try {
      // Wait for map canvas to fully render
      await new Promise((resolve) => setTimeout(resolve, 1000));
      let mapCanvasDataUrl: string | undefined;
      if (mapInstance && typeof mapInstance.getCanvas === "function") {
        try {
          mapCanvasDataUrl = mapInstance.getCanvas().toDataURL("image/png");
        } catch (e) {
          console.warn("Could not get map canvas data URL:", e);
        }
      }
      await shareScreenshot(
        elementId,
        filename,
        {
          title: t(shareTitle),
          text: t(shareText),
        },
        mapCanvasDataUrl,
      );
    } catch (error) {
      try {
        await copyScreenshotToClipboard(elementId);
        toast.success("copied_to_clipboard");
      } catch {
        toast.error(t("failed_to_share"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!isMapReady) {
      toast.error(t("map_loading"));
      return;
    }
    setIsLoading(true);
    try {
      // Wait for map canvas to fully render
      await new Promise((resolve) => setTimeout(resolve, 1000));
      let mapCanvasDataUrl: string | undefined;
      if (mapInstance && typeof mapInstance.getCanvas === "function") {
        try {
          mapCanvasDataUrl = mapInstance.getCanvas().toDataURL("image/png");
          toast.success(t("copied_to_clipboard"));
        } catch (e) {
          toast.error(t("failed_to_copy"));
          console.warn("Could not get map canvas data URL:", e);
        }
      }
      await copyScreenshotToClipboard(elementId, mapCanvasDataUrl);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-3 w-full">
      {/* DESKTOP: Download button */}
      {!isMobile && (
        <Button
          onClick={handleDownload}
          disabled={isLoading || !isMapReady}
          className="flex-1 cursor-pointer py-5 rounded-xl text-lg
            border-2 bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600
            dark:bg-emerald-600 dark:border-emerald-500 dark:hover:bg-emerald-700
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="mr-2 h-5 w-5" />
          {isMapReady ? t("download") : t("loading_share")}
        </Button>
      )}

      {/* MOBILE/TABLET: Share button */}
      {isMobile && (
        <Button
          onClick={handleShare}
          disabled={isLoading || !isMapReady}
          className="w-full cursor-pointer py-5 rounded-xl text-lg
            border-2 bg-purple-500 text-white border-purple-600 hover:bg-purple-600
            dark:bg-purple-600 dark:border-purple-500 dark:hover:bg-purple-700
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Share2 className="mr-2 h-5 w-5" />
          {isMapReady ? t("share") : t("loading_share")}
        </Button>
      )}
    </div>
  );
}
