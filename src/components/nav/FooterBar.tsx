"use client";

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

export default function FooterBar() {
  const { t } = useLocale();

  return (
    <footer className="relative w-full overflow-hidden bg-gradient-to-br from-rose-100 via-violet-200 to-cyan-200 dark:bg-none dark:bg-black border-t border-slate-900/10 dark:border-white/10 pt-24 pb-12 transition-all duration-500">
      {/* ================= 3D BACKGROUND / MASK EFFECTS ================= */}
      <div className="absolute inset-0 pointer-events-none opacity-100">
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 dark:brightness-0 contrast-150" />

        {/* Cinematic Radial Glows */}
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-slate-100 dark:bg-white/5 rounded-full blur-[120px] mix-blend-soft-light" />
        <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] bg-slate-50 dark:bg-white/5 rounded-full blur-[150px] mix-blend-soft-light" />

        {/* Topographic Lines Mask (Simulated with Gradient Rules) */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]"
          style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative w-full px-4 md:px-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">

          {/* ================= COLUMN 1: BRANDING ================= */}
          <div className="lg:col-span-5 space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="inline-block transform -translate-x-3">
              <BrandLogo scrolled={true} isFooter={true} />
            </div>
            <p className="text-lg md:text-xl font-serif italic text-slate-600 dark:text-white/40 leading-relaxed max-w-md">
              &quot;Preserving the echoes of ancient Japan, one monument at a time. Journey through the soul of Nara.&quot;
            </p>

            <div className="flex items-center gap-6">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <Link key={i} href="#" className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all hover:scale-110">
                  <Icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* ================= COLUMN 2: EXPLORE ================= */}
          <div className="lg:col-span-2 space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h4 className="text-sm font-black uppercase tracking-[0.3em] text-slate-950 dark:text-white">Explore</h4>
            <ul className="space-y-4 w-full flex flex-col items-center lg:items-start">
              {['Tours', 'Monuments', 'Map View', 'Videos'].map((item) => (
                <li key={item}>
                  <Link href="#" className="group flex items-center gap-2 text-base text-slate-700 dark:text-white/60 hover:text-slate-950 dark:hover:text-white transition-colors">
                    <span className="w-0 group-hover:w-3 h-px bg-slate-950 dark:bg-white transition-all duration-300" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ================= COLUMN 3: SERVICES ================= */}
          <div className="lg:col-span-2 space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h4 className="text-sm font-black uppercase tracking-[0.3em] text-slate-950 dark:text-white">Services</h4>
            <ul className="space-y-4 w-full flex flex-col items-center lg:items-start">
              {['Community Bus', 'Street View', 'City Promotion', 'Events'].map((item) => (
                <li key={item}>
                  <Link href="#" className="group flex items-center gap-2 text-base text-slate-700 dark:text-white/60 hover:text-slate-950 dark:hover:text-white transition-colors">
                    <span className="w-0 group-hover:w-3 h-px bg-slate-950 dark:bg-white transition-all duration-300" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ================= COLUMN 4: CONTACT ================= */}
          <div className="lg:col-span-3 space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h4 className="text-sm font-black uppercase tracking-[0.3em] text-slate-950 dark:text-white">Connect</h4>
            <div className="space-y-6 w-full flex flex-col items-center lg:items-start">
              <div className="flex items-start gap-4 group cursor-pointer text-slate-700 dark:text-white/60 hover:text-slate-950 dark:hover:text-white transition-colors p-3 rounded-2xl hover:bg-slate-900/5 dark:hover:bg-white/5 transition-all w-full max-w-xs justify-center lg:justify-start">
                <MapPin className="w-5 h-5 shrink-0 text-slate-600 group-hover:text-slate-950 dark:group-hover:text-white transition-colors mt-1 lg:mt-0" />
                <span className="text-base leading-relaxed">
                  1-6-25 Mamigaoka, Kashiba-shi,<br />Nara 639-0223 Japan
                </span>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer text-slate-700 dark:text-white/60 hover:text-slate-950 dark:hover:text-white transition-colors p-3 rounded-2xl hover:bg-slate-900/5 dark:hover:bg-white/5 transition-all w-full max-w-xs justify-center lg:justify-start">
                <Mail className="w-5 h-5 shrink-0 text-slate-600 group-hover:text-slate-950 dark:group-hover:text-white transition-colors" />
                <span className="text-base">foundation@nara-heritage.jp</span>
              </div>
            </div>
          </div>

        </div>

        {/* ================= FOOTER BOTTOM ================= */}
        <div className="pt-12 border-t border-slate-900/10 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest order-2 md:order-1">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </span>
          <div className="flex items-center justify-center md:justify-end gap-6 order-1 md:order-2">
            <Link href="/privacy-policy" className="text-xs font-bold text-slate-600 hover:text-slate-950 dark:hover:text-white uppercase tracking-widest transition-colors">
              {t("privacyPolicy")}
            </Link>
            <div className="w-px h-3 bg-slate-400 dark:bg-white/30" />
            <Link href="/terms-of-use" className="text-xs font-bold text-slate-600 hover:text-slate-950 dark:hover:text-white uppercase tracking-widest transition-colors">
              {t("termsOfUse")}
            </Link>
          </div>
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
          className="text-slate-900 dark:text-white"
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
  );
}
