import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const src = (p: string): string => fileURLToPath(new URL(p, import.meta.url));

// The xDev AI SDLC showcase: every screen of the app, built from the library and fake data.
// It is published with the demo site at <demo base>showcase/ai-sdlc/. Inside this repo it imports the library from source.
export default defineConfig({
  root: src("."),
  base: `${process.env.DEMO_BASE ?? "/"}showcase/ai-sdlc/`,
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@xdev-asia\/ui$/, replacement: src("../../src/index.ts") },
      { find: /^@xdev-asia\/ui\/styles\.css$/, replacement: src("../../src/styles/index.css") },
      { find: /^@xdev-asia\/ui\/fonts\.css$/, replacement: src("../../src/styles/fonts.css") },
    ],
  },
  build: { outDir: src("../../dist-demo/showcase/ai-sdlc"), emptyOutDir: true },
  server: { port: 5175 },
});
