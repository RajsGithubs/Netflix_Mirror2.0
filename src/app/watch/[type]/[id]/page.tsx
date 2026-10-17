'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Star,
  Clock,
  Calendar,
  Bookmark,
  BookmarkCheck,
  Share2,
  Tv,
  Film,
  Sparkles,
  Check,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import UniversalPlayer from '@/components/UniversalPlayer';
import EpisodeSelector from '@/components/EpisodeSelector';
import { getMediaDetails, MediaDetails } from '@/lib/metadata';
import { useWatchHistory } from '@/hooks/useWatchHistory';

function WatchContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = (params?.type as 'movie' | 'series' | 'anime' | 'livetv') || 'movie';
  const id = (params?.id as string) || '';

  const initialSeason = Number(searchParams.get('season')) || 1;
  const initialEpisode = Number(searchParams.get('episode')) || 1;

  const [season, setSeason] = useState<number>(initialSeason);
  const [episode, setEpisode] = useState<number>(initialEpisode);
  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const { isWatchlisted, addToWatchlist, removeFromWatchlist, getProgress } = useWatchHistory();

  // If no season/episode in searchParams, check saved watch history to resume last watched episode
  useEffect(() => {
    if (!searchParams.get('season') && !searchParams.get('episode')) {
      const saved = getProgress(id);
      if (saved && saved.season && saved.episode) {
        setSeason(saved.season);
        setEpisode(saved.episode);
      }
    }
  }, [id, searchParams, getProgress]);

  // Load details
  useEffect(() => {
    let isMounted = true;
    async function fetchDetails() {
      setIsLoading(true);
      try {
        const pathParts = typeof window !== 'undefined' ? window.location.pathname.split('/') : [];
        const effectiveType = (type || pathParts[2] || 'movie') as 'movie' | 'series' | 'anime' | 'livetv';
        const effectiveId = id || pathParts[3] || '';

        if (!effectiveId) {
          if (isMounted) setIsLoading(false);
          return;
        }

        const data = await getMediaDetails(effectiveType, effectiveId);
        if (isMounted) {
          setDetails(data);
        }
      } catch (err) {
        console.error('Error fetching media details:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchDetails();
    return () => {
      isMounted = false;
    };
  }, [type, id]);

  // Sync state if URL search params change
  useEffect(() => {
    const s = Number(searchParams.get('season'));
    const e = Number(searchParams.get('episode'));
    if (s && s !== season) setSeason(s);
    if (e && e !== episode) setEpisode(e);
  }, [searchParams]);

  const handleSelectEpisode = (newSeason: number, newEpisode: number) => {
    setSeason(newSeason);
    setEpisode(newEpisode);
    router.replace(`/watch/${type}/${id}?season=${newSeason}&episode=${newEpisode}`);
  };

  const handleNextEpisode = () => {
    if (!details?.episodes) return;
    const currentEpIndex = details.episodes.findIndex(
      (ep) => ep.season === season && ep.episode === episode
    );
    if (currentEpIndex !== -1 && currentEpIndex < details.episodes.length - 1) {
      const nextEp = details.episodes[currentEpIndex + 1];
      handleSelectEpisode(nextEp.season, nextEp.episode);
    }
  };

  const hasNextEpisode = Boolean(
    details?.episodes &&
      details.episodes.findIndex((ep) => ep.season === season && ep.episode === episode) <
        details.episodes.length - 1
  );

  const isSaved = details ? isWatchlisted(details.id) : false;

  const handleWatchlistToggle = () => {
    if (!details) return;
    if (isSaved) {
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

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Cinematic Loading State
  if (isLoading) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold animate-pulse">
          Loading Cinema Stream...
        </p>
      </div>
    );
  }

  // Media Not Found State
  if (!details) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center space-y-4 px-4 text-center">
        <h2 className="text-2xl font-bold text-white">Media Not Found</h2>
        <p className="text-sm text-zinc-400">Could not resolve metadata for this title.</p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded-full bg-[#E50914] text-white font-semibold hover:bg-red-700 transition shadow-xl"
        >
          Return to Browse
        </Link>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-[#080808] text-white flex flex-col selection:bg-red-500 selection:text-white">
      {/* 1. Dedicated Cinematic Viewport Player (Edge-to-Edge 100vw × ~90-100vh) */}
      <section
        className={`relative w-full bg-black flex items-center justify-center transition-all duration-500 ${
          isTheaterMode
            ? 'h-screen z-50'
            : 'h-[65vh] sm:h-[80vh] md:h-[88vh] lg:h-[94vh] shadow-2xl'
        }`}
      >
        <UniversalPlayer
          id={id}
          title={details.title}
          type={details.type}
          posterUrl={details.posterUrl}
          season={season}
          episode={episode}
          directStreamUrl={details.streamUrl}
          isTheaterMode={isTheaterMode}
          onToggleTheater={() => setIsTheaterMode(!isTheaterMode)}
          onNextEpisode={handleNextEpisode}
          hasNextEpisode={hasNextEpisode}
        />
      </section>

      {/* 2. Below-the-Fold Rich Movie Information & Series Episodes */}
      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-10 animate-fade-in">
        {/* Dynamic Ambient Ambilight Glow behind metadata */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[350px] -z-10 pointer-events-none overflow-hidden">
          <div
            className="w-full h-full filter blur-[120px] opacity-25 scale-125 transition-all duration-1000"
            style={{
              backgroundImage: `url(${details.backdropUrl || details.posterUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>

        {/* Episode Selector for Series & Anime */}
        {(details.type === 'series' || details.type === 'anime') && (
          <section className="w-full">
            <EpisodeSelector
              mediaId={id}
              type={details.type}
              seasons={details.seasons || [1]}
              episodes={details.episodes || []}
              currentSeason={season}
              currentEpisode={episode}
              onSelectEpisode={handleSelectEpisode}
            />
          </section>
        )}

        {/* Rich Media Metadata Card */}
        <section className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
            {/* Poster image */}
            <div className="w-32 sm:w-44 aspect-[2/3] rounded-xl overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800 shadow-xl">
              <img
                src={details.posterUrl}
                alt={details.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {details.title}
                </h1>

                {/* Action buttons (Watchlist, Share, Theater Mode) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsTheaterMode(!isTheaterMode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs sm:text-sm font-semibold text-zinc-200 transition"
                    title={isTheaterMode ? 'Exit Theater Mode' : 'Enter Theater Mode'}
                  >
                    {isTheaterMode ? (
                      <>
                        <Minimize2 className="w-4 h-4 text-[#E50914]" />
                        <span>Theater Mode</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-4 h-4" />
                        <span>Theater Mode</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleWatchlistToggle}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs sm:text-sm font-semibold text-zinc-200 transition"
                  >
                    {isSaved ? (
                      <>
                        <BookmarkCheck className="w-4 h-4 text-[#E50914] fill-[#E50914]" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4" />
                        <span>Watchlist</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs sm:text-sm font-semibold text-zinc-200 transition"
                    title="Copy link to clipboard"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Badges: Rating, Year, Runtime, Type */}
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-zinc-400">
                {details.rating && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-300" />
                    {details.rating}
                  </span>
                )}

                {details.year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {details.year}
                  </span>
                )}

                {details.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {details.duration}
                  </span>
                )}

                <span className="uppercase text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {details.type}
                </span>

                {(details.type === 'series' || details.type === 'anime') && (
                  <span className="px-2 py-0.5 rounded bg-red-950/60 text-red-300 font-mono text-xs border border-red-800/40">
                    Season {season} • Episode {episode}
                  </span>
                )}
              </div>

              {/* Genres */}
              {details.genres && details.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {details.genres.map((g) => (
                    <span
                      key={g}
                      className="px-2.5 py-0.5 rounded-full text-xs bg-zinc-800/80 text-zinc-300 border border-zinc-700/50"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Synopsis */}
              {details.description && (
                <p className="text-zinc-300 text-sm sm:text-base leading-relaxed pt-1">
                  {details.description}
                </p>
              )}

              {/* Cast & Directors */}
              {details.cast && details.cast.length > 0 && (
                <div className="pt-2 text-xs sm:text-sm text-zinc-400">
                  <span className="text-zinc-500 font-semibold">Starring: </span>
                  <span className="text-zinc-300">{details.cast.slice(0, 6).join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen bg-black flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">
            Loading Cinema Experience...
          </p>
        </div>
      }
    >
      <WatchContent />
    </Suspense>
  );
}
