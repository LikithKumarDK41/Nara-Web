"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hook";
import { selectShortcuts, setActiveTheme } from "@/lib/store/slices/globalSlice";
import { MapPinned } from "lucide-react";
import { useLocale } from "@/providers/LocaleProvider";
import { motion, AnimatePresence } from "framer-motion";

// Embedded Components
import EmbeddedRegionMap from "./embedded/EmbeddedRegionMap";
import EmbeddedSearch from "./embedded/EmbeddedSearch";
import EmbeddedStreetView from "./embedded/EmbeddedStreetView";

function QuickAccessContentInner({ standalone }: { standalone: boolean }) {
    const shortcuts = useAppSelector(selectShortcuts);
    const { t } = useLocale();
    const router = useRouter();
    const searchParams = useSearchParams();

    /* -------------------- Priority Logic -------------------- */
    function placeByPriority(list: any[]) {
        const ordered: any[] = [];
        const nullZero: any[] = [];
        const leftovers: any[] = [];

        list.forEach((s) => {
            const p = s.priority ?? 0;
            if (p === 0) nullZero.push(s);
            else if (Number.isInteger(p) && p > 0) ordered[p] = s;
            else leftovers.push(s);
        });
        return nullZero.concat(ordered.filter(Boolean)).concat(leftovers);
    }

    const sectionOne = placeByPriority(
        shortcuts.filter((s: any) => {
            const p = s.priority ?? 0;
            return p >= 0 && p <= 3;
        })
    );

    const [activeTabId, setActiveTabId] = useState<string | null>(null);

    // Initialize active tab
    useEffect(() => {
        if (!activeTabId && sectionOne.length > 0) {
            if (standalone) {
                // Check for URL param
                const tabParam = searchParams.get('tab');
                if (tabParam) {
                    setActiveTabId(tabParam);
                } else {
                    // Default to Priority 1 (Region Map)
                    const regionItem = sectionOne.find((s: any) => s.priority === 1);
                    if (regionItem) setActiveTabId(regionItem._id);
                    else setActiveTabId(sectionOne[0]._id);
                }
            } else {
                // Home mode: Default to Priority 1 (Region Map) to look "active"/selected
                const regionItem = sectionOne.find((s: any) => s.priority === 1);
                if (regionItem) setActiveTabId(regionItem._id);
                else setActiveTabId(sectionOne[0]._id);
            }
        }
    }, [sectionOne, activeTabId, standalone, searchParams]);

    if (sectionOne.length === 0) return null;

    const activeItem = sectionOne.find(s => s._id === activeTabId);

    return (
        <section className={`w-full space-y-8 ${standalone ? "py-8" : ""}`}>
            <span className="text-2xl font-bold mb-8 text-center bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent block sm:hidden">
                {t("home.quick_access")}
            </span>

            {/* TABS GRID */}
            <div
                className="
                    grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5
                    justify-center items-center
                    max-w-4xl mx-auto
                "
            >
                {sectionOne.map((item: any) => (
                    <QuickAccessTab
                        key={item._id}
                        item={item}
                        isActive={standalone ? activeTabId === item._id : false}
                        onClick={() => {
                            if (!standalone) {
                                // Navigate to Quick Access Page with tab param
                                router.push(`/quick-access?tab=${item._id}`);
                            } else {
                                setActiveTabId(item._id);
                            }
                        }}
                    />
                ))}
            </div>

            {/* ACTIVE CONTENT AREA - ONLY IN STANDALONE MODE */}
            {standalone && (
                // <div className="w-full min-h-[500px] bg-slate-50/50 dark:bg-[#0f1115]/50 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-1 md:p-6 overflow-hidden">
                <div className="w-full p-1 overflow-hidden">
                    <AnimatePresence mode="wait">
                        {activeItem && (
                            <motion.div
                                key={activeItem._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="w-full h-full"
                            >
                                {renderEmbeddedContent(activeItem)}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </section>
    );
}

// Wrapper to provide Suspense boundary which is required for useSearchParams
export default function QuickAccessContent(props: { standalone?: boolean }) {
    return (
        <Suspense fallback={<div className="min-h-[200px]" />}>
            <QuickAccessContentInner standalone={props.standalone || false} />
        </Suspense>
    );
}

function renderEmbeddedContent(item: any) {
    const priority = item.priority ?? 0;

    switch (priority) {
        case 1:
            return <EmbeddedRegionMap />;
        case 2:
            return <EmbeddedSearch />;
        case 3:
            return <EmbeddedStreetView />;
        default:
            return (
                <div className="flex items-center justify-center h-full min-h-[400px] text-slate-500">
                    Content not available for {item.title}
                </div>
            );
    }
}

function QuickAccessTab({
    item,
    isActive,
    onClick,
}: {
    item: any;
    isActive: boolean;
    onClick: () => void;
}) {
    const dispatch = useAppDispatch();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const html = document.documentElement;
        setIsDark(html.classList.contains("dark"));
        const observer = new MutationObserver(() => {
            setIsDark(html.classList.contains("dark"));
        });
        observer.observe(html, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    const handleClick = () => {
        // Handle theme switching logic if present in link
        try {
            if (item.link && item.link.trim().startsWith("{")) {
                const parsedLink = JSON.parse(item.link);
                if (parsedLink.theme) {
                    dispatch(setActiveTheme(parsedLink.theme));
                }
            }
        } catch (err) {
            console.error("Link Error", err);
        }
        onClick();
    };

    return (
        <div
            onClick={handleClick}
            className={`
                group relative cursor-pointer
                flex flex-col items-center justify-center gap-3
                w-full h-[110px] md:h-[120px]
                rounded-2xl md:rounded-3xl
                transition-all duration-300 ease-out
                border
                ${isActive
                    ? "bg-white dark:bg-[#1a1f2e] border-teal-500 shadow-lg shadow-teal-500/10 scale-[1.02]"
                    : "bg-white dark:bg-[#0f1115] border-slate-200/80 dark:border-slate-700/60 hover:border-teal-400 dark:hover:border-teal-500 hover:-translate-y-1 hover:shadow-xl"
                }
            `}
        >
            {/* Active Indicator Dot */}
            {isActive && (
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            )}

            {/* Icon */}
            <div className={`
                w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center
                transition-all duration-300
                ${isActive
                    ? "bg-teal-500 text-white shadow-md shadow-teal-500/20"
                    : "bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-900/30 dark:to-teal-800/20 text-teal-600 dark:text-teal-400 border border-teal-200/50 dark:border-teal-500/30"
                }
            `}>
                {item.icon?.secure_url ? (
                    <img
                        src={item.icon.secure_url}
                        alt={item.title}
                        className="w-6 h-6 md:w-9 md:h-9 object-contain"
                        style={{
                            filter: isDark && !isActive
                                ? "brightness(0) saturate(100%) invert(81%) sepia(31%) saturate(545%) hue-rotate(124deg) brightness(98%) contrast(92%)"
                                : !isActive
                                    ? "brightness(0) saturate(100%) invert(70%) sepia(40%) saturate(700%) hue-rotate(124deg) brightness(80%) contrast(115%)"
                                    : "brightness(0) invert(1)" // White for active
                        }}
                    />
                ) : (
                    <MapPinned className="w-6 h-6" />
                )}
            </div>

            {/* Text */}
            <span
                className={`
                    text-xs md:text-sm font-bold text-center px-2
                    transition-colors duration-200
                    ${isActive
                        ? "text-teal-700 dark:text-teal-300"
                        : "text-slate-800 dark:text-slate-200 group-hover:text-teal-700 dark:group-hover:text-teal-300"
                    }
                `}
            >
                {item.title}
            </span>
        </div>
    );
}

