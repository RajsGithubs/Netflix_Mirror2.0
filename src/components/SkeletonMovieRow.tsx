import React from 'react';

interface SkeletonMovieRowProps {
  title?: string;
  count?: number;
}

export default function SkeletonMovieRow({
  title,
  count = 6,
}: SkeletonMovieRowProps) {
  return (
    <div className="space-y-3 py-2">
      {title && (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-zinc-800 animate-pulse" />
          <div className="h-6 w-48 rounded bg-zinc-800 animate-pulse" />
        </div>
      )}

      <div className="flex items-center gap-4 overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-36 sm:w-44 md:w-52 aspect-[2/3] rounded-2xl bg-zinc-900/80 border border-white/5 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
