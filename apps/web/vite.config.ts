import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { defineConfig, type Plugin } from "vite";

/** Serves the package's JSON Schema at `/schema.json` in dev; the build copies it to the root. */
function schema(): Plugin {
  const path = createRequire(import.meta.url).resolve(
    "@talqui-oss/template-builder/schema.json",
  );
  return {
    name: "schema-json",
    configureServer(server) {
      server.middlewares.use("/schema.json", (_req, res) => {
        res.setHeader("Content-Type", "application/schema+json");
        res.end(readFileSync(path));
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), schema()],
});
