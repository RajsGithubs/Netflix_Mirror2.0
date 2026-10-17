'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';

interface ResumeBannerProps {
  formattedTime: string;
  onResume: () => void;
  onStartOver: () => void;
}

export default function ResumeBanner({
  formattedTime,
  onResume,
  onStartOver,
}: ResumeBannerProps) {
  return (
    <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-40 bg-zinc-950/95 backdrop-blur-2xl border border-red-500/40 rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row items-center gap-4 text-white animate-scale-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#E50914]/20 flex items-center justify-center text-[#E50914] shrink-0">
          <RotateCcw className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-sm">Resume where you left off?</p>
          <p className="text-xs text-zinc-400">
            Previous timestamp:{' '}
            <span className="text-[#E50914] font-semibold">{formattedTime}</span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onResume}
          className="px-4 py-2 rounded-xl bg-[#E50914] hover:bg-red-700 text-white font-bold text-xs transition shadow-md"
        >
          Resume
        </button>
        <button
          onClick={onStartOver}
          className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}
