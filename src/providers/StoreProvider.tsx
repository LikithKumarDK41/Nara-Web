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
      >
        {children}
      </PersistGate>
    </Provider>
  );
}
