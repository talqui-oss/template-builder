/**
 * Framework-neutral element tree for a preview. The React and Vue bindings only
 * translate these nodes into their own elements, so both render the same markup.
 */
import type { Line, Span } from "./format";
import type {
  ButtonIcon,
  PreviewButton,
  PreviewHeader,
  PreviewModel,
} from "./model";

export type PreviewNode = {
  tag: string;
  class?: string;
  attrs?: Record<string, string>;
  children?: (PreviewNode | string)[];
};

/** Platforms the preview can imitate. Android is planned. */
export type Platform = "ios";

export type TreeOptions = {
  platform?: Platform;
  /** Time shown in the bubble, e.g. "21:11". */
  time?: string;
};

const node = (
  tag: string,
  className: string | undefined,
  children: (PreviewNode | string)[] = [],
  attrs?: Record<string, string>,
): PreviewNode => ({ tag, class: className, attrs, children });

export function previewTree(
  model: PreviewModel,
  { platform = "ios", time = "10:24" }: TreeOptions = {},
): PreviewNode {
  const content = node("div", "tb-bubble__content", [
    ...(model.header ? [header(model.header)] : []),
    ...(model.limitedTimeOffer
      ? [node("div", "tb-offer", [model.limitedTimeOffer.text])]
      : []),
    node("div", "tb-bubble__body", lines(model.body)),
    // The time sits on the footer row, or on its own row when there is no footer.
    node("div", "tb-bubble__meta", [
      node("div", "tb-bubble__footer", model.footer ? lines(model.footer) : []),
      node("time", "tb-bubble__time", [time]),
    ]),
  ]);

  return node(
    "div",
    "tb-preview",
    [
      node("div", "tb-bubble", [
        content,
        ...model.buttons.map(button),
        node(
          "svg",
          "tb-bubble__tail",
          [node("path", undefined, [], { d: TAIL })],
          {
            viewBox: "0 0 12.4 10.33",
            "aria-hidden": "true",
          },
        ),
      ]),
      ...(model.carousel ?? []).map((card) =>
        node("div", "tb-card", [
          header(card.header),
          node("div", "tb-bubble__body", lines(card.body)),
          ...card.buttons.map(button),
        ]),
      ),
    ],
    { "data-platform": platform },
  );
}

function header(h: PreviewHeader): PreviewNode {
  switch (h.type) {
    case "TEXT":
      return node("div", "tb-header tb-header--text", lines(h.lines));
    case "IMAGE":
    case "GIF":
      return node("img", "tb-header tb-header--media", [], {
        src: h.url,
        alt: "",
      });
    case "VIDEO":
      return node("video", "tb-header tb-header--media", [], {
        src: h.url,
        muted: "",
      });
    case "DOCUMENT":
      return node("div", "tb-header tb-header--document", [h.filename]);
    default:
      return node("div", `tb-header tb-header--${h.type.toLowerCase()}`);
  }
}

const lines = (list: Line[]): PreviewNode[] =>
  list.map((line) =>
    line.kind === "code"
      ? node("pre", "tb-line tb-line--code", [line.text])
      : node(
          "div",
          `tb-line tb-line--${line.kind}`,
          line.spans.length ? line.spans.map(span) : ["\u00a0"],
          line.kind === "numbered" ? { "data-marker": line.marker } : undefined,
        ),
  );

function span(s: Span): PreviewNode | string {
  const classes = [
    s.bold && "tb-bold",
    s.italic && "tb-italic",
    s.strike && "tb-strike",
    s.mono && "tb-mono",
    s.code && "tb-code",
  ].filter(Boolean);
  if (!classes.length && !s.variable) return s.text;
  return node(
    "span",
    classes.join(" ") || undefined,
    [s.text],
    s.variable ? { "data-variable": s.variable } : undefined,
  );
}

const button = (b: PreviewButton): PreviewNode =>
  node("div", "tb-button", [icon(b.icon), node("span", undefined, [b.label])]);

const icon = (name: ButtonIcon): PreviewNode => {
  const { width, height, paths } = ICONS[name];
  return node(
    "svg",
    "tb-button__icon",
    paths.map((d) => node("path", undefined, [], { d })),
    {
      viewBox: `0 0 ${width} ${height}`,
      width: String(width),
      height: String(height),
      "aria-hidden": "true",
    },
  );
};

// Bubble tail measured on a native 3x iOS screenshot, in points from the bubble's
// bottom-left corner shifted 6.2pt left. It leaves the bubble edge 10.33pt above
// the bottom, reaches its tip 6pt out, then ramps up into the rounded corner.
const TAIL = "M6.2 0C6.2 4.83 3.6 8.63 0 10.33H2Q6.7 9.83 9.8 7.33L12.2 0Z";

// Outline icons drawn for this project, in points. Their boxes match the icons
// iOS shows, so labels land where they do on the phone.
const ICONS: Record<
  ButtonIcon,
  { width: number; height: number; paths: string[] }
> = {
  reply: {
    width: 17.67,
    height: 15,
    paths: [
      "M7.2 .9.9 6.6l6.3 5.5V8.9c4.4-.2 7.7 1.5 9.8 5.3-.4-5.4-3.7-9.6-9.8-9.9Z",
    ],
  },
  link: {
    width: 15,
    height: 15,
    paths: [
      "M3.6.6h7.8a3 3 0 0 1 3 3v7.8a3 3 0 0 1-3 3H3.6a3 3 0 0 1-3-3V3.6a3 3 0 0 1 3-3Z",
      "M5 10l5.2-5.2M6 4.8h4.2V9",
    ],
  },
  phone: {
    width: 15.67,
    height: 15.67,
    paths: [
      "M3.4.9C2.2 1.4 1 2.6.9 3.9c-.2 4.5 6.5 11.3 11.2 11.2 1.3-.1 2.5-1.3 3-2.5.2-.5 0-1-.4-1.3l-2.4-1.7c-.4-.3-1-.2-1.3.1l-1.1 1.2C8 9.9 6.1 8 5.1 6.1L6.3 5c.3-.3.4-.9.1-1.3L4.7 1.3c-.3-.4-.8-.6-1.3-.4Z",
    ],
  },
  copy: {
    width: 15,
    height: 15,
    paths: [
      "M5.6 5.6h7.8a1 1 0 0 1 1 1v6.8a1 1 0 0 1-1 1H6.6a1 1 0 0 1-1-1Z",
      "M9.4 3V1.6a1 1 0 0 0-1-1H1.6a1 1 0 0 0-1 1v6.8a1 1 0 0 0 1 1H3",
    ],
  },
  list: {
    width: 15,
    height: 15,
    paths: [
      "M4.5 2.5h10M4.5 7.5h10M4.5 12.5h10M.6 2.5h.1M.6 7.5h.1M.6 12.5h.1",
    ],
  },
  cart: {
    width: 16,
    height: 15,
    paths: ["M.6 1h2.3l1.9 9.3h8.6L15.4 3.8H3.8", "M6 14h.1M13 14h.1"],
  },
};
