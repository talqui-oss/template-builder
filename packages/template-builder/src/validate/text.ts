const PLACEHOLDER = /\{\{(.*?)\}\}/g;
const VARIABLE_NAME = /^[a-z][a-z0-9_]*$/;
const INVISIBLE = /[\p{Default_Ignorable_Code_Point}\u2800]/gu;
const THAI_LAO = /[\u0E00-\u0E7F]/g;
const CJK =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu;
const EMOJI =
  /\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0F|\p{Emoji_Modifier})*(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\p{Emoji_Modifier})*)*/gu;
const MARKUP = /\*[^*\n]+\*|_[^_\n]+_|~[^~\n]+~|```[^`]+```/;

export type Placeholder = { raw: string; name: string; valid: boolean };

export function placeholders(text: string): Placeholder[] {
  return [...text.matchAll(PLACEHOLDER)].map((match) => {
    const name = match[1] ?? "";
    return { raw: match[0], name, valid: VARIABLE_NAME.test(name) };
  });
}

export const length = (text: string) => [...text].length;

export const countEmoji = (text: string) => text.match(EMOJI)?.length ?? 0;

export const hasMarkup = (text: string) =>
  text.includes("*") || MARKUP.test(text);

/** Words as Meta counts them for the variable ratio; each placeholder counts as one word. */
export function countWords(text: string): number {
  const clean = text.replace(INVISIBLE, "");
  const params = placeholders(clean).length;
  const thai = clean.match(THAI_LAO)?.length ?? 0;
  if (thai > 0) return Math.ceil(thai / 7) + params;
  const cjk = clean.match(CJK)?.length ?? 0;
  if (cjk > 0) return cjk + params;
  return clean.match(/\S+/g)?.length ?? 0;
}

const EDGE_START = /^[\s*_~`]*\{\{[^}]*\}\}/;
const EDGE_END = /\{\{[^}]*\}\}[\s*_~`]*!*\.*\?*[\s*_~`]*$/;
const ADJACENT = /\{\{[^}]*\}\}[\s*_~`]*\{\{[^}]*\}\}/;

export const startsOrEndsWithPlaceholder = (text: string) =>
  EDGE_START.test(text) || EDGE_END.test(text);

export const hasAdjacentPlaceholders = (text: string) => ADJACENT.test(text);
