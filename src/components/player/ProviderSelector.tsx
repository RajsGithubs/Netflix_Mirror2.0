'use client';

import React, { useEffect, useRef } from 'react';
import { Server, ChevronDown, Check, Zap } from 'lucide-react';
import { STREAMING_SERVERS } from '@/lib/providers';

export interface ProviderSelectorProps {
  activeServerId: string;
  onSelectServer: (serverId: string) => void;
  directStreamUrl?: string;
  isLocalBackendActive?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export default function ProviderSelector({
  activeServerId,
  onSelectServer,
  directStreamUrl,
  isLocalBackendActive = false,
  isOpen,
  onToggle,
  onClose,
}: ProviderSelectorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

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
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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

  // Compute active server display name
  const activeServer = STREAMING_SERVERS.find((s) => s.id === activeServerId);
  const activeServerName =
    activeServerId === 'local-moviebox'
      ? 'MovieBox Next (Direct HLS)'
      : activeServerId === 'direct'
      ? 'Direct Native Stream'
      : activeServer?.name || 'VidLink Pro (4K/1080p Fast)';

  return (
    <div ref={containerRef} className="relative shrink-0">
      {/* Trigger Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 hover:border-white/30 text-xs text-zinc-200 transition shadow-sm backdrop-blur-md font-medium group focus:outline-none"
        title={activeServerName}
        aria-label="Select streaming provider"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Server className="w-3.5 h-3.5 text-[#E50914] shrink-0" />
        <span className="font-semibold text-[11px] sm:text-xs tracking-tight line-clamp-1">
          <span className="hidden sm:inline">{activeServerName}</span>
          <span className="sm:hidden">{activeServerName.split(' ')[0]}</span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 bottom-full mb-2 w-72 sm:w-80 max-h-[380px] overflow-y-auto scrollbar-thin rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-2xl p-2 z-50 flex flex-col gap-1 backdrop-blur-2xl text-white select-none animate-fade-in"
          role="listbox"
          aria-label="Available streaming providers"
        >
          {/* Header */}
          <div className="px-2.5 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between border-b border-zinc-800/80 mb-0.5">
            <span>Streaming Servers</span>
            {isLocalBackendActive && (
              <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                127.0.0.1:8080 Active
              </span>
            )}
          </div>

          {/* Direct Stream Option if available */}
          {directStreamUrl && (
            <button
              onClick={() => {
                onSelectServer('direct');
                onClose();
              }}
              className={`w-full text-left p-2.5 rounded-xl transition flex flex-col ${
                activeServerId === 'direct'
                  ? 'bg-[#E50914]/20 text-red-200 border border-[#E50914]/50'
                  : 'hover:bg-zinc-800/80 text-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  Direct Authorized Media Stream
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono uppercase bg-emerald-500/20 text-emerald-400 font-bold">
                  DIRECT
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                Ultra-fast HLS/DASH direct player
              </span>
            </button>
          )}

          {/* Local MovieBox Next Option if active */}
          {isLocalBackendActive && (
            <button
              onClick={() => {
                onSelectServer('local-moviebox');
                onClose();
              }}
              className={`w-full text-left p-2.5 rounded-xl transition flex flex-col ${
                activeServerId === 'local-moviebox'
                  ? 'bg-[#E50914]/20 text-red-200 border border-[#E50914]/50'
                  : 'hover:bg-zinc-800/80 text-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  MovieBox Next Local Stream
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono uppercase bg-emerald-500/20 text-emerald-400 font-bold">
                  100% DIRECT
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                Ad-free native proxy stream from 127.0.0.1:8080
              </span>
            </button>
          )}

          {/* Standard Streaming Servers */}
          {STREAMING_SERVERS.map((server) => {
            const isSelected = server.id === activeServerId;
            return (
              <button
                key={server.id}
                onClick={() => {
                  onSelectServer(server.id);
                  onClose();
                }}
                className={`w-full text-left p-2.5 rounded-xl transition flex flex-col ${
                  isSelected
                    ? 'bg-[#E50914]/20 text-red-200 border border-[#E50914]/50 shadow-sm'
                    : 'hover:bg-zinc-800/80 text-zinc-300'
                }`}
                role="option"
                aria-selected={isSelected}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs flex items-center gap-1.5">
                    {server.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {!server.supportsSandbox && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700 font-mono">
                        AUTO-UNSHIELD
                      </span>
                    )}
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-bold ${
                        server.tag === 'primary'
                          ? 'bg-red-500/20 text-[#E50914]'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {server.tag}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#E50914]" />}
                  </div>
                </div>
                <span className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                  {server.description}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
