import type {
  AuthenticationTemplate,
  Button,
  CarouselCard,
  Header,
  StandardTemplate,
  Variables,
} from "../schema/types";
import { placeholders } from "../validate/text";
import { defineAdapter, unsupported } from "./types";

export type MetaOptions = {
  /** WhatsApp Business Account ID. Default: `$WABA_ID`. */
  wabaId?: string;
  /** Default: `$META_ACCESS_TOKEN`. */
  accessToken?: string;
  /** Graph API version. Default: `v26.0`. */
  apiVersion?: string;
};

const NAME = "meta";
const MEDIA_HANDLE = "$MEDIA_HANDLE";

/** Meta Cloud API: `POST /{WABA_ID}/message_templates`. */
export const meta = defineAdapter<MetaOptions>({
  name: NAME,
  toRequests(
    template,
    {
      wabaId = "$WABA_ID",
      accessToken = "$META_ACCESS_TOKEN",
      apiVersion = "v26.0",
    },
  ) {
    const body =
      template.category === "AUTHENTICATION"
        ? authentication(template)
        : standard(template);
    const media = mediaUrls(template);
    return [
      {
        method: "POST",
        url: `https://graph.facebook.com/${apiVersion}/${wabaId}/message_templates`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body,
        comments:
          media.length > 0
            ? [
                `Upload each sample file with the Resumable Upload API and set ${MEDIA_HANDLE} to the handle it returns:`,
                "https://developers.facebook.com/docs/graph-api/guides/upload",
                ...media.map((url) => `- ${url}`),
              ]
            : undefined,
      },
    ];
  },
});

function standard(t: StandardTemplate) {
  if (t.displayFormat)
    unsupported(NAME, "displayFormat", "The ORDER_DETAILS display format");
  return {
    name: t.name,
    language: t.language,
    category: t.category,
    parameter_format: "NAMED",
    message_send_ttl_seconds: t.messageSendTtlSeconds,
    components: [
      t.header && header(t.header, t.variables),
      t.limitedTimeOffer && {
        type: "LIMITED_TIME_OFFER",
        limited_time_offer: {
          text: t.limitedTimeOffer.text,
          has_expiration: t.limitedTimeOffer.hasExpiration ?? false,
        },
      },
      body(t.body.text, t.variables),
      t.footer && { type: "FOOTER", text: t.footer.text },
      t.buttons?.length && buttons(t.buttons, t.variables, "buttons"),
      t.carousel && {
        type: "CAROUSEL",
        cards: t.carousel.cards.map((card, index) =>
          carouselCard(card, t.variables, `carousel.cards.${index}`),
        ),
      },
      t.callPermissionRequest && { type: "CALL_PERMISSION_REQUEST" },
    ].filter(Boolean),
  };
}

function authentication(t: AuthenticationTemplate) {
  const button = t.button;
  return {
    name: t.name,
    language: t.language,
    category: t.category,
    message_send_ttl_seconds: t.messageSendTtlSeconds,
    components: [
      {
        type: "BODY",
        add_security_recommendation: t.body?.addSecurityRecommendation,
      },
      t.footer?.codeExpirationMinutes !== undefined && {
        type: "FOOTER",
        code_expiration_minutes: t.footer.codeExpirationMinutes,
      },
      {
        type: "BUTTONS",
        buttons: [
          {
            type: "OTP",
            otp_type: button.otpType,
            text: button.text,
            autofill_text: button.autofillText,
            supported_apps: button.supportedApps?.map((app) => ({
              package_name: app.packageName,
              signature_hash: app.signatureHash,
            })),
            zero_tap_terms_accepted: button.zeroTapTermsAccepted,
          },
        ],
      },
    ].filter(Boolean),
  };
}

const namedParams = (text: string, variables: Variables = {}) =>
  [...new Set(placeholders(text).map((p) => p.name))].map((name) => ({
    param_name: name,
    example: variables[name]?.example ?? "",
  }));

function header(h: Header, variables?: Variables) {
  if (h.type === "PRODUCT")
    return unsupported(NAME, "header", "A PRODUCT header");
  if (h.type === "LOCATION") return { type: "HEADER", format: "LOCATION" };
  if (h.type !== "TEXT")
    return {
      type: "HEADER",
      format: h.type,
      example: { header_handle: [MEDIA_HANDLE] },
    };
  const params = namedParams(h.text, variables);
  return {
    type: "HEADER",
    format: "TEXT",
    text: h.text,
    example: params.length ? { header_text_named_params: params } : undefined,
  };
}

function body(text: string, variables?: Variables) {
  const params = namedParams(text, variables);
  return {
    type: "BODY",
    text,
    example: params.length ? { body_text_named_params: params } : undefined,
  };
}

function buttons(list: Button[], variables: Variables = {}, path: string) {
  return {
    type: "BUTTONS",
    buttons: list.map((b, index) => {
      switch (b.type) {
        case "QUICK_REPLY":
          return { type: b.type, text: b.text };
        case "URL": {
          // Meta takes one positional variable at the end of the URL, with a full sample URL.
          const [param] = placeholders(b.url);
          return {
            type: b.type,
            text: b.text,
            url: param ? b.url.replace(param.raw, "{{1}}") : b.url,
            example: param
              ? [b.url.replace(param.raw, variables[param.name]?.example ?? "")]
              : undefined,
          };
        }
        case "PHONE_NUMBER":
          return { type: b.type, text: b.text, phone_number: b.phoneNumber };
        case "VOICE_CALL":
          return { type: b.type, text: b.text, ttl_minutes: b.ttlMinutes };
        case "COPY_CODE":
          return { type: b.type, example: b.example };
        default:
          return unsupported(NAME, `${path}.${index}`, `The ${b.type} button`);
      }
    }),
  };
}

function carouselCard(
  card: CarouselCard,
  variables: Variables = {},
  path: string,
) {
  if (card.header.type === "PRODUCT")
    unsupported(NAME, `${path}.header`, "A PRODUCT card header");
  return {
    components: [
      {
        type: "HEADER",
        format: card.header.type,
        example: { header_handle: [MEDIA_HANDLE] },
      },
      card.body && body(card.body.text, variables),
      card.buttons?.length &&
        buttons(card.buttons, variables, `${path}.buttons`),
    ].filter(Boolean),
  };
}

function mediaUrls(t: StandardTemplate | AuthenticationTemplate): string[] {
  if (t.category === "AUTHENTICATION") return [];
  const urls = t.header && "url" in t.header ? [t.header.url] : [];
  for (const card of t.carousel?.cards ?? [])
    if ("url" in card.header) urls.push(card.header.url);
  return urls;
}
