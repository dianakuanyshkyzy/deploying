# one month ♥

A tiny two-page website: a retro terminal and a pixel 3D envelope first, then a diary where your photos fly in, the page turns to your letter, then little folded notes + a pinky promise, and at the end the corner cassette flies into the middle as a tape player with your songs and a note for each one.

## run it

You need [Node.js](https://nodejs.org) (version 20 or newer).

```bash
npm install
npm run dev
```

Open http://localhost:3000

On the tape player: ← / → change songs, space plays/pauses.

## make it yours (everything is in `content.ts`)

| what | where |
|---|---|
| his name / your name | `him`, `me` at the top (`{him}` / `{me}` get replaced everywhere) |
| the date you started | `startDate` (drives the live "together for…" counter) |
| terminal text | `intro.lines` |
| photos | put `01.jpg` … `06.jpg` in `public/photos/` |
| captions + ticket | `photos[].caption`, `ticket` |
| **the letter** | `letter.left` (left page) and `letter.right` (right page), one string per paragraph. The handwriting shrinks by itself if it gets long. |
| little folded notes | `littleThings.notes` (6 short ones) |
| pinky-promise text | `contract` |
| **songs** | put `01.mp3`, `02.mp3`… in `public/music/`, then fill `music.songs` — each has `title`, `artist` and `note` (your thoughts about that song, shown on the paper note on the tape player). Add/remove entries freely. A missing file plays a built-in music-box tune instead. |
| last line | `ending` |

## send it to him

Easiest: push this folder to GitHub and import it on [vercel.com](https://vercel.com). It's free, and you'll get a link like `something.vercel.app`.

## where things live

```
app/layout.tsx              fonts, film grain, music player (stays on across pages)
app/page.tsx                page 1  → components/intro/Intro.tsx
app/diary/page.tsx          page 2  → components/diary/Diary.tsx
components/intro/
  Terminal.tsx              typing window + the "no" button that runs away
  EnvelopeScene.tsx         three.js envelope, rendered at a low resolution for the pixel look
  Counter.tsx               live counter
components/diary/
  Diary.tsx                 book, page-turn logic, then the tape-deck stage
  Pages.tsx                 contents of every diary page (photos, letter, folded notes, promise)
  Photo.tsx                 polaroid + placeholder
  WaxSeal.tsx, SignaturePad.tsx, Doodles.tsx
components/music/
  MusicProvider.tsx         the playlist: play/pause/next/prev, falls back to the music box
  MusicPlayer.tsx           the little cassette in the corner
  TapeDeck.tsx              the big tape player + track list + song note at the end
  musicbox.ts               Web Audio music box, vinyl crackle, page-flip/stamp sounds
components/ui/sprites.ts    all the pixel art (hearts, flower, camera…) as text grids
```
