"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { LayoutGrid, MapPinned, ChevronRight, X, Heart, Video } from "lucide-react";
import { useLocale } from "@/providers/LocaleProvider";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function HomeTabs() {
    const { t, locale } = useLocale();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

    const isActive = (path: string) => pathname === path;

    useEffect(() => {
        const mode = localStorage.getItem("theme-mode") || "system";
        if (mode === "dark") setResolvedTheme("dark");
        else if (mode === "light") setResolvedTheme("light");
        else setResolvedTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }, []);

    const menuItems = [
        {
            id: 'quick-access',
            href: '/quick-access/',
            icon: MapPinned,
            label: t("home.quick_access"),
            active: isActive('/quick-access/'),
            angle: -85,
        },
        {
            id: 'explore',
            href: '/explore',
            icon: LayoutGrid,
            label: t("home.explore_categories"),
            active: isActive('/explore'),
            angle: -28,
        },
        {
            id: 'mylist',
            href: '/mylist',
            icon: Heart,
            label: t("nav.myList"),
            active: isActive('/mylist'),
            angle: 28,
        },
        {
            id: 'videos',
            href: '#',
            icon: Video,
            label: t("nav.videos"),
            active: false,
            angle: 85,
            onClick: () => {
                const videoUrl = `https://naraiseki.nichi.in/public-videos/?${new URLSearchParams({
                    lang: locale,
                    theme: resolvedTheme,
                }).toString()}`;
                window.open(videoUrl, "_blank", "noopener,noreferrer");
            }
        },
    ];

    return (
        <div
            className="fixed left-0 top-1/2 -translate-y-1/2 z-[100] flex items-center pr-20"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <div className="relative flex items-center">
                {/* Clean Monochrome Background Glow */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, x: -20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.8, x: -20 }}
                            className="absolute -left-2 w-32 h-32 bg-white/20 dark:bg-white/5 blur-3xl pointer-events-none rounded-full"
                        />
                    )}
                </AnimatePresence>

                {/* Elegant Black/White Trigger Button */}
                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        relative z-50 flex items-center justify-end pr-1 w-7 h-15
                        bg-gradient-to-b from-slate-900 to-black dark:from-white dark:to-slate-100
                        text-white dark:text-black
                        rounded-r-2xl shadow-2xl transition-all duration-500
                        border-y border-r border-white/20 dark:border-black/20
                        hover:w-8 group cursor-pointer
                    `}
                >
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0, x: isOpen ? -2 : 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <ChevronRight className={`w-5 h-5 transition-colors ${isOpen ? 'text-slate-400 dark:text-slate-500' : 'text-white dark:text-black'}`} />
                    </motion.div>
                </motion.button>

                {/* Satellite Items Container - Perfectly Centered */}
                <div className="absolute left-0 top-1/2">
                    <AnimatePresence>
                        {isOpen && (
                            <>
                                {menuItems.map((item, index) => (
                                    <TabItem
                                        key={item.id}
                                        {...item}
                                        index={index}
                                    />
                                ))}
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function TabItem({ href, icon: Icon, label, active, angle, index, onClick }: any) {
    // Distance from the trigger: Adjusted offset to prevent overlap (80px radius + 30px base offset)
    const radius = 80;
    const radian = (angle * Math.PI) / 180;
    const x = Math.cos(radian) * radius + 30; // Offset by 30px to the right
    const y = Math.sin(radian) * radius;

    const Content = (
        <motion.div
            initial={{ opacity: 0, x: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, x, y, scale: 1 }}
            exit={{ opacity: 0, x: 0, y: 0, scale: 0.8 }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 28,
                delay: index * 0.03
            }}
            className="absolute top-0 left-0 -translate-y-1/2"
        >
            <div
                className={`
                    group relative flex items-center justify-center w-11 h-11
                    bg-white dark:bg-black
                    text-black dark:text-white
                    rounded-xl shadow-lg border border-slate-200 dark:border-slate-800
                    hover:scale-110 transition-all duration-300 cursor-pointer
                    ${active ? 'ring-2 ring-black dark:ring-white scale-110' : ''}
                `}
                onClick={onClick}
            >
                <Icon className={`w-5 h-5 transition-colors duration-300 ${active ? 'text-black dark:text-white' : 'text-slate-600 dark:text-slate-400 group-hover:text-black dark:group-hover:text-white'}`} />

                {/* Refined Tooltip */}
                <div className={`
                    absolute left-full ml-3 px-3 py-1.5
                    bg-black dark:bg-white text-white dark:text-black
                    text-[10px] font-bold uppercase tracking-widest rounded-lg
                    whitespace-nowrap opacity-0 group-hover:opacity-100
                    translate-x-1 group-hover:translate-x-0
                    transition-all duration-300 pointer-events-none
                    shadow-xl border border-slate-700 dark:border-slate-200
                `}>
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full bg-white dark:bg-black shadow-sm`} />
                        {label}
                    </div>
                </div>
            </div>
        </motion.div>
    );

    if (onClick) return Content;
    return <Link href={href}>{Content}</Link>;
}
