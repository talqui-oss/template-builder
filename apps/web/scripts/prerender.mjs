// Runs after `vite build` and the SSR build: writes one static HTML file per page, plus the
// files crawlers and AI agents look for (sitemap.xml, robots.txt, llms.txt, llms-full.txt).
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const app = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(app, "dist");
const server = await import(join(app, "dist-ssr/entry-server.js"));
const { SITE, CATALOG, INDUSTRIES, USE_CASES, CATEGORIES, templateText } =
  server;

const shell = readFileSync(join(dist, "index.html"), "utf8");
const escape = (text) =>
  String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function headTags(head) {
  const url = SITE + (head.path === "/" ? "/" : head.path);
  return [
    `<title>${escape(head.title)}</title>`,
    `<meta name="description" content="${escape(head.description)}" />`,
    head.noindex
      ? `<meta name="robots" content="noindex" />`
      : `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="template-builder" />`,
    `<meta property="og:title" content="${escape(head.title)}" />`,
    `<meta property="og:description" content="${escape(head.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<link rel="alternate" type="text/plain" title="llms.txt" href="${SITE}/llms.txt" />`,
    // `<` is escaped so a value can never close the script tag.
    ...(head.jsonLd ?? []).map(
      (data) =>
        `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`,
    ),
  ].join("\n    ");
}

function writePage(path, file) {
  const { head, html } = server.render(path);
  const page = shell
    .replace("<!--head-->", headTags(head))
    .replace("<!--app-->", html);
  const target = join(
    dist,
    file ?? (path === "/" ? "index.html" : `${path.slice(1)}/index.html`),
  );
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, page);
}

const paths = server.allPaths();
for (const path of paths) writePage(path);
writePage("/404", "404.html");

// Raw JSON next to each template page, for agents and scripts.
for (const entry of CATALOG)
  writeFileSync(
    join(dist, "catalog", `${entry.slug}.json`),
    JSON.stringify(entry.template, null, 2),
  );

copyFileSync(
  join(app, "node_modules/@talqui-oss/template-builder/dist/schema.json"),
  join(dist, "schema.json"),
);

const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map((path) => {
    const priority =
      path === "/"
        ? "1.0"
        : path === "/playground" || path === "/catalog"
          ? "0.9"
          : "0.7";
    return `  <url><loc>${SITE}${path === "/" ? "/" : path}</loc><lastmod>${today}</lastmod><priority>${priority}</priority></url>`;
  })
  .join("\n")}
</urlset>
`,
);

// AI crawlers are named explicitly: some only crawl when their agent is allowed by name.
writeFileSync(
  join(dist, "robots.txt"),
  `${[
    "*",
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-User",
    "PerplexityBot",
    "Google-Extended",
    "Applebot-Extended",
  ]
    .map((agent) => `User-agent: ${agent}\nAllow: /`)
    .join("\n\n")}

Sitemap: ${SITE}/sitemap.xml
`,
);

const label = (facets, slug) =>
  facets.find((facet) => facet.slug === slug)?.label ?? slug;
const category = (template) =>
  CATEGORIES.find((item) => item.category === template.category).label;

const intro = `# template-builder

> Free, open-source SDK to preview, validate and create WhatsApp message templates. One JSON schema; a pixel-true iPhone preview for React and Vue; the review rules Meta applies, as typed issue codes; adapters that build the create request for the Meta Cloud API, Twilio and Talqui. MIT licensed, maintained by Talqui.

Install: \`npm i @talqui-oss/template-builder\` (preview components: \`@talqui-oss/template-builder-react\` or \`-vue\`).
`;

writeFileSync(
  join(dist, "llms.txt"),
  `${intro}
## Docs

- [Agent quickstart](${SITE}/agents): install, validate, build the create request
- [JSON Schema](${SITE}/schema.json): every field a template accepts
- [Playground](${SITE}/playground): free online WhatsApp template builder and preview
- [Source and README](https://github.com/talqui-oss/template-builder)
- [Full text for LLMs](${SITE}/llms-full.txt): this index plus every catalog template

## Catalog

${CATALOG.map((entry) => `- [${entry.title}](${SITE}/catalog/${entry.slug}): ${entry.description} JSON: ${SITE}/catalog/${entry.slug}.json`).join("\n")}
`,
);

writeFileSync(
  join(dist, "llms-full.txt"),
  `${intro}
## Usage

\`\`\`ts
import { validate, toRequests, toCurl } from "@talqui-oss/template-builder";
import { meta } from "@talqui-oss/template-builder/adapters/meta";

const { valid, issues } = validate(template); // errors are rejections at review
const requests = toRequests(template, meta({ wabaId: "123" })); // throws on invalid templates
console.log(toCurl(requests));
\`\`\`

\`\`\`tsx
import { TemplatePreview } from "@talqui-oss/template-builder-react";
import "@talqui-oss/template-builder/styles.css";

<TemplatePreview template={template} time="09:41" />
\`\`\`

## Catalog

${CATALOG.map(
  (entry) => `### ${entry.title}

URL: ${SITE}/catalog/${entry.slug}
Category: ${category(entry.template)} · Industry: ${label(INDUSTRIES, entry.industry)} · Use case: ${label(USE_CASES, entry.useCase)}
${entry.description}
${entry.notes ? `Tip: ${entry.notes}\n` : ""}
Text:
${templateText(entry.template)}

\`\`\`json
${JSON.stringify(entry.template, null, 2)}
\`\`\`
`,
).join("\n")}`,
);

rmSync(join(app, "dist-ssr"), { recursive: true, force: true });
console.log(
  `prerendered ${paths.length} pages, ${CATALOG.length} catalog templates`,
);
