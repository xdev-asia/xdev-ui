import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";
import { rovingFocus, rovingKeyDown, rovingRef } from "../../internal/roving";

export interface ToolbarLabels {
  /** aria-label of the actions group when there is no string title or `label`. */
  actions: string;
}

const DEFAULT_LABELS: ToolbarLabels = { actions: "Actions" };

export interface ToolbarProps {
  /** Pane name ("Changes") or, for "bulk", the selection summary ("3 selected"). */
  title?: ReactNode;
  /** Number shown after the title. */
  count?: number;
  /** IconButtons or Buttons, grouped as role=toolbar. One Tab stop: arrow keys, Home and End move focus between them. */
  actions?: ReactNode;
  /** "head" is the small uppercase pane head; "bulk" is the tinted bar shown while rows are selected. Default "head". */
  variant?: "head" | "bulk";
  /** aria-label of the actions group. Defaults to a string `title`, then `labels.actions`. */
  label?: string;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<ToolbarLabels>;
  className?: string;
}

export function Toolbar({ title, count, actions, variant = "head", label, labels, className }: ToolbarProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const name = label ?? (typeof title === "string" ? title : l.actions);
  return (
    <div className={cx("pane-head", variant === "bulk" && "ws-bulk-bar", className)} data-variant={variant}>
      <span className="pane-title">
        {title}
        {count != null ? <span className="pane-count">{count}</span> : null}
      </span>
      {actions ? (
        <div className="pane-tools" role="toolbar" aria-label={name} ref={rovingRef} onFocus={rovingFocus} onKeyDown={rovingKeyDown}>
          {actions}
        </div>
      ) : null}
    </div>
  );
}
