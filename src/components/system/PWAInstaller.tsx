"use client";

import { useEffect, useState } from "react";

export default function PWAInstaller() {
  const [, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Manually register service worker since 'register: false' in next.config.ts
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        console.log("PWA Service Worker registered:", reg.scope);
      });
    }

    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      // Don't prevent default! We want the browser's native install UI (address bar icon)
      setDeferredPrompt(e);
    };

    // Handle successful installation
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  return null;
}