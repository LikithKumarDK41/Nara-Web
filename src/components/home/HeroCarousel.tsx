"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useLocale } from "@/providers/LocaleProvider";

const HERO_SLIDES = [
    {
        id: 1,
        image: "/naraiseki/1.png",
        titleKey: "home.hero.slides.0.title",
        subtitleKey: "home.hero.slides.0.subtitle",
        descKey: "home.hero.slides.0.description",
    },
    {
        id: 2,
        image: "/naraiseki/2.png",
        titleKey: "home.hero.slides.1.title",
        subtitleKey: "home.hero.slides.1.subtitle",
        descKey: "home.hero.slides.1.description",
    },
    {
        id: 3,
        image: "/naraiseki/3.png",
        titleKey: "home.hero.slides.2.title",
        subtitleKey: "home.hero.slides.2.subtitle",
        descKey: "home.hero.slides.2.description",
    },
];

export default function HeroCarousel() {
    const { t } = useLocale();
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
        <div ref={containerRef} className="relative w-full h-[100dvh] overflow-hidden bg-slate-900">
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
                        <img
                            src={currentSlide.image}
                            alt="Hero Slide"
                            className="absolute inset-0 w-full h-full object-cover object-center"
                        />
                        {/* Enhanced Overlay Gradients for Readability */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent " />
                    </motion.div>
                </motion.div>
            </AnimatePresence>

            {/* Content Layer */}
            <motion.div
                style={{ y: y1, opacity }}
                className="absolute inset-x-0 bottom-0 h-full flex flex-col justify-end pb-52 px-6 md:px-16 lg:px-24 z-10 pointer-events-none"
            >
                <div className="max-w-6xl w-full pointer-events-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="space-y-6"
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
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white tracking-tight leading-[0.95] drop-shadow-2xl">
                                {t(currentSlide.titleKey)}
                            </h1>

                            {/* Description */}
                            <div className="flex flex-col md:flex-row md:items-end gap-10 pt-6">
                                <p className="text-base md:text-lg text-slate-200 max-w-xl leading-relaxed font-light drop-shadow-md">
                                    {t(currentSlide.descKey)}
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Bottom Controls Bar */}
            <div className="absolute bottom-0 left-0 right-0 px-6 md:px-16 lg:px-24 pb-16 flex items-end justify-between z-20 text-white">
                {/* Progress Bars */}
                <div className="flex-1 flex items-center gap-3 max-w-md mr-10 relative">
                    {HERO_SLIDES.map((_, idx) => (
                        <div
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className="group relative h-[2px] flex-1 bg-white/20 overflow-hidden cursor-pointer transition-all hover:h-[4px] hover:bg-white/40"
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

                {/* Navigation Buttons */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsPaused(!isPaused)}
                        className="p-3 rounded-full border border-white/10 bg-black/20 hover:bg-white/10 transition-colors backdrop-blur-sm"
                    >
                        {isPaused ? <Play className="w-5 h-5 text-teal-400" /> : <Pause className="w-5 h-5 text-white" />}
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrev}
                            className="p-3 rounded-full border border-white/10 bg-black/20 hover:bg-white/10 transition-colors backdrop-blur-sm"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="p-3 rounded-full border border-white/10 bg-black/20 hover:bg-white/10 transition-colors backdrop-blur-sm"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-black/40 to-transparent pointer-events-none mix-blend-overlay" />
        </div>
    );
}
