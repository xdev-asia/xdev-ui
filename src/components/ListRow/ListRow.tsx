import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";

export interface ListRowProps {
  /** Main line: a worktree, agent session, task or account name. */
  title: ReactNode;
  /** Second line in muted text (branch, path, last activity). */
  meta?: ReactNode;
  /** Before the text: an icon, StatusDot or AgentChip. */
  leading?: ReactNode;
  /** After the text and outside the main button: badges or IconButtons. */
  trailing?: ReactNode;
  /** Marks the current row with a tint and a 1px accent border, plus aria-current. */
  selected?: boolean;
  disabled?: boolean;
  /** Makes the main area a button. Without it the row is static. */
  onClick?: () => void;
  /** Root element. Use "li" inside a ul/ol. Default "div". */
  as?: "div" | "li";
  className?: string;
}

export function ListRow({
  title,
  meta,
  leading,
  trailing,
  selected = false,
  disabled = false,
  onClick,
  as: Root = "div",
  className,
}: ListRowProps): JSX.Element {
  const body = (
    <>
      {leading ? <span className="x-list-row-lead">{leading}</span> : null}
      <span className="x-list-row-text">
        <span className="x-list-row-title">{title}</span>
        {meta ? <span className="x-list-row-meta">{meta}</span> : null}
      </span>
    </>
  );
  return (
    <Root
      className={cx("x-list-row", className)}
      data-selected={selected ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
    >
      {onClick ? (
        <button type="button" className="x-list-row-main" aria-current={selected ? "true" : undefined} disabled={disabled} onClick={onClick}>
          {body}
        </button>
      ) : (
        <div className="x-list-row-main" aria-current={selected ? "true" : undefined}>
          {body}
        </div>
      )}
      {trailing ? <span className="x-list-row-trail">{trailing}</span> : null}
    </Root>
  );
}
