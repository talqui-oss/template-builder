/**
 * A WhatsApp message template. Field names follow Meta's template API in camelCase.
 * Authentication templates have their own shape because Meta writes their body text.
 */
export type Template = StandardTemplate | AuthenticationTemplate;

export type Category = "MARKETING" | "UTILITY" | "AUTHENTICATION";

/** Example values for the `{{name}}` placeholders used anywhere in the template. */
export type Variables = Record<string, Variable>;

export type Variable = {
  /** Sample value shown in the preview and sent to the provider for review. */
  example: string;
};

type TemplateBase = {
  /** Optional JSON Schema URL, for editor autocomplete in `.json` files. */
  $schema?: string;
  /** Lowercase letters, numbers and underscores, e.g. `order_shipped`. */
  name: string;
  /** Locale code, e.g. `en_US` or `pt_BR`. */
  language: string;
  /** Seconds the provider keeps trying to deliver the message. */
  messageSendTtlSeconds?: number;
};

export type StandardTemplate = TemplateBase & {
  category: "MARKETING" | "UTILITY";
  header?: Header;
  /** Text with optional `{{name}}` placeholders and WhatsApp formatting (`*bold*`, `_italic_`). */
  body: { text: string };
  footer?: { text: string };
  buttons?: Button[];
  /** Turns the template into a limited-time offer. */
  limitedTimeOffer?: LimitedTimeOffer;
  /** Turns the template into a carousel of 2 to 10 cards. */
  carousel?: { cards: CarouselCard[] };
  /** Asks the user for permission to call them. */
  callPermissionRequest?: true;
  /** Renders the template as an order details message. */
  displayFormat?: "ORDER_DETAILS";
  variables?: Variables;
};

export type AuthenticationTemplate = TemplateBase & {
  category: "AUTHENTICATION";
  body?: {
    /** Appends "For your security, do not share this code." */
    addSecurityRecommendation?: boolean;
  };
  footer?: {
    /** Appends "This code expires in N minutes." (1 to 90). */
    codeExpirationMinutes?: number;
  };
  button: OtpButton;
};

export type Header = TextHeader | MediaHeader | LocationHeader | ProductHeader;

export type TextHeader = {
  type: "TEXT";
  /** Up to one `{{name}}` placeholder. */
  text: string;
};

export type MediaHeader = {
  type: "IMAGE" | "VIDEO" | "DOCUMENT" | "GIF";
  /** Public URL of a sample file, used for the preview and for review. */
  url: string;
  filename?: string;
};

export type LocationHeader = { type: "LOCATION" };

export type ProductHeader = { type: "PRODUCT" };

export type Button =
  | QuickReplyButton
  | UrlButton
  | PhoneNumberButton
  | VoiceCallButton
  | CopyCodeButton
  | FlowButton
  | CatalogButton
  | MultiProductButton
  | SingleProductButton
  | OrderDetailsButton
  | PaymentRequestButton;

export type QuickReplyButton = { type: "QUICK_REPLY"; text: string };

export type UrlButton = {
  type: "URL";
  text: string;
  /** A `{{name}}` placeholder at the end makes the URL dynamic. */
  url: string;
};

export type PhoneNumberButton = {
  type: "PHONE_NUMBER";
  text: string;
  /** International format, e.g. `+15550100`. */
  phoneNumber: string;
};

export type VoiceCallButton = {
  type: "VOICE_CALL";
  text: string;
  ttlMinutes?: number;
};

export type CopyCodeButton = {
  type: "COPY_CODE";
  /** Sample coupon code, up to 20 characters. */
  example: string;
};

export type FlowButton = {
  type: "FLOW";
  text: string;
  flowId?: string;
  flowName?: string;
  flowJson?: string;
  flowAction?: "navigate" | "data_exchange";
  navigateScreen?: string;
};

export type CatalogButton = { type: "CATALOG"; text: string };

export type MultiProductButton = { type: "MPM"; text: string };

export type SingleProductButton = { type: "SPM"; text: string };

export type OrderDetailsButton = { type: "ORDER_DETAILS"; text: string };

export type PaymentRequestButton = {
  type: "PAYMENT_REQUEST";
  text?: string;
  paymentSetting:
    "pix_dynamic_code" | "boleto" | "payment_link" | "offsite_card_pay";
};

export type OtpButton = {
  type: "OTP";
  otpType: "COPY_CODE" | "ONE_TAP" | "ZERO_TAP";
  /** Button label. Meta localizes it when omitted. */
  text?: string;
  /** One-tap and zero-tap only: label of the autofill button. */
  autofillText?: string;
  /** One-tap and zero-tap only: up to 5 Android apps. */
  supportedApps?: SupportedApp[];
  /** Zero-tap only: must be `true` to accept Meta's zero-tap terms. */
  zeroTapTermsAccepted?: boolean;
};

export type SupportedApp = {
  packageName: string;
  /** 11-character app signature hash. */
  signatureHash: string;
};

export type LimitedTimeOffer = {
  /** Offer headline, e.g. "Expiring offer!". */
  text: string;
  /** Shows a countdown; the expiration time is set when sending. */
  hasExpiration?: boolean;
};

export type CarouselCard = {
  header: { type: "IMAGE" | "VIDEO"; url: string } | ProductHeader;
  body?: { text: string };
  buttons?: Array<
    QuickReplyButton | UrlButton | PhoneNumberButton | SingleProductButton
  >;
};
