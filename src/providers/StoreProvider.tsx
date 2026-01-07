"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/lib/store";
import React, { useEffect, useState } from "react";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // 👈 IMPORTANT

  return (
    <Provider store={store}>
      <PersistGate
        persistor={persistor}
        loading={null}
        // loading={
        //   <div
        //     className="fixed inset-0 z-[9999] grid place-items-center bg-background/80 backdrop-blur-md"
        //     suppressHydrationWarning
        //   >
        //     <div className="relative flex flex-col items-center gap-3">
        //       {/* Glow */}
        //       <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 blur-xl opacity-40" />

        //       {/* Text */}
        //       <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
        //         {mounted
        //           ? locale === "ja"
        //             ? "保存された状態を読み込んでいます…"
        //             : "Loading saved state…"
        //           : "保存された状態を読み込んでいます…"}
        //       </span>
        //     </div>
        //   </div>
        // }
      >
        {children}
      </PersistGate>
    </Provider>
  );
}
