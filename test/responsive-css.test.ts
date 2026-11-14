import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(root, "src/styles/responsive.css"), "utf8");
const tokens = JSON.parse(readFileSync(join(root, "tokens/tokens.json"), "utf8")) as {
  breakpoint: { tokens: { name: string; value: string }[] };
};
const bp = (name: string): number => parseFloat(tokens.breakpoint.tokens.find((t) => t.name === name)!.value);

describe("responsive.css", () => {
  it("is imported last by index.css", () => {
    const index = readFileSync(join(root, "src/styles/index.css"), "utf8").trim().split("\n");
    expect(index[index.length - 1]).toBe('@import "./responsive.css";');
  });
  it("media queries sit just below the sm and md breakpoint tokens", () => {
    const queries = [...css.matchAll(/@media \(max-width: ([\d.]+)px\)/g)].map((m) => Number(m[1]));
    expect(queries.sort()).toEqual([bp("x-bp-sm") - 0.02, bp("x-bp-md") - 0.02].sort());
    const mins = [...css.matchAll(/@media \(min-width: ([\d.]+)rem\)/g)].map((m) => Number(m[1]) * 16);
    expect(mins).toEqual([bp("x-bp-sm")]);
  });
  it("gives touch pointers a 44px hit area", () => {
    const touch = css.slice(css.indexOf("@media (pointer: coarse)"));
    expect(touch).toMatch(/\.ws-icon-btn[^{]*\{\s*min-width: 44px;\s*min-height: 44px;/);
    expect(touch).toMatch(/\.btn,[^{]*\{\s*min-height: 44px;/);
  });
  it("turns the modal dialog into a full-width sheet and the drawer full width below sm", () => {
    const phone = css.slice(css.indexOf("@media (max-width: 639.98px)"));
    expect(phone).toMatch(/\.dialog-backdrop\[data-modal\] \{ place-items: end stretch;/);
    expect(phone).toMatch(/\.x-drawer, \.x-drawer\[data-size="wide"\] \{ width: 100%;/);
  });
  it("breaks long mono text and keeps toolbars wrapping", () => {
    expect(css).toContain(".ws-mono { overflow-wrap: anywhere; }");
    expect(css).toMatch(/\.pane-head \{ flex-wrap: wrap;/);
    expect(css).toMatch(/\.x-savebar \{ flex-wrap: wrap;/);
  });
  it("DataTable stack mode is a container query on [data-stack]", () => {
    expect(css).toMatch(/@container \(max-width: 480px\) \{\s*\.x-table-wrap\[data-stack\]/);
    expect(css).toContain("content: attr(data-label)");
  });
});
