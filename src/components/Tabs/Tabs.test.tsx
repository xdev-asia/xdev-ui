import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { rovingIndex } from "../../internal/keys";

const setInner = vi.fn();
vi.mock("react", async (orig) => ({ ...(await orig<typeof import("react")>()), useState: (v: unknown) => [v, setInner], useRef: (v: unknown) => ({ current: v }) }));
const { Tabs } = await import("./Tabs");

const items = [
  { id: "changes", label: "Changes", badge: 4 },
  { id: "checks", label: "Checks", badge: 1, badgeTone: "danger" as const },
  { id: "notes", label: "Notes", disabled: true },
];

describe("Tabs", () => {
  it("is a tablist with one tabbable selected tab", () => {
    const html = renderToStaticMarkup(<Tabs items={items} value="checks" label="Worktree panel" idPrefix="wt" />);
    expect(html).toContain('role="tablist"');
    expect(html).toContain('aria-label="Worktree panel"');
    expect(html.match(/role="tab"/g)).toHaveLength(3);
    expect(html.match(/tabindex="0"/g)).toHaveLength(1);
    expect(html).toMatch(/id="wt-tab-checks" aria-controls="wt-panel-checks" aria-selected="true" tabindex="0"/);
    expect(html).toContain('data-tone="danger"');
    expect(html).toContain('data-variant="underline"');
  });
  it("selects the first tab by default and supports the pill variant", () => {
    const html = renderToStaticMarkup(<Tabs items={items} variant="pill" />);
    expect(html).toMatch(/aria-selected="true" tabindex="0"[^>]*>Changes/);
    expect(html).toContain('data-variant="pill"');
  });
  it("wires click", () => {
    const onChange = vi.fn();
    findAll(Tabs({ items, onChange }), (e) => e.type === "button")[1].props.onClick();
    expect(onChange).toHaveBeenCalledWith("checks");
    expect(setInner).toHaveBeenCalledWith("checks");
  });
  it("moves with arrows, Home and End, skipping disabled tabs", () => {
    const off = (i: number) => i === 2;
    expect(rovingIndex("ArrowRight", 1, 3, "horizontal", off)).toBe(0);
    expect(rovingIndex("ArrowLeft", 0, 3, "horizontal", off)).toBe(1);
    expect(rovingIndex("Home", 1, 3)).toBe(0);
    expect(rovingIndex("End", 0, 3, "horizontal", off)).toBe(1);
    expect(rovingIndex("ArrowDown", 0, 3)).toBeNull();
  });
});
