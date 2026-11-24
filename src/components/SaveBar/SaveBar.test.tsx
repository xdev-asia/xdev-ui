import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { Button } from "../Button/Button";

const h = vi.hoisted(() => ({ effects: [] as Array<() => void | (() => void)> }));
vi.mock("react", async (orig) => ({
  ...(await orig<typeof import("react")>()),
  useEffect: (fn: () => void | (() => void)) => void h.effects.push(fn),
  useCallback: (fn: unknown) => fn,
}));
const { SaveBar, useUnsavedGuard, isInAppNavigation } = await import("./SaveBar");
const noop = (): void => {};

afterEach(() => {
  h.effects.length = 0;
  vi.unstubAllGlobals();
});

describe("SaveBar", () => {
  it("renders nothing while clean", () => {
    expect(renderToStaticMarkup(<SaveBar dirty={false} onSave={noop} onDiscard={noop} />)).toBe("");
  });
  it("is a named region with Discard then Save", () => {
    const html = renderToStaticMarkup(<SaveBar dirty onSave={noop} onDiscard={noop} />);
    expect(html).toContain('role="region" aria-label="You have unsaved changes"');
    expect(html).toMatch(/Discard<\/button><button type="button" class="btn">Save<\/button>/);
  });
  it("busy keeps it visible, disables both and says saving", () => {
    const html = renderToStaticMarkup(<SaveBar dirty={false} busy onSave={noop} onDiscard={noop} />);
    expect(html.match(/disabled=""/g)).toHaveLength(2);
    expect(html).toContain(">Saving…</button>");
  });
  it("an error replaces the message as an alert", () => {
    expect(renderToStaticMarkup(<SaveBar dirty error="Network error" onSave={noop} onDiscard={noop} />)).toContain('<p class="x-savebar-msg" role="alert">Network error</p>');
  });
  it("wires the buttons", () => {
    const onSave = vi.fn();
    const onDiscard = vi.fn();
    const [discard, save] = findAll(SaveBar({ dirty: true, onSave, onDiscard }), (e) => e.type === Button);
    discard.props.onClick();
    save.props.onClick();
    expect(onDiscard).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledOnce();
  });
});

describe("useUnsavedGuard", () => {
  function fakeWindow(confirm: boolean) {
    const listeners = new Map<string, unknown>();
    const win = {
      addEventListener: vi.fn((t: string, f: unknown) => listeners.set(t, f)),
      removeEventListener: vi.fn((t: string) => listeners.delete(t)),
      confirm: vi.fn(() => confirm),
    };
    vi.stubGlobal("window", win);
    return { win, listeners };
  }
  it("adds beforeunload while dirty and removes it on cleanup", () => {
    const { listeners } = fakeWindow(true);
    useUnsavedGuard(true);
    const cleanup = h.effects[0]() as () => void;
    const handler = listeners.get("beforeunload") as (e: { preventDefault: () => void; returnValue: unknown }) => void;
    const e = { preventDefault: vi.fn(), returnValue: undefined as unknown };
    handler(e);
    expect(e.preventDefault).toHaveBeenCalled();
    cleanup();
    expect(listeners.has("beforeunload")).toBe(false);
  });
  it("does nothing while clean", () => {
    const { win } = fakeWindow(false);
    const g = useUnsavedGuard(false);
    h.effects[0]();
    expect(win.addEventListener).not.toHaveBeenCalled();
    expect(g.confirmLeave()).toBe(true);
    expect(win.confirm).not.toHaveBeenCalled();
  });
  it("confirmLeave asks with the message when dirty", () => {
    const { win } = fakeWindow(false);
    expect(useUnsavedGuard(true, "Rời trang?").confirmLeave()).toBe(false);
    expect(win.confirm).toHaveBeenCalledWith("Rời trang?");
  });
});

describe("useUnsavedGuard guardLinks", () => {
  function fakeDom(confirm: boolean, href = "http://app.test/admin/#/course/lessons/l1") {
    const listeners = new Map<string, (e: unknown) => void>();
    const doc = {
      addEventListener: vi.fn((t: string, f: (e: unknown) => void) => listeners.set(t, f)),
      removeEventListener: vi.fn((t: string) => listeners.delete(t)),
    };
    const win = { addEventListener: vi.fn(), removeEventListener: vi.fn(), confirm: vi.fn(() => confirm), location: { href } };
    vi.stubGlobal("window", win);
    vi.stubGlobal("document", doc);
    return { win, doc, listeners };
  }
  const click = (href: string) => {
    const a = { href, target: "", hasAttribute: () => false };
    return { defaultPrevented: false, button: 0, target: { closest: () => a }, preventDefault: vi.fn(), stopPropagation: vi.fn() };
  };
  it("cancels a hash link click when the user stays", () => {
    const { listeners, win } = fakeDom(false);
    useUnsavedGuard(true, "Leave?", { guardLinks: true });
    h.effects[1]();
    const e = click("http://app.test/admin/#/words");
    listeners.get("click")!(e);
    expect(win.confirm).toHaveBeenCalledWith("Leave?");
    expect(e.preventDefault).toHaveBeenCalled();
  });
  it("lets the click through when the user agrees, and is off by default", () => {
    const { listeners } = fakeDom(true);
    useUnsavedGuard(true, "Leave?", { guardLinks: true });
    h.effects[1]();
    const e = click("http://app.test/admin/#/words");
    listeners.get("click")!(e);
    expect(e.preventDefault).not.toHaveBeenCalled();
    h.effects.length = 0;
    const off = fakeDom(false);
    useUnsavedGuard(true);
    h.effects[1]();
    expect(off.doc.addEventListener).not.toHaveBeenCalled();
  });
});

describe("isInAppNavigation", () => {
  const here = "https://a.test/admin/#/lessons/l1";
  it("is true for another hash route or path on the same origin", () => {
    expect(isInAppNavigation({ href: "#/words" }, here)).toBe(true);
    expect(isInAppNavigation({ href: "/admin/other" }, here)).toBe(true);
  });
  it("is false for the same URL, other origins, new tabs, downloads and modified clicks", () => {
    expect(isInAppNavigation({ href: "#/lessons/l1" }, here)).toBe(false);
    expect(isInAppNavigation({ href: "https://b.test/" }, here)).toBe(false);
    expect(isInAppNavigation({ href: "#/words", target: "_blank" }, here)).toBe(false);
    expect(isInAppNavigation({ href: "/file.csv", download: true }, here)).toBe(false);
    expect(isInAppNavigation({ href: "#/words" }, here, { metaKey: true })).toBe(false);
    expect(isInAppNavigation({ href: "#/words" }, here, { button: 1 })).toBe(false);
  });
});
