'use client';

import React, { useEffect, useRef } from 'react';
import { ShieldCheck, ShieldAlert, Activity, Info, X } from 'lucide-react';

export interface PlayerMoreMenuProps {
  isOpen: boolean;
  onClose: () => void;
  shieldEnabled: boolean;
  onToggleShield: () => void;
  onOpenCodecModal: () => void;
  onOpenPlaybackInfo: () => void;
}

export default function PlayerMoreMenu({
  isOpen,
  onClose,
  shieldEnabled,
  onToggleShield,
  onOpenCodecModal,
  onOpenPlaybackInfo,
}: PlayerMoreMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      onClick={(e) => e.stopPropagation()}
      className="absolute right-0 bottom-full mb-3 w-64 rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-2xl p-2.5 z-50 flex flex-col gap-1 backdrop-blur-2xl text-white select-none animate-fade-in"
      role="menu"
      aria-label="More options"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 px-2 py-1.5 mb-1">
        <span className="font-semibold text-xs tracking-wider uppercase text-zinc-400">
          More
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          aria-label="Close menu"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 1. Shield Toggle */}
      <button
        onClick={() => {
          onToggleShield();
        }}
        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition text-xs font-medium ${
          shieldEnabled
            ? 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/70 border border-emerald-800/40'
            : 'hover:bg-zinc-850 hover:bg-zinc-800/80 text-zinc-200'
        }`}
        role="menuitem"
        title="Toggle Redirect Shield Protection"
      >
        <div className="flex items-center gap-2.5">
          {shieldEnabled ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>{shieldEnabled ? 'Shield: ON' : 'Shield: OFF'}</span>
        </div>
        <span
          className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
            shieldEnabled
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-zinc-800 text-zinc-400'
          }`}
        >
          {shieldEnabled ? 'Active' : 'Bypass'}
        </span>
      </button>

      {/* 2. Codec Diagnostics */}
      <button
        onClick={() => {
          onClose();
          onOpenCodecModal();
        }}
        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/80 text-zinc-200 transition text-xs font-medium"
        role="menuitem"
      >
        <div className="flex items-center gap-2.5">
          <Activity className="w-4 h-4 text-zinc-400 shrink-0" />
          <span>Codec Diagnostics</span>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">Inspect</span>
      </button>

      {/* 3. Playback Info */}
      <button
        onClick={() => {
          onClose();
          onOpenPlaybackInfo();
        }}
        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/80 text-zinc-200 transition text-xs font-medium"
        role="menuitem"
      >
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-zinc-400 shrink-0" />
          <span>Playback Info</span>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">Stream</span>
      </button>
    </div>
  );
}
