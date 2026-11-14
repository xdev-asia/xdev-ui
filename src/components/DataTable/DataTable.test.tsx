import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { DataTable, type DataTableColumn } from "./DataTable";

interface Row { id: string; name: string; role: string }
const rows: Row[] = [
  { id: "1", name: "Ada", role: "Owner" },
  { id: "2", name: "Grace", role: "Admin" },
];
const columns: DataTableColumn<Row>[] = [
  { key: "name", header: "Name", cell: (r) => r.name, sortable: true },
  { key: "role", header: "Role", cell: (r) => r.role, hideNarrow: true },
];
const base = { columns, rows, rowKey: (r: Row) => r.id, caption: "Users" };

describe("DataTable", () => {
  it("renders a captioned table with one row per item", () => {
    const html = renderToStaticMarkup(<DataTable {...base} />);
    expect(html).toContain('<div class="x-table-wrap"');
    expect(html).toContain('<caption class="x-sr-only">Users</caption>');
    expect(html.match(/<tbody>.*<\/tbody>/)![0].match(/<tr/g)).toHaveLength(2);
    expect(html).toContain("Grace");
    expect(html).toContain('data-hide-narrow="true"');
  });
  it("marks the sorted column and uses a button for sortable headers", () => {
    const html = renderToStaticMarkup(<DataTable {...base} sort={{ key: "name", dir: "desc" }} />);
    expect(html).toContain('aria-sort="descending"');
    expect(html).toContain('class="x-table-sort"');
    expect(html).toContain("sorted descending");
    expect(html.match(/aria-sort/g)).toHaveLength(1);
  });
  it("sort button calls onSortChange with the next sort", () => {
    const onSortChange = vi.fn();
    const btn = findAll(DataTable({ ...base, sort: { key: "name", dir: "asc" }, onSortChange }), (e) => e.props.className === "x-table-sort")[0];
    btn.props.onClick();
    expect(onSortChange).toHaveBeenCalledWith({ key: "name", dir: "desc" });
  });
  it("adds a checkbox column when selected is given", () => {
    const html = renderToStaticMarkup(<DataTable {...base} selected={new Set(["1"])} onSelectedChange={() => {}} rowLabel={(r) => r.name} />);
    expect(html).toContain('aria-label="Select all rows"');
    expect(html).toContain('aria-label="Select Ada"');
    expect(html).toContain('aria-selected="true"');
    expect(html.match(/aria-selected/g)).toHaveLength(1);
    expect(renderToStaticMarkup(<DataTable {...base} />)).not.toContain("checkbox");
  });
  it("select all adds every row; select all again clears them", () => {
    const onSelectedChange = vi.fn();
    const sel = (selected: string[]) => findAll(DataTable({ ...base, selected: new Set(selected), onSelectedChange }), (e) => e.props["aria-label"] === "Select all rows")[0];
    sel([]).props.onChange();
    expect([...onSelectedChange.mock.calls[0][0]].sort()).toEqual(["1", "2"]);
    sel(["1", "2"]).props.onChange();
    expect([...onSelectedChange.mock.calls[1][0]]).toEqual([]);
    expect(sel(["1"]).props.indeterminate).toBe(true);
  });
  it("shows the empty node when there are no rows", () => {
    const html = renderToStaticMarkup(<DataTable {...base} rows={[]} empty={<p>No users</p>} />);
    expect(html).toContain("No users");
    expect(html).toContain('class="x-table-empty"');
  });
  it("loading shows a spinner and sets aria-busy", () => {
    const html = renderToStaticMarkup(<DataTable {...base} rows={[]} loading labels={{ loading: "Chargement" }} empty={<p>No users</p>} />);
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("Chargement");
    expect(html).not.toContain("No users");
  });
  it("applies column align, mono and width", () => {
    const html = renderToStaticMarkup(<DataTable {...base} columns={[{ key: "n", header: "N", cell: (r) => r.name, align: "end", mono: true, width: "min" }]} />);
    expect(html).toContain('data-align="end"');
    expect(html).toContain("ws-mono");
    expect(html).toContain('data-width="min"');
  });
  it("reorderable adds a named drag handle per row and a polite live region", () => {
    const html = renderToStaticMarkup(<DataTable {...base} reorderable onReorder={() => {}} rowLabel={(r) => r.name} />);
    expect(html.match(/class="x-table-handle"/g)).toHaveLength(2);
    expect(html).toContain('aria-label="Reorder Ada"');
    expect(html).toContain('aria-label="Reorder Grace"');
    expect(html).toContain('<span class="x-sr-only">Order</span>');
    expect(html).toContain('aria-live="polite"');
    expect(html).not.toMatch(/class="x-table-handle"[^>]*disabled/);
    expect(renderToStaticMarkup(<DataTable {...base} />)).not.toContain("x-table-handle");
  });
  it("disables the handles while a sort is active, while loading, or with one row", () => {
    const disabled = (html: string) => html.match(/<button[^>]*class="x-table-handle"[^>]*disabled=""/g)?.length ?? 0;
    expect(disabled(renderToStaticMarkup(<DataTable {...base} reorderable sort={{ key: "name", dir: "asc" }} />))).toBe(2);
    expect(disabled(renderToStaticMarkup(<DataTable {...base} reorderable loading />))).toBe(2);
    expect(disabled(renderToStaticMarkup(<DataTable {...base} rows={[rows[0]]} reorderable />))).toBe(1);
  });
  it("the empty row spans the handle column too", () => {
    expect(renderToStaticMarkup(<DataTable {...base} rows={[]} reorderable selected={new Set()} empty="none" />)).toContain('colSpan="4"');
  });
  it("reorder labels are overridable", () => {
    const html = renderToStaticMarkup(<DataTable {...base} reorderable labels={{ reorderHandle: (n) => `Kéo ${n}`, reorderColumn: "Thứ tự" }} />);
    expect(html).toContain('aria-label="Kéo 1"');
    expect(html).toContain("Thứ tự");
  });
  it("sticky pins a column with data-sticky", () => {
    const cols: DataTableColumn<Row>[] = [...columns, { key: "act", header: "Actions", cell: () => "x", sticky: "end" }];
    const html = renderToStaticMarkup(<DataTable {...base} columns={cols} />);
    expect(html.match(/data-sticky="end"/g)).toHaveLength(3);
  });
  it("without stack there are no explicit roles or data-label", () => {
    const html = renderToStaticMarkup(<DataTable {...base} />);
    expect(html).not.toContain("data-stack");
    expect(html).not.toContain("role=");
    expect(html).not.toContain("data-label");
  });
  it("stack adds data-stack, table roles and a label per cell", () => {
    const cols: DataTableColumn<Row>[] = [...columns, { key: "act", header: <span>Act</span>, label: "Actions", cell: () => "x" }, { key: "x", header: <span>X</span>, cell: () => "y" }];
    const html = renderToStaticMarkup(<DataTable {...base} columns={cols} stack selected={new Set()} onSelectedChange={() => {}} />);
    expect(html).toContain('data-stack=""');
    expect(html).toContain('<table class="x-table" role="table"');
    expect(html.match(/role="rowgroup"/g)).toHaveLength(2);
    expect(html.match(/role="row"/g)).toHaveLength(3);
    expect(html.match(/role="columnheader"/g)).toHaveLength(5);
    expect(html.match(/role="cell"/g)).toHaveLength(10);
    expect(html.match(/data-label="Name"/g)).toHaveLength(2);
    expect(html.match(/data-label="Actions"/g)).toHaveLength(2);
    expect(html.match(/data-label=/g)).toHaveLength(6);
  });
});
