"use client";

/* Page 1 flow:  press start → terminal types → "yes" → 3D envelope → click → /diary */

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { content } from "@/content";
import { fill } from "@/lib";
import { useMusic } from "@/components/music/MusicProvider";
import { PixelSprite } from "@/components/ui/PixelSprite";
import { Counter } from "./Counter";
import { Terminal } from "./Terminal";
import s from "./Intro.module.css";

// three.js only runs in the browser → load the scene client-side
const EnvelopeScene = dynamic(() => import("./EnvelopeScene"), { ssr: false });

type Phase = "start" | "terminal" | "envelope" | "opening" | "leaving";

export function Intro() {
  const [phase, setPhase] = useState<Phase>("start");
  const { start, sfx } = useMusic();
  const router = useRouter();

  useEffect(() => {
    import("./EnvelopeScene"); // warm up the 3D chunk while the terminal types
    router.prefetch("/diary");
  }, [router]);

  // twinkling pixel sparkles scattered in the dark (fixed positions per load)
  const stars = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        left: `${(i * 61.8 * 7) % 100}%`,
        top: `${(i * 38.2 * 3 + 7) % 100}%`,
        delay: `${(i * 0.37) % 3}s`,
        px: i % 4 === 0 ? 3 : 2,
      })),
    [],
  );

  return (
    <main className={s.room}>
      <div className={s.lamp} aria-hidden />
      <div className={s.stars} aria-hidden>
        {stars.map((st, i) => (
          <span key={i} style={{ left: st.left, top: st.top, animationDelay: st.delay }}>
            <PixelSprite name="sparkle" px={st.px} outline={false} />
          </span>
        ))}
      </div>

      <motion.div
        className={s.sticky}
        initial={{ rotate: 8, y: -20, opacity: 0 }}
        animate={{ rotate: 5, y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <span className={s.tape} />
        {content.intro.stickyNote}
      </motion.div>

      <AnimatePresence mode="wait">
        {phase === "start" && (
          <motion.button
            key="start"
            className={s.start}
            onClick={() => {
              start();
              sfx("pop");
              setPhase("terminal");
            }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.25 } }}
          >
            <PixelSprite name="heart" px={7} className={s.startHeart} />
            <span className={s.startTitle}>{content.intro.startTitle}</span>
            <span className={s.startSub}>{fill(content.intro.startSub)}</span>
          </motion.button>
        )}

        {phase === "terminal" && (
          <Terminal
            key="term"
            onYes={() => {
              sfx("pop");
              setPhase("envelope");
            }}
          />
        )}

        {(phase === "envelope" || phase === "opening" || phase === "leaving") && (
          <motion.div
            key="env"
            className={s.scene}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
          >
            <EnvelopeScene
              opening={phase !== "envelope"}
              onClick={() => {
                sfx("pop");
                setTimeout(() => sfx("whoosh"), 450);
                setPhase("opening");
              }}
              onOpened={() => {
                setPhase("leaving");
                setTimeout(() => router.push("/diary"), 900);
              }}
            />
            <AnimatePresence>
              {phase === "envelope" && (
                <motion.div
                  className={s.hint}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 1 }}
                >
                  <span className={s.hintArrow}>▲</span>
                  {content.intro.envelopeHint}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <Counter />

      {/* fade to cream as the camera dives into the letter; /diary starts cream too */}
      <motion.div
        className={s.paperFade}
        initial={false}
        animate={{ opacity: phase === "leaving" ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      />
    </main>
  );
}
