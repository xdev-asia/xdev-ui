import { afterEach, describe, expect, it, vi } from "vitest";
import { scrollFade, scrollFadeRef } from "./scroll-fade";

const box = { scrollLeft: 0, scrollWidth: 300, clientWidth: 100, overflowX: "auto" };

describe("scrollFade", () => {
  it("names the sides that hide more content", () => {
    expect(scrollFade(box)).toBe("end");
    expect(scrollFade({ ...box, scrollLeft: 100 })).toBe("both");
    expect(scrollFade({ ...box, scrollLeft: 200 })).toBe("start");
  });
  it("reads right-to-left rows, where scrollLeft runs negative", () => {
    expect(scrollFade({ ...box, scrollLeft: -200 })).toBe("start");
    expect(scrollFade({ ...box, scrollLeft: -100 })).toBe("both");
  });
  it("is undefined when the row fits or does not scroll", () => {
    expect(scrollFade({ ...box, scrollWidth: 100 })).toBeUndefined();
    expect(scrollFade({ ...box, scrollWidth: 101 })).toBeUndefined();
    expect(scrollFade({ ...box, overflowX: "visible" })).toBeUndefined();
  });
});

describe("scrollFadeRef", () => {
  afterEach(() => vi.unstubAllGlobals());
  function fakeRow() {
    const listeners = new Map<string, () => void>();
    const el = {
      ...box,
      children: [{}, {}],
      dataset: {} as Record<string, string | undefined>,
      addEventListener: vi.fn((t: string, fn: () => void) => listeners.set(t, fn)),
      removeEventListener: vi.fn((t: string) => listeners.delete(t)),
    };
    return { el, listeners };
  }
  it("sets data-scroll-fade now, on scroll and on resize, and cleans up", () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    let resized = (): void => {};
    vi.stubGlobal("getComputedStyle", () => ({ overflowX: "auto" }));
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(cb: () => void) {
          resized = cb;
        }
        observe = observe;
        disconnect = disconnect;
      },
    );
    const { el, listeners } = fakeRow();
    const cleanup = scrollFadeRef(el as unknown as HTMLElement);
    expect(el.dataset.scrollFade).toBe("end");
    el.scrollLeft = 200;
    listeners.get("scroll")?.();
    expect(el.dataset.scrollFade).toBe("start");
    el.scrollWidth = 100;
    resized();
    expect(el.dataset.scrollFade).toBeUndefined();
    expect(observe).toHaveBeenCalledTimes(3);
    cleanup?.();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(listeners.has("scroll")).toBe(false);
  });
  it("ignores null and works without ResizeObserver", () => {
    expect(scrollFadeRef(null)).toBeUndefined();
    vi.stubGlobal("getComputedStyle", () => ({ overflowX: "auto" }));
    vi.stubGlobal("ResizeObserver", undefined);
    const resize = new Map<string, () => void>();
    vi.stubGlobal("window", { addEventListener: (t: string, fn: () => void) => resize.set(t, fn), removeEventListener: (t: string) => resize.delete(t) });
    const { el } = fakeRow();
    const cleanup = scrollFadeRef(el as unknown as HTMLElement);
    el.scrollLeft = 100;
    resize.get("resize")?.();
    expect(el.dataset.scrollFade).toBe("both");
    cleanup?.();
    expect(resize.has("resize")).toBe(false);
  });
});
