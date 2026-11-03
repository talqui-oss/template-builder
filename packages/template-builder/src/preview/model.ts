import type {
  Button,
  CarouselCard,
  Header,
  StandardTemplate,
  Template,
  UrlButton,
} from "../schema/types";
import { validate } from "../validate";
import { replacePlaceholders } from "../variables";
import type { Issue } from "../validate";
import { parseText, type Line } from "./format";
import { localeFor } from "./locale";

/** Icon shown next to a button label. Bindings map each one to an SVG. */
export type ButtonIcon = "reply" | "link" | "phone" | "copy" | "list" | "cart";

export type PreviewButton = { label: string; icon: ButtonIcon };

export type PreviewHeader =
  | { type: "TEXT"; lines: Line[] }
  | { type: "IMAGE" | "VIDEO" | "GIF"; url: string }
  | { type: "DOCUMENT"; url: string; filename: string }
  | { type: "LOCATION" }
  | { type: "PRODUCT" };

export type PreviewCard = {
  header: PreviewHeader;
  body: Line[];
  buttons: PreviewButton[];
};

/** Everything a binding needs to draw a template, already resolved. */
export type PreviewModel = {
  header?: PreviewHeader;
  /** Shown by WhatsApp at the top when there is no header and a button links out. */
  linkPreview?: { domain: string };
  limitedTimeOffer?: { text: string; hasExpiration: boolean };
  body: Line[];
  footer?: Line[];
  /** Buttons inside the bubble, in display order. */
  buttons: PreviewButton[];
  /** Buttons moved behind "See all options" when there are more than 3. */
  overflow: PreviewButton[];
  carousel?: PreviewCard[];
  issues: Issue[];
};

export type PreviewOptions = {
  /** Values for `{{name}}` placeholders. Falls back to each variable's `example`. */
  values?: Record<string, string>;
  /** Language of the phone, for the texts WhatsApp itself writes there. Default `en`. */
  deviceLanguage?: string;
};

// WhatsApp shows up to 3 buttons; past that it shows 2 and a "See all options" row.
const MAX_VISIBLE_BUTTONS = 3;
const SAMPLE_CODE = "123456";

/**
 * Turns a template into a render-ready model. Invalid templates still render,
 * so editors can preview while the user types; problems are listed in `issues`.
 */
export function toPreviewModel(
  template: Template,
  { values = {}, deviceLanguage = "en" }: PreviewOptions = {},
): PreviewModel {
  const locale = localeFor(template.language);
  const { seeAllOptions } = localeFor(deviceLanguage);
  const { issues } = validate(template);

  if (template.category === "AUTHENTICATION") {
    const body = locale.authenticationBody.replace("{code}", SAMPLE_CODE);
    const security = template.body?.addSecurityRecommendation
      ? ` ${locale.securityRecommendation}`
      : "";
    const minutes = template.footer?.codeExpirationMinutes;
    return {
      body: parseText(body + security, String),
      footer:
        minutes === undefined
          ? undefined
          : parseText(
              locale.codeExpiration.replace("{minutes}", String(minutes)),
              String,
            ),
      ...groupButtons(
        [{ label: template.button.text ?? locale.copyCode, icon: "copy" }],
        seeAllOptions,
      ),
      issues,
    };
  }

  const resolve = (name: string) =>
    values[name] ?? template.variables?.[name]?.example ?? `{{${name}}}`;
  const toButtons = (buttons: Button[] = []) =>
    buttons.map((button) => toButton(button, locale.copyOfferCode));

  return {
    header: template.header && toHeader(template.header, resolve),
    linkPreview: template.header ? undefined : linkPreview(template, resolve),
    limitedTimeOffer: template.limitedTimeOffer && {
      text: template.limitedTimeOffer.text,
      hasExpiration: template.limitedTimeOffer.hasExpiration ?? false,
    },
    body: parseText(template.body.text, resolve),
    footer: template.footer && parseText(template.footer.text, resolve),
    ...groupButtons(toButtons(template.buttons), seeAllOptions),
    carousel: template.carousel?.cards.map(
      (card: CarouselCard): PreviewCard => ({
        header: toHeader(card.header, resolve),
        body: card.body ? parseText(card.body.text, resolve) : [],
        buttons: toButtons(card.buttons),
      }),
    ),
    issues,
  };
}

function toHeader(
  header: Header,
  resolve: (name: string) => string,
): PreviewHeader {
  switch (header.type) {
    case "TEXT":
      return { type: "TEXT", lines: parseText(header.text, resolve) };
    case "DOCUMENT":
      return {
        type: "DOCUMENT",
        url: header.url,
        filename:
          header.filename ?? header.url.split("/").pop() ?? "document.pdf",
      };
    case "IMAGE":
    case "VIDEO":
    case "GIF":
      return { type: header.type, url: header.url };
    default:
      return { type: header.type };
  }
}

function toButton(button: Button, copyOfferCode: string): PreviewButton {
  switch (button.type) {
    case "URL":
      return { label: button.text, icon: "link" };
    case "PHONE_NUMBER":
    case "VOICE_CALL":
      return { label: button.text, icon: "phone" };
    case "COPY_CODE":
      return { label: copyOfferCode, icon: "copy" };
    case "CATALOG":
    case "MPM":
    case "SPM":
    case "ORDER_DETAILS":
      return { label: button.text, icon: "list" };
    case "PAYMENT_REQUEST":
      return { label: button.text ?? "", icon: "cart" };
    case "FLOW":
      return { label: button.text, icon: "list" };
    default:
      return { label: button.text, icon: "reply" };
  }
}

function linkPreview(
  template: StandardTemplate,
  resolve: (name: string) => string,
) {
  const button = template.buttons?.find(
    (b): b is UrlButton => b.type === "URL",
  );
  if (!button) return undefined;
  try {
    const url = new URL(replacePlaceholders(button.url, resolve));
    return { domain: url.hostname.replace(/^www\./, "") };
  } catch {
    return undefined;
  }
}

function groupButtons(buttons: PreviewButton[], seeAllOptions: string) {
  if (buttons.length <= MAX_VISIBLE_BUTTONS) return { buttons, overflow: [] };
  return {
    buttons: [
      ...buttons.slice(0, 2),
      { label: seeAllOptions, icon: "list" as const },
    ],
    overflow: buttons.slice(2),
  };
}
