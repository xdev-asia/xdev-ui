import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { treeKey } from "./treeKeys";

const setInner = vi.fn();
vi.mock("react", async (orig) => ({ ...(await orig<typeof import("react")>()), useState: (v: unknown) => [v, setInner], useRef: (v: unknown) => ({ current: v }) }));
const { TreeView } = await import("./TreeView");

const rows = [
  { id: "src", depth: 0, name: "src", kind: "dir" as const, open: true, changed: true },
  { id: "src/App.tsx", depth: 1, name: "App.tsx", kind: "file" as const, mark: "modified" as const },
  { id: "src/new.ts", depth: 1, name: "new.ts", kind: "file" as const, mark: "added" as const },
  { id: "docs", depth: 0, name: "docs", kind: "dir" as const },
];

describe("TreeView", () => {
  it("is a tree of levelled items with one tab stop", () => {
    const html = renderToStaticMarkup(<TreeView rows={rows} selected="src/App.tsx" />);
    expect(html).toContain('role="tree" aria-label="Files"');
    expect(html.match(/role="treeitem"/g)).toHaveLength(4);
    expect(html).toMatch(/aria-level="1" aria-expanded="true"/);
    expect(html).toMatch(/aria-level="2" aria-selected="true" tabindex="0"/);
    expect(html.match(/tabindex="0"/g)).toHaveLength(1);
    expect(html).toContain('style="--tree-depth:1"');
    expect(html).toContain('data-kind="modified" title="Modified"');
    expect(html).toContain('<span aria-hidden="true">A</span>');
    expect(html).toContain('<span class="x-sr-only">Changed</span>');
  });
  it("shows the file count of a folder after its name", () => {
    const html = renderToStaticMarkup(<TreeView rows={[{ id: "src/", depth: 0, name: "src", kind: "dir" as const, open: true, count: 4 }]} />);
    expect(html).toContain('<span class="ws-tree-count">4</span>');
    expect(renderToStaticMarkup(<TreeView rows={rows} />)).not.toContain("ws-tree-count");
  });
  it("toggles dirs and opens files on click", () => {
    const onToggle = vi.fn();
    const onOpen = vi.fn();
    const btns = findAll(TreeView({ rows, onToggle, onOpen }), (e) => e.props.role === "treeitem");
    btns[0].props.onClick();
    btns[1].props.onClick();
    expect(onToggle).toHaveBeenCalledWith("src");
    expect(onOpen).toHaveBeenCalledWith("src/App.tsx");
  });
});

describe("treeKey", () => {
  it("moves up, down, Home and End without wrapping", () => {
    expect(treeKey("ArrowDown", 0, rows)).toEqual({ focus: 1 });
    expect(treeKey("ArrowDown", 3, rows)).toBeNull();
    expect(treeKey("ArrowUp", 0, rows)).toBeNull();
    expect(treeKey("Home", 2, rows)).toEqual({ focus: 0 });
    expect(treeKey("End", 0, rows)).toEqual({ focus: 3 });
  });
  it("opens, enters, closes and climbs with Right and Left", () => {
    expect(treeKey("ArrowRight", 3, rows)).toEqual({ toggle: "docs" });
    expect(treeKey("ArrowRight", 0, rows)).toEqual({ focus: 1 });
    expect(treeKey("ArrowRight", 1, rows)).toBeNull();
    expect(treeKey("ArrowLeft", 0, rows)).toEqual({ toggle: "src" });
    expect(treeKey("ArrowLeft", 2, rows)).toEqual({ focus: 0 });
    expect(treeKey("ArrowLeft", 3, rows)).toBeNull();
  });
  it("activates with Enter", () => {
    expect(treeKey("Enter", 0, rows)).toEqual({ toggle: "src" });
    expect(treeKey("Enter", 1, rows)).toEqual({ open: "src/App.tsx" });
    expect(treeKey("x", 1, rows)).toBeNull();
  });
});
