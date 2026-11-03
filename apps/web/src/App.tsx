import type { Template } from "@talqui-oss/template-builder";
import { useState } from "react";
import { AuthenticationCard } from "./editor/AuthenticationCard";
import { BasicsCard } from "./editor/BasicsCard";
import { ButtonsCard } from "./editor/ButtonsCard";
import { ContentCard } from "./editor/ContentCard";
import { VariablesCard } from "./editor/VariablesCard";
import { PreviewCard } from "./preview/PreviewCard";
import { INITIAL_TEMPLATE } from "./state";

export function App() {
  const [template, setTemplate] = useState<Template>(INITIAL_TEMPLATE);

  return (
    <div className="pg-app">
      <header className="pg-topbar">
        <a className="pg-brand" href="/">
          <span className="pg-brand__mark" aria-hidden="true" />
          Template Builder
        </a>
        <nav className="pg-topbar__links">
          <a href="https://github.com/talqui-oss/template-builder">GitHub</a>
          <a href="https://www.npmjs.com/package/@talqui-oss/template-builder">
            npm
          </a>
        </nav>
      </header>

      <main className="pg-layout">
        <div className="pg-layout__editor">
          <div className="pg-intro">
            <p className="pg-overline">Playground</p>
            <h1 className="pg-title">
              Build a WhatsApp template, <em>see it on the phone.</em>
            </h1>
            <p className="pg-lead">
              Edit the fields, check the rules WhatsApp applies before review,
              and copy the request for your provider. Nothing leaves your
              browser.
            </p>
          </div>
          <BasicsCard template={template} onChange={setTemplate} />
          {template.category === "AUTHENTICATION" ? (
            <AuthenticationCard template={template} onChange={setTemplate} />
          ) : (
            <>
              <ContentCard template={template} onChange={setTemplate} />
              <ButtonsCard template={template} onChange={setTemplate} />
              <VariablesCard template={template} onChange={setTemplate} />
            </>
          )}
        </div>
        <aside className="pg-layout__preview">
          <PreviewCard template={template} />
        </aside>
      </main>
    </div>
  );
}
