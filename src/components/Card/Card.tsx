import { useId, type JSX, type ReactNode } from "react";
import { cx } from "../../internal/cx";

export interface CardProps {
  /** Heading of the card; also names the section. */
  title?: ReactNode;
  /** Line under the title (a path, branch or count). */
  subtitle?: ReactNode;
  /** Set the subtitle in the mono face. */
  monoSubtitle?: boolean;
  /** Buttons at the right of the head. */
  actions?: ReactNode;
  /** Drops the body padding, for a diff or list that runs edge to edge. */
  flush?: boolean;
  children?: ReactNode;
  className?: string;
}

export function Card({ title, subtitle, monoSubtitle = false, actions, flush = false, children, className }: CardProps): JSX.Element {
  const titleId = `x-card-${useId()}`;
  const head = title || subtitle || actions;
  return (
    <section className={cx("x-card", className)} aria-labelledby={title ? titleId : undefined}>
      {head ? (
        <div className="x-card-head">
          <div className="x-card-heading">
            {title ? (
              <h3 className="x-card-title" id={titleId}>
                {title}
              </h3>
            ) : null}
            {subtitle ? <p className={cx("x-card-sub", monoSubtitle && "ws-mono")}>{subtitle}</p> : null}
          </div>
          {actions ? <div className="x-card-actions">{actions}</div> : null}
        </div>
      ) : null}
      <div className="x-card-body" data-flush={flush ? "" : undefined}>
        {children}
      </div>
    </section>
  );
}
