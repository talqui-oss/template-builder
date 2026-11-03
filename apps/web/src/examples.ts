import type { Template } from "@talqui-oss/template-builder";

export type Example = {
  slug: string;
  title: string;
  description: string;
  template: Template;
};

/** Ready-made templates shown on the landing page and openable in the playground. */
export const EXAMPLES: Example[] = [
  {
    slug: "order-shipped",
    title: "Order shipped",
    description:
      "Tell customers their order is on the way, with a tracking link.",
    template: {
      name: "order_shipped",
      language: "en_US",
      category: "UTILITY",
      header: { type: "TEXT", text: "Order {{order}} shipped" },
      body: {
        text: "Hi {{name}}, your order *{{order}}* left our warehouse today and arrives within _3 business days_.",
      },
      footer: { text: "Acme Store" },
      buttons: [
        {
          type: "URL",
          text: "Track order",
          url: "https://acme.com/track/{{order}}",
        },
      ],
      variables: { name: { example: "Maria" }, order: { example: "4512" } },
    },
  },
  {
    slug: "verification-code",
    title: "Verification code",
    description:
      "A one-time password with the copy button WhatsApp draws itself.",
    template: {
      name: "verification_code",
      language: "en_US",
      category: "AUTHENTICATION",
      body: { addSecurityRecommendation: true },
      footer: { codeExpirationMinutes: 10 },
      button: { type: "OTP", otpType: "COPY_CODE" },
    },
  },
  {
    slug: "abandoned-cart",
    title: "Abandoned cart",
    description: "Bring shoppers back to the cart they left, with a coupon.",
    template: {
      name: "abandoned_cart",
      language: "en_US",
      category: "MARKETING",
      header: { type: "TEXT", text: "You left something behind" },
      body: {
        text: "Hi {{name}}, the *{{product}}* is still in your cart. Finish your order today and take 10% off.",
      },
      footer: { text: "Reply STOP to opt out" },
      buttons: [
        { type: "COPY_CODE", example: "CART10" },
        { type: "URL", text: "Back to cart", url: "https://acme.com/cart" },
      ],
      variables: {
        name: { example: "Maria" },
        product: { example: "Linen shirt" },
      },
    },
  },
  {
    slug: "appointment-reminder",
    title: "Appointment reminder",
    description: "Cut no-shows with a reminder people can answer in one tap.",
    template: {
      name: "appointment_reminder",
      language: "en_US",
      category: "UTILITY",
      header: { type: "TEXT", text: "See you tomorrow" },
      body: {
        text: "Hi {{name}}, this is a reminder of your appointment on *{{date}}* at *{{time}}*.\n\nCan you make it?",
      },
      buttons: [
        { type: "QUICK_REPLY", text: "Confirm" },
        { type: "QUICK_REPLY", text: "Reschedule" },
      ],
      variables: {
        name: { example: "Maria" },
        date: { example: "May 12" },
        time: { example: "10:30" },
      },
    },
  },
  {
    slug: "payment-reminder",
    title: "Payment reminder",
    description: "A polite nudge before an invoice is due, with a way to talk.",
    template: {
      name: "payment_reminder",
      language: "en_US",
      category: "UTILITY",
      body: {
        text: "Hi {{name}}, invoice *{{invoice}}* of {{amount}} is due on {{date}}. You can pay with the link below.",
      },
      footer: { text: "Acme Billing" },
      buttons: [
        {
          type: "URL",
          text: "Pay invoice",
          url: "https://acme.com/pay/{{invoice}}",
        },
        { type: "PHONE_NUMBER", text: "Call us", phoneNumber: "+15550100" },
      ],
      variables: {
        name: { example: "Maria" },
        invoice: { example: "INV-2041" },
        amount: { example: "$120.00" },
        date: { example: "May 15" },
      },
    },
  },
  {
    slug: "feedback-request",
    title: "Feedback request",
    description: "Ask how it went right after the conversation closes.",
    template: {
      name: "feedback_request",
      language: "en_US",
      category: "MARKETING",
      body: {
        text: "Thanks for talking to us, {{name}}! How would you rate the help you got today?",
      },
      buttons: [
        { type: "QUICK_REPLY", text: "Great" },
        { type: "QUICK_REPLY", text: "Okay" },
        { type: "QUICK_REPLY", text: "Not good" },
      ],
      variables: { name: { example: "Maria" } },
    },
  },
];
