import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";
import { Button } from "../Button/Button";
import { Comment } from "../Comment/Comment";

export interface ReviewCommentLabels {
  /** Text of the line reference, e.g. "Line 42". */
  line: (line: number | string) => string;
  /** Heading of the suggestion block. */
  suggestion: string;
  /** Button that resolves the thread. */
  resolve: string;
  /** Button that reopens a resolved thread. */
  reopen: string;
  /** Badge on a resolved thread. */
  resolved: string;
}

const DEFAULT_LABELS: ReviewCommentLabels = {
  line: (line) => `Line ${line}`,
  suggestion: "Suggested change",
  resolve: "Resolve",
  reopen: "Reopen",
  resolved: "Resolved",
};

export interface ReviewCommentProps {
  /** The line the comment is on: a number or a range label ("40-44"). */
  line: number | string;
  /** File path shown before the line reference. */
  file?: string;
  /** Who wrote it. */
  author: string;
  /** The time as text, already formatted. */
  time?: string;
  /** The comment text. Render user text through a sanitizing renderer, never as raw HTML. */
  body: ReactNode;
  /** Replacement code the author proposes. Shown as plain text in a code block. */
  suggestion?: string;
  /** The thread is resolved: faded body and a badge. */
  resolved?: boolean;
  /** Shows a "Resolve" button while the thread is open. */
  onResolve?: () => void;
  /** Shows a "Reopen" button once the thread is resolved. */
  onReopen?: () => void;
  /** Under the suggestion: a reply composer or the like. */
  footer?: ReactNode;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<ReviewCommentLabels>;
  className?: string;
}

export function ReviewComment({ line, file, author, time, body, suggestion, resolved = false, onResolve, onReopen, footer, labels, className }: ReviewCommentProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const toggle = resolved ? onReopen : onResolve;
  const toggleLabel = resolved ? l.reopen : l.resolve;
  const where = file ? `${file} · ${l.line(line)}` : l.line(line);
  return (
    <Comment
      className={cx("x-review-comment", className)}
      author={author}
      time={time}
      state={resolved ? "resolved" : undefined}
      stateLabel={l.resolved}
      location={<span className="x-review-comment-line">{where}</span>}
      actions={
        toggle ? (
          <Button variant="secondary" size="sm" type="button" onClick={toggle}>
            {toggleLabel}
          </Button>
        ) : undefined
      }
      footer={footer}
    >
      {body}
      {suggestion != null ? (
        <figure className="x-review-suggestion">
          <figcaption className="x-review-suggestion-title">{l.suggestion}</figcaption>
          <pre className="x-review-suggestion-code">
            <code>{suggestion}</code>
          </pre>
        </figure>
      ) : null}
    </Comment>
  );
}
