import {
  extractVariables,
  type AuthenticationTemplate,
  type Button,
  type Category,
  type StandardTemplate,
  type Template,
} from "@talqui-oss/template-builder";

export const INITIAL_TEMPLATE: StandardTemplate = {
  name: "order_shipped",
  language: "en_US",
  category: "UTILITY",
  header: { type: "TEXT", text: "Order {{order}} shipped" },
  body: {
    text: "Hi {{name}}, your order *{{order}}* left our warehouse today and arrives within _3 business days_.\n\nYou can follow every step of the delivery with the button below.",
  },
  footer: { text: "Acme Store" },
  buttons: [
    { type: "QUICK_REPLY", text: "Confirm delivery" },
    {
      type: "URL",
      text: "Track order",
      url: "https://acme.com/track/{{order}}",
    },
  ],
  variables: { name: { example: "Maria" }, order: { example: "4512" } },
};

const AUTHENTICATION_DEFAULTS: Omit<
  AuthenticationTemplate,
  "name" | "language"
> = {
  category: "AUTHENTICATION",
  body: { addSecurityRecommendation: true },
  footer: { codeExpirationMinutes: 10 },
  button: { type: "OTP", otpType: "COPY_CODE" },
};

/** Switches category, swapping between the standard and the authentication shapes. */
export function withCategory(template: Template, category: Category): Template {
  const { name, language } = template;
  if (category === "AUTHENTICATION")
    return { name, language, ...AUTHENTICATION_DEFAULTS };
  if (template.category === "AUTHENTICATION")
    return { ...INITIAL_TEMPLATE, name, language, category };
  return { ...template, category };
}

/** Keeps `variables` in step with the placeholders used in the text, preserving typed examples. */
export function withVariables(template: StandardTemplate): StandardTemplate {
  const names = extractVariables(template);
  const current = template.variables ?? {};
  return {
    ...template,
    variables: Object.fromEntries(
      names.map((name) => [name, current[name] ?? { example: "" }]),
    ),
  };
}

export const BUTTON_TYPES = [
  "QUICK_REPLY",
  "URL",
  "PHONE_NUMBER",
  "COPY_CODE",
] as const;

export type EditableButtonType = (typeof BUTTON_TYPES)[number];

/** A new button of the given type, keeping the label when the type changes. */
export function newButton(type: EditableButtonType, label = ""): Button {
  switch (type) {
    case "URL":
      return { type, text: label || "Open link", url: "https://" };
    case "PHONE_NUMBER":
      return { type, text: label || "Call us", phoneNumber: "+" };
    case "COPY_CODE":
      return { type, example: "CODE10" };
    default:
      return { type, text: label || "Reply" };
  }
}
