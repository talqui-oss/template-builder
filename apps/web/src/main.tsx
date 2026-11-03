import "@fontsource-variable/inter";
import "@fontsource/geist-mono";
import "@fontsource/instrument-serif/400-italic.css";
import "@talqui-oss/template-builder/styles.css";
import "./styles.css";
import "./landing/landing.css";
import "./agents/agents.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Agents } from "./agents/Agents";
import { App } from "./App";
import { Landing } from "./landing/Landing";

// Three pages, picked by path; the static host serves index.html for each of them.
const ROUTES = {
  "/": {
    page: Landing,
    title: "template-builder: WhatsApp templates, exactly as they arrive",
  },
  "/playground": { page: App, title: "Playground · template-builder" },
  "/agents": { page: Agents, title: "template-builder for agents" },
};

const path = location.pathname.replace(/\/+$/, "") || "/";
const route = ROUTES[path as keyof typeof ROUTES] ?? ROUTES["/"];
document.title = route.title;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <route.page />
  </StrictMode>,
);
