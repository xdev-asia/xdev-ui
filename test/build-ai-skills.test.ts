import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const gen = (f: string): string => readFileSync(join(root, "generated", f), "utf8");
const manifest = JSON.parse(gen("ai-manifest.json")) as { skills: { name: string; description: string; body: string; files: { path: string; text: string }[] }[] };
const NAMES = ["xdev-ui-admin", "xdev-ui-build-app", "xdev-ui-review"];

describe("ai manifest skills", () => {
  it("has the three skills, sorted, with description and body from SKILL.md", () => {
    expect(manifest.skills.map((s) => s.name)).toEqual(NAMES);
    for (const s of manifest.skills) {
      expect(s.description).toMatch(/\bUse (when|before|for)\b/);
      expect(s.body.startsWith("# ")).toBe(true);
      expect(s.body).not.toContain("license: Apache-2.0");
    }
  });
  it("lists every file under the skill folder, with forward-slash paths", () => {
    const admin = manifest.skills.find((s) => s.name === "xdev-ui-admin")!;
    const paths = admin.files.map((f) => f.path);
    expect(paths).toContain("SKILL.md");
    expect(paths).toContain("references/resource-list.md");
    expect(paths).toContain("templates/admin/src/App.tsx");
    expect(paths.every((p) => !p.includes("\\") && !p.startsWith("/"))).toBe(true);
    expect(admin.files.find((f) => f.path === "references/resource-list.md")!.text).toContain("# Resource list");
    expect(manifest.skills.find((s) => s.name === "xdev-ui-review")!.files.map((f) => f.path)).toContain("scripts/audit.mjs");
  });
});

describe("llms files", () => {
  it("llms.txt lists the skills, the install line and the new tool", () => {
    const t = gen("llms.txt");
    expect(t).toContain("## Skills");
    for (const n of NAMES) expect(t).toContain(`- ${n}:`);
    expect(t).toContain("xdev-ui-skills install");
    expect(t).toContain("xdevui_get_skill");
  });
  it("llms-full.txt has SKILL.md and references but no templates", () => {
    const t = gen("llms-full.txt");
    expect(t).toContain("# Skills");
    expect(t).toContain("# Resource list");
    expect(t).not.toContain("export function createStore");
  });
});
