import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";

const effects: Array<() => void | (() => void)> = [];
vi.mock("react", async (orig) => ({
  ...(await orig<typeof import("react")>()),
  useRef: (v: unknown) => ({ current: v }),
  useEffect: (fn: () => void | (() => void)) => void effects.push(fn),
}));
const { PanZoom } = await import("./PanZoom");

const base = { zoom: 2, x: 10, y: -5, label: "Image" };
const el = { getBoundingClientRect: () => ({ left: 0, top: 0, width: 200, height: 100 }), setPointerCapture() {}, releasePointerCapture() {} };
const props = (over: Record<string, unknown>) =>
  findAll(PanZoom({ ...base, onZoom() {}, onPan() {}, ...over } as never), (e) => e.type === "div" && e.props.role === "group")[0].props;

/** Renders, attaches a fake node to the viewport ref and runs the effect, like a mount. */
function mount(over: Record<string, unknown>) {
  effects.length = 0;
  const p = props(over);
  const listeners: Array<{ type: string; fn: (e: unknown) => void; opts: unknown }> = [];
  const removed: Array<{ type: string; fn: unknown }> = [];
  p.ref.current = {
    ...el,
    addEventListener: (type: string, fn: (e: unknown) => void, opts: unknown) => listeners.push({ type, fn, opts }),
    removeEventListener: (type: string, fn: unknown) => removed.push({ type, fn }),
  };
  const cleanups = effects.map((f) => f());
  return { p, listeners, removed, unmount: () => cleanups.forEach((c) => typeof c === "function" && c()) };
}

describe("PanZoom", () => {
  it("is a focusable named group that transforms its content", () => {
    const html = renderToStaticMarkup(
      <PanZoom {...base} onZoom={() => {}} onPan={() => {}}>
        <img alt="" />
      </PanZoom>,
    );
    expect(html).toContain('aria-label="Image"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain("translate(10px, -5px) scale(2)");
    expect(html).toContain("<img");
  });

  it("zooms with + - and resets with 0, but ignores keys with Ctrl", () => {
    const onZoom = vi.fn();
    const p = props({ onZoom, zoom: 1, x: 0, y: 0 });
    const key = (k: string, extra = {}) => p.onKeyDown({ key: k, currentTarget: el, preventDefault() {}, ...extra });
    key("+");
    expect(onZoom.mock.calls[0][0].zoom).toBe(1.25);
    key("-");
    expect(onZoom.mock.calls[1][0].zoom).toBe(0.8);
    key("0");
    expect(onZoom.mock.calls[2][0]).toEqual({ zoom: 1, x: 0, y: 0 });
    key("+", { ctrlKey: true });
    key("a");
    expect(onZoom).toHaveBeenCalledTimes(3);
  });

  it("calls onReset instead of the default reset when given", () => {
    const onZoom = vi.fn();
    const onReset = vi.fn();
    const p = props({ onZoom, onReset, zoom: 3, x: 5, y: 5 });
    const preventDefault = vi.fn();
    p.onKeyDown({ key: "0", currentTarget: el, preventDefault });
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(onZoom).not.toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalled();
  });

  it("registers a non-passive wheel listener and removes it on unmount", () => {
    const m = mount({ zoom: 1, x: 0, y: 0 });
    expect(m.p.onWheel).toBeUndefined();
    expect(m.listeners).toHaveLength(1);
    expect(m.listeners[0].type).toBe("wheel");
    expect(m.listeners[0].opts).toEqual({ passive: false });
    expect(m.removed).toHaveLength(0);
    m.unmount();
    expect(m.removed).toEqual([{ type: "wheel", fn: m.listeners[0].fn }]);
  });

  it("zooms with Ctrl or Cmd plus the wheel, honours preventDefault, and lets a plain wheel scroll", () => {
    const onZoom = vi.fn();
    const m = mount({ onZoom, zoom: 1, x: 0, y: 0 });
    const wheel = m.listeners[0].fn;
    const preventDefault = vi.fn();
    wheel({ deltaY: 100, clientX: 0, clientY: 0, preventDefault });
    expect(onZoom).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
    wheel({ ctrlKey: true, deltaY: -100, clientX: 50, clientY: 50, preventDefault });
    wheel({ metaKey: true, deltaY: -100, clientX: 50, clientY: 50, preventDefault });
    expect(onZoom).toHaveBeenCalledTimes(2);
    expect(onZoom.mock.calls[0][0].zoom).toBeGreaterThan(1);
    expect(preventDefault).toHaveBeenCalledTimes(2);
  });

  it("clamps wheel and key zoom to min and max, default 0.25 to 8", () => {
    const onZoom = vi.fn();
    const wheel = (p: ReturnType<typeof mount>, deltaY: number) =>
      p.listeners[0].fn({ ctrlKey: true, deltaY, clientX: 0, clientY: 0, preventDefault() {} });
    const fit = mount({ onZoom, zoom: 1, x: 0, y: 0, min: 0.1, max: 4 });
    for (let i = 0; i < 10; i++) wheel(fit, 100);
    wheel(fit, -100);
    expect(onZoom.mock.calls[0][0].zoom).toBeGreaterThan(0.1);
    const atMin = mount({ onZoom, zoom: 0.1, x: 0, y: 0, min: 0.1, max: 4 });
    wheel(atMin, 100);
    expect(onZoom.mock.lastCall![0].zoom).toBe(0.1);
    const atMax = props({ onZoom, zoom: 4, x: 0, y: 0, min: 0.1, max: 4 });
    atMax.onKeyDown({ key: "+", currentTarget: el, preventDefault() {} });
    expect(onZoom.mock.lastCall![0].zoom).toBe(4);
    const def = mount({ onZoom, zoom: 0.25, x: 0, y: 0 });
    wheel(def, 100);
    expect(onZoom.mock.lastCall![0].zoom).toBe(0.25);
  });

  it("pans while the primary button is dragged", () => {
    const onPan = vi.fn();
    const p = props({ onPan, x: 10, y: 20 });
    p.onPointerMove({ clientX: 99, clientY: 99 });
    expect(onPan).not.toHaveBeenCalled();
    p.onPointerDown({ button: 0, clientX: 100, clientY: 100, pointerId: 1, currentTarget: el });
    p.onPointerMove({ clientX: 130, clientY: 90 });
    expect(onPan).toHaveBeenCalledWith(40, 10);
    p.onPointerUp({ pointerId: 1, currentTarget: el });
    p.onPointerMove({ clientX: 200, clientY: 200 });
    expect(onPan).toHaveBeenCalledTimes(1);
  });
});
