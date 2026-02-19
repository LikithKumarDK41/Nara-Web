"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useLocale } from "@/providers/LocaleProvider";
import Image from "next/image";


const HERO_SLIDES = [
    {
        id: 1,
        image: "/naraiseki/1.png",
        titleKey: "home.hero.slides.0.title",
        subtitleKey: "home.hero.slides.0.subtitle",
        descKey: "home.hero.slides.0.description",
        titleJa: "奈良県"
    },
    {
        id: 2,
        image: "/naraiseki/2.png",
        titleKey: "home.hero.slides.1.title",
        subtitleKey: "home.hero.slides.1.subtitle",
        descKey: "home.hero.slides.1.description",
        titleJa: "神聖なる起源"
    },
    {
        id: 3,
        image: "/naraiseki/3.png",
        titleKey: "home.hero.slides.2.title",
        subtitleKey: "home.hero.slides.2.subtitle",
        descKey: "home.hero.slides.2.description",
        titleJa: "世界遺産"
    },
    {
        id: 4,
        image: "/naraiseki/4.png",
        titleKey: "home.hero.slides.3.title",
        subtitleKey: "home.hero.slides.3.subtitle",
        descKey: "home.hero.slides.3.description",
        titleJa: "伝統と味わい"
    },
    {
        id: 5,
        image: "/naraiseki/5.png",
        titleKey: "home.hero.slides.4.title",
        subtitleKey: "home.hero.slides.4.subtitle",
        descKey: "home.hero.slides.4.description",
        titleJa: "古都の響き"
    },
];

const SIDEBAR_TITLE_MAP: Record<string, { en: string; ja: string }> = {
    "home.hero.slides.0.title": { en: "NARA", ja: "奈良県" },
    "home.hero.slides.1.title": { en: "ORIGINS", ja: "神聖" },
    "home.hero.slides.2.title": { en: "HERITAGE", ja: "世界遺産" },
    "home.hero.slides.3.title": { en: "TRADITION", ja: "伝統" },
    "home.hero.slides.4.title": { en: "DESTINY", ja: "古都" },
};

export default function HeroCarousel() {
    const { t, locale } = useLocale();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Parallax effect for the text content
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, []);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    }, []);

    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(handleNext, 8000);
        return () => clearInterval(timer);
    }, [handleNext, isPaused]);

    const currentSlide = HERO_SLIDES[currentIndex];

    return (
        <div ref={containerRef} className="relative w-full h-[100dvh] overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-500">

            {/* ================= IMAGE AREA (70% Desktop, 100% Mobile) ================= */}
            <div className="relative w-full md:w-[70%] h-full flex-shrink-0 z-0 group transition-all duration-500">

                {/* Diagonal Clip Path for Desktop */}
                <div className="absolute inset-0 w-full h-full md:[clip-path:polygon(0_0,100%_0,91%_100%,0%_100%)] z-10">
                    {/* Background Image Layer */}
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.2 }}
                            className="absolute inset-0 w-full h-full"
                        >
                            <motion.div
                                className="w-full h-full relative"
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 10, ease: "linear" }}
                            >
                                <Image
                                    src={currentSlide.image}
                                    alt="Hero Slide"
                                    fill
                                    priority
                                    className="object-cover object-center"
                                    style={{ objectFit: "cover" }}
                                    sizes="(max-width: 768px) 100vw, 75vw"
                                    quality={100}
                                />
                                {/* Overlay Gradients */}
                                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90" />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Content Overlay - Positioned over the image */}
                <motion.div
                    style={{ y: y1, opacity }}
                    className="absolute inset-x-0 bottom-0 h-full flex flex-col justify-end px-6 md:px-16 lg:px-24 z-20 pointer-events-none pb-48 md:pb-64"
                >
                    <div className="max-w-4xl w-full pointer-events-auto md:pr-20">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="space-y-4 md:space-y-6"
                            >
                                {/* Tag */}
                                <div className="flex items-center gap-4 overflow-hidden mb-2">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: 60 }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                        className="h-[2px] bg-teal-400"
                                    />
                                    <motion.span
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.6, delay: 0.3 }}
                                        className="text-xs md:text-sm font-bold tracking-[0.2em] uppercase text-teal-400"
                                    >
                                        {t(currentSlide.subtitleKey)}
                                    </motion.span>
                                </div>

                                {/* Title */}
                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white tracking-tight leading-[0.95] drop-shadow-2xl">
                                    {t(currentSlide.titleKey)}
                                </h1>

                                {/* Description */}
                                <p className="text-sm md:text-lg text-slate-200 max-w-xl leading-relaxed font-light drop-shadow-md hidden md:block">
                                    {t(currentSlide.descKey)}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* ================= CONTROLS ON IMAGE ================= */}
                <div className="absolute bottom-16 md:bottom-24 left-0 md:right-[8%] px-6 md:px-16 lg:px-24 z-30 flex items-center justify-between pointer-events-auto max-w-[95%]">

                    {/* Progress Bars */}
                    <div className="flex-1 flex items-center gap-3 max-w-md mr-10 relative">
                        {HERO_SLIDES.map((_, idx) => (
                            <div
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className="group relative h-[3px] flex-1 bg-white/20 overflow-hidden cursor-pointer transition-all hover:h-[5px] hover:bg-white/40 rounded-full"
                            >
                                {idx === currentIndex && (
                                    <motion.div
                                        className="absolute inset-0 bg-teal-400"
                                        layoutId="progress"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 8, ease: "linear" }}
                                    />
                                )}
                                {idx < currentIndex && <div className="absolute inset-0 bg-white/60" />}
                            </div>
                        ))}
                    </div>

                    {/* Arrow Controls */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className="p-3 mr-2 rounded-full border border-white/10 bg-black/20 hover:bg-white/10 transition-colors backdrop-blur-sm text-white"
                        >
                            {isPaused ? <Play className="w-4 h-4 text-teal-400" /> : <Pause className="w-4 h-4" />}
                        </button>

                        <button
                            onClick={handlePrev}
                            className="p-3 rounded-full border border-white/10 bg-black/20 hover:bg-teal-500 hover:border-teal-500 transition-all backdrop-blur-sm text-white group"
                        >
                            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="p-3 rounded-full border border-white/10 bg-black/20 hover:bg-teal-500 hover:border-teal-500 transition-all backdrop-blur-sm text-white group"
                        >
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ================= SIDEBAR AREA (30% Width) ================= */}
            <div className="hidden md:flex absolute right-0 top-0 bottom-0 w-[30%] z-10 flex-col justify-center items-center py-12 px-6 lg:px-10 border-l border-slate-200 dark:border-white/5 overflow-visible transition-all duration-500">

                {/* Extended Background & Decorations (Masking the image slant) */}
                <div className="absolute inset-y-0 right-0 w-[140%] bg-white dark:bg-slate-950 -z-10 transition-colors duration-500 md:[clip-path:polygon(28%_0,100%_0,100%_100%,0%_100%)]">
                    <div className="absolute inset-0 opacity-70 dark:opacity-50">
                        {/* Radial Glow */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_50%,_var(--tw-gradient-stops))] from-slate-200/30 via-white/40 to-white dark:from-slate-800/10 dark:via-slate-950/30 dark:to-slate-950 transition-colors duration-500" />

                        {/* Criss-Cross (Mesh) Pattern */}
                        <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.3]"
                            style={{
                                backgroundImage: `
                                    repeating-linear-gradient(45deg, #94a3b8, #94a3b8 1px, transparent 1px, transparent 30px),
                                    repeating-linear-gradient(-45deg, #94a3b8, #94a3b8 1px, transparent 1px, transparent 30px)
                                `
                            }}
                        />

                        {/* Noise Pattern */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-10 mix-blend-overlay" />
                    </div>
                </div>

                {/* CENTRAL ANIMATED LOGO COMPOSITION */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-8 w-full max-w-full">

                    {/* Animated Kofun Emblem */}
                    <div className="relative w-40 h-40 lg:w-52 lg:h-52 flex items-center justify-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.4)] dark:shadow-[0_0_35px_rgba(245,158,11,0.3)]"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-4 rounded-full border border-amber-500/10 dark:border-amber-500/5 blur-[2px]"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-2 rounded-full border-2 border-dotted border-amber-600/60 dark:border-amber-400/50 shadow-[0_0_15px_rgba(217,119,6,0.2)]"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="relative w-28 h-28 lg:w-36 lg:h-36 flex items-center justify-center"
                        >
                            <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_20px_rgba(217,119,6,0.6)]">
                                <defs>
                                    <linearGradient id="gold-gradient" x1="0" y1="0" x2="100" y2="120" gradientUnits="userSpaceOnUse">
                                        <stop offset="0%" stopColor="#d97706" />
                                        <stop offset="50%" stopColor="#f59e0b" />
                                        <stop offset="100%" stopColor="#fbbf24" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M50 10 C72 10 90 28 90 50 C90 65 83 75 75 82 L85 110 H15 L25 82 C17 75 10 65 10 50 C10 28 28 10 50 10 Z"
                                    fill="url(#gold-gradient)"
                                    opacity="0.9"
                                />
                                <motion.path
                                    d="M50 20 C65 20 78 33 78 50 C78 60 72 68 66 73 L73 98 H27 L34 73 C28 68 22 60 22 50 C22 33 35 20 50 20 Z"
                                    stroke="#fff"
                                    strokeWidth="0.5"
                                    fill="none"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                                />
                            </svg>
                        </motion.div>
                    </div>

                    {/* Text Branding - Dynamic English & Japanese */}
                    <div className="relative min-h-[140px] flex flex-col justify-center w-full px-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide.titleKey}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="space-y-4 w-full"
                            >
                                <div className="space-y-1 w-full flex flex-col items-center">
                                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-slate-900 dark:text-white tracking-[0.05em] leading-[1.1] uppercase w-full">
                                        {(SIDEBAR_TITLE_MAP[currentSlide.titleKey] || { en: "NARA" }).en}
                                    </h2>
                                    <div className="flex items-center gap-2 w-full mt-1">
                                        <div className="h-px flex-1 bg-amber-500/20" />
                                        <h3 className="text-lg md:text-xl font-serif text-amber-600 dark:text-amber-500 tracking-[0.2em] font-medium whitespace-nowrap px-1">
                                            {(SIDEBAR_TITLE_MAP[currentSlide.titleKey] || { ja: "奈良" }).ja}
                                        </h3>
                                        <div className="h-px flex-1 bg-amber-500/20" />
                                    </div>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.8, delay: 0.3 }}
                                    className="pt-2 flex flex-col items-center gap-2 opacity-50 w-full"
                                >
                                    <div className="flex items-center gap-2 w-full justify-center">
                                        <div className="h-px flex-1 bg-slate-400 dark:bg-white/30 max-w-[40px]" />
                                        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-600 dark:text-white/70 whitespace-normal text-center leading-tight">
                                            {t(currentSlide.subtitleKey)}
                                        </span>
                                        <div className="h-px flex-1 bg-slate-400 dark:bg-white/30 max-w-[40px]" />
                                    </div>
                                    <span className="text-[9px] uppercase tracking-[0.2em] font-light text-slate-500 dark:text-white/40">Heritage Foundation</span>
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>

                        {/* STATIC ARCHITECTURAL ACCENTS */}
                        <div className="absolute inset-x-0 top-0 h-full -z-10 pointer-events-none select-none overflow-hidden" />
                    </div>

                </div>
            </div>

            {/* Sophisticated Architectural Diagonal Divider */}
            <div className="hidden md:block absolute inset-0 pointer-events-none z-20">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <defs>
                        <linearGradient id="divider-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
                            <stop offset="30%" stopColor="currentColor" stopOpacity="0.4" />
                            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.9" />
                            <stop offset="70%" stopColor="currentColor" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Shadow/Glow Line */}
                    <line
                        x1="70.1%" y1="0" x2="64.1%" y2="100%"
                        stroke="currentColor"
                        strokeWidth="0.4"
                        className="text-slate-200/50 dark:text-white/5"
                    />



                    {/* Main Technical Line (Matches Sidebar Border) */}
                    <line
                        x1="70%" y1="0" x2="64%" y2="100%"
                        stroke="url(#divider-grad)"
                        strokeWidth="0.8"
                        className="text-slate-200 dark:text-white/10"
                    />

                    {/* Blueprint Tick Marks */}
                    <line x1="69.5%" y1="0" x2="70.5%" y2="0" stroke="currentColor" strokeWidth="0.2" className="text-slate-300 dark:text-white/20" />
                    <line x1="63.5%" y1="100" x2="64.5%" y2="100" stroke="currentColor" strokeWidth="0.2" className="text-slate-300 dark:text-white/20" />
                </svg>
            </div>

            {/* Mobile Controls (Hidden on Desktop) */}
            <div className="md:hidden absolute bottom-6 w-full px-6 flex justify-between items-center z-30">
                <div className="flex gap-2">
                    {HERO_SLIDES.map((_, idx) => (
                        <div key={idx} className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-teal-400' : 'w-2 bg-white/30'}`} />
                    ))}
                </div>
                <button onClick={handleNext} className="p-2 bg-black/30 backdrop-blur-md rounded-full text-white border border-white/10">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

        </div>
    );
}
