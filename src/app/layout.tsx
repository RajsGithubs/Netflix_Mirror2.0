import type { Metadata, Viewport } from 'next';
import './globals.css';
import ClientProviders from '@/components/ClientProviders';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Netflix 2.0 — Watch TV Shows Online, Watch Movies Online',
  description:
    'Netflix 2.0 offers unlimited movies, TV shows, and anime in 4K Ultra HD with zero ads and seamless playback.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* High-Performance Preconnect & DNS-Prefetch */}
        <link rel="preconnect" href="https://vidlink.pro" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://vidlink.pro" />
        <link rel="preconnect" href="https://vidsrc.pm" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://vidsrc.pm" />
        <link rel="preconnect" href="https://v3-cinemeta.strem.io" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://v3-cinemeta.strem.io" />
        <link rel="preconnect" href="https://api.jikan.moe" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.jikan.moe" />
      </head>

      <body className="min-h-screen bg-[#141414] text-white flex flex-col selection:bg-[#E50914] selection:text-white antialiased">
        <ClientProviders>{children}</ClientProviders>

        {/* Netflix Classic Gray Multi-Column Footer */}
        <footer className="mt-auto border-t border-[#232323] bg-[#141414] text-xs text-[#808080] py-14 px-4 sm:px-12 md:px-16">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm tracking-wider">Netflix 2.0</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-red-600/20 text-[#E50914] font-bold uppercase">
                OTT Global
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 pt-2">
              <ul className="space-y-3">
                <li><a href="/browse" className="hover:underline">Audio and Subtitles</a></li>
                <li><a href="/browse" className="hover:underline">Media Centre</a></li>
                <li><a href="/account" className="hover:underline">Privacy</a></li>
                <li><a href="/livetv" className="hover:underline">Contact Us</a></li>
              </ul>
              <ul className="space-y-3">
                <li><a href="/movies" className="hover:underline">Audio Description</a></li>
                <li><a href="/account" className="hover:underline">Investor Relations</a></li>
                <li><a href="/account" className="hover:underline">Legal Notices</a></li>
                <li><a href="/livetv" className="hover:underline">Live Channels</a></li>
              </ul>
              <ul className="space-y-3">
                <li><a href="/account" className="hover:underline">Help Centre</a></li>
                <li><a href="/account" className="hover:underline">Jobs</a></li>
                <li><a href="/account" className="hover:underline">Cookie Preferences</a></li>
                <li><a href="/series" className="hover:underline">TV Series</a></li>
              </ul>
              <ul className="space-y-3">
                <li><a href="/account" className="hover:underline">Gift Cards</a></li>
                <li><a href="/account" className="hover:underline">Terms of Use</a></li>
                <li><a href="/account" className="hover:underline">Corporate Information</a></li>
                <li><a href="/profiles" className="hover:underline">Profiles</a></li>
              </ul>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-zinc-800/60 text-[11px] text-[#737373]">
              <p>© 2026 Netflix 2.0, Inc. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Redirect Shield Active
                </span>
                <span>•</span>
                <span>Ad-Free 4K Ultra HD</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
