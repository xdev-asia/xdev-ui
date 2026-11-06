import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { Menu } from "./Menu";

const h = vi.hoisted(() => ({ open: false, set: (_: unknown) => {} }));
vi.mock("react", async (orig) => ({
  ...(await orig<typeof import("react")>()),
  useId: () => "m1",
  useRef: (v: unknown) => ({ current: v }),
  useEffect: () => {},
  useLayoutEffect: () => {},
  useState: () => [h.open, (v: unknown) => h.set(v)],
  useSyncExternalStore: (_s: unknown, _c: () => boolean, server: () => boolean) => server(),
}));
const { MenuButton } = await import("./MenuButton");

const items = [{ label: "Edit" }, { label: "Profile", href: "/me" }, { type: "separator" as const }, { label: "Delete", danger: true }];
const key = (k: string) => ({ key: k, preventDefault: vi.fn(), stopPropagation: vi.fn(), target: {}, ctrlKey: false, metaKey: false, altKey: false });

beforeEach(() => {
  h.open = false;
  h.set = vi.fn();
});

describe("MenuButton", () => {
  it("closed: a button with aria-haspopup=menu and aria-expanded=false, no menu", () => {
    const html = renderToStaticMarkup(<MenuButton label="Actions" items={items} />);
    expect(html).toContain('aria-haspopup="menu"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("Actions");
    expect(html).not.toContain('role="menu"');
  });
  it("open: the menu is labelled, controlled by the trigger, aligned and its items are roving", () => {
    h.open = true;
    const html = renderToStaticMarkup(<MenuButton label="Actions" menuLabel="Row actions" align="end" items={items} />);
    expect(html).toContain('id="x-menubtn-m1-trigger" aria-haspopup="menu" aria-expanded="true" aria-controls="x-menubtn-m1"');
    expect(html).toContain('class="x-menubutton-pop" data-align="end"');
    expect(html).toContain('<div class="x-menu" role="menu" aria-label="Row actions" id="x-menubtn-m1"');
    expect(html.match(/tabindex="-1"/g)).toHaveLength(3);
    expect(html).toContain('href="/me"');
  });
  it("variant icon renders an IconButton named by label", () => {
    const tree = MenuButton({ label: "More actions", variant: "icon", items });
    const [btn] = findAll(tree, (e) => e.type === IconButton);
    expect(btn.props.label).toBe("More actions");
    expect(btn.props.icon).toBe("more");
    expect(findAll(tree, (e) => e.type === Button)).toHaveLength(0);
  });
  it("ArrowDown and ArrowUp on the trigger open the menu; Enter, Space and click toggle through the native click", () => {
    const [btn] = findAll(MenuButton({ label: "A", items }), (e) => e.type === Button);
    for (const k of ["ArrowDown", "ArrowUp"]) {
      const e = key(k);
      btn.props.onKeyDown(e);
      expect(e.preventDefault).toHaveBeenCalled();
    }
    const enter = key("Enter");
    btn.props.onKeyDown(enter);
    expect(enter.preventDefault).not.toHaveBeenCalled();
    expect(h.set).toHaveBeenCalledTimes(2);
    expect(h.set).toHaveBeenLastCalledWith(true);
    btn.props.onClick();
    expect(h.set).toHaveBeenLastCalledWith(true);
    h.open = true;
    const [openBtn] = findAll(MenuButton({ label: "A", items }), (e) => e.type === Button);
    openBtn.props.onClick();
    expect(h.set).toHaveBeenLastCalledWith(false);
  });
  it("a disabled trigger does not open", () => {
    const [btn] = findAll(MenuButton({ label: "A", items, disabled: true }), (e) => e.type === Button);
    expect(btn.props.disabled).toBe(true);
  });
  it("Escape and Tab in the menu close it; Escape does not bubble to a dialog", () => {
    h.open = true;
    vi.stubGlobal("document", { activeElement: null });
    const [menu] = findAll(MenuButton({ label: "A", items }), (e) => e.type === Menu);
    const esc = key("Escape");
    menu.props.onKeyDown(esc);
    expect(esc.preventDefault).toHaveBeenCalled();
    expect(esc.stopPropagation).toHaveBeenCalled();
    expect(h.set).toHaveBeenLastCalledWith(false);
    const tab = key("Tab");
    menu.props.onKeyDown(tab);
    expect(tab.preventDefault).not.toHaveBeenCalled();
    expect(h.set).toHaveBeenCalledTimes(2);
    vi.unstubAllGlobals();
  });
  it("choosing an item or clicking outside closes the menu", () => {
    h.open = true;
    const tree = MenuButton({ label: "A", items });
    findAll(tree, (e) => e.type === Menu)[0].props.onAction();
    findAll(tree, (e) => e.props.className === "ws-menu-backdrop")[0].props.onClick();
    expect(h.set).toHaveBeenCalledTimes(2);
    expect(h.set).toHaveBeenLastCalledWith(false);
  });
  it("passes renderLink to the menu", () => {
    h.open = true;
    const renderLink = vi.fn(() => null);
    renderToStaticMarkup(<MenuButton label="A" items={items} renderLink={renderLink} />);
    expect(renderLink).toHaveBeenCalledWith(expect.objectContaining({ href: "/me", role: "menuitem", tabIndex: -1 }));
  });
});
