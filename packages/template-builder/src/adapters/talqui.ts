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
// What Meta sends for a pt_BR authentication template, with a sample code.
const AUTHENTICATION_PREVIEW = "*123456* é o seu código de verificação.";
const EMPTY_HEADER = {
  type: null,
  content: {},
  preview: "",
  text: "",
  variables: [],
};
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
    // Talqui always sends a body text to Meta, which Meta refuses for authentication on Cloud API.
    if (template.category === "AUTHENTICATION" && channel === "whatsapp-cloud")
      unsupported(
        NAME,
        "category",
        "Authentication on the whatsapp-cloud channel",
      );
    return [
      {
        method: "POST",
        url: `https://services-api.talqui.chat/v1/tenants/${tenantId}/campaigns-models`,
        headers: {
          Authorization: `${auth === "operator" ? "Bearer" : "PluginConnection"} ${token}`,
          "Content-Type": "application/json",
        },
        body: {
          // Talqui slugifies the name (dropping `_`) and turns `-` back into `_` for Meta.
          campaignModelName: template.name.replaceAll("_", "-"),
          campaignModelType: template.category,
          campaignModelChannel: CHANNELS[channel],
          campaignModelChannelID: channelId,
          campaignModelMeta: { allowedToStartSession: "denied" },
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

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Same palette and pick as the app's editor, so variable chips get their background color.
const CHIP_COLORS = [
  "ab7df6",
  "7f8fa4",
  "26c1c9",
  "fd7b1f",
  "e0102b",
  "40b630",
  "0079c4",
];
const chipColor = (name: string) =>
  CHIP_COLORS[
    [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) %
      CHIP_COLORS.length
  ];

const MARKS: [RegExp, string, string][] = [
  [/\*([^*\n]+)\*/g, "strong", "t-attribute-bold"],
  [/_([^_\n]+)_/g, "em", "t-attribute-italic"],
  [/~([^~\n]+)~/g, "s", "t-attribute-strike"],
];

// The app's editor (Tiptap) loads `content`, not `text`: one <p>, lines joined by <br>,
// WhatsApp formatting as marks and variables as <span class="variable">.
const editorHtml = (text: string, variables: Variables = {}) => {
  const names: string[] = [];
  // Variables become underscore-free tokens first, so `_` in their names is not read as italic.
  let html = replacePlaceholders(
    escapeHtml(text),
    (name) => `\uE000${names.push(name) - 1}\uE000`,
  );
  for (const [pattern, tag, className] of MARKS)
    html = html.replace(pattern, `<${tag} class="${className}">$1</${tag}>`);
  html = html.replace(/\uE000(\d+)\uE000/g, (_, index: string) => {
    const name = names[Number(index)] ?? "";
    return `<span class="variable" data-type="variable" data-id="${name}" data-key="${name}" data-label="${name}" data-default-value="${escapeHtml(variables[name]?.example ?? "")}" style="background-color: #${chipColor(name)};">${name}</span>`;
  });
  return `<p>${html.replace(/\n/g, "<br>")}</p>`;
};

// Text headers keep the editor document as Tiptap JSON.
const editorDoc = (text: string, variables: Variables = {}) => ({
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: text
        .split(/(\{\{.*?\}\})/)
        .filter(Boolean)
        .map((part) => {
          const name = /^\{\{(.*?)\}\}$/.exec(part)?.[1];
          return name
            ? {
                type: "variable",
                attrs: {
                  id: name,
                  key: name,
                  label: name,
                  defaultValue: variables[name]?.example ?? "",
                },
              }
            : { type: "text", text: part };
        }),
    },
  ],
});

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
      content: editorHtml(t.body.text, t.variables),
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
  if (!h) return EMPTY_HEADER;
  if (h.type === "TEXT")
    return {
      type: "text",
      content: editorDoc(h.text, variables),
      preview: editorHtml(h.text, variables),
      text: spaced(h.text),
      variables: slotVariables(h.text, variables),
    };
  if (h.type === "IMAGE" || h.type === "VIDEO" || h.type === "DOCUMENT") {
    const type = h.type.toLowerCase();
    return {
      ...EMPTY_HEADER,
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
    header: EMPTY_HEADER,
    // Meta writes the authentication body; Talqui only requires a non-empty text, shown in its preview.
    body: {
      content: editorHtml(AUTHENTICATION_PREVIEW),
      text: AUTHENTICATION_PREVIEW,
      variables: [],
    },
    buttons: [{ type: "OTP", otp_type: "COPY_CODE" }],
    footer: {},
  };
}
