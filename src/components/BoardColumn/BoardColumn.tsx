import { forwardRef, useId, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../internal/cx";
import { Badge } from "../Badge/Badge";
import { IconButton } from "../IconButton/IconButton";

export interface BoardColumnLabels {
  /** Name of the add button, e.g. "Add card". */
  add: string;
}

const DEFAULT_LABELS: BoardColumnLabels = { add: "Add card" };

export interface BoardColumnProps extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
  /** Column name ("In progress"). */
  title: string;
  /** Number of cards, shown as a Badge after the title. */
  count?: number;
  /** Shows a plus IconButton in the head that calls it. Keep it for a column that takes new cards. */
  onAdd?: () => void;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<BoardColumnLabels>;
  /** At most one primary Button or IconButtons at the right of the head. */
  actions?: ReactNode;
  /** `BoardCard`s. */
  children: ReactNode;
  /** A card is being dragged over this column: 1px accent border and a light tint. */
  dropTarget?: boolean;
  /** Names the list of cards. Defaults to the title. */
  "aria-label"?: string;
}

export const BoardColumn = forwardRef<HTMLElement, BoardColumnProps>(function BoardColumn(
  { title, count, onAdd, labels, actions, children, dropTarget = false, "aria-label": ariaLabel, className, ...rest },
  ref,
) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const titleId = `x-board-col-${useId()}`;
  return (
    <section {...rest} ref={ref} className={cx("x-board-col", className)} aria-labelledby={titleId} data-drop-target={dropTarget ? "" : undefined}>
      <header className="x-board-col-head">
        <h3 className="x-board-col-title" id={titleId}>
          {title}
        </h3>
        {count !== undefined ? <Badge>{count}</Badge> : null}
        {onAdd || actions ? (
          <div className="x-board-col-actions">
            {actions}
            {onAdd ? <IconButton icon="plus" size="sm" label={l.add} onClick={onAdd} /> : null}
          </div>
        ) : null}
      </header>
      <div className="x-board-col-body" role="list" aria-label={ariaLabel ?? title}>
        {children}
      </div>
    </section>
  );
});
