'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  RefreshCw,
  AlertTriangle,
  Activity,
  Server,
  MoreVertical,
  Maximize,
  Minimize,
} from 'lucide-react';
import { STREAM_SERVERS, STREAMING_SERVERS, buildServerEmbedUrl } from '@/lib/providers';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { showToast } from '@/components/Toast';
import VideoPlayer from './player/VideoPlayer';
import CodecDiagnosticsModal from './player/CodecDiagnosticsModal';
import PlaybackInfoModal from './player/PlaybackInfoModal';
import PlayerMoreMenu from './player/PlayerMoreMenu';
import ProviderSelector from './player/ProviderSelector';

export interface UniversalPlayerProps {
  id: string; // IMDb ID, MAL ID, or channel ID
  title: string;
  type: 'movie' | 'series' | 'anime' | 'livetv';
  posterUrl: string;
  season?: number;
  episode?: number;
  directStreamUrl?: string;
  isTheaterMode?: boolean;
  onToggleTheater?: () => void;
  onNextEpisode?: () => void;
  hasNextEpisode?: boolean;
}

export default function UniversalPlayer({
  id,
  title,
  type,
  posterUrl,
  season = 1,
  episode = 1,
  directStreamUrl,
  isTheaterMode = false,
  onToggleTheater,
  onNextEpisode,
  hasNextEpisode = false,
}: UniversalPlayerProps) {
  const { isLowNetwork } = useNetworkQuality();
  const { saveProgress } = useWatchHistory();

  // Local MovieBox Next backend state (100% ad-free direct proxy streams)
  const [localBackendStream, setLocalBackendStream] = useState<string | null>(null);
  const [isLocalBackendActive, setIsLocalBackendActive] = useState<boolean>(false);

  // Active server state: default to 'direct' if directStreamUrl provided, otherwise 'vidlink'
  const [activeServerId, setActiveServerId] = useState<string>(
    directStreamUrl ? 'direct' : 'vidlink'
  );

  // Shield state for sandbox isolation
  const [shieldEnabled, setShieldEnabled] = useState<boolean>(() => {
    if (directStreamUrl) return true;
    return STREAM_SERVERS[0]?.supportsSandbox ?? false;
  });

  const [showCodecModal, setShowCodecModal] = useState<boolean>(false);
  const [showPlaybackInfo, setShowPlaybackInfo] = useState<boolean>(false);
  const [showIframeMoreMenu, setShowIframeMoreMenu] = useState<boolean>(false);
  const [showIframeProviderMenu, setShowIframeProviderMenu] = useState<boolean>(false);
  const [showIframeControls, setShowIframeControls] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const iframeControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 12-Second Stall Watchdog for fallback embed iframes
  const [isStalled, setIsStalled] = useState<boolean>(false);
  const [stallCountdown, setStallCountdown] = useState<number>(12);
  const stallTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Probe local MovieBox Next backend (http://127.0.0.1:8080/api/play)
  useEffect(() => {
    let isCancelled = false;

    async function probeLocalMovieBox() {
      if (type === 'livetv' || directStreamUrl) return;

      const isLocalBackendAllowed =
        typeof window !== 'undefined' &&
        (localStorage.getItem('streamverse_local_backend') === 'true' ||
          process.env.NEXT_PUBLIC_ENABLE_LOCAL_BACKEND === 'true');

      if (!isLocalBackendAllowed) return;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);

        const res = await fetch('http://127.0.0.1:8080/api/play', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: 'moviebox',
            media_id: id,
            title: title,
            player: 'web',
            season: type === 'series' || type === 'anime' ? season : null,
            episode: type === 'series' || type === 'anime' ? episode : null,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!isCancelled && res.ok) {
          const data = await res.json();
          const proxyUrl = data.stream_url || data.transcode_url;
          if (proxyUrl) {
            const fullUrl = proxyUrl.startsWith('http')
              ? proxyUrl
              : `http://127.0.0.1:8080${proxyUrl}`;
            setLocalBackendStream(fullUrl);
            setIsLocalBackendActive(true);
            setActiveServerId('local-moviebox');
            setShieldEnabled(true);
          }
        }
      } catch {
        if (!isCancelled) {
          setIsLocalBackendActive(false);
          setLocalBackendStream(null);
        }
      }
    }

    probeLocalMovieBox();
    return () => {
      isCancelled = true;
    };
  }, [id, type, season, episode, title, directStreamUrl]);

  // Determine if direct video stream is active
  const effectiveDirectStream =
    activeServerId === 'local-moviebox'
      ? localBackendStream
      : directStreamUrl || (activeServerId === 'direct' ? directStreamUrl : null);

  const isDirectPlayback = Boolean(
    effectiveDirectStream ||
    activeServerId === 'direct' ||
    activeServerId === 'local-moviebox'
  );

  // Compute fallback embed URL
  const embedUrl = useMemo(() => {
    if (isDirectPlayback && effectiveDirectStream) return effectiveDirectStream;
    return buildServerEmbedUrl(activeServerId, {
      id,
      type,
      season,
      episode,
      directUrl: effectiveDirectStream || undefined,
    });
  }, [activeServerId, id, type, season, episode, isDirectPlayback, effectiveDirectStream]);

  // Active Provider Display Name
  const activeServer = STREAM_SERVERS.find((s) => s.id === activeServerId);
  const providerDisplayName =
    activeServerId === 'local-moviebox'
      ? 'MovieBox Next (Direct HLS)'
      : isDirectPlayback && !directStreamUrl
      ? 'VidLink Pro (4K/1080p Fast)'
      : activeServer?.name || 'VidLink Pro (4K/1080p Fast)';

  // Telemetry: Listen for VidLink and Peachify postMessage events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;

      if (event.data.type === 'PLAYER_EVENT') {
        const { event: playerEvent, currentTime: curTime, duration: dur } = event.data;
        if (typeof curTime === 'number' && typeof dur === 'number' && dur > 0) {
          saveProgress({
            id,
            title,
            type,
            posterUrl,
            currentTime: curTime,
            duration: dur,
            season: type === 'series' || type === 'anime' ? season : undefined,
            episode: type === 'series' || type === 'anime' ? episode : undefined,
          });
        }
        if (playerEvent === 'ended' && hasNextEpisode && onNextEpisode) {
          onNextEpisode();
        }
      }

      if (event.data.type === 'MEDIA_DATA') {
        const media = event.data.data || event.data;
        const curTime = typeof media?.currentTime === 'number' ? media.currentTime : undefined;
        const dur = typeof media?.duration === 'number' ? media.duration : undefined;
        if (typeof curTime === 'number' && typeof dur === 'number' && dur > 0) {
          saveProgress({
            id,
            title,
            type,
            posterUrl,
            currentTime: curTime,
            duration: dur,
            season: type === 'series' || type === 'anime' ? season : undefined,
            episode: type === 'series' || type === 'anime' ? episode : undefined,
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [id, title, type, posterUrl, season, episode, saveProgress, hasNextEpisode, onNextEpisode]);

  // Redirect Shielding without sandbox: intercept any attempted top-level redirects
  useEffect(() => {
    if (isDirectPlayback || shieldEnabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'StreamVerse has protected your tab from an external redirect.';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirectPlayback, shieldEnabled]);

  // Auto-hide controls for iframe mode
  const triggerIframeActivity = useCallback(() => {
    setShowIframeControls(true);
    if (iframeControlsTimerRef.current) clearTimeout(iframeControlsTimerRef.current);
    iframeControlsTimerRef.current = setTimeout(() => {
      setShowIframeControls(false);
    }, 2800);
  }, []);

  // Stall Watchdog reset & trigger for iframes
  const resetStallWatchdog = useCallback(() => {
    setIsStalled(false);
    if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  }, []);

  const startStallWatchdog = useCallback(() => {
    resetStallWatchdog();
    stallTimerRef.current = setTimeout(() => {
      setIsStalled(true);
      setStallCountdown(8);
      countdownIntervalRef.current = setInterval(() => {
        setStallCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current!);
            const currentIndex = STREAMING_SERVERS.findIndex((s) => s.id === activeServerId);
            const nextServer = STREAMING_SERVERS[(currentIndex + 1) % STREAMING_SERVERS.length];
            handleServerChange(nextServer.id);
            setIsStalled(false);
            return 8;
          }
          return prev - 1;
        });
      }, 1000);
    }, 12000);
  }, [activeServerId, resetStallWatchdog]);

  const handleServerChange = (serverId: string) => {
    setActiveServerId(serverId);
    resetStallWatchdog();

    if (serverId === 'local-moviebox' || serverId === 'direct') {
      setShieldEnabled(true);
    } else {
      const s = STREAM_SERVERS.find((srv) => srv.id === serverId);
      if (s) {
        setShieldEnabled(s.supportsSandbox);
      }
    }

    setIframeKey((k) => k + 1);
  };

  const handleRefreshStream = useCallback(() => {
    setIsRefreshing(true);
    setIframeKey((k) => k + 1);
    resetStallWatchdog();
    showToast('Revalidating stream pipeline...', 'info');
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, [resetStallWatchdog]);

  const handleToggleShield = useCallback(() => {
    setShieldEnabled((prev) => {
      const next = !prev;
      showToast(next ? 'Redirect Shield: ON' : 'Shield: OFF (Sandbox bypassed)', 'info');
      return next;
    });
    setIframeKey((k) => k + 1);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Developer debug shortcut (Ctrl+Shift+D or ?debug=1)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.location.search.includes('debug=1') || window.location.search.includes('debug=true')) {
        setShowCodecModal(true);
      }
    }

    const handleDebugKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setShowCodecModal((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleDebugKey);
    return () => window.removeEventListener('keydown', handleDebugKey);
  }, []);

  const isIframeFooterVisible =
    showIframeControls || showIframeMoreMenu || showIframeProviderMenu;

  return (
    <div
      ref={containerRef}
      onMouseMove={triggerIframeActivity}
      onClick={triggerIframeActivity}
      className={`relative w-full h-full bg-black overflow-hidden flex flex-col group select-none ${
        isTheaterMode ? 'w-full shadow-2xl' : 'w-full'
      }`}
    >
      {/* 1. Main Media Area */}
      <div className="relative w-full h-full min-h-[50vh] sm:min-h-[70vh] lg:min-h-[85vh] xl:min-h-[90vh] bg-black flex items-center justify-center overflow-hidden">
        {/* Subtle Stall Watchdog Notification for Fallback Embeds */}
        {!isDirectPlayback && isStalled && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 px-5 py-3 rounded-2xl bg-zinc-950/95 border border-zinc-800 backdrop-blur-xl text-white flex items-center gap-4 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <p className="text-xs sm:text-sm text-zinc-300">
                Playback taking longer than expected.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const currentIndex = STREAMING_SERVERS.findIndex((s) => s.id === activeServerId);
                  const nextServer = STREAMING_SERVERS[(currentIndex + 1) % STREAMING_SERVERS.length];
                  handleServerChange(nextServer.id);
                }}
                className="px-3 py-1 rounded-xl bg-[#E50914] text-white text-xs font-semibold hover:bg-red-700 transition"
              >
                Switch Stream
              </button>
              <button
                onClick={resetStallWatchdog}
                className="px-2.5 py-1 rounded-xl bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700 transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Rendering: Either Direct Production VideoPlayer or Sandboxed Fallback Iframe */}
        {isDirectPlayback && effectiveDirectStream ? (
          <VideoPlayer
            id={id}
            title={title}
            type={type}
            posterUrl={posterUrl}
            sourceUrl={effectiveDirectStream}
            season={season}
            episode={episode}
            isLowNetwork={isLowNetwork}
            providerName={providerDisplayName}
            activeServerId={activeServerId}
            onSelectServer={handleServerChange}
            directStreamUrl={directStreamUrl}
            isLocalBackendActive={isLocalBackendActive}
            onRefreshStream={handleRefreshStream}
            shieldEnabled={shieldEnabled}
            onToggleShield={handleToggleShield}
            onNextEpisode={onNextEpisode}
            hasNextEpisode={hasNextEpisode}
            onSwitchServer={() => {
              const currentIndex = STREAMING_SERVERS.findIndex((s) => s.id === activeServerId);
              const nextServer = STREAMING_SERVERS[(currentIndex + 1) % STREAMING_SERVERS.length];
              handleServerChange(nextServer.id);
            }}
          />
        ) : (
          <div className="w-full h-full relative">
            <iframe
              key={iframeKey}
              src={embedUrl}
              title={`${title} - ${activeServerId}`}
              className="w-full h-full border-0 absolute inset-0 z-10"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              sandbox={
                shieldEnabled
                  ? 'allow-scripts allow-same-origin allow-forms allow-presentation'
                  : undefined
              }
              onError={startStallWatchdog}
            />

            {/* In Iframe mode: Elegant Auto-Hiding Footer Overlay */}
            <div
              className={`absolute bottom-0 inset-x-0 z-30 bg-gradient-to-t from-black via-black/80 to-transparent px-4 sm:px-8 pb-4 sm:pb-6 pt-6 flex items-center justify-between text-white text-xs sm:text-sm transition-opacity duration-300 pointer-events-auto select-none ${
                isIframeFooterVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {/* Bottom Left: Provider Selector [ VidLink Pro (4K/1080p Fast) ] [ ↻ ] */}
              <div className="flex items-center gap-1.5">
                <ProviderSelector
                  activeServerId={activeServerId}
                  onSelectServer={handleServerChange}
                  directStreamUrl={directStreamUrl}
                  isLocalBackendActive={isLocalBackendActive}
                  isOpen={showIframeProviderMenu}
                  onToggle={() => {
                    setShowIframeProviderMenu(!showIframeProviderMenu);
                    setShowIframeMoreMenu(false);
                  }}
                  onClose={() => setShowIframeProviderMenu(false)}
                />

                <button
                  onClick={handleRefreshStream}
                  disabled={isRefreshing}
                  className={`p-1.5 rounded-xl bg-zinc-900/90 border border-white/10 hover:border-white/30 text-zinc-300 hover:text-white transition shadow-sm backdrop-blur-md ${
                    isRefreshing ? 'opacity-70 cursor-wait' : ''
                  }`}
                  title="Refresh video stream"
                  aria-label="Refresh video stream"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      isRefreshing
                        ? 'animate-spin text-[#E50914]'
                        : 'hover:rotate-180 transition-transform duration-500'
                    }`}
                  />
                </button>
              </div>

              {/* Bottom Right: 3-Dot More Menu + Fullscreen */}
              <div className="flex items-center gap-2 sm:gap-3 relative">
                {/* 3-Dot More Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowIframeMoreMenu(!showIframeMoreMenu)}
                    className={`p-1.5 rounded-lg transition focus:outline-none ${
                      showIframeMoreMenu ? 'text-[#E50914]' : 'text-zinc-300 hover:text-white'
                    }`}
                    title="More options (Shield, Diagnostics, Info)"
                    aria-label="More options"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  <PlayerMoreMenu
                    isOpen={showIframeMoreMenu}
                    onClose={() => setShowIframeMoreMenu(false)}
                    shieldEnabled={shieldEnabled}
                    onToggleShield={handleToggleShield}
                    onOpenCodecModal={() => setShowCodecModal(true)}
                    onOpenPlaybackInfo={() => setShowPlaybackInfo(true)}
                  />
                </div>

                {/* Fullscreen Button */}
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-lg text-zinc-300 hover:text-white transition focus:outline-none"
                  title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
                  aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Codec Diagnostics Modal */}
      <CodecDiagnosticsModal
        sourceUrl={effectiveDirectStream || undefined}
        isOpen={showCodecModal}
        onClose={() => setShowCodecModal(false)}
      />

      {/* Playback Info Modal */}
      <PlaybackInfoModal
        sourceName={providerDisplayName}
        qualityLabel="4K / 1080p Fast"
        engineName={isDirectPlayback ? 'HLS.js / DASH' : 'VidLink Embed Bridge'}
        videoCodec="H.264 / AVC"
        audioCodec="AAC Stereo"
        bufferSeconds={30}
        isOpen={showPlaybackInfo}
        onClose={() => setShowPlaybackInfo(false)}
      />
    </div>
  );
}
