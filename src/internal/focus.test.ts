import { describe, expect, it, vi } from "vitest";
import { focusFirst, focusableIn, inertOutside, restoreFocus, trapTarget } from "./focus";

const el = (name: string) => ({ name, focus: vi.fn() });

describe("trapTarget", () => {
  const [a, b, c] = [el("a"), el("b"), el("c")];
  const items = [a, b, c];
  it("wraps Tab from the last to the first", () => expect(trapTarget(items, c, false)).toBe(a));
  it("wraps Shift+Tab from the first to the last", () => expect(trapTarget(items, a, true)).toBe(c));
  it("leaves middle moves to the browser", () => {
    expect(trapTarget(items, b, false)).toBeNull();
    expect(trapTarget(items, b, true)).toBeNull();
  });
  it("pulls focus in from outside the list", () => {
    expect(trapTarget(items, {}, false)).toBe(a);
    expect(trapTarget(items, {}, true)).toBe(c);
  });
  it("returns null with nothing to focus", () => expect(trapTarget([], null, false)).toBeNull());
  it("handles a single item", () => {
    expect(trapTarget([a], a, false)).toBe(a);
    expect(trapTarget([a], a, true)).toBe(a);
  });
});

describe("focusFirst / focusableIn / restoreFocus", () => {
  it("focuses the first tabbable, else the root", () => {
    const first = el("first");
    const root = { ...el("root"), querySelectorAll: () => [first, el("x")] as unknown as HTMLElement[] };
    focusFirst(root as never);
    expect(first.focus).toHaveBeenCalledOnce();
    expect(root.focus).not.toHaveBeenCalled();
    const empty = { ...el("empty"), querySelectorAll: () => [] as HTMLElement[] };
    focusFirst(empty);
    expect(empty.focus).toHaveBeenCalledOnce();
    expect(focusableIn(null)).toEqual([]);
    focusFirst(null);
  });
  it("restoreFocus tolerates a missing trigger", () => {
    const t = el("t");
    restoreFocus(t);
    expect(t.focus).toHaveBeenCalledOnce();
    restoreFocus(null);
    restoreFocus({});
  });
});

describe("inertOutside", () => {
  const node = (tagName = "DIV") => ({ tagName, inert: false, parentElement: null as never, children: [] as never[] });
  it("inerts siblings at every level and restores them", () => {
    const body = node("BODY");
    const app = node();
    const dialogHost = node();
    const script = node("SCRIPT");
    const already = Object.assign(node(), { inert: true });
    const backdrop = node();
    const innerSibling = node();
    body.children = [app, dialogHost, script, already] as never[];
    app.parentElement = body as never;
    dialogHost.parentElement = body as never;
    script.parentElement = body as never;
    already.parentElement = body as never;
    dialogHost.children = [backdrop, innerSibling] as never[];
    backdrop.parentElement = dialogHost as never;
    innerSibling.parentElement = dialogHost as never;
    const release = inertOutside(backdrop as never);
    expect(app.inert).toBe(true);
    expect(innerSibling.inert).toBe(true);
    expect(script.inert).toBe(false);
    expect(backdrop.inert).toBe(false);
    expect(dialogHost.inert).toBe(false);
    release();
    expect(app.inert).toBe(false);
    expect(innerSibling.inert).toBe(false);
    expect(already.inert).toBe(true);
  });
  it("accepts null", () => inertOutside(null)());
});
