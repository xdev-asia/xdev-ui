import type { JSX, KeyboardEvent, ReactNode } from "react";
import { cx } from "../../internal/cx";
import { StatusDot } from "../StatusDot/StatusDot";

export type BoardCardStatus = "idle" | "running" | "waiting" | "error";

export interface BoardCardLabels {
  /** Text read after the title for each status; the dot alone says nothing to a screen reader. */
  status: Record<BoardCardStatus, string>;
}

const DEFAULT_LABELS: BoardCardLabels = { status: { idle: "Idle", running: "Running", waiting: "Waiting", error: "Error" } };

const DOT = { idle: "idle", running: "working", waiting: "waiting", error: "failed" } as const;

export interface BoardCardProps {
  title: string;
  /** Muted line under the title (assignee, date). */
  meta?: ReactNode;
  /** `Tag`s, one row. */
  tags?: ReactNode;
  /** Draws a StatusDot before the title. Omit when the card has no process. */
  status?: BoardCardStatus;
  /** Tint and 1px accent border. */
  selected?: boolean;
  /** Lowered opacity and an elevation shadow while the card is dragged. */
  dragging?: boolean;
  /** Called on click and on Enter. */
  onOpen?: () => void;
  /** An IconButton that opens a Menu. Its clicks and keys do not reach `onOpen`. */
  menu?: ReactNode;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<BoardCardLabels>;
  className?: string;
}

export function BoardCard({ title, meta, tags, status, selected = false, dragging = false, onOpen, menu, labels, className }: BoardCardProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const onKeyDown = (e: KeyboardEvent<HTMLElement>): void => {
    if (e.key === "Enter" && e.target === e.currentTarget) onOpen?.();
  };
  return (
    <div
      className={cx("x-board-card", className)}
      role="listitem"
      tabIndex={0}
      aria-current={selected ? "true" : undefined}
      data-selected={selected ? "" : undefined}
      data-dragging={dragging ? "" : undefined}
      onClick={onOpen}
      onKeyDown={onKeyDown}
    >
      <div className="x-board-card-head">
        {status ? <StatusDot state={DOT[status]} /> : null}
        <span className="x-board-card-title">{title}</span>
        {status ? <span className="x-sr-only">{l.status[status]}</span> : null}
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
}
