'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft, Server } from 'lucide-react';
import { PlayerError } from '@/lib/player/types';

interface PlayerErrorOverlayProps {
  error: PlayerError;
  onRetry: () => void;
  onSwitchServer?: () => void;
}

export default function PlayerErrorOverlay({
  error,
  onRetry,
  onSwitchServer,
}: PlayerErrorOverlayProps) {
  const isDev =
    typeof window !== 'undefined' &&
    (window.location.search.includes('debug') || process.env.NODE_ENV === 'development');

  const friendlyMessage =
    error.code === 'CODEC_UNSUPPORTED'
      ? 'Unsupported video or audio format on this browser.'
      : error.code === 'NETWORK_TIMEOUT' || error.code === 'MANIFEST_LOAD_ERROR'
      ? 'The video stream is temporarily unavailable or interrupted by network issues.'
      : "We couldn't continue playing this title right now.";

  return (
    <div className="absolute inset-0 z-40 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white animate-fade-in select-none">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-[#E50914] animate-pulse" />
      </div>

      <h3 className="text-xl sm:text-2xl font-bold tracking-tight">Playback Error</h3>
      <p className="text-zinc-300 text-sm max-w-md mt-2 leading-relaxed">
        {friendlyMessage}
      </p>

      {/* Development details only when debug mode is enabled */}
      {isDev && error.details && (
        <div className="mt-3 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400 max-w-lg break-all">
          <p className="font-bold text-red-400">Dev Error: {error.code}</p>
          <p>{error.details}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        <button
          onClick={onRetry}
          className="px-6 py-2.5 rounded-full bg-[#E50914] hover:bg-red-700 text-white font-bold text-sm transition flex items-center gap-2 shadow-lg"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>

        {onSwitchServer && (
          <button
            onClick={onSwitchServer}
            className="px-5 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm transition flex items-center gap-2"
          >
            <Server className="w-4 h-4" />
            <span>Try Backup Stream</span>
          </button>
        )}

        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = '/';
              }
            }
          }}
          className="px-5 py-2.5 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-semibold text-sm transition flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>
    </div>
  );
}
