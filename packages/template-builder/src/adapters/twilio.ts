import type {
  AuthenticationTemplate,
  Button,
  StandardTemplate,
} from "../schema/types";
import { extractVariables, replacePlaceholders } from "../variables";
import { defineAdapter, unsupported, type HttpRequest } from "./types";

export type TwilioOptions = {
  /** Default: `$TWILIO_ACCOUNT_SID`. */
  accountSid?: string;
  /** Default: `$TWILIO_AUTH_TOKEN`. */
  authToken?: string;
};

const NAME = "twilio";
const CONTENT_SID = "$CONTENT_SID";

/**
 * Twilio Content API: creates the content, then asks WhatsApp to approve it.
 * Unverified: built from Twilio's docs, not yet run against a real account.
 */
export const twilio = defineAdapter<TwilioOptions>({
  name: NAME,
  toRequests(
    template,
    { accountSid = "$TWILIO_ACCOUNT_SID", authToken = "$TWILIO_AUTH_TOKEN" },
  ): HttpRequest[] {
    if (template.messageSendTtlSeconds !== undefined)
      unsupported(NAME, "messageSendTtlSeconds", "A message TTL");
    // Placeholders stay shell-expandable; real credentials are encoded here.
    const credentials =
      accountSid.startsWith("$") || authToken.startsWith("$")
        ? `$(printf %s ${accountSid}:${authToken} | base64)`
        : btoa(`${accountSid}:${authToken}`);
    const headers = {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    };
    const order = extractVariables(template);
    return [
      {
        method: "POST",
        url: "https://content.twilio.com/v1/Content",
        headers,
        body: {
          friendly_name: template.name,
          language: template.language,
          variables: order.length
            ? Object.fromEntries(
                order.map((name, index) => [
                  String(index + 1),
                  template.category === "AUTHENTICATION"
                    ? undefined
                    : template.variables?.[name]?.example,
                ]),
              )
            : undefined,
          types:
            template.category === "AUTHENTICATION"
              ? authentication(template)
              : standard(template, positional(order)),
        },
      },
      {
        method: "POST",
        url: `https://content.twilio.com/v1/Content/${CONTENT_SID}/ApprovalRequests/whatsapp`,
        headers,
        body: { name: template.name, category: template.category },
        comments: [
          `Replace ${CONTENT_SID} with the "sid" returned by the request above.`,
        ],
      },
    ];
  },
});

const positional = (order: string[]) => (text: string) =>
  replacePlaceholders(text, (name) => `{{${order.indexOf(name) + 1}}}`);

function standard(t: StandardTemplate, pos: (text: string) => string) {
  if (t.limitedTimeOffer)
    unsupported(NAME, "limitedTimeOffer", "A limited-time offer");
  if (t.callPermissionRequest)
    unsupported(NAME, "callPermissionRequest", "A call permission request");
  if (t.displayFormat)
    unsupported(NAME, "displayFormat", "The ORDER_DETAILS display format");

  const body = pos(t.body.text);
  if (t.carousel)
    return {
      "twilio/carousel": {
        body,
        cards: t.carousel.cards.map((card, index) => {
          const path = `carousel.cards.${index}`;
          if (card.header.type === "PRODUCT")
            unsupported(NAME, `${path}.header`, "A PRODUCT card header");
          return {
            body: card.body && pos(card.body.text),
            media: "url" in card.header ? card.header.url : undefined,
            actions: actions(card.buttons ?? [], pos, `${path}.buttons`),
          };
        }),
      },
    };

  const header = t.header;
  if (header && !["TEXT", "IMAGE", "VIDEO", "DOCUMENT"].includes(header.type))
    unsupported(NAME, "header", `A ${header.type} header`);
  if (!header && !t.footer && !t.buttons?.length)
    return { "twilio/text": { body } };
  return {
    "whatsapp/card": {
      body,
      header_text: header?.type === "TEXT" ? pos(header.text) : undefined,
      media: header && "url" in header ? [header.url] : undefined,
      footer: t.footer?.text,
      actions: t.buttons?.length
        ? actions(t.buttons, pos, "buttons")
        : undefined,
    },
  };
}

function actions(
  buttons: Button[],
  pos: (text: string) => string,
  path: string,
) {
  return buttons.map((b, index) => {
    switch (b.type) {
      case "QUICK_REPLY":
        return { type: b.type, title: b.text, id: b.text };
      case "URL":
        return { type: b.type, title: b.text, url: pos(b.url) };
      case "PHONE_NUMBER":
        return { type: b.type, title: b.text, phone: b.phoneNumber };
      case "COPY_CODE":
        return { type: b.type, code: b.example };
      default:
        return unsupported(NAME, `${path}.${index}`, `The ${b.type} button`);
    }
  });
}

function authentication(t: AuthenticationTemplate) {
  if (t.button.otpType !== "COPY_CODE")
    unsupported(NAME, "button.otpType", `The ${t.button.otpType} OTP button`);
  return {
    "whatsapp/authentication": {
      add_security_recommendation: t.body?.addSecurityRecommendation,
      code_expiration_minutes: t.footer?.codeExpirationMinutes,
      actions: [
        { type: "COPY_CODE", copy_code_text: t.button.text ?? "Copy code" },
      ],
    },
  };
}
