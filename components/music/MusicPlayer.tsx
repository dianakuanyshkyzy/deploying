"use client";

/* The little pixel cassette in the corner. Reels spin while music plays.
   Click = play / pause (uses useMusic() from ./MusicProvider). */

import { content } from "@/content";
import { useMusic } from "./MusicProvider";
import styles from "./MusicPlayer.module.css";

function Reel({ cx, cy }: { cx: number; cy: number }) {
  // a 5x5 pixel ring with a spinning plus-shaped hub
  return (
    <g>
      <rect x={cx - 1.5} y={cy - 2.5} width={3} height={5} fill="#ecdfc6" />
      <rect x={cx - 2.5} y={cy - 1.5} width={5} height={3} fill="#ecdfc6" />
      <g className={styles.hub} style={{ transformOrigin: `${cx}px ${cy}px` }}>
        <rect x={cx - 0.5} y={cy - 1.5} width={1} height={3} fill="#2a1e18" />
        <rect x={cx - 1.5} y={cy - 0.5} width={3} height={1} fill="#2a1e18" />
      </g>
    </g>
  );
}

export function MusicPlayer() {
  const { playing, toggle, usingFallback, index, docked } = useMusic();
  if (docked) return null; // the big tape deck is on screen instead
  const song = content.music.songs[index];
  const title = usingFallback ? "music box · side A" : `${song.title} · ${song.artist}`;
  return (
    <button
      className={`${styles.player} ${playing ? styles.on : ""}`}
      onClick={toggle}
      aria-label={playing ? "pause music" : "play music"}
      title={playing ? "pause" : "play"}
    >
      <svg viewBox="0 0 34 22" width={136} height={88} shapeRendering="crispEdges" aria-hidden>
        <rect x={1} y={0} width={32} height={22} fill="#0e0a08" />
        <rect x={0} y={1} width={34} height={20} fill="#0e0a08" />
        <rect x={1} y={1} width={32} height={20} fill="#3a2a20" />
        <rect x={1} y={1} width={32} height={1} fill="#5c3a28" />
        {/* label */}
        <rect x={4} y={3} width={26} height={9} fill="#e0cfae" />
        <rect x={4} y={3} width={26} height={2} fill="#7a2b2f" />
        <rect x={4} y={10} width={26} height={1} fill="#b8925a" />
        {/* window */}
        <rect x={8} y={12} width={18} height={6} fill="#140e0b" />
        <rect x={13} y={14} width={8} height={2} fill="#5c3a28" />
        <Reel cx={11} cy={15} />
        <Reel cx={23} cy={15} />
        {/* screws */}
        <rect x={2} y={2} width={1} height={1} fill="#b8925a" />
        <rect x={31} y={2} width={1} height={1} fill="#b8925a" />
        <rect x={2} y={19} width={1} height={1} fill="#b8925a" />
        <rect x={31} y={19} width={1} height={1} fill="#b8925a" />
        {/* bottom lip */}
        <rect x={8} y={19} width={18} height={2} fill="#2a1e18" />
      </svg>
      <span className={styles.label}>
        <span className={styles.marquee}>
          <span>{title}</span>
          <span aria-hidden>{title}</span>
        </span>
      </span>
      <span className={styles.state}>{playing ? "❚❚ pause" : "▶ play"}</span>
    </button>
  );
}
