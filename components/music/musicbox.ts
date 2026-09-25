/* A soft, built-in music-box waltz made with the Web Audio API.
   Used when /public/music/<your song>.mp3 isn't there yet, so the site
   always has some music. Also home to the little sound effects
   (page flip, wax-seal stamp, typing clicks) and the vinyl crackle. */

const EIGHTH = 60 / 72 / 2; // 72 bpm, counted in eighths (3/4 waltz → 6 per bar)

// chord per bar: root MIDI note + quality (maj7 / min7)
const BARS: { root: number; q: "maj7" | "min7" }[] = [
  { root: 53, q: "maj7" }, // F
  { root: 53, q: "maj7" },
  { root: 57, q: "min7" }, // Am
  { root: 57, q: "min7" },
  { root: 50, q: "min7" }, // Dm
  { root: 50, q: "min7" },
  { root: 46, q: "maj7" }, // B♭
  { root: 48, q: "maj7" }, // C (lift back home)
];
const ARP = { maj7: [0, 7, 12, 16, 19, 23], min7: [0, 7, 12, 15, 19, 22] };
// melody: [eighth index in bar, midi]
const MELODY: [number, number][][] = [
  [[0, 81], [4, 79]],
  [[0, 77], [3, 76]],
  [[0, 76], [4, 79]],
  [[0, 72]],
  [[0, 77], [4, 76]],
  [[0, 74], [2, 72]],
  [[0, 74], [4, 77]],
  [[0, 79], [3, 76], [5, 74]],
];

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

function makeImpulse(ctx: AudioContext, seconds = 2.8) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
  }
  return buf;
}

export class MusicBox {
  private ctx: AudioContext;
  private out: GainNode;
  private timer: number | null = null;
  private nextTime = 0;
  private step = 0;

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.out = ctx.createGain();
    this.out.gain.value = 0;
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 3400;
    const verb = ctx.createConvolver();
    verb.buffer = makeImpulse(ctx);
    const wet = ctx.createGain();
    wet.gain.value = 0.45;
    this.out.connect(tone);
    tone.connect(destination);
    tone.connect(verb);
    verb.connect(wet);
    wet.connect(destination);
  }

  private note(midi: number, t: number, vel: number) {
    const f = mtof(midi);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vel, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
    g.connect(this.out);
    // a sine + two quiet "tine" partials = music box
    [
      [1, 1],
      [2.0, 0.18],
      [4.07, 0.06],
    ].forEach(([mult, amp]) => {
      const o = this.ctx.createOscillator();
      const og = this.ctx.createGain();
      o.type = "sine";
      o.frequency.value = f * mult;
      og.gain.value = amp;
      o.connect(og);
      og.connect(g);
      o.start(t);
      o.stop(t + 2.3);
    });
  }

  private schedule = () => {
    while (this.nextTime < this.ctx.currentTime + 0.25) {
      const barIdx = Math.floor(this.step / 6) % BARS.length;
      const inBar = this.step % 6;
      const bar = BARS[barIdx];
      const human = (Math.random() - 0.5) * 0.014;
      const arpNote = bar.root + 12 + ARP[bar.q][inBar];
      this.note(arpNote, this.nextTime + human, inBar === 0 ? 0.075 : 0.05);
      MELODY[barIdx].forEach(([i, m]) => {
        if (i === inBar) this.note(m, this.nextTime + human * 0.5, 0.11);
      });
      this.nextTime += EIGHTH;
      this.step++;
    }
  };

  play() {
    if (this.timer !== null) return;
    this.nextTime = this.ctx.currentTime + 0.1;
    const now = this.ctx.currentTime;
    this.out.gain.cancelScheduledValues(now);
    this.out.gain.setValueAtTime(this.out.gain.value, now);
    this.out.gain.linearRampToValueAtTime(0.9, now + 1.5);
    this.timer = window.setInterval(this.schedule, 60);
    this.schedule();
  }

  pause() {
    const now = this.ctx.currentTime;
    this.out.gain.cancelScheduledValues(now);
    this.out.gain.setValueAtTime(this.out.gain.value, now);
    this.out.gain.linearRampToValueAtTime(0, now + 0.4);
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
  }
}

/* soft record crackle: sparse random clicks + a little hiss, looped */
export function makeCrackle(ctx: AudioContext, destination: AudioNode) {
  const len = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    let v = (Math.random() * 2 - 1) * 0.012; // hiss
    if (Math.random() < 0.00045) v += (Math.random() * 2 - 1) * 0.9; // pop
    d[i] = v;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 2400;
  bp.Q.value = 0.6;
  const g = ctx.createGain();
  g.gain.value = 0;
  src.connect(bp);
  bp.connect(g);
  g.connect(destination);
  src.start();
  return {
    set(on: boolean) {
      const now = ctx.currentTime;
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(g.gain.value, now);
      g.gain.linearRampToValueAtTime(on ? 0.22 : 0, now + 0.6);
    },
  };
}

export type Sfx = "flip" | "stamp" | "type" | "pop" | "whoosh";

function noise(ctx: AudioContext, seconds: number) {
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const s = ctx.createBufferSource();
  s.buffer = buf;
  return s;
}

export function playSfx(ctx: AudioContext, dest: AudioNode, kind: Sfx) {
  const t = ctx.currentTime;
  if (kind === "flip" || kind === "whoosh") {
    const n = noise(ctx, 0.6);
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 0.8;
    f.frequency.setValueAtTime(kind === "flip" ? 900 : 500, t);
    f.frequency.exponentialRampToValueAtTime(kind === "flip" ? 3200 : 1400, t + 0.35);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(kind === "flip" ? 0.28 : 0.12, t + 0.12);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    n.connect(f).connect(g).connect(dest);
    n.start(t);
    n.stop(t + 0.6);
  } else if (kind === "stamp") {
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.25);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.7, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    o.connect(g).connect(dest);
    o.start(t);
    o.stop(t + 0.4);
    const n = noise(ctx, 0.08);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.25, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    n.connect(ng).connect(dest);
    n.start(t);
  } else if (kind === "type") {
    const n = noise(ctx, 0.03);
    const f = ctx.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 2500 + Math.random() * 1500;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.06, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    n.connect(f).connect(g).connect(dest);
    n.start(t);
  } else if (kind === "pop") {
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(700, t);
    o.frequency.exponentialRampToValueAtTime(180, t + 0.12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o.connect(g).connect(dest);
    o.start(t);
    o.stop(t + 0.2);
  }
}
