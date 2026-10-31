import type { Adapter, HttpRequest } from "./adapters/types";
import type { Template } from "./schema/types";
import type { Issue, ValidateOptions } from "./validate";
import { validate } from "./validate";

/** Thrown by `toRequests` when the template has validation errors. */
export class TemplateValidationError extends Error {
  constructor(readonly issues: Issue[]) {
    super(
      `Template is invalid: ${issues.map((i) => `${i.code} at ${i.path || "template"}`).join(", ")}`,
    );
    this.name = "TemplateValidationError";
  }
}

/** Validates the template and returns the HTTP requests that create it on the adapter's provider. */
export function toRequests(
  template: Template,
  adapter: Adapter,
  options?: ValidateOptions,
): HttpRequest[] {
  const { issues } = validate(template, options);
  const errors = issues.filter((issue) => issue.severity === "error");
  if (errors.length > 0) throw new TemplateValidationError(errors);
  return adapter.toRequests(template);
}

// Double quotes keep `$VAR` placeholders expandable by the shell.
const doubleQuoted = (value: string) => `"${value.replace(/["\\`]/g, "\\$&")}"`;
const singleQuoted = (value: string) => `'${value.replace(/'/g, "'\\''")}'`;

/** Prints requests as `curl` commands, in order, ready to paste in a shell. */
export function toCurl(requests: HttpRequest | HttpRequest[]): string {
  return [requests]
    .flat()
    .map((request) =>
      [
        ...(request.comments ?? []).map((line) => `# ${line}`),
        [
          `curl -X ${request.method} ${doubleQuoted(request.url)}`,
          ...Object.entries(request.headers).map(
            ([name, value]) => `  -H ${doubleQuoted(`${name}: ${value}`)}`,
          ),
          `  -d ${singleQuoted(JSON.stringify(request.body, null, 2))}`,
        ].join(" \\\n"),
      ].join("\n"),
    )
    .join("\n\n");
}
