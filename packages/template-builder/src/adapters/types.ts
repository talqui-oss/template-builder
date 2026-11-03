import type { Template } from "../schema/types";

export type HttpRequest = {
  method: "POST";
  url: string;
  headers: Record<string, string>;
  body: unknown;
  /** Printed as `#` comments above the request by `toCurl`. */
  comments?: string[];
};

export type Adapter = {
  name: string;
  toRequests(template: Template): HttpRequest[];
};

type AdapterDefinition<O> = {
  name: string;
  toRequests(template: Template, options: O): HttpRequest[];
};

/** Turns an adapter definition into a factory: `meta({ wabaId })` returns an `Adapter`. */
export function defineAdapter<O extends object>(
  definition: AdapterDefinition<O>,
) {
  return (...[options]: Partial<O> extends O ? [O?] : [O]): Adapter => ({
    name: definition.name,
    toRequests: (template) =>
      definition.toRequests(template, options ?? ({} as O)),
  });
}

/** Thrown when a template uses a field the provider cannot create. */
export class UnsupportedByProviderError extends Error {
  readonly code = "UNSUPPORTED_BY_PROVIDER";

  constructor(
    readonly provider: string,
    readonly path: string,
    message: string,
  ) {
    super(`${provider}: ${message} (${path})`);
    this.name = "UnsupportedByProviderError";
  }
}

export function unsupported(
  provider: string,
  path: string,
  what: string,
): never {
  throw new UnsupportedByProviderError(
    provider,
    path,
    `${what} is not supported by this provider.`,
  );
}
