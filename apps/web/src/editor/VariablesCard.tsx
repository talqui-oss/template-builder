import type { StandardTemplate } from "@talqui-oss/template-builder";
import { Card } from "../components/Card";
import { Field } from "../components/Field";

type Props = {
  template: StandardTemplate;
  onChange: (template: StandardTemplate) => void;
};

/** One example field per `{{name}}` found in the template, in positional order. */
export function VariablesCard({ template, onChange }: Props) {
  const variables = Object.entries(template.variables ?? {});
  return (
    <Card index="04" title="Variables">
      {variables.length === 0 && (
        <p className="pg-note">
          Type a placeholder such as {"{{first_name}}"} in the text to add one.
        </p>
      )}
      {variables.map(([name, variable], index) => (
        <Field key={name} label={`{{${name}}}`} hint={`position ${index + 1}`}>
          {(id) => (
            <input
              id={id}
              className="pg-input"
              placeholder="Example value"
              value={variable.example}
              onChange={(event) =>
                onChange({
                  ...template,
                  variables: {
                    ...template.variables,
                    [name]: { example: event.target.value },
                  },
                })
              }
            />
          )}
        </Field>
      ))}
    </Card>
  );
}
