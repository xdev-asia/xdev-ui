import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";

const h = vi.hoisted(() => ({ effects: [] as Array<() => void | (() => void)>, refs: [] as Array<{ current: any }> }));
vi.mock("react", async (orig) => ({
  ...(await orig<typeof import("react")>()),
  useId: () => "id",
  useEffect: (fn: () => void | (() => void)) => void h.effects.push(fn),
  useRef: (v: unknown) => {
    const r = { current: v };
    h.refs.push(r);
    return r;
  },
}));
const { AppShell } = await import("./AppShell");

const base = { nav: <nav aria-label="Main">nav</nav>, children: <p>Content</p> };

describe("AppShell", () => {
  it("has a skip link first, a header and a main target", () => {
    const html = renderToStaticMarkup(<AppShell {...base} brand="Acme" crumbs="Crumbs" actions="Acts" navFooter="Foot" />);
    expect(html.indexOf("x-skip-link")).toBeLessThan(html.indexOf("x-shell-side"));
    expect(html).toContain('<a class="x-skip-link" href="#main">Skip to content</a>');
    expect(html).toContain("<header");
    expect(html).toMatch(/<main[^>]*id="main"/);
    expect(html).toContain("Acme");
    expect(html).toContain("Foot");
  });
  it("uses mainId for the skip target", () => {
    const html = renderToStaticMarkup(<AppShell {...base} mainId="page" />);
    expect(html).toContain('href="#page"');
    expect(html).toMatch(/<main[^>]*id="page"/);
  });
  it("menu button reflects the drawer state", () => {
    const closed = renderToStaticMarkup(<AppShell {...base} navOpen={false} />);
    expect(closed).toContain('aria-label="Open navigation"');
    expect(closed).toContain('aria-expanded="false"');
    expect(closed).not.toContain("x-shell-backdrop");
    const open = renderToStaticMarkup(<AppShell {...base} navOpen />);
    expect(open).toContain('aria-label="Close navigation"');
    expect(open).toContain('data-nav-open="true"');
    expect(open).toContain('class="x-shell-backdrop"');
  });
  it("toggles through onNavOpenChange; the backdrop closes", () => {
    const onNavOpenChange = vi.fn();
    const tree = AppShell({ ...base, navOpen: true, onNavOpenChange });
    findAll(tree, (e) => e.props.className === "x-shell-menu")[0].props.onClick();
    expect(onNavOpenChange).toHaveBeenLastCalledWith(false);
    findAll(tree, (e) => e.props.className === "x-shell-backdrop")[0].props.onClick();
    expect(onNavOpenChange).toHaveBeenCalledTimes(2);
  });
  it("renders toasts in the fixed region", () => {
    const html = renderToStaticMarkup(<AppShell {...base} toasts={<span>Saved</span>} />);
    expect(html).toContain('class="x-shell-toasts ws-toasts"');
    expect(html).toContain("Saved");
    expect(renderToStaticMarkup(<AppShell {...base} />)).not.toContain("x-shell-toasts");
  });
  it("skip link focuses main without changing location.hash", () => {
    const tree = AppShell({ ...base, mainId: "page" });
    const link = findAll(tree, (e) => e.props.className === "x-skip-link")[0];
    const main = { focus: vi.fn() };
    const getElementById = vi.fn(() => main);
    vi.stubGlobal("document", { getElementById });
    const preventDefault = vi.fn();
    try {
      link.props.onClick({ preventDefault });
    } finally {
      vi.unstubAllGlobals();
    }
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(getElementById).toHaveBeenCalledWith("page");
    expect(main.focus).toHaveBeenCalledOnce();
  });
  it("links the menu button to the drawer", () => {
    const html = renderToStaticMarkup(<AppShell {...base} navOpen />);
    const id = /<aside[^>]*id="([^"]+)"/.exec(html)?.[1];
    expect(id).toBeTruthy();
    expect(html).toContain(`aria-controls="${id}"`);
  });

  describe("drawer focus", () => {
    const listeners = new Map<string, (e: any) => void>();
    const first = { focus: vi.fn() };
    const last = { focus: vi.fn() };
    const open = (onNavOpenChange = vi.fn()) => {
      h.effects.length = 0;
      h.refs.length = 0;
      listeners.clear();
      AppShell({ ...base, navOpen: true, onNavOpenChange });
      const refs = h.refs; // in order: menu, side, backdrop, col, close
      const [menu, side, backdrop, col] = refs;
      menu.current = { focus: vi.fn(), getClientRects: () => [{}] };
      side.current = { focus: vi.fn(), querySelectorAll: () => [first, last] };
      backdrop.current = { focus: vi.fn() };
      col.current = { inert: false };
      vi.stubGlobal("document", {
        activeElement: null,
        addEventListener: (t: string, fn: (e: any) => void) => listeners.set(t, fn),
        removeEventListener: (t: string) => listeners.delete(t),
      });
      const cleanup = h.effects[0]() as () => void;
      return { menu: menu.current, backdrop: backdrop.current, col: col.current, cleanup, onNavOpenChange };
    };
    const done = () => vi.unstubAllGlobals();

    it("opening focuses the first drawer control and makes the page column inert", () => {
      first.focus.mockClear();
      const { col, cleanup } = open();
      try {
        expect(first.focus).toHaveBeenCalledOnce();
        expect(col.inert).toBe(true);
        cleanup();
        expect(col.inert).toBe(false);
      } finally {
        done();
      }
    });
    it("closing returns focus to the menu button and drops the listener", () => {
      const { menu, cleanup } = open();
      try {
        cleanup();
        expect(menu.focus).toHaveBeenCalledOnce();
        expect(listeners.has("keydown")).toBe(false);
      } finally {
        done();
      }
    });
    it("Escape anywhere in the document closes it", () => {
      const { onNavOpenChange } = open();
      try {
        listeners.get("keydown")!({ key: "a" });
        expect(onNavOpenChange).not.toHaveBeenCalled();
        listeners.get("keydown")!({ key: "Escape" });
        expect(onNavOpenChange).toHaveBeenCalledWith(false);
      } finally {
        done();
      }
    });
    it("Tab wraps between the backdrop and the last drawer control", () => {
      const { backdrop } = open();
      try {
        (document as any).activeElement = last;
        const e = { key: "Tab", shiftKey: false, preventDefault: vi.fn() };
        listeners.get("keydown")!(e);
        expect(e.preventDefault).toHaveBeenCalledOnce();
        expect(backdrop.focus).toHaveBeenCalledOnce();
        (document as any).activeElement = backdrop;
        const back = { key: "Tab", shiftKey: true, preventDefault: vi.fn() };
        listeners.get("keydown")!(back);
        expect(last.focus).toHaveBeenCalledOnce();
      } finally {
        done();
      }
    });
  });
});
