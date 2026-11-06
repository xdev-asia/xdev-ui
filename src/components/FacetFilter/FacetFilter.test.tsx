import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";

const h = vi.hoisted(() => ({ sets: [] as Array<ReturnType<typeof vi.fn>>, state: [] as unknown[] }));
vi.mock("react", async (orig) => {
  const real = await orig<typeof import("react")>();
  return {
    ...real,
    // Lets a test call FacetFilter() as a plain function; renderToStaticMarkup still works.
    useState: (init: unknown) => {
      const set = vi.fn();
      h.sets.push(set);
      const i = h.sets.length - 1;
      return [i < h.state.length ? h.state[i] : typeof init === "function" ? (init as () => unknown)() : init, set];
    },
  };
});
const { FacetFilter } = await import("./FacetFilter");

const options = [
  { value: "active", label: "Active", count: 40 },
  { value: "invited", label: "Invited", count: 9 },
  { value: "suspended", label: "Suspended", count: 8 },
];
const base = { label: "Status", options, selected: [] as string[], onChange: () => {} };
const reset = (state: unknown[] = []) => {
  h.sets.length = 0;
  h.state = state;
};

describe("FacetFilter", () => {
  it("is a chip-style trigger with the facet name and no count while nothing is picked", () => {
    reset();
    const html = renderToStaticMarkup(<FacetFilter {...base} />);
    expect(html).toContain('class="task-chip x-facet-trigger"');
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain(">Status<");
    expect(html).not.toContain("task-chip-count");
    expect(html).not.toContain("data-active");
    expect(html).not.toContain('role="dialog"');
  });
  it("shows the picked count, and says it to screen readers", () => {
    reset();
    const html = renderToStaticMarkup(<FacetFilter {...base} selected={["active", "invited"]} />);
    expect(html).toContain('<span class="task-chip-count" aria-hidden="true">2</span>');
    expect(html).toContain(", 2 selected");
    expect(html).toContain('data-active=""');
  });
  it("open: a labelled panel with one checkbox per option and its count", () => {
    reset();
    const html = renderToStaticMarkup(<FacetFilter {...base} selected={["invited"]} defaultOpen />);
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-label="Status"');
    expect(html.match(/type="checkbox"/g)).toHaveLength(3);
    expect(html.match(/checked=""/g)).toHaveLength(1);
    expect(html).toContain('<span class="x-facet-count">40</span>');
    expect(html).not.toContain('type="search"');
    expect(html).toMatch(/<button[^>]*>Clear<\/button>/);
    expect(html).not.toMatch(/<button[^>]*disabled=""[^>]*>Clear/);
  });
  it("searchable filters the list and shows noResults for no match", () => {
    reset([true, "zzz"]);
    const html = renderToStaticMarkup(<FacetFilter {...base} searchable labels={{ noResults: "Nothing" }} />);
    expect(html).toContain('type="search"');
    expect(html).toContain('aria-label="Search options"');
    expect(html).toContain("Nothing");
    expect(html).not.toContain('type="checkbox"');
    reset([true, "sus"]);
    expect(renderToStaticMarkup(<FacetFilter {...base} searchable />).match(/type="checkbox"/g)).toHaveLength(1);
  });
  it("search turns on by itself past 7 options", () => {
    reset();
    const many = Array.from({ length: 8 }, (_, i) => ({ value: `v${i}`, label: `Option ${i}` }));
    expect(renderToStaticMarkup(<FacetFilter {...base} options={many} defaultOpen />)).toContain('type="search"');
  });
  it("a checkbox calls onChange with the toggled values; Clear empties them", () => {
    reset([true, ""]);
    const onChange = vi.fn();
    const tree = FacetFilter({ ...base, selected: ["suspended"], onChange });
    const boxes = findAll(tree, (e) => e.props.checked !== undefined && typeof e.props.onChange === "function");
    expect(boxes).toHaveLength(3);
    boxes[0].props.onChange();
    expect(onChange).toHaveBeenLastCalledWith(["active", "suspended"]);
    boxes[2].props.onChange();
    expect(onChange).toHaveBeenLastCalledWith([]);
    const clear = findAll(tree, (e) => e.props.variant === "secondary")[0];
    clear.props.onClick();
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
  it("closing resets the search", () => {
    reset([true, "act"]);
    const tree = FacetFilter({ ...base });
    tree.props.onClose();
    expect(h.sets[0]).toHaveBeenCalledWith(false);
    expect(h.sets[1]).toHaveBeenCalledWith("");
  });
});
