import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
// @ts-expect-error plain ESM script without types
import { audit, contrastRatio, contrastReport, parseColour } from "../skills/xdev-ui-review/scripts/audit.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const fx = (p: string) => resolve(here, "fixtures/audit", p);
const manifest = resolve(here, "../generated/ai-manifest.json");

type Finding = { file: string; line: number; rule: string; level: "error" | "warn"; message: string };
const run = (p: string, opts: Record<string, string> = {}): Finding[] => audit(fx(p), { manifest, ...opts }).findings;

describe("audit: good fixtures", () => {
  it("reports nothing", () => {
    expect(run("good", { i18n: fx("good/i18n") })).toEqual([]);
  });
});

describe("audit: one bad fixture per rule", () => {
  const errors = ["raw-colour", "raw-px", "raw-font", "left-stripe", "unknown-token", "focus-outline"];
  for (const rule of errors) {
    it(`${rule} is an error`, () => {
      const f = run(`bad/${rule}`);
      expect(f.some((x) => x.rule === rule && x.level === "error")).toBe(true);
      expect(f.every((x) => x.rule === rule), JSON.stringify(f)).toBe(true);
    });
  }
  it("raw-colour finds hex and rgba on the same line", () => {
    expect(run("bad/raw-colour").map((x) => x.line)).toEqual([1]);
  });
  it("raw-px ignores 1px hairlines", () => {
    expect(run("bad/raw-px")).toHaveLength(1);
  });
  it("raw-font flags font-size and a font shorthand without a type token", () => {
    expect(run("bad/raw-font").map((x) => x.line)).toEqual([1, 2]);
  });
  it("left-stripe flags border-left, inset shadow and logical width", () => {
    expect(run("bad/left-stripe").map((x) => x.line)).toEqual([1, 2, 3]);
  });
  it("i18n-parity compares en and vi", () => {
    const f = run("bad/i18n-parity", { i18n: fx("bad/i18n-parity") });
    const msgs = f.filter((x) => x.rule === "i18n-parity").map((x) => x.message);
    expect(f.every((x) => x.level === "error")).toBe(true);
    expect(msgs.some((m) => m.includes("cancel") && m.includes("not in vi"))).toBe(true);
    expect(msgs.some((m) => m.includes("extra") && m.includes("not in en"))).toBe(true);
    expect(msgs.some((m) => m.includes("save") && m.includes("empty"))).toBe(true);
  });
  it("primary-count is a warning", () => {
    const f = run("bad/primary-count");
    expect(f).toHaveLength(1);
    expect(f[0]).toMatchObject({ rule: "primary-count", level: "warn", line: 5 });
  });
  it("label-voice is a warning", () => {
    const f = run("bad/label-voice");
    expect(f).toHaveLength(1);
    expect(f[0]).toMatchObject({ rule: "label-voice", level: "warn" });
  });
  it("skips unknown-token with a note when no manifest exists", () => {
    const r = audit(fx("bad/unknown-token"), { manifest: fx("missing.json") });
    expect(r.findings).toEqual([]);
    expect(r.notes[0]).toContain("unknown-token skipped");
  });
});

describe("audit: focus-outline exemption", () => {
  it("allows outline: none only under :not(:focus-visible)", () => {
    const dir = mkdtempSync(join(tmpdir(), "xdev-audit-"));
    try {
      writeFileSync(join(dir, "a.css"), ".a:focus:not(:focus-visible) { outline: none; }\n.b:focus { outline: none; }\n");
      const f = audit(dir, { manifest }).findings.filter((x: Finding) => x.rule === "focus-outline");
      expect(f.map((x: Finding) => x.line)).toEqual([2]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("audit: default manifest", () => {
  it("finds a manifest without --manifest, so unknown-token runs", () => {
    const r = audit(fx("bad/unknown-token"));
    expect(r.notes.filter((n: string) => n.includes("skipped"))).toEqual([]);
    expect(r.findings.some((f: Finding) => f.rule === "unknown-token")).toBe(true);
  });
  it("prefers the manifest installed in the scanned project", () => {
    const dir = mkdtempSync(join(tmpdir(), "xdev-audit-"));
    try {
      mkdirSync(join(dir, "node_modules/@xdev-asia/ui/dist"), { recursive: true });
      writeFileSync(join(dir, "node_modules/@xdev-asia/ui/dist/ai-manifest.json"), JSON.stringify({ tokens: [{ name: "only-here" }] }));
      mkdirSync(join(dir, "src"));
      writeFileSync(join(dir, "src/a.css"), ".a { color: var(--only-here); background: var(--bg-0); }\n");
      const r = audit(join(dir, "src"));
      expect(r.findings.map((f: Finding) => f.message).join("\n")).toContain("bg-0");
      expect(r.findings.every((f: Finding) => !f.message.includes("only-here"))).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

const inDir = (files: Record<string, string>, opts: Record<string, unknown> = {}): Finding[] => {
  const dir = mkdtempSync(join(tmpdir(), "xdev-audit-"));
  try {
    for (const [name, body] of Object.entries(files)) writeFileSync(join(dir, name), body);
    return audit(dir, { manifest, ...opts }).findings;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

describe("audit: accessibility rules", () => {
  it("positive-tabindex flags tabIndex above 0 only", () => {
    const f = run("bad/positive-tabindex");
    expect(f.map((x) => [x.rule, x.level, x.line])).toEqual([
      ["positive-tabindex", "error", 4],
      ["positive-tabindex", "error", 7],
    ]);
  });
  it("icon-button-name flags unnamed icon-only buttons, not named ones or ones with text", () => {
    const f = run("bad/icon-button-name");
    expect(f.map((x) => [x.rule, x.level, x.line])).toEqual([
      ["icon-button-name", "error", 6],
      ["icon-button-name", "error", 12],
    ]);
  });
  it("icon-button-name skips buttons with a spread or an expression child", () => {
    const f = inDir({
      "a.tsx": 'export const A = (p: object) => (<div><button {...p}><Icon name="close" /></button><button>{p.toString()}</button></div>);\n',
    });
    expect(f.filter((x) => x.rule === "icon-button-name")).toEqual([]);
  });
  it("target-size warns on fixed sizes under 24px on interactive subjects only", () => {
    const f = run("bad/target-size");
    expect(f.every((x) => x.rule === "target-size" && x.level === "warn")).toBe(true);
    expect(f.map((x) => x.line)).toEqual([1, 1]);
  });
  it("target-size resolves size tokens and ignores visually hidden inputs", () => {
    const f = inDir({
      "a.css": '.x-btn { height: var(--x-space-4); }\n.sw input[type="checkbox"] { width: 1rem; height: 1rem; opacity: 0; }\n.x-btn-group { height: 1rem; }\n',
    });
    expect(f.filter((x) => x.rule === "target-size").map((x) => x.line)).toEqual([1]);
  });
  it("target-size treats classes put on a button in TSX as controls", () => {
    const f = inDir({
      "a.tsx": 'export const A = () => <div><button type="button" className="tab-close">Close tab</button><span className="tag">Tag</span></div>;\n',
      "a.css": ".tab-close { width: 1.25rem; }\n.tag { width: 1rem; }\n",
    });
    expect(f.map((x) => [x.rule, x.file, x.line])).toEqual([["target-size", "a.css", 1]]);
  });
  it("reduced-motion warns only for keyframes that move, in a file with no guard", () => {
    const f = run("bad/reduced-motion");
    expect(f.map((x) => [x.rule, x.level, x.line])).toEqual([["reduced-motion", "warn", 3]]);
  });
  it("reduced-motion accepts a guard in the file or a universal guard anywhere", () => {
    const anim = "@keyframes x-slide { from { transform: translateY(0.5rem); } }\n.t { animation: x-slide 1s; }\n";
    expect(inDir({ "a.css": `${anim}@media (prefers-reduced-motion: reduce) { .t { animation: none; } }\n` })).toEqual([]);
    expect(inDir({ "a.css": anim, "b.css": "@media (prefers-reduced-motion: reduce) { *, *::before { animation-duration: 0.01ms !important; } }\n" })).toEqual([]);
  });
  it("focus-outline accepts a :focus-visible rule that restores a ring for the same selector", () => {
    const f = inDir({ "a.css": ".c { outline: none; }\n.c:focus-visible { outline: 2px solid var(--x-color-signal); }\n.d { outline: 0; }\n" });
    expect(f.map((x) => [x.rule, x.line])).toEqual([["focus-outline", 3]]);
  });
  it("forced-colors warns when box-shadow is the only focus ring", () => {
    const f = run("bad/forced-colors");
    expect(f.map((x) => [x.rule, x.level, x.line])).toEqual([["forced-colors", "warn", 1]]);
    const guarded = inDir({ "a.css": ".f:focus-visible { outline: none; box-shadow: 0 0 0 0.125rem var(--x-color-signal); }\n@media (forced-colors: active) { .f:focus-visible { outline: 0.125rem solid; } }\n" });
    expect(guarded).toEqual([]);
  });
});

describe("audit: token contrast", () => {
  it("uses the WCAG 2.2 formula", () => {
    expect(contrastRatio([255, 255, 255, 1], [0, 0, 0, 1])).toBeCloseTo(21, 5);
    expect(contrastRatio(parseColour("#777777"), parseColour("#ffffff"))).toBeLessThan(4.5);
    expect(contrastRatio(parseColour("#767676"), parseColour("#ffffff"))).toBeGreaterThanOrEqual(4.5);
  });
  it("composites a translucent ground over its base before measuring", () => {
    const tint = parseColour("rgba(0, 0, 0, 0.5)");
    expect(tint).toEqual([0, 0, 0, 0.5]);
    expect(parseColour("#00000080")?.[3]).toBeCloseTo(0.5, 2);
    expect(contrastRatio([255, 255, 255, 1], tint, [255, 255, 255, 1])).toBeCloseTo(contrastRatio([255, 255, 255, 1], [127.5, 127.5, 127.5, 1]), 5);
  });
  it("every error-level token pair passes in dark and light", () => {
    const tokens = JSON.parse(readFileSync(manifest, "utf8")).tokens;
    const report = contrastReport(tokens) as { fg: string; bg: string; theme: string; ratio: number; pass: boolean; level: string }[];
    expect(report.length).toBeGreaterThan(100);
    expect(report.filter((p) => p.level === "error" && !p.pass).map((p) => `${p.fg}/${p.bg}/${p.theme} ${p.ratio.toFixed(2)}`)).toEqual([]);
  });
  it("text-3 reaches 4.5:1 and line-strong 3:1 on every ground in both themes", () => {
    const tokens = JSON.parse(readFileSync(manifest, "utf8")).tokens;
    const report = contrastReport(tokens) as { fg: string; bg: string; theme: string; ratio: number }[];
    const of = (fg: string) => report.filter((p) => p.fg === fg);
    for (const fg of ["text-3"]) {
      expect(of(fg).map((p) => p.bg).sort()).toEqual(["bg-0", "bg-1", "bg-2", "bg-3", "side-tint", "term"].flatMap((b) => [b, b]).sort());
      expect(of(fg).filter((p) => p.ratio < 4.5).map((p) => `${p.bg}/${p.theme} ${p.ratio.toFixed(2)}`)).toEqual([]);
    }
    for (const fg of ["line-strong", "x-color-line-strong"]) {
      expect(of(fg).length).toBeGreaterThanOrEqual(8);
      expect(of(fg).filter((p) => p.ratio < 3).map((p) => `${fg}/${p.bg}/${p.theme} ${p.ratio.toFixed(2)}`)).toEqual([]);
    }
  });
  it("keeps the hairline tokens and strengthens them under prefers-contrast: more", () => {
    const css = readFileSync(resolve(here, "../src/styles/tokens.css"), "utf8");
    const tokens = JSON.parse(readFileSync(resolve(here, "../tokens/tokens.json"), "utf8"));
    const line = tokens.color.tokens.find((t: { name: string }) => t.name === "line");
    expect(line.value).toEqual({ dark: "#2a2b31", light: "#dcdfe5" });
    const more = css.slice(css.indexOf("@media (prefers-contrast: more)"));
    expect(more).toContain("--line: var(--line-strong)");
    expect(more).toContain("--x-color-line: var(--x-color-line-strong)");
    expect(more).toMatch(/--text-2: color-mix/);
    expect(more).toMatch(/--text-3: color-mix/);
  });
  it("is opt-in and reports known exceptions as warnings", () => {
    expect(run("good", { i18n: fx("good/i18n") }).some((x) => x.rule === "contrast")).toBe(false);
    const f = audit(fx("good"), { manifest, contrast: true }).findings as Finding[];
    const c = f.filter((x) => x.rule === "contrast");
    expect(c.length).toBeGreaterThan(0);
    expect(c.every((x) => x.level === "warn" && /^(line|x-color-line) /.test(x.message))).toBe(true);
  });
});
