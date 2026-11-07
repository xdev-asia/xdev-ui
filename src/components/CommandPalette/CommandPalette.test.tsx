import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";

const setAt = vi.fn();
let calls = 0;
vi.mock("react", async (orig) => {
  const real = await orig<typeof import("react")>();
  return {
    ...real,
    useId: () => "p",
    // CommandPalette calls useState four times per render: query, filter, active index, scope.
    useState: (v: unknown) => {
      const n = calls++ % 4;
      return n === 2 ? [(globalThis as { __at?: number }).__at ?? v, setAt] : [v, vi.fn()];
    },
  };
});
const { CommandPalette } = await import("./CommandPalette");

beforeEach(() => {
  calls = 0;
  setAt.mockClear();
});

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
  describe("host API", () => {
    const rows = [
      { title: "alpha", id: "a", hint: "Ctrl+A" },
      { title: "beta", id: "b", disabled: true },
      { title: "gamma", id: "c" },
    ];
    const two = [{ title: "One", rows: rows.slice(0, 1) }, { title: "Two", rows: rows.slice(1) }];
    const input = (el: ReturnType<typeof CommandPalette>) => findAll(el, (e) => e.type === "input")[0];
    const key = (k: string) => ({ key: k, preventDefault: vi.fn() });

    it("renders nothing when open is false and a backdrop when open is true", () => {
      expect(renderToStaticMarkup(<CommandPalette sections={two} open={false} />)).toBe("");
      const html = renderToStaticMarkup(<CommandPalette sections={two} open />);
      expect(html).toContain("pal-backdrop");
      expect(html).toContain(`aria-modal="true"`);
      expect(renderToStaticMarkup(<CommandPalette sections={two} />)).not.toContain("pal-backdrop");
    });
    it("calls onClose on Escape and on a backdrop click only", () => {
      const onClose = vi.fn();
      const el = CommandPalette({ sections: two, open: true, onClose })!;
      const [backdrop] = findAll(el, (e) => e.props.className === "pal-backdrop");
      backdrop.props.onMouseDown({ target: 1, currentTarget: 2 });
      expect(onClose).not.toHaveBeenCalled();
      backdrop.props.onMouseDown({ target: 1, currentTarget: 1 });
      expect(onClose).toHaveBeenCalledTimes(1);
      const [dialog] = findAll(el, (e) => e.props.role === "dialog");
      dialog.props.onKeyDown(key("a"));
      expect(onClose).toHaveBeenCalledTimes(1);
      dialog.props.onKeyDown(key("Escape"));
      expect(onClose).toHaveBeenCalledTimes(2);
    });
    it("selects the active row on Enter and on click, never a disabled row", () => {
      const onSelect = vi.fn();
      const el = CommandPalette({ sections: two, onSelect })!;
      const ev = key("Enter");
      input(el).props.onKeyDown(ev);
      expect(ev.preventDefault).toHaveBeenCalled();
      expect(onSelect).toHaveBeenLastCalledWith(rows[0]);
      const opts = findAll(el, (e) => e.props.role === "option");
      opts[2].props.onClick();
      expect(onSelect).toHaveBeenLastCalledWith(rows[2]);
      onSelect.mockClear();
      opts[1].props.onClick();
      expect(onSelect).not.toHaveBeenCalled();
    });
    it("leaves Enter alone without onSelect", () => {
      const ev = key("Enter");
      input(CommandPalette({ sections: two })!).props.onKeyDown(ev);
      expect(ev.preventDefault).not.toHaveBeenCalled();
    });
    it("moves across sections, skips disabled rows and wraps", () => {
      const el = CommandPalette({ sections: two })!;
      input(el).props.onKeyDown(key("ArrowDown"));
      expect(setAt).toHaveBeenLastCalledWith(2);
      input(el).props.onKeyDown(key("ArrowUp"));
      expect(setAt).toHaveBeenLastCalledWith(2);
      input(el).props.onKeyDown(key("End"));
      expect(setAt).toHaveBeenLastCalledWith(2);
    });
    it("marks disabled options, ids and hints", () => {
      const html = renderToStaticMarkup(<CommandPalette sections={two} />);
      expect(html).toContain(`aria-disabled="true"`);
      expect(html).toContain(`data-row-id="a"`);
      expect(html).toContain("Ctrl+A");
      expect(html).toContain("pal-hint");
    });
    it("keeps focus on the input when a row is pressed", () => {
      const el = CommandPalette({ sections: two })!;
      const ev = { preventDefault: vi.fn() };
      findAll(el, (e) => e.props.role === "option")[0].props.onMouseDown(ev);
      expect(ev.preventDefault).toHaveBeenCalled();
    });
    it("is controlled by query and reports changes", () => {
      const onQueryChange = vi.fn();
      const html = renderToStaticMarkup(<CommandPalette sections={two} query="gam" defaultQuery="zzz" />);
      expect(html).toContain(`value="gam"`);
      expect(html).not.toContain("pal-empty");
      const el = CommandPalette({ sections: two, query: "gam", onQueryChange })!;
      input(el).props.onChange({ target: { value: "gamm" } });
      expect(onQueryChange).toHaveBeenCalledWith("gamm");
    });
    it("renders scopes as a Segmented group and reports changes", () => {
      const scopes = [{ value: "all", label: "All" }, { value: "files", label: "Files" }];
      const html = renderToStaticMarkup(<CommandPalette sections={two} scopes={scopes} scope="files" />);
      expect(html).toContain("pal-scopes");
      expect(html).toContain(`aria-label="Scope"`);
      expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
      expect(html).toMatch(/aria-pressed="true"[^>]*>Files/);
      const onScopeChange = vi.fn();
      const el = CommandPalette({ sections: two, scopes, onScopeChange })!;
      findAll(el, (e) => typeof e.props.onChange === "function" && "options" in e.props)[0].props.onChange("files");
      expect(onScopeChange).toHaveBeenCalledWith("files");
      expect(renderToStaticMarkup(<CommandPalette sections={two} />)).not.toContain("pal-scopes");
    });
    it("filter: true keeps the substring filter, false shows every row in order, a function replaces the test", () => {
      const q = (props: object) => renderToStaticMarkup(<CommandPalette sections={two} query="gam" {...props} />);
      expect(q({})).not.toContain("alpha");
      expect(q({ filter: true })).not.toContain("alpha");
      const all = q({ filter: false });
      const at = (id: string) => all.indexOf(`data-row-id="${id}"`);
      expect(at("a")).toBeGreaterThan(-1);
      expect(at("a")).toBeLessThan(at("b"));
      expect(at("b")).toBeLessThan(at("c"));
      const fn = vi.fn((r: { title: string }, query: string) => r.title.startsWith("b") && query === "gam");
      const html = q({ filter: fn });
      expect(html).toContain("beta");
      expect(html).not.toContain("alpha");
      expect(html).not.toContain('data-row-id="c"');
      expect(fn).toHaveBeenCalledWith(expect.objectContaining({ title: "beta" }), "gam");
    });
    it("filter: false with no rows left still shows the empty state", () => {
      expect(renderToStaticMarkup(<CommandPalette sections={[]} filter={false} />)).toContain("pal-empty");
    });
    it("shows emptyText and footer when given", () => {
      const html = renderToStaticMarkup(<CommandPalette sections={two} defaultQuery="zzz" emptyText="Nothing here" footer={<b>Tip</b>} />);
      expect(html).toContain("Nothing here");
      expect(html).not.toContain("No matches");
      expect(html).toContain("pal-foot-extra");
      expect(renderToStaticMarkup(<CommandPalette sections={two} />)).not.toContain("pal-foot-extra");
    });
  });
});
