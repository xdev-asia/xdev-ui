import { useId, useState, type JSX, type ReactNode } from "react";
import { cx } from "../../internal/cx";

export interface RadioOption {
  value: string;
  label: ReactNode;
  /** One short line under the label. */
  hint?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Shared `name` of the native radios. */
  name: string;
  options: RadioOption[];
  /** Controlled value. */
  value?: string;
  /** Uncontrolled starting value. */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Default "horizontal" (one line, like the terminal picker); "vertical" stacks options with hints. */
  orientation?: "horizontal" | "vertical";
  /** Visible group label; also names the radiogroup. Omit only with aria-label. */
  label?: ReactNode;
  "aria-label"?: string;
  /** Disables every option. */
  disabled?: boolean;
  className?: string;
}

export function RadioGroup({
  name,
  options,
  value,
  defaultValue,
  onChange,
  orientation = "horizontal",
  label,
  "aria-label": ariaLabel,
  disabled,
  className,
}: RadioGroupProps): JSX.Element {
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
  const base = `x-radio-${useId()}`;
  const labelId = label ? `${base}-label` : undefined;
  return (
    <div
      className={cx("term-radios", className)}
      role="radiogroup"
      aria-labelledby={labelId}
      aria-label={labelId ? undefined : ariaLabel}
      aria-disabled={disabled ? true : undefined}
      data-orientation={orientation}
    >
      {label ? (
        <span className="term-radios-label" id={labelId}>
          {label}
        </span>
      ) : null}
      {options.map((o) => {
        const id = `${base}-${o.value}`;
        const hintId = o.hint ? `${id}-hint` : undefined;
        const off = disabled || o.disabled;
        return (
          <label key={o.value} className="term-radio" htmlFor={id} data-disabled={off ? "" : undefined}>
            <input
              type="radio"
              id={id}
              name={name}
              value={o.value}
              checked={current === o.value}
              disabled={off}
              aria-describedby={hintId}
              onChange={() => {
                setInner(o.value);
                onChange?.(o.value);
              }}
            />
            <span className="term-radio-text">
              {o.label}
              {o.hint ? (
                <small className="term-radio-hint" id={hintId}>
                  {o.hint}
                </small>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}
