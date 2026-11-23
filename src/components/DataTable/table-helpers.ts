import type { TableSort } from "./DataTable";

/** Click on a sortable header: a new column starts asc; the same column goes asc, desc, off (null). */
export function nextTableSort(current: TableSort | null | undefined, key: string): TableSort | null {
  if (!current || current.key !== key) return { key, dir: "asc" };
  return current.dir === "asc" ? { key, dir: "desc" } : null;
}

function compare(a: string | number, b: string | number): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

/** Returns a sorted copy. Stable: equal rows keep their order in both directions. */
export function sortTableRows<Row>(rows: Row[], sort: TableSort | null | undefined, value: (row: Row, key: string) => string | number): Row[] {
  if (!sort) return [...rows];
  const sign = sort.dir === "asc" ? 1 : -1;
  return rows
    .map((row, index) => ({ row, index, v: value(row, sort.key) }))
    .sort((a, b) => sign * compare(a.v, b.v) || a.index - b.index)
    .map((x) => x.row);
}

/** Rows of a 1-based page. The page is clamped into range; a page size below 1 counts as 1. */
export function paginateRows<Row>(rows: Row[], page: number, pageSize: number): Row[] {
  const size = Math.max(1, Math.floor(pageSize));
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const p = Math.min(Math.max(1, Math.floor(page)), pages);
  return rows.slice((p - 1) * size, p * size);
}

/**
 * `TableSort` as the `field:dir` text a URL or an API takes (`sort=name:asc`); null for no sort.
 */
export function tableSortToParam(sort: TableSort | null | undefined): string | null {
  return sort ? `${sort.key}:${sort.dir}` : null;
}

/**
 * Reads `field:dir` (or a bare `field`, read as `asc`) back into a `TableSort`. Empty, malformed or a key not in
 * `allowed` (when given) gives null, so a hand-edited URL cannot sort by an unknown column.
 */
export function tableSortFromParam(param: string | null | undefined, allowed?: readonly string[]): TableSort | null {
  const m = /^([A-Za-z0-9_.-]+)(?::(asc|desc))?$/.exec((param ?? "").trim());
  if (!m) return null;
  const key = m[1];
  if (key === undefined) return null;
  if (allowed && !allowed.includes(key)) return null;
  return { key, dir: (m[2] as TableSort["dir"] | undefined) ?? "asc" };
}
