'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Play,
  Bookmark,
  BookmarkCheck,
  Star,
  Film,
  Tv,
  ChevronLeft,
  ChevronDown,
} from 'lucide-react';
import { getMediaDetails, getRecommendations, MediaDetails, MediaItem } from '@/lib/metadata';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { playBrandSound } from '@/lib/brandSound';
import MediaCard from '@/components/MediaCard';

export default function TitleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || '';

  const { isWatchlisted, addToWatchlist, removeFromWatchlist } = useWatchHistory();

  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [recommendations, setRecommendations] = useState<MediaItem[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadTitle() {
      if (!id) return;
      setIsLoading(true);
      try {
        // Attempt movie first, then series
        let data = await getMediaDetails('movie', id);
        if (!data || !data.title) {
          data = await getMediaDetails('series', id);
        }

        if (isMounted && data) {
          setDetails(data);
          if (data.seasons?.length) {
            setSelectedSeason(data.seasons[0]);
          }
          const recs = await getRecommendations(data.type, data.id, data.genres);
          if (isMounted) setRecommendations(recs);
        }
      } catch (err) {
        console.error('Failed to load title details:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadTitle();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-zinc-400 text-sm">Loading title details...</p>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Title Not Found</h2>
        <p className="text-zinc-400 text-sm">We couldn&apos;t locate the requested title.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  const saved = isWatchlisted(details.id);

  const handleWatchlistToggle = () => {
    if (saved) {
      removeFromWatchlist(details.id);
    } else {
      addToWatchlist({
        id: details.id,
        title: details.title,
        type: details.type,
        posterUrl: details.posterUrl,
        year: details.year,
        rating: details.rating,
      });
    }
  };

  const handlePlay = (season = 1, episode = 1) => {
    playBrandSound();
    if (details.type === 'livetv') {
      router.push(`/livetv?channel=${details.id}`);
    } else if (details.type === 'series' || details.type === 'anime') {
      router.push(`/watch/${details.type}/${details.id}?season=${season}&episode=${episode}`);
    } else {
      router.push(`/watch/${details.type}/${details.id}`);
    }
  };

  const filteredEpisodes =
    details.episodes?.filter((ep) => ep.season === selectedSeason) || [];

  return (
    <div className="space-y-10 animate-fade-in pb-16">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Hero Backdrop Showcase */}
      <section className="relative w-full rounded-3xl overflow-hidden min-h-[420px] sm:min-h-[500px] flex items-end p-6 sm:p-12 border border-white/10 shadow-2xl bg-cinema-950">
        <div className="absolute inset-0 z-0">
          <img
            src={details.backdropUrl || details.posterUrl}
            alt={details.title}
            className="w-full h-full object-cover object-top opacity-55 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-cinema-950/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-cinema-950 via-cinema-950/50 to-transparent" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-brand-500 text-white">
              {details.type}
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-black/60 backdrop-blur-md text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {details.rating || '8.0'}
            </span>
            {details.year && (
              <span className="text-xs text-zinc-300 font-medium">{details.year}</span>
            )}
            <span className="px-1.5 py-0.2 rounded border border-zinc-600 text-zinc-300 font-mono text-[10px] uppercase font-bold">
              4K ULTRA HD
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-xl">
            {details.title}
          </h1>

          <p className="text-zinc-300 text-sm sm:text-base line-clamp-3 leading-relaxed">
            {details.description}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => handlePlay(selectedSeason, 1)}
              className="flex items-center gap-2 px-7 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-sm shadow-xl shadow-black/50 transition transform hover:scale-105"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Watch Now</span>
            </button>

            <button
              onClick={handleWatchlistToggle}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-cinema-900/80 hover:bg-cinema-800 border border-white/10 text-white font-semibold text-sm backdrop-blur-md transition"
            >
              {saved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-brand-400 fill-brand-400" />
                  <span>In My List</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Add to My List</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Metadata & Episodes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Synopsis */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Storyline</h3>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              {details.description}
            </p>
          </div>

          {/* Series Episodes List */}
          {(details.type === 'series' || details.type === 'anime') && details.episodes && (
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Tv className="w-5 h-5 text-brand-500" />
                  Episodes
                </h3>

                {details.seasons && details.seasons.length > 1 && (
                  <div className="relative">
                    <select
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(Number(e.target.value))}
                      className="appearance-none bg-cinema-900 border border-white/10 text-white text-xs sm:text-sm font-semibold rounded-xl px-4 py-2 pr-8"
                    >
                      {details.seasons.map((s) => (
                        <option key={s} value={s}>
                          Season {s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {filteredEpisodes.map((ep) => (
                  <div
                    key={ep.id}
                    onClick={() => handlePlay(ep.season, ep.episode)}
                    className="group flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-cinema-900/60 hover:bg-cinema-850 border border-white/5 hover:border-brand-500/40 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                      <span className="text-base sm:text-lg font-bold text-zinc-500 group-hover:text-white w-6 shrink-0 text-center">
                        {ep.episode}
                      </span>
                      <div className="overflow-hidden">
                        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-brand-400 transition truncate">
                          {ep.title}
                        </h4>
                        {ep.overview && (
                          <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                            {ep.overview}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      className="p-2 rounded-full bg-zinc-800 text-zinc-300 group-hover:bg-brand-500 group-hover:text-white transition shrink-0 ml-3 shadow-md"
                      aria-label={`Play episode ${ep.episode}`}
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4 p-6 rounded-2xl bg-cinema-900 border border-white/10 text-xs sm:text-sm text-zinc-400 h-fit">
          {details.cast && details.cast.length > 0 && (
            <div>
              <span className="text-zinc-500 font-bold block mb-1">Starring</span>
              <p className="text-zinc-200">{details.cast.join(', ')}</p>
            </div>
          )}

          {details.directors && details.directors.length > 0 && (
            <div>
              <span className="text-zinc-500 font-bold block mb-1">Director</span>
              <p className="text-zinc-200">{details.directors.join(', ')}</p>
            </div>
          )}

          {details.genres && details.genres.length > 0 && (
            <div>
              <span className="text-zinc-500 font-bold block mb-1">Genres</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {details.genres.map((g) => (
                  <span
                    key={g}
                    className="px-2 py-0.5 rounded-full text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 font-medium"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="text-zinc-500 font-bold block mb-1">Content Audio</span>
            <p className="text-zinc-200">English (5.1 Dolby Surround, Stereo)</p>
          </div>

          <div>
            <span className="text-zinc-500 font-bold block mb-1">Subtitles</span>
            <p className="text-zinc-200">English, Spanish, French [CC]</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-white/10">
          <h3 className="text-xl font-bold text-white">More Like This</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
            {recommendations.map((rec) => (
              <MediaCard key={rec.id} item={rec} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
