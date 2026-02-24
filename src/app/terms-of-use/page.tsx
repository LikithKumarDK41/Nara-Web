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
  { id: "intro", label: "Introduction", icon: FileText },
  { id: "changes", label: "Changes to Terms", icon: Scale },
  { id: "general", label: "General Terms", icon: Terminal },
  { id: "eligibility", label: "Eligibility", icon: UserCheck },
  { id: "registration", label: "Registration", icon: UserPlus },
  { id: "responsibilities", label: "User Responsibilities", icon: AlertCircle },
  { id: "ip", label: "Intellectual Property", icon: Shield },
  { id: "software", label: "Software License", icon: Terminal },
  { id: "copyright", label: "Copyright / Dev", icon: Copyright },
];

export default function TermsOfUsePage() {
  const { t, locale } = useLocale();
  const isEN = locale === "en";
  const [activeSection, setActiveSection] = useState("intro");

  // Scroll Spy Logic
  useEffect(() => {
    const handleScroll = () => {
      // Force "intro" if close to top
      if (window.scrollY < 100) {
        setActiveSection("intro");
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

  const getContent = (id: string, isEN: boolean) => {
    switch (id) {
      case "intro":
        return {
          title: isEN ? "Introduction" : "はじめに",
          desc: isEN
            ? `Please read these Terms of Use carefully before using our application.
By accessing our application (directly or via social channels), you agree to be legally bound by these Terms of Use and our Privacy Policy. If you do not agree, you may not use the application or services.`
            : `本アプリをご利用になる前に、本利用規約をよくお読みください。
当財団のアプリにアクセスすることにより、お客様は本利用規約およびプライバシーポリシーに同意したものとみなされます。`,
        };
      case "changes":
        return {
          title: isEN ? "Changes to Terms" : "利用規約の変更",
          desc: isEN
            ? `We may update these Terms from time to time to reflect service improvements or legal changes.
The latest version will always be available via the “Terms of Use” link on our website.`
            : `当財団は、サービス内容や法令変更に応じて、本利用規約を予告なく変更する場合があります。
最新版は常に当財団ウェブサイト下部の「利用規約」リンクよりご確認いただけます。`,
        };
      case "general":
        return {
          title: isEN ? "General Terms" : "一般的規約",
          desc: isEN
            ? `We grant you a limited, non-exclusive, non-transferable license to access and use the application in accordance with these Terms and our Privacy Policy.`
            : `本利用規約およびプライバシーポリシーに従い、本アプリを利用するための限定的かつ非独占的、譲渡不能なライセンスを付与します。`,
        };
      case "eligibility":
        return {
          title: isEN ? "Eligibility" : "資格",
          desc: isEN
            ? `You must be able to understand and comply with these Terms.
If you are under 20 years old, you must have parental or legal guardian consent to use this application.`
            : `本アプリを利用するには、本利用規約を理解し遵守できることが必要です。
20歳未満の場合は、親権者または法定後見人の同意が必要です。`,
        };
      case "registration":
        return {
          title: isEN ? "Registration" : "登録",
          desc: isEN
            ? `Certain features require registration.
You are responsible for maintaining the confidentiality of your account credentials and all activities under your account.`
            : `一部のサービスをご利用いただくには登録が必要です。
アカウント情報および利用状況の管理責任はお客様にあります。`,
        };
      case "responsibilities":
        return {
          title: isEN ? "User Responsibilities" : "お客様の責任",
          desc: isEN
            ? `You are solely responsible for any content you create or upload.
You agree not to upload unlawful, harmful, defamatory, or infringing content.`
            : `ユーザーが作成または投稿するコンテンツについては、すべてお客様の責任となります。
違法、有害、中傷的、権利侵害となるコンテンツの投稿は禁止されています。`,
        };
      case "ip":
        return {
          title: isEN ? "Intellectual Property" : "知的財産権",
          desc: isEN
            ? `All intellectual property rights related to the application belong exclusively to the Foundation or its licensors.`
            : `本アプリに関連するすべての知的財産権は、当財団またはそのライセンサーに帰属します。`,
        };
      case "software":
        return {
          title: isEN ? "Software License" : "ソフトウェア利用規約",
          desc: isEN
            ? `You may use the application solely for personal and lawful purposes.
Reverse engineering, redistribution, or modification is strictly prohibited.`
            : `本アプリは個人的かつ合法的な目的にのみ使用できます。
リバースエンジニアリング、複製、改変は禁止されています。`,
        };
      case "copyright":
        return {
          title: isEN ? "Copyright & Development" : "著作・制作 / 開発",
          desc: isEN
            ? `Copyright:
Nara Archaeological Site and Cultural Property Preservation and Activation Foundation
1-6-25 Mamigaoka, Kashiba City, Nara Prefecture 639-0223

Development:
NDR Co., Ltd.
Sumitomo Life Minatomachi MT Building 2F, 1-18-4 Minamihorie, Nishi-ku, Osaka City 550-0015`
            : `【著作・制作】
一般財団法人奈良遺跡文化財保存活性化財団
〒639-0223 奈良県香芝市真美ケ丘1-6-25

【開発】
株式会社エヌ・ディ・アール
〒550-0015 大阪市西区南堀江1-18-4 住友生命湊町MTビル2階`,
        };
      default:
        return { title: "", desc: "" };
    }
  };

  return (
    <div className="min-h-screen ">
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
        font-serif italic
      "
          >
            {isEN ? "Terms of Use" : "利用規約／サービス規約"}
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
            {isEN ? "Last Updated" : "最終更新日"}:{" "}
            {isEN ? "2025-01-01" : "2025年1月1日"}{" "}
          </p>
        </div>
      </section>

      {/* ===== BREADCRUMB ===== */}
      <div className="px-4 mb-8">
        <Breadcrumb items={[{ label: isEN ? "Terms of Use" : "利用規約／サービス規約" }]} />
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* LEFT: STICKY TOC */}
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
            <div className="bg-white dark:bg-[#1e293b] border border-slate-200/80 dark:border-slate-700/60 rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden backdrop-blur-sm">

              {/* Decorative background subtle blobs */}
              {/* <div className="absolute -top-20 -right-20 w-64 h-64 bg-teal-50 dark:bg-teal-900/10 rounded-full blur-3xl pointer-events-none" /> */}
              {/* <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl pointer-events-none" /> */}

              {SECTIONS.map((section) => {
                const { title, desc } = getContent(section.id, isEN);
                return (
                  <React.Fragment key={section.id}>
                    <Section
                      id={section.id}
                      title={title}
                      desc={desc}
                      isActive={activeSection === section.id}
                    />
                    {section.id !== "copyright" && <hr className="my-8 border-slate-100 dark:border-slate-800" />}
                  </React.Fragment>
                );
              })}

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
  const map: Record<string, string> = {
    intro: "はじめに",
    changes: "利用規約の変更",
    general: "一般的規約",
    eligibility: "資格",
    registration: "登録",
    responsibilities: "お客様の責任",
    ip: "知的財産権",
    software: "ソフトウェア利用規約",
    copyright: "著作・制作 / 開発",
  };
  return map[id] || id;
}
