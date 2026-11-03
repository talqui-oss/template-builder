// Prints the curl command that creates this template on Talqui.
// Usage: pnpm --filter example-talqui start
import { toCurl, toRequests } from "@talqui-oss/template-builder";
import type { Template } from "@talqui-oss/template-builder";
import { talqui } from "@talqui-oss/template-builder/adapters/talqui";

const template: Template = {
  name: "pedido_enviado",
  language: "pt_BR",
  category: "UTILITY",
  header: { type: "IMAGE", url: "https://acme.com/box.jpg" },
  body: { text: "Oi {{name}}, o pedido {{order}} está a caminho." },
  footer: { text: "Loja Acme" },
  buttons: [
    {
      type: "URL",
      text: "Rastrear pedido",
      url: "https://acme.com/track/{{order}}",
    },
  ],
  variables: { name: { example: "Maria" }, order: { example: "4512" } },
};

console.log(
  toCurl(toRequests(template, talqui({ channel: "whatsapp-cloud" }))),
);
