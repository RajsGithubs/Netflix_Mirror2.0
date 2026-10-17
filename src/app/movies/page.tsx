'use client';

import React, { useState, useEffect } from 'react';
import { Film, Star, Filter, SlidersHorizontal } from 'lucide-react';
import MediaCard from '@/components/MediaCard';
import Top10Row from '@/components/Top10Row';
import DetailsModal from '@/components/DetailsModal';
import {
  getTrendingMovies,
  getTop10Movies,
  getTitlesByGenre,
  GENRES,
  MediaItem,
} from '@/lib/metadata';

export default function MoviesPage() {
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [top10, setTop10] = useState<MediaItem[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadMovies() {
      setIsLoading(true);
      try {
        const [mov, t10] = await Promise.all([
          selectedGenre === 'all' ? getTrendingMovies() : getTitlesByGenre(selectedGenre),
          getTop10Movies(),
        ]);
        if (isMounted) {
          const filtered = selectedGenre === 'all' ? mov : mov.filter((m) => m.type === 'movie');
          setMovies(filtered.length > 0 ? filtered : mov);
          setTop10(t10);
        }
      } catch (err) {
        console.error('Error loading movies:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadMovies();
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Film className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Feature Films & Movies
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Stream blockbuster movies, indie gems, and critically acclaimed cinematic releases.
          </p>
        </div>
      </div>

      {/* Top 10 Movies Carousel */}
      {top10.length > 0 && selectedGenre === 'all' && (
        <Top10Row
          title="Top 10 Movies Today"
          items={top10}
          onOpenDetails={handleOpenDetails}
          type="movie"
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
          All Movies
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

      {/* Movies Grid */}
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
          {movies.map((item, index) => (
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
