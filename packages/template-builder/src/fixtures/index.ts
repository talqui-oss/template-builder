import type { Template } from "../schema/types";

export const orderShipped = {
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

export const appointmentReminder = {
  name: "appointment_reminder",
  language: "en_US",
  category: "UTILITY",
  header: {
    type: "DOCUMENT",
    url: "https://acme.com/samples/booking.pdf",
    filename: "booking.pdf",
  },
  body: {
    text: "Hi {{name}}, see you on {{date}} at our downtown clinic. Need to change it?",
  },
  buttons: [
    { type: "QUICK_REPLY", text: "Confirm" },
    { type: "QUICK_REPLY", text: "Reschedule" },
    { type: "PHONE_NUMBER", text: "Call us", phoneNumber: "+15550100" },
  ],
  variables: { name: { example: "Maria" }, date: { example: "May 12" } },
} satisfies Template;

export const summerCoupon = {
  name: "summer_coupon",
  language: "en_US",
  category: "MARKETING",
  header: { type: "IMAGE", url: "https://acme.com/samples/summer.jpg" },
  body: {
    text: "Summer is here, {{name}}! Take 20% off everything in store this week.",
  },
  footer: { text: "Reply STOP to opt out" },
  buttons: [
    { type: "COPY_CODE", example: "SUMMER20" },
    { type: "URL", text: "Shop now", url: "https://acme.com/summer" },
  ],
  variables: { name: { example: "Maria" } },
} satisfies Template;

export const loginCode = {
  name: "login_code",
  language: "en_US",
  category: "AUTHENTICATION",
  body: { addSecurityRecommendation: true },
  footer: { codeExpirationMinutes: 10 },
  button: { type: "OTP", otpType: "COPY_CODE", text: "Copy code" },
} satisfies Template;

export const loginCodeZeroTap = {
  name: "login_code_zero_tap",
  language: "en_US",
  category: "AUTHENTICATION",
  body: { addSecurityRecommendation: true },
  button: {
    type: "OTP",
    otpType: "ZERO_TAP",
    text: "Copy code",
    autofillText: "Autofill",
    supportedApps: [
      { packageName: "com.acme.app", signatureHash: "K8a/AINcGX7" },
    ],
    zeroTapTermsAccepted: true,
  },
  messageSendTtlSeconds: 120,
} satisfies Template;

export const flashSale = {
  name: "flash_sale",
  language: "en_US",
  category: "MARKETING",
  header: { type: "IMAGE", url: "https://acme.com/samples/sneakers.jpg" },
  limitedTimeOffer: { text: "Flash sale!", hasExpiration: true },
  body: { text: "Hi {{name}}, our new sneakers are 30% off until midnight." },
  buttons: [
    { type: "COPY_CODE", example: "FLASH30" },
    { type: "URL", text: "Buy now", url: "https://acme.com/sale/{{code}}" },
  ],
  variables: { name: { example: "Maria" }, code: { example: "FLASH30" } },
} satisfies Template;

export const newArrivals = {
  name: "new_arrivals",
  language: "en_US",
  category: "MARKETING",
  body: { text: "Hi {{name}}, fresh picks for this season are in." },
  carousel: {
    cards: [
      {
        header: { type: "IMAGE", url: "https://acme.com/samples/jacket.jpg" },
        body: { text: "Rain jacket, now in green." },
        buttons: [
          { type: "URL", text: "See jacket", url: "https://acme.com/p/jacket" },
        ],
      },
      {
        header: { type: "IMAGE", url: "https://acme.com/samples/boots.jpg" },
        body: { text: "Hiking boots, ready for the trail." },
        buttons: [
          { type: "URL", text: "See boots", url: "https://acme.com/p/boots" },
        ],
      },
    ],
  },
  variables: { name: { example: "Maria" } },
} satisfies Template;

export const callbackRequest = {
  name: "callback_request",
  language: "en_US",
  category: "UTILITY",
  body: {
    text: "Hi {{name}}, can our support team call you about ticket {{ticket}}?",
  },
  callPermissionRequest: true,
  variables: { name: { example: "Maria" }, ticket: { example: "8812" } },
} satisfies Template;

export const orderDetails = {
  name: "order_payment",
  language: "pt_BR",
  category: "UTILITY",
  displayFormat: "ORDER_DETAILS",
  body: {
    text: "Olá {{name}}, seu pedido {{order}} está pronto para pagamento.",
  },
  buttons: [{ type: "ORDER_DETAILS", text: "Ver pedido" }],
  variables: { name: { example: "Maria" }, order: { example: "4512" } },
} satisfies Template;
