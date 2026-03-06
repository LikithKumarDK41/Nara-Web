"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, ArrowLeft } from "lucide-react";
import MonumentsMap from "@/components/map/MonumentsMap";

export default function MonumentMapModal({ open, onClose, monument,showMonument, showAttraction }: any) {
  if (!monument) return null;

  // ⭐ For array format: [lng, lat]
  const lng = Array.isArray(monument.location) ? monument.location[0] : null;
  const lat = Array.isArray(monument.location) ? monument.location[1] : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="gap-0
         z-50 w-screen h-[100dvh]
  md:h-screen bg-background p-0 !max-w-full overflow-hidden"
      >
        {/* HEADER */}
        {/* ---------------- Header ---------------- */}
        <DialogHeader
          className="
    h-[50px] hidden items-center border-b bg-background py-4 px-8 relative"
        >
          <DialogTitle
            className="
    text-xl font-semibold 
    px-12 
    whitespace-nowrap 
    overflow-hidden 
    text-ellipsis 
    transition-opacity duration-300
    max-w-[80vw]
    hidden
  "
          >
            {monument.title}
          </DialogTitle>

          <button
            onClick={onClose}
            aria-label="Close"
            className="z-[999] cursor-pointer absolute right-6 top-1/2 -translate-y-1/2 
       text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 
       transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 p-2"
          >
            <X className="h-6 w-6" strokeWidth={2} />
          </button>
        </DialogHeader>

        {/* MAP WRAPPER */}
        <div className="relative w-full h-full">
          {/* 🔙 BACK BUTTON (TOP-LEFT OVER MAP) */}
          <button
            onClick={onClose}
            aria-label="Back"
            className="cursor-pointer
              absolute top-4 left-4 z-[1000]
              flex items-center justify-center
              w-10 h-10 rounded-full
              bg-white/90 dark:bg-black/80
              shadow-lg backdrop-blur
              hover:bg-white dark:hover:bg-black
              transition
            "
          >
            <ArrowLeft className="h-5 w-5 text-gray-900 dark:text-gray-100" />
          </button>

        {/* MAP */}
        <MonumentsMap
          height="100dvh"
          showMonument={showMonument}
          showAttraction={showAttraction}
          near_monuments={monument.nearbymonuments}
          singleLocation={{
            id: monument._id,
            title: monument.title,
            lat,
            lng,
            image: monument.image?.secure_url,
            brief: monument.content?.brief,
          }}
        />
      </div>
      </DialogContent>
    </Dialog>
  );
}
