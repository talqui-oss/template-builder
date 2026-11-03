import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/adapters/meta.ts",
    "src/adapters/twilio.ts",
    "src/adapters/talqui.ts",
  ],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
});
