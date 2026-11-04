import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const src = (p: string): string => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@xdev-asia\/ui$/, replacement: src("./src/index.ts") },
      { find: /^@xdev-asia\/ui\/styles\.css$/, replacement: src("./src/styles/index.css") },
      { find: /^@xdev-asia\/ui\/tokens\.css$/, replacement: src("./src/styles/tokens.css") },
      { find: /^@xdev-asia\/ui\/fonts\.css$/, replacement: src("./src/styles/fonts.css") },
    ],
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.mjs", "test/**/*.test.{ts,tsx}", "examples/**/*.test.{ts,tsx}"],
  },
});
