// The Nathia ambient wind (Web Audio), loaded on the first press of the sound toggle. Values: tokens.ambient.
import { ambient as A } from "../tokens";

export interface Ambient {
  set(on: boolean): void;
  close(): void;
}

/** Builds the wind graph (silent until set(true)); null where Web Audio is missing. */
export function createAmbient(): Ambient | null {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  const ctx = new Ctx();

  // Looping stereo brown noise.
  const length = A.seconds * ctx.sampleRate;
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    let last = 0;
    for (let i = 0; i < length; i++) {
      last = (last + A.brown.step * (Math.random() * 2 - 1)) / A.brown.leak;
      data[i] = last * A.brown.gain;
    }
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  // The body of the wind: a band-pass whose centre drifts, at a level that swells.
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = A.band.hz;
  band.Q.value = A.band.q;
  const sweep = ctx.createOscillator();
  sweep.frequency.value = A.band.sweepHz;
  const sweepDepth = ctx.createGain();
  sweepDepth.gain.value = A.band.sweepDepth;
  sweep.connect(sweepDepth).connect(band.frequency);
  const swell = ctx.createOscillator();
  swell.frequency.value = A.swell.hz;
  const swellDepth = ctx.createGain();
  swellDepth.gain.value = A.swell.depth;
  const body = ctx.createGain();
  body.gain.value = A.swell.base;
  swell.connect(swellDepth).connect(body.gain);

  // A faint high hiss.
  const high = ctx.createBiquadFilter();
  high.type = "highpass";
  high.frequency.value = A.hiss.hz;
  const hiss = ctx.createGain();
  hiss.gain.value = A.hiss.level;

  const master = ctx.createGain();
  master.gain.value = 0;
  noise.connect(band).connect(body).connect(master);
  noise.connect(high).connect(hiss).connect(master);
  master.connect(ctx.destination);
  noise.start();
  sweep.start();
  swell.start();

  return {
    set(on) {
      if (on) void ctx.resume();
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(on ? A.level : 0, now + A.fade);
    },
    close() {
      void ctx.close();
    },
  };
}
