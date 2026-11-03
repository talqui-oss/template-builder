import "@fontsource-variable/inter";
import "@fontsource/geist-mono";
import "@fontsource/instrument-serif/400-italic.css";
import "@talqui-oss/template-builder/styles.css";
import "./styles.css";
import "./landing/landing.css";
import "./agents/agents.css";
import "./catalog/catalog.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { resolveRoute } from "./routes";

const { head, element } = resolveRoute(location.pathname);
document.title = head.title;

// shortcut: the static HTML is replaced, not hydrated, because the playground reads the URL
// hash on first render; hydrate once pages render the same on server and client.
createRoot(document.getElementById("root")!).render(
  <StrictMode>{element}</StrictMode>,
);
