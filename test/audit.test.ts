import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
// @ts-expect-error plain ESM script without types
import { audit } from "../skills/xdev-ui-review/scripts/audit.mjs";

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
