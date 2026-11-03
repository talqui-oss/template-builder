import { useMemo } from "react";

/** Characters from empty to dense. */
const RAMP = " .,:;-=+*#%@";

// A character cell is about 0.6 times as wide as it is tall, so x is scaled to keep shapes round.
const CELL_ASPECT = 0.6;

type Props = {
  cols?: number;
  rows?: number;
  className?: string;
};

/**
 * A phone receiving a template, drawn with text characters. The scene is computed, not an image,
 * so it stays sharp at any size and renders the same on the server. Two layers: the neutral
 * scene and the message bubbles in the accent color.
 */
export function AsciiArt({ cols = 244, rows = 54, className }: Props) {
  const { scene, accent } = useMemo(() => drawScene(cols, rows), [cols, rows]);
  return (
    <div className={`lp-ascii ${className ?? ""}`} aria-hidden="true">
      <pre className="lp-ascii__layer">{scene}</pre>
      <pre className="lp-ascii__layer lp-ascii__layer--accent">{accent}</pre>
    </div>
  );
}

function drawScene(cols: number, rows: number) {
  const width = cols * CELL_ASPECT;
  const phone = {
    x: width * 0.66,
    y: rows * 0.5,
    halfW: 12,
    halfH: 22,
    radius: 4,
  };
  const tilt = (-12 * Math.PI) / 180;
  const rays = { x: width * 1.05, y: rows * -0.1 };

  let scene = "";
  let accent = "";
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * CELL_ASPECT;
      const y = row;
      // Phone-local coordinates: undo the tilt around the phone center.
      const dx = x - phone.x;
      const dy = y - phone.y;
      const px = dx * Math.cos(-tilt) - dy * Math.sin(-tilt);
      const py = dx * Math.sin(-tilt) + dy * Math.cos(-tilt);
      const edge = roundedBox(px, py, phone.halfW, phone.halfH, phone.radius);
      const grain = hash(col, row);

      let ink: number;
      let bubble = 0;
      if (Math.abs(edge) < 0.8) ink = 0.95;
      else if (edge < 0) {
        bubble = Math.max(
          inside(roundedBox(px + 1.5, py + 11, 8.5, 4, 2)) * 0.85,
          inside(roundedBox(px - 1.5, py + 2, 8.5, 3.2, 2)) * 0.7,
        );
        const buttons = Math.max(
          inside(roundedBox(px + 1.5, py - 5.5, 8.5, 1.3, 1)),
          inside(roundedBox(px + 1.5, py - 9, 8.5, 1.3, 1)),
        );
        ink = Math.max(buttons * 0.5, grain > 0.93 ? 0.12 : 0);
      } else {
        // Light streaks fanning out from the top right, fading toward the left.
        const angle = Math.atan2(y - rays.y, x - rays.x);
        const streak = hash(Math.floor(angle * 90), 7) > 0.62 ? 1 : 0;
        const distance = Math.hypot(x - rays.x, y - rays.y) / width;
        const fade = Math.max(0, 1 - distance * 1.15);
        ink = streak * fade * (grain > 0.35 ? 0.8 : 0.25);
        // A soft glow around the phone.
        ink = Math.max(
          ink,
          Math.max(0, 1 - edge / 7) * 0.35 * (grain > 0.5 ? 1 : 0),
        );
      }

      scene += bubble > 0 ? " " : char(ink, grain);
      accent += bubble > 0 ? char(bubble, grain) : " ";
    }
    scene += "\n";
    accent += "\n";
  }
  return { scene, accent };
}

/** Signed distance to a rounded box centered at the origin: negative inside. */
function roundedBox(
  x: number,
  y: number,
  halfW: number,
  halfH: number,
  radius: number,
) {
  const qx = Math.abs(x) - halfW + radius;
  const qy = Math.abs(y) - halfH + radius;
  return (
    Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) +
    Math.min(Math.max(qx, qy), 0) -
    radius
  );
}

const inside = (distance: number) => (distance < 0 ? 1 : 0);

/** Picks a character for an ink level, dithered by the cell's grain so edges are not banded. */
function char(ink: number, grain: number) {
  const level = Math.min(
    RAMP.length - 1,
    Math.floor(ink * (RAMP.length - 1) + grain * 0.9),
  );
  return ink <= 0.02 ? " " : RAMP[level];
}

/** Deterministic noise in [0, 1) for a cell, so the art is identical on every render. */
function hash(a: number, b: number) {
  const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return n - Math.floor(n);
}
