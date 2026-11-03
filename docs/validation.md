# Validation

`validate` checks a template against the rules WhatsApp applies before a template goes to review, so you find problems while writing it instead of after a rejection.

```ts
import { validate } from "@talqui-oss/template-builder";

const result = validate(template);
// { valid: false, issues: [{ code: "BUTTON_URL_SHORTENED", path: "buttons.0.url", message: "...", severity: "error" }] }
```

- `valid` is `true` when there are no errors. Warnings point at things that hurt delivery or display but do not block approval.
- `path` uses dot notation (`buttons.1.text`), like most schema validators.
- `code` values are stable. Match on them, not on `message`.

## Options

```ts
validate(template, {
  disable: ["PARAM_ADJACENT"], // rules your account is exempt from
  shortenerDomains: ["bit.ly", "tinyurl.com"], // replaces the default list
  limitedTimeOfferTextLimit: 16,
  carouselCardBodyLimit: 160,
});
```

Some rules depend on your WhatsApp account: business accounts can be exempt from the variable ratio, the adjacent variables rule or the link checks. `validate` applies the strictest version by default. Turn a rule off with `disable` if your account is exempt.

## Notes on counting

- Lengths count characters as people see them (Unicode code points), so an accented letter counts as one.
- Emojis count as one each, including skin tones and combined emojis like 👩‍💻.
- For the variable ratio, each word and each variable counts once. Thai and Lao text counts one word per 7 characters, and Chinese, Japanese and Korean text one word per character. A body needs at least 3 other words for each variable.

## Codes

| Code                                | Severity | Message                                                                                                                           |
| ----------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `SCHEMA_INVALID`                    | error    | The template does not have the shape of the schema, e.g. `body.text` is missing. The message names the field.                     |
| `NAME_INVALID`                      | error    | Use only lowercase letters, numbers and underscores, e.g. order_shipped.                                                          |
| `NAME_TOO_LONG`                     | error    | The name can have at most 512 characters.                                                                                         |
| `LANGUAGE_INVALID`                  | error    | Use a locale code such as "en_US", "pt_BR" or "es".                                                                               |
| `CATEGORY_MISMATCH`                 | error    | Templates with a COPY_CODE button must use the MARKETING category.                                                                |
| `TTL_OUT_OF_RANGE`                  | error    | For UTILITY templates the TTL must be between 30 and 43200 seconds.                                                               |
| `PLACEHOLDER_INVALID`               | error    | "{{ name }}" is not a valid variable. Use a name with lowercase letters, numbers and underscores (up to 32), e.g. {{first_name}}. |
| `PLACEHOLDER_DUPLICATED`            | error    | "{{name}}" appears twice in the same text. Use a second variable instead.                                                         |
| `VARIABLE_NOT_DECLARED`             | error    | Add an example for "name" in variables.                                                                                           |
| `VARIABLE_MISSING_EXAMPLE`          | error    | Add an example value for "name".                                                                                                  |
| `VARIABLE_UNUSED`                   | warning  | "order" is declared but not used in the template.                                                                                 |
| `PARAM_RATIO_TOO_HIGH`              | error    | Too many variables for the amount of text: 1 variable in 3 words. Each variable needs at least 3 other words.                     |
| `PARAM_ADJACENT`                    | error    | Two variables cannot be next to each other. Put some text between them.                                                           |
| `PARAM_AT_EDGE`                     | error    | The body cannot start or end with a variable.                                                                                     |
| `HEADER_TEXT_REQUIRED`              | error    | Header text is required, or remove the header.                                                                                    |
| `HEADER_TOO_LONG`                   | error    | Header text can have at most 60 characters; this one has 61.                                                                      |
| `HEADER_TOO_MANY_PARAMS`            | error    | A text header can have at most one variable.                                                                                      |
| `HEADER_NEWLINE`                    | error    | Header text cannot have line breaks.                                                                                              |
| `HEADER_EMOJI`                      | error    | Header text cannot have emojis.                                                                                                   |
| `HEADER_FORMATTING`                 | error    | Header text cannot use formatting such as _bold_ or a literal asterisk.                                                           |
| `HEADER_MEDIA_URL_INVALID`          | error    | Add a public https:// URL to a sample file.                                                                                       |
| `BODY_REQUIRED`                     | error    | Body text is required.                                                                                                            |
| `BODY_TOO_LONG`                     | error    | Body text can have at most 1024 characters; this one has 1517.                                                                    |
| `BODY_MULTIPLE_NEWLINES`            | error    | Body text cannot have more than one blank line in a row.                                                                          |
| `BODY_EMOJI_LIMIT`                  | error    | UTILITY templates can have at most 6 emojis in the body; this one has 7.                                                          |
| `FOOTER_TOO_LONG`                   | error    | Footer text can have at most 60 characters; this one has 61.                                                                      |
| `FOOTER_PARAMETER`                  | error    | Footer text cannot contain variables.                                                                                             |
| `FOOTER_NEWLINE`                    | error    | Footer text cannot have line breaks.                                                                                              |
| `FOOTER_EMOJI`                      | error    | Footer text cannot have emojis.                                                                                                   |
| `COMPONENT_NOT_ALLOWED`             | error    | Limited-time offer templates only accept an IMAGE or VIDEO header.                                                                |
| `FOOTER_OPT_OUT_MISSING`            | warning  | Marketing templates are less likely to be blocked with an opt-out footer, e.g. "Reply STOP to opt out".                           |
| `BUTTONS_TOO_MANY`                  | error    | A template can have at most 10 buttons; this one has 11.                                                                          |
| `BUTTONS_TYPE_LIMIT`                | error    | At most 2 URL buttons per template; found 3.                                                                                      |
| `QUICK_REPLIES_NOT_GROUPED`         | error    | Quick reply buttons must be next to each other, all before or all after the other buttons.                                        |
| `BUTTONS_PARTLY_HIDDEN`             | warning  | With more than 3 buttons, WhatsApp shows 2 and puts the rest behind "See all options".                                            |
| `BUTTONS_DESKTOP_UNSUPPORTED`       | warning  | Templates with 4 or more buttons, or quick replies mixed with other buttons, are not shown on WhatsApp Desktop.                   |
| `BUTTON_LABEL_REQUIRED`             | error    | Button text is required.                                                                                                          |
| `BUTTON_LABEL_TOO_LONG`             | error    | Button text can have at most 25 characters; this one has 26.                                                                      |
| `BUTTON_LABEL_PARAMETER`            | error    | Button text cannot contain variables.                                                                                             |
| `BUTTON_LABEL_FORMATTING`           | error    | Button text cannot contain *, _, ~ or ` characters.                                                                               |
| `BUTTON_LABEL_DUPLICATED`           | error    | "Yes" is already used by button 0. Labels must be unique.                                                                         |
| `BUTTON_URL_INVALID`                | error    | Enter a full URL starting with https:// or http://.                                                                               |
| `BUTTON_URL_TOO_LONG`               | error    | URLs can have at most 2000 characters.                                                                                            |
| `BUTTON_URL_PARAM_POSITION`         | error    | A URL button can have one variable, and only at the very end.                                                                     |
| `BUTTON_URL_WHATSAPP_DIRECT`        | error    | Links that open a WhatsApp chat (wa.me, whatsapp.com) are not allowed in URL buttons.                                             |
| `BUTTON_URL_SHORTENED`              | error    | Shortened links (bit.ly) are rejected. Use the full destination URL.                                                              |
| `BUTTON_URL_REDIRECT`               | error    | Links that redirect to another site through a query parameter are rejected. Link to the final page.                               |
| `BUTTON_PHONE_INVALID`              | error    | Use the international format with country code, e.g. +15550100.                                                                   |
| `BUTTON_COPY_CODE_EXAMPLE_REQUIRED` | error    | Add a sample coupon code.                                                                                                         |
| `BUTTON_COPY_CODE_EXAMPLE_TOO_LONG` | error    | Coupon codes can have at most 20 characters.                                                                                      |
| `LTO_TEXT_REQUIRED`                 | error    | Add the offer headline.                                                                                                           |
| `LTO_TEXT_TOO_LONG`                 | error    | The offer headline can have at most 16 characters.                                                                                |
| `LTO_URL_BUTTON_REQUIRED`           | error    | Limited-time offer templates need a URL button.                                                                                   |
| `CAROUSEL_CARDS_COUNT`              | error    | A carousel needs 2 to 10 cards; this one has 1.                                                                                   |
| `CAROUSEL_CARDS_MISMATCH`           | error    | Every card needs the same header type, the same parts and the same buttons, in the same order.                                    |
| `CAROUSEL_CARD_MEDIA_URL_INVALID`   | error    | Add a public https:// URL to a sample image or video.                                                                             |
| `CAROUSEL_CARD_BODY_REQUIRED`       | error    | Each card needs body text.                                                                                                        |
| `CAROUSEL_CARD_BODY_TOO_LONG`       | error    | Card text can have at most 160 characters.                                                                                        |
| `CAROUSEL_CARD_BODY_NEWLINES`       | error    | Card text can have at most 2 line breaks.                                                                                         |
| `CAROUSEL_CARD_BUTTONS_REQUIRED`    | error    | Each card needs at least one button.                                                                                              |
| `CAROUSEL_CARD_BUTTONS_TOO_MANY`    | error    | Each card can have at most 2 buttons.                                                                                             |
| `CALL_PERMISSION_NOT_COMBINABLE`    | error    | Call permission requests cannot be combined with buttons, carousels or limited-time offers.                                       |
| `ORDER_DETAILS_MISMATCH`            | error    | Order details templates need `displayFormat: "ORDER_DETAILS"` and exactly one ORDER_DETAILS button.                               |
| `OTP_CODE_EXPIRATION_RANGE`         | error    | The code expiration must be a whole number of minutes from 1 to 90.                                                               |
| `OTP_BUTTON_TEXT_TOO_LONG`          | error    | OTP button text can have at most 25 characters.                                                                                   |
| `OTP_BUTTON_TEXT_URL`               | error    | OTP button text cannot contain a link.                                                                                            |
| `OTP_SUPPORTED_APPS_REQUIRED`       | error    | ONE_TAP buttons need at least one Android app (package name and signature hash).                                                  |
| `OTP_SUPPORTED_APPS_TOO_MANY`       | error    | An OTP button can list at most 5 apps.                                                                                            |
| `OTP_SUPPORTED_APP_DUPLICATED`      | error    | This app is listed twice.                                                                                                         |
| `OTP_PACKAGE_NAME_INVALID`          | error    | Use the Android package name, e.g. com.example.app (at most 224 characters).                                                      |
| `OTP_SIGNATURE_HASH_INVALID`        | error    | The app signature hash has exactly 11 characters (letters, numbers, +, / or =).                                                   |
| `OTP_ZERO_TAP_TERMS_NOT_ACCEPTED`   | error    | Zero-tap buttons require `zeroTapTermsAccepted: true` to accept Meta's zero-tap terms.                                            |
