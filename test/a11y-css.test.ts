import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f: string): string => readFileSync(join(root, "src/styles", f), "utf8");
const all = ["base.css", "inputs.css", "navigation.css", "data.css", "display.css", "status.css", "layout.css", "responsive.css"].map(read).join("\n");
const responsive = read("responsive.css");
/** The body of the first `@media` block whose query contains `query`. */
function media(css: string, query: string): string {
  const start = css.indexOf(query);
  expect(start, query).toBeGreaterThan(-1);
  let depth = 0;
  for (let i = css.indexOf("{", start); i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return css.slice(start, i);
  }
  return css.slice(start);
}

describe("accessibility CSS", () => {
  it("gives the Switch, the CodeBlock copy button and DataTable sort buttons a 24px hit area without resizing them", () => {
    const rule = /:where\(([^)]*)\)::before \{([^}]*)\}/.exec(all.slice(all.indexOf("SC 2.5.8")));
    expect(rule).not.toBeNull();
    const [, selectors, body] = rule!;
    for (const s of [".agent-switch", ".connect-copy", ".x-table-sort"]) expect(selectors).toContain(s);
    expect(body).toContain("width: max(100%, var(--x-space-6))");
    expect(body).toContain("height: max(100%, var(--x-space-6))");
  });
  it("wraps a long AppShell title to two lines below md instead of an ellipsis", () => {
    const md = media(responsive, "@media (max-width: 767.98px)");
    expect(md).toMatch(/\.x-shell-title-text \{[^}]*white-space: normal;[^}]*-webkit-line-clamp: 2;/);
    expect(md).toMatch(/\.x-shell\[data-titled\] \.x-shell-top \{[^}]*height: auto;/);
  });
  it("AppShell main is the containing block of what it scrolls, so an absolute child cannot stretch the page", () => {
    // A visually hidden input (.x-sr-only, absolute) inside main once pushed the document 371px past the viewport.
    expect(read("layout.css")).toMatch(/\.x-shell-main \{[^}]*overflow: auto;[^}]*position: relative;|\.x-shell-main \{[^}]*position: relative;[^}]*overflow: auto;/);
  });
  it("wraps Card subtitles below md", () => {
    expect(media(responsive, "@media (max-width: 767.98px)")).toMatch(/\.x-card-sub \{[^}]*white-space: normal;/);
  });
  it("fades the edge of a scrolling Segmented or Tabs row that hides more", () => {
    for (const v of ["start", "end", "both"]) expect(all).toMatch(new RegExp(String.raw`\.segmented\[data-scroll-fade="${v}"\][^{]*\.kit-tabs\[data-scroll-fade="${v}"\]|\.kit-tabs\[data-scroll-fade="${v}"\][^{]*\.segmented\[data-scroll-fade="${v}"\]`));
    expect(all).toMatch(/:dir\(rtl\)/);
  });
  it("lets clicks pass through the always-mounted toast regions", () => {
    expect(all).toMatch(/\.x-shell-toasts, \.x-toaster \{[^}]*pointer-events: none;/);
    expect(all).toMatch(/\.x-toast-live > \* \{[^}]*pointer-events: auto;/);
  });
});
