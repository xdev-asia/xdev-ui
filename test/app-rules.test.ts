import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
// @ts-expect-error plain ESM script without types
import { audit } from "../skills/xdev-ui-review/scripts/audit.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const manifest = resolve(here, "../generated/ai-manifest.json");

type Finding = { file: string; line: number; rule: string; level: "error" | "warn"; message: string };
const show = (f: Finding[]): string => f.map((x) => `${x.file}:${x.line} ${x.rule} ${x.message}`).join("\n");

describe("the rules audit on shipped apps", () => {
  // primary-count counts per file, but an empty state and the page it replaces are different surfaces
  // (Users, UserDetail), so that one warning is allowed; every other finding fails the test.
  it("examples/admin has no errors and no warnings except primary-count", () => {
    const src = resolve(here, "../examples/admin/src");
    const { findings } = audit(src, { manifest, i18n: resolve(src, "i18n") }) as { findings: Finding[] };
    expect(show(findings.filter((x) => x.level === "error" || x.rule !== "primary-count"))).toBe("");
  });
});
