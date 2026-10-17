'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play,
  Info,
  Volume2,
  VolumeX,
  RotateCcw,
} from 'lucide-react';
import { MediaItem } from '@/lib/metadata';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { playBrandSound } from '@/lib/brandSound';

interface BillboardProps {
  items: MediaItem[];
  onOpenDetails: (item: MediaItem) => void;
}

export default function Billboard({ items, onOpenDetails }: BillboardProps) {
  const router = useRouter();
  const { isWatchlisted, addToWatchlist, removeFromWatchlist } = useWatchHistory();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const featured = items.length > 0 ? items.slice(0, 5) : [];
  const currentItem = featured[currentIndex] || items[0];

  useEffect(() => {
    if (featured.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 9000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [featured.length, isPaused, currentIndex]);

  if (!currentItem) return null;

  const handlePlay = () => {
    playBrandSound();
    if (currentItem.type === 'livetv') {
      router.push(`/livetv?channel=${currentItem.id}`);
    } else {
      router.push(`/watch/${currentItem.type}/${currentItem.id}`);
    }
  };

  const handleToggleSound = () => {
    if (isMuted) {
      playBrandSound();
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }
  };

  const isSeries = currentItem.type === 'series' || currentItem.type === 'anime';

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full min-h-[75vh] md:min-h-[85vh] flex items-center select-none overflow-hidden"
    >
      {/* 1. Massive Cinematic Full-Bleed Backdrop Image */}
      <div className="absolute inset-0 z-0">
        <img
          key={currentItem.id}
          src={currentItem.backdropUrl || currentItem.posterUrl}
          alt={currentItem.title}
          className="w-full h-full object-cover object-center scale-100 transition-opacity duration-1000 ease-in-out"
        />

        {/* Netflix Exact Triple Gradients */}
        {/* Bottom fade into #141414 content rows */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
        {/* Left-to-right fade for maximum typography contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/60 to-transparent" />
        {/* Top vignette behind navbar */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 to-transparent" />
      </div>

      {/* 2. Main Billboard Content */}
      <div className="relative z-10 w-full px-4 sm:px-12 md:px-16 pt-20 max-w-3xl space-y-4">
        {/* Netflix Red N Badge */}
        <div className="flex items-center gap-2">
          <span className="text-[#E50914] font-black tracking-widest text-lg sm:text-xl font-sans drop-shadow-md">
            N
          </span>
          <span className="text-zinc-300 font-extrabold text-xs sm:text-sm tracking-[0.25em] uppercase">
            {isSeries ? 'S E R I E S' : 'F I L M'}
          </span>
        </div>

        {/* Top 10 Ranking Badge */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#E50914] text-white flex items-center justify-center font-black text-xs rounded-sm shadow-sm">
            TOP
          </div>
          <span className="text-white font-extrabold text-sm sm:text-base drop-shadow-md">
            #1 in {isSeries ? 'TV Shows' : 'Movies'} Today
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-none drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)]">
          {currentItem.title}
        </h1>

        {/* Synopsis */}
        <p className="text-white/90 text-sm sm:text-base md:text-lg line-clamp-3 leading-relaxed max-w-xl drop-shadow-md font-normal">
          {currentItem.description ||
            'Experience this cinematic masterpiece in ultra high definition with ad-free streaming and zero buffering.'}
        </p>

        {/* Primary Netflix Action Buttons */}
        <div className="flex items-center gap-3 pt-3">
          {/* Solid White Netflix Play Button */}
          <button
            onClick={handlePlay}
            className="flex items-center gap-2.5 px-6 sm:px-8 py-2 sm:py-2.5 rounded bg-white hover:bg-white/75 text-black font-extrabold text-sm sm:text-base transition duration-200 shadow-xl"
          >
            <Play className="w-5 h-5 fill-black" />
            <span>Play</span>
          </button>

          {/* Translucent Gray More Info Button */}
          <button
            onClick={() => onOpenDetails(currentItem)}
            className="flex items-center gap-2.5 px-6 sm:px-8 py-2 sm:py-2.5 rounded bg-[rgba(109,109,110,0.7)] hover:bg-[rgba(109,109,110,0.4)] text-white font-bold text-sm sm:text-base transition duration-200 backdrop-blur-sm"
          >
            <Info className="w-5 h-5 text-white" />
            <span>More Info</span>
          </button>
        </div>
      </div>

      {/* 3. Right Edge Controls: Maturity Rating Bar & Audio Toggle */}
      <div className="absolute right-0 bottom-36 sm:bottom-40 z-20 flex items-center gap-3">
        {/* Sound toggle button */}
        <button
          onClick={handleToggleSound}
          className="w-10 h-10 rounded-full border border-white/60 bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition shadow-lg mr-2"
          aria-label={isMuted ? 'Turn Sound On' : 'Mute Sound'}
          title={isMuted ? 'Turn Sound On' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#E50914]" />}
        </button>

        {/* Maturity Rating Bar extending to screen edge */}
        <div className="bg-[#333333]/70 border-l-3 border-[#e5e5e5] px-3.5 py-1 text-white text-xs sm:text-sm font-bold flex items-center">
          <span>{currentItem.type === 'anime' ? '14+' : '16+'}</span>
        </div>
      </div>
    </section>
  );
}
