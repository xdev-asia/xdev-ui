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
  it("size sets data-size; md (default) sets nothing", () => {
    expect(renderToStaticMarkup(<IconButton icon="search" label="S" size="lg" />)).toContain('data-size="lg"');
    expect(renderToStaticMarkup(<IconButton icon="search" label="S" size="sm" />)).toContain('data-size="sm"');
    expect(renderToStaticMarkup(<IconButton icon="search" label="S" />)).not.toContain("data-size");
  });
  it("passes ref through", () => {
    const ref = { current: null };
    expect(IconButton({ icon: "search", label: "x", ref }).props.ref).toBe(ref);
  });
  it("busy: aria-busy, disabled, clicks ignored, spinner replaces the icon, label stays the name", () => {
    const onClick = vi.fn();
    const el = IconButton({ icon: "trash", label: "Delete row", busy: true, onClick });
    expect(el.props.disabled).toBe(true);
    expect(el.props.onClick).toBeUndefined();
    const html = renderToStaticMarkup(<IconButton icon="trash" label="Delete row" busy onClick={onClick} />);
    expect(html).toContain('aria-busy="true"');
    expect(html).toMatch(/ disabled=""/);
    expect(html).toContain('aria-label="Delete row"');
    expect(html).toContain("x-spinner");
    expect(html).not.toContain("x-icon");
    expect(html).toMatch(/<span class="x-btn-busy" aria-hidden="true">/);
    expect(html).not.toMatch(/\bLoading\b/);
    expect(onClick).not.toHaveBeenCalled();
  });
  it("busy spinner follows size: sm stays sm, md and lg use md", () => {
    expect(renderToStaticMarkup(<IconButton icon="save" label="S" size="sm" busy />)).toContain('class="x-spinner" role="status" data-size="sm"');
    expect(renderToStaticMarkup(<IconButton icon="save" label="S" busy />)).toContain('data-size="md"');
  });
  it("not busy keeps the icon and the click handler", () => {
    const onClick = vi.fn();
    const el = IconButton({ icon: "save", label: "Save", onClick });
    expect(el.props.disabled).toBeFalsy();
    expect(el.props["aria-busy"]).toBeUndefined();
    el.props.onClick();
    expect(onClick).toHaveBeenCalledOnce();
  });
  it("tone danger sets data-tone; default sets nothing", () => {
    expect(renderToStaticMarkup(<IconButton icon="trash" label="Delete row" tone="danger" />)).toContain('data-tone="danger"');
    expect(renderToStaticMarkup(<IconButton icon="trash" label="Delete row" />)).not.toContain("data-tone");
  });
});
