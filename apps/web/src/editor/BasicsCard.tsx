import type { Category, Template } from "@talqui-oss/template-builder";
import { Card } from "../components/Card";
import { Field, Select } from "../components/Field";
import { Segment } from "../components/Segment";
import { withCategory } from "../state";

const LANGUAGES = [
  { value: "en_US", label: "English (US)" },
  { value: "pt_BR", label: "Portuguese (BR)" },
  { value: "es", label: "Spanish" },
];

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "UTILITY", label: "Utility" },
  { id: "MARKETING", label: "Marketing" },
  { id: "AUTHENTICATION", label: "Authentication" },
];

type Props = { template: Template; onChange: (template: Template) => void };

export function BasicsCard({ template, onChange }: Props) {
  return (
    <Card index="01" title="Basics">
      <Field label="Name" hint="lowercase, numbers and _">
        {(id) => (
          <input
            id={id}
            className="pg-input pg-input--mono"
            value={template.name}
            onChange={(event) =>
              onChange({ ...template, name: event.target.value })
            }
          />
        )}
      </Field>
      <div className="pg-row">
        <Field label="Language">
          {(id) => (
            <Select
              id={id}
              value={template.language}
              options={LANGUAGES}
              onChange={(language) => onChange({ ...template, language })}
            />
          )}
        </Field>
        <Field label="Category">
          {() => (
            <Segment
              label="Category"
              items={CATEGORIES}
              value={template.category}
              onChange={(category) =>
                onChange(withCategory(template, category))
              }
            />
          )}
        </Field>
      </div>
    </Card>
  );
}
