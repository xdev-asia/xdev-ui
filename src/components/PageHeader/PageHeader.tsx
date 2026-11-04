import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";

export interface PageHeaderProps {
  /** The page's h1. */
  title: ReactNode;
  description?: ReactNode;
  /** Facts beside the title: Tag, StatusDot with label. */
  meta?: ReactNode;
  /** Page actions, primary last; wraps under the title below 480px. */
  actions?: ReactNode;
  /** When the shell top bar does not carry the Breadcrumb. */
  breadcrumb?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, meta, actions, breadcrumb, className }: PageHeaderProps): JSX.Element {
  return (
    <header className={cx("x-page-header", className)}>
      {breadcrumb ? <div className="x-page-crumb">{breadcrumb}</div> : null}
      <div className="x-page-row">
        <div className="x-page-heading">
          <div className="x-page-titleline">
            <h1 className="x-page-title">{title}</h1>
            {meta ? <div className="x-page-meta">{meta}</div> : null}
          </div>
          {description ? <p className="x-page-desc">{description}</p> : null}
        </div>
        {actions ? <div className="x-page-actions">{actions}</div> : null}
      </div>
    </header>
  );
}
