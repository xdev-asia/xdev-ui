import type { JSX, KeyboardEvent, ReactNode } from "react";
import { cx } from "../../internal/cx";
import { rovingIndex } from "../../internal/keys";

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
  /** IconButtons or Buttons, grouped as role=toolbar. Arrow keys move focus between them. */
  actions?: ReactNode;
  /** "head" is the small uppercase pane head; "bulk" is the tinted bar shown while rows are selected. Default "head". */
  variant?: "head" | "bulk";
  /** aria-label of the actions group. Defaults to a string `title`, then `labels.actions`. */
  label?: string;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<ToolbarLabels>;
  className?: string;
}

const FOCUSABLE = "button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex='-1'])";

export function Toolbar({ title, count, actions, variant = "head", label, labels, className }: ToolbarProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const name = label ?? (typeof title === "string" ? title : l.actions);
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE));
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (index < 0) return;
    const next = rovingIndex(e.key, index, items.length);
    if (next == null) return;
    e.preventDefault();
    items[next].focus();
  };
  return (
    <div className={cx("pane-head", variant === "bulk" && "ws-bulk-bar", className)} data-variant={variant}>
      <span className="pane-title">
        {title}
        {count != null ? <span className="pane-count">{count}</span> : null}
      </span>
      {actions ? (
        <div className="pane-tools" role="toolbar" aria-label={name} onKeyDown={onKeyDown}>
          {actions}
        </div>
      ) : null}
    </div>
  );
}
