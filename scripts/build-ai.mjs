// Builds the AI-facing data from the sources: component READMEs + exported types,
// tokens.json, icons and docs. Writes generated/ai-manifest.json, llms.txt, llms-full.txt.
// Consumed by the MCP server (src/mcp/server.ts) and shipped in dist/ and on Pages.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(root, p), "utf8").replace(/\r\n/g, "\n");
const pkg = JSON.parse(read("package.json"));
const tokens = JSON.parse(read("tokens/tokens.json"));
const designSystem = read("docs/design-system.md");
const brand = read("docs/brand.md");

/** Top-level `export interface|type|const` declarations, brace-balanced. Functions are skipped. */
function exportedDeclarations(src) {
  const lines = src.split("\n");
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/^export (interface|type|const) /.test(lines[i])) continue;
    // Keep the JSDoc block right above the declaration.
    let start = i;
    if (lines[i - 1]?.trim().endsWith("*/")) {
      while (start > 0 && !lines[start - 1].trim().startsWith("/**")) start--;
      start--;
    }
    const isInterface = lines[i].startsWith("export interface");
    let depth = 0;
    let j = i;
    for (; j < lines.length; j++) {
      for (const ch of lines[j]) {
        if ("{([".includes(ch)) depth++;
        else if ("})]".includes(ch)) depth--;
      }
      const t = lines[j].trimEnd();
      const done = isInterface ? t.endsWith("}") : t.endsWith(";");
      if (depth <= 0 && done) break;
    }
    out.push(lines.slice(start, j + 1).join("\n"));
    i = j;
  }
  return out.join("\n\n");
}

/** Group per component, from the "## Components" table in docs/design-system.md. */
const groupOf = {};
const compTable = designSystem.split("## Components")[1] ?? "";
for (const row of compTable.split("\n")) {
  const m = /^\|\s*([A-Z][a-z]+)\s*\|\s*([^|]+)\|/.exec(row);
  if (!m) continue;
  for (const name of m[2].split(",")) groupOf[name.trim()] = m[1];
}

const components = readdirSync(resolve(root, "src/components"), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map(({ name }) => {
    const readme = read(`src/components/${name}/README.md`);
    const tsx = read(`src/components/${name}/${name}.tsx`);
    const summary = readme.split("\n").find((l) => l.trim() && !l.startsWith("#"))?.trim() ?? "";
    const classes = [
      ...new Set([
        ...[...readme.matchAll(/`\.([a-z][\w-]*)`/g)].map((m) => m[1]),
        ...[...tsx.matchAll(/"((?:x-|ws-|btn|dialog|palette|brand|icon|status|tag|badge|kbd|seg|sel|field|switch|meter|banner|toast|activity|diff|agent)[\w-]*)"/g)].map((m) => m[1]),
      ]),
    ].sort();
    return {
      name,
      group: groupOf[name] ?? "Other",
      summary,
      import: `import { ${name} } from "${pkg.name}";`,
      types: exportedDeclarations(tsx),
      classes,
      readme,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const missing = components.filter((c) => c.group === "Other").map((c) => c.name);
if (missing.length) {
  console.error(`build-ai: add ${missing.join(", ")} to the Components table in docs/design-system.md`);
  process.exit(1);
}

const iconsSrc = read("src/icons.ts");
const icons = [...(iconsSrc.split("export const ICONS = {")[1] ?? "").matchAll(/^\s{2}([a-z]+):/gm)].map((m) => m[1]);

const flatTokens = [];
for (const [category, block] of Object.entries(tokens)) {
  if (!block || typeof block !== "object" || !Array.isArray(block.tokens)) continue;
  for (const t of block.tokens) {
    flatTokens.push({
      name: t.name,
      css: `var(--${t.name})`,
      category,
      value: t.value,
      usage: t.usage ?? "",
    });
  }
}

for (const [family, value] of Object.entries(tokens.type?.families ?? {})) {
  flatTokens.push({ name: `font-${family}`, css: `var(--font-${family})`, category: "type", value, usage: `Font family "${family}".` });
}
for (const group of tokens.type?.groups ?? []) {
  for (const { name, usage, sample, ...style } of group.styles ?? []) {
    flatTokens.push({
      name: `type-${name}`,
      css: `font: ${style.fontWeight ?? 400} ${style.fontSize}${style.lineHeight ? `/${style.lineHeight}` : ""} var(--font-${group.family})`,
      category: "type",
      value: style,
      usage: usage ?? "",
    });
  }
}

/** Split a markdown doc into `## ` sections keyed by slug. */
function sections(md) {
  const out = {};
  for (const part of md.split(/\n(?=## )/)) {
    const title = /^##? (.+)/.exec(part)?.[1] ?? "intro";
    out[title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")] = part.trim();
  }
  return out;
}

const guidelines = { ...sections(designSystem), brand: brand.trim() };

const manifest = {
  package: pkg.name,
  version: pkg.version,
  setup: [
    `pnpm add ${pkg.name}   # registry: @xdev-asia:registry=https://npm.pkg.github.com`,
    `import "${pkg.name}/styles.css";`,
    `import "${pkg.name}/fonts.css"; // optional`,
    `<html data-theme="dark">  // or "light"`,
  ].join("\n"),
  sharedTypes: read("src/types.ts"),
  icons,
  components,
  tokens: flatTokens,
  themes: tokens.color?.themes?.map((t) => t.id) ?? ["dark", "light"],
  guidelines,
};

const gen = resolve(root, "generated");
mkdirSync(gen, { recursive: true });
writeFileSync(resolve(gen, "ai-manifest.json"), JSON.stringify(manifest, null, 2));

// llms.txt: short index (https://llmstxt.org). llms-full.txt: everything in one file.
const llms = [
  `# ${pkg.name}`,
  "",
  `> ${pkg.description ?? "Design tokens and React components for the xDev agent workspace."}`,
  "",
  "Dark-first React 19 components and CSS tokens. Import `styles.css` once, set `data-theme` on <html>, then import components by name.",
  "",
  "## Setup",
  "",
  "```",
  manifest.setup,
  "```",
  "",
  "## Components",
  "",
  ...components.map((c) => `- ${c.name} (${c.group}): ${c.summary}`),
  "",
  "## Rules",
  "",
  "- One accent: `--accent` marks the current thing. Cyan `--x-color-signal` is the focus ring only.",
  "- Hairlines (1px `--line`), not shadows. Shadows only on menus, dialogs, palette.",
  "- State is tint, border or dot. Never a coloured left stripe on a rounded card or row.",
  "- 4px grid: `--x-space-1…8`. Sentence-case verb labels. No emoji or exclamation marks in UI chrome.",
  "",
  "## More",
  "",
  "- [llms-full.txt](llms-full.txt): every component README, exported types and all tokens",
  "- MCP server: `npx -y --package=@xdev-asia/ui xdev-ui-mcp` (tools: xdevui_list_components, xdevui_get_component, xdevui_search_tokens, xdevui_get_guidelines, xdevui_list_icons, xdevui_search_docs)",
  "",
].join("\n");

const full = [
  llms,
  "# Guidelines",
  "",
  ...Object.values(guidelines),
  "",
  "# Shared types",
  "",
  "```ts",
  manifest.sharedTypes.trim(),
  "```",
  "",
  `# Icons\n\n${icons.join(", ")}`,
  "",
  "# Components",
  "",
  ...components.flatMap((c) => [
    c.readme.trim().replace(/^# /, `## `),
    "",
    "```ts",
    c.import,
    "",
    c.types,
    "```",
    "",
  ]),
  "# Tokens",
  "",
  "| token | category | value | usage |",
  "|---|---|---|---|",
  ...flatTokens.map(
    (t) =>
      `| \`--${t.name}\` | ${t.category} | ${typeof t.value === "object" ? Object.entries(t.value).map(([k, v]) => `${k}: ${v}`).join("; ") : t.value} | ${t.usage.replace(/\|/g, "\\|")} |`,
  ),
  "",
].join("\n");

writeFileSync(resolve(gen, "llms.txt"), llms);
writeFileSync(resolve(gen, "llms-full.txt"), full);
console.log(`ai: ${components.length} components, ${flatTokens.length} tokens, ${icons.length} icons`);
