import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CommandPalette } from "./CommandPalette";

const sections = [
  {
    title: "Sessions",
    rows: [{ title: "fix-auth", state: "done" as const }, { title: "docs", icon: "docs" as const }],
  },
];

describe("CommandPalette", () => {
  it("renders dialog, listbox and a selected first option", () => {
    const html = renderToStaticMarkup(<CommandPalette title="Jump" sections={sections} />);
    expect(html).toContain('role="dialog"');
    expect(html).toContain('role="listbox"');
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain("pal-input");
  });
  it("highlights the query and shows the empty state", () => {
    expect(renderToStaticMarkup(<CommandPalette sections={sections} defaultQuery="auth" />)).toContain("pal-hit");
    expect(renderToStaticMarkup(<CommandPalette sections={sections} defaultQuery="zzz" />)).toContain("pal-empty");
  });
  it("renders filter chips with aria-pressed", () => {
    expect(renderToStaticMarkup(<CommandPalette sections={sections} filters={["All", "Files"]} />)).toContain('aria-pressed="true"');
  });
});
