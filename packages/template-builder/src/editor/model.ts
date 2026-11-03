import { extractVariables } from "../variables";
import type {
  AuthenticationTemplate,
  Button,
  Category,
  Header,
  StandardTemplate,
  Template,
} from "../schema/types";

/**
 * The template editor as data: sections of fields that a binding renders, and `applyEdit`
 * to turn a change in one field into the next template. React and Vue share this logic and
 * only translate it into elements.
 */

export type EditorOption = { value: string; label: string };

type FieldBase = {
  /** Identifies the field in `applyEdit`, e.g. `"body"` or `"buttons.1.url"`. */
  id: string;
  label: string;
  /** Short note next to the label, such as a character count. */
  hint?: string;
};

export type EditorField =
  | (FieldBase & {
      kind: "text" | "textarea";
      value: string;
      placeholder?: string;
      /** Code-like values (names, URLs, numbers) use a monospaced font. */
      mono?: boolean;
    })
  | (FieldBase & { kind: "select"; value: string; options: EditorOption[] })
  | (FieldBase & { kind: "segment"; value: string; options: EditorOption[] })
  | (FieldBase & { kind: "checkbox"; checked: boolean })
  | (FieldBase & {
      kind: "action";
      icon: "add" | "remove";
      disabled?: boolean;
    });

export type EditorRow = {
  fields: EditorField[];
  /** Rows of a list (one per button) get a compact layout. */
  list?: boolean;
};

export type EditorSection = {
  id: "basics" | "content" | "buttons" | "variables" | "code";
  title: string;
  rows: EditorRow[];
  /** Help text under the section, e.g. the formatting syntax. */
  note?: string;
};

export type EditorOptions = {
  /** Languages offered in the language select. Default: English (US), Portuguese (BR), Spanish. */
  languages?: EditorOption[];
};

const LANGUAGES: EditorOption[] = [
  { value: "en_US", label: "English (US)" },
  { value: "pt_BR", label: "Portuguese (BR)" },
  { value: "es", label: "Spanish" },
];

const CATEGORIES: EditorOption[] = [
  { value: "UTILITY", label: "Utility" },
  { value: "MARKETING", label: "Marketing" },
  { value: "AUTHENTICATION", label: "Authentication" },
];

const HEADER_KINDS: EditorOption[] = [
  { value: "NONE", label: "None" },
  { value: "TEXT", label: "Text" },
  { value: "IMAGE", label: "Image" },
  { value: "VIDEO", label: "Video" },
  { value: "DOCUMENT", label: "Document" },
];

/** Button types the editor creates. Others (flows, catalogs) are kept but shown as quick replies. */
const BUTTON_TYPES: EditorOption[] = [
  { value: "QUICK_REPLY", label: "Quick reply" },
  { value: "URL", label: "Link" },
  { value: "PHONE_NUMBER", label: "Phone" },
  { value: "COPY_CODE", label: "Copy code" },
];

const MAX_BUTTONS = 10;

const count = (text: string, max: number) => `${[...text].length}/${max}`;

/** The sections of the editor for a template. */
export function editorSections(
  template: Template,
  options: EditorOptions = {},
): EditorSection[] {
  const basics: EditorSection = {
    id: "basics",
    title: "Basics",
    rows: [
      {
        fields: [
          {
            kind: "text",
            id: "name",
            label: "Name",
            hint: "lowercase, numbers and _",
            value: template.name,
            mono: true,
          },
        ],
      },
      {
        fields: [
          {
            kind: "select",
            id: "language",
            label: "Language",
            value: template.language,
            options: options.languages ?? LANGUAGES,
          },
          {
            kind: "segment",
            id: "category",
            label: "Category",
            value: template.category,
            options: CATEGORIES,
          },
        ],
      },
    ],
  };
  if (template.category === "AUTHENTICATION")
    return [basics, codeSection(template)];
  return [
    basics,
    contentSection(template),
    buttonsSection(template),
    variablesSection(template),
  ];
}

function contentSection(template: StandardTemplate): EditorSection {
  const header = template.header;
  // Location and product headers are kept as they are but show as "None": not editable yet.
  const kind = HEADER_KINDS.some((option) => option.value === header?.type)
    ? header!.type
    : "NONE";
  const headerRow: EditorField[] = [
    {
      kind: "select",
      id: "header.kind",
      label: "Header",
      value: kind,
      options: HEADER_KINDS,
    },
  ];
  if (header?.type === "TEXT")
    headerRow.push({
      kind: "text",
      id: "header.text",
      label: "Header text",
      hint: count(header.text, 60),
      value: header.text,
    });
  if (header && "url" in header)
    headerRow.push({
      kind: "text",
      id: "header.url",
      label: "Sample file URL",
      value: header.url,
      mono: true,
    });

  return {
    id: "content",
    title: "Content",
    rows: [
      { fields: headerRow },
      {
        fields: [
          {
            kind: "textarea",
            id: "body",
            label: "Body",
            hint: count(template.body.text, 1024),
            value: template.body.text,
          },
        ],
      },
      {
        fields: [
          {
            kind: "text",
            id: "footer",
            label: "Footer",
            hint: count(template.footer?.text ?? "", 60),
            value: template.footer?.text ?? "",
          },
        ],
      },
    ],
    note: "Use {{name}} for variables and *bold*, _italic_, ~strike~ for formatting.",
  };
}

function buttonsSection(template: StandardTemplate): EditorSection {
  const buttons = template.buttons ?? [];
  const rows: EditorRow[] = buttons.map((button, index) => {
    const at = `buttons.${index}`;
    const type = BUTTON_TYPES.some((option) => option.value === button.type)
      ? button.type
      : "QUICK_REPLY";
    const fields: EditorField[] = [
      {
        kind: "select",
        id: `${at}.type`,
        label: "Type",
        value: type,
        options: BUTTON_TYPES,
      },
    ];
    if ("text" in button && button.text !== undefined)
      fields.push({
        kind: "text",
        id: `${at}.text`,
        label: "Button text",
        hint: count(button.text, 25),
        value: button.text,
      });
    if (button.type === "URL")
      fields.push({
        kind: "text",
        id: `${at}.url`,
        label: "URL",
        value: button.url,
        mono: true,
      });
    if (button.type === "PHONE_NUMBER")
      fields.push({
        kind: "text",
        id: `${at}.phoneNumber`,
        label: "Phone number",
        value: button.phoneNumber,
        mono: true,
      });
    if (button.type === "COPY_CODE")
      fields.push({
        kind: "text",
        id: `${at}.example`,
        label: "Sample code",
        value: button.example,
        mono: true,
      });
    fields.push({
      kind: "action",
      id: `${at}.remove`,
      label: "Remove button",
      icon: "remove",
    });
    return { fields, list: true };
  });
  rows.push({
    fields: [
      {
        kind: "action",
        id: "buttons.add",
        label: "Add button",
        icon: "add",
        disabled: buttons.length >= MAX_BUTTONS,
      },
    ],
  });
  return {
    id: "buttons",
    title: `Buttons ${buttons.length}/${MAX_BUTTONS}`,
    rows,
  };
}

function variablesSection(template: StandardTemplate): EditorSection {
  const variables = Object.entries(template.variables ?? {});
  return {
    id: "variables",
    title: "Variables",
    rows: variables.map(([name, variable], index) => ({
      fields: [
        {
          kind: "text",
          id: `variables.${name}`,
          label: `{{${name}}}`,
          hint: `position ${index + 1}`,
          value: variable.example,
          placeholder: "Example value",
        },
      ],
    })),
    note: variables.length
      ? undefined
      : "Type a placeholder such as {{first_name}} in the text to add one.",
  };
}

function codeSection(template: AuthenticationTemplate): EditorSection {
  const minutes = template.footer?.codeExpirationMinutes;
  return {
    id: "code",
    title: "Code message",
    rows: [
      {
        fields: [
          {
            kind: "checkbox",
            id: "body.addSecurityRecommendation",
            label: "Add “do not share this code”",
            checked: template.body?.addSecurityRecommendation ?? false,
          },
        ],
      },
      {
        fields: [
          {
            kind: "text",
            id: "footer.codeExpirationMinutes",
            label: "Expires after",
            hint: "minutes, 1 to 90",
            value: minutes === undefined ? "" : String(minutes),
            mono: true,
          },
          {
            kind: "text",
            id: "button.text",
            label: "Button text",
            hint: "optional",
            value: template.button.text ?? "",
            placeholder: "Copy code",
          },
        ],
      },
    ],
  };
}

/**
 * The template after an edit. `value` is the new text or option for inputs and selects, a
 * boolean for checkboxes, and nothing for actions. Placeholders added or removed in the text
 * are synced into `variables`, keeping the examples already typed.
 */
export function applyEdit(
  template: Template,
  id: string,
  value?: string | boolean,
): Template {
  const text = typeof value === "string" ? value : "";
  if (id === "name") return { ...template, name: text };
  if (id === "language") return { ...template, language: text };
  if (id === "category") return changeCategory(template, text as Category);

  if (template.category === "AUTHENTICATION") {
    if (id === "body.addSecurityRecommendation")
      return {
        ...template,
        body: { addSecurityRecommendation: value === true },
      };
    if (id === "footer.codeExpirationMinutes") {
      const digits = text.replace(/\D/g, "");
      return {
        ...template,
        footer: digits ? { codeExpirationMinutes: Number(digits) } : undefined,
      };
    }
    if (id === "button.text")
      return {
        ...template,
        button: { ...template.button, text: text || undefined },
      };
    return template;
  }

  if (id.startsWith("variables."))
    return {
      ...template,
      variables: {
        ...template.variables,
        [id.slice("variables.".length)]: { example: text },
      },
    };
  return syncVariables(editStandard(template, id, text));
}

function editStandard(
  template: StandardTemplate,
  id: string,
  text: string,
): StandardTemplate {
  if (id === "header.kind") return { ...template, header: newHeader(text) };
  if (id === "header.text")
    return { ...template, header: { type: "TEXT", text } };
  if (id === "header.url" && template.header && "url" in template.header)
    return { ...template, header: { ...template.header, url: text } };
  if (id === "body") return { ...template, body: { text } };
  if (id === "footer")
    return { ...template, footer: text ? { text } : undefined };

  const buttons = template.buttons ?? [];
  const withButtons = (next: Button[]) => ({
    ...template,
    buttons: next.length ? next : undefined,
  });
  if (id === "buttons.add")
    return buttons.length >= MAX_BUTTONS
      ? template
      : withButtons([...buttons, newButton("QUICK_REPLY")]);

  const match = /^buttons\.(\d+)\.(\w+)$/.exec(id);
  if (!match) return template;
  const index = Number(match[1]);
  const field = match[2]!;
  const button = buttons[index];
  if (!button) return template;
  if (field === "remove")
    return withButtons(buttons.filter((_, i) => i !== index));
  const next =
    field === "type"
      ? newButton(
          text as Button["type"],
          "text" in button ? (button.text ?? "") : "",
        )
      : ({ ...button, [field]: text } as Button);
  return withButtons(
    buttons.map((current, i) => (i === index ? next : current)),
  );
}

/**
 * Switches category. Authentication has its own shape, so moving in or out of it keeps only
 * the name and language.
 */
export function changeCategory(
  template: Template,
  category: Category,
): Template {
  const { name, language } = template;
  if (category === "AUTHENTICATION")
    return {
      name,
      language,
      category,
      body: { addSecurityRecommendation: true },
      footer: { codeExpirationMinutes: 10 },
      button: { type: "OTP", otpType: "COPY_CODE" },
    };
  if (template.category === "AUTHENTICATION")
    return { name, language, category, body: { text: "" } };
  return { ...template, category };
}

/** Keeps `variables` in step with the placeholders used in the text, preserving typed examples. */
export function syncVariables(template: StandardTemplate): StandardTemplate {
  const current = template.variables ?? {};
  const variables = Object.fromEntries(
    extractVariables(template).map((name) => [
      name,
      current[name] ?? { example: "" },
    ]),
  );
  return {
    ...template,
    variables: Object.keys(variables).length ? variables : undefined,
  };
}

function newHeader(kind: string): Header | undefined {
  if (kind === "TEXT") return { type: "TEXT", text: "" };
  if (kind === "IMAGE" || kind === "VIDEO" || kind === "DOCUMENT")
    return { type: kind, url: "https://" };
  return undefined;
}

/** A new button of the given type, keeping the label when the type changes. */
function newButton(type: Button["type"], label = ""): Button {
  if (type === "URL")
    return { type, text: label || "Open link", url: "https://" };
  if (type === "PHONE_NUMBER")
    return { type, text: label || "Call us", phoneNumber: "+" };
  if (type === "COPY_CODE") return { type, example: "CODE10" };
  return { type: "QUICK_REPLY", text: label || "Reply" };
}
