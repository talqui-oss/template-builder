/**
 * WhatsApp text formatting, parsed into lines and styled spans.
 *
 * Supported, as WhatsApp renders them:
 *   *bold*  _italic_  ~strike~  ```monospace```  `inline code`
 *   "- " or "* " bullet lines, "1. " numbered lines, "> " quote lines,
 *   and ``` blocks spanning several lines.
 */

export type Span = {
  text: string;
  bold?: true;
  italic?: true;
  strike?: true;
  /** ```monospace``` inside a line. */
  mono?: true;
  /** `inline code`. */
  code?: true;
  /** Set when the span is a `{{name}}` placeholder; `text` holds its value. */
  variable?: string;
};

export type Line =
  | { kind: "paragraph" | "quote"; spans: Span[] }
  | { kind: "bullet"; spans: Span[] }
  | { kind: "numbered"; marker: string; spans: Span[] }
  | { kind: "code"; text: string };

type Mark = "bold" | "italic" | "strike" | "mono" | "code";

const MARKERS: [string, Mark][] = [
  ["```", "mono"],
  ["*", "bold"],
  ["_", "italic"],
  ["~", "strike"],
  ["`", "code"],
];

// Placeholders become one private-use character each, so formatting can wrap them
// and they are never split or read as markers.
const TOKEN = 0xe000;
const isToken = (char = "") => {
  const code = char.charCodeAt(0);
  return code >= TOKEN && code < TOKEN + 0x1000;
};
const isWordChar = (char = "") => /[\p{L}\p{N}]/u.test(char) || isToken(char);
const isSpace = (char = "") => /\s/.test(char);

/**
 * Parses a template text. `resolve` gives the value shown for each `{{name}}`.
 */
export function parseText(
  text: string,
  resolve: (name: string) => string,
): Line[] {
  const names: string[] = [];
  const tokenized = text.replace(/\{\{(.*?)\}\}/g, (_, name: string) =>
    String.fromCharCode(TOKEN + names.push(name) - 1),
  );
  const toSpans = (source: string) =>
    inline(source, {}).flatMap((span) => expandTokens(span, names, resolve));

  const lines: Line[] = [];
  const rows = tokenized.split("\n");
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    // A ``` block that opens a line and closes on a later one keeps its text verbatim.
    if (row.startsWith("```") && !row.slice(3).includes("```")) {
      const end = rows.findIndex((r, j) => j > i && r.endsWith("```"));
      if (end !== -1) {
        const block = [
          row.slice(3),
          ...rows.slice(i + 1, end),
          rows[end]!.slice(0, -3),
        ];
        lines.push({
          kind: "code",
          text: detokenize(block.join("\n"), names, resolve),
        });
        i = end;
        continue;
      }
    }
    const numbered = /^(\d+)\. (.*)$/.exec(row);
    if (numbered)
      lines.push({
        kind: "numbered",
        marker: `${numbered[1]}.`,
        spans: toSpans(numbered[2]!),
      });
    else if (/^[-*] /.test(row))
      lines.push({ kind: "bullet", spans: toSpans(row.slice(2)) });
    else if (row.startsWith("> "))
      lines.push({ kind: "quote", spans: toSpans(row.slice(2)) });
    else lines.push({ kind: "paragraph", spans: toSpans(row) });
  }
  return lines;
}

/** Splits a line into spans, applying the first valid marker pair and recursing inside it. */
function inline(text: string, marks: Partial<Record<Mark, true>>): Span[] {
  for (let i = 0; i < text.length; i++) {
    for (const [marker, mark] of MARKERS) {
      if (!text.startsWith(marker, i) || marks[mark]) continue;
      const close = findClose(text, i, marker);
      if (close === -1) continue;
      const inner = text.slice(i + marker.length, close);
      // Code and monospace show their content as typed, without nested formatting.
      const content =
        mark === "mono" || mark === "code"
          ? [{ text: inner, ...marks, [mark]: true as const }]
          : inline(inner, { ...marks, [mark]: true });
      return [
        ...plain(text.slice(0, i), marks),
        ...content,
        ...inline(text.slice(close + marker.length), marks),
      ];
    }
  }
  return plain(text, marks);
}

/**
 * Finds the closing marker. An opening marker must start a word and be followed by text;
 * a closing one must follow text and end a word. This is why `2*3*4` stays plain.
 */
function findClose(text: string, open: number, marker: string): number {
  const before = text[open - 1];
  const first = text[open + marker.length];
  if (isWordChar(before) || first === undefined || isSpace(first)) return -1;
  for (
    let j = open + marker.length + 1;
    j <= text.length - marker.length;
    j++
  ) {
    if (!text.startsWith(marker, j)) continue;
    if (!isSpace(text[j - 1]) && !isWordChar(text[j + marker.length])) return j;
  }
  return -1;
}

const plain = (text: string, marks: Partial<Record<Mark, true>>): Span[] =>
  text ? [{ text, ...marks }] : [];

function expandTokens(
  span: Span,
  names: string[],
  resolve: (name: string) => string,
): Span[] {
  return [...span.text.split(/([\uE000-\uEFFF])/u)]
    .filter(Boolean)
    .map((part) => {
      if (!isToken(part)) return { ...span, text: part };
      const name = names[part.charCodeAt(0) - TOKEN]!;
      return { ...span, text: resolve(name), variable: name };
    });
}

const detokenize = (
  text: string,
  names: string[],
  resolve: (name: string) => string,
) =>
  text.replace(/[\uE000-\uEFFF]/gu, (char) =>
    resolve(names[char.charCodeAt(0) - TOKEN]!),
  );
