"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/providers/LocaleProvider";
import BrandLogo from "./BrandLogo";
import {
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Mail,
  MapPin,
} from "lucide-react";

import SearchModal from "@/components/shortcuts-modal/searchModal";
import StreetViewModal from "@/components/shortcuts-modal/streetViewModal";
import RegionMapModal from "@/components/shortcuts-modal/regionMapModal";

export default function FooterBar() {
  const { t, locale } = useLocale();
  const [theme, setTheme] = useState("light");

  // Modal States
  const [searchOpen, setSearchOpen] = useState(false);
  const [streetViewOpen, setStreetViewOpen] = useState(false);
  const [regionMapOpen, setRegionMapOpen] = useState(false);

  useEffect(() => {
    // Check initial theme from document or localStorage logic (simplified for footer)
    const getTheme = () => {
      if (typeof window !== 'undefined') {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      }
      return 'light';
    };
    setTheme(getTheme());

    const observer = new MutationObserver(() => {
      setTheme(getTheme());
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const exploreLinks = [
    { label: t("region_map"), onClick: () => setRegionMapOpen(true) },
    { label: t("search"), onClick: () => setSearchOpen(true) },
    { label: t("street_view"), onClick: () => setStreetViewOpen(true) },
    { href: "/tours", label: t("guided_tours") },
    {
      href: `https://naraiseki.nichi.in/public-videos/?lang=${locale}&theme=${theme}`,
      label: t("videos"),
      external: true
    },
    { href: "/mylist", label: t("my_list") },
  ];

  const infoLinks = [
    { href: "/privacy-policy", label: t("privacy_policy") },
    { href: "/terms-of-use", label: t("terms_of_use") }
  ]

  return (
    <>
      <footer className="relative w-full overflow-hidden bg-gradient-to-br from-[#134e4a] via-[#0f2d2b] to-[#020617] border-t border-teal-800/30 dark:border-white/10 pt-12 pb-12 transition-all duration-500">
        {/* ================= 3D BACKGROUND / MASK EFFECTS ================= */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Cinematic Radial Glows (Ambient Light - Enhanced Right Side) */}
          <div className="absolute -top-[50%] -left-[20%] w-[80%] h-[150%] bg-teal-900/30 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />

          {/* THE 'GOOD' RIGHT-SIDE HIGHLIGHT MASK - LIGHT MODE BOOSTED */}
          <div className="absolute -bottom-[15%] -right-[5%] w-[85%] h-[125%] bg-teal-400/50 dark:bg-teal-400/30 blur-[75px] rounded-full mix-blend-screen pointer-events-none" />
        </div>

        <div className="relative w-full px-4 md:px-8 z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-10">

            {/* ================= COLUMN 1: BRANDING ================= */}
            <div className="space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="inline-block transform -translate-x-3">
                <BrandLogo scrolled={true} isFooter={true} />
              </div>
              <p className="text-lg md:text-xl font-serif italic text-white leading-relaxed max-w-md">
                &quot;{t("footer.quote")}&quot;
              </p>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-6">
                  <Link href="#" className="p-2 text-white hover:text-[#E1306C] transition-all hover:scale-110">
                    <Instagram className="w-5 h-5" />
                  </Link>
                  <Link href="#" className="p-2 text-white hover:text-[#1DA1F2] transition-all hover:scale-110">
                    <Twitter className="w-5 h-5" />
                  </Link>
                  <Link href="#" className="p-2 text-white hover:text-[#1877F2] transition-all hover:scale-110">
                    <Facebook className="w-5 h-5" />
                  </Link>
                  <Link href="#" className="p-2 text-white hover:text-[#FF0000] transition-all hover:scale-110">
                    <Youtube className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* ================= COLUMN 2: EXPLORE ================= */}
            <div className="space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left">
              <h4 className="text-sm font-black uppercase tracking-[0.3em] text-white">{t("footer_explore")}</h4>
              <ul className="space-y-4 w-full flex flex-col items-center lg:items-start">
                {exploreLinks.map((link) => (
                  <li key={link.label}>
                    {link.onClick ? (
                      <button
                        onClick={link.onClick}
                        className="cursor-pointer group flex items-center gap-2 text-base text-white hover:text-white transition-colors whitespace-nowrap"
                      >
                        <span className="w-0 group-hover:w-3 h-px bg-white transition-all duration-300" />
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        href={link.href!}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                        className="group flex items-center gap-2 text-base text-white hover:text-white transition-colors whitespace-nowrap">
                        <span className="w-0 group-hover:w-3 h-px bg-white transition-all duration-300" />
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* ================= COLUMN 3: SERVICES ================= */}
            <div className="space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left">
              <h4 className="text-sm font-black uppercase tracking-[0.3em] text-white">{t("information")}</h4>
              <ul className="space-y-4 w-full flex flex-col items-center lg:items-start">
                {infoLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-2 text-base text-white hover:text-white transition-colors whitespace-nowrap">
                      <span className="w-0 group-hover:w-3 h-px bg-white transition-all duration-300" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ================= COLUMN 4: CONTACT ================= */}
            <div className="space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left">
              <h4 className="text-sm font-black uppercase tracking-[0.3em] text-white">{t("footer.connect")}</h4>
              <div className="space-y-6 w-full flex flex-col items-center lg:items-start">
                <div className="flex items-start gap-4 group cursor-pointer text-white hover:text-white transition-colors p-3 rounded-2xl hover:bg-white/10 transition-all w-full max-w-xs justify-center lg:justify-start">
                  <MapPin className="w-5 h-5 shrink-0 text-white group-hover:text-white transition-colors mt-1 lg:mt-0" />
                  <span className="text-base leading-relaxed">
                    1-6-25 Mamigaoka, Kashiba-shi,<br />Nara 639-0223 Japan
                  </span>
                </div>
                <div className="flex items-center gap-4 group cursor-pointer text-white hover:text-white transition-colors p-3 rounded-2xl hover:bg-white/10 transition-all w-full max-w-xs justify-center lg:justify-start">
                  <Mail className="w-5 h-5 shrink-0 text-white group-hover:text-white transition-colors" />
                  <span className="text-base">foundation@nara-heritage.jp</span>
                </div>
              </div>
            </div>

          </div>

          {/* ================= FOOTER BOTTOM ================= */}
          <div className="pt-6 border-t border-teal-800/30 dark:border-white/10 flex items-center justify-center gap-8 text-center md:text-left">
            <span className="text-xs font-bold text-white uppercase tracking-widest order-2 md:order-1">
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </span>
          </div>
        </div>

        {/* ================= OVERSIZED DECORATIVE KOFUN SHAPE ================= */}
        <div className="absolute -bottom-24 -right-24 pointer-events-none select-none opacity-[0.12] dark:opacity-[0.15] transform rotate-12 scale-150">
          <svg
            width="600"
            height="600"
            viewBox="0 0 600 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white/10"
          >
            {/* Topographical Rings */}
            <circle cx="300" cy="300" r="280" stroke="currentColor" strokeWidth="1" strokeDasharray="10 20" />
            <circle cx="300" cy="300" r="240" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="300" cy="300" r="200" stroke="currentColor" strokeWidth="2" strokeDasharray="5 15" />

            {/* Stylized Keyhole Kofun Shape */}
            <path
              d="M300 120C233.726 120 180 173.726 180 240C180 286.046 205.954 326.046 244.131 346.5L200 480H400L355.869 346.5C394.046 326.046 420 286.046 420 240C420 173.726 366.274 120 300 120Z"
              fill="currentColor"
              fillOpacity="0.2"
            />
            <path
              d="M300 120C233.726 120 180 173.726 180 240C180 286.046 205.954 326.046 244.131 346.5L200 480H400L355.869 346.5C394.046 326.046 420 286.046 420 240C420 173.726 366.274 120 300 120Z"
              stroke="currentColor"
              strokeWidth="4"
            />

            {/* Floating '3D' Cubes / Shapes */}
            <rect x="100" y="400" width="40" height="40" stroke="currentColor" strokeWidth="1" transform="rotate(-15 120 420)" />
            <circle cx="500" cy="150" r="30" stroke="currentColor" strokeWidth="1" />
            <path d="M450 450L500 450L475 400Z" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>
      </footer>

      {/* Global Modals from Footer */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <StreetViewModal
        openModal={streetViewOpen}
        onClose={() => setStreetViewOpen(false)}
      />
      <RegionMapModal
        openMapModal={regionMapOpen}
        onCloseMapModal={() => setRegionMapOpen(false)}
      />
    </>
  );
}
