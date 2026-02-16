"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hook";
import { setActiveTheme, selectShortcuts } from "@/lib/store/slices/globalSlice";
import { MapPinned, Search, ChevronRight } from "lucide-react";
import SearchModal from "@/components/shortcuts-modal/searchModal";
import StreetViewModal from "@/components/shortcuts-modal/streetViewModal";
import RegionMapModal from "@/components/shortcuts-modal/regionMapModal";

export default function QuickAccessContent() {
    const shortcuts = useAppSelector(selectShortcuts);
    const [searchOpen, setSearchOpen] = useState(false);
    const [streetViewOpen, setStreetViewOpen] = useState(false);
    const [regionMapOpen, setRegionMapOpen] = useState(false);

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

    if (sectionOne.length === 0) return null;

    return (
        <>
            <div
                className="
            grid grid-cols-3 gap-3 sm:gap-4
            md:flex md:flex-wrap md:gap-5
            justify-center items-center
            max-w-4xl mx-auto
          "
            >
                <ShortcutRow
                    items={sectionOne}
                    variant="primary"
                    onOpenSearch={() => setSearchOpen(true)}
                    onStreetView={() => setStreetViewOpen(true)}
                    onOpenRegionMap={() => setRegionMapOpen(true)}
                />
            </div>

            <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
            <StreetViewModal
                openModal={streetViewOpen}
                onClose={() => setStreetViewOpen(false)}
            />
            <RegionMapModal
                openMapModal={regionMapOpen}
                onCloseMapModal={() => setRegionMapOpen(false)}
            />
        </>
    );
}

function ShortcutRow({
    items,
    variant,
    onOpenSearch,
    onStreetView,
    onOpenRegionMap,
}: {
    items: any[];
    variant: "primary" | "secondary";
    onOpenSearch: () => void;
    onStreetView: () => void;
    onOpenRegionMap: () => void;
}) {
    const router = useRouter();
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

    const handleShortcutClick = (shortcut: any) => {
        try {
            if (shortcut.link && shortcut.link.trim().startsWith("{")) {
                const parsedLink = JSON.parse(shortcut.link);
                if (parsedLink.theme) {
                    dispatch(setActiveTheme(parsedLink.theme));
                }
            }
            const priority = shortcut.priority ?? null;

            if (priority === 1) return onOpenRegionMap();
            if (priority === 2) return onOpenSearch();
            if (priority === 3) return onStreetView();
        } catch (err) {
            console.error("❌ Link Error:", err);
        }
    };

    return (
        <>
            {items.map((item) => {
                // =========================================================
                // PRIMARY & SECONDARY SHARED DESIGN LANGUAGE
                // "Nara Glass" - Unified Premium Look
                // =========================================================
                const baseCardStyles = `
           group relative cursor-pointer
           bg-white dark:bg-[#0f1115] 
           border border-slate-200/80 dark:border-slate-700/60
           hover:border-teal-400 dark:hover:border-teal-500
           transition-all duration-300 ease-out
           hover:-translate-y-1 
           hover:shadow-[0_12px_40px_-8px_rgba(20,184,166,0.25)]
           dark:hover:shadow-[0_12px_40px_-8px_rgba(20,184,166,0.35)]
           active:scale-95
           flex items-center
        `;

                return (
                    <div
                        key={item._id}
                        onClick={() => handleShortcutClick(item)}
                        className={`
  ${baseCardStyles}
  flex flex-col items-center justify-center gap-3
  w-full md:min-w-[150px] md:max-w-[150px]
  h-[110px] md:h-[120px]
  rounded-2xl md:rounded-3xl
  shadow-md hover:shadow-xl
  bg-gradient-to-br from-white to-slate-50/80 dark:from-[#0f1115] dark:to-[#15191f]
  border-slate-200/80 dark:border-slate-700/60
  hover:scale-105
  hover:shadow-teal-500/20 dark:hover:shadow-teal-900/40
`}
                    >
                        {/* Icon */}
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-900/30 dark:to-teal-800/20 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-200/50 dark:border-teal-500/30 shadow-sm group-hover:shadow-md group-hover:shadow-teal-500/30 transition-all duration-300">
                            {item.icon?.secure_url ? (
                                <img
                                    src={item.icon.secure_url}
                                    alt={item.title}
                                    className="w-6 h-6 md:w-9 md:h-9 object-contain"
                                    style={{
                                        filter: isDark
                                            ? "brightness(0) saturate(100%) invert(81%) sepia(31%) saturate(545%) hue-rotate(124deg) brightness(98%) contrast(92%)"
                                            : "brightness(0) saturate(100%) invert(70%) sepia(40%) saturate(700%) hue-rotate(124deg) brightness(80%) contrast(115%)",
                                    }}
                                />
                            ) : (
                                <MapPinned className="w-6 h-6" />
                            )}
                        </div>

                        {/* Text */}
                        <span
                            className="
    text-xs md:text-sm font-bold
    text-center
    text-slate-800 dark:text-slate-200
    group-hover:text-teal-700 dark:group-hover:text-teal-300
    whitespace-nowrap
    overflow-hidden
    text-ellipsis
    max-w-full
    px-2
    transition-colors duration-200
  "
                            title={item.title}
                        >
                            {item.title}
                        </span>
                    </div>
                );
            })}
        </>
    );
}
