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
        className="flex items-center justify-center w-full h-full cursor-pointer focus:outline-none"
      >
        <LogOut className="h-5 w-5 text-current" />
      </button>
    </div>
  );
}
