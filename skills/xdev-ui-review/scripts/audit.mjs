#!/usr/bin/env node
// Rules audit for apps built on @xdev-asia/ui. Line based, no dependencies.
//   node audit.mjs <src-dir> [--i18n <dir>] [--manifest <path>]
// Prints `file:line rule message` per finding; exit code 1 on any error. Also exports audit(dir, opts).
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SKIP_DIRS = new Set(["node_modules", "dist", "dist-examples", ".git", "generated", "fixtures"]);
const EXTS = new Set([".css", ".ts", ".tsx"]);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (!SKIP_DIRS.has(name)) out.push(...walk(p));
    } else if (EXTS.has(extname(name)) && !/\.(test|stories)\.[tj]sx?$/.test(name) && !name.endsWith(".d.ts")) out.push(p);
  }
  return out.sort();
}

const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/;
const COLOUR_FN = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/;
const PX = /(?<![\w.#-])(\d+(?:\.\d+)?)px\b/g;
const EMOJI = /\p{Extended_Pictographic}/u;
const TITLE_CASE = /\b(?:[A-Z][a-z]+\s+){2,}[A-Z][a-z]+\b/;

const isComment = (line) => /^\s*(\/\/|\/\*|\*)/.test(line);
const stripCssComments = (line) => line.replace(/\/\*.*?\*\//g, "");

/** Opening tags of `<Name ...>` in a JSX source, balanced over braces and quotes. */
function openingTags(src, name) {
  const out = [];
  const re = new RegExp(`<${name}(?=[\\s/>])`, "g");
  let m;
  while ((m = re.exec(src))) {
    let i = m.index + m[0].length;
    let depth = 0;
    let quote = "";
    for (; i < src.length; i++) {
      const c = src[i];
      if (quote) {
        if (c === quote && src[i - 1] !== "\\") quote = "";
      } else if (c === '"' || c === "'" || c === "`") quote = c;
      else if (c === "{") depth++;
      else if (c === "}") depth--;
      else if (c === ">" && depth === 0) break;
    }
    out.push({ text: src.slice(m.index, i + 1), line: src.slice(0, m.index).split("\n").length });
  }
  return out;
}

/** Flat `a.b.c` keys of a dictionary file with `key: value` lines and nested `{ }`; empty-string values flagged. */
function dictKeys(text) {
  const keys = new Map();
  const stack = [];
  text.split("\n").forEach((line, i) => {
    const t = line.trim();
    const m = /^"?([A-Za-z0-9_.-]+)"?\s*:\s*(.*?),?$/.exec(t);
    if (m && !t.startsWith("//")) {
      const rest = m[2];
      if (rest === "{") return void stack.push(m[1]);
      keys.set([...stack, m[1]].join("."), { line: i + 1, empty: /^(""|''|``)$/.test(rest), value: rest });
    } else if (/^\}/.test(t) && stack.length) stack.pop();
  });
  return keys;
}

const strValue = (raw) => /^(["'`])(.*)\1$/.exec(raw)?.[2];

// Where ai-manifest.json can be: the installed package of the scanned project (walking up from the
// scanned dir and the cwd), then the package this script ships in (skills/<name>/scripts -> dist or generated).
function findManifest(root) {
  const here = dirname(fileURLToPath(import.meta.url));
  const found = [];
  for (const start of [root, process.cwd()]) {
    for (let dir = start; ; dir = dirname(dir)) {
      found.push(join(dir, "node_modules/@xdev-asia/ui/dist/ai-manifest.json"));
      if (dirname(dir) === dir) break;
    }
  }
  found.push(resolve(here, "../../../dist/ai-manifest.json"), resolve(here, "../../../generated/ai-manifest.json"));
  return found.find((p) => existsSync(p)) ?? found[0];
}

export function audit(dir, opts = {}) {
  const root = resolve(dir);
  const findings = [];
  const add = (file, line, rule, level, message) => findings.push({ file: relative(root, file) || file, line, rule, level, message });
  const notes = [];

  let tokens = null;
  const manifestPath = opts.manifest ? resolve(opts.manifest) : findManifest(root);
  if (existsSync(manifestPath)) tokens = new Set(JSON.parse(readFileSync(manifestPath, "utf8")).tokens.map((t) => t.name));
  else notes.push(`unknown-token skipped: no manifest at ${manifestPath} (pass --manifest)`);

  const files = walk(root);
  const sources = files.map((file) => ({ file, text: readFileSync(file, "utf8").replace(/\r\n/g, "\n") }));
  const local = new Set();
  for (const { text } of sources) for (const m of text.matchAll(/(--[a-z0-9-]+)\s*:/gi)) local.add(m[1].slice(2));
  for (const { text } of sources) for (const m of text.matchAll(/["'`](--[a-z0-9-]+)["'`]/g)) local.add(m[1].slice(2));

  for (const { file, text } of sources) {
    const css = file.endsWith(".css");
    const lines = text.split("\n");
    let inStyle = false;
    let inBlockComment = false;
    lines.forEach((raw, idx) => {
      const n = idx + 1;
      let line = raw;
      if (css) {
        if (inBlockComment) {
          if (line.includes("*/")) inBlockComment = false;
          return;
        }
        if (line.includes("/*") && !line.includes("*/")) {
          inBlockComment = true;
          line = line.slice(0, line.indexOf("/*"));
        }
        line = stripCssComments(line);
      } else if (isComment(line)) return;
      const opens = /style=\{\{|style:\s*\{/.test(line);
      const style = css || inStyle || opens;
      if (!css) {
        if (opens && !/\}\}/.test(line)) inStyle = true;
        else if (inStyle && /\}\}/.test(line)) inStyle = false;
      }

      if (HEX.test(line) || COLOUR_FN.test(line)) add(file, n, "raw-colour", "error", "Colour literal; use var(--token).");
      if (style && !/@media|@container|outline/.test(line)) {
        for (const m of line.matchAll(PX)) {
          if (Number(m[1]) > 1) {
            add(file, n, "raw-px", "error", `${m[0]} is a raw size; use var(--x-space-*), rem, ch or %.`);
            break;
          }
        }
      }
      if (style) {
        const cssFont = /(?:^|[\s;{])font-size\s*:/.test(line) || /\bfontSize\b/.test(line);
        const shorthand = /(?:^|[\s;{"'])font\s*:\s*([^;]*)/.exec(line);
        if (cssFont || (shorthand && !/var\(--type-|inherit|unset/.test(shorthand[1]))) add(file, n, "raw-font", "error", "Raw font size; use font: var(--type-*).");
      }
      const side = /(?:border-left|border-inline-start|borderLeft|borderInlineStart)(?:-width|Width)?\s*:\s*([^;}]*)/.exec(line);
      if (side && style) {
        const v = side[1].trim().replace(/^["'`]|["'`],?$/g, "");
        const num = /(-?\d*\.?\d+)\s*(?:px|rem|em)?/.exec(v);
        const none = /^(none|medium none|initial|unset)\b/.test(v) || (num && Number(num[1]) === 0 && !/solid|dashed|double/.test(v));
        const colourOnly = /(?:border-left-color|borderLeftColor|border-inline-start-color)/.test(side[0]);
        if (!none && !colourOnly && v) add(file, n, "left-stripe", "error", "Coloured left stripe; state is a tint, a 1px border or a StatusDot.");
      } else if (style && /box-shadow|boxShadow/.test(line) && /inset\s+-?(?:0?\.\d+|[1-9]\d*(?:\.\d+)?)(?:px|rem|em)?\s+0(?:px|rem|em)?\s+0/.test(line)) {
        add(file, n, "left-stripe", "error", "Inset box-shadow stripe on the left edge.");
      }
      if (style && /outline\s*:\s*["']?(none|0)\b/.test(line)) add(file, n, "focus-outline", "error", "Do not remove the focus outline; restyle it with --x-color-signal.");
      if (tokens) {
        for (const m of line.matchAll(/var\(\s*--([a-z0-9-]+)/g)) {
          if (!tokens.has(m[1]) && !local.has(m[1])) add(file, n, "unknown-token", "error", `--${m[1]} is not a design token.`);
        }
      }
      if (file.endsWith(".tsx")) {
        for (const m of line.matchAll(/>([^<>{}=]+)</g)) {
          const text = m[1].trim();
          if (!/[A-Za-z]/.test(text)) continue;
          if (/!/.test(text) || EMOJI.test(text) || TITLE_CASE.test(text)) add(file, n, "label-voice", "warn", `"${text}": sentence case, no emoji, no exclamation marks.`);
        }
      }
    });
    if (file.endsWith(".tsx")) {
      const tags = openingTags(text, "Button").filter((t) => !/variant\s*=\s*["{]\s*["']?(secondary|ghost)/.test(t.text));
      if (tags.length > 1) add(file, tags[1].line, "primary-count", "warn", `${tags.length} primary Buttons in one file; one primary per surface, the rest variant="secondary".`);
    }
  }

  if (opts.i18n) {
    const dir2 = resolve(opts.i18n);
    const en = join(dir2, "en.ts");
    const vi = join(dir2, "vi.ts");
    if (existsSync(en) && existsSync(vi)) {
      const a = dictKeys(readFileSync(en, "utf8"));
      const b = dictKeys(readFileSync(vi, "utf8"));
      for (const [k, v] of a) if (!b.has(k)) add(vi, 1, "i18n-parity", "error", `key ${k} is in en but not in vi.`);
      for (const [k, v] of b) if (!a.has(k)) add(en, 1, "i18n-parity", "error", `key ${k} is in vi but not in en.`);
      for (const [file, d] of [[en, a], [vi, b]]) {
        for (const [k, v] of d) {
          if (v.empty) add(file, v.line, "i18n-parity", "error", `key ${k} is empty.`);
          const s = strValue(v.value);
          if (s && (/!/.test(s) || EMOJI.test(s) || TITLE_CASE.test(s))) add(file, v.line, "label-voice", "warn", `"${s}": sentence case, no emoji, no exclamation marks.`);
        }
      }
    } else notes.push(`i18n-parity skipped: ${dir2} needs en.ts and vi.ts`);
  }
  findings.sort((x, y) => x.file.localeCompare(y.file) || x.line - y.line);
  return { findings, notes, files: files.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const opts = {};
  let dir;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--i18n") opts.i18n = args[++i];
    else if (args[i] === "--manifest") opts.manifest = args[++i];
    else if (args[i].startsWith("--")) {
      console.error(`unknown option ${args[i]}`);
      process.exit(2);
    } else dir = args[i];
  }
  if (!dir || !existsSync(dir)) {
    console.error("usage: audit.mjs <src-dir> [--i18n <dir>] [--manifest <path>]");
    process.exit(2);
  }
  const { findings, notes, files } = audit(dir, opts);
  for (const f of findings) console.log(`${f.file}:${f.line} ${f.rule} ${f.level === "warn" ? "(warn) " : ""}${f.message}`);
  for (const n of notes) console.log(`note: ${n}`);
  const errors = findings.filter((f) => f.level === "error").length;
  console.log(`audit: ${files} files, ${errors} errors, ${findings.length - errors} warnings`);
  process.exit(errors ? 1 : 0);
}
