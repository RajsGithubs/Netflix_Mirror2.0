/**
 * StreamVerse Original Brand Sonic Logo Engine
 * Synthesizes a signature, rich cinematic audio mark using native Web Audio API.
 * 100% original synthesis: Resonant sub-bass swell + shimmering crystalline harmonic resolve.
 * Zero external audio files required.
 */

let lastPlayedTime = 0;
const THROTTLE_MS = 1400;

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem('streamverse_sound_enabled') !== 'false';
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('streamverse_sound_enabled', enabled ? 'true' : 'false');
}

/**
 * Synthesizes StreamVerse's signature brand sound mark.
 * Designed with a 65Hz warm cinematic sub-rumble accelerating into a 130Hz harmonic resonance,
 * followed by a 520Hz crystalline chime resolve with subtle stereophonic decay.
 */
export function playBrandSound(): void {
  if (typeof window === 'undefined') return;
  if (!isSoundEnabled()) return;

  const now = Date.now();
  if (now - lastPlayedTime < THROTTLE_MS) return;
  lastPlayedTime = now;

  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const t = ctx.currentTime;

    // Master Gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.7, t);
    masterGain.connect(ctx.destination);

    // 1. Warm Resonant Sub-Bass Sweep (Cinema Rumble)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(55, t); // A1 note
    subOsc.frequency.exponentialRampToValueAtTime(110, t + 0.35); // Glides to A2
    subOsc.frequency.exponentialRampToValueAtTime(73.4, t + 1.1); // Drops to D2

    subGain.gain.setValueAtTime(0.001, t);
    subGain.gain.linearRampToValueAtTime(0.85, t + 0.12);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    subOsc.connect(subGain);
    subGain.connect(masterGain);

    // 2. Mid-Frequency Cinematic Body (Brass-like warmth)
    const midOsc = ctx.createOscillator();
    const midGain = ctx.createGain();
    midOsc.type = 'sawtooth';
    midOsc.frequency.setValueAtTime(110, t);
    midOsc.frequency.exponentialRampToValueAtTime(220, t + 0.3);

    // Low-pass filter to soften sawtooth brightness
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, t);
    filter.frequency.exponentialRampToValueAtTime(650, t + 0.35);
    filter.frequency.exponentialRampToValueAtTime(180, t + 1.1);

    midGain.gain.setValueAtTime(0.001, t);
    midGain.gain.linearRampToValueAtTime(0.35, t + 0.14);
    midGain.gain.exponentialRampToValueAtTime(0.001, t + 1.15);

    midOsc.connect(filter);
    filter.connect(midGain);
    midGain.connect(masterGain);

    // 3. Shimmering Crystal Harmonic Chime (Signature Accent Chime at +0.35s)
    const chimeOsc = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    chimeOsc.type = 'sine';
    chimeOsc.frequency.setValueAtTime(587.33, t + 0.28); // D5
    chimeOsc.frequency.exponentialRampToValueAtTime(880, t + 0.55); // A5

    chimeGain.gain.setValueAtTime(0.001, t);
    chimeGain.gain.setValueAtTime(0.001, t + 0.28);
    chimeGain.gain.linearRampToValueAtTime(0.25, t + 0.38);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);

    chimeOsc.connect(chimeGain);
    chimeGain.connect(masterGain);

    // Start all components
    subOsc.start(t);
    midOsc.start(t);
    chimeOsc.start(t + 0.28);

    // Stop and cleanup
    subOsc.stop(t + 1.25);
    midOsc.stop(t + 1.25);
    chimeOsc.stop(t + 1.35);

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1600);
  } catch (err) {
    // Non-blocking fallback for browsers that strictly restrict audio without interaction
    console.debug('Brand audio playback not available:', err);
  }
}
