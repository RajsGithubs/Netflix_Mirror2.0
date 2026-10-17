'use client';

import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from '@/lib/metadata';

interface Top10RowProps {
  title: string;
  items: MediaItem[];
  onOpenDetails?: (item: MediaItem) => void;
  type?: 'movie' | 'series';
}

export default function Top10Row({
  title,
  items,
  onOpenDetails,
  type = 'movie',
}: Top10RowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  if (!items || items.length === 0) return null;
  const top10List = items.slice(0, 10);

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollDistance = rowRef.current.clientWidth * 0.8;
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
    <section className="group-row relative py-4 space-y-2 select-none">
      {/* Title */}
      <div className="px-4 sm:px-12 md:px-16">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">
          {title}
        </h2>
      </div>

      {/* Relative Carousel Container */}
      <div className="relative">
        {/* Full-Height Left Slider Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => handleScroll('left')}
            className="slider-handle left-0 rounded-r-md text-white z-30"
            aria-label="Previous"
          >
            <ChevronLeft className="w-8 h-8 group-hover:scale-125 transition-transform" />
          </button>
        )}

        {/* Full-Height Right Slider Arrow */}
        {showRightArrow && (
          <button
            onClick={() => handleScroll('right')}
            className="slider-handle right-0 rounded-l-md text-white z-30"
            aria-label="Next"
          >
            <ChevronRight className="w-8 h-8 group-hover:scale-125 transition-transform" />
          </button>
        )}

        {/* Scrollable Track */}
        <div
          ref={rowRef}
          onScroll={handleScrollUpdate}
          className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-4 pt-2 scrollbar-none snap-x px-4 sm:px-12 md:px-16"
        >
          {top10List.map((item, index) => {
            const rank = index + 1;

            return (
              <div
                key={`${item.id}-${rank}`}
                onClick={() => onOpenDetails?.(item)}
                className="flex-shrink-0 flex items-end snap-start group/card cursor-pointer"
              >
                {/* Netflix Iconic Huge Outline Number */}
                <div className="relative -mr-6 sm:-mr-8 z-0 pointer-events-none">
                  <span className="netflix-top10-number">
                    {rank}
                  </span>
                </div>

                {/* Poster Card */}
                <div className="relative z-10 w-28 sm:w-36 md:w-44 aspect-[2/3] rounded overflow-hidden bg-[#242424] shadow-lg transition-transform duration-300 transform group-hover/card:scale-105 group-hover/card:shadow-2xl">
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
