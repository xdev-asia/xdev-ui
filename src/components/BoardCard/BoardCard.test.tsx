import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { BoardCard } from "./BoardCard";

/** forwardRef components keep their render function here; calling it gives the unrendered root element. */
const renderCard = (props: Record<string, unknown>, ref: unknown = null): ReactElement<any> =>
  (BoardCard as unknown as { render(p: unknown, r: unknown): ReactElement<any> }).render(props, ref);

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
    const root = renderCard({ title: "T", onOpen, menu: <button type="button">More</button> }, null);
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
  it("hands the ref to the root and passes attributes through", () => {
    const ref = { current: null };
    const onKeyDown = vi.fn();
    const root = renderCard({ title: "T", "data-x": "1", draggable: true, className: "mine", onKeyDown } as never, ref);
    expect(root.props.ref).toBe(ref);
    expect(root.props["data-x"]).toBe("1");
    expect(root.props.draggable).toBe(true);
    expect(root.props.className).toBe("x-board-card mine");
    const self = {};
    root.props.onKeyDown({ key: "a", target: self, currentTarget: self });
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    const html = renderToStaticMarkup(<BoardCard title="T" data-x="1" draggable className="mine" />);
    expect(html).toContain('data-x="1"');
    expect(html).toContain('draggable="true"');
    expect(html).toContain('class="x-board-card mine"');
  });
  it("keeps clicks and keys in actions away from onOpen", () => {
    const onOpen = vi.fn();
    const root = renderCard({ title: "T", onOpen, actions: <button type="button">x</button> }, null);
    const wrap = findAll(root, (e) => e.props.className === "x-board-card-actions")[0];
    const stop = vi.fn();
    wrap.props.onClick({ stopPropagation: stop });
    wrap.props.onKeyDown({ stopPropagation: stop });
    expect(stop).toHaveBeenCalledTimes(2);
    expect(onOpen).not.toHaveBeenCalled();
    const html = renderToStaticMarkup(<BoardCard title="T" actions={<button type="button">x</button>} />);
    expect(html.indexOf("x-board-card-title")).toBeLessThan(html.indexOf("x-board-card-actions"));
  });
  it("runs the onClick of the caller before onOpen", () => {
    const calls: string[] = [];
    const root = renderCard({ title: "T", onOpen: () => calls.push("open"), onClick: () => calls.push("click") }, null);
    root.props.onClick({});
    expect(calls).toEqual(["click", "open"]);
  });
  it('tone="need" sets the tint hook and a text for screen readers', () => {
    const html = renderToStaticMarkup(<BoardCard title="T" tone="need" status="waiting" />);
    expect(html).toContain('data-tone="need"');
    expect(html).toContain("Needs you");
    expect(renderToStaticMarkup(<BoardCard title="T" tone="need" labels={{ need: "Cần bạn" }} />)).toContain("Cần bạn");
    const plain = renderToStaticMarkup(<BoardCard title="T" />);
    expect(plain).not.toContain("data-tone");
    expect(plain).not.toContain("Needs you");
  });
});
