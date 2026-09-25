"use client";

/* A polaroid with washi tape. Shows the real picture if the file exists,
   otherwise a sepia placeholder that says where to put the photo. */

import { useEffect, useRef, useState } from "react";
import { PixelSprite } from "@/components/ui/PixelSprite";
import s from "./Diary.module.css";

export function Polaroid({
  src,
  caption,
  label,
  width,
  tape = "top",
  tapeTone = 0,
}: {
  src: string;
  caption: string;
  label: string;
  width: number;
  tape?: "top" | "corners" | "none";
  tapeTone?: number;
}) {
  const [failed, setFailed] = useState(!src);
  const img = useRef<HTMLImageElement>(null);
  // if the image already failed before React woke up, onError never fires — check by hand
  useEffect(() => {
    const el = img.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, []);
  const inner = width - 20;
  return (
    <figure className={s.polaroid} style={{ width }}>
      <div className={s.photoWrap} style={{ width: inner, height: inner }}>
        {!failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img ref={img} src={src} alt={caption} className={s.photo} onError={() => setFailed(true)} draggable={false} />
        ) : (
          <div className={s.placeholder}>
            <PixelSprite name="camera" px={4} />
            <span>{label}</span>
            <small>{src ? src.replace(/^\//, "public/") : "add a photo"}</small>
          </div>
        )}
      </div>
      <figcaption className={s.caption}>{caption}</figcaption>
      {tape === "top" && <span className={`${s.tape} ${s[`tape${tapeTone % 3}`]}`} style={{ top: -12, left: "50%", marginLeft: -38, rotate: `${tapeTone % 2 ? 4 : -3}deg` }} />}
      {tape === "corners" && (
        <>
          <span className={`${s.tape} ${s[`tape${tapeTone % 3}`]}`} style={{ top: -6, left: -22, width: 62, rotate: "-38deg" }} />
          <span className={`${s.tape} ${s[`tape${(tapeTone + 1) % 3}`]}`} style={{ bottom: -4, right: -22, width: 62, rotate: "-38deg" }} />
        </>
      )}
    </figure>
  );
}
