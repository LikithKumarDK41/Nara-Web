"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone, Monitor, ChevronRight, Apple } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: "accepted" | "dismissed";
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if app is currently running in standalone mode (already installed)
        const checkStandalone = () => {
            return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
        };

        if (checkStandalone()) {
            setIsStandalone(true);
            return;
        }

        // Catch the event when app is installed from elsewhere (e.g. browser menu)
        const handleAppInstalled = () => {
            setIsStandalone(true);
        };

        window.addEventListener("appinstalled", handleAppInstalled);

        // iOS detection
        const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(ios);

        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Only show after a small delay to not annoy the user immediately
            const timer = setTimeout(() => {
                const dismissed = localStorage.getItem("pwa_prompt_dismissed");
                if (!dismissed) {
                    setShowPrompt(true);
                }
            }, 5000);

            return () => clearTimeout(timer);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // Show iOS prompt if it's iOS and not standalone
        if (ios && !localStorage.getItem("pwa_prompt_dismissed_ios")) {
            const timer = setTimeout(() => {
                setShowPrompt(true);
            }, 5000);
            return () => clearTimeout(timer);
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            console.log("User accepted the PWA install prompt");
            setDeferredPrompt(null);
            setShowPrompt(false);
            setIsStandalone(true);
        }
    };

    const dismissPrompt = () => {
        setShowPrompt(false);
        if (isIOS) {
            localStorage.setItem("pwa_prompt_dismissed_ios", "true");
        } else {
            localStorage.setItem("pwa_prompt_dismissed", "true");
        }
    };

    if (isStandalone || !showPrompt) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-20 left-4 right-4 z-[9999] md:left-auto md:right-6 md:bottom-6 md:w-96"
            >
                <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-5 shadow-2xl relative overflow-hidden group">
                    {/* Background Highlight */}
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />

                    <button
                        onClick={dismissPrompt}
                        className="absolute top-4 right-4 p-1 hover:bg-muted rounded-full transition-colors"
                    >
                        <X className="w-4 h-4 text-muted-foreground" />
                    </button>

                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden border border-border">
                            <img src="/icon-512.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base leading-tight">Install Nara Guide</h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {isIOS
                                    ? "Add to Home Screen for a full app-like experience."
                                    : "Install on your device for faster access and a better experience."}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 space-y-3">
                        {isIOS ? (
                            <div className="bg-muted/50 rounded-xl p-3 text-xs space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 flex items-center justify-center bg-background rounded border border-border">1</span>
                                    <span>Tap the <strong className="text-foreground">Share</strong> icon at the bottom</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 flex items-center justify-center bg-background rounded border border-border">2</span>
                                    <span>Scroll down and tap <strong className="text-foreground">Add to Home Screen</strong></span>
                                </div>
                            </div>
                        ) : (
                            <Button
                                onClick={handleInstallClick}
                                disabled={!deferredPrompt}
                                className="w-full h-11 rounded-xl font-semibold gap-2 shadow-lg shadow-primary/20"
                            >
                                <Smartphone className="w-4 h-4" />
                                Install Now
                                <ChevronRight className="w-4 h-4 ml-auto" />
                            </Button>
                        )}

                        <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                            <span className="flex items-center gap-1">
                                <Monitor className="w-3 h-3" /> Desktop
                            </span>
                            <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                            <span className="flex items-center gap-1">
                                <Smartphone className="w-3 h-3" /> Android
                            </span>
                            <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                            <span className="flex items-center gap-1">
                                <Apple className="w-3 h-3" /> iOS
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
