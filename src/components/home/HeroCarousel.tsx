"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/providers/LocaleProvider";

const HERO_SLIDES = [
    {
        id: 1,
        image: "/hero/slide_1.png",
        titleKey: "home.hero.slides.0.title",
        subtitleKey: "home.hero.slides.0.subtitle",
        descKey: "home.hero.slides.0.description",
    },
    {
        id: 2,
        image: "/hero/slide_2.png",
        titleKey: "home.hero.slides.1.title",
        subtitleKey: "home.hero.slides.1.subtitle",
        descKey: "home.hero.slides.1.description",
    },
    {
        id: 3,
        image: "/hero/slide_3.png",
        titleKey: "home.hero.slides.2.title",
        subtitleKey: "home.hero.slides.2.subtitle",
        descKey: "home.hero.slides.2.description",
    },
    {
        id: 4,
        image: "/hero/slide_4.png",
        titleKey: "home.hero.slides.3.title",
        subtitleKey: "home.hero.slides.3.subtitle",
        descKey: "home.hero.slides.3.description",
    },
];

export default function HeroCarousel() {
    const { t } = useLocale();
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-play
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    };

    const currentSlide = HERO_SLIDES[currentIndex];

    return (
        <div className="relative w-full h-[100dvh] min-h-[600px] max-h-[900px] overflow-hidden bg-black">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide.id}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute inset-0 w-full h-full"
                >
                    {/* Background Image */}
                    <img
                        src={currentSlide.image}
                        alt="Hero Slide"
                        className="w-full h-full object-cover opacity-80"
                    />

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
                </motion.div>
            </AnimatePresence>

            {/* Content Container */}
            <div className="absolute inset-0 flex items-center px-6 md:px-16 lg:px-24">
                <div className="max-w-4xl space-y-6 pt-20">
                    <motion.div
                        key={`content-${currentIndex}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    >
                        {/* Tag / Category (Optional decoration) */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 backdrop-blur-md mb-4">
                            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-widest text-teal-300">
                                {t(currentSlide.subtitleKey) || "Explore Nara"}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6 drop-shadow-lg">
                            {t(currentSlide.titleKey)}
                        </h1>

                        {/* Description */}
                        <p className="text-lg md:text-2xl text-slate-200 leading-relaxed max-w-2xl drop-shadow-md font-light">
                            {t(currentSlide.descKey)}
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Navigation Arrows */}
            <div className="absolute bottom-12 right-6 md:right-16 flex items-center gap-4 z-20">
                <button
                    onClick={handlePrev}
                    className="cursor-pointer w-12 h-12 rounded-full border border-white/20 bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 group"
                    aria-label="Previous Slide"
                >
                    <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
                </button>
                <button
                    onClick={handleNext}
                    className="cursor-pointer w-12 h-12 rounded-full border border-white/20 bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 group"
                    aria-label="Next Slide"
                >
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>

            {/* Slide Indicators / Dots */}
            <div className="absolute bottom-12 left-6 md:left-16 flex items-center gap-3 z-20">
                {HERO_SLIDES.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex
                            ? "w-8 bg-teal-500"
                            : "w-2 bg-white/40 hover:bg-white/80"
                            }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
