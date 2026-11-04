import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";

const setInner = vi.fn();
vi.mock("react", async (orig) => ({ ...(await orig<typeof import("react")>()), useState: (v: unknown) => [v, setInner] }));
const { TabStrip } = await import("./TabStrip");

const tabs = [
  { id: "a", name: "fix-auth", state: "working" as const },
  { id: "b", name: "docs", dirty: true, skipped: true },
];

describe("TabStrip", () => {
  it("renders tablist, selected tab, close and add buttons", () => {
    const html = renderToStaticMarkup(<TabStrip tabs={tabs} selected="a" label="Sessions" />);
    expect(html).toContain('role="tablist"');
    expect(html).toContain('role="tab"');
    expect(html).toContain('aria-label="Close fix-auth"');
    expect(html).toContain('aria-label="New tab"');
    expect(html).toContain("ws-tab-dirty");
  });
  it("hides + when onAdd is false", () => {
    expect(renderToStaticMarkup(<TabStrip tabs={tabs} onAdd={false} />)).not.toContain("ws-tab-add");
  });
  it("wires select, close, add", () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    const onAdd = vi.fn();
    const btns = findAll(TabStrip({ tabs, onSelect, onClose, onAdd }), (e) => e.type === "button");
    btns[0].props.onClick(); // tab a
    btns[1].props.onClick(); // close a
    btns[btns.length - 1].props.onClick(); // add
    expect(onSelect).toHaveBeenCalledWith("a");
    expect(setInner).toHaveBeenCalledWith("a");
    expect(onClose).toHaveBeenCalledWith("a");
    expect(onAdd).toHaveBeenCalledOnce();
  });
});
