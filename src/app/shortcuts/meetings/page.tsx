"use client";

import Image from "next/image";
import { useLocale } from "@/providers/LocaleProvider";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function MeetingsPage() {
  const { t } = useLocale();
  const router = useRouter();

  const menuItems = [
    {
      label: t("meetings.special_products"),
      icon: "/icons/bottle.png",
      link: "https://www.city.gose.nara.jp/kankou/0000001527.html",
    },
    {
      label: t("meetings.photo_contest"),
      icon: "/icons/camera_sight_seeing.png",
      link: "https://www.city.gose.nara.jp/kankou/0000001582.html",
    },
    {
      label: t("meetings.bus_katsuragi"),
      icon: "/icons/bus.png",
      link: "/shortcuts/meetings/bus",
    },
    {
      label: t("meetings.gosen_character"),
      icon: "/icons/doll.png",
      link: "/shortcuts/meetings/gose-character",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="relative w-full mx-auto bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white rounded-2xl shadow-xl">
        <div className="max-w-5xl mx-auto py-3 md:py-16 px-6 text-center">
          <h1 className="text-2xl md:text-5xl font-extrabold tracking-wide mb-3 drop-shadow-md">
            {t("meetings.title")}
          </h1>
          <p className="text-sm md:text-xl font-medium opacity-90">
            {t("shortcut.tourist_attraction_desc")}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {menuItems.map((item, idx) => (
          <div key={idx}>
            <div className="p-4 group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white/70 dark:bg-white/10 shadow-md hover:shadow-xl transition-all border border-orange-200 dark:border-orange-700">
              <div className="relative w-full overflow-hidden flex items-center justify-center -mt-14">
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={90}
                  height={90}
                  className="w-auto h-auto object-contain transition-transform duration-500 group-hover:scale-[1.1]"
                />
              </div>
              {/* Title area — allow it to grow */}
              <div className="flex flex-col p-4 text-center flex-1">
                <h3 className="text-base font-semibold text-amber-700 dark:text-amber-300 line-clamp-2">
                  {item.label}
                </h3>
              </div>

              {/* Button fixed bottom */}
              <div className="mt-auto">
                <Button
                  className="w-full cursor-pointer mt-3 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white hover:opacity-90"
                  onClick={() => router.push(item.link)}
                >
                  {t("tourDetails.viewDetails")}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
