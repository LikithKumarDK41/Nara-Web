"use client";

import React, { useState, useEffect } from "react";
import { useLocale } from "@/providers/LocaleProvider";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { motion } from "framer-motion";
import { ChevronRight, FileText, Scale, UserCheck, UserPlus, AlertCircle, Shield, Copyright, Terminal } from "lucide-react";

/* =========================================================
   CONSTANTS & DATA
   ========================================================= */
const SECTIONS = [
  { id: "general", label: "General", icon: FileText },
  { id: "jurisdiction", label: "Jurisdiction", icon: Scale },
  { id: "account", label: "Account", icon: UserPlus },
  { id: "features", label: "Features", icon: Terminal },
  { id: "analytics", label: "Analytics", icon: Shield },
  { id: "usage", label: "Usage", icon: AlertCircle },
  { id: "security", label: "Security", icon: UserCheck },
  { id: "location", label: "Location", icon: FileText },
  { id: "contact", label: "Contact", icon: Copyright },
];

export default function PrivacyPolicyPage() {
  const { t, locale } = useLocale();
  const isEN = locale === "en";
  const [activeSection, setActiveSection] = useState("general");

  // Scroll Spy Logic
  useEffect(() => {
    const handleScroll = () => {
      // Force "general" if close to top
      if (window.scrollY < 100) {
        setActiveSection("general");
        return;
      }

      const sections = SECTIONS.map((s) => document.getElementById(s.id));
      const scrollPosition = window.scrollY + 80; // Reduced detection offset

      for (const section of sections) {
        if (
          section &&
          section.offsetTop <= scrollPosition &&
          section.offsetTop + section.offsetHeight > scrollPosition
        ) {
          setActiveSection(section.id);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 90; // 73px header + spacing
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen">
      {/* ===== HERO SECTION (Preserved) ===== */}
      <section
        className="mb-4
    w-full
    bg-gradient-to-br
    from-teal-600 via-cyan-600 to-emerald-700
    dark:from-[#0a1f2e] dark:via-[#1a3a4a] dark:to-[#2d5a6f]
    px-6 sm:px-10 md:px-16 lg:px-20
    py-4 md:py-6 lg:py-8
    relative
    overflow-hidden
  "
      >
        {/* Animated gradient orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[150px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-300/10 blur-[140px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/4" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Content */}
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          {/* Overline */}
          <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 backdrop-blur-md">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-300 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-semibold text-white/80 tracking-wider uppercase">
              {t("nara_heritage")}
            </span>
          </div>

          {/* Main title - Enhanced typography */}
          <h1
            className="
        text-xl sm:text-2xl md:text-3xl lg:text-4xl
        font-black
        text-white
        tracking-tight
        leading-[1.1]
        mt-2 mb-2
        drop-shadow-lg
      "
          >
            {t("privacy.title")}
          </h1>

          {/* Decorative accent line */}
          <div className="flex items-center justify-center gap-3 my-2">
            <div className="h-0.5 w-8 bg-gradient-to-r from-teal-300 to-cyan-300 rounded-full" />
            <span className="text-white/60 text-xs font-medium">✦</span>
            <div className="h-0.5 w-8 bg-gradient-to-l from-teal-300 to-cyan-300 rounded-full" />
          </div>

          {/* Subtitle with stats */}
          <p
            className="
        text-xs sm:text-sm md:text-base
        text-white/80
        max-w-3xl mx-auto
        leading-relaxed
        font-light
      "
          >
            {t("privacy.updated")}:{" "}
            {locale == "en" ? "2025-01-01" : "2025年1月1日"}
          </p>
        </div>
      </section>

      {/* ===== BREADCRUMB ===== */}
      <div className="px-4 mb-8">
        <Breadcrumb items={[{ label: t("privacy.title") || "Privacy Policy" }]} />
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* LEFT: STICKY TOC (Hidden on LG as per Terms design) */}
          <aside className="hidden lg:hidden lg:col-span-3">
            <div className="sticky top-28 space-y-1">
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 px-2">
                {isEN ? "Contents" : "目次"}
              </h3>
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`
                    w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-3 group
                    ${activeSection === section.id
                      ? "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 shadow-sm ring-1 ring-teal-200 dark:ring-teal-800"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                    }
                  `}
                >
                  <section.icon className={`w-4 h-4 transition-colors ${activeSection === section.id ? "text-teal-600 dark:text-teal-400" : "text-slate-400 group-hover:text-slate-500"}`} />
                  {isEN ? section.label : getJapaneseLabel(section.id)}
                  {activeSection === section.id && (
                    <motion.div layoutId="activeIndicator" className="ml-auto">
                      <ChevronRight className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </aside>

          {/* RIGHT: CONTENT */}
          <main className="lg:col-span-12 space-y-8">
            <div className="bg-white dark:bg-[#15191f] border border-slate-200/80 dark:border-slate-700/60 rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden backdrop-blur-sm">

              {SECTIONS.map((section) => (
                <React.Fragment key={section.id}>
                  <Section
                    id={section.id}
                    title={t(`privacy.${section.id}.title`)}
                    desc={t(`privacy.${section.id}.desc`)}
                    isActive={activeSection === section.id}
                  />
                  {section.id !== "contact" && <hr className="my-8 border-slate-100 dark:border-slate-800" />}
                </React.Fragment>
              ))}

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   HELPER COMPONENTS & FUNCTIONS
   ========================================================= */

function Section({ id, title, desc, isActive }: { id: string; title: string; desc: string; isActive?: boolean }) {
  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    if (!text) return null; // Handle potential undefined text

    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 dark:text-teal-400 underline decoration-teal-600/30 dark:decoration-teal-400/30 underline-offset-4 hover:decoration-teal-600 dark:hover:decoration-teal-400 transition-all font-medium"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <section
      id={id}
      className={`
        scroll-mt-32 group transition-all duration-500 rounded-xl p-6 -mx-6
        ${isActive
          ? "bg-teal-50/50 dark:bg-teal-900/10 ring-1 ring-teal-100 dark:ring-teal-800 shadow-sm"
          : "hover:bg-slate-50/50 dark:hover:bg-white/5"
        }
      `}
    >
      <div className="flex items-center gap-3 mb-4">
        {/* {isActive && (
          <div className="w-1 h-6 bg-teal-500 rounded-full animate-pulse mr-2" />
        )} */}
        <h2 className={`text-2xl md:text-3xl font-bold transition-colors font-serif ${isActive ? "text-teal-700 dark:text-teal-400" : "text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300"
          }`}>
          {title}
        </h2>
      </div>
      <p className="leading-8 text-base md:text-lg text-slate-600 dark:text-slate-300 whitespace-pre-line font-light">
        {renderTextWithLinks(desc)}
      </p>
    </section>
  );
}

function getJapaneseLabel(id: string) {
  // Add Japanese mappings if needed for fallback, though translation keys handle titles
  return id;
}
