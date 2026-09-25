"use client";

/* The contents of each diary page.
   spread 0: photos (left + right)   spread 1: letter   spread 2: promises
   All the words/pictures come from content.ts. */

import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { content } from "@/content";
import { fill } from "@/lib";
import { useMusic } from "@/components/music/MusicProvider";
import { PixelSprite } from "@/components/ui/PixelSprite";
import { Polaroid } from "./Photo";
import { Doodle } from "./Doodles";
import s from "./Diary.module.css";

type Slot = { x: number; y: number; w: number; rot: number; tape: "top" | "corners" };
const LEFT_SLOTS: Slot[] = [
  { x: 36, y: 122, w: 196, rot: -6, tape: "top" },
  { x: 258, y: 150, w: 180, rot: 5, tape: "corners" },
  { x: 270, y: 392, w: 160, rot: -3, tape: "top" },
];
const RIGHT_SLOTS: Slot[] = [
  { x: 44, y: 46, w: 188, rot: 4, tape: "corners" },
  { x: 250, y: 84, w: 192, rot: -5, tape: "top" },
  { x: 118, y: 322, w: 204, rot: 2, tape: "top" },
];

function FlyIn({
  from,
  slot,
  delay,
  go,
  children,
}: {
  from: "left" | "right";
  slot: Slot;
  delay: number;
  go: boolean;
  children: React.ReactNode;
}) {
  const { sfx } = useMusic();
  const [landed, setLanded] = useState(false);
  const dir = from === "left" ? -1 : 1;
  return (
    <motion.div
      className={s.fly}
      data-landed={landed}
      style={{ left: slot.x, top: slot.y }}
      initial={{ x: dir * 1250, y: -140 + slot.y * 0.2, rotate: slot.rot + dir * 38, scale: 1.35, opacity: 0 }}
      animate={go ? { x: 0, y: 0, rotate: slot.rot, scale: 1, opacity: 1 } : undefined}
      transition={{
        delay,
        duration: 1.25,
        ease: [0.16, 0.84, 0.3, 1.04],
        opacity: { delay, duration: 0.15 },
      }}
      onAnimationStart={() => go && setTimeout(() => sfx("whoosh", true), delay * 1000)}
      onAnimationComplete={() => go && setLanded(true)}
    >
      {children}
    </motion.div>
  );
}

function Ticket({ go, delay }: { go: boolean; delay: number }) {
  return (
    <motion.div
      className={s.ticket}
      initial={{ opacity: 0, x: -900, rotate: -30 }}
      animate={go ? { opacity: 1, x: 0, rotate: -4 } : undefined}
      transition={{ delay, duration: 1.2, ease: [0.16, 0.84, 0.3, 1.04], opacity: { delay, duration: 0.1 } }}
    >
      <span className={s.ticketTop}>{content.ticket.top}</span>
      <span className={s.ticketMid}>{fill(content.ticket.middle)}</span>
      <span className={s.ticketBottom}>{content.ticket.bottom}</span>
      <span className={s.ticketNo}>№ 0001</span>
    </motion.div>
  );
}

export function PhotosLeft({ go }: { go: boolean }) {
  const p = content.photos;
  return (
    <div className={s.pageInner}>
      <motion.h2 className={s.diaryTitle} initial={{ opacity: 0 }} animate={go ? { opacity: 1 } : undefined} transition={{ delay: 0.3, duration: 1 }}>
        {content.diaryTitle}
      </motion.h2>
      <motion.p className={s.diaryDate} initial={{ opacity: 0 }} animate={go ? { opacity: 1 } : undefined} transition={{ delay: 0.6, duration: 1 }}>
        {content.diaryDate}
      </motion.p>
      <Doodle kind="underline" x={36} y={96} w={190} h={12} show={go} delay={0.9} />
      <Ticket go={go} delay={3.1} />
      {LEFT_SLOTS.map((slot, i) =>
        p[i] ? (
          <FlyIn key={i} from="left" slot={slot} delay={0.9 + i * 1.0} go={go}>
            <Polaroid src={p[i].src} caption={fill(p[i].caption)} label={`photo ${String(i + 1).padStart(2, "0")}`} width={slot.w} tape={slot.tape} tapeTone={i} />
          </FlyIn>
        ) : null,
      )}
      <Doodle kind="heart" x={284} y={30} w={36} h={33} show={go} delay={5.6} rotate={12} />
      <Doodle kind="star" x={420} y={330} w={26} h={26} show={go} delay={5.9} color="#8a4a33" />
      <div className={s.spriteOn} style={{ left: 196, top: 520, rotate: "-12deg" }}>
        <PixelSprite name="flower" px={4} />
      </div>
    </div>
  );
}

export function PhotosRight({ go }: { go: boolean }) {
  const p = content.photos;
  return (
    <div className={s.pageInner}>
      {RIGHT_SLOTS.map((slot, i) =>
        p[i + 3] ? (
          <FlyIn key={i} from="right" slot={slot} delay={1.4 + i * 1.0} go={go}>
            <Polaroid
              src={p[i + 3].src}
              caption={fill(p[i + 3].caption)}
              label={`photo ${String(i + 4).padStart(2, "0")}`}
              width={slot.w}
              tape={slot.tape}
              tapeTone={i + 1}
            />
          </FlyIn>
        ) : null,
      )}
      <Doodle kind="arrow" x={330} y={378} w={80} h={40} show={go} delay={5.2} rotate={150} />
      <motion.span className={s.scribble} style={{ left: 342, top: 440, rotate: "-6deg" }} initial={{ opacity: 0 }} animate={go ? { opacity: 1 } : undefined} transition={{ delay: 5.8, duration: 0.8 }}>
        my favourite
        <br />
        pic so far
      </motion.span>
      <Doodle kind="swirl" x={30} y={560} w={90} h={36} show={go} delay={6.1} color="#8a4a33" />
      <div className={s.spriteOn} style={{ left: 30, top: 300 }}>
        <PixelSprite name="cherry" px={4} />
      </div>
      <div className={s.spriteOn} style={{ left: 420, top: 36 }}>
        <PixelSprite name="sparkle" px={3} />
      </div>
    </div>
  );
}
function useFitText(deps: unknown[]) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      let fs = 19;
      el.style.setProperty("--fs", `${fs}px`);
      while (el.scrollHeight > el.clientHeight + 1 && fs > 11) {
        fs -= 0.5;
        el.style.setProperty("--fs", `${fs}px`);
      }
    };
    fit();
    document.fonts?.ready.then(fit); 
  }, deps);
  return ref;
}

function InkWords({ text, show, start, step = 0.05 }: { text: string; show: boolean; start: number; step?: number }) {
  const words = text.split(/\s+/);
  return (
    <>
      {words.map((w, i) => (
        <motion.span
          key={i}
          className={s.word}
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={show ? { opacity: 1, filter: "blur(0px)" } : undefined}
          transition={{ delay: start + i * step, duration: 0.6 }}
        >
          {w}{" "}
        </motion.span>
      ))}
    </>
  );
}

const wordCount = (arr: string[]) => arr.join(" ").split(/\s+/).length;
const STEP = 0.05;

export function LetterLeft({ show }: { show: boolean }) {
  const ref = useFitText([]);
  let t = 0.2;
  return (
    <div className={`${s.pageInner} ${s.letterPage}`} ref={ref}>
      <p className={s.greeting}>
        <InkWords text={fill(content.letter.greeting)} show={show} start={t} step={0.12} />
      </p>
      {content.letter.left.map((para, i) => {
        const start = (t += i === 0 ? 0.6 : wordCount([content.letter.left[i - 1]]) * STEP + 0.3);
        return (
          <p key={i} className={s.para}>
            <InkWords text={fill(para)} show={show} start={start} step={STEP} />
          </p>
        );
      })}
    </div>
  );
}

const LEFT_DURATION = 1 + wordCount(content.letter.left) * STEP + content.letter.left.length * 0.3;

export function LetterRight({ show }: { show: boolean }) {
  const ref = useFitText([]);
  let t = LEFT_DURATION;
  const endT = LEFT_DURATION + wordCount(content.letter.right) * STEP + content.letter.right.length * 0.3;
  return (
    <div className={`${s.pageInner} ${s.letterPage}`} ref={ref}>
      {content.letter.right.map((para, i) => {
        const start = (t += i === 0 ? 0 : wordCount([content.letter.right[i - 1]]) * STEP + 0.3);
        return (
          <p key={i} className={s.para}>
            <InkWords text={fill(para)} show={show} start={start} step={STEP} />
          </p>
        );
      })}
      <p className={s.signoff}>
        <InkWords text={fill(content.letter.signoff)} show={show} start={endT + 0.2} step={0.12} />
      </p>
      <motion.p
        className={s.signature}
        initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
        animate={show ? { opacity: 1, clipPath: "inset(0 0% 0 0)" } : undefined}
        transition={{ delay: endT + 0.9, duration: 1.6, ease: "easeInOut" }}
      >
        {fill(content.me)}
      </motion.p>
      <motion.div
        className={s.letterHeart}
        initial={{ opacity: 0, scale: 0 }}
        animate={show ? { opacity: 1, scale: 1 } : undefined}
        transition={{ delay: endT + 2.4, type: "spring", stiffness: 300, damping: 12 }}
      >
        <PixelSprite name="heart" px={4} />
      </motion.div>
    </div>
  );
}


const NOTE_SLOTS = [
  { x: 30, y: 122, r: -4 },
  { x: 252, y: 128, r: 3 },
  { x: 36, y: 268, r: 2 },
  { x: 246, y: 274, r: -3 },
  { x: 28, y: 414, r: -2 },
  { x: 250, y: 420, r: 4 },
];

function FoldedNote({ text, n, slot, show, delay, onOpen }: { text: string; n: number; slot: (typeof NOTE_SLOTS)[number]; show: boolean; delay: number; onOpen: () => void }) {
  const { sfx } = useMusic();
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      className={s.noteSlot}
      style={{ left: slot.x, top: slot.y }}
      initial={{ opacity: 0, y: -24, rotate: slot.r * 3 }}
      animate={show ? { opacity: 1, y: 0, rotate: slot.r } : undefined}
      transition={{ delay, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {!open ? (
          <motion.button
            key="closed"
            className={s.folded}
            aria-label={`unfold note ${n}`}
            whileHover={{ y: -3, rotate: -2 }}
            exit={{ rotateX: 80, opacity: 0, transition: { duration: 0.18 } }}
            onClick={() => {
              sfx("pop");
              setOpen(true);
              onOpen();
            }}
          >
            <span className={s.foldCrease} />
            <span className={s.foldNo}>no. {n}</span>
            <span className={s.foldSticker}>
              <PixelSprite name="heart" px={3} />
            </span>
          </motion.button>
        ) : (
          <motion.div
            key="open"
            className={s.unfolded}
            initial={{ rotateX: -85, scaleY: 0.4, opacity: 0 }}
            animate={{ rotateX: 0, scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.45, ease: [0.2, 0.9, 0.3, 1.1] }}
          >
            <span className={s.unfoldCrease} />
            <span className={s.unfoldNo}>{n}.</span>
            <p>{text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function LittleThings({ show }: { show: boolean }) {
  const lt = content.littleThings;
  const [opened, setOpened] = useState(0);
  const all = opened >= Math.min(lt.notes.length, NOTE_SLOTS.length);
  return (
    <div className={s.pageInner}>
      <h3 className={s.ltTitle}>{fill(lt.title)}</h3>
      <motion.span
        className={s.scribble}
        style={{ left: 300, top: 78, fontSize: 24, rotate: "-4deg" }}
        initial={{ opacity: 0 }}
        animate={show ? { opacity: 1 } : undefined}
        transition={{ delay: 1, duration: 0.6 }}
      >
        {fill(lt.hint)}
      </motion.span>
      <Doodle kind="underline" x={40} y={84} w={240} h={12} show={show} delay={0.3} />
      {lt.notes.slice(0, NOTE_SLOTS.length).map((t, i) => (
        <FoldedNote key={i} n={i + 1} text={fill(t)} slot={NOTE_SLOTS[i]} show={show} delay={0.5 + i * 0.18} onOpen={() => setOpened((o) => o + 1)} />
      ))}
      <motion.span
        className={s.scribble}
        style={{ left: 120, top: 560, fontSize: 26, rotate: "-2deg" }}
        initial={{ opacity: 0 }}
        animate={all ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        …and a hundred more ♥
      </motion.span>
    </div>
  );
}

function PressedFlowerArt() {
  const petal = "M0 0 C -17 -10, -22 -40, 0 -52 C 22 -40, 17 -10, 0 0 Z";
  return (
    <svg viewBox="0 0 240 320" width={240} height={320} aria-hidden>
      {/* stems */}
      <g fill="none" stroke="#6f6d44" strokeLinecap="round" opacity={0.85}>
        <path d="M120 312 C 117 260, 129 210, 123 160 C 119 128, 124 104, 126 92" strokeWidth={3} />
        <path d="M122 205 C 140 190, 160 172, 170 146" strokeWidth={2} />
      </g>
      {/* leaves */}
      <g fill="#7c7a4c" opacity={0.72}>
        <path d="M121 250 C 95 240, 76 218, 66 194 C 94 198, 114 220, 121 250 Z" />
        <path d="M123 178 C 150 172, 170 156, 180 134 C 152 137, 132 152, 123 178 Z" />
      </g>
      <g fill="none" stroke="#5d5b3a" strokeWidth={0.8} opacity={0.6}>
        <path d="M121 249 C 104 232, 86 214, 70 197" />
        <path d="M124 177 C 142 162, 160 150, 177 136" />
      </g>
      {/* bud */}
      <g transform="translate(170 146) rotate(28)">
        <path d="M0 0 C -8 -6, -8 -20, 0 -27 C 8 -20, 8 -6, 0 0 Z" fill="#a8504f" opacity={0.7} />
        <path d="M0 0 C -6 -4, -7 -10, -4 -14 M0 0 C 6 -4, 7 -10, 4 -14" stroke="#6f6d44" strokeWidth={1.4} fill="none" />
      </g>
      {/* flower head: five slightly uneven petals */}
      <g transform="translate(126 86)">
        {[0, 70, 146, 214, 290].map((deg, i) => (
          <g key={deg} transform={`rotate(${deg}) scale(${1 - (i % 2) * 0.08})`}>
            <path d={petal} fill="#c48a7c" opacity={0.78} stroke="#9a5f55" strokeWidth={0.8} />
            <path d="M0 -4 L0 -40" stroke="#9a5f55" strokeWidth={0.6} opacity={0.5} />
          </g>
        ))}
        <circle r={9} fill="#b8925a" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx={Math.cos(i) * 5} cy={Math.sin(i) * 5} r={1.3} fill="#7d5a35" />
        ))}
      </g>
    </svg>
  );
}

export function PressedFlower({ show }: { show: boolean }) {
  const p = content.pressed;
  return (
    <div className={s.pageInner}>
      <motion.div
        className={s.pfFlower}
        initial={{ opacity: 0, scale: 1.06, rotate: -14 }}
        animate={show ? { opacity: 1, scale: 1, rotate: -8 } : undefined}
        transition={{ delay: 0.3, duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <PressedFlowerArt />
        <motion.span
          className={s.pfTape}
          style={{ left: 74, top: 226, rotate: "-18deg" }}
          initial={{ opacity: 0, scale: 1.4 }}
          animate={show ? { opacity: 1, scale: 1 } : undefined}
          transition={{ delay: 1.3, duration: 0.25 }}
        />
        <motion.span
          className={s.pfTape}
          style={{ left: 138, top: 30, rotate: "24deg" }}
          initial={{ opacity: 0, scale: 1.4 }}
          animate={show ? { opacity: 1, scale: 1 } : undefined}
          transition={{ delay: 1.5, duration: 0.25 }}
        />
      </motion.div>
      <motion.div
        className={s.pfTag}
        initial={{ opacity: 0, y: -8 }}
        animate={show ? { opacity: 1, y: 0 } : undefined}
        transition={{ delay: 1.8, duration: 0.6 }}
      >
        <span className={s.pfTagNo}>specimen no. 1</span>
        <span className={s.pfTagText}>{fill(p.tag)}</span>
      </motion.div>
    </div>
  );
}