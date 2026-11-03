import {
  toCurl,
  toRequests,
  validate,
  type Issue,
  type Template,
} from "@talqui-oss/template-builder";
import { meta } from "@talqui-oss/template-builder/adapters/meta";
import { talqui } from "@talqui-oss/template-builder/adapters/talqui";
import { twilio } from "@talqui-oss/template-builder/adapters/twilio";
import { useRef, useState } from "react";
import { Card } from "../components/Card";
import { Segment } from "../components/Segment";
import { downloadImage, type ImageFormat } from "./exportImage";
import { PhoneView } from "./PhoneView";

type View = "phone" | "json" | "curl";
type Provider = "meta" | "twilio" | "talqui";

const ADAPTERS = { meta, twilio, talqui };

export function PreviewCard({ template }: { template: Template }) {
  const [view, setView] = useState<View>("phone");
  const [provider, setProvider] = useState<Provider>("meta");
  const [exporting, setExporting] = useState(false);
  const screen = useRef<HTMLDivElement>(null);
  const { issues } = validate(template);

  async function download(format: ImageFormat) {
    if (!screen.current) return;
    setExporting(true);
    try {
      await downloadImage(screen.current, format, template.name);
    } finally {
      setExporting(false);
    }
  }

  return (
    <Card
      title="Preview"
      className="pg-preview"
      actions={
        <Segment
          label="Preview mode"
          value={view}
          onChange={setView}
          items={[
            { id: "phone", label: "Phone" },
            { id: "json", label: "JSON" },
            { id: "curl", label: "cURL" },
          ]}
        />
      }
    >
      {view === "phone" && (
        <>
          <div className="pg-preview__toolbar">
            <Segment
              label="Platform"
              value="ios"
              onChange={() => undefined}
              items={[
                { id: "ios", label: "iPhone" },
                {
                  id: "android",
                  label: "Android",
                  disabled: true,
                  badge: "Soon",
                },
              ]}
            />
            <div className="pg-preview__downloads">
              {(["png", "jpg", "webp"] as const).map((format) => (
                <button
                  key={format}
                  type="button"
                  className="pg-chip"
                  disabled={exporting}
                  onClick={() => download(format)}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <PhoneView template={template} platform="ios" screenRef={screen} />
        </>
      )}
      {view === "json" && (
        <CodeBlock code={JSON.stringify(template, null, 2)} />
      )}
      {view === "curl" && (
        <>
          <div className="pg-preview__toolbar">
            <Segment
              label="Provider"
              value={provider}
              onChange={setProvider}
              items={[
                { id: "meta", label: "Meta" },
                { id: "twilio", label: "Twilio" },
                { id: "talqui", label: "Talqui" },
              ]}
            />
          </div>
          <CodeBlock code={curlFor(template, provider)} />
        </>
      )}
      <IssueList issues={issues} />
    </Card>
  );
}

function curlFor(template: Template, provider: Provider): string {
  try {
    return toCurl(toRequests(template, ADAPTERS[provider]()));
  } catch (error) {
    return `# ${(error as Error).message}`;
  }
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="pg-code">
      <button
        type="button"
        className="pg-chip pg-code__copy"
        onClick={async () => {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="pg-code__pre">{code}</pre>
    </div>
  );
}

function IssueList({ issues }: { issues: Issue[] }) {
  if (issues.length === 0)
    return (
      <p className="pg-issues pg-issues--ok">
        Ready for review: no issues found.
      </p>
    );
  return (
    <ul className="pg-issues">
      {issues.map((issue, index) => (
        <li key={index} className={`pg-issue pg-issue--${issue.severity}`}>
          <code className="pg-issue__code">{issue.code}</code>
          <span>{issue.message}</span>
        </li>
      ))}
    </ul>
  );
}
