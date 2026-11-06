import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";

export interface BoardProps {
  /** `BoardColumn`s, left to right. */
  children: ReactNode;
  /** Names the board ("Tasks"). */
  "aria-label": string;
  className?: string;
}

export function Board({ children, "aria-label": ariaLabel, className }: BoardProps): JSX.Element {
  return (
    <div className={cx("x-board", className)} role="group" aria-label={ariaLabel}>
      {children}
    </div>
  );
}
