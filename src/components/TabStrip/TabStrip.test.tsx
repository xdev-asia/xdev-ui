import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";

const setInner = vi.fn();
vi.mock("react", async (orig) => ({ ...(await orig<typeof import("react")>()), useState: (v: unknown) => [v, setInner], useId: () => "u" }));
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
  it("keeps close buttons outside the tablist and only the selected tab in the Tab order", () => {
    const html = renderToStaticMarkup(<TabStrip tabs={[{ id: "a", name: "a" }, { id: "b", name: "b" }]} selected="b" />);
    expect(html).toContain('role="tablist" aria-owns="');
    expect(html).toContain("></div>");
    expect(html).toContain("data-selected");
    expect(html.match(/role="tab"[^>]*tabindex="0"/g)).toHaveLength(1);
    expect(html).toMatch(/aria-selected="true" tabindex="0"/);
    expect(html).toMatch(/ws-tab-close"[^>]*tabindex="-1"/);
  });
  it("falls back to the first tab as the Tab stop when none is selected", () => {
    const html = renderToStaticMarkup(<TabStrip tabs={[{ id: "a", name: "a" }, { id: "b", name: "b" }]} selected="zzz" />);
    expect(html.match(/tabindex="0"/g)).toHaveLength(1);
  });
  it("moves with Left/Right/Home/End, selecting the target", () => {
    const mk = (n: number) => Array.from({ length: n }, () => ({ focus: vi.fn(), click: vi.fn() }));
    const list = mk(3);
    const run = (key: string, at: number) => {
      const btn = findAll(TabStrip({ tabs: [{ id: "a", name: "a" }, { id: "b", name: "b" }, { id: "c", name: "c" }] }), (e) => e.type === "button" && e.props.role === "tab")[at];
      const ev = { key, preventDefault: vi.fn(), currentTarget: Object.assign(list[at], { closest: () => ({ querySelectorAll: () => list }) }) };
      btn.props.onKeyDown(ev);
      return ev;
    };
    run("ArrowRight", 2);
    expect(list[0].focus).toHaveBeenCalled();
    expect(list[0].click).toHaveBeenCalled();
    run("ArrowLeft", 0);
    expect(list[2].click).toHaveBeenCalled();
    run("Home", 1);
    expect(list[0].click).toHaveBeenCalledTimes(2);
    run("End", 1);
    expect(list[2].click).toHaveBeenCalledTimes(2);
  });
  it("Delete closes a closable tab and focuses its neighbour; dirty tabs are left alone", () => {
    const onClose = vi.fn();
    const list = [{ focus: vi.fn() }, { focus: vi.fn() }];
    const btns = findAll(TabStrip({ tabs, onClose }), (e) => e.type === "button" && e.props.role === "tab");
    const ev = (i: number) => ({ key: "Delete", preventDefault: vi.fn(), currentTarget: Object.assign(list[i], { closest: () => ({ querySelectorAll: () => list }) }) });
    btns[0].props.onKeyDown(ev(0));
    expect(onClose).toHaveBeenCalledWith("a");
    expect(list[1].focus).toHaveBeenCalled();
    btns[1].props.onKeyDown(ev(1)); // b is dirty
    expect(onClose).toHaveBeenCalledOnce();
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
