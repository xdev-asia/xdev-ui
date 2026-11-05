import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const src = dirname(fileURLToPath(import.meta.url));
const tokens = JSON.parse(readFileSync(resolve(src, "../tokens/tokens.json"), "utf8"));
const tokensCss = readFileSync(resolve(src, "styles/tokens.css"), "utf8");

function cssFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? cssFiles(p) : p.endsWith(".css") ? [p] : [];
  });
}

describe("tokens.json", () => {
  it("defines the same keys for light and dark", () => {
    const themed = tokens.color.tokens.filter((t: { value: unknown }) => typeof t.value === "object");
    expect(themed.length).toBeGreaterThan(0);
    for (const t of themed) {
      expect(Object.keys(t.value).sort(), t.name).toEqual(["dark", "light"]);
    }
  });
});

describe("tokens.css", () => {
  const defined = new Set([...tokensCss.matchAll(/^\s*(--[a-z0-9-]+):/gim)].map((m) => m[1]));

  it("emits every themed token in both themes", () => {
    const block = (id: string) => {
      const m = tokensCss.match(new RegExp(`\\[data-theme="${id}"\\] \\{([^}]*)\\}`));
      return new Set([...(m?.[1] ?? "").matchAll(/(--[a-z0-9-]+):/g)].map((x) => x[1]));
    };
    expect([...block("light")].sort()).toEqual([...block("dark")].sort());
  });

  it("defines every var(--x…) used in src css", () => {
    const missing: string[] = [];
    for (const file of cssFiles(resolve(src, "styles"))) {
      if (file.endsWith("tokens.css")) continue;
      const css = readFileSync(file, "utf8");
      const local = new Set([...css.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((m) => m[1]));
      for (const m of css.matchAll(/var\(\s*(--x[a-z0-9-]*)/gi)) {
        if (!defined.has(m[1]) && !local.has(m[1])) missing.push(`${file}: ${m[1]}`);
      }
    }
    expect(missing).toEqual([]);
  });
});

describe("appearance tokens", () => {
  it("emits the tinted sidebar ground once per theme", () => {
    expect(tokensCss.match(/--side-tint:/g)).toHaveLength(2);
  });
  it("emits the body fallback stack the font setting ends with", () => {
    expect(tokensCss).toMatch(/--font-body-fallback:\s*system-ui, sans-serif;/);
    expect(tokensCss).toMatch(/--x-font-body-fallback:\s*var\(--font-body-fallback\);/);
  });
});

describe("type tokens", () => {
  const styles: { name: string }[] = tokens.type.groups.flatMap((g: { styles: { name: string }[] }) => g.styles);
  const manifest = JSON.parse(readFileSync(resolve(src, "../generated/ai-manifest.json"), "utf8"));

  it("emits --type-<name> for every type style", () => {
    expect(styles.length).toBeGreaterThan(10);
    for (const s of styles) expect(tokensCss, s.name).toMatch(new RegExp(`--type-${s.name}: [^;]*var\\(--font-(body|mono)\\);`));
  });
  it("defines page-title and stat", () => {
    expect(tokensCss).toContain("--type-page-title: 700 20px/1.3 var(--font-body);");
    expect(tokensCss).toContain("--type-stat: 600 22px/1.2 var(--font-mono);");
  });
  it("points the manifest at the variable", () => {
    for (const s of styles) {
      const t = manifest.tokens.find((x: { name: string }) => x.name === `type-${s.name}`);
      expect(t.css).toBe(`font: var(--type-${s.name})`);
    }
  });
});
