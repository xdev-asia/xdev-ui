import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { Menu } from "./Menu";

describe("Menu", () => {
  it("renders roles, separators, checks and danger", () => {
    const html = renderToStaticMarkup(
      <Menu label="Session" items={[{ label: "Open", chord: "⏎" }, { type: "separator" }, { label: "Wrap", checked: true }, { label: "Kill", danger: true }]} />,
    );
    expect(html).toContain('role="menu"');
    expect(html).toContain('role="separator"');
    expect(html).toContain('role="menuitemcheckbox"');
    expect(html).toContain('aria-checked="true"');
    expect(html).toContain("data-danger");
  });
  it("does not wire disabled items", () => {
    const onSelect = vi.fn();
    const btns = findAll(Menu({ items: [{ label: "A", onSelect }, { label: "B", onSelect, disabled: true }] }), (e) => e.type === "button");
    btns[0].props.onClick();
    expect(btns[1].props.onClick).toBeUndefined();
    expect(onSelect).toHaveBeenCalledOnce();
  });
  it("renders an item with href as a link menuitem, so cmd-click opens a new tab", () => {
    const html = renderToStaticMarkup(<Menu items={[{ label: "Profile", href: "/me" }, { label: "Off", href: "/off", disabled: true }]} />);
    expect(html).toContain('<a href="/me" class="x-menu-item" role="menuitem"><span class="x-menu-label">Profile</span></a>');
    expect(html).toContain('<a class="x-menu-item" role="menuitem" aria-disabled="true"><span class="x-menu-label">Off</span></a>');
  });
  it("renderLink renders links through the app's router link", () => {
    const html = renderToStaticMarkup(
      <Menu items={[{ label: "Profile", href: "/me", danger: true }]} renderLink={({ children, ...p }) => <a data-router="" {...p}>{children}</a>} />,
    );
    expect(html).toContain('<a data-router="" href="/me" class="x-menu-item" role="menuitem" data-danger="">');
  });
  it("roving gives every item tabindex -1 and onAction runs after a choice", () => {
    const onSelect = vi.fn();
    const onAction = vi.fn();
    const html = renderToStaticMarkup(<Menu roving items={[{ label: "A" }, { label: "B", href: "/b" }]} />);
    expect(html.match(/tabindex="-1"/g)).toHaveLength(2);
    const [btn] = findAll(Menu({ items: [{ label: "A", onSelect }, { label: "B", href: "/b", onSelect }], onAction }), (e) => e.type === "button");
    btn.props.onClick();
    const [link] = findAll(Menu({ items: [{ label: "B", href: "/b", onSelect }], onAction }), (e) => e.type === "a");
    link.props.onClick();
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onAction).toHaveBeenCalledTimes(2);
  });
  it("default markup is unchanged: no tabindex on items", () => {
    expect(renderToStaticMarkup(<Menu items={[{ label: "A" }]} />)).toBe(
      '<div class="x-menu" role="menu"><button type="button" class="x-menu-item" role="menuitem"><span class="x-menu-label">A</span></button></div>',
    );
  });
});
