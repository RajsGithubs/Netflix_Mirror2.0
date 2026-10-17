'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play,
  Plus,
  Check,
  ThumbsUp,
  ChevronDown,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { MediaItem } from '@/lib/metadata';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { playBrandSound } from '@/lib/brandSound';

interface CardHoverPreviewProps {
  item: MediaItem;
  triggerRect: DOMRect | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenDetails: (item: MediaItem) => void;
}

export default function CardHoverPreview({
  item,
  triggerRect,
  isOpen,
  onClose,
  onOpenDetails,
}: CardHoverPreviewProps) {
  const router = useRouter();
  const { isWatchlisted, addToWatchlist, removeFromWatchlist } = useWatchHistory();
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!isOpen || !triggerRect) {
      setPosition(null);
      return;
    }

    const previewWidth = 330;
    const windowWidth = window.innerWidth;

    let left = triggerRect.left - (previewWidth - triggerRect.width) / 2;
    if (left < 16) left = 16;
    if (left + previewWidth > windowWidth - 16) {
      left = windowWidth - previewWidth - 16;
    }

    const top = triggerRect.top + window.scrollY - 30;
    setPosition({ top, left, width: previewWidth });
  }, [isOpen, triggerRect]);

  if (!isOpen || !position) return null;

  const saved = isWatchlisted(item.id);

  const handleWatchlistToggle = (e: React.MouseEvent) => {
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

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    playBrandSound();
    onClose();
    if (item.type === 'livetv') {
      router.push(`/livetv?channel=${item.id}`);
    } else {
      router.push(`/watch/${item.type}/${item.id}`);
    }
  };

  return (
    <div
      onMouseLeave={onClose}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        zIndex: 60,
      }}
      className="bg-[#181818] rounded-md overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.9)] animate-scale-up select-none border border-white/10"
    >
      {/* Backdrop Image */}
      <div
        onClick={() => {
          onClose();
          onOpenDetails(item);
        }}
        className="relative aspect-video w-full overflow-hidden bg-[#242424] cursor-pointer"
      >
        <img
          src={item.backdropUrl || item.posterUrl}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />
      </div>

      {/* Expanded Actions & Metadata */}
      <div className="p-4 space-y-3">
        {/* Netflix Quick Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* White Round Play Button */}
            <button
              onClick={handlePlay}
              className="w-9 h-9 rounded-full bg-white hover:bg-white/80 text-black flex items-center justify-center transition shadow-md"
              aria-label="Play"
            >
              <Play className="w-4 h-4 fill-black ml-0.5" />
            </button>

            {/* My List (+) / (✓) Button */}
            <button
              onClick={handleWatchlistToggle}
              className="w-9 h-9 rounded-full border-2 border-white/40 hover:border-white bg-[#2a2a2a]/60 text-white flex items-center justify-center transition"
              title={saved ? 'Remove from My List' : 'Add to My List'}
              aria-label="My List"
            >
              {saved ? <Check className="w-4 h-4 text-[#E50914] stroke-[3]" /> : <Plus className="w-4 h-4" />}
            </button>

            {/* Thumbs Up (Like) Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className={`w-9 h-9 rounded-full border-2 border-white/40 hover:border-white bg-[#2a2a2a]/60 flex items-center justify-center transition ${
                isLiked ? 'text-[#E50914] border-[#E50914]' : 'text-white'
              }`}
              title="I like this"
              aria-label="Like"
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
          </div>

          {/* Chevron Down Button for Details */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              onOpenDetails(item);
            }}
            className="w-9 h-9 rounded-full border-2 border-white/40 hover:border-white bg-[#2a2a2a]/60 text-white flex items-center justify-center transition"
            title="More Info"
            aria-label="More Info"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Metadata Line */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-[#46d369]">98% Match</span>
            <span className="border border-white/40 px-1 py-0.2 text-[10px] text-zinc-300">
              {item.type === 'anime' ? '14+' : '16+'}
            </span>
            {item.year && <span className="text-zinc-400 font-normal">{item.year}</span>}
            <span className="border border-white/40 px-1 py-0.2 text-[9px] text-zinc-300">HD</span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-white text-sm line-clamp-1">{item.title}</h3>

          {/* Genre Dots */}
          {item.genres && item.genres.length > 0 && (
            <div className="text-[11px] text-zinc-400 line-clamp-1">
              {item.genres.slice(0, 3).join(' • ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
