# StreamVerse — Master Architecture & Implementation Specification

## 1. Project Goal & Core Philosophy
Build a blazing-fast, cross-platform, responsive streaming web application (**StreamVerse**) that allows users to search, browse, and stream **Movies, TV Series, Anime, and Live TV** on the same website across any browser and device (Desktop, Mobile iOS/Android, Tablet, Smart TV).

### Non-Negotiable Core Requirements:
1. **100% Redirect-Free & Ad-Free Experience**:
   - Prioritize direct `.m3u8` (HLS) and `.mp4` streams via native HTML5 `<video>` and `hls.js` (zero external scripts/ads).
   - Lock down all fallback `<iframe>` embeds using HTML5 `sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"` (strictly omitting `allow-popups` and `allow-top-navigation`) to block pop-ups and page redirects at the browser level.
   - Include a user-facing **"Redirect Shield: ON/OFF"** toggle in the player bar in case a specific backup embed server requires relaxed sandboxing.
2. **Low-Network & Slow-Connection Anti-Buffering Engine**:
   - Automatically detect network speed via the browser Network Information API (`navigator.connection.effectiveType`, `downlink`, `rtt`, `saveData`).
   - Provide a manual & automatic **"Low-Data / Anti-Buffer Mode"** toggle in the Navbar and Player.
   - Use custom `hls.js` buffer tuning (start at lowest bitrate level `0` on slow networks for `<1s` startup, conservative ABR bandwidth upgrade factor `0.65`, deep 90s–180s forward RAM buffer, automatic 0.5s buffer-hole jumping, and 8x chunk retry logic).
   - Include `<link rel="preconnect">` and `<link rel="dns-prefetch">` for all API and streaming domains.
   - Implement a **12-second Stall Watchdog** that prompts or auto-switches to the next mirror if a server stalls.
3. **Modern Interactive "CinemaOS" UI/UX**:
   - Glassmorphic dark theme (`bg-zinc-950`, `backdrop-blur-xl`, subtle `border-zinc-800/80`).
   - Global `Cmd+K` / `Ctrl+K` Instant Command Palette Search with 250ms debounced autocomplete across Movies, Series, Anime, and Live TV.
   - Dynamic Ambient Backlight ("Ambilight" blurred poster glow) behind the video player on the Watch page.
   - Theater Mode & Picture-in-Picture (PiP) support.
   - Auto-synced **"Continue Watching"** row on the Home page with visual progress bars powered by `localStorage` and Peachify `window.postMessage` (`PLAYER_EVENT`) telemetry.
   - Installable PWA (`manifest.json`) for mobile and desktop app installation.

---

## 2. Tech Stack & Dependencies
- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Video Engine**: `hls.js` + Native HTML5 `<video>` + Sandboxed `<iframe>`
- **Icons**: `lucide-react`
- **State/Persistence**: React Hooks + `localStorage` (Watch History, Watchlist, Data Saver preference)

---

## 3. Upstream APIs & Streaming Providers (Zero-Key & Hybrid)

### 3.1 Metadata & Search APIs (100% Free, No API Key Required)
1. **Movies & TV Series (Stremio Cinemeta API)**:
   - Trending Movies: `GET https://v3-cinemeta.strem.io/catalog/movie/top.json`
   - Trending Series: `GET https://v3-cinemeta.strem.io/catalog/series/top.json`
   - Search Movies: `GET https://v3-cinemeta.strem.io/catalog/movie/top/search={query}.json`
   - Search Series: `GET https://v3-cinemeta.strem.io/catalog/series/top/search={query}.json`
   - Movie Details: `GET https://v3-cinemeta.strem.io/meta/movie/{imdb_id}.json`
   - Series Details & Episodes: `GET https://v3-cinemeta.strem.io/meta/series/{imdb_id}.json`
2. **Anime (Jikan v4 MyAnimeList API)**:
   - Top Anime: `GET https://api.jikan.moe/v4/top/anime?limit=20`
   - Search Anime: `GET https://api.jikan.moe/v4/anime?q={query}&limit=16`
   - Anime Details: `GET https://api.jikan.moe/v4/anime/{mal_id}/full`
   - Anime Episodes: `GET https://api.jikan.moe/v4/anime/{mal_id}/episodes`
3. **Live TV (IPTV-org Curated Public Streams)**:
   - Fetch working public `.m3u8` channels from `https://iptv-org.github.io/api/streams.json` paired with channel metadata or provide a built-in curated high-availability fallback list of global News, Sports, Entertainment, and Music `.m3u8` streams so Live TV works instantaneously out of the box.
4. **Optional Hybrid Local Backend (MovieBox Next Rust API - `http://127.0.0.1:8080/api`)**:
   - Refer to `@API_AND_STREAMING_REFERENCE.md`. If reachable, query `/api/streams/:provider/:id` and `/api/play` to obtain 100% ad-free direct `/api/media-proxy/:token` streams, `/api/transcode/:token` fMP4 streams, or `/api/redis-stream/:token/playlist.m3u8` 10s cached chunks.

### 3.2 Embed & Streaming Server Registry
1. **VidLink Pro (4K/1080p Fast)**:
   - Movie URL: `https://vidlink.pro/movie/{id}?autoplay=true&primaryColor=e11d48`
   - TV URL: `https://vidlink.pro/tv/{id}/{season}/{episode}?autoplay=true&primaryColor=e11d48`
   - `supportsSandbox: false` (Zero X-Frame-Options blocking, ultra-fast CDN)
2. **VidSrc PM (Cinema HD)**:
   - Movie URL: `https://vidsrc.pm/embed/movie/{id}`
   - TV URL: `https://vidsrc.pm/embed/tv/{id}/{season}/{episode}`
   - `supportsSandbox: false` (Verified 200 OK, zero X-Frame-Options blocking)
3. **VidSrc Dev (Fast CDN)**:
   - Movie URL: `https://vidsrc.dev/embed/movie/{id}`
   - TV URL: `https://vidsrc.dev/embed/tv/{id}/{season}/{episode}`
   - `supportsSandbox: false` (Verified 200 OK multi-region streaming mirror)
4. **AutoEmbed Multi-Source**:
   - Movie URL: `https://autoembed.co/movie/imdb/{id}`
   - TV URL: `https://autoembed.co/tv/imdb/{id}/{season}/{episode}`
   - `supportsSandbox: false` (Verified 200 OK multi-source backup)
5. **2Embed Cinema Hub**:
   - Movie URL: `https://www.2embed.cc/embed/{id}`
   - TV URL: `https://www.2embed.cc/embedtv/{id}&s={season}&e={episode}`
   - `supportsSandbox: false` (Verified 200 OK global mirror)

### 3.3 VidLink & Peachify Playback Telemetry Listener (`window.postMessage`)
Listen for messages from `vidlink.pro` (`MEDIA_DATA`) and `peachify.pro` (`PLAYER_EVENT`) to auto-save watch progress:
```javascript
window.addEventListener('message', (event) => {
  if (!event.data) return;
  // Peachify Telemetry
  if (event.data.type === 'PLAYER_EVENT') {
    const { currentTime, duration } = event.data;
    // Save to localStorage
  }
  // VidLink Telemetry
  if (event.data.type === 'MEDIA_DATA') {
    const { currentTime, duration } = event.data.data || event.data;
    // Save to localStorage
  }
});
```

---

## 4. Target Directory & File Architecture
```text
src/
├── app/
│   ├── layout.tsx                 # Preconnect headers, Dark CinemaOS theme, Navbar, CommandSearchModal
│   ├── page.tsx                   # Home: Hero Spotlight, Continue Watching Row, Category Tabs (Movies, Series, Anime, Live TV)
│   ├── watch/[type]/[id]/page.tsx # Watch Page: Ambilight Backdrop, UniversalPlayer, Theater Mode, EpisodeSelector, Media Metadata
│   ├── livetv/page.tsx            # Dedicated Live TV Hub: Category Filters + Instant HLS Channel Grid + Live Player
│   └── watchlist/page.tsx         # Saved Favorites & Watch History Manager
├── components/
│   ├── Navbar.tsx                 # Sticky glassmorphic nav, Category links, Cmd+K Search button, Network Speed / Data Saver Pill
│   ├── CommandSearchModal.tsx     # Global Cmd+K / Ctrl+K debounced instant search across Movies, Series, Anime, Live TV
│   ├── UniversalPlayer.tsx        # Direct HLS/MP4 video + Sandboxed Iframe + Server Switcher + Redirect Shield + Stall Watchdog
│   ├── EpisodeSelector.tsx        # Season dropdown + Searchable Episode grid with watched progress indicators
│   ├── ContinueWatchingRow.tsx    # Horizontal carousel reading localStorage progress with resume links & delete button
│   └── MediaCard.tsx              # Interactive poster card with rating badge, type pill, hover scale, and skeleton loader
├── hooks/
│   ├── useNetworkQuality.ts       # Real-time 2G/3G/4G/Mbps detector & manual Data Saver override
│   └── useWatchHistory.ts         # Custom hook managing Continue Watching & Favorites in localStorage
└── lib/
    ├── providers.ts               # Streaming server definitions & URL builders
    ├── metadata.ts                # Unified API client for Cinemeta, Jikan v4, IPTV, and optional MovieBox Next backend
    └── hlsConfig.ts               # Low-network adaptive buffer & retry tuning for hls.js
```

---

## 5. Reference Implementation Modules

### 5.1 `src/hooks/useNetworkQuality.ts`
```typescript
'use client';
import { useState, useEffect } from 'react';

export interface NetworkStatus {
  online: boolean;
  effectiveType: string;
  downlinkMbps: number;
  rttMs: number;
  isLowNetwork: boolean;
  manualDataSaver: boolean;
  setManualDataSaver: (val: boolean) => void;
  recommendedQuality: '360p' | '480p' | '720p' | '1080p';
}

export function useNetworkQuality(): NetworkStatus {
  const [manualDataSaver, setManualDataSaverState] = useState<boolean>(false);
  const [netState, setNetState] = useState({
    online: true,
    effectiveType: '4g',
    downlinkMbps: 10,
    rttMs: 50,
    autoLow: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem('streamverse_datasaver');
    if (saved === 'true') setManualDataSaverState(true);

    const nav = navigator as any;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

    const update = () => {
      const online = navigator.onLine;
      const effectiveType = conn?.effectiveType || '4g';
      const downlink = conn?.downlink ?? 10;
      const rtt = conn?.rtt ?? 50;
      const saveData = conn?.saveData ?? false;

      const autoLow =
        !online ||
        saveData ||
        ['slow-2g', '2g', '3g'].includes(effectiveType) ||
        downlink < 2.5 ||
        rtt > 400;

      setNetState({ online, effectiveType, downlinkMbps: downlink, rttMs: rtt, autoLow });
    };

    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    conn?.addEventListener?.('change', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      conn?.removeEventListener?.('change', update);
    };
  }, []);

  const setManualDataSaver = (val: boolean) => {
    setManualDataSaverState(val);
    localStorage.setItem('streamverse_datasaver', String(val));
  };

  const isLowNetwork = manualDataSaver || netState.autoLow;
  const recommendedQuality = isLowNetwork
    ? netState.downlinkMbps < 1.2
      ? '360p'
      : '480p'
    : netState.downlinkMbps < 6
    ? '720p'
    : '1080p';

  return {
    ...netState,
    isLowNetwork,
    manualDataSaver,
    setManualDataSaver,
    recommendedQuality,
  };
}
```

### 5.2 `src/lib/hlsConfig.ts`
```typescript
import type { HlsConfig } from 'hls.js';

export function getAdaptiveHlsConfig(isLowNetwork: boolean): Partial<HlsConfig> {
  return {
    enableWorker: true,
    lowLatencyMode: false,
    startLevel: isLowNetwork ? 0 : -1,
    abrBandWidthFactor: isLowNetwork ? 0.65 : 0.85,
    abrBandWidthUpFactor: isLowNetwork ? 0.55 : 0.7,
    maxBufferLength: isLowNetwork ? 90 : 45,
    maxMaxBufferLength: 180,
    maxBufferSize: 60 * 1000 * 1000,
    maxBufferHole: 0.5,
    highBufferWatchdogPeriod: 3,
    nudgeOffset: 0.2,
    nudgeMaxRetry: 10,
    fragLoadingTimeOut: 25000,
    fragLoadingMaxRetry: 8,
    fragLoadingRetryDelay: 1000,
    manifestLoadingTimeOut: 15000,
    manifestLoadingMaxRetry: 5,
  };
}
```

---

## 6. Ordered Execution Checklist for the AI Agent
Execute these phases sequentially without skipping any file:
- **Phase 1: Workspace Setup & Dependencies**: Initialize Next.js (TypeScript, Tailwind, App Router) if not initialized, and install `hls.js` and `lucide-react`. Create `public/manifest.json` for PWA support.
- **Phase 2: Core Data, Providers & Low-Network Engine**: Implement `src/lib/providers.ts`, `src/lib/hlsConfig.ts`, `src/hooks/useNetworkQuality.ts`, `src/hooks/useWatchHistory.ts`, and `src/lib/metadata.ts` (with Cinemeta, Jikan v4, curated Live TV `.m3u8` channels, and optional MovieBox Next `127.0.0.1:8080` fallback).
- **Phase 3: Ad-Free, Redirect-Shielded Universal Player**: Implement `src/components/UniversalPlayer.tsx` supporting Direct HLS/MP4 playback, Sandboxed Iframe embeds (`sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"`), Redirect Shield toggle, Server Switcher, Peachify `postMessage` progress tracking, and Low-Network Stall Watchdog.
- **Phase 4: Interactive CinemaOS Components**: Implement `src/components/Navbar.tsx` (with live Network/Data-Saver pill & `Cmd+K` trigger), `src/components/CommandSearchModal.tsx`, `src/components/MediaCard.tsx`, `src/components/ContinueWatchingRow.tsx`, and `src/components/EpisodeSelector.tsx`.
- **Phase 5: Application Pages & Verification**: Implement `src/app/layout.tsx` (with `<link rel="preconnect">` tags), `src/app/page.tsx`, `src/app/watch/[type]/[id]/page.tsx` (with Ambilight glow and Theater mode), `src/app/livetv/page.tsx`, and `src/app/watchlist/page.tsx`. Run `npm run build` or start the dev server to verify zero TypeScript or build errors.