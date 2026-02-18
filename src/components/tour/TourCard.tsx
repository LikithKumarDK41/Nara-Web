"use client";

import { motion } from "framer-motion";
import { ImageIcon, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Tour } from "@/lib/types/userTour.types";
import { normalizeHTML } from "@/lib/utils";

interface TourCardProps {
    tour: Tour;
    t: (key: string) => string;
    idx: number;
}

export default function TourCard({ tour, t, idx }: TourCardProps) {
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="group relative flex flex-col h-full p-3 rounded-[3rem] bg-white dark:bg-[#0a0a0a] border border-slate-100 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-700 cursor-pointer"
            onClick={() => router.push(`/tours/detail?id=${tour._id}`)}
        >
            {/* 🖼️ Premium Inset Image Container */}
            <div className="relative h-[280px] w-full rounded-[2.2rem] overflow-hidden bg-slate-50 dark:bg-zinc-900 shrink-0 border border-slate-50 dark:border-white/5">
                {tour.image?.secure_url ? (
                    <img
                        src={tour.image.secure_url}
                        alt={tour.title}
                        className="block h-full w-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon className="h-10 w-10 text-slate-300 dark:text-zinc-700" />
                    </div>
                )}

                {/* Ambient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* ✍️ Content Area */}
            <div className="flex-1 px-8 py-9 flex flex-col min-h-0 bg-transparent">
                <div className="flex-1 space-y-4">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white line-clamp-2 font-serif italic tracking-tight leading-tight">
                        {tour.title}
                    </h3>

                    {tour.content?.brief && (
                        <p
                            className="text-sm text-slate-500 dark:text-white/40 line-clamp-3 leading-relaxed font-light"
                            dangerouslySetInnerHTML={{
                                __html: normalizeHTML(tour.content.brief),
                            }}
                        />
                    )}
                </div>

                {/* Architectural Full-Width Action */}
                <div className="mt-8 pt-7 border-t border-slate-50 dark:border-white/5">
                    <div className="flex items-center justify-between group/link">
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.25em] transition-colors duration-300">
                            {t("actions.explore_now") || "Explore Now"}
                        </span>
                        <div className="flex-1 mx-4 h-px bg-slate-100 dark:bg-white/5 relative overflow-hidden">
                            <div className="absolute inset-0 bg-slate-900 dark:bg-white -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-900 dark:text-white transform transition-transform duration-500 ease-out group-hover:translate-x-1" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
