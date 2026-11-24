import { describe, expect, it, vi } from "vitest";

// Effects and refs are captured so the open-focus effect can run outside a renderer.
const h = vi.hoisted(() => ({ effects: [] as Array<() => void | (() => void)>, refs: [] as Array<{ current: any }> }));
vi.mock("react", async (orig) => ({
  ...(await orig<typeof import("react")>()),
  useId: () => ":p:",
  useEffect: (fn: () => void | (() => void)) => void h.effects.push(fn),
  useLayoutEffect: () => {},
  useRef: (v: unknown) => {
    const r = { current: v };
    h.refs.push(r);
    return r;
  },
  useSyncExternalStore: (_s: unknown, _c: unknown, server: () => boolean) => server(),
}));
const { Popover } = await import("./Popover");

/** Renders once and returns the effect that focuses the panel (the one that reads the panel ref). */
function mount(open: boolean) {
  h.effects.length = 0;
  h.refs.length = 0;
  Popover({ open, onClose: () => {}, label: "Notifications", children: null });
  const panel = h.refs.find((r) => r.current === null && r !== h.refs[0]) ?? h.refs[1];
  return { effects: [...h.effects], refs: [...h.refs], panel };
}

describe("Popover focus", () => {
  it("does not take focus when it mounts open, so a page that loads with it open does not scroll to it", () => {
    const focus = vi.fn();
    const { effects, refs } = mount(true);
    for (const r of refs) if (r.current === null) r.current = { focus };
    vi.stubGlobal("document", { activeElement: null, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    try {
      for (const e of effects) e();
      expect(focus).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
