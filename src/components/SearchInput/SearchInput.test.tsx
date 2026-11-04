import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { SearchInput } from "./SearchInput";

describe("SearchInput", () => {
  it("is a type=search input with a decorative icon and default label", () => {
    const html = renderToStaticMarkup(<SearchInput placeholder="Find a worktree" />);
    expect(html).toContain('type="search"');
    expect(html).toContain('aria-label="Search"');
    expect(html).toContain('class="x-icon search-icon"');
    expect(html).toContain('data-size="md"');
    expect(html).not.toContain("search-clear");
  });
  it("shows the clear button only with a value and onClear", () => {
    const html = renderToStaticMarkup(<SearchInput value="login" onChange={() => {}} onClear={() => {}} shortcut="Ctrl K" />);
    expect(html).toContain('aria-label="Clear search"');
    expect(html).not.toContain("ws-search-hint");
    expect(renderToStaticMarkup(<SearchInput value="" onChange={() => {}} onClear={() => {}} shortcut="Ctrl K" />)).toContain('<kbd class="kbd">Ctrl K</kbd>');
  });
  it("renders the count and keeps an explicit label", () => {
    const html = renderToStaticMarkup(<SearchInput size="sm" count={3} aria-label="Filter files" />);
    expect(html).toContain("3 results");
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-label="Filter files"');
    expect(html).toContain('data-size="sm"');
  });
  it("wires onClear", () => {
    const onClear = vi.fn();
    findAll(SearchInput({ value: "x", onClear }), (e) => e.type === "button")[0].props.onClick();
    expect(onClear).toHaveBeenCalledOnce();
  });
});
