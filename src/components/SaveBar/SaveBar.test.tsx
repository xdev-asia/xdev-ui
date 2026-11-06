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
const { SaveBar, useUnsavedGuard } = await import("./SaveBar");
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
    expect(html).toContain(">Saving</button>");
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
