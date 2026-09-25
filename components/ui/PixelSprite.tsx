import { outlined, sprites, type SpriteName } from "./sprites";

type Props = {
  name: SpriteName;
  /** size of one "pixel" in css px */
  px?: number;
  outline?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

/* Renders a sprite from ./sprites as crisp SVG rects (no image files needed). */
export function PixelSprite({ name, px = 4, outline = true, className, style }: Props) {
  const s = outline ? outlined(sprites[name]) : sprites[name];
  const w = Math.max(...s.rows.map((r) => r.length));
  const h = s.rows.length;
  const rects: React.ReactNode[] = [];
  s.rows.forEach((row, y) =>
    [...row].forEach((c, x) => {
      if (c === ".") return;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={(s.palette as Record<string, string>)[c]} />);
    }),
  );
  return (
    <svg
      aria-hidden
      className={className}
      style={style}
      width={w * px}
      height={h * px}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
    >
      {rects}
    </svg>
  );
}
