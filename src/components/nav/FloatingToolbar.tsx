
"use client";
import { useEffect, useState } from "react";

import {
    Video,
    MapPinned, Heart
} from "lucide-react";

import { useLocale } from "@/providers/LocaleProvider";
import { useAppSelector } from "@/lib/store/hook";

/* =======================================================================
  FLOATING TOOLBAR
======================================================================= */
export default function FloatingToolbar({ onOpenSearch }: { onOpenSearch: () => void }) {
    const { t, locale } = useLocale();
      const authData = useAppSelector((s) => s.auth.data);
      const isLoggedIn = !!authData?.user;

    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

    function resolveTheme(): "light" | "dark" {
        const mode = localStorage.getItem("theme-mode") || "system";

        if (mode === "dark") return "dark";
        if (mode === "light") return "light";

        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    }

    useEffect(() => {
        // initial
        setResolvedTheme(resolveTheme());

        const handler = () => setResolvedTheme(resolveTheme());

        window.addEventListener("theme-changed", handler);

        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        mq.addEventListener("change", handler);

        return () => {
            window.removeEventListener("theme-changed", handler);
            mq.removeEventListener("change", handler);
        };
    }, []);

    return (
        <div
            className={`
        hidden lg:flex
        fixed right-6
        z-[30]
        flex flex-col items-end gap-4
        pointer-events-none ${isLoggedIn ? 'bottom-30' :'bottom-14'}
      `}
        >
            <DiamondButton
                label={t('nav.tours')}
                gradient="from-teal-500 via-cyan-500 to-emerald-400"
                onClick={() => (window.location.href = "/tours")}
            >
                <MapPinned className="h-5 w-5 text-white -rotate-45" />
            </DiamondButton>

            <DiamondButton
                label={t('nav.myList')}
                gradient="from-rose-500 via-pink-500 to-fuchsia-500"
                onClick={() => (window.location.href = "/mylist")}
            >
                <Heart className="h-5 w-5 text-white -rotate-45" />
            </DiamondButton>

            <DiamondButton
                label={t("nav.videos")}
                gradient="from-cyan-500 via-sky-500 to-indigo-500"
                onClick={() => {
                    const videoUrl = `https://naraiseki.nichi.in/public-videos/?${new URLSearchParams({
                        lang: locale,
                        theme: resolvedTheme,
                    }).toString()}`;

                    window.open(videoUrl, "_blank", "noopener,noreferrer");
                }}
            >
                <Video className="h-5 w-5 text-white -rotate-45" />
            </DiamondButton>
        </div>
    );
}

/* =========================================
   Diamond Button with Premium Tooltip
========================================= */
function DiamondButton({
    children,
    label,
    gradient,
    onClick,
}: {
    children: React.ReactNode;
    label: string;
    gradient: string;
    onClick: () => void;
}) {
    return (
        <div className="relative group pointer-events-auto">
            {/* Tooltip */}
            <div
                className="
          absolute right-14 top-1/2 -translate-y-1/2
          opacity-0 group-hover:opacity-100
          translate-x-2 group-hover:translate-x-0
          transition-all duration-300 ease-out
          whitespace-nowrap
          flex items-center gap-2
          bg-black/80 backdrop-blur-md
          text-white text-xs font-semibold tracking-wide
          px-3 py-2 rounded-full
          shadow-[0_8px_30px_rgba(0,0,0,0.35)]
        "
            >
                <span className="h-2 w-2 rounded-full bg-teal-400" />
                {label}
            </div>
            <button
                onClick={onClick}
                className={`
    cursor-pointer
    h-11 w-11
    flex items-center justify-center
    rounded-xl rotate-45

    /* 🌫 Base depth shadow */
    shadow-[0_8px_20px_rgba(0,0,0,0.35)]

    /* ✨ Soft ambient glow */
    before:content-['']
    before:absolute
    before:inset-0
    before:rounded-xl
    before:bg-gradient-to-br ${gradient}
    before:blur-xl
    before:opacity-30
    before:-z-10

    /* 🎨 Gradient background */
    bg-gradient-to-br ${gradient}

    /* 🔁 Interaction */
    transition-all duration-300
    hover:scale-105 hover:-translate-x-0.5
    hover:shadow-[0_12px_35px_rgba(0,0,0,0.45)]
  `}
            >
                {children}
            </button>
        </div>
    );
}
