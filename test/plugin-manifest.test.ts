import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p: string) => JSON.parse(readFileSync(join(root, p), "utf8")) as Record<string, any>;
const plugin = read(".claude-plugin/plugin.json");
const market = read(".claude-plugin/marketplace.json");
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

describe("plugin.json", () => {
  it("has a kebab-case name that does not start with a reserved prefix", () => {
    expect(plugin.name).toBe("xdev-ui");
    expect(plugin.name).toMatch(KEBAB);
    expect(plugin.name).not.toMatch(/^(claude|anthropic)-/);
  });
  it("describes itself and leaves the version to the release", () => {
    expect(typeof plugin.description).toBe("string");
    expect(plugin.license).toBe("Apache-2.0");
    expect(plugin.version).toBeUndefined();
  });
  it("uses the default skills folder: every skills/* has a SKILL.md and no custom path is set", () => {
    expect(plugin.skills).toBeUndefined();
    const dirs = readdirSync(join(root, "skills"));
    expect(dirs.length).toBe(3);
    for (const d of dirs) expect(existsSync(join(root, "skills", d, "SKILL.md")), d).toBe(true);
  });
});

describe("marketplace.json", () => {
  it("has name, owner and plugins", () => {
    expect(market.name).toBe("xdev-asia");
    expect(market.name).toMatch(KEBAB);
    expect(market.name).not.toMatch(/^(claude|anthropic)/);
    expect(typeof market.owner?.name).toBe("string");
    expect(Array.isArray(market.plugins)).toBe(true);
  });
  it("lists the plugin of this repo with a relative source", () => {
    const entry = market.plugins.find((p: { name: string }) => p.name === plugin.name);
    expect(entry).toBeDefined();
    expect(entry.source).toBe("./");
    expect(entry.source).not.toContain("..");
    expect(typeof entry.description).toBe("string");
  });
});
