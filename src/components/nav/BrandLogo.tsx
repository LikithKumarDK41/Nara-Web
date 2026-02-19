"use client";

import Link from "next/link";
import Image from "next/image";

export default function BrandLogo({
  href = "/",
  label = "Nara Kofun & Heritage Foundation",
  imgSize = 44,
  showText = true,
  scrolled = false,
  isFooter = false,
}: {
  href?: string;
  label?: string;
  imgSize?: number;
  showText?: boolean;
  scrolled?: boolean;
  isFooter?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      onClick={() => {
        sessionStorage.removeItem("returnToRegionModal"); // important
      }}
      className="group inline-flex items-center focus:outline-none"
    >
      {/* 🟠 Logo Capsule */}
      <div
        className="
          relative flex items-center justify-center
          h-12 w-12 rounded-2xl
          bg-white dark:bg-white/10
          border border-slate-200 dark:border-white/10
          shadow-md transition-all duration-300
          group-hover:shadow-lg group-hover:scale-105
        "
      >
        <Image
          src="/logos/nara_logo.png"
          alt={label}
          width={imgSize}
          height={imgSize}
          priority
          className="object-contain p-1.5"
        />
      </div>

      {/* 🟡 Vertical Divider */}
      <span
        className={`
          mx-4 h-8 w-px
          transition-colors duration-300
          ${isFooter ? "bg-slate-200 dark:bg-white/40" : (scrolled ? "bg-slate-200" : "bg-white/30")}
        `}
      />

      {/* 🧡 Text Block */}
      {showText && (
        <div className="flex flex-col gap-1 leading-tight select-none">
          {/* Japanese title */}
          <span
            className={`
              text-[16px] font-black tracking-tight text-left transition-colors duration-300
              ${isFooter ? "text-white" : (scrolled ? "text-slate-900" : "text-white")}
            `}
          >
            奈良遺跡めぐり
          </span>

          {/* English subtitle */}
          <span
            className={`
              text-[9px] font-black tracking-[0.1em] uppercase text-left transition-colors duration-300
              ${isFooter ? "text-white/60" : (scrolled ? "text-slate-500" : "text-slate-200")}
            `}
          >
            {label}
          </span>
        </div>
      )}
    </Link>
  );
}
