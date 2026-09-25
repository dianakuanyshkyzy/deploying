"use client";

/* Hand-drawn ink doodles (wobbly SVG paths) that "draw themselves" once visible. */

import { motion } from "framer-motion";

const paths = {
  heart:
    "M24 40 C 8 28, 2 18, 8 10 C 13 3, 22 5, 24 14 C 27 4, 37 2, 41 10 C 46 20, 38 29, 24 40 Z",
  arrow: "M4 30 C 20 10, 46 6, 70 14 M60 6 L71 14 L61 23",
  star: "M20 3 L24 16 L37 16 L27 24 L31 37 L20 29 L9 37 L13 24 L3 16 L16 16 Z",
  swirl: "M6 20 C 6 8, 22 6, 24 16 C 26 26, 12 28, 12 20 C 12 12, 30 4, 44 14 C 52 20, 60 18, 66 10",
  underline: "M2 8 C 40 2, 90 12, 150 5 C 170 3, 185 7, 196 4",
  circle: "M50 6 C 80 4, 96 20, 92 36 C 88 54, 50 60, 22 52 C 2 46, 0 24, 16 14 C 28 6, 48 4, 62 8",
};

export type DoodleKind = keyof typeof paths;

export function Doodle({
  kind,
  x,
  y,
  w = 48,
  h = 44,
  color = "#5e1f24",
  delay = 0,
  show,
  rotate = 0,
  stroke = 2.2,
}: {
  kind: DoodleKind;
  x: number;
  y: number;
  w?: number;
  h?: number;
  color?: string;
  delay?: number;
  show: boolean;
  rotate?: number;
  stroke?: number;
}) {
  const vb = {
    heart: "0 0 48 44",
    arrow: "0 0 76 36",
    star: "0 0 40 40",
    swirl: "0 0 70 32",
    underline: "0 0 200 12",
    circle: "0 0 100 64",
  }[kind];
  return (
    <svg
      aria-hidden
      viewBox={vb}
      width={w}
      height={h}
      style={{ position: "absolute", left: x, top: y, rotate: `${rotate}deg`, overflow: "visible", pointerEvents: "none" }}
    >
      <motion.path
        d={paths[kind]}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={show ? { pathLength: 1, opacity: 0.85 } : { pathLength: 0, opacity: 0 }}
        transition={{ delay: show ? delay : 0, duration: 1.1, ease: "easeInOut" }}
      />
    </svg>
  );
}
