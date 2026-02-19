"use client";

import { useAppSelector } from "@/lib/store/hook";
import { User } from "lucide-react";

export default function UserProfileDropdown({
  onViewProfile,
}: {
  onViewProfile: () => void;
}) {
  const auth = useAppSelector((state) => state.auth);
  const user = auth?.data?.user || null;

  const avatar = user?.image?.secure_url || user?.image?.url || null;
  const userName = user?.name || "Guest User";
  const userEmail = user?.email || "No email available";

  return (
    <div className="relative group">
      {/* PROFILE BUTTON */}
      <button
        onClick={onViewProfile}
        aria-label="User profile"
        className="
          h-9 w-9
          flex items-center justify-center
          rounded-full
          backdrop-blur-md
          transition-all duration-300
          cursor-pointer

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
        {avatar ? (
          <img
            src={avatar}
            alt={userName}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <User className="h-4 w-4" />
        )}
      </button>

      {/* TOOLTIP */}
      <div
        className="
          pointer-events-none
          absolute left-1/2 top-full mt-2
          -translate-x-1/2
          opacity-0 group-hover:opacity-100
          transition-all duration-200

          rounded-lg px-3 py-2
          text-xs text-white text-center
          dark:bg-black/90
          bg-white/90
          shadow-lg
          whitespace-nowrap
        "
      >
        <div className="font-semibold text-slate-900 dark:text-white">{userName}</div>
        <div className="text-[11px] text-gray-900 dark:text-gray-300">{userEmail}</div>
      </div>
    </div>
  );
}
