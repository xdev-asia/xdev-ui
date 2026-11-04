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
});
