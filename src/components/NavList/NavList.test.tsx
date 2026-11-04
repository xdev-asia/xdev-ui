import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { NavList } from "./NavList";

const items = [
  { id: "general", label: "General" },
  { id: "agents", label: "Agents", count: 3 },
  { id: "keys", label: "Keyboard", href: "#keys" },
];

describe("NavList", () => {
  it("is a nav named by its title with the current item marked", () => {
    const html = renderToStaticMarkup(<NavList title="Settings" items={items} value="agents" />);
    expect(html).toContain('<nav class="settings-nav" aria-label="Settings">');
    expect(html).toContain('<h2 class="settings-nav-title">Settings</h2>');
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
    expect(html).toMatch(/aria-current="page"[^>]*><span class="settings-nav-label">Agents/);
    expect(html).toContain('<span class="settings-nav-count">3</span>');
    expect(html).toContain('href="#keys"');
  });
  it("falls back to the default nav label", () => {
    expect(renderToStaticMarkup(<NavList items={items} />)).toContain('aria-label="Sections"');
  });
  it("wires onSelect", () => {
    const onSelect = vi.fn();
    findAll(NavList({ items, onSelect }), (e) => e.type === "button")[1].props.onClick();
    expect(onSelect).toHaveBeenCalledWith("agents");
  });
});
