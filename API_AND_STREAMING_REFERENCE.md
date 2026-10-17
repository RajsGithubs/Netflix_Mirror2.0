# MovieBox Next — Complete API, Upstream Servers & Streaming Reference Manual

> **Version:** MovieBox-TUI / MovieBox Next v0.1.21  
> **Environment:** Rust 2024 (Axum 0.7 + Tokio) | React 18 / TypeScript / Vite  
> **Target Audience:** Frontend/Backend Engineers, DevOps, Media Infrastructure Developers  

---

## Table of Contents

1. [Architectural Overview](#1-architectural-overview)
2. [REST & WebSocket API Reference](#2-rest--websocket-api-reference)
   - [2.1 Search & Autocomplete](#21-search--autocomplete)
   - [2.2 Catalog & Providers](#22-catalog--providers)
   - [2.3 Media Details & Streams](#23-media-details--streams)
   - [2.4 Playback Dispatch](#24-playback-dispatch)
   - [2.5 In-Browser Streaming Proxies](#25-in-browser-streaming-proxies)
   - [2.6 Redis Chunking Stream](#26-redis-chunking-stream)
   - [2.7 Library, Favorites & History](#27-library-favorites--history)
   - [2.8 System Settings](#28-system-settings)
   - [2.9 WebSocket Real-Time Events](#29-websocket-real-time-events)
3. [Upstream Servers & Data Sources](#3-upstream-servers--data-sources)
   - [3.1 MovieBox Backend & CDN Fleet](#31-moviebox-backend--cdn-fleet)
   - [3.2 4KHDHub & HubCloud Resolvers](#32-4khdhub--hubcloud-resolvers)
   - [3.3 BDIX Regional Intranet Servers](#33-bdix-regional-intranet-servers)
   - [3.4 Stremio Addon Ecosystem & Cinemeta](#34-stremio-addon-ecosystem--cinemeta)
   - [3.5 Web Cinema Fallback Embeds](#35-web-cinema-fallback-embeds)
   - [3.6 Live IPTV Sources](#36-live-iptv-sources)
4. [Streaming Subsystems & Media Delivery Architecture](#4-streaming-subsystems--media-delivery-architecture)
   - [4.1 Streaming Pipeline Decision Tree](#41-streaming-pipeline-decision-tree)
   - [4.2 Direct HTTP Range Proxy & Manifest Rewriting](#42-direct-http-range-proxy--manifest-rewriting)
   - [4.3 On-Demand FFmpeg fMP4 Live Transcoding Engine](#43-on-demand-ffmpeg-fmp4-live-transcoding-engine)
   - [4.4 Redis-Backed 10-Second HLS Chunking Cache](#44-redis-backed-10-second-hls-chunking-cache)
   - [4.5 Desktop VLC Sidecar Reverse Proxy](#45-desktop-vlc-sidecar-reverse-proxy)
5. [Client-Side Playback & Stream Selection](#5-client-side-playback--stream-selection)
   - [5.1 Codec Probing & Capability Scoring](#51-codec-probing--capability-scoring)
   - [5.2 Web Player Architecture (`VlcStylePlayer.tsx`)](#52-web-player-architecture-vlcstyleplayertsx)
6. [Quick Reference & Command Cheat Sheet](#6-quick-reference--command-cheat-sheet)

---

## 1. Architectural Overview

MovieBox-TUI operates as a dual-interface media platform:
1. **Desktop/Terminal User Interface (TUI)**: Powered by `ratatui` and `crossterm`.
2. **Web Browser Interface (Web UI)**: Powered by an `axum` HTTP/WebSocket server listening on port `8080` (default) and a React 18 / Vite SPA listening on port `5173`.

```
                    ┌──────────────────────────────────────────┐
                    │               Web Browser                │
                    │   React 18 / Vite / VlcStylePlayer       │
                    └────────────────────┬─────────────────────┘
                                         │ HTTP Range / WS / REST
                                         ▼
                    ┌──────────────────────────────────────────┐
                    │            Axum Web Server               │
                    │          (src/web/server.rs)             │
                    └──────┬─────────────┬──────────────┬──────┘
                           │             │              │
             ┌─────────────┘             │              └──────────────┐
             ▼                           ▼                             ▼
┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
│  Direct Range Proxy    │  │   FFmpeg Live Pipe     │  │   Redis Stream Cache   │
│  - Manifest Rewriter   │  │   - fMP4 / H.264 copy  │  │   - 10s chunks         │
│  - CORS / Header scrub │  │   - Hardware NVENC/QSV │  │   - 60s prebuffer      │
└────────────┬───────────┘  └────────────┬───────────┘  └────────────┬───────────┘
             │                           │                           │
             └───────────────────────────┼───────────────────────────┘
                                         │ Upstream HTTPS / CDN
                                         ▼
      ┌─────────────────────────────────────────────────────────────────┐
      │                      Upstream Content Fleet                     │
      │  MovieBox BFF API (aoneroom.com) • 4KHDHub • Stremio • BDIX FTP │
      └─────────────────────────────────────────────────────────────────┘
```

---

## 2. REST & WebSocket API Reference

Base URL for all REST endpoints: `http://127.0.0.1:8080/api`  
Base URL for WebSocket: `ws://127.0.0.1:8080/ws`

---

### 2.1 Search & Autocomplete

#### `GET /api/search`
Searches content from the designated or currently active provider.

- **Query Parameters**:
  - `q` (*string*, required): Search search keywords (e.g., `Inception`).
  - `provider` (*string*, optional): Provider key. Options: `moviebox`, `fourkhdhub`, `bdix_circleftp`, `bdix_dhakaflix`, `addons`. Default: current active provider in settings.
  - `page` (*integer*, optional): Pagination page number (starts at `1`, default: `1`).
- **Response `200 OK`**:
```json
{
  "items": [
    {
      "id": {
        "provider": "MovieBox",
        "value": "260904"
      },
      "title": "Inception",
      "media_type": "movie",
      "year": "2010",
      "poster_url": "https://img.inmoviebox.com/poster/inception.jpg",
      "season_count": null
    }
  ],
  "page": 1,
  "provider": "moviebox",
  "query": "Inception"
}
```
- **Example `curl`**:
```bash
curl "http://127.0.0.1:8080/api/search?q=Inception&provider=moviebox&page=1"
```

#### `GET /api/suggest`
Returns autocomplete search suggestions as the user types.

- **Query Parameters**:
  - `q` (*string*, required): Partial search prefix.
- **Response `200 OK`**:
```json
{
  "suggestions": [
    "Inception",
    "Inception: The Cobol Job",
    "Incredibles 2"
  ]
}
```
- **Example `curl`**:
```bash
curl "http://127.0.0.1:8080/api/suggest?q=incep"
```

---

### 2.2 Catalog & Providers

#### `GET /api/homepage`
Fetches curated home screen collections, trending items, and featured banners.

- **Query Parameters**:
  - `tab` (*string*, optional): Tab name or identifier:
    - `"home"` or `"featured"`: Maps to internal tab `2`
    - `"trending"`: Maps to internal tab `1`
    - `"movies"`: Maps to internal tab `3`
    - `"tv"`: Maps to internal tab `4`
  - `page` (*integer*, optional): Page number (default: `1`).
- **Response `200 OK`**:
```json
{
  "tab": "home",
  "items": [
    {
      "id": { "provider": "MovieBox", "value": "260904" },
      "title": "Dune: Part Two",
      "media_type": "movie",
      "year": "2024",
      "poster_url": "https://img.inmoviebox.com/...",
      "season_count": null
    }
  ],
  "page": 1
}
```
- **Example `curl`**:
```bash
curl "http://127.0.0.1:8080/api/homepage?tab=trending&page=1"
```

#### `GET /api/providers`
Lists all available content scrapers, their enablement status, and the current active provider.

- **Response `200 OK`**:
```json
{
  "providers": [
    { "id": "moviebox", "label": "MovieBox", "enabled": true },
    { "id": "fourkhdhub", "label": "4KHDHub", "enabled": true },
    { "id": "bdix_circleftp", "label": "CircleFTP (BDIX)", "enabled": false },
    { "id": "bdix_dhakaflix", "label": "DhakaFlix (BDIX)", "enabled": false },
    { "id": "addons", "label": "Addons", "enabled": true }
  ],
  "active": "moviebox"
}
```
- **Example `curl`**:
```bash
curl "http://127.0.0.1:8080/api/providers"
```

---

### 2.3 Media Details & Streams

#### `GET /api/details/:provider/:id`
Retrieves rich metadata, synopsis, cast, genres, ratings, and series episode structure.

- **Path Parameters**:
  - `provider`: Provider key (e.g., `moviebox`, `addons`, `fourkhdhub`).
  - `id`: Unique media ID (e.g., `260904` or IMDb `tt15239678`).
- **Response `200 OK`**:
```json
{
  "details": {
    "id": { "provider": "MovieBox", "value": "260904" },
    "title": "Inception",
    "media_type": "movie",
    "description": "Cobb steals information from targets...",
    "year": "2010",
    "genres": ["Action", "Sci-Fi", "Adventure"],
    "rating": 8.8,
    "poster_url": "https://img.inmoviebox.com/...",
    "duration": "148 min",
    "seasons": [],
    "is_series": false
  },
  "provider": "moviebox"
}
```
- **Automatic Fallback**: If the primary provider fails, the backend automatically attempts title and IMDb resolution against Cinemeta/Addons.

#### `GET /api/streams/:provider/:id`
Resolves all playable release streams, quality variants (4K, 1080p, 720p, 480p), audio tracks, and guaranteed Web Cinema backup mirrors.

- **Path Parameters**:
  - `provider`: Provider key.
  - `id`: Media ID.
- **Query Parameters**:
  - `season` (*integer*, optional): Season number for TV series.
  - `episode` (*integer*, optional): Episode number for TV series.
  - `quality` (*string*, optional): Desired resolution filter (`1080p`, `720p`, etc.).
- **Response `200 OK`**:
```json
{
  "releases": [
    {
      "provider": "MovieBox",
      "filename": "Inception.2010.1080p.WEBRip.x264.mp4",
      "quality": "1080p",
      "codec": "H.264",
      "language": "English",
      "size_bytes": 2684354560,
      "season": null,
      "episode": null,
      "mirrors": [
        {
          "label": "CDN Server 1",
          "resolver_url": "https://cdn.example.com/hls/inception/master.m3u8",
          "headers": [["Referer", "https://sportslive.wine"]],
          "direct_file": true
        }
      ],
      "resolutions": ["1080p", "720p", "480p"]
    },
    {
      "provider": "MovieBox",
      "filename": "Inception [Web Cinema - VidSrc HD]",
      "quality": "1080p",
      "codec": "H.264",
      "mirrors": [{ "label": "VidSrc HD Cinema (1080p)", "resolver_url": "https://vidsrc.pm/embed/movie/tt1375666" }]
    }
  ],
  "qualities": ["1080p", "720p", "480p", "360p"],
  "provider": "moviebox",
  "media_id": "260904",
  "season": null,
  "episode": null
}
```

---

### 2.4 Playback Dispatch

#### `POST /api/play`
Initializes playback. Either boots an external desktop player (VLC, MPV, IINA) or generates a secure proxy session for in-browser playback.

- **Request Body JSON**:
```json
{
  "provider": "moviebox",
  "media_id": "260904",
  "title": "Inception (2010)",
  "player": "web",
  "season": null,
  "episode": null,
  "quality": "1080p",
  "stream_url": "https://upstream.cdn.com/stream.mp4",
  "subtitle_url": "https://upstream.cdn.com/subs.srt",
  "transcode": false,
  "use_redis": false
}
```
- **Player Types**:
  - `"web"` / `"browser"` / `"html5"`: Generates browser proxy URLs.
  - `"mpv"` / `"vlc"` / `"iina"`: Spawns the local native player process on the host machine.
  - `"android"`: Launches Android intent opener in Termux environments.
- **Response `200 OK` (Web Mode)**:
```json
{
  "status": "ready",
  "player": "web",
  "stream_url": "/api/media-proxy/7a9f8c4e1b2d.../https://upstream.cdn.com/stream.mp4",
  "transcode_url": "/api/transcode/7a9f8c4e1b2d...",
  "redis_status_url": "/api/redis-stream/7a9f8c4e1b2d.../status",
  "redis_backed": false,
  "required_buffer_seconds": 60,
  "chunk_duration": 10,
  "token": "7a9f8c4e1b2d...",
  "subtitle_url": "/api/media-proxy/7a9f8c4e1b2d.../subs.srt"
}
```

---

### 2.5 In-Browser Streaming Proxies

#### `GET/HEAD /api/media-proxy/:token`
#### `GET/HEAD /api/media-proxy/:token/*rest`
Direct HTTP Byte-Range media proxy and dynamic manifest rewriter.

- **Use Cases**:
  - Direct MP4 / WebM streaming with full timeline seeking (`Range: bytes=0-`).
  - HLS (`.m3u8`) and MPEG-DASH (`.mpd`) streaming without CORS blocking.
  - Injects required upstream anti-hotlink headers (`Referer`, `User-Agent`, CDN tokens).
- **Behavior**:
  - Re-encodes sub-playlist and chunk paths to route through `/api/media-proxy/:token/*`.
  - Forwards `Range`, `If-Range`, and returns `206 Partial Content` with `Content-Range`.
  - SSRF Protection: Blocks non-whitelisted destinations.
- **Example `curl`**:
```bash
curl -I -H "Range: bytes=0-1048575" "http://127.0.0.1:8080/api/media-proxy/7a9f8c4e1b2d..."
```

#### `GET /api/transcode/:token`
Live FFmpeg transcoding pipe for HEVC / H.265 / 10-bit files incompatible with browser MSE.

- **Query Parameters**:
  - `start` (*float*, optional): Seek offset in seconds (e.g., `?start=124.5`).
  - `quality` (*string*, optional): Output resolution (`1080p`, `720p`, `480p`).
- **Features**:
  - Streams fragmented MP4 (`fMP4`) over progressive HTTP.
  - Automatic hardware acceleration (`h264_nvenc`, `h264_qsv`, `h264_amf`, `h264_videotoolbox`, `vaapi`).
  - If upstream stream is already H.264, automatically switches to `-c:v copy` remuxing (zero CPU load).
  - Concurrency limited to 2 simultaneous processes via Tokio semaphore.

#### `GET /api/transcode/:token/stats`
Returns real-time telemetry metrics for the active transcode session.

- **Response `200 OK`**:
```json
{
  "session_id": "7a9f8c4e1b2d...",
  "input_codec": "hevc",
  "input_resolution": "1920x1080",
  "input_fps": "24",
  "encoder": "h264_nvenc",
  "hw_accel": true,
  "time_to_first_chunk_ms": 312,
  "current_speed": 2.45,
  "current_fps": 58.8,
  "bytes_streamed": 14205810,
  "output_bitrate_kbps": 4200.0,
  "upstream_stalls": 0,
  "errors": [],
  "active": true,
  "exit_status": null
}
```

---

### 2.6 Redis Chunking Stream

#### `GET /api/redis-stream/:token/status`
Polls the prebuffering status of the 10-second chunking Redis worker.

- **Response `200 OK`**:
```json
{
  "token": "7a9f8c4e1b2d...",
  "status": "ready",
  "cached_chunks": 8,
  "cached_seconds": 80.0,
  "required_seconds": 60.0,
  "ready": true,
  "completed": false,
  "error": null
}
```

#### `GET /api/redis-stream/:token/playlist.m3u8`
Serves dynamically assembled HLS playlist containing all chunks cached in Redis.

#### `GET /api/redis-stream/:token/chunk/:chunk_file`
Fetches a specific 10-second `.ts` media chunk directly from Redis storage (`2-hour TTL`).

---

### 2.7 Library, Favorites & History

#### `GET /api/favorites`
Lists all saved movies and TV shows.

- **Response `200 OK`**:
```json
{
  "favorites": [
    {
      "provider": "moviebox",
      "subject_id": "260904",
      "title": "Inception",
      "cover_url": "https://img.inmoviebox.com/...",
      "stype": 1,
      "release_year": "2010",
      "added_at": 1729000000
    }
  ],
  "total": 1
}
```

#### `POST /api/favorites`
Adds a title to the favorites library.

- **Request Body JSON**:
```json
{
  "provider": "moviebox",
  "subject_id": "260904",
  "title": "Inception",
  "cover_url": "https://img.inmoviebox.com/...",
  "stype": 1,
  "release_year": "2010"
}
```
- **Response**: `201 Created`

#### `DELETE /api/favorites/:provider/:id`
Removes an item from favorites.
- **Response**: `204 No Content`

#### `GET /api/history`
Returns recently played media titles, playback positions, timestamps, and episode progress.

#### `DELETE /api/history`
Clears entire playback history.
- **Response**: `204 No Content`

#### `DELETE /api/history/:provider/:id`
Deletes a single item from watch history.

---

### 2.8 System Settings

#### `GET /api/settings`
Returns current system configuration and detected local players.

- **Response `200 OK`**:
```json
{
  "settings": {
    "auto_update": true,
    "active_provider": "moviebox",
    "active_theme": "dark",
    "moviebox_enabled": true,
    "fourkhdhub_enabled": true,
    "bdix_circleftp_enabled": false,
    "bdix_dhakaflix_enabled": false,
    "addons_enabled": true,
    "default_player": "web",
    "download_dir": "C:\\Users\\user\\Downloads"
  },
  "available_players": ["mpv", "vlc", "iina", "android"]
}
```

#### `PUT /api/settings`
Updates system configuration (partial update supported).

- **Request Body JSON**:
```json
{
  "default_player": "web",
  "moviebox_enabled": true,
  "active_provider": "moviebox"
}
```
- **Response `200 OK`**: Returns updated `Config` object.

---

### 2.9 WebSocket Real-Time Events

#### `GET /ws`
Upgrades to a persistent bi-directional WebSocket connection.

- **Server-to-Client Messages**:
  1. `player_launched`: Broadcasts when a host media player is spawned.
  ```json
  {
    "type": "player_launched",
    "player": "vlc",
    "title": "Inception (2010)"
  }
  ```
  2. `notification`: System notifications and errors.
  ```json
  {
    "type": "notification",
    "level": "info",
    "message": "Playback started in cinema player"
  }
  ```

---

## 3. Upstream Servers & Data Sources

The table below outlines all external servers, IP addresses, and remote protocols queried across the codebase:

| Provider / Subsystem | Host / Domain / IP | Protocol | Purpose | Auth & Signature |
|---|---|---|---|---|
| **MovieBox BFF** | `api6.aoneroom.com`<br>`api5.aoneroom.com`<br>`api4.aoneroom.com`<br>`api4sg.aoneroom.com`<br>`api3.aoneroom.com`<br>`api.inmoviebox.com` | HTTPS | Primary metadata, search, catalog, stream URL extraction | Dynamic HMAC/MD5 signed headers, `x-user` session tokens, client info tokens |
| **MovieBox CDN** | `*.aoneroom.com`<br>`*.inmoviebox.com` | HTTPS | Streaming video delivery, HLS chunks, posters | `Referer: https://sportslive.wine`, Range headers |
| **4KHDHub** | `https://4khdhub.one/` | HTTPS | Web scraper for high-bitrate UHD releases | Browser User-Agent spoofing, Cloudflare bypass |
| **HubCloud Resolvers** | `gamerxyt.com`<br>`hubcloud.php` | HTTPS | Decodes intermediate shortlinks to direct download/stream mirrors | Multi-hop HTML parsing |
| **PixelDrain** | `pixeldrain.com/api/file/...` | HTTPS | High-speed cloud file streaming mirror | Direct HTTP Range requests |
| **BDIX CircleFTP** | `http://new.circleftp.net:5000` | HTTP | Bangladeshi local ISP intranet movie catalog & direct files | None (Local ISP subnet restricted) |
| **BDIX DhakaFlix** | `http://172.16.50.4` | HTTP | Bangladeshi intranet FTP streaming | None (BDIX routing) |
| **Stremio Cinemeta** | `https://v3-cinemeta.strem.io` | HTTPS | IMDb catalog resolution, metadata normalization | Standard JSON API |
| **Stremio Torrentio** | `https://torrentio.strem.fun` | HTTPS | P2P & debrid torrent stream link resolver | Stremio Addon Protocol |
| **Web Cinema Mirrors** | `https://vidsrc.pm`<br>`https://www.2embed.cc` | HTTPS | Guaranteed fallback video embed players | IMDb ID parameterization |
| **Live TV / IPTV** | Configured via M3U URLs | HTTP/HTTPS | Live television stream playlists (`.m3u8`) | 24-hour disk cached |

---

## 4. Streaming Subsystems & Media Delivery Architecture

### 4.1 Streaming Pipeline Decision Tree

When the user initiates playback, the system chooses the optimal delivery route based on client device, codec compatibility, and network stability:

```
[User clicks Play on Media Item]
                 │
                 ▼
       Is target player Desktop?
      ┌──────────┴──────────┐
      │ YES                 │ NO (Browser / Mobile Web)
      ▼                     ▼
[Spawn VLC / MPV]     Probe Client Codec Support (MediaSource API)
(Sidecar proxy if           │
needed for headers)         ├─► Source is HLS/DASH?
                            │     └── Rewritten via /api/media-proxy/:token/... (HLS.js / Dash.js)
                            │
                            ├─► Codec supported natively (H.264 / AAC / supported HEVC)?
                            │     └── Direct Play via /api/media-proxy/:token (HTTP 206 Range)
                            │
                            ├─► Flaky upstream with high jitter?
                            │     └── Opt-in 10s chunking via /api/redis-stream/:token
                            │
                            └─► Codec unsupported (HEVC on non-Safari, VP9 in MKV)?
                                  └── Live FFmpeg Transcode via /api/transcode/:token (fMP4 pipe)
```

---

### 4.2 Direct HTTP Range Proxy & Manifest Rewriting

Located in [`src/web/handlers/media_proxy.rs`](file:///e:/Testfix/src/web/handlers/media_proxy.rs):

1. **Session Registry**: When `/api/play` is invoked, a session token is stored in `WebAppState.stream_sessions` containing:
   - Upstream media URL
   - Required request headers (`Referer`, `Authorization`, `Cookie`, `User-Agent`)
   - 6-hour time-to-live (`SESSION_TTL`)
2. **Byte-Range Passthrough**:
   - Forwards client `Range: bytes=X-Y` header directly to upstream CDN.
   - Forwards `If-Range` for cache revalidation.
   - Streams chunks to client via `upstream_response.bytes_stream()`.
   - Injects `Accept-Ranges: bytes` and `Content-Range: bytes X-Y/Total`.
3. **Manifest Rewriting**:
   - **HLS (`.m3u8`)**: Rewrites all relative and absolute sub-playlists and `.ts` chunk URLs to `/api/media-proxy/:token/{percent_encoded_url}`.
   - **DASH (`.mpd`)**: Rewrites `<BaseURL>`, `initialization=`, and `media=` attributes inside XML to route media chunks through the local proxy.
   - Solves CORS errors and attaches necessary upstream CDN authentication headers to every segment request.

---

### 4.3 On-Demand FFmpeg fMP4 Live Transcoding Engine

Located in [`src/web/handlers/transcode.rs`](file:///e:/Testfix/src/web/handlers/transcode.rs):

1. **Format**: Converts source video on-the-fly into fragmented MP4 (`fMP4`) using:
   ```bash
   -f mp4 -movflags frag_keyframe+empty_moov+default_base_moof
   ```
2. **Hardware Acceleration Detection**:
   Automatically detects GPU encoder:
   - Nvidia: `h264_nvenc`
   - Intel: `h264_qsv`
   - AMD: `h264_amf`
   - macOS: `h264_videotoolbox`
   - Linux: `vaapi`
   - CPU Fallback: `libx264 -preset ultrafast -tune zerolatency`
3. **Smart Stream Copy**: If the upstream file already contains an H.264 video track, FFmpeg runs in `-c:v copy` mode, bypassing encoding completely and minimizing CPU/GPU usage.
4. **Seeking & Debouncing**:
   - When the user scrubs the timeline, the client passes `?start={seconds}`.
   - The backend passes `-ss {start}` before `-i` for fast keyframe seeking.
   - An internal `oneshot::channel` terminates any previously running FFmpeg process for that session token.

---

### 4.4 Redis-Backed 10-Second HLS Chunking Cache

Located in [`src/web/handlers/redis_stream.rs`](file:///e:/Testfix/src/web/handlers/redis_stream.rs):

1. **Worker Process**: Spawns a background FFmpeg task segmenting the media into 10-second HLS chunks.
2. **Storage**: Each segment is saved as raw bytes into Redis (`SET MB_CHUNK:<token>:<file>` with a 2-hour TTL).
3. **Prebuffering Threshold**:
   - `REQUIRED_BUFFER_CHUNKS = 6` (60 seconds of video).
   - `/api/redis-stream/:token/status` reports `"buffering"` until 6 chunks are stored in Redis, then switches to `"ready"`.
   - Designed for high-latency connections to prevent playback stalls.

---

### 4.5 Desktop VLC Sidecar Reverse Proxy

Located in [`src/proxy.rs`](file:///e:/Testfix/src/proxy.rs):

- VLC and some external desktop media players do not support attaching custom HTTP headers (such as `Referer: https://sportslive.wine`) on stream URLs.
- The backend spawns a lightweight sidecar process:
  ```bash
  moviebox-tui --proxy-for-vlc <stream_url> <headers_json> <sub_url>
  ```
- Listens on `127.0.0.1:<random_port>`.
- VLC is instructed to open `http://127.0.0.1:<port>/...`, and the sidecar injects CDN headers and supplies subtitles seamlessly.

---

## 5. Client-Side Playback & Stream Selection

### 5.1 Codec Probing & Capability Scoring

Located in [`web/src/utils/codecCapabilities.ts`](file:///e:/Testfix/web/src/utils/codecCapabilities.ts) and [`web/src/utils/streamSelector.ts`](file:///e:/Testfix/web/src/utils/streamSelector.ts):

- **Probes**:
  ```ts
  MediaSource.isTypeSupported('video/mp4; codecs="avc1.640028, mp4a.40.2"') // H.264 High Profile
  MediaSource.isTypeSupported('video/mp4; codecs="hvc1.1.6.L93.B0, mp4a.40.2"') // HEVC Main Profile
  ```
- **Heuristic Ranking**:
  1. H.264 streams receive priority on browsers lacking hardware HEVC decoding.
  2. Direct CDNs are preferred over multi-redirect mirrors.
  3. Resolutions matching screen DPI are preferred to avoid client-side downscaling overhead.

---

### 5.2 Web Player Architecture (`VlcStylePlayer.tsx`)

Located in [`web/src/components/player/VlcStylePlayer.tsx`](file:///e:/Testfix/web/src/components/player/VlcStylePlayer.tsx):

- **Playback Engines**:
  - `hls.js`: Handles adaptive bitrate streaming for `.m3u8` streams.
  - `dash.js`: Handles MPEG-DASH `.mpd` streams.
  - Native HTML5 `<video>`: Handles direct MP4 range streams and fMP4 transcode pipes.
- **Audio Processing**: Web Audio API with a 10-band graphic equalizer (32Hz to 16kHz) and up to +300% audio gain boost without digital clipping.
- **Diagnostics HUD**: Press `D` or toggle via menu to view real-time latency, forward buffer seconds, download throughput, dropped frames, active codec, and transcode telemetry.

---

## 6. Quick Reference & Command Cheat Sheet

### Start Redis Cache (Optional)
```powershell
redis-server --daemonize no
```

### Start Rust Backend (Port 8080)
```powershell
cargo run --features web -- --web --host 0.0.0.0 --port 8080
```

### Start Frontend Vite Dev Server (Port 5173)
```powershell
npm --prefix web run dev
```

### 1-Click Launch Everything (Windows)
```powershell
.\run.bat
```

### Test Playback Session with `curl`
```bash
# 1. Query search
curl "http://127.0.0.1:8080/api/search?q=Inception"

# 2. Query streams
curl "http://127.0.0.1:8080/api/streams/moviebox/260904"

# 3. Create playback session
curl -X POST "http://127.0.0.1:8080/api/play" \
  -H "Content-Type: application/json" \
  -d '{"provider":"moviebox","media_id":"260904","player":"web"}'
```
