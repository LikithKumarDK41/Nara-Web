"use client";

import Link from "next/link";
import Image from "next/image";

export default function BrandLogo({
  href = "/",
  label = "Nara Kofun & Heritage Foundation",
  imgSize = 44,
  showText = true,
}: {
  href?: string;
  label?: string;
  imgSize?: number;
  showText?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="group inline-flex items-center focus:outline-none"
    >
      {/* 🟠 Gradient Badge */}
      <div
        className="
          relative flex items-center justify-center
          h-11 w-11 rounded-full
          bg-gradient-to-br from-teal-500 via-cyan-500 to-emerald-400
          shadow-[0_0_14px_rgba(20,184,166,0.45)]
        "
      >
        {/* Inner circle → white in light, black in dark */}
        <div
          className="
            h-10 w-10 rounded-full
            bg-white dark:bg-black
            flex items-center justify-center
            transition-colors
          "
        >
          <Image
            src="/logos/nara_logo.png"
            alt={label}
            width={imgSize}
            height={imgSize}
            priority
            className="object-contain"
          />
        </div>
      </div>

      {/* 🟡 Vertical Divider */}
      <span
        className="
          mx-3 h-8 w-px
          bg-gradient-to-b
          from-transparent via-teal-400/70 to-transparent
        "
      />

      {/* 🧡 Text Block */}
      {showText && (
        <div className="flex flex-col leading-tight select-none">
          {/* Japanese title */}
          <span
            className="
              text-[15px] font-bold tracking-wide
              bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-400
              bg-clip-text text-transparent
            "
          >
            御所市観光ナビ
          </span>

          {/* English subtitle */}
          <span
            className="
              text-[12px] tracking-wide
              text-gray-600 dark:text-gray-300 text-left
            "
          >
            {label}
          </span>
        </div>
      )}
    </Link>
  );
}
