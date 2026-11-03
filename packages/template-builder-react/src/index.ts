import {
  previewTree,
  toPreviewModel,
  type Issue,
  type Platform,
  type PreviewNode,
  type Template,
} from "@talqui-oss/template-builder";
import { createElement, useEffect, useMemo, type ReactNode } from "react";

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

export type { Issue, Platform, Template };
