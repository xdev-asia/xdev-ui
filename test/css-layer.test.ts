import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { wrapInLayer } from "../scripts/css-layer.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as { exports: Record<string, unknown> };

describe("styles.layered.css", () => {
  it("wraps the stylesheet in @layer xdev and keeps @charset and @import on top", () => {
    const out = wrapInLayer('@charset "UTF-8";\n@import url("x.css");\n.btn { color: red; }\n');
    expect(out).toBe('@charset "UTF-8";\n@import url("x.css");\n@layer xdev {\n.btn { color: red; }\n}\n');
  });
  it("wraps a plain stylesheet", () => {
    expect(wrapInLayer(".a{}")).toBe("@layer xdev {\n.a{}\n}\n");
  });
  it("is exported by package.json and has a source entry", () => {
    expect(pkg.exports["./styles.layered.css"]).toEqual({ "xdev-source": "./src/styles/layered.css", default: "./dist/styles.layered.css" });
    expect(readFileSync(join(root, "src/styles/layered.css"), "utf8")).toContain('@import "./index.css" layer(xdev);');
  });
  it("postbuild writes and checks dist/styles.layered.css", () => {
    const post = readFileSync(join(root, "scripts/postbuild.mjs"), "utf8");
    expect(post).toContain("styles.layered.css");
    expect(post).toContain("wrapInLayer");
  });
  it("the table wrap is a positioning context", () => {
    expect(readFileSync(join(root, "src/styles/data.css"), "utf8")).toMatch(/\.x-table-wrap \{[^}]*position: relative/);
  });
});
