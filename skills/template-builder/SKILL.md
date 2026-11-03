---
name: template-builder
description: Use when writing, reviewing, previewing or creating WhatsApp message templates (HSM) for the Meta Cloud API, Twilio or Talqui. Covers marketing campaigns, utility updates and one-time passwords, such as order confirmations, shipping updates, abandoned carts, appointment reminders, payment reminders, verification codes, promotions and feedback requests. Also use when adding a WhatsApp template preview, validation or a "create template on Meta" step to an app or backend.
license: MIT
metadata:
  homepage: https://template-builder.dev
  source: https://github.com/talqui-oss/template-builder
---

# template-builder

`@talqui-oss/template-builder` describes a WhatsApp template as one JSON object, checks it against the rules Meta applies at review, and builds the HTTP request that creates it. It never sends anything: you, or the user's backend, send the request.

## Install

```sh
npm i @talqui-oss/template-builder
# preview components, optional
npm i @talqui-oss/template-builder-react   # or @talqui-oss/template-builder-vue
```

## Workflow

1. Write the template as JSON (schema below, full schema at https://template-builder.dev/schema.json).
2. Run `validate(template)`. Fix every issue with `severity: "error"`: each one is a rejection at review. Warnings do not block.
3. Build the request with an adapter and `toRequests`, or print it with `toCurl`.
4. Before writing from scratch, look for a close match in the catalog: https://template-builder.dev/whatsapp-template.md (every entry has a `.json`).

```ts
import { validate, toRequests, toCurl } from "@talqui-oss/template-builder";
import { meta } from "@talqui-oss/template-builder/adapters/meta";

const { valid, issues } = validate(template);
if (!valid) console.error(issues); // [{ code, path, message, severity }]

const requests = toRequests(
  template,
  meta({ wabaId: "123", accessToken: process.env.META_TOKEN }),
);
console.log(toCurl(requests)); // options left out stay as $WABA_ID / $META_ACCESS_TOKEN
```

Adapters: `meta({ wabaId, accessToken, apiVersion })` (verified), `talqui({ tenantId, channelId })` (verified), `twilio({ accountSid, authToken })` (not yet verified). Write your own with `defineAdapter({ name, toRequests })`.

## Schema in short

```json
{
  "$schema": "https://template-builder.dev/schema.json",
  "name": "order_shipped",
  "language": "en_US",
  "category": "UTILITY",
  "header": { "type": "TEXT", "text": "Order {{order}} shipped" },
  "body": { "text": "Hi {{name}}, your order *{{order}}* is on the way." },
  "footer": { "text": "Acme Store" },
  "buttons": [
    {
      "type": "URL",
      "text": "Track order",
      "url": "https://acme.com/t/{{order}}"
    }
  ],
  "variables": {
    "name": { "example": "Maria" },
    "order": { "example": "4512" }
  }
}
```

Authentication templates have no text; Meta writes it:

```json
{
  "name": "verification_code",
  "language": "en_US",
  "category": "AUTHENTICATION",
  "body": { "addSecurityRecommendation": true },
  "footer": { "codeExpirationMinutes": 10 },
  "button": { "type": "OTP", "otpType": "COPY_CODE" }
}
```

## Rules that cause most rejections

- `name`: lowercase letters, numbers and underscores.
- Placeholders are named, `{{first_name}}`, and every one needs an `example` in `variables`.
- The body cannot start or end with a placeholder, two placeholders cannot touch, and the text cannot be mostly placeholders.
- Header text: 60 characters, at most one placeholder, no emoji, no formatting, no line breaks.
- Body: 1024 characters. Footer: 60 characters.
- Category: `MARKETING` for anything promotional (offers, launches, re-engagement); `UTILITY` only for updates about something the user did, with no promotional wording; `AUTHENTICATION` only for one-time codes. A `COPY_CODE` button requires `MARKETING`.
- URL buttons may have one placeholder, at the end of the URL.

The full list of 73 codes is in https://github.com/talqui-oss/template-builder/blob/main/docs/validation.md.

## Preview in an app

```tsx
import { TemplatePreview } from "@talqui-oss/template-builder-react";
import "@talqui-oss/template-builder/styles.css";

<TemplatePreview
  template={template}
  values={{ name: "Ana" }}
  time="09:41"
  onIssues={setIssues}
/>;
```

The preview is calibrated against a real iPhone: same line breaks, bubble and buttons. The Vue component takes the same props and emits `issues` instead of `onIssues`.

## Links

- Playground: https://template-builder.dev/playground
- Catalog: https://template-builder.dev/whatsapp-template
- Agent page: https://template-builder.dev/agents
- llms.txt: https://template-builder.dev/llms.txt
