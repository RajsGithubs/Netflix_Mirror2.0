'use client';

import { useState, useEffect, useCallback } from 'react';
import { showToast } from '@/components/Toast';

export interface WatchProgressItem {
  id: string; // IMDb ID, Jikan MAL ID, or channel ID
  title: string;
  type: 'movie' | 'series' | 'anime' | 'livetv';
  posterUrl: string;
  currentTime: number;
  duration: number;
  percentage: number;
  season?: number;
  episode?: number;
  updatedAt: number;
}

export interface WatchlistItem {
  id: string;
  title: string;
  type: 'movie' | 'series' | 'anime' | 'livetv';
  posterUrl: string;
  year?: string;
  rating?: number | string;
  addedAt: number;
}

const HISTORY_KEY = 'streamverse_watch_history';
const WATCHLIST_KEY = 'streamverse_watchlist';

export function useWatchHistory() {
  const [history, setHistory] = useState<WatchProgressItem[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedHistory = localStorage.getItem(HISTORY_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }

      const savedWatchlist = localStorage.getItem(WATCHLIST_KEY);
      if (savedWatchlist) {
        setWatchlist(JSON.parse(savedWatchlist));
      }
    } catch (e) {
      console.warn('Failed to parse StreamVerse local storage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save history to localStorage
  const saveProgress = useCallback((item: Omit<WatchProgressItem, 'updatedAt' | 'percentage'> & { currentTime: number; duration: number }) => {
    if (typeof window === 'undefined') return;

    const duration = item.duration > 0 ? item.duration : 1;
    const percentage = Math.min(100, Math.max(0, Math.round((item.currentTime / duration) * 100)));

    const newItem: WatchProgressItem = {
      ...item,
      percentage,
      updatedAt: Date.now(),
    };

    setHistory((prev) => {
      // Find matching item (for series/anime, match both id + season + episode if specified)
      const filtered = prev.filter((h) => {
        if (h.id !== item.id) return true;
        if (item.type === 'series' || item.type === 'anime') {
          return !(h.season === item.season && h.episode === item.episode);
        }
        return false;
      });

      const updated = [newItem, ...filtered].slice(0, 30); // Keep max 30 items
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save watch history:', e);
      }
      return updated;
    });
  }, []);

  const removeProgress = useCallback((id: string, season?: number, episode?: number) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => {
        if (item.id !== id) return true;
        if (season !== undefined && episode !== undefined) {
          return !(item.season === season && item.episode === episode);
        }
        return false;
      });
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to remove item from history:', e);
      }
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      console.warn('Failed to clear history:', e);
    }
  }, []);

  const getProgress = useCallback((id: string, season?: number, episode?: number): WatchProgressItem | undefined => {
    return history.find((item) => {
      if (item.id !== id) return false;
      if (season !== undefined && episode !== undefined) {
        return item.season === season && item.episode === episode;
      }
      return true;
    });
  }, [history]);

  // Watchlist operations
  const addToWatchlist = useCallback((item: Omit<WatchlistItem, 'addedAt'>) => {
    const newItem: WatchlistItem = {
      ...item,
      addedAt: Date.now(),
    };

    setWatchlist((prev) => {
      if (prev.some((w) => w.id === item.id)) return prev;
      const updated = [newItem, ...prev];
      try {
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to add to watchlist:', e);
      }
      return updated;
    });
    showToast(`Added "${item.title}" to My List`, 'watchlist');
  }, []);

  const removeFromWatchlist = useCallback((id: string) => {
    setWatchlist((prev) => {
      const target = prev.find((w) => w.id === id);
      const updated = prev.filter((w) => w.id !== id);
      try {
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to remove from watchlist:', e);
      }
      if (target) {
        showToast(`Removed "${target.title}" from My List`, 'info');
      }
      return updated;
    });
  }, []);

  const isWatchlisted = useCallback((id: string): boolean => {
    return watchlist.some((w) => w.id === id);
  }, [watchlist]);

  return {
    history,
    watchlist,
    isLoaded,
    saveProgress,
    removeProgress,
    clearHistory,
    getProgress,
    addToWatchlist,
    removeFromWatchlist,
    isWatchlisted,
  };
}
