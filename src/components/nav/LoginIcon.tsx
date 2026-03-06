"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import { useLocale } from "@/providers/LocaleProvider";

export default function HeaderLogin({ isMobile }: { isMobile?: boolean }) {
  const router = useRouter();
  const { t } = useLocale();
  const pathname = usePathname();
  const search = useSearchParams();

  // compute the "next" URL (path + query)
  const nextUrl = React.useMemo(() => {
    const qs = search?.toString();
    return qs ? `${pathname}?${qs}` : pathname || "/";
  }, [pathname, search]);

  function handleLogin() {
    router.push(`/signin?next=${encodeURIComponent(nextUrl)}`);
  }

  if (isMobile) {
    return (
      <button
        onClick={handleLogin}
        className="cursor-pointer
          w-full flex items-center justify-center gap-2
          px-4 py-3.5 rounded-xl
          bg-teal-500 text-white
          hover:bg-teal-600
          dark:bg-teal-600 dark:hover:bg-teal-500
          transition-all font-medium shadow-sm
        "
      >
        <LogIn className="h-5 w-5" />
        <span>{t("actions.login") || "Log in / Sign up"}</span>
      </button>
    );
  }

  return (
    <div className="relative group">
      <button
        onClick={handleLogin}
        aria-label={t("actions.login")}
        title={t("actions.login")}
        className="
          h-9 w-9 flex items-center justify-center rounded-full
          backdrop-blur-md transition cursor-pointer

         /* 🌞 Light mode */
          bg-white
          border border-slate-200
          text-slate-900
          hover:shadow-md

          /* 🌙 Dark mode: Slate Bg + White Icon */
          dark:bg-slate-800
          dark:border-slate-700
          dark:text-gray-100
          dark:hover:bg-slate-700
        "
      >
        <LogIn className="h-5 w-5" />
      </button>
    </div>
  );
}
