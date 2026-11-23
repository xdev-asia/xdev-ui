import { useId, useState, type InputHTMLAttributes, type JSX, type ReactNode, type Ref } from "react";
import { cx } from "../../internal/cx";
import { IconButton } from "../IconButton/IconButton";

export interface FieldLabels {
  /** Name of the password toggle while the value is hidden. */
  show: string;
  /** Name of the password toggle while the value is shown. */
  hide: string;
}

const DEFAULT_LABELS: FieldLabels = { show: "Show password", hide: "Hide password" };

export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  hint?: ReactNode;
  /** When set, replaces the hint and marks the field invalid. */
  error?: ReactNode;
  /** Keeps the label for screen readers only (visually hidden), for inputs that would otherwise carry just an aria-label. */
  hideLabel?: boolean;
  /** Monospace value, for ids, codes, IPA, paths and keys (like `Textarea mono`). */
  mono?: boolean;
  /** Small control on the label row, end-aligned, such as a "Generate" link button. */
  action?: ReactNode;
  /** Content inside the control at its end, such as a unit or a small `IconButton`. The input text stops before it. */
  end?: ReactNode;
  /** With `type="password"`: a show/hide toggle inside the control end (after `end`). Default true; false opts out. */
  reveal?: boolean;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<FieldLabels>;
  ref?: Ref<HTMLInputElement>;
}

export function Field({ label, hint, error, hideLabel, mono, action, end, reveal = true, labels, id, className, type, ...rest }: FieldProps): JSX.Element {
  const auto = useId();
  const inputId = id ?? `x-field-${auto}`;
  const note = error ?? hint;
  const hintId = note ? `${inputId}-hint` : undefined;
  const labelEl = (
    <label htmlFor={inputId} className={cx("x-label", hideLabel && "x-sr-only")}>
      {label}
    </label>
  );
  const inputProps: InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> } = {
    id: inputId,
    className: mono ? "ws-mono" : undefined,
    "aria-describedby": hintId,
    "aria-invalid": error ? true : undefined,
    type,
    ...rest,
  };
  let control: JSX.Element;
  if (type === "password" && reveal) {
    control = <PasswordControl input={inputProps} end={end} labels={{ ...DEFAULT_LABELS, ...labels }} />;
  } else if (end != null) {
    control = (
      <div className="x-field-control">
        <input {...inputProps} />
        <span className="x-field-end">{end}</span>
      </div>
    );
  } else {
    control = <input {...inputProps} />;
  }
  return (
    <div className={cx("ws-field", className)} data-invalid={error ? "" : undefined}>
      {action != null ? (
        <div className="x-field-label-row">
          {labelEl}
          <span className="x-field-action">{action}</span>
        </div>
      ) : (
        labelEl
      )}
      {control}
      {note ? <small id={hintId}>{note}</small> : null}
    </div>
  );
}

interface PasswordControlProps {
  input: InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> };
  end: ReactNode;
  labels: FieldLabels;
}

/** The password input with its show/hide toggle; a component of its own so a plain Field stays free of state. */
function PasswordControl({ input, end, labels }: PasswordControlProps): JSX.Element {
  const [shown, setShown] = useState(false);
  return (
    <div className="x-field-control">
      <input {...input} type={shown ? "text" : "password"} />
      <span className="x-field-end">
        {end}
        <IconButton
          icon={shown ? "eye-off" : "eye"}
          label={shown ? labels.hide : labels.show}
          size="sm"
          aria-pressed={shown}
          aria-controls={input.id}
          disabled={input.disabled}
          onClick={() => setShown((v) => !v)}
        />
      </span>
    </div>
  );
}
