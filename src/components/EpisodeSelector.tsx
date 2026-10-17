'use client';

import React, { useState, useMemo } from 'react';
import { Play, Check, Search, Tv, Sparkles, Filter } from 'lucide-react';
import { Episode } from '@/lib/metadata';
import { useWatchHistory } from '@/hooks/useWatchHistory';

interface EpisodeSelectorProps {
  mediaId: string;
  type: 'series' | 'anime';
  seasons?: number[];
  episodes?: Episode[];
  currentSeason: number;
  currentEpisode: number;
  onSelectEpisode: (season: number, episode: number) => void;
}

export default function EpisodeSelector({
  mediaId,
  type,
  seasons = [1],
  episodes = [],
  currentSeason,
  currentEpisode,
  onSelectEpisode,
}: EpisodeSelectorProps) {
  const [selectedSeason, setSelectedSeason] = useState<number>(currentSeason);
  const [filterQuery, setFilterQuery] = useState<string>('');
  const { getProgress } = useWatchHistory();

  // Filter episodes belonging to the selected season
  const seasonEpisodes = useMemo(() => {
    const list = episodes.filter((ep) => ep.season === selectedSeason);
    // If no episodes explicitly matched this season but we have episodes, show all or synthetic
    if (list.length === 0 && episodes.length > 0) {
      return episodes;
    }
    return list;
  }, [episodes, selectedSeason]);

  // Apply search query filter
  const filteredEpisodes = useMemo(() => {
    if (!filterQuery.trim()) return seasonEpisodes;
    const q = filterQuery.toLowerCase();
    return seasonEpisodes.filter(
      (ep) =>
        ep.title.toLowerCase().includes(q) ||
        String(ep.episode).includes(q) ||
        (ep.overview && ep.overview.toLowerCase().includes(q))
    );
  }, [seasonEpisodes, filterQuery]);

  return (
    <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-xl space-y-4">
      {/* Top Header & Season Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {type === 'anime' ? (
            <Sparkles className="w-5 h-5 text-purple-400" />
          ) : (
            <Tv className="w-5 h-5 text-emerald-400" />
          )}
          <h3 className="font-bold text-base sm:text-lg text-white">Episodes</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
            {seasonEpisodes.length} eps
          </span>
        </div>

        {/* Season Dropdown & Search Filter */}
        <div className="flex items-center gap-2">
          {seasons.length > 1 && (
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(Number(e.target.value))}
              className="bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-medium focus:outline-none focus:border-indigo-500"
            >
              {seasons.map((s) => (
                <option key={s} value={s}>
                  Season {s}
                </option>
              ))}
            </select>
          )}

          {/* Quick Search inside episodes */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter eps..."
              className="w-28 sm:w-36 bg-zinc-800 border border-zinc-700/80 rounded-xl pl-8 pr-2 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Grid of Episodes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredEpisodes.map((ep) => {
          const isActive = ep.season === currentSeason && ep.episode === currentEpisode;
          const progress = getProgress(mediaId, ep.season, ep.episode);
          const isWatched = progress && progress.percentage > 85;

          return (
            <button
              key={`${ep.season}-${ep.episode}`}
              onClick={() => onSelectEpisode(ep.season, ep.episode)}
              className={`group relative flex flex-col p-2.5 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-indigo-600/25 border-indigo-500 shadow-md shadow-indigo-600/20 text-white'
                  : 'bg-zinc-800/40 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span
                  className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-indigo-500 text-white'
                      : 'bg-zinc-800 text-zinc-400 group-hover:text-zinc-200'
                  }`}
                >
                  E{ep.episode}
                </span>

                {isWatched ? (
                  <span title="Watched">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </span>
                ) : progress && progress.percentage > 0 ? (
                  <span className="text-[10px] text-indigo-400 font-mono">
                    {progress.percentage}%
                  </span>
                ) : null}
              </div>

              <span
                className={`text-xs font-medium line-clamp-1 ${
                  isActive ? 'text-indigo-200 font-semibold' : 'text-zinc-200'
                }`}
                title={ep.title}
              >
                {ep.title}
              </span>

              {ep.overview && (
                <span className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">
                  {ep.overview}
                </span>
              )}

              {/* Watched Progress Line */}
              {progress && progress.percentage > 0 && !isWatched && (
                <div className="absolute bottom-0 inset-x-2 h-0.5 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
