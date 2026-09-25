import { content } from "@/content";

/** swaps {him} / {me} in any text for the names set in content.ts */
export const fill = (s: string) => s.replaceAll("{him}", content.him).replaceAll("{me}", content.me);

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** progress 0..1 of time t inside the window [start, start+dur] */
export const seg = (t: number, start: number, dur: number) => clamp((t - start) / dur);
