import type { Template } from "@talqui-oss/template-builder";
import { TemplatePreview } from "@talqui-oss/template-builder-react";
import { useState, type ReactNode } from "react";
import { CopyIcon } from "./icons";

// Pieces shared by the landing and the catalog pages.

export const GITHUB = "https://github.com/talqui-oss/template-builder";
export const NPM = "https://www.npmjs.com/package/@talqui-oss/template-builder";
export const TALQUI =
  "https://talqui.chat?utm_source=template-builder&utm_medium=site&utm_campaign=footer";
export const INSTALL = "npm i @talqui-oss/template-builder";

/** The horizontal rule between sections, with a small square where it meets each rail. */
export function Joint() {
  return (
    <div className="lp-joint" aria-hidden="true">
      <span />
      <span />
    </div>
  );
}

export function Brand() {
  return (
    <a className="lp-brand" href="/">
      <span className="lp-brand__mark" aria-hidden="true" />
      <span className="lp-chip">template-builder</span>
    </a>
  );
}

export function Header() {
  return (
    <header className="lp-rails lp-header">
      <Brand />
      <nav className="lp-header__nav">
        <a className="lp-chip lp-chip--outline" href="/agents">
          for agents
        </a>
        <a className="lp-chip" href="/whatsapp-template">
          catalog
        </a>
        <a className="lp-chip" href={GITHUB}>
          github
        </a>
        <a className="lp-chip" href={NPM}>
          npm
        </a>
        <a className="lp-chip lp-chip--strong" href="/playground">
          Open Playground
        </a>
      </nav>
    </header>
  );
}

export function Eyebrow({
  index,
  children,
}: {
  index: string;
  children: ReactNode;
}) {
  return (
    <p className="lp-eyebrow">
      <span className="lp-square" aria-hidden="true" />
      <span className="lp-eyebrow__index">{index}</span>
      {children}
    </p>
  );
}

/** Copies `text` and shows a short confirmation on the button that asked for it. */
export function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = (text: string) => {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return { copied, copy };
}

export function InstallCommand({ command = INSTALL }: { command?: string }) {
  const { copied, copy } = useCopy();
  return (
    <div className="lp-command">
      <code>
        <span className="lp-command__prompt">$</span> {command}
      </code>
      <button
        type="button"
        className="lp-command__copy"
        aria-label={copied ? "Copied" : "Copy command"}
        onClick={() => copy(command)}
      >
        <CopyIcon />
      </button>
    </div>
  );
}

/** A slice of the WhatsApp chat: doodle wallpaper plus the rendered template. */
export function ChatScreen({
  template,
  className,
}: {
  template: Template;
  className?: string;
}) {
  return (
    <div className={`lp-screen ${className ?? ""}`}>
      <div className="lp-screen__wallpaper" aria-hidden="true" />
      <TemplatePreview template={template} time="09:41" />
    </div>
  );
}

export function Footer() {
  return (
    <footer className="lp-rails lp-footer">
      <div className="lp-footer__left">
        <Brand />
        <span className="lp-footer__meta">© 2026</span>
        <a className="lp-footer__meta lp-accent" href={TALQUI}>
          built by Talqui
        </a>
      </div>
      <nav className="lp-header__nav">
        <a className="lp-chip lp-chip--outline" href="/agents">
          for agents
        </a>
        <a className="lp-chip" href="/whatsapp-template">
          catalog
        </a>
        <a className="lp-chip" href={NPM}>
          npm
        </a>
        <a className="lp-chip" href={GITHUB}>
          github
        </a>
      </nav>
    </footer>
  );
}
