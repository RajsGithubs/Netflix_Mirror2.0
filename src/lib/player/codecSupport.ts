import { PlaybackEngineType } from './types';

export interface CodecCapability {
  name: string;
  mime: string;
  supported: boolean;
  isHardwareLikely?: boolean;
}

export interface CompatibilityCheckResult {
  isCompatible: boolean;
  recommendedEngine: PlaybackEngineType;
  unsupportedReason?: string;
  bestVideoCodec: string;
  bestAudioCodec: string;
  codecs: Record<string, boolean>;
  containerDetected: 'hls' | 'dash' | 'mp4' | 'unknown';
}

/**
 * Inspect codec and browser capability using canPlayType and MediaSource.isTypeSupported
 */
export function inspectCodecSupport(mimeType: string) {
  if (typeof window === 'undefined') {
    return { nativeSupport: '', mediaSourceSupport: false };
  }
  const video = document.createElement('video');
  const nativeSupport = video.canPlayType(mimeType);
  const mediaSourceSupport =
    typeof MediaSource !== 'undefined' && MediaSource.isTypeSupported(mimeType);

  return {
    nativeSupport,
    mediaSourceSupport,
  };
}

/**
 * Proactively checks if the given media URL and format is compatible with the client browser.
 */
export function checkStreamCompatibility(url?: string): CompatibilityCheckResult {
  if (typeof window === 'undefined') {
    return {
      isCompatible: true,
      recommendedEngine: 'hls',
      bestVideoCodec: 'H.264',
      bestAudioCodec: 'AAC',
      codecs: { h264: true, aac: true },
      containerDetected: 'hls',
    };
  }

  const cleanUrl = (url || '').split('?')[0].toLowerCase();
  let container: 'hls' | 'dash' | 'mp4' | 'unknown' = 'unknown';

  if (cleanUrl.endsWith('.m3u8') || cleanUrl.includes('.m3u8')) {
    container = 'hls';
  } else if (cleanUrl.endsWith('.mpd') || cleanUrl.includes('.mpd')) {
    container = 'dash';
  } else if (cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.mkv')) {
    container = 'mp4';
  }

  const video = document.createElement('video');
  const mse = typeof window !== 'undefined' && 'MediaSource' in window ? window.MediaSource : null;

  const testType = (mime: string): boolean => {
    try {
      const canPlay = video.canPlayType(mime);
      if (canPlay === 'probably' || canPlay === 'maybe') return true;
      if (mse && mse.isTypeSupported(mime)) return true;
    } catch {
      // testType failure ignored
    }
    return false;
  };

  const h264 = testType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"') || testType('video/mp4; codecs="avc1.640028"');
  const h265 = testType('video/mp4; codecs="hvc1.1.6.L93.B0"') || testType('video/mp4; codecs="hev1.1.6.L93.B0"');
  const av1 = testType('video/mp4; codecs="av01.0.08M.08"') || testType('video/webm; codecs="av01.0.08M.08"');
  const vp9 = testType('video/webm; codecs="vp9, opus"') || testType('video/webm; codecs="vp09.00.10.08"');

  const aac = testType('audio/mp4; codecs="mp4a.40.2"');
  const dolby = testType('audio/mp4; codecs="ec-3"') || testType('audio/mp4; codecs="ac-3"');
  const opus = testType('audio/webm; codecs="opus"');

  let bestVideoCodec = 'H.264';
  if (av1) bestVideoCodec = 'AV1';
  else if (h265) bestVideoCodec = 'HEVC';
  else if (vp9) bestVideoCodec = 'VP9';

  let bestAudioCodec = 'AAC';
  if (dolby) bestAudioCodec = 'Dolby Digital';
  else if (opus) bestAudioCodec = 'Opus';

  const codecs = { h264, h265, av1, vp9, aac, dolby, opus };

  // Engine recommendation
  let recommendedEngine: PlaybackEngineType = 'hls';
  let isCompatible = true;
  let unsupportedReason: string | undefined;

  const canPlayNativeHls = video.canPlayType('application/vnd.apple.mpegurl') !== '';
  const hasMse = Boolean(mse);

  if (container === 'dash') {
    recommendedEngine = 'dash';
    if (!hasMse) {
      isCompatible = false;
      unsupportedReason = 'MPEG-DASH requires MediaSource Extensions (MSE), which is unavailable in this browser.';
    }
  } else if (container === 'hls') {
    if (canPlayNativeHls && !hasMse) {
      recommendedEngine = 'native'; // e.g. iOS Safari
    } else {
      recommendedEngine = 'hls';
    }
  } else if (container === 'mp4') {
    recommendedEngine = 'native';
  } else {
    // Default fallback based on capabilities
    recommendedEngine = hasMse ? 'hls' : canPlayNativeHls ? 'native' : 'native';
  }

  // Check if H.264 baseline is supported
  if (!h264 && !vp9) {
    isCompatible = false;
    unsupportedReason = 'Browser lacks standard H.264 video decoding capabilities.';
  }

  return {
    isCompatible,
    recommendedEngine,
    unsupportedReason,
    bestVideoCodec,
    bestAudioCodec,
    codecs,
    containerDetected: container,
  };
}
