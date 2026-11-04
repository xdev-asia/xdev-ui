// Copies standalone CSS + tokens.json next to the bundle; checks the outputs exist.
import { copyFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
copyFileSync(resolve(root, "src/styles/tokens.css"), resolve(dist, "tokens.css"));
copyFileSync(resolve(root, "src/styles/fonts.css"), resolve(dist, "fonts.css"));
copyFileSync(resolve(root, "tokens/tokens.json"), resolve(dist, "tokens.json"));
for (const f of ["index.js", "index.d.ts", "styles.css", "tokens.css", "fonts.css", "tokens.json"]) {
  if (!existsSync(resolve(dist, f))) {
    console.error(`missing dist/${f}`);
    process.exit(1);
  }
}
console.log("dist ok");
