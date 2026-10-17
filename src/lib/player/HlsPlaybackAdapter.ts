import Hls, { ErrorData } from 'hls.js';
import {
  PlaybackAdapter,
  PlaybackAdapterEvents,
  PlaybackEngineType,
  QualityLevel,
  AudioTrackOption,
  SubtitleOption,
} from './types';
import { getAdaptiveHlsConfig } from '../hlsConfig';
import { createPlayerError } from './playbackErrors';

export class HlsPlaybackAdapter implements PlaybackAdapter {
  readonly engineType: PlaybackEngineType = 'hls';
  private hls: Hls | null = null;
  private video: HTMLVideoElement | null = null;
  private sourceUrl: string = '';
  private listeners: { [K in keyof PlaybackAdapterEvents]?: Function[] } = {};

  private qualityLevels: QualityLevel[] = [];
  private audioTracks: AudioTrackOption[] = [];
  private subtitleTracks: SubtitleOption[] = [];

  private currentQualityLevel: number = -1; // -1 = Auto
  private currentAudioTrackId: number = 0;
  private currentSubtitleId: number = -1; // -1 = Off

  private networkRetryCount: number = 0;
  private mediaRecoveryCount: number = 0;
  private isLowNetwork: boolean = false;

  constructor(isLowNetwork: boolean = false) {
    this.isLowNetwork = isLowNetwork;
  }

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
        console.error(`Error in HlsPlaybackAdapter listener for ${event}:`, err);
      }
    });
  }

  async initialize(video: HTMLVideoElement, sourceUrl: string): Promise<void> {
    this.destroy();

    this.video = video;
    this.sourceUrl = sourceUrl;
    this.networkRetryCount = 0;
    this.mediaRecoveryCount = 0;

    if (!Hls.isSupported()) {
      throw new Error('HLS is not supported in this browser via MediaSource.');
    }

    const config = getAdaptiveHlsConfig(this.isLowNetwork);
    const hls = new Hls(config);
    this.hls = hls;

    hls.attachMedia(video);

    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      hls.loadSource(sourceUrl);
    });

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      this.extractQualityLevels();
      this.extractAudioTracks();
      this.extractSubtitleTracks();

      this.emit('manifestParsed', this.qualityLevels, this.audioTracks, this.subtitleTracks);

      // Attempt initial playback if autoplay permitted
      video.play().catch(() => {
        // Autoplay may be blocked by user-gesture policy; normal for browsers
      });
    });

    hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
      this.currentQualityLevel = hls.autoLevelEnabled ? -1 : data.level;
      this.emit('qualitySwitched', this.currentQualityLevel);
    });

    hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, () => {
      this.extractAudioTracks();
      this.emit('manifestParsed', this.qualityLevels, this.audioTracks, this.subtitleTracks);
    });

    hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (_, data) => {
      this.currentAudioTrackId = data.id;
      this.emit('audioTrackSwitched', data.id);
    });

    hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, () => {
      this.extractSubtitleTracks();
      this.emit('manifestParsed', this.qualityLevels, this.audioTracks, this.subtitleTracks);
    });

    hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, (_, data) => {
      this.currentSubtitleId = data.id;
      this.emit('subtitleSwitched', data.id);
    });

    hls.on(Hls.Events.FRAG_LOADING, () => {
      // Fragment loading started
    });

    hls.on(Hls.Events.FRAG_LOADED, () => {
      this.emit('buffering', false);
    });

    hls.on(Hls.Events.ERROR, (_, data) => {
      this.handleHlsError(data);
    });
  }

  private extractQualityLevels(): void {
    if (!this.hls || !this.hls.levels) {
      this.qualityLevels = [];
      return;
    }

    this.qualityLevels = this.hls.levels.map((lvl, index) => {
      const height = lvl.height || 0;
      return {
        id: index,
        height,
        width: lvl.width,
        bitrate: lvl.bitrate,
        label: height > 0 ? `${height}p` : `Level ${index + 1}`,
      };
    });
  }

  private extractAudioTracks(): void {
    if (!this.hls || !this.hls.audioTracks) {
      this.audioTracks = [];
      return;
    }

    this.audioTracks = this.hls.audioTracks.map((track, idx) => ({
      id: idx,
      label: track.name || track.lang || `Audio Track ${idx + 1}`,
      language: track.lang,
      active: this.hls?.audioTrack === idx,
    }));
  }

  private extractSubtitleTracks(): void {
    if (!this.hls || !this.hls.subtitleTracks) {
      this.subtitleTracks = [];
      return;
    }

    this.subtitleTracks = this.hls.subtitleTracks.map((sub, idx) => ({
      id: idx,
      label: sub.name || sub.lang || `Track ${idx + 1}`,
      language: sub.lang,
      active: this.hls?.subtitleTrack === idx,
    }));
  }

  private handleHlsError(data: ErrorData): void {
    if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
      this.emit('buffering', true);
    }

    if (!data.fatal) {
      return;
    }

    switch (data.type) {
      case Hls.ErrorTypes.NETWORK_ERROR:
        if (this.networkRetryCount < 3) {
          this.networkRetryCount += 1;
          const delay = Math.min(1000 * Math.pow(1.5, this.networkRetryCount), 4000);
          setTimeout(() => {
            if (this.hls) {
              this.hls.startLoad();
              this.emit('recovered');
            }
          }, delay);
        } else {
          this.emit(
            'error',
            createPlayerError(
              'NETWORK_TIMEOUT',
              'Connection to streaming manifest timed out after multiple retries.',
              data.details,
              true
            )
          );
        }
        break;

      case Hls.ErrorTypes.MEDIA_ERROR:
        if (this.mediaRecoveryCount === 0) {
          this.mediaRecoveryCount += 1;
          this.hls?.recoverMediaError();
          this.emit('recovered');
        } else if (this.mediaRecoveryCount === 1) {
          this.mediaRecoveryCount += 1;
          // Attempt swapping audio codec before giving up
          this.hls?.swapAudioCodec();
          this.hls?.recoverMediaError();
          this.emit('recovered');
        } else {
          this.emit(
            'error',
            createPlayerError(
              'MEDIA_DECODE_ERROR',
              'Unrecoverable media decoding error encountered in video stream.',
              data.details,
              false
            )
          );
        }
        break;

      default:
        this.emit(
          'error',
          createPlayerError(
            'INITIALIZATION_FAILED',
            'Fatal media engine error encountered while loading stream.',
            data.details,
            false
          )
        );
        this.destroy();
        break;
    }
  }

  getQualityLevels(): QualityLevel[] {
    return this.qualityLevels;
  }

  getCurrentQuality(): number {
    return this.currentQualityLevel;
  }

  setQuality(levelId: number): void {
    if (!this.hls) return;
    this.currentQualityLevel = levelId;
    this.hls.currentLevel = levelId; // -1 for Auto
    this.emit('qualitySwitched', levelId);
  }

  getAudioTracks(): AudioTrackOption[] {
    return this.audioTracks;
  }

  getCurrentAudioTrack(): number {
    return this.hls?.audioTrack ?? this.currentAudioTrackId;
  }

  setAudioTrack(trackId: number): void {
    if (!this.hls) return;
    this.currentAudioTrackId = trackId;
    this.hls.audioTrack = trackId;
    this.emit('audioTrackSwitched', trackId);
  }

  getSubtitleTracks(): SubtitleOption[] {
    return this.subtitleTracks;
  }

  getCurrentSubtitleTrack(): number {
    return this.hls?.subtitleDisplay ? (this.hls.subtitleTrack ?? -1) : -1;
  }

  setSubtitleTrack(subId: number): void {
    if (!this.hls) return;
    this.currentSubtitleId = subId;
    if (subId === -1) {
      this.hls.subtitleDisplay = false;
      this.hls.subtitleTrack = -1;
    } else {
      this.hls.subtitleTrack = subId;
      this.hls.subtitleDisplay = true;
    }
    this.emit('subtitleSwitched', subId);
  }

  retry(): void {
    if (!this.video || !this.sourceUrl) return;
    this.initialize(this.video, this.sourceUrl).catch(() => {});
  }

  destroy(): void {
    if (this.hls) {
      try {
        this.hls.detachMedia();
        this.hls.destroy();
      } catch (e) {
        console.warn('Error destroying HLS instance:', e);
      }
      this.hls = null;
    }
    this.video = null;
    this.qualityLevels = [];
    this.audioTracks = [];
    this.subtitleTracks = [];
  }
}
