import { motion } from "framer-motion";
import { ImageIcon, ArrowRight, Trash2, PlayCircle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Tour } from "@/lib/types/userTour.types";
import { normalizeHTML } from "@/lib/utils";

interface TourCardProps {
    tour: Tour & { visitId?: string; status?: string; bookmarkId?: string };
    t: (key: string) => string;
    idx?: number;
    onDelete?: () => void;
    showStatus?: boolean;
}

export default function TourCard({ tour, t, idx = 0, onDelete, showStatus = false }: TourCardProps) {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/tours/detail?id=${tour._id}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="group relative flex flex-col h-full p-3 rounded-[3rem] bg-white dark:bg-[#1e293b] dark:hover:bg-[#334155] border border-slate-100 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-700 cursor-pointer"
            onClick={handleClick}
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

                {/* STATUS OVERLAYS */}
                {showStatus && (tour.status === "pause" || tour.status === "start") && (
                    <div className="absolute top-4 left-4 z-20">
                        <div className="flex items-center gap-2 rounded-full bg-black/70 backdrop-blur-md px-3 py-1.5 text-white shadow-lg border border-white/10">
                            <PlayCircle className="h-4 w-4 text-emerald-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                {t("in_progress") || "In Progress"}
                            </span>
                        </div>
                    </div>
                )}
                {showStatus && tour.status === "end" && (
                    <div className="absolute top-4 left-4 z-20">
                        <div className="flex items-center gap-2 rounded-full bg-emerald-600/90 backdrop-blur-md px-3 py-1.5 text-white shadow-lg border border-white/10">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                {t("completed") || "Completed"}
                            </span>
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
                        {tour.title}
                    </h3>

                    {(tour.content?.brief || tour.content?.extended || tour.description) && (
                        <p
                            className="text-sm text-slate-500 dark:text-white/40 line-clamp-3 leading-relaxed font-light"
                            dangerouslySetInnerHTML={{
                                __html: normalizeHTML(
                                    tour.content?.brief || tour.content?.extended || tour.description || ""
                                ),
                            }}
                        />
                    )}
                </div>

                {/* Architectural Full-Width Action */}
                <div className="mt-8 pt-7 border-t border-slate-50 dark:border-white/5 space-y-4">
                    <div className="flex items-center justify-between group/link">
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.25em] transition-colors duration-300">
                            {t("actions.explore_now") || t("Details") || "Explore Now"}
                        </span>
                        <div className="flex-1 mx-4 h-px bg-slate-100 dark:bg-white/5 relative overflow-hidden">
                            <div className="absolute inset-0 bg-slate-900 dark:bg-white -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-900 dark:text-white transform transition-transform duration-500 ease-out group-hover:translate-x-1" />
                    </div>

                    {/* Secondary Action: History (If Completed & ID exists) */}
                    {showStatus && tour.status === "end" && tour.visitId && (
                        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                            <Link
                                target="_blank"
                                href={`/tours/history/finish?visitId=${encodeURIComponent(
                                    tour.visitId,
                                )}&tourId=${encodeURIComponent(tour._id)}`}
                                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 hover:text-teal-500 transition-colors"
                            >
                                <span>{t("buttons.history") || "History"}</span>
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
