import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";

const src = dirname(fileURLToPath(import.meta.url));
const FORBIDDEN = /@tauri-apps|@xdev\/bindings|^@\//;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.(ts|tsx)$/.test(p) ? [p] : [];
  });
}

it("imports nothing from the app side (tauri, bindings, @/ aliases)", () => {
  const bad: string[] = [];
  for (const file of files(src)) {
    if (file.endsWith("boundaries.test.ts")) continue;
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(/(?:from|import)\s*\(?\s*["']([^"']+)["']/g)) {
      if (FORBIDDEN.test(m[1])) bad.push(`${relative(src, file)}: ${m[1]}`);
    }
  }
  expect(bad).toEqual([]);
});
