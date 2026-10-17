'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Settings,
  User,
  Volume2,
  VolumeX,
  Wifi,
  Zap,
  ShieldCheck,
  Film,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { useProfiles } from '@/hooks/useProfiles';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { isSoundEnabled, setSoundEnabled, playBrandSound } from '@/lib/brandSound';
import { showToast } from '@/components/Toast';

export default function AccountPage() {
  const { activeProfile } = useProfiles();
  const { manualDataSaver, setManualDataSaver, effectiveType, downlinkMbps } = useNetworkQuality();

  const [soundActive, setSoundActive] = useState<boolean>(true);
  const [defaultQuality, setDefaultQuality] = useState<string>('auto');
  const [defaultSubtitles, setDefaultSubtitles] = useState<string>('off');

  useEffect(() => {
    setSoundActive(isSoundEnabled());
    const savedQuality = localStorage.getItem('streamverse_default_quality') || 'auto';
    setDefaultQuality(savedQuality);
    const savedSubtitles = localStorage.getItem('streamverse_default_subtitles') || 'off';
    setDefaultSubtitles(savedSubtitles);
  }, []);

  const handleToggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    setSoundEnabled(next);
    if (next) {
      playBrandSound();
      showToast('Brand sonic audio enabled', 'success');
    } else {
      showToast('Brand sonic audio disabled', 'info');
    }
  };

  const handleQualityChange = (val: string) => {
    setDefaultQuality(val);
    localStorage.setItem('streamverse_default_quality', val);
    showToast(`Default streaming resolution set to ${val.toUpperCase()}`, 'info');
  };

  const handleSubtitlesChange = (val: string) => {
    setDefaultSubtitles(val);
    localStorage.setItem('streamverse_default_subtitles', val);
    showToast(`Subtitles default set to ${val}`, 'info');
  };

  return (
    <div className="max-w-4xl mx-auto pt-24 px-4 sm:px-6 md:px-8 space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-brand-500/20 text-brand-500">
            <Settings className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Account & Streaming Settings
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Customize video playback bitrate, default audio, profiles, and platform experience.
        </p>
      </div>

      {/* 1. Active Profile Summary Card */}
      <section className="p-6 rounded-3xl bg-cinema-900 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${activeProfile.avatarColor} flex items-center justify-center text-2xl shadow-lg`}
          >
            {activeProfile.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{activeProfile.name}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-brand-500/20 text-brand-400">
                Active Profile
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Personalized Watchlist, Viewing History & Recommendations
            </p>
          </div>
        </div>

        <Link
          href="/profiles"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cinema-950 border border-white/10 hover:border-white/30 text-xs sm:text-sm font-semibold text-zinc-200 transition"
        >
          <User className="w-4 h-4 text-zinc-400" />
          <span>Switch Profile</span>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </Link>
      </section>

      {/* 2. Playback & Streaming Engine Settings */}
      <section className="p-6 rounded-3xl bg-cinema-900 border border-white/10 space-y-6">
        <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs border-b border-white/10 pb-3">
          Video Playback & Engine
        </h2>

        {/* Default Quality */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">Default Video Quality</h3>
            <p className="text-xs text-zinc-400">
              Set preferred initial rendition for HLS adaptive streams.
            </p>
          </div>
          <select
            value={defaultQuality}
            onChange={(e) => handleQualityChange(e.target.value)}
            className="bg-cinema-950 border border-white/10 text-white text-xs sm:text-sm font-semibold rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="auto">Auto (Adaptive Bitrate)</option>
            <option value="1080p">1080p Full HD</option>
            <option value="720p">720p HD</option>
            <option value="480p">480p SD</option>
          </select>
        </div>

        {/* Data Saver Mode */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Anti-Buffering Data Saver</h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                {effectiveType.toUpperCase()} ({downlinkMbps} Mbps)
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Starts video at level 0 and limits max pre-buffering to save mobile data bandwidth.
            </p>
          </div>
          <button
            onClick={() => setManualDataSaver(!manualDataSaver)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 w-fit ${
              manualDataSaver
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                : 'bg-cinema-950 border border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{manualDataSaver ? 'Data Saver: ON' : 'Data Saver: OFF'}</span>
          </button>
        </div>

        {/* Subtitles Preference */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5">
          <div>
            <h3 className="text-sm font-bold text-white">Subtitles Default</h3>
            <p className="text-xs text-zinc-400">
              Automatically display closed captions and subtitles when available.
            </p>
          </div>
          <select
            value={defaultSubtitles}
            onChange={(e) => handleSubtitlesChange(e.target.value)}
            className="bg-cinema-950 border border-white/10 text-white text-xs sm:text-sm font-semibold rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="off">Off by default</option>
            <option value="en">English [CC]</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>

        {/* Brand Audio Sonic Mark */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5">
          <div>
            <h3 className="text-sm font-bold text-white">Netflix 2.0 Sonic Brand Audio</h3>
            <p className="text-xs text-zinc-400">
              Plays the synthesized Web Audio signature sound effect when launching movies.
            </p>
          </div>
          <button
            onClick={handleToggleSound}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 w-fit ${
              soundActive
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                : 'bg-cinema-950 border border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            {soundActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundActive ? 'Sound: Enabled' : 'Sound: Muted'}</span>
          </button>
        </div>
      </section>

      {/* 3. Privacy, Security & Shield */}
      <section className="p-6 rounded-3xl bg-cinema-900 border border-white/10 space-y-4">
        <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs border-b border-white/10 pb-3">
          Security & Privacy
        </h2>

        <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-300">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="font-bold text-white block">Client-Side Shield & Storage</span>
            <span className="text-zinc-400">
              Watchlist and viewing progress are stored locally on your device with zero tracking cookies or external ad scripts.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
