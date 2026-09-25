"use client";

/* Page 2: the diary.
   Stage  "book":     photos fly in → turn page → letter → turn page → promises
   Stage  "music":    the book slides away and the corner cassette flies to the
                      middle as a full tape deck (components/music/TapeDeck.tsx).

   How the page-turn works: the book has two fixed halves (left of spread 0,
   right of the last spread) and two "leaves" stacked on the right. Each leaf
   is a double-sided page that rotates -180° around the spine (CSS 3D). */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { content } from "@/content";
import { useMusic } from "@/components/music/MusicProvider";
import { PixelSprite } from "@/components/ui/PixelSprite";
import {
  LetterLeft,
  LetterRight,
  LittleThings,
  PhotosLeft,
  PhotosRight,
  PressedFlower,
} from "./Pages";
import { TapeDeck } from "@/components/music/TapeDeck";
import s from "./Diary.module.css";

const BOOK_W = 1000;
const BOOK_H = 640;
const SPREADS = 3;

/* keep the whole book visible at any screen size */
function useFitScale(reserveY: number) {
  const [scale, setScale] = useState(0.8);
  useEffect(() => {
    const f = () => {
      const sx = (window.innerWidth - 24) / BOOK_W;
      const sy = (window.innerHeight - reserveY) / BOOK_H;
      setScale(Math.min(sx, sy, 1.25));
    };
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, [reserveY]);
  return scale;
}

function Leaf({
  index,
  flipped,
  front,
  back,
  onFlipStart,
  onFlipEnd,
  flipping,
}: {
  index: number;
  flipped: boolean;
  front: React.ReactNode;
  back: React.ReactNode;
  onFlipStart: () => void;
  onFlipEnd: () => void;
  flipping: boolean;
}) {
  const rot = useMotionValue(0);
  // a soft shadow sweeps across the page as it lifts
  const shade = useTransform(rot, [0, -90, -180], [0, 0.45, 0]);
  const curl = useTransform(rot, [0, -90, -180], [0, -4, 0]);
  const z = flipping ? 50 : flipped ? 10 + index : 10 + (SPREADS - index);
  return (
    <motion.div
      className={s.leaf}
      style={{ rotateY: rot, skewY: curl, zIndex: z }}
      animate={{ rotateY: flipped ? -180 : 0 }}
      transition={{ duration: 1.35, ease: [0.55, 0.05, 0.25, 1] }}
      onAnimationStart={onFlipStart}
      onAnimationComplete={onFlipEnd}
    >
      <div className={`${s.face} ${s.pageRight}`}>
        {front}
        <motion.div className={s.shade} style={{ opacity: shade }} />
      </div>
      <div className={`${s.face} ${s.faceBack} ${s.pageLeft}`}>
        {back}
        <motion.div className={s.shade} style={{ opacity: shade }} />
      </div>
    </motion.div>
  );
}

export function Diary() {
  const router = useRouter();
  const {
    sfx,
    setDocked,
    next: nextSong,
    prev: prevSong,
    toggle: toggleMusic,
  } = useMusic();
  const scale = useFitScale(130);
  const [spread, setSpread] = useState(0);
  const [settled, setSettled] = useState(0); // spread that finished flipping into view
  const [flipping, setFlipping] = useState<number | null>(null);
  const [go, setGo] = useState(false); // start the photo flight
  const [seen, setSeen] = useState<Set<number>>(new Set());
  const [sealed, setSealed] = useState(false);
  const [stage, setStage] = useState<"book" | "music">("book");
  const [finale, setFinale] = useState(false);
  const [portraitTip, setPortraitTip] = useState(false);
  const shake = useAnimationControls();

  useEffect(() => {
    const t = setTimeout(() => setGo(true), 1300);
    const mq = window.matchMedia(
      "(orientation: portrait) and (max-width: 700px)",
    );
    setPortraitTip(mq.matches);
    const t2 = setTimeout(() => setPortraitTip(false), 8000); // the tip tidies itself away
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, []);

  // the tape deck takes over from the corner cassette; give it back when leaving
  useEffect(() => {
    if (stage !== "music") return;
    setDocked(true);
    const t = setTimeout(() => setFinale(true), 3200);
    return () => clearTimeout(t);
  }, [stage, setDocked]);
  useEffect(() => () => setDocked(false), [setDocked]);

  useEffect(() => {
    if (flipping === null)
      setSeen((prev) =>
        prev.has(settled) ? prev : new Set(prev).add(settled),
      );
  }, [settled, flipping]);

  const turn = useCallback(
    (dir: 1 | -1) => {
      const next = spread + dir;
      if (flipping !== null) return;
      if (next >= SPREADS) {
        sfx("whoosh");
        setStage("music");
        return;
      }
      if (next < 0) return;
      sfx("flip");
      setFlipping(dir === 1 ? spread : next);
      setSpread(next);
    },
    [spread, flipping, sfx],
  );

  // keyboard: ← →
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (stage === "music") {
        if (e.key === "ArrowRight") nextSong();
        if (e.key === "ArrowLeft") prevSong();
        if (e.key === " ") {
          e.preventDefault();
          toggleMusic();
        }
        return;
      }
      if (e.key === "ArrowRight") turn(1);
      if (e.key === "ArrowLeft") turn(-1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [turn, stage, nextSong, prevSong, toggleMusic]);

  const seal = () => {
    sfx("stamp");
    setSealed(true);
    shake.start({
      x: [0, -5, 4, -2, 0],
      y: [0, 3, -2, 1, 0],
      transition: { duration: 0.35, delay: 0.3 },
    });
  };

  const shown = (i: number) =>
    seen.has(i) || (settled === i && flipping === null);
  const nextLabel =
    spread === 0
      ? "turn the page"
      : spread === 1
        ? "next page"
        : "one last thing";

  return (
    <main className={s.desk}>
      <div className={s.lampGlow} aria-hidden />
      <div className={s.coffeeRing} aria-hidden />
      <div
        className={s.deskSprite}
        style={{ left: "2.5%", top: "5%" }}
        aria-hidden
      >
        <PixelSprite name="flower" px={5} />
      </div>
      <div
        className={s.deskSprite}
        style={{ right: "7%", bottom: "16%", rotate: "14deg" }}
        aria-hidden
      >
        <PixelSprite name="envelope" px={5} />
      </div>

      <AnimatePresence>
        {stage === "book" && (
          <motion.div
            key="book"
            className={s.stage}
            style={{ width: BOOK_W * scale, height: BOOK_H * scale }}
            initial={{ opacity: 0, y: 60, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{
              opacity: 0,
              y: "40vh",
              rotate: 8,
              scale: 0.8,
              transition: { duration: 0.9, ease: [0.6, 0, 0.8, 0.4] },
            }}
            transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1], delay: 0.3 }}
          >
            <motion.div
              className={s.book}
              animate={shake}
              style={{
                width: BOOK_W,
                height: BOOK_H,
                scale,
                transformOrigin: "top left",
              }}
            >
              <div className={s.cover} />
              <div className={s.stackLeft} />
              <div className={s.stackRight} />
              <div className={s.ribbon} />
              <div className={s.spread}>
                {/* fixed left half: spread 0 left */}
                <div className={`${s.base} ${s.pageLeft}`}>
                  <PhotosLeft go={go} />
                </div>
                {/* fixed right half: last spread right */}
                <div className={`${s.base} ${s.baseRight} ${s.pageRight}`}>
                  <PressedFlower show={shown(2)} />{" "}
                </div>
                <Leaf
                  index={0}
                  flipped={spread > 0}
                  flipping={flipping === 0}
                  front={<PhotosRight go={go} />}
                  back={<LetterLeft show={shown(1)} />}
                  onFlipStart={() => {}}
                  onFlipEnd={() => {
                    if (flipping === 0) {
                      setFlipping(null);
                      setSettled(spread);
                    }
                  }}
                />
                <Leaf
                  index={1}
                  flipped={spread > 1}
                  flipping={flipping === 1}
                  front={<LetterRight show={shown(1)} />}
                  back={<LittleThings show={shown(2)} />}
                  onFlipStart={() => {}}
                  onFlipEnd={() => {
                    if (flipping === 1) {
                      setFlipping(null);
                      setSettled(spread);
                    }
                  }}
                />
                <div className={s.gutter} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === "music" && (
          <motion.div
            key="deck"
            className={s.deckStage}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
          >
            <TapeDeck />
          </motion.div>
        )}
      </AnimatePresence>

      {/* controls */}
      <div className={s.controls}>
        {stage === "book" && (
          <>
            <button
              className={`pixel-btn ghost ${s.prev}`}
              onClick={() => turn(-1)}
              disabled={spread === 0}
              aria-label="previous page"
              style={{ visibility: spread === 0 ? "hidden" : "visible" }}
            >
              ◂
            </button>
            <motion.button
              className="pixel-btn"
              onClick={() => turn(1)}
              initial={{ opacity: 0 }}
              animate={{ opacity: go ? 1 : 0 }}
              transition={{ delay: spread === 0 ? 6.5 : 0 }}
            >
              {nextLabel} ▸
            </motion.button>
          </>
        )}
        {stage === "music" && finale && (
          <motion.div
            className={s.finale}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <span className={s.finaleText}>
              <PixelSprite name="heart" px={3} /> {content.ending}{" "}
              <PixelSprite name="heart" px={3} />
            </span>
            <button
              className="pixel-btn ghost"
              onClick={() => {
                setDocked(false);
                router.push("/");
              }}
            >
              ↺ from the start
            </button>
          </motion.div>
        )}
      </div>

      {/* cream fade-in continuing from the envelope on page 1 */}
      <motion.div
        className={s.creamIn}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.2, delay: 0.1 }}
      />

      <AnimatePresence>
        {portraitTip && (
          <motion.button
            className={s.tip}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.5 }}
            onClick={() => setPortraitTip(false)}
          >
            ↻ tip: turn your phone sideways <span>✕</span>
          </motion.button>
        )}
      </AnimatePresence>
    </main>
  );
}
