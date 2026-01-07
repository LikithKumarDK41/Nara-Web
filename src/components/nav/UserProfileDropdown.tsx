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
        className="flex items-center justify-center w-full h-full cursor-pointer focus:outline-none"
      >
        {avatar ? (
          <img
            src={avatar}
            alt={userName}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <User className="h-5 w-5 text-current" />
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
        <div className="font-semibold text-amber-700 dark:text-amber-300">{userName}</div>
        <div className="text-[11px] text-gray-900 dark:text-gray-300">{userEmail}</div>
      </div>
    </div>
  );
}
