import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";
import type { IconName } from "../../icons";
import { Icon } from "../Icon/Icon";

export interface EmptyStateProps {
  /** Icon in a soft tile; shown only for size "center". */
  icon?: IconName;
  /** What is missing, as a statement ("No worktrees yet"). */
  title: ReactNode;
  /** One line on how to fill it. */
  hint?: ReactNode;
  /** One primary action, maybe one secondary. */
  actions?: ReactNode;
  /** "inline" for a short muted line inside a pane; "center" for a whole empty view. Default "inline". */
  size?: "inline" | "center";
  className?: string;
}

export function EmptyState({ icon, title, hint, actions, size = "inline", className }: EmptyStateProps): JSX.Element {
  return (
    <div className={cx("x-empty", className)} data-size={size}>
      {icon && size === "center" ? (
        <span className="x-empty-icon">
          <Icon name={icon} size={20} />
        </span>
      ) : null}
      <p className="x-empty-title">{title}</p>
      {hint ? <p className="x-empty-hint">{hint}</p> : null}
      {actions ? <div className="x-empty-actions">{actions}</div> : null}
    </div>
  );
}
