'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import { usePlaybackProgress } from '@/hooks/usePlaybackProgress';
import PlayerControls from './PlayerControls';
import BufferingIndicator from './BufferingIndicator';
import ResumeBanner from './ResumeBanner';
import PlayerErrorOverlay from './PlayerErrorOverlay';
import CodecDiagnosticsModal from './CodecDiagnosticsModal';
import PlaybackInfoModal from './PlaybackInfoModal';
import { showToast } from '@/components/Toast';

export interface VideoPlayerProps {
  id: string;
  title: string;
  type: 'movie' | 'series' | 'anime' | 'livetv';
  posterUrl: string;
  sourceUrl: string;
  season?: number;
  episode?: number;
  isLowNetwork?: boolean;
  providerName?: string;
  activeServerId?: string;
  onSelectServer?: (serverId: string) => void;
  directStreamUrl?: string;
  isLocalBackendActive?: boolean;
  onRefreshStream?: () => void;
  shieldEnabled?: boolean;
  onToggleShield?: () => void;
  onNextEpisode?: () => void;
  hasNextEpisode?: boolean;
  onSwitchServer?: () => void;
}

export default function VideoPlayer({
  id,
  title,
  type,
  posterUrl,
  sourceUrl,
  season = 1,
  episode = 1,
  isLowNetwork = false,
  providerName = 'VidLink Pro (4K/1080p Fast)',
  activeServerId = 'vidlink',
  onSelectServer,
  directStreamUrl,
  isLocalBackendActive = false,
  onRefreshStream,
  shieldEnabled = false,
  onToggleShield,
  onNextEpisode,
  hasNextEpisode = false,
  onSwitchServer,
}: VideoPlayerProps) {
  const [showCodecModal, setShowCodecModal] = useState<boolean>(false);
  const [showPlaybackInfo, setShowPlaybackInfo] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Hidden developer diagnostics shortcut (Ctrl+Shift+D or ?debug=1)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('debug')) {
      setShowCodecModal(true);
    }

    const handleDebugShortcut = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setShowCodecModal((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleDebugShortcut);
    return () => window.removeEventListener('keydown', handleDebugShortcut);
  }, []);

  // Hook for player controls and engine management
  const player = useVideoPlayer({
    sourceUrl,
    isLowNetwork,
    onTimeUpdateCallback: (cur, dur) => {
      progress.persistProgress(cur, dur, false);
    },
    onEndedCallback: () => {
      if (hasNextEpisode && onNextEpisode) {
        onNextEpisode();
      }
    },
  });

  // Hook for throttled watch progress and resume prompt
  const progress = usePlaybackProgress({
    id,
    title,
    type,
    posterUrl,
    season,
    episode,
    videoRef: player.videoRef,
    onComplete: () => {
      if (hasNextEpisode && onNextEpisode) {
        onNextEpisode();
      }
    },
  });

  // Handle stream refresh while preserving state & position
  const handleLocalRefresh = useCallback(() => {
    setIsRefreshing(true);
    showToast('Revalidating stream pipeline...', 'info');

    // Trigger existing refresh from parent or player retry
    if (onRefreshStream) {
      onRefreshStream();
    } else {
      player.retryPlayback();
    }

    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, [onRefreshStream, player]);

  // Resolve active quality label
  const activeQualityLabel =
    player.currentQuality === -1
      ? 'Auto (Adaptive)'
      : player.qualityLevels.find((q) => q.id === player.currentQuality)?.label || '1080p';

  // Resolve resolution from video element if loaded
  const currentResolution =
    player.videoRef.current && player.videoRef.current.videoWidth > 0
      ? `${player.videoRef.current.videoWidth}x${player.videoRef.current.videoHeight}`
      : undefined;

  const currentBufferSeconds = Math.max(0, player.bufferedEnd - player.currentTime);

  return (
    <div
      ref={player.containerRef}
      className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden group select-none"
    >
      {/* HTML5 Video Element */}
      <video
        ref={player.videoRef}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
        onClick={player.togglePlay}
      />

      {/* Buffering Indicator */}
      <BufferingIndicator
        isInitialLoading={player.isInitialLoading || isRefreshing}
        isBuffering={player.isBuffering}
      />

      {/* Resume Playback Banner */}
      {progress.resumePrompt && !player.playerError && (
        <ResumeBanner
          formattedTime={progress.resumePrompt.formatted}
          onResume={progress.handleResume}
          onStartOver={progress.handleStartOver}
        />
      )}

      {/* Player Error Recovery Screen */}
      {player.playerError && (
        <PlayerErrorOverlay
          error={player.playerError}
          onRetry={player.retryPlayback}
          onSwitchServer={onSwitchServer}
        />
      )}

      {/* Player Controls Overlay */}
      {!player.playerError && (
        <PlayerControls
          title={title}
          type={type}
          season={season}
          episode={episode}
          isPlaying={player.isPlaying}
          currentTime={player.currentTime}
          duration={player.duration}
          bufferedEnd={player.bufferedEnd}
          volume={player.volume}
          isMuted={player.isMuted}
          playbackRate={player.playbackRate}
          isFullscreen={player.isFullscreen}
          showControls={player.showControls}
          qualityLevels={player.qualityLevels}
          currentQuality={player.currentQuality}
          audioTracks={player.audioTracks}
          currentAudioTrack={player.currentAudioTrack}
          subtitles={player.subtitles}
          currentSubtitle={player.currentSubtitle}
          providerName={providerName}
          activeServerId={activeServerId}
          onSelectServer={onSelectServer}
          directStreamUrl={directStreamUrl}
          isLocalBackendActive={isLocalBackendActive}
          onRefreshStream={handleLocalRefresh}
          isRefreshing={isRefreshing}
          shieldEnabled={shieldEnabled}
          onToggleShield={onToggleShield}
          onOpenPlaybackInfo={() => setShowPlaybackInfo(true)}
          onOpenCodecModal={() => setShowCodecModal(true)}
          hasNextEpisode={hasNextEpisode}
          onNextEpisode={onNextEpisode}
          onTogglePlay={player.togglePlay}
          onSeekRelative={player.seekRelative}
          onSeekTo={player.seekTo}
          onToggleMute={player.toggleMute}
          onChangeVolume={player.changeVolume}
          onSelectSpeed={player.changePlaybackRate}
          onToggleFullscreen={player.toggleFullscreen}
          onTogglePiP={player.togglePiP}
          onSelectQuality={player.selectQuality}
          onSelectAudioTrack={player.selectAudioTrack}
          onSelectSubtitle={player.selectSubtitle}
          onUserActivity={player.triggerUserActivity}
        />
      )}

      {/* Codec & Hardware Diagnostics Modal */}
      <CodecDiagnosticsModal
        sourceUrl={sourceUrl}
        activeEngine={player.activeEngine}
        isOpen={showCodecModal}
        onClose={() => setShowCodecModal(false)}
      />

      {/* Playback Info Modal (Real live metadata from 3-dot More menu) */}
      <PlaybackInfoModal
        sourceName={providerName}
        qualityLabel={activeQualityLabel}
        engineName={player.activeEngine ? player.activeEngine.toUpperCase() : 'HLS.js'}
        videoCodec="H.264 / AVC"
        audioCodec="AAC-LC Stereo"
        bufferSeconds={currentBufferSeconds}
        currentTime={player.currentTime}
        duration={player.duration}
        resolution={currentResolution}
        isPlaying={player.isPlaying}
        isOpen={showPlaybackInfo}
        onClose={() => setShowPlaybackInfo(false)}
      />
    </div>
  );
}
