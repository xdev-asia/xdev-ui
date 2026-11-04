import type { ButtonHTMLAttributes, JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";

export interface FilterChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  /** Whether the filter is on; rendered as aria-pressed. */
  pressed: boolean;
  /** Items that match this filter. */
  count?: number;
  children: ReactNode;
}

export function FilterChip({ pressed, count, children, className, ...rest }: FilterChipProps): JSX.Element {
  return (
    <button type="button" className={cx("task-chip", className)} aria-pressed={pressed} {...rest}>
      <span className="task-chip-label">{children}</span>
      {count != null ? <span className="task-chip-count">{count}</span> : null}
    </button>
  );
}
