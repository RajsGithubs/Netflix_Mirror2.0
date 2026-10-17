'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Play, Star, Plus, Check, Film, Radio, Tv, Sparkles } from 'lucide-react';
import { MediaItem } from '@/lib/metadata';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import CardHoverPreview from '@/components/CardHoverPreview';

export interface MediaCardProps {
  item: MediaItem;
  priority?: boolean;
  onOpenDetails?: (item: MediaItem) => void;
  disableHoverPreview?: boolean;
}

export default function MediaCard({
  item,
  priority = false,
  onOpenDetails,
  disableHoverPreview = false,
}: MediaCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [cardRect, setCardRect] = useState<DOMRect | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { isWatchlisted, addToWatchlist, removeFromWatchlist } = useWatchHistory();
  const saved = isWatchlisted(item.id);

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      removeFromWatchlist(item.id);
    } else {
      addToWatchlist({
        id: item.id,
        title: item.title,
        type: item.type,
        posterUrl: item.posterUrl,
        year: item.year,
        rating: item.rating,
      });
    }
  };

  const handleMouseEnter = () => {
    if (disableHoverPreview) return;
    hoverTimeoutRef.current = setTimeout(() => {
      if (cardRef.current) {
        setCardRect(cardRef.current.getBoundingClientRect());
        setIsHovered(true);
      }
    }, 320);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (onOpenDetails) {
      e.preventDefault();
      onOpenDetails(item);
    }
  };

  const linkHref =
    item.type === 'livetv' ? `/livetv?channel=${item.id}` : `/watch/${item.type}/${item.id}`;

  return (
    <>
      <div
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative w-full"
      >
        <Link
          href={linkHref}
          onClick={handleCardClick}
          className="group relative flex flex-col rounded overflow-hidden bg-[#242424] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#E50914] shadow-md hover:shadow-2xl"
        >
          {/* Poster Image Container */}
          <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#181818]">
            {/* Skeleton Shimmer */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-[#242424] animate-pulse" />
            )}

            {/* Poster Image */}
            {!imageError && item.posterUrl ? (
              <img
                src={item.posterUrl}
                alt={item.title}
                loading={priority ? 'eager' : 'lazy'}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-zinc-600 bg-[#181818]">
                {item.type === 'livetv' ? (
                  <Radio className="w-8 h-8 mb-2 text-zinc-500" />
                ) : item.type === 'series' ? (
                  <Tv className="w-8 h-8 mb-2 text-zinc-500" />
                ) : (
                  <Film className="w-8 h-8 mb-2 text-zinc-500" />
                )}
                <span className="text-xs text-center text-zinc-400 font-medium line-clamp-2">
                  {item.title}
                </span>
              </div>
            )}

            {/* Netflix Red Top-Left Original Pill */}
            <div className="absolute top-2 left-2 z-10 pointer-events-none">
              <span className="text-[#E50914] font-black text-sm drop-shadow-md">
                N
              </span>
            </div>

            {/* Quick My List (+) Button on Top-Right */}
            <button
              onClick={handleWatchlistToggle}
              title={saved ? 'Remove from My List' : 'Add to My List'}
              className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/70 hover:bg-black text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition shadow-md"
            >
              {saved ? (
                <Check className="w-3.5 h-3.5 text-[#E50914] stroke-[3]" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Title bar on bottom */}
          <div className="p-2 bg-[#181818] flex flex-col">
            <h3 className="font-bold text-xs text-[#e5e5e5] group-hover:text-white transition-colors truncate">
              {item.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-zinc-400">
              <span className="text-[#46d369] font-bold">98% Match</span>
              <span>•</span>
              <span>{item.year || (item.type === 'livetv' ? 'LIVE' : 'HD')}</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Advanced Hover Preview */}
      {!disableHoverPreview && (
        <CardHoverPreview
          item={item}
          triggerRect={cardRect}
          isOpen={isHovered}
          onClose={() => setIsHovered(false)}
          onOpenDetails={(selected) => {
            setIsHovered(false);
            if (onOpenDetails) onOpenDetails(selected);
          }}
        />
      )}
    </>
  );
}
