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
