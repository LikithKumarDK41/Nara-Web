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
  const authRoutes = ['/signin', '/register', '/forgot-password'];
  const isAuthPage = authRoutes.some((route) => pathname.startsWith(route));

  return (
    <TooltipProvider delayDuration={150}>
      <div className="relative z-10 flex min-h-dvh flex-col">

        {/* ================= HEADER ================= */}
        {!isAuthPage && (
          <HeaderBar />
        )}

        {/* ================= MAIN CONTENT ================= */}
        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col">
            <main className="flex-1">
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
        {/* {!isAuthPage && (
          <FloatingToolbar onOpenSearch={() => setSearchOpen(true)} />
        )} */}

        {/* ================= SEARCH MODAL ================= */}
        <SearchModal
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
        />
      </div>
    </TooltipProvider>
  );
}
