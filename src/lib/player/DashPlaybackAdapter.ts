import type { MediaPlayerClass } from 'dashjs';
import {
  PlaybackAdapter,
  PlaybackAdapterEvents,
  PlaybackEngineType,
  QualityLevel,
  AudioTrackOption,
  SubtitleOption,
} from './types';
import { createPlayerError } from './playbackErrors';

export class DashPlaybackAdapter implements PlaybackAdapter {
  readonly engineType: PlaybackEngineType = 'dash';
  private player: MediaPlayerClass | null = null;
  private video: HTMLVideoElement | null = null;
  private sourceUrl: string = '';
  private listeners: { [K in keyof PlaybackAdapterEvents]?: Function[] } = {};

  private qualityLevels: QualityLevel[] = [];
  private audioTracks: AudioTrackOption[] = [];
  private subtitleTracks: SubtitleOption[] = [];

  private currentQualityLevel: number = -1; // -1 = Auto
  private currentAudioTrackIndex: number = 0;
  private currentSubtitleIndex: number = -1; // -1 = Off
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
        console.error(`Error in DashPlaybackAdapter listener for ${event}:`, err);
      }
    });
  }

  async initialize(video: HTMLVideoElement, sourceUrl: string): Promise<void> {
    this.destroy();

    this.video = video;
    this.sourceUrl = sourceUrl;

    if (typeof window === 'undefined') return;

    const { MediaPlayer } = await import('dashjs');
    const player = MediaPlayer().create();
    this.player = player;

    player.updateSettings({
      streaming: {
        buffer: {
          fastSwitchEnabled: true,
          initialBufferLevel: this.isLowNetwork ? 4 : 2,
          bufferTimeDefault: this.isLowNetwork ? 30 : 20,
          bufferTimeAtTopQuality: this.isLowNetwork ? 60 : 45,
          bufferToKeep: 60,
        },
        abr: {
          autoSwitchBitrate: {
            video: true,
            audio: true,
          },
          throughput: {
            bandwidthSafetyFactor: this.isLowNetwork ? 0.65 : 0.85,
          },
        },
        retryIntervals: {
          MPD: 1000,
          MediaSegment: 1000,
          InitializationSegment: 1000,
          BitratePermutations: 1000,
        },
        retryAttempts: {
          MPD: 4,
          MediaSegment: 6,
          InitializationSegment: 4,
          BitratePermutations: 4,
        },
      },
    } as any);

    player.initialize(video, sourceUrl, true);

    player.on('streamInitialized', () => {
      this.extractTracks();
      this.emit('manifestParsed', this.qualityLevels, this.audioTracks, this.subtitleTracks);
    });

    player.on('qualityChangeRendered', (e: any) => {
      if (e.mediaType === 'video') {
        const isAuto = player.getSettings().streaming?.abr?.autoSwitchBitrate?.video !== false;
        this.currentQualityLevel = isAuto ? -1 : e.newQuality;
        this.emit('qualitySwitched', this.currentQualityLevel);
      }
    });

    player.on('bufferStalled', () => {
      this.emit('buffering', true);
    });

    player.on('bufferLoaded', () => {
      this.emit('buffering', false);
    });

    player.on('error', (e: any) => {
      const errorMsg = e.error?.message || e.event?.message || 'DASH playback error';
      this.emit(
        'error',
        createPlayerError(
          'MANIFEST_LOAD_ERROR',
          'Encountered error while loading MPEG-DASH manifest or segment.',
          errorMsg,
          true
        )
      );
    });
  }

  private extractTracks(): void {
    if (!this.player) return;

    // Quality levels
    try {
      const reps = this.player.getRepresentationsByType('video') || [];
      this.qualityLevels = reps.map((r, idx) => ({
        id: idx,
        height: (r as any).height || 0,
        width: (r as any).width,
        bitrate: (r as any).bandwidth || (r as any).bitrateInKbit ? (r as any).bitrateInKbit * 1000 : 0,
        label: (r as any).height ? `${(r as any).height}p` : `Level ${idx + 1}`,
      }));
    } catch {
      this.qualityLevels = [];
    }

    // Audio tracks
    try {
      const audioList = this.player.getTracksFor('audio') || [];
      this.audioTracks = audioList.map((t, idx) => ({
        id: idx,
        label: (t as any).lang ? `Audio: ${(t as any).lang.toUpperCase()}` : `Track ${idx + 1}`,
        language: (t as any).lang,
        active: idx === 0,
      }));
    } catch {
      this.audioTracks = [];
    }

    // Text / Subtitle tracks
    try {
      const textList = this.player.getTracksFor('text') || [];
      this.subtitleTracks = textList.map((t, idx) => ({
        id: idx,
        label: (t as any).lang ? `Sub: ${(t as any).lang.toUpperCase()}` : `Subtitles ${idx + 1}`,
        language: (t as any).lang,
        kind: (t as any).kind,
      }));
    } catch {
      this.subtitleTracks = [];
    }
  }

  getQualityLevels(): QualityLevel[] {
    return this.qualityLevels;
  }

  getCurrentQuality(): number {
    return this.currentQualityLevel;
  }

  setQuality(levelId: number): void {
    if (!this.player) return;
    this.currentQualityLevel = levelId;

    if (levelId === -1) {
      this.player.updateSettings({
        streaming: { abr: { autoSwitchBitrate: { video: true } } },
      } as any);
    } else {
      this.player.updateSettings({
        streaming: { abr: { autoSwitchBitrate: { video: false } } },
      } as any);
      this.player.setRepresentationForTypeByIndex('video', levelId);
    }

    this.emit('qualitySwitched', levelId);
  }

  getAudioTracks(): AudioTrackOption[] {
    return this.audioTracks;
  }

  getCurrentAudioTrack(): number {
    return this.currentAudioTrackIndex;
  }

  setAudioTrack(trackId: number): void {
    if (!this.player) return;
    const tracks = this.player.getTracksFor('audio');
    if (tracks && tracks[trackId]) {
      this.currentAudioTrackIndex = trackId;
      this.player.setCurrentTrack(tracks[trackId]);
      this.emit('audioTrackSwitched', trackId);
    }
  }

  getSubtitleTracks(): SubtitleOption[] {
    return this.subtitleTracks;
  }

  getCurrentSubtitleTrack(): number {
    return this.currentSubtitleIndex;
  }

  setSubtitleTrack(subId: number): void {
    if (!this.player) return;
    this.currentSubtitleIndex = subId;

    if (subId === -1) {
      this.player.enableText(false);
    } else {
      this.player.enableText(true);
      this.player.setTextTrack(subId);
    }

    this.emit('subtitleSwitched', subId);
  }

  retry(): void {
    if (!this.video || !this.sourceUrl) return;
    this.initialize(this.video, this.sourceUrl).catch(() => {});
  }

  destroy(): void {
    if (this.player) {
      try {
        this.player.reset();
        this.player.destroy();
      } catch (e) {
        console.warn('Error destroying DASH player instance:', e);
      }
      this.player = null;
    }
    this.video = null;
    this.qualityLevels = [];
    this.audioTracks = [];
    this.subtitleTracks = [];
  }
}
