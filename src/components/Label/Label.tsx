import type { JSX, LabelHTMLAttributes, Ref } from "react";
import { cx } from "../../internal/cx";

export interface LabelLabels {
  /** Read after the label text when `required` is set; the visible marker is an asterisk. */
  required: string;
}

const DEFAULT_LABELS: LabelLabels = { required: "required" };

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Id of the control this label names. */
  htmlFor: string;
  /** Shows a required marker, read out as `labels.required`. */
  required?: boolean;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<LabelLabels>;
  ref?: Ref<HTMLLabelElement>;
}

export function Label({ required, labels, className, children, ...rest }: LabelProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  return (
    <label className={cx("x-label", className)} {...rest}>
      {children}
      {required ? (
        <span className="x-label-required">
          <span aria-hidden="true">*</span>
          <span className="x-sr-only"> {l.required}</span>
        </span>
      ) : null}
    </label>
  );
}
