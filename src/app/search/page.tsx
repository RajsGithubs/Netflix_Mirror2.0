'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, X, Film, Tv, Radio, Sparkles, TrendingUp } from 'lucide-react';
import MediaCard from '@/components/MediaCard';
import DetailsModal from '@/components/DetailsModal';
import { universalSearch, getTrendingMovies, MediaItem } from '@/lib/metadata';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load trending suggestions
  useEffect(() => {
    async function loadTrending() {
      const data = await getTrendingMovies();
      setTrending(data.slice(0, 12));
    }
    loadTrending();
  }, []);

  // Sync with URL query parameter
  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await universalSearch(searchTerm);
      setResults(res);
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      router.replace(val.trim() ? `/search?q=${encodeURIComponent(val.trim())}` : '/search');
      performSearch(val);
    }, 280);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    router.replace('/search');
  };

  const handleOpenDetails = (item: MediaItem) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  return (
    <div className="px-4 sm:px-12 md:px-16 pt-24 space-y-8 animate-fade-in pb-16">
      {/* Search Input Bar */}
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-brand-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search by movie title, actor, genre, series, anime, or channel..."
            autoFocus
            className="w-full bg-cinema-900 border border-white/10 rounded-2xl pl-12 pr-12 py-3.5 text-white placeholder-zinc-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-xl"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-4 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick popular search tags */}
        {!query && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-brand-500" />
              Popular Searches:
            </span>
            {['Inception', 'Dune', 'Breaking Bad', 'Interstellar', 'Attack on Titan', 'Sky News'].map((term) => (
              <button
                key={term}
                onClick={() => {
                  setQuery(term);
                  router.replace(`/search?q=${encodeURIComponent(term)}`);
                  performSearch(term);
                }}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-cinema-900 border border-white/10 text-zinc-300 hover:text-white hover:border-brand-500/50 transition"
              >
                {term}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Status & Results */}
      {isSearching ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-400 text-sm">Searching Netflix 2.0 catalog...</p>
        </div>
      ) : query && results.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">
            Results for &ldquo;<span className="text-brand-400">{query}</span>&rdquo; ({results.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {results.map((item, index) => (
              <MediaCard
                key={`${item.id}-${index}`}
                item={item}
                onOpenDetails={handleOpenDetails}
              />
            ))}
          </div>
        </div>
      ) : query && !isSearching ? (
        <div className="py-20 text-center rounded-2xl bg-cinema-900/40 border border-white/10 p-8 space-y-3">
          <p className="text-white font-bold text-base">No titles matched &ldquo;{query}&rdquo;</p>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-md mx-auto">
            Try checking for spelling errors or searching for different keywords, actors, or genres.
          </p>
        </div>
      ) : (
        /* Empty Query State: Show Trending */
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-500" />
            Trending on Netflix 2.0
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {trending.map((item, index) => (
              <MediaCard
                key={`${item.id}-${index}`}
                item={item}
                onOpenDetails={handleOpenDetails}
              />
            ))}
          </div>
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

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-400 text-sm">Loading Search...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
