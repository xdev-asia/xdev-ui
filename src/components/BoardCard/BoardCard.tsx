import { forwardRef, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { cx } from "../../internal/cx";
import { StatusDot } from "../StatusDot/StatusDot";

export type BoardCardStatus = "idle" | "running" | "waiting" | "error";

export interface BoardCardLabels {
  /** Text read after the title when `tone="need"`; the tint alone says nothing to a screen reader. */
  need: string;
  /** Text read after the title for each status; the dot alone says nothing to a screen reader. */
  status: Record<BoardCardStatus, string>;
}

const DEFAULT_LABELS: BoardCardLabels = { need: "Needs you", status: { idle: "Idle", running: "Running", waiting: "Waiting", error: "Error" } };

const DOT = { idle: "idle", running: "working", waiting: "waiting", error: "failed" } as const;

export interface BoardCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "role" | "children"> {
  title: string;
  /** Muted line under the title (assignee, date). */
  meta?: ReactNode;
  /** `Tag`s, one row. */
  tags?: ReactNode;
  /** Draws a StatusDot before the title. Omit when the card has no process. */
  status?: BoardCardStatus;
  /** Tint and 1px accent border. */
  selected?: boolean;
  /** `"need"` tints the card with the warning colour and a 1px warning border: the card waits for a person. Pair it with `status="waiting"`. */
  tone?: "need";
  /** Lowered opacity and an elevation shadow while the card is dragged. */
  dragging?: boolean;
  /** Called on click and on Enter. */
  onOpen?: () => void;
  /** An IconButton that opens a Menu. Its clicks and keys do not reach `onOpen`. */
  menu?: ReactNode;
  /** Inline controls after the title (a count, a small button). Clicks and keys inside do not reach `onOpen`. */
  actions?: ReactNode;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<BoardCardLabels>;
}

export const BoardCard = forwardRef<HTMLDivElement, BoardCardProps>(function BoardCard(
  { title, meta, tags, status, tone, selected = false, dragging = false, onOpen, menu, actions, labels, className, onClick, onKeyDown, ...rest },
  ref,
) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    onKeyDown?.(e);
    if (e.key === "Enter" && e.target === e.currentTarget) onOpen?.();
  };
  const handleClick = (e: MouseEvent<HTMLDivElement>): void => {
    onClick?.(e);
    onOpen?.();
  };
  return (
    <div
      {...rest}
      ref={ref}
      className={cx("x-board-card", className)}
      role="listitem"
      tabIndex={0}
      aria-current={selected ? "true" : undefined}
      data-tone={tone}
      data-selected={selected ? "" : undefined}
      data-dragging={dragging ? "" : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="x-board-card-head">
        {status ? <StatusDot state={DOT[status]} /> : null}
        <span className="x-board-card-title">{title}</span>
        {actions ? (
          <span className="x-board-card-actions" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            {actions}
          </span>
        ) : null}
        {status ? <span className="x-sr-only">{l.status[status]}</span> : null}
        {tone === "need" ? <span className="x-sr-only">{l.need}</span> : null}
        {menu ? (
          <span className="x-board-card-menu" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            {menu}
          </span>
        ) : null}
      </div>
      {meta ? <div className="x-board-card-meta">{meta}</div> : null}
      {tags ? <div className="x-board-card-tags">{tags}</div> : null}
    </div>
  );
});
