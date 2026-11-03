import type { Template } from "@talqui-oss/template-builder";
import {
  TemplateEditor,
  TemplatePreview,
} from "@talqui-oss/template-builder-react";
import { useState } from "react";
import { EXAMPLES } from "../examples";
import {
  Eyebrow,
  Footer,
  Header,
  InstallCommand,
  Joint,
  useCopy,
} from "../landing/parts";

const REACT = `import { useState } from "react";
import {
  TemplateEditor,
  TemplatePreview,
} from "@talqui-oss/template-builder-react";
import "@talqui-oss/template-builder/styles.css";
import "@talqui-oss/template-builder/editor.css";

export function TemplateForm({ initial }) {
  const [template, setTemplate] = useState(initial);
  return (
    <>
      <TemplateEditor template={template} onChange={setTemplate} />
      <TemplatePreview template={template} />
    </>
  );
}`;

const VUE = `<template>
  <TemplateEditor v-model:template="template" />
  <TemplatePreview :template="template" />
</template>

<script>
import {
  TemplateEditor,
  TemplatePreview,
} from "@talqui-oss/template-builder-vue";
import "@talqui-oss/template-builder/styles.css";
import "@talqui-oss/template-builder/editor.css";

export default {
  name: "TemplateForm",
  components: { TemplateEditor, TemplatePreview },
  props: { initial: { type: Object, required: true } },
  data() {
    return { template: this.initial };
  },
};
</script>`;

const THEME = `.tb-editor {
  --tb-editor-font: "Inter", sans-serif;
  --tb-editor-accent: #7c3aed;
  --tb-editor-surface: #ffffff;
  --tb-editor-control: #fafafa;
  --tb-editor-radius: 12px;
}`;

const BACKEND = `import { validate, toRequests } from "@talqui-oss/template-builder";
import { meta } from "@talqui-oss/template-builder/adapters/meta";

// POST /templates: what the editor submits
export async function createTemplate(template) {
  const { valid, issues } = validate(template);
  if (!valid) return { status: 422, issues };

  const [request] = toRequests(
    template,
    meta({ wabaId: process.env.WABA_ID, accessToken: process.env.META_TOKEN }),
  );
  const response = await fetch(request.url, {
    method: request.method,
    headers: request.headers,
    body: JSON.stringify(request.body),
  });
  return { status: response.status, body: await response.json() };
}`;

/** `/editor`: the embeddable editor, live, with the code to add it to a product. */
export function EditorPage() {
  const [template, setTemplate] = useState<Template>(EXAMPLES[0]!.template);

  return (
    <div className="lp-page">
      <div className="lp-frame">
        <Header />
        <section className="lp-rails ct-hero">
          <Eyebrow index="—">Editor</Eyebrow>
          <h1 className="lp-h2 ct-hero__title">
            Add a free WhatsApp template editor{" "}
            <em className="lp-serif">to your product</em>
          </h1>
          <p className="lp-lead ct-hero__lead">
            Let your users write WhatsApp templates inside your app, with the
            phone preview next to the form and Meta's review rules checked as
            they type. One component for React or Vue, themed with CSS
            variables.
          </p>
          <div className="ed-install">
            <InstallCommand command="npm i @talqui-oss/template-builder @talqui-oss/template-builder-react" />
          </div>
        </section>
        <Joint />

        <section className="lp-rails lp-section ed-demo">
          <Eyebrow index="01">Live demo</Eyebrow>
          <h2 className="lp-h2">
            The editor, <em className="lp-serif">with its default theme</em>
          </h2>
          <div className="ed-demo__grid">
            <div className="ed-demo__editor">
              <TemplateEditor template={template} onChange={setTemplate} />
            </div>
            <div className="ed-demo__preview">
              <div className="lp-screen">
                <div className="lp-screen__wallpaper" aria-hidden="true" />
                <TemplatePreview template={template} time="09:41" />
              </div>
            </div>
          </div>
        </section>
        <Joint />

        <section className="lp-rails lp-section">
          <Eyebrow index="02">Frontend</Eyebrow>
          <h2 className="lp-h2">
            React or Vue, <em className="lp-serif">the same HTML</em>
          </h2>
          <p className="lp-lead">
            Both components render the same markup from the same core, so the
            styles and the behavior match. The editor keeps placeholders and
            their examples in sync as people type.
          </p>
          <div className="ct-dev__grid">
            <CodeBlock title="React" code={REACT} />
            <CodeBlock title="Vue 3" code={VUE} />
          </div>
        </section>
        <Joint />

        <section className="lp-rails lp-section">
          <Eyebrow index="03">Theme</Eyebrow>
          <h2 className="lp-h2">
            Your design system, <em className="lp-serif">your colors</em>
          </h2>
          <p className="lp-lead">
            Every color, font and radius is a CSS custom property on{" "}
            <code>.tb-editor</code>. The playground uses the same component with
            a dark theme.
          </p>
          <div className="ct-dev__grid">
            <CodeBlock title="theme.css" code={THEME} />
          </div>
        </section>
        <Joint />

        <section className="lp-rails lp-section">
          <Eyebrow index="04">Backend</Eyebrow>
          <h2 className="lp-h2">
            Create the template on Meta{" "}
            <em className="lp-serif">from your API</em>
          </h2>
          <p className="lp-lead">
            Validate again on the server and send the request the adapter
            builds. Your access token never reaches the browser.
          </p>
          <div className="ct-dev__grid">
            <CodeBlock title="api/templates.ts" code={BACKEND} />
          </div>
        </section>
        <Joint />
        <Footer />
      </div>
    </div>
  );
}

function CodeBlock({ title, code }: { title: string; code: string }) {
  const { copied, copy } = useCopy();
  return (
    <div className="ct-block">
      <p className="ct-block__title">
        {title}
        <button
          type="button"
          className="ct-block__copy"
          onClick={() => copy(code)}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </p>
      <pre className="ct-block__code">{code}</pre>
    </div>
  );
}
