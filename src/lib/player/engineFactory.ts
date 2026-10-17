import { PlaybackAdapter, PlaybackEngineType } from './types';
import { HlsPlaybackAdapter } from './HlsPlaybackAdapter';
import { DashPlaybackAdapter } from './DashPlaybackAdapter';
import { NativePlaybackAdapter } from './NativePlaybackAdapter';
import { checkStreamCompatibility } from './codecSupport';

export function createPlaybackAdapter(
  sourceUrl: string,
  isLowNetwork: boolean = false
): PlaybackAdapter {
  const check = checkStreamCompatibility(sourceUrl);

  switch (check.recommendedEngine) {
    case 'dash':
      return new DashPlaybackAdapter(isLowNetwork);
    case 'hls':
      return new HlsPlaybackAdapter(isLowNetwork);
    case 'native':
    default:
      return new NativePlaybackAdapter();
  }
}
