import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";

// Hooks keep state across direct calls of the component, by call order.
const h = vi.hoisted(() => ({ slots: [] as unknown[], i: 0 }));
vi.mock("react", async (orig) => {
  const real = await orig<typeof import("react")>();
  const slot = <T,>(init: T): [number, T] => {
    const i = h.i++;
    if (!(i in h.slots)) h.slots[i] = init;
    return [i, h.slots[i] as T];
  };
  return {
    ...real,
    useEffect: () => {},
    useRef: (v: unknown) => slot({ current: v })[1],
    useState: (v: unknown) => {
      const [i, value] = slot(v);
      return [value, (n: unknown) => (h.slots[i] = typeof n === "function" ? (n as (p: unknown) => unknown)(h.slots[i]) : n)];
    },
  };
});
const { SortableList } = await import("./SortableList");

const items = [
  { id: "a", name: "Alpha" },
  { id: "b", name: "Beta" },
  { id: "c", name: "Gamma" },
];
type Item = (typeof items)[number];
const base = {
  items,
  getKey: (it: Item) => it.id,
  getLabel: (it: Item) => it.name,
  label: "Steps",
  renderItem: (it: Item, _i: number, handle: unknown) => (
    <>
      {handle}
      <span>{it.name}</span>
    </>
  ),
};

beforeEach(() => {
  h.slots = [];
  h.i = 0;
});
const render = (props: Partial<Parameters<typeof SortableList<Item>>[0]> = {}): ReactElement => {
  h.i = 0;
  return SortableList<Item>({ ...base, ...props }) as ReactElement;
};
const handles = (el: ReactElement) => findAll(el, (e) => e.props.className === "x-sortable-handle");
const live = (el: ReactElement) => findAll(el, (e) => e.props.role === "status")[0].props.children;
const order = (el: ReactElement) => findAll(el, (e) => e.type === "li").map((e) => String(e.key));
const key = (k: string) => ({ key: k, preventDefault: vi.fn() });

describe("SortableList", () => {
  it("renders a labelled list, a named grip handle per row and a polite live region", () => {
    h.i = 0;
    const html = renderToStaticMarkup(<SortableList {...base} />);
    expect(html).toContain('<ul class="x-sortable" aria-label="Steps">');
    expect(html.match(/<li class="x-sortable-item">/g)).toHaveLength(3);
    expect(html).toContain('aria-label="Drag to reorder: Alpha"');
    expect(html).toContain('<div class="x-sr-only" role="status" aria-live="polite"></div>');
    expect(html).toContain("<span>Gamma</span>");
  });

  it("disables every handle when disabled or with fewer than two items", () => {
    const count = (html: string) => (html.match(/disabled=""/g) ?? []).length;
    h.i = 0;
    expect(count(renderToStaticMarkup(<SortableList {...base} disabled />))).toBe(3);
    h.i = 0;
    expect(count(renderToStaticMarkup(<SortableList {...base} items={[items[0]]} />))).toBe(1);
  });

  it("labels the handle by key when getLabel is missing, and takes overrides", () => {
    h.i = 0;
    const html = renderToStaticMarkup(<SortableList {...base} getLabel={undefined} labels={{ handle: (n) => `Kéo ${n}` }} />);
    expect(html).toContain('aria-label="Kéo a"');
    expect(html).not.toContain("Drag to reorder");
  });

  it("keyboard: Space lifts, arrows move with announcements, Space drops and calls onReorder", () => {
    const onReorder = vi.fn();
    let el = render({ onReorder });
    const space = key(" ");
    handles(el)[0].props.onKeyDown(space);
    expect(space.preventDefault).toHaveBeenCalled();
    el = render({ onReorder });
    expect(live(el)).toBe("Alpha lifted. Use the up and down arrow keys to move it, Space to drop it, Escape to cancel.");
    expect(findAll(el, (e) => e.type === "li")[0].props["data-lifted"]).toBe("");

    handles(el)[0].props.onKeyDown(key("ArrowDown"));
    el = render({ onReorder });
    expect(order(el)).toEqual(["b", "a", "c"]);
    expect(live(el)).toBe("Moved to position 2 of 3.");

    handles(el)[1].props.onKeyDown(key("End"));
    el = render({ onReorder });
    expect(order(el)).toEqual(["b", "c", "a"]);

    handles(el)[2].props.onKeyDown(key("Enter"));
    el = render({ onReorder });
    expect(live(el)).toBe("Dropped at position 3 of 3.");
    expect(onReorder).toHaveBeenCalledWith(0, 2);
  });

  it("keyboard: Escape cancels and puts the row back without calling onReorder", () => {
    const onReorder = vi.fn();
    let el = render({ onReorder });
    handles(el)[1].props.onKeyDown(key(" "));
    el = render({ onReorder });
    handles(el)[1].props.onKeyDown(key("ArrowUp"));
    el = render({ onReorder });
    expect(order(el)).toEqual(["b", "a", "c"]);
    handles(el)[0].props.onKeyDown(key("Escape"));
    el = render({ onReorder });
    expect(order(el)).toEqual(["a", "b", "c"]);
    expect(live(el)).toBe("Reorder cancelled. The item is back in its place.");
    expect(onReorder).not.toHaveBeenCalled();
  });

  it("ignores keys that are not part of the pattern, and all keys when disabled", () => {
    const onReorder = vi.fn();
    let el = render({ onReorder });
    const tab = key("Tab");
    handles(el)[0].props.onKeyDown(tab);
    expect(tab.preventDefault).not.toHaveBeenCalled();
    el = render({ onReorder, disabled: true });
    handles(el)[0].props.onKeyDown(key(" "));
    el = render({ onReorder, disabled: true });
    expect(live(el)).toBe("");
  });

  it("announcement labels are overridable", () => {
    const labels = { lifted: (n: string) => `nhấc ${n}`, moved: (p: number, t: number) => `${p}/${t}`, dropped: (p: number) => `thả ${p}`, cancelled: "huỷ" };
    let el = render({ labels });
    handles(el)[0].props.onKeyDown(key(" "));
    el = render({ labels });
    expect(live(el)).toBe("nhấc Alpha");
    handles(el)[0].props.onKeyDown(key("ArrowDown"));
    el = render({ labels });
    expect(live(el)).toBe("2/3");
    handles(el)[1].props.onKeyDown(key("Escape"));
    el = render({ labels });
    expect(live(el)).toBe("huỷ");
  });

  it("pointer: dragging the handle past a row midpoint drops it there", () => {
    const onReorder = vi.fn();
    const rows = [0, 40, 80].map((top) => ({ getBoundingClientRect: () => ({ top, height: 40 }) }));
    const target = { closest: () => ({ children: rows }), setPointerCapture: vi.fn() };
    let el = render({ onReorder });
    handles(el)[0].props.onPointerDown({ button: 0, pointerId: 1, currentTarget: target, preventDefault() {} });
    el = render({ onReorder });
    expect(findAll(el, (e) => e.type === "li")[0].props["data-dragging"]).toBe("");
    handles(el)[0].props.onPointerMove({ clientY: 110 });
    el = render({ onReorder });
    expect(findAll(el, (e) => e.type === "li")[2].props["data-drop"]).toBe("after");
    handles(el)[0].props.onPointerUp();
    el = render({ onReorder });
    expect(onReorder).toHaveBeenCalledWith(0, 2);
    expect(live(el)).toBe("Dropped at position 3 of 3.");
  });
});
