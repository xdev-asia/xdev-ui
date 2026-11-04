import type { TableSort } from "./DataTable";

/** Click on a sortable header: a new column starts asc; the same column goes asc, desc, off (null). */
export function nextSort(current: TableSort | null | undefined, key: string): TableSort | null {
  if (!current || current.key !== key) return { key, dir: "asc" };
  return current.dir === "asc" ? { key, dir: "desc" } : null;
}

function compare(a: string | number, b: string | number): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

/** Returns a sorted copy. Stable: equal rows keep their order in both directions. */
export function sortRows<Row>(rows: Row[], sort: TableSort | null | undefined, value: (row: Row, key: string) => string | number): Row[] {
  if (!sort) return [...rows];
  const sign = sort.dir === "asc" ? 1 : -1;
  return rows
    .map((row, index) => ({ row, index, v: value(row, sort.key) }))
    .sort((a, b) => sign * compare(a.v, b.v) || a.index - b.index)
    .map((x) => x.row);
}

/** Rows of a 1-based page. The page is clamped into range; a page size below 1 counts as 1. */
export function pageSlice<Row>(rows: Row[], page: number, pageSize: number): Row[] {
  const size = Math.max(1, Math.floor(pageSize));
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const p = Math.min(Math.max(1, Math.floor(page)), pages);
  return rows.slice((p - 1) * size, p * size);
}
