'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  PictureInPicture2,
  Subtitles,
  Settings,
  ArrowLeft,
  SkipForward,
  Server,
  RefreshCw,
  MoreVertical,
} from 'lucide-react';
import { QualityLevel, AudioTrackOption, SubtitleOption } from '@/lib/player/types';
import SubtitleSelector from './SubtitleSelector';
import PlayerSettingsMenu from './PlayerSettingsMenu';
import PlayerMoreMenu from './PlayerMoreMenu';
import ProviderSelector from './ProviderSelector';
import { formatPlaybackTime } from '@/hooks/usePlaybackProgress';

interface PlayerControlsProps {
  title: string;
  type: string;
  season?: number;
  episode?: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  bufferedEnd: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isFullscreen: boolean;
  showControls: boolean;
  qualityLevels: QualityLevel[];
  currentQuality: number;
  audioTracks: AudioTrackOption[];
  currentAudioTrack: number;
  subtitles: SubtitleOption[];
  currentSubtitle: number;
  providerName?: string;
  activeServerId?: string;
  onSelectServer?: (serverId: string) => void;
  directStreamUrl?: string;
  isLocalBackendActive?: boolean;
  onRefreshStream?: () => void;
  isRefreshing?: boolean;
  shieldEnabled?: boolean;
  onToggleShield?: () => void;
  onOpenPlaybackInfo?: () => void;
  onOpenCodecModal?: () => void;
  hasNextEpisode?: boolean;
  onNextEpisode?: () => void;
  onTogglePlay: () => void;
  onSeekRelative: (delta: number) => void;
  onSeekTo: (time: number) => void;
  onToggleMute: () => void;
  onChangeVolume: (val: number) => void;
  onSelectSpeed: (speed: number) => void;
  onToggleFullscreen: () => void;
  onTogglePiP: () => void;
  onSelectQuality: (id: number) => void;
  onSelectAudioTrack: (id: number) => void;
  onSelectSubtitle: (id: number) => void;
  onUserActivity: () => void;
}

export default function PlayerControls({
  title,
  type,
  season,
  episode,
  isPlaying,
  currentTime,
  duration,
  bufferedEnd,
  volume,
  isMuted,
  playbackRate,
  isFullscreen,
  showControls,
  qualityLevels,
  currentQuality,
  audioTracks,
  currentAudioTrack,
  subtitles,
  currentSubtitle,
  providerName = 'VidLink Pro (4K/1080p Fast)',
  activeServerId = 'vidlink',
  onSelectServer,
  directStreamUrl,
  isLocalBackendActive = false,
  onRefreshStream,
  isRefreshing = false,
  shieldEnabled = false,
  onToggleShield,
  onOpenPlaybackInfo,
  onOpenCodecModal,
  hasNextEpisode,
  onNextEpisode,
  onTogglePlay,
  onSeekRelative,
  onSeekTo,
  onToggleMute,
  onChangeVolume,
  onSelectSpeed,
  onToggleFullscreen,
  onTogglePiP,
  onSelectQuality,
  onSelectAudioTrack,
  onSelectSubtitle,
  onUserActivity,
}: PlayerControlsProps) {
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState<boolean>(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const [showProviderMenu, setShowProviderMenu] = useState<boolean>(false);

  // Temporary Skip Animation Badges (↶ 10 or 10 ↷)
  const [skipBadge, setSkipBadge] = useState<'backward' | 'forward' | null>(null);
  const skipBadgeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Double-click vs single-click detector on video canvas
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerSkipBadge = useCallback((direction: 'backward' | 'forward') => {
    setSkipBadge(direction);
    if (skipBadgeTimerRef.current) clearTimeout(skipBadgeTimerRef.current);
    skipBadgeTimerRef.current = setTimeout(() => {
      setSkipBadge(null);
    }, 850);
  }, []);

  const handleSeekBackward10 = useCallback(() => {
    onSeekRelative(-10);
    triggerSkipBadge('backward');
    onUserActivity();
  }, [onSeekRelative, triggerSkipBadge, onUserActivity]);

  const handleSeekForward10 = useCallback(() => {
    onSeekRelative(10);
    triggerSkipBadge('forward');
    onUserActivity();
  }, [onSeekRelative, triggerSkipBadge, onUserActivity]);

  // Click & Double-click on background overlay
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onUserActivity();

    // Check if double click was fired
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;

      // Determine left or right half
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX < rect.width * 0.4) {
        handleSeekBackward10();
      } else if (clickX > rect.width * 0.6) {
        handleSeekForward10();
      } else {
        onTogglePlay();
      }
      return;
    }

    // Schedule single click play/pause toggle
    clickTimeoutRef.current = setTimeout(() => {
      clickTimeoutRef.current = null;
      onTogglePlay();
    }, 240);
  };

  // Compute percentages
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferPercent = duration > 0 ? (bufferedEnd / duration) * 100 : 0;

  // Scrubber events
  const calculateScrubberPos = (clientX: number) => {
    if (!progressBarRef.current || duration <= 0) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  const handleScrubberMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    const pos = calculateScrubberPos(e.clientX);
    onSeekTo(pos * duration);
    onUserActivity();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isScrubbing || !progressBarRef.current || duration <= 0) return;
      const pos = calculateScrubberPos(e.clientX);
      onSeekTo(pos * duration);
      setHoverPosition(pos * 100);
      setHoverTime(pos * duration);
    };

    const handleMouseUp = () => {
      if (isScrubbing) {
        setIsScrubbing(false);
      }
    };

    if (isScrubbing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbing, duration, onSeekTo]);

  const handleScrubberMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const pos = calculateScrubberPos(e.clientX);
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);
  };

  const handleScrubberMouseLeave = () => {
    if (!isScrubbing) {
      setHoverTime(null);
    }
  };

  // Keyboard navigation on scrubber
  const handleScrubberKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleSeekBackward10();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleSeekForward10();
    } else if (e.key === 'Home') {
      e.preventDefault();
      onSeekTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      onSeekTo(duration);
    }
  };

  const areControlsVisible =
    showControls ||
    !isPlaying ||
    showSubtitleMenu ||
    showSettingsMenu ||
    showMoreMenu ||
    showProviderMenu ||
    isScrubbing;

  return (
    <div
      onMouseMove={onUserActivity}
      className={`absolute inset-0 z-30 flex flex-col justify-between select-none transition-opacity duration-300 ${
        areControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* 1. Minimal Cinematic Top Bar: [< Back] Movie Title */}
      <div className="w-full bg-gradient-to-b from-black/90 via-black/40 to-transparent px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3 sm:gap-4">
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
            className="flex items-center gap-1.5 p-2 rounded-full hover:bg-white/15 text-white/90 hover:text-white transition group/back"
            title="Back to Browse"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover/back:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline text-xs sm:text-sm font-medium">Back</span>
          </button>

          <div className="flex flex-col">
            <h1 className="font-bold text-sm sm:text-base md:text-lg text-white leading-tight drop-shadow-md line-clamp-1">
              {title}
            </h1>
            {(type === 'series' || type === 'anime') && season && episode && (
              <span className="text-xs text-zinc-400 font-mono">
                Season {season} • Episode {episode}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Interactive Video Canvas Surface (Single click play/pause, double click seek -10/+10) */}
      <div
        onClick={handleOverlayClick}
        className="flex-1 w-full flex items-center justify-center pointer-events-auto cursor-pointer relative"
      >
        {/* Temporary Animated Skip Badge (↶ 10 or 10 ↷) */}
        {skipBadge && (
          <div className="pointer-events-none flex flex-col items-center justify-center p-6 rounded-full bg-black/75 border border-white/20 text-white shadow-2xl backdrop-blur-md animate-ping-once z-40">
            {skipBadge === 'backward' ? (
              <div className="flex items-center gap-1 text-2xl sm:text-3xl font-extrabold tracking-wider">
                <RotateCcw className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-spin-once" />
                <span>-10s</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-2xl sm:text-3xl font-extrabold tracking-wider">
                <span>+10s</span>
                <RotateCw className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-spin-once" />
              </div>
            )}
          </div>
        )}

        {/* Large Center Play Button when Paused */}
        {!isPlaying && !skipBadge && (
          <div className="pointer-events-none flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-2xl shadow-red-950/80 transform transition-transform hover:scale-110 animate-subtle-pulse">
              <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom Cinema Control Bar: Seek Bar + Controls */}
      <div className="w-full bg-gradient-to-t from-black via-black/85 to-transparent px-4 sm:px-8 pb-4 sm:pb-6 pt-6 flex flex-col gap-3 pointer-events-auto">
        {/* Seek Bar Progress Line */}
        <div
          ref={progressBarRef}
          onMouseDown={handleScrubberMouseDown}
          onMouseMove={handleScrubberMouseMove}
          onMouseLeave={handleScrubberMouseLeave}
          onKeyDown={handleScrubberKeyDown}
          tabIndex={0}
          role="slider"
          aria-label="Seek video progress"
          aria-valuemin={0}
          aria-valuemax={Math.floor(duration)}
          aria-valuenow={Math.floor(currentTime)}
          aria-valuetext={`${formatPlaybackTime(currentTime)} of ${formatPlaybackTime(duration)}`}
          className="relative w-full h-1.5 hover:h-2.5 bg-zinc-800/80 rounded-full cursor-pointer transition-all flex items-center group/scrubber focus:outline-none focus:ring-1 focus:ring-red-500"
        >
          {/* Buffered Progress */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-white/25 rounded-full transition-all duration-150"
            style={{ width: `${Math.min(100, bufferPercent)}%` }}
          />

          {/* Played Progress in Netflix Red */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-[#E50914] rounded-full transition-all duration-75 flex items-center justify-end"
            style={{ width: `${Math.min(100, progressPercent)}%` }}
          >
            {/* Scrubber Knob */}
            <div className="w-3.5 h-3.5 rounded-full bg-white shadow-lg scale-0 group-hover/scrubber:scale-100 transition-transform -mr-1.5" />
          </div>

          {/* Hover Timestamp Preview Tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute bottom-4 -translate-x-1/2 px-2 py-0.5 rounded-md bg-zinc-900 border border-white/20 text-[11px] font-mono text-white shadow-2xl pointer-events-none"
              style={{ left: `${Math.max(2, Math.min(98, hoverPosition))}%` }}
            >
              {formatPlaybackTime(hoverTime)}
            </div>
          )}
        </div>

        {/* Bottom Control Row */}
        <div className="flex items-center justify-between text-white text-xs sm:text-sm flex-wrap gap-2">
          {/* LEFT: Provider Badge [ VidLink Pro (4K/1080p Fast) ] [ ↻ ], Play/Pause, -10s, +10s, Volume, Time */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 flex-wrap">
            {/* 1. Source / Provider Selector & Refresh Button */}
            <div className="flex items-center gap-1.5 shrink-0">
              <ProviderSelector
                activeServerId={activeServerId || 'vidlink'}
                onSelectServer={onSelectServer || (() => {})}
                directStreamUrl={directStreamUrl}
                isLocalBackendActive={isLocalBackendActive}
                isOpen={showProviderMenu}
                onToggle={() => {
                  setShowProviderMenu(!showProviderMenu);
                  setShowSettingsMenu(false);
                  setShowSubtitleMenu(false);
                  setShowMoreMenu(false);
                }}
                onClose={() => setShowProviderMenu(false)}
              />

              {onRefreshStream && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRefreshStream();
                  }}
                  disabled={isRefreshing}
                  className={`p-1.5 rounded-xl bg-zinc-900/90 border border-white/10 hover:border-white/30 text-zinc-300 hover:text-white transition shadow-sm backdrop-blur-md ${
                    isRefreshing ? 'opacity-70 cursor-wait' : ''
                  }`}
                  title="Refresh video stream"
                  aria-label="Refresh video stream"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      isRefreshing
                        ? 'animate-spin text-[#E50914]'
                        : 'hover:rotate-180 transition-transform duration-500'
                    }`}
                  />
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-[1px] h-4 bg-white/15" />

            {/* Play/Pause Button */}
            <button
              onClick={onTogglePlay}
              className="p-1.5 hover:text-[#E50914] text-white transition focus:outline-none"
              title={isPlaying ? 'Pause (Space or K)' : 'Play (Space or K)'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current" />
              )}
            </button>

            {/* -10s Skip Button */}
            <button
              onClick={handleSeekBackward10}
              className="p-1.5 hover:text-white text-zinc-300 transition focus:outline-none"
              title="Seek backward 10 seconds (Left Arrow)"
              aria-label="Seek backward 10 seconds"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* +10s Skip Button */}
            <button
              onClick={handleSeekForward10}
              className="p-1.5 hover:text-white text-zinc-300 transition focus:outline-none"
              title="Seek forward 10 seconds (Right Arrow)"
              aria-label="Seek forward 10 seconds"
            >
              <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Volume Control & Smooth Slider */}
            <div className="flex items-center gap-1.5 group/volume">
              <button
                onClick={onToggleMute}
                className="p-1.5 hover:text-white text-zinc-300 transition focus:outline-none"
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-[#E50914]" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
                className="w-14 sm:w-20 h-1 bg-zinc-700 accent-[#E50914] rounded-lg cursor-pointer transition-all opacity-80 hover:opacity-100"
                aria-label="Volume slider"
              />
            </div>

            {/* Current Time / Duration */}
            <span className="font-mono text-zinc-400 text-xs tracking-tight">
              {formatPlaybackTime(currentTime)} / {formatPlaybackTime(duration)}
            </span>
          </div>

          {/* RIGHT: Next Episode, Subtitles, Settings, 3-Dot More Menu, PiP, Fullscreen */}
          <div className="flex items-center gap-2 sm:gap-3 relative">
            {/* Next Episode (if series and available) */}
            {hasNextEpisode && onNextEpisode && (
              <button
                onClick={onNextEpisode}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-[#E50914] text-white transition text-xs font-semibold"
                title="Play Next Episode"
                aria-label="Play Next Episode"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Next Episode</span>
              </button>
            )}

            {/* Subtitles Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSubtitleMenu(!showSubtitleMenu);
                  setShowSettingsMenu(false);
                  setShowMoreMenu(false);
                }}
                className={`p-1.5 rounded-lg transition focus:outline-none ${
                  currentSubtitle !== -1
                    ? 'text-[#E50914]'
                    : 'text-zinc-300 hover:text-white'
                }`}
                title="Subtitles"
                aria-label="Subtitles"
              >
                <Subtitles className="w-5 h-5" />
              </button>

              <SubtitleSelector
                subtitles={subtitles}
                currentSubtitle={currentSubtitle}
                onSelectSubtitle={onSelectSubtitle}
                isOpen={showSubtitleMenu}
                onClose={() => setShowSubtitleMenu(false)}
              />
            </div>

            {/* Clean Nested Settings Menu Button (Quality, Subtitles, Audio, Speed) */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSettingsMenu(!showSettingsMenu);
                  setShowSubtitleMenu(false);
                  setShowMoreMenu(false);
                }}
                className={`p-1.5 rounded-lg transition focus:outline-none ${
                  showSettingsMenu ? 'text-white' : 'text-zinc-300 hover:text-white'
                }`}
                title="Playback Settings"
                aria-label="Playback Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              <PlayerSettingsMenu
                qualityLevels={qualityLevels}
                currentQuality={currentQuality}
                onSelectQuality={onSelectQuality}
                playbackRate={playbackRate}
                onSelectSpeed={onSelectSpeed}
                audioTracks={audioTracks}
                currentAudioTrack={currentAudioTrack}
                onSelectAudioTrack={onSelectAudioTrack}
                subtitles={subtitles}
                currentSubtitle={currentSubtitle}
                onSelectSubtitle={onSelectSubtitle}
                isOpen={showSettingsMenu}
                onClose={() => setShowSettingsMenu(false)}
              />
            </div>

            {/* 3-Dot More Menu Button (Shield, Codec Diagnostics, Playback Info) */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowMoreMenu(!showMoreMenu);
                  setShowSettingsMenu(false);
                  setShowSubtitleMenu(false);
                }}
                className={`p-1.5 rounded-lg transition focus:outline-none ${
                  showMoreMenu ? 'text-[#E50914]' : 'text-zinc-300 hover:text-white'
                }`}
                title="More Options (Shield, Diagnostics, Info)"
                aria-label="More Options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              <PlayerMoreMenu
                isOpen={showMoreMenu}
                onClose={() => setShowMoreMenu(false)}
                shieldEnabled={shieldEnabled}
                onToggleShield={onToggleShield || (() => {})}
                onOpenCodecModal={onOpenCodecModal || (() => {})}
                onOpenPlaybackInfo={onOpenPlaybackInfo || (() => {})}
              />
            </div>

            {/* Picture-in-Picture */}
            <button
              onClick={onTogglePiP}
              className="p-1.5 rounded-lg text-zinc-300 hover:text-white transition focus:outline-none hidden sm:block"
              title="Picture-in-Picture"
              aria-label="Picture-in-Picture"
            >
              <PictureInPicture2 className="w-5 h-5" />
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={onToggleFullscreen}
              className="p-1.5 rounded-lg text-zinc-300 hover:text-white transition focus:outline-none"
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
