// Open Graph images (1200×630 PNG), drawn at build time with satori and rasterized with resvg.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

const require = createRequire(import.meta.url);
const font = (file) => readFileSync(require.resolve(`@fontsource/${file}`));

const FONTS = [
  {
    name: "Inter",
    weight: 400,
    data: font("inter/files/inter-latin-400-normal.woff"),
  },
  {
    name: "Inter",
    weight: 500,
    data: font("inter/files/inter-latin-500-normal.woff"),
  },
  {
    name: "Serif",
    weight: 400,
    style: "italic",
    data: font("instrument-serif/files/instrument-serif-latin-400-italic.woff"),
  },
  {
    name: "Mono",
    weight: 400,
    data: font("geist-mono/files/geist-mono-latin-400-normal.woff"),
  },
];

const COLORS = {
  bg: "#000",
  border: "#1f1d1b",
  text: "#eee5d8",
  muted: "rgba(238,229,216,0.5)",
  accent: "#ff5c30",
};

/** Minimal element factory in the shape satori expects. */
const h = (type, style, ...children) => ({
  type,
  props: {
    style: { display: "flex", ...style },
    children: children.flat().filter((c) => c !== null && c !== false),
  },
});

// WhatsApp formatting markers would show up literally, so they are dropped from the bubble.
const plain = (text) => text.replace(/[*_~`]/g, "");

/**
 * @param {{ eyebrow: string, title: string, accent: string, bubble?: { header?: string, body: string, footer?: string }, badge?: string }} card
 */
export async function ogImage({ eyebrow, title, accent, bubble, badge }) {
  const svg = await satori(
    h(
      "div",
      {
        width: 1200,
        height: 630,
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: "Inter",
        padding: "0 72px",
        borderLeft: `2px solid ${COLORS.border}`,
        borderRight: `2px solid ${COLORS.border}`,
        alignItems: "center",
        gap: 56,
      },
      h(
        "div",
        // Fixed width next to the bubble: a flexible column would push it off the canvas.
        {
          flexDirection: "column",
          gap: 28,
          ...(bubble ? { width: 580 } : { flex: 1 }),
        },
        h(
          "div",
          {
            alignItems: "center",
            gap: 14,
            fontFamily: "Mono",
            fontSize: 20,
            color: COLORS.muted,
            letterSpacing: 2,
          },
          h("div", { width: 10, height: 10, background: COLORS.accent }),
          eyebrow.toUpperCase(),
        ),
        h(
          "div",
          { fontSize: bubble ? 58 : 72, lineHeight: 1.08, letterSpacing: -2.4 },
          title,
        ),
        h(
          "div",
          {
            fontFamily: "Serif",
            fontStyle: "italic",
            fontSize: bubble ? 62 : 80,
            lineHeight: 1,
            color: COLORS.accent,
          },
          accent,
        ),
        badge
          ? h(
              "div",
              {
                alignSelf: "flex-start",
                padding: "8px 14px",
                border: "1px solid rgba(111,207,151,0.45)",
                borderRadius: 8,
                color: "#6fcf97",
                fontFamily: "Mono",
                fontSize: 22,
              },
              badge,
            )
          : null,
        h(
          "div",
          {
            fontFamily: "Mono",
            fontSize: 20,
            color: COLORS.muted,
            marginTop: 12,
          },
          "template-builder.dev",
        ),
      ),
      bubble
        ? h(
            "div",
            {
              width: 420,
              padding: 28,
              borderRadius: 22,
              background: "#f8f6f2",
            },
            h(
              "div",
              {
                flexDirection: "column",
                gap: 10,
                width: "100%",
                padding: "16px 18px",
                borderRadius: 14,
                background: "#fff",
                color: "#0a0a0a",
                fontSize: 21,
                lineHeight: 1.35,
              },
              bubble.header
                ? h(
                    "div",
                    { fontWeight: 500, fontSize: 23 },
                    plain(bubble.header),
                  )
                : null,
              h("div", {}, truncate(plain(bubble.body), 230)),
              bubble.footer
                ? h(
                    "div",
                    { color: "#666", fontSize: 17 },
                    plain(bubble.footer),
                  )
                : null,
            ),
          )
        : null,
    ),
    { width: 1200, height: 630, fonts: FONTS },
  );
  return new Resvg(svg, { fitTo: { mode: "width", value: 1200 } })
    .render()
    .asPng();
}

const truncate = (text, max) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
