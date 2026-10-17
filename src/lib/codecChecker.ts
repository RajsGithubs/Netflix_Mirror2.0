/**
 * Client Hardware & Software Codec Detection Utility
 * Uses MediaSource.isTypeSupported and HTMLVideoElement.canPlayType
 * to evaluate hardware and browser acceleration capabilities.
 */

export interface CodecSupportReport {
  h264: boolean;      // AVC / H.264
  h265: boolean;      // HEVC / H.265
  av1: boolean;       // AV1
  vp9: boolean;       // VP9
  aac: boolean;       // AAC Audio
  dolby: boolean;     // Dolby Digital Plus / AC-3 / E-AC-3
  opus: boolean;      // Opus Audio
  bestVideoCodec: 'AV1' | 'HEVC' | 'VP9' | 'H.264';
  bestAudioCodec: 'Dolby Digital' | 'AAC' | 'Opus';
}

export function detectSupportedCodecs(): CodecSupportReport {
  if (typeof window === 'undefined') {
    return {
      h264: true,
      h265: false,
      av1: false,
      vp9: true,
      aac: true,
      dolby: false,
      opus: true,
      bestVideoCodec: 'H.264',
      bestAudioCodec: 'AAC',
    };
  }

  const video = document.createElement('video');
  const mse = typeof window !== 'undefined' && 'MediaSource' in window ? window.MediaSource : null;

  const testType = (mime: string): boolean => {
    try {
      const canPlay = video.canPlayType(mime);
      if (canPlay === 'probably' || canPlay === 'maybe') return true;
      if (mse && mse.isTypeSupported(mime)) return true;
    } catch {
      // ignore check error
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

  let bestVideoCodec: 'AV1' | 'HEVC' | 'VP9' | 'H.264' = 'H.264';
  if (av1) bestVideoCodec = 'AV1';
  else if (h265) bestVideoCodec = 'HEVC';
  else if (vp9) bestVideoCodec = 'VP9';

  let bestAudioCodec: 'Dolby Digital' | 'AAC' | 'Opus' = 'AAC';
  if (dolby) bestAudioCodec = 'Dolby Digital';
  else if (opus) bestAudioCodec = 'Opus';

  return {
    h264,
    h265,
    av1,
    vp9,
    aac,
    dolby,
    opus,
    bestVideoCodec,
    bestAudioCodec,
  };
}
