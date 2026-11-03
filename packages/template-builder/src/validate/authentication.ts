import type { AuthenticationTemplate } from "../schema/types";
import type { Context } from "./types";
import { length } from "./text";

const ANDROID_PACKAGE = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/;
const SIGNATURE_HASH = /^[a-zA-Z0-9/+=]{11}$/;
const URL_LIKE = /(https?:\/\/|www\.)\S+|\b[\w-]+\.[a-z]{2,6}\b/i;

export function validateAuthentication(
  template: AuthenticationTemplate,
  { report }: Context,
) {
  const minutes = template.footer?.codeExpirationMinutes;
  if (
    minutes !== undefined &&
    (!Number.isInteger(minutes) || minutes < 1 || minutes > 90)
  ) {
    report(
      "OTP_CODE_EXPIRATION_RANGE",
      "footer.codeExpirationMinutes",
      "The code expiration must be a whole number of minutes from 1 to 90.",
    );
  }

  const { button } = template;
  for (const field of ["text", "autofillText"] as const) {
    const text = button[field];
    if (text === undefined) continue;
    if (length(text) > 25)
      report(
        "OTP_BUTTON_TEXT_TOO_LONG",
        `button.${field}`,
        "OTP button text can have at most 25 characters.",
      );
    if (URL_LIKE.test(text))
      report(
        "OTP_BUTTON_TEXT_URL",
        `button.${field}`,
        "OTP button text cannot contain a link.",
      );
  }

  if (button.otpType === "COPY_CODE") return;

  const apps = button.supportedApps ?? [];
  if (apps.length === 0)
    report(
      "OTP_SUPPORTED_APPS_REQUIRED",
      "button.supportedApps",
      `${button.otpType} buttons need at least one Android app (package name and signature hash).`,
    );
  if (apps.length > 5)
    report(
      "OTP_SUPPORTED_APPS_TOO_MANY",
      "button.supportedApps",
      "An OTP button can list at most 5 apps.",
    );

  const seen = new Set<string>();
  apps.forEach((app, index) => {
    const at = `button.supportedApps.${index}`;
    if (
      !ANDROID_PACKAGE.test(app.packageName) ||
      app.packageName.length > 224
    ) {
      report(
        "OTP_PACKAGE_NAME_INVALID",
        `${at}.packageName`,
        "Use the Android package name, e.g. com.example.app (at most 224 characters).",
      );
    }
    if (!SIGNATURE_HASH.test(app.signatureHash)) {
      report(
        "OTP_SIGNATURE_HASH_INVALID",
        `${at}.signatureHash`,
        "The app signature hash has exactly 11 characters (letters, numbers, +, / or =).",
      );
    }
    const key = `${app.packageName}:${app.signatureHash}`;
    if (seen.has(key))
      report("OTP_SUPPORTED_APP_DUPLICATED", at, "This app is listed twice.");
    seen.add(key);
  });

  if (button.otpType === "ZERO_TAP" && button.zeroTapTermsAccepted !== true) {
    report(
      "OTP_ZERO_TAP_TERMS_NOT_ACCEPTED",
      "button.zeroTapTermsAccepted",
      "Zero-tap buttons require `zeroTapTermsAccepted: true` to accept Meta's zero-tap terms.",
    );
  }
}
