"use client";

/* Keeps the music alive across both pages (it lives in app/layout.tsx,
   which Next.js doesn't re-mount when you change page).
   - plays the playlist from content.music.songs, one after another
   - if a song's file is missing, the MusicBox melody (./musicbox.ts) plays instead
   - `docked` = the big tape deck is on screen, so the corner cassette hides
   - sfx() gives the page flips, stamps, etc. */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { content } from "@/content";
import { MusicBox, makeCrackle, playSfx, type Sfx } from "./musicbox";

const SONGS = content.music.songs;

type Ctx = {
  playing: boolean;
  /** true while the built-in music box is standing in for a missing mp3 */
  usingFallback: boolean;
  index: number;
  docked: boolean;
  setDocked: (d: boolean) => void;
  start: () => void;
  toggle: () => void;
  select: (i: number) => void;
  next: () => void;
  prev: () => void;
  getAudio: () => HTMLAudioElement | null;
  sfx: (s: Sfx, onlyIfAwake?: boolean) => void;
};

const MusicCtx = createContext<Ctx | null>(null);

export function useMusic() {
  const c = useContext(MusicCtx);
  if (!c) throw new Error("useMusic must be used inside <MusicProvider>");
  return c;
}

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [playing, setPlaying] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [index, setIndex] = useState(0);
  const [docked, setDocked] = useState(false);

  const audio = useRef<HTMLAudioElement | null>(null);
  const ac = useRef<AudioContext | null>(null);
  const master = useRef<GainNode | null>(null);
  const box = useRef<MusicBox | null>(null);
  const crackle = useRef<ReturnType<typeof makeCrackle> | null>(null);
  const indexRef = useRef(0);
  const nextRef = useRef<() => void>(() => {});

  const ensureCtx = useCallback(() => {
    if (!ac.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ac.current = new AC();
      master.current = ac.current.createGain();
      master.current.gain.value = 0.8;
      master.current.connect(ac.current.destination);
    }
    if (ac.current.state === "suspended") ac.current.resume();
    return ac.current;
  }, []);

  const ensureAudio = useCallback(() => {
    if (!audio.current) {
      const a = new Audio();
      a.preload = "auto";
      a.volume = 0.65;
      a.addEventListener("ended", () => nextRef.current());
      audio.current = a;
    }
    return audio.current;
  }, []);

  const startFallback = useCallback(() => {
    const ctx = ensureCtx();
    if (!box.current) box.current = new MusicBox(ctx, master.current!);
    box.current.play();
    setUsingFallback(true);
  }, [ensureCtx]);

  const playIndex = useCallback(
    (i: number) => {
      const ctx = ensureCtx();
      if (content.music.vinylCrackle) {
        if (!crackle.current) crackle.current = makeCrackle(ctx, master.current!);
        crackle.current.set(true);
      }
      const song = SONGS[i];
      indexRef.current = i;
      setIndex(i);
      setPlaying(true);
      const a = ensureAudio();
      if (!song?.src) {
        a.pause();
        startFallback();
        return;
      }
      const url = new URL(song.src, window.location.href).href;
      if (a.src !== url) a.src = song.src; // new song → load it; same song → resume
      a.play()
        .then(() => {
          box.current?.pause();
          setUsingFallback(false);
        })
        .catch(() => {
          a.pause();
          startFallback(); // file missing (or blocked) → music box
        });
    },
    [ensureCtx, ensureAudio, startFallback],
  );

  const pause = useCallback(() => {
    audio.current?.pause();
    box.current?.pause();
    crackle.current?.set(false);
    setPlaying(false);
  }, []);

  const select = useCallback((i: number) => playIndex(((i % SONGS.length) + SONGS.length) % SONGS.length), [playIndex]);
  const next = useCallback(() => select(indexRef.current + 1), [select]);
  const prev = useCallback(() => {
    // like a real player: "back" restarts the song if it's been playing a while
    const a = audio.current;
    if (a && !usingFallback && a.currentTime > 4) {
      a.currentTime = 0;
      return;
    }
    select(indexRef.current - 1);
  }, [select, usingFallback]);

  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  const start = useCallback(() => {
    if (!playing) playIndex(indexRef.current);
  }, [playing, playIndex]);

  const toggle = useCallback(() => (playing ? pause() : playIndex(indexRef.current)), [playing, pause, playIndex]);

  // sfx(s) is for clicks (a click is allowed to wake audio up);
  // sfx(s, true) is for automatic animations: silent unless audio already started
  const sfx = useCallback(
    (s: Sfx, onlyIfAwake = false) => {
      if (onlyIfAwake && !ac.current) return;
      try {
        const ctx = ensureCtx();
        playSfx(ctx, master.current!, s);
      } catch {
        /* audio not allowed yet — ignore */
      }
    },
    [ensureCtx],
  );

  const getAudio = useCallback(() => audio.current, []);

  return (
    <MusicCtx.Provider
      value={{ playing, usingFallback, index, docked, setDocked, start, toggle, select, next, prev, getAudio, sfx }}
    >
      {children}
    </MusicCtx.Provider>
  );
}
