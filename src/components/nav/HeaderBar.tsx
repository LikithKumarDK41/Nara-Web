"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

import LanguageToggle from "@/components/theme/LanguageToggle";
import ThemeToggle from "@/components/theme/ThemeToggle";
import BrandLogo from "@/components/nav/BrandLogo";

import UserProfileDropdown from "./UserProfileDropdown";
import ProfileModal from "./ProfileModal";

import { MOBILE_NAV_ITEMS, NavItem } from "./routes";
import { useLocale } from "@/providers/LocaleProvider";
import { useAppDispatch, useAppSelector } from "@/lib/store/hook";
import { logout } from "@/lib/store/slices/authSlice";
import HeaderLogout from "./Logout";
import AppInfo from "./InfoIcon";
import HeaderLogin from "./LoginIcon";

export default function HeaderBar({
  onOpenSearch,
}: {
  onOpenSearch: () => void;
}) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  const authData = useAppSelector((s) => s.auth.data);
  const isLoggedIn = !!authData?.user;

  async function handleItemClick(item: NavItem) {
    if (item.type !== "action") return;

    if (item.action === "logout") {
      await dispatch(logout());
      router.replace("/signin");
      return;
    }

    if (item.action === "search") {
      setMobileOpen(false);
      setTimeout(() => {
        onOpenSearch();
      }, 120);
    }
  }

  function resolveTheme(): "light" | "dark" {
    const mode = localStorage.getItem("theme-mode") || "system";

    if (mode === "dark") return "dark";
    if (mode === "light") return "light";

    // system
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  /* ---------------- Scroll Tracking for Header ---------------- */
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // set initial value
    setResolvedTheme(resolveTheme());

    // handler when theme changes
    const handler = () => {
      setResolvedTheme(resolveTheme());
    };

    // listen to custom event
    window.addEventListener("theme-changed", handler);

    // also listen to system theme changes (when mode = system)
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", handler);

    return () => {
      window.removeEventListener("theme-changed", handler);
      mq.removeEventListener("change", handler);
    };
  }, []);

  return (
    <>
      {/* =============================
          FULL WIDTH SCROLLING HEADER
      ============================== */}
      {/* =============================
          FIXED FLOATING HEADER (GRADIENT WRAPPER)
      ============================== */}
      <header className="fixed top-0 left-0 w-full z-[200]">
        <div
          className="
            p-[1px] rounded-[18px]
            bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400
          "
        >
          <div className="header-panel bg-gray-50 backdrop-blur shadow-2xl dark:bg-[rgba(10,10,10,0.9)]">
            <div className="mx-auto flex h-16 items-center gap-3 px-4">
              <BrandLogo />

              {/* RIGHT */}
              <div className="ml-auto flex items-center gap-3">
                {/* DESKTOP ICONS - Matching Theme Colors */}
                <div className="hidden lg:flex items-center gap-3">
                  <LanguageToggle />
                  <ThemeToggle />
                  <AppInfo />
                  {isLoggedIn && (
                    <UserProfileDropdown
                      onViewProfile={() => setProfileOpen(true)}
                    />
                  )}
                  {isLoggedIn && <HeaderLogout />}
                  {!isLoggedIn && <HeaderLogin />}
                </div>

                {/* MOBILE HAMBURGER */}
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="
                      lg:hidden h-10 w-10 flex items-center justify-center rounded-full
                      border border-teal-500/30
                      bg-white dark:bg-black/80
                      backdrop-blur-md
                      transition-all cursor-pointer
                      text-teal-600 dark:text-teal-400
                      hover:shadow-[0_0_10px_rgba(20,184,166,0.35)]
                    "
                >
                  {mobileOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =============================
          MOBILE MENU (FLOATING MATCHING PANEL)
      ============================== */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[9999] top-[80px] left-0 w-full flex justify-center z-[150] h-[calc(100vh-88px)] overflow-y-auto lg:hidden animate-slideDown">
          <div className="w-full md:px-0">
            <div className="gradient-wrapper">
              <div className="menu-panel bg-gray-50 dark:bg-[rgba(10,10,10,0.92)]">
                {/* TOP ROW (Profile + Toggles) */}
                <div className="flex justify-end items-center gap-3 px-4 py-3 border-b border-white/10">
                  <LanguageToggle />
                  <ThemeToggle />
                  <AppInfo />
                  {isLoggedIn && (
                    <UserProfileDropdown
                      onViewProfile={() => setProfileOpen(true)}
                    />
                  )}
                  {isLoggedIn && <HeaderLogout />}
                  {!isLoggedIn && <HeaderLogin />}
                </div>

                {/* MENU ITEMS */}
                <div className="divide-y divide-white/10">
                  {MOBILE_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;

                    // 🔐 ACTION ITEM
                    if (item.type === "action") {
                      return (
                        <button
                          key={item.action}
                          onClick={() => {
                            handleItemClick(item);
                            setMobileOpen(false);
                          }}
                          className="
          w-full flex items-center gap-3 px-4 py-4
          text-base transition cursor-pointer
        "
                        >
                          <Icon className="h-5 w-5 text-black/80 dark:text-white/80" />
                          <span className="flex-1 text-left">
                            {t(item.labelKey)}
                          </span>
                        </button>
                      );
                    }

                    // 🔗 LINK ITEM (TS knows href exists here)
                    let href = item.href;

                    if (item.isVideo) {
                      const theme = resolvedTheme;
                      const params = new URLSearchParams({
                        lang: locale,
                        theme,
                      });

                      href = `${item.href}?${params.toString()}`;
                    }

                    return (
                      <Link
                        key={item.href}
                        href={href}
                        target={item.isVideo ? "_blank" : undefined}
                        rel={item.isVideo ? "noopener noreferrer" : undefined}
                        onClick={() => setMobileOpen(false)}
                        className="
        w-full flex items-center gap-3 px-4 py-4
        text-base hover:bg-black/5 dark:hover:bg-white/5 transition
      "
                      >
                        <Icon className="h-5 w-5 text-black/80 dark:text-white/80 shrink-0" />
                        <span className="flex-1">{t(item.labelKey)}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />

      {/* Animation */}
      <style>{`
        @keyframes slideDown {
          0% { opacity: 0; transform: translateY(-8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.25s ease-out;
        }

        /* Shared Gradient Wrapper */
     .gradient-wrapper {
  border-radius: 18px;
  padding: 1px;
  background: linear-gradient(
    to right,
    #2dd4bf, /* teal-400 */
    #14b8a6, /* teal-500 */
    #0d9488  /* teal-600 */
  );
}

        /* Header Inner Panel */
        .header-panel {
          border-radius: 16px;
          // background: rgba(10,10,10,0.90);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.15);
        }

        /* Mobile Menu Inner Panel */
        .menu-panel {
          border-radius: 16px;
          // background: rgba(10,10,10,0.92);
          backdrop-filter: blur(22px);
          border: 1px solid rgba(255,255,255,0.15);
        }
      `}</style>
    </>
  );
}
