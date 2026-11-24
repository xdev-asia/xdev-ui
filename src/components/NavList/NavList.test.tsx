import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { Disclosure } from "../Disclosure/Disclosure";
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
    findAll(NavList({ items, onSelect }), (e) => e.type === "button")[1]!.props.onClick();
    expect(onSelect).toHaveBeenCalledWith("agents");
  });
  it("renders an item icon before the label", () => {
    const html = renderToStaticMarkup(<NavList items={[{ id: "users", label: "Users", icon: "accounts" }, { id: "plain", label: "Plain" }]} />);
    expect(html).toMatch(/<svg class="x-icon settings-nav-icon"[^>]*width="16"[^>]*>.*<\/svg><span class="settings-nav-label">Users/);
    expect(html.match(/<svg/g)).toHaveLength(1);
  });
  it("renderLink renders href items through a custom link component", () => {
    const seen: any[] = [];
    const html = renderToStaticMarkup(
      <NavList
        items={items}
        value="keys"
        renderLink={(p) => {
          seen.push(p);
          return (
            <a data-router="" href={p.href} className={p.className} aria-current={p["aria-current"]}>
              {p.children}
            </a>
          );
        }}
      />,
    );
    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatchObject({ href: "#keys", className: "settings-nav-item", "aria-current": "page" });
    expect(html).toContain('<a data-router="" href="#keys" class="settings-nav-item" aria-current="page"><span class="settings-nav-label">Keyboard</span></a>');
    expect(html.match(/<button/g)).toHaveLength(2);
  });
  it("collapsible puts the items in a Disclosure headed by the title", () => {
    const tree = NavList({ items, title: "Content", collapsible: true, defaultOpen: false });
    const [disc] = findAll(tree, (e) => e.type === Disclosure);
    expect(disc!.props.title).toBe("Content");
    expect(disc!.props.defaultExpanded).toBe(false);
    expect(disc!.props.className).toBe("settings-nav-group");
    expect(findAll(tree, (e) => e.type === "h2")).toHaveLength(0);
    const html = renderToStaticMarkup(<NavList items={items} title="Content" collapsible />);
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('<nav class="settings-nav" aria-label="Content" data-collapsible="">');
  });
  it("collapsible without a title is a plain list", () => {
    expect(findAll(NavList({ items, collapsible: true }), (e) => e.type === Disclosure)).toHaveLength(0);
  });

  it("puts a status dot after the label, with the state in words", () => {
    const html = renderToStaticMarkup(<NavList items={[{ id: "providers", label: "Providers", tone: "danger", toneLabel: "2 failing" }]} />);
    expect(html).toContain('<span class="settings-nav-tone" title="2 failing">');
    expect(html).toContain('data-tone="danger"');
    expect(html).toContain('<span class="x-sr-only">2 failing</span>');
    expect(renderToStaticMarkup(<NavList items={items} />)).not.toContain("settings-nav-tone");
  });
  it("nests branches as details, opens the one that holds the current item and shares a name in an accordion", () => {
    const tree = [
      { id: "home", label: "Home", icon: "home" as const, href: "#/" },
      {
        id: "nested",
        label: "Nested",
        icon: "list" as const,
        children: [
          { id: "m1", label: "Menu 1", icon: "file" as const, children: [{ id: "m11", label: "Menu 1-1", icon: "file" as const, href: "#/m11" }] },
          { id: "m2", label: "Menu 2", icon: "file" as const, href: "#/m2" },
        ],
      },
      { id: "sys", label: "System", icon: "settings" as const, children: [{ id: "u", label: "Users", icon: "accounts" as const, href: "#/u" }] },
    ];
    const html = renderToStaticMarkup(<NavList items={tree} value="m11" accordion />);
    expect(html.match(/<details/g)).toHaveLength(3);
    expect(html).toMatch(/<details class="settings-nav-branch" name="nav-root" open="">/);
    expect(html).toContain('name="nav-nested" open=""');
    expect(html).toMatch(/<details class="settings-nav-branch" name="nav-root"><summary/);
    expect(html).toContain('aria-current="page" style="--nav-depth:2"');
    expect(renderToStaticMarkup(<NavList items={tree} value="home" />)).not.toContain("name=");
  });
});
