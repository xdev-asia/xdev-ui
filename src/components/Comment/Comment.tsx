import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";
import { Avatar } from "../Avatar/Avatar";
import { Tag } from "../Tag/Tag";

export interface CommentProps {
  /** Who wrote it. Gives the avatar initials. */
  author: string;
  /** The time as text, already formatted ("2h ago"). */
  time?: string;
  /** The author is an automation. Shows `botLabel` when that is given. */
  bot?: boolean;
  /** Text of the bot badge. */
  botLabel?: string;
  /** Tints the comment: a resolved or an outdated review thread. Shows `stateLabel` when that is given. */
  state?: "resolved" | "outdated";
  /** Text of the state badge. */
  stateLabel?: string;
  /** Under the header: a file and line label or a link. */
  location?: ReactNode;
  /** In the header, after the time: IconButtons or a Menu trigger. */
  actions?: ReactNode;
  /** Under the body: a ReactionBar or a reply composer. */
  footer?: ReactNode;
  className?: string;
  /** The body. Render user text through a sanitizing renderer, never as raw HTML. */
  children: ReactNode;
}

export function Comment({
  author,
  time,
  bot = false,
  botLabel,
  state,
  stateLabel,
  location,
  actions,
  footer,
  className,
  children,
}: CommentProps): JSX.Element {
  return (
    <article className={cx("x-comment", className)} data-state={state} data-bot={bot ? "" : undefined}>
      <header className="x-comment-head">
        <Avatar name={author} size="sm" />
        <span className="x-comment-author">{author}</span>
        {bot && botLabel ? <Tag>{botLabel}</Tag> : null}
        {state && stateLabel ? <Tag>{stateLabel}</Tag> : null}
        {time ? <span className="x-comment-time">{time}</span> : null}
        {actions ? <span className="x-comment-actions">{actions}</span> : null}
      </header>
      {location ? <div className="x-comment-location">{location}</div> : null}
      <div className="x-comment-body">{children}</div>
      {footer ? <footer className="x-comment-foot">{footer}</footer> : null}
    </article>
  );
}
