import {
  applyEdit,
  editorTree,
  previewTree,
  toPreviewModel,
  type EditorLabels,
  type EditorOption,
  type Issue,
  type Platform,
  type PreviewNode,
  type Template,
  type Variables,
} from "@talqui-oss/template-builder";
import {
  createElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";

export type TemplatePreviewProps = {
  template: Template;
  /** Values for `{{name}}` placeholders. Each variable's `example` is the fallback. */
  values?: Record<string, string>;
  /** Phone look to imitate. Only `"ios"` for now. */
  platform?: Platform;
  /** Time shown in the bubble, e.g. `"21:11"`. */
  time?: string;
  className?: string;
  /** Called with the validation issues whenever they change. The preview renders either way. */
  onIssues?: (issues: Issue[]) => void;
};

/** Renders a WhatsApp template as it shows on the phone. Import `@talqui-oss/template-builder/styles.css` once. */
export function TemplatePreview({
  template,
  values,
  platform,
  time,
  className,
  onIssues,
}: TemplatePreviewProps) {
  const model = useMemo(
    () => toPreviewModel(template, { values }),
    [template, values],
  );
  // Compare by content so a new array with the same issues does not call back again.
  const issuesKey = JSON.stringify(model.issues);
  useEffect(() => {
    onIssues?.(model.issues);
  }, [issuesKey]);

  const tree = previewTree(model, { platform, time });
  return toElement({
    ...tree,
    class: [tree.class, className].filter(Boolean).join(" "),
  });
}

function toElement(node: PreviewNode | string): ReactNode {
  if (typeof node === "string") return node;
  const { muted, ...attrs } = node.attrs ?? {};
  return createElement(
    node.tag,
    {
      className: node.class,
      ...attrs,
      // React expects a boolean for `muted`.
      ...(muted !== undefined && { muted: true }),
    },
    ...(node.children ?? []).map(toElement),
  );
}

export type TemplateEditorProps = {
  template: Template;
  /** Called with the next template on every edit. */
  onChange: (template: Template) => void;
  /** Languages offered in the language select. */
  languages?: EditorOption[];
  /** Texts to replace, e.g. to show the editor in another language. */
  labels?: Partial<EditorLabels>;
  className?: string;
};

/** A form that edits a WhatsApp template. Import `@talqui-oss/template-builder/editor.css` once. */
export function TemplateEditor({
  template,
  onChange,
  languages,
  labels,
  className,
}: TemplateEditorProps) {
  const idPrefix = `tb${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  // Every example typed so far, so a placeholder retyped gets its example back.
  const remembered = useRef<Variables>({});
  if (template.category !== "AUTHENTICATION")
    Object.assign(remembered.current, template.variables);
  const tree = editorTree(template, { idPrefix, languages, labels });
  const edit = (id: string, value?: string | boolean) =>
    onChange(applyEdit(template, id, value, remembered.current, labels));
  return toEditorElement(
    { ...tree, class: [tree.class, className].filter(Boolean).join(" ") },
    edit,
  );
}

type Edit = (id: string, value?: string | boolean) => void;

// HTML attribute names that React spells differently.
const REACT_NAMES: Record<string, string> = {
  for: "htmlFor",
  tabindex: "tabIndex",
};
const BOOLEAN = new Set(["checked", "disabled"]);

function toEditorElement(node: PreviewNode | string, edit: Edit): ReactNode {
  if (typeof node === "string") return node;
  const props: Record<string, unknown> = { className: node.class };
  for (const [name, value] of Object.entries(node.attrs ?? {})) {
    // Moved to the select's value below; React warns about `selected` on options.
    if (name === "selected") continue;
    props[REACT_NAMES[name] ?? name] = BOOLEAN.has(name) ? true : value;
  }
  if (node.attrs?.type === "checkbox") props.checked ??= false;
  // React controls a select through its value instead of `selected` on the options.
  if (node.tag === "select")
    props.value = node.children?.find(
      (option): option is PreviewNode =>
        typeof option !== "string" && option.attrs?.selected !== undefined,
    )?.attrs?.value;

  const id = node.attrs?.["data-edit"];
  if (id && node.tag === "button")
    props.onClick = () => edit(id, node.attrs?.["data-value"]);
  else if (id)
    props.onChange = (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      edit(
        id,
        event.target instanceof HTMLInputElement &&
          event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
      );
  if (node.attrs?.role === "radiogroup")
    props.onKeyDown = (event: KeyboardEvent<HTMLElement>) =>
      moveRadio(event, edit);

  return createElement(
    node.tag,
    props,
    ...(node.children ?? []).map((child) => toEditorElement(child, edit)),
  );
}

/** Arrow keys, Home and End move the selection inside a radio group. */
function moveRadio(event: KeyboardEvent<HTMLElement>, edit: Edit) {
  const radios = [
    ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
      '[role="radio"]',
    ),
  ];
  const current = radios.findIndex(
    (radio) => radio.getAttribute("aria-checked") === "true",
  );
  const next = {
    ArrowRight: current + 1,
    ArrowDown: current + 1,
    ArrowLeft: current - 1,
    ArrowUp: current - 1,
    Home: 0,
    End: radios.length - 1,
  }[event.key];
  if (next === undefined) return;
  event.preventDefault();
  const target = radios[(next + radios.length) % radios.length]!;
  target.focus();
  edit(target.dataset.edit!, target.dataset.value);
}

export type { EditorLabels, EditorOption, Issue, Platform, Template };
