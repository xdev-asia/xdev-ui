import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";
import { Checkbox } from "../Checkbox/Checkbox";
import { Icon } from "../Icon/Icon";
import { Spinner } from "../Spinner/Spinner";
import { nextSort } from "./table-helpers";

export type SortDir = "asc" | "desc";
export interface TableSort {
  key: string;
  dir: SortDir;
}

export interface DataTableColumn<Row> {
  key: string;
  header: ReactNode;
  cell: (row: Row) => ReactNode;
  sortable?: boolean;
  align?: "start" | "end";
  /** Set the cell in the mono face. */
  mono?: boolean;
  /** Dropped when the table container is narrower than 480px. */
  hideNarrow?: boolean;
  /** "min" shrinks to content (checkbox, row actions). Default "auto". */
  width?: "auto" | "min";
}

export interface DataTableLabels {
  selectAll: string;
  selectRow: (rowLabel: string) => string;
  sortedAsc: string;
  sortedDesc: string;
  loading: string;
}

const DEFAULT_LABELS: DataTableLabels = {
  selectAll: "Select all rows",
  selectRow: (rowLabel) => `Select ${rowLabel}`,
  sortedAsc: "sorted ascending",
  sortedDesc: "sorted descending",
  loading: "Loading",
};

export interface DataTableProps<Row> {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  /** Visually hidden <caption>; names the table. */
  caption: string;
  /** Accessible name of a row for its select checkbox. Default: the row key. */
  rowLabel?: (row: Row) => string;
  sort?: TableSort | null;
  onSortChange?: (sort: TableSort | null) => void;
  /** Turns on the checkbox column. */
  selected?: ReadonlySet<string>;
  onSelectedChange?: (next: Set<string>) => void;
  loading?: boolean;
  /** Shown in place of the body when rows is empty and not loading (an EmptyState). */
  empty?: ReactNode;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<DataTableLabels>;
  className?: string;
}

export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  caption,
  rowLabel,
  sort,
  onSortChange,
  selected,
  onSelectedChange,
  loading,
  empty,
  labels,
  className,
}: DataTableProps<Row>): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const selectable = selected !== undefined;
  const keys = rows.map(rowKey);
  const picked = keys.filter((k) => selected?.has(k)).length;
  const all = keys.length > 0 && picked === keys.length;
  const toggleAll = (): void => {
    const next = new Set(selected);
    for (const k of keys) {
      if (all) next.delete(k);
      else next.add(k);
    }
    onSelectedChange?.(next);
  };
  const toggleRow = (k: string): void => {
    const next = new Set(selected);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    onSelectedChange?.(next);
  };
  const colSpan = columns.length + (selectable ? 1 : 0);
  const cellAttrs = (c: DataTableColumn<Row>) => ({
    "data-align": c.align === "end" ? "end" : undefined,
    "data-width": c.width === "min" ? "min" : undefined,
    "data-hide-narrow": c.hideNarrow ? "true" : undefined,
  });
  return (
    <div className={cx("x-table-wrap", className)} aria-busy={loading ? true : undefined} data-loading={loading && rows.length ? "" : undefined}>
      <table className="x-table">
        <caption className="x-sr-only">{caption}</caption>
        <thead>
          <tr>
            {selectable ? (
              <th scope="col" className="x-table-check" data-width="min">
                <Checkbox aria-label={l.selectAll} checked={all} indeterminate={picked > 0 && !all} onChange={toggleAll} disabled={!rows.length} />
              </th>
            ) : null}
            {columns.map((c) => {
              const dir = sort?.key === c.key ? sort.dir : undefined;
              return (
                <th
                  key={c.key}
                  scope="col"
                  {...cellAttrs(c)}
                  aria-sort={c.sortable ? (dir === "asc" ? "ascending" : dir === "desc" ? "descending" : "none") : undefined}
                >
                  {c.sortable ? (
                    <button type="button" className="x-table-sort" onClick={() => onSortChange?.(nextSort(sort, c.key))}>
                      {c.header}
                      {dir ? <Icon name={dir === "asc" ? "arrow-up" : "arrow-down"} size={12} /> : null}
                      {dir ? <span className="x-sr-only">{dir === "asc" ? l.sortedAsc : l.sortedDesc}</span> : null}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading && !rows.length ? (
            <tr>
              <td className="x-table-empty" colSpan={colSpan}>
                <Spinner size="md" label={l.loading} />
              </td>
            </tr>
          ) : !rows.length ? (
            <tr>
              <td className="x-table-empty" colSpan={colSpan}>
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const k = rowKey(row);
              const isSel = selectable ? selected.has(k) : undefined;
              return (
                <tr key={k} aria-selected={isSel ? true : undefined} data-selected={isSel ? "" : undefined}>
                  {selectable ? (
                    <td className="x-table-check" data-width="min">
                      <Checkbox aria-label={l.selectRow(rowLabel ? rowLabel(row) : k)} checked={Boolean(isSel)} onChange={() => toggleRow(k)} />
                    </td>
                  ) : null}
                  {columns.map((c) => (
                    <td key={c.key} className={cx(c.mono && "ws-mono")} {...cellAttrs(c)}>
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
