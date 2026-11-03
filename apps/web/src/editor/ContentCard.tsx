import type { Header, StandardTemplate } from "@talqui-oss/template-builder";
import { Card } from "../components/Card";
import { Field, Select } from "../components/Field";
import { withVariables } from "../state";

type HeaderKind = "NONE" | "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT";

const HEADER_KINDS: { value: HeaderKind; label: string }[] = [
  { value: "NONE", label: "None" },
  { value: "TEXT", label: "Text" },
  { value: "IMAGE", label: "Image" },
  { value: "VIDEO", label: "Video" },
  { value: "DOCUMENT", label: "Document" },
];

function headerFor(kind: HeaderKind): Header | undefined {
  if (kind === "NONE") return undefined;
  if (kind === "TEXT") return { type: "TEXT", text: "" };
  return { type: kind, url: "https://" };
}

type Props = {
  template: StandardTemplate;
  onChange: (template: StandardTemplate) => void;
};

export function ContentCard({ template, onChange }: Props) {
  const header = template.header;
  // Location and product headers are not editable here yet; they show as "None".
  const kind =
    HEADER_KINDS.find((option) => option.value === header?.type)?.value ??
    "NONE";
  // Text edits can add or remove placeholders, so variables are re-synced each time.
  const update = (patch: Partial<StandardTemplate>) =>
    onChange(withVariables({ ...template, ...patch }));

  return (
    <Card index="02" title="Content">
      <div className="pg-row">
        <Field label="Header">
          {(id) => (
            <Select
              id={id}
              value={kind}
              options={HEADER_KINDS}
              onChange={(next) => update({ header: headerFor(next) })}
            />
          )}
        </Field>
        {header?.type === "TEXT" && (
          <Field label="Header text" hint={`${header.text.length}/60`}>
            {(id) => (
              <input
                id={id}
                className="pg-input"
                value={header.text}
                onChange={(event) =>
                  update({ header: { type: "TEXT", text: event.target.value } })
                }
              />
            )}
          </Field>
        )}
        {header && "url" in header && (
          <Field label="Sample file URL">
            {(id) => (
              <input
                id={id}
                className="pg-input pg-input--mono"
                value={header.url}
                onChange={(event) =>
                  update({ header: { ...header, url: event.target.value } })
                }
              />
            )}
          </Field>
        )}
      </div>
      <Field label="Body" hint={`${[...template.body.text].length}/1024`}>
        {(id) => (
          <textarea
            id={id}
            className="pg-input pg-input--area"
            rows={7}
            value={template.body.text}
            onChange={(event) => update({ body: { text: event.target.value } })}
          />
        )}
      </Field>
      <p className="pg-note">
        Use <code>{"{{name}}"}</code> for variables and <code>*bold*</code>,{" "}
        <code>_italic_</code>, <code>~strike~</code> for formatting.
      </p>
      <Field label="Footer" hint={`${template.footer?.text.length ?? 0}/60`}>
        {(id) => (
          <input
            id={id}
            className="pg-input"
            value={template.footer?.text ?? ""}
            onChange={(event) =>
              update({
                footer: event.target.value
                  ? { text: event.target.value }
                  : undefined,
              })
            }
          />
        )}
      </Field>
    </Card>
  );
}
