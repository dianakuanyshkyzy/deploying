"use client";

/* The big tape player at the end of the diary.
   The corner cassette "flies" here (the corner one hides while this is docked).
   Left: the J-card track list. Middle: the deck. Taped on top: your note for the song.
   Songs + notes come from content.music.songs; playback is in ./MusicProvider. */

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { content } from "@/content";
import { fill } from "@/lib";
import { PixelSprite } from "@/components/ui/PixelSprite";
import { useMusic } from "./MusicProvider";
import s from "./TapeDeck.module.css";

const SONGS = content.music.songs;
// design sizes: side-by-side on wide screens, stacked on portrait phones
const WIDE = { w: 1000, h: 540 };
const TALL = { w: 520, h: 1030 };

// room kept free under the player for the "see you at month two" line
const tall0 = () => (typeof window !== "undefined" && window.innerHeight > window.innerWidth && window.innerWidth < 700 ? 170 : 150);

const pad2 = (n: number) => String(n).padStart(2, "0");
const mmss = (t: number) => (isFinite(t) ? `${pad2(Math.floor(t / 60))}:${pad2(Math.floor(t % 60))}` : "--:--");

/* keeps the whole player on screen at any size (and picks the layout) */
function useFit(reserveY: number) {
  const [fit, setFit] = useState({ k: 0.8, tall: false });
  useEffect(() => {
    const f = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const tall = vh > vw && vw < 700;
      const d = tall ? TALL : WIDE;
      setFit({ tall, k: Math.min((vw - 24) / d.w, (vh - reserveY) / d.h, 1.2) });
    };
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, [reserveY]);
  return fit;
}

/* live position of the current song (read from the <audio> element 4× a second) */
function useProgress() {
  const { getAudio, usingFallback, index } = useMusic();
  const [t, setT] = useState({ cur: 0, dur: NaN });
  useEffect(() => {
    const id = setInterval(() => {
      const a = getAudio();
      if (!a || usingFallback) return setT({ cur: 0, dur: NaN });
      setT({ cur: a.currentTime, dur: a.duration });
    }, 250);
    return () => clearInterval(id);
  }, [getAudio, usingFallback, index]);
  return t;
}

/* ── the cassette, drawn on a 64×40 pixel grid ── */
function BigCassette({ progress, spinning }: { progress: number; spinning: boolean }) {
  // tape moves from the left spool to the right one as the song plays
  const left = 7.5 - progress * 3.2;
  const right = 4.3 + progress * 3.2;
  return (
    <svg viewBox="0 0 64 40" className={s.cassette} shapeRendering="crispEdges" aria-hidden>
      {/* outline + body */}
      <rect x={1} y={0} width={62} height={40} fill="#0e0a08" />
      <rect x={0} y={1} width={64} height={38} fill="#0e0a08" />
      <rect x={1} y={1} width={62} height={38} fill="#4a3326" />
      <rect x={1} y={1} width={62} height={1} fill="#6b4a36" />
      {/* label with 70s stripes */}
      <rect x={5} y={3} width={54} height={23} fill="#ecdfc6" />
      <rect x={5} y={3} width={54} height={2} fill="#7a2b2f" />
      <rect x={5} y={5} width={54} height={1} fill="#b8925a" />
      <rect x={5} y={6} width={54} height={1} fill="#8a4a33" />
      <rect x={5} y={25} width={54} height={1} fill="#c9b793" />
      {/* the window */}
      <rect x={17} y={13} width={30} height={11} fill="#140e0b" />
      <rect x={17} y={13} width={30} height={1} fill="#2a1e18" />
      {/* tape on the spools (round, the one non-pixel bit) */}
      <g shapeRendering="geometricPrecision">
        <circle cx={24} cy={18.5} r={left} fill="#2b1a12" />
        <circle cx={40} cy={18.5} r={right} fill="#2b1a12" />
        <circle cx={24} cy={18.5} r={left} fill="none" stroke="#3d271b" strokeWidth={0.4} />
        <circle cx={40} cy={18.5} r={right} fill="none" stroke="#3d271b" strokeWidth={0.4} />
      </g>
      {[24, 40].map((cx) => (
        <g key={cx}>
          <rect x={cx - 1.5} y={16} width={3} height={5} fill="#ecdfc6" />
          <rect x={cx - 2.5} y={17} width={5} height={3} fill="#ecdfc6" />
          <g className={`${s.hub} ${spinning ? s.spin : ""}`} style={{ transformOrigin: `${cx}px 18.5px` }}>
            <rect x={cx - 0.5} y={16.5} width={1} height={4} fill="#2a1e18" />
            <rect x={cx - 2} y={18} width={4} height={1} fill="#2a1e18" />
          </g>
        </g>
      ))}
      {/* window frame over the spools */}
      <rect x={15} y={11} width={34} height={2} fill="#ecdfc6" />
      <rect x={15} y={24} width={34} height={2} fill="#ecdfc6" />
      <rect x={15} y={11} width={2} height={15} fill="#ecdfc6" />
      <rect x={47} y={11} width={2} height={15} fill="#ecdfc6" />
      <rect x={29} y={15} width={6} height={7} fill="#3a2a20" opacity={0.5} />
      {/* bottom trapezoid with holes */}
      <rect x={15} y={30} width={34} height={9} fill="#3a2419" />
      <rect x={13} y={32} width={38} height={7} fill="#3a2419" />
      {[19, 26, 37, 44].map((x) => (
        <rect key={x} x={x} y={34} width={2} height={2} fill="#0e0a08" />
      ))}
      <rect x={30} y={33} width={4} height={3} fill="#0e0a08" />
      {/* screws */}
      {[
        [3, 2],
        [60, 2],
        [3, 36],
        [60, 36],
        [32, 28],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#b8925a" />
      ))}
    </svg>
  );
}

function Segments({ progress }: { progress: number }) {
  const n = 22;
  const on = Math.round(progress * n);
  return (
    <div className={s.segments} aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className={i < on ? s.segOn : undefined} />
      ))}
    </div>
  );
}

export function TapeDeck() {
  const { playing, usingFallback, index, toggle, next, prev, select, sfx, start } = useMusic();
  const { k, tall } = useFit(tall0());
  const D = tall ? TALL : WIDE;
  const { cur, dur } = useProgress();
  const progress = usingFallback || !isFinite(dur) || dur === 0 ? 0.35 : cur / dur;
  const song = SONGS[index];

  // if music isn't on yet (e.g. he reloaded the page), start it when the deck lands
  useEffect(() => {
    const id = setTimeout(start, 1400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className={s.fly}
      initial={{ x: "-42vw", y: "42vh", scale: 0.14, rotate: -10 }}
      animate={{ x: 0, y: 0, scale: 1, rotate: 0 }}
      transition={{ duration: 1.35, ease: [0.2, 0.75, 0.2, 1] }}
    >
      <div className={s.stage} style={{ width: D.w * k, height: D.h * k }}>
        <div className={`${s.inner} ${tall ? s.tall : ""}`} style={{ width: D.w, height: D.h, scale: k }}>
          {/* ── J-card track list ── */}
          <motion.div
            className={s.jcard}
            initial={{ opacity: 0, x: 120, rotate: 0 }}
            animate={{ opacity: 1, x: 0, rotate: -3 }}
            transition={{ delay: 1.3, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <span className={s.jTape} />
            <div className={s.jStripes} />
            <p className={s.jSide}>side A</p>
            <p className={s.jTitle}>{fill(content.music.tapeTitle)}</p>
            <ol className={s.tracks}>
              {SONGS.map((t, i) => (
                <li key={i}>
                  <button
                    className={i === index ? s.current : undefined}
                    onClick={() => {
                      sfx("type");
                      select(i);
                    }}
                  >
                    <span className={s.num}>{i === index && playing ? "▶" : pad2(i + 1)}</span>
                    <span className={s.tTitle}>{fill(t.title)}</span>
                    <span className={s.tArtist}>{fill(t.artist)}</span>
                  </button>
                </li>
              ))}
            </ol>
            <p className={s.jFrom}>
              for {fill(content.him)}, from {fill(content.me)}
            </p>
          </motion.div>

          {/* ── the deck ── */}
          <div className={s.deck}>
            <div className={s.deckTop}>
              <span className={s.brand}>LOVE·TAPE</span>
              <span className={s.model}>TC-01 · stereo cassette deck</span>
              <span className={`${s.led} ${playing ? s.ledOn : ""}`} />
            </div>
            <div className={s.window}>
              <BigCassette progress={progress} spinning={playing} />
              <div className={s.label}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={index}
                    className={s.labelTitle}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                  >
                    {fill(song.title)}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className={s.glass} />
            </div>
            <div className={s.controls}>
              <div className={s.buttons}>
                <button className="pixel-btn ghost" aria-label="previous song" onClick={() => { sfx("type"); prev(); }}>
                  ◂◂
                </button>
                <button className={`pixel-btn dark ${s.play}`} aria-label={playing ? "pause" : "play"} onClick={() => { sfx("type"); toggle(); }}>
                  {playing ? "❚❚" : "▶"}
                </button>
                <button className="pixel-btn ghost" aria-label="next song" onClick={() => { sfx("type"); next(); }}>
                  ▸▸
                </button>
              </div>
              <div className={s.meter}>
                <Segments progress={progress} />
                <span className={s.time}>
                  {usingFallback ? "music box · ∞" : `${mmss(cur)} / ${mmss(dur)}`}
                </span>
              </div>
            </div>
          </div>

          {/* ── your note for this song ── */}
          <div className={s.noteSlot}>
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                className={s.note}
                initial={{ opacity: 0, y: -40, rotate: -6 }}
                animate={{ opacity: 1, y: 0, rotate: 4 }}
                exit={{ opacity: 0, x: 60, rotate: 14, transition: { duration: 0.3 } }}
                transition={{ delay: index === 0 ? 1.7 : 0.05, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <span className={s.noteTape} />
                <p className={s.noteKicker}>track {pad2(index + 1)} · why this one</p>
                <p className={s.noteTitle}>
                  {fill(song.title)} <span>— {fill(song.artist)}</span>
                </p>
                <p className={s.noteBody}>{fill(song.note)}</p>
                <div className={s.noteHeart}>
                  <PixelSprite name="heart" px={3} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
