// Writes an adapter for a made-up provider with defineAdapter and prints its curl command.
// Usage: pnpm --filter example-custom-adapter start
import {
  defineAdapter,
  extractVariables,
  toCurl,
  toRequests,
} from "@talqui-oss/template-builder";
import type { Template } from "@talqui-oss/template-builder";

const acme = defineAdapter<{ apiKey?: string }>({
  name: "acme",
  toRequests: (template, { apiKey = "$ACME_API_KEY" }) => [
    {
      method: "POST",
      url: "https://api.acme.example/templates",
      headers: { "X-Api-Key": apiKey, "Content-Type": "application/json" },
      body: {
        name: template.name,
        locale: template.language,
        text: template.category === "AUTHENTICATION" ? "" : template.body.text,
        variables: extractVariables(template),
      },
    },
  ],
});

const template: Template = {
  name: "welcome",
  language: "en_US",
  category: "MARKETING",
  body: { text: "Welcome aboard, {{name}}! Reply STOP to opt out." },
  variables: { name: { example: "Maria" } },
};

console.log(toCurl(toRequests(template, acme())));
