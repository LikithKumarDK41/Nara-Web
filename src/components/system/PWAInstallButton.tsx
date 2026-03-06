"use client";

import { useEffect, useState } from "react";
import { Smartphone, Download } from "lucide-react";
import { useLocale } from "@/providers/LocaleProvider";

interface PWAInstallButtonProps {
    variant?: "menu" | "header";
}

export default function PWAInstallButton({ variant = "menu" }: PWAInstallButtonProps) {
    const { t } = useLocale();
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if app is currently running in standalone mode
        if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone) {
            setIsStandalone(true);
            return;
        }

        const handleAppInstalled = () => {
            setIsStandalone(true);
        };

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener("appinstalled", handleAppInstalled);
        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setDeferredPrompt(null);
            setIsStandalone(true);
        }
    };

    if (isStandalone || !deferredPrompt) return null;

    if (variant === "header") {
        return (
            <button
                onClick={handleInstallClick}
                title="Install App"
                className="h-10 px-3 flex items-center gap-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all font-semibold text-xs border border-primary/20 cursor-pointer"
            >
                <Smartphone className="h-4 w-4" />
                <span className="hidden xl:inline">{t("install_app") || "Install"}</span>
            </button>
        );
    }

    return (
        <button
            onClick={handleInstallClick}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-primary hover:bg-primary/5 transition-all group border border-primary/20 bg-primary/5 cursor-pointer"
        >
            <Smartphone className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-bold">{t("install_app") || "Install App"}</span>
            <Download className="h-4 w-4 ml-auto opacity-50" />
        </button>
    );
}
