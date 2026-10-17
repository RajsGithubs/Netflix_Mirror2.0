'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  Clock,
  Trash2,
  Play,
  Film,
  Tv,
  Sparkles,
  Radio,
  ExternalLink,
  X,
  Plus,
} from 'lucide-react';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import MediaCard from '@/components/MediaCard';
import DetailsModal from '@/components/DetailsModal';
import { MediaItem } from '@/lib/metadata';

export default function WatchlistPage() {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'history'>('watchlist');
  const {
    watchlist,
    history,
    removeFromWatchlist,
    removeProgress,
    clearHistory,
    isLoaded,
  } = useWatchHistory();

  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleOpenDetails = (item: MediaItem) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  return (
    <div className="px-4 sm:px-12 md:px-16 pt-24 space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            My List
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Titles you have saved to watch later on Flix Movie.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1 rounded bg-[#242424] border border-[#333333] w-fit">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs sm:text-sm font-bold transition ${
              activeTab === 'watchlist'
                ? 'bg-[#E50914] text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>My List ({watchlist.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs sm:text-sm font-bold transition ${
              activeTab === 'history'
                ? 'bg-[#E50914] text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Watch History ({history.length})</span>
          </button>
        </div>
      </div>

      {/* 1. Watchlist Tab */}
      {activeTab === 'watchlist' && (
        <section className="space-y-4">
          {watchlist.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {watchlist.map((item) => (
                <div key={item.id} className="relative group">
                  <MediaCard
                    item={{
                      id: item.id,
                      title: item.title,
                      type: item.type,
                      posterUrl: item.posterUrl,
                      year: item.year,
                      rating: item.rating,
                    }}
                    onOpenDetails={handleOpenDetails}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center rounded bg-[#181818] border border-[#282828] p-8 space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#E50914]/20 text-[#E50914] flex items-center justify-center mx-auto">
                <Bookmark className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">You haven&apos;t added any titles to your list yet.</h2>
              <p className="text-sm text-zinc-400 max-w-md mx-auto">
                Explore movies and TV shows and tap the &quot;+&quot; button on any card or details modal to save them to My List.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded bg-[#E50914] hover:bg-[#b81d24] text-white font-bold text-sm transition shadow-lg"
              >
                Browse Now
              </Link>
            </div>
          )}
        </section>
      )}

      {/* 2. Viewing History Tab */}
      {activeTab === 'history' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">
              {history.length} titles in your viewing history
            </span>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-[#E50914] transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All History</span>
              </button>
            )}
          </div>

          {history.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                    className="group rounded overflow-hidden bg-[#181818] border border-[#282828] hover:border-zinc-500 transition shadow-lg"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-[#242424]">
                      <img
                        src={item.posterUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <button
                        onClick={() => removeProgress(item.id, item.season, item.episode)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white"
                        title="Remove from history"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <Link
                        href={resumeHref}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/10 transition"
                      >
                        <div className="w-10 h-10 rounded-full border border-white bg-black/60 flex items-center justify-center">
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                        </div>
                      </Link>

                      <div className="absolute inset-x-0 bottom-0 h-1 bg-zinc-700">
                        <div
                          className="h-full bg-[#E50914]"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3">
                      <h3 className="font-bold text-sm text-white truncate">{item.title}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {hasEp ? `S${item.season}:E${item.episode}` : `${item.percentage}% watched`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-24 text-center rounded bg-[#181818] border border-[#282828] p-8 space-y-4">
              <Clock className="w-12 h-12 text-zinc-600 mx-auto" />
              <h2 className="text-xl font-bold text-white">No viewing history found.</h2>
            </div>
          )}
        </section>
      )}

      {/* Details Modal */}
      <DetailsModal
        item={selectedItem}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onSelectItem={(item) => setSelectedItem(item)}
      />
    </div>
  );
}
