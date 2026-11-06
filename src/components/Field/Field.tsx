import { useId, type InputHTMLAttributes, type JSX, type ReactNode, type Ref } from "react";
import { cx } from "../../internal/cx";

export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  hint?: ReactNode;
  /** When set, replaces the hint and marks the field invalid. */
  error?: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

export function Field({ label, hint, error, id, className, ...rest }: FieldProps): JSX.Element {
  const auto = useId();
  const inputId = id ?? `x-field-${auto}`;
  const note = error ?? hint;
  const hintId = note ? `${inputId}-hint` : undefined;
  return (
    <div className={cx("ws-field", className)} data-invalid={error ? "" : undefined}>
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} aria-describedby={hintId} aria-invalid={error ? true : undefined} {...rest} />
      {note ? <small id={hintId}>{note}</small> : null}
    </div>
  );
}
