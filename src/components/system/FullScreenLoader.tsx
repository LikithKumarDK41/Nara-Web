// src/components/system/FullScreenLoader.tsx
"use client";

export function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-background/80 backdrop-blur-sm">
      <div
        className="
          h-12 w-12 animate-spin rounded-full
          border-4 border-transparent
          border-t-orange-500
          border-r-amber-500
          border-b-yellow-400
        "
      />
    </div>
  );
}
