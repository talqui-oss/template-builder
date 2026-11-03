/** Every text file by its URL path, built from the server bundle. */
export function textFiles(server: unknown): Record<string, string>;
/** Content type for a text file path. */
export function contentType(path: string): string;
