import { codes } from "@talqui-oss/template-builder";
import { useState } from "react";
import { AsciiArt } from "../landing/AsciiArt";

const RULE = "=".repeat(80);
const GITHUB = "https://github.com/talqui-oss/template-builder";
const NPM = "https://www.npmjs.com/package/@talqui-oss/template-builder";

/** Quickstart lines: code on the left, a comment on the right. */
const QUICKSTART = {
  Node: [
    ["npm install @talqui-oss/template-builder", ""],
    [
      'import { validate, toRequests, toCurl } from "@talqui-oss/template-builder"',
      "",
    ],
    ['import { meta } from "@talqui-oss/template-builder/adapters/meta"', ""],
    ["validate(template)", "# { valid, issues }"],
    ["toRequests(template, meta())", "# HTTP requests"],
    ["toCurl(requests)", "# the same, as cURL"],
  ],
  Preview: [
    ["npm install @talqui-oss/template-builder-react", "# or -vue"],
    ['import "@talqui-oss/template-builder/styles.css"', "# once"],
    ["<TemplatePreview template={template} />", "# the phone view"],
    ["toPreviewModel(template)", "# the same, as data"],
  ],
} as const;

const SCHEMA = `{
  "$schema": "https://template-builder.dev/schema.json",
  "name": "order_shipped",
  "language": "en_US",
  "category": "UTILITY",
  "header": { "type": "TEXT", "text": "Order {{order}} shipped" },
  "body": { "text": "Hi {{name}}, your order *{{order}}* is on the way." },
  "buttons": [
    { "type": "URL", "text": "Track", "url": "https://acme.com/t/{{order}}" }
  ],
  "variables": {
    "name": { "example": "Maria" },
    "order": { "example": "4512" }
  }
}`;

const RULE_SAMPLE = [
  "BODY_TOO_LONG",
  "PARAM_AT_EDGE",
  "PARAM_ADJACENT",
  "VARIABLE_MISSING_EXAMPLE",
  "HEADER_EMOJI",
  "BUTTON_ORDER_DETAILS_TEXT",
] as const;

/** The page for AI agents at `/agents`: plain text, in the order an agent needs it. */
export function Agents() {
  const [tab, setTab] = useState<keyof typeof QUICKSTART>("Node");
  const ruleCount = Object.keys(codes).length;

  return (
    <div className="ag-page">
      <main className="ag-text">
        <p className="ag-muted">{RULE}</p>
        <p>
          |&nbsp;&nbsp;Human? Visit <a href="/">template-builder.dev</a> for the
          human version.
        </p>
        <p className="ag-muted">{RULE}</p>

        <h1>
          TEMPLATE-BUILDER.DEV
          <br />
          WHATSAPP TEMPLATES FOR AGENTS
        </h1>
        <p className="ag-gap">
          You can write the message. WhatsApp decides if it ships.
          <br />
          One JSON schema to preview, validate and create templates on Meta,
          Twilio and Talqui.
        </p>
        <p className="ag-muted">{RULE}</p>

        <h2>* QUICKSTART</h2>
        <p>
          If you are an agent visiting this page, install the package and
          validate the template before you create it. No signup or API key is
          needed to validate.
        </p>
        <p className="ag-tabs" role="tablist">
          {(Object.keys(QUICKSTART) as (keyof typeof QUICKSTART)[]).map(
            (name, index) => (
              <span key={name}>
                {index > 0 && <span className="ag-muted"> | </span>}
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === name}
                  onClick={() => setTab(name)}
                >
                  {name}
                </button>
              </span>
            ),
          )}
        </p>
        <div className="ag-lines">
          {QUICKSTART[tab].map(([code, comment]) => (
            <p key={code}>
              <span className="ag-code">{code}</span>
              <span className="ag-muted">{comment}</span>
            </p>
          ))}
        </div>

        <h2>* SCHEMA</h2>
        <p>
          A template is one JSON document. Placeholders are named,{" "}
          <code>{"{{name}}"}</code>, and every one needs an example. The full
          schema is at <a href="/schema.json">/schema.json</a>.
        </p>
        <pre className="ag-pre">{SCHEMA}</pre>

        <h2>* HOW IT WORKS</h2>
        <ul className="ag-list">
          <li>
            <code>validate</code> runs the checks WhatsApp applies at review.
            Each issue has a code, a path and a severity; warnings do not block.
          </li>
          <li>
            <code>toRequests</code> turns the template into the HTTP requests a
            provider expects. Credentials stay placeholders such as{" "}
            <code>$WABA_ID</code> unless you pass them.
          </li>
          <li>
            <code>toCurl</code> prints those requests as cURL, ready for a shell
            with the variables exported.
          </li>
          <li>
            Nothing is sent by the package. You or the provider send the
            request.
          </li>
        </ul>

        <h2>
          * RULES <span className="ag-muted">({ruleCount} codes)</span>
        </h2>
        <div className="ag-lines">
          {RULE_SAMPLE.map((code) => (
            <p key={code}>
              <span className="ag-code">{code}</span>
              <span className="ag-muted"># {codes[code]}</span>
            </p>
          ))}
        </div>
        <p>
          Fix every <code>error</code> before creating the template; each one is
          a rejection at review.
        </p>

        <h2>* ADAPTERS</h2>
        <ul className="ag-list">
          <li>
            Meta. <code>meta({"{ wabaId, accessToken }"})</code> for the Cloud
            API. Verified.
          </li>
          <li>
            Talqui. <code>talqui({"{ tenantId, channelId }"})</code> for a
            Talqui workspace. Verified.
          </li>
          <li>
            Twilio. <code>twilio({"{ accountSid, authToken }"})</code> for the
            Content API. Not yet verified.
          </li>
          <li>
            Other. <code>defineAdapter({"{ name, toRequests }"})</code> writes
            your own.
          </li>
        </ul>

        <h2>* LINKS</h2>
        <p className="ag-links">
          <a href={GITHUB}>github</a> <span className="ag-muted">|</span>{" "}
          <a href={NPM}>npm</a> <span className="ag-muted">|</span>{" "}
          <a href="/schema.json">schema.json</a>{" "}
          <span className="ag-muted">|</span> <a href="/llms.txt">llms.txt</a>{" "}
          <span className="ag-muted">|</span>{" "}
          <a href="/playground">playground</a>{" "}
          <span className="ag-muted">|</span> <a href="/">for humans</a>
        </p>
        <p className="ag-muted">Built by Talqui, and open source.</p>
      </main>

      <aside className="ag-figure" aria-hidden="true">
        <span className="ag-figure__caption ag-figure__caption--top">
          FIG. 01 — TEMPLATE
        </span>
        <AsciiArt cols={110} rows={60} className="ag-figure__art" />
        <p className="ag-figure__bubble">
          <span className="ag-muted">order_shipped via meta</span>
          <br />
          &gt; Approved. Ready to send.
          <span className="ag-caret" />
        </p>
        <span className="ag-figure__caption ag-figure__caption--bottom">
          0 ERRORS / 0 WARNINGS
        </span>
      </aside>
    </div>
  );
}
