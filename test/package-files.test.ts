import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as { files: string[]; bin: Record<string, string> };

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    if (n === "node_modules") return [];
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

describe("package.json", () => {
  it("ships skills and the install bin", () => {
    expect(pkg.files).toEqual(expect.arrayContaining(["dist", "skills", "bin"]));
    expect(pkg.bin["xdev-ui-skills"]).toBe("./bin/xdev-ui-skills.mjs");
    expect(pkg.bin["xdev-ui-mcp"]).toBe("./dist/mcp.js");
    expect(existsSync(join(root, pkg.bin["xdev-ui-skills"]))).toBe(true);
    expect(readFileSync(join(root, "bin/xdev-ui-skills.mjs"), "utf8").startsWith("#!/usr/bin/env node")).toBe(true);
  });
  it("keeps dotfiles out of skills templates, because npm drops them from the tarball", () => {
    const dot = walk(join(root, "skills")).filter((f) => /\/templates\/[^/]+\/(\.[^/]+)$/.test(f.split("\\").join("/")));
    expect(dot).toEqual([]);
    for (const t of ["xdev-ui-build-app/templates/app", "xdev-ui-admin/templates/admin"]) {
      for (const f of ["_npmrc", "_gitignore", "_mcp.json"]) expect(existsSync(join(root, "skills", t, f)), `${t}/${f}`).toBe(true);
    }
  });
});
