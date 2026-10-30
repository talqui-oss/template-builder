# Template schema

A template is a plain JSON object. Field names follow Meta's template API in camelCase, so anyone who has read Meta's docs recognizes them. The TypeScript types live in [`packages/template-builder/src/schema/types.ts`](../packages/template-builder/src/schema/types.ts) and the JSON Schema ships with the package as `@talqui-oss/template-builder/schema.json`.

```ts
import type { Template } from "@talqui-oss/template-builder";

const template = {
  name: "order_shipped",
  language: "en_US",
  category: "UTILITY",
  header: { type: "TEXT", text: "Your order is on the way" },
  body: { text: "Hi {{name}}, order {{order}} is on the way." },
  footer: { text: "Reply STOP to opt out" },
  buttons: [
    { type: "URL", text: "Track order", url: "https://acme.com/t/{{order}}" },
  ],
  variables: { name: { example: "Maria" }, order: { example: "4512" } },
} satisfies Template;
```

In a `.json` file, add `"$schema": "https://template-builder.dev/schema.json"` for autocomplete.

## Variables

- Placeholders are named, without spaces: `{{name}}`. Names use lowercase letters, numbers and underscores.
- Every placeholder has one entry in `variables` with an `example`. The example is shown in the preview and sent to the provider for review.
- The same variable can appear in the header, the body and a URL button.
- Providers that only take positional placeholders (`{{1}}`) get them from the adapter. Positions follow the first appearance of each variable, in this order: header, body, carousel cards, then button URLs. In the example above, `name` is `{{1}}` and `order` is `{{2}}`, and the URL button reuses `{{2}}`.

## From Meta's JSON

Many tools store templates in Meta's own request format (`components[]`). That format maps to this schema field by field, as shown in the table below. The one change is that positional placeholders (`{{1}}`) become named ones (`{{var_1}}`), with the same examples.

## Two shapes

`Template` is one of two shapes, chosen by `category`:

| Shape                    | `category`             | Why                                                                                          |
| ------------------------ | ---------------------- | -------------------------------------------------------------------------------------------- |
| `StandardTemplate`       | `MARKETING`, `UTILITY` | Free text in `body`, optional header, footer, buttons and special components                 |
| `AuthenticationTemplate` | `AUTHENTICATION`       | Meta writes the body text. You only choose options and one `OTP` button (`button`, singular) |

TypeScript and the JSON Schema both reject mixed shapes, such as an authentication template with `body.text`.

## Fields

### Common

| Field                   | Type                                         | Notes                                         |
| ----------------------- | -------------------------------------------- | --------------------------------------------- |
| `name`                  | string                                       | `[a-z0-9_]`                                   |
| `language`              | string                                       | Locale code: `en_US`, `pt_BR`, `es`           |
| `category`              | `MARKETING` \| `UTILITY` \| `AUTHENTICATION` |                                               |
| `messageSendTtlSeconds` | number                                       | How long the provider keeps trying to deliver |

### Standard templates

| Field                   | Type                                                               | Notes                                                                         |
| ----------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `header`                | `TEXT`, `IMAGE`, `VIDEO`, `DOCUMENT`, `GIF`, `LOCATION`, `PRODUCT` | Media headers take a public sample `url`                                      |
| `body.text`             | string                                                             | Required. Supports `*bold*`, `_italic_`, `~strike~`, `` `code` ``             |
| `footer.text`           | string                                                             | No variables                                                                  |
| `buttons`               | `Button[]`                                                         | See below                                                                     |
| `limitedTimeOffer`      | `{ text, hasExpiration? }`                                         | Limited-time offer                                                            |
| `carousel`              | `{ cards }`                                                        | 2 to 10 cards, each with a media or product header, optional body and buttons |
| `callPermissionRequest` | `true`                                                             | Asks permission to call the user                                              |
| `displayFormat`         | `ORDER_DETAILS`                                                    | Order details message                                                         |
| `variables`             | `Record<string, { example }>`                                      |                                                                               |

### Buttons

| `type`                                   | Fields                                                                            |
| ---------------------------------------- | --------------------------------------------------------------------------------- |
| `QUICK_REPLY`                            | `text`                                                                            |
| `URL`                                    | `text`, `url` (a placeholder at the end makes it dynamic)                         |
| `PHONE_NUMBER`                           | `text`, `phoneNumber`                                                             |
| `VOICE_CALL`                             | `text`, `ttlMinutes?`                                                             |
| `COPY_CODE`                              | `example`                                                                         |
| `FLOW`                                   | `text`, `flowId?` \| `flowName?` \| `flowJson?`, `flowAction?`, `navigateScreen?` |
| `CATALOG`, `MPM`, `SPM`, `ORDER_DETAILS` | `text`                                                                            |
| `PAYMENT_REQUEST`                        | `paymentSetting`, `text?`                                                         |

### Authentication templates

| Field                            | Type                                                                                    | Notes                                         |
| -------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------- |
| `body.addSecurityRecommendation` | boolean                                                                                 | Adds the "do not share this code" line        |
| `footer.codeExpirationMinutes`   | number                                                                                  | 1 to 90                                       |
| `button`                         | `{ type: "OTP", otpType, text?, autofillText?, supportedApps?, zeroTapTermsAccepted? }` | `otpType`: `COPY_CODE`, `ONE_TAP`, `ZERO_TAP` |

## Provider equivalence

What each adapter sends for each field. Cells marked "unsupported" make the adapter return an `UNSUPPORTED_BY_PROVIDER` error with the field path.

| Field                                    | Meta Cloud API (`POST /{WABA_ID}/message_templates`)                                                                        | Twilio Content API                                                                 | Talqui (`POST /v1/tenants/{tenantID}/campaigns-models`)                               |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `name`                                   | `name`                                                                                                                      | `friendly_name`, and `name` in the approval request                                | `campaignModelName`                                                                   |
| `language`                               | `language`                                                                                                                  | `language`                                                                         | `pt_BR` only; any other value is unsupported                                          |
| `category`                               | `category`                                                                                                                  | `category` in the approval request                                                 | `campaignModelType`                                                                   |
| placeholders                             | `parameter_format: "NAMED"`, `{{name}}` kept                                                                                | positional `{{1}}` + `variables: { "1": example }`                                 | `{{ name }}` with spaces + `variables[]` entries                                      |
| `header` `TEXT`                          | `HEADER` component, `format: "TEXT"`, `example.header_text_named_params`                                                    | `whatsapp/card` `header_text`                                                      | `campaignModelSlots.header` `{ type: "text", text, variables }`                       |
| `header` media                           | `HEADER` `format: IMAGE \| VIDEO \| DOCUMENT`, `example.header_handle` (needs an upload first, see below)                   | `twilio/media` or card `media: [url]`                                              | `header` `{ type: "image" \| "video" \| "document" }`, URL in `variables[0].fallback` |
| `header` `GIF`, `LOCATION`, `PRODUCT`    | `HEADER` `format: GIF \| LOCATION \| PRODUCT`                                                                               | unsupported                                                                        | unsupported                                                                           |
| `body.text`                              | `BODY` component, `example.body_text_named_params`                                                                          | `body`                                                                             | `campaignModelSlots.body` `{ text, variables }`                                       |
| `footer.text`                            | `FOOTER` component                                                                                                          | `whatsapp/card` `footer`                                                           | `campaignModelSlots.footer` `{ text }`                                                |
| `QUICK_REPLY`                            | `{ type, text }`                                                                                                            | `twilio/quick-reply` action `{ title, id }`                                        | `{ type, text }`                                                                      |
| `URL`                                    | `{ type, text, url, example }` (dynamic part becomes `{{1}}`)                                                               | `URL` action `{ title, url }`                                                      | `{ type, text, url, example }`                                                        |
| `PHONE_NUMBER`                           | `{ type, text, phone_number }`                                                                                              | `PHONE_NUMBER` action `{ title, phone }`                                           | `{ type, text, phone_number }`                                                        |
| `VOICE_CALL`                             | `{ type, text, ttl_minutes }`                                                                                               | unsupported                                                                        | `{ type, text, ttl_minutes }`                                                         |
| `COPY_CODE`                              | `{ type, example: [value] }`                                                                                                | `COPY_CODE` action                                                                 | `{ type, example: [value] }`                                                          |
| `FLOW`                                   | `{ type, text, flow_id \| flow_name \| flow_json, flow_action, navigate_screen }`                                           | `twilio/flows`                                                                     | unsupported                                                                           |
| `CATALOG`, `MPM`, `SPM`                  | `{ type, text }`                                                                                                            | `twilio/catalog`                                                                   | unsupported                                                                           |
| `ORDER_DETAILS`                          | `{ type, text }`                                                                                                            | unsupported                                                                        | `{ type, text }`                                                                      |
| `PAYMENT_REQUEST`                        | `{ type, payment_setting }`                                                                                                 | unsupported                                                                        | unsupported                                                                           |
| `limitedTimeOffer`                       | `LIMITED_TIME_OFFER` component `{ text, has_expiration }`                                                                   | unsupported                                                                        | unsupported                                                                           |
| `carousel`                               | `CAROUSEL` component, one `components[]` per card                                                                           | `twilio/carousel`                                                                  | unsupported                                                                           |
| `callPermissionRequest`                  | `CALL_PERMISSION_REQUEST` component                                                                                         | unsupported                                                                        | unsupported                                                                           |
| `displayFormat`                          | `display_format`                                                                                                            | unsupported                                                                        | `campaignModelGatewayMeta.displayFormat`                                              |
| `messageSendTtlSeconds`                  | `message_send_ttl_seconds`                                                                                                  | unsupported                                                                        | unsupported                                                                           |
| Authentication `body` / `footer` options | `BODY.add_security_recommendation`, `FOOTER.code_expiration_minutes`                                                        | `whatsapp/authentication` `add_security_recommendation`, `code_expiration_minutes` | unsupported                                                                           |
| `OTP` button                             | `{ type: "OTP", otp_type, text, autofill_text, supported_apps[{ package_name, signature_hash }], zero_tap_terms_accepted }` | `whatsapp/authentication` `COPY_CODE` action                                       | `{ type: "OTP", otp_type: "COPY_CODE" }`; `ONE_TAP` and `ZERO_TAP` unsupported        |

Notes:

- **Media headers on Meta.** Meta expects a `header_handle` from its Resumable Upload API, not a URL. The Meta adapter puts a placeholder (`$MEDIA_HANDLE`) in the generated request and the docs show the upload step.
- **Twilio needs two requests.** One creates the content, the other asks WhatsApp to approve it. `toCurl` prints both, in order.
- **Talqui channel options.** The channel and connection the template belongs to (`campaignModelChannel`, `campaignModelChannelID`) are adapter options, not template fields.
- The Twilio column is confirmed field by field when the Twilio adapter ships. Until then it describes the intended mapping.

## Support by release

The schema covers every template type from the first release. What changes between releases is how much of it `validate`, the preview and the adapters implement.

| Release | Template types                                                                                                                                                                                                                                                                                                                                                    |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1     | Standard templates with `TEXT`, `IMAGE`, `VIDEO`, `DOCUMENT`, `GIF` and `LOCATION` headers and `QUICK_REPLY`, `URL`, `PHONE_NUMBER`, `VOICE_CALL` and `COPY_CODE` buttons; coupon codes; authentication (`COPY_CODE`, `ONE_TAP`, `ZERO_TAP`); limited-time offers; media carousels; call permission requests; the `ORDER_DETAILS` button (validation and preview) |
| 0.2     | Catalog, multi-product, single-product and product carousel templates                                                                                                                                                                                                                                                                                             |
| 0.3     | Order details on Meta, payment requests and Flows                                                                                                                                                                                                                                                                                                                 |

Until a type is implemented, `validate` checks its structure and the general button limits, and the preview and adapters return `UNSUPPORTED_BY_PROVIDER`.
