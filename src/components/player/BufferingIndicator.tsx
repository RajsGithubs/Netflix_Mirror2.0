'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface BufferingIndicatorProps {
  isInitialLoading: boolean;
  isBuffering: boolean;
}

export default function BufferingIndicator({
  isInitialLoading,
  isBuffering,
}: BufferingIndicatorProps) {
  if (!isInitialLoading && !isBuffering) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none bg-black/30 backdrop-blur-[2px] transition-opacity duration-300">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-white/20 border-t-[#E50914] animate-spin" />
        <Loader2 className="w-7 h-7 text-[#E50914] absolute animate-pulse" />
      </div>
      <p className="text-xs sm:text-sm font-semibold text-zinc-200 mt-4 tracking-wide drop-shadow-md">
        {isInitialLoading ? 'Preparing Cinema Stream...' : 'Buffering...'}
      </p>
    </div>
  );
}
