// Markdown versions of the pages, for AI agents: every catalog page has one at `<path>.md`.
import { toCurl, toRequests } from "@talqui-oss/template-builder";
import { meta } from "@talqui-oss/template-builder/adapters/meta";

const GITHUB = "https://github.com/talqui-oss/template-builder";
const SKILL = `${GITHUB}/blob/main/skills/template-builder/SKILL.md`;

/** Builds the Markdown files from the catalog module exported by the server bundle. */
export function markdownSite(catalog) {
  const {
    SITE,
    CATALOG,
    INDUSTRIES,
    USE_CASES,
    CATEGORIES,
    templateText,
    templatePath,
    templateLink,
    TEMPLATE_BASE,
  } = catalog;
  const label = (facets, slug) =>
    facets.find((facet) => facet.slug === slug)?.label ?? slug;
  const category = (template) =>
    CATEGORIES.find((item) => item.category === template.category);
  const url = (slug) => `${SITE}${templatePath(slug)}`;

  const line = (entry) =>
    `- [${entry.title}](${url(entry.slug)}.md): ${entry.description}`;

  function template(entry) {
    const { template } = entry;
    const variables =
      template.category === "AUTHENTICATION"
        ? []
        : Object.entries(template.variables ?? {});
    return `# ${entry.title} WhatsApp template

> ${entry.description}

- Category: ${category(template).label}
- Industry: ${label(INDUSTRIES, entry.industry)}
- Use case: ${label(USE_CASES, entry.useCase)}
- Language: ${template.language}
${entry.approvalRate !== undefined ? `- Approval rate: ${entry.approvalRate}%\n` : ""}- Page: ${url(entry.slug)}
- JSON: ${url(entry.slug)}.json
- Open in the playground: ${SITE}${templateLink(template)}
${entry.notes ? `\n## How to get it approved\n\n${entry.notes}\n` : ""}
## Message text

${templateText(template)}
${variables.length ? `\n## Variables\n\n${variables.map(([name, variable]) => `- \`{{${name}}}\`: ${variable.example}`).join("\n")}\n` : ""}
## Template JSON

\`\`\`json
${JSON.stringify(template, null, 2)}
\`\`\`

## Create it with the Meta Cloud API

\`\`\`sh
${toCurl(toRequests(template, meta()))}
\`\`\`
`;
  }

  function list(title, description, entries) {
    return `# ${title}

> ${description}

${entries.map(line).join("\n")}
`;
  }

  const files = {};
  for (const entry of CATALOG)
    files[`${templatePath(entry.slug)}.md`] = template(entry);

  const facets = [
    [
      "category",
      CATEGORIES,
      (entry, slug) => category(entry.template).slug === slug,
    ],
    ["industry", INDUSTRIES, (entry, slug) => entry.industry === slug],
    ["use-case", USE_CASES, (entry, slug) => entry.useCase === slug],
  ];
  for (const [kind, items, test] of facets)
    for (const facet of items) {
      const entries = CATALOG.filter((entry) => test(entry, facet.slug));
      if (entries.length)
        files[`${TEMPLATE_BASE}/${kind}/${facet.slug}.md`] = list(
          `${facet.label} WhatsApp templates`,
          facet.description ??
            `Free ${facet.label.toLowerCase()} WhatsApp templates.`,
          entries,
        );
    }

  files[`${TEMPLATE_BASE}.md`] = `# Free WhatsApp template examples

> ${CATALOG.length} free WhatsApp message templates, written to pass Meta's review. Every link below is the Markdown version; drop \`.md\` for the page and use \`.json\` for the template alone.

${INDUSTRIES.map((industry) => {
  const entries = CATALOG.filter((entry) => entry.industry === industry.slug);
  return entries.length
    ? `## ${industry.label}\n\n${entries.map(line).join("\n")}\n`
    : "";
})
  .filter(Boolean)
  .join("\n")}`;

  const intro = `# template-builder

> Free, open-source SDK to preview, validate and create WhatsApp message templates, maintained by Talqui. MIT licensed.

One JSON schema describes a template. The core package validates it against the rules Meta applies at review (73 typed issue codes) and builds the request that creates it on the Meta Cloud API, Twilio or Talqui. The React and Vue packages render a preview calibrated against a real iPhone.
`;

  const llms = `${intro}
## Key links

- [Agent quickstart](${SITE}/agents): install, validate, build the create request
- [JSON Schema](${SITE}/schema.json): every field a template accepts
- [Template catalog](${SITE}${TEMPLATE_BASE}.md): ${CATALOG.length} free templates by industry, as Markdown
- [Playground](${SITE}/playground): free online WhatsApp template builder and preview
- [GitHub](${GITHUB})
- [npm](https://www.npmjs.com/package/@talqui-oss/template-builder)

## Getting started

\`\`\`sh
npm i @talqui-oss/template-builder
\`\`\`

\`\`\`ts
import { validate, toRequests, toCurl } from "@talqui-oss/template-builder";
import { meta } from "@talqui-oss/template-builder/adapters/meta";

const { valid, issues } = validate(template);
console.log(toCurl(toRequests(template, meta({ wabaId: "123" }))));
\`\`\`

## Integrations

Meta Cloud API (verified), Talqui (verified), Twilio Content API (beta), any other provider through \`defineAdapter\`. Preview components for React and Vue.

## Skills

- [template-builder skill](${SKILL}): \`npx skills add talqui-oss/template-builder\`

## Optional

- [Full text](${SITE}/llms-full.txt): this file plus every catalog template with its JSON
- Markdown pages: append \`.md\` to any ${SITE}${TEMPLATE_BASE} URL
`;

  const full = `${intro}
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

${CATALOG.map((entry) => template(entry).replace(/^# /, "### ").replace(/\n## /g, "\n#### ")).join("\n")}`;

  return { files, llms, full };
}
