/* Tiny hand-placed pixel sprites.
   Each sprite is a list of rows; every character is one pixel:
   "." = empty, any other letter = a colour from the sprite's palette. */

export type Sprite = { rows: string[]; palette: Record<string, string> };

const heartRows = [
  ".XX...XX.",
  "XHXX.XXXX",
  "XHXXXXXXX",
  "XXXXXXXXX",
  ".XXXXXXX.",
  "..XXXXX..",
  "...XXX...",
  "....X....",
];

export const sprites = {
  heart: {
    rows: heartRows,
    palette: { X: "#9e3b3e", H: "#e8b5a0" },
  },
  heartDark: {
    rows: heartRows,
    palette: { X: "#5e1f24", H: "#a8504f" },
  },
  sparkle: {
    rows: [
      "...X...",
      "...X...",
      "..XYX..",
      "XXYYYXX",
      "..XYX..",
      "...X...",
      "...X...",
    ],
    palette: { X: "#e7b872", Y: "#f6e3bd" },
  },
  flower: {
    rows: [
      "..PP.PP..",
      ".PPPPPPP.",
      "..PPYPP..",
      ".PPPPPPP.",
      "..PP.PP..",
      "....G....",
      "..G.G....",
      "...GG.GG.",
      "....GG...",
      "....G....",
    ],
    palette: { P: "#c48a7c", Y: "#e7b872", G: "#6f6d44" },
  },
  moon: {
    rows: [
      "..MMMM..",
      ".MMM....",
      "MMM.....",
      "MMM.....",
      "MMM.....",
      "MMM.....",
      ".MMM....",
      "..MMMM..",
    ],
    palette: { M: "#e7cf9a" },
  },
  camera: {
    rows: [
      "..BBB......",
      "BBBBBBBBBBB",
      "BLLLDDDLLLB",
      "BLLDGGGDLLB",
      "BLLDGWGDLLB",
      "BLLDGGGDLLB",
      "BLLLDDDLLLB",
      "BBBBBBBBBBB",
    ],
    palette: { B: "#2a1e18", L: "#8a6a50", D: "#1a1310", G: "#4a5a5c", W: "#d8e0dc" },
  },
  envelope: {
    rows: [
      "OOOOOOOOOOO",
      "OPOPPPPPOPO",
      "OPPOPPPOPPO",
      "OPPPOROPPPO",
      "OPPPPOPPPPO",
      "OPPPPPPPPPO",
      "OOOOOOOOOOO",
    ],
    palette: { O: "#3a2a20", P: "#ecdfc6", R: "#9e3b3e" },
  },
  note: {
    rows: [
      "...NNNN",
      "...N..N",
      "...N..N",
      "...N..N",
      ".NNN.NN",
      "NNNNNNN",
      ".NN.NN.",
    ],
    palette: { N: "#e7b872" },
  },
  cherry: {
    rows: [
      "....GG.",
      "...G.G.",
      "..G..G.",
      ".G....G",
      "RR...RR",
      "RHR.RHR",
      "RRR.RRR",
      ".R...R.",
    ],
    palette: { G: "#6f6d44", R: "#8a2c30", H: "#e8b5a0" },
  },
} satisfies Record<string, Sprite>;

export type SpriteName = keyof typeof sprites;

/* Adds a 1px dark outline around any sprite (so they read on any background). */
export function outlined(s: Sprite, outline = "#140e0b"): Sprite {
  const h = s.rows.length + 2;
  const w = Math.max(...s.rows.map((r) => r.length)) + 2;
  const grid: string[][] = Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => s.rows[y - 1]?.[x - 1] ?? "."),
  );
  const out = grid.map((row) => row.slice());
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (grid[y][x] !== ".") continue;
      const n = [grid[y - 1]?.[x], grid[y + 1]?.[x], grid[y][x - 1], grid[y][x + 1]];
      if (n.some((c) => c && c !== ".")) out[y][x] = "@";
    }
  return { rows: out.map((r) => r.join("")), palette: { ...s.palette, "@": outline } };
}
