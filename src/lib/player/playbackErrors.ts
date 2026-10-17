import { PlayerError, PlayerErrorCode } from './types';

/**
 * Normalizes error messages and strips internal credentials or tokens.
 */
export function sanitizeErrorMessage(rawMessage?: string): string {
  if (!rawMessage) return 'An unexpected playback error occurred.';
  // Strip query parameters that might carry tokens or credentials
  return rawMessage
    .replace(/\?[a-zA-Z0-9_\-.~%&=]+/g, '')
    .replace(/http[s]?:\/\/[^\s]+/g, (url) => {
      try {
        const u = new URL(url);
        return `${u.protocol}//${u.host}${u.pathname}`;
      } catch {
        return 'media resource';
      }
    });
}

export function createPlayerError(
  code: PlayerErrorCode,
  message: string,
  details?: string,
  recoverable: boolean = false
): PlayerError {
  return {
    code,
    message,
    details: details ? sanitizeErrorMessage(details) : undefined,
    recoverable,
  };
}

export function mapMediaErrorCode(mediaError: MediaError | null): PlayerError {
  if (!mediaError) {
    return createPlayerError('UNKNOWN_PLAYBACK_ERROR', 'Unknown media error.');
  }

  switch (mediaError.code) {
    case MediaError.MEDIA_ERR_ABORTED:
      return createPlayerError(
        'UNKNOWN_PLAYBACK_ERROR',
        'Video playback was aborted by the browser.',
        undefined,
        true
      );
    case MediaError.MEDIA_ERR_NETWORK:
      return createPlayerError(
        'NETWORK_TIMEOUT',
        'A network connection error prevented the video from loading. Please check your connection.',
        mediaError.message,
        true
      );
    case MediaError.MEDIA_ERR_DECODE:
      return createPlayerError(
        'MEDIA_DECODE_ERROR',
        'Media decoding failed. The stream format or codec profile might be corrupted or unsupported.',
        mediaError.message,
        false
      );
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return createPlayerError(
        'CODEC_UNSUPPORTED',
        'The video format, container, or codec is not supported by your browser.',
        mediaError.message,
        false
      );
    default:
      return createPlayerError(
        'UNKNOWN_PLAYBACK_ERROR',
        'An unclassified media error occurred during playback.',
        mediaError.message,
        true
      );
  }
}
