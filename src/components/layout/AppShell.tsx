'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { TooltipProvider } from '@/components/ui/tooltip';

import HeaderBar from '@/components/nav/HeaderBar';
import FooterBar from '@/components/nav/FooterBar';
import SearchModal from '@/components/nav/SearchModal';
import FloatingToolbar from '@/components/nav/FloatingToolbar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  // pages where header/footer/toolbar hidden
  const authRoutes = ['/signin', '/register', '/forgot-password', '/public/gallery'];
  const isAuthPage = authRoutes.some((route) => pathname.startsWith(route));

  return (
    <TooltipProvider delayDuration={150}>
      <div className="relative z-10 flex min-h-dvh flex-col">

        {/* ================= HEADER ================= */}
        {!isAuthPage && (
          <>
            {/* ⭐ FLOATING HEADER ⭐ */}
            <div className="fixed top-0 left-0 w-full z-[50] px-3 pt-3">
              <div
                className="
                  rounded-2xl
                  bg-background/80
                  backdrop-blur-md
                  shadow-lg
                "
              >
                <HeaderBar onOpenSearch={() => setSearchOpen(true)} />
              </div>
            </div>

            {/* Spacer so content doesn’t hide under header */}
            <div className="h-[95px]" />
          </>
        )}

        {/* ================= MAIN CONTENT ================= */}
        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col">
            <main className={isAuthPage ? 'flex-1' : 'flex-1 px-4 py-6'}>
              {children}
            </main>

            {!isAuthPage && (
              <div className="shrink-0">
                <FooterBar />
              </div>
            )}
          </div>
        </div>

        {/* ================= FLOATING TOOLBAR ================= */}
        {!isAuthPage && (
          <FloatingToolbar onOpenSearch={() => setSearchOpen(true)} />
        )}

        {/* ================= SEARCH MODAL ================= */}
        <SearchModal
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
        />
      </div>
    </TooltipProvider>
  );
}
