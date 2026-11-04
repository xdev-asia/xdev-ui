import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("uses label as aria-label and title", () => {
    const html = renderToStaticMarkup(<IconButton icon="search" label="Search" />);
    expect(html).toContain('aria-label="Search"');
    expect(html).toContain('title="Search"');
    expect(html).toContain("ws-icon-btn");
    expect(html).toContain('type="button"');
  });
  it("wires onClick", () => {
    const onClick = vi.fn();
    IconButton({ icon: "search", label: "x", onClick }).props.onClick();
    expect(onClick).toHaveBeenCalledOnce();
  });
});
