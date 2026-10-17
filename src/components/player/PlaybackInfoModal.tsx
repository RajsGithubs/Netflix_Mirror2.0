'use client';

import React from 'react';
import { Info, X, CheckCircle2 } from 'lucide-react';
import { formatPlaybackTime } from '@/hooks/usePlaybackProgress';

export interface PlaybackInfoProps {
  sourceName?: string;
  qualityLabel?: string;
  engineName?: string;
  videoCodec?: string;
  audioCodec?: string;
  bufferSeconds?: number;
  currentTime?: number;
  duration?: number;
  resolution?: string;
  isPlaying?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export default function PlaybackInfoModal({
  sourceName = 'VidLink Pro (4K/1080p Fast)',
  qualityLabel = 'Auto',
  engineName = 'HLS.js / Native Bridge',
  videoCodec = 'H.264 / AVC',
  audioCodec = 'AAC',
  bufferSeconds = 0,
  currentTime = 0,
  duration = 0,
  resolution,
  isPlaying = false,
  isOpen,
  onClose,
}: PlaybackInfoProps) {
  if (!isOpen) return null;

  const infoRows = [
    { label: 'Source Provider', value: sourceName },
    { label: 'Quality', value: qualityLabel },
    { label: 'Engine', value: engineName },
    { label: 'Video Codec', value: videoCodec },
    { label: 'Audio Codec', value: audioCodec },
    ...(resolution ? [{ label: 'Resolution', value: resolution }] : []),
    {
      label: 'Buffer Health',
      value: bufferSeconds > 0 ? `${bufferSeconds.toFixed(1)}s` : 'Real-time Live',
    },
    {
      label: 'Current Time',
      value: `${formatPlaybackTime(currentTime)} / ${formatPlaybackTime(duration)}`,
    },
    {
      label: 'Playback State',
      value: isPlaying ? 'Active Playing' : 'Paused',
    },
  ];

  return (
    <div
      onClick={onClose}
      className="absolute inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-sm w-full p-5 text-white shadow-2xl space-y-4 animate-scale-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#E50914]" />
            <h3 className="font-bold text-sm tracking-wide">Playback Info</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Items */}
        <div className="space-y-2 text-xs">
          {infoRows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/60"
            >
              <span className="text-zinc-400 font-medium">{row.label}</span>
              <span className="text-white font-mono font-semibold text-[11px] truncate max-w-[180px]">
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-1 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span className="flex items-center gap-1 text-emerald-400 font-sans">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active Session Stream
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
