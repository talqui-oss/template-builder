import type { Template } from "../schema/types";
import { textFields } from "../variables";
import { validateAuthentication } from "./authentication";
import { codes, type Code } from "./codes";
import { validateStandard } from "./standard";
import { placeholders } from "./text";
import type {
  Context,
  Issue,
  ValidateOptions,
  ValidationResult,
} from "./types";

const SHORTENERS = [
  "bit.ly",
  "goo.gl",
  "tinyurl.com",
  "ow.ly",
  "short.url",
  "shorte.st",
  "short.gs",
];
const TTL_RANGE = {
  AUTHENTICATION: [30, 900],
  UTILITY: [30, 43200],
  MARKETING: [43200, 2592000],
} as const;
const CATEGORIES = ["MARKETING", "UTILITY", "AUTHENTICATION"];

/** Checks a template against the rules WhatsApp applies before review. */
export function validate(
  template: Template,
  options: ValidateOptions = {},
): ValidationResult {
  const issues: Issue[] = [];
  const disabled = new Set(options.disable);
  const ctx: Context = {
    report: (code, path, message) => {
      if (!disabled.has(code))
        issues.push({ code, path, message, severity: codes[code] });
    },
    options: {
      shortenerDomains: options.shortenerDomains ?? SHORTENERS,
      limitedTimeOfferTextLimit: options.limitedTimeOfferTextLimit ?? 16,
      carouselCardBodyLimit: options.carouselCardBodyLimit ?? 160,
    },
  };

  const shapeError = checkShape(template);
  if (shapeError) {
    ctx.report("SCHEMA_INVALID", shapeError.path, shapeError.message);
    return { valid: false, issues };
  }

  const { report } = ctx;
  if (!/^[a-z0-9_]+$/.test(template.name))
    report(
      "NAME_INVALID",
      "name",
      "Use only lowercase letters, numbers and underscores, e.g. order_shipped.",
    );
  if (template.name.length > 512)
    report(
      "NAME_TOO_LONG",
      "name",
      "The name can have at most 512 characters.",
    );
  if (!/^[a-z]{2,3}(_[A-Z]{2})?$/.test(template.language))
    report(
      "LANGUAGE_INVALID",
      "language",
      'Use a locale code such as "en_US", "pt_BR" or "es".',
    );

  const ttl = template.messageSendTtlSeconds;
  if (ttl !== undefined) {
    const [min, max] = TTL_RANGE[template.category];
    if (ttl < min || ttl > max)
      report(
        "TTL_OUT_OF_RANGE",
        "messageSendTtlSeconds",
        `For ${template.category} templates the TTL must be between ${min} and ${max} seconds.`,
      );
  }

  if (template.category === "AUTHENTICATION")
    validateAuthentication(template, ctx);
  else {
    validateVariables(template, ctx);
    validateStandard(template, ctx);
  }

  return { valid: !issues.some((issue) => issue.severity === "error"), issues };
}

function validateVariables(template: Template, { report }: Context) {
  if (template.category === "AUTHENTICATION") return;
  const declared = template.variables ?? {};
  const used = new Set<string>();

  for (const field of textFields(template)) {
    const seen = new Set<string>();
    for (const p of placeholders(field.text)) {
      if (!p.valid || p.name.length > 32) {
        report(
          "PLACEHOLDER_INVALID",
          field.path,
          `"${p.raw}" is not a valid variable. Use a name with lowercase letters, numbers and underscores (up to 32), e.g. {{first_name}}.`,
        );
        continue;
      }
      if (seen.has(p.name))
        report(
          "PLACEHOLDER_DUPLICATED",
          field.path,
          `"${p.raw}" appears twice in the same text. Use a second variable instead.`,
        );
      seen.add(p.name);
      used.add(p.name);
      if (!(p.name in declared))
        report(
          "VARIABLE_NOT_DECLARED",
          `variables.${p.name}`,
          `Add an example for "${p.name}" in variables.`,
        );
    }
  }

  for (const [name, variable] of Object.entries(declared)) {
    if (!variable.example?.trim())
      report(
        "VARIABLE_MISSING_EXAMPLE",
        `variables.${name}.example`,
        `Add an example value for "${name}".`,
      );
    if (!used.has(name))
      report(
        "VARIABLE_UNUSED",
        `variables.${name}`,
        `"${name}" is declared but not used in the template.`,
      );
  }
}

function checkShape(
  template: unknown,
): { path: string; message: string } | undefined {
  const t = template as Record<string, unknown> | null;
  if (typeof t !== "object" || t === null)
    return { path: "", message: "A template must be an object." };
  for (const field of ["name", "language"]) {
    if (typeof t[field] !== "string")
      return { path: field, message: `"${field}" must be a string.` };
  }
  if (!CATEGORIES.includes(t.category as string))
    return {
      path: "category",
      message: "category must be MARKETING, UTILITY or AUTHENTICATION.",
    };
  if (t.category === "AUTHENTICATION") {
    const button = t.button as Record<string, unknown> | undefined;
    if (button?.type !== "OTP")
      return {
        path: "button",
        message:
          'Authentication templates need one button: { type: "OTP", otpType }.',
      };
    return undefined;
  }
  if (typeof (t.body as Record<string, unknown> | undefined)?.text !== "string")
    return { path: "body.text", message: "body.text must be a string." };
  const buttons = t.buttons ?? [];
  if (
    !Array.isArray(buttons) ||
    buttons.some((b) => typeof b?.type !== "string")
  )
    return {
      path: "buttons",
      message: "buttons must be an array of objects with a type.",
    };
  return undefined;
}

export { codes, type Code };
export type {
  Issue,
  Severity,
  ValidateOptions,
  ValidationResult,
} from "./types";
