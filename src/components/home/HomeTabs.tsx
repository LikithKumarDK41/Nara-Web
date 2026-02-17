"use client";

import Link from "next/link";
import { LayoutGrid, MapPinned } from "lucide-react";
import { useLocale } from "@/providers/LocaleProvider";

interface HomeTabsProps {
    activeTab: "quick_access" | "categories";
}

export default function HomeTabs() {
    const { t } = useLocale();

    return (
        <div className="relative z-20 flex justify-center -mt-6 mb-2 px-4">
            <div className="flex p-1.5 gap-2 bg-white/90 dark:bg-[#1a1d24]/95 backdrop-blur-xl rounded-2xl border border-teal-200/40 dark:border-teal-500/20 shadow-xl shadow-teal-500/10 dark:shadow-teal-900/30">
                <Link
                    href="/quick-access/"
                    title={t("home.quick_access")}
                    className="group
            flex items-center gap-2 px-6 py-3 rounded-xl text-sm md:text-base font-bold transition-all duration-300
            text-slate-600 dark:text-slate-400 hover:bg-gradient-to-r from-teal-500 to-teal-600 hover:text-white dark:hover:text-white"
                >
                    <MapPinned className="w-5 h-5 text-teal-600 dark:text-teal-400 group-hover:text-white dark:group-hover:text-white" />
                    <span className="hidden sm:block">{t("home.quick_access")}</span>
                </Link>

                {/* Separator */}
                <div className="w-px h-6 bg-slate-400 dark:bg-slate-700 my-auto mx-1" />

                <Link
                    href="/explore"
                    title={t("home.explore_categories")}
                    className="group
            flex items-center gap-2 px-6 py-3 rounded-xl text-sm md:text-base font-bold transition-all duration-300
           text-slate-600 dark:text-slate-400 hover:bg-gradient-to-r from-teal-500 to-teal-600 hover:text-white dark:hover:text-white
          "
                >
                    <LayoutGrid className="w-5 h-5 text-teal-600 dark:text-teal-400 group-hover:text-white dark:group-hover:text-white" />
                    <span className="hidden sm:block">{t("home.explore_categories")}</span>
                </Link>
            </div>
        </div >
    );
}
