'use client';

import React, { useState } from 'react';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Sliders,
  Volume2,
  Gauge,
  Subtitles,
  X,
} from 'lucide-react';
import { QualityLevel, AudioTrackOption, SubtitleOption } from '@/lib/player/types';

interface PlayerSettingsMenuProps {
  qualityLevels: QualityLevel[];
  currentQuality: number;
  onSelectQuality: (id: number) => void;
  playbackRate: number;
  onSelectSpeed: (speed: number) => void;
  audioTracks: AudioTrackOption[];
  currentAudioTrack: number;
  onSelectAudioTrack: (id: number) => void;
  subtitles?: SubtitleOption[];
  currentSubtitle?: number;
  onSelectSubtitle?: (id: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

type SettingsSubMenu = 'main' | 'quality' | 'speed' | 'audio' | 'subtitles';

export default function PlayerSettingsMenu({
  qualityLevels,
  currentQuality,
  onSelectQuality,
  playbackRate,
  onSelectSpeed,
  audioTracks,
  currentAudioTrack,
  onSelectAudioTrack,
  subtitles = [],
  currentSubtitle = -1,
  onSelectSubtitle,
  isOpen,
  onClose,
}: PlayerSettingsMenuProps) {
  const [currentView, setCurrentView] = useState<SettingsSubMenu>('main');

  if (!isOpen) return null;

  // Resolve current labels
  const qualityLabel =
    currentQuality === -1
      ? 'Auto'
      : qualityLevels.find((q) => q.id === currentQuality)?.label || 'Auto';

  const speedLabel = playbackRate === 1 ? 'Normal (1x)' : `${playbackRate}x`;

  const audioLabel =
    audioTracks.length > 0
      ? audioTracks.find((a) => a.id === currentAudioTrack)?.label || 'Default'
      : 'Default';

  const subtitleLabel =
    currentSubtitle === -1
      ? 'Off'
      : subtitles.find((s) => s.id === currentSubtitle)?.label || 'On';

  return (
    <div className="absolute right-0 bottom-full mb-3 w-72 rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-2xl p-3 z-50 flex flex-col backdrop-blur-2xl text-white select-none animate-fade-in">
      {/* 1. Header with Title and Close or Back button */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 mb-2">
        {currentView === 'main' ? (
          <span className="font-semibold text-xs tracking-wider uppercase text-zinc-300">
            Playback Settings
          </span>
        ) : (
          <button
            onClick={() => setCurrentView('main')}
            className="flex items-center gap-1 text-xs font-semibold text-zinc-300 hover:text-white transition"
          >
            <ChevronLeft className="w-4 h-4 text-[#E50914]" />
            <span className="capitalize">{currentView}</span>
          </button>
        )}

        <button
          onClick={() => {
            setCurrentView('main');
            onClose();
          }}
          className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          aria-label="Close settings"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Main Nested View */}
      {currentView === 'main' && (
        <div className="flex flex-col gap-1 py-1 text-xs">
          {/* Quality Item */}
          <button
            onClick={() => setCurrentView('quality')}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-850 hover:bg-zinc-800/80 transition text-zinc-200"
          >
            <div className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4 text-zinc-400" />
              <span className="font-medium">Quality</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400">
              <span className="text-[11px] font-mono">{qualityLabel}</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
            </div>
          </button>

          {/* Subtitles Item */}
          {onSelectSubtitle && subtitles.length > 0 && (
            <button
              onClick={() => setCurrentView('subtitles')}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/80 transition text-zinc-200"
            >
              <div className="flex items-center gap-2.5">
                <Subtitles className="w-4 h-4 text-zinc-400" />
                <span className="font-medium">Subtitles</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400">
                <span className="text-[11px] font-mono">{subtitleLabel}</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              </div>
            </button>
          )}

          {/* Audio Tracks Item (only shown if multi-track) */}
          {audioTracks.length > 1 && (
            <button
              onClick={() => setCurrentView('audio')}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/80 transition text-zinc-200"
            >
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-zinc-400" />
                <span className="font-medium">Audio</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400">
                <span className="text-[11px] font-mono">{audioLabel}</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              </div>
            </button>
          )}

          {/* Playback Speed Item */}
          <button
            onClick={() => setCurrentView('speed')}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/80 transition text-zinc-200"
          >
            <div className="flex items-center gap-2.5">
              <Gauge className="w-4 h-4 text-zinc-400" />
              <span className="font-medium">Playback Speed</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400">
              <span className="text-[11px] font-mono">{speedLabel}</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
            </div>
          </button>
        </div>
      )}

      {/* 3. Submenu: Quality */}
      {currentView === 'quality' && (
        <div className="max-h-60 overflow-y-auto space-y-1 py-1 scrollbar-thin">
          <button
            onClick={() => {
              onSelectQuality(-1);
              setCurrentView('main');
            }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
              currentQuality === -1
                ? 'bg-[#E50914] text-white font-bold'
                : 'hover:bg-zinc-800/80 text-zinc-300'
            }`}
          >
            <div>
              <p className="font-semibold">Auto</p>
              <p className="text-[10px] text-zinc-400">Optimal dynamic streaming</p>
            </div>
            {currentQuality === -1 && <Check className="w-4 h-4" />}
          </button>

          {qualityLevels.length > 0 ? (
            qualityLevels.map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => {
                  onSelectQuality(lvl.id);
                  setCurrentView('main');
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                  currentQuality === lvl.id
                    ? 'bg-[#E50914] text-white font-bold'
                    : 'hover:bg-zinc-800/80 text-zinc-300'
                }`}
              >
                <div>
                  <p className="font-semibold">{lvl.label}</p>
                  {lvl.bitrate > 0 && (
                    <p className="text-[10px] text-zinc-400 font-mono">
                      {(lvl.bitrate / 1000000).toFixed(1)} Mbps
                    </p>
                  )}
                </div>
                {currentQuality === lvl.id && <Check className="w-4 h-4" />}
              </button>
            ))
          ) : (
            <div className="px-3 py-3 text-center text-xs text-zinc-500">
              Single stream quality available.
            </div>
          )}
        </div>
      )}

      {/* 4. Submenu: Subtitles */}
      {currentView === 'subtitles' && onSelectSubtitle && (
        <div className="max-h-60 overflow-y-auto space-y-1 py-1 scrollbar-thin">
          <button
            onClick={() => {
              onSelectSubtitle(-1);
              setCurrentView('main');
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

          {subtitles.map((sub) => (
            <button
              key={sub.id}
              onClick={() => {
                onSelectSubtitle(sub.id);
                setCurrentView('main');
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                currentSubtitle === sub.id
                  ? 'bg-[#E50914] text-white font-bold'
                : 'hover:bg-zinc-800/80 text-zinc-300'
              }`}
            >
              <div className="flex flex-col">
                <span className="font-semibold">{sub.label}</span>
                {sub.language && (
                  <span className="text-[10px] text-zinc-400 uppercase font-mono">
                    {sub.language}
                  </span>
                )}
              </div>
              {currentSubtitle === sub.id && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}

      {/* 5. Submenu: Audio */}
      {currentView === 'audio' && (
        <div className="max-h-60 overflow-y-auto space-y-1 py-1 scrollbar-thin">
          {audioTracks.map((trk) => (
            <button
              key={trk.id}
              onClick={() => {
                onSelectAudioTrack(trk.id);
                setCurrentView('main');
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                currentAudioTrack === trk.id
                  ? 'bg-[#E50914] text-white font-bold'
                  : 'hover:bg-zinc-800/80 text-zinc-300'
              }`}
            >
              <div>
                <p className="font-semibold">{trk.label}</p>
                {trk.language && (
                  <p className="text-[10px] text-zinc-400 font-mono uppercase">{trk.language}</p>
                )}
              </div>
              {currentAudioTrack === trk.id && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}

      {/* 6. Submenu: Playback Speed */}
      {currentView === 'speed' && (
        <div className="space-y-1 py-1">
          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((spd) => (
            <button
              key={spd}
              onClick={() => {
                onSelectSpeed(spd);
                setCurrentView('main');
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                playbackRate === spd
                  ? 'bg-[#E50914] text-white font-bold'
                  : 'hover:bg-zinc-800/80 text-zinc-300'
              }`}
            >
              <span>{spd === 1 ? '1x (Normal)' : `${spd}x`}</span>
              {playbackRate === spd && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
