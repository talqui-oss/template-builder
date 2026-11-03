import type { Template } from "./schema/types";
import { placeholders } from "./validate/text";

export type TextField = { path: string; text: string };

/** Every template field that can hold `{{name}}` placeholders, in positional order. */
export function textFields(template: Template): TextField[] {
  if (template.category === "AUTHENTICATION") return [];
  const fields: TextField[] = [];
  if (template.header?.type === "TEXT")
    fields.push({ path: "header.text", text: template.header.text });
  fields.push({ path: "body.text", text: template.body.text });
  template.carousel?.cards.forEach((card, index) => {
    if (card.body)
      fields.push({
        path: `carousel.cards.${index}.body.text`,
        text: card.body.text,
      });
  });
  template.buttons?.forEach((button, index) => {
    if (button.type === "URL")
      fields.push({ path: `buttons.${index}.url`, text: button.url });
  });
  template.carousel?.cards.forEach((card, cardIndex) => {
    card.buttons?.forEach((button, index) => {
      if (button.type === "URL")
        fields.push({
          path: `carousel.cards.${cardIndex}.buttons.${index}.url`,
          text: button.url,
        });
    });
  });
  return fields;
}

/** Rewrites each `{{name}}` placeholder, e.g. to `{{1}}` for positional providers. */
export const replacePlaceholders = (
  text: string,
  replace: (name: string) => string,
) => text.replace(/\{\{(.*?)\}\}/g, (_, name: string) => replace(name));

/** Variable names in order of first appearance: header, body, carousel cards, then button URLs. */
export function extractVariables(template: Template): string[] {
  const names = textFields(template).flatMap((field) =>
    placeholders(field.text).map((p) => p.name),
  );
  return [...new Set(names)];
}
