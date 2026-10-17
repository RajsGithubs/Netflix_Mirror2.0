'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Play, Trash2, X, ChevronLeft } from 'lucide-react';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { playBrandSound } from '@/lib/brandSound';

export default function ContinueWatchingPage() {
  const { history, removeProgress, clearHistory, isLoaded } = useWatchHistory();

  const handleResume = () => {
    playBrandSound();
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition mb-2"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-500">
              <Clock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Continue Watching
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Pick up right where you left off across all your devices and profiles.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cinema-900 border border-white/10 text-zinc-400 hover:text-rose-400 hover:border-rose-500/40 text-xs sm:text-sm font-semibold transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Grid */}
      {!isLoaded ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-video rounded-2xl bg-cinema-900 animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : history.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {history.map((item) => {
            const hasEp = item.season !== undefined && item.episode !== undefined;
            const resumeHref =
              item.type === 'livetv'
                ? `/livetv?channel=${item.id}`
                : hasEp
                ? `/watch/${item.type}/${item.id}?season=${item.season}&episode=${item.episode}`
                : `/watch/${item.type}/${item.id}`;

            const remainingSec = Math.max(0, item.duration - item.currentTime);
            const remainingMins = Math.round(remainingSec / 60);

            return (
              <div
                key={`${item.id}-${item.season || 1}-${item.episode || 1}`}
                className="group relative rounded-2xl overflow-hidden bg-cinema-900 border border-white/10 hover:border-brand-500/50 transition-all duration-300 shadow-xl"
              >
                {/* Media Poster / Backdrop */}
                <div className="relative aspect-video w-full overflow-hidden bg-cinema-950">
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                  />

                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeProgress(item.id, item.season, item.episode);
                    }}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/70 hover:bg-black text-zinc-400 hover:text-white backdrop-blur-md transition z-20"
                    title="Remove from viewing history"
                    aria-label="Remove from viewing history"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Play Overlay */}
                  <Link
                    href={resumeHref}
                    onClick={handleResume}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition z-10"
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-500/90 text-white flex items-center justify-center shadow-xl shadow-brand-500/40 group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </Link>

                  {/* Progress Bar */}
                  <div className="absolute inset-x-0 bottom-0 h-1.5 bg-zinc-800">
                    <div
                      className="h-full bg-brand-500 transition-all duration-300 shadow-[0_0_8px_rgba(229,9,66,0.8)]"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Details Footer */}
                <div className="p-4 space-y-1">
                  <h3 className="font-bold text-sm text-white group-hover:text-brand-400 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>
                      {hasEp
                        ? `Season ${item.season}, Ep ${item.episode}`
                        : item.type === 'livetv'
                        ? 'Live Broadcast'
                        : `${item.percentage}% watched`}
                    </span>
                    {remainingMins > 0 && (
                      <span className="text-[11px] text-zinc-400">{remainingMins}m left</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center rounded-2xl bg-cinema-900/40 border border-white/10 p-8 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
            <Clock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">No In-Progress Titles</h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            When you watch movies or series on Flix Movie, your playback progress will be saved here so you can resume anytime.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/30"
          >
            Start Watching
          </Link>
        </div>
      )}
    </div>
  );
}
