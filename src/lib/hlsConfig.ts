import type { HlsConfig } from 'hls.js';

/**
 * Standard desktop and mobile HLS.js configuration.
 * Adheres to production recommendations:
 * - ABR starting in Auto (-1)
 * - capLevelToPlayerSize enabled to save bandwidth matching display size
 * - Bounded buffer lengths (45s forward, 90s max, 90s back-buffer)
 * - Fine-tuned timeouts and bounded retries
 */
export function getAdaptiveHlsConfig(isLowNetwork: boolean = false): Partial<HlsConfig> {
  return {
    enableWorker: true,
    startLevel: isLowNetwork ? 0 : -1,
    capLevelToPlayerSize: true,
    maxBufferLength: isLowNetwork ? 60 : 45,
    maxMaxBufferLength: isLowNetwork ? 120 : 90,
    backBufferLength: 90,
    maxBufferSize: 60 * 1000 * 1000, // 60MB RAM cap
    maxBufferHole: 0.5,
    highBufferWatchdogPeriod: 2,
    nudgeOffset: 0.2,
    nudgeMaxRetry: 10,
    abrBandWidthFactor: isLowNetwork ? 0.65 : 0.85,
    abrBandWidthUpFactor: isLowNetwork ? 0.55 : 0.7,
    fragLoadingTimeOut: 20000,
    fragLoadingMaxRetry: 6,
    fragLoadingRetryDelay: 1000,
    fragLoadingMaxRetryTimeout: 64000,
    manifestLoadingTimeOut: 15000,
    manifestLoadingMaxRetry: 4,
    manifestLoadingRetryDelay: 1000,
    levelLoadingTimeOut: 15000,
    levelLoadingMaxRetry: 4,
    levelLoadingRetryDelay: 1000,
  };
}
