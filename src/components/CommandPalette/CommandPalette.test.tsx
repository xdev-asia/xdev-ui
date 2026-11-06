import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";

const setAt = vi.fn();
vi.mock("react", async (orig) => {
  const real = await orig<typeof import("react")>();
  let calls = 0;
  return {
    ...real,
    useId: () => "p",
    // CommandPalette calls useState three times per render: query, filter, active index.
    useState: (v: unknown) => {
      const n = calls++ % 3;
      return n === 2 ? [(globalThis as { __at?: number }).__at ?? v, setAt] : [v, vi.fn()];
    },
  };
});
const { CommandPalette } = await import("./CommandPalette");

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
  it("is a combobox with a name, listbox id and active descendant", () => {
    const html = renderToStaticMarkup(<CommandPalette title="Jump" sections={sections} />);
    expect(html).toContain('role="combobox"');
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('aria-controls="p-list"');
    expect(html).toContain('id="p-list"');
    expect(html).toContain('aria-activedescendant="p-opt-0"');
    expect(html).toContain('id="p-opt-0"');
    expect(html).toContain('aria-labelledby="p-title"');
    expect(html).toContain('id="p-title"');
  });
  it("names the input by label when there is no title, never by the placeholder", () => {
    const html = renderToStaticMarkup(<CommandPalette sections={sections} placeholder="Find things" labels={{ search: "Find" }} />);
    expect(html).toContain('aria-label="Find"');
    expect(html).not.toContain('aria-label="Find things"');
    expect(html).not.toContain("aria-labelledby");
  });
  it("collapses and drops the active descendant when nothing matches", () => {
    const html = renderToStaticMarkup(<CommandPalette sections={sections} defaultQuery="zzz" />);
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain("aria-activedescendant");
  });
  it("ArrowUp/ArrowDown/Home/End move the active option without moving the caret", () => {
    const input = findAll(CommandPalette({ sections }), (e) => e.type === "input")[0];
    for (const [key, want] of [["ArrowDown", 1], ["ArrowUp", 1], ["Home", 0], ["End", 1]] as const) {
      const ev = { key, preventDefault: vi.fn() };
      input.props.onKeyDown(ev);
      expect(ev.preventDefault).toHaveBeenCalled();
      expect(setAt).toHaveBeenLastCalledWith(want);
    }
    const other = { key: "a", preventDefault: vi.fn() };
    input.props.onKeyDown(other);
    expect(other.preventDefault).not.toHaveBeenCalled();
  });
});
