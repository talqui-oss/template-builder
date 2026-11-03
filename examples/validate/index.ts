// Runs one broken template per issue code and checks that `validate` reports that code and no other error.
// Usage: pnpm --filter example-validate start
import { codes, validate } from "@talqui-oss/template-builder";
import type {
  Button,
  Code,
  StandardTemplate,
  Template,
  UrlButton,
} from "@talqui-oss/template-builder";

const base: StandardTemplate = {
  name: "order_shipped",
  language: "en_US",
  category: "UTILITY",
  body: { text: "Hi {{name}}, your order left our warehouse today." },
  variables: { name: { example: "Maria" } },
};
const marketing: StandardTemplate = {
  ...base,
  category: "MARKETING",
  footer: { text: "Reply STOP to opt out" },
};
const withButtons = (buttons: Button[], template = base): StandardTemplate => ({
  ...template,
  buttons,
});
const url = (href: string): UrlButton => ({
  type: "URL",
  text: "Open",
  url: href,
});
const card = (text = "Rain jacket, now in green.") => ({
  header: { type: "IMAGE" as const, url: "https://acme.com/a.jpg" },
  body: { text },
  buttons: [url("https://acme.com/p")],
});
const carousel = (cards = [card(), card()]): StandardTemplate => ({
  ...marketing,
  footer: undefined,
  carousel: { cards },
});
const lto = (extra: Partial<StandardTemplate> = {}): StandardTemplate => ({
  ...marketing,
  footer: undefined,
  limitedTimeOffer: { text: "Flash sale!" },
  buttons: [url("https://acme.com/sale")],
  ...extra,
});
const auth = (
  button: Partial<
    Extract<Template, { category: "AUTHENTICATION" }>["button"]
  > = {},
  extra = {},
): Template => ({
  name: "login_code",
  language: "en_US",
  category: "AUTHENTICATION",
  button: {
    type: "OTP",
    otpType: "ONE_TAP",
    supportedApps: [
      { packageName: "com.acme.app", signatureHash: "K8a/AINcGX7" },
    ],
    ...button,
  },
  ...extra,
});
const body = (
  text: string,
  extra: Partial<StandardTemplate> = {},
): StandardTemplate => ({ ...base, body: { text }, ...extra });

const cases: Record<Code, unknown> = {
  SCHEMA_INVALID: { ...base, body: undefined },
  NAME_INVALID: { ...base, name: "Order Shipped" },
  NAME_TOO_LONG: { ...base, name: "a".repeat(513) },
  LANGUAGE_INVALID: { ...base, language: "english" },
  CATEGORY_MISMATCH: withButtons([{ type: "COPY_CODE", example: "SAVE20" }]),
  TTL_OUT_OF_RANGE: { ...base, messageSendTtlSeconds: 10 },
  PLACEHOLDER_INVALID: body(
    "Hi {{ name }}, your order left our warehouse today.",
    { variables: {} },
  ),
  PLACEHOLDER_DUPLICATED: body(
    "Hi {{name}}, yes {{name}}, your order left our warehouse today.",
  ),
  VARIABLE_NOT_DECLARED: { ...base, variables: undefined },
  VARIABLE_MISSING_EXAMPLE: { ...base, variables: { name: { example: "" } } },
  VARIABLE_UNUSED: {
    ...base,
    variables: { name: { example: "Maria" }, order: { example: "1" } },
  },
  PARAM_RATIO_TOO_HIGH: body("Hi {{name}} there"),
  PARAM_ADJACENT: body(
    "Your order {{name}} {{order}} left our warehouse today.",
    { variables: { name: { example: "a" }, order: { example: "b" } } },
  ),
  PARAM_AT_EDGE: body("Your package left our warehouse today, {{name}}."),
  HEADER_TEXT_REQUIRED: { ...base, header: { type: "TEXT", text: "" } },
  HEADER_TOO_LONG: { ...base, header: { type: "TEXT", text: "a".repeat(61) } },
  HEADER_TOO_MANY_PARAMS: {
    ...base,
    header: { type: "TEXT", text: "Hi {{name}} {{name2}}" },
    variables: { name: { example: "a" }, name2: { example: "b" } },
  },
  HEADER_NEWLINE: { ...base, header: { type: "TEXT", text: "Order\nshipped" } },
  HEADER_EMOJI: { ...base, header: { type: "TEXT", text: "Order shipped 📦" } },
  HEADER_FORMATTING: {
    ...base,
    header: { type: "TEXT", text: "Order *shipped*" },
  },
  HEADER_MEDIA_URL_INVALID: {
    ...base,
    header: { type: "IMAGE", url: "not a url" },
  },
  COMPONENT_NOT_ALLOWED: lto({
    header: { type: "DOCUMENT", url: "https://acme.com/a.pdf" },
  }),
  BODY_REQUIRED: body(" ", { variables: undefined }),
  BODY_TOO_LONG: body("Hi {{name}}, " + "word ".repeat(300) + "end."),
  BODY_MULTIPLE_NEWLINES: body(
    "Hi {{name}}, your order\n\n\nleft our warehouse today.",
  ),
  BODY_EMOJI_LIMIT: body(
    "Hi {{name}}, your order left today 📦📦📦📦📦📦📦 enjoy.",
  ),
  FOOTER_TOO_LONG: { ...base, footer: { text: "a".repeat(61) } },
  FOOTER_PARAMETER: { ...base, footer: { text: "Bye {{name}}" } },
  FOOTER_NEWLINE: { ...base, footer: { text: "Bye\nnow" } },
  FOOTER_EMOJI: { ...base, footer: { text: "Bye 👋" } },
  FOOTER_OPT_OUT_MISSING: { ...marketing, footer: undefined },
  BUTTONS_TOO_MANY: withButtons(
    Array.from({ length: 11 }, (_, i) => ({
      type: "QUICK_REPLY",
      text: `Option ${i}`,
    })),
  ),
  BUTTONS_TYPE_LIMIT: withButtons([
    url("https://acme.com/1"),
    { ...url("https://acme.com/2"), text: "Two" },
    { ...url("https://acme.com/3"), text: "Three" },
  ]),
  QUICK_REPLIES_NOT_GROUPED: withButtons([
    { type: "QUICK_REPLY", text: "Yes" },
    url("https://acme.com"),
    { type: "QUICK_REPLY", text: "No" },
  ]),
  BUTTONS_PARTLY_HIDDEN: withButtons(
    ["A", "B", "C", "D"].map((text) => ({ type: "QUICK_REPLY", text })),
  ),
  BUTTONS_DESKTOP_UNSUPPORTED: withButtons([
    { type: "QUICK_REPLY", text: "Yes" },
    url("https://acme.com"),
  ]),
  BUTTON_LABEL_REQUIRED: withButtons([{ type: "QUICK_REPLY", text: "" }]),
  BUTTON_LABEL_TOO_LONG: withButtons([
    { type: "QUICK_REPLY", text: "a".repeat(26) },
  ]),
  BUTTON_LABEL_PARAMETER: withButtons([
    { type: "QUICK_REPLY", text: "Hi {{name}}" },
  ]),
  BUTTON_LABEL_FORMATTING: withButtons([
    { type: "QUICK_REPLY", text: "*Yes*" },
  ]),
  BUTTON_LABEL_DUPLICATED: withButtons([
    { type: "QUICK_REPLY", text: "Yes" },
    { type: "QUICK_REPLY", text: "Yes" },
  ]),
  BUTTON_URL_INVALID: withButtons([url("acme")]),
  BUTTON_URL_TOO_LONG: withButtons([
    url("https://acme.com/" + "a".repeat(2000)),
  ]),
  BUTTON_URL_PARAM_POSITION: withButtons([
    url("https://acme.com/{{name}}/track"),
  ]),
  BUTTON_URL_WHATSAPP_DIRECT: withButtons([url("https://wa.me/15550100")]),
  BUTTON_URL_SHORTENED: withButtons([url("https://bit.ly/abc")]),
  BUTTON_URL_REDIRECT: withButtons([
    url("https://acme.com/go?redirect=https://other.com"),
  ]),
  BUTTON_PHONE_INVALID: withButtons([
    { type: "PHONE_NUMBER", text: "Call", phoneNumber: "5550100" },
  ]),
  BUTTON_COPY_CODE_EXAMPLE_REQUIRED: withButtons(
    [{ type: "COPY_CODE", example: "" }],
    marketing,
  ),
  BUTTON_COPY_CODE_EXAMPLE_TOO_LONG: withButtons(
    [{ type: "COPY_CODE", example: "A".repeat(21) }],
    marketing,
  ),
  LTO_TEXT_REQUIRED: lto({ limitedTimeOffer: { text: "" } }),
  LTO_TEXT_TOO_LONG: lto({
    limitedTimeOffer: { text: "Biggest sale of the year" },
  }),
  LTO_URL_BUTTON_REQUIRED: lto({
    buttons: [{ type: "COPY_CODE", example: "SAVE20" }],
  }),
  CAROUSEL_CARDS_COUNT: carousel([card()]),
  CAROUSEL_CARDS_MISMATCH: carousel([
    card(),
    { ...card(), buttons: [{ type: "QUICK_REPLY", text: "More" }] },
  ]),
  CAROUSEL_CARD_MEDIA_URL_INVALID: carousel([
    card(),
    { ...card(), header: { type: "IMAGE", url: "jacket.jpg" } },
  ]),
  CAROUSEL_CARD_BODY_REQUIRED: carousel([card(), card(" ")]),
  CAROUSEL_CARD_BODY_TOO_LONG: carousel([card(), card("a".repeat(161))]),
  CAROUSEL_CARD_BODY_NEWLINES: carousel([card(), card("a\nb\nc\nd")]),
  CAROUSEL_CARD_BUTTONS_REQUIRED: carousel([
    { ...card(), buttons: [] },
    { ...card(), buttons: [] },
  ]),
  CAROUSEL_CARD_BUTTONS_TOO_MANY: carousel(
    [1, 2].map(() => ({
      ...card(),
      buttons: [
        url("https://acme.com/a"),
        { ...url("https://acme.com/b"), text: "B" },
        { type: "QUICK_REPLY" as const, text: "C" },
      ],
    })),
  ),
  CALL_PERMISSION_NOT_COMBINABLE: {
    ...withButtons([{ type: "QUICK_REPLY", text: "Yes" }]),
    callPermissionRequest: true,
  },
  ORDER_DETAILS_MISMATCH: withButtons([
    { type: "ORDER_DETAILS", text: "Copy Pix code" },
  ]),
  BUTTON_ORDER_DETAILS_TEXT: {
    ...withButtons([{ type: "ORDER_DETAILS", text: "See order" }]),
    displayFormat: "ORDER_DETAILS",
  },
  OTP_CODE_EXPIRATION_RANGE: auth(
    { otpType: "COPY_CODE" },
    { footer: { codeExpirationMinutes: 120 } },
  ),
  OTP_BUTTON_TEXT_TOO_LONG: auth({
    otpType: "COPY_CODE",
    text: "a".repeat(26),
  }),
  OTP_BUTTON_TEXT_URL: auth({ otpType: "COPY_CODE", text: "Open acme.com" }),
  OTP_SUPPORTED_APPS_REQUIRED: auth({ supportedApps: [] }),
  OTP_SUPPORTED_APPS_TOO_MANY: auth({
    supportedApps: [1, 2, 3, 4, 5, 6].map((i) => ({
      packageName: `com.acme.app${i}`,
      signatureHash: "K8a/AINcGX7",
    })),
  }),
  OTP_SUPPORTED_APP_DUPLICATED: auth({
    supportedApps: [1, 2].map(() => ({
      packageName: "com.acme.app",
      signatureHash: "K8a/AINcGX7",
    })),
  }),
  OTP_PACKAGE_NAME_INVALID: auth({
    supportedApps: [{ packageName: "acme", signatureHash: "K8a/AINcGX7" }],
  }),
  OTP_SIGNATURE_HASH_INVALID: auth({
    supportedApps: [{ packageName: "com.acme.app", signatureHash: "short" }],
  }),
  OTP_ZERO_TAP_TERMS_NOT_ACCEPTED: auth({ otpType: "ZERO_TAP" }),
};

let failures = 0;
for (const code of Object.keys(codes) as Code[]) {
  const issues = validate(cases[code] as Template).issues;
  const reported = issues.map((issue) => issue.code);
  const ok =
    reported.includes(code) &&
    issues.every(
      (issue) => issue.code === code || issue.severity === "warning",
    );
  if (!ok) failures += 1;
  console.log(
    `${ok ? "ok  " : "FAIL"} ${code}${ok ? "" : ` -> ${reported.join(", ") || "nothing"}`}`,
  );
}
console.log(
  `\n${Object.keys(codes).length - failures}/${Object.keys(codes).length} codes reported without unrelated errors.`,
);
process.exitCode = failures ? 1 : 0;
