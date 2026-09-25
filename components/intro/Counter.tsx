"use client";

/* live "together for …" counter, counting up from content.startDate */

import { useEffect, useState } from "react";
import { content } from "@/content";
import s from "./Intro.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

export function Counter() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (now === null) return null;
  const diff = Math.max(0, now - new Date(content.startDate).getTime());
  const sec = Math.floor(diff / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return (
    <div className={s.counter} aria-label={`together for ${d} days`}>
      <span className={s.counterLabel}>together for</span>
      <span>
        {d}d {pad(h)}h {pad(m)}m {pad(sec % 60)}s
      </span>
    </div>
  );
}
