"use client";

import Link from "next/link";
import { LayoutGrid, MapPinned } from "lucide-react";
import { useLocale } from "@/providers/LocaleProvider";

interface HomeTabsProps {
    activeTab: "shortcuts" | "categories";
}

export default function HomeTabs({ activeTab }: HomeTabsProps) {
    const { t } = useLocale();

    return (
        <div className="relative z-20 flex justify-center -mt-6 mb-8 px-4">
            <div className="flex p-1.5 gap-2 bg-white/90 dark:bg-[#1a1d24]/95 backdrop-blur-xl rounded-2xl border border-teal-200/40 dark:border-teal-500/20 shadow-xl shadow-teal-500/10 dark:shadow-teal-900/30">
                <Link
                    href="/"
                    className={`
            flex items-center gap-2 px-6 py-3 rounded-xl text-sm md:text-base font-bold transition-all duration-300
            ${activeTab === "shortcuts"
                            ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25 scale-[1.02]"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }
          `}
                >
                    <MapPinned className={`w-5 h-5 ${activeTab === "shortcuts" ? "text-white" : "text-teal-600 dark:text-teal-400"}`} />
                    <span className="hidden sm:block">{t("home.quick_access")}</span>
                </Link>

                <Link
                    href="/explore"
                    className={`
            flex items-center gap-2 px-6 py-3 rounded-xl text-sm md:text-base font-bold transition-all duration-300
            ${activeTab === "categories"
                            ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25 scale-[1.02]"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }
          `}
                >
                    <LayoutGrid className={`w-5 h-5 ${activeTab === "categories" ? "text-white" : "text-teal-600 dark:text-teal-400"}`} />
                    <span className="hidden sm:block">{t("home.explore_categories")}</span>
                </Link>
            </div>
        </div>
    );
}
