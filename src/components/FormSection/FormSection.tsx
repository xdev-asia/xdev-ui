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
  /**
   * Read-only view (a role that may see but not change): the fields render inside a native `<fieldset disabled>`, so
   * every input, select, checkbox and button in them is disabled at once and leaves the tab order. Say why in a
   * `Banner` above. `actions` are left out.
   */
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormSection({ title, description, columns = 1, actions, disabled, children, className }: FormSectionProps): JSX.Element {
  const titleId = `x-form-section-${useId()}`;
  return (
    <section className={cx("x-form-section", className)} data-disabled={disabled ? "" : undefined} aria-labelledby={title ? titleId : undefined}>
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
      {disabled ? (
        <fieldset className="x-form-section-fields" data-columns={columns} disabled>
          {children}
        </fieldset>
      ) : (
        <div className="x-form-section-fields" data-columns={columns}>
          {children}
        </div>
      )}
      {actions && !disabled ? <div className="x-form-section-actions">{actions}</div> : null}
    </section>
  );
}
