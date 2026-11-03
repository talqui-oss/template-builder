import {
  codes,
  toCurl,
  toRequests,
  validate,
  type Template,
} from "@talqui-oss/template-builder";
import { meta } from "@talqui-oss/template-builder/adapters/meta";
import { TemplateEditor } from "@talqui-oss/template-builder-react";
import { useEffect, useRef, useState } from "react";
import { CATALOG } from "../catalog/data";
import { EXAMPLES } from "../examples";
import { templateLink } from "../state";
import { AsciiArt } from "./AsciiArt";
import { HeroStack } from "./HeroStack";
import { MetaLogo, TalquiWordmark, TwilioLogo } from "./logos";
import { ArrowIcon, GitHubIcon } from "./icons";
import {
  ChatScreen,
  Eyebrow,
  Footer,
  GITHUB,
  Header,
  InstallCommand,
  Joint,
  TALQUI,
  useCopy,
} from "./parts";

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
        <CapabilityStrip />
        <Joint />
        <CapabilitiesSection />
        <Joint />
        <BuildingBlocks />
        <Joint />
        <Templates />
        <Joint />
        <Integrations />
        <Joint />
        <WithAi />
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

/** The rotating name in the hero title, each with its mark. */
const PROVIDERS = [
  { name: "Meta", mark: <MetaLogo /> },
  { name: "Twilio", mark: <TwilioLogo /> },
  // The wordmark already spells the name.
  { name: "Talqui", mark: <TalquiWordmark /> },
];

function Hero() {
  const [provider, setProvider] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setProvider((i) => (i + 1) % PROVIDERS.length),
      2400,
    );
    return () => clearInterval(id);
  }, []);
  return (
    <section className="lp-rails lp-hero">
      <h1 className="lp-hero__title">
        <span>
          Free WhatsApp template builder for{" "}
          <span className="lp-token" key={provider}>
            {PROVIDERS[provider]!.mark}
            {PROVIDERS[provider]!.name !== "Talqui" &&
              PROVIDERS[provider]!.name}
          </span>
        </span>
        <em className="lp-serif">exactly as they arrive</em>
      </h1>
      <p className="lp-hero__lead">
        Embed template creation in your product, validate against Meta's
        <br />
        review rules, preview in React or Vue and create on Meta from your API.
      </p>
      <div className="lp-hero__actions">
        <InstallCommand />
        <a className="lp-button" href="/playground">
          Open Playground
        </a>
      </div>

      <figure className="lp-hero__visual">
        <AsciiArt
          scene="signal"
          cols={260}
          rows={64}
          className="lp-hero__ascii"
        />
        <HeroStack />
        <figcaption className="lp-hero__caption">
          <span>fig. 01 — rendering</span>
          <span>
            [ json <span className="lp-accent">·</span> renders as{" "}
            <span className="lp-accent">·</span> whatsapp ]
          </span>
        </figcaption>
      </figure>
    </section>
  );
}

/** The four things the package does, in the order a template goes through them. */
const CAPABILITIES = [
  {
    title: "Embed template creation",
    text: "A form your users fill in, inside your app.",
  },
  {
    title: "Validate against Meta's rules",
    text: "73 review checks, while they type.",
  },
  {
    title: "Preview in React or Vue",
    text: "Exactly as it arrives on the phone.",
  },
  {
    title: "Create on Meta from your API",
    text: "The Cloud API request, built for you.",
  },
];

/** A strip under the hero naming every capability, so the first screen tells the whole story. */
function CapabilityStrip() {
  return (
    <section className="lp-rails lp-strip" aria-label="What it does">
      {CAPABILITIES.map((capability, index) => (
        <p key={capability.title} className="lp-strip__item">
          <span className="lp-strip__index">0{index + 1}</span>
          {capability.title}
        </p>
      ))}
    </section>
  );
}

/** One template moves through all four tabs: edit it in the first, see the effect in the rest. */
function CapabilitiesSection() {
  const [active, setActive] = useState(2);
  const [template, setTemplate] = useState<Template>(EXAMPLES[0]!.template);
  const { issues } = validate(template);
  let curl: string;
  try {
    curl = toCurl(toRequests(template, meta()));
  } catch {
    curl = "# Fix the errors in the Validate tab to build the request.";
  }

  const panels = [
    <div className="lp-cap__editor" key="edit">
      <TemplateEditor
        template={template}
        onChange={setTemplate}
        className="lp-editor"
      />
    </div>,
    <ul className="lp-cap__issues" key="validate">
      {issues.length === 0 && (
        <li className="lp-cap__ok">
          ✓ Ready for review: no issues found across {Object.keys(codes).length}{" "}
          checks.
        </li>
      )}
      {issues.map((issue) => (
        <li key={issue.code + issue.path}>
          <span
            className={
              issue.severity === "error"
                ? "lp-mini-issues__error"
                : "lp-mini-issues__warn"
            }
          >
            {issue.severity}
          </span>{" "}
          <code>{issue.code}</code>
          <span className="lp-muted">{issue.message}</span>
        </li>
      ))}
    </ul>,
    <ChatScreen
      template={template}
      className="lp-screen--window"
      key="preview"
    />,
    <pre className="lp-cap__code" key="create">
      {curl}
    </pre>,
  ];

  return (
    <section className="lp-rails lp-section lp-split">
      <div className="lp-split__text">
        <Eyebrow index="01">What it does</Eyebrow>
        <h2 className="lp-h2">
          Everything a template needs,
          <br />
          <em className="lp-serif">in one free package</em>
        </h2>
        <p className="lp-lead">
          Let your users create WhatsApp templates in your product, catch what
          Meta would reject before they submit, show the exact message their
          customers will get, and create it from your backend.
        </p>
        <ul className="lp-tabs" role="tablist" aria-label="Capabilities">
          {CAPABILITIES.map((capability, index) => (
            <li key={capability.title}>
              <button
                type="button"
                role="tab"
                aria-selected={index === active}
                className="lp-tabs__item"
                onClick={() => setActive(index)}
              >
                <span className="lp-tabs__index">0{index + 1}</span>
                <span className="lp-tabs__text">
                  {capability.title}
                  <span className="lp-tabs__note">{capability.text}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="lp-window">
        <div className="lp-window__bar">
          <span className="lp-window__dots" aria-hidden="true" />
          <span>{template.name || "template"}.json</span>
          <span
            className={
              issues.some((issue) => issue.severity === "error")
                ? "lp-window__live lp-window__live--error"
                : "lp-window__live"
            }
          >
            ●{" "}
            {issues.some((issue) => issue.severity === "error")
              ? "errors"
              : "valid"}
          </span>
        </div>
        <div className="lp-cap__panel">{panels[active]}</div>
        <p className="lp-window__foot">
          <span className="lp-accent">
            {
              [
                "<TemplateEditor />",
                "validate()",
                "<TemplatePreview />",
                "toRequests(template, meta())",
              ][active]
            }
          </span>{" "}
          · edit the template in tab 01, the others follow
        </p>
      </div>
    </section>
  );
}

const BLOCKS = [
  {
    title: "Preview in your frontend",
    text: "Drop <TemplatePreview> into your React or Vue app, next to the editor your users already have.",
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
    title: "Validate in the browser and the API",
    text: "Run the 73 checks Meta applies at review while users type, and again on your server before submitting.",
    rows: [
      ["Review linter", "73 rules"],
      ["Category check", "copy code"],
      ["Variable examples", "required"],
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
    title: "Create on Meta from your backend",
    text: "Turn the template into the Cloud API request in your Node backend, or into the call your provider expects.",
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
          <Eyebrow index="02">In your product</Eyebrow>
          <h2 className="lp-h2">
            Add WhatsApp templates
            <br />
            <em className="lp-serif">to your product, free</em>
          </h2>
        </div>
        <p className="lp-lead lp-lead--side">
          Template creation, preview and validation for your users, and the Meta
          integration for your backend. Free and MIT licensed.{" "}
          <a className="lp-accent" href="/editor">
            See the editor →
          </a>
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
            Free ready-made <em className="lp-serif">templates</em>
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
        <a className="lp-link lp-carousel__all" href="/whatsapp-template">
          Browse {CATALOG.length} free templates <ArrowIcon />
        </a>
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

const SKILL_COMMAND = "npx skills add talqui-oss/template-builder";

/** The agent session shown next to the skill install, line by line. */
const AGENT_SESSION = [
  ["you", "Create an abandoned cart template for Acme with a 10% coupon."],
  ["agent", "Reading skill template-builder…"],
  ["agent", "Wrote abandoned_cart.json · MARKETING · en_US"],
  ["tool", "validate(template) → 0 errors, 0 warnings"],
  ["tool", "toCurl(toRequests(template, meta())) → 1 request"],
  ["agent", "Ready to create on Meta. Want me to run it?"],
] as const;

function WithAi() {
  return (
    <section className="lp-rails lp-section lp-split">
      <div className="lp-split__text">
        <Eyebrow index="05">With AI</Eyebrow>
        <h2 className="lp-h2">
          Build templates
          <br />
          <em className="lp-serif">with any AI, free</em>
        </h2>
        <p className="lp-lead">
          Install the skill and your coding agent knows the schema, the review
          rules and the catalog. It works with Claude Code, Cursor, Codex and
          any agent that reads skills or llms.txt.
        </p>
        <div className="lp-ai__actions">
          <InstallCommand command={SKILL_COMMAND} />
          <p className="lp-ai__links">
            <a className="lp-link" href="/llms.txt">
              llms.txt <ArrowIcon />
            </a>
            <a className="lp-link" href="/agents">
              For agents <ArrowIcon />
            </a>
          </p>
        </div>
      </div>
      <div className="lp-window lp-ai__session">
        <div className="lp-window__bar">
          <span className="lp-window__dots" aria-hidden="true" />
          <span>agent session</span>
        </div>
        <ol className="lp-ai__lines">
          {AGENT_SESSION.map(([who, text]) => (
            <li key={text} className={`lp-ai__line lp-ai__line--${who}`}>
              <span className="lp-ai__who">{who === "tool" ? "›" : who}</span>
              <span>{text}</span>
            </li>
          ))}
        </ol>
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
        <Eyebrow index="06">Open source</Eyebrow>
        <h2 className="lp-h2 lp-h2--center">
          <span className="lp-dim">Free and open source.</span>{" "}
          <em className="lp-serif">Ship thousands</em> of templates with
          confidence.
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
    "Why does this exist?",
    "Talqui is a multichannel inbox, and our customers create and send WhatsApp templates every day. We kept paying for the same problems: previews that did not match the phone, templates rejected for rules nobody had written down, and a different API for each provider. Every team that sends WhatsApp at scale runs into the same wall, so we turned our solution into a free, open-source library the whole market can use.",
  ],
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
        <Eyebrow index="07">FAQ</Eyebrow>
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
          template. <em className="lp-serif">Free, today</em>
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
