"use client";

import React from "react";
import { useLocale } from "@/providers/LocaleProvider";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function TermsOfUsePage() {
  const { t, locale } = useLocale();
  const isEN = locale === "en";

  return (
    <div className="space-y-6">
      {/* ===== HERO SECTION ===== */}
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

      <div className="px-4 mt-2 flex justify-start">
        <Breadcrumb
          items={[
            { label: isEN ? "Terms of Use" : "利用規約／サービス規約" },
          ]}
        />
      </div>

      <div className="px-4 sm:px-6">
        <div className=" bg-white dark:bg-[#15191f] border border-slate-200/80 dark:border-slate-700/60 p-8 rounded-2xl shadow-md">
          <Section
            title={isEN ? "Introduction" : "はじめに"}
            desc={
              isEN
                ? `Please read these Terms of Use carefully before using our application.
By accessing our application (directly or via social channels), you agree to be legally bound by these Terms of Use and our Privacy Policy. If you do not agree, you may not use the application or services.`
                : `本アプリをご利用になる前に、本利用規約をよくお読みください。
当財団のアプリにアクセスすることにより、お客様は本利用規約およびプライバシーポリシーに同意したものとみなされます。`
            }
          />

          <Section
            title={isEN ? "Changes to Terms" : "利用規約の変更"}
            desc={
              isEN
                ? `We may update these Terms from time to time to reflect service improvements or legal changes.
The latest version will always be available via the “Terms of Use” link on our website.`
                : `当財団は、サービス内容や法令変更に応じて、本利用規約を予告なく変更する場合があります。
最新版は常に当財団ウェブサイト下部の「利用規約」リンクよりご確認いただけます。`
            }
          />

          <Section
            title={isEN ? "General Terms" : "一般的規約"}
            desc={
              isEN
                ? `We grant you a limited, non-exclusive, non-transferable license to access and use the application in accordance with these Terms and our Privacy Policy.`
                : `本利用規約およびプライバシーポリシーに従い、本アプリを利用するための限定的かつ非独占的、譲渡不能なライセンスを付与します。`
            }
          />

          <Section
            title={isEN ? "Eligibility" : "資格"}
            desc={
              isEN
                ? `You must be able to understand and comply with these Terms.
If you are under 20 years old, you must have parental or legal guardian consent to use this application.`
                : `本アプリを利用するには、本利用規約を理解し遵守できることが必要です。
20歳未満の場合は、親権者または法定後見人の同意が必要です。`
            }
          />

          <Section
            title={isEN ? "Registration" : "登録"}
            desc={
              isEN
                ? `Certain features require registration.
You are responsible for maintaining the confidentiality of your account credentials and all activities under your account.`
                : `一部のサービスをご利用いただくには登録が必要です。
アカウント情報および利用状況の管理責任はお客様にあります。`
            }
          />

          <Section
            title={isEN ? "User Responsibilities" : "お客様の責任"}
            desc={
              isEN
                ? `You are solely responsible for any content you create or upload.
You agree not to upload unlawful, harmful, defamatory, or infringing content.`
                : `ユーザーが作成または投稿するコンテンツについては、すべてお客様の責任となります。
違法、有害、中傷的、権利侵害となるコンテンツの投稿は禁止されています。`
            }
          />

          <Section
            title={isEN ? "Intellectual Property" : "知的財産権"}
            desc={
              isEN
                ? `All intellectual property rights related to the application belong exclusively to the Foundation or its licensors.`
                : `本アプリに関連するすべての知的財産権は、当財団またはそのライセンサーに帰属します。`
            }
          />

          <Section
            title={isEN ? "Software License" : "ソフトウェア利用規約"}
            desc={
              isEN
                ? `You may use the application solely for personal and lawful purposes.
Reverse engineering, redistribution, or modification is strictly prohibited.`
                : `本アプリは個人的かつ合法的な目的にのみ使用できます。
リバースエンジニアリング、複製、改変は禁止されています。`
            }
          />

          <Section
            title={isEN ? "Copyright & Development" : "著作・制作 / 開発"}
            desc={
              isEN
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
〒550-0015 大阪市西区南堀江1-18-4 住友生命湊町MTビル2階`
            }
          />
        </div>
      </div>
    </div>
  );
}

/* ===== Reusable Section ===== */
function Section({ title, desc }: { title: string; desc: string }) {
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
            className="text-teal-700 dark:text-teal-300 underline hover:opacity-80"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <section className="mb-6">
      <h2 className="text-xl md:text-2xl font-bold text-teal-700 dark:text-teal-300 mb-3 border-b pb-2">
        {title}
      </h2>
      <p className="leading-relaxed whitespace-pre-line text-slate-600 dark:text-slate-200">
        {renderTextWithLinks(desc)}
      </p>
    </section>
  );
}
