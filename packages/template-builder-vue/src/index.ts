import {
  previewTree,
  toPreviewModel,
  type Issue,
  type Platform,
  type PreviewNode,
  type Template,
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

export type { Issue, Platform, Template };
