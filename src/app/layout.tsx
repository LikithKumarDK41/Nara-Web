// src/app/layout.tsx
import "@/app/globals.css";
import type { Metadata, Viewport } from "next";
import StoreProvider from "@/providers/StoreProvider";
import AppShell from "@/components/layout/AppShell";
import LoaderProvider from "@/providers/LoaderProvider";
import GeoWatcher from "@/components/geo/GeoWatcher";
import GlobalCheckinToasts from "@/components/nav/GlobalCheckinToasts";
import { LocaleProvider } from "@/providers/LocaleProvider";
import AuthGuard from "@/components/system/AuthGuard";
import AppToaster from "@/components/system/AppToaster";

export const metadata: Metadata = {
  // title: "Tourist",
  manifest: "/manifest.json",
  metadataBase: new URL("https://naraiseki.nichi.in"),
  title: "Nara Heritage Guide - Tourist App",
  description: "Explore Nara's cultural heritage with our interactive tourist guide app. Discover monuments, tours, and heritage sites.",
  keywords: ["tourism", "Nara", "heritage", "travel", "map", "guide", "Japan", "monuments", "history"],
  icons: {
    icon: "/icon.png",         // Main favicon (PNG preferred)
    shortcut: "/favicon.ico",  // Backup ICO file
    apple: "/icon.png",        // Apple Touch Icon
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nara Heritage Guide",
  },
};
export const viewport: Viewport = { themeColor: "#0b0f14" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  try {
    const theme = localStorage.getItem('theme') || 'dark';
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  } catch (e) {}
})();
        `,
          }}
        />
      </head>
      <body className="bg-background text-foreground font-['Outfit',sans-serif] antialiased scroll-smooth selection:bg-teal-500/30">

        {/* theme bootstrap script (unchanged) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
      (function () {
        function applyMeta() {
          try {
            const locale = localStorage.getItem('site_locale') || 'ja';

            const META = {
              ja: {
                title: '奈良遺跡めぐり',
                description: '奈良市の観光情報とスタンプラリー',
              },
              en: {
                title: 'Nara Kofun & Heritage Foundation',
                description: 'Tourist information and heritage guide',
              },
            };

            const m = META[locale] || META.ja;

            // ✅ title
            document.title = m.title;

            // ✅ description
            let desc = document.querySelector('meta[name="description"]');
            if (!desc) {
              desc = document.createElement('meta');
              desc.setAttribute('name', 'description');
              document.head.appendChild(desc);
            }
            desc.setAttribute('content', m.description);

            // ✅ html lang
            document.documentElement.setAttribute('lang', locale);
          } catch (e) {}
        }

        // initial load
        applyMeta();

        // react to language toggle
        window.addEventListener('locale-changed', applyMeta);

        // react to storage changes (other tabs)
        window.addEventListener('storage', function (e) {
          if (e.key === 'site_locale') applyMeta();
        });
      })();
    `,
          }}
        />

        <StoreProvider>
          <LoaderProvider>
            <LocaleProvider>
              <AppShell>
                <AuthGuard>{children}</AuthGuard>
              </AppShell>

              <GeoWatcher />
              <GlobalCheckinToasts />
            </LocaleProvider>
          </LoaderProvider>
        </StoreProvider>
        <AppToaster />
      </body>
    </html>
  );
}
