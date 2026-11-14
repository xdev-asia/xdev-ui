import { useEffect, useRef, useState, type JSX, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { cx } from "../../internal/cx";
import { Checkbox } from "../Checkbox/Checkbox";
import { Icon } from "../Icon/Icon";
import { Spinner } from "../Spinner/Spinner";
import { nextTableSort } from "./table-helpers";
import { moveItem, reorderKeyStep, reorderSlot, slotToIndex, type ReorderKeyState } from "./table-reorder";

export type TableSortDir = "asc" | "desc";
export interface TableSort {
  key: string;
  dir: TableSortDir;
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
  /** Pin the column to an edge while the table scrolls sideways. "end" keeps a row-actions column reachable on a phone. */
  sticky?: "start" | "end";
  /** Text label of the cell in `stack` mode. Default: `header` when it is a string. */
  label?: string;
}

export interface DataTableLabels {
  selectAll: string;
  selectRow: (rowLabel: string) => string;
  sortedAsc: string;
  sortedDesc: string;
  loading: string;
  /** Visually hidden header of the drag-handle column. */
  reorderColumn: string;
  /** Accessible name of a row's drag handle ("Reorder Ada"). */
  reorderHandle: (rowLabel: string) => string;
  /** Announced when a row is lifted with Space or Enter. */
  lifted: (rowLabel: string) => string;
  /** Announced after each arrow key move; `pos` is 1-based. */
  moved: (pos: number, total: number) => string;
  /** Announced when the row is dropped; `pos` is 1-based. */
  dropped: (pos: number, total: number) => string;
  /** Announced when Escape puts the row back. */
  cancelled: string;
}

const DEFAULT_LABELS: DataTableLabels = {
  selectAll: "Select all rows",
  selectRow: (rowLabel) => `Select ${rowLabel}`,
  sortedAsc: "sorted ascending",
  sortedDesc: "sorted descending",
  loading: "Loading",
  reorderColumn: "Order",
  reorderHandle: (rowLabel) => `Reorder ${rowLabel}`,
  lifted: (rowLabel) => `${rowLabel} lifted. Use the up and down arrow keys to move it, Space to drop it, Escape to cancel.`,
  moved: (pos, total) => `Moved to position ${pos} of ${total}.`,
  dropped: (pos, total) => `Dropped at position ${pos} of ${total}.`,
  cancelled: "Reorder cancelled. The row is back in its place.",
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
  /** Adds a leading drag-handle column. Handles are disabled while `sort` is set or `loading`. */
  reorderable?: boolean;
  /** Called with the row's old and new index in `rows` after a pointer or keyboard drop. */
  onReorder?: (fromIndex: number, toIndex: number) => void;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<DataTableLabels>;
  /** Below a 480px-wide container, show each row as a card of "label: value" lines instead of a sideways-scrolling table. Header cells stay for screen readers; sorting needs its own control there. */
  stack?: boolean;
  className?: string;
}

/** What the reorder wrapper adds to the plain table. */
interface ReorderParts<Row> {
  /** Rows in display order (a lifted row shows at its new place). */
  rows: Row[];
  handle: (row: Row, index: number) => ReactNode;
  rowAttrs: (row: Row, index: number) => Record<string, string | undefined>;
  live: ReactNode;
}

export function DataTable<Row>(props: DataTableProps<Row>): JSX.Element {
  return props.reorderable ? <ReorderableTable<Row> {...props} /> : renderTable(props);
}

function renderTable<Row>({
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
  stack,
  className,
}: DataTableProps<Row>, reorder?: ReorderParts<Row>): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const shown = reorder ? reorder.rows : rows;
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
  const colSpan = columns.length + (selectable ? 1 : 0) + (reorder ? 1 : 0);
  const cellAttrs = (c: DataTableColumn<Row>) => ({
    "data-align": c.align === "end" ? "end" : undefined,
    "data-width": c.width === "min" ? "min" : undefined,
    "data-hide-narrow": c.hideNarrow ? "true" : undefined,
    "data-sticky": c.sticky,
  });
  // A table whose rows or cells are display:block can lose its table role in some browsers; stack mode states the roles.
  const role = (r: string): string | undefined => (stack ? r : undefined);
  const labelOf = (c: DataTableColumn<Row>): string | undefined => (stack ? (c.label ?? (typeof c.header === "string" ? c.header : undefined)) : undefined);
  return (
    <div className={cx("x-table-wrap", className)} aria-busy={loading ? true : undefined} data-loading={loading && rows.length ? "" : undefined} data-stack={stack ? "" : undefined}>
      <table className="x-table" role={role("table")}>
        <caption className="x-sr-only">{caption}</caption>
        <thead role={role("rowgroup")}>
          <tr role={role("row")}>
            {reorder ? (
              <th scope="col" role={role("columnheader")} className="x-table-handle-cell" data-width="min">
                <span className="x-sr-only">{l.reorderColumn}</span>
              </th>
            ) : null}
            {selectable ? (
              <th scope="col" role={role("columnheader")} className="x-table-check" data-width="min">
                <Checkbox aria-label={l.selectAll} checked={all} indeterminate={picked > 0 && !all} onChange={toggleAll} disabled={!rows.length} />
              </th>
            ) : null}
            {columns.map((c) => {
              const dir = sort?.key === c.key ? sort.dir : undefined;
              return (
                <th
                  role={role("columnheader")}
                  key={c.key}
                  scope="col"
                  {...cellAttrs(c)}
                  aria-sort={c.sortable ? (dir === "asc" ? "ascending" : dir === "desc" ? "descending" : "none") : undefined}
                >
                  {c.sortable ? (
                    <button type="button" className="x-table-sort" onClick={() => onSortChange?.(nextTableSort(sort, c.key))}>
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
        <tbody role={role("rowgroup")}>
          {loading && !rows.length ? (
            <tr role={role("row")}>
              <td role={role("cell")} className="x-table-empty" colSpan={colSpan}>
                <Spinner size="md" label={l.loading} />
              </td>
            </tr>
          ) : !rows.length ? (
            <tr role={role("row")}>
              <td role={role("cell")} className="x-table-empty" colSpan={colSpan}>
                {empty}
              </td>
            </tr>
          ) : (
            shown.map((row, index) => {
              const k = rowKey(row);
              const isSel = selectable ? selected.has(k) : undefined;
              return (
                <tr key={k} role={role("row")} aria-selected={isSel ? true : undefined} data-selected={isSel ? "" : undefined} {...reorder?.rowAttrs(row, index)}>
                  {reorder ? (
                    <td role={role("cell")} className="x-table-handle-cell" data-width="min">
                      {reorder.handle(row, index)}
                    </td>
                  ) : null}
                  {selectable ? (
                    <td role={role("cell")} className="x-table-check" data-width="min">
                      <Checkbox aria-label={l.selectRow(rowLabel ? rowLabel(row) : k)} checked={Boolean(isSel)} onChange={() => toggleRow(k)} />
                    </td>
                  ) : null}
                  {columns.map((c) => (
                    <td key={c.key} className={cx(c.mono && "ws-mono")} {...cellAttrs(c)} role={role("cell")} data-label={labelOf(c)}>
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      {reorder?.live}
    </div>
  );
}

function ReorderableTable<Row>(props: DataTableProps<Row>): JSX.Element {
  const { rows, rowKey, rowLabel, sort, loading, onReorder, labels } = props;
  const l = { ...DEFAULT_LABELS, ...labels };
  const [liftState, setLift] = useState<ReorderKeyState>(null);
  const [drag, setDrag] = useState<{ from: number; slot: number } | null>(null);
  const [message, setMessage] = useState("");
  const mids = useRef<number[]>([]);
  const handles = useRef(new Map<string, HTMLButtonElement>());
  const total = rows.length;
  const disabled = Boolean(sort) || Boolean(loading) || total < 2;
  // A lift is dropped silently if the rows change under it.
  const lift = liftState && liftState.from < total && liftState.at < total && !disabled ? liftState : null;
  const shown = lift ? moveItem(rows, lift.from, lift.at) : rows;
  const liftedKey = lift ? rowKey(rows[lift.from]) : null;
  const nameOf = (row: Row): string => (rowLabel ? rowLabel(row) : rowKey(row));

  // Moving a row moves its DOM node, which can drop focus; put it back on the lifted handle.
  useEffect(() => {
    if (liftedKey != null) handles.current.get(liftedKey)?.focus();
  }, [liftedKey, lift?.at]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    const step = reorderKeyStep(lift, e.key, index, total);
    if (!step.handled) return;
    e.preventDefault();
    setLift(step.state);
    const ev = step.event;
    if (!ev) return;
    if (ev.type === "lift") setMessage(l.lifted(nameOf(rows[ev.from])));
    else if (ev.type === "move") setMessage(l.moved(ev.to + 1, total));
    else if (ev.type === "drop") {
      setMessage(l.dropped(ev.to + 1, total));
      if (ev.to !== ev.from) onReorder?.(ev.from, ev.to);
    } else setMessage(l.cancelled);
  };

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>, index: number): void => {
    if (disabled || lift || e.button !== 0) return;
    const body = e.currentTarget.closest("tbody");
    if (!body) return;
    mids.current = Array.from(body.rows).map((r) => {
      const b = r.getBoundingClientRect();
      return b.top + b.height / 2;
    });
    e.currentTarget.setPointerCapture?.(e.pointerId);
    e.preventDefault();
    setDrag({ from: index, slot: index });
  };
  const onPointerMove = (e: PointerEvent<HTMLButtonElement>): void => {
    if (!drag) return;
    const slot = reorderSlot(e.clientY, mids.current);
    if (slot !== drag.slot) setDrag({ from: drag.from, slot });
  };
  const onPointerUp = (): void => {
    if (!drag) return;
    const to = slotToIndex(drag.from, drag.slot);
    setDrag(null);
    if (to === drag.from) return;
    setMessage(l.dropped(to + 1, total));
    onReorder?.(drag.from, to);
  };

  const dragTo = drag ? slotToIndex(drag.from, drag.slot) : null;
  const dropMark = (index: number): string | undefined => {
    if (!drag || dragTo === drag.from) return undefined;
    if (drag.slot < total) return index === drag.slot ? "before" : undefined;
    return index === total - 1 ? "after" : undefined;
  };

  return renderTable(props, {
    rows: shown,
    rowAttrs: (row, index) => ({
      "data-lifted": lift && rowKey(row) === liftedKey ? "" : undefined,
      "data-dragging": drag && index === drag.from ? "" : undefined,
      "data-drop": dropMark(index),
    }),
    handle: (row, index) => {
      const k = rowKey(row);
      return (
        <button
          type="button"
          className="x-table-handle"
          ref={(el) => {
            if (el) handles.current.set(k, el);
            else handles.current.delete(k);
          }}
          aria-label={l.reorderHandle(nameOf(row))}
          disabled={disabled}
          onKeyDown={(e) => onKeyDown(e, index)}
          onBlur={(e) => {
            if (lift && e.relatedTarget) {
              setLift(null);
              setMessage(l.cancelled);
            }
          }}
          onPointerDown={(e) => onPointerDown(e, index)}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => setDrag(null)}
        >
          <Icon name="grip" size={16} />
        </button>
      );
    },
    live: (
      <div className="x-sr-only" role="status" aria-live="polite">
        {message}
      </div>
    ),
  });
}
