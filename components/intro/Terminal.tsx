"use client";

/* The retro "for_you.exe" window that types content.intro.lines,
   then asks yes / no. The "no" button runs away. */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { content } from "@/content";
import { fill } from "@/lib";
import { useMusic } from "@/components/music/MusicProvider";
import s from "./Intro.module.css";

const LINES = content.intro.lines.map(fill);

export function Terminal({ onYes }: { onYes: () => void }) {
  const { sfx } = useMusic();
  const [line, setLine] = useState(0);
  const [char, setChar] = useState(0);
  const [done, setDone] = useState(false);
  const [noTries, setNoTries] = useState(0);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const boxRef = useRef<HTMLDivElement>(null);

  // typewriter
  useEffect(() => {
    if (done) return;
    const current = LINES[line];
    if (current === undefined) {
      setDone(true);
      return;
    }
    if (char < current.length) {
      const slow = current.startsWith("...");
      const ch = current[char];
      const delay = slow ? 320 : ch === " " ? 40 : 45 + Math.random() * 55;
      const id = setTimeout(() => {
        setChar((c) => c + 1);
        if (!slow && ch !== " ") sfx("type");
      }, delay);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      setLine((l) => l + 1);
      setChar(0);
    }, 520);
    return () => clearTimeout(id);
  }, [line, char, done, sfx]);

  const skip = () => {
    if (!done) {
      setLine(LINES.length);
      setDone(true);
    }
  };

  const dodge = () => {
    const box = boxRef.current?.getBoundingClientRect();
    const maxX = box ? box.width / 2 - 70 : 140;
    const maxY = 60;
    let x = 0,
      y = 0;
    do {
      x = (Math.random() * 2 - 1) * maxX;
      y = -Math.random() * maxY - 10;
    } while (Math.abs(x - noPos.x) < 60);
    setNoPos({ x, y });
    setNoTries((n) => n + 1);
    sfx("pop");
  };

  const noText = noTries === 0 ? content.intro.no : content.intro.noReplies[(noTries - 1) % content.intro.noReplies.length];
  const typed = LINES.slice(0, line);
  const current = LINES[line]?.slice(0, char) ?? "";

  return (
    <motion.div
      className={s.window}
      initial={{ scaleY: 0.004, scaleX: 0.6, opacity: 0 }}
      animate={{ scaleY: 1, scaleX: 1, opacity: 1 }}
      exit={{ scaleY: 0.004, scaleX: 0.9, opacity: 0, transition: { duration: 0.35, ease: [0.7, 0, 1, 1] } }}
      transition={{ duration: 0.55, ease: [0.2, 0.9, 0.2, 1] }}
      ref={boxRef}
    >
      <div className={s.titlebar}>
        <span className={s.closeBox} />
        <span className={s.titleStripes} />
        <span className={s.titleText}>{content.intro.windowTitle}</span>
        <span className={s.titleStripes} />
      </div>
      <div className={s.screen} onClick={skip}>
        {typed.map((l, i) => (
          <p key={i} className={l.startsWith("...") ? s.dots : undefined}>
            {l}
          </p>
        ))}
        {!done && (
          <p>
            {current}
            <span className={s.caret} />
          </p>
        )}
        {done && <span className={s.caret} />}

        <AnimatePresence>
          {done && (
            <motion.div
              className={s.choices}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <motion.button
                className="pixel-btn dark"
                animate={{ scale: 1 + Math.min(noTries, 6) * 0.08 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onYes();
                }}
              >
                {content.intro.yes} ♥
              </motion.button>
              {noTries < 7 && (
                <motion.button
                  className="pixel-btn ghost"
                  animate={{ x: noPos.x, y: noPos.y, scale: 1 - noTries * 0.08 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  onPointerEnter={(e) => e.pointerType === "mouse" && dodge()}
                  onClick={(e) => {
                    e.stopPropagation();
                    dodge();
                  }}
                >
                  {noText}
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {!done && <div className={s.skipHint}>click to skip</div>}
    </motion.div>
  );
}
