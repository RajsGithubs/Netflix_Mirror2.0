'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from '@/lib/metadata';
import MediaCard from '@/components/MediaCard';

export interface MovieRowProps {
  title: string;
  items: MediaItem[];
  viewAllHref?: string;
  onOpenDetails?: (item: MediaItem) => void;
  aspectRatio?: 'poster' | 'backdrop';
}

export default function MovieRow({
  title,
  items,
  viewAllHref,
  onOpenDetails,
  aspectRatio = 'poster',
}: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  if (!items || items.length === 0) return null;

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollDistance = rowRef.current.clientWidth * 0.85;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollDistance : scrollDistance,
        behavior: 'smooth',
      });
    }
  };

  const handleScrollUpdate = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 20);
    }
  };

  return (
    <section className="group-row relative py-3 space-y-2 select-none">
      {/* Row Header */}
      <div className="flex items-end justify-between px-4 sm:px-12 md:px-16">
        <div className="flex items-center gap-2 group/title cursor-pointer">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#e5e5e5] group-hover/title:text-white tracking-tight transition-colors">
            {title}
          </h2>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-xs font-bold text-[#54b9c5] group-hover/title:translate-x-1 opacity-0 group-hover/row:opacity-100 transition-all flex items-center gap-0.5"
            >
              Explore All &gt;
            </Link>
          )}
        </div>
      </div>

      {/* Relative Carousel Track Container */}
      <div className="relative">
        {/* Full-Height Left Slider Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => handleScroll('left')}
            className="slider-handle left-0 rounded-r text-white z-30"
            aria-label="Previous"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        {/* Full-Height Right Slider Arrow */}
        {showRightArrow && (
          <button
            onClick={() => handleScroll('right')}
            className="slider-handle right-0 rounded-l text-white z-30"
            aria-label="Next"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}

        {/* Scrollable Track */}
        <div
          ref={rowRef}
          onScroll={handleScrollUpdate}
          className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-4 pt-2 scrollbar-none snap-x px-4 sm:px-12 md:px-16"
        >
          {items.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="flex-shrink-0 w-36 sm:w-44 md:w-52 snap-start"
            >
              <MediaCard
                item={item}
                onOpenDetails={onOpenDetails}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
