import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";
import { Button } from "../Button/Button";

export interface BulkBarLabels {
  /** aria-label of the region. */
  region: string;
  /** Selection summary ("3 selected"). */
  selected: (count: number) => string;
  /** Button that empties the selection. */
  clear: string;
}

const DEFAULT_LABELS: BulkBarLabels = {
  region: "Bulk actions",
  selected: (n) => `${n} selected`,
  clear: "Clear selection",
};

export interface BulkBarProps {
  /** Number of selected items. The bar renders nothing at 0. */
  count: number;
  /** Empties the selection. */
  onClear: () => void;
  /** Actions on the selection: secondary Buttons, at most four. */
  children?: ReactNode;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<BulkBarLabels>;
  className?: string;
}

export function BulkBar({ count, onClear, children, labels, className }: BulkBarProps): JSX.Element | null {
  if (!(count > 0)) return null;
  const l = { ...DEFAULT_LABELS, ...labels };
  return (
    <div className={cx("x-bulk-bar", className)} role="region" aria-label={l.region}>
      <span className="x-bulk-count" aria-live="polite">
        {l.selected(count)}
      </span>
      {children ? <div className="x-bulk-actions">{children}</div> : null}
      <Button variant="secondary" icon="close" className="x-bulk-clear" onClick={onClear}>
        {l.clear}
      </Button>
    </div>
  );
}
