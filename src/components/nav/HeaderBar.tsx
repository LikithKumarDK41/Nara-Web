"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, Search, Map, MapPinned, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import LanguageToggle from "@/components/theme/LanguageToggle";
import ThemeToggle from "@/components/theme/ThemeToggle";
import BrandLogo from "@/components/nav/BrandLogo";

import UserProfileDropdown from "./UserProfileDropdown";
import ProfileModal from "./ProfileModal";
import SearchModal from "@/components/shortcuts-modal/searchModal";
import StreetViewModal from "@/components/shortcuts-modal/streetViewModal";
import RegionMapModal from "@/components/shortcuts-modal/regionMapModal";

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [streetViewOpen, setStreetViewOpen] = useState(false);
  const [regionMapOpen, setRegionMapOpen] = useState(false);
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
                    <X className="h-5 w-5 text-slate-900 dark:text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-5 w-5 text-slate-900 dark:text-white" />
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
                <span className="text-lg font-bold truncate max-w-[200px] text-slate-800 dark:text-slate-100">
                  {`${t("explore_nara")} 🦌`}
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="cursor-pointer p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div
                className="flex-1 overflow-y-auto py-6 px-4 space-y-6 scrollbar-hide"
              >
                <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-center"><LanguageToggle /></div>
                  <div className="flex justify-center"><ThemeToggle /></div>
                  <div className="flex justify-center"><AppInfo /></div>
                </div>

                <div className="space-y-1">
                  {/* New Explore Items */}
                  <button
                    onClick={() => {
                      setRegionMapOpen(true);
                    }}
                    className="cursor-pointer w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white transition-all group"
                  >
                    <Map className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{t("region_map") || "Region Map"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setSearchOpen(true);
                    }}
                    className="cursor-pointer w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white transition-all group"
                  >
                    <Search className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{t("search") || "Search"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setStreetViewOpen(true);
                    }}
                    className="cursor-pointer w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white transition-all group"
                  >
                    <MapPinned className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{t("street_view") || "Street View"}</span>
                  </button>

                  {/* <div className="my-2 h-px bg-slate-100 dark:bg-slate-800/50" /> */}

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

                {/* Profile / Login Section (Moved inside scrollable area) */}
                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/50">
                  {isLoggedIn ? (
                    <div
                      onClick={() => {
                        setProfileOpen(true);
                        // Removed setMobileOpen(false) to keep menu open
                      }}
                      className="cursor-pointer flex items-center gap-4 w-full text-left group hover:bg-white dark:hover:bg-slate-800 p-2 -ml-2 rounded-xl transition-all cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setProfileOpen(true);
                          // Removed setMobileOpen(false)
                        }
                      }}
                    >
                      <div className="pointer-events-none">
                        <UserProfileDropdown onViewProfile={() => { }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">
                          {authData.user.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-teal-500 transition-colors">
                          {t("edit_profile")}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full">
                      <HeaderLogin isMobile />
                    </div>
                  )}
                  {isLoggedIn && (
                    <button
                      onClick={() => {
                        dispatch(logout());
                        setMobileOpen(false);
                      }}
                      className="cursor-pointer mt-4 w-full flex items-center justify-center gap-2 text-xs text-red-500 font-medium py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{t("sign_out")}</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence >

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <StreetViewModal
        openModal={streetViewOpen}
        onClose={() => setStreetViewOpen(false)}
      />
      <RegionMapModal
        openMapModal={regionMapOpen}
        onCloseMapModal={() => setRegionMapOpen(false)}
      />

      {/* Spacer for fixed header on non-home pages */}
      {!isHome && <div className="h-[73px]" />}
    </>
  );
}
