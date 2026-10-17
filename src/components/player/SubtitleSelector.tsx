'use client';

import React from 'react';
import { Check, Subtitles } from 'lucide-react';
import { SubtitleOption } from '@/lib/player/types';

interface SubtitleSelectorProps {
  subtitles: SubtitleOption[];
  currentSubtitle: number;
  onSelectSubtitle: (id: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function SubtitleSelector({
  subtitles,
  currentSubtitle,
  onSelectSubtitle,
  isOpen,
  onClose,
}: SubtitleSelectorProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 bottom-full mb-3 w-64 rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-2xl p-3 z-50 flex flex-col gap-2 backdrop-blur-2xl">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-1.5">
          <Subtitles className="w-3.5 h-3.5 text-[#E50914]" />
          <span className="font-bold text-xs uppercase tracking-wider text-zinc-300">
            Audio & Subtitles
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded"
        >
          ✕
        </button>
      </div>

      <div className="max-h-56 overflow-y-auto space-y-1 scrollbar-thin">
        {/* Off Option */}
        <button
          onClick={() => {
            onSelectSubtitle(-1);
            onClose();
          }}
          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
            currentSubtitle === -1
              ? 'bg-[#E50914] text-white font-bold'
              : 'hover:bg-zinc-800/80 text-zinc-300'
          }`}
        >
          <span>Off</span>
          {currentSubtitle === -1 && <Check className="w-4 h-4" />}
        </button>

        {/* Subtitle Tracks */}
        {subtitles.length > 0 ? (
          subtitles.map((sub) => (
            <button
              key={sub.id}
              onClick={() => {
                onSelectSubtitle(sub.id);
                onClose();
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                currentSubtitle === sub.id
                  ? 'bg-[#E50914] text-white font-bold'
                  : 'hover:bg-zinc-800/80 text-zinc-300'
              }`}
            >
              <div className="flex flex-col">
                <span>{sub.label}</span>
                {sub.language && (
                  <span className="text-[10px] text-zinc-400 font-mono uppercase">
                    {sub.language}
                  </span>
                )}
              </div>
              {currentSubtitle === sub.id && <Check className="w-4 h-4" />}
            </button>
          ))
        ) : (
          <div className="px-3 py-3 text-center text-xs text-zinc-500">
            No subtitles available for this stream.
          </div>
        )}
      </div>
    </div>
  );
}
