import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const bin = join(root, "bin/xdev-ui-skills.mjs");
const dirs: string[] = [];
const tmp = (): string => {
  const d = mkdtempSync(join(tmpdir(), "xdev-skills-"));
  dirs.push(d);
  return d;
};
afterAll(() => dirs.forEach((d) => rmSync(d, { recursive: true, force: true })));

function run(args: string[], cwd: string, home = tmp()) {
  const r = spawnSync(process.execPath, [bin, ...args], { cwd, encoding: "utf8", timeout: 10_000, env: { ...process.env, HOME: home, USERPROFILE: home } });
  return { code: r.status, out: r.stdout, err: r.stderr, home };
}

describe("xdev-ui-skills list", () => {
  it("prints the three skills", () => {
    const r = run(["list"], tmp());
    expect(r.code).toBe(0);
    for (const n of ["xdev-ui-admin", "xdev-ui-build-app", "xdev-ui-review"]) expect(r.out).toContain(n);
  });
});

describe("xdev-ui-skills install", () => {
  it("copies every skill into .claude/skills of the project by default", () => {
    const cwd = tmp();
    const r = run(["install"], cwd);
    expect(r.code).toBe(0);
    expect(readdirSync(join(cwd, ".claude/skills")).sort()).toEqual(["xdev-ui-admin", "xdev-ui-build-app", "xdev-ui-review"]);
    expect(existsSync(join(cwd, ".claude/skills/xdev-ui-review/scripts/audit.mjs"))).toBe(true);
    expect(existsSync(join(cwd, ".claude/skills/xdev-ui-admin/templates/admin/_npmrc"))).toBe(true);
    expect(r.out).toContain(join(".claude", "skills", "xdev-ui-admin", "SKILL.md"));
  });
  it("--user --claude writes under HOME", () => {
    const cwd = tmp();
    const r = run(["install", "--claude", "--user", "--skill", "xdev-ui-review"], cwd);
    expect(r.code).toBe(0);
    expect(readdirSync(join(r.home, ".claude/skills"))).toEqual(["xdev-ui-review"]);
    expect(existsSync(join(cwd, ".claude"))).toBe(false);
  });
  it("--codex --user writes under ~/.agents/skills; --cursor uses .agents/skills in the project", () => {
    const a = run(["install", "--codex", "--user"], tmp());
    expect(existsSync(join(a.home, ".agents/skills/xdev-ui-admin/SKILL.md"))).toBe(true);
    const cwd = tmp();
    run(["install", "--cursor", "--skill", "xdev-ui-build-app"], cwd);
    expect(existsSync(join(cwd, ".agents/skills/xdev-ui-build-app/SKILL.md"))).toBe(true);
  });
  it("--dir writes <path>/<name>", () => {
    const cwd = tmp();
    const target = join(tmp(), "custom");
    expect(run(["install", "--dir", target, "--skill", "xdev-ui-review"], cwd).code).toBe(0);
    expect(existsSync(join(target, "xdev-ui-review/SKILL.md"))).toBe(true);
  });
  it("refuses to overwrite without --force, and --force replaces", () => {
    const cwd = tmp();
    run(["install", "--skill", "xdev-ui-review"], cwd);
    const marker = join(cwd, ".claude/skills/xdev-ui-review/SKILL.md");
    writeFileSync(marker, "edited");
    const refused = run(["install", "--skill", "xdev-ui-review"], cwd);
    expect(refused.code).toBe(1);
    expect(refused.err).toContain("--force");
    expect(readFileSync(marker, "utf8")).toBe("edited");
    expect(run(["install", "--skill", "xdev-ui-review", "--force"], cwd).code).toBe(0);
    expect(readFileSync(marker, "utf8")).not.toBe("edited");
  });
  it("--dry-run lists paths and writes nothing", () => {
    const cwd = tmp();
    const r = run(["install", "--dry-run"], cwd);
    expect(r.code).toBe(0);
    expect(r.out).toContain("SKILL.md");
    expect(readdirSync(cwd)).toEqual([]);
  });
  it("an unknown flag, skill or command exits with 2", () => {
    expect(run(["install", "--nope"], tmp()).code).toBe(2);
    expect(run(["install", "--skill", "xdev-ui-nope"], tmp()).code).toBe(2);
    expect(run(["frobnicate"], tmp()).code).toBe(2);
    expect(run([], tmp()).code).toBe(2);
  });
});

describe("xdev-ui-skills create", () => {
  it("create admin writes the template with dotfiles renamed and the package named after the folder", () => {
    const cwd = tmp();
    const r = run(["create", "admin", "my-console"], cwd);
    expect(r.code).toBe(0);
    const out = join(cwd, "my-console");
    for (const f of [".npmrc", ".gitignore", ".mcp.json", "package.json", "src/App.tsx"]) expect(existsSync(join(out, f)), f).toBe(true);
    for (const f of ["_npmrc", "_gitignore", "_mcp.json"]) expect(existsSync(join(out, f)), f).toBe(false);
    expect(JSON.parse(readFileSync(join(out, "package.json"), "utf8")).name).toBe("my-console");
  });
  it("create app works too, and refuses a non-empty folder without --force", () => {
    const cwd = tmp();
    expect(run(["create", "app", "a"], cwd).code).toBe(0);
    const again = run(["create", "app", "a"], cwd);
    expect(again.code).toBe(1);
    expect(again.err).toContain("--force");
    expect(run(["create", "app", "a", "--force"], cwd).code).toBe(0);
    mkdirSync(join(cwd, "empty"));
    expect(run(["create", "app", "empty"], cwd).code).toBe(0);
  });
  it("rejects an unknown kind or a missing folder with 2", () => {
    expect(run(["create", "blog", "x"], tmp()).code).toBe(2);
    expect(run(["create", "app"], tmp()).code).toBe(2);
  });
});
