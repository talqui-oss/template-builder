import type { StandardTemplate, Template } from "@talqui-oss/template-builder";

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

/** `#t=<base64url JSON>`: the playground link that carries a template. */
export function templateLink(template: Template) {
  const bytes = new TextEncoder().encode(JSON.stringify(template));
  const base64 = btoa(String.fromCharCode(...bytes));
  return `/playground#t=${base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`;
}

/** The template in the current URL hash, or the default one when missing or unreadable. */
export function templateFromHash(
  hash = typeof location === "undefined" ? "" : location.hash,
): Template {
  const encoded = new URLSearchParams(hash.slice(1)).get("t");
  if (!encoded) return INITIAL_TEMPLATE;
  try {
    const binary = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as Template;
  } catch {
    return INITIAL_TEMPLATE;
  }
}
