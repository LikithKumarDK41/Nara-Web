"use client";

import MonumentsMap from "@/components/map/GlobalMap";
import { useLocale } from "@/providers/LocaleProvider";

export default function MonumentsPage() {
  const { t } = useLocale();

  return (
    <div className="space-y-6 min-h-screen">
      {/* ===== HERO SECTION ===== */}
      <section className="relative w-full mx-auto bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white rounded-2xl shadow-xl overflow-hidden">
        <div className="max-w-5xl mx-auto py-3 md:py-16 px-6 text-center">
          <h1 className="text-2xl md:text-5xl font-extrabold tracking-wide mb-3 drop-shadow-md">
            {t("map_title")}
          </h1>
          <p className="text-sm md:text-xl font-medium opacity-90">
            {t("map_desc")}
          </p>
        </div>
      </section>

      {/* Map Component */}
      <div className="w-full">
        <MonumentsMap height={600} />
      </div>
    </div>
  );
}
