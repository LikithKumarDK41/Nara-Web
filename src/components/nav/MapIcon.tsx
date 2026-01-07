"use client";

import { Map } from "lucide-react";

export default function MapIcon() {
  return (
    <>
      <button
        className="
        h-9 w-9 flex items-center justify-center rounded-full
        backdrop-blur-md transition cursor-pointer
    
        /* Light mode */
        bg-white/80 border border-black/10 text-orange-700 hover:bg-black/5
    
        /* Dark mode */
        dark:bg-black/20 dark:border-white/20 dark:text-orange-600 hover:dark:bg-white/10
      "
        onClick={() => (window.location.href = "/map")}
      >
        <Map />
      </button>
    </>
  );
}
