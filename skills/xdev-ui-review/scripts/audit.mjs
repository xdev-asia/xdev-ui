#!/usr/bin/env node
// Rules audit for apps built on @xdev-asia/ui. Line based, no dependencies.
//   node audit.mjs <src-dir> [--i18n <dir>] [--manifest <path>] [--contrast]
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
// Copyright, registered and trademark signs are pictographic in Unicode but are not emoji.
const EMOJI = /(?![©®™])\p{Extended_Pictographic}/u;
const TITLE_CASE = /\b(?:[A-Z][a-z]+\s+){2,}[A-Z][a-z]+\b/;

const isComment = (line) => /^\s*(\/\/|\/\*|\*)/.test(line);
const stripCssComments = (line) => line.replace(/\/\*.*?\*\//g, "");

/** Opening tags of `<Name ...>` in a JSX source, balanced over braces and quotes. */
function openingTags(src, name) {
  const out = [];
  const re = new RegExp(`<${name}(?=[\\s/>])`, "g");
  let m;
  while ((m = re.exec(src))) {
    // `useState<Dialog | null>` is a type argument, not a tag: JSX never follows a name character.
    if (/[\w$.]/.test(src[m.index - 1] ?? "")) continue;
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
    out.push({ text: src.slice(m.index, i + 1), line: src.slice(0, m.index).split("\n").length, end: i + 1 });
  }
  return out;
}

/**
 * Top-level props of one opening tag: name → raw value (`"x"`, `{expr}`, or `true` for a bare prop).
 * Props inside nested JSX in a value are not counted. `spread` is true when the tag spreads `{...x}`.
 */
function propsOf(tag) {
  const props = new Map();
  let spread = false;
  const body = tag.replace(/^<[\w.]+/, "").replace(/\/?>$/, "");
  let i = 0;
  while (i < body.length) {
    const c = body[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (c === "{") {
      const end = closeOf(body, i);
      if (/^\{\s*\.\.\./.test(body.slice(i, end))) spread = true;
      i = end;
      continue;
    }
    const m = /^[\w:-]+/.exec(body.slice(i));
    if (!m) {
      i++;
      continue;
    }
    i += m[0].length;
    if (body[i] !== "=") {
      props.set(m[0], true);
      continue;
    }
    i++;
    const q = body[i];
    const end = q === "{" ? closeOf(body, i) : q === '"' || q === "'" ? body.indexOf(q, i + 1) + 1 : i + 1;
    props.set(m[0], body.slice(i, end));
    i = end;
  }
  return { props, spread };
}

/** Index just past the brace that closes the one at `start`, skipping quoted strings. */
function closeOf(src, start) {
  let depth = 0;
  let quote = "";
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (quote) {
      if (c === quote && src[i - 1] !== "\\") quote = "";
    } else if (c === '"' || c === "'" || c === "`") quote = c;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return i + 1;
  }
  return src.length;
}

/** A prop that is set and not `{false}`. */
const isOn = (props, name) => props.has(name) && !/^\{\s*false\s*\}$/.test(String(props.get(name)));

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

/** CSS rules with selector, enclosing at-rules and line-numbered declarations. Comments blanked, `&` nesting resolved. */
function cssRules(text) {
  const src = text.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " "));
  const rules = [];
  const stack = [];
  let buf = "";
  let started = false;
  let line = 1;
  let bufLine = 1;
  let quote = "";
  let paren = 0;
  const top = () => stack[stack.length - 1];
  const flush = () => {
    const t = top();
    const m = /^([-\w]+)\s*:\s*([\s\S]*)$/.exec(buf.trim());
    if (t && t.rule && m) t.rule.decls.push({ prop: m[1].toLowerCase(), value: m[2].trim(), line: bufLine });
    buf = "";
    started = false;
  };
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quote) {
      if (c === quote && src[i - 1] !== "\\") quote = "";
    } else if (c === '"' || c === "'") quote = c;
    else if (c === "(") paren++;
    else if (c === ")") paren = Math.max(0, paren - 1);
    else if (!paren && c === "{") {
      const prelude = buf.trim().replace(/\s+/g, " ");
      const parent = [...stack].reverse().find((s) => s.rule);
      if (prelude.startsWith("@")) stack.push({ at: prelude, rule: null });
      else {
        const selector = parent ? nestSelector(parent.rule.selector, prelude) : prelude;
        const rule = { selector, at: stack.filter((s) => s.at).map((s) => s.at), line: bufLine, decls: [] };
        rules.push(rule);
        stack.push({ rule });
      }
      buf = "";
      started = false;
      continue;
    } else if (!paren && (c === ";" || c === "}")) {
      flush();
      if (c === "}") stack.pop();
      continue;
    }
    if (!started && !/\s/.test(c)) {
      started = true;
      bufLine = line;
    }
    if (started) buf += c;
    if (c === "\n") line++;
  }
  return rules;
}

/** Split a selector list on top-level commas. */
function splitList(sel) {
  const out = [];
  let depth = 0;
  let cur = "";
  for (const c of sel) {
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth--;
    if (c === "," && depth === 0) {
      out.push(cur.trim());
      cur = "";
    } else cur += c;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function nestSelector(parent, child) {
  const ps = splitList(parent);
  return splitList(child)
    .flatMap((c) => ps.map((p) => (c.includes("&") ? c.replace(/&/g, p) : `${p} ${c}`)))
    .join(", ");
}

/** The subject (last compound) of a complex selector, with :not()/:is()/:where()/:has() arguments removed. */
function subject(sel) {
  let depth = 0;
  let cut = 0;
  for (let i = 0; i < sel.length; i++) {
    const c = sel[i];
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth--;
    else if (depth === 0 && /[\s>+~]/.test(c)) cut = i + 1;
  }
  return sel.slice(cut).replace(/:(?:not|is|where|has)\((?:[^()]|\([^()]*\))*\)/g, "");
}

/** A single px or rem length (or a var() of a length token) in CSS px; null when it is anything else. */
function pxOf(v, sizes) {
  const t = v.replace(/\s*!important$/, "").trim();
  const m = /^(\d*\.?\d+)(px|rem)$/.exec(t);
  if (m) return Number(m[1]) * (m[2] === "rem" ? 16 : 1);
  const tok = /^var\(\s*--([a-z0-9-]+)\s*\)$/.exec(t);
  return tok && sizes.has(tok[1]) ? pxOf(sizes.get(tok[1]), new Map()) : null;
}

const INTERACTIVE =
  /(?:^|[^-\w])button(?![-\w])|\[role=["']?(?:button|tab|menuitem|menuitemcheckbox|menuitemradio|option|checkbox|radio|switch|treeitem)["']?\]|(?:^|[^-\w])select(?![-\w])|input\[type=["']?(?:checkbox|radio)["']?\]|\.(?:[\w-]*-)?(?:btn|button)(?:-(?:primary|secondary|ghost|danger|icon|close|sm|xs|mini|small|tiny))*(?![-\w])/;
const SIZE_PROPS = new Set(["width", "height", "min-width", "min-height", "inline-size", "block-size", "min-inline-size", "min-block-size"]);
const MOTION = /(?:^|[\s;{])(?:transform|translate|rotate|scale|top|left|right|bottom|inset[\w-]*|margin[\w-]*|offset[\w-]*|background-position)\s*:/;
const REDUCED = /prefers-reduced-motion\s*(?::\s*reduce\s*)?\)/;
const GLOBAL_KEYWORDS = new Set(["none", "inherit", "initial", "unset", "revert", "revert-layer"]);

/** WCAG 2.2 relative luminance of an sRGB colour [r, g, b] in 0..255. */
export function luminance([r, g, b]) {
  const lin = (c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Parse #rgb, #rgba, #rrggbb, #rrggbbaa, rgb() or rgba() into [r, g, b, a]; null otherwise. */
export function parseColour(v) {
  const s = String(v).trim();
  let m = /^#([0-9a-f]{3,8})$/i.exec(s);
  if (m && m[1].length !== 5 && m[1].length !== 7) {
    let h = m[1];
    if (h.length <= 4) h = [...h].map((c) => c + c).join("");
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
  }
  m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/i.exec(s);
  if (!m) return null;
  const a = m[4] === undefined ? 1 : m[4].endsWith("%") ? Number(m[4].slice(0, -1)) / 100 : Number(m[4]);
  return [Number(m[1]), Number(m[2]), Number(m[3]), a];
}

/** Contrast ratio of fg on bg. A translucent bg is composited over `base`, then a translucent fg over that. */
export function contrastRatio(fg, bg, base = [255, 255, 255, 1]) {
  const over = (t, u) => [0, 1, 2].map((i) => t[i] * t[3] + u[i] * (1 - t[3])).concat(1);
  const b = bg[3] < 1 ? over(bg, base) : bg;
  const f = fg[3] < 1 ? over(fg, b) : fg;
  const [l1, l2] = [luminance(f), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

// Token pairs the design system documents as used together (token usage notes). kind text needs 4.5:1 (SC 1.4.3),
// kind ui needs 3:1 (SC 1.4.11). level warn: decorative hairlines (a failure only
// when the hairline is the only thing that identifies a control).
const TEXT_GROUNDS = ["bg-0", "bg-1", "bg-2", "bg-3", "side-tint", "term"];
export const CONTRAST_PAIRS = [
  ...["text-1", "text-2", "text-3"].flatMap((fg) => TEXT_GROUNDS.map((bg) => ({ fg, bg, kind: "text" }))),
  ...["signal", "warn", "violet", "ok", "danger", "orange"].flatMap((fg) => [
    ...["bg-0", "bg-1", "bg-2"].map((bg) => ({ fg, bg, kind: "text" })),
    { fg, bg: `${fg}-bg`, base: "bg-1", kind: "text" },
  ]),
  ...["x-color-bg", "x-color-panel", "x-color-surface", "x-color-surface-2"].map((bg) => ({ fg: "x-color-ink", bg, kind: "text" })),
  ...["x-color-bg", "x-color-panel", "x-color-surface"].map((bg) => ({ fg: "x-color-muted", bg, kind: "text" })),
  { fg: "x-color-on-accent", bg: "x-color-accent", kind: "text" },
  ...["x-color-danger", "x-color-ok", "x-color-warn", "x-color-signal"].flatMap((fg) => [
    ...["x-color-bg", "x-color-panel"].map((bg) => ({ fg, bg, kind: "text" })),
    { fg, bg: `${fg}-soft`, base: "x-color-panel", kind: "text" },
  ]),
  ...["x-color-bg", "x-color-panel", "x-color-surface", "x-color-surface-2", "bg-0", "bg-1", "bg-2", "bg-3", "term"].map((bg) => ({ fg: "x-color-focus", bg, kind: "ui" })),
  ...["x-color-bg", "x-color-panel", "x-color-surface"].map((bg) => ({ fg: "x-color-accent", bg, kind: "ui" })),
  ...["bg-1", "bg-2"].map((bg) => ({ fg: "accent", bg, kind: "ui" })),
  ...["bg-0", "bg-1", "bg-2"].map((bg) => ({ fg: "line", bg, kind: "ui", level: "warn" })),
  ...TEXT_GROUNDS.map((bg) => ({ fg: "line-strong", bg, kind: "ui" })),
  ...["x-color-bg", "x-color-panel", "x-color-surface", "x-color-surface-2"].map((bg) => ({ fg: "x-color-line-strong", bg, kind: "ui" })),
  ...["x-color-bg", "x-color-panel", "x-color-surface"].map((bg) => ({ fg: "x-color-line", bg, kind: "ui", level: "warn" })),
];

/** Every documented pair in dark and light with its ratio. Pairs whose tokens are missing are skipped. */
export function contrastReport(manifestTokens) {
  const byName = new Map(manifestTokens.map((t) => [t.name, t.value]));
  const colour = (name, theme, hops = 0) => {
    let v = byName.get(name);
    if (v && typeof v === "object") v = v[theme];
    const alias = typeof v === "string" && /^\{([a-z0-9-]+)\}$/.exec(v);
    if (alias) return hops < 5 ? colour(alias[1], theme, hops + 1) : null;
    return v === undefined ? null : parseColour(v);
  };
  const out = [];
  for (const theme of ["dark", "light"]) {
    for (const p of CONTRAST_PAIRS) {
      const fg = colour(p.fg, theme);
      const bg = colour(p.bg, theme);
      const base = colour(p.base ?? "bg-1", theme);
      if (!fg || !bg || !base) continue;
      const ratio = contrastRatio(fg, bg, base);
      const need = p.kind === "text" ? 4.5 : 3;
      out.push({ fg: p.fg, bg: p.bg, kind: p.kind, theme, ratio, need, pass: ratio >= need, level: p.level ?? "error" });
    }
  }
  return out;
}

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
  let manifestTokens = [];
  // Library components whose props take `labels` (their English defaults need the app's words in other languages).
  let labelled = null;
  const manifestPath = opts.manifest ? resolve(opts.manifest) : findManifest(root);
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    manifestTokens = manifest.tokens;
    tokens = new Set(manifestTokens.map((t) => t.name));
    labelled = new Set((manifest.components ?? []).filter((c) => /\blabels\?\s*:/.test(c.types ?? "")).map((c) => c.name));
  } else notes.push(`unknown-token skipped: no manifest at ${manifestPath} (pass --manifest)`);
  if (opts.i18n && !labelled) notes.push("i18n-labels skipped: no manifest (pass --manifest)");
  const sizes = new Map(manifestTokens.filter((t) => typeof t.value === "string" && /^\d*\.?\d+(px|rem)$/.test(t.value)).map((t) => [t.name, t.value]));

  const files = walk(root);
  const sources = files.map((file) => ({ file, text: readFileSync(file, "utf8").replace(/\r\n/g, "\n") }));
  const local = new Set();
  for (const { text } of sources) for (const m of text.matchAll(/(--[a-z0-9-]+)\s*:/gi)) local.add(m[1].slice(2));
  for (const { text } of sources) for (const m of text.matchAll(/["'`](--[a-z0-9-]+)["'`]/g)) local.add(m[1].slice(2));

  // CSS pass inputs shared across files: which @keyframes move things, and whether a universal reduced-motion guard exists.
  const parsed = new Map(sources.filter((s) => s.file.endsWith(".css")).map((s) => [s.file, cssRules(s.text)]));
  const moving = new Map();
  for (const { file, text } of sources) {
    if (!parsed.has(file)) continue;
    for (const m of text.matchAll(/@keyframes\s+([-\w]+)\s*\{/g)) {
      let depth = 1;
      let i = m.index + m[0].length;
      for (; i < text.length && depth; i++) depth += text[i] === "{" ? 1 : text[i] === "}" ? -1 : 0;
      moving.set(m[1], (moving.get(m[1]) ?? false) || MOTION.test(text.slice(m.index + m[0].length, i)));
    }
  }
  const universalGuard = [...parsed.values()].some((rules) =>
    rules.some((r) => r.at.some((a) => REDUCED.test(a)) && splitList(r.selector).some((s) => /^\*|[\s>]\*/.test(s)) && r.decls.some((d) => /^(animation|animation-duration|animation-name)$/.test(d.prop))),
  );

  // Classes the scanned TSX puts on a <button>, a checkbox or radio <input>, or an element with a widget role.
  const controlClasses = new Set();
  for (const { file, text } of sources) {
    if (!file.endsWith(".tsx")) continue;
    const tags = [...openingTags(text, "button"), ...openingTags(text, "input").filter((t) => /\btype=["'](checkbox|radio)["']/.test(t.text))];
    for (const m of text.matchAll(/<[a-z]+\b[^<>]*?\brole=["'](?:button|tab|menuitem|menuitemcheckbox|menuitemradio|option|checkbox|radio|switch|treeitem)["']/g)) {
      tags.push(...openingTags(text.slice(m.index), m[0].slice(1).split(/[\s/>]/)[0]).slice(0, 1));
    }
    for (const t of tags) {
      const cls = /\bclassName=(?:"([^"]*)"|\{\s*"([^"]*)"\s*\}|\{\s*`([^`]*)`\s*\})/.exec(t.text);
      const raw = cls ? (cls[1] ?? cls[2] ?? cls[3]).replace(/\$\{[^}]*\}/g, " ") : "";
      for (const c of raw.split(/\s+/)) if (/^[a-z][\w-]*$/i.test(c)) controlClasses.add(c);
    }
  }
  const isControl = (subj) => INTERACTIVE.test(subj) || [...subj.matchAll(/\.([\w-]+)/g)].some((m) => controlClasses.has(m[1]));

  const focusBase = (s) => s.replace(/:focus(?:-visible)?(?![-\w])/g, "").replace(/\s+/g, " ").trim();
  // How a rule draws focus: "outline" survives forced colors; "paint" (box-shadow, border colour) does not.
  const ring = (r) => {
    if (r.decls.some((d) => /^outline(-style|-width|-color)?$/.test(d.prop) && !/^(none|0)(\s|!|$)/.test(d.value))) return "outline";
    const paints = (d) => (d.prop === "box-shadow" && !/^none\b/.test(d.value)) || (/^border(-[a-z]+)*-color$|^border$/.test(d.prop) && !/^(none|0|transparent)\b/.test(d.value));
    return r.decls.some(paints) ? "paint" : "";
  };

  function cssChecks(file, rules, text) {
    const hasForced = /forced-colors\s*:\s*active/.test(text);
    const replaced = new Map();
    for (const r of rules) {
      const kind = ring(r);
      if (!kind) continue;
      for (const s of splitList(r.selector)) {
        if (/:focus(?:-visible)?(?![-\w])/.test(s) && replaced.get(focusBase(s)) !== "outline") replaced.set(focusBase(s), kind);
      }
    }
    for (const r of rules) {
      const parts = splitList(r.selector);
      for (const d of r.decls) {
        // focus-outline: outline removed with no :focus-visible (or :focus) rule for the same selector that draws one.
        if (d.prop === "outline" && /^(none|0)(\s|!|$)/.test(d.value)) {
          const here = /:focus/.test(r.selector) ? ring(r) : "";
          const kinds = parts.filter((s) => !s.includes(":not(:focus-visible)")).map((s) => here || replaced.get(focusBase(s)) || "");
          if (kinds.some((k) => !k)) add(file, d.line, "focus-outline", "error", "Do not remove the focus outline; restyle it with --x-color-signal.");
          else if (kinds.includes("paint") && !hasForced)
            add(file, d.line, "forced-colors", "warn", "Focus shown only by box-shadow or border colour, which forced colors overrides; keep outline: 2px solid transparent.");
        }
        // fixed-width: a width or min-width over 320px that is not capped and not behind a min-width query
        // pushes a phone page sideways.
        if (/^(width|min-width|inline-size|min-inline-size)$/.test(d.prop)) {
          const px = pxOf(d.value, sizes);
          const wide = r.at.some((a) => /min-width|width\s*>=?/.test(a));
          const capped = r.decls.some((x) => /^max-(width|inline-size)$/.test(x.prop) && /%|vw|vi|cqi|min\(/.test(x.value));
          if (px !== null && px > 320 && !wide && !capped)
            add(file, d.line, "fixed-width", "warn", `${d.prop}: ${d.value} is wider than a 320px phone; use max-width, min(…, 100%) or a min-width media query.`);
        }
        // nowrap: a container that never wraps and does not scroll or clip pushes the page sideways on a phone.
        if (d.prop === "white-space" && /^nowrap\b/.test(d.value)) {
          const handled = r.decls.some((x) => /^(overflow|overflow-x|text-overflow)$/.test(x.prop) && !/^visible\b/.test(x.value));
          const control = parts.map(subject).some((s) => isControl(s));
          if (!handled && !control) add(file, d.line, "nowrap", "warn", "white-space: nowrap with no overflow or text-overflow; long text widens the page at 320px.");
        }
        // target-size: a fixed or max size under 24px on the subject of an interactive selector (SC 2.5.8).
        if (/^(width|height|inline-size|block-size|max-width|max-height|max-inline-size|max-block-size)$/.test(d.prop)) {
          const px = pxOf(d.value, sizes);
          if (px === null || px <= 1 || px >= 24) continue;
          if (r.decls.some((x) => (x.prop === "opacity" && /^0(\.0*)?$/.test(x.value)) || /^(clip|clip-path)$/.test(x.prop) || (x.prop === "visibility" && x.value === "hidden"))) continue;
          const axis = /width|inline/.test(d.prop) ? /^min-(width|inline-size)$/ : /^min-(height|block-size)$/;
          if (r.decls.some((x) => axis.test(x.prop) && (pxOf(x.value, sizes) ?? 0) >= 24)) continue;
          const hit = parts.map(subject).find((s) => !s.includes("::") && isControl(s));
          if (hit) add(file, d.line, "target-size", "warn", `${d.prop}: ${d.value} on ${hit} is under 24px; passes only with 24px spacing (SC 2.5.8).`);
        }
        // reduced-motion: an animation whose @keyframes moves the element, in a file with no reduced-motion query.
        if ((d.prop === "animation" || d.prop === "animation-name") && !universalGuard && !/prefers-reduced-motion/.test(text)) {
          const name = d.value.split(/[\s,]+/).find((t) => !GLOBAL_KEYWORDS.has(t) && moving.get(t) === true);
          if (name) add(file, d.line, "reduced-motion", "warn", `Animation ${name} moves content with no prefers-reduced-motion guard (technique C39).`);
        }
      }
    }
  }

  // An icon is named when it carries label, aria-label, aria-labelledby or title.
  const ICON_START = /^<(Icon|[A-Z]\w*Icon)(?=[\s/>])/;
  const NAMED = /\b(?:aria-label|aria-labelledby|title|label)\s*=/;
  function iconOnly(content) {
    let rest = content.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").trim();
    let icons = 0;
    while (rest) {
      if (rest.startsWith("<svg")) {
        const end = rest.indexOf("</svg>");
        if (end < 0 || /<title|aria-label/.test(rest.slice(0, end))) return false;
        rest = rest.slice(end + 6).trim();
      } else if (ICON_START.test(rest)) {
        const tag = openingTags(rest, ICON_START.exec(rest)[1])[0].text;
        if (!tag.endsWith("/>") || NAMED.test(tag)) return false;
        rest = rest.slice(tag.length).trim();
      } else return false;
      icons++;
    }
    return icons > 0;
  }
  function iconButtonChecks(file, text) {
    const unnamed = (t) => !/\{\s*\.\.\./.test(t) && !/\b(?:aria-label|aria-labelledby|title|children)\s*=/.test(t);
    for (const t of openingTags(text, "button")) {
      if (t.text.endsWith("/>") || !unnamed(t.text)) continue;
      const close = text.indexOf("</button>", t.end);
      if (close > 0 && iconOnly(text.slice(t.end, close))) add(file, t.line, "icon-button-name", "error", "Icon-only button has no accessible name; add aria-label or use IconButton (SC 4.1.2).");
    }
    for (const t of openingTags(text, "Button")) {
      if (t.text.endsWith("/>") && /\bicon\s*=/.test(t.text) && unnamed(t.text)) add(file, t.line, "icon-button-name", "error", "Button with only an icon has no accessible name; use IconButton with label (SC 4.1.2).");
    }
  }

  // A sign-in frame needs a product line, the language and theme controls, a footer, and one page title.
  function signInChecks(file, text) {
    const shells = openingTags(text, "AuthShell");
    if (!shells.length) return;
    for (const t of shells) {
      const spread = /\{\s*\.\.\./.test(t.text);
      const missing = spread ? [] : ["headline", "actions", "footer"].filter((p) => !new RegExp(`\\s${p}\\s*=`).test(t.text));
      if (missing.length) add(file, t.line, "sign-in-shell", "warn", `AuthShell has no ${missing.join(", ")}; give it a headline, the language and theme controls and a footer (see xdev-ui-admin references/sign-in.md).`);
      if (/\sactions\s*=\s*\{\s*</.test(t.text) && !/\bThemeSwitch\b/.test(t.text)) add(file, t.line, "sign-in-shell", "warn", "AuthShell actions have no ThemeSwitch; a person picks the theme before signing in.");
      if (/\sheadline\s*=\s*\{\s*<h[1-6]\b/.test(t.text)) add(file, t.line, "sign-in-shell", "warn", "The AuthShell headline is a heading; pass text, the form holds the page's only h1.");
    }
    const h1 = openingTags(text, "h1");
    if (h1.length > 1) add(file, h1[1].line, "sign-in-shell", "warn", `${h1.length} h1 in a sign-in page; the form holds one ("Welcome back", "Sign in").`);
  }

  // Page rules: the parts of a list, dashboard, dialog, form and grid that the page reviews (references/pages/*.md) can read from code.
  const PAGES = "xdev-ui-review references/pages";
  function pageChecks(file, text) {
    const each = (name, fn) => {
      for (const t of openingTags(text, name)) {
        const { props, spread } = propsOf(t.text);
        if (!spread) fn(t, props);
      }
    };
    each("DataTable", (t, p) => {
      // rows={RESOURCES}: a fixed set in a constant is never empty.
      if (/^\{\s*[A-Z][A-Z0-9_]*\s*\}$/.test(String(p.get("rows") ?? ""))) return;
      if (!p.has("empty")) add(file, t.line, "list-empty", "warn", `DataTable has no empty state; pass empty={<EmptyState …/>}, with a second one when filters hide every row (${PAGES}/list.md).`);
    });
    each("Dialog", (t, p) => {
      const destructive = isOn(p, "alert") || p.get("tone") === '"danger"';
      if (!destructive) return;
      if (!isOn(p, "modal")) add(file, t.line, "confirm-dialog", "warn", `Destructive Dialog is not modal; without modal there is no focus trap, Esc or return of focus (${PAGES}/dialogs-forms.md).`);
      if (!p.has("busy") && !p.has("confirmDisabled")) add(file, t.line, "confirm-dialog", "warn", `Destructive Dialog does not lock while the request runs; pass busy or confirmDisabled so it cannot be confirmed twice (${PAGES}/dialogs-forms.md).`);
      if (!isOn(p, "alert")) add(file, t.line, "confirm-dialog", "warn", `Destructive Dialog has no alert; a confirm that destroys something is an alertdialog (${PAGES}/dialogs-forms.md).`);
    });
    each("FormDialog", (t, p) => {
      if (!p.has("busy")) add(file, t.line, "form-busy", "warn", `FormDialog has no busy; it can be sent twice or closed mid-request (${PAGES}/dialogs-forms.md).`);
    });
    for (const name of ["Field", "input"]) {
      each(name, (t, p) => {
        const type = /^["']([\w-]+)["']$/.exec(String(p.get("type") ?? ""))?.[1];
        if (["password", "email", "tel"].includes(type) && !p.has("autoComplete") && !p.has("autocomplete"))
          add(file, t.line, "autocomplete", "warn", `A ${type} field has no autoComplete; say what the browser may fill (current-password, new-password, email, tel, or off) (SC 1.3.5).`);
      });
    }
    each("img", (t, p) => {
      if (!p.has("alt")) add(file, t.line, "img-alt", "error", 'img has no alt; give it the name, or alt="" when the words next to it already say it (SC 1.1.1).');
    });
    each("StatTile", (t, p) => {
      if (p.has("delta") && !p.has("hint")) add(file, t.line, "stat-delta", "warn", `StatTile shows a delta with no hint; say what it is compared with ("vs last 7 days") (${PAGES}/dashboard.md).`);
    });
    each("ResourceCard", (t, p) => {
      const face = p.get("leading");
      if (!face) add(file, t.line, "resource-face", "warn", `ResourceCard has no leading; lead each thing with an Emblem so the grid reads by face (${PAGES}/provider-grid.md).`);
      else if (/<(Avatar|img)\b/.test(String(face))) add(file, t.line, "resource-face", "warn", `ResourceCard leads with an Avatar or img; a thing's face is an Emblem (name, logo, colour), Avatar is for people (${PAGES}/provider-grid.md).`);
    });
    if (!opts.i18n || !labelled) return;
    // Parts whose built-in words show only with one prop set; ShellTitle's default is built from the app's own words.
    const shownWith = { EmptyState: "steps" };
    for (const name of labelled) {
      if (name === "ShellTitle") continue;
      each(name, (t, p) => {
        if (p.has("labels")) return;
        if (shownWith[name] && !p.has(shownWith[name])) return;
        if (name === "Dialog" && p.has("confirmLabel") && p.has("cancelLabel")) return;
        if (name === "Spinner" && p.has("label")) return;
        add(file, t.line, "i18n-labels", "warn", `${name} has no labels; its built-in words are English, pass them from the strings files.`);
      });
    }
  }

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
      if (!css && /tabindex\s*=\s*(?:\{\s*|["'])\+?0*[1-9]\d*\s*[}"']/i.test(line)) add(file, n, "positive-tabindex", "error", "Positive tabIndex reorders focus (WCAG F44); use 0 or -1 and DOM order.");
      if (!css && style && /outline\s*:\s*["']?(none|0)\b/.test(line)) add(file, n, "focus-outline", "error", "Do not remove the focus outline; restyle it with --x-color-signal.");
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
    if (parsed.has(file)) cssChecks(file, parsed.get(file), text);
    if (file.endsWith(".tsx")) iconButtonChecks(file, text);
    if (file.endsWith(".tsx")) signInChecks(file, text);
    if (file.endsWith(".tsx")) pageChecks(file, text);
    if (file.endsWith(".tsx")) {
      const tags = openingTags(text, "Button").filter((t) => /variant\s*=\s*["{]\s*["']?primary/.test(t.text));
      if (tags.length > 1) add(file, tags[1].line, "primary-count", "warn", `${tags.length} primary Buttons in one file; one primary per surface, the rest secondary (the default).`);
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
  if (opts.contrast) {
    if (!manifestTokens.length) notes.push("contrast skipped: no manifest (pass --manifest)");
    for (const p of contrastReport(manifestTokens).filter((x) => !x.pass)) {
      const sc = p.kind === "text" ? "1.4.3" : "1.4.11";
      add(manifestPath, 1, "contrast", p.level, `${p.fg} on ${p.bg} (${p.theme}) is ${Math.floor(p.ratio * 100) / 100}:1; ${p.kind} needs ${p.need}:1 (SC ${sc}).`);
    }
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
    else if (args[i] === "--contrast") opts.contrast = true;
    else if (args[i].startsWith("--")) {
      console.error(`unknown option ${args[i]}`);
      process.exit(2);
    } else dir = args[i];
  }
  if (!dir || !existsSync(dir)) {
    console.error("usage: audit.mjs <src-dir> [--i18n <dir>] [--manifest <path>] [--contrast]");
    process.exit(2);
  }
  const { findings, notes, files } = audit(dir, opts);
  for (const f of findings) console.log(`${f.file}:${f.line} ${f.rule} ${f.level === "warn" ? "(warn) " : ""}${f.message}`);
  for (const n of notes) console.log(`note: ${n}`);
  const errors = findings.filter((f) => f.level === "error").length;
  console.log(`audit: ${files} files, ${errors} errors, ${findings.length - errors} warnings`);
  process.exit(errors ? 1 : 0);
}
