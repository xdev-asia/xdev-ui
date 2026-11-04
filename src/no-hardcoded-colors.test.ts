import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";

const src = dirname(fileURLToPath(import.meta.url));

/** Files allowed to hold colour literals, with the reason. Paths are relative to src, forward slashes. */
const EXEMPT: Record<string, string> = {
  "styles/tokens.css": "generated token values are the single source of colour literals",
  "components/BrandMark/BrandMark.tsx": "fixed brand artwork (tile fill and glyph); the brand mark must not follow the theme or be recoloured",
};

const COLOR = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|hwb)\(/gi;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.(ts|tsx|css)$/.test(p) ? [p] : [];
  });
}

it("has no hex/rgb/hsl colour literals outside the exempt files", () => {
  const bad: string[] = [];
  for (const file of files(src)) {
    const rel = relative(src, file).replaceAll("\\", "/");
    if (rel in EXEMPT || rel === "no-hardcoded-colors.test.ts") continue;
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      // `#` followed by hex digits also matches CSS id selectors and markdown headings; require a colour-like context.
      for (const m of line.matchAll(COLOR)) {
        const before = line.slice(0, m.index);
        if (m[0].startsWith("#") && /[\w-]$/.test(before)) continue; // anchor or id (e.g. "href#abc")
        bad.push(`${rel}:${i + 1}: ${m[0]}`);
      }
    });
  }
  expect(bad).toEqual([]);
});
