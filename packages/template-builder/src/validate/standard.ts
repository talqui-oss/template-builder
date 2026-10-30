import type { CarouselCard, StandardTemplate } from "../schema/types";
import { validateButtons } from "./buttons";
import type { Context } from "./types";
import {
  countEmoji,
  countWords,
  hasAdjacentPlaceholders,
  hasMarkup,
  length,
  placeholders,
  startsOrEndsWithPlaceholder,
} from "./text";

const EMOJI_LIMIT = { MARKETING: 10, UTILITY: 6 } as const;

export function validateStandard(template: StandardTemplate, ctx: Context) {
  const { report } = ctx;
  const { header, body, footer, buttons, limitedTimeOffer, carousel } =
    template;

  if (header) {
    if (header.type === "TEXT") {
      const text = header.text;
      if (text.trim() === "")
        report(
          "HEADER_TEXT_REQUIRED",
          "header.text",
          "Header text is required, or remove the header.",
        );
      if (length(text) > 60)
        report(
          "HEADER_TOO_LONG",
          "header.text",
          `Header text can have at most 60 characters; this one has ${length(text)}.`,
        );
      if (placeholders(text).length > 1)
        report(
          "HEADER_TOO_MANY_PARAMS",
          "header.text",
          "A text header can have at most one variable.",
        );
      if (text.includes("\n"))
        report(
          "HEADER_NEWLINE",
          "header.text",
          "Header text cannot have line breaks.",
        );
      if (countEmoji(text) > 0)
        report(
          "HEADER_EMOJI",
          "header.text",
          "Header text cannot have emojis.",
        );
      if (hasMarkup(text))
        report(
          "HEADER_FORMATTING",
          "header.text",
          "Header text cannot use formatting such as *bold* or a literal asterisk.",
        );
    } else if ("url" in header && !isHttpUrl(header.url)) {
      report(
        "HEADER_MEDIA_URL_INVALID",
        "header.url",
        "Add a public https:// URL to a sample file.",
      );
    }
  }

  if (body.text.trim() === "") {
    report("BODY_REQUIRED", "body.text", "Body text is required.");
  } else {
    const limit = limitedTimeOffer ? 600 : 1024;
    if (length(body.text) > limit)
      report(
        "BODY_TOO_LONG",
        "body.text",
        `Body text can have at most ${limit} characters; this one has ${length(body.text)}.`,
      );
    if (/\n{3,}/.test(body.text))
      report(
        "BODY_MULTIPLE_NEWLINES",
        "body.text",
        "Body text cannot have more than one blank line in a row.",
      );
    const emoji = countEmoji(body.text);
    const emojiLimit = EMOJI_LIMIT[template.category];
    if (emoji > emojiLimit)
      report(
        "BODY_EMOJI_LIMIT",
        "body.text",
        `${template.category} templates can have at most ${emojiLimit} emojis in the body; this one has ${emoji}.`,
      );
    validateParams(body.text, "body.text", ctx);
  }

  if (footer) {
    if (limitedTimeOffer)
      report(
        "COMPONENT_NOT_ALLOWED",
        "footer",
        "Limited-time offer templates cannot have a footer.",
      );
    if (length(footer.text) > 60)
      report(
        "FOOTER_TOO_LONG",
        "footer.text",
        `Footer text can have at most 60 characters; this one has ${length(footer.text)}.`,
      );
    if (placeholders(footer.text).length > 0)
      report(
        "FOOTER_PARAMETER",
        "footer.text",
        "Footer text cannot contain variables.",
      );
    if (footer.text.includes("\n"))
      report(
        "FOOTER_NEWLINE",
        "footer.text",
        "Footer text cannot have line breaks.",
      );
    if (countEmoji(footer.text) > 0)
      report("FOOTER_EMOJI", "footer.text", "Footer text cannot have emojis.");
  } else if (
    template.category === "MARKETING" &&
    !limitedTimeOffer &&
    !carousel
  ) {
    report(
      "FOOTER_OPT_OUT_MISSING",
      "footer",
      'Marketing templates are less likely to be blocked with an opt-out footer, e.g. "Reply STOP to opt out".',
    );
  }

  if (buttons) validateButtons(buttons, template, "buttons", ctx);

  if (limitedTimeOffer) {
    if (template.category !== "MARKETING")
      report(
        "CATEGORY_MISMATCH",
        "category",
        "Limited-time offer templates must use the MARKETING category.",
      );
    const text = limitedTimeOffer.text;
    const limit = ctx.options.limitedTimeOfferTextLimit;
    if (text.trim() === "")
      report(
        "LTO_TEXT_REQUIRED",
        "limitedTimeOffer.text",
        "Add the offer headline.",
      );
    else if (length(text) > limit)
      report(
        "LTO_TEXT_TOO_LONG",
        "limitedTimeOffer.text",
        `The offer headline can have at most ${limit} characters.`,
      );
    if (header && header.type !== "IMAGE" && header.type !== "VIDEO")
      report(
        "COMPONENT_NOT_ALLOWED",
        "header",
        "Limited-time offer templates only accept an IMAGE or VIDEO header.",
      );
    if (!buttons?.some((b) => b.type === "URL"))
      report(
        "LTO_URL_BUTTON_REQUIRED",
        "buttons",
        "Limited-time offer templates need a URL button.",
      );
  }

  if (carousel) validateCarousel(carousel.cards, template, ctx);

  if (
    template.callPermissionRequest &&
    (buttons?.length || carousel || limitedTimeOffer)
  ) {
    report(
      "CALL_PERMISSION_NOT_COMBINABLE",
      "callPermissionRequest",
      "Call permission requests cannot be combined with buttons, carousels or limited-time offers.",
    );
  }

  const orderButtons =
    buttons?.filter((b) => b.type === "ORDER_DETAILS").length ?? 0;
  if ((template.displayFormat === "ORDER_DETAILS") !== (orderButtons === 1)) {
    report(
      "ORDER_DETAILS_MISMATCH",
      "displayFormat",
      'Order details templates need `displayFormat: "ORDER_DETAILS"` and exactly one ORDER_DETAILS button.',
    );
  }
}

function validateParams(text: string, path: string, { report }: Context) {
  const params = placeholders(text).length;
  const words = countWords(text);
  if (params > 0 && words > 0 && params / words > 0.33333333) {
    report(
      "PARAM_RATIO_TOO_HIGH",
      path,
      `Too many variables for the amount of text: ${params} variable${params > 1 ? "s" : ""} in ${words} words. Each variable needs at least 3 other words.`,
    );
  }
  if (hasAdjacentPlaceholders(text))
    report(
      "PARAM_ADJACENT",
      path,
      "Two variables cannot be next to each other. Put some text between them.",
    );
  if (startsOrEndsWithPlaceholder(text))
    report(
      "PARAM_AT_EDGE",
      path,
      "The body cannot start or end with a variable.",
    );
}

function validateCarousel(
  cards: CarouselCard[],
  template: StandardTemplate,
  ctx: Context,
) {
  const { report, options } = ctx;
  if (template.category !== "MARKETING")
    report(
      "CATEGORY_MISMATCH",
      "category",
      "Carousel templates must use the MARKETING category.",
    );
  if (cards.length < 2 || cards.length > 10)
    report(
      "CAROUSEL_CARDS_COUNT",
      "carousel.cards",
      `A carousel needs 2 to 10 cards; this one has ${cards.length}.`,
    );
  for (const field of ["header", "footer", "buttons"] as const) {
    if (template[field])
      report(
        "COMPONENT_NOT_ALLOWED",
        field,
        `Carousel templates cannot have a top-level ${field}; put it in the cards.`,
      );
  }

  const shape = (card: CarouselCard) =>
    [
      card.header.type,
      Boolean(card.body),
      (card.buttons ?? []).map((b) => b.type).join(","),
    ].join("|");
  const first = cards[0] ? shape(cards[0]) : "";

  cards.forEach((card, index) => {
    const at = `carousel.cards.${index}`;
    if (index > 0 && shape(card) !== first)
      report(
        "CAROUSEL_CARDS_MISMATCH",
        at,
        "Every card needs the same header type, the same parts and the same buttons, in the same order.",
      );
    if ("url" in card.header && !isHttpUrl(card.header.url))
      report(
        "CAROUSEL_CARD_MEDIA_URL_INVALID",
        `${at}.header.url`,
        "Add a public https:// URL to a sample image or video.",
      );
    const text = card.body?.text ?? "";
    if (text.trim() === "")
      report(
        "CAROUSEL_CARD_BODY_REQUIRED",
        `${at}.body.text`,
        "Each card needs body text.",
      );
    if (length(text) > options.carouselCardBodyLimit)
      report(
        "CAROUSEL_CARD_BODY_TOO_LONG",
        `${at}.body.text`,
        `Card text can have at most ${options.carouselCardBodyLimit} characters.`,
      );
    if ((text.match(/\n/g)?.length ?? 0) > 2)
      report(
        "CAROUSEL_CARD_BODY_NEWLINES",
        `${at}.body.text`,
        "Card text can have at most 2 line breaks.",
      );
    const buttons = card.buttons ?? [];
    if (buttons.length === 0)
      report(
        "CAROUSEL_CARD_BUTTONS_REQUIRED",
        `${at}.buttons`,
        "Each card needs at least one button.",
      );
    if (buttons.length > 2)
      report(
        "CAROUSEL_CARD_BUTTONS_TOO_MANY",
        `${at}.buttons`,
        "Each card can have at most 2 buttons.",
      );
    validateButtons(buttons, template, `${at}.buttons`, ctx, true);
  });
}

function isHttpUrl(value: string) {
  try {
    return ["https:", "http:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
