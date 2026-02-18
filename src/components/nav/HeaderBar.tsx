"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

export default function HeaderBar() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [scrolled, setScrolled] = useState(false);

  const authData = useAppSelector((s) => s.auth.data);
  const isLoggedIn = !!authData?.user;

  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  async function handleItemClick(item: NavItem) {
    if (item.type !== "action") return;

    if (item.action === "logout") {
      await dispatch(logout());
      router.replace("/signin");
      return;
    }
  }

  function resolveTheme(): "light" | "dark" {
    const mode = localStorage.getItem("theme-mode") || "system";
    if (mode === "dark") return "dark";
    if (mode === "light") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  useEffect(() => {
    setResolvedTheme(resolveTheme());
    const handler = () => setResolvedTheme(resolveTheme());
    window.addEventListener("theme-changed", handler);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", handler);
    return () => {
      window.removeEventListener("theme-changed", handler);
      mq.removeEventListener("change", handler);
    };
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[200] transition-all duration-500 border-b ${scrolled
          ? "bg-white/90 backdrop-blur-md border-slate-200 py-3 shadow-sm"
          : "bg-transparent border-transparent py-5"
          }`}
      >
        <div className="w-full px-2 md:px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandLogo scrolled={scrolled} />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
              <AppInfo />
              <div className="mx-2 h-6 w-px bg-slate-200 dark:bg-slate-700" />
              {isLoggedIn ? (
                <>
                  <UserProfileDropdown onViewProfile={() => setProfileOpen(true)} />
                  <HeaderLogout />
                </>
              ) : (
                <HeaderLogin />
              )}
            </div>
          </nav>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="group relative h-10 w-10 flex items-center justify-center rounded-full bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-medium"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className={`h-5 w-5 ${scrolled ? "text-slate-900 dark:text-white" : "text-white"}`} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className={`h-5 w-5 ${scrolled ? "text-slate-900 dark:text-white" : "text-white"}`} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[150] lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[300px] bg-white dark:bg-slate-950 z-[200] shadow-2xl lg:hidden flex flex-col border-l border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                <span className="text-lg font-bold">Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-center"><LanguageToggle /></div>
                  <div className="flex justify-center"><ThemeToggle /></div>
                  <div className="flex justify-center"><AppInfo /></div>
                </div>

                <div className="space-y-1">
                  {MOBILE_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    if (item.type === "action") {
                      return (
                        <button
                          key={item.action}
                          onClick={() => {
                            handleItemClick(item);
                            setMobileOpen(false);
                          }}
                          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white transition-all group"
                        >
                          <Icon className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">{t(item.labelKey)}</span>
                        </button>
                      );
                    }

                    let href = item.href;
                    if (item.isVideo) {
                      const params = new URLSearchParams({
                        lang: locale,
                        theme: resolvedTheme,
                      });
                      href = `${item.href}?${params.toString()}`;
                    }

                    return (
                      <Link
                        key={item.href}
                        href={href}
                        target={item.isVideo ? "_blank" : undefined}
                        onClick={() => setMobileOpen(false)}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white transition-all group"
                      >
                        <Icon className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">{t(item.labelKey)}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
                {isLoggedIn ? (
                  <div className="flex items-center gap-4">
                    <UserProfileDropdown onViewProfile={() => setProfileOpen(true)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">
                        {authData.user.name}
                      </p>
                      <button
                        onClick={() => dispatch(logout())}
                        className="text-xs text-red-500 font-medium hover:underline"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full">
                    <HeaderLogin />
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />

      {/* Spacer for fixed header on non-home pages */}
      {!isHome && <div className="h-[73px]" />}
    </>
  );
}
