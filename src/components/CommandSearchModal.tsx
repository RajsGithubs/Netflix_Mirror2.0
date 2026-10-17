'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Film,
  Tv,
  Sparkles,
  Radio,
  Star,
  Clock,
  ArrowRight,
  Command,
} from 'lucide-react';
import { universalSearch, MediaItem } from '@/lib/metadata';

interface CommandSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandSearchModal({ isOpen, onClose }: CommandSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global Cmd+K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open
          const event = new CustomEvent('open-command-search');
          window.dispatchEvent(event);
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced Search (250ms)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await universalSearch(query);
        setResults(data);
        setSelectedIndex(0);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation through search results
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        const item = results[selectedIndex];
        onClose();
        if (item.type === 'livetv') {
          router.push(`/livetv?channel=${item.id}`);
        } else {
          router.push(`/watch/${item.type}/${item.id}`);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-zinc-900/95 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-zinc-100 backdrop-blur-xl animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search Movies, TV Series, Anime, or Live TV channels..."
            className="flex-1 bg-transparent text-sm sm:text-base text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400">
              <Command className="w-3 h-3" />
              <span>ESC</span>
            </div>
          )}
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-zinc-800/40">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-zinc-400 gap-3">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Searching Cinemeta, Jikan Anime & IPTV...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const linkHref =
                  item.type === 'livetv' ? `/livetv?channel=${item.id}` : `/watch/${item.type}/${item.id}`;

                return (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={linkHref}
                    onClick={onClose}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition group ${
                      isSelected
                        ? 'bg-indigo-600/20 text-white border border-indigo-500/40'
                        : 'hover:bg-zinc-800/60 text-zinc-300 border border-transparent'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                      {item.posterUrl ? (
                        <img
                          src={item.posterUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                          <Film className="w-5 h-5 text-zinc-600" />
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm truncate text-zinc-100 group-hover:text-indigo-300 transition">
                          {item.title}
                        </h4>
                        <span
                          className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0 ${
                            item.type === 'movie'
                              ? 'bg-blue-500/20 text-blue-400'
                              : item.type === 'series'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : item.type === 'anime'
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {item.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                        {item.year && <span>{item.year}</span>}
                        {item.rating && (
                          <span className="flex items-center gap-1 text-amber-400 font-medium">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {item.rating}
                          </span>
                        )}
                        {item.genres && item.genres.length > 0 && (
                          <span className="truncate max-w-[200px] text-zinc-500">
                            • {item.genres.slice(0, 2).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>

                    <ArrowRight
                      className={`w-4 h-4 text-zinc-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition shrink-0 ${
                        isSelected ? 'text-indigo-400 translate-x-0.5' : ''
                      }`}
                    />
                  </Link>
                );
              })}
            </div>
          ) : query ? (
            <div className="py-12 text-center text-zinc-400">
              <p className="text-sm font-medium">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-zinc-500 mt-1">Try another movie title, anime, series, or live TV channel.</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Popular Quick Searches
              </div>
              <div className="flex flex-wrap gap-2">
                {['Dune: Part Two', 'Oppenheimer', 'Breaking Bad', 'Frieren', 'Sky News', 'Attack on Titan'].map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 hover:text-white transition"
                    >
                      {s}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="hidden sm:flex items-center justify-between px-4 py-2 bg-zinc-950/60 border-t border-zinc-800 text-[11px] text-zinc-500">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-[#E50914] font-medium">Netflix 2.0 Instant Search</span>
        </div>
      </div>
    </div>
  );
}
