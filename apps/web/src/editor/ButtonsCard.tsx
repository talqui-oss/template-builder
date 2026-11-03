import type { Button, StandardTemplate } from "@talqui-oss/template-builder";
import { Card } from "../components/Card";
import { Select } from "../components/Field";
import {
  BUTTON_TYPES,
  newButton,
  withVariables,
  type EditableButtonType,
} from "../state";

const MAX_BUTTONS = 10;

const TYPE_LABELS: Record<EditableButtonType, string> = {
  QUICK_REPLY: "Quick reply",
  URL: "Link",
  PHONE_NUMBER: "Phone",
  COPY_CODE: "Copy code",
};

type Props = {
  template: StandardTemplate;
  onChange: (template: StandardTemplate) => void;
};

export function ButtonsCard({ template, onChange }: Props) {
  const buttons = template.buttons ?? [];
  const setButtons = (next: Button[]) =>
    onChange(
      withVariables({ ...template, buttons: next.length ? next : undefined }),
    );
  const replace = (index: number, button: Button) =>
    setButtons(buttons.map((current, i) => (i === index ? button : current)));

  return (
    <Card
      index="03"
      title="Buttons"
      actions={
        <span className="pg-card__meta">
          {buttons.length}/{MAX_BUTTONS}
        </span>
      }
    >
      {buttons.map((button, index) => (
        <div className="pg-button-row" key={index}>
          <Select
            value={
              (BUTTON_TYPES as readonly string[]).includes(button.type)
                ? (button.type as EditableButtonType)
                : "QUICK_REPLY"
            }
            options={BUTTON_TYPES.map((type) => ({
              value: type,
              label: TYPE_LABELS[type],
            }))}
            onChange={(type) =>
              replace(
                index,
                newButton(type, "text" in button ? button.text : ""),
              )
            }
          />
          {"text" in button && button.text !== undefined && (
            <input
              aria-label="Button text"
              className="pg-input"
              value={button.text}
              onChange={(event) =>
                replace(index, { ...button, text: event.target.value })
              }
            />
          )}
          {button.type === "URL" && (
            <input
              aria-label="URL"
              className="pg-input pg-input--mono"
              value={button.url}
              onChange={(event) =>
                replace(index, { ...button, url: event.target.value })
              }
            />
          )}
          {button.type === "PHONE_NUMBER" && (
            <input
              aria-label="Phone number"
              className="pg-input pg-input--mono"
              value={button.phoneNumber}
              onChange={(event) =>
                replace(index, { ...button, phoneNumber: event.target.value })
              }
            />
          )}
          {button.type === "COPY_CODE" && (
            <input
              aria-label="Sample code"
              className="pg-input pg-input--mono"
              value={button.example}
              onChange={(event) =>
                replace(index, { ...button, example: event.target.value })
              }
            />
          )}
          <button
            type="button"
            className="pg-icon-button"
            aria-label="Remove button"
            onClick={() => setButtons(buttons.filter((_, i) => i !== index))}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        className="pg-add"
        disabled={buttons.length >= MAX_BUTTONS}
        onClick={() => setButtons([...buttons, newButton("QUICK_REPLY")])}
      >
        + Add button
      </button>
    </Card>
  );
}
