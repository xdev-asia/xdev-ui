import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Tag } from "./Tag";

const key = (over: Record<string, unknown>) => ({
  key: "Backspace", repeat: false, altKey: false, ctrlKey: false, metaKey: false, shiftKey: false, preventDefault: vi.fn(), ...over,
});

describe("Tag", () => {
  it("default tone", () => {
    expect(renderToStaticMarkup(<Tag>x</Tag>)).toBe('<span class="ws-tag">x</span>');
  });
  it("warn tone", () => {
    expect(renderToStaticMarkup(<Tag tone="warn">x</Tag>)).toContain("ws-tag-warn");
  });
  it("has no remove button without onRemove", () => {
    expect(renderToStaticMarkup(<Tag removeLabel="Remove x">x</Tag>)).not.toContain("button");
  });
  it("renders a labelled remove button and is focusable", () => {
    const html = renderToStaticMarkup(<Tag onRemove={() => {}} removeLabel="Remove flag">--yolo</Tag>);
    expect(html).toContain('aria-label="Remove flag"');
    expect(html).toContain("ws-tag-remove");
    expect(html).toContain('tabindex="0"');
  });
  it("removes on Backspace, not with modifiers or on key repeat", () => {
    const onRemove = vi.fn();
    const el = Tag({ onRemove, removeLabel: "Remove", children: "x" });
    const e = key({});
    el.props.onKeyDown(e);
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(e.preventDefault).toHaveBeenCalled();
    el.props.onKeyDown(key({ repeat: true }));
    el.props.onKeyDown(key({ ctrlKey: true }));
    el.props.onKeyDown(key({ metaKey: true }));
    el.props.onKeyDown(key({ altKey: true }));
    el.props.onKeyDown(key({ shiftKey: true }));
    el.props.onKeyDown(key({ key: "Delete" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
