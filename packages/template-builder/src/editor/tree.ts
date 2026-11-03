import type { PreviewNode } from "../preview/tree";
import type { Template } from "../schema/types";
import { editorSections, type EditorField, type EditorOptions } from "./model";

/**
 * The editor as a framework-neutral element tree, like `previewTree`. Every control carries
 * `data-edit` (the field id for `applyEdit`); segment items and actions are buttons, the
 * selected value of a segment item is in `data-value`. Boolean attributes (`checked`,
 * `disabled`, `selected`) are present as `""` when true and left out when false.
 */
export function editorTree(
  template: Template,
  options: EditorOptions & {
    /** Prefix for element ids, so two editors on a page do not clash. Default: `"tb"`. */
    idPrefix?: string;
  } = {},
): PreviewNode {
  const prefix = options.idPrefix ?? "tb";
  const sections = editorSections(template, options);
  return node(
    "div",
    "tb-editor",
    {},
    sections.map((section, index) =>
      node("section", "tb-editor__section", { "data-section": section.id }, [
        node("h3", "tb-editor__title", {}, [
          node("span", "tb-editor__index", {}, [
            String(index + 1).padStart(2, "0"),
          ]),
          section.title,
        ]),
        node("div", "tb-editor__body", {}, [
          ...section.rows.map((row) =>
            node(
              "div",
              row.list
                ? "tb-editor__row tb-editor__row--list"
                : "tb-editor__row",
              {},
              row.fields.map((field) =>
                fieldNode(field, `${prefix}-${field.id.replace(/\W/g, "-")}`),
              ),
            ),
          ),
          ...(section.note
            ? [node("p", "tb-editor__note", {}, [section.note])]
            : []),
        ]),
      ]),
    ),
  );
}

function fieldNode(field: EditorField, id: string): PreviewNode {
  const edit = { "data-edit": field.id };

  if (field.kind === "action")
    return node(
      "button",
      `tb-editor__action tb-editor__action--${field.icon}`,
      {
        ...edit,
        type: "button",
        "aria-label": field.label,
        ...(field.disabled && { disabled: "" }),
      },
      [field.icon === "remove" ? "×" : `+ ${field.label}`],
    );

  if (field.kind === "checkbox")
    return node("label", "tb-editor__check", {}, [
      node("input", undefined, {
        ...edit,
        id,
        type: "checkbox",
        ...(field.checked && { checked: "" }),
      }),
      field.label,
    ]);

  const head = node("div", "tb-editor__head", {}, [
    field.kind === "segment"
      ? node("span", "tb-editor__label", { id: `${id}-label` }, [field.label])
      : node("label", "tb-editor__label", { for: id }, [field.label]),
    ...(field.hint ? [node("span", "tb-editor__hint", {}, [field.hint])] : []),
  ]);

  let control: PreviewNode;
  if (field.kind === "segment")
    // A radio group: one tab stop, the bindings move the selection with the arrow keys.
    control = node(
      "div",
      "tb-editor__segment",
      { role: "radiogroup", "aria-labelledby": `${id}-label` },
      field.options.map((option) => {
        const selected = option.value === field.value;
        return node(
          "button",
          "tb-editor__segment-item",
          {
            ...edit,
            "data-value": option.value,
            type: "button",
            role: "radio",
            "aria-checked": String(selected),
            tabindex: selected ? "0" : "-1",
          },
          [option.label],
        );
      }),
    );
  else if (field.kind === "select")
    control = node(
      "select",
      "tb-editor__input tb-editor__input--select",
      // The selected option carries the value, as it does in plain HTML.
      { ...edit, id },
      field.options.map((option) =>
        node(
          "option",
          undefined,
          {
            value: option.value,
            ...(option.value === field.value && { selected: "" }),
          },
          [option.label],
        ),
      ),
    );
  else
    control = node(
      field.kind === "textarea" ? "textarea" : "input",
      [
        "tb-editor__input",
        field.mono && "tb-editor__input--mono",
        field.kind === "textarea" && "tb-editor__input--area",
      ]
        .filter(Boolean)
        .join(" "),
      {
        ...edit,
        id,
        value: field.value,
        ...(field.kind === "text" && { type: "text" }),
        ...(field.kind === "textarea" && { rows: "7" }),
        ...(field.placeholder && { placeholder: field.placeholder }),
      },
    );

  return node("div", "tb-editor__field", {}, [head, control]);
}

function node(
  tag: string,
  className: string | undefined,
  attrs: Record<string, string>,
  children: (PreviewNode | string)[] = [],
): PreviewNode {
  return { tag, ...(className && { class: className }), attrs, children };
}
