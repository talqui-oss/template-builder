import type { Button, StandardTemplate } from "../schema/types";
import type { Context } from "./types";
import { hasMarkup, length, placeholders } from "./text";

const PER_TYPE_LIMIT: Partial<Record<Button["type"], number>> = {
  URL: 2,
  PHONE_NUMBER: 1,
  VOICE_CALL: 1,
  COPY_CODE: 1,
  FLOW: 1,
  CATALOG: 1,
  MPM: 1,
  SPM: 1,
  ORDER_DETAILS: 1,
  PAYMENT_REQUEST: 3,
};

const WHATSAPP_ALLOWED = [
  "whatsapp.com/otp",
  "wa.me/in/bill/reminder",
  "wa.me/pay",
];
const REDIRECT_PARAMS = [
  "redirect",
  "url",
  "q",
  "goto",
  "out",
  "away",
  "external",
];

export function validateButtons(
  buttons: Button[],
  template: StandardTemplate,
  path: string,
  ctx: Context,
  inCard = false,
) {
  const { report } = ctx;

  if (!inCard && buttons.length > 10)
    report(
      "BUTTONS_TOO_MANY",
      path,
      `A template can have at most 10 buttons; this one has ${buttons.length}.`,
    );

  const counts = new Map<Button["type"], number>();
  for (const button of buttons)
    counts.set(button.type, (counts.get(button.type) ?? 0) + 1);
  for (const [type, count] of counts) {
    const limit = PER_TYPE_LIMIT[type];
    if (limit !== undefined && count > limit)
      report(
        "BUTTONS_TYPE_LIMIT",
        path,
        `At most ${limit} ${type} button${limit > 1 ? "s" : ""} per template; found ${count}.`,
      );
  }

  const quickReplies = buttons.map((b) => b.type === "QUICK_REPLY");
  const firstQr = quickReplies.indexOf(true);
  const lastQr = quickReplies.lastIndexOf(true);
  if (firstQr >= 0 && quickReplies.slice(firstQr, lastQr + 1).includes(false)) {
    report(
      "QUICK_REPLIES_NOT_GROUPED",
      path,
      "Quick reply buttons must be next to each other, all before or all after the other buttons.",
    );
  }

  if (!inCard && buttons.length > 3)
    report(
      "BUTTONS_PARTLY_HIDDEN",
      path,
      'With more than 3 buttons, WhatsApp shows 2 and puts the rest behind "See all options".',
    );
  if (
    !inCard &&
    (buttons.length >= 4 || (firstQr >= 0 && quickReplies.includes(false)))
  ) {
    report(
      "BUTTONS_DESKTOP_UNSUPPORTED",
      path,
      "Templates with 4 or more buttons, or quick replies mixed with other buttons, are not shown on WhatsApp Desktop.",
    );
  }

  if (counts.has("COPY_CODE") && template.category !== "MARKETING") {
    report(
      "CATEGORY_MISMATCH",
      "category",
      "Templates with a COPY_CODE button must use the MARKETING category.",
    );
  }

  const labels = new Map<string, number>();
  buttons.forEach((button, index) => {
    const at = `${path}.${index}`;
    if ("text" in button && button.text !== undefined) {
      validateLabel(button.text, `${at}.text`, ctx);
      if (button.text !== "") {
        if (labels.has(button.text))
          report(
            "BUTTON_LABEL_DUPLICATED",
            `${at}.text`,
            `"${button.text}" is already used by button ${labels.get(button.text)}. Labels must be unique.`,
          );
        else labels.set(button.text, index);
      }
    }
    if (button.type === "URL")
      validateUrl(button.url, `${at}.url`, template, ctx);
    if (
      button.type === "PHONE_NUMBER" &&
      !/^\+[1-9]\d{6,18}$/.test(button.phoneNumber.replace(/[\s-]/g, ""))
    ) {
      report(
        "BUTTON_PHONE_INVALID",
        `${at}.phoneNumber`,
        "Use the international format with country code, e.g. +15550100.",
      );
    }
    if (button.type === "COPY_CODE") {
      if (button.example.trim() === "")
        report(
          "BUTTON_COPY_CODE_EXAMPLE_REQUIRED",
          `${at}.example`,
          "Add a sample coupon code.",
        );
      else if (length(button.example) > 20)
        report(
          "BUTTON_COPY_CODE_EXAMPLE_TOO_LONG",
          `${at}.example`,
          "Coupon codes can have at most 20 characters.",
        );
    }
  });
}

function validateLabel(text: string, path: string, { report }: Context) {
  if (text.trim() === "")
    return report("BUTTON_LABEL_REQUIRED", path, "Button text is required.");
  if (length(text) > 25)
    report(
      "BUTTON_LABEL_TOO_LONG",
      path,
      `Button text can have at most 25 characters; this one has ${length(text)}.`,
    );
  if (placeholders(text).length > 0)
    report(
      "BUTTON_LABEL_PARAMETER",
      path,
      "Button text cannot contain variables.",
    );
  if (hasMarkup(text) || /[_~`]/.test(text))
    report(
      "BUTTON_LABEL_FORMATTING",
      path,
      "Button text cannot contain *, _, ~ or ` characters.",
    );
}

function validateUrl(
  url: string,
  path: string,
  template: StandardTemplate,
  { report, options }: Context,
) {
  const params = placeholders(url);
  if (
    params.length > 1 ||
    (params.length === 1 && !url.endsWith(params[0]!.raw))
  ) {
    report(
      "BUTTON_URL_PARAM_POSITION",
      path,
      "A URL button can have one variable, and only at the very end.",
    );
  }
  if (length(url) > 2000)
    report(
      "BUTTON_URL_TOO_LONG",
      path,
      "URLs can have at most 2000 characters.",
    );

  const sample = params.reduce(
    (text, p) =>
      text.replace(p.raw, template.variables?.[p.name]?.example || "sample"),
    url,
  );
  let parsed: URL;
  try {
    parsed = new URL(sample);
  } catch {
    return report(
      "BUTTON_URL_INVALID",
      path,
      "Enter a full URL starting with https:// or http://.",
    );
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return report(
      "BUTTON_URL_INVALID",
      path,
      "URL buttons only accept http and https links.",
    );
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  const isWhatsapp = ["whatsapp.com", "wa.me"].some(
    (domain) => host === domain || host.endsWith(`.${domain}`),
  );
  if (
    isWhatsapp &&
    !WHATSAPP_ALLOWED.some((allowed) =>
      `${host}${parsed.pathname}`.startsWith(allowed),
    )
  ) {
    report(
      "BUTTON_URL_WHATSAPP_DIRECT",
      path,
      "Links that open a WhatsApp chat (wa.me, whatsapp.com) are not allowed in URL buttons.",
    );
  }
  if (
    options.shortenerDomains.some(
      (domain) => host === domain || host.endsWith(`.${domain}`),
    )
  ) {
    report(
      "BUTTON_URL_SHORTENED",
      path,
      `Shortened links (${host}) are rejected. Use the full destination URL.`,
    );
  }
  if (
    REDIRECT_PARAMS.some((param) => parsed.searchParams.has(param)) ||
    (/\/link$/.test(parsed.pathname) && parsed.searchParams.has("u"))
  ) {
    report(
      "BUTTON_URL_REDIRECT",
      path,
      "Links that redirect to another site through a query parameter are rejected. Link to the final page.",
    );
  }
}
