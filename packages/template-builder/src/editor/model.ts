import { extractVariables } from "../variables";
import type {
  AuthenticationTemplate,
  Button,
  Category,
  Header,
  StandardTemplate,
  Template,
  Variables,
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

/** Every text the editor shows, so it can be translated. */
export type EditorLabels = typeof EDITOR_LABELS;

/** The editor texts in English, the default. */
export const EDITOR_LABELS = {
  basics: "Basics",
  name: "Name",
  nameHint: "lowercase, numbers and _",
  language: "Language",
  category: "Category",
  utility: "Utility",
  marketing: "Marketing",
  authentication: "Authentication",
  content: "Content",
  header: "Header",
  headerNone: "None",
  headerText: "Text",
  headerImage: "Image",
  headerVideo: "Video",
  headerDocument: "Document",
  headerTextField: "Header text",
  sampleFileUrl: "Sample file URL",
  body: "Body",
  footer: "Footer",
  formattingNote:
    "Use {{name}} for variables and *bold*, _italic_, ~strike~ for formatting.",
  buttons: "Buttons",
  buttonType: "Type",
  quickReply: "Quick reply",
  link: "Link",
  phone: "Phone",
  copyCode: "Copy code",
  buttonText: "Button text",
  url: "URL",
  phoneNumber: "Phone number",
  sampleCode: "Sample code",
  removeButton: "Remove button",
  addButton: "Add button",
  variables: "Variables",
  /** Followed by the variable's number, e.g. "position 1". */
  variablePosition: "position",
  exampleValue: "Example value",
  noVariables:
    "Type a placeholder such as {{first_name}} in the text to add one.",
  codeMessage: "Code message",
  securityRecommendation: "Add “do not share this code”",
  expiresAfter: "Expires after",
  expiresHint: "minutes, 1 to 90",
  optional: "optional",
  /** Default text of new buttons. */
  newQuickReply: "Reply",
  newLinkButton: "Open link",
  newPhoneButton: "Call us",
};

export type EditorOptions = {
  /** Languages offered in the language select. Default: English (US), Portuguese (BR), Spanish. */
  languages?: EditorOption[];
  /** Texts to replace, e.g. to show the editor in another language. Default: English. */
  labels?: Partial<EditorLabels>;
};

const LANGUAGES: EditorOption[] = [
  { value: "en_US", label: "English (US)" },
  { value: "pt_BR", label: "Portuguese (BR)" },
  { value: "es", label: "Spanish" },
];

const categories = (l: EditorLabels): EditorOption[] => [
  { value: "UTILITY", label: l.utility },
  { value: "MARKETING", label: l.marketing },
  { value: "AUTHENTICATION", label: l.authentication },
];

const headerKinds = (l: EditorLabels): EditorOption[] => [
  { value: "NONE", label: l.headerNone },
  { value: "TEXT", label: l.headerText },
  { value: "IMAGE", label: l.headerImage },
  { value: "VIDEO", label: l.headerVideo },
  { value: "DOCUMENT", label: l.headerDocument },
];

/** Button types the editor creates. Others (flows, catalogs) are kept but shown as quick replies. */
const BUTTON_TYPES = ["QUICK_REPLY", "URL", "PHONE_NUMBER", "COPY_CODE"];

const buttonTypes = (l: EditorLabels): EditorOption[] => [
  { value: "QUICK_REPLY", label: l.quickReply },
  { value: "URL", label: l.link },
  { value: "PHONE_NUMBER", label: l.phone },
  { value: "COPY_CODE", label: l.copyCode },
];

const MAX_BUTTONS = 10;

const count = (text: string, max: number) => `${[...text].length}/${max}`;

/** The sections of the editor for a template. */
export function editorSections(
  template: Template,
  options: EditorOptions = {},
): EditorSection[] {
  const l = { ...EDITOR_LABELS, ...options.labels };
  const basics: EditorSection = {
    id: "basics",
    title: l.basics,
    rows: [
      {
        fields: [
          {
            kind: "text",
            id: "name",
            label: l.name,
            hint: l.nameHint,
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
            label: l.language,
            value: template.language,
            options: options.languages ?? LANGUAGES,
          },
          {
            kind: "segment",
            id: "category",
            label: l.category,
            value: template.category,
            options: categories(l),
          },
        ],
      },
    ],
  };
  if (template.category === "AUTHENTICATION")
    return [basics, codeSection(template, l)];
  return [
    basics,
    contentSection(template, l),
    buttonsSection(template, l),
    variablesSection(template, l),
  ];
}

function contentSection(
  template: StandardTemplate,
  l: EditorLabels,
): EditorSection {
  const header = template.header;
  // Location and product headers are kept as they are but show as "None": not editable yet.
  const kinds = headerKinds(l);
  const kind = kinds.some((option) => option.value === header?.type)
    ? header!.type
    : "NONE";
  const headerRow: EditorField[] = [
    {
      kind: "select",
      id: "header.kind",
      label: l.header,
      value: kind,
      options: kinds,
    },
  ];
  if (header?.type === "TEXT")
    headerRow.push({
      kind: "text",
      id: "header.text",
      label: l.headerTextField,
      hint: count(header.text, 60),
      value: header.text,
    });
  if (header && "url" in header)
    headerRow.push({
      kind: "text",
      id: "header.url",
      label: l.sampleFileUrl,
      value: header.url,
      mono: true,
    });

  return {
    id: "content",
    title: l.content,
    rows: [
      { fields: headerRow },
      {
        fields: [
          {
            kind: "textarea",
            id: "body",
            label: l.body,
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
            label: l.footer,
            hint: count(template.footer?.text ?? "", 60),
            value: template.footer?.text ?? "",
          },
        ],
      },
    ],
    note: l.formattingNote,
  };
}

function buttonsSection(
  template: StandardTemplate,
  l: EditorLabels,
): EditorSection {
  const buttons = template.buttons ?? [];
  const rows: EditorRow[] = buttons.map((button, index) => {
    const at = `buttons.${index}`;
    const type = BUTTON_TYPES.includes(button.type)
      ? button.type
      : "QUICK_REPLY";
    const fields: EditorField[] = [
      {
        kind: "select",
        id: `${at}.type`,
        label: l.buttonType,
        value: type,
        options: buttonTypes(l),
      },
    ];
    if ("text" in button && button.text !== undefined)
      fields.push({
        kind: "text",
        id: `${at}.text`,
        label: l.buttonText,
        hint: count(button.text, 25),
        value: button.text,
      });
    if (button.type === "URL")
      fields.push({
        kind: "text",
        id: `${at}.url`,
        label: l.url,
        value: button.url,
        mono: true,
      });
    if (button.type === "PHONE_NUMBER")
      fields.push({
        kind: "text",
        id: `${at}.phoneNumber`,
        label: l.phoneNumber,
        value: button.phoneNumber,
        mono: true,
      });
    if (button.type === "COPY_CODE")
      fields.push({
        kind: "text",
        id: `${at}.example`,
        label: l.sampleCode,
        value: button.example,
        mono: true,
      });
    fields.push({
      kind: "action",
      id: `${at}.remove`,
      label: l.removeButton,
      icon: "remove",
    });
    return { fields, list: true };
  });
  rows.push({
    fields: [
      {
        kind: "action",
        id: "buttons.add",
        label: l.addButton,
        icon: "add",
        disabled: buttons.length >= MAX_BUTTONS,
      },
    ],
  });
  return {
    id: "buttons",
    title: `${l.buttons} ${buttons.length}/${MAX_BUTTONS}`,
    rows,
  };
}

function variablesSection(
  template: StandardTemplate,
  l: EditorLabels,
): EditorSection {
  const variables = Object.entries(template.variables ?? {});
  return {
    id: "variables",
    title: l.variables,
    rows: variables.map(([name, variable], index) => ({
      fields: [
        {
          kind: "text",
          id: `variables.${name}`,
          label: `{{${name}}}`,
          hint: `${l.variablePosition} ${index + 1}`,
          value: variable.example,
          placeholder: l.exampleValue,
        },
      ],
    })),
    note: variables.length ? undefined : l.noVariables,
  };
}

function codeSection(
  template: AuthenticationTemplate,
  l: EditorLabels,
): EditorSection {
  const minutes = template.footer?.codeExpirationMinutes;
  return {
    id: "code",
    title: l.codeMessage,
    rows: [
      {
        fields: [
          {
            kind: "checkbox",
            id: "body.addSecurityRecommendation",
            label: l.securityRecommendation,
            checked: template.body?.addSecurityRecommendation ?? false,
          },
        ],
      },
      {
        fields: [
          {
            kind: "text",
            id: "footer.codeExpirationMinutes",
            label: l.expiresAfter,
            hint: l.expiresHint,
            value: minutes === undefined ? "" : String(minutes),
            mono: true,
          },
          {
            kind: "text",
            id: "button.text",
            label: l.buttonText,
            hint: l.optional,
            value: template.button.text ?? "",
            placeholder: l.copyCode,
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
 *
 * `remembered` holds examples of variables seen earlier: while someone types `{{name}}` the
 * placeholder is briefly incomplete, and its example comes back from here once it is whole.
 *
 * `labels` gives new buttons their default text in the editor's language.
 */
export function applyEdit(
  template: Template,
  id: string,
  value?: string | boolean,
  remembered: Variables = {},
  labels: Partial<EditorLabels> = {},
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
  return syncVariables(
    editStandard(template, id, text, { ...EDITOR_LABELS, ...labels }),
    remembered,
  );
}

function editStandard(
  template: StandardTemplate,
  id: string,
  text: string,
  l: EditorLabels,
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
      : withButtons([...buttons, newButton(l, "QUICK_REPLY")]);

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
          l,
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
export function syncVariables(
  template: StandardTemplate,
  remembered: Variables = {},
): StandardTemplate {
  const current = template.variables ?? {};
  const variables = Object.fromEntries(
    extractVariables(template).map((name) => [
      name,
      current[name] ?? remembered[name] ?? { example: "" },
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
function newButton(l: EditorLabels, type: Button["type"], label = ""): Button {
  if (type === "URL")
    return { type, text: label || l.newLinkButton, url: "https://" };
  if (type === "PHONE_NUMBER")
    return { type, text: label || l.newPhoneButton, phoneNumber: "+" };
  if (type === "COPY_CODE") return { type, example: "CODE10" };
  return { type: "QUICK_REPLY", text: label || l.newQuickReply };
}
