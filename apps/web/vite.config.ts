import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { defineConfig, type Plugin } from "vite";
import { contentType, textFiles } from "./scripts/text-files.mjs";

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

// Paths the build writes as text files instead of pages.
const TEXT_FILE = /\.(md|txt|json|xml)$/;

/**
 * Answers llms.txt, the Markdown pages, template JSON, sitemap.xml and robots.txt in dev with
 * the same content the build writes, generated from the current source on every request.
 */
function textFilesInDev(): Plugin {
  return {
    name: "text-files",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = (req.url ?? "").split("?")[0]!;
        if (
          !TEXT_FILE.test(path) ||
          path.startsWith("/@") ||
          path.startsWith("/src/")
        )
          return next();
        try {
          const entry = await server.ssrLoadModule("/src/entry-server.tsx");
          const content = textFiles(entry)[path];
          if (content === undefined) return next();
          res.setHeader("Content-Type", contentType(path));
          res.end(content);
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), schema(), textFilesInDev()],
});
