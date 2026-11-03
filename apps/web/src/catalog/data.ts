import type { Category, Template } from "@talqui-oss/template-builder";
import taxonomy from "../../catalog/taxonomy.json";

/** One catalog file, `catalog/templates/<slug>.json`. */
export type CatalogFile = {
  title: string;
  description: string;
  industry: string;
  useCase: string;
  keywords?: string[];
  /** Advice for getting this template approved or performing well. */
  notes?: string;
  template: Template;
};

export type CatalogEntry = CatalogFile & { slug: string };

export type Facet = { slug: string; label: string; description?: string };

export const INDUSTRIES: Facet[] = taxonomy.industries;
export const USE_CASES: Facet[] = taxonomy.useCases;

export const CATEGORIES: (Facet & { slug: string; category: Category })[] = [
  {
    slug: "marketing",
    category: "MARKETING",
    label: "Marketing",
    description: "Promotions, launches, offers and re-engagement campaigns.",
  },
  {
    slug: "utility",
    category: "UTILITY",
    label: "Utility",
    description:
      "Transactional updates about orders, bookings, payments and accounts.",
  },
  {
    slug: "authentication",
    category: "AUTHENTICATION",
    label: "Authentication",
    description: "One-time passwords and verification codes.",
  },
];

// Every JSON file in catalog/templates becomes an entry: adding a file is all it takes.
// shortcut: the whole catalog ships in the client bundle; split per page past ~1,000 entries.
const files = import.meta.glob<CatalogFile>("../../catalog/templates/*.json", {
  eager: true,
  import: "default",
});

export const CATALOG: CatalogEntry[] = Object.entries(files)
  .map(([path, file]) => ({
    ...file,
    slug: path.slice(path.lastIndexOf("/") + 1, -".json".length),
  }))
  .sort((a, b) => a.title.localeCompare(b.title));

export const entryBySlug = (slug: string) =>
  CATALOG.find((entry) => entry.slug === slug);

export const facetLabel = (facets: Facet[], slug: string) =>
  facets.find((facet) => facet.slug === slug)?.label ?? slug;

export const categorySlug = (category: Category) =>
  CATEGORIES.find((item) => item.category === category)!.slug;

/** Entries sharing the industry or use case, closest first, for "related templates". */
export function related(entry: CatalogEntry, limit = 6) {
  const score = (other: CatalogEntry) =>
    (other.useCase === entry.useCase ? 2 : 0) +
    (other.industry === entry.industry ? 1 : 0);
  return CATALOG.filter(
    (other) => other.slug !== entry.slug && score(other) > 0,
  )
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);
}

/** The template's text, flattened for search and for llms-full.txt. */
export function templateText(template: Template) {
  if (template.category === "AUTHENTICATION")
    return "One-time verification code with a copy button.";
  return [
    template.header?.type === "TEXT" ? template.header.text : "",
    template.body.text,
    template.footer?.text ?? "",
  ]
    .filter(Boolean)
    .join("\n");
}

export type CatalogFilter = {
  category?: string;
  industry?: string;
  useCase?: string;
  query?: string;
};

/** True when the entry passes every set filter; the query matches title, text and keywords. */
export function matches(entry: CatalogEntry, filter: CatalogFilter) {
  if (
    filter.category &&
    categorySlug(entry.template.category) !== filter.category
  )
    return false;
  if (filter.industry && entry.industry !== filter.industry) return false;
  if (filter.useCase && entry.useCase !== filter.useCase) return false;
  const words = filter.query?.toLowerCase().split(/\s+/).filter(Boolean) ?? [];
  if (!words.length) return true;
  const haystack = [
    entry.title,
    entry.description,
    facetLabel(INDUSTRIES, entry.industry),
    facetLabel(USE_CASES, entry.useCase),
    ...(entry.keywords ?? []),
    templateText(entry.template),
  ]
    .join(" ")
    .toLowerCase();
  return words.every((word) => haystack.includes(word));
}
