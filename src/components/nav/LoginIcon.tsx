"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import { useLocale } from "@/providers/LocaleProvider";

export default function HeaderLogin() {
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

          /* 🌙 Dark mode: Black Bg + White Icon */
          dark:bg-black/80
          dark:border-slate-800
          dark:text-white
          dark:hover:bg-slate-950
        "
      >
        <LogIn className="h-5 w-5" />
      </button>
    </div>
  );
}
