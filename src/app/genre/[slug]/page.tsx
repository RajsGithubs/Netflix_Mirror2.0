'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Sparkles, Filter, SlidersHorizontal } from 'lucide-react';
import MediaCard from '@/components/MediaCard';
import DetailsModal from '@/components/DetailsModal';
import { getTitlesByGenre, GENRES, MediaItem } from '@/lib/metadata';

export default function GenrePage() {
  const params = useParams();
  const router = useRouter();

  const slug = (params?.slug as string) || 'action';
  const genreMeta = GENRES.find((g) => g.slug.toLowerCase() === slug.toLowerCase()) || {
    id: slug,
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    slug,
    description: `Browse curated titles in the ${slug} genre.`,
  };

  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'rating' | 'year' | 'title'>('rating');

  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadGenreItems() {
      setIsLoading(true);
      try {
        const data = await getTitlesByGenre(slug);
        if (isMounted) {
          data.sort((a, b) => {
            if (sortBy === 'rating') {
              return (parseFloat(String(b.rating || '0')) || 0) - (parseFloat(String(a.rating || '0')) || 0);
            }
            if (sortBy === 'year') {
              return (parseInt(String(b.year || '0')) || 0) - (parseInt(String(a.year || '0')) || 0);
            }
            return a.title.localeCompare(b.title);
          });
          setItems(data);
        }
      } catch (err) {
        console.error('Failed to load genre titles:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadGenreItems();
    return () => {
      isMounted = false;
    };
  }, [slug, sortBy]);

  const handleOpenDetails = (item: MediaItem) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  return (
    <div className="px-4 sm:px-12 md:px-16 pt-24 space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/browse"
            className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition mb-2"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back to Browse</span>
          </Link>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {genreMeta.name}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
            {genreMeta.description}
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
          <span className="text-xs text-zinc-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-cinema-900 border border-white/10 text-white text-xs sm:text-sm font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="rating">Top Rated ★</option>
            <option value="year">Newest Year</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Other Genre Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/10">
        {GENRES.map((g) => (
          <Link
            key={g.slug}
            href={`/genre/${g.slug}`}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition whitespace-nowrap ${
              g.slug.toLowerCase() === slug.toLowerCase()
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                : 'bg-cinema-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {g.name}
          </Link>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
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
        <div className="py-20 text-center rounded-2xl bg-cinema-900/40 border border-white/10 p-8">
          <p className="text-zinc-400 text-sm">No titles found for this genre.</p>
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
