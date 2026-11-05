import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillsDir = join(root, "skills");
const names = readdirSync(skillsDir).filter((n) => statSync(join(skillsDir, n)).isDirectory());

function frontmatter(text: string): { data: Record<string, string>; body: string } {
  const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text);
  if (!m) throw new Error("missing frontmatter");
  const data: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const kv = /^([a-z-]+):\s*(.*)$/.exec(line);
    if (!kv) throw new Error(`bad frontmatter line: ${line}`);
    data[kv[1]] = kv[2].replace(/^"(.*)"$/, "$1");
  }
  return { data, body: m[2] };
}

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : [p];
  });
}

describe("skills", () => {
  it("ships the three skills", () => {
    expect(names.sort()).toEqual(expect.arrayContaining(["xdev-ui-review"]));
  });
  for (const name of names) {
    describe(name, () => {
      const dir = join(skillsDir, name);
      const text = readFileSync(join(dir, "SKILL.md"), "utf8").replace(/\r\n/g, "\n");
      const { data, body } = frontmatter(text);

      it("has only name, description and license in the frontmatter", () => {
        expect(Object.keys(data).sort()).toEqual(["description", "license", "name"]);
        expect(data.license).toBe("Apache-2.0");
      });
      it("has a valid name matching its folder", () => {
        expect(data.name).toBe(name);
        expect(data.name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
        expect(data.name.length).toBeLessThanOrEqual(64);
        expect(data.name).not.toMatch(/claude|anthropic/);
      });
      it("has a third-person description that says when to use it", () => {
        const d = data.description;
        expect(d.length).toBeGreaterThanOrEqual(1);
        expect(d.length).toBeLessThanOrEqual(1024);
        expect(d).not.toMatch(/[<>]/);
        expect(d).not.toMatch(/^(I|You|Use|Build|Run)\b/);
        expect(d).toMatch(/\bUse (when|before|for)\b/);
        expect(d).toContain("@xdev-asia/ui");
      });
      it("keeps the body short", () => {
        expect(text.split("\n").length).toBeLessThanOrEqual(500);
        expect(body.split("\n").length).toBeLessThanOrEqual(150);
      });
      it("links only to files in references, templates or scripts", () => {
        for (const m of body.matchAll(/\]\(([^)]+)\)/g)) {
          const target = m[1];
          if (/^[a-z]+:/.test(target) || target.startsWith("#")) continue;
          expect(target, target).toMatch(/^(references|templates|scripts)\//);
          expect(existsSync(join(dir, target.split("#")[0])), target).toBe(true);
        }
        for (const m of body.matchAll(/`((?:references|templates|scripts)\/[^`\s]+)`/g)) {
          if (/[<*{]/.test(m[1])) continue;
          expect(existsSync(join(dir, m[1])), m[1]).toBe(true);
        }
      });
      it("keeps references one level deep and opens long ones with Contents", () => {
        const refs = existsSync(join(dir, "references")) ? files(join(dir, "references")) : [];
        for (const f of refs) {
          const t = readFileSync(f, "utf8");
          expect(t, f).not.toMatch(/\]\((?!https?:|#)[^)]*\.md[^)]*\)/);
          if (t.split("\n").length > 100) expect(t, f).toMatch(/^## Contents$/m);
        }
      });
    });
  }
});
