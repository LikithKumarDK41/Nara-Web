"use client";

import { motion } from "framer-motion";
import { ImageIcon, Trash2, ArrowRight, Star, ScanEye } from "lucide-react";
import { normalizeHTML } from "@/lib/utils";
import type { Monument } from "@/lib/types/userTour.types";

interface MonumentCardProps {
    monument: Monument & { bookmarkId?: string; visitId?: string; name?: string };
    t: (key: string) => string;
    idx?: number;
    onDelete?: () => void;
    onClick?: () => void;
}

export default function MonumentCard({
    monument: m,
    t,
    idx = 0,
    onDelete,
    onClick,
}: MonumentCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="group relative flex flex-col h-full p-3 rounded-[3rem] bg-white dark:bg-[#1e293b] dark:hover:bg-[#334155] border border-slate-100 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-700 cursor-pointer"
            onClick={onClick}
        >
            {/* Inset Image Container */}
            <div className="relative h-[280px] w-full rounded-[2.2rem] overflow-hidden bg-slate-100/50 dark:bg-slate-950/40 shrink-0 border border-slate-50 dark:border-white/5">
                {m.image?.secure_url ? (
                    <img
                        src={m.image.secure_url}
                        alt={m.title || m.name}
                        className="block h-full w-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon className="h-10 w-10 text-slate-400 dark:text-slate-700" />
                    </div>
                )}

                {/* DELETE BUTTON */}
                {onDelete && (
                    <button
                        className="cursor-pointer absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-md text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm border border-white/20"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        title={t("delete") || "Delete"}
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}

                {/* Badge: AR Enabled */}
                {m.arenabled && (
                    <div className="absolute top-5 right-5 z-20">
                        <div className="px-3 py-1.5 rounded-full bg-teal-500/90 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1 shadow-sm border border-white/20">
                            <ScanEye className="w-3.5 h-3.5" />
                            <span>AR</span>
                        </div>
                    </div>
                )}


                {/* Ambient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* ✍️ Content Area */}
            <div className="flex-1 px-8 py-9 flex flex-col min-h-0 bg-transparent">
                <div className="flex-1 space-y-4">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white line-clamp-2 font-serif italic tracking-tight leading-tight">
                        {m.title || m.name}
                    </h3>

                    {(m.content?.brief || m.content?.extended || m.description) && (
                        <p
                            className="text-sm text-slate-500 dark:text-white/40 line-clamp-3 leading-relaxed font-light"
                            dangerouslySetInnerHTML={{
                                __html: normalizeHTML(
                                    m.content?.brief || m.content?.extended || m.description || ""
                                ),
                            }}
                        />
                    )}

                    {/* Rating Stars - Clean Minimal Design */}
                    <div className="flex items-center gap-1">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Star
                                key={i}
                                className={`h-3 w-3 ${i < (m.popularity || 0)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-200 dark:text-white/10"
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Subtheme Chips */}
                    {m.subtheme && m.subtheme.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                            {m.subtheme.map((s) => (
                                <span
                                    key={s._id}
                                    className="
                                        rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider
                                        bg-slate-100 text-slate-600
                                        dark:bg-white/10 dark:text-white/70
                                    "
                                >
                                    {s.title}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Architectural Full-Width Action */}
                <div className="mt-8 pt-7 border-t border-slate-50 dark:border-white/5">
                    <div className="flex items-center justify-between group/link">
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.25em] transition-colors duration-300">
                            {t("Details") || "Details"}
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
