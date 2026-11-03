import {
  applyEdit,
  editorTree,
  previewTree,
  toPreviewModel,
  type EditorOption,
  type Issue,
  type Platform,
  type PreviewNode,
  type Template,
  type Variables,
} from "@talqui-oss/template-builder";
import { defineComponent, h, type PropType, type VNodeChild } from "vue";

/** Renders a WhatsApp template as it shows on the phone. Import `@talqui-oss/template-builder/styles.css` once. */
export const TemplatePreview = defineComponent({
  name: "TemplatePreview",
  props: {
    template: { type: Object as PropType<Template>, required: true },
    /** Values for `{{name}}` placeholders. Each variable's `example` is the fallback. */
    values: { type: Object as PropType<Record<string, string>> },
    /** Phone look to imitate. Only `"ios"` for now. */
    platform: { type: String as PropType<Platform>, default: "ios" },
    /** Time shown in the bubble, e.g. `"21:11"`. */
    time: { type: String },
  },
  /** Emitted with the validation issues whenever they change. The preview renders either way. */
  emits: { issues: (issues: Issue[]) => Array.isArray(issues) },
  watch: {
    // Compare by content so a new array with the same issues does not emit again.
    issuesKey: {
      handler() {
        this.$emit("issues", this.model.issues);
      },
      immediate: true,
    },
  },
  computed: {
    model() {
      return toPreviewModel(this.template, { values: this.values });
    },
    issuesKey(): string {
      return JSON.stringify(this.model.issues);
    },
  },
  render() {
    return toVNode(
      previewTree(this.model, { platform: this.platform, time: this.time }),
    );
  },
});

function toVNode(node: PreviewNode | string): VNodeChild {
  if (typeof node === "string") return node;
  return h(
    node.tag,
    { ...(node.class && { class: node.class }), ...node.attrs },
    (node.children ?? []).map(toVNode),
  );
}

let editors = 0;

/**
 * A form that edits a WhatsApp template. Import `@talqui-oss/template-builder/editor.css` once.
 * Use it with `v-model:template`.
 */
export const TemplateEditor = defineComponent({
  name: "TemplateEditor",
  props: {
    template: { type: Object as PropType<Template>, required: true },
    /** Languages offered in the language select. */
    languages: { type: Array as PropType<EditorOption[]> },
  },
  data() {
    // Element ids for label/input pairs, unique per editor on the page.
    return {
      idPrefix: `tb-editor-${++editors}`,
      // Every example typed so far, so a placeholder retyped gets its example back.
      seen: {} as Variables,
    };
  },
  /** Emitted with the next template on every edit. */
  emits: { "update:template": (template: Template) => Boolean(template) },
  methods: {
    edit(id: string, value?: string | boolean) {
      this.$emit(
        "update:template",
        applyEdit(this.template, id, value, this.remembered()),
      );
    },
    remembered(): Variables {
      if (this.template.category !== "AUTHENTICATION")
        Object.assign(this.seen, this.template.variables);
      return this.seen;
    },
  },
  render() {
    const tree = editorTree(this.template, {
      idPrefix: this.idPrefix,
      languages: this.languages,
    });
    return toEditorVNode(tree, this.edit);
  },
});

type Edit = (id: string, value?: string | boolean) => void;

function toEditorVNode(node: PreviewNode | string, edit: Edit): VNodeChild {
  if (typeof node === "string") return node;
  const props: Record<string, unknown> = {
    ...(node.class && { class: node.class }),
    ...node.attrs,
  };
  const id = node.attrs?.["data-edit"];
  if (id && node.tag === "button")
    props.onClick = () => edit(id, node.attrs?.["data-value"]);
  else if (id && node.attrs?.type === "checkbox")
    props.onChange = (event: Event) =>
      edit(id, (event.target as HTMLInputElement).checked);
  else if (id)
    props[node.tag === "select" ? "onChange" : "onInput"] = (event: Event) =>
      edit(id, (event.target as HTMLInputElement).value);
  if (node.attrs?.role === "radiogroup")
    props.onKeydown = (event: KeyboardEvent) => moveRadio(event, edit);
  return h(
    node.tag,
    props,
    (node.children ?? []).map((child) => toEditorVNode(child, edit)),
  );
}

/** Arrow keys, Home and End move the selection inside a radio group. */
function moveRadio(event: KeyboardEvent, edit: Edit) {
  const group = event.currentTarget as HTMLElement;
  const radios = [
    ...group.querySelectorAll<HTMLButtonElement>('[role="radio"]'),
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

export type { EditorOption, Issue, Platform, Template };
