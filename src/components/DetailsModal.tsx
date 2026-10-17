'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Play,
  Plus,
  Check,
  ThumbsUp,
  Volume2,
  VolumeX,
  ChevronDown,
} from 'lucide-react';
import { MediaItem, MediaDetails, getMediaDetails, getRecommendations } from '@/lib/metadata';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { playBrandSound } from '@/lib/brandSound';

interface DetailsModalProps {
  item: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectItem?: (item: MediaItem) => void;
}

export default function DetailsModal({
  item,
  isOpen,
  onClose,
  onSelectItem,
}: DetailsModalProps) {
  const router = useRouter();
  const { isWatchlisted, addToWatchlist, removeFromWatchlist } = useWatchHistory();

  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [recommendations, setRecommendations] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen || !item) {
      setDetails(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    async function loadData() {
      try {
        const [fullDetails, recs] = await Promise.all([
          getMediaDetails(item!.type, item!.id),
          getRecommendations(item!.type, item!.id, item!.genres),
        ]);

        if (isMounted) {
          setDetails(fullDetails || (item as MediaDetails));
          setRecommendations(recs);
          if (fullDetails?.seasons?.length) {
            setSelectedSeason(fullDetails.seasons[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load title details:', err);
        if (isMounted) {
          setDetails(item as MediaDetails);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    // Prevent background scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Keyboard ESC listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isMounted = false;
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, item, onClose]);

  if (!isOpen || !item) return null;

  const saved = isWatchlisted(item.id);

  const handleWatchlistToggle = () => {
    if (saved) {
      removeFromWatchlist(item.id);
    } else {
      addToWatchlist({
        id: item.id,
        title: item.title,
        type: item.type,
        posterUrl: item.posterUrl,
        year: item.year,
        rating: item.rating,
      });
    }
  };

  const handlePlay = (season = 1, episode = 1) => {
    playBrandSound();
    onClose();
    if (item.type === 'livetv') {
      router.push(`/livetv?channel=${item.id}`);
    } else if (item.type === 'series' || item.type === 'anime') {
      router.push(`/watch/${item.type}/${item.id}?season=${season}&episode=${episode}`);
    } else {
      router.push(`/watch/${item.type}/${item.id}`);
    }
  };

  const filteredEpisodes =
    details?.episodes?.filter((ep) => ep.season === selectedSeason) || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-12 px-0 sm:px-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      <div
        className="relative w-full max-w-4xl bg-[#181818] rounded-lg shadow-2xl overflow-hidden mb-12 text-[#e5e5e5] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-[#181818] hover:bg-[#282828] text-white flex items-center justify-center transition shadow-lg"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Backdrop Banner */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#242424]">
          <img
            src={details?.backdropUrl || item.backdropUrl || item.posterUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

          {/* Hero CTAs Overlay */}
          <div className="absolute bottom-8 left-8 sm:left-12 space-y-4">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-2xl">
              {item.title}
            </h1>

            <div className="flex items-center gap-3">
              {/* White Play Button */}
              <button
                onClick={() => handlePlay(selectedSeason, 1)}
                className="flex items-center gap-2.5 px-8 py-2.5 rounded bg-white hover:bg-white/75 text-black font-extrabold text-base transition shadow-xl"
              >
                <Play className="w-5 h-5 fill-black" />
                <span>Play</span>
              </button>

              {/* My List Button */}
              <button
                onClick={handleWatchlistToggle}
                className="w-11 h-11 rounded-full border-2 border-white/50 hover:border-white bg-[#2a2a2a]/60 text-white flex items-center justify-center transition"
                title={saved ? 'Remove from My List' : 'Add to My List'}
              >
                {saved ? <Check className="w-5 h-5 text-[#E50914] stroke-[3]" /> : <Plus className="w-5 h-5" />}
              </button>

              {/* Thumbs Up (Like) Button */}
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`w-11 h-11 rounded-full border-2 border-white/50 hover:border-white bg-[#2a2a2a]/60 flex items-center justify-center transition ${
                  isLiked ? 'text-[#E50914] border-[#E50914]' : 'text-white'
                }`}
                title="I like this"
              >
                <ThumbsUp className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-8 sm:px-12 py-6 space-y-8">
          {/* 2-Column Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left 2 Cols: Details & Synopsis */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3 text-sm font-bold">
                <span className="text-[#46d369]">98% Match</span>
                {details?.year && <span className="text-zinc-400 font-normal">{details.year}</span>}
                <span className="border border-white/40 px-1.5 py-0.2 text-xs text-zinc-300 font-mono">
                  {item.type === 'anime' ? '14+' : '16+'}
                </span>
                {details?.duration && (
                  <span className="text-zinc-300 font-normal">{details.duration}</span>
                )}
                <span className="border border-white/40 px-1 py-0.2 text-[10px] text-zinc-300 font-mono">
                  HD
                </span>
                <span className="border border-white/40 px-1 py-0.2 text-[10px] text-zinc-300 font-mono">
                  5.1
                </span>
              </div>

              <p className="text-white text-sm sm:text-base leading-relaxed">
                {details?.description || item.description || 'No synopsis available.'}
              </p>
            </div>

            {/* Right 1 Col: Cast & Genre Attributes */}
            <div className="space-y-3 text-xs sm:text-sm text-zinc-400">
              {details?.cast && details.cast.length > 0 && (
                <div>
                  <span className="text-[#777777]">Cast: </span>
                  <span className="text-zinc-200">{details.cast.slice(0, 4).join(', ')}</span>
                </div>
              )}

              {details?.genres && details.genres.length > 0 && (
                <div>
                  <span className="text-[#777777]">Genres: </span>
                  <span className="text-zinc-200">{details.genres.join(', ')}</span>
                </div>
              )}

              <div>
                <span className="text-[#777777]">This title is: </span>
                <span className="text-zinc-200">Suspenseful, Exciting, Mind-Bending</span>
              </div>
            </div>
          </div>

          {/* Series Episodes Section */}
          {(item.type === 'series' || item.type === 'anime') && details?.episodes && (
            <div className="space-y-4 pt-6 border-t border-[#404040]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Episodes</h3>

                {details.seasons && details.seasons.length > 1 && (
                  <div className="relative">
                    <select
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(Number(e.target.value))}
                      className="appearance-none bg-[#242424] border border-[#404040] text-white text-sm font-semibold rounded px-4 py-2 pr-8 focus:outline-none"
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

              {/* Episodes List */}
              <div className="space-y-3">
                {filteredEpisodes.map((ep) => (
                  <div
                    key={ep.id}
                    onClick={() => handlePlay(ep.season, ep.episode)}
                    className="group flex items-center justify-between p-4 rounded bg-[#181818] hover:bg-[#282828] border border-transparent hover:border-[#404040] transition cursor-pointer"
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <span className="text-xl font-bold text-zinc-500 group-hover:text-white w-6 shrink-0 text-center">
                        {ep.episode}
                      </span>
                      {ep.thumbnail ? (
                        <div className="relative aspect-video w-24 sm:w-32 rounded overflow-hidden shrink-0 bg-[#242424]">
                          <img
                            src={ep.thumbnail}
                            alt={ep.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video w-24 sm:w-32 rounded bg-[#242424] flex items-center justify-center shrink-0" />
                      )}
                      <div className="overflow-hidden">
                        <h4 className="text-sm font-bold text-white group-hover:text-[#E50914] transition truncate">
                          {ep.title}
                        </h4>
                        {ep.overview && (
                          <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                            {ep.overview}
                          </p>
                        )}
                      </div>
                    </div>

                    <Play className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition shrink-0 ml-4 fill-white" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* More Like This (3-Column Grid) */}
          {recommendations.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-[#404040]">
              <h3 className="text-xl font-bold text-white">More Like This</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => {
                      if (onSelectItem) {
                        onSelectItem(rec);
                      } else {
                        onClose();
                        router.push(`/watch/${rec.type}/${rec.id}`);
                      }
                    }}
                    className="group rounded bg-[#2f2f2f] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-[#242424]">
                      <img
                        src={rec.backdropUrl || rec.posterUrl}
                        alt={rec.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                    <div className="p-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-[#46d369]">96% Match</span>
                        <span className="border border-white/40 px-1 py-0.2 text-[10px] text-zinc-300">
                          {rec.type === 'anime' ? '14+' : '16+'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white truncate">{rec.title}</h4>
                      <p className="text-xs text-zinc-400 line-clamp-2">
                        {rec.description || 'Watch now on Flix Movie in full high definition.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* About Title Section */}
          <div className="space-y-2 pt-6 border-t border-[#404040] text-xs text-zinc-400">
            <h4 className="text-sm font-bold text-white">About {item.title}</h4>
            {details?.directors && (
              <p><span className="text-[#777777]">Director: </span>{details.directors.join(', ')}</p>
            )}
            {details?.cast && (
              <p><span className="text-[#777777]">Cast: </span>{details.cast.join(', ')}</p>
            )}
            <p><span className="text-[#777777]">Maturity Rating: </span>Rated 16+ for violence, language, and mature themes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
