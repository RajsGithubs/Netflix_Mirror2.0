'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  PlaybackAdapter,
  PlaybackEngineType,
  QualityLevel,
  AudioTrackOption,
  SubtitleOption,
  PlayerError,
} from '@/lib/player/types';
import { createPlaybackAdapter } from '@/lib/player/engineFactory';
import { playBrandSound } from '@/lib/brandSound';
import { showToast } from '@/components/Toast';

interface UseVideoPlayerOptions {
  sourceUrl?: string;
  isLowNetwork?: boolean;
  onTimeUpdateCallback?: (currentTime: number, duration: number) => void;
  onEndedCallback?: () => void;
}

export function useVideoPlayer({
  sourceUrl,
  isLowNetwork = false,
  onTimeUpdateCallback,
  onEndedCallback,
}: UseVideoPlayerOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const adapterRef = useRef<PlaybackAdapter | null>(null);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stallTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Playback states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isStalled, setIsStalled] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [bufferedEnd, setBufferedEnd] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);

  // Stream tracks and quality
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = Auto
  const [audioTracks, setAudioTracks] = useState<AudioTrackOption[]>([]);
  const [currentAudioTrack, setCurrentAudioTrack] = useState<number>(0);
  const [subtitles, setSubtitles] = useState<SubtitleOption[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<number>(-1); // -1 = Off
  const [playerError, setPlayerError] = useState<PlayerError | null>(null);
  const [activeEngine, setActiveEngine] = useState<PlaybackEngineType>('hls');

  // Auto-hide controls during active playback; keep visible when paused
  useEffect(() => {
    if (isPlaying) {
      if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2800);
    } else {
      setShowControls(true);
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
        hideControlsTimerRef.current = null;
      }
    }
  }, [isPlaying]);

  // Trigger user activity and reset auto-hide timeout
  const triggerUserActivity = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (isPlaying) {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2800);
    }
  }, [isPlaying]);

  // Stall watchdog
  const resetStallWatchdog = useCallback(() => {
    setIsStalled(false);
    setIsBuffering(false);
    if (stallTimerRef.current) {
      clearTimeout(stallTimerRef.current);
      stallTimerRef.current = null;
    }
  }, []);

  const triggerStallWatchdog = useCallback(() => {
    setIsBuffering(true);
    if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
    stallTimerRef.current = setTimeout(() => {
      setIsStalled(true);
    }, 10000);
  }, []);

  // Initialize playback adapter whenever sourceUrl changes
  useEffect(() => {
    if (!sourceUrl || !videoRef.current) return;

    const video = videoRef.current;
    setIsInitialLoading(true);
    setPlayerError(null);
    resetStallWatchdog();

    // Create appropriate adapter
    const adapter = createPlaybackAdapter(sourceUrl, isLowNetwork);
    adapterRef.current = adapter;
    setActiveEngine(adapter.engineType);

    adapter.on('manifestParsed', (levels, audios, subs) => {
      setQualityLevels(levels);
      setAudioTracks(audios);
      setSubtitles(subs);
      setIsInitialLoading(false);
    });

    adapter.on('qualitySwitched', (levelId) => {
      setCurrentQuality(levelId);
    });

    adapter.on('audioTrackSwitched', (trackId) => {
      setCurrentAudioTrack(trackId);
    });

    adapter.on('subtitleSwitched', (subId) => {
      setCurrentSubtitle(subId);
    });

    adapter.on('buffering', (buffering) => {
      if (buffering) {
        triggerStallWatchdog();
      } else {
        resetStallWatchdog();
      }
    });

    adapter.on('error', (err) => {
      setPlayerError(err);
      setIsInitialLoading(false);
      resetStallWatchdog();
    });

    adapter.on('recovered', () => {
      setPlayerError(null);
      resetStallWatchdog();
    });

    adapter.initialize(video, sourceUrl).catch((err) => {
      console.error('Error initializing playback adapter:', err);
    });

    return () => {
      resetStallWatchdog();
      adapter.destroy();
      adapterRef.current = null;
    };
  }, [sourceUrl, isLowNetwork, resetStallWatchdog, triggerStallWatchdog]);

  // Video element event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const cur = video.currentTime;
      const dur = video.duration;
      setCurrentTime(cur);
      setDuration(dur);

      if (video.buffered.length > 0) {
        try {
          const bufEnd = video.buffered.end(video.buffered.length - 1);
          setBufferedEnd(bufEnd);
        } catch {
          // ignore index errors
        }
      }

      if (onTimeUpdateCallback && dur > 0) {
        onTimeUpdateCallback(cur, dur);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      resetStallWatchdog();
    };

    const handlePause = () => {
      setIsPlaying(false);
      setShowControls(true);
    };

    const handleWaiting = () => {
      triggerStallWatchdog();
    };

    const handlePlaying = () => {
      resetStallWatchdog();
      setIsPlaying(true);
      setIsInitialLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setShowControls(true);
      if (onEndedCallback) onEndedCallback();
    };

    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [onTimeUpdateCallback, onEndedCallback, resetStallWatchdog, triggerStallWatchdog]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Controls actions
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      playBrandSound();
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    triggerUserActivity();
  }, [triggerUserActivity]);

  const seekRelative = useCallback(
    (delta: number) => {
      if (!videoRef.current) return;
      const target = Math.min(Math.max(0, videoRef.current.currentTime + delta), duration || 0);
      videoRef.current.currentTime = target;
      setCurrentTime(target);
      triggerUserActivity();
      showToast(delta > 0 ? '+10s' : '-10s', 'info');
    },
    [duration, triggerUserActivity]
  );

  const seekTo = useCallback(
    (targetTime: number) => {
      if (!videoRef.current) return;
      const target = Math.min(Math.max(0, targetTime), duration || 0);
      videoRef.current.currentTime = target;
      setCurrentTime(target);
      triggerUserActivity();
    },
    [duration, triggerUserActivity]
  );

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
    triggerUserActivity();
  }, [triggerUserActivity]);

  const changeVolume = useCallback(
    (newVolume: number) => {
      if (!videoRef.current) return;
      const clamped = Math.max(0, Math.min(1, newVolume));
      videoRef.current.volume = clamped;
      videoRef.current.muted = clamped === 0;
      setVolume(clamped);
      setIsMuted(clamped === 0);
      triggerUserActivity();
    },
    [triggerUserActivity]
  );

  const changePlaybackRate = useCallback(
    (speed: number) => {
      if (!videoRef.current) return;
      videoRef.current.playbackRate = speed;
      setPlaybackRate(speed);
      triggerUserActivity();
      showToast(`Playback Speed: ${speed}x`, 'info');
    },
    [triggerUserActivity]
  );

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
    triggerUserActivity();
  }, [triggerUserActivity]);

  const togglePiP = useCallback(async () => {
    try {
      if (videoRef.current && document.pictureInPictureEnabled) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      }
    } catch (err) {
      console.warn('PiP failed or unsupported:', err);
    }
  }, []);

  const selectQuality = useCallback(
    (levelId: number) => {
      if (adapterRef.current) {
        adapterRef.current.setQuality(levelId);
        setCurrentQuality(levelId);
        const match = qualityLevels.find((q) => q.id === levelId);
        showToast(`Video Quality: ${levelId === -1 ? 'Auto (Adaptive)' : match?.label || 'Manual'}`, 'info');
      }
    },
    [qualityLevels]
  );

  const selectAudioTrack = useCallback(
    (trackId: number) => {
      if (adapterRef.current) {
        adapterRef.current.setAudioTrack(trackId);
        setCurrentAudioTrack(trackId);
        const match = audioTracks.find((a) => a.id === trackId);
        showToast(`Audio Track: ${match?.label || 'Selected'}`, 'info');
      }
    },
    [audioTracks]
  );

  const selectSubtitle = useCallback(
    (subId: number) => {
      if (adapterRef.current) {
        adapterRef.current.setSubtitleTrack(subId);
        setCurrentSubtitle(subId);
        const match = subtitles.find((s) => s.id === subId);
        showToast(`Subtitles: ${subId === -1 ? 'Off' : match?.label || 'On'}`, 'info');
      }
    },
    [subtitles]
  );

  const retryPlayback = useCallback(() => {
    setPlayerError(null);
    resetStallWatchdog();
    if (adapterRef.current) {
      adapterRef.current.retry();
    }
  }, [resetStallWatchdog]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          activeEl.isContentEditable)
      ) {
        return;
      }

      if (e.code === 'Space' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        seekRelative(-10);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        seekRelative(10);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        changeVolume(volume + 0.05);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        changeVolume(volume - 0.05);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seekRelative, changeVolume, volume, toggleMute, toggleFullscreen]);

  return {
    videoRef,
    containerRef,
    isPlaying,
    isBuffering,
    isInitialLoading,
    isStalled,
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
    playerError,
    activeEngine,
    togglePlay,
    seekRelative,
    seekTo,
    toggleMute,
    changeVolume,
    changePlaybackRate,
    toggleFullscreen,
    togglePiP,
    selectQuality,
    selectAudioTrack,
    selectSubtitle,
    retryPlayback,
    triggerUserActivity,
    resetStallWatchdog,
  };
}
