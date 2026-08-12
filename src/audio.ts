// All sound is synthesized here. No external audio files (third-party rights) and
// no autoplay: the AudioContext is created only inside a click handler.
// Everything audible is computed at runtime: the drone, bot voices, the bell.

let ctx: AudioContext | null = null;

type Maker = new () => AudioContext;

/** The context is created ONLY from a user gesture; otherwise browsers keep it muted. */
export function audioOnGesture(): AudioContext | null {
  const w = window as unknown as { AudioContext?: Maker; webkitAudioContext?: Maker };
  const Maker = w.AudioContext || w.webkitAudioContext;
  if (!Maker) return null;
  if (!ctx) {
    try {
      ctx = new Maker();
    } catch (e) {
      return null;
    }
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function audioAlive(): boolean {
  return !!ctx && ctx.state !== 'closed';
}

interface ToneOpts {
  type?: OscillatorType;
  gain?: number;
  attack?: number;
  release?: number;
  detune?: number;
}

/** One note with a soft envelope. Returns the time at which it goes silent. */
export function tone(a: AudioContext, freq: number, at: number, dur: number, o: ToneOpts = {}): number {
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = o.type || 'sine';
  osc.frequency.setValueAtTime(freq, at);
  if (o.detune) osc.detune.setValueAtTime(o.detune, at);
  const peak = o.gain === undefined ? 0.14 : o.gain;
  const atk = o.attack === undefined ? 0.02 : o.attack;
  const rel = o.release === undefined ? 0.25 : o.release;
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), at + atk);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur + rel);
  osc.connect(g).connect(a.destination);
  osc.start(at);
  osc.stop(at + dur + rel + 0.05);
  return at + dur + rel;
}

export interface Drone {
  stop(): void;
}

/**
 * Om drone: a root tone plus two detuned copies plus the fifth.
 * The beating between the detuned voices is what makes the drone sound alive.
 */
export function omDrone(a: AudioContext, base = 108): Drone {
  const master = a.createGain();
  master.gain.setValueAtTime(0.0001, a.currentTime);
  master.gain.exponentialRampToValueAtTime(0.09, a.currentTime + 1.6);
  master.connect(a.destination);

  const parts = [
    { f: base, d: 0, t: 'sine' as OscillatorType, g: 1 },
    { f: base, d: 7, t: 'sine' as OscillatorType, g: 0.8 },
    { f: base, d: -9, t: 'triangle' as OscillatorType, g: 0.45 },
    { f: base * 1.5, d: 4, t: 'sine' as OscillatorType, g: 0.3 },
    { f: base * 2, d: -5, t: 'sine' as OscillatorType, g: 0.16 },
  ];
  const oscs = parts.map((p) => {
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = p.t;
    o.frequency.setValueAtTime(p.f, a.currentTime);
    o.detune.setValueAtTime(p.d, a.currentTime);
    g.gain.setValueAtTime(p.g, a.currentTime);
    o.connect(g).connect(master);
    o.start();
    return o;
  });

  // slow amplitude breathing so the drone is not a flat, dead level
  const lfo = a.createOscillator();
  const lfoG = a.createGain();
  lfo.frequency.setValueAtTime(0.13, a.currentTime);
  lfoG.gain.setValueAtTime(0.022, a.currentTime);
  lfo.connect(lfoG).connect(master.gain);
  lfo.start();

  return {
    stop(): void {
      const t = a.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(Math.max(0.0002, master.gain.value), t);
      master.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
      oscs.forEach((o) => o.stop(t + 1.1));
      lfo.stop(t + 1.1);
    },
  };
}

/** Bot voice: one short chirping syllable. Twenty of them make a cacophony. */
export function botVoice(a: AudioContext, seed: number, at = 0): void {
  const t = (at || a.currentTime) + 0.001;
  const base = 320 + ((seed * 137) % 520);
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = seed % 3 === 0 ? 'square' : seed % 3 === 1 ? 'sawtooth' : 'triangle';
  osc.frequency.setValueAtTime(base, t);
  osc.frequency.linearRampToValueAtTime(base * (seed % 2 ? 1.35 : 0.72), t + 0.09);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.05, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  osc.connect(g).connect(a.destination);
  osc.start(t);
  osc.stop(t + 0.2);
}

/**
 * "Om" blessing. First a bowl strike with inharmonic overtones, like a real singing
 * bowl, and underneath it a low syllable that blooms into a fifth and slowly fades.
 * Fully synthesized, no samples.
 */
export function omBless(a: AudioContext): void {
  const t0 = a.currentTime + 0.02;
  // bowl: overtones are deliberately non-integer ratios, which is how metal rings
  [1, 2.74, 5.4, 8.9].forEach((k, i) => {
    tone(a, 196 * k, t0, 2.2 - i * 0.3, {
      type: 'sine',
      gain: 0.085 / (i + 1.5),
      attack: 0.006,
      release: 2.6 - i * 0.4,
    });
  });
  // the syllable: root, octave and fifth enter staggered and fade out together
  [98, 147, 196].forEach((f, i) => {
    tone(a, f, t0 + 0.05 + i * 0.22, 2.1 - i * 0.2, {
      type: i === 0 ? 'sine' : 'triangle',
      gain: 0.075 - i * 0.016,
      attack: 0.5,
      release: 2.2,
      detune: i * 5,
    });
  });
}

/** Water splash: a short noise burst through a downward-sweeping filter. */
export function waterSplash(a: AudioContext): void {
  const dur = 1.5;
  const rate = a.sampleRate;
  const buf = a.createBuffer(1, Math.floor(rate * dur), rate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i += 1) {
    const k = 1 - i / d.length;
    d[i] = (Math.random() * 2 - 1) * k * k;
  }
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.setValueAtTime(1800, a.currentTime);
  f.frequency.exponentialRampToValueAtTime(280, a.currentTime + dur);
  f.Q.setValueAtTime(0.8, a.currentTime);
  const g = a.createGain();
  g.gain.setValueAtTime(0.16, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
  src.connect(f).connect(g).connect(a.destination);
  src.start();
}

/**
 * Moo: a short syllable with falling pitch and a throaty resonant filter — a cow
 * built out of one oscillator. Each successive call is slightly lower in pitch.
 */
export function moo(a: AudioContext, n: number): void {
  const t = a.currentTime + 0.005;
  const base = 128 - Math.min(28, n * 0.35) + (n % 3) * 5;
  const osc = a.createOscillator();
  const g = a.createGain();
  const f = a.createBiquadFilter();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(base * 1.32, t);
  osc.frequency.exponentialRampToValueAtTime(base, t + 0.1);
  osc.frequency.exponentialRampToValueAtTime(base * 0.78, t + 0.26);
  f.type = 'lowpass';
  f.frequency.setValueAtTime(760, t);
  f.frequency.exponentialRampToValueAtTime(320, t + 0.28);
  f.Q.setValueAtTime(6, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.055, t + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  osc.connect(f).connect(g).connect(a.destination);
  osc.start(t);
  osc.stop(t + 0.34);
}

/**
 * An allusion to the "sigma boy" tune: four original notes. The track itself is
 * never bundled — third-party audio stays third-party; only a link to the clip is
 * kept. Plays ONLY on click (see audioOnGesture).
 */
export function sigmaMotif(a: AudioContext): void {
  const t0 = a.currentTime + 0.02;
  // D-D-A-F#: a short step up followed by a fall, matching the four-syllable hook
  const notes: Array<[number, number]> = [
    [293.66, 0.0],
    [293.66, 0.16],
    [440.0, 0.32],
    [369.99, 0.5],
  ];
  notes.forEach(([f, dt], i) => {
    tone(a, f, t0 + dt, i === 3 ? 0.26 : 0.12, {
      type: 'square',
      gain: 0.035,
      attack: 0.008,
      release: 0.14,
    });
    // quiet octave below so the motif reads as a terminal beep, not a thin squeak
    tone(a, f / 2, t0 + dt, i === 3 ? 0.26 : 0.12, {
      type: 'triangle',
      gain: 0.02,
      attack: 0.01,
      release: 0.18,
    });
  });
}

/**
 * NOTE: Chrome returns an EMPTY getVoices() on the first call — the list arrives
 * asynchronously. So we warm it up at module load, and by the first click the voices
 * are in place. This makes no sound and registers nothing: it only requests the list.
 */
function primeVoices(): void {
  try {
    const synth = window.speechSynthesis;
    if (!synth || !synth.getVoices) return;
    synth.getVoices();
    if ('onvoiceschanged' in synth) {
      synth.addEventListener('voiceschanged', () => {
        synth.getVoices();
      });
    }
  } catch (e) {
    // no speech synthesis available: fall back silently to synthesized notes
  }
}
primeVoices();

/**
 * Robotic terminal voice singing the hook. Entirely local: the browser's
 * speechSynthesis, no network and not a second of third-party recording.
 * Returns false when speech synthesis is unavailable (headless, disabled, no
 * voices), in which case the caller plays the beep motif instead.
 */
export function speakSigma(): boolean {
  try {
    const synth = window.speechSynthesis;
    if (!synth || typeof window.SpeechSynthesisUtterance !== 'function') return false;
    const voices = synth.getVoices ? synth.getVoices() : [];
    if (!voices.length) return false; // voice list not ready: only the motif plays
    const ru = voices.find((v) => /^ru/i.test(v.lang));
    const u = new SpeechSynthesisUtterance(ru ? 'сигма сигма бой, сигма бой' : 'sigma sigma boy, sigma boy');
    if (ru) {
      u.voice = ru;
      u.lang = ru.lang;
    } else {
      u.lang = 'en-US';
    }
    u.rate = 1.05;
    u.pitch = 0.4; // below human range, for the terminal-robot timbre
    u.volume = 0.9;
    synth.cancel();
    synth.speak(u);
    return true;
  } catch (e) {
    return false;
  }
}

/** Dry click tick for the mini console: the "done" sound. */
export function blip(a: AudioContext, up: boolean): void {
  const t = a.currentTime + 0.005;
  tone(a, up ? 880 : 660, t, 0.05, { type: 'square', gain: 0.03, attack: 0.004, release: 0.08 });
}
