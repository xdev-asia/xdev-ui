import type { JSX } from "react";
import { cx } from "../../internal/cx";
import { IconButton } from "../IconButton/IconButton";
import { Select } from "../Select/Select";

export interface PaginationLabels {
  /** aria-label of the nav. */
  nav: string;
  previous: string;
  next: string;
  range: (from: number, to: number, total: number) => string;
  /** aria-label of the page-size select. */
  pageSize: string;
  /** Range text when the total is unknown (cursor paging). */
  page: (page: number) => string;
}

const DEFAULT_LABELS: PaginationLabels = {
  nav: "Pagination",
  previous: "Previous page",
  next: "Next page",
  range: (from, to, total) => `${from}–${to} of ${total}`,
  pageSize: "Rows per page",
  page: (page) => `Page ${page}`,
};

export interface PaginationProps {
  /** 1-based. */
  page: number;
  pageSize: number;
  /** Number of rows in all pages. Leave it out for cursor paging, where only "is there a next page" is known: then pass `hasNext`. */
  total?: number;
  /** Cursor paging (no `total`): whether a next page exists. */
  hasNext?: boolean;
  onPageChange: (page: number) => void;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<PaginationLabels>;
  className?: string;
}

export function Pagination({ page, pageSize, total, hasNext = false, onPageChange, pageSizeOptions, onPageSizeChange, labels, className }: PaginationProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const known = total != null;
  const pages = known ? Math.max(1, Math.ceil(total / Math.max(1, pageSize))) : Infinity;
  const from = !known || total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = known ? Math.min(total, page * pageSize) : 0;
  return (
    <nav className={cx("x-pagination", className)} aria-label={l.nav}>
      {pageSizeOptions?.length ? (
        <Select
          aria-label={l.pageSize}
          value={String(pageSize)}
          onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
          options={pageSizeOptions.map((n) => ({ value: String(n), label: String(n) }))}
        />
      ) : null}
      <span className="x-pagination-range" aria-live="polite">
        {known ? l.range(from, to, total) : l.page(page)}
      </span>
      <span className="x-pagination-step">
        <IconButton icon="chevron-left" label={l.previous} disabled={page <= 1} onClick={() => onPageChange(page - 1)} />
        <IconButton icon="chevron-right" label={l.next} disabled={known ? page >= pages : !hasNext} onClick={() => onPageChange(page + 1)} />
      </span>
    </nav>
  );
}
