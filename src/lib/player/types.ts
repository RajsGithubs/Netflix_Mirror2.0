export type PlaybackEngineType = 'hls' | 'dash' | 'native';

export interface QualityLevel {
  id: number; // -1 for Auto, or 0, 1, 2...
  height: number;
  width?: number;
  bitrate: number;
  label: string;
}

export interface AudioTrackOption {
  id: number;
  label: string;
  language?: string;
  active?: boolean;
}

export interface SubtitleOption {
  id: number; // -1 for Off, or index
  label: string;
  language?: string;
  kind?: string;
  active?: boolean;
}

export type PlayerErrorCode =
  | 'INVALID_SOURCE'
  | 'MANIFEST_LOAD_ERROR'
  | 'NETWORK_TIMEOUT'
  | 'CODEC_UNSUPPORTED'
  | 'MEDIA_DECODE_ERROR'
  | 'AUTOPLAY_RESTRICTED'
  | 'INITIALIZATION_FAILED'
  | 'UNKNOWN_PLAYBACK_ERROR';

export interface PlayerError {
  code: PlayerErrorCode;
  message: string;
  details?: string;
  recoverable?: boolean;
}

export interface PlaybackState {
  isPlaying: boolean;
  isBuffering: boolean;
  isInitialLoading: boolean;
  isStalled: boolean;
  currentTime: number;
  duration: number;
  bufferedEnd: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isFullscreen: boolean;
  isPiP: boolean;
  currentQuality: number; // -1 = Auto
  currentAudioTrack: number;
  currentSubtitle: number; // -1 = Off
  error: PlayerError | null;
  activeEngine: PlaybackEngineType;
}

export interface PlaybackAdapterEvents {
  manifestParsed: (qualities: QualityLevel[], audioTracks: AudioTrackOption[], subtitles: SubtitleOption[]) => void;
  qualitySwitched: (levelId: number) => void;
  audioTrackSwitched: (trackId: number) => void;
  subtitleSwitched: (subId: number) => void;
  buffering: (isBuffering: boolean) => void;
  error: (error: PlayerError) => void;
  recovered: () => void;
}

export interface PlaybackAdapter {
  readonly engineType: PlaybackEngineType;
  initialize(video: HTMLVideoElement, sourceUrl: string): Promise<void>;
  destroy(): void;
  getQualityLevels(): QualityLevel[];
  getCurrentQuality(): number;
  setQuality(levelId: number): void;
  getAudioTracks(): AudioTrackOption[];
  getCurrentAudioTrack(): number;
  setAudioTrack(trackId: number): void;
  getSubtitleTracks(): SubtitleOption[];
  getCurrentSubtitleTrack(): number;
  setSubtitleTrack(subId: number): void;
  retry(): void;
  on<K extends keyof PlaybackAdapterEvents>(event: K, handler: PlaybackAdapterEvents[K]): void;
  off<K extends keyof PlaybackAdapterEvents>(event: K, handler: PlaybackAdapterEvents[K]): void;
}
