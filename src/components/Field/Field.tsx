import { useId, type InputHTMLAttributes, type JSX, type ReactNode } from "react";
import { cx } from "../../internal/cx";

export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  hint?: ReactNode;
  /** When set, replaces the hint and marks the field invalid. */
  error?: ReactNode;
}

export function Field({ label, hint, error, id, className, ...rest }: FieldProps): JSX.Element {
  const auto = useId();
  const inputId = id ?? `x-field-${auto}`;
  const note = error ?? hint;
  const hintId = note ? `${inputId}-hint` : undefined;
  return (
    <label className={cx("ws-field", className)} htmlFor={inputId} data-invalid={error ? "" : undefined}>
      {label}
      <input id={inputId} aria-describedby={hintId} aria-invalid={error ? true : undefined} {...rest} />
      {note ? <small id={hintId}>{note}</small> : null}
    </label>
  );
}
