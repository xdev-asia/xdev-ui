// Copies standalone CSS, tokens and the AI files next to the bundle; checks the outputs exist.
// `--demo`: copies llms.txt, llms-full.txt and ai-manifest.json into dist-demo (GitHub Pages).
import { chmodSync, copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { wrapInLayer } from "./css-layer.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ai = ["ai-manifest.json", "llms.txt", "llms-full.txt"];
const copy = (from, dir) => copyFileSync(resolve(root, from), resolve(root, dir, from.split("/").pop()));

if (process.argv.includes("--demo")) {
  for (const f of ai) copy(`generated/${f}`, "dist-demo");
  console.log("dist-demo ai ok");
  process.exit(0);
}

copy("src/styles/tokens.css", "dist");
copy("src/styles/tailwind.css", "dist");
copy("src/styles/fonts.css", "dist");
copy("tokens/tokens.json", "dist");
writeFileSync(resolve(root, "dist/styles.layered.css"), wrapInLayer(readFileSync(resolve(root, "dist/styles.css"), "utf8")));
for (const f of ai) copy(`generated/${f}`, "dist");
try {
  chmodSync(resolve(root, "dist/mcp.js"), 0o755);
} catch {
  // Windows: npm sets the bin mode on install.
}
for (const f of ["index.js", "index.d.ts", "editor.js", "editor/index.d.ts", "image.js", "image/index.d.ts", "styles.css", "styles.layered.css", "tokens.css", "tailwind.css", "fonts.css", "tokens.json", "mcp.js", ...ai]) {
  if (!existsSync(resolve(root, "dist", f))) {
    console.error(`missing dist/${f}`);
    process.exit(1);
  }
}
console.log("dist ok");
