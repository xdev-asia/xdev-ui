import { useId, type JSX, type ReactNode } from "react";
import { cx } from "../../internal/cx";

export interface FormSectionProps {
  /** Section heading (h2). */
  title?: ReactNode;
  description?: ReactNode;
  /** 2 = two columns when the section is wider than 480px; always one below. Default 1. */
  columns?: 1 | 2;
  /** Save / Cancel, end-aligned, primary last. */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function FormSection({ title, description, columns = 1, actions, children, className }: FormSectionProps): JSX.Element {
  const titleId = `x-form-section-${useId()}`;
  return (
    <section className={cx("x-form-section", className)} aria-labelledby={title ? titleId : undefined}>
      {title || description ? (
        <div className="x-form-section-head">
          {title ? (
            <h2 className="x-form-section-title" id={titleId}>
              {title}
            </h2>
          ) : null}
          {description ? <p className="x-form-section-desc">{description}</p> : null}
        </div>
      ) : null}
      <div className="x-form-section-fields" data-columns={columns}>
        {children}
      </div>
      {actions ? <div className="x-form-section-actions">{actions}</div> : null}
    </section>
  );
}
