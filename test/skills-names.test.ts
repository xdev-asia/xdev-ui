import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import * as lib from "@xdev-asia/ui";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "generated/ai-manifest.json"), "utf8")) as {
  components: { name: string; types: string; classes: string[] }[];
  tokens: { name: string }[];
  icons: string[];
  sharedTypes: string;
};
const components = new Map(manifest.components.map((c) => [c.name, c]));
const tokenNames = new Set(manifest.tokens.map((t) => t.name));
const iconNames = new Set(manifest.icons);
const classNames = new Set(manifest.components.flatMap((c) => c.classes));
const typeText = manifest.components.map((c) => c.types).join("\n") + "\n" + manifest.sharedTypes;
const runtimeExports = new Set(Object.keys(lib));

/** Command-line flags of the skills tooling; they look like tokens in prose. */
const CLI_FLAGS = new Set(["i18n", "manifest", "contrast", "claude", "codex", "cursor", "dir", "user", "skill", "force", "dry-run"]);
const REACT = new Set(["Fragment", "StrictMode", "Suspense", "Profiler"]);
const DOM_PROPS = new Set([
  "key", "ref", "id", "className", "style", "role", "tabIndex", "title", "lang", "hidden", "children",
  "href", "target", "rel", "type", "name", "value", "defaultValue", "checked", "defaultChecked", "disabled", "placeholder", "required",
  "autoComplete", "autoFocus", "readOnly", "min", "max", "step", "maxLength", "minLength", "pattern", "htmlFor", "form",
  "onClick", "onChange", "onInput", "onSubmit", "onKeyDown", "onKeyUp", "onBlur", "onFocus", "onMouseDown", "onMouseEnter", "onMouseLeave",
]);

function walk(dir: string, accept: (p: string) => boolean): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((f) => {
    if (f === "node_modules" || f === "dist") return [];
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p, accept) : accept(p) ? [p] : [];
  });
}

const skillDirs = existsSync(join(root, "skills")) ? readdirSync(join(root, "skills")).map((n) => join(root, "skills", n)) : [];
const mdFiles = walk(join(root, "skills"), (p) => p.endsWith(".md"));
const sourceFiles = [
  ...skillDirs.flatMap((d) => walk(join(d, "templates"), (p) => /[\\/]src[\\/].*\.(ts|tsx|css)$/.test(p) && !/\.test\.tsx?$/.test(p))),
  ...walk(join(root, "examples/admin/src"), (p) => /\.(ts|tsx|css)$/.test(p) && !/\.test\.tsx?$/.test(p)),
];

interface Chunk {
  file: string;
  lang: string;
  text: string;
}
const chunks: Chunk[] = [
  ...mdFiles.flatMap((file) => {
    const text = readFileSync(file, "utf8");
    return [...text.matchAll(/```(\w*)\n([\s\S]*?)```/g)].map((m) => ({ file, lang: m[1], text: m[2] }));
  }),
  ...sourceFiles.map((file) => ({ file, lang: file.endsWith(".css") ? "css" : file.endsWith(".tsx") ? "tsx" : "ts", text: readFileSync(file, "utf8") })),
];
const prose = mdFiles.map((file) => ({ file, text: readFileSync(file, "utf8").replace(/```[\s\S]*?```/g, "") }));
const where = (file: string): string => relative(root, file);

/** Names a chunk defines or imports from somewhere other than the library, so they are not library components. */
function localNames(text: string): Set<string> {
  const out = new Set<string>(REACT);
  for (const m of text.matchAll(/\b(?:function|const|class|let|var)\s+([A-Z]\w*)/g)) out.add(m[1]);
  for (const m of text.matchAll(/import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+["']([^"']+)["']/g)) {
    if (m[2] === "@xdev-asia/ui") continue;
    for (const n of m[1].split(",")) out.add(n.replace(/^\s*type\s+/, "").replace(/\s+as\s+\w+/, "").trim());
  }
  for (const m of text.matchAll(/import\s+([A-Z]\w*)\s+from/g)) out.add(m[1]);
  return out;
}

/** Opening tags `<Name ...>` with their attribute names; balanced over braces and quotes. */
function openingTags(text: string): { name: string; attrs: string[] }[] {
  const tags: { name: string; attrs: string[] }[] = [];
  for (const m of text.matchAll(/(?<![\w$)\]])<([A-Z]\w*)(?=[\s/>])/g)) {
    let i = (m.index ?? 0) + m[0].length;
    let depth = 0;
    let quote = "";
    let body = "";
    for (; i < text.length; i++) {
      const c = text[i];
      if (quote) {
        if (c === quote && text[i - 1] !== "\\") quote = "";
        continue;
      }
      if (c === '"' || c === "'" || c === "`") quote = c;
      else if (c === "{") depth++;
      else if (c === "}") depth--;
      else if (c === ">" && depth === 0 && text[i - 1] !== "=") break;
      else if (depth === 0) body += c;
    }
    tags.push({ name: m[1], attrs: [...body.matchAll(/(?:^|\s)([A-Za-z][\w-]*)(?=\s*=|\s|\/|$)/g)].map((a) => a[1]) });
  }
  return tags;
}

describe("skills and example reference only names that exist", () => {
  it("finds the content to check", () => {
    expect(chunks.length).toBeGreaterThan(0);
  });

  it("components are in the manifest", () => {
    const bad: string[] = [];
    for (const c of chunks.filter((x) => x.lang === "tsx" || x.lang === "jsx")) {
      const local = localNames(c.text);
      for (const t of openingTags(c.text)) if (!components.has(t.name) && !local.has(t.name)) bad.push(`${where(c.file)}: <${t.name}>`);
    }
    expect(bad).toEqual([]);
  });

  it("props exist on their component", () => {
    const bad: string[] = [];
    for (const c of chunks.filter((x) => x.lang === "tsx" || x.lang === "jsx")) {
      for (const t of openingTags(c.text)) {
        const comp = components.get(t.name);
        if (!comp) continue;
        const dom = /extends\s+(?:Omit<)?\w*(?:HTMLAttributes|Props)</.test(comp.types) || /HTMLAttributes/.test(comp.types);
        for (const a of t.attrs) {
          if (/^(aria-|data-)/.test(a) || a === "key" || a === "ref") continue;
          if (new RegExp(`\\b${a}\\??:`).test(comp.types)) continue;
          if (dom && DOM_PROPS.has(a)) continue;
          bad.push(`${where(c.file)}: <${t.name} ${a}>`);
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it("imports from @xdev-asia/ui are exported by it", () => {
    const bad: string[] = [];
    for (const c of chunks.filter((x) => x.lang === "tsx" || x.lang === "ts")) {
      for (const m of c.text.matchAll(/import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+["']@xdev-asia\/ui["']/g)) {
        for (const raw of m[1].split(",")) {
          const n = raw.replace(/^\s*type\s+/, "").replace(/\s+as\s+\w+/, "").trim();
          if (n && !runtimeExports.has(n) && !new RegExp(`\\b(?:interface|type|const)\\s+${n}\\b`).test(typeText) && !/^(IconName|ThemePreference|ResolvedTheme)$/.test(n))
            bad.push(`${where(c.file)}: ${n}`);
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it("tokens exist", () => {
    const local = new Set<string>();
    for (const c of chunks) for (const m of c.text.matchAll(/(--[a-z0-9-]+)\s*:/gi)) local.add(m[1].slice(2));
    const bad: string[] = [];
    const scan = (file: string, text: string): void => {
      for (const m of text.matchAll(/(?:var\(|`)--([a-z0-9]+(?:-[a-z0-9]+)*)(?![\w*-])/g)) {
        if (!tokenNames.has(m[1]) && !local.has(m[1]) && !CLI_FLAGS.has(m[1])) bad.push(`${where(file)}: --${m[1]}`);
      }
    };
    for (const c of chunks) scan(c.file, c.text);
    for (const p of prose) scan(p.file, p.text);
    expect([...new Set(bad)]).toEqual([]);
  });

  it("CSS classes named in prose exist", () => {
    const bad: string[] = [];
    for (const p of prose) {
      for (const m of p.text.matchAll(/`\.((?:x|ws)-[\w-]+|btn[\w-]*|dialog[\w-]*)`/g)) if (!classNames.has(m[1])) bad.push(`${where(p.file)}: .${m[1]}`);
    }
    expect(bad).toEqual([]);
  });

  it("icons exist", () => {
    const bad: string[] = [];
    const all = [...chunks.map((c) => ({ file: c.file, text: c.text })), ...prose];
    for (const { file, text } of all) {
      for (const m of text.matchAll(/\bicon(?:=|:\s*)\{?\s*"([a-z0-9-]+)"/g)) if (!iconNames.has(m[1])) bad.push(`${where(file)}: ${m[1]}`);
      for (const m of text.matchAll(/<Icon\s+name=\{?"([a-z0-9-]+)"/g)) if (!iconNames.has(m[1])) bad.push(`${where(file)}: ${m[1]}`);
    }
    expect(bad).toEqual([]);
  });

  it("MCP tools and prompts named exist in the server", () => {
    const server = readFileSync(join(root, "src/mcp/server.ts"), "utf8");
    const registered = new Set([...server.matchAll(/^\s*"(xdevui_[a-z_]+)",?\s*$/gm)].map((m) => m[1]));
    expect(registered.size).toBeGreaterThanOrEqual(7);
    const bad: string[] = [];
    for (const f of [...mdFiles, ...sourceFiles]) for (const m of readFileSync(f, "utf8").matchAll(/\bxdevui_[a-z_]+/g)) if (!registered.has(m[0])) bad.push(`${where(f)}: ${m[0]}`);
    expect([...new Set(bad)]).toEqual([]);
  });
});
