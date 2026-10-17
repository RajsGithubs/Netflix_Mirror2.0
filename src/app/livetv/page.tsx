'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Radio,
  Tv,
  Globe,
  Play,
  Signal,
  CheckCircle2,
  Filter,
  Sparkles,
} from 'lucide-react';
import UniversalPlayer from '@/components/UniversalPlayer';
import { CURATED_LIVE_CHANNELS, LiveChannel } from '@/lib/metadata';

function LiveTvHubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const channelParam = searchParams.get('channel');
  const [selectedChannel, setSelectedChannel] = useState<LiveChannel>(
    CURATED_LIVE_CHANNELS.find((c) => c.id === channelParam) || CURATED_LIVE_CHANNELS[0]
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Sync state if URL query param changes
  useEffect(() => {
    if (channelParam) {
      const match = CURATED_LIVE_CHANNELS.find((c) => c.id === channelParam);
      if (match) setSelectedChannel(match);
    }
  }, [channelParam]);

  const categories = ['All', 'News', 'Sports', 'Entertainment', 'Music', 'Documentary'];

  const filteredChannels =
    selectedCategory === 'All'
      ? CURATED_LIVE_CHANNELS
      : CURATED_LIVE_CHANNELS.filter((ch) => ch.category === selectedCategory);

  const handleSelectChannel = (channel: LiveChannel) => {
    setSelectedChannel(channel);
    router.replace(`/livetv?channel=${channel.id}`);
  };

  return (
    <div className="px-4 sm:px-12 md:px-16 pt-24 space-y-8 animate-fade-in pb-16">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Live TV Broadcast Hub
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            24/7 direct public HLS `.m3u8` television streams with zero advertisements and low-latency adaptive buffering.
          </p>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-semibold w-fit">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>{CURATED_LIVE_CHANNELS.length} Global Channels Online</span>
        </div>
      </div>

      {/* 2. Active Live TV Player */}
      <section className="space-y-4">
        <UniversalPlayer
          id={selectedChannel.id}
          title={selectedChannel.name}
          type="livetv"
          posterUrl={selectedChannel.logo}
          directStreamUrl={selectedChannel.streamUrl}
        />

        {/* Channel Details Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 p-2 flex items-center justify-center shrink-0">
              <img
                src={selectedChannel.logo}
                alt={selectedChannel.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{selectedChannel.name}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold uppercase">
                  LIVE HLS
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">{selectedChannel.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300">
              {selectedChannel.category}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              {selectedChannel.country}
            </span>
          </div>
        </div>
      </section>

      {/* 3. Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-800">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                isActive
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 4. Channels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredChannels.map((channel) => {
          const isCurrent = channel.id === selectedChannel.id;
          return (
            <button
              key={channel.id}
              onClick={() => handleSelectChannel(channel)}
              className={`group flex items-center gap-3.5 p-3.5 rounded-2xl border text-left transition-all ${
                isCurrent
                  ? 'bg-rose-950/30 border-rose-500/60 shadow-lg shadow-rose-950/40'
                  : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="w-14 h-14 rounded-xl bg-zinc-950 border border-zinc-800 p-2 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <img
                  src={channel.logo}
                  alt={channel.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="font-bold text-sm text-zinc-100 group-hover:text-rose-400 transition truncate">
                    {channel.name}
                  </h3>
                  {isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  )}
                </div>

                <p className="text-xs text-zinc-400 truncate mt-0.5">
                  {channel.description}
                </p>

                <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-1">
                  <span className="text-zinc-400 font-medium">{channel.category}</span>
                  <span>•</span>
                  <span>{channel.country}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function LiveTvHubPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LiveTvHubContent />
    </Suspense>
  );
}
