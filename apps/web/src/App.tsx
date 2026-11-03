import type { Template } from "@talqui-oss/template-builder";
import { TemplateEditor } from "@talqui-oss/template-builder-react";
import { useEffect, useState } from "react";
import { PreviewCard } from "./preview/PreviewCard";
import { templateFromHash, templateLink } from "./state";

export function App() {
  const [template, setTemplate] = useState<Template>(templateFromHash);
  const [copied, setCopied] = useState(false);

  // The URL always carries the current template, so the address bar is the share link.
  useEffect(() => {
    history.replaceState(null, "", templateLink(template));
  }, [template]);

  const share = () => {
    void navigator.clipboard.writeText(location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="pg-app">
      <header className="pg-topbar">
        <a className="pg-brand" href="/">
          <span className="pg-brand__mark" aria-hidden="true" />
          Template Builder
        </a>
        <nav className="pg-topbar__links">
          <a href="/whatsapp-template">Catalog</a>
          <a href="/agents">For agents</a>
          <a href="https://github.com/talqui-oss/template-builder">GitHub</a>
          <a href="https://www.npmjs.com/package/@talqui-oss/template-builder">
            npm
          </a>
          <button type="button" className="pg-share" onClick={share}>
            {copied ? "Link copied" : "Share"}
          </button>
        </nav>
      </header>

      <main className="pg-layout">
        <div className="pg-layout__editor">
          <div className="pg-intro">
            <p className="pg-overline">Playground</p>
            <h1 className="pg-title">
              Free WhatsApp template builder, <em>see it on the phone.</em>
            </h1>
            <p className="pg-lead">
              Preview a WhatsApp message template as it arrives on the phone,
              check the rules Meta applies at review, share it as a link,
              download it as an image and copy the API request. Nothing leaves
              your browser.
            </p>
          </div>
          <TemplateEditor
            template={template}
            onChange={setTemplate}
            className="pg-editor"
          />
        </div>
        <aside className="pg-layout__preview">
          <PreviewCard template={template} />
        </aside>
      </main>
    </div>
  );
}
