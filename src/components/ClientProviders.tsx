'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CommandSearchModal from '@/components/CommandSearchModal';
import ToastContainer from '@/components/Toast';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const isWatchPage = pathname?.startsWith('/watch');

  useEffect(() => {
    const handleOpenSearch = () => setIsSearchOpen(true);
    window.addEventListener('open-command-search', handleOpenSearch);
    return () => window.removeEventListener('open-command-search', handleOpenSearch);
  }, []);

  return (
    <>
      {/* Authentic Netflix Fixed Gradient/Solid Navbar (hidden on dedicated cinematic watch pages) */}
      {!isWatchPage && <Navbar onOpenSearch={() => setIsSearchOpen(true)} />}

      {/* Global Instant Cmd+K Search Modal */}
      <CommandSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Edge-to-Edge OTT Application Container */}
      <main className={`flex-1 w-full ${isWatchPage ? 'bg-black min-h-screen' : 'pb-16'}`}>
        {children}
      </main>

      {/* Global Toast Notifications */}
      <ToastContainer />
    </>
  );
}
