import type { ReactElement } from "react";
import { Agents } from "./agents/Agents";
import { App } from "./App";
import { CatalogPage } from "./catalog/CatalogPage";
import {
  CATALOG,
  CATEGORIES,
  INDUSTRIES,
  USE_CASES,
  type CatalogFilter,
  entryBySlug,
  facetLabel,
  matches,
  templateText,
} from "./catalog/data";
import { TemplatePage } from "./catalog/TemplatePage";
import { Landing } from "./landing/Landing";

export const SITE = "https://template-builder.dev";

/** What goes in `<head>` for a page: written into the static HTML at build time. */
export type Head = {
  title: string;
  description: string;
  path: string;
  jsonLd?: object[];
  noindex?: boolean;
};

export type Route = { head: Head; element: ReactElement };

const ORGANIZATION = {
  "@type": "Organization",
  name: "Talqui",
  url: "https://talqui.chat",
};

const SOFTWARE = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "template-builder",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web, Node.js",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  license: "https://opensource.org/licenses/MIT",
  url: SITE,
  author: ORGANIZATION,
};

const breadcrumbs = (items: [string, string][]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, path], index) => ({
    "@type": "ListItem",
    position: index + 1,
    name,
    item: SITE + path,
  })),
});

/** Facet pages: one indexable page per category, industry and use case. */
const FACETS = {
  category: CATEGORIES,
  industry: INDUSTRIES,
  "use-case": USE_CASES,
} as const;

type FacetKind = keyof typeof FACETS;

const facetFilter = (kind: FacetKind, slug: string): CatalogFilter =>
  kind === "category"
    ? { category: slug }
    : kind === "industry"
      ? { industry: slug }
      : { useCase: slug };

function facetRoute(kind: FacetKind, slug: string): Route | undefined {
  const facet = FACETS[kind].find((item) => item.slug === slug);
  if (!facet) return undefined;
  const filter = facetFilter(kind, slug);
  const heading =
    kind === "industry"
      ? `Free WhatsApp templates for ${facet.label.toLowerCase()}`
      : `Free ${facet.label.toLowerCase()} WhatsApp templates`;
  const path = `/catalog/${kind}/${slug}`;
  return {
    head: {
      title: `${heading}: examples ready for approval`,
      description: `${facet.description ?? `Free ${facet.label.toLowerCase()} WhatsApp message templates.`} Preview, copy, download as an image or open in the free WhatsApp template builder.`,
      path,
      jsonLd: [
        breadcrumbs([
          ["Catalog", "/catalog"],
          [facet.label, path],
        ]),
      ],
    },
    element: <CatalogPage filter={filter} heading={heading} />,
  };
}

function templateRoute(slug: string): Route | undefined {
  const entry = entryBySlug(slug);
  if (!entry) return undefined;
  const path = `/catalog/${slug}`;
  return {
    head: {
      title: `${entry.title}: free WhatsApp template example`,
      description: entry.description,
      path,
      jsonLd: [
        breadcrumbs([
          ["Catalog", "/catalog"],
          [
            facetLabel(INDUSTRIES, entry.industry),
            `/catalog/industry/${entry.industry}`,
          ],
          [entry.title, path],
        ]),
        {
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: `${entry.title} WhatsApp template`,
          description: entry.description,
          keywords: entry.keywords?.join(", "),
          text: templateText(entry.template),
          inLanguage: entry.template.language.replace("_", "-"),
          isAccessibleForFree: true,
          url: SITE + path,
          publisher: ORGANIZATION,
        },
      ],
    },
    element: <TemplatePage entry={entry} />,
  };
}

/** The page for a path; unknown paths get the landing page, marked noindex. */
export function resolveRoute(rawPath: string): Route {
  const path = rawPath.replace(/\/+$/, "") || "/";
  const parts = path.split("/").filter(Boolean);

  if (path === "/")
    return {
      head: {
        title:
          "Free WhatsApp Template Builder: preview, validate and create templates",
        description:
          "Free, open-source WhatsApp template builder. Preview templates exactly as they arrive on the phone, check Meta's review rules and create them on any provider.",
        path,
        jsonLd: [SOFTWARE],
      },
      element: <Landing />,
    };
  if (path === "/playground")
    return {
      head: {
        title: "WhatsApp Template Builder and Preview: free online playground",
        description:
          "Build and preview a WhatsApp message template online for free. Check it against Meta's rules, share a link, download it as PNG, JPG or WEBP and copy the API request.",
        path,
        jsonLd: [
          {
            ...SOFTWARE,
            name: "WhatsApp Template Builder playground",
            applicationCategory: "BusinessApplication",
          },
        ],
      },
      element: <App />,
    };
  if (path === "/agents")
    return {
      head: {
        title: "template-builder for AI agents: WhatsApp templates as JSON",
        description:
          "Instructions for AI agents: validate WhatsApp templates, render previews and build the Meta Cloud API request with one free npm package.",
        path,
      },
      element: <Agents />,
    };
  if (path === "/catalog")
    return {
      head: {
        title: `${CATALOG.length}+ free WhatsApp template examples, ready for approval`,
        description:
          "A free catalog of WhatsApp message templates for marketing campaigns, utility updates and verification codes. Search by industry, preview, copy and download.",
        path,
        jsonLd: [breadcrumbs([["Catalog", "/catalog"]])],
      },
      element: (
        <CatalogPage filter={{}} heading="Free WhatsApp template examples" />
      ),
    };
  if (parts[0] === "catalog" && parts.length === 3 && parts[1]! in FACETS) {
    const route = facetRoute(parts[1] as FacetKind, parts[2]!);
    if (route) return route;
  }
  if (parts[0] === "catalog" && parts.length === 2) {
    const route = templateRoute(parts[1]!);
    if (route) return route;
  }
  return {
    head: {
      title: "Page not found · template-builder",
      description: "This page does not exist.",
      path,
      noindex: true,
    },
    element: <Landing />,
  };
}

/** Every indexable path, for prerendering and the sitemap. */
export function allPaths() {
  return [
    "/",
    "/playground",
    "/agents",
    "/catalog",
    ...(Object.keys(FACETS) as FacetKind[]).flatMap((kind) =>
      FACETS[kind]
        .filter((facet) =>
          CATALOG.some((entry) =>
            matches(entry, facetFilter(kind, facet.slug)),
          ),
        )
        .map((facet) => `/catalog/${kind}/${facet.slug}`),
    ),
    ...CATALOG.map((entry) => `/catalog/${entry.slug}`),
  ];
}
