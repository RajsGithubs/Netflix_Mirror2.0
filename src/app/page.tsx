'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Billboard from '@/components/Billboard';
import MovieRow from '@/components/MovieRow';
import Top10Row from '@/components/Top10Row';
import ContinueWatchingRow from '@/components/ContinueWatchingRow';
import DetailsModal from '@/components/DetailsModal';
import SkeletonMovieRow from '@/components/SkeletonMovieRow';
import {
  getTrendingMovies,
  getTrendingSeries,
  getTopAnime,
  getLiveTvChannels,
  getTop10Movies,
  getTop10Series,
  getTitlesByGenre,
  MediaItem,
  FALLBACK_TRENDING_MOVIES,
} from '@/lib/metadata';

function HomeContent() {
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [series, setSeries] = useState<MediaItem[]>([]);
  const [anime, setAnime] = useState<MediaItem[]>([]);
  const [liveChannels, setLiveChannels] = useState<MediaItem[]>([]);
  const [top10Movies, setTop10Movies] = useState<MediaItem[]>([]);
  const [top10Series, setTop10Series] = useState<MediaItem[]>([]);
  const [actionTitles, setActionTitles] = useState<MediaItem[]>([]);
  const [sciFiTitles, setSciFiTitles] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected title for the DetailsModal
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      setIsLoading(true);
      try {
        const [
          mov,
          ser,
          ani,
          live,
          t10m,
          t10s,
          action,
          scifi,
        ] = await Promise.all([
          getTrendingMovies(),
          getTrendingSeries(),
          getTopAnime(),
          getLiveTvChannels(),
          getTop10Movies(),
          getTop10Series(),
          getTitlesByGenre('action'),
          getTitlesByGenre('sci-fi'),
        ]);

        if (isMounted) {
          setMovies(mov);
          setSeries(ser);
          setAnime(ani);
          setLiveChannels(live);
          setTop10Movies(t10m);
          setTop10Series(t10s);
          setActionTitles(action);
          setSciFiTitles(scifi);
        }
      } catch (err) {
        console.error('Failed to load catalog data:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenDetails = (item: MediaItem) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  const billboardItems = movies.length > 0 ? [...movies.slice(0, 3), ...series.slice(0, 2)] : FALLBACK_TRENDING_MOVIES;

  return (
    <div className="w-full space-y-4 md:space-y-6 animate-fade-in -mt-16 sm:-mt-20">
      {/* 1. Full-Bleed Netflix Hero Billboard */}
      <Billboard
        items={billboardItems}
        onOpenDetails={handleOpenDetails}
      />

      {/* 2. Netflix Row Stack (Starts right at the bottom fade of the Billboard) */}
      <div className="relative z-20 space-y-4 sm:space-y-8 -mt-12 sm:-mt-20 md:-mt-28">
        {/* Continue Watching Row */}
        <ContinueWatchingRow />

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="space-y-8 px-4 sm:px-12 md:px-16">
            <SkeletonMovieRow title="Top 10 Movies Today" count={6} />
            <SkeletonMovieRow title="Trending Now" count={6} />
            <SkeletonMovieRow title="Top 10 TV Shows Today" count={6} />
          </div>
        ) : (
          <>
            {/* Top 10 Movies Today */}
            {top10Movies.length > 0 && (
              <Top10Row
                title="Top 10 Movies Today"
                items={top10Movies}
                onOpenDetails={handleOpenDetails}
                type="movie"
              />
            )}

            {/* Trending Now */}
            <MovieRow
              title="Trending Now"
              items={movies}
              viewAllHref="/movies"
              onOpenDetails={handleOpenDetails}
            />

            {/* Top 10 TV Shows Today */}
            {top10Series.length > 0 && (
              <Top10Row
                title="Top 10 TV Shows Today"
                items={top10Series}
                onOpenDetails={handleOpenDetails}
                type="series"
              />
            )}

            {/* Popular on Flix Movie */}
            <MovieRow
              title="Popular on Flix Movie"
              items={series}
              viewAllHref="/series"
              onOpenDetails={handleOpenDetails}
            />

            {/* Blockbuster Action Movies */}
            {actionTitles.length > 0 && (
              <MovieRow
                title="Action Packed Blockbusters"
                items={actionTitles}
                viewAllHref="/genre/action"
                onOpenDetails={handleOpenDetails}
              />
            )}

            {/* Sci-Fi & Cyberpunk Hits */}
            {sciFiTitles.length > 0 && (
              <MovieRow
                title="Sci-Fi & Cyberpunk Hits"
                items={sciFiTitles}
                viewAllHref="/genre/sci-fi"
                onOpenDetails={handleOpenDetails}
              />
            )}

            {/* Top Rated Anime */}
            <MovieRow
              title="Top Rated Anime Sagas"
              items={anime}
              viewAllHref="/genre/animation"
              onOpenDetails={handleOpenDetails}
            />

            {/* 24/7 Global Live TV Channels */}
            <MovieRow
              title="24/7 Global Live TV Broadcasts"
              items={liveChannels}
              viewAllHref="/livetv"
              onOpenDetails={handleOpenDetails}
            />
          </>
        )}
      </div>

      {/* Global Interactive Title Details Modal */}
      <DetailsModal
        item={selectedItem}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onSelectItem={(item) => setSelectedItem(item)}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-400 text-sm">Loading Flix Movie...</p>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
