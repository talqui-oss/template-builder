import type { Template } from "@talqui-oss/template-builder";
import { TemplatePreview } from "@talqui-oss/template-builder-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { EXAMPLES } from "../examples";
import { templateLink } from "../state";
import { AsciiArt } from "./AsciiArt";
import { CopyIcon, GitHubIcon, ArrowIcon } from "./icons";

const GITHUB = "https://github.com/talqui-oss/template-builder";
const NPM = "https://www.npmjs.com/package/@talqui-oss/template-builder";
const TALQUI =
  "https://talqui.chat?utm_source=template-builder&utm_medium=site&utm_campaign=footer";
const INSTALL = "npm i @talqui-oss/template-builder";

/** The human landing page at `/`. */
export function Landing() {
  return (
    <div className="lp-page">
      <div className="lp-frame">
        <aside className="lp-rails lp-announce">
          <p>
            <span className="lp-square" aria-hidden="true" />
            Open source, MIT licensed.
          </p>
          <a href={GITHUB} className="lp-announce__link">
            Star on GitHub <ArrowIcon />
          </a>
          <Joint />
        </aside>
        <Header />
        <Hero />
        <Joint />
        <PreviewSection />
        <Joint />
        <BuildingBlocks />
        <Joint />
        <Templates />
        <Joint />
        <Integrations />
        <Joint />
        <OpenSource />
        <Joint />
        <Faq />
        <Joint />
        <GetStarted />
        <Joint />
        <Footer />
      </div>
    </div>
  );
}

/** The horizontal rule between sections, with a small square where it meets each rail. */
function Joint() {
  return (
    <div className="lp-joint" aria-hidden="true">
      <span />
      <span />
    </div>
  );
}

function Brand() {
  return (
    <a className="lp-brand" href="/">
      <span className="lp-brand__mark" aria-hidden="true" />
      <span className="lp-chip">template-builder</span>
    </a>
  );
}

function Header() {
  return (
    <header className="lp-rails lp-header">
      <Brand />
      <nav className="lp-header__nav">
        <a className="lp-chip lp-chip--outline" href="/agents">
          for agents
        </a>
        <a className="lp-chip" href={GITHUB}>
          github
        </a>
        <a className="lp-chip" href={NPM}>
          npm
        </a>
        <a className="lp-chip lp-chip--strong" href="/playground">
          Open Playground
        </a>
      </nav>
    </header>
  );
}

function Eyebrow({ index, children }: { index: string; children: ReactNode }) {
  return (
    <p className="lp-eyebrow">
      <span className="lp-square" aria-hidden="true" />
      <span className="lp-eyebrow__index">{index}</span>
      {children}
    </p>
  );
}

/** Copies `text` and shows a short confirmation on the button that asked for it. */
function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = (text: string) => {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return { copied, copy };
}

function InstallCommand() {
  const { copied, copy } = useCopy();
  return (
    <div className="lp-command">
      <code>
        <span className="lp-command__prompt">$</span> {INSTALL}
      </code>
      <button
        type="button"
        className="lp-command__copy"
        aria-label={copied ? "Copied" : "Copy install command"}
        onClick={() => copy(INSTALL)}
      >
        <CopyIcon />
      </button>
    </div>
  );
}

/** A slice of the WhatsApp chat: doodle wallpaper plus the rendered template. */
function ChatScreen({
  template,
  className,
}: {
  template: Template;
  className?: string;
}) {
  return (
    <div className={`lp-screen ${className ?? ""}`}>
      <div className="lp-screen__wallpaper" aria-hidden="true" />
      <TemplatePreview template={template} time="09:41" />
    </div>
  );
}

const PROVIDERS = ["Meta", "Twilio", "Talqui"];

function Hero() {
  const [provider, setProvider] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setProvider((i) => (i + 1) % PROVIDERS.length),
      2400,
    );
    return () => clearInterval(id);
  }, []);
  const hero = EXAMPLES[0]!;

  return (
    <section className="lp-rails lp-hero">
      <h1 className="lp-hero__title">
        <span>
          Build WhatsApp templates for{" "}
          <span className="lp-token" key={provider}>
            {PROVIDERS[provider]}
          </span>
        </span>
        <em className="lp-serif">exactly as they arrive</em>
      </h1>
      <p className="lp-hero__lead">
        Write the template once, as JSON. See it on the phone, check it
        <br />
        against WhatsApp's review rules and create it on any provider.
      </p>
      <div className="lp-hero__actions">
        <InstallCommand />
        <a className="lp-button" href="/playground">
          Open Playground
        </a>
      </div>

      <div className="lp-hero__visual">
        <div className="lp-dots" aria-hidden="true" />
        <article className="lp-idcard">
          <header className="lp-idcard__head">
            <span>Template</span>
            <span className="lp-idcard__badge">Approved</span>
          </header>
          <dl className="lp-idcard__meta">
            <div>
              <dt>Name</dt>
              <dd>{hero.template.name}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>Utility</dd>
            </div>
            <div>
              <dt>Language</dt>
              <dd>en_US</dd>
            </div>
          </dl>
          <ChatScreen template={hero.template} className="lp-screen--hero" />
        </article>
      </div>
    </section>
  );
}

const PREVIEW_TABS = [EXAMPLES[0]!, EXAMPLES[1]!, EXAMPLES[3]!];

function PreviewSection() {
  const [active, setActive] = useState(0);
  const example = PREVIEW_TABS[active]!;

  return (
    <section className="lp-rails lp-section lp-split">
      <div className="lp-split__text">
        <Eyebrow index="01">The preview</Eyebrow>
        <h2 className="lp-h2">
          One JSON.
          <br />
          <em className="lp-serif">Every screen.</em>
        </h2>
        <p className="lp-lead">
          The bubble, line breaks and buttons match a real iPhone, measured
          point by point. What you see is what your customer gets.
        </p>
        <ul className="lp-tabs" role="tablist" aria-label="Examples">
          {PREVIEW_TABS.map((tab, index) => (
            <li key={tab.slug}>
              <button
                type="button"
                role="tab"
                aria-selected={index === active}
                className="lp-tabs__item"
                onClick={() => setActive(index)}
              >
                <span className="lp-tabs__index">0{index + 1}</span>
                {tab.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="lp-window">
        <div className="lp-window__bar">
          <span className="lp-window__dots" aria-hidden="true" />
          <span>{example.template.name}.json</span>
          <span className="lp-window__live">● valid</span>
        </div>
        <ChatScreen template={example.template} className="lp-screen--window" />
        <p className="lp-window__foot">
          <span className="lp-accent">&lt;TemplatePreview /&gt;</span> · React
          and Vue
        </p>
      </div>
    </section>
  );
}

const BLOCKS = [
  {
    title: "Pixel-true preview",
    text: "Bubble, fonts and spacing calibrated against screenshots of a real iPhone.",
    rows: [
      ["React and Vue components", "ssr"],
      ["Download as PNG, JPG or WEBP", "3x"],
      ["Device language for labels", "i18n"],
    ],
    visual: (
      <div className="lp-mini-bubble">
        <strong>Order 4512 shipped</strong>
        <span>Hi Maria, your order left our warehouse today.</span>
        <em>09:41</em>
      </div>
    ),
  },
  {
    title: "Review rules, locally",
    text: "73 checks WhatsApp applies before approval, each with a stable code you can test for.",
    rows: [
      ["Typed issues with a path", "ts"],
      ["Errors and warnings", "73"],
      ["Runs in the browser or Node", "0 deps"],
    ],
    visual: (
      <ul className="lp-mini-issues">
        <li>
          <span className="lp-mini-issues__error">error</span> BODY_TOO_LONG
        </li>
        <li>
          <span className="lp-mini-issues__error">error</span> PARAM_AT_EDGE
        </li>
        <li>
          <span className="lp-mini-issues__warn">warn</span> VARIABLE_UNUSED
        </li>
      </ul>
    ),
  },
  {
    title: "Create anywhere",
    text: "Adapters turn the same template into the request each provider expects, or a cURL.",
    rows: [
      ["Meta Cloud API", "verified"],
      ["Talqui", "verified"],
      ["Twilio Content API", "beta"],
    ],
    visual: (
      <pre className="lp-mini-code">
        <span className="lp-accent">$</span> curl -X POST \{"\n"}
        {"  "}graph.facebook.com/v26.0/\{"\n"}
        {"  "}$WABA_ID/message_templates
      </pre>
    ),
  },
];

function BuildingBlocks() {
  return (
    <section className="lp-rails lp-section">
      <div className="lp-section__head">
        <div>
          <Eyebrow index="02">Building blocks</Eyebrow>
          <h2 className="lp-h2">
            The template
            <br />
            <em className="lp-serif">building blocks</em>
          </h2>
        </div>
        <p className="lp-lead lp-lead--side">
          Everything between writing a template and getting it approved, in one
          small package.
        </p>
      </div>
      <div className="lp-blocks">
        {BLOCKS.map((block, index) => (
          <article className="lp-block" key={block.title}>
            <div className="lp-block__visual">
              <div className="lp-dots lp-dots--card" aria-hidden="true" />
              {block.visual}
            </div>
            <div className="lp-block__body">
              <p className="lp-block__index">
                <span className="lp-square" aria-hidden="true" /> 0{index + 1}
              </p>
              <h3 className="lp-h3">{block.title}</h3>
              <p className="lp-muted">{block.text}</p>
            </div>
            <ul className="lp-block__rows">
              {block.rows.map(([label, tag]) => (
                <li key={label}>
                  <span>{label}</span>
                  <code>{tag}</code>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  MARKETING: "Marketing",
  UTILITY: "Utility",
  AUTHENTICATION: "Authentication",
};

function Templates() {
  const track = useRef<HTMLUListElement>(null);
  const [page, setPage] = useState(0);
  const scroll = (direction: 1 | -1) => {
    const list = track.current;
    const card = list?.firstElementChild as HTMLElement | null;
    if (list && card)
      list.scrollBy({
        left: direction * (card.offsetWidth + 16),
        behavior: "smooth",
      });
  };
  const onScroll = () => {
    const list = track.current;
    const card = list?.firstElementChild as HTMLElement | null;
    if (list && card)
      setPage(Math.round(list.scrollLeft / (card.offsetWidth + 16)));
  };

  return (
    <section className="lp-rails lp-section" id="templates">
      <div className="lp-section__head">
        <div>
          <Eyebrow index="03">Templates</Eyebrow>
          <h2 className="lp-h2">
            Ready-made <em className="lp-serif">templates</em>
            <br />
            for real conversations
          </h2>
        </div>
        <p className="lp-lead lp-lead--side">
          Start from a template that already passes the rules, change the words
          and create it on your provider.
        </p>
      </div>

      <ul
        className="lp-carousel"
        ref={track}
        onScroll={onScroll}
        aria-label="Templates"
      >
        {EXAMPLES.map((example, index) => (
          <li key={example.slug} className="lp-carousel__item">
            <article className="lp-template">
              <div className="lp-template__visual">
                <div className="lp-template__tags">
                  <span className="lp-tag">
                    {CATEGORY_LABELS[example.template.category]}
                  </span>
                  <span className="lp-tag">{example.template.language}</span>
                </div>
                <span className="lp-template__code">T-0{index + 1}</span>
                <ChatScreen
                  template={example.template}
                  className="lp-screen--card"
                />
              </div>
              <div className="lp-template__body">
                <h3 className="lp-h3">{example.title}</h3>
                <p className="lp-muted">{example.description}</p>
                <a className="lp-link" href={templateLink(example.template)}>
                  Open in playground <ArrowIcon />
                </a>
              </div>
            </article>
          </li>
        ))}
      </ul>
      <div className="lp-carousel__controls">
        <p className="lp-progress">
          <span>
            0{Math.min(page + 1, EXAMPLES.length)} / 0{EXAMPLES.length}
          </span>
          {EXAMPLES.map((example, index) => (
            <span
              key={example.slug}
              className={`lp-progress__dash${index === page ? " is-active" : ""}`}
            />
          ))}
        </p>
        <div className="lp-carousel__buttons">
          <button
            type="button"
            aria-label="Previous templates"
            onClick={() => scroll(-1)}
          >
            <ArrowIcon direction="left" />
          </button>
          <button
            type="button"
            aria-label="Next templates"
            onClick={() => scroll(1)}
          >
            <ArrowIcon direction="right" />
          </button>
        </div>
      </div>

      <div className="lp-banner">
        <AsciiArt />
        <p className="lp-banner__label lp-banner__label--left">
          <span className="lp-accent">✳ Template</span>
          order_shipped, approved by Meta
          <br />
          and sent to 12,480 customers.
        </p>
        <p className="lp-banner__label lp-banner__label--right">
          <span className="lp-accent">◎ Customer</span>
          Tracking it now, thanks!
        </p>
      </div>
    </section>
  );
}

const INTEGRATIONS = [
  {
    name: "Meta Cloud API",
    note: "Create the template on your WhatsApp Business Account.",
    code: `import { toRequests, toCurl } from "@talqui-oss/template-builder";
import { meta } from "@talqui-oss/template-builder/adapters/meta";

const requests = toRequests(template, meta({ wabaId: "123" }));
console.log(toCurl(requests));`,
  },
  {
    name: "Twilio",
    note: "Content API requests, with approval for WhatsApp.",
    code: `import { toRequests } from "@talqui-oss/template-builder";
import { twilio } from "@talqui-oss/template-builder/adapters/twilio";

const requests = toRequests(template, twilio());`,
  },
  {
    name: "Talqui",
    note: "A template model on your Talqui workspace, on any WhatsApp channel.",
    code: `import { toRequests } from "@talqui-oss/template-builder";
import { talqui } from "@talqui-oss/template-builder/adapters/talqui";

const requests = toRequests(template, talqui());`,
  },
  {
    name: "React",
    note: "The preview as a component, server-rendered or not.",
    code: `import { TemplatePreview } from "@talqui-oss/template-builder-react";
import "@talqui-oss/template-builder/styles.css";

<TemplatePreview template={template} time="09:41" />`,
  },
  {
    name: "Vue",
    note: "The same preview, the same HTML, for Vue 3.",
    code: `import { TemplatePreview } from "@talqui-oss/template-builder-vue";
import "@talqui-oss/template-builder/styles.css";

<TemplatePreview :template="template" time="09:41" />`,
  },
  {
    name: "Node",
    note: "Validate in CI, before anything reaches review.",
    code: `import { validate } from "@talqui-oss/template-builder";

const { valid, issues } = validate(template);
if (!valid) process.exit(1);`,
  },
  {
    name: "Your provider",
    note: "Write an adapter: one function from template to requests.",
    code: `import { defineAdapter } from "@talqui-oss/template-builder";

export const acme = defineAdapter({
  name: "acme",
  toRequests: (template) => [/* your HTTP requests */],
});`,
  },
];

function Integrations() {
  const [active, setActive] = useState(0);
  const item = INTEGRATIONS[active]!;
  const { copied, copy } = useCopy();

  return (
    <section className="lp-rails lp-section">
      <Eyebrow index="04">Integrations</Eyebrow>
      <h2 className="lp-h2">
        Works <em className="lp-serif">everywhere</em>
        <br />
        your templates go
      </h2>
      <div className="lp-integrations">
        <ul
          className="lp-integrations__list"
          role="tablist"
          aria-label="Integrations"
        >
          {INTEGRATIONS.map((integration, index) => (
            <li key={integration.name}>
              <button
                type="button"
                role="tab"
                aria-selected={index === active}
                onClick={() => setActive(index)}
              >
                <span className="lp-integrations__mark" aria-hidden="true">
                  {integration.name[0]}
                </span>
                {integration.name}
              </button>
            </li>
          ))}
        </ul>
        <div className="lp-terminal">
          <span className="lp-window__dots" aria-hidden="true" />
          <p className="lp-terminal__note">{item.note}</p>
          <pre className="lp-terminal__code">{item.code}</pre>
          <button
            type="button"
            className="lp-terminal__copy"
            onClick={() => copy(item.code)}
          >
            {copied ? "Copied" : "Copy code"}
          </button>
        </div>
      </div>
    </section>
  );
}

const PRINCIPLES = [
  [
    "Nothing leaves your app.",
    "No API key, no network call. The package only builds requests; you send them.",
  ],
  [
    "One typed schema.",
    "A JSON Schema and TypeScript types for every field WhatsApp accepts.",
  ],
  [
    "MIT licensed.",
    "Use it in closed products, fork it, write adapters for anyone.",
  ],
];

function OpenSource() {
  return (
    <section className="lp-rails lp-open">
      <div className="lp-open__hero">
        <div className="lp-open__rays" aria-hidden="true" />
        <Eyebrow index="05">Open source</Eyebrow>
        <h2 className="lp-h2 lp-h2--center">
          <span className="lp-dim">Start with one template.</span>{" "}
          <em className="lp-serif">Ship thousands</em> with confidence.
        </h2>
        <p className="lp-lead lp-lead--center">
          template-builder is maintained by{" "}
          <a className="lp-accent" href={TALQUI}>
            Talqui
          </a>
          , the multichannel inbox that creates and sends WhatsApp templates for
          its customers every day.
        </p>
        <a className="lp-button lp-button--outline" href={GITHUB}>
          <GitHubIcon /> Star on GitHub
        </a>
      </div>
      <div className="lp-principles">
        {PRINCIPLES.map(([title, text], index) => (
          <div className="lp-principle" key={title}>
            <span className="lp-principle__index">0{index + 1}</span>
            <p>
              <strong>{title}</strong> <span className="lp-muted">{text}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

const QUESTIONS = [
  [
    "What is template-builder?",
    "An open-source SDK to preview, validate and create WhatsApp message templates. You describe the template as JSON and get a pixel-true preview, the review rules WhatsApp applies and the request for your provider.",
  ],
  [
    "Does it send messages?",
    "No. It builds the request that creates a template and leaves the sending to you or your provider. Your tokens never pass through the package.",
  ],
  [
    "How close is the preview to a real phone?",
    "It was calibrated against screenshots of an iPhone: line breaks match and positions are within half a point. Android is next.",
  ],
  [
    "Which providers are supported?",
    "Meta Cloud API and Talqui are verified end to end. Twilio is available and still being verified. Any other provider takes one adapter.",
  ],
  [
    "Can I upload media for the header?",
    "The preview takes a public URL. Uploading the sample file is a step of your provider, so the adapters leave a placeholder for its handle.",
  ],
  [
    "Is it free?",
    "Yes. It is MIT licensed, with no account and no usage limits.",
  ],
];

function Faq() {
  return (
    <section className="lp-rails lp-section lp-faq">
      <div>
        <Eyebrow index="06">FAQ</Eyebrow>
        <h2 className="lp-h2">
          Questions,
          <br />
          <em className="lp-serif">answers</em>
        </h2>
      </div>
      <div className="lp-faq__list">
        {QUESTIONS.map(([question, answer], index) => (
          <details key={question} className="lp-faq__item" open={index === 0}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function GetStarted() {
  return (
    <section className="lp-rails lp-section lp-start">
      <div className="lp-start__text">
        <h2 className="lp-h2">
          Preview your first
          <br />
          template. <em className="lp-serif">Today</em>
        </h2>
        <p className="lp-muted">
          Free and open source.
          <br />
          No account required.
        </p>
        <InstallCommand />
        <a className="lp-button lp-button--block" href="/playground">
          Open Playground
        </a>
      </div>
      <div className="lp-start__visual">
        <span className="lp-corners" aria-hidden="true" />
        <ChatScreen
          template={EXAMPLES[2]!.template}
          className="lp-screen--start"
        />
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="lp-rails lp-footer">
      <div className="lp-footer__left">
        <Brand />
        <span className="lp-footer__meta">© 2026</span>
        <a className="lp-footer__meta lp-accent" href={TALQUI}>
          built by Talqui
        </a>
      </div>
      <nav className="lp-header__nav">
        <a className="lp-chip lp-chip--outline" href="/agents">
          for agents
        </a>
        <a className="lp-chip" href={NPM}>
          npm
        </a>
        <a className="lp-chip" href={GITHUB}>
          github
        </a>
      </nav>
    </footer>
  );
}
