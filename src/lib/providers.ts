export interface StreamServer {
  id: string;
  name: string;
  description: string;
  supportsSandbox: boolean; // Set to false on embed providers that block sandboxed iframes via Adscore / anti-sandbox detection
  isDirectMedia?: boolean;
  requiresSandbox?: boolean;
  supportsAnime?: boolean;
  tag: 'primary' | 'fallback' | 'dubbed' | 'direct';
}

export const STREAM_SERVERS: StreamServer[] = [
  {
    id: 'vidlink',
    name: 'VidLink Pro (4K/1080p Fast)',
    description: 'Clean ultra-fast CDN with 4K/1080p multi-audio streams',
    supportsSandbox: false,
    tag: 'primary',
  },
  {
    id: 'vidsrc_pm',
    name: 'VidSrc PM (Cinema HD)',
    description: 'Verified high-bitrate WebRip embed with zero X-Frame blocking',
    supportsSandbox: false,
    tag: 'primary',
  },
  {
    id: 'vidsrc_dev',
    name: 'VidSrc Dev (Fast CDN)',
    description: 'Direct multi-region streaming mirror with fast buffering',
    supportsSandbox: false,
    tag: 'fallback',
  },
  {
    id: 'autoembed',
    name: 'AutoEmbed Multi-Source',
    description: 'Multi-source adaptive backup mirror with reliable uptime',
    supportsSandbox: false,
    tag: 'fallback',
  },
  {
    id: 'twoembed',
    name: '2Embed Cinema Hub',
    description: 'Global high-availability multi-server streaming backup',
    supportsSandbox: false,
    tag: 'fallback',
  },
];

export const STREAMING_SERVERS: StreamServer[] = STREAM_SERVERS;

export interface StreamParams {
  id: string; // IMDb ID (e.g., tt1375666) or TMDB ID / Jikan ID
  type: 'movie' | 'series' | 'anime' | 'livetv';
  season?: number;
  episode?: number;
  directUrl?: string;
  dubbed?: boolean;
}

export function buildServerEmbedUrl(serverId: string, params: StreamParams): string {
  const { id, type, season = 1, episode = 1, directUrl } = params;

  if (serverId === 'direct' && directUrl) {
    return directUrl;
  }

  const isMovie = type === 'movie';
  const s = season;
  const e = episode;

  switch (serverId) {
    case 'vidlink': {
      if (isMovie) {
        return `https://vidlink.pro/movie/${id}?autoplay=true&primaryColor=e11d48`;
      }
      return `https://vidlink.pro/tv/${id}/${s}/${e}?autoplay=true&primaryColor=e11d48`;
    }
    case 'vidsrc_pm': {
      if (isMovie) {
        return `https://vidsrc.pm/embed/movie/${id}`;
      }
      return `https://vidsrc.pm/embed/tv/${id}/${s}/${e}`;
    }
    case 'vidsrc_dev': {
      if (isMovie) {
        return `https://vidsrc.dev/embed/movie/${id}`;
      }
      return `https://vidsrc.dev/embed/tv/${id}/${s}/${e}`;
    }
    case 'autoembed': {
      if (isMovie) {
        return `https://autoembed.co/movie/imdb/${id}`;
      }
      return `https://autoembed.co/tv/imdb/${id}/${s}/${e}`;
    }
    case 'twoembed': {
      if (isMovie) {
        return `https://www.2embed.cc/embed/${id}`;
      }
      return `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`;
    }
    default: {
      if (isMovie) {
        return `https://vidlink.pro/movie/${id}?autoplay=true&primaryColor=e11d48`;
      }
      return `https://vidlink.pro/tv/${id}/${s}/${e}?autoplay=true&primaryColor=e11d48`;
    }
  }
}
