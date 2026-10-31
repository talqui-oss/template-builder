import type {
  AuthenticationTemplate,
  Button,
  StandardTemplate,
  Variables,
} from "../schema/types";
import { placeholders } from "../validate/text";
import { replacePlaceholders } from "../variables";
import { defineAdapter, unsupported } from "./types";

export type TalquiOptions = {
  /** Default: `$TALQUI_TENANT_ID`. */
  tenantId?: string;
  /** WhatsApp channel the template belongs to. Default: `whatsapp-cloud`. */
  channel?: "whatsapp-cloud" | "whatsapp-gup";
  /** Channel connection ID. Default: `$TALQUI_CHANNEL_ID`. */
  channelId?: string;
  /** `operator` sends `Bearer <token>`, `pluginConnection` sends `PluginConnection <token>`. Default: `operator`. */
  auth?: "operator" | "pluginConnection";
  /** Default: `$TALQUI_TOKEN`. */
  token?: string;
};

const NAME = "talqui";
const CHANNELS = {
  "whatsapp-cloud": "urn:talqui:whatsapp-cloud:0",
  "whatsapp-gup": "urn:talqui:whatsapp-gup:0",
};

/** Talqui: `POST /v1/tenants/{tenantID}/campaigns-models`. */
export const talqui = defineAdapter<TalquiOptions>({
  name: NAME,
  toRequests(
    template,
    {
      tenantId = "$TALQUI_TENANT_ID",
      channel = "whatsapp-cloud",
      channelId = "$TALQUI_CHANNEL_ID",
      auth = "operator",
      token = "$TALQUI_TOKEN",
    },
  ) {
    if (template.language !== "pt_BR")
      unsupported(NAME, "language", `The ${template.language} language`);
    if (template.messageSendTtlSeconds !== undefined)
      unsupported(NAME, "messageSendTtlSeconds", "A message TTL");
    return [
      {
        method: "POST",
        url: `https://services-api.talqui.chat/v1/tenants/${tenantId}/campaigns-models`,
        headers: {
          Authorization: `${auth === "operator" ? "Bearer" : "PluginConnection"} ${token}`,
          "Content-Type": "application/json",
        },
        comments: channelId.startsWith("$")
          ? [
              `Replace ${channelId} with the ID of the WhatsApp channel connection.`,
            ]
          : undefined,
        body: {
          campaignModelName: template.name,
          campaignModelType: template.category,
          campaignModelChannel: CHANNELS[channel],
          campaignModelChannelID: channelId,
          campaignModelGatewayMeta:
            template.category !== "AUTHENTICATION" && template.displayFormat
              ? { displayFormat: template.displayFormat }
              : {},
          campaignModelSlots:
            template.category === "AUTHENTICATION"
              ? authentication(template)
              : standard(template),
        },
      },
    ];
  },
});

// Talqui writes placeholders with inner spaces: `{{ name }}`.
const spaced = (text: string) =>
  replacePlaceholders(text, (name) => `{{ ${name} }}`);

const slotVariables = (text: string, variables: Variables = {}) =>
  [...new Set(placeholders(text).map((p) => p.name))].map((name) => ({
    id: name,
    key: name,
    type: "text",
    fallback: variables[name]?.example,
  }));

function standard(t: StandardTemplate) {
  if (t.limitedTimeOffer)
    unsupported(NAME, "limitedTimeOffer", "A limited-time offer");
  if (t.carousel) unsupported(NAME, "carousel", "A carousel");
  if (t.callPermissionRequest)
    unsupported(NAME, "callPermissionRequest", "A call permission request");
  return {
    header: header(t),
    body: {
      text: spaced(t.body.text),
      variables: slotVariables(t.body.text, t.variables),
    },
    buttons: (t.buttons ?? []).map((b, index) =>
      button(b, t.variables, `buttons.${index}`),
    ),
    footer: t.footer ? { text: t.footer.text } : {},
  };
}

function header({ header: h, variables }: StandardTemplate) {
  if (!h) return {};
  if (h.type === "TEXT")
    return {
      type: "text",
      text: spaced(h.text),
      variables: slotVariables(h.text, variables),
    };
  if (h.type === "IMAGE" || h.type === "VIDEO" || h.type === "DOCUMENT") {
    const type = h.type.toLowerCase();
    return {
      type,
      variables: [{ id: "header", key: "header", type, fallback: h.url }],
    };
  }
  return unsupported(NAME, "header", `A ${h.type} header`);
}

function button(b: Button, variables: Variables = {}, path: string) {
  switch (b.type) {
    case "QUICK_REPLY":
    case "ORDER_DETAILS":
      return { type: b.type, text: b.text };
    case "URL": {
      // Talqui stores a dynamic URL as a positional `{{1}}` plus its sample value.
      const [param] = placeholders(b.url);
      return {
        type: b.type,
        text: b.text,
        url: param ? b.url.replace(param.raw, "{{1}}") : b.url,
        example: param ? [variables[param.name]?.example ?? ""] : undefined,
      };
    }
    case "PHONE_NUMBER":
      return { type: b.type, text: b.text, phone_number: b.phoneNumber };
    case "VOICE_CALL":
      return { type: b.type, text: b.text, ttl_minutes: b.ttlMinutes };
    case "COPY_CODE":
      return { type: b.type, example: [b.example] };
    default:
      return unsupported(NAME, path, `The ${b.type} button`);
  }
}

function authentication(t: AuthenticationTemplate) {
  if (t.body?.addSecurityRecommendation !== undefined)
    unsupported(NAME, "body.addSecurityRecommendation", "The security line");
  if (t.footer?.codeExpirationMinutes !== undefined)
    unsupported(NAME, "footer.codeExpirationMinutes", "The code expiration");
  if (t.button.otpType !== "COPY_CODE")
    unsupported(NAME, "button.otpType", `The ${t.button.otpType} OTP button`);
  return {
    header: {},
    // Meta writes the authentication body; Talqui only requires a non-empty text.
    body: { text: "Verification code", variables: [] },
    buttons: [{ type: "OTP", otp_type: "COPY_CODE" }],
    footer: {},
  };
}
