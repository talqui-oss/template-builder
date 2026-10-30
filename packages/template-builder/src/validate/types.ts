import type { Code } from "./codes";

export type Severity = "error" | "warning";

export type Issue = {
  code: Code;
  /** Dot path to the field, e.g. `buttons.1.text`. Empty for the whole template. */
  path: string;
  message: string;
  severity: Severity;
};

export type ValidationResult = {
  /** `true` when there are no errors. Warnings do not make a template invalid. */
  valid: boolean;
  issues: Issue[];
};

export type ValidateOptions = {
  /** Rules to skip, e.g. when a provider has exempted your account from one of them. */
  disable?: Code[];
  /** Domains rejected in URL buttons. */
  shortenerDomains?: string[];
  /** Maximum characters for the limited-time offer text. */
  limitedTimeOfferTextLimit?: number;
  /** Maximum characters for a carousel card body. */
  carouselCardBodyLimit?: number;
};

export type Report = (code: Code, path: string, message: string) => void;

export type Context = {
  report: Report;
  options: Required<Omit<ValidateOptions, "disable">>;
};
