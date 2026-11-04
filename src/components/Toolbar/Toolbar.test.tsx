import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Toolbar } from "./Toolbar";

describe("Toolbar", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("renders a pane head with a named toolbar", () => {
    const html = renderToStaticMarkup(<Toolbar title="Changes" count={12} actions={<button type="button">Stage all</button>} />);
    expect(html).toContain('<div class="pane-head" data-variant="head">');
    expect(html).toContain('<span class="pane-title">Changes<span class="pane-count">12</span></span>');
    expect(html).toContain('<div class="pane-tools" role="toolbar" aria-label="Changes">');
  });
  it("uses the bulk bar and the default label for non-string titles", () => {
    const html = renderToStaticMarkup(<Toolbar variant="bulk" title={<b>3 selected</b>} actions={<button type="button">Delete</button>} />);
    expect(html).toContain('class="pane-head ws-bulk-bar" data-variant="bulk"');
    expect(html).toContain('aria-label="Actions"');
  });
  it("omits the toolbar without actions", () => {
    expect(renderToStaticMarkup(<Toolbar title="Files" />)).not.toContain("toolbar");
  });
  it("moves focus between actions with arrow keys", () => {
    const a = { focus: vi.fn() };
    const b = { focus: vi.fn() };
    vi.stubGlobal("document", { activeElement: b });
    const tools = Toolbar({ title: "Changes", actions: "x" }).props.children[1];
    const preventDefault = vi.fn();
    tools.props.onKeyDown({ key: "ArrowRight", preventDefault, currentTarget: { querySelectorAll: () => [a, b] } });
    expect(a.focus).toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalled();
    tools.props.onKeyDown({ key: "a", preventDefault, currentTarget: { querySelectorAll: () => [a, b] } });
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });
});
