'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  HelpCircle,
  LogOut,
  X,
  Zap,
  Wifi,
  ShieldCheck,
} from 'lucide-react';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { useProfiles } from '@/hooks/useProfiles';

interface NavbarProps {
  onOpenSearch: () => void;
}

export default function Navbar({ onOpenSearch }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const { isLowNetwork, effectiveType, downlinkMbps, manualDataSaver, setManualDataSaver } =
    useNetworkQuality();
  const { profiles, activeProfile, switchProfile } = useProfiles();

  // Scroll listener to toggle transparent vs solid black #141414 header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 25) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus search input when toggled
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'TV Shows', href: '/series' },
    { name: 'Movies', href: '/movies' },
    { name: 'New & Popular', href: '/browse' },
    { name: 'My List', href: '/my-list' },
    { name: 'Live TV', href: '/livetv' },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-400 ease-in-out px-4 sm:px-12 md:px-16 ${
        isScrolled
          ? 'bg-[#141414] shadow-md shadow-black/80'
          : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent'
      }`}
    >
      <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
        {/* Left Side: Brand Logo and Primary Nav Links */}
        <div className="flex items-center gap-6 lg:gap-10">
          {/* Flix Movie Wordmark Logo */}
          <Link href="/" className="flex items-center gap-1.5 group">
            <span className="text-[#E50914] font-black text-2xl sm:text-3xl tracking-tighter uppercase font-sans drop-shadow-md group-hover:scale-105 transition-transform">
              FLIX
            </span>
            <span className="px-1.5 py-0.5 rounded text-[11px] font-black bg-[#E50914] text-white tracking-widest uppercase">
              MOVIE
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`transition-colors duration-200 ${
                    isActive
                      ? 'text-white font-bold'
                      : 'text-[#e5e5e5] hover:text-[#b3b3b3]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Search, Notifications, Data Saver, and Profile Menu */}
        <div className="flex items-center gap-4 sm:gap-6 text-white text-sm">
          {/* Netflix-Style Expanding Search Box */}
          <div className="relative flex items-center">
            {searchOpen ? (
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center bg-black/90 border border-white px-2.5 py-1 transition-all w-52 sm:w-64"
              >
                <Search className="w-4 h-4 text-white shrink-0 mr-2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Titles, people, genres"
                  className="bg-transparent border-none text-white text-xs sm:text-sm placeholder-zinc-400 focus:outline-none w-full"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-0.5 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="text-white hover:text-zinc-300 transition"
                aria-label="Search"
                title="Search (Click or press Cmd+K)"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Data Saver Mode Pill */}
          <button
            onClick={() => setManualDataSaver(!manualDataSaver)}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border transition ${
              manualDataSaver || isLowNetwork
                ? 'bg-amber-600/30 text-amber-300 border-amber-500/60'
                : 'bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:text-white'
            }`}
            title={`Network: ${effectiveType.toUpperCase()} (${downlinkMbps} Mbps). Click to toggle Data Saver.`}
          >
            {manualDataSaver || isLowNetwork ? (
              <>
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>Data Saver</span>
              </>
            ) : (
              <>
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span>4K HD</span>
              </>
            )}
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="text-white hover:text-zinc-300 transition relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#E50914]" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 rounded bg-[#181818] border border-zinc-700 shadow-2xl p-4 z-50 text-xs space-y-3 animate-fade-in">
                <span className="font-bold text-white block text-sm">Notifications</span>
                <div className="space-y-2">
                  <div className="p-2 rounded bg-zinc-900 border border-zinc-800 flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#E50914] mt-1 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">New Release: Dune Part Two</p>
                      <p className="text-zinc-400 text-[11px]">Now available to stream in 4K Ultra HD.</p>
                    </div>
                  </div>
                  <div className="p-2 rounded bg-zinc-900 border border-zinc-800 flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Redirect Shield Active</p>
                      <p className="text-zinc-400 text-[11px]">Ad-free streaming protection enabled.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Netflix Profile Avatar & Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setProfileDropdownOpen(true)}
            onMouseLeave={() => setProfileDropdownOpen(false)}
          >
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-1.5 focus:outline-none"
              aria-label="Account and Profile"
            >
              <div
                className={`w-8 h-8 rounded bg-gradient-to-tr ${activeProfile.avatarColor} flex items-center justify-center text-sm font-bold shadow-md`}
              >
                {activeProfile.icon}
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-white transition-transform duration-200 ${
                  profileDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Authentic Netflix Profile Caret Dropdown */}
            {profileDropdownOpen && (
              <div className="absolute right-0 top-full pt-2 w-56 z-50 animate-fade-in">
                <div className="rounded bg-[#141414] border border-[#333333] shadow-2xl p-3 text-xs text-[#e5e5e5] space-y-3">
                  {/* Profiles List */}
                  <div className="space-y-2 border-b border-[#333333] pb-3">
                    {profiles.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          switchProfile(p.id);
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 py-1 hover:underline text-left text-zinc-300 hover:text-white"
                      >
                        <div
                          className={`w-7 h-7 rounded bg-gradient-to-tr ${p.avatarColor} flex items-center justify-center text-xs font-bold shrink-0`}
                        >
                          {p.icon}
                        </div>
                        <span className={`truncate ${p.id === activeProfile.id ? 'font-bold text-white' : ''}`}>
                          {p.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Profile Management Links */}
                  <div className="space-y-2 border-b border-[#333333] pb-3">
                    <Link
                      href="/profiles"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 hover:underline text-zinc-300 hover:text-white"
                    >
                      <User className="w-4 h-4 text-zinc-400" />
                      <span>Manage Profiles</span>
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 hover:underline text-zinc-300 hover:text-white"
                    >
                      <Settings className="w-4 h-4 text-zinc-400" />
                      <span>Account Settings</span>
                    </Link>
                    <Link
                      href="/browse"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 hover:underline text-zinc-300 hover:text-white"
                    >
                      <HelpCircle className="w-4 h-4 text-zinc-400" />
                      <span>Help Centre</span>
                    </Link>
                  </div>

                  {/* Sign Out Link */}
                  <div>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        router.push('/profiles');
                      }}
                      className="w-full text-center py-1 hover:underline text-zinc-400 hover:text-white font-semibold"
                    >
                      Sign out of Flix Movie
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Links Row */}
      <div className="md:hidden flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none text-xs border-t border-white/10 pt-2 text-[#e5e5e5]">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`whitespace-nowrap ${
              pathname === link.href ? 'text-white font-bold' : 'text-[#b3b3b3]'
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>
    </header>
  );
}
