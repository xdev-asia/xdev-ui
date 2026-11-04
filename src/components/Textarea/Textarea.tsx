import { useId, type JSX, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cx } from "../../internal/cx";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: ReactNode;
  hint?: ReactNode;
  /** When set, replaces the hint and marks the field invalid. */
  error?: ReactNode;
  /** Monospace text, for prompts, commands, JSON or paths. */
  mono?: boolean;
  /** Default "vertical". */
  resize?: "vertical" | "none" | "both";
}

export function Textarea({ label, hint, error, mono, resize = "vertical", id, className, rows = 4, ...rest }: TextareaProps): JSX.Element {
  const auto = useId();
  const inputId = id ?? `x-textarea-${auto}`;
  const note = error ?? hint;
  const hintId = note ? `${inputId}-hint` : undefined;
  return (
    <label className={cx("ws-field", className)} htmlFor={inputId} data-invalid={error ? "" : undefined}>
      {label}
      <textarea
        id={inputId}
        rows={rows}
        className={cx("kit-textarea", mono && "ws-mono")}
        data-resize={resize}
        aria-describedby={hintId}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
      {note ? <small id={hintId}>{note}</small> : null}
    </label>
  );
}
