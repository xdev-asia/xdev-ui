import { afterEach, describe, expect, it, vi } from "vitest";
import { rovingFocus, rovingKeyDown, rovingRef } from "./roving";

const item = (name: string) => ({ name, tabIndex: 0, focus: vi.fn() });
const ring = (items: ReturnType<typeof item>[]) => ({ querySelectorAll: () => items });

describe("roving tabindex", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("makes the first item the only Tab stop on mount", () => {
    const items = [item("a"), item("b"), item("c")];
    rovingRef(ring(items));
    expect(items.map((i) => i.tabIndex)).toEqual([0, -1, -1]);
  });
  it("moves the Tab stop to the focused item and remembers it across re-mounts of the ref", () => {
    const items = [item("a"), item("b"), item("c")];
    const el = ring(items);
    rovingFocus({ target: items[2], currentTarget: el });
    expect(items.map((i) => i.tabIndex)).toEqual([-1, -1, 0]);
    rovingRef(el);
    expect(items.map((i) => i.tabIndex)).toEqual([-1, -1, 0]);
  });
  it("ignores focus on something that is not an item", () => {
    const items = [item("a"), item("b")];
    rovingRef(ring(items));
    rovingFocus({ target: { other: true }, currentTarget: ring(items) });
    expect(items.map((i) => i.tabIndex)).toEqual([0, -1]);
  });
  it("tolerates a null ref", () => {
    expect(() => rovingRef(null)).not.toThrow();
  });
  it("arrows, Home and End move focus and wrap", () => {
    const items = [item("a"), item("b"), item("c")];
    const el = ring(items);
    const press = (key: string, at: number) => {
      vi.stubGlobal("document", { activeElement: items[at] });
      const preventDefault = vi.fn();
      rovingKeyDown({ key, preventDefault, currentTarget: el });
      return preventDefault;
    };
    expect(press("ArrowRight", 2)).toHaveBeenCalled();
    expect(items[0].focus).toHaveBeenCalledOnce();
    press("ArrowLeft", 0);
    expect(items[2].focus).toHaveBeenCalledOnce();
    press("End", 0);
    expect(items[2].focus).toHaveBeenCalledTimes(2);
    press("Home", 2);
    expect(items[0].focus).toHaveBeenCalledTimes(2);
    expect(press("x", 1)).not.toHaveBeenCalled();
  });
});
