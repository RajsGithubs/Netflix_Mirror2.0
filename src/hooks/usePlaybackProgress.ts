'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useWatchHistory } from './useWatchHistory';

interface UsePlaybackProgressProps {
  id: string;
  title: string;
  type: 'movie' | 'series' | 'anime' | 'livetv';
  posterUrl: string;
  season?: number;
  episode?: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onComplete?: () => void;
}

export function formatPlaybackTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function usePlaybackProgress({
  id,
  title,
  type,
  posterUrl,
  season = 1,
  episode = 1,
  videoRef,
  onComplete,
}: UsePlaybackProgressProps) {
  const { saveProgress, getProgress } = useWatchHistory();
  const [resumePrompt, setResumePrompt] = useState<{ time: number; formatted: string } | null>(null);
  const [hasPromptedResume, setHasPromptedResume] = useState<boolean>(false);
  const lastSavedTimeRef = useRef<number>(0);
  const lastSaveTimestampRef = useRef<number>(0);
  const isCompletedRef = useRef<boolean>(false);

  // Check watch history for existing progress on mount or episode change
  useEffect(() => {
    if (type === 'livetv') return;
    setHasPromptedResume(false);
    isCompletedRef.current = false;

    const saved = getProgress(
      id,
      type === 'series' || type === 'anime' ? season : undefined,
      type === 'series' || type === 'anime' ? episode : undefined
    );

    if (
      saved &&
      saved.currentTime > 10 &&
      saved.duration > 30 &&
      saved.currentTime < saved.duration - 25 &&
      saved.percentage < 92
    ) {
      setResumePrompt({
        time: saved.currentTime,
        formatted: formatPlaybackTime(saved.currentTime),
      });

      // Auto-hide prompt after 12 seconds if user does not click
      const timer = setTimeout(() => {
        setResumePrompt(null);
      }, 12000);
      return () => clearTimeout(timer);
    }
  }, [id, season, episode, type, getProgress]);

  // Throttled progress save function
  const persistProgress = useCallback(
    (curTime: number, dur: number, force: boolean = false) => {
      if (type === 'livetv' || !id || isNaN(curTime) || isNaN(dur) || dur <= 0) return;

      const now = Date.now();
      // Only write to localStorage if forced (pause/seek/leave) or at least 5s have elapsed since last write
      if (!force && now - lastSaveTimestampRef.current < 5000) {
        return;
      }

      // Check for completion threshold
      const isCompleted = curTime >= dur - 20 || (curTime / dur) >= 0.92;
      if (isCompleted && !isCompletedRef.current) {
        isCompletedRef.current = true;
        if (onComplete) onComplete();
      }

      lastSavedTimeRef.current = curTime;
      lastSaveTimestampRef.current = now;

      saveProgress({
        id,
        title,
        type,
        posterUrl,
        currentTime: isCompleted ? dur : curTime,
        duration: dur,
        season: type === 'series' || type === 'anime' ? season : undefined,
        episode: type === 'series' || type === 'anime' ? episode : undefined,
      });
    },
    [id, title, type, posterUrl, season, episode, saveProgress, onComplete]
  );

  // Resume playback handler
  const handleResume = useCallback(() => {
    if (resumePrompt && videoRef.current) {
      videoRef.current.currentTime = resumePrompt.time;
      videoRef.current.play().catch(() => {});
    }
    setResumePrompt(null);
    setHasPromptedResume(true);
  }, [resumePrompt, videoRef]);

  // Start from beginning handler
  const handleStartOver = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
    setResumePrompt(null);
    setHasPromptedResume(true);
  }, [videoRef]);

  // Save on page leave or visibility change
  useEffect(() => {
    const handleLeave = () => {
      if (videoRef.current) {
        const cur = videoRef.current.currentTime;
        const dur = videoRef.current.duration;
        if (cur > 0 && dur > 0) {
          persistProgress(cur, dur, true);
        }
      }
    };

    window.addEventListener('beforeunload', handleLeave);
    window.addEventListener('pagehide', handleLeave);

    return () => {
      handleLeave();
      window.removeEventListener('beforeunload', handleLeave);
      window.removeEventListener('pagehide', handleLeave);
    };
  }, [videoRef, persistProgress]);

  return {
    resumePrompt,
    hasPromptedResume,
    persistProgress,
    handleResume,
    handleStartOver,
    formatTime: formatPlaybackTime,
  };
}
