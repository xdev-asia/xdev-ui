import { readdirSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Component name → Storybook title, read from the story files at build time so the home page
// links only to stories that exist.
function storyTitles(): Record<string, string> {
  const dir = resolve(__dirname, "src/components");
  const out: Record<string, string> = {};
  for (const name of readdirSync(dir)) {
    const file = resolve(dir, name, `${name}.stories.tsx`);
    if (!existsSync(file)) continue;
    const m = /title:\s*"([^"]+)"/.exec(readFileSync(file, "utf8"));
    if (m) out[name] = m[1];
  }
  return out;
}

// Demo site (GitHub Pages). base comes from the Pages workflow.
export default defineConfig({
  root: "demo",
  base: process.env.DEMO_BASE ?? "/",
  plugins: [react()],
  define: { __STORY_TITLES__: JSON.stringify(storyTitles()) },
  build: { outDir: "../dist-demo", emptyOutDir: true },
});
