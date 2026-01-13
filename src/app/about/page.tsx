"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
    ArrowLeft,
    BookOpen,
    MapPin,
    Compass,
    Image as ImageIcon,
    Share2,
    ChevronRight,
    Maximize2,
    ArrowRight
} from "lucide-react";
import { useRouter } from "next/navigation";

import { apiFetchAboutById, apiFetchByLink } from "@/services/userGlobalservice";
import { selectActiveAboutId } from "@/lib/store/slices/globalSlice";
import { normalizeHTML } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { parseApiLink } from "@/lib/utils";

import type { Monument } from "@/lib/types/userTour.types";

type About = any;

export default function AboutDetailPage() {
    const router = useRouter();
    const activeAboutId = useSelector(selectActiveAboutId);

    const [about, setAbout] = useState<About | null>(null);
    const [monuments, setMonuments] = useState<Monument[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMonuments, setLoadingMonuments] = useState(false);
    const [showImage, setShowImage] = useState(false);

    /* ================= FETCH DATA ================= */
    useEffect(() => {
        if (!activeAboutId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        apiFetchAboutById(activeAboutId)
            .then(setAbout)
            .catch(() => setAbout(null))
            .finally(() => setLoading(false));
    }, [activeAboutId]);

    useEffect(() => {
        if (!about?.link) return;

        const parsed = parseApiLink(about.link);
        if (!parsed) return;

        const { resource, filter } = parsed;

        if (resource !== "monuments") return;

        setLoadingMonuments(true);

        apiFetchByLink<Monument>(resource, filter)
            .then(setMonuments)
            .catch(console.error)
            .finally(() => setLoadingMonuments(false));

    }, [about]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("リンクをコピーしました");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050608] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!about) {
        return (
            <div className="min-h-screen bg-[#050608] flex flex-col items-center justify-center p-6">
                <p className="text-slate-500 mb-6">About not found</p>
                <button onClick={() => router.back()} className="text-sm font-bold text-teal-400">GO BACK</button>
            </div>
        );
    }

    return (
        <div className="text-slate-100 min-h-screen">

            {/* ================= HERO BANNER ================= */}
            <section className="relative h-[380px] w-full overflow-hidden flex items-end">
                {about.image?.secure_url && (
                    <img
                        src={about.image.secure_url}
                        alt={about.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-[#050608]/20 to-transparent" />

                {/* Floating Navigation */}
                <div className="absolute top-6 right-6 z-20">
                    <button
                        onClick={() => setShowImage(true)}
                        className="
      p-2.5
      rounded-xl
      bg-black/40
      hover:bg-black/60
      backdrop-blur-md
      border border-white/10
      text-white
      transition cursor-pointer
    "
                        aria-label="View image fullscreen"
                    >
                        <Maximize2 className="w-5 h-5" />
                    </button>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto w-full px-6 pb-12">
                    <div className="space-y-4">
                        <Badge className="bg-teal-500/20 text-teal-400 border border-teal-500/30 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase">
                            Heritage Story
                        </Badge>
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                            {about.title}
                        </h1>
                    </div>
                </div>
            </section>

            {showImage && about.image?.secure_url && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
                    onClick={() => setShowImage(false)}
                >
                    <img
                        src={about.image.secure_url}
                        alt={about.title}
                        className="max-h-[90vh] max-w-[90vw] object-contain"
                    />

                    {/* Close hint */}
                    <span className="absolute top-6 right-6 text-xs text-white/60">
                        Click anywhere to close
                    </span>
                </div>
            )}

            {/* ================= MAIN CONTENT ================= */}

            {/* STORY CONTENT (Full Display) */}
            {(about.content?.brief || about.content?.extended) && (
                <section className="space-y-8 mt-8">
                    <div className="
  flex items-center gap-3 pb-4
  border-b
  border-slate-200
  dark:border-white/10
">
                        <BookOpen className="w-5 h-5 text-teal-500" />
                        <h2 className="text-lg font-bold tracking-wider text-slate-900 dark:text-white uppercase">{about.title}について</h2>
                    </div>
                    <div className="leading-relaxed text-slate-300 text-base md:text-lg">
                        <div
                            className="
    prose prose-slate
    dark:prose-invert
    max-w-none
    text-slate-800 dark:text-slate-300
    prose-p:leading-relaxed
    prose-p:text-[1.05rem]
    prose-headings:text-slate-900
    dark:prose-headings:text-white
  "
                            dangerouslySetInnerHTML={{
                                __html: normalizeHTML(
                                    about.content?.extended || about.content?.brief
                                ),
                            }}
                        />
                    </div>
                </section>
            )}

            {/* RELATED SPOTS (Editorial List Design) */}
            {monuments.length > 0 && (
                <section className="space-y-12 mt-8">
                    <div className="
  flex items-center gap-3 pb-4
  border-b
  border-slate-200
  dark:border-white/10
">
                        <MapPin className="w-5 h-5 text-teal-500" />
                        <h2 className="text-lg font-bold tracking-wider text-slate-900 dark:text-white uppercase">関連スポット</h2>
                    </div>

                    <div className="space-y-16">
                        {monuments.map((m) => (
                            <div
                                key={m._id}
                                className="
    group
    grid grid-cols-1 md:grid-cols-12
    gap-8 md:gap-12
    items-start
  "
                            >
                                {/* Image Column */}
                                <div className="md:col-span-4 lg:col-span-3">
                                    <div className="
      relative aspect-[4/3]
      rounded-2xl overflow-hidden
      border
      border-slate-200 dark:border-white/10
      bg-slate-100 dark:bg-[#0c0e11]
    ">
                                        {m.image?.secure_url && (
                                            <img
                                                src={m.image.secure_url}
                                                alt={m.title}
                                                className="
            h-full w-full object-cover
            transition-all duration-700
            group-hover:scale-105
          "
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Content Column */}
                                <div className="md:col-span-8 lg:col-span-9 space-y-4">

                                    {/* Title + Divider */}
                                    <div className="flex items-center gap-4">
                                        <h3 className="
        text-xl md:text-2xl font-bold
        text-slate-900 dark:text-white
        group-hover:text-teal-500
        transition-colors
      ">
                                            {m.title}
                                        </h3>

                                        <div className="
        h-px flex-1
        bg-slate-200 dark:bg-white/10
      " />
                                    </div>

                                    {/* Description */}
                                    {m.content?.brief && (
                                        <div
                                            className="
          prose prose-slate
          dark:prose-invert
          max-w-4xl
          text-slate-700 dark:text-slate-400
          prose-p:leading-relaxed
        "
                                            dangerouslySetInnerHTML={{
                                                __html: normalizeHTML(m.content.brief),
                                            }}
                                        />
                                    )}

                                    {/* CTA */}
                                    <div className="pt-2">
                                        <button
                                            className="
          inline-flex items-center gap-2
          text-[10px] font-black
          uppercase tracking-[0.25em]
          text-teal-600 dark:text-teal-400
          hover:text-teal-500
          transition-colors
        "
                                        >
                                            Discover Details
                                            <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>

                                </div>
                            </div>

                        ))}
                    </div>
                </section>
            )}

            {/* ================= RELATED TOURS ================= */}
            {about.relatedtours?.length > 0 && (
                <section className="space-y-8 mt-8">

                    {/* Header */}
                    <div className="
  flex items-center gap-3 pb-4
  border-b
  border-slate-200
  dark:border-white/10
">
                        <Compass className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        <h2 className="text-lg font-bold tracking-wider text-slate-900 dark:text-white uppercase">
                            おすすめの体験
                        </h2>
                    </div>

                    {/* Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                        {about.relatedtours.map((t: any) => (
                            <div
                                key={t._id}
                                className="
            group
            relative
            rounded-2xl
            bg-white/70 dark:bg-white/5
            backdrop-blur-md
            border border-black/5 dark:border-white/10
            shadow-sm hover:shadow-lg
            transition-all
            overflow-hidden
          "
                            >
                                {/* Image */}
                                {t.image?.secure_url && (
                                    <div className="h-40 w-full overflow-hidden">
                                        <img
                                            src={t.image.secure_url}
                                            alt={t.title}
                                            className="
                  h-full w-full object-cover
                  transition-transform duration-500
                  group-hover:scale-[1.05]
                "
                                        />
                                    </div>
                                )}

                                {/* Content */}
                                <div className="p-6 space-y-3">

                                    {/* Title */}
                                    <h3 className="text-base font-semibold text-slate-900 dark:text-white leading-snug">
                                        {t.title}
                                    </h3>

                                    {/* Description */}
                                    {t.content?.brief && (
                                        <div
                                            className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3"
                                            dangerouslySetInnerHTML={{
                                                __html: normalizeHTML(t.content.brief),
                                            }}
                                        />
                                    )}

                                    {/* CTA */}
                                    <div className="pt-2 flex items-center gap-2 text-sm font-medium text-teal-600 dark:text-teal-400">
                                        <span>詳しく見る</span>
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                </section>
            )}

        </div>
    );
}
