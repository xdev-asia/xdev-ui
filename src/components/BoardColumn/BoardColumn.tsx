import { useId, type JSX, type ReactNode } from "react";
import { cx } from "../../internal/cx";
import { Badge } from "../Badge/Badge";

export interface BoardColumnProps {
  /** Column name ("In progress"). */
  title: string;
  /** Number of cards, shown as a Badge after the title. */
  count?: number;
  /** At most one primary Button or IconButtons at the right of the head. */
  actions?: ReactNode;
  /** `BoardCard`s. */
  children: ReactNode;
  /** A card is being dragged over this column: 1px accent border and a light tint. */
  dropTarget?: boolean;
  /** Names the list of cards. Defaults to the title. */
  "aria-label"?: string;
  className?: string;
}

export function BoardColumn({ title, count, actions, children, dropTarget = false, "aria-label": ariaLabel, className }: BoardColumnProps): JSX.Element {
  const titleId = `x-board-col-${useId()}`;
  return (
    <section className={cx("x-board-col", className)} aria-labelledby={titleId} data-drop-target={dropTarget ? "" : undefined}>
      <header className="x-board-col-head">
        <h3 className="x-board-col-title" id={titleId}>
          {title}
        </h3>
        {count !== undefined ? <Badge>{count}</Badge> : null}
        {actions ? <div className="x-board-col-actions">{actions}</div> : null}
      </header>
      <div className="x-board-col-body" role="list" aria-label={ariaLabel ?? title}>
        {children}
      </div>
    </section>
  );
}
