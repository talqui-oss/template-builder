import type { AuthenticationTemplate } from "@talqui-oss/template-builder";
import { Card } from "../components/Card";
import { Field } from "../components/Field";

type Props = {
  template: AuthenticationTemplate;
  onChange: (template: AuthenticationTemplate) => void;
};

/** Authentication templates have no free text: WhatsApp writes the message around the code. */
export function AuthenticationCard({ template, onChange }: Props) {
  const minutes = template.footer?.codeExpirationMinutes;
  return (
    <Card index="02" title="Code message">
      <label className="pg-check">
        <input
          type="checkbox"
          checked={template.body?.addSecurityRecommendation ?? false}
          onChange={(event) =>
            onChange({
              ...template,
              body: { addSecurityRecommendation: event.target.checked },
            })
          }
        />
        Add “do not share this code”
      </label>
      <div className="pg-row">
        <Field label="Expires after" hint="minutes, 1 to 90">
          {(id) => (
            <input
              id={id}
              className="pg-input pg-input--mono"
              inputMode="numeric"
              value={minutes ?? ""}
              onChange={(event) => {
                const value = event.target.value.replace(/\D/g, "");
                onChange({
                  ...template,
                  footer: value
                    ? { codeExpirationMinutes: Number(value) }
                    : undefined,
                });
              }}
            />
          )}
        </Field>
        <Field label="Button text" hint="optional">
          {(id) => (
            <input
              id={id}
              className="pg-input"
              placeholder="Copy code"
              value={template.button.text ?? ""}
              onChange={(event) =>
                onChange({
                  ...template,
                  button: {
                    ...template.button,
                    text: event.target.value || undefined,
                  },
                })
              }
            />
          )}
        </Field>
      </div>
    </Card>
  );
}
