import {
  PlaybackAdapter,
  PlaybackAdapterEvents,
  PlaybackEngineType,
  QualityLevel,
  AudioTrackOption,
  SubtitleOption,
} from './types';
import { mapMediaErrorCode } from './playbackErrors';

export class NativePlaybackAdapter implements PlaybackAdapter {
  readonly engineType: PlaybackEngineType = 'native';
  private video: HTMLVideoElement | null = null;
  private sourceUrl: string = '';
  private listeners: { [K in keyof PlaybackAdapterEvents]?: Function[] } = {};

  private subtitleTracks: SubtitleOption[] = [];
  private currentSubtitleId: number = -1;

  on<K extends keyof PlaybackAdapterEvents>(event: K, handler: PlaybackAdapterEvents[K]): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]?.push(handler);
  }

  off<K extends keyof PlaybackAdapterEvents>(event: K, handler: PlaybackAdapterEvents[K]): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event]?.filter((h) => h !== handler);
  }

  private emit<K extends keyof PlaybackAdapterEvents>(event: K, ...args: Parameters<PlaybackAdapterEvents[K]>): void {
    this.listeners[event]?.forEach((h) => {
      try {
        (h as any)(...args);
      } catch (err) {
        console.error(`Error in NativePlaybackAdapter listener for ${event}:`, err);
      }
    });
  }

  async initialize(video: HTMLVideoElement, sourceUrl: string): Promise<void> {
    this.destroy();
    this.video = video;
    this.sourceUrl = sourceUrl;

    video.src = sourceUrl;

    const handleLoadedMetadata = () => {
      this.extractTextTracks();
      this.emit('manifestParsed', [], [], this.subtitleTracks);
      video.play().catch(() => {});
    };

    const handleWaiting = () => {
      this.emit('buffering', true);
    };

    const handlePlaying = () => {
      this.emit('buffering', false);
    };

    const handleError = () => {
      const err = mapMediaErrorCode(video.error);
      this.emit('error', err);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('error', handleError);
  }

  private extractTextTracks(): void {
    if (!this.video || !this.video.textTracks) {
      this.subtitleTracks = [];
      return;
    }

    const list: SubtitleOption[] = [];
    for (let i = 0; i < this.video.textTracks.length; i++) {
      const track = this.video.textTracks[i];
      list.push({
        id: i,
        label: track.label || track.language || `Track ${i + 1}`,
        language: track.language,
        kind: track.kind,
        active: track.mode === 'showing',
      });
    }
    this.subtitleTracks = list;
  }

  getQualityLevels(): QualityLevel[] {
    // Native HTML5 video does not expose arbitrary quality switching without MSE or manifest APIs
    return [];
  }

  getCurrentQuality(): number {
    return -1;
  }

  setQuality(_levelId: number): void {
    // No-op for single native media
  }

  getAudioTracks(): AudioTrackOption[] {
    return [];
  }

  getCurrentAudioTrack(): number {
    return 0;
  }

  setAudioTrack(_trackId: number): void {
    // No-op
  }

  getSubtitleTracks(): SubtitleOption[] {
    return this.subtitleTracks;
  }

  getCurrentSubtitleTrack(): number {
    return this.currentSubtitleId;
  }

  setSubtitleTrack(subId: number): void {
    if (!this.video || !this.video.textTracks) return;
    this.currentSubtitleId = subId;

    for (let i = 0; i < this.video.textTracks.length; i++) {
      const track = this.video.textTracks[i];
      if (i === subId) {
        track.mode = 'showing';
      } else {
        track.mode = 'hidden';
      }
    }

    this.emit('subtitleSwitched', subId);
  }

  retry(): void {
    if (!this.video || !this.sourceUrl) return;
    this.video.load();
    this.video.play().catch(() => {});
  }

  destroy(): void {
    if (this.video) {
      this.video.removeAttribute('src');
      this.video.load();
    }
    this.video = null;
    this.subtitleTracks = [];
  }
}
