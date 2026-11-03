// Prints the curl command that creates this template on the Meta Cloud API.
// Usage: pnpm --filter example-meta start
import { toCurl, toRequests } from "@talqui-oss/template-builder";
import type { Template } from "@talqui-oss/template-builder";
import { meta } from "@talqui-oss/template-builder/adapters/meta";

const template: Template = {
  name: "order_shipped",
  language: "en_US",
  category: "UTILITY",
  header: { type: "IMAGE", url: "https://acme.com/box.jpg" },
  body: { text: "Hi {{name}}, order {{order}} is on its way." },
  footer: { text: "Acme Store" },
  buttons: [
    {
      type: "URL",
      text: "Track order",
      url: "https://acme.com/track/{{order}}",
    },
  ],
  variables: { name: { example: "Maria" }, order: { example: "4512" } },
};

console.log(toCurl(toRequests(template, meta())));
