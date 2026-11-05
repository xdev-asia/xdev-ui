import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { AppShell } from "./AppShell";

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
  it("toggles through onNavOpenChange; backdrop and Escape close", () => {
    const onNavOpenChange = vi.fn();
    const tree = AppShell({ ...base, navOpen: true, onNavOpenChange });
    findAll(tree, (e) => e.props.className === "x-shell-menu")[0].props.onClick();
    expect(onNavOpenChange).toHaveBeenLastCalledWith(false);
    findAll(tree, (e) => e.props.className === "x-shell-backdrop")[0].props.onClick();
    expect(onNavOpenChange).toHaveBeenCalledTimes(2);
    const root = findAll(tree, (e) => String(e.props.className).startsWith("x-shell x-ws"))[0] ?? (tree as any);
    root.props.onKeyDown({ key: "Escape" });
    expect(onNavOpenChange).toHaveBeenCalledTimes(3);
    root.props.onKeyDown({ key: "a" });
    expect(onNavOpenChange).toHaveBeenCalledTimes(3);
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
});
