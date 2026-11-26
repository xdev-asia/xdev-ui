import { useId, type HTMLAttributes, type JSX, type ReactNode } from "react";
import { cx } from "../../internal/cx";

export interface FormSectionProps extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
  /** Section heading (h2). */
  title?: ReactNode;
  description?: ReactNode;
  /** 2 = two columns when the fields are wider than 480px; always one below. Default 1. */
  columns?: 1 | 2;
  /**
   * "stacked" (default): heading above the fields, all in one framed box.
   * "aside": heading and description in a left column, the fields in a framed box on the right, once the section is
   * at least 720px wide; stacked below that. For settings pages, where full-width fields leave most of the row empty.
   */
  layout?: "stacked" | "aside";
  /** Buttons for the whole section (an "Add" or "Open" link), under the description. Save and Cancel go in `actions`. */
  headActions?: ReactNode;
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

export function FormSection({
  title,
  description,
  columns = 1,
  layout = "stacked",
  headActions,
  actions,
  disabled,
  children,
  className,
  ...rest
}: FormSectionProps): JSX.Element {
  const titleId = `x-form-section-${useId()}`;
  const head =
    title || description || headActions ? (
      <div className="x-form-section-head">
        {title ? (
          <h2 className="x-form-section-title" id={titleId}>
            {title}
          </h2>
        ) : null}
        {description ? <p className="x-form-section-desc">{description}</p> : null}
        {headActions ? <div className="x-form-section-head-actions">{headActions}</div> : null}
      </div>
    ) : null;
  const body = (
    <>
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
    </>
  );
  return (
    <section
      {...rest}
      className={cx("x-form-section", className)}
      data-layout={layout === "aside" ? "aside" : undefined}
      data-disabled={disabled ? "" : undefined}
      aria-labelledby={title ? titleId : undefined}
    >
      {layout === "aside" ? (
        <div className="x-form-section-grid">
          {head}
          <div className="x-form-section-body">{body}</div>
        </div>
      ) : (
        <>
          {head}
          {body}
        </>
      )}
    </section>
  );
}
