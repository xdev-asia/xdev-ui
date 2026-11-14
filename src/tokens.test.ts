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

/** Custom properties that components set in an inline style, not in tokens.css. */
const INLINE = /^--x-(grid-cols|grid-min|span)(-|$)/;

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
        if (!defined.has(m[1]) && !local.has(m[1]) && !INLINE.test(m[1])) missing.push(`${file}: ${m[1]}`);
      }
    }
    expect(missing).toEqual([]);
  });
});

describe("appearance tokens", () => {
  it("emits the tinted sidebar ground once per theme, and once per theme for each opt-in ground", () => {
    const grounds = (tokens.color.grounds ?? []).filter((g: { tokens: { name: string }[] }) => g.tokens.some((t) => t.name === "side-tint")).length;
    expect(tokensCss.match(/--side-tint:/g)).toHaveLength(2 + grounds * 2);
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

describe("tailwind.css", () => {
  const tw = readFileSync(resolve(src, "styles/tailwind.css"), "utf8");
  const decls = [...tw.matchAll(/^\s*(--[a-z0-9-]+):\s*([^;]+);/gim)].map((m) => [m[1], m[2]] as const);

  it("maps every x-color token to a Tailwind colour", () => {
    for (const t of tokens.color.tokens as { name: string }[]) {
      if (!t.name.startsWith("x-color-")) continue;
      expect(tw, t.name).toContain(`--color-${t.name.slice("x-color-".length)}: var(--${t.name});`);
    }
  });
  it("has no declaration that points at itself", () => {
    expect(decls.filter(([name, value]) => value.includes(`var(${name})`))).toEqual([]);
  });
  it("only points at tokens that exist", () => {
    const defined = new Set([...tokensCss.matchAll(/^\s*(--[a-z0-9-]+):/gim)].map((m) => m[1]));
    const used = decls.flatMap(([, v]) => [...v.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]));
    expect(used.filter((u) => !defined.has(u))).toEqual([]);
  });
  it("uses the breakpoint tokens, in rem", () => {
    for (const t of tokens.breakpoint.tokens as { name: string; value: string }[]) {
      expect(tw).toContain(`--breakpoint-${t.name.slice("x-bp-".length)}: ${parseFloat(t.value) / 16}rem;`);
    }
  });
});

describe("layout css", () => {
  it("media queries use only the breakpoint tokens (component @container thresholds are free)", () => {
    const rems = new Set((tokens.breakpoint.tokens as { value: string }[]).map((t) => `${parseFloat(t.value) / 16}rem`));
    const pxBelow = new Set((tokens.breakpoint.tokens as { value: string }[]).map((t) => `${parseFloat(t.value) - 0.02}px`));
    const bad: string[] = [];
    for (const file of cssFiles(resolve(src, "styles"))) {
      const css = readFileSync(file, "utf8");
      for (const m of css.matchAll(/@media[^{]*?\((min|max)-width:\s*([0-9.]+(?:rem|px))\)/g)) {
        if (m[1] === "min" ? !rems.has(m[2]) : !pxBelow.has(m[2])) bad.push(`${file}: ${m[0]}`);
      }
    }
    expect(bad).toEqual([]);
  });
  it("z-index comes from the --x-z tokens", () => {
    const bad: string[] = [];
    for (const file of cssFiles(resolve(src, "styles"))) {
      if (file.endsWith("tokens.css")) continue;
      for (const m of readFileSync(file, "utf8").matchAll(/z-index:\s*([^;]+);/g)) {
        if (!/var\(--x-z-/.test(m[1]) && m[1].trim() !== "0" && m[1].trim() !== "auto") bad.push(`${file}: ${m[0]}`);
      }
    }
    expect(bad).toEqual([]);
  });
});
