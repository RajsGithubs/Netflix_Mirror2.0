'use client';

import React, { useState, useEffect } from 'react';
import { Tv, Star, Filter } from 'lucide-react';
import MediaCard from '@/components/MediaCard';
import Top10Row from '@/components/Top10Row';
import DetailsModal from '@/components/DetailsModal';
import {
  getTrendingSeries,
  getTop10Series,
  getTitlesByGenre,
  GENRES,
  MediaItem,
} from '@/lib/metadata';

export default function SeriesPage() {
  const [series, setSeries] = useState<MediaItem[]>([]);
  const [top10, setTop10] = useState<MediaItem[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadSeries() {
      setIsLoading(true);
      try {
        const [ser, t10] = await Promise.all([
          selectedGenre === 'all' ? getTrendingSeries() : getTitlesByGenre(selectedGenre),
          getTop10Series(),
        ]);
        if (isMounted) {
          const filtered = selectedGenre === 'all' ? ser : ser.filter((s) => s.type === 'series');
          setSeries(filtered.length > 0 ? filtered : ser);
          setTop10(t10);
        }
      } catch (err) {
        console.error('Error loading series:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSeries();
    return () => {
      isMounted = false;
    };
  }, [selectedGenre]);

  const handleOpenDetails = (item: MediaItem) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  return (
    <div className="px-4 sm:px-12 md:px-16 pt-24 space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Tv className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Television Series & Shows
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Binge-watch award-winning drama, comedy series, and serialized sagas season by season.
          </p>
        </div>
      </div>

      {/* Top 10 Series Today Carousel */}
      {top10.length > 0 && selectedGenre === 'all' && (
        <Top10Row
          title="Top 10 TV Shows Today"
          items={top10}
          onOpenDetails={handleOpenDetails}
          type="series"
        />
      )}

      {/* Genre Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/10">
        <button
          onClick={() => setSelectedGenre('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${
            selectedGenre === 'all'
              ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
              : 'bg-cinema-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          All TV Shows
        </button>
        {GENRES.map((g) => (
          <button
            key={g.slug}
            onClick={() => setSelectedGenre(g.slug)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${
              selectedGenre === g.slug
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                : 'bg-cinema-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {/* Series Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-2xl bg-cinema-900 animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {series.map((item, index) => (
            <MediaCard
              key={`${item.id}-${index}`}
              item={item}
              onOpenDetails={handleOpenDetails}
            />
          ))}
        </div>
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
