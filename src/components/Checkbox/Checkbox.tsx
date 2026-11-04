import { useEffect, useId, useRef, type InputHTMLAttributes, type JSX, type ReactNode } from "react";
import { cx } from "../../internal/cx";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Names the option in its checked state ("Delete the branch too"). Omit only with aria-label. */
  label?: ReactNode;
  /** One short line under the label, linked with aria-describedby. */
  hint?: ReactNode;
  /** Mixed state for a "select all" box over a partial selection. Set through the DOM property, so it never reaches the markup. */
  indeterminate?: boolean;
}

export function Checkbox({ label, hint, indeterminate = false, id, className, disabled, ...rest }: CheckboxProps): JSX.Element {
  const ref = useRef<HTMLInputElement>(null);
  const auto = useId();
  const inputId = id ?? `x-check-${auto}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  const input = <input ref={ref} type="checkbox" id={inputId} aria-describedby={hintId} disabled={disabled} {...rest} />;
  if (!label && !hint) return <span className={cx("ws-tick", className)} data-indeterminate={indeterminate ? "" : undefined}>{input}</span>;
  return (
    <label
      className={cx("ws-tick", className)}
      htmlFor={inputId}
      data-indeterminate={indeterminate ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
    >
      {input}
      <span className="ws-tick-text">
        {label}
        {hint ? (
          <small className="ws-tick-hint" id={hintId}>
            {hint}
          </small>
        ) : null}
      </span>
    </label>
  );
}
