import { describe, expect, it, vi } from "vitest";
import {
  applyTheme,
  currentTheme,
  onThemeChange,
  readThemeColors,
  resolveTheme,
  systemPrefersDark,
  watchSystemTheme,
  type MediaQueryLike,
} from "./theme";

function fakeMedia(matches: boolean) {
  const listeners = new Set<(e: { matches: boolean }) => void>();
  const mql: MediaQueryLike = {
    matches,
    addEventListener: (_t, l) => void listeners.add(l),
    removeEventListener: (_t, l) => void listeners.delete(l),
  };
  const matchMedia = vi.fn((_q: string) => mql);
  return { matchMedia, listeners, fire: (m: boolean) => listeners.forEach((l) => l({ matches: m })) };
}

function fakeEl(initial: string | null = null) {
  const attrs = new Map<string, string>();
  if (initial !== null) attrs.set("data-theme", initial);
  return {
    attrs,
    setAttribute: (n: string, v: string) => void attrs.set(n, v),
    getAttribute: (n: string) => attrs.get(n) ?? null,
  };
}

describe("resolveTheme", () => {
  it("keeps an explicit choice whatever the system says", () => {
    expect(resolveTheme("dark", false)).toBe("dark");
    expect(resolveTheme("light", true)).toBe("light");
  });
  it("follows the system for system", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });
  it("reads an unknown value as system", () => {
    expect(resolveTheme("sepia" as never, true)).toBe("dark");
    expect(resolveTheme("sepia" as never, false)).toBe("light");
  });
});

describe("applyTheme", () => {
  it("sets data-theme", () => {
    const el = fakeEl();
    applyTheme(el, "light");
    expect(el.attrs.get("data-theme")).toBe("light");
    applyTheme(el, "dark");
    expect(el.attrs.get("data-theme")).toBe("dark");
  });
});

describe("watchSystemTheme", () => {
  it("passes each change to the callback and stops after unsubscribe", () => {
    const m = fakeMedia(true);
    const cb = vi.fn();
    const off = watchSystemTheme(m.matchMedia, cb);
    expect(m.matchMedia).toHaveBeenCalledWith("(prefers-color-scheme: dark)");
    m.fire(false);
    m.fire(true);
    expect(cb.mock.calls).toEqual([[false], [true]]);
    off();
    expect(m.listeners.size).toBe(0);
    m.fire(false);
    expect(cb).toHaveBeenCalledTimes(2);
  });
  it("systemPrefersDark reads the current match", () => {
    expect(systemPrefersDark(fakeMedia(true).matchMedia)).toBe(true);
    expect(systemPrefersDark(fakeMedia(false).matchMedia)).toBe(false);
  });
});

describe("currentTheme", () => {
  it("reads light, and falls back to dark", () => {
    expect(currentTheme(fakeEl("light"))).toBe("light");
    expect(currentTheme(fakeEl("dark"))).toBe("dark");
    expect(currentTheme(fakeEl())).toBe("dark");
  });
});

describe("onThemeChange", () => {
  function fakeObserver() {
    const state = { fire: () => {}, opts: undefined as unknown, target: undefined as unknown, disconnected: false };
    const make = (cb: () => void) => {
      state.fire = cb;
      return {
        observe: (t: unknown, o: unknown) => {
          state.target = t;
          state.opts = o;
        },
        disconnect: () => {
          state.disconnected = true;
        },
      };
    };
    return { state, make };
  }
  it("watches only data-theme and reports the resolved value", () => {
    const el = fakeEl("dark");
    const { state, make } = fakeObserver();
    const cb = vi.fn();
    const off = onThemeChange(el, cb, make);
    expect(state.target).toBe(el);
    expect(state.opts).toEqual({ attributes: true, attributeFilter: ["data-theme"] });
    applyTheme(el, "light");
    state.fire();
    expect(cb).toHaveBeenCalledWith("light");
    off();
    expect(state.disconnected).toBe(true);
  });
});

describe("readThemeColors", () => {
  it("returns trimmed values keyed by name, empty for a missing var", () => {
    const vars: Record<string, string> = { "--a": " value-a ", "--b": "value-b" };
    const out = readThemeColors({} as Element, ["--a", "--b", "--c"], () => ({ getPropertyValue: (n) => vars[n] ?? "" }));
    expect(out).toEqual({ "--a": "value-a", "--b": "value-b", "--c": "" });
  });
});
