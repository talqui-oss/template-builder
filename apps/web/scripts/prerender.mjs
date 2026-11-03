// Runs after `vite build` and the SSR build: writes one static HTML file per page, plus the
// files crawlers and AI agents look for (sitemap.xml, robots.txt, llms.txt, Markdown pages,
// Open Graph images).
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { textFiles } from "./text-files.mjs";
import { ogImage } from "./og.mjs";

const app = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(app, "dist");
const server = await import(join(app, "dist-ssr/entry-server.js"));
const {
  SITE,
  CATALOG,
  CATEGORIES,
  INDUSTRIES,
  TEMPLATE_BASE,
  entryBySlug,
  facetLabel,
} = server;

const write = (path, content) => {
  const target = join(dist, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
};

const shell = readFileSync(join(dist, "index.html"), "utf8");
const escape = (text) =>
  String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const files = textFiles(server);
const markdownCount = Object.keys(files).filter((path) =>
  path.endsWith(".md"),
).length;

/** The Markdown twin of a page: its own `.md` when there is one, the llms.txt index otherwise. */
const markdownFor = (path) =>
  files[`${path}.md`] ? `${path}.md` : "/llms.txt";

const ogPath = (path) => `/og${path === "/" ? "/index" : path}.png`;

/** The card drawn for a page: the template bubble on template pages, the title split elsewhere. */
function ogCard(path, head) {
  const slug = path.startsWith(`${TEMPLATE_BASE}/`)
    ? path.slice(TEMPLATE_BASE.length + 1)
    : "";
  const entry = slug && entryBySlug(slug);
  if (entry) {
    const { template } = entry;
    const category = CATEGORIES.find(
      (item) => item.category === template.category,
    ).label;
    return {
      eyebrow: `${facetLabel(INDUSTRIES, entry.industry)} · ${category}`,
      title: `${entry.title} WhatsApp template`,
      accent: "free example",
      badge:
        entry.approvalRate !== undefined
          ? `${entry.approvalRate}% approval rate`
          : undefined,
      bubble:
        template.category === "AUTHENTICATION"
          ? {
              body: "123456 is your verification code. For your security, do not share this code.",
            }
          : {
              header:
                template.header?.type === "TEXT"
                  ? template.header.text
                  : undefined,
              body: template.body.text,
              footer: template.footer?.text,
            },
    };
  }
  const [title, accent = "free and open source"] = head.title.split(": ");
  return { eyebrow: "template-builder", title, accent };
}

function headTags(head, path) {
  const url = SITE + (head.path === "/" ? "/" : head.path);
  const image = SITE + ogPath(path);
  return [
    `<title>${escape(head.title)}</title>`,
    `<meta name="description" content="${escape(head.description)}" />`,
    `<meta name="theme-color" content="#000000" />`,
    head.noindex
      ? `<meta name="robots" content="noindex" />`
      : `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="template-builder" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:title" content="${escape(head.title)}" />`,
    `<meta property="og:description" content="${escape(head.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<link rel="alternate" type="text/markdown" href="${SITE}${markdownFor(path)}" />`,
    // `<` is escaped so a value can never close the script tag.
    ...(head.jsonLd ?? []).map(
      (data) =>
        `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`,
    ),
  ].join("\n    ");
}

async function writePage(path, file) {
  const { head, html } = server.render(path);
  write(
    file ?? (path === "/" ? "index.html" : `${path.slice(1)}/index.html`),
    shell
      .replace("<!--head-->", headTags(head, path))
      .replace("<!--app-->", html),
  );
  if (!head.noindex) write(ogPath(path), await ogImage(ogCard(path, head)));
}

const paths = server.allPaths();
for (const path of paths) await writePage(path);
await writePage("/404", "404.html");

copyFileSync(
  join(app, "node_modules/@talqui-oss/template-builder/dist/schema.json"),
  join(dist, "schema.json"),
);

for (const [path, content] of Object.entries(files)) write(path, content);

rmSync(join(app, "dist-ssr"), { recursive: true, force: true });
console.log(
  `prerendered ${paths.length} pages, ${markdownCount} markdown files, ${CATALOG.length} catalog templates`,
);
