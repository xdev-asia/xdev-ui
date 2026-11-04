import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const src = (p: string): string => fileURLToPath(new URL(p, import.meta.url));

// Inside this repo the example imports the library from source. In your own app, install @xdev-asia/ui and drop the alias.
export default defineConfig({
  root: src("."),
  base: "./",
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@xdev-asia\/ui$/, replacement: src("../../src/index.ts") },
      { find: /^@xdev-asia\/ui\/styles\.css$/, replacement: src("../../src/styles/index.css") },
      { find: /^@xdev-asia\/ui\/fonts\.css$/, replacement: src("../../src/styles/fonts.css") },
    ],
  },
  build: { outDir: src("../../dist-examples/admin"), emptyOutDir: true },
  server: { port: 5174 },
});
