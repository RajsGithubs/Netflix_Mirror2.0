'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Compass,
  Film,
  Tv,
  Sparkles,
  Radio,
  SlidersHorizontal,
  Star,
  Search,
} from 'lucide-react';
import MediaCard from '@/components/MediaCard';
import DetailsModal from '@/components/DetailsModal';
import {
  getTrendingMovies,
  getTrendingSeries,
  getTopAnime,
  getLiveTvChannels,
  getTitlesByGenre,
  GENRES,
  MediaItem,
} from '@/lib/metadata';

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryParam = searchParams.get('category') || 'all';
  const genreParam = searchParams.get('genre') || 'all';

  const [category, setCategory] = useState<string>(categoryParam);
  const [selectedGenre, setSelectedGenre] = useState<string>(genreParam);
  const [sortBy, setSortBy] = useState<'rating' | 'year' | 'title'>('rating');

  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchBrowseData() {
      setIsLoading(true);
      try {
        let pool: MediaItem[] = [];

        if (selectedGenre !== 'all') {
          pool = await getTitlesByGenre(selectedGenre);
          if (category !== 'all') {
            pool = pool.filter((item) => item.type === category);
          }
        } else {
          if (category === 'movies') {
            pool = await getTrendingMovies();
          } else if (category === 'series') {
            pool = await getTrendingSeries();
          } else if (category === 'anime') {
            pool = await getTopAnime();
          } else if (category === 'livetv') {
            pool = await getLiveTvChannels();
          } else {
            const [m, s, a, l] = await Promise.all([
              getTrendingMovies(),
              getTrendingSeries(),
              getTopAnime(),
              getLiveTvChannels(),
            ]);
            pool = [...m, ...s, ...a, ...l];
          }
        }

        // Apply client sorting
        pool.sort((a, b) => {
          if (sortBy === 'rating') {
            const rA = parseFloat(String(a.rating || '0')) || 0;
            const rB = parseFloat(String(b.rating || '0')) || 0;
            return rB - rA;
          }
          if (sortBy === 'year') {
            const yA = parseInt(String(a.year || '0')) || 0;
            const yB = parseInt(String(b.year || '0')) || 0;
            return yB - yA;
          }
          return a.title.localeCompare(b.title);
        });

        if (isMounted) {
          setItems(pool);
        }
      } catch (err) {
        console.error('Failed to load browse catalog:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchBrowseData();
    return () => {
      isMounted = false;
    };
  }, [category, selectedGenre, sortBy]);

  const handleOpenDetails = (item: MediaItem) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  const categories = [
    { id: 'all', label: 'All Catalog', icon: Compass },
    { id: 'movie', label: 'Movies', icon: Film },
    { id: 'series', label: 'TV Shows', icon: Tv },
    { id: 'anime', label: 'Anime', icon: Sparkles },
    { id: 'livetv', label: 'Live TV', icon: Radio },
  ];

  return (
    <div className="px-4 sm:px-12 md:px-16 pt-24 space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-500">
              <Compass className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Browse Catalog
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Discover movies, television series, anime sagas, and 24/7 public broadcasts.
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
          <span className="text-xs text-zinc-400 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-cinema-900 border border-white/10 text-white text-xs sm:text-sm font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="rating">Highest Rated ★</option>
            <option value="year">Release Year (Newest)</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((c) => {
          const Icon = c.icon;
          const isActive = category === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                isActive
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                  : 'bg-cinema-900 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Genre Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-t border-b border-white/10 py-3">
        <button
          onClick={() => setSelectedGenre('all')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition whitespace-nowrap ${
            selectedGenre === 'all'
              ? 'bg-white text-black'
              : 'bg-cinema-900 text-zinc-400 hover:text-white'
          }`}
        >
          All Genres
        </button>
        {GENRES.map((g) => (
          <button
            key={g.slug}
            onClick={() => setSelectedGenre(g.slug)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition whitespace-nowrap ${
              selectedGenre === g.slug
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                : 'bg-cinema-900 text-zinc-400 hover:text-white'
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-2xl bg-cinema-900 animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {items.map((item, index) => (
            <MediaCard
              key={`${item.id}-${index}`}
              item={item}
              onOpenDetails={handleOpenDetails}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center rounded-2xl bg-cinema-900/40 border border-white/10 p-8 space-y-4">
          <p className="text-zinc-400 text-sm">No titles found for the selected filter.</p>
          <button
            onClick={() => {
              setCategory('all');
              setSelectedGenre('all');
            }}
            className="px-4 py-2 rounded-xl bg-brand-500 text-white font-semibold text-xs"
          >
            Reset Filters
          </button>
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

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-400 text-sm">Loading Browse Catalog...</p>
        </div>
      }
    >
      <BrowseContent />
    </Suspense>
  );
}
