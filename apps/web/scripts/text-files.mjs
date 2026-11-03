// Text files for crawlers and AI agents: llms.txt, Markdown pages, template JSON, sitemap.xml
// and robots.txt. The build writes them to dist; the dev server answers with the same content.
import { markdownSite } from "./markdown.mjs";

/** Every text file by its URL path, built from the server bundle (catalog, routes). */
export function textFiles(server) {
  const { SITE, CATALOG, TEMPLATE_BASE } = server;
  const markdown = markdownSite(server);
  const paths = server.allPaths();
  const files = { ...markdown.files };

  // Raw JSON next to each template page, for agents and scripts.
  for (const entry of CATALOG)
    files[`${server.templatePath(entry.slug)}.json`] = JSON.stringify(
      entry.template,
      null,
      2,
    );

  const today = new Date().toISOString().slice(0, 10);
  const priority = (path) =>
    path === "/"
      ? "1.0"
      : path === "/playground" || path === TEMPLATE_BASE
        ? "0.9"
        : "0.7";
  files["/sitemap.xml"] = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map(
    (path) =>
      `  <url><loc>${SITE}${path === "/" ? "/" : path}</loc><lastmod>${today}</lastmod><priority>${priority(path)}</priority></url>`,
  )
  .join("\n")}
</urlset>
`;

  // AI crawlers are named explicitly: some only crawl when their agent is allowed by name.
  // Content-Signal states what the content may be used for (contentsignals.org).
  files["/robots.txt"] = `User-agent: *
Allow: /
Content-Signal: ai-train=yes, search=yes, ai-input=yes

${[
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
]
  .map((agent) => `User-agent: ${agent}\nAllow: /`)
  .join("\n\n")}

Sitemap: ${SITE}/sitemap.xml
`;

  files["/llms.txt"] = markdown.llms;
  files["/llms-full.txt"] = markdown.full;
  return files;
}

/** Content type for a text file path. */
export const contentType = (path) =>
  path.endsWith(".md")
    ? "text/markdown; charset=utf-8"
    : path.endsWith(".json")
      ? "application/json; charset=utf-8"
      : path.endsWith(".xml")
        ? "application/xml; charset=utf-8"
        : "text/plain; charset=utf-8";
