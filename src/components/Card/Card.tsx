import { useId, type HTMLAttributes, type JSX, type ReactNode } from "react";
import { cx } from "../../internal/cx";

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Heading of the card; also names the section. */
  title?: ReactNode;
  /** A control set right after the title, outside the heading: a mode or filter select that acts on the whole card. */
  titleAside?: ReactNode;
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
  /** Class on the `.x-card-body`, e.g. a grid or gap utility for the content. */
  bodyClassName?: string;
  /** Heading element of the title, to fit the page outline. Default 3 (h3). */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

export function Card({ title, titleAside, subtitle, monoSubtitle = false, actions, flush = false, children, className, bodyClassName, headingLevel = 3, ...rest }: CardProps): JSX.Element {
  const titleId = `x-card-${useId()}`;
  const head = title || subtitle || actions;
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4" | "h5" | "h6";
  return (
    <section {...rest} className={cx("x-card", className)} aria-labelledby={title ? titleId : rest["aria-labelledby"]}>
      {head ? (
        <div className="x-card-head">
          <div className="x-card-heading">
            {title && titleAside ? (
              <div className="x-card-title-row">
                <Heading className="x-card-title" id={titleId}>
                  {title}
                </Heading>
                {titleAside}
              </div>
            ) : title ? (
              <Heading className="x-card-title" id={titleId}>
                {title}
              </Heading>
            ) : null}
            {subtitle ? <p className={cx("x-card-sub", monoSubtitle && "ws-mono")}>{subtitle}</p> : null}
          </div>
          {actions ? <div className="x-card-actions">{actions}</div> : null}
        </div>
      ) : null}
      <div className={cx("x-card-body", bodyClassName)} data-flush={flush ? "" : undefined}>
        {children}
      </div>
    </section>
  );
}
