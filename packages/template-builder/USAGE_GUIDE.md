# Usage guide

Validate WhatsApp message templates and generate the requests that create them on Meta, Twilio or Talqui. No runtime dependencies, and no API calls: you get the requests and run them yourself.

```sh
npm i @talqui-oss/template-builder
```

## 1. Write the template

A plain JSON object. Field names follow Meta's API in camelCase. Variables are named (`{{name}}`) and each one needs an example in `variables`.

```ts
import type { Template } from "@talqui-oss/template-builder";

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
  variables: {
    name: { example: "Maria" },
    order: { example: "4512" },
  },
};
```

For autocomplete in `.json` files, point `$schema` to `@talqui-oss/template-builder/schema.json`.

## 2. Validate

```ts
import { validate } from "@talqui-oss/template-builder";

const result = validate(template);
// { valid: true, issues: [] }
```

Each issue has a stable code, the path of the field and a message that says how to fix it:

```ts
validate({
  ...template,
  buttons: [{ type: "URL", text: "Chat", url: "https://wa.me/15550100" }],
});
// {
//   valid: false,
//   issues: [{
//     code: "BUTTON_URL_WHATSAPP_DIRECT",
//     path: "buttons.0.url",
//     message: "Links that open a WhatsApp chat (wa.me, whatsapp.com) are not allowed in URL buttons.",
//     severity: "error"
//   }]
// }
```

Warnings (`severity: "warning"`) do not make a template invalid, for example more than 3 buttons, which WhatsApp hides behind "See all options". If your account is exempt from a rule, turn it off:

```ts
validate(template, { disable: ["BODY_EMOJI_LIMIT"] });
```

## 3. Generate the provider request

```ts
import { toRequests, toCurl } from "@talqui-oss/template-builder";
import { meta } from "@talqui-oss/template-builder/adapters/meta";

const requests = toRequests(template, meta());
console.log(toCurl(requests));
```

Output (shortened):

```sh
# Upload each sample file with the Resumable Upload API and replace $MEDIA_HANDLE with the handle it returns:
# https://developers.facebook.com/docs/graph-api/guides/upload
# - https://acme.com/box.jpg
curl -X POST "https://graph.facebook.com/v26.0/$WABA_ID/message_templates" \
  -H "Authorization: Bearer $META_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "order_shipped",
  "parameter_format": "NAMED",
  "components": [
    { "type": "HEADER", "format": "IMAGE", "example": { "header_handle": ["$MEDIA_HANDLE"] } },
    { "type": "BODY", "text": "Hi {{name}}, order {{order}} is on its way.", ... },
    { "type": "FOOTER", "text": "Acme Store" },
    { "type": "BUTTONS", "buttons": [{ "type": "URL", "url": "https://acme.com/track/{{1}}", ... }] }
  ]
}'
```

- `toRequests` validates first and throws `TemplateValidationError` (with `.issues`) when there are errors.
- Credentials default to placeholders such as `$WABA_ID`: export them in your shell and paste the command.
- Pass real values to run the requests with `fetch`:

```ts
const [request] = toRequests(
  template,
  meta({ wabaId: "123", accessToken: token }),
);
await fetch(request.url, {
  method: request.method,
  headers: request.headers,
  body: JSON.stringify(request.body),
});
```

## 4. Adapters

| Adapter        | Import             | Options (default)                                                                                                           | Requests                                     |
| -------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Meta Cloud API | `/adapters/meta`   | `wabaId` (`$WABA_ID`), `accessToken` (`$META_ACCESS_TOKEN`), `apiVersion` (`v26.0`)                                         | 1                                            |
| Twilio         | `/adapters/twilio` | `accountSid` (`$TWILIO_ACCOUNT_SID`), `authToken` (`$TWILIO_AUTH_TOKEN`)                                                    | 2: create the content, then ask for approval |
| Talqui         | `/adapters/talqui` | `tenantId`, `channel` (`whatsapp-cloud` or `whatsapp-gup`), `channelId`, `auth` (`operator` or `pluginConnection`), `token` | 1                                            |

The Twilio adapter is unverified: it follows Twilio's docs but has not been run against a real account yet.

When a provider cannot create a field, the adapter throws `UnsupportedByProviderError` instead of dropping it:

```ts
toRequests(carouselTemplate, talqui());
// UnsupportedByProviderError: talqui: A carousel is not supported by this provider. (carousel)
```

## 5. Write your own adapter

```ts
import {
  defineAdapter,
  extractVariables,
  toRequests,
} from "@talqui-oss/template-builder";

export const acme = defineAdapter<{ apiKey?: string }>({
  name: "acme",
  toRequests: (template, { apiKey = "$ACME_API_KEY" }) => [
    {
      method: "POST",
      url: "https://api.acme.example/templates",
      headers: { "X-Api-Key": apiKey, "Content-Type": "application/json" },
      body: { name: template.name, variables: extractVariables(template) },
    },
  ],
});

toRequests(template, acme());
```

`extractVariables(template)` returns variable names in positional order (header, body, carousel cards, then button URLs), which is what providers that only take `{{1}}`, `{{2}}` need.
