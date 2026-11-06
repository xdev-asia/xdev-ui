import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { BoardCard } from "./BoardCard";

describe("BoardCard", () => {
  it("is a focusable listitem with a status dot and hidden status text", () => {
    const html = renderToStaticMarkup(<BoardCard title="Fix login" meta="Claude" status="running" />);
    expect(html).toContain('role="listitem"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('data-state="working"');
    expect(html).toContain('<span class="x-sr-only">Running</span>');
    expect(html).toContain('<div class="x-board-card-meta">Claude</div>');
  });
  it("maps status words and takes label overrides", () => {
    const labels = { status: { idle: "a", running: "b", waiting: "c", error: "d" } };
    const html = renderToStaticMarkup(<BoardCard title="T" status="error" labels={labels} />);
    expect(html).toContain('data-state="failed"');
    expect(html).toContain(">d</span>");
    expect(html).not.toContain("Error");
  });
  it("marks selected and dragging with data attributes, never a stripe class", () => {
    const html = renderToStaticMarkup(<BoardCard title="T" selected dragging />);
    expect(html).toContain('data-selected=""');
    expect(html).toContain('data-dragging=""');
    expect(html).toContain('aria-current="true"');
    expect(renderToStaticMarkup(<BoardCard title="T" />)).not.toContain("data-selected");
  });
  it("calls onOpen on Enter and click, but not for keys from the menu", () => {
    const onOpen = vi.fn();
    const root = BoardCard({ title: "T", onOpen, menu: <button type="button">More</button> });
    const { onKeyDown, onClick } = root.props;
    const self = {};
    onKeyDown({ key: "Enter", target: self, currentTarget: self });
    expect(onOpen).toHaveBeenCalledTimes(1);
    onKeyDown({ key: "Space", target: self, currentTarget: self });
    onKeyDown({ key: "Enter", target: {}, currentTarget: self });
    expect(onOpen).toHaveBeenCalledTimes(1);
    onClick();
    expect(onOpen).toHaveBeenCalledTimes(2);
    const wrap = findAll(root, (e) => e.props.className === "x-board-card-menu")[0];
    const stop = vi.fn();
    wrap.props.onClick({ stopPropagation: stop });
    wrap.props.onKeyDown({ stopPropagation: stop });
    expect(stop).toHaveBeenCalledTimes(2);
  });
});
