import { toCurl, toRequests } from "@talqui-oss/template-builder";
import { meta } from "@talqui-oss/template-builder/adapters/meta";
import { useRef } from "react";
import { downloadImage, type ImageFormat } from "../preview/exportImage";
import { templateLink } from "../state";
import { ArrowIcon } from "../landing/icons";
import {
  ChatScreen,
  Eyebrow,
  Footer,
  Header,
  Joint,
  useCopy,
} from "../landing/parts";
import {
  CATEGORIES,
  INDUSTRIES,
  USE_CASES,
  categorySlug,
  facetLabel,
  related,
  templatePath,
  templateText,
  type CatalogEntry,
} from "./data";

const FORMATS: ImageFormat[] = ["png", "jpg", "webp"];

/** One catalog entry: the preview, its text, JSON and API request, and related templates. */
export function TemplatePage({ entry }: { entry: CatalogEntry }) {
  const screen = useRef<HTMLDivElement>(null);
  const { template } = entry;
  const json = JSON.stringify(template, null, 2);
  const text = templateText(template);
  const curl = toCurl(toRequests(template, meta()));
  const variables =
    template.category === "AUTHENTICATION"
      ? []
      : Object.entries(template.variables ?? {});
  const category = categorySlug(template.category);

  return (
    <div className="lp-page">
      <div className="lp-frame">
        <Header />
        <section className="lp-rails ct-detail">
          <nav className="ct-crumbs" aria-label="Breadcrumb">
            <a href="/whatsapp-template">WhatsApp templates</a>
            <span>/</span>
            <a href={`/whatsapp-template/industry/${entry.industry}`}>
              {facetLabel(INDUSTRIES, entry.industry)}
            </a>
            <span>/</span>
            <span aria-current="page">{entry.title}</span>
          </nav>
          {/* The H1 carries the exact phrase people search for: "<use case> WhatsApp template". */}
          <h1 className="lp-h2 ct-detail__title">
            {entry.title} WhatsApp template
            <br />
            <em className="lp-serif">free example, ready for approval</em>
          </h1>
          <p className="lp-lead ct-detail__lead">{entry.description}</p>

          <div className="ct-detail__grid">
            <div className="ct-detail__preview">
              <div ref={screen}>
                <ChatScreen template={template} />
              </div>
              <div className="ct-actions">
                <a
                  className="lp-button lp-chip--strong ct-actions__primary"
                  href={templateLink(template)}
                >
                  Open in playground
                </a>
                {FORMATS.map((format) => (
                  <button
                    key={format}
                    type="button"
                    className="lp-button"
                    onClick={() =>
                      screen.current &&
                      void downloadImage(screen.current, format, template.name)
                    }
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="ct-detail__info">
              {entry.approvalRate !== undefined && (
                <div className="ct-rate">
                  <h2 className="ct-rate__value">
                    {entry.approvalRate}%{" "}
                    <span className="ct-rate__label">approval rate</span>
                  </h2>
                  <span className="ct-rate__bar" aria-hidden="true">
                    <span style={{ width: `${entry.approvalRate}%` }} />
                  </span>
                  <p className="lp-muted">
                    Share of submissions of this template that Meta approved.
                  </p>
                </div>
              )}
              <dl className="ct-facts">
                <div>
                  <dt>Category</dt>
                  <dd>
                    <a href={`/whatsapp-template/category/${category}`}>
                      {facetLabel(CATEGORIES, category)}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>Industry</dt>
                  <dd>
                    <a href={`/whatsapp-template/industry/${entry.industry}`}>
                      {facetLabel(INDUSTRIES, entry.industry)}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>Use case</dt>
                  <dd>
                    <a href={`/whatsapp-template/use-case/${entry.useCase}`}>
                      {facetLabel(USE_CASES, entry.useCase)}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>Language</dt>
                  <dd>{template.language}</dd>
                </div>
              </dl>

              {entry.notes && (
                <div className="ct-note">
                  <Eyebrow index="✳">Approval tip</Eyebrow>
                  <h2 className="ct-note__title">
                    How to get this template approved
                  </h2>
                  <p>{entry.notes}</p>
                </div>
              )}

              <CopyBlock
                title={`${entry.title} message example`}
                value={text}
                heading
              />

              {variables.length > 0 && (
                <div className="ct-block">
                  <h3 className="ct-block__title">Variables</h3>
                  <ul className="ct-vars">
                    {variables.map(([name, variable]) => (
                      <li key={name}>
                        <code>{`{{${name}}}`}</code>
                        <span className="lp-muted">{variable.example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
        <Joint />

        <section className="lp-rails lp-section ct-dev">
          <Eyebrow index="</>">For developers</Eyebrow>
          <h2 className="lp-h2">
            Create the {entry.title.toLowerCase()} template on Meta,{" "}
            <em className="lp-serif">free</em>
          </h2>
          <p className="lp-lead">
            The template as JSON for <code>@talqui-oss/template-builder</code>,
            and the Cloud API request that creates it. Replace the{" "}
            <code>$</code> variables with your account values.
          </p>
          <div className="ct-dev__grid">
            <CopyBlock title={`${template.name}.json`} value={json} code />
            <CopyBlock
              title="Create with the Meta Cloud API"
              value={curl}
              code
            />
          </div>
        </section>

        {related(entry).length > 0 && (
          <>
            <Joint />
            <section className="lp-rails lp-section">
              <Eyebrow index="+">Related</Eyebrow>
              <h2 className="lp-h2">
                More free{" "}
                <em className="lp-serif">
                  {facetLabel(INDUSTRIES, entry.industry).toLowerCase()}
                </em>{" "}
                WhatsApp templates
              </h2>
              <ul className="ct-related">
                {related(entry).map((other) => (
                  <li key={other.slug}>
                    <a href={templatePath(other.slug)}>
                      <h3 className="lp-h3">{other.title}</h3>
                      <span className="lp-muted">{other.description}</span>
                      <span className="lp-link">
                        View template <ArrowIcon />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
        <Joint />
        <Footer />
      </div>
    </div>
  );
}

function CopyBlock({
  title,
  value,
  code,
  heading,
}: {
  title: string;
  value: string;
  code?: boolean;
  /** Render the title as an h2, for blocks that are a section of the page. */
  heading?: boolean;
}) {
  const { copied, copy } = useCopy();
  const Title = heading ? "h2" : "p";
  return (
    <div className="ct-block">
      <Title className="ct-block__title">
        {title}
        <button
          type="button"
          className="ct-block__copy"
          onClick={() => copy(value)}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </Title>
      <pre className={code ? "ct-block__code" : "ct-block__text"}>{value}</pre>
    </div>
  );
}
