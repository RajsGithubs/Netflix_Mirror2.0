'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { Play, X, ChevronLeft, ChevronRight, Clock, Trash2 } from 'lucide-react';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { useProfiles } from '@/hooks/useProfiles';
import { playBrandSound } from '@/lib/brandSound';

export default function ContinueWatchingRow() {
  const { history, removeProgress, clearHistory, isLoaded } = useWatchHistory();
  const { activeProfile } = useProfiles();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!isLoaded || history.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="group-row relative py-4 space-y-2 select-none">
      {/* Header with Title and Scroll buttons */}
      <div className="flex items-center justify-between px-4 sm:px-12 md:px-16">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">
          Continue Watching for {activeProfile.name}
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={clearHistory}
            className="text-xs text-zinc-400 hover:text-[#E50914] flex items-center gap-1 transition px-2 py-1 rounded hover:bg-zinc-800"
            title="Clear all watch history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear History</span>
          </button>
        </div>
      </div>

      {/* Relative Carousel Track Container */}
      <div className="relative">
        {/* Full-Height Left Slider Arrow */}
        <button
          onClick={() => scroll('left')}
          className="slider-handle left-0 rounded-r text-white z-30"
          aria-label="Previous"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        {/* Full-Height Right Slider Arrow */}
        <button
          onClick={() => scroll('right')}
          className="slider-handle right-0 rounded-l text-white z-30"
          aria-label="Next"
        >
          <ChevronRight className="w-8 h-8" />
        </button>

        {/* Scrollable Horizontal Row */}
        <div
          ref={scrollRef}
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x px-4 sm:px-12 md:px-16"
        >
          {history.map((item) => {
            const hasEp = item.season !== undefined && item.episode !== undefined;
            const resumeHref =
              item.type === 'livetv'
                ? `/livetv?channel=${item.id}`
                : hasEp
                ? `/watch/${item.type}/${item.id}?season=${item.season}&episode=${item.episode}`
                : `/watch/${item.type}/${item.id}`;

            return (
              <div
                key={`${item.id}-${item.season || 1}-${item.episode || 1}`}
                className="group/card relative flex-shrink-0 w-60 sm:w-72 rounded overflow-hidden bg-[#181818] border border-white/10 hover:border-white/30 transition-all duration-300 snap-start shadow-xl"
              >
                {/* Media Backdrop / Poster */}
                <div className="relative aspect-video w-full overflow-hidden bg-[#242424]">
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500 opacity-80 group-hover/card:opacity-100"
                  />

                  {/* Dismiss from History Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeProgress(item.id, item.season, item.episode);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-zinc-300 hover:text-white backdrop-blur-md transition z-20"
                    title="Remove from row"
                    aria-label="Remove from row"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Play Center Overlay */}
                  <Link
                    href={resumeHref}
                    onClick={() => playBrandSound()}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover/card:bg-black/10 transition z-10"
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-white bg-black/50 text-white flex items-center justify-center group-hover/card:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </Link>

                  {/* Netflix Red Bottom Progress Bar */}
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-zinc-700">
                    <div
                      className="h-full bg-[#E50914] transition-all duration-300"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Footer Info */}
                <div className="p-3 bg-[#181818] flex items-center justify-between">
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-xs sm:text-sm text-white group-hover/card:text-[#E50914] transition-colors truncate">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {hasEp ? `S${item.season}:E${item.episode}` : `${item.percentage}% completed`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
