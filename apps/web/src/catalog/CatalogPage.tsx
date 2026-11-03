import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { templateLink } from "../state";
import { ArrowIcon } from "../landing/icons";
import { ChatScreen, Eyebrow, Footer, Header, Joint } from "../landing/parts";
import {
  CATALOG,
  CATEGORIES,
  INDUSTRIES,
  USE_CASES,
  categorySlug,
  facetLabel,
  matches,
  type CatalogFilter,
  type Facet,
} from "./data";

type Props = {
  /** Fixed by the page: `/catalog/industry/retail` starts filtered by retail. */
  filter: CatalogFilter;
  heading: string;
};

type FilterKey = "category" | "industry" | "useCase";

const GROUPS: {
  key: FilterKey;
  path: string;
  title: string;
  facets: Facet[];
}[] = [
  { key: "category", path: "category", title: "Category", facets: CATEGORIES },
  { key: "industry", path: "industry", title: "Industry", facets: INDUSTRIES },
  { key: "useCase", path: "use-case", title: "Use case", facets: USE_CASES },
];

const QUERY_KEYS: Record<FilterKey | "query", string> = {
  category: "category",
  industry: "industry",
  useCase: "use-case",
  query: "q",
};

/** The catalog list: search and facet filters over every entry in `catalog/templates`. */
export function CatalogPage({ filter: preset, heading }: Props) {
  const [filter, setFilter] = useState<CatalogFilter>(preset);

  // Extra filters live in the query string, so a filtered view can be shared. Read after
  // mount: the static HTML is rendered without a URL.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fromUrl: CatalogFilter = {};
    for (const [key, param] of Object.entries(QUERY_KEYS))
      if (params.get(param))
        fromUrl[key as keyof CatalogFilter] = params.get(param)!;
    if (Object.keys(fromUrl).length)
      setFilter((current) => ({ ...current, ...fromUrl }));
  }, []);

  const update = (next: CatalogFilter) => {
    setFilter(next);
    const params = new URLSearchParams();
    for (const [key, param] of Object.entries(QUERY_KEYS)) {
      const value = next[key as keyof CatalogFilter];
      if (value && value !== preset[key as keyof CatalogFilter])
        params.set(param, value);
    }
    history.replaceState(
      null,
      "",
      `${location.pathname}${params.size ? `?${params}` : ""}`,
    );
  };

  // Facet links are real pages for crawlers; for people they toggle the filter in place.
  const toggle = (key: FilterKey, slug: string) => (event: MouseEvent) => {
    event.preventDefault();
    update({ ...filter, [key]: filter[key] === slug ? undefined : slug });
  };

  const results = useMemo(
    () => CATALOG.filter((entry) => matches(entry, filter)),
    [filter],
  );
  const countFor = (key: FilterKey, slug: string) =>
    CATALOG.filter((entry) => matches(entry, { ...filter, [key]: slug }))
      .length;

  return (
    <div className="lp-page">
      <div className="lp-frame">
        <Header />
        <section className="lp-rails ct-hero">
          <Eyebrow index="—">Catalog</Eyebrow>
          <h1 className="lp-h2 ct-hero__title">
            {heading}, <em className="lp-serif">ready for approval</em>
          </h1>
          <p className="lp-lead ct-hero__lead">
            {CATALOG.length} free templates for marketing campaigns, utility
            updates and verification codes. Preview each one as it arrives on
            the phone, copy the text, download it as an image or open it in the
            playground.
          </p>
          <label className="ct-search">
            <span className="ct-search__icon" aria-hidden="true">
              ⌕
            </span>
            <input
              type="search"
              placeholder="Search templates: abandoned cart, appointment, OTP…"
              value={filter.query ?? ""}
              onChange={(event) =>
                update({ ...filter, query: event.target.value || undefined })
              }
              aria-label="Search templates"
            />
          </label>
        </section>
        <Joint />

        <section className="lp-rails ct-body">
          <nav className="ct-filters" aria-label="Filters">
            {GROUPS.map((group) => (
              <div className="ct-filters__group" key={group.key}>
                <p className="ct-filters__title">{group.title}</p>
                <ul>
                  {group.facets.map((facet) => {
                    const count = countFor(group.key, facet.slug);
                    const active = filter[group.key] === facet.slug;
                    if (!count && !active) return null;
                    return (
                      <li key={facet.slug}>
                        <a
                          href={`/catalog/${group.path}/${facet.slug}`}
                          className={`ct-filters__item${active ? " is-active" : ""}`}
                          aria-current={active ? "true" : undefined}
                          onClick={toggle(group.key, facet.slug)}
                        >
                          <span>{facet.label}</span>
                          <span className="ct-filters__count">{count}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div className="ct-results">
            <p className="ct-results__count">
              {results.length} {results.length === 1 ? "template" : "templates"}
              {Object.values(filter).some(Boolean) && (
                <button
                  type="button"
                  className="ct-results__clear"
                  onClick={() => update({})}
                >
                  Clear filters
                </button>
              )}
            </p>
            <ol className="ct-list">
              {results.map((entry) => (
                <li key={entry.slug} className="ct-card">
                  <a
                    className="ct-card__visual"
                    href={`/catalog/${entry.slug}`}
                    tabIndex={-1}
                  >
                    <ChatScreen
                      template={entry.template}
                      className="lp-screen--list"
                    />
                  </a>
                  <div className="ct-card__body">
                    <p className="ct-card__tags">
                      <span className="lp-tag">
                        {facetLabel(
                          CATEGORIES,
                          categorySlug(entry.template.category),
                        )}
                      </span>
                      <span className="lp-tag">
                        {facetLabel(INDUSTRIES, entry.industry)}
                      </span>
                      <span className="lp-tag">
                        {facetLabel(USE_CASES, entry.useCase)}
                      </span>
                    </p>
                    <h2 className="lp-h3">
                      <a href={`/catalog/${entry.slug}`}>{entry.title}</a>
                    </h2>
                    <p className="lp-muted">{entry.description}</p>
                    <p className="ct-card__links">
                      <a className="lp-link" href={`/catalog/${entry.slug}`}>
                        View template <ArrowIcon />
                      </a>
                      <a
                        className="lp-link lp-link--muted"
                        href={templateLink(entry.template)}
                      >
                        Open in playground <ArrowIcon />
                      </a>
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            {!results.length && (
              <p className="lp-muted ct-empty">
                No template matches. Try fewer words or clear the filters.
              </p>
            )}
          </div>
        </section>
        <Joint />
        <Footer />
      </div>
    </div>
  );
}
