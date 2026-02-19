"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/lib/store/hook";
import { logout } from "@/lib/store/slices/authSlice";
import { LogOut } from "lucide-react";
import { useLocale } from "@/providers/LocaleProvider";

export default function HeaderLogout() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useLocale();
  const pathname = usePathname();
  const search = useSearchParams();

  // compute the "next" URL (path + query)
  const nextUrl = React.useMemo(() => {
    const qs = search?.toString();
    return qs ? `${pathname}?${qs}` : pathname || "/";
  }, [pathname, search]);

  async function handleLogout() {
    await dispatch(logout());
    router.push(`/signin?next=${encodeURIComponent(nextUrl)}`);
  }

  return (
    <div className="relative group">
      <button
        onClick={handleLogout}
        aria-label={t("actions.logout")}
        title={t("actions.logout")}
        className="
          h-9 w-9 flex items-center justify-center rounded-full
          backdrop-blur-md transition cursor-pointer

          /* 🌞 Light mode */
          bg-white border border-slate-200 text-slate-900 hover:bg-slate-50

          /* 🌙 Dark mode: Slate Bg + White Icon */
          dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100 dark:hover:bg-slate-700
        "
      >
        <LogOut className="h-5 w-5" />
      </button>
    </div>
  );
}
