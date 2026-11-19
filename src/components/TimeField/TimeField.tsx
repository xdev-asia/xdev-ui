import { useId, useState, type JSX, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../../internal/cx";
import { parseTime, stepTime, type TimeTextOptions } from "./time-text";

export interface TimeFieldLabels {
  /** Shown under the field when the typed text is not a valid time or duration. */
  invalid: string;
}

export const TIME_FIELD_LABELS: TimeFieldLabels = { invalid: "Enter a valid time" };

export interface TimeFieldProps {
  label: ReactNode;
  /** `HH:mm`, `HH:mm:ss` (mode "time", `seconds`) or `mm:ss` (mode "duration"); null for empty. */
  value: string | null;
  /** Called with the normalised value, or null when the box is emptied. Never called with invalid text. */
  onChange: (value: string | null) => void;
  /** "time" (default): 00:00 to 23:59(:59). "duration": minutes 0 to `maxMinutes`, seconds 0 to 59. */
  mode?: "time" | "duration";
  /** Time mode only: `HH:mm:ss`. */
  seconds?: boolean;
  /** Duration mode only: the largest minutes value. Default 59. */
  maxMinutes?: number;
  hint?: ReactNode;
  /** Replaces the hint (and the invalid message) and marks the field invalid. */
  error?: ReactNode;
  /** Keeps the label for screen readers only. */
  hideLabel?: boolean;
  disabled?: boolean;
  required?: boolean;
  /** Name of a hidden input that carries the committed value in a form. */
  name?: string;
  id?: string;
  className?: string;
  labels?: Partial<TimeFieldLabels>;
}

export function TimeField({
  label,
  value,
  onChange,
  mode = "time",
  seconds = false,
  maxMinutes = 59,
  hint,
  error,
  hideLabel,
  disabled,
  required,
  name,
  id,
  className,
  labels,
}: TimeFieldProps): JSX.Element {
  const l = { ...TIME_FIELD_LABELS, ...labels };
  const opts: TimeTextOptions = { mode, seconds: mode === "time" && seconds, maxMinutes };
  const auto = useId();
  const inputId = id ?? `x-time-${auto}`;
  const [draft, setDraft] = useState<string | null>(null);
  const [bad, setBad] = useState(false);
  // A new value from outside replaces whatever text is pending (state adjusted during render, no effect).
  const [seen, setSeen] = useState<string | null>(value);
  const fresh = seen === value;
  if (!fresh) {
    setSeen(value);
    setDraft(null);
    setBad(false);
  }
  const pending = fresh ? draft : null;
  const flagged = fresh && bad;
  const committed = value === null ? "" : (parseTime(value, opts) ?? "");

  const settle = (next: string | null): void => {
    setDraft(null);
    setBad(false);
    if (next !== value) onChange(next);
  };
  const commit = (): void => {
    if (pending === null) return;
    if (pending.trim() === "") return settle(null);
    const next = parseTime(pending, opts);
    if (next !== null) settle(next);
    else setBad(true);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") commit();
    else if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const base = (pending !== null ? parseTime(pending, opts) : null) ?? (committed || null);
      settle(stepTime(base, e.key === "ArrowUp" ? 1 : -1, opts));
    }
  };

  const note = error ?? (flagged ? l.invalid : hint);
  const noteId = note ? `${inputId}-note` : undefined;
  const invalid = !!error || flagged;
  const placeholder = mode === "duration" ? "mm:ss" : opts.seconds ? "hh:mm:ss" : "hh:mm";

  return (
    <div className={cx("ws-field x-time-field", className)} data-invalid={invalid ? "" : undefined} data-disabled={disabled ? "" : undefined}>
      <label htmlFor={inputId} className={hideLabel ? "x-sr-only" : undefined}>{label}</label>
      <input
        id={inputId}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        value={pending ?? committed}
        disabled={disabled}
        required={required}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={noteId}
        onChange={(e) => {
          setDraft(e.target.value);
          setBad(false);
        }}
        onBlur={commit}
        onKeyDown={onKeyDown}
      />
      {name ? <input type="hidden" name={name} value={committed} /> : null}
      {note ? <small id={noteId}>{note}</small> : null}
    </div>
  );
}
