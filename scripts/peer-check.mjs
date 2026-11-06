// The core entry must stay dependency-free: dist/index.js and every chunk it reaches import only
// React. Optional peers (@tiptap/*, react-easy-crop) belong to the /editor and /image entries.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const dist = resolve(dirname(fileURLToPath(import.meta.url)), "../dist");
const allowed = new Set(["react", "react-dom", "react/jsx-runtime"]);
const spec = /(?:import|export)\s*(?:[^'";]*?\sfrom\s*)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;

function reach(entry) {
  const seen = new Set();
  const bare = new Set();
  const walk = (file) => {
    if (seen.has(file)) return;
    seen.add(file);
    for (const m of readFileSync(file, "utf8").matchAll(spec)) {
      const s = m[1] ?? m[2];
      if (s.startsWith(".")) walk(resolve(dirname(file), s));
      else bare.add(s);
    }
  };
  walk(resolve(dist, entry));
  return bare;
}

let fail = 0;
const core = [...reach("index.js")].filter((s) => !allowed.has(s));
if (core.length) { console.error("dist/index.js reaches non-React imports:", core); fail++; }
for (const [entry, peer] of [["editor.js", /^@tiptap\//], ["image.js", /^react-easy-crop$/]]) {
  const extra = [...reach(entry)].filter((s) => !allowed.has(s) && !peer.test(s));
  if (extra.length) { console.error(`dist/${entry} reaches imports outside its peers:`, extra); fail++; }
}
console.log(fail ? "peer check failed" : "peer check ok");
process.exit(fail ? 1 : 0);
